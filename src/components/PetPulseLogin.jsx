import React, { useState } from 'react';
import { FiLogIn, FiUserPlus } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom'; // ✅ Added

export default function PetPulseLogin() {
  const [isSignup, setIsSignup] = useState(false);
  const navigate = useNavigate(); // ✅ Added

  const handleLogin = (e) => {
    e.preventDefault();
    // You can add authentication here
    navigate('/map'); // ✅ Redirect to MapDashboard
  };

  return (
    <div className="relative w-screen h-screen flex items-center justify-center font-sans overflow-hidden">
      <div
        className="absolute inset-0 z-[-2]"
        style={{
          backgroundImage:
            "linear-gradient(to top right, #f43f5e, #d946ef, #6366f1), url('/paw-print.png')",
          backgroundSize: 'cover, 60px',
          backgroundRepeat: 'no-repeat, repeat',
          backgroundPosition: 'center, center',
          backgroundBlendMode: 'overlay',
        }}
      />

      {/* Animated Blobs */}
      <div className="absolute inset-0 z-[-1] pointer-events-none">
        <div className="absolute top-[-4rem] left-[-4rem] w-80 h-80 bg-pink-400 rounded-full mix-blend-multiply filter blur-2xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 right-[-4rem] w-96 h-96 bg-yellow-300 rounded-full mix-blend-multiply filter blur-2xl opacity-30 animate-blob"></div>
        <div className="absolute bottom-[-4rem] left-1/4 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-2xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-md px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="bg-white/20 backdrop-blur-2xl shadow-2xl rounded-3xl px-8 py-10 border border-white/30"
        >
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-5xl font-extrabold text-center mb-6 bg-gradient-to-r from-yellow-300 via-pink-400 to-purple-500 text-transparent bg-clip-text animate-pulse"
          >
            Pet Pulse 🐾
          </motion.h1>

          <h2 className="text-2xl font-bold text-white text-center mb-1">
            {isSignup ? 'Create Account' : 'Welcome Back'}
          </h2>
          <p className="text-sm text-white/80 text-center mb-6">
            {isSignup ? 'Join the Pet Pulse Pack 🐶' : 'Login to your smart pet dashboard'}
          </p>

          <AnimatePresence mode="wait">
            <motion.form
              key={isSignup ? 'signup' : 'login'}
              onSubmit={handleLogin} // ✅ Added
              initial={{ opacity: 0, x: isSignup ? 100 : -100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: isSignup ? -100 : 100 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col gap-4"
            >
              <input
                type="email"
                placeholder="Email"
                className="px-4 py-3 rounded-xl border border-white/30 bg-white/90 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-400"
              />
              <input
                type="password"
                placeholder="Password"
                className="px-4 py-3 rounded-xl border border-white/30 bg-white/90 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-400"
              />
              {isSignup && (
                <input
                  type="text"
                  placeholder="Pet's Name"
                  className="px-4 py-3 rounded-xl border border-white/30 bg-white/90 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-400"
                />
              )}
              <button
                type="submit"
                className="mt-3 bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600 hover:from-pink-500 hover:to-indigo-500 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg hover:shadow-pink-300/50 transition-all duration-300"
              >
                {isSignup ? <FiUserPlus className="text-xl" /> : <FiLogIn className="text-xl" />}
                {isSignup ? 'Sign Up' : 'Login'}
              </button>
            </motion.form>
          </AnimatePresence>

          <div className="mt-6 text-sm text-white/90 text-center">
            {isSignup ? 'Already have an account?' : 'New to Pet Pulse?'}{' '}
            <button
              onClick={() => setIsSignup(!isSignup)}
              className="text-yellow-200 font-bold underline hover:text-white transition-colors"
            >
              {isSignup ? 'Login' : 'Sign Up'}
            </button>
          </div>
        </motion.div>
      </div>

      <style>{`
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        @keyframes blob {
          0%, 100% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -20px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }
      `}</style>
    </div>
  );
}
