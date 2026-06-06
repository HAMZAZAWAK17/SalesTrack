import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Tooltip,
  Typography
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useAuth } from '../../contexts/AuthContext';

export default function ClientTable({ clients = [], onEdit, onDelete, onView }) {
  const { user, theme } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  // Deletion modal state
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);

  const handleDeleteClick = (client) => {
    setSelectedClient(client);
    setOpenDeleteDialog(true);
  };

  const handleDeleteClose = () => {
    setSelectedClient(null);
    setOpenDeleteDialog(false);
  };

  const handleDeleteConfirm = () => {
    if (selectedClient) {
      onDelete(selectedClient.id);
    }
    handleDeleteClose();
  };

  // Render client status badges
  const getStatusChip = (status) => {
    const configs = {
      ACTIVE: { color: 'success', label: 'ACTIF' },
      INACTIVE: { color: 'error', label: 'INACTIF' },
      PROSPECT: { color: 'info', label: 'PROSPECT' }
    };
    const config = configs[status] || { color: 'default', label: status };
    return (
      <Chip
        label={config.label}
        color={config.color}
        size="small"
        variant="outlined"
        sx={{ fontWeight: 'extrabold', px: 1, borderRadius: '8px' }}
      />
    );
  };

  // Translate category values to French labels
  const getCategoryLabel = (category) => {
    const map = {
      HOTEL: 'Hôtel',
      RESTAURANT: 'Restaurant',
      CAFE: 'Café',
      GROCERY: 'Épicerie',
      SUPERMARKET: 'Supermarché',
      TRADITIONAL: 'Traditionnel',
      OTHER: 'Autre'
    };
    return map[category] || category;
  };

  return (
    <>
      <TableContainer
        component={Paper}
        elevation={2}
        sx={{
          borderRadius: 4,
          overflow: 'hidden',
          border: theme === 'dark' ? '1px solid rgba(255, 255, 255, 0.06)' : '1px solid rgba(0, 0, 0, 0.05)',
          bgcolor: theme === 'dark' ? '#111827' : '#ffffff',
          backgroundImage: 'none'
        }}
      >
        <Table sx={{ minWidth: 700 }}>
          <TableHead sx={{ bgcolor: theme === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.015)' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: '800', fontSize: '0.75rem', textTransform: 'uppercase' }}>Code</TableCell>
              <TableCell sx={{ fontWeight: '800', fontSize: '0.75rem', textTransform: 'uppercase' }}>Nom Client</TableCell>
              <TableCell sx={{ fontWeight: '800', fontSize: '0.75rem', textTransform: 'uppercase' }}>Ville</TableCell>
              <TableCell sx={{ fontWeight: '800', fontSize: '0.75rem', textTransform: 'uppercase' }}>Canal</TableCell>
              <TableCell sx={{ fontWeight: '800', fontSize: '0.75rem', textTransform: 'uppercase' }}>Catégorie</TableCell>
              <TableCell sx={{ fontWeight: '800', fontSize: '0.75rem', textTransform: 'uppercase' }}>Commercial affecté</TableCell>
              <TableCell sx={{ fontWeight: '800', fontSize: '0.75rem', textTransform: 'uppercase' }}>Statut</TableCell>
              <TableCell align="right" sx={{ fontWeight: '800', fontSize: '0.75rem', textTransform: 'uppercase', pr: 3 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {clients.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                  Aucun client trouvé.
                </TableCell>
              </TableRow>
            ) : (
              clients.map((client) => (
                <TableRow
                  key={client.id}
                  hover
                  sx={{
                    transition: 'background-color 0.15s ease',
                    '&:last-child td, &:last-child th': { border: 0 }
                  }}
                >
                  <TableCell sx={{ fontWeight: 'bold', color: 'indigo.main' }}>
                    {client.code}
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>
                    {client.companyName}
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'medium' }}>
                    {client.city}
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'medium', fontSize: '0.8rem' }}>
                    {client.distributionChannel === 'ON_TRADE' ? 'On Trade' : 'Off Trade'}
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'medium' }}>
                    {getCategoryLabel(client.category)}
                  </TableCell>
                  <TableCell>
                    {client.commercial ? (
                      <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                        {client.commercial.firstName} {client.commercial.lastName}
                      </Typography>
                    ) : (
                      <Typography variant="body2" color="text.secondary">-</Typography>
                    )}
                  </TableCell>
                  <TableCell>{getStatusChip(client.status)}</TableCell>
                  <TableCell align="right" sx={{ pr: 2 }}>
                    <div style={{ display: 'inline-flex', gap: '4px' }}>
                      <Tooltip title="Consulter">
                        <IconButton
                          color="info"
                          onClick={() => onView(client.id)}
                          size="small"
                          sx={{
                            border: theme === 'dark' ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.06)',
                            borderRadius: '10px'
                          }}
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      
                      <Tooltip title="Modifier">
                        <IconButton
                          color="primary"
                          onClick={() => onEdit(client.id)}
                          size="small"
                          sx={{
                            border: theme === 'dark' ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.06)',
                            borderRadius: '10px'
                          }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      
                      {isAdmin && (
                        <Tooltip title="Supprimer">
                          <IconButton
                            color="error"
                            onClick={() => handleDeleteClick(client)}
                            size="small"
                            sx={{
                              border: theme === 'dark' ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.06)',
                              borderRadius: '10px'
                            }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Delete Confirmation Modal Dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={handleDeleteClose}
        aria-labelledby="delete-client-dialog-title"
        aria-describedby="delete-client-dialog-description"
        PaperProps={{
          sx: {
            borderRadius: 4,
            p: 1.5,
            bgcolor: theme === 'dark' ? '#111827' : '#ffffff',
            backgroundImage: 'none',
            border: theme === 'dark' ? '1px solid rgba(255,255,255,0.08)' : 'none'
          }
        }}
      >
        <DialogTitle id="delete-client-dialog-title" sx={{ fontWeight: 'extrabold', pb: 1 }}>
          Confirmer la suppression
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-client-dialog-description">
            Êtes-vous sûr de vouloir supprimer définitivement le client{' '}
            <strong style={{ color: theme === 'dark' ? '#fff' : '#000' }}>
              {selectedClient?.companyName} ({selectedClient?.code})
            </strong>{' '}
            ? Cette action supprimera définitivement toutes les données associées.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button
            onClick={handleDeleteClose}
            variant="outlined"
            color="inherit"
            sx={{
              borderRadius: 2.5,
              textTransform: 'none',
              fontWeight: 'bold',
              minHeight: 40,
              borderColor: theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.12)'
            }}
          >
            Annuler
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            variant="contained"
            color="error"
            autoFocus
            sx={{
              borderRadius: 2.5,
              textTransform: 'none',
              fontWeight: 'extrabold',
              minHeight: 40
            }}
          >
            Supprimer
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
