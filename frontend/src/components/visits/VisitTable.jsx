import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, Tooltip } from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

const SUBJECT_LABELS = {
  ORDER: 'Prise de commande',
  CUSTOMER_FOLLOW_UP: 'Suivi client',
  COLLECTION: 'Recouvrement',
  BRAND_VISIBILITY: 'Visibilité marque',
  PRODUCT_PLACEMENT: 'Implantation produit',
  NEGOTIATION: 'Négociation',
  DELIVERY: 'Livraison',
  RELAUNCH: 'Relance',
  OTHER: 'Autre',
};

const STATUS_LABELS = {
  ORDER_PLACED: 'Commande passée',
  NO_ORDER: 'Pas de commande',
};

export default function VisitTable({ visits = [], onView, onEdit, onDelete }) {
  const { user, theme } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  // Format Date (e.g., "12 Juin 2026")
  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  // Format Time (e.g., "15:30")
  const formatTime = (dateStr) => {
    return new Date(dateStr).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status) => {
    return status === 'ORDER_PLACED'
      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25'
      : 'bg-red-500/15 text-red-400 border border-red-500/25';
  };

  return (
    <TableContainer
      component={Paper}
      className={`border rounded-2xl shadow-xl overflow-hidden ${
        theme === 'dark' ? 'glass-panel border-slate-800 bg-slate-900/5' : 'bg-white border-slate-200'
      }`}
    >
      <Table className="min-w-full text-sm">
        <TableHead>
          <TableRow className={theme === 'dark' ? 'bg-slate-900/30' : 'bg-slate-50'}>
            <TableCell sx={{ fontWeight: 'extrabold', textTransform: 'uppercase', fontSize: '10px', color: 'text.secondary' }}>Date</TableCell>
            <TableCell sx={{ fontWeight: 'extrabold', textTransform: 'uppercase', fontSize: '10px', color: 'text.secondary' }}>Heure</TableCell>
            <TableCell sx={{ fontWeight: 'extrabold', textTransform: 'uppercase', fontSize: '10px', color: 'text.secondary' }}>Client</TableCell>
            <TableCell sx={{ fontWeight: 'extrabold', textTransform: 'uppercase', fontSize: '10px', color: 'text.secondary' }}>Commercial</TableCell>
            <TableCell sx={{ fontWeight: 'extrabold', textTransform: 'uppercase', fontSize: '10px', color: 'text.secondary' }}>Objet</TableCell>
            <TableCell sx={{ fontWeight: 'extrabold', textTransform: 'uppercase', fontSize: '10px', color: 'text.secondary'} } align="center">Statut</TableCell>
            <TableCell sx={{ fontWeight: 'extrabold', textTransform: 'uppercase', fontSize: '10px', color: 'text.secondary' }} align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody className="divide-y divide-slate-850/10">
          {visits.map((visit) => (
            <TableRow
              key={visit.id}
              className={`hover:bg-slate-900/10 transition-premium`}
            >
              {/* Date */}
              <TableCell className="font-bold text-slate-350">{formatDate(visit.createdAt)}</TableCell>
              
              {/* Heure */}
              <TableCell className="text-slate-400 font-bold">{formatTime(visit.createdAt)}</TableCell>
              
              {/* Client */}
              <TableCell className="font-black text-slate-200">{visit.client?.companyName}</TableCell>
              
              {/* Commercial */}
              <TableCell className="font-bold text-slate-300">
                {visit.commercial?.firstName} {visit.commercial?.lastName}
              </TableCell>
              
              {/* Objet */}
              <TableCell>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  theme === 'dark' ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-700'
                }`}>
                  {SUBJECT_LABELS[visit.subject] || visit.subject}
                </span>
              </TableCell>
              
              {/* Statut */}
              <TableCell align="center">
                <span className={`px-2 py-0.5 text-[9px] font-black uppercase rounded ${getStatusColor(visit.status)}`}>
                  {STATUS_LABELS[visit.status] || visit.status}
                </span>
              </TableCell>
              
              {/* Actions */}
              <TableCell align="right">
                <div className="flex justify-end gap-1">
                  <Tooltip title="Détails">
                    <IconButton
                      size="small"
                      onClick={() => onView(visit.id)}
                      className={`text-indigo-400`}
                    >
                      <VisibilityIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>

                  {isAdmin && (
                    <>
                      <Tooltip title="Modifier">
                        <IconButton
                          size="small"
                          onClick={() => onEdit(visit.id)}
                          className={`text-purple-400`}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Supprimer">
                        <IconButton
                          size="small"
                          onClick={() => onDelete(visit.id)}
                          className={`text-red-400`}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
          {visits.length === 0 && (
            <TableRow>
              <TableCell colSpan={7} align="center" className="py-8 text-slate-500 font-bold">
                Aucune visite trouvée.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
