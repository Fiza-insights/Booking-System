import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CalendarDays, Clock, X, RefreshCw } from "lucide-react";
import { api } from "../api.js";
import Reschedule from "../components/Reschedule.jsx";

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

export default function MyBookings() {
  const [list, setList] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [open, setOpen] = useState(null);

  function load() {
    api("/bookings/mine")
      .then(function (data) { setList(Array.isArray(data) ? data : data.bookings); })
      .catch(function (e) { setError(e.message); });
  }

  useEffect(load, []);

  async function cancel(b) {
    if (!window.confirm("Cancel booking " + b.ref_code + "?")) return;
    setError("");
    setMessage("");
    try {
      await api("/bookings/" + b.id + "/cancel", { method: "PUT" });
      setMessage("Booking " + b.ref_code + " was cancelled.");
      load();
    } catch (e) {
      setError(e.message);
    }
  }

  function rescheduled() {
    setOpen(null);
    setMessage("Your booking was moved to the new time.");
    load();
  }

  const today = keyOf(new Date());
  const upcoming = (list || []).filter(function (b) { return b.status === "confirmed" && b.booking_date >= today; });
  const past = (list || []).filter(function (b) { return upcoming.indexOf(b) === -1; });

  function card(b, canEdit) {
    return (
      <div key={b.id} className="glass bk-card">
        <div className="bk-top">
          <div>
            <div className="bk-ref">{b.ref_code}</div>
            <h3 className="bk-doc">{b.doctor_name}</h3>
            <div className="muted small">{b.specialty}</div>
          </div>
          <span className={"badge st-" + b.status}>{b.status.replace("_", " ")}</span>
        </div>
        <div className="bk-meta">
          <span><CalendarDays size={15} /> {prettyDate(b.booking_date)}</span>
          <span><Clock size={15} /> {time12(b.slot_time)}</span>
        </div>
        {b.reason && <div className="muted small" style={{ marginTop: 8 }}>Reason: {b.reason}</div>}
        {canEdit && (
          <div className="hero-actions" style={{ marginTop: 16 }}>
            <button className="btn btn-ghost" onClick={function () { setOpen(open === b.id ? null : b.id); }}><RefreshCw size={15} /> Reschedule</button>
            <button className="btn btn-ghost danger" onClick={function () { cancel(b); }}><X size={15} /> Cancel</button>
          </div>
        )}
        {open === b.id && <Reschedule booking={b} onClose={function () { setOpen(null); }} onDone={rescheduled} />}
      </div>
    );
  }

  return (
    <main className="container">
      <div className="page-head">
        <div>
          <div className="sec-label"><span>03</span> Your visits</div>
          <h2 className="sec-title" style={{ marginBottom: 0 }}>My <em>bookings.</em></h2>
        </div>
        <Link to="/doctors" className="btn btn-primary">Book new</Link>
      </div>

      {message && <div className="success">{message}</div>}
      {error && <div className="error">{error}</div>}
      {!list && !error && <div className="empty">Loading...</div>}

      {list && (
        <>
          <h3 className="group-title">Upcoming</h3>
          {upcoming.length === 0 && <div className="empty">No upcoming bookings.</div>}
          <div className="bk-list">{upcoming.map(function (b) { return card(b, true); })}</div>

          <h3 className="group-title">Past and cancelled</h3>
          {past.length === 0 && <div className="empty">Nothing here yet.</div>}
          <div className="bk-list">{past.map(function (b) { return card(b, false); })}</div>
        </>
      )}
    </main>
  );
}
