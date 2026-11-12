const bcrypt = require("bcryptjs");
const db = require("./db");
const { dateStr, slotsFor } = require("./utils/slots");

if (db.prepare("SELECT COUNT(*) AS c FROM users").get().c > 0) {
  console.log("Already seeded. Delete dermabloom.db to start fresh.");
  process.exit(0);
}

const people = [
  ["Fiza Saleem", "admin@dermabloom.test", "0300-1111111", "Admin@123", "admin"],
  ["Sara Malik", "patient@dermabloom.test", "0300-2222222", "Patient@123", "patient"],
  ["Ayesha Khan", "ayesha@dermabloom.test", "0301-3333333", "Patient@123", "patient"],
  ["Bilal Ahmed", "bilal@dermabloom.test", "0302-4444444", "Patient@123", "patient"],
  ["Hamza Ali", "hamza@dermabloom.test", "0303-5555555", "Patient@123", "patient"],
  ["Noor Fatima", "noor@dermabloom.test", "0304-6666666", "Patient@123", "patient"]
];

const doctors = [
  ["Dr. Maryam Siddiqui", "Acne & Skin Care", "Treats acne, scars and everyday skin problems.", 2500, "1,2,3,4,5", "09:00", "17:00", 30, "13:00", "14:00"],
  ["Dr. Usman Raza", "Cosmetic Dermatology", "Skin glow, peels and cosmetic skin treatments.", 4000, "1,3,5,6", "10:00", "18:00", 30, "14:00", "15:00"],
  ["Dr. Hina Qureshi", "Pediatric Dermatology", "Skin care for babies and children.", 3000, "1,2,3,4,5", "09:00", "15:00", 20, null, null],
  ["Dr. Kamran Yousuf", "Hair & Scalp", "Hair fall, dandruff and scalp conditions.", 3000, "2,3,4,5,6", "11:00", "19:00", 30, "15:00", "16:00"],
  ["Dr. Zainab Tariq", "Laser & Skin Rejuvenation", "Laser hair removal and skin rejuvenation.", 5000, "1,2,4,6", "10:00", "16:00", 30, "13:00", "13:30"],
  ["Dr. Faisal Hameed", "Allergy & Eczema", "Allergies, rashes, eczema and itching.", 2000, "1,2,3,4,5", "09:00", "14:00", 20, null, null]
];

const reasons = [
  "Acne treatment consultation", "Skin allergy or rash", "Hair fall consultation",
  "Mole check", "Eczema follow-up", "Laser hair removal consultation",
  "Pigmentation and dark spots", "Dry skin and itching"
];

let seedNum = 12345;
function rnd() {
  seedNum = (seedNum * 1664525 + 1013904223) % 4294967296;
  return seedNum / 4294967296;
}

const insertUser = db.prepare("INSERT INTO users (name, email, phone, password_hash, role) VALUES (?, ?, ?, ?, ?)");
const insertDoctor = db.prepare("INSERT INTO doctors (name, specialty, bio, fee, work_days, start_time, end_time, slot_minutes, break_start, break_end) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
const insertBooking = db.prepare("INSERT INTO bookings (ref_code, patient_id, doctor_id, booking_date, slot_time, status, reason) VALUES (?, ?, ?, ?, ?, ?, ?)");

const run = db.transaction(function () {
  people.forEach(function (p) {
    insertUser.run(p[0], p[1], p[2], bcrypt.hashSync(p[3], 10), p[4]);
  });
  doctors.forEach(function (d) {
    insertDoctor.run(d[0], d[1], d[2], d[3], d[4], d[5], d[6], d[7], d[8], d[9]);
  });

  const docs = db.prepare("SELECT * FROM doctors").all();
  const patients = db.prepare("SELECT id FROM users WHERE role = 'patient'").all();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let n = 0;

  for (let off = -10; off <= 7; off++) {
    const day = new Date(today);
    day.setDate(today.getDate() + off);
    const ds = dateStr(day);
    docs.forEach(function (doc) {
      if (doc.work_days.split(",").indexOf(String(day.getDay())) === -1) return;
      const free = slotsFor(doc);
      const count = Math.floor(rnd() * 3);
      for (let i = 0; i < count && free.length > 0; i++) {
        const slot = free.splice(Math.floor(rnd() * free.length), 1)[0];
        const patient = patients[Math.floor(rnd() * patients.length)];
        const r = rnd();
        let status;
        if (off < 0) status = r < 0.7 ? "completed" : r < 0.85 ? "cancelled" : "no_show";
        else status = r < 0.9 ? "confirmed" : "cancelled";
        n++;
        insertBooking.run("DB-" + (1000 + n), patient.id, doc.id, ds, slot, status, reasons[Math.floor(rnd() * reasons.length)]);
      }
    });
  }
});

run();
const count = function (t) { return db.prepare("SELECT COUNT(*) AS c FROM " + t).get().c; };
console.log("Seed done. Users: " + count("users") + ", Doctors: " + count("doctors") + ", Bookings: " + count("bookings"));
