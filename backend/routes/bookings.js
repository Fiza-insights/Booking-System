const express = require("express");
const crypto = require("crypto");
const db = require("../db");
const { authenticate } = require("../middleware/auth");
const { slotsFor, dateStr } = require("../utils/slots");

const router = express.Router();
router.use(authenticate);

const MAX_DAYS_AHEAD = 30;
const MIN_HOURS_BEFORE_CHANGE = 2;
const TAKEN_MESSAGE = "Sorry, this slot was just booked by someone else. Please choose another time.";

function slotStart(date, time) {
  return new Date(date + "T" + time + ":00");
}

function checkSlot(doctor, date, time) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return "Please choose a valid date";
  const day = new Date(date + "T00:00:00");
  if (isNaN(day.getTime()) || dateStr(day) !== date) return "Please choose a valid date";
  if (doctor.work_days.split(",").indexOf(String(day.getDay())) === -1) return "The doctor does not work on this day";
  if (slotsFor(doctor).indexOf(time) === -1) return "This is not a valid time slot for this doctor";
  const start = slotStart(date, time);
  if (start <= new Date()) return "This time has already passed";
  const limit = new Date();
  limit.setDate(limit.getDate() + MAX_DAYS_AHEAD);
  if (start > limit) return "You can book up to " + MAX_DAYS_AHEAD + " days ahead";
  return null;
}

function isTaken(doctorId, date, time, exceptId) {
  const row = db.prepare("SELECT id FROM bookings WHERE doctor_id = ? AND booking_date = ? AND slot_time = ? AND status != 'cancelled' AND id != ?")
    .get(doctorId, date, time, exceptId || 0);
  return !!row;
}

function newRef() {
  return "DB-" + crypto.randomBytes(3).toString("hex").toUpperCase();
}

function fullBooking(id) {
  return db.prepare("SELECT b.*, d.name AS doctor_name, d.specialty, d.fee, u.name AS patient_name FROM bookings b JOIN doctors d ON d.id = b.doctor_id JOIN users u ON u.id = b.patient_id WHERE b.id = ?").get(id);
}

function isSlotError(e) {
  return e.message === "TAKEN" || String(e.code).indexOf("SQLITE_CONSTRAINT") === 0;
}

router.post("/", function (req, res) {
  const doctorId = Number(req.body.doctor_id);
  const date = String(req.body.date || "");
  const time = String(req.body.slot_time || "");
  const reason = String(req.body.reason || "").trim();
  const doctor = db.prepare("SELECT * FROM doctors WHERE id = ? AND active = 1").get(doctorId);
  if (!doctor) return res.status(404).json({ error: "Doctor not found" });
  const problem = checkSlot(doctor, date, time);
  if (problem) return res.status(400).json({ error: problem });
  try {
    const book = db.transaction(function () {
      if (isTaken(doctor.id, date, time)) throw new Error("TAKEN");
      return db.prepare("INSERT INTO bookings (ref_code, patient_id, doctor_id, booking_date, slot_time, reason) VALUES (?, ?, ?, ?, ?, ?)")
        .run(newRef(), req.user.id, doctor.id, date, time, reason).lastInsertRowid;
    });
    res.status(201).json({ booking: fullBooking(book()) });
  } catch (e) {
    if (isSlotError(e)) return res.status(409).json({ error: TAKEN_MESSAGE });
    throw e;
  }
});

router.get("/mine", function (req, res) {
  const rows = db.prepare("SELECT b.*, d.name AS doctor_name, d.specialty, d.fee FROM bookings b JOIN doctors d ON d.id = b.doctor_id WHERE b.patient_id = ? ORDER BY b.booking_date DESC, b.slot_time DESC")
    .all(req.user.id);
  res.json({ bookings: rows });
});

function loadChangeable(req, res) {
  const b = db.prepare("SELECT * FROM bookings WHERE id = ?").get(req.params.id);
  if (!b || (b.patient_id !== req.user.id && req.user.role !== "admin")) {
    res.status(404).json({ error: "Booking not found" });
    return null;
  }
  if (b.status !== "confirmed") {
    res.status(400).json({ error: "Only confirmed bookings can be changed" });
    return null;
  }
  if (req.user.role !== "admin") {
    const hours = (slotStart(b.booking_date, b.slot_time) - new Date()) / 3600000;
    if (hours < MIN_HOURS_BEFORE_CHANGE) {
      res.status(400).json({ error: "Bookings can only be changed at least " + MIN_HOURS_BEFORE_CHANGE + " hours before the appointment" });
      return null;
    }
  }
  return b;
}

router.put("/:id/cancel", function (req, res) {
  const b = loadChangeable(req, res);
  if (!b) return;
  db.prepare("UPDATE bookings SET status = 'cancelled', updated_at = datetime('now') WHERE id = ?").run(b.id);
  res.json({ booking: fullBooking(b.id) });
});

router.put("/:id/reschedule", function (req, res) {
  const b = loadChangeable(req, res);
  if (!b) return;
  const date = String(req.body.date || "");
  const time = String(req.body.slot_time || "");
  const doctor = db.prepare("SELECT * FROM doctors WHERE id = ? AND active = 1").get(b.doctor_id);
  if (!doctor) return res.status(404).json({ error: "Doctor not found" });
  const problem = checkSlot(doctor, date, time);
  if (problem) return res.status(400).json({ error: problem });
  try {
    db.transaction(function () {
      if (isTaken(doctor.id, date, time, b.id)) throw new Error("TAKEN");
      db.prepare("UPDATE bookings SET booking_date = ?, slot_time = ?, updated_at = datetime('now') WHERE id = ?").run(date, time, b.id);
    })();
    res.json({ booking: fullBooking(b.id) });
  } catch (e) {
    if (isSlotError(e)) return res.status(409).json({ error: TAKEN_MESSAGE });
    throw e;
  }
});

module.exports = router;
