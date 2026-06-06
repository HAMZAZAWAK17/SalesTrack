import { useState } from 'react';
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
  InputAdornment,
  Collapse,
  Badge,
  Box
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import FilterListIcon from '@mui/icons-material/FilterList';
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
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Count active advanced filters
  const activeAdvancedCount = [
    cityFilter,
    channelFilter,
    categoryFilter,
    statusFilter,
    showCommercialFilter ? commercialFilter : null
  ].filter(Boolean).length;

  return (
    <Card
      elevation={2}
      sx={{
        borderRadius: 4,
        border: theme === 'dark' ? '1px solid rgba(255, 255, 255, 0.06)' : '1px solid rgba(0, 0, 0, 0.06)',
        bgcolor: theme === 'dark' ? 'rgba(17, 24, 39, 0.45)' : '#ffffff',
        backdropFilter: 'blur(16px)',
        boxShadow: theme === 'dark' ? '0 10px 30px -10px rgba(0,0,0,0.5)' : '0 10px 30px -10px rgba(0,0,0,0.05)',
      }}
    >
      <CardContent sx={{ p: { xs: 2, md: 3 }, '&:last-child': { pb: { xs: 2, md: 3 } } }}>
        <Grid container spacing={2} alignItems="center">
          
          {/* Search by Name */}
          <Grid item xs={12} sm={6} md={showCommercialFilter ? 5 : 6}>
            <TextField
              fullWidth
              label="Rechercher par nom"
              value={nameSearch}
              onChange={(e) => setNameSearch(e.target.value)}
              placeholder="Ex: Café de la Gare"
              InputProps={{
                sx: { 
                  borderRadius: 3,
                  height: 48,
                  fontSize: 14,
                },
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" color="action" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          {/* Search by Code */}
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="Code client"
              value={codeSearch}
              onChange={(e) => setCodeSearch(e.target.value)}
              placeholder="Ex: CL001"
              InputProps={{
                sx: { 
                  borderRadius: 3,
                  height: 48,
                  fontSize: 14,
                },
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" color="action" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          {/* Buttons Container */}
          <Grid item xs={12} md={showCommercialFilter ? 4 : 3}>
            <Box sx={{ display: 'flex', gap: 1.5, width: '100%', justifyContent: 'flex-end' }}>
              {/* Toggle Advanced Filters Button */}
              <Button
                variant={showAdvanced ? "contained" : "outlined"}
                color={showAdvanced ? "primary" : "inherit"}
                onClick={() => setShowAdvanced(!showAdvanced)}
                startIcon={
                  <Badge 
                    badgeContent={activeAdvancedCount} 
                    color="secondary" 
                    sx={{ 
                      '& .MuiBadge-badge': { 
                        right: -3, 
                        top: 3,
                        fontWeight: 'bold',
                        fontSize: 10
                      } 
                    }}
                  >
                    <FilterListIcon fontSize="small" />
                  </Badge>
                }
                sx={{
                  flex: 1,
                  minHeight: 48,
                  borderRadius: 3,
                  textTransform: 'none',
                  fontWeight: 'extrabold',
                  fontSize: 14,
                  borderColor: theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.12)',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    bgcolor: showAdvanced ? 'primary.main' : (theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)')
                  }
                }}
              >
                Filtres
              </Button>

              {/* Reset Filters Button */}
              <Button
                variant="outlined"
                color="error"
                disabled={!nameSearch && !codeSearch && activeAdvancedCount === 0}
                startIcon={<ClearIcon fontSize="small" />}
                onClick={onClear}
                sx={{
                  minHeight: 48,
                  borderRadius: 3,
                  textTransform: 'none',
                  fontWeight: 'extrabold',
                  fontSize: 14,
                  px: 2,
                  borderColor: theme === 'dark' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(239, 68, 68, 0.25)',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    bgcolor: theme === 'dark' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.05)',
                  },
                  '&:disabled': {
                    borderColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.08)',
                    color: theme === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.3)'
                  }
                }}
              >
                Effacer
              </Button>
            </Box>
          </Grid>

          {/* Collapsible Advanced Filters Section */}
          <Grid item xs={12} sx={{ mt: 0, pt: '0px !important' }}>
            <Collapse in={showAdvanced} timeout="auto" unmountOnExit>
              <Box sx={{ pt: 2.5, borderTop: theme === 'dark' ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.06)', mt: 1 }}>
                <Grid container spacing={2}>
                  
                  {/* Filter by City */}
                  <Grid item xs={12} sm={6} md={showCommercialFilter ? 2 : 3}>
                    <FormControl fullWidth>
                      <InputLabel id="city-filter-label" sx={{ fontSize: 14 }}>Ville</InputLabel>
                      <Select
                        labelId="city-filter-label"
                        label="Ville"
                        value={cityFilter}
                        onChange={(e) => setCityFilter(e.target.value)}
                        sx={{ 
                          borderRadius: 3,
                          height: 48,
                          fontSize: 14
                        }}
                      >
                        <MenuItem value="">
                          <span style={{ fontStyle: 'italic', opacity: 0.7 }}>Toutes</span>
                        </MenuItem>
                        {cities.map((city) => (
                          <MenuItem key={city} value={city} sx={{ fontSize: 14 }}>
                            {city}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  {/* Filter by Category */}
                  <Grid item xs={12} sm={6} md={showCommercialFilter ? 3 : 3}>
                    <FormControl fullWidth>
                      <InputLabel id="category-filter-label" sx={{ fontSize: 14 }}>Catégorie</InputLabel>
                      <Select
                        labelId="category-filter-label"
                        label="Catégorie"
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        sx={{ 
                          borderRadius: 3,
                          height: 48,
                          fontSize: 14
                        }}
                      >
                        <MenuItem value="">
                          <span style={{ fontStyle: 'italic', opacity: 0.7 }}>Toutes</span>
                        </MenuItem>
                        <MenuItem value="HOTEL" sx={{ fontSize: 14 }}>Hôtel</MenuItem>
                        <MenuItem value="RESTAURANT" sx={{ fontSize: 14 }}>Restaurant</MenuItem>
                        <MenuItem value="CAFE" sx={{ fontSize: 14 }}>Café</MenuItem>
                        <MenuItem value="GROCERY" sx={{ fontSize: 14 }}>Épicerie</MenuItem>
                        <MenuItem value="SUPERMARKET" sx={{ fontSize: 14 }}>Supermarché</MenuItem>
                        <MenuItem value="TRADITIONAL" sx={{ fontSize: 14 }}>Traditionnel</MenuItem>
                        <MenuItem value="OTHER" sx={{ fontSize: 14 }}>Autre</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  {/* Filter by Channel */}
                  <Grid item xs={12} sm={6} md={showCommercialFilter ? 2 : 3}>
                    <FormControl fullWidth>
                      <InputLabel id="channel-filter-label" sx={{ fontSize: 14 }}>Canal</InputLabel>
                      <Select
                        labelId="channel-filter-label"
                        label="Canal"
                        value={channelFilter}
                        onChange={(e) => setChannelFilter(e.target.value)}
                        sx={{ 
                          borderRadius: 3,
                          height: 48,
                          fontSize: 14
                        }}
                      >
                        <MenuItem value="">
                          <span style={{ fontStyle: 'italic', opacity: 0.7 }}>Tous</span>
                        </MenuItem>
                        <MenuItem value="ON_TRADE" sx={{ fontSize: 14 }}>On Trade (CHR)</MenuItem>
                        <MenuItem value="OFF_TRADE" sx={{ fontSize: 14 }}>Off Trade (GMS/Trad)</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  {/* Filter by Status */}
                  <Grid item xs={12} sm={6} md={showCommercialFilter ? 2 : 3}>
                    <FormControl fullWidth>
                      <InputLabel id="status-filter-label" sx={{ fontSize: 14 }}>Statut</InputLabel>
                      <Select
                        labelId="status-filter-label"
                        label="Statut"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        sx={{ 
                          borderRadius: 3,
                          height: 48,
                          fontSize: 14
                        }}
                      >
                        <MenuItem value="">
                          <span style={{ fontStyle: 'italic', opacity: 0.7 }}>Tous</span>
                        </MenuItem>
                        <MenuItem value="ACTIVE" sx={{ fontSize: 14 }}>Actif</MenuItem>
                        <MenuItem value="INACTIVE" sx={{ fontSize: 14 }}>Inactif</MenuItem>
                        <MenuItem value="PROSPECT" sx={{ fontSize: 14 }}>Prospect</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  {/* Filter by Commercial (Only visible to ADMIN & MANAGER) */}
                  {showCommercialFilter && (
                    <Grid item xs={12} sm={12} md={3}>
                      <FormControl fullWidth>
                        <InputLabel id="commercial-filter-label" sx={{ fontSize: 14 }}>Commercial</InputLabel>
                        <Select
                          labelId="commercial-filter-label"
                          label="Commercial"
                          value={commercialFilter}
                          onChange={(e) => setCommercialFilter(e.target.value)}
                          sx={{ 
                            borderRadius: 3,
                            height: 48,
                            fontSize: 14
                          }}
                        >
                          <MenuItem value="">
                            <span style={{ fontStyle: 'italic', opacity: 0.7 }}>Tous les commerciaux</span>
                          </MenuItem>
                          {commercials.map((comm) => (
                            <MenuItem key={comm.id} value={comm.id} sx={{ fontSize: 14 }}>
                              {comm.firstName} {comm.lastName}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                  )}

                </Grid>
              </Box>
            </Collapse>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}
