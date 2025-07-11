import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";

function Home() {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
      <Link to="/locations">
        <div className="p-12 rounded-3xl shadow-lg bg-blue-600 hover:bg-blue-700 transition text-white text-4xl font-bold flex items-center space-x-4">
          <span className="text-5xl">💸</span>
          <span>Wages</span>
        </div>
      </Link>
    </div>
  );
}

function Locations() {
  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <h1 className="text-3xl font-bold mb-6">Locations</h1>
      <button className="px-6 py-3 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition">
        + Add Location
      </button>
      {/* Placeholder for dynamic list */}
      <div className="mt-6 text-gray-600 italic">No locations yet.</div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/locations" element={<Locations />} />
      </Routes>
    </Router>
  );
}

export default App;
