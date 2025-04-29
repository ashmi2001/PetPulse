import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from './firebase'; // Make sure you import auth
import PetPulseLogin from './components/PetPulseLogin';
import DashboardHome from './pages/DashboardHome';
import MapDashboard from './pages/MapDashboard';
import FullProfileMap from './pages/FullProfileMap';
import ProfileDetails from './pages/ProfileDetails';

<Route path="/profile-details" element={<ProfileDetails />} />


function App() {
  const [user] = useAuthState(auth);

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<PetPulseLogin />} />
        <Route
          path="/home"
          element={user ? <DashboardHome /> : <Navigate to="/login" />}
        />
        <Route
          path="/map"
          element={user ? <MapDashboard /> : <Navigate to="/login" />}
        />
        <Route
          path="/profile-details"
          element={user ? <FullProfileMap /> : <Navigate to="/login" />}
        />
        {/* Default Route */}
        <Route
          path="*"
          element={<Navigate to={user ? "/home" : "/login"} />}
        />
        <Route path="/profile-details" element={<ProfileDetails />} />
      </Routes>
    </Router>
  );
}

export default App;
