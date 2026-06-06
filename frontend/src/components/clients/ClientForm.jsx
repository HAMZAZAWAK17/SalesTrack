import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import {
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Grid,
  Box,
  CircularProgress
} from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';

export default function ClientForm({
  defaultValues,
  onSubmit,
  isEdit = false,
  loading = false,
  commercials = []
}) {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  // React Hook Form initialization
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    control,
    formState: { errors }
  } = useForm({
    defaultValues: {
      code: '',
      companyName: '',
      phone: '',
      email: '',
      address: '',
      city: '',
      distributionChannel: 'ON_TRADE',
      category: 'OTHER',
      status: 'PROSPECT',
      assignedTo: '',
      notes: '',
      ...defaultValues
    }
  });

  // Reset form default values when they change
  useEffect(() => {
    if (defaultValues) {
      reset(defaultValues);
    }
  }, [defaultValues, reset]);

  const onFormSubmit = (data) => {
    onSubmit(data);
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onFormSubmit)} noValidate sx={{ mt: 1 }}>
      <Grid container spacing={3}>
        
        {/* Code Client */}
        <Grid item xs={12} sm={4}>
          <TextField
            required
            fullWidth
            id="code"
            label="Code client"
            disabled={isEdit && !isAdmin} // Only admin can change code in edit mode
            error={!!errors.code}
            helperText={errors.code?.message}
            InputProps={{ sx: { borderRadius: 2.5 } }}
            {...register('code', { required: "Le code client est obligatoire." })}
          />
        </Grid>

        {/* Nom Client / Nom de l'entreprise */}
        <Grid item xs={12} sm={8}>
          <TextField
            required
            fullWidth
            id="companyName"
            label="Nom de l'entreprise / Client"
            error={!!errors.companyName}
            helperText={errors.companyName?.message}
            InputProps={{ sx: { borderRadius: 2.5 } }}
            {...register('companyName', { required: "Le nom est obligatoire." })}
          />
        </Grid>

        {/* Téléphone */}
        <Grid item xs={12} sm={6}>
          <TextField
            required
            fullWidth
            id="phone"
            label="Téléphone"
            placeholder="Ex: 0142345678"
            error={!!errors.phone}
            helperText={errors.phone?.message}
            InputProps={{ sx: { borderRadius: 2.5 } }}
            {...register('phone', { required: "Le numéro de téléphone est obligatoire." })}
          />
        </Grid>

        {/* Email */}
        <Grid item xs={12} sm={6}>
          <TextField
            required
            fullWidth
            id="email"
            label="Adresse Email"
            type="email"
            placeholder="Ex: contact@entreprise.com"
            error={!!errors.email}
            helperText={errors.email?.message}
            InputProps={{ sx: { borderRadius: 2.5 } }}
            {...register('email', {
              required: "L'email est obligatoire.",
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: "Format d'email invalide."
              }
            })}
          />
        </Grid>

        {/* Adresse */}
        <Grid item xs={12} sm={8}>
          <TextField
            required
            fullWidth
            id="address"
            label="Adresse"
            placeholder="Ex: 12 Rue de la Paix"
            error={!!errors.address}
            helperText={errors.address?.message}
            InputProps={{ sx: { borderRadius: 2.5 } }}
            {...register('address', { required: "L'adresse est obligatoire." })}
          />
        </Grid>

        {/* Ville */}
        <Grid item xs={12} sm={4}>
          <TextField
            required
            fullWidth
            id="city"
            label="Ville"
            placeholder="Ex: Paris"
            error={!!errors.city}
            helperText={errors.city?.message}
            InputProps={{ sx: { borderRadius: 2.5 } }}
            {...register('city', { required: "La ville est obligatoire." })}
          />
        </Grid>

        {/* Canal de Distribution */}
        <Grid item xs={12} sm={4}>
          <FormControl fullWidth error={!!errors.distributionChannel}>
            <InputLabel id="channel-label">Canal de Distribution *</InputLabel>
            <Controller
              name="distributionChannel"
              control={control}
              rules={{ required: "Le canal est obligatoire." }}
              render={({ field }) => (
                <Select
                  {...field}
                  labelId="channel-label"
                  label="Canal de Distribution *"
                  sx={{ borderRadius: 2.5 }}
                >
                  <MenuItem value="ON_TRADE">On Trade (CHR, Consommation sur place)</MenuItem>
                  <MenuItem value="OFF_TRADE">Off Trade (Supermarchés, A emporter)</MenuItem>
                </Select>
              )}
            />
            {errors.distributionChannel && <FormHelperText>{errors.distributionChannel.message}</FormHelperText>}
          </FormControl>
        </Grid>

        {/* Catégorie */}
        <Grid item xs={12} sm={4}>
          <FormControl fullWidth error={!!errors.category}>
            <InputLabel id="category-label">Catégorie *</InputLabel>
            <Controller
              name="category"
              control={control}
              rules={{ required: "La catégorie est obligatoire." }}
              render={({ field }) => (
                <Select
                  {...field}
                  labelId="category-label"
                  label="Catégorie *"
                  sx={{ borderRadius: 2.5 }}
                >
                  <MenuItem value="HOTEL">Hôtel</MenuItem>
                  <MenuItem value="RESTAURANT">Restaurant</MenuItem>
                  <MenuItem value="CAFE">Café</MenuItem>
                  <MenuItem value="GROCERY">Épicerie</MenuItem>
                  <MenuItem value="SUPERMARKET">Supermarché / GMS</MenuItem>
                  <MenuItem value="TRADITIONAL">Traditionnel</MenuItem>
                  <MenuItem value="OTHER">Autre</MenuItem>
                </Select>
              )}
            />
            {errors.category && <FormHelperText>{errors.category.message}</FormHelperText>}
          </FormControl>
        </Grid>

        {/* Statut */}
        <Grid item xs={12} sm={4}>
          <FormControl fullWidth error={!!errors.status}>
            <InputLabel id="status-label">Statut *</InputLabel>
            <Controller
              name="status"
              control={control}
              rules={{ required: "Le statut est obligatoire." }}
              render={({ field }) => (
                <Select
                  {...field}
                  labelId="status-label"
                  label="Statut *"
                  sx={{ borderRadius: 2.5 }}
                >
                  <MenuItem value="ACTIVE">Actif</MenuItem>
                  <MenuItem value="INACTIVE">Inactif</MenuItem>
                  <MenuItem value="PROSPECT">Prospect</MenuItem>
                </Select>
              )}
            />
            {errors.status && <FormHelperText>{errors.status.message}</FormHelperText>}
          </FormControl>
        </Grid>

        {/* Commercial Affecté */}
        <Grid item xs={12}>
          <FormControl fullWidth error={!!errors.assignedTo}>
            <InputLabel id="assigned-label">Commercial affecté *</InputLabel>
            <Controller
              name="assignedTo"
              control={control}
              rules={{ required: "L'affectation à un commercial est obligatoire." }}
              render={({ field }) => (
                <Select
                  {...field}
                  labelId="assigned-label"
                  label="Commercial affecté *"
                  disabled={isEdit && !isAdmin} // Only admin can change assigned commercial in edit mode
                  sx={{ borderRadius: 2.5 }}
                >
                  <MenuItem value="">
                    <em>Sélectionner un commercial</em>
                  </MenuItem>
                  {commercials.map((comm) => (
                    <MenuItem key={comm.id} value={comm.id}>
                      {comm.firstName} {comm.lastName} ({comm.email})
                    </MenuItem>
                  ))}
                </Select>
              )}
            />
            {errors.assignedTo && <FormHelperText>{errors.assignedTo.message}</FormHelperText>}
          </FormControl>
        </Grid>

        {/* Notes */}
        <Grid item xs={12}>
          <TextField
            fullWidth
            multiline
            rows={4}
            id="notes"
            label="Notes internes / Commentaires"
            placeholder="Saisissez des notes ou remarques particulières concernant ce client..."
            InputProps={{ sx: { borderRadius: 2.5 } }}
            {...register('notes')}
          />
        </Grid>

        {/* Form Actions */}
        <Grid item xs={12} sx={{ mt: 2 }}>
          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={loading}
            sx={{
              height: 48,
              borderRadius: 2.5,
              fontWeight: 'extrabold',
              textTransform: 'none',
              fontSize: '0.95rem'
            }}
          >
            {loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : isEdit ? (
              "Enregistrer les modifications"
            ) : (
              "Créer le compte client"
            )}
          </Button>
        </Grid>

      </Grid>
    </Box>
  );
}
