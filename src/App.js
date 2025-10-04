import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import OKUTransport from "./OKUTransport";
import Login from "./login/login";
import Register from "./login/Register";
import TestRegistration from "./TestRegistration";
import TestAuth from "./TestAuth";
import SimpleLogin from "./SimpleLogin";
import SimpleDashboard from "./SimpleDashboard";
import DriverDashboard from "./components/DriverDashboard";
import EnhancedBookingSystem from "./components/EnhancedBookingSystem";
import DriverProfileComplete from "./components/DriverProfileComplete";
import MainDashboard from "./components/MainDashboard";
import BookingSystem from "./components/BookingSystem";
import LiveMap from "./components/LiveMap";
import AdminAssignments from "./components/AdminAssignments";
import ProtectedRoute from "./components/ProtectedRoute";
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<OKUTransport />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/test" element={<TestRegistration />} />
          <Route path="/authtest" element={<TestAuth />} />
          <Route path="/simplelogin" element={<SimpleLogin />} />
          <Route path="/simpledash" element={<SimpleDashboard />} />
          <Route path="/driver-dashboard" element={
            <ProtectedRoute requireRole={['Driver']}>
              <DriverDashboard />
            </ProtectedRoute>
          } />
          <Route path="/driver-profile" element={
            <ProtectedRoute requireRole={['Driver']}>
              <DriverProfileComplete />
            </ProtectedRoute>
          } />
          <Route path="/enhanced-bookings" element={<EnhancedBookingSystem />} />
          
          {/* Protected Routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <MainDashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/bookings" element={
            <ProtectedRoute>
              <BookingSystem />
            </ProtectedRoute>
          } />
          
          <Route path="/map" element={
            <ProtectedRoute>
              <LiveMap />
            </ProtectedRoute>
          } />
          
          <Route path="/admin" element={
            <ProtectedRoute requireRole={['Company Admin', 'JKM Officer']}>
              <AdminAssignments />
            </ProtectedRoute>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;