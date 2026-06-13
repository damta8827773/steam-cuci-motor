import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import CashierPage from './pages/CashierPage';
import DashboardPage from './pages/DashboardPage';
import PricesPage from './pages/PricesPage';
import EmployeesPage from './pages/EmployeesPage';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isOwner, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return isOwner ? <>{children}</> : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route element={<Layout />}>
        <Route path="/" element={<CashierPage />} />
        <Route
          path="/dashboard"
          element={<ProtectedRoute><DashboardPage /></ProtectedRoute>}
        />
        <Route
          path="/prices"
          element={<ProtectedRoute><PricesPage /></ProtectedRoute>}
        />
        <Route
          path="/employees"
          element={<ProtectedRoute><EmployeesPage /></ProtectedRoute>}
        />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
