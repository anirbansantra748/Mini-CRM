import { useEffect } from 'react';
import { Route, Routes, Navigate, useNavigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AnimatePresence, motion } from 'framer-motion';

import Login from './pages/Login';
import Projects from './pages/Projects';
import AuditLog from './pages/AuditLog';
import Dashboard from './pages/Dashboard';
import ProjectDetail from './pages/ProjectDetail';
import Users from './pages/Users';
import Settings from './pages/Settings';

import AppLayout from './components/layout/AppLayout';
import { ThemeProvider } from './components/theme/ThemeProvider';

function useAuth() {
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');
  return { token, user: user ? JSON.parse(user) : null } as { token: string | null; user: { id?: string; email: string; role: 'ADMIN' | 'MEMBER' } | null };
}

function PrivateRoute({ children }: { children: JSX.Element }) {
  const { token } = useAuth();
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  const { token } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    if (!token) navigate('/login');
  }, [token, navigate]);

  return (
    <ThemeProvider>
      <Toaster richColors position="top-right" />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <PrivateRoute>
              <AppLayout>
                <AnimatePresence mode="wait">
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
                    <Dashboard />
                  </motion.div>
                </AnimatePresence>
              </AppLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/projects"
          element={
            <PrivateRoute>
              <AppLayout>
                <AnimatePresence mode="wait">
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
                    <Projects />
                  </motion.div>
                </AnimatePresence>
              </AppLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/projects/:id"
          element={
            <PrivateRoute>
              <AppLayout>
                <AnimatePresence mode="wait">
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
                    <ProjectDetail />
                  </motion.div>
                </AnimatePresence>
              </AppLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/users"
          element={
            <PrivateRoute>
              <AppLayout>
                <AnimatePresence mode="wait">
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
                    <Users />
                  </motion.div>
                </AnimatePresence>
              </AppLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <PrivateRoute>
              <AppLayout>
                <AnimatePresence mode="wait">
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
                    <Settings />
                  </motion.div>
                </AnimatePresence>
              </AppLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/audit"
          element={
            <PrivateRoute>
              <AppLayout>
                <AnimatePresence mode="wait">
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
                    <AuditLog />
                  </motion.div>
                </AnimatePresence>
              </AppLayout>
            </PrivateRoute>
          }
        />
      </Routes>
    </ThemeProvider>
  );
}
