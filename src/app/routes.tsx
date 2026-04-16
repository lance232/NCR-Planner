import { createBrowserRouter, Navigate, Outlet } from 'react-router';
import { Login } from './components/Login';
import { SchedulerDashboard } from './components/SchedulerDashboard';
import { BankDashboard } from './components/BankDashboard';
import { EngineerDashboard } from './components/EngineerDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import { BookingProvider } from './context/BookingContext';

// Root layout - wraps all routes with context providers
function RootLayout() {
  return (
    <AuthProvider>
      <BookingProvider>
        <Outlet />
      </BookingProvider>
    </AuthProvider>
  );
}

// Application routes configuration
export const router = createBrowserRouter([
  {
    path: '/',
    Component: RootLayout,
    children: [
      {
        index: true,
        Component: Login,
      },
      {
        path: 'admin',
        element: <ProtectedRoute allowedRole="admin"><AdminDashboard /></ProtectedRoute>,
      },
      {
        path: 'scheduler',
        element: <ProtectedRoute allowedRole="scheduler"><SchedulerDashboard /></ProtectedRoute>,
      },
      {
        path: 'bank',
        element: <ProtectedRoute allowedRole="bank"><BankDashboard /></ProtectedRoute>,
      },
      {
        path: 'engineer',
        element: <ProtectedRoute allowedRole="engineer"><EngineerDashboard /></ProtectedRoute>,
      },
      {
        path: '*',
        element: <Navigate to="/" replace />,
      },
    ],
  },
]);