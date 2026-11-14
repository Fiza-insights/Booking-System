import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api.js";
import { useAuth } from "../auth.jsx";
import Butterfly from "../components/Butterfly.jsx";

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  function change(key) {
    return function (e) {
      const value = e.target.value;
      setForm(function (f) { return Object.assign({}, f, { [key]: value }); });
    };
  }

  async function submit(ev) {
    ev.preventDefault();
    setError("");
    setBusy(true);
    try {
      const data = await api("/auth/register", { method: "POST", body: form });
      login(data.token, data.user);
      navigate("/doctors");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="container auth-wrap">
      <div className="glass auth-card">
        <h2 className="page-title">Create your account</h2>
        <p className="muted">Register once and book appointments anytime.</p>
        {error && <div className="error">{error}</div>}
        <form onSubmit={submit}>
          <div className="field">
            <label>Full name</label>
            <input value={form.name} onChange={change("name")} placeholder="Your name" required />
          </div>
          <div className="field">
            <label>Email</label>
            <input type="email" value={form.email} onChange={change("email")} placeholder="you@example.com" required />
          </div>
          <div className="field">
            <label>Phone (optional)</label>
            <input value={form.phone} onChange={change("phone")} placeholder="0300-1234567" />
          </div>
          <div className="field">
            <label>Password</label>
            <input type="password" value={form.password} onChange={change("password")} placeholder="At least 6 characters" required />
          </div>
          <button className="btn btn-primary btn-block" disabled={busy}>{busy ? "Creating..." : "Register"}</button>
        </form>
        <p className="muted small" style={{ marginTop: 16 }}>Already have an account? <Link to="/login">Log in</Link></p>
      </div>
      <div className="auth-art"><Butterfly /></div>
    </main>
  );
}
