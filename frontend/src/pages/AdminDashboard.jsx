import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell, Legend } from "recharts";
import { CalendarCheck, CalendarClock, ClipboardList, XCircle, Users, Stethoscope } from "lucide-react";
import { api } from "../api.js";

const STATUS_COLORS = { confirmed: "#8fd9a8", completed: "#EC9C9D", cancelled: "#e8847f", no_show: "#d6b36a" };
const TIP = { background: "#1d1411", border: "1px solid rgba(236,156,157,0.3)", borderRadius: 12, color: "#F2CFCA" };

function time12(t) {
  const h = Number(t.slice(0, 2));
  return (h % 12 || 12) + ":" + t.slice(3) + " " + (h >= 12 ? "PM" : "AM");
}

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(function () {
    api("/admin/reports")
      .then(setData)
      .catch(function (e) { setError(e.message); });
  }, []);

  if (error) return <div className="error">{error}</div>;
  if (!data) return <div className="empty">Loading...</div>;

  const c = data.cards;
  const cards = [
    { label: "Today", value: c.today_bookings, icon: CalendarCheck },
    { label: "Upcoming", value: c.upcoming, icon: CalendarClock },
    { label: "Total bookings", value: c.total_bookings, icon: ClipboardList },
    { label: "Cancelled", value: c.cancelled, icon: XCircle },
    { label: "Patients", value: c.patients, icon: Users },
    { label: "Active doctors", value: c.active_doctors, icon: Stethoscope },
  ];

  const daily = data.daily.map(function (d) { return { day: d.date.slice(5), Booked: d.booked, Cancelled: d.cancelled }; });
  const status = data.by_status.map(function (s) { return { name: s.status.replace("_", " "), key: s.status, value: s.count }; });
  const doctors = data.by_doctor.map(function (d) { return { name: d.name.replace("Dr. ", ""), Booked: d.booked, Completed: d.completed }; });

  return (
    <div>
      <div className="stat-grid">
        {cards.map(function (x) {
          const Icon = x.icon;
          return (
            <div key={x.label} className="glass stat-card">
              <Icon size={20} className="stat-icon" />
              <strong>{x.value}</strong>
              <span>{x.label}</span>
            </div>
          );
        })}
      </div>

      <div className="chart-grid">
        <div className="glass chart-card wide">
          <h3>Bookings per day</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={daily}>
              <CartesianGrid stroke="rgba(236,156,157,0.1)" vertical={false} />
              <XAxis dataKey="day" stroke="#AA7F66" fontSize={12} />
              <YAxis stroke="#AA7F66" fontSize={12} allowDecimals={false} />
              <Tooltip contentStyle={TIP} cursor={{ fill: "rgba(236,156,157,0.08)" }} />
              <Legend />
              <Bar dataKey="Booked" fill="#EC9C9D" radius={[6, 6, 0, 0]} />
              <Bar dataKey="Cancelled" fill="#7F5836" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="glass chart-card">
          <h3>Status split</h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={status} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={3} stroke="none">
                {status.map(function (s) { return <Cell key={s.key} fill={STATUS_COLORS[s.key]} />; })}
              </Pie>
              <Tooltip contentStyle={TIP} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="glass chart-card wide">
          <h3>Appointments by doctor</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={doctors}>
              <CartesianGrid stroke="rgba(236,156,157,0.1)" vertical={false} />
              <XAxis dataKey="name" stroke="#AA7F66" fontSize={11} />
              <YAxis stroke="#AA7F66" fontSize={12} allowDecimals={false} />
              <Tooltip contentStyle={TIP} cursor={{ fill: "rgba(236,156,157,0.08)" }} />
              <Legend />
              <Bar dataKey="Booked" fill="#EC9C9D" radius={[6, 6, 0, 0]} />
              <Bar dataKey="Completed" fill="#AA7F66" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="glass chart-card">
          <h3>Occupancy (next 7 days)</h3>
          <div className="occ">
            <strong>{data.occupancy.percent}%</strong>
            <div className="occ-bar"><div style={{ width: data.occupancy.percent + "%" }} /></div>
            <span>{data.occupancy.booked} of {data.occupancy.slots} slots booked</span>
          </div>
        </div>
      </div>

      <div className="glass chart-card" style={{ marginTop: 18 }}>
        <h3>Today's appointments</h3>
        {data.today.length === 0 && <div className="muted">No appointments today.</div>}
        {data.today.map(function (t) {
          return (
            <div key={t.ref_code} className="today-row">
              <strong>{time12(t.slot_time)}</strong>
              <span>{t.patient_name}</span>
              <span className="muted">{t.doctor_name}</span>
              <span className={"badge st-" + t.status}>{t.status.replace("_", " ")}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
