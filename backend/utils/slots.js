function pad(n) {
  return String(n).padStart(2, "0");
}

function dateStr(d) {
  return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
}

function toMin(t) {
  const p = t.split(":");
  return Number(p[0]) * 60 + Number(p[1]);
}

function toTime(m) {
  return pad(Math.floor(m / 60)) + ":" + pad(m % 60);
}

// All slot start times (HH:MM) for one doctor on a working day
function slotsFor(doc) {
  const out = [];
  const end = toMin(doc.end_time);
  const len = doc.slot_minutes;
  for (let m = toMin(doc.start_time); m + len <= end; m += len) {
    if (doc.break_start && doc.break_end) {
      if (m < toMin(doc.break_end) && m + len > toMin(doc.break_start)) continue;
    }
    out.push(toTime(m));
  }
  return out;
}

module.exports = { pad, dateStr, toMin, toTime, slotsFor };
