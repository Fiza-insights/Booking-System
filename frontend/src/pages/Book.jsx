import { useEffect, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { CheckCircle2, Clock } from "lucide-react";
import { api } from "../api.js";
import { useAuth } from "../auth.jsx";

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

function prettyDate(key) {
  const d = new Date(key + "T00:00:00");
  return DAY_NAMES[d.getDay()] + ", " + d.getDate() + " " + MONTHS[d.getMonth()] + " " + d.getFullYear();
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

export default function Book() {
  const { id } = useParams();
  const { user } = useAuth();
  const [doctor, setDoctor] = useState(null);
  const [date, setDate] = useState("");
  const [slots, setSlots] = useState([]);
  const [time, setTime] = useState("");
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(null);
  const days = nextDays(14);

  useEffect(function () {
    api("/doctors/" + id)
      .then(function (data) {
        setDoctor(data.doctor);
        const first = days.find(function (d) { return data.doctor.work_days_list.indexOf(d.getDay()) !== -1; });
        if (first) setDate(keyOf(first));
      })
      .catch(function (e) { setError(e.message); });
  }, [id]);

  function loadSlots() {
    if (!date) return;
    api("/doctors/" + id + "/slots?date=" + date)
      .then(function (data) { setSlots(data.slots); })
      .catch(function (e) { setError(e.message); });
  }

  useEffect(function () {
    setTime("");
    loadSlots();
  }, [id, date]);

  async function confirm() {
    setError("");
    setBusy(true);
    try {
      const data = await api("/bookings", { method: "POST", body: { doctor_id: Number(id), date: date, slot_time: time, reason: reason } });
      setDone(data.booking);
    } catch (e) {
      setError(e.message);
      setTime("");
      loadSlots();
    } finally {
      setBusy(false);
    }
  }

  if (!user) return <Navigate to="/login" replace />;

  if (done) {
    return (
      <main className="container">
        <div className="glass done-card">
          <CheckCircle2 size={54} className="ok" />
          <h2 className="page-title" style={{ marginTop: 12 }}>Booking confirmed</h2>
          <p className="muted">Please keep your reference code safe.</p>
          <div className="refcode">{done.ref_code}</div>
          <div className="sum-row"><span>Doctor</span><strong>{done.doctor_name}</strong></div>
          <div className="sum-row"><span>Date</span><strong>{prettyDate(done.booking_date)}</strong></div>
          <div className="sum-row"><span>Time</span><strong>{time12(done.slot_time)}</strong></div>
          <div className="sum-row"><span>Fee</span><strong>Rs {done.fee.toLocaleString()}</strong></div>
          <div className="hero-actions" style={{ justifyContent: "center", marginTop: 26 }}>
            <Link to="/my-bookings" className="btn btn-primary">View my bookings</Link>
            <Link to="/doctors" className="btn btn-ghost">Book another</Link>
          </div>
        </div>
      </main>
    );
  }

  if (!doctor) {
    return <main className="container">{error ? <div className="error" style={{ marginTop: 40 }}>{error}</div> : <div className="empty">Loading...</div>}</main>;
  }

  return (
    <main className="container">
      <div className="page-head">
        <div>
          <div className="sec-label"><span>02</span> Book an appointment</div>
          <h2 className="sec-title" style={{ marginBottom: 0 }}>{doctor.name} <em>{doctor.specialty}</em></h2>
        </div>
      </div>

      <div className="book-grid">
        <div>
          <div className="glass step">
            <h3><span>1</span> Choose a date</h3>
            <div className="dates">
              {days.map(function (d) {
                const works = doctor.work_days_list.indexOf(d.getDay()) !== -1;
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
          </div>

          <div className="glass step">
            <h3><span>2</span> Choose a time</h3>
            {slots.length === 0 && <div className="muted">No slots available on this day.</div>}
            <div className="slots">
              {slots.map(function (s) {
                return (
                  <button key={s.time} disabled={!s.available} className={"slot" + (s.time === time ? " sel" : "")} onClick={function () { setTime(s.time); }}>
                    {time12(s.time)}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="glass step">
            <h3><span>3</span> Reason for visit (optional)</h3>
            <textarea rows="3" value={reason} onChange={function (e) { setReason(e.target.value); }} placeholder="For example: acne treatment, rash, hair fall" />
          </div>
        </div>

        <aside className="glass summary">
          <h3 className="page-title" style={{ fontSize: "1.5rem", marginBottom: 8 }}>Your appointment</h3>
          <div className="sum-row"><span>Doctor</span><strong>{doctor.name}</strong></div>
          <div className="sum-row"><span>Date</span><strong>{date ? prettyDate(date) : "-"}</strong></div>
          <div className="sum-row"><span>Time</span><strong>{time ? time12(time) : "Select a time"}</strong></div>
          <div className="sum-row"><span>Slot length</span><strong><Clock size={13} /> {doctor.slot_minutes} min</strong></div>
          <div className="sum-row"><span>Fee</span><strong>Rs {doctor.fee.toLocaleString()}</strong></div>
          {error && <div className="error">{error}</div>}
          <button className="btn btn-primary btn-block" disabled={!time || busy} onClick={confirm}>{busy ? "Booking..." : "Confirm booking"}</button>
          <p className="muted small" style={{ marginTop: 12 }}>You can cancel or reschedule up to 2 hours before your visit.</p>
        </aside>
      </div>
    </main>
  );
}
