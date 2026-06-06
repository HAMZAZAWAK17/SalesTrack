import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useAuth } from '../../contexts/AuthContext';
import { Grid, TextField, MenuItem, Button, Box, FormLabel, FormControlLabel, RadioGroup, Radio, CircularProgress, FormHelperText } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';

const VISIT_SUBJECTS = [
  { value: 'ORDER', label: 'Prise de commande' },
  { value: 'CUSTOMER_FOLLOW_UP', label: 'Suivi client' },
  { value: 'COLLECTION', label: 'Recouvrement' },
  { value: 'BRAND_VISIBILITY', label: 'Visibilité marque' },
  { value: 'PRODUCT_PLACEMENT', label: 'Implantation produit' },
  { value: 'NEGOTIATION', label: 'Négociation' },
  { value: 'DELIVERY', label: 'Livraison' },
  { value: 'RELAUNCH', label: 'Relance' },
  { value: 'OTHER', label: 'Autre' },
];

const NO_ORDER_REASONS = [
  { value: 'STOCK_NOT_SOLD', label: 'Stock non écoulé' },
  { value: 'OVERSTOCK', label: 'Trop de stock' },
  { value: 'LOW_ACTIVITY', label: 'Baisse d\'activité' },
  { value: 'SUPPLIER_CHANGE', label: 'Changement de fournisseur' },
  { value: 'PRICE_TOO_HIGH', label: 'Prix trop élevé' },
  { value: 'CUSTOMER_ABSENT', label: 'Client absent' },
  { value: 'WAITING_FOR_APPROVAL', label: 'Attente validation manager' },
  { value: 'DELIVERY_ISSUE', label: 'Problème lors de la livraison précédente' },
  { value: 'OTHER', label: 'Autre' },
];

