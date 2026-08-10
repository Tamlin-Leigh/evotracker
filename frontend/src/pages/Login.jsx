import { useState } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from 'firebase/auth';
import { auth } from '../services/firebase';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Alert } from '@mui/material';
import { AppInput, PasswordInput, PrimaryButton } from '../components/ui';
import logo from '../assets/logoET.svg';
import heroImg from '../assets/hero2.png';

export default function AuthPage() {
  const [tab, setTab] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  function switchTab(t) {
    setTab(t);
    setError('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
  }

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/dashboard');
    } catch {
      setError('Invalid email or password.');
    } finally {
      setBusy(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setBusy(true);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      navigate('/onboarding');
    } catch (err) {
      setError(err.message ?? 'Could not create account.');
    } finally {
      setBusy(false);
    }
  };

  const tabSx = (value) => ({
    flex: 1,
    py: 1,
    border: 'none',
    background: 'none',
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: '0.875rem',
    fontFamily: '"Plus Jakarta Sans","Inter","Roboto",sans-serif',
    color: tab === value ? '#068A9E' : '#9ca3af',
    borderBottom: tab === value ? '2px solid #068A9E' : '2px solid transparent',
    transition: 'color 0.18s, border-color 0.18s',
  });

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
      {/* Background image */}
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

      {/* Card wrapper */}
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
          {/* Logo */}
          <Box component="img" src={logo} alt="evoTracker" sx={{ width: '100%', mb: 3.5 }} />

          {/* Tabs */}
          <Box sx={{ display: 'flex', mb: 3, borderBottom: '1px solid #e5e7eb' }}>
            <Box component="button" onClick={() => switchTab('login')} sx={tabSx('login')}>
              Log in
            </Box>
            <Box component="button" onClick={() => switchTab('signup')} sx={tabSx('signup')}>
              Sign up
            </Box>
          </Box>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          {tab === 'login' ? (
            <Box key="login">
              <Typography variant="h6" fontWeight={700} sx={{ color: '#33275C', letterSpacing: '-0.3px', mb: 0.5, textAlign: 'center' }}>
                Welcome back
              </Typography>
              <Typography variant="body2" sx={{ color: '#6b7280', mb: 2.5, textAlign: 'center' }}>
                Sign in to continue
              </Typography>

              <Box component="form" onSubmit={handleLogin} sx={{ display: 'flex', flexDirection: 'column', gap: 1.75 }}>
                <AppInput
                  placeholder="Email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
                <PasswordInput
                  placeholder="Password"
                  autoComplete="current-password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />

                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Typography
                    variant="caption"
                    sx={{ color: '#07A0B8', cursor: 'pointer', fontWeight: 500, '&:hover': { textDecoration: 'underline' } }}
                  >
                    Forgot password?
                  </Typography>
                </Box>

                <PrimaryButton type="submit" disabled={busy}>
                  Log in
                </PrimaryButton>
              </Box>
            </Box>
          ) : (
            <Box key="signup">
              <Typography variant="h6" fontWeight={700} sx={{ color: '#33275C', letterSpacing: '-0.3px', mb: 0.5, textAlign: 'center' }}>
                Create account
              </Typography>
              <Typography variant="body2" sx={{ color: '#6b7280', mb: 2.5, textAlign: 'center' }}>
                Get started — it&apos;s free
              </Typography>

              <Box component="form" onSubmit={handleSignup} sx={{ display: 'flex', flexDirection: 'column', gap: 1.75 }}>
                <AppInput
                  placeholder="Email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
                <PasswordInput
                  placeholder="Password"
                  autoComplete="new-password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  inputProps={{ minLength: 6 }}
                />
                <PasswordInput
                  placeholder="Confirm password"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  required
                />

                <PrimaryButton type="submit" disabled={busy}>
                  Create account
                </PrimaryButton>
              </Box>
            </Box>
          )}

          {/* Terms */}
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 3 }}>
            <Typography variant="caption" sx={{ color: '#bbb', cursor: 'pointer', '&:hover': { color: '#6b7280' } }}>
              Terms of Use
            </Typography>
            <Typography variant="caption" sx={{ color: '#ddd' }}>|</Typography>
            <Typography variant="caption" sx={{ color: '#bbb', cursor: 'pointer', '&:hover': { color: '#6b7280' } }}>
              Privacy Policy
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
