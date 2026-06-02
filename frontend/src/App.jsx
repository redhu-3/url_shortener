import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Analytics from './pages/Analytics';
import Landing from './pages/Landing';
import PublicStats from './pages/PublicStats';
import PublicLinks from './pages/PublicLinks';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/public-links" element={<PublicLinks />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/analytics/:urlId" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
          <Route path="/public/stats/:shortCode" element={<PublicStats />} />
          <Route path="/stats/:shortCode" element={<PublicStats />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}