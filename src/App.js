import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import PetPulseLogin from './components/PetPulseLogin';
import MapDashboard from './pages/MapDashboard';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<PetPulseLogin />} />
        <Route path="/map" element={<MapDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
