import { useRef, useState } from 'react';
import api from '../services/api';
import { Link } from 'react-router-dom';
import {
  AppBar, Box, Button, Container, IconButton,
  Grid, MenuItem, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, TextField, Toolbar,
  Typography, Snackbar, CircularProgress,
} from '@mui/material';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlineOutlined';
import BodyOutline, { DISPLAY_WIDTH } from '../components/BodyOutline';
import { BODY_PARTS, formatBodyPartLabel } from '../config/bodyParts';
import { useMeasurements } from '../hooks/useMeasurements';

export default function Measurements() {
  const [form, setForm] = useState({ body_part: '', value_cm: '' });
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [toast, setToast] = useState('');
  const valueInputRef = useRef(null);
  const { measurements, loading, refetch } = useMeasurements();

  const handleSelectPart = (part) => {
    setForm(f => ({ ...f, body_part: part }));
    valueInputRef.current?.focus();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/measurements', form);
      setForm({ body_part: '', value_cm: '' });
      setToast('Measurement saved!');
      refetch();
    } catch {
      setToast('Failed to save measurement.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    setDeletingId(id);
    try {
      await api.delete(`/measurements/${id}`);
      refetch();
    } catch {
      setToast('Failed to delete measurement.');
    } finally {
      setDeletingId(null);
    }
  };

  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const todaysMeasurements = measurements.filter(m => m.measured_at.startsWith(todayStr));

  return (
    <Box>
      <AppBar position="static" color="primary" elevation={1}>
        <Toolbar>
          <FitnessCenterIcon sx={{ mr: 1 }} />
          <Typography variant="h6" sx={{ flexGrow: 1 }}>Measurements</Typography>
          <Button color="inherit" component={Link} to="/dashboard" startIcon={<ArrowBackIcon />}>Dashboard</Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3, alignItems: 'flex-start', mb: 4 }}>
          <Paper elevation={2} sx={{ p: 3, flexShrink: 0, width: { xs: '100%', md: Math.max(DISPLAY_WIDTH + 48, 260) } }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Select a Body Part</Typography>
            <BodyOutline selectedPart={form.body_part} onSelectPart={handleSelectPart} />
          </Paper>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, flexGrow: 1, width: '100%' }}>
            <Paper elevation={2} sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>Log a Measurement</Typography>
              <Box component="form" onSubmit={handleSubmit}>
                <Grid container spacing={2}>
                  <Grid size={12}>
                    <TextField
                      select label="Body Part" value={form.body_part} fullWidth required
                      onChange={e => setForm(f => ({ ...f, body_part: e.target.value }))}
                    >
                      {BODY_PARTS.map(p => (
                        <MenuItem key={p} value={p}>{formatBodyPartLabel(p)}</MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid size={12}>
                    <TextField
                      label="Value (cm)" type="number" value={form.value_cm} fullWidth required
                      inputProps={{ step: '0.1', min: '0' }}
                      onChange={e => setForm(f => ({ ...f, value_cm: e.target.value }))}
                      inputRef={valueInputRef}
                    />
                  </Grid>
                  <Grid size={12}>
                    <Button type="submit" variant="contained" fullWidth disabled={saving}>
                      {saving ? 'Saving…' : 'Save Measurement'}
                    </Button>
                  </Grid>
                </Grid>
              </Box>
            </Paper>

            <Paper elevation={2} sx={{ p: 3 }}>
              <Typography variant="h6" mb={2}>Logged Measurements</Typography>
              {loading ? (
                <Box display="flex" justifyContent="center" py={4}><CircularProgress size={28} /></Box>
              ) : measurements.length === 0 ? (
                <Typography color="text.secondary">No measurements logged yet.</Typography>
              ) : todaysMeasurements.length === 0 ? (
                <Typography color="text.secondary">New measurements for a new day — nothing logged yet today.</Typography>
              ) : (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Body Part</TableCell>
                        <TableCell align="right">Value (cm)</TableCell>
                        <TableCell>Logged At</TableCell>
                        <TableCell align="right" />
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {todaysMeasurements.map(m => (
                        <TableRow key={m.id} hover>
                          <TableCell>{formatBodyPartLabel(m.body_part)}</TableCell>
                          <TableCell align="right">{m.value_cm}</TableCell>
                          <TableCell>{new Date(m.measured_at).toLocaleString()}</TableCell>
                          <TableCell align="right">
                            <IconButton
                              size="small"
                              aria-label="Delete measurement"
                              disabled={deletingId === m.id}
                              onClick={() => handleDelete(m.id)}
                            >
                              <DeleteOutlineIcon fontSize="small" />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Paper>
          </Box>
        </Box>
      </Container>

      <Snackbar open={!!toast} autoHideDuration={3000} onClose={() => setToast('')}
        message={toast} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }} />
    </Box>
  );
}
