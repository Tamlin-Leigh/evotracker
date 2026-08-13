import { useAuth } from '../hooks/useAuth';
import { useMeasurements } from '../hooks/useMeasurements';
import { useNavigate, Link } from 'react-router-dom';
import {
  alpha, AppBar, Avatar, Box, Button, Card, CardContent, CircularProgress,
  Container, Stack, Toolbar, Typography, useTheme,
} from '@mui/material';
import {
  CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import HistoryIcon from '@mui/icons-material/History';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import AddchartIcon from '@mui/icons-material/Addchart';
import StraightenIcon from '@mui/icons-material/Straighten';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import PersonIcon from '@mui/icons-material/Person';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

function NavCard({ icon, iconColor, title, description, to }) {
  return (
    <Card
      variant="outlined"
      component={Link}
      to={to}
      sx={{
        borderRadius: 3,
        flex: '1 1 240px',
        minWidth: 220,
        margin: 1,
        textDecoration: 'none',
        transition: 'box-shadow 0.15s, transform 0.15s',
        '&:hover': { boxShadow: 4, transform: 'translateY(-2px)' },
      }}
    >
      <CardContent>
        <Stack direction="row" alignItems="center" gap={1.5}>
          <Avatar
            variant="rounded"
            sx={{ width: 44, height: 44, borderRadius: 2, bgcolor: alpha(iconColor, 0.12), color: iconColor, margin:1 }}
          >
            {icon}
          </Avatar>
          <Box flexGrow={1}>
            <Typography variant="subtitle1" fontWeight={700} color="text.primary">{title}</Typography>
            <Typography variant="body2" color="text.secondary">{description}</Typography>
          </Box>
          <ChevronRightIcon sx={{ color: 'text.secondary' }} />
        </Stack>
      </CardContent>
    </Card>
  );
}

function StatTile({ icon, iconColor, label, value, caption }) {
  return (
    <Card variant="outlined" sx={{ borderRadius: 3, flex: '1 1 240px', minWidth: 220, m:1}}>
      <CardContent>
        <Stack direction="row" alignItems="center" gap={1.5}>
          <Avatar
            variant="rounded"
            sx={{ width: 40, height: 40, borderRadius: 2, bgcolor: alpha(iconColor, 0.12), color: iconColor, margin: 1 }}
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
    <Box sx={{ bgcolor: 'background.paper', border: 1, borderColor: 'divider', borderRadius: 1.5, px: 1.5, py: 1, boxShadow: 3}}>
      <Typography variant="caption" color="text.secondary" display="block">{label}</Typography>
      <Typography variant="body2" fontWeight={700}>{payload[0].value} cm</Typography>
    </Box>
  );
}

export default function Dashboard() {
  const { user, logout } = useAuth();
  const { measurements, loading } = useMeasurements();
  const navigate = useNavigate();
  const theme = useTheme();

  const handleSignOut = async () => {
    await logout();
    navigate('/login');
  };

  const byPart = {};
  for (const m of measurements) {
    (byPart[m.body_part] ??= []).push(m);
  }

  const daysLogged = new Set(measurements.map(m => m.measured_at.slice(0, 10))).size;

  let totalLoss = 0;
  for (const part of Object.keys(byPart)) {
    const entries = byPart[part];
    if (entries.length < 2) continue;
    const loss = entries[entries.length - 1].value_cm - entries[0].value_cm;
    if (loss > 0) totalLoss += loss;
  }

  const updatesByDate = {};
  for (const m of measurements) {
    const date = m.measured_at.slice(0, 10);
    (updatesByDate[date] ??= {})[m.body_part] = m.value_cm;
  }
  const trendDates = Object.keys(updatesByDate).sort();
  const runningValues = {};
  const trendData = trendDates.map(date => {
    Object.assign(runningValues, updatesByDate[date]);
    const total = Object.values(runningValues).reduce((sum, v) => sum + v, 0);
    return {
      date,
      label: new Date(`${date}T00:00:00`).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      total: Math.round(total * 10) / 10,
    };
  });

  return (
    <Box>
      <AppBar position="static" color="primary" elevation={1}>
        <Toolbar>
          <FitnessCenterIcon sx={{ mr: 1 }} />
          <Typography variant="h6" sx={{ flexGrow: 1 }}>evoTracker</Typography>
          <Button color="inherit" component={Link} to="/measurements">Measurements</Button>
          <Button color="inherit" component={Link} to="/progress">Progress</Button>
          <Button color="inherit" component={Link} to="/profile">Profile</Button>
          <Button color="inherit" onClick={handleSignOut}>Sign Out</Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 6 }}>
        <Box mb={4}>
          <Typography variant="h5" fontWeight={700} mb={0.5}>
            Welcome back{user?.email ? `, ${user.email.split('@')[0]}` : ''}
          </Typography>
          <Typography sx={{ color: 'text.secondary', mb: 1 }}>
            Here's a snapshot of your tracked body parts.
          </Typography>
        </Box>

        <Stack direction={{ xs: 'column', sm: 'row' }} gap={2.5} mb={2} >
          <NavCard
            icon={<StraightenIcon fontSize="small" />}
            iconColor={theme.palette.primary.main}
            title="Measurements"
            description="Log and review your entries"
            to="/measurements"
          />
          <NavCard
            icon={<ShowChartIcon fontSize="small" />}
            iconColor={theme.palette.success.main}
            title="Progress"
            description="See your trends over time"
            to="/progress"
          />
          <NavCard
            icon={<PersonIcon fontSize="small" />}
            iconColor={theme.palette.secondary.main}
            title="Profile"
            description="Manage your details"
            to="/profile"
          />
        </Stack>

        {loading ? (
          <Box display="flex" justifyContent="center" mt={8}><CircularProgress /></Box>
        ) : measurements.length === 0 ? (
          <Card variant="outlined" sx={{ textAlign: 'center', p: 5, borderRadius: 3, borderStyle: 'dashed' }}>
            <AddchartIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
            <Typography variant="h6">No measurements yet</Typography>
            <Typography color="text.secondary" sx={{ color: 'text.secondary', mb: 1 }}>Start logging to see your progress here.</Typography>
            <Button variant="contained" component={Link} to="/measurements">Add Measurements</Button>
          </Card>
        ) : (
          <Stack gap={3} >
            <Stack direction={{ xs: 'column', sm: 'row' }} gap={2.5} >
              <StatTile
                icon={<HistoryIcon fontSize="small"/>}
                iconColor={theme.palette.primary.main}
                label="Times logged"
                value={daysLogged}
                caption={daysLogged === 1 ? 'Day recorded' : 'Days recorded'}
              />
              <StatTile
                icon={<TrendingDownIcon fontSize="small" />}
                iconColor={theme.palette.success.main}
                label="Total cm lost"
                value={totalLoss > 0 ? `${totalLoss.toFixed(1)} cm` : '–'}
                caption={totalLoss > 0 ? 'Combined loss across all tracked parts' : 'Log a body part twice to see this'}
              />
            </Stack>

            <Card variant="outlined" sx={{ borderRadius: 3 , m:1}}>
              <CardContent>
                <Typography variant="h6">Combined total</Typography>
                <Typography variant="body2" color="text.secondary" mb={2}>
                  Sum of your latest logged value across every tracked body part, over time.
                </Typography>
                {trendData.length < 2 ? (
                  <Box display="flex" alignItems="center" justifyContent="center" height={200}>
                    <Typography color="text.secondary">Log on another day to see this trend develop.</Typography>
                  </Box>
                ) : (
                  <ResponsiveContainer width="100%" height={320}>
                    <LineChart data={trendData} margin={{ top: 24, right: 24, left: 0, bottom: 8 }}>
                      <CartesianGrid vertical={false} stroke={theme.palette.divider} />
                      <XAxis
                        dataKey="label"
                        tick={{ fontSize: 11, fill: theme.palette.text.secondary }}
                        axisLine={{ stroke: theme.palette.divider }}
                        tickLine={false}
                      />
                      <YAxis
                        domain={['auto', 'auto']}
                        tick={{ fontSize: 11, fill: theme.palette.text.secondary }}
                        axisLine={false}
                        tickLine={false}
                        width={44}
                      />
                      <Tooltip content={<ChartTooltip />} cursor={{ stroke: theme.palette.divider }} />
                      <Line
                        type="monotone"
                        dataKey="total"
                        stroke={theme.palette.primary.main}
                        strokeWidth={2}
                        dot={false}
                        activeDot={{ r: 4, strokeWidth: 2, stroke: theme.palette.background.paper }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </Stack>
        )}
      </Container>
    </Box>
  );
}
