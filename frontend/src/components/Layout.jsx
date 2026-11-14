import { NavLink, Outlet, Link, useNavigate } from "react-router-dom";
import { Flower2, LogOut } from "lucide-react";
import { useAuth } from "../auth.jsx";

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function doLogout() {
    logout();
    navigate("/");
  }

  return (
    <div className="page">
      <header className="nav glass">
        <Link to="/" className="brand"><Flower2 size={22} /> DermaBloom</Link>
        <nav className="nav-links">
          <NavLink to="/" end>Home</NavLink>
          <NavLink to="/doctors">Doctors</NavLink>
          {user && user.role === "patient" && <NavLink to="/my-bookings">My bookings</NavLink>}
          {user && user.role === "admin" && <NavLink to="/admin">Admin</NavLink>}
          {user ? (
            <>
              <span className="nav-user">{user.name}</span>
              <button className="btn btn-ghost btn-sm" onClick={doLogout}><LogOut size={15} /> Logout</button>
            </>
          ) : (
            <>
              <NavLink to="/login">Login</NavLink>
              <Link to="/register" className="btn btn-primary btn-sm">Register</Link>
            </>
          )}
        </nav>
      </header>
      <Outlet />
      <footer className="footer">DermaBloom Skin Clinic. Demo project with dummy data.</footer>
    </div>
  );
}
