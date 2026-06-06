import { Grid, TextField, MenuItem, Button, Box, Paper } from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';

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

const VISIT_STATUSES = [
  { value: 'ORDER_PLACED', label: 'Commande passée' },
  { value: 'NO_ORDER', label: 'Pas de commande' },
];

export default function VisitFilters({
  clientId,
  setClientId,
  userId,
  setUserId,
  subject,
  setSubject,
  status,
  setStatus,
  date,
  setDate,
  clients = [],
  commercials = [],
  onClear
}) {
  const { user, theme } = useAuth();
  const isAdminOrManager = user?.role === 'ADMIN' || user?.role === 'MANAGER';

  return (
    <Paper
      className={`p-5 rounded-2xl border shadow-lg ${
        theme === 'dark' ? 'glass-panel border-slate-800 bg-slate-900/10' : 'bg-white border-slate-200'
      }`}
    >
      <Grid container spacing={2}>
        {/* Client filter */}
        <Grid item xs={12} sm={6} md={2.4}>
          <TextField
            select
            fullWidth
            size="small"
            label="Client"
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2.5 } }}
          >
            <MenuItem value="">Tous les clients</MenuItem>
            {clients.map((c) => (
              <MenuItem key={c.id} value={c.id}>
                {c.companyName} ({c.city})
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        {/* Commercial/User filter (Admin/Manager only) */}
        {isAdminOrManager && (
          <Grid item xs={12} sm={6} md={2.4}>
            <TextField
              select
              fullWidth
              size="small"
              label="Commercial"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2.5 } }}
            >
              <MenuItem value="">Tous les commerciaux</MenuItem>
              {commercials.map((comm) => (
                <MenuItem key={comm.id} value={comm.id}>
                  {comm.firstName} {comm.lastName}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
        )}

        {/* Visit Subject filter */}
        <Grid item xs={12} sm={6} md={2.4}>
          <TextField
            select
            fullWidth
            size="small"
            label="Objet de visite"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2.5 } }}
          >
            <MenuItem value="">Tous les objets</MenuItem>
            {VISIT_SUBJECTS.map((s) => (
              <MenuItem key={s.value} value={s.value}>
                {s.label}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        {/* Status filter */}
        <Grid item xs={12} sm={6} md={2.4}>
          <TextField
            select
            fullWidth
            size="small"
            label="Statut"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2.5 } }}
          >
            <MenuItem value="">Tous les statuts</MenuItem>
            {VISIT_STATUSES.map((st) => (
              <MenuItem key={st.value} value={st.value}>
                {st.label}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        {/* Date filter */}
        <Grid item xs={12} sm={6} md={isAdminOrManager ? 2.4 : 4.8}>
          <TextField
            type="date"
            fullWidth
            size="small"
            label="Date de visite"
            InputLabelProps={{ shrink: true }}
            value={date}
            onChange={(e) => setDate(e.target.value)}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2.5 } }}
          />
        </Grid>

        {/* Clear buttons */}
        <Grid item xs={12} className="flex justify-end mt-1">
          <Button
            onClick={onClear}
            variant="outlined"
            size="medium"
            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 'bold' }}
          >
            Réinitialiser les filtres
          </Button>
        </Grid>
      </Grid>
    </Paper>
  );
}
