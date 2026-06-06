import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import CreateUser from './pages/CreateUser';
import { Box, Typography, Container, Button, Paper, Alert } from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import LogoutIcon from '@mui/icons-material/Logout';
import './App.css';

function MainAppContent() {
  const { isAuthenticated, user, loading, logoutUser } = useAuth();

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          bgcolor: '#f5f7fa',
        }}
      >
        <Typography variant="h6">Chargement...</Typography>
      </Box>
    );
  }

  // 1. If not logged in, show Login Form
  if (!isAuthenticated) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: '#f5f7fa', py: 4 }}>
        <Login />
      </Box>
    );
  }

  // 2. If logged in, but not an admin or manager, show Access Denied
  if (user && user.role !== 'ADMIN' && user.role !== 'MANAGER') {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          bgcolor: '#f5f7fa',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          p: 2,
        }}
      >
        <Container maxWidth="sm">
          <Paper
            elevation={4}
            sx={{
              p: 5,
              borderRadius: 3,
              textAlign: 'center',
              boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
            }}
          >
            <Box
              sx={{
                mx: 'auto',
                width: 60,
                height: 60,
                bgcolor: 'error.light',
                color: 'error.main',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 3,
              }}
            >
              <LockIcon sx={{ fontSize: 32 }} />
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2 }}>
              Accès Refusé
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
              Vous êtes connecté en tant que <strong>{user.firstName} {user.lastName} ({user.role})</strong>.
              Seuls les administrateurs et les managers sont autorisés à accéder à la page de création d'utilisateurs.
            </Typography>
            <Button
              variant="outlined"
              color="error"
              startIcon={<LogoutIcon />}
              onClick={logoutUser}
              sx={{ borderRadius: 2, height: 48, textTransform: 'none' }}
            >
              Se déconnecter
            </Button>
          </Paper>
        </Container>
      </Box>
    );
  }

  // 3. Otherwise (ADMIN or MANAGER), show the User Creation Page
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f7fa', py: 2 }}>
      <CreateUser />
    </Box>
  );
}

function App() {
  return (
    <AuthProvider>
      <MainAppContent />
    </AuthProvider>
  );
}

export default App;

