import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Alert, InputAdornment } from '@mui/material';
import { AppInput, PrimaryButton } from '../components/ui';
import api from '../services/api';
import logo from '../assets/logoET.svg';
import heroImg from '../assets/hero2.png';

export default function Onboarding() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [age, setAge] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await api.put('/profile', {
        first_name: firstName,
        last_name: lastName,
        age: age ? Number(age) : null,
        height: height ? Number(height) : null,
        weight: weight ? Number(weight) : null,
      });
      navigate('/dashboard');
    } catch (err) {
      console.error('Profile save failed:', err?.response?.data ?? err?.message ?? err);
      setError('Could not save your profile. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Box
      sx={{
        height: '100vh',
        width: '100vw',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-start',
        overflow: 'hidden',
      }}
    >
      <Box
        component="img"
        src={heroImg}
        alt=""
        sx={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: 'center',
          zIndex: 0,
        }}
      />

      <Box
        sx={{
          position: 'relative',
          zIndex: 2,
          width: '100%',
          maxWidth: 420,
          ml: { xs: 2, sm: 6, md: 10 },
          mr: 0,
        }}
      >
        <Box
          sx={{
            width: '100%',
            borderRadius: '20px',
            bgcolor: '#fff',
            boxShadow: '0 2px 4px rgba(0,0,0,0.04), 0 12px 40px rgba(0,0,0,0.14)',
            display: 'flex',
            flexDirection: 'column',
            px: { xs: 3.5, sm: 4.5 },
            pt: 4.5,
            pb: 3.5,
          }}
        >
          <Box component="img" src={logo} alt="evoTracker" sx={{ width: '100%', mb: 3.5 }} />

          <Typography variant="h6" fontWeight={700} sx={{ color: '#33275C', letterSpacing: '-0.3px', mb: 0.5, textAlign: 'center' }}>
            Tell us about yourself
          </Typography>
          <Typography variant="body2" sx={{ color: '#6b7280', mb: 2.5, textAlign: 'center' }}>
            Help us personalise your experience
          </Typography>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 1.75 }}>
            <Box sx={{ display: 'flex', gap: 1.5 }}>
              <AppInput
                placeholder="First name"
                type="text"
                autoComplete="given-name"
                value={firstName}
                onChange={e => setFirstName(e.target.value)}
                required
              />
              <AppInput
                placeholder="Last name"
                type="text"
                autoComplete="family-name"
                value={lastName}
                onChange={e => setLastName(e.target.value)}
                required
              />
            </Box>

            <AppInput
              placeholder="Age"
              type="number"
              inputProps={{ min: 10, max: 120 }}
              value={age}
              onChange={e => setAge(e.target.value)}
              required
            />

            <AppInput
              placeholder="Height"
              type="number"
              inputProps={{ min: 50, max: 300, step: 0.1 }}
              value={height}
              onChange={e => setHeight(e.target.value)}
              required
              InputProps={{
                endAdornment: <InputAdornment position="end"><Typography variant="caption" sx={{ color: '#9ca3af' }}>cm</Typography></InputAdornment>,
              }}
            />

            <AppInput
              placeholder="Weight"
              type="number"
              inputProps={{ min: 20, max: 500, step: 0.1 }}
              value={weight}
              onChange={e => setWeight(e.target.value)}
              required
              InputProps={{
                endAdornment: <InputAdornment position="end"><Typography variant="caption" sx={{ color: '#9ca3af' }}>kg</Typography></InputAdornment>,
              }}
            />

            <PrimaryButton type="submit" disabled={busy} sx={{ mt: 0.5 }}>
              Get started
            </PrimaryButton>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
