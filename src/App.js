// ✅ App.js (Fully Updated with Working Routes)
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import PetPulseLogin from './components/PetPulseLogin';
import DashboardHome from './pages/DashboardHome';
import MapDashboard from './pages/MapDashboard';
import FullProfileMap from './pages/FullProfileMap';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<PetPulseLogin />} />
        <Route path="/home" element={<DashboardHome />} />
        <Route path="/map" element={<MapDashboard />} />
        <Route path="/profile-details" element={<FullProfileMap />} />

        {/* Default to login */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;
