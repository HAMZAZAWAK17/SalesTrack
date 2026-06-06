import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Alert,
  List,
  ListItem,
  ListItemText,
  Divider,
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';

export default function Login() {
  const { loginUser } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await loginUser(email, password);
    setLoading(false);
    if (!result.success) {
      setError(result.error);
    }
  };

  const handleFillTestAccount = (testEmail, testPassword) => {
    setEmail(testEmail);
    setPassword(testPassword);
  };

  return (
    <Container component="main" maxWidth="xs" sx={{ py: 8 }}>
      <Paper
        elevation={6}
        sx={{
          p: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          borderRadius: 3,
          background: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
        }}
      >
        <Box
          sx={{
            m: 1,
            bgcolor: 'primary.main',
            color: 'white',
            borderRadius: '50%',
            p: 1.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <LockOutlinedIcon />
        </Box>
        <Typography component="h1" variant="h5" sx={{ fontWeight: 'bold', mb: 3 }}>
          Connexion SalesTrack
        </Typography>

        {error && (
          <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ width: '100%' }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Adresse Email"
            name="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Mot de passe"
            type="password"
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={loading}
            sx={{
              mt: 3,
              mb: 2,
              py: 1.5,
              fontSize: '1rem',
              fontWeight: 'bold',
              borderRadius: 2,
              textTransform: 'none',
              boxShadow: '0 4px 14px 0 rgba(0, 118, 255, 0.4)',
            }}
          >
            {loading ? 'Connexion...' : 'Se connecter'}
          </Button>
        </Box>

        <Divider sx={{ width: '100%', my: 2 }}>Comptes de test</Divider>
        
        <Box sx={{ width: '100%' }}>
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mb: 1 }}>
            Cliquez sur un compte pour remplir les champs :
          </Typography>
          <List dense sx={{ bgcolor: 'action.hover', borderRadius: 2, p: 1 }}>
            <ListItem 
              button="true"
              onClick={() => handleFillTestAccount('admin@salestrack.test', 'Admin1234!')}
              sx={{ cursor: 'pointer', borderRadius: 1, '&:hover': { bgcolor: 'action.selected' } }}
            >
              <ListItemText 
                primary="Administrateur (ADMIN)" 
                secondary="admin@salestrack.test / Admin1234!" 
              />
            </ListItem>
            <ListItem 
              button="true"
              onClick={() => handleFillTestAccount('manager@salestrack.test', 'Manager1234!')}
              sx={{ cursor: 'pointer', borderRadius: 1, '&:hover': { bgcolor: 'action.selected' } }}
            >
              <ListItemText 
                primary="Manager (MANAGER)" 
                secondary="manager@salestrack.test / Manager1234!" 
              />
            </ListItem>
            <ListItem 
              button="true"
              onClick={() => handleFillTestAccount('commercial1@salestrack.test', 'Commercial1234!')}
              sx={{ cursor: 'pointer', borderRadius: 1, '&:hover': { bgcolor: 'action.selected' } }}
            >
              <ListItemText 
                primary="Commercial (COMMERCIAL)" 
                secondary="commercial1@salestrack.test / Commercial1234!" 
              />
            </ListItem>
          </List>
        </Box>
      </Paper>
    </Container>
  );
}
