import { useAuth } from '../hooks/useAuth';
import { useMeasurements } from '../hooks/useMeasurements';
import { signOut } from 'firebase/auth';
import { auth } from '../services/firebase';
import { useNavigate, Link } from 'react-router-dom';
import {
  alpha, AppBar, Avatar, Box, Button, Card, CardContent, CircularProgress,
  Container, Stack, Toolbar, Typography, useTheme,
} from '@mui/material';
import {
  Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import HistoryIcon from '@mui/icons-material/History';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import AddchartIcon from '@mui/icons-material/Addchart';
import { formatBodyPartLabel } from '../config/bodyParts';

function StatTile({ icon, iconColor, label, value, caption }) {
  return (
    <Card variant="outlined" sx={{ borderRadius: 3, flex: '1 1 240px', minWidth: 220 }}>
      <CardContent>
        <Stack direction="row" alignItems="flex-start" gap={1.5}>
          <Avatar
            variant="rounded"
            sx={{ width: 40, height: 40, borderRadius: 2, bgcolor: alpha(iconColor, 0.12), color: iconColor }}
          >
            {icon}
          </Avatar>
          <Box>
            <Typography variant="body2" color="text.secondary">{label}</Typography>
            <Typography variant="h5" fontWeight={700}>{value}</Typography>
            {caption && <Typography variant="caption" color="text.secondary">{caption}</Typography>}
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <Box sx={{ bgcolor: 'background.paper', border: 1, borderColor: 'divider', borderRadius: 1.5, px: 1.5, py: 1, boxShadow: 3 }}>
      <Typography variant="caption" color="text.secondary" display="block">{label}</Typography>
      <Typography variant="body2" fontWeight={700}>{payload[0].value} cm</Typography>
    </Box>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const { measurements, loading } = useMeasurements();
  const navigate = useNavigate();
  const theme = useTheme();

  const handleSignOut = async () => {
    await signOut(auth);
    navigate('/login');
  };

  const byPart = {};
  for (const m of measurements) {
    (byPart[m.body_part] ??= []).push(m);
  }

  let lossStat = null;
  for (const part of Object.keys(byPart)) {
    const entries = byPart[part];
    if (entries.length < 2) continue;
    const loss = entries[entries.length - 1].value_cm - entries[0].value_cm;
    if (!lossStat || loss > lossStat.loss) lossStat = { part, loss };
  }

  const chartData = Object.keys(byPart)
    .map(part => ({ part: formatBodyPartLabel(part), cm: byPart[part][0].value_cm }))
    .sort((a, b) => a.part.localeCompare(b.part));

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

      <Container maxWidth="lg" sx={{ mt: 4, mb: 6 }}>
        <Box mb={4}>
          <Typography variant="h5" fontWeight={700} mb={0.5}>
            Welcome back{user?.email ? `, ${user.email.split('@')[0]}` : ''}
          </Typography>
          <Typography color="text.secondary">
            Here's a snapshot of your tracked body parts.
          </Typography>
        </Box>

        {loading ? (
          <Box display="flex" justifyContent="center" mt={8}><CircularProgress /></Box>
        ) : measurements.length === 0 ? (
          <Card variant="outlined" sx={{ textAlign: 'center', p: 5, borderRadius: 3, borderStyle: 'dashed' }}>
            <AddchartIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
            <Typography variant="h6">No measurements yet</Typography>
            <Typography color="text.secondary" mb={2}>Start logging to see your progress here.</Typography>
            <Button variant="contained" component={Link} to="/measurements">Add Measurements</Button>
          </Card>
        ) : (
          <Stack gap={3}>
            <Stack direction={{ xs: 'column', sm: 'row' }} gap={2.5}>
              <StatTile
                icon={<HistoryIcon fontSize="small" />}
                iconColor={theme.palette.primary.main}
                label="Times logged"
                value={measurements.length}
                caption="Total measurements recorded"
              />
              <StatTile
                icon={<TrendingDownIcon fontSize="small" />}
                iconColor={theme.palette.success.main}
                label="Most cm lost"
                value={lossStat && lossStat.loss > 0 ? `${lossStat.loss.toFixed(1)} cm` : '–'}
                caption={lossStat && lossStat.loss > 0 ? formatBodyPartLabel(lossStat.part) : 'Log a body part twice to see this'}
              />
            </Stack>

            <Card variant="outlined" sx={{ borderRadius: 3 }}>
              <CardContent>
                <Typography variant="h6" mb={2}>Measurements</Typography>
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 24 }}>
                    <CartesianGrid vertical={false} stroke={theme.palette.divider} />
                    <XAxis
                      dataKey="part"
                      tick={{ fontSize: 11, fill: theme.palette.text.secondary }}
                      angle={-30}
                      textAnchor="end"
                      interval={0}
                      height={50}
                      axisLine={{ stroke: theme.palette.divider }}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: theme.palette.text.secondary }}
                      axisLine={false}
                      tickLine={false}
                      width={36}
                    />
                    <Tooltip content={<ChartTooltip />} cursor={{ fill: alpha(theme.palette.primary.main, 0.06) }} />
                    <Bar dataKey="cm" fill={theme.palette.primary.main} radius={[4, 4, 0, 0]} maxBarSize={24} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Stack>
        )}
      </Container>
    </Box>
  );
}
