import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { api } from "../api.js";
import DoctorForm from "../components/DoctorForm.jsx";

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function time12(t) {
  if (!t) return "";
  const h = Number(t.slice(0, 2));
  return (h % 12 || 12) + ":" + t.slice(3) + " " + (h >= 12 ? "PM" : "AM");
}

export default function AdminDoctors() {
  const [list, setList] = useState(null);
  const [editing, setEditing] = useState(null);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  function load() {
    api("/admin/doctors")
      .then(function (data) { setList(data.doctors); })
      .catch(function (e) { setError(e.message); });
  }

  useEffect(load, []);

  function saved(msg) {
    setEditing(null);
    setAdding(false);
    setError("");
    setMessage(msg);
    load();
  }

  async function remove(d) {
    if (!window.confirm("Remove " + d.name + "?")) return;
    setError("");
    setMessage("");
    try {
      const r = await api("/admin/doctors/" + d.id, { method: "DELETE" });
      setMessage(r.message || "Doctor deleted.");
      load();
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <div>
      <div className="page-head" style={{ paddingTop: 0 }}>
        <span className="muted">{list ? list.length + " doctors" : ""}</span>
        {!adding && !editing && (
          <button className="btn btn-primary" onClick={function () { setAdding(true); setMessage(""); }}><Plus size={16} /> Add doctor</button>
        )}
      </div>

      {message && <div className="success">{message}</div>}
      {error && <div className="error">{error}</div>}

      {adding && <DoctorForm onSaved={saved} onCancel={function () { setAdding(false); }} />}
      {editing && <DoctorForm doctor={editing} onSaved={saved} onCancel={function () { setEditing(null); }} />}

      {!list && !error && <div className="empty">Loading...</div>}

      {list && (
        <div className="glass table-wrap" style={{ marginTop: 18 }}>
          <table className="tbl">
            <thead>
              <tr>
                <th>Doctor</th>
                <th>Days</th>
                <th>Hours</th>
                <th>Slot</th>
                <th>Fee</th>
                <th>Bookings</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {list.map(function (d) {
                return (
                  <tr key={d.id}>
                    <td>
                      <strong style={{ color: "var(--rose)" }}>{d.name}</strong>
                      <div className="muted small">{d.specialty}</div>
                    </td>
                    <td>{d.work_days.split(",").map(function (n) { return DAY_NAMES[Number(n)]; }).join(", ")}</td>
                    <td>{time12(d.start_time)} - {time12(d.end_time)}</td>
                    <td>{d.slot_minutes} min</td>
                    <td>Rs {d.fee.toLocaleString()}</td>
                    <td>{d.booking_count}</td>
                    <td><span className={"badge " + (d.active ? "st-confirmed" : "st-cancelled")}>{d.active ? "Active" : "Inactive"}</span></td>
                    <td>
                      <button className="icon-btn" title="Edit" onClick={function () { setEditing(d); setAdding(false); setMessage(""); }}><Pencil size={16} /></button>
                      <button className="icon-btn danger" title="Remove" onClick={function () { remove(d); }}><Trash2 size={16} /></button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
