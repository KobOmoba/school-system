import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@shared/hooks/useAuth';
import AdminDashboard from './pages/AdminDashboard';
import StudentPortal from './pages/StudentPortal';
import './index.css';

function App() {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">🔐 School System</h1>
          <p className="text-gray-600 mb-6">Please log in to continue</p>
          <a href="/login" className="text-blue-600 hover:underline">
            Go to Login
          </a>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route
          path="/admin"
          element={profile?.role === 'admin' ? <AdminDashboard /> : <Navigate to="/" />}
        />
        <Route
          path="/student"
          element={profile?.role === 'student' ? <StudentPortal studentId={user.uid} /> : <Navigate to="/" />}
        />
        <Route path="/" element={<AdminDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;