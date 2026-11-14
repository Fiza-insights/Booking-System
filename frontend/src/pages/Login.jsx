import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api.js";
import { useAuth } from "../auth.jsx";
import Butterfly from "../components/Butterfly.jsx";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function go(e, p) {
    setError("");
    setBusy(true);
    try {
      const data = await api("/auth/login", { method: "POST", body: { email: e, password: p } });
      login(data.token, data.user);
      navigate(data.user.role === "admin" ? "/admin" : "/doctors");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  function submit(ev) {
    ev.preventDefault();
    go(email, password);
  }

  return (
    <main className="container auth-wrap">
      <div className="glass auth-card">
        <h2 className="page-title">Welcome back</h2>
        <p className="muted">Log in to book and manage your appointments.</p>
        {error && <div className="error">{error}</div>}
        <form onSubmit={submit}>
          <div className="field">
            <label>Email</label>
            <input type="email" value={email} onChange={function (e) { setEmail(e.target.value); }} placeholder="you@example.com" required />
          </div>
          <div className="field">
            <label>Password</label>
            <input type="password" value={password} onChange={function (e) { setPassword(e.target.value); }} placeholder="Your password" required />
          </div>
          <button className="btn btn-primary btn-block" disabled={busy}>{busy ? "Logging in..." : "Log in"}</button>
        </form>
        <div className="demo-row">
          <span>Demo accounts:</span>
          <button type="button" className="chip" onClick={function () { go("admin@dermabloom.test", "Admin@123"); }}>Admin</button>
          <button type="button" className="chip" onClick={function () { go("patient@dermabloom.test", "Patient@123"); }}>Patient</button>
        </div>
        <p className="muted small">New here? <Link to="/register">Create an account</Link></p>
      </div>
      <div className="auth-art"><Butterfly /></div>
    </main>
  );
}
