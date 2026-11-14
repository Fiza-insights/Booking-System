import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout.jsx";
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Doctors from "./pages/Doctors.jsx";
import Book from "./pages/Book.jsx";
import MyBookings from "./pages/MyBookings.jsx";

function Soon() {
  return (
    <main className="container">
      <div className="glass card-pad">
        <h2 className="page-title">Coming soon</h2>
        <p className="muted">This page is being built.</p>
      </div>
    </main>
  );
}

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/doctors" element={<Doctors />} />
        <Route path="/book/:id" element={<Book />} />
        <Route path="/my-bookings" element={<MyBookings />} />
        <Route path="*" element={<Soon />} />
      </Route>
    </Routes>
  );
}
