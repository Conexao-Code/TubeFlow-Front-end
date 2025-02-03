import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Freelancer from './pages/Freelancers';
import Recuperacao from './pages/Recuperacao';
import VerificationCode from './pages/VerificationCode';
import Newpassword from './pages/Newpassword';
import Channels from './pages/Channels';
import Videos from './pages/Videos';
import LogsAndStats from './pages/LogsAndStats';
import CustomReports from './pages/CustomReports';
import Settings from './pages/Settings';

const isAuthenticated = () => {
  return !!localStorage.getItem('token');
};

const isFreelancer = () => {
  return localStorage.getItem('isFreelancer') === 'true';
};

const ProtectedRoute = ({
  element,
  allowedForFreelancers,
}: {
  element: JSX.Element;
  allowedForFreelancers?: boolean;
}) => {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  if (isFreelancer() && !allowedForFreelancers) {
    return <Navigate to="/" replace />;
  }

  return element;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/recuperacao" element={<Recuperacao />} />
        <Route path="/codigo" element={<VerificationCode />} />
        <Route path="/reset-password" element={<Newpassword />} />
        <Route
          path="/freelancers"
          element={<ProtectedRoute element={<Freelancer />} allowedForFreelancers={false} />}
        />        <Route
          path="/logs"
          element={<ProtectedRoute element={<LogsAndStats />} allowedForFreelancers={false} />}
        />
        <Route
          path="/videos"
          element={<ProtectedRoute element={<Videos />} allowedForFreelancers={true} />}
        />
        <Route
          path="/configuracoes"
          element={<ProtectedRoute element={<Settings />} allowedForFreelancers={true} />}
        />
        <Route
          path="/reports"
          element={<ProtectedRoute element={<CustomReports />} allowedForFreelancers={true} />}
        />
        <Route
          path="/canais"
          element={<ProtectedRoute element={<Channels />} allowedForFreelancers={false} />}
        />
        <Route path="/" element={<ProtectedRoute element={<Dashboard />} allowedForFreelancers={true} />} />
      </Routes>
    </Router>
  );
}

export default App;
