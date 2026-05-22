import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Events from './pages/Events';
import CreateEvent from './pages/CreateEvent';
import EventDetail from './pages/EventDetail';
import CheckIn from './pages/CheckIn';
import MyTickets from './pages/MyTickets';

export default function App() {
  return (
    <HashRouter>
      <AuthProvider>
        <Navbar />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/events" element={<Events />} />
          <Route path="/events/new" element={
            <ProtectedRoute roles={['admin', 'organizer']}><CreateEvent /></ProtectedRoute>
          } />
          <Route path="/events/:id" element={<EventDetail />} />
          <Route path="/checkin" element={
            <ProtectedRoute roles={['admin', 'organizer', 'staff']}><CheckIn /></ProtectedRoute>
          } />
          <Route path="/my-tickets" element={<ProtectedRoute><MyTickets /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </HashRouter>
  );
}
