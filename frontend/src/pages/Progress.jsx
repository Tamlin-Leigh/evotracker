import { useState, useEffect } from 'react';
import api from '../services/api';
import { Link } from 'react-router-dom';
import {
  AppBar, Box, Button, Card, CardContent, CircularProgress,
  Container, Grid, Toolbar, Typography, Chip, useTheme,
} from '@mui/material';
import {
  Area, ComposedChart, Line, Tooltip, ResponsiveContainer, XAxis, YAxis,
} from 'recharts';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AddchartIcon from '@mui/icons-material/Addchart';
import { formatBodyPartLabel } from '../config/bodyParts';

function SparkTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <Box sx={{ bgcolor: 'background.paper', border: 1, borderColor: 'divider', borderRadius: 1.5, px: 1.5, py: 1, boxShadow: 3 }}>
      <Typography variant="caption" color="text.secondary" display="block">{label}</Typography>
      <Typography variant="body2" fontWeight={700}>{payload[0].value} cm</Typography>
    </Box>
  );
}

function TrendCard({ part, data, points }) {
  const theme = useTheme();
  const improving = data.avg_monthly_change <= 0;
  const color = improving ? theme.palette.success.main : theme.palette.warning.main;

  return (
    <Card variant="outlined" sx={{ borderRadius: 3, height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="subtitle1" fontWeight={700}>
            {formatBodyPartLabel(part)}
          </Typography>
          <Chip
            size="small"
            icon={improving ? <TrendingDownIcon /> : <TrendingUpIcon />}
            label={`${data.avg_monthly_change > 0 ? '+' : ''}${data.avg_monthly_change} cm/mo`}
            color={improving ? 'success' : 'warning'}
          />
        </Box>

        <Box sx={{ display: 'flex', gap: 4, mb: 1.5 }}>
          <Box>
            <Typography variant="caption" color="text.secondary">Current</Typography>
            <Typography variant="h5" fontWeight={700}>{data.current_cm} cm</Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">Est. in 3 months</Typography>
            <Typography variant="h5" fontWeight={700}>{data.estimated_3mo_cm} cm</Typography>
          </Box>
        </Box>

        {points.length > 1 && (
          <ResponsiveContainer width="100%" height={110}>
            <ComposedChart data={points} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
              <XAxis dataKey="label" hide />
              <YAxis domain={['auto', 'auto']} hide />
              <Tooltip content={<SparkTooltip />} cursor={{ stroke: theme.palette.divider }} />
              <Area
                type="monotone"
                dataKey="cm"
                stroke="none"
                fill={color}
                fillOpacity={0.1}
                isAnimationActive={false}
              />
              <Line
                type="monotone"
                dataKey="cm"
                stroke={color}
                strokeWidth={2}
                isAnimationActive={false}
                dot={(props) => {
                  const { cx, cy, index } = props;
                  if (index !== points.length - 1) return null;
                  return (
                    <circle
                      key="end-dot"
                      cx={cx}
                      cy={cy}
                      r={4}
                      fill={color}
                      stroke={theme.palette.background.paper}
                      strokeWidth={2}
                    />
                  );
                }}
                activeDot={{ r: 5, strokeWidth: 2, stroke: theme.palette.background.paper }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}

export default function Progress() {
  const [estimates, setEstimates] = useState(null);
  const [chartData, setChartData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [estRes, allRes] = await Promise.all([
          api.get('/progress/estimate'),
          api.get('/measurements'),
        ]);
        setEstimates(estRes.data);

        const grouped = {};
        for (const m of allRes.data) {
          (grouped[m.body_part] ??= []).push(m);
        }
        for (const part of Object.keys(grouped)) {
          grouped[part] = grouped[part]
            .slice()
            .sort((a, b) => new Date(a.measured_at) - new Date(b.measured_at))
            .map(m => ({
              label: new Date(m.measured_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
              cm: m.value_cm,
            }));
        }
        setChartData(grouped);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <Box>
      <AppBar position="static" color="primary" elevation={1}>
        <Toolbar>
          <FitnessCenterIcon sx={{ mr: 1 }} />
          <Typography variant="h6" sx={{ flexGrow: 1 }}>Progress</Typography>
          <Button color="inherit" component={Link} to="/dashboard" startIcon={<ArrowBackIcon />}>Dashboard</Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 6 }}>
        <Box mb={3}>
          <Typography variant="h5" fontWeight={700} mb={0.5}>Your trends</Typography>
          <Typography sx={{ color: 'text.secondary' }}>
            How each tracked body part is changing over time.
          </Typography>
        </Box>

        {loading ? (
          <Box display="flex" justifyContent="center" mt={8}><CircularProgress /></Box>
        ) : !estimates || Object.keys(estimates).length === 0 ? (
          <Card variant="outlined" sx={{ textAlign: 'center', p: 5, borderRadius: 3, borderStyle: 'dashed' }}>
            <AddchartIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
            <Typography variant="h6">Not enough data yet</Typography>
            <Typography color="text.secondary">
              Log at least 2 measurements per body part to see progress estimates.
            </Typography>
          </Card>
        ) : (
          <Grid container spacing={2.5}>
            {Object.entries(estimates).map(([part, data]) => (
              <Grid key={part} size={{ xs: 12, sm: 6, md: 4 }}>
                <TrendCard part={part} data={data} points={chartData[part] ?? []} />
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    </Box>
  );
}
