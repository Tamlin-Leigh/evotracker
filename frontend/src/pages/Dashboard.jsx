import { useAuth } from '../hooks/useAuth';
import { useMeasurements } from '../hooks/useMeasurements';
import { signOut } from 'firebase/auth';
import { auth } from '../services/firebase';
import { useNavigate, Link } from 'react-router-dom';
import {
  AppBar, Box, Button, Card, CardContent, CircularProgress,
  Container, Grid, Toolbar, Typography,
} from '@mui/material';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import AddchartIcon from '@mui/icons-material/Addchart';

export default function Dashboard() {
  const { user } = useAuth();
  const { measurements, loading } = useMeasurements();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut(auth);
    navigate('/login');
  };

  const uniqueParts = [...new Set(measurements.map(m => m.body_part))];
  const latest = {};
  for (const m of measurements) {
    if (!latest[m.body_part]) latest[m.body_part] = m;
  }

  return (
    <Box>
      <AppBar position="static" color="primary" elevation={1}>
        <Toolbar>
          <FitnessCenterIcon sx={{ mr: 1 }} />
          <Typography variant="h6" sx={{ flexGrow: 1 }}>evoTracker</Typography>
          <Button color="inherit" component={Link} to="/measurements">Measurements</Button>
          <Button color="inherit" component={Link} to="/progress">Progress</Button>
          <Button color="inherit" onClick={handleSignOut}>Sign Out</Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Typography variant="h5" fontWeight={700} mb={1}>
          Welcome back{user?.email ? `, ${user.email.split('@')[0]}` : ''}
        </Typography>
        <Typography color="text.secondary" mb={4}>
          Here's a snapshot of your tracked body parts.
        </Typography>

        {loading ? (
          <Box display="flex" justifyContent="center" mt={8}><CircularProgress /></Box>
        ) : uniqueParts.length === 0 ? (
          <Card variant="outlined" sx={{ textAlign: 'center', p: 4 }}>
            <AddchartIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
            <Typography variant="h6">No measurements yet</Typography>
            <Typography color="text.secondary" mb={2}>Start logging to see your progress here.</Typography>
            <Button variant="contained" component={Link} to="/measurements">Add Measurements</Button>
          </Card>
        ) : (
          <Grid container spacing={2}>
            {uniqueParts.map(part => (
              <Grid item xs={12} sm={6} md={4} key={part}>
                <Card variant="outlined">
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                      <TrendingDownIcon color="primary" fontSize="small" />
                      <Typography variant="subtitle2" textTransform="capitalize">
                        {part.replace('_', ' ')}
                      </Typography>
                    </Box>
                    <Typography variant="h4" fontWeight={700}>
                      {latest[part]?.value_cm} <Typography component="span" variant="body2" color="text.secondary">cm</Typography>
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Last logged: {new Date(latest[part]?.measured_at).toLocaleDateString()}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    </Box>
  );
}
