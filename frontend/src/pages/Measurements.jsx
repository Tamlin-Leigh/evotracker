import { useRef, useState } from 'react';
import api from '../services/api';
import { Link } from 'react-router-dom';
import {
  AppBar, Box, Button, Container,
  Grid, MenuItem, Paper, TextField, Toolbar,
  Typography, Snackbar,
} from '@mui/material';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import BodyOutline, { DISPLAY_WIDTH } from '../components/BodyOutline';
import { BODY_PARTS, formatBodyPartLabel } from '../config/bodyParts';

export default function Measurements() {
  const [form, setForm] = useState({ body_part: '', value_cm: '' });
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');
  const valueInputRef = useRef(null);

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
    } catch {
      setToast('Failed to save measurement.');
    } finally {
      setSaving(false);
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

      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3, alignItems: 'flex-start', mb: 4 }}>
          <Paper elevation={2} sx={{ p: 3, flexShrink: 0, width: { xs: '100%', md: Math.max(DISPLAY_WIDTH + 48, 260) } }}>
            <Typography variant="h6" mb={2}>Select a Body Part</Typography>
            <BodyOutline selectedPart={form.body_part} onSelectPart={handleSelectPart} />
          </Paper>

          <Paper elevation={2} sx={{ p: 3, flexGrow: 1, width: '100%' }}>
            <Typography variant="h6" mb={2}>Log a Measurement</Typography>
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
        </Box>
      </Container>

      <Snackbar open={!!toast} autoHideDuration={3000} onClose={() => setToast('')}
        message={toast} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }} />
    </Box>
  );
}
