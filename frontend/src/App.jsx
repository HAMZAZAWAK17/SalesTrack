import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import UserList from './pages/users/UserList';
import UserCreate from './pages/users/UserCreate';
import UserEdit from './pages/users/UserEdit';
import UserDetails from './pages/users/UserDetails';
import ClientList from './pages/clients/ClientList';
import ClientCreate from './pages/clients/ClientCreate';
import ClientEdit from './pages/clients/ClientEdit';
import ClientDetails from './pages/clients/ClientDetails';

// Layout & Dashboard Imports
import DashboardLayout from './components/DashboardLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import ManagerDashboard from './pages/manager/ManagerDashboard';
import CommercialDashboard from './pages/commercial/CommercialDashboard';

// Visits Imports
import VisitList from './pages/visits/VisitList';
import VisitCreate from './pages/visits/VisitCreate';
import VisitDetails from './pages/visits/VisitDetails';
import VisitEdit from './pages/visits/VisitEdit';

// Orders Imports
import OrderList from './pages/orders/OrderList';
import OrderCreate from './pages/orders/OrderCreate';
import OrderDetails from './pages/orders/OrderDetails';

import { Box, Typography } from '@mui/material';
import './App.css';

function AppRoutes() {
  const { isAuthenticated, user, loading, theme } = useAuth();

  // Create a customized Material UI theme dynamically
  const muiTheme = createTheme({
    palette: {
      mode: theme,
      primary: {
        main: theme === 'dark' ? '#dfb15b' : '#b07c1b', // Gold
      },
      secondary: {
        main: theme === 'dark' ? '#f59e0b' : '#d97706', // Amber
      },
      background: {
        default: theme === 'dark' ? '#040a17' : '#f8fafc', // Deep Navy
        paper: theme === 'dark' ? '#0b1528' : '#ffffff', // Dark blue slate
      },
      text: {
        primary: theme === 'dark' ? '#f8fafc' : '#0f172a',
        secondary: theme === 'dark' ? '#94a3b8' : '#475569',
      },
      divider: theme === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)',
    },
    typography: {
      fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
      h4: {
        fontWeight: 800,
        letterSpacing: '-0.025em',
      },
      h5: {
        fontWeight: 700,
        letterSpacing: '-0.02em',
      },
    },
    shape: {
      borderRadius: 14,
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 10,
            textTransform: 'none',
            fontWeight: 750,
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
          },
        },
      },
    },
  });

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          bgcolor: theme === 'dark' ? '#0b0f19' : '#f8fafc',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <ThemeProvider theme={muiTheme}>
      <CssBaseline />
      
      {!isAuthenticated ? (
        <Routes>
          <Route path="*" element={<Login />} />
        </Routes>
      ) : (
        <DashboardLayout>
          <Routes>
            {/* Dynamic Dashboard Landing Redirector */}
            <Route
              path="/dashboard"
              element={
                user?.role === 'ADMIN' ? (
                  <AdminDashboard />
                ) : user?.role === 'MANAGER' ? (
                  <ManagerDashboard />
                ) : (
                  <CommercialDashboard />
                )
              }
            />

            {/* Clients Management Routes */}
            <Route path="/clients" element={<ClientList />} />
            <Route
              path="/clients/create"
              element={user?.role === 'ADMIN' ? <ClientCreate /> : <Navigate to="/clients" replace />}
            />
            <Route path="/clients/edit/:id" element={<ClientEdit />} />
            <Route path="/clients/:id" element={<ClientDetails />} />

            {/* Users Management Routes (Admin Only) */}
            <Route
              path="/users"
              element={user?.role === 'ADMIN' ? <UserList /> : <Navigate to="/dashboard" replace />}
            />
            <Route
              path="/users/create"
              element={user?.role === 'ADMIN' ? <UserCreate /> : <Navigate to="/users" replace />}
            />
            <Route
              path="/users/edit/:id"
              element={user?.role === 'ADMIN' ? <UserEdit /> : <Navigate to="/users" replace />}
            />
            <Route
              path="/users/:id"
              element={user?.role === 'ADMIN' ? <UserDetails /> : <Navigate to="/users" replace />}
            />

            {/* Visits Management Routes */}
            <Route path="/visits" element={<VisitList />} />
            <Route path="/visits/create" element={<VisitCreate />} />
            <Route path="/visits/:id" element={<VisitDetails />} />
            <Route path="/visits/edit/:id" element={<VisitEdit />} />

            {/* Orders & Quotes Management Routes */}
            <Route path="/orders" element={<OrderList />} />
            <Route path="/orders/create" element={<OrderCreate />} />
            <Route path="/orders/:id" element={<OrderDetails />} />

            {/* Fallback unknown routes */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </DashboardLayout>
      )}
    </ThemeProvider>
  );
}

// Circular progress loader fallback
function CircularProgress() {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <Typography variant="body2" color="text.secondary">Chargement...</Typography>
    </Box>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
