import { NavLink, Outlet, Navigate } from "react-router-dom";
import { LayoutDashboard, CalendarDays, Stethoscope } from "lucide-react";
import { useAuth } from "../auth.jsx";

export default function AdminLayout() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== "admin") return <Navigate to="/" replace />;

  return (
    <main className="container">
      <div className="page-head">
        <div>
          <div className="sec-label"><span>04</span> Admin panel</div>
          <h2 className="sec-title" style={{ marginBottom: 0 }}>Clinic <em>overview.</em></h2>
        </div>
      </div>
      <div className="admin-tabs">
        <NavLink end to="/admin"><LayoutDashboard size={16} /> Dashboard</NavLink>
        <NavLink to="/admin/bookings"><CalendarDays size={16} /> Bookings</NavLink>
        <NavLink to="/admin/doctors"><Stethoscope size={16} /> Doctors</NavLink>
      </div>
      <Outlet />
    </main>
  );
}
