import { useState } from 'react';
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../services/firebase';
import { useNavigate, Link } from 'react-router-dom';
import {
  Box, Button, Container, Divider, TextField, Typography, Alert, Paper,
} from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleEmail = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/dashboard');
    } catch {
      setError('Invalid email or password.');
    }
  };

  const handleGoogle = async () => {
    setError('');
    try {
      await signInWithPopup(auth, googleProvider);
      navigate('/dashboard');
    } catch {
      setError('Google sign-in failed.');
    }
  };

  return (
    <Container maxWidth="xs" sx={{ mt: 10 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h5" fontWeight={700} mb={3} textAlign="center">
          evoTracker
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Box component="form" onSubmit={handleEmail} display="flex" flexDirection="column" gap={2}>
          <TextField label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} required fullWidth />
          <TextField label="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} required fullWidth />
          <Button type="submit" variant="contained" fullWidth>Sign In</Button>
        </Box>

        <Divider sx={{ my: 2 }}>or</Divider>

        <Button variant="outlined" fullWidth startIcon={<GoogleIcon />} onClick={handleGoogle}>
          Continue with Google
        </Button>

        <Typography variant="body2" textAlign="center" mt={2}>
          No account?{' '}
          <Link to="/signup" style={{ color: 'inherit' }}>Sign up</Link>
        </Typography>
      </Paper>
    </Container>
  );
}
