import React from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip,
  Button,
} from '@mui/material';
import {
  TrendingUp,
  People,
  Campaign,
  Message,
  Add,
  MoreVert,
} from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

const Dashboard: React.FC = () => {
  // Mock data - in real app, this would come from API
  const stats = [
    { title: 'Total Contacts', value: '12,345', change: '+12%', icon: <People />, color: '#25D366' },
    { title: 'Active Campaigns', value: '8', change: '+2', icon: <Campaign />, color: '#128C7E' },
    { title: 'Messages Sent', value: '45,678', change: '+8%', icon: <Message />, color: '#4AE168' },
    { title: 'Response Rate', value: '23.5%', change: '+3.2%', icon: <TrendingUp />, color: '#1DA851' },
  ];

  const messageData = [
    { name: 'Jan', sent: 4000, delivered: 3800, read: 3200 },
    { name: 'Feb', sent: 3000, delivered: 2800, read: 2400 },
    { name: 'Mar', sent: 5000, delivered: 4800, read: 4200 },
    { name: 'Apr', sent: 4500, delivered: 4300, read: 3800 },
    { name: 'May', sent: 6000, delivered: 5800, read: 5200 },
    { name: 'Jun', sent: 5500, delivered: 5300, read: 4800 },
  ];

  const recentContacts = [
    { name: 'John Doe', phone: '+1234567890', lastMessage: '2 hours ago', status: 'active' },
    { name: 'Jane Smith', phone: '+1234567891', lastMessage: '4 hours ago', status: 'active' },
    { name: 'Bob Johnson', phone: '+1234567892', lastMessage: '1 day ago', status: 'inactive' },
    { name: 'Alice Brown', phone: '+1234567893', lastMessage: '2 days ago', status: 'active' },
  ];

  const recentCampaigns = [
    { name: 'Summer Sale Campaign', status: 'running', sent: 1250, delivered: 1200 },
    { name: 'Product Launch', status: 'completed', sent: 800, delivered: 780 },
    { name: 'Follow-up Campaign', status: 'scheduled', sent: 0, delivered: 0 },
  ];

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography color="textSecondary" gutterBottom variant="h6">
                      {stat.title}
                    </Typography>
                    <Typography variant="h4" component="div">
                      {stat.value}
                    </Typography>
                    <Typography variant="body2" color="success.main">
                      {stat.change}
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: stat.color, width: 56, height: 56 }}>
                    {stat.icon}
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        {/* Message Analytics Chart */}
        <Grid item xs={12} md={8}>
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
                  <Line type="monotone" dataKey="sent" stroke="#25D366" strokeWidth={2} />
                  <Line type="monotone" dataKey="delivered" stroke="#128C7E" strokeWidth={2} />
                  <Line type="monotone" dataKey="read" stroke="#4AE168" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Contacts */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  Recent Contacts
                </Typography>
                <Button size="small" startIcon={<Add />}>
                  Add Contact
                </Button>
              </Box>
              <List>
                {recentContacts.map((contact, index) => (
                  <ListItem key={index} divider={index < recentContacts.length - 1}>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
                        {contact.name.split(' ').map(n => n[0]).join('')}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={contact.name}
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            {contact.phone}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {contact.lastMessage}
                          </Typography>
                        </Box>
                      }
                    />
                    <Chip
                      label={contact.status}
                      size="small"
                      color={contact.status === 'active' ? 'success' : 'default'}
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Campaign Performance */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  Campaign Performance
                </Typography>
                <Button size="small" startIcon={<Add />}>
                  New Campaign
                </Button>
              </Box>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={messageData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="sent" fill="#25D366" />
                  <Bar dataKey="delivered" fill="#128C7E" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Campaigns */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  Recent Campaigns
                </Typography>
                <Button size="small" startIcon={<MoreVert />}>
                  View All
                </Button>
              </Box>
              <List>
                {recentCampaigns.map((campaign, index) => (
                  <ListItem key={index} divider={index < recentCampaigns.length - 1}>
                    <ListItemText
                      primary={campaign.name}
                      secondary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                          <Chip
                            label={campaign.status}
                            size="small"
                            color={
                              campaign.status === 'running' ? 'success' :
                              campaign.status === 'completed' ? 'primary' : 'default'
                            }
                          />
                          <Typography variant="caption" color="text.secondary">
                            {campaign.sent} sent, {campaign.delivered} delivered
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
