import { useEffect, useRef, useState } from 'react';
import api from '../services/api';
import { Link } from 'react-router-dom';
import {
  AppBar, Avatar, Badge, Box, Button, Container, Grid, IconButton, MenuItem, Paper,
  TextField, Toolbar, Typography, Snackbar, CircularProgress,
} from '@mui/material';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PersonIcon from '@mui/icons-material/Person';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import CloseIcon from '@mui/icons-material/Close';

const emptyForm = { first_name: '', last_name: '', age: '', height: '', weight: '', gender: '', goal_note: '' };
const MAX_PHOTO_BYTES = 2 * 1024 * 1024;

export default function Profile() {
  const [form, setForm] = useState(emptyForm);
  const [photoUrl, setPhotoUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [toast, setToast] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    api.get('/profile')
      .then(({ data }) => {
        if (data) {
          setForm(f => ({
            ...f,
            ...data,
            first_name: data.first_name ?? '',
            last_name: data.last_name ?? '',
            age: data.age ?? '',
            height: data.height ?? '',
            weight: data.weight ?? '',
            gender: data.gender ?? '',
            goal_note: data.goal_note ?? '',
          }));
          setPhotoUrl(data.photo_url ?? null);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

  const handlePhotoSelect = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setToast('Please choose an image file.');
      return;
    }
    if (file.size > MAX_PHOTO_BYTES) {
      setToast('Image must be 2MB or smaller.');
      return;
    }

    setUploadingPhoto(true);
    try {
      const body = new FormData();
      body.append('photo', file);
      const { data } = await api.post('/profile/photo', body);
      setPhotoUrl(data.photo_url);
      setToast('Photo updated!');
    } catch {
      setToast('Failed to upload photo.');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handlePhotoRemove = async () => {
    setUploadingPhoto(true);
    try {
      await api.delete('/profile/photo');
      setPhotoUrl(null);
      setToast('Photo removed.');
    } catch {
      setToast('Failed to remove photo.');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put('/profile', {
        ...form,
        age: form.age ? Number(form.age) : null,
        height: form.height ? Number(form.height) : null,
        weight: form.weight ? Number(form.weight) : null,
      });
      setToast('Profile saved!');
    } catch {
      setToast('Failed to save profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box>
      <AppBar position="static" color="primary" elevation={1}>
        <Toolbar>
          <FitnessCenterIcon sx={{ mr: 1 }} />
          <Typography variant="h6" sx={{ flexGrow: 1 }}>Profile</Typography>
          <Button color="inherit" component={Link} to="/dashboard" startIcon={<ArrowBackIcon />}>Dashboard</Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="sm" sx={{ mt: 4, mb: 6 }}>
        <Paper elevation={2} sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>Your details</Typography>
          {loading ? (
            <Box display="flex" justifyContent="center" py={4}><CircularProgress size={28} /></Box>
          ) : (
            <Box component="form" onSubmit={handleSubmit}>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
                <Badge
                  overlap="circular"
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  badgeContent={
                    <IconButton
                      size="small"
                      aria-label="Change photo"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingPhoto}
                      sx={{ bgcolor: 'primary.main', color: 'primary.contrastText', '&:hover': { bgcolor: 'primary.dark' } }}
                    >
                      <PhotoCameraIcon fontSize="small" />
                    </IconButton>
                  }
                >
                  <Avatar src={photoUrl ?? undefined} sx={{ width: 96, height: 96 }}>
                    {!photoUrl && <PersonIcon sx={{ fontSize: 48 }} />}
                  </Avatar>
                </Badge>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={handlePhotoSelect}
                />
                {uploadingPhoto && <CircularProgress size={20} sx={{ mt: 1 }} />}
                {!uploadingPhoto && photoUrl && (
                  <Button
                    size="small"
                    color="inherit"
                    startIcon={<CloseIcon fontSize="small" />}
                    onClick={handlePhotoRemove}
                    sx={{ mt: 1, color: 'text.secondary' }}
                  >
                    Remove photo
                  </Button>
                )}
              </Box>

              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField label="First name" fullWidth value={form.first_name} onChange={handleChange('first_name')} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField label="Last name" fullWidth value={form.last_name} onChange={handleChange('last_name')} />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <TextField label="Age" type="number" fullWidth value={form.age} onChange={handleChange('age')} inputProps={{ min: 10, max: 120 }} />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <TextField label="Height (cm)" type="number" fullWidth value={form.height} onChange={handleChange('height')} inputProps={{ step: '0.1', min: 50, max: 300 }} />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <TextField label="Weight (kg)" type="number" fullWidth value={form.weight} onChange={handleChange('weight')} inputProps={{ step: '0.1', min: 20, max: 500 }} />
                </Grid>
                <Grid size={12}>
                  <TextField select label="Gender" fullWidth value={form.gender} onChange={handleChange('gender')}>
                    <MenuItem value="">Prefer not to say</MenuItem>
                    <MenuItem value="female">Female</MenuItem>
                    <MenuItem value="male">Male</MenuItem>
                    <MenuItem value="other">Other</MenuItem>
                  </TextField>
                </Grid>
                <Grid size={12}>
                  <TextField label="Goal note" fullWidth multiline minRows={2} value={form.goal_note} onChange={handleChange('goal_note')} />
                </Grid>
                <Grid size={12}>
                  <Button type="submit" variant="contained" fullWidth disabled={saving}>
                    {saving ? 'Saving…' : 'Save Profile'}
                  </Button>
                </Grid>
              </Grid>
            </Box>
          )}
        </Paper>
      </Container>

      <Snackbar open={!!toast} autoHideDuration={3000} onClose={() => setToast('')}
        message={toast} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }} />
    </Box>
  );
}
