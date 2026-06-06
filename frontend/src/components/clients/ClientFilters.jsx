import {
  Card,
  CardContent,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  InputAdornment
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import { useAuth } from '../../contexts/AuthContext';

export default function ClientFilters({
  nameSearch,
  setNameSearch,
  codeSearch,
  setCodeSearch,
  cityFilter,
  setCityFilter,
  channelFilter,
  setChannelFilter,
  categoryFilter,
  setCategoryFilter,
  statusFilter,
  setStatusFilter,
  commercialFilter,
  setCommercialFilter,
  cities = [],
  commercials = [],
  onClear
}) {
  const { user, theme } = useAuth();
  const showCommercialFilter = user?.role === 'ADMIN' || user?.role === 'MANAGER';

  return (
    <Card
      elevation={2}
      sx={{
        borderRadius: 3,
        border: theme === 'dark' ? '1px solid rgba(255, 255, 255, 0.06)' : '1px solid rgba(0, 0, 0, 0.06)',
        bgcolor: theme === 'dark' ? 'rgba(30, 41, 59, 0.45)' : '#ffffff',
        backdropFilter: 'blur(12px)',
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Grid container spacing={2.5} alignItems="flex-end">
          
          {/* Search by Name */}
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              size="small"
              label="Rechercher par nom"
              value={nameSearch}
              onChange={(e) => setNameSearch(e.target.value)}
              placeholder="Ex: Café de la Gare"
              InputProps={{
                sx: { borderRadius: 2.5 },
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" color="action" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          {/* Search by Code */}
          <Grid item xs={12} sm={6} md={2}>
            <TextField
              fullWidth
              size="small"
              label="Code client"
              value={codeSearch}
              onChange={(e) => setCodeSearch(e.target.value)}
              placeholder="Ex: CL001"
              InputProps={{
                sx: { borderRadius: 2.5 },
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" color="action" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          {/* Filter by City */}
          <Grid item xs={12} sm={4} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel id="city-filter-label">Ville</InputLabel>
              <Select
                labelId="city-filter-label"
                label="Ville"
                value={cityFilter}
                onChange={(e) => setCityFilter(e.target.value)}
                sx={{ borderRadius: 2.5 }}
              >
                <MenuItem value="">
                  <em>Toutes</em>
                </MenuItem>
                {cities.map((city) => (
                  <MenuItem key={city} value={city}>
                    {city}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Filter by Category */}
          <Grid item xs={12} sm={4} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel id="category-filter-label">Catégorie</InputLabel>
              <Select
                labelId="category-filter-label"
                label="Catégorie"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                sx={{ borderRadius: 2.5 }}
              >
                <MenuItem value="">
                  <em>Toutes</em>
                </MenuItem>
                <MenuItem value="HOTEL">Hôtel</MenuItem>
                <MenuItem value="RESTAURANT">Restaurant</MenuItem>
                <MenuItem value="CAFE">Café</MenuItem>
                <MenuItem value="GROCERY">Épicerie</MenuItem>
                <MenuItem value="SUPERMARKET">Supermarché</MenuItem>
                <MenuItem value="TRADITIONAL">Traditionnel</MenuItem>
                <MenuItem value="OTHER">Autre</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Filter by Channel */}
          <Grid item xs={12} sm={4} md={1.5}>
            <FormControl fullWidth size="small">
              <InputLabel id="channel-filter-label">Canal</InputLabel>
              <Select
                labelId="channel-filter-label"
                label="Canal"
                value={channelFilter}
                onChange={(e) => setChannelFilter(e.target.value)}
                sx={{ borderRadius: 2.5 }}
              >
                <MenuItem value="">
                  <em>Tous</em>
                </MenuItem>
                <MenuItem value="ON_TRADE">On Trade</MenuItem>
                <MenuItem value="OFF_TRADE">Off Trade</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Filter by Status */}
          <Grid item xs={12} sm={4} md={1.5}>
            <FormControl fullWidth size="small">
              <InputLabel id="status-filter-label">Statut</InputLabel>
              <Select
                labelId="status-filter-label"
                label="Statut"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                sx={{ borderRadius: 2.5 }}
              >
                <MenuItem value="">
                  <em>Tous</em>
                </MenuItem>
                <MenuItem value="ACTIVE">Actif</MenuItem>
                <MenuItem value="INACTIVE">Inactif</MenuItem>
                <MenuItem value="PROSPECT">Prospect</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Filter by Commercial (Only visible to ADMIN & MANAGER) */}
          {showCommercialFilter && (
            <Grid item xs={12} sm={8} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel id="commercial-filter-label">Commercial</InputLabel>
                <Select
                  labelId="commercial-filter-label"
                  label="Commercial"
                  value={commercialFilter}
                  onChange={(e) => setCommercialFilter(e.target.value)}
                  sx={{ borderRadius: 2.5 }}
                >
                  <MenuItem value="">
                    <em>Tous les commerciaux</em>
                  </MenuItem>
                  {commercials.map((comm) => (
                    <MenuItem key={comm.id} value={comm.id}>
                      {comm.firstName} {comm.lastName} ({comm.email})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          )}

          {/* Reset Filters Button */}
          <Grid item xs={12} sm={4} md={showCommercialFilter ? 9 : 12} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="outlined"
              color="inherit"
              startIcon={<ClearIcon />}
              onClick={onClear}
              sx={{
                borderRadius: 2.5,
                height: 40,
                textTransform: 'none',
                fontWeight: 'bold',
                px: 3,
                borderColor: theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.12)',
                '&:hover': {
                  bgcolor: theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)'
                }
              }}
            >
              Réinitialiser
            </Button>
          </Grid>

        </Grid>
      </CardContent>
    </Card>
  );
}
