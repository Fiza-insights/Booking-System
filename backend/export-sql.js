const fs = require("fs");
const path = require("path");
const db = require("./db.js");

const outDir = path.join(__dirname, "..", "database");
fs.mkdirSync(outDir, { recursive: true });

fs.copyFileSync(path.join(__dirname, "schema.sql"), path.join(outDir, "schema.sql"));

function lit(v) {
  if (v === null || v === undefined) return "NULL";
  if (typeof v === "number") return String(v);
  return "'" + String(v).replace(/'/g, "''") + "'";
}

let sql = "-- DermaBloom demo data (dummy data only)\n-- Run schema.sql first, then this file.\n\nBEGIN TRANSACTION;\n\n";
const tables = ["users", "doctors", "bookings"];
for (const t of tables) {
  const rows = db.prepare("SELECT * FROM " + t + " ORDER BY id").all();
  if (rows.length === 0) continue;
  const cols = Object.keys(rows[0]);
  sql += "-- " + t + " (" + rows.length + " rows)\n";
  for (const r of rows) {
    sql += "INSERT INTO " + t + " (" + cols.join(", ") + ") VALUES (" + cols.map(function (c) { return lit(r[c]); }).join(", ") + ");\n";
  }
  sql += "\n";
}
sql += "COMMIT;\n";

fs.writeFileSync(path.join(outDir, "seed.sql"), sql);
console.log("Done. Files written to the database folder: schema.sql and seed.sql");
