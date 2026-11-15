import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Search, Clock, ArrowRight } from "lucide-react";
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

function initials(name) {
  return name.replace("Dr. ", "").split(" ").map(function (w) { return w[0]; }).join("").slice(0, 2);
}

function time12(t) {
  const h = Number(t.slice(0, 2));
  return (h % 12 || 12) + ":" + t.slice(3) + " " + (h >= 12 ? "PM" : "AM");
}

export default function Doctors() {
  const [list, setList] = useState(null);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  useEffect(function () {
    api("/doctors")
      .then(function (data) { setList(Array.isArray(data) ? data : data.doctors); })
      .catch(function (e) { setError(e.message); });
  }, []);

  const shown = (list || []).filter(function (d) {
    const q = search.trim().toLowerCase();
    return !q || d.name.toLowerCase().indexOf(q) !== -1 || d.specialty.toLowerCase().indexOf(q) !== -1;
  });

  return (
    <main className="container">
      <div className="page-head">
        <div>
          <div className="sec-label"><span>01</span> Our specialists</div>
          <h2 className="sec-title" style={{ marginBottom: 0 }}>Meet your <em>skin doctors.</em></h2>
        </div>
        <div className="dc-search">
          <Search size={17} />
          <input placeholder="Search by name or specialty" value={search} onChange={function (e) { setSearch(e.target.value); }} />
        </div>
      </div>

      {error && <div className="error">{error}</div>}
      {!list && !error && <div className="empty">Loading...</div>}
      {list && shown.length === 0 && <div className="empty">No doctors match your search.</div>}

      <div className="dc-grid">
        {shown.map(function (d, i) {
          return (
            <article key={d.id} className="dc-card" style={{ animationDelay: i * 110 + "ms" }}>
              <div className="dc-head">
                <div className="dc-avatar">{initials(d.name)}</div>
                <div>
                  <h3>{d.name}</h3>
                  <span className="dc-spec">{d.specialty}</span>
                </div>
              </div>

              <p className="dc-bio">{d.bio}</p>

              <div className="dc-days">
                {DAYS.map(function (x) {
                  const on = d.work_days_list.indexOf(x.n) !== -1;
                  return <span key={x.n} className={on ? "on" : ""}>{x.label}</span>;
                })}
              </div>

              <div className="dc-time"><Clock size={15} /> {time12(d.start_time)} to {time12(d.end_time)} <i>{d.slot_minutes} min slots</i></div>

              <div className="dc-foot">
                <div className="dc-fee">Rs {d.fee.toLocaleString()}<small>per visit</small></div>
                <Link to={"/book/" + d.id} className="dc-book">
                  Book <span><ArrowRight size={16} /></span>
                </Link>
              </div>
            </article>
          );
        })}
      </div>
    </main>
  );
}