export default function VisitForm({
  initialValues,
  onSubmit,
  loading = false,
  clients = [],
  onCancel
}) {
  const { theme } = useAuth();
  
  // React Hook Form setup
  const { control, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    defaultValues: {
      clientId: initialValues?.clientId || '',
      subject: initialValues?.subject || '',
      comment: initialValues?.comment || '',
      status: initialValues?.status || 'NO_ORDER',
      noOrderReason: initialValues?.noOrderReason || '',
      latitude: initialValues?.latitude || '',
      longitude: initialValues?.longitude || ''
    }
  });

  // Watch status to show/hide the conditional field `noOrderReason`
  const watchStatus = watch('status');

  // Clear noOrderReason when status changes to ORDER_PLACED
  useEffect(() => {
    if (watchStatus === 'ORDER_PLACED') {
      setValue('noOrderReason', '');
    }
  }, [watchStatus, setValue]);

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Grid container spacing={3}>
        {/* Client Selection */}
        <Grid item xs={12}>
          <Box className="space-y-1.5">
            <FormLabel className="text-xs font-black uppercase text-slate-500 tracking-wider">Client Visité *</FormLabel>
            <Controller
              name="clientId"
              control={control}
              rules={{ required: "Le client est obligatoire." }}
              render={({ field }) => (
                <TextField
                  {...field}
                  select
                  fullWidth
                  error={!!errors.clientId}
                  helperText={errors.clientId?.message}
                  placeholder="Sélectionnez un client"
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3, minHeight: 48 } }}
                >
                  {clients.map((c) => (
                    <MenuItem key={c.id} value={c.id}>
                      {c.companyName} ({c.code} - {c.city})
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />
          </Box>
        </Grid>

        {/* Visit Subject */}
        <Grid item xs={12}>
          <Box className="space-y-1.5">
            <FormLabel className="text-xs font-black uppercase text-slate-500 tracking-wider">Objet de la Visite *</FormLabel>
            <Controller
              name="subject"
              control={control}
              rules={{ required: "L'objet de visite est obligatoire." }}
              render={({ field }) => (
                <TextField
                  {...field}
                  select
                  fullWidth
                  error={!!errors.subject}
                  helperText={errors.subject?.message}
                  placeholder="Sélectionnez l'objet"
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3, minHeight: 48 } }}
                >
                  {VISIT_SUBJECTS.map((s) => (
                    <MenuItem key={s.value} value={s.value}>
                      {s.label}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />
          </Box>
        </Grid>

        {/* Visit Status (Radio Toggle) */}
        <Grid item xs={12}>
          <Box className="space-y-1.5">
            <FormLabel className="text-xs font-black uppercase text-slate-500 tracking-wider">Statut de la visite *</FormLabel>
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <RadioGroup {...field} row className="gap-6 mt-1.5">
                  <FormControlLabel
                    value="ORDER_PLACED"
                    control={<Radio />}
                    label={<span className="text-sm font-bold text-slate-350">Commande passée</span>}
                  />
                  <FormControlLabel
                    value="NO_ORDER"
                    control={<Radio />}
                    label={<span className="text-sm font-bold text-slate-350">Pas de commande</span>}
                  />
                </RadioGroup>
              )}
            />
          </Box>
        </Grid>

        {/* Conditional Field: Reason of No Order */}
        {watchStatus === 'NO_ORDER' && (
          <Grid item xs={12} className="animate-fade-in">
            <Box className="space-y-1.5">
              <FormLabel className="text-xs font-black uppercase text-slate-500 tracking-wider">Raison de non commande *</FormLabel>
              <Controller
                name="noOrderReason"
                control={control}
                rules={{ required: "La raison de non commande est obligatoire." }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    select
                    fullWidth
                    error={!!errors.noOrderReason}
                    helperText={errors.noOrderReason?.message}
                    placeholder="Pourquoi aucune commande n'a été prise ?"
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3, minHeight: 48 } }}
                  >
                    {NO_ORDER_REASONS.map((r) => (
                      <MenuItem key={r.value} value={r.value}>
                        {r.label}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
            </Box>
          </Grid>
        )}

        {/* Comment field (Facultative) */}
        <Grid item xs={12}>
          <Box className="space-y-1.5">
            <FormLabel className="text-xs font-black uppercase text-slate-500 tracking-wider">Commentaire (Facultatif)</FormLabel>
            <Controller
              name="comment"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  multiline
                  rows={4}
                  placeholder="Saisissez des commentaires de visite si besoin..."
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                />
              )}
            />
          </Box>
        </Grid>

        {/* GPS coordinates (Optional Future Features) */}
        <Grid item xs={6}>
          <Box className="space-y-1.5">
            <FormLabel className="text-xs font-black uppercase text-slate-500 tracking-wider">Latitude</FormLabel>
            <Controller
              name="latitude"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  type="number"
                  inputProps={{ step: "any" }}
                  fullWidth
                  placeholder="Ex: 48.8566"
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3, minHeight: 48 } }}
                />
              )}
            />
          </Box>
        </Grid>

        <Grid item xs={6}>
          <Box className="space-y-1.5">
            <FormLabel className="text-xs font-black uppercase text-slate-500 tracking-wider">Longitude</FormLabel>
            <Controller
              name="longitude"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  type="number"
                  inputProps={{ step: "any" }}
                  fullWidth
                  placeholder="Ex: 2.3522"
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3, minHeight: 48 } }}
                />
              )}
            />
          </Box>
        </Grid>

        {/* Actions buttons (Minimum 48px height, 14px text size) */}
        <Grid item xs={12} className="flex justify-end gap-3 pt-4 border-t border-slate-800/10 mt-2">
          <Button
            variant="outlined"
            onClick={onCancel}
            sx={{
              borderRadius: 2.5,
              minHeight: 48,
              minWidth: 100,
              textTransform: 'none',
              fontWeight: 'bold',
              fontSize: '14px',
            }}
          >
            Annuler
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={18} /> : <SaveIcon />}
            sx={{
              borderRadius: 2.5,
              minHeight: 48,
              minWidth: 160,
              textTransform: 'none',
              fontWeight: 'bold',
              fontSize: '14px',
              boxShadow: '0 4px 14px rgba(99, 102, 241, 0.25)',
            }}
          >
            {loading ? 'Enregistrement...' : 'Enregistrer la visite'}
          </Button>
        </Grid>
      </Grid>
    </form>
  );
}
