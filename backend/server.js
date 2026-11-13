try { process.loadEnvFile(); } catch (e) { console.log("No .env file found"); }

const express = require("express");
const cors = require("cors");
require("./db");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/api/health", function (req, res) {
  res.json({ status: "ok", app: "DermaBloom" });
});

app.use("/api/auth", require("./routes/auth"));
app.use("/api/doctors", require("./routes/doctors"));
app.use("/api/bookings", require("./routes/bookings"));
app.use("/api/admin/reports", require("./routes/reports"));
app.use("/api/admin", require("./routes/admin"));

const PORT = process.env.PORT || 5001;
app.listen(PORT, function (err) {
  if (err) {
    console.error("Cannot start server: " + err.message);
    process.exit(1);
  }
  console.log("DermaBloom API running on http://localhost:" + PORT);
});
