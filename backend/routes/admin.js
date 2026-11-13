const express = require("express");
const db = require("../db");
const { authenticate, requireRole } = require("../middleware/auth");
const { toMin } = require("../utils/slots");

const router = express.Router();
router.use(authenticate, requireRole("admin"));

const STATUSES = ["confirmed", "completed", "cancelled", "no_show"];

router.get("/bookings", function (req, res) {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10));
  const where = [];
  const params = [];
  if (req.query.date) { where.push("b.booking_date = ?"); params.push(String(req.query.date)); }
  if (req.query.doctor_id) { where.push("b.doctor_id = ?"); params.push(Number(req.query.doctor_id)); }
  if (STATUSES.indexOf(req.query.status) !== -1) { where.push("b.status = ?"); params.push(req.query.status); }
  if (req.query.search) {
    const s = "%" + String(req.query.search).trim() + "%";
    where.push("(u.name LIKE ? OR b.ref_code LIKE ?)");
    params.push(s, s);
  }
  const w = where.length ? "WHERE " + where.join(" AND ") : "";
  const from = "FROM bookings b JOIN users u ON u.id = b.patient_id JOIN doctors d ON d.id = b.doctor_id " + w;
  const total = db.prepare("SELECT COUNT(*) AS c " + from).get(...params).c;
  const rows = db.prepare("SELECT b.*, u.name AS patient_name, u.phone AS patient_phone, d.name AS doctor_name, d.specialty " + from + " ORDER BY b.booking_date DESC, b.slot_time DESC LIMIT ? OFFSET ?")
    .all(...params, limit, (page - 1) * limit);
  res.json({ bookings: rows, page: page, limit: limit, total: total, total_pages: Math.max(1, Math.ceil(total / limit)) });
});

router.put("/bookings/:id/status", function (req, res) {
  const status = String(req.body.status || "");
  if (STATUSES.indexOf(status) === -1) return res.status(400).json({ error: "Invalid status" });
  const b = db.prepare("SELECT * FROM bookings WHERE id = ?").get(req.params.id);
  if (!b) return res.status(404).json({ error: "Booking not found" });
  try {
    db.prepare("UPDATE bookings SET status = ?, updated_at = datetime('now') WHERE id = ?").run(status, b.id);
  } catch (e) {
    if (String(e.code).indexOf("SQLITE_CONSTRAINT") === 0) {
      return res.status(409).json({ error: "This slot is already booked by another patient, so this booking cannot be re-confirmed" });
    }
    throw e;
  }
  res.json({ booking: db.prepare("SELECT * FROM bookings WHERE id = ?").get(b.id) });
});

function readDoctor(body) {
  const name = String(body.name || "").trim();
  const specialty = String(body.specialty || "").trim();
  const bio = String(body.bio || "").trim();
  const fee = Number(body.fee);
  const slot = Number(body.slot_minutes);
  const start = String(body.start_time || "");
  const end = String(body.end_time || "");
  const bs = String(body.break_start || "");
  const be = String(body.break_end || "");
  const days = Array.isArray(body.work_days) ? body.work_days : String(body.work_days || "").split(",");
  const clean = days.map(function (x) { return String(x).trim(); })
    .filter(function (x, i, a) { return /^[0-6]$/.test(x) && a.indexOf(x) === i; }).sort();
  const timeOk = function (t) { return /^([01]\d|2[0-3]):[0-5]\d$/.test(t); };
  if (!name || !specialty) return { error: "Name and specialty are required" };
  if (!(fee >= 0)) return { error: "Fee must be a number" };
  if (clean.length === 0) return { error: "Choose at least one working day" };
  if (!timeOk(start) || !timeOk(end) || toMin(start) >= toMin(end)) return { error: "Working hours are not valid" };
  if (!(slot >= 10 && slot <= 120)) return { error: "Slot length must be between 10 and 120 minutes" };
  if ((bs || be) && (!timeOk(bs) || !timeOk(be) || toMin(bs) >= toMin(be))) return { error: "Break time is not valid" };
  return { data: { name: name, specialty: specialty, bio: bio, fee: Math.round(fee), work_days: clean.join(","), start_time: start, end_time: end, slot_minutes: slot, break_start: bs || null, break_end: be || null } };
}

router.get("/doctors", function (req, res) {
  const rows = db.prepare("SELECT d.*, (SELECT COUNT(*) FROM bookings b WHERE b.doctor_id = d.id AND b.status != 'cancelled') AS booking_count FROM doctors d ORDER BY d.name").all();
  res.json({ doctors: rows });
});

router.post("/doctors", function (req, res) {
  const r = readDoctor(req.body);
  if (r.error) return res.status(400).json({ error: r.error });
  const d = r.data;
  const info = db.prepare("INSERT INTO doctors (name, specialty, bio, fee, work_days, start_time, end_time, slot_minutes, break_start, break_end) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
    .run(d.name, d.specialty, d.bio, d.fee, d.work_days, d.start_time, d.end_time, d.slot_minutes, d.break_start, d.break_end);
  res.status(201).json({ doctor: db.prepare("SELECT * FROM doctors WHERE id = ?").get(info.lastInsertRowid) });
});

router.put("/doctors/:id", function (req, res) {
  const existing = db.prepare("SELECT * FROM doctors WHERE id = ?").get(req.params.id);
  if (!existing) return res.status(404).json({ error: "Doctor not found" });
  const r = readDoctor(req.body);
  if (r.error) return res.status(400).json({ error: r.error });
  const d = r.data;
  const active = req.body.active === undefined ? existing.active : (req.body.active ? 1 : 0);
  db.prepare("UPDATE doctors SET name = ?, specialty = ?, bio = ?, fee = ?, work_days = ?, start_time = ?, end_time = ?, slot_minutes = ?, break_start = ?, break_end = ?, active = ? WHERE id = ?")
    .run(d.name, d.specialty, d.bio, d.fee, d.work_days, d.start_time, d.end_time, d.slot_minutes, d.break_start, d.break_end, active, existing.id);
  res.json({ doctor: db.prepare("SELECT * FROM doctors WHERE id = ?").get(existing.id) });
});

router.delete("/doctors/:id", function (req, res) {
  const existing = db.prepare("SELECT * FROM doctors WHERE id = ?").get(req.params.id);
  if (!existing) return res.status(404).json({ error: "Doctor not found" });
  const count = db.prepare("SELECT COUNT(*) AS c FROM bookings WHERE doctor_id = ?").get(existing.id).c;
  if (count > 0) {
    db.prepare("UPDATE doctors SET active = 0 WHERE id = ?").run(existing.id);
    return res.json({ deactivated: true, message: "Doctor has bookings, so was deactivated instead of deleted" });
  }
  db.prepare("DELETE FROM doctors WHERE id = ?").run(existing.id);
  res.json({ deleted: true });
});

module.exports = router;
