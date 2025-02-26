import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Header from './components/Header';
import { jwtDecode } from 'jwt-decode';
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
import Admin from './pages/Admin';
import Home from './pages/Home';
import PaymentPage from './pages/Paymentpage';
import PaymentSuccessPage from './pages/PaymentSuccessPage';
import PaymentError from './pages/PaymentError';

interface JwtPayload {
  id: string;
  role: string;
  isFreelancer: boolean;
  companyId?: string;
  exp: number;
}

const validateSession = () => {
  const token = localStorage.getItem('token');
  if (!token) return false;

  try {
    const decoded = jwtDecode<JwtPayload>(token);
    const isExpired = Date.now() >= decoded.exp * 1000;
    
    if (isExpired) {
      localStorage.clear();
      return false;
    }

    // Verificar se usuários não freelancers têm companyId
    if (!decoded.isFreelancer && !localStorage.getItem('companyId')) {
      localStorage.clear();
      return false;
    }

    return true;
  } catch (error) {
    localStorage.clear();
    return false;
  }
};

const checkSubscription = () => {
  const subscriptionValid = localStorage.getItem('subscriptionValid') === 'true';
  const companyActive = localStorage.getItem('companyActive') === 'true';
  
  return subscriptionValid && companyActive;
};

const getRole = () => {
  return localStorage.getItem('role') || 'user';
};

const ProtectedRoute = ({
  element,
  allowedRoles = [],
  needsSubscription = true,
  allowedForFreelancers = false
}: {
  element: JSX.Element;
  allowedRoles?: string[];
  needsSubscription?: boolean;
  allowedForFreelancers?: boolean;
}) => {
  const location = useLocation();
  
  if (!validateSession()) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const userRole = getRole();
  const isFreelancer = localStorage.getItem('isFreelancer') === 'true';
  
  if (isFreelancer && !allowedForFreelancers) {
    return <Navigate to="/" replace />;
  }

  if (!isFreelancer) {
    if (!checkSubscription() && needsSubscription) {
      return <Navigate to="/payment" replace />;
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
      return <Navigate to="/" replace />;
    }
  }

  return element;
};

// Tipos para as rotas
type RouteConfig = {
  path: string;
  element: JSX.Element;
  allowedRoles?: string[];
  needsSubscription?: boolean;
  allowedForFreelancers?: boolean;
};

const protectedRoutes: RouteConfig[] = [
  {
    path: '/dashboard',
    element: <Dashboard />,
    allowedForFreelancers: true
  },
  {
    path: '/freelancers',
    element: <Freelancer />,
    allowedRoles: ['admin']
  },
  {
    path: '/administradores',
    element: <Admin />,
    allowedRoles: ['admin']
  },
  {
    path: '/logs',
    element: <LogsAndStats />,
    allowedRoles: ['admin', 'editor']
  },
  {
    path: '/videos',
    element: <Videos />,
    allowedForFreelancers: true
  },
  {
    path: '/configuracoes',
    element: <Settings />,
    needsSubscription: false
  },
  {
    path: '/reports',
    element: <CustomReports />,
    allowedRoles: ['admin', 'editor', 'roteirista']
  },
  {
    path: '/canais',
    element: <Channels />,
    allowedRoles: ['admin', 'editor']
  }
];

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/recuperacao" element={<Recuperacao />} />
        <Route path="/codigo" element={<VerificationCode />} />
        <Route path="/reset-password" element={<Newpassword />} />
        <Route path="/payment-success" element={<PaymentSuccessPage />} />
        <Route path="/payment-error" element={<PaymentError />} />
        <Route path="/" element={<Home />} />
        <Route path="/payment" element={<PaymentPage onBack={() => window.history.back()} />} />

        {protectedRoutes.map((route) => (
          <Route
            key={route.path}
            path={route.path}
            element={
              <ProtectedRoute
                element={route.element}
                allowedRoles={route.allowedRoles}
                needsSubscription={route.needsSubscription}
                allowedForFreelancers={route.allowedForFreelancers}
              />
            }
          />
        ))}
      </Routes>
    </Router>
  );
}

export default App;