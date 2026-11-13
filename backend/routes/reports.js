const express = require("express");
const db = require("../db");
const { authenticate, requireRole } = require("../middleware/auth");
const { slotsFor, dateStr } = require("../utils/slots");

const router = express.Router();
router.use(authenticate, requireRole("admin"));

function addDays(d, n) {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

function count(sql, ...params) {
  return db.prepare(sql).get(...params).c;
}

router.get("/", function (req, res) {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const today = dateStr(now);

  const cards = {
    today_bookings: count("SELECT COUNT(*) AS c FROM bookings WHERE booking_date = ? AND status != 'cancelled'", today),
    upcoming: count("SELECT COUNT(*) AS c FROM bookings WHERE booking_date >= ? AND status = 'confirmed'", today),
    total_bookings: count("SELECT COUNT(*) AS c FROM bookings"),
    cancelled: count("SELECT COUNT(*) AS c FROM bookings WHERE status = 'cancelled'"),
    patients: count("SELECT COUNT(*) AS c FROM users WHERE role = 'patient'"),
    active_doctors: count("SELECT COUNT(*) AS c FROM doctors WHERE active = 1")
  };

  const daily = [];
  for (let off = -6; off <= 7; off++) {
    const ds = dateStr(addDays(now, off));
    const row = db.prepare("SELECT SUM(CASE WHEN status != 'cancelled' THEN 1 ELSE 0 END) AS booked, SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) AS cancelled FROM bookings WHERE booking_date = ?").get(ds);
    daily.push({ date: ds, booked: row.booked || 0, cancelled: row.cancelled || 0 });
  }

  const by_doctor = db.prepare("SELECT d.name, d.specialty, SUM(CASE WHEN b.status != 'cancelled' THEN 1 ELSE 0 END) AS booked, SUM(CASE WHEN b.status = 'completed' THEN 1 ELSE 0 END) AS completed FROM doctors d LEFT JOIN bookings b ON b.doctor_id = d.id GROUP BY d.id ORDER BY booked DESC")
    .all()
    .map(function (r) { return { name: r.name, specialty: r.specialty, booked: r.booked || 0, completed: r.completed || 0 }; });

  const by_status = db.prepare("SELECT status, COUNT(*) AS count FROM bookings GROUP BY status").all();

  const docs = db.prepare("SELECT * FROM doctors WHERE active = 1").all();
  let totalSlots = 0;
  let bookedSlots = 0;
  for (let off = 0; off < 7; off++) {
    const day = addDays(now, off);
    const ds = dateStr(day);
    docs.forEach(function (d) {
      if (d.work_days.split(",").indexOf(String(day.getDay())) === -1) return;
      totalSlots += slotsFor(d).length;
      bookedSlots += count("SELECT COUNT(*) AS c FROM bookings WHERE doctor_id = ? AND booking_date = ? AND status != 'cancelled'", d.id, ds);
    });
  }
  const occupancy = { slots: totalSlots, booked: bookedSlots, percent: totalSlots ? Math.round(bookedSlots * 100 / totalSlots) : 0 };

  const todayList = db.prepare("SELECT b.slot_time, b.status, b.ref_code, u.name AS patient_name, d.name AS doctor_name FROM bookings b JOIN users u ON u.id = b.patient_id JOIN doctors d ON d.id = b.doctor_id WHERE b.booking_date = ? AND b.status != 'cancelled' ORDER BY b.slot_time").all(today);

  res.json({ cards: cards, daily: daily, by_doctor: by_doctor, by_status: by_status, occupancy: occupancy, today: todayList });
});

module.exports = router;
