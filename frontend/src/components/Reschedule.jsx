import { useEffect, useState } from "react";
import { api } from "../api.js";

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function pad(n) {
  return String(n).padStart(2, "0");
}

function keyOf(d) {
  return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
}

function time12(t) {
  const h = Number(t.slice(0, 2));
  return (h % 12 || 12) + ":" + t.slice(3) + " " + (h >= 12 ? "PM" : "AM");
}

function nextDays(n) {
  const out = [];
  const base = new Date();
  base.setHours(0, 0, 0, 0);
  for (let i = 0; i < n; i++) {
    const d = new Date(base);
    d.setDate(base.getDate() + i);
    out.push(d);
  }
  return out;
}

export default function Reschedule({ booking, onClose, onDone }) {
  const [workDays, setWorkDays] = useState([]);
  const [date, setDate] = useState("");
  const [slots, setSlots] = useState([]);
  const [time, setTime] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const days = nextDays(14);

  useEffect(function () {
    api("/doctors/" + booking.doctor_id)
      .then(function (data) { setWorkDays(data.doctor.work_days_list); })
      .catch(function (e) { setError(e.message); });
  }, [booking.doctor_id]);

  useEffect(function () {
    setTime("");
    if (!date) return;
    api("/doctors/" + booking.doctor_id + "/slots?date=" + date)
      .then(function (data) { setSlots(data.slots); })
      .catch(function (e) { setError(e.message); });
  }, [date]);

  async function save() {
    setError("");
    setBusy(true);
    try {
      await api("/bookings/" + booking.id + "/reschedule", { method: "PUT", body: { date: date, booking_date: date, slot_time: time } });
      onDone();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="resched">
      <h4>Choose a new date and time</h4>
      <div className="dates">
        {days.map(function (d) {
          const works = workDays.indexOf(d.getDay()) !== -1;
          const key = keyOf(d);
          return (
            <button key={key} disabled={!works} className={"dchip" + (key === date ? " sel" : "")} onClick={function () { setDate(key); }}>
              <span>{DAY_NAMES[d.getDay()]}</span>
              <strong>{d.getDate()}</strong>
              <small>{MONTHS[d.getMonth()]}</small>
            </button>
          );
        })}
      </div>
      {date && (
        <div className="slots" style={{ marginTop: 14 }}>
          {slots.map(function (s) {
            return (
              <button key={s.time} disabled={!s.available} className={"slot" + (s.time === time ? " sel" : "")} onClick={function () { setTime(s.time); }}>
                {time12(s.time)}
              </button>
            );
          })}
        </div>
      )}
      {error && <div className="error" style={{ marginTop: 12 }}>{error}</div>}
      <div className="hero-actions" style={{ marginTop: 16 }}>
        <button className="btn btn-primary" disabled={!time || busy} onClick={save}>{busy ? "Saving..." : "Save new time"}</button>
        <button className="btn btn-ghost" onClick={onClose}>Close</button>
      </div>
    </div>
  );
}
