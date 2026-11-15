import { useState } from "react";
import { api } from "../api.js";

const DAYS = [
  { n: 1, label: "Mon" },
  { n: 2, label: "Tue" },
  { n: 3, label: "Wed" },
  { n: 4, label: "Thu" },
  { n: 5, label: "Fri" },
  { n: 6, label: "Sat" },
  { n: 0, label: "Sun" },
];

export default function DoctorForm({ doctor, onSaved, onCancel }) {
  const [f, setF] = useState({
    name: doctor ? doctor.name : "",
    specialty: doctor ? doctor.specialty : "",
    bio: doctor ? doctor.bio || "" : "",
    fee: doctor ? doctor.fee : 3000,
    start_time: doctor ? doctor.start_time : "09:00",
    end_time: doctor ? doctor.end_time : "17:00",
    slot_minutes: doctor ? doctor.slot_minutes : 20,
    break_start: doctor ? doctor.break_start || "" : "13:00",
    break_end: doctor ? doctor.break_end || "" : "14:00",
  });
  const [days, setDays] = useState(doctor ? doctor.work_days.split(",").map(Number) : [1, 2, 3, 4, 5]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  function set(key) {
    return function (e) {
      setF({ ...f, [key]: e.target.value });
    };
  }

  function toggleDay(n) {
    setDays(days.indexOf(n) === -1 ? days.concat(n) : days.filter(function (x) { return x !== n; }));
  }

  async function save(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    const body = { ...f, work_days: days.join(",") };
    try {
      if (doctor) await api("/admin/doctors/" + doctor.id, { method: "PUT", body: body });
      else await api("/admin/doctors", { method: "POST", body: body });
      onSaved(doctor ? "Doctor updated." : "Doctor added.");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="glass doc-form" onSubmit={save}>
      <h3 className="page-title" style={{ fontSize: "1.5rem", marginBottom: 14 }}>{doctor ? "Edit doctor" : "Add a new doctor"}</h3>
      <div className="form-grid">
        <label>Name<input value={f.name} onChange={set("name")} placeholder="Dr. Full Name" /></label>
        <label>Specialty<input value={f.specialty} onChange={set("specialty")} placeholder="e.g. Acne & Skin Care" /></label>
        <label>Fee (Rs)<input type="number" min="0" value={f.fee} onChange={set("fee")} /></label>
        <label>Slot length (minutes)<input type="number" min="10" max="120" value={f.slot_minutes} onChange={set("slot_minutes")} /></label>
        <label>Starts at<input type="time" value={f.start_time} onChange={set("start_time")} /></label>
        <label>Ends at<input type="time" value={f.end_time} onChange={set("end_time")} /></label>
        <label>Break starts<input type="time" value={f.break_start} onChange={set("break_start")} /></label>
        <label>Break ends<input type="time" value={f.break_end} onChange={set("break_end")} /></label>
      </div>
      <label className="full">Short bio<textarea rows="2" value={f.bio} onChange={set("bio")} /></label>
      <div className="day-pick">
        <span>Working days</span>
        {DAYS.map(function (d) {
          return (
            <button type="button" key={d.n} className={"dchip small" + (days.indexOf(d.n) !== -1 ? " sel" : "")} onClick={function () { toggleDay(d.n); }}>{d.label}</button>
          );
        })}
      </div>
      {error && <div className="error">{error}</div>}
      <div className="hero-actions" style={{ marginTop: 16 }}>
        <button className="btn btn-primary" disabled={busy}>{busy ? "Saving..." : doctor ? "Save changes" : "Add doctor"}</button>
        <button type="button" className="btn btn-ghost" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
}
