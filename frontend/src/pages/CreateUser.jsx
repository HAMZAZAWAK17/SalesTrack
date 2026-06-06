import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../contexts/AuthContext';
import * as api from '../services/api';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Grid,
  CircularProgress,
  Snackbar,
  Card,
  CardContent,
} from '@mui/material';
import PersonAddOutlinedIcon from '@mui/icons-material/PersonAddOutlined';
import LogoutIcon from '@mui/icons-material/Logout';

// Zod schema for validation
const userFormSchema = z.object({
  role: z.enum(['ADMIN', 'MANAGER', 'COMMERCIAL'], {
    errorMap: () => ({ message: 'Le rôle est obligatoire.' }),
  }),
  lastName: z.string().min(1, 'Le nom est obligatoire.'),
  firstName: z.string().min(1, 'Le prénom est obligatoire.'),
  email: z.string().min(1, 'L\'email est obligatoire.').email('Format d\'email invalide.'),
  phone: z.string().min(1, 'Le téléphone est obligatoire.'),
  password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères.'),
  equipe: z.string().optional().nullable(),
  managerId: z.any().optional().nullable(),
}).superRefine((data, ctx) => {
  // Team (equipe) is required for MANAGER and COMMERCIAL roles
  if (data.role === 'MANAGER' || data.role === 'COMMERCIAL') {
    if (!data.equipe || data.equipe.trim() === '') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'L\'équipe est obligatoire pour les managers et les commerciaux.',
        path: ['equipe'],
      });
    }
  }
  // Manager dropdown is required ONLY for COMMERCIAL role
  if (data.role === 'COMMERCIAL') {
    if (!data.managerId || data.managerId === '') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Le manager est obligatoire pour un commercial.',
        path: ['managerId'],
      });
    }
  }
});

