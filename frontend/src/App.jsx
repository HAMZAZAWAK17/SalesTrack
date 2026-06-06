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
import { Box, Typography, Container, Button, Paper } from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import LogoutIcon from '@mui/icons-material/Logout';
import './App.css';

function AppRoutes() {
  const { isAuthenticated, user, loading, logoutUser, theme } = useAuth();

  // Create a customized Material UI theme dynamically
  const muiTheme = createTheme({
    palette: {
      mode: theme,
      primary: {
        main: theme === 'dark' ? '#6366f1' : '#4f46e5', // Indigo
      },
      secondary: {
        main: theme === 'dark' ? '#a855f7' : '#7c3aed', // Purple
      },
      background: {
        default: theme === 'dark' ? '#0b0f19' : '#f8fafc',
        paper: theme === 'dark' ? '#111827' : '#ffffff',
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
            fontWeight: 700,
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
      
      {/* 1. Not Logged In: show Login */}
      {!isAuthenticated ? (
        <Routes>
          <Route path="*" element={<Login />} />
        </Routes>
      ) : user && user.role === 'ADMIN' ? (
        /* 2. ADMIN User: show Admin Users & Clients Routes */
        <Routes>
          <Route path="/users" element={<UserList />} />
          <Route path="/users/create" element={<UserCreate />} />
          <Route path="/users/edit/:id" element={<UserEdit />} />
          <Route path="/users/:id" element={<UserDetails />} />
          <Route path="/clients" element={<ClientList />} />
          <Route path="/clients/create" element={<ClientCreate />} />
          <Route path="/clients/edit/:id" element={<ClientEdit />} />
          <Route path="/clients/:id" element={<ClientDetails />} />
          <Route path="*" element={<Navigate to="/users" replace />} />
        </Routes>
      ) : (
        /* 3. MANAGER or COMMERCIAL: show Clients Routes ONLY */
        <Routes>
          <Route path="/clients" element={<ClientList />} />
          <Route path="/clients/edit/:id" element={<ClientEdit />} />
          <Route path="/clients/:id" element={<ClientDetails />} />
          <Route path="*" element={<Navigate to="/clients" replace />} />
        </Routes>
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
