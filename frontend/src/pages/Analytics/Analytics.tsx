import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const Analytics: React.FC = () => {
  // Mock data - in real app, this would come from API
  const messageData = [
    { name: 'Jan', sent: 4000, delivered: 3800, read: 3200, responded: 800 },
    { name: 'Feb', sent: 3000, delivered: 2800, read: 2400, responded: 600 },
    { name: 'Mar', sent: 5000, delivered: 4800, read: 4200, responded: 1000 },
    { name: 'Apr', sent: 4500, delivered: 4300, read: 3800, responded: 900 },
    { name: 'May', sent: 6000, delivered: 5800, read: 5200, responded: 1200 },
    { name: 'Jun', sent: 5500, delivered: 5300, read: 4800, responded: 1100 },
  ];

  const campaignPerformance = [
    { name: 'Summer Sale', sent: 1250, delivered: 1200, read: 980, responded: 245 },
    { name: 'Product Launch', sent: 800, delivered: 780, read: 650, responded: 160 },
    { name: 'Follow-up', sent: 600, delivered: 580, read: 480, responded: 120 },
    { name: 'Holiday Greetings', sent: 900, delivered: 870, read: 720, responded: 180 },
  ];

  const responseRateData = [
    { name: 'Immediate', value: 35, color: '#25D366' },
    { name: 'Within 1 hour', value: 25, color: '#128C7E' },
    { name: 'Within 1 day', value: 20, color: '#4AE168' },
    { name: 'After 1 day', value: 20, color: '#1DA851' },
  ];

  const contactGrowth = [
    { name: 'Jan', contacts: 1000, active: 800 },
    { name: 'Feb', contacts: 1200, active: 950 },
    { name: 'Mar', contacts: 1400, active: 1100 },
    { name: 'Apr', contacts: 1600, active: 1250 },
    { name: 'May', contacts: 1800, active: 1400 },
    { name: 'Jun', contacts: 2000, active: 1600 },
  ];

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          Analytics
        </Typography>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Time Period</InputLabel>
          <Select value="6months" label="Time Period">
            <MenuItem value="7days">Last 7 days</MenuItem>
            <MenuItem value="30days">Last 30 days</MenuItem>
            <MenuItem value="3months">Last 3 months</MenuItem>
            <MenuItem value="6months">Last 6 months</MenuItem>
            <MenuItem value="1year">Last year</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Grid container spacing={3}>
        {/* Message Analytics */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Message Analytics
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={messageData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="sent" stroke="#25D366" strokeWidth={2} name="Sent" />
                  <Line type="monotone" dataKey="delivered" stroke="#128C7E" strokeWidth={2} name="Delivered" />
                  <Line type="monotone" dataKey="read" stroke="#4AE168" strokeWidth={2} name="Read" />
                  <Line type="monotone" dataKey="responded" stroke="#1DA851" strokeWidth={2} name="Responded" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Campaign Performance */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Campaign Performance
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={campaignPerformance}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="sent" fill="#25D366" name="Sent" />
                  <Bar dataKey="delivered" fill="#128C7E" name="Delivered" />
                  <Bar dataKey="read" fill="#4AE168" name="Read" />
                  <Bar dataKey="responded" fill="#1DA851" name="Responded" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Response Rate Distribution */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Response Time Distribution
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={responseRateData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {responseRateData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Contact Growth */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Contact Growth
              </Typography>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={contactGrowth}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="contacts" stroke="#25D366" strokeWidth={2} name="Total Contacts" />
                  <Line type="monotone" dataKey="active" stroke="#128C7E" strokeWidth={2} name="Active Contacts" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Key Metrics */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Key Metrics
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Box sx={{ textAlign: 'center', p: 2 }}>
                    <Typography variant="h4" color="primary.main">
                      23.5%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Response Rate
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ textAlign: 'center', p: 2 }}>
                    <Typography variant="h4" color="success.main">
                      89.2%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Delivery Rate
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ textAlign: 'center', p: 2 }}>
                    <Typography variant="h4" color="info.main">
                      76.8%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Read Rate
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ textAlign: 'center', p: 2 }}>
                    <Typography variant="h4" color="warning.main">
                      2.3h
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Avg Response Time
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Analytics;
