import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase'; // Adjust path if needed

export default function Navbar() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');  // ✅ Redirect to login after logout
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

  return (
    <nav className="bg-white shadow-md py-4 px-6 flex justify-between items-center z-50 relative">
      <Link to="/" className="text-2xl font-extrabold text-pink-600 tracking-tight">
        🐾 PetPulse
      </Link>
      <div className="flex items-center gap-6">
        <Link to="/" className="text-md font-semibold text-gray-800 hover:text-pink-500">
          Home
        </Link>
        <Link to="/map" className="text-md font-semibold text-gray-800 hover:text-pink-500">
          Live Tracking
        </Link>

        <div className="relative z-50">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="bg-yellow-300 text-black font-semibold py-2 px-4 rounded-full hover:bg-yellow-400 transition-all"
          >
            Account
          </button>
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white border rounded-md shadow-lg z-50">
              <Link
                to="/profile-details"
                className="block px-4 py-2 text-gray-800 hover:bg-gray-100"
              >
                👤 Owner Details
              </Link>
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-100"
              >
                🔒 Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
