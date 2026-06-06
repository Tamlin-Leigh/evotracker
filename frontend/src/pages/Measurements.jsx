import { useState } from 'react';
import { useMeasurements } from '../hooks/useMeasurements';
import api from '../services/api';
import { Link } from 'react-router-dom';
import {
  AppBar, Box, Button, CircularProgress, Container, Divider,
  Grid, IconButton, MenuItem, Paper, TextField, Toolbar,
  Typography, Alert, Snackbar,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const BODY_PARTS = [
  'neck', 'shoulder_left', 'shoulder_right', 'chest', 'waist', 'hips',
  'thigh_left', 'thigh_right', 'calf_left', 'calf_right',
  'bicep_left', 'bicep_right', 'forearm_left', 'forearm_right',
];

export default function Measurements() {
  const { measurements, loading, refetch } = useMeasurements();
  const [form, setForm] = useState({ body_part: '', value_cm: '', measured_at: '' });
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/measurements', form);
      setForm({ body_part: '', value_cm: '', measured_at: '' });
      setToast('Measurement saved!');
      refetch();
    } catch {
      setToast('Failed to save measurement.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/measurements/${id}`);
      setToast('Measurement deleted.');
      refetch();
    } catch {
      setToast('Failed to delete.');
    }
  };

  return (
    <Box>
      <AppBar position="static" color="primary" elevation={1}>
        <Toolbar>
          <FitnessCenterIcon sx={{ mr: 1 }} />
          <Typography variant="h6" sx={{ flexGrow: 1 }}>Measurements</Typography>
          <Button color="inherit" component={Link} to="/dashboard" startIcon={<ArrowBackIcon />}>Dashboard</Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
          <Typography variant="h6" mb={2}>Log a Measurement</Typography>
          <Box component="form" onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <TextField
                  select label="Body Part" value={form.body_part} fullWidth required
                  onChange={e => setForm(f => ({ ...f, body_part: e.target.value }))}
                >
                  {BODY_PARTS.map(p => (
                    <MenuItem key={p} value={p}>{p.replace('_', ' ')}</MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  label="Value (cm)" type="number" value={form.value_cm} fullWidth required
                  inputProps={{ step: '0.1', min: '0' }}
                  onChange={e => setForm(f => ({ ...f, value_cm: e.target.value }))}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  label="Date" type="date" value={form.measured_at} fullWidth required
                  InputLabelProps={{ shrink: true }}
                  onChange={e => setForm(f => ({ ...f, measured_at: e.target.value }))}
                />
              </Grid>
              <Grid item xs={12}>
                <Button type="submit" variant="contained" disabled={saving}>
                  {saving ? 'Saving…' : 'Save Measurement'}
                </Button>
              </Grid>
            </Grid>
          </Box>
        </Paper>

        <Typography variant="h6" mb={2}>History</Typography>
        {loading ? (
          <Box display="flex" justifyContent="center"><CircularProgress /></Box>
        ) : measurements.length === 0 ? (
          <Typography color="text.secondary">No measurements logged yet.</Typography>
        ) : (
          measurements.map((m, i) => (
            <Box key={m.id}>
              <Box display="flex" alignItems="center" justifyContent="space-between" py={1}>
                <Box>
                  <Typography fontWeight={600} textTransform="capitalize">
                    {m.body_part.replace('_', ' ')}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {new Date(m.measured_at).toLocaleDateString()}
                  </Typography>
                </Box>
                <Box display="flex" alignItems="center" gap={2}>
                  <Typography fontWeight={700}>{m.value_cm} cm</Typography>
                  <IconButton size="small" onClick={() => handleDelete(m.id)}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              </Box>
              {i < measurements.length - 1 && <Divider />}
            </Box>
          ))
        )}
      </Container>

      <Snackbar open={!!toast} autoHideDuration={3000} onClose={() => setToast('')}
        message={toast} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }} />
    </Box>
  );
}