export default function CreateUser() {
  const { token, logoutUser, user: currentUser } = useAuth();
  
  // State for available managers
  const [managers, setManagers] = useState([]);
  const [loadingManagers, setLoadingManagers] = useState(false);
  
  // Form submission status
  const [submitError, setSubmitError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [loadingSubmit, setLoadingSubmit] = useState(false);

  // Initialize React Hook Form
  const {
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      role: '',
      lastName: '',
      firstName: '',
      email: '',
      phone: '',
      password: '',
      equipe: '',
      managerId: '',
    },
  });

  // Watch the role field to conditionally show the rest of the form
  const selectedRole = watch('role');

  // Load managers when COMMERCIAL role is selected or on mount
  useEffect(() => {
    async function loadManagers() {
      setLoadingManagers(true);
      try {
        const response = await api.getManagers(token);
        if (response.success) {
          setManagers(response.data);
        }
      } catch (err) {
        console.error('Failed to load managers:', err);
      } finally {
        setLoadingManagers(false);
      }
    }

    if (token) {
      loadManagers();
    }
  }, [token]);

  // Form submission handler
  const onSubmit = async (data) => {
    setSubmitError('');
    setFieldErrors({});
    setSubmitSuccess(false);
    setLoadingSubmit(true);

    try {
      // Prepare request payload
      const payload = {
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        password: data.password,
        role: data.role,
        equipe: (data.role === 'MANAGER' || data.role === 'COMMERCIAL') ? data.equipe : null,
        managerId: data.role === 'COMMERCIAL' ? Number(data.managerId) : null,
      };

      const response = await api.createUser(payload, token);
      if (response.success) {
        setSubmitSuccess(true);
        // Reset form to default blank values
        reset({
          role: '',
          lastName: '',
          firstName: '',
          email: '',
          phone: '',
          password: '',
          equipe: '',
          managerId: '',
        });
      }
    } catch (error) {
      console.error('Creation error:', error);
      if (error.errors) {
        setFieldErrors(error.errors);
      }
      setSubmitError(error.message || 'Une erreur est survenue lors de la création.');
    } finally {
      setLoadingSubmit(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      {/* Header bar */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
            SalesTrack Admin
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Connecté en tant que: {currentUser?.firstName} ({currentUser?.role})
          </Typography>
        </Box>
        <Button
          variant="outlined"
          color="error"
          startIcon={<LogoutIcon />}
          onClick={logoutUser}
          sx={{ borderRadius: 2, height: 48, textTransform: 'none' }}
        >
          Se déconnecter
        </Button>
      </Box>

      <Paper
        elevation={4}
        sx={{
          p: { xs: 3, md: 5 },
          borderRadius: 3,
          boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <PersonAddOutlinedIcon color="primary" sx={{ fontSize: 32, mr: 2 }} />
          <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
            Création d'un nouvel utilisateur
          </Typography>
        </Box>

        {submitError && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
            {submitError}
            {Object.keys(fieldErrors).length > 0 && (
              <Box sx={{ mt: 1, pl: 2 }}>
                <ul>
                  {Object.entries(fieldErrors).map(([key, val]) => (
                    <li key={key}>{val}</li>
                  ))}
                </ul>
              </Box>
            )}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
          <Grid container spacing={3}>
            {/* Step 1: Role Selection */}
            <Grid item xs={12}>
              <FormControl fullWidth error={!!errors.role}>
                <InputLabel id="role-select-label">Rôle de l'utilisateur</InputLabel>
                <Controller
                  name="role"
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      labelId="role-select-label"
                      id="role-select"
                      label="Rôle de l'utilisateur"
                      sx={{ height: 56, borderRadius: 2 }}
                    >
                      <MenuItem value="ADMIN">ADMIN (Administrateur)</MenuItem>
                      <MenuItem value="MANAGER">MANAGER (Gestionnaire)</MenuItem>
                      <MenuItem value="COMMERCIAL">COMMERCIAL (Agent de terrain)</MenuItem>
                    </Select>
                  )}
                />
                <FormHelperText>{errors.role?.message}</FormHelperText>
              </FormControl>
            </Grid>

            {/* Dynamic Rendering: Show remaining form fields only after Role is selected */}
            {selectedRole && (
              <>
                {/* Section title */}
                <Grid item xs={12}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold', borderBottom: '1px solid #e0e0e0', pb: 1, mt: 1 }}>
                    Informations du rôle {selectedRole}
                  </Typography>
                </Grid>

                {/* Nom */}
                <Grid item xs={12} sm={6}>
                  <Controller
                    name="lastName"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        required
                        fullWidth
                        id="lastName"
                        label="Nom"
                        error={!!errors.lastName}
                        helperText={errors.lastName?.message}
                        InputProps={{ sx: { borderRadius: 2 } }}
                      />
                    )}
                  />
                </Grid>

                {/* Prénom */}
                <Grid item xs={12} sm={6}>
                  <Controller
                    name="firstName"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        required
                        fullWidth
                        id="firstName"
                        label="Prénom"
                        error={!!errors.firstName}
                        helperText={errors.firstName?.message}
                        InputProps={{ sx: { borderRadius: 2 } }}
                      />
                    )}
                  />
                </Grid>

                {/* Email */}
                <Grid item xs={12} sm={6}>
                  <Controller
                    name="email"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        required
                        fullWidth
                        id="email"
                        label="Adresse Email"
                        type="email"
                        error={!!errors.email}
                        helperText={errors.email?.message}
                        InputProps={{ sx: { borderRadius: 2 } }}
                      />
                    )}
                  />
                </Grid>

                {/* Téléphone */}
                <Grid item xs={12} sm={6}>
                  <Controller
                    name="phone"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        required
                        fullWidth
                        id="phone"
                        label="Téléphone"
                        placeholder="+33612345678"
                        error={!!errors.phone}
                        helperText={errors.phone?.message}
                        InputProps={{ sx: { borderRadius: 2 } }}
                      />
                    )}
                  />
                </Grid>

                {/* Team (equipe) - Shown ONLY for MANAGER and COMMERCIAL */}
                {(selectedRole === 'MANAGER' || selectedRole === 'COMMERCIAL') && (
                  <Grid item xs={12} sm={selectedRole === 'COMMERCIAL' ? 6 : 12}>
                    <Controller
                      name="equipe"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          required
                          fullWidth
                          id="equipe"
                          label="Nom de l'équipe"
                          placeholder="ex: Équipe Nord"
                          error={!!errors.equipe}
                          helperText={errors.equipe?.message}
                          InputProps={{ sx: { borderRadius: 2 } }}
                        />
                      )}
                    />
                  </Grid>
                )}

                {/* Manager dropdown - Shown ONLY for COMMERCIAL */}
                {selectedRole === 'COMMERCIAL' && (
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth error={!!errors.managerId}>
                      <InputLabel id="manager-select-label">Manager rattaché</InputLabel>
                      <Controller
                        name="managerId"
                        control={control}
                        render={({ field }) => (
                          <Select
                            {...field}
                            labelId="manager-select-label"
                            id="manager-select"
                            label="Manager rattaché"
                            sx={{ height: 56, borderRadius: 2 }}
                            disabled={loadingManagers}
                          >
                            {loadingManagers ? (
                              <MenuItem disabled value="">
                                <CircularProgress size={20} sx={{ mr: 1 }} /> Chargement des managers...
                              </MenuItem>
                            ) : managers.length === 0 ? (
                              <MenuItem disabled value="">
                                Aucun manager disponible
                              </MenuItem>
                            ) : (
                              managers.map((m) => (
                                <MenuItem key={m.id} value={m.id}>
                                  {m.firstName} {m.lastName} ({m.email})
                                </MenuItem>
                              ))
                            )}
                          </Select>
                        )}
                      />
                      <FormHelperText>{errors.managerId?.message}</FormHelperText>
                    </FormControl>
                  </Grid>
                )}

                {/* Mot de passe */}
                <Grid item xs={12}>
                  <Controller
                    name="password"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        required
                        fullWidth
                        name="password"
                        label="Mot de passe"
                        type="password"
                        id="password"
                        error={!!errors.password}
                        helperText={errors.password?.message}
                        InputProps={{ sx: { borderRadius: 2 } }}
                      />
                    )}
                  />
                </Grid>

                {/* Submit button */}
                <Grid item xs={12} sx={{ mt: 2 }}>
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    disabled={loadingSubmit}
                    sx={{
                      height: 50,
                      borderRadius: 2,
                      fontSize: '1rem',
                      fontWeight: 'bold',
                      textTransform: 'none',
                      boxShadow: '0 4px 14px 0 rgba(0, 118, 255, 0.4)',
                    }}
                  >
                    {loadingSubmit ? <CircularProgress size={24} color="inherit" /> : `Créer l'utilisateur ${selectedRole}`}
                  </Button>
                </Grid>
              </>
            )}
          </Grid>
        </Box>
      </Paper>

      {/* Success alert snackbar */}
      <Snackbar
        open={submitSuccess}
        autoHideDuration={6000}
        onClose={() => setSubmitSuccess(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setSubmitSuccess(false)} severity="success" sx={{ width: '100%', borderRadius: 2, boxShadow: 3 }}>
          L'utilisateur a été créé avec succès !
        </Alert>
      </Snackbar>
    </Container>
  );
}
