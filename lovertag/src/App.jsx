import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';

import LoginPage      from './pages/LoginPage';
import SignupPage     from './pages/SignupPage';
import DashboardPage  from './pages/DashboardPage';
import CreateTagPage  from './pages/CreateTagPage';
import PaywallPage    from './pages/PaywallPage';
import TagViewPage    from './pages/TagViewPage';
import AdminPage      from './pages/AdminPage';

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="page-center"><div className="spinner" style={{borderTopColor:'var(--crimson)',borderColor:'rgba(217,79,107,0.2)'}} /></div>;
  return user ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/login"       element={<LoginPage />} />
          <Route path="/signup"      element={<SignupPage />} />
          <Route path="/tag/:slug"   element={<TagViewPage />} />
          <Route path="/admin"       element={<AdminPage />} />

          {/* Protected */}
          <Route path="/dashboard"   element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
          <Route path="/create"      element={<PrivateRoute><CreateTagPage /></PrivateRoute>} />
          <Route path="/pay/:tagId"  element={<PrivateRoute><PaywallPage /></PrivateRoute>} />

          {/* Default */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
