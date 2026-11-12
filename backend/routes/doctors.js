const express = require("express");
const db = require("../db");
const { slotsFor, dateStr, toMin } = require("../utils/slots");

const router = express.Router();

function withDays(d) {
  return Object.assign({}, d, { work_days_list: d.work_days.split(",").map(Number) });
}

router.get("/", function (req, res) {
  const rows = db.prepare("SELECT * FROM doctors WHERE active = 1 ORDER BY name").all();
  res.json({ doctors: rows.map(withDays) });
});

router.get("/:id", function (req, res) {
  const d = db.prepare("SELECT * FROM doctors WHERE id = ? AND active = 1").get(req.params.id);
  if (!d) return res.status(404).json({ error: "Doctor not found" });
  res.json({ doctor: withDays(d) });
});

router.get("/:id/slots", function (req, res) {
  const d = db.prepare("SELECT * FROM doctors WHERE id = ? AND active = 1").get(req.params.id);
  if (!d) return res.status(404).json({ error: "Doctor not found" });
  const date = String(req.query.date || "");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return res.status(400).json({ error: "Date must be like 2026-11-20" });
  const day = new Date(date + "T00:00:00");
  if (isNaN(day.getTime()) || dateStr(day) !== date) return res.status(400).json({ error: "Invalid date" });
  const works = d.work_days.split(",").indexOf(String(day.getDay())) !== -1;
  if (!works) return res.json({ date: date, working_day: false, slots: [] });

  const booked = db.prepare("SELECT slot_time FROM bookings WHERE doctor_id = ? AND booking_date = ? AND status != 'cancelled'")
    .all(d.id, date).map(function (b) { return b.slot_time; });
  const now = new Date();
  const today = dateStr(now);
  const nowMin = now.getHours() * 60 + now.getMinutes();
  const slots = slotsFor(d).map(function (t) {
    let available = booked.indexOf(t) === -1;
    if (date < today) available = false;
    if (date === today && toMin(t) <= nowMin) available = false;
    return { time: t, available: available };
  });
  res.json({ date: date, working_day: true, slots: slots });
});

module.exports = router;
