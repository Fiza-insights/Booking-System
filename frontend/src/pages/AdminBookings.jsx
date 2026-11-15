import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { api } from "../api.js";

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const STATUSES = ["confirmed", "completed", "cancelled", "no_show"];

function time12(t) {
  const h = Number(t.slice(0, 2));
  return (h % 12 || 12) + ":" + t.slice(3) + " " + (h >= 12 ? "PM" : "AM");
}

function shortDate(key) {
  const d = new Date(key + "T00:00:00");
  return DAY_NAMES[d.getDay()] + ", " + d.getDate() + " " + MONTHS[d.getMonth()];
}

export default function AdminBookings() {
  const [doctors, setDoctors] = useState([]);
  const [date, setDate] = useState("");
  const [doctorId, setDoctorId] = useState("");
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(function () {
    api("/doctors").then(function (data) { setDoctors(Array.isArray(data) ? data : data.doctors); }).catch(function () {});
  }, []);

  function load() {
    const q = new URLSearchParams();
    if (date) q.set("date", date);
    if (doctorId) q.set("doctor_id", doctorId);
    if (status) q.set("status", status);
    if (search.trim()) q.set("search", search.trim());
    q.set("page", page);
    q.set("limit", 10);
    api("/admin/bookings?" + q.toString())
      .then(function (data) { setResult(data); setError(""); })
      .catch(function (e) { setError(e.message); });
  }

  useEffect(load, [date, doctorId, status, page]);

  function submitSearch(e) {
    e.preventDefault();
    if (page === 1) load();
    else setPage(1);
  }

  function changeFilter(setter) {
    return function (e) {
      setter(e.target.value);
      setPage(1);
    };
  }

  async function changeStatus(b, newStatus) {
    setError("");
    setMessage("");
    try {
      await api("/admin/bookings/" + b.id + "/status", { method: "PUT", body: { status: newStatus } });
      setMessage("Booking " + b.ref_code + " marked as " + newStatus.replace("_", " ") + ".");
      load();
    } catch (e) {
      setError(e.message);
    }
  }

  function clearAll() {
    setDate("");
    setDoctorId("");
    setStatus("");
    setSearch("");
    setPage(1);
  }

  return (
    <div>
      <form className="glass filters" onSubmit={submitSearch}>
        <div className="search-box">
          <Search size={16} />
          <input placeholder="Search patient or code" value={search} onChange={function (e) { setSearch(e.target.value); }} />
        </div>
        <input type="date" value={date} onChange={changeFilter(setDate)} />
        <select value={doctorId} onChange={changeFilter(setDoctorId)}>
          <option value="">All doctors</option>
          {doctors.map(function (d) { return <option key={d.id} value={d.id}>{d.name}</option>; })}
        </select>
        <select value={status} onChange={changeFilter(setStatus)}>
          <option value="">All statuses</option>
          {STATUSES.map(function (s) { return <option key={s} value={s}>{s.replace("_", " ")}</option>; })}
        </select>
        <button type="submit" className="btn btn-primary">Search</button>
        <button type="button" className="btn btn-ghost" onClick={clearAll}>Clear</button>
      </form>

      {message && <div className="success">{message}</div>}
      {error && <div className="error">{error}</div>}
      {!result && !error && <div className="empty">Loading...</div>}

      {result && (
        <div className="glass table-wrap">
          <table className="tbl">
            <thead>
              <tr>
                <th>Code</th>
                <th>Patient</th>
                <th>Doctor</th>
                <th>Date</th>
                <th>Time</th>
                <th>Status</th>
                <th>Change</th>
              </tr>
            </thead>
            <tbody>
              {result.bookings.length === 0 && (
                <tr><td colSpan="7" className="muted" style={{ textAlign: "center", padding: 28 }}>No bookings found.</td></tr>
              )}
              {result.bookings.map(function (b) {
                return (
                  <tr key={b.id}>
                    <td className="code">{b.ref_code}</td>
                    <td>{b.patient_name}</td>
                    <td>{b.doctor_name}</td>
                    <td>{shortDate(b.booking_date)}</td>
                    <td>{time12(b.slot_time)}</td>
                    <td><span className={"badge st-" + b.status}>{b.status.replace("_", " ")}</span></td>
                    <td>
                      <select className="mini" value="" onChange={function (e) { if (e.target.value) changeStatus(b, e.target.value); }}>
                        <option value="">Set status</option>
                        {STATUSES.filter(function (s) { return s !== b.status; }).map(function (s) {
                          return <option key={s} value={s}>{s.replace("_", " ")}</option>;
                        })}
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div className="pager">
            <span className="muted small">{result.total} bookings, page {result.page} of {result.total_pages || 1}</span>
            <div>
              <button className="btn btn-ghost" disabled={page <= 1} onClick={function () { setPage(page - 1); }}>Previous</button>
              <button className="btn btn-ghost" disabled={page >= result.total_pages} onClick={function () { setPage(page + 1); }}>Next</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
