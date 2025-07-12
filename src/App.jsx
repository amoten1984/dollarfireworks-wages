import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Staff from "./pages/Staff";
import Attendance from "./pages/Attendance";
import Locations from "./pages/Locations"; // 👈 New import here

function Home() {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <Link to="/locations">
        <div className="p-12 rounded-3xl shadow-lg bg-indigo-600 hover:bg-indigo-700 transition text-white text-4xl font-bold flex items-center space-x-4">
          <span className="text-5xl">💸</span>
          <span>Wages</span>
        </div>
      </Link>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/locations" element={<Locations />} />
        <Route path="/locations/:locationId/staff" element={<Staff />} />
        <Route path="/locations/:locationId/staff/:staffId/attendance" element={<Attendance />} />
      </Routes>
    </Router>
  );
}

export default App;
