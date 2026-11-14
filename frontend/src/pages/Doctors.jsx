import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Search, Clock, ArrowRight } from "lucide-react";
import { api } from "../api.js";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function initials(name) {
  return name.replace("Dr. ", "").split(" ").map(function (p) { return p[0]; }).slice(0, 2).join("");
}

export default function Doctors() {
  const [doctors, setDoctors] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(function () {
    api("/doctors")
      .then(function (data) { setDoctors(data.doctors); })
      .catch(function (e) { setError(e.message); })
      .finally(function () { setLoading(false); });
  }, []);

  const q = search.trim().toLowerCase();
  const shown = doctors.filter(function (d) {
    return !q || d.name.toLowerCase().indexOf(q) !== -1 || d.specialty.toLowerCase().indexOf(q) !== -1;
  });

  return (
    <main className="container">
      <div className="page-head">
        <div>
          <div className="sec-label"><span>01</span> Our specialists</div>
          <h2 className="sec-title" style={{ marginBottom: 0 }}>Meet your <em>skin doctors.</em></h2>
        </div>
        <div className="searchbar">
          <Search size={17} />
          <input value={search} onChange={function (e) { setSearch(e.target.value); }} placeholder="Search by name or specialty" />
        </div>
      </div>

      {error && <div className="error">{error}</div>}
      {loading && <div className="empty">Loading doctors...</div>}
      {!loading && !error && shown.length === 0 && <div className="empty">No doctors match your search.</div>}

      <div className="dgrid">
        {shown.map(function (d, i) {
          return (
            <div className="glass dcard" key={d.id} style={{ animationDelay: (i * 0.07) + "s" }}>
              <div className="dtop">
                <span className="avatar">{initials(d.name)}</span>
                <div>
                  <h3>{d.name}</h3>
                  <span className="spec">{d.specialty}</span>
                </div>
              </div>
              <p className="dbio">{d.bio}</p>
              <div className="days">
                {DAYS.map(function (name, idx) {
                  return <span key={name} className={"day" + (d.work_days_list.indexOf(idx) !== -1 ? " on" : "")}>{name}</span>;
                })}
              </div>
              <div className="dmeta"><Clock size={15} /> {d.start_time} - {d.end_time} &middot; {d.slot_minutes} min slots</div>
              <div className="dfoot">
                <div className="fee">Rs {d.fee.toLocaleString()} <small>per visit</small></div>
                <Link to={"/book/" + d.id} className="pill-btn">Book <span className="arrow"><ArrowRight size={16} /></span></Link>
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}
