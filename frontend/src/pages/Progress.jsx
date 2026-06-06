import { useState, useEffect } from 'react';
import api from '../services/api';
import { Link } from 'react-router-dom';
import {
  AppBar, Box, Button, Card, CardContent, CircularProgress,
  Container, Grid, Toolbar, Typography, Chip,
} from '@mui/material';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

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
          if (!grouped[m.body_part]) grouped[m.body_part] = [];
          grouped[m.body_part].push({
            date: new Date(m.measured_at).toLocaleDateString(),
            cm: m.value_cm,
          });
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

      <Container maxWidth="lg" sx={{ mt: 4 }}>
        {loading ? (
          <Box display="flex" justifyContent="center" mt={8}><CircularProgress /></Box>
        ) : !estimates || Object.keys(estimates).length === 0 ? (
          <Typography color="text.secondary">
            Log at least 2 measurements per body part to see progress estimates.
          </Typography>
        ) : (
          <Grid container spacing={3}>
            {Object.entries(estimates).map(([part, data]) => {
              const trending = data.avg_monthly_change <= 0;
              return (
                <Grid item xs={12} md={6} key={part}>
                  <Card variant="outlined">
                    <CardContent>
                      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                        <Typography variant="h6" textTransform="capitalize">
                          {part.replace('_', ' ')}
                        </Typography>
                        <Chip
                          size="small"
                          icon={trending ? <TrendingDownIcon /> : <TrendingUpIcon />}
                          label={`${data.avg_monthly_change > 0 ? '+' : ''}${data.avg_monthly_change} cm/mo`}
                          color={trending ? 'success' : 'warning'}
                        />
                      </Box>

                      <Box display="flex" gap={4} mb={2}>
                        <Box>
                          <Typography variant="caption" color="text.secondary">Current</Typography>
                          <Typography variant="h5" fontWeight={700}>{data.current_cm} cm</Typography>
                        </Box>
                        <Box>
                          <Typography variant="caption" color="text.secondary">Est. in 3 months</Typography>
                          <Typography variant="h5" fontWeight={700}>{data.estimated_3mo_cm} cm</Typography>
                        </Box>
                      </Box>

                      {chartData[part] && (
                        <ResponsiveContainer width="100%" height={120}>
                          <LineChart data={chartData[part]}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                            <YAxis domain={['auto', 'auto']} tick={{ fontSize: 10 }} />
                            <Tooltip />
                            <Line type="monotone" dataKey="cm" stroke="#1976d2" dot={false} strokeWidth={2} />
                          </LineChart>
                        </ResponsiveContainer>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        )}
      </Container>
    </Box>
  );
}
