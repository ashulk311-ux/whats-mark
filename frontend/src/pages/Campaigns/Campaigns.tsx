import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Add,
  PlayArrow,
  Pause,
  Stop,
  Edit,
  Delete,
  MoreVert,
  Campaign,
} from '@mui/icons-material';

const Campaigns: React.FC = () => {
  const [openDialog, setOpenDialog] = useState(false);

  // Mock data - in real app, this would come from API
  const campaigns = [
    {
      id: 1,
      name: 'Summer Sale Campaign',
      status: 'running',
      sent: 1250,
      delivered: 1200,
      read: 980,
      response: 45,
      createdAt: '2024-01-15',
      scheduledFor: '2024-01-20',
    },
    {
      id: 2,
      name: 'Product Launch',
      status: 'completed',
      sent: 800,
      delivered: 780,
      read: 650,
      response: 32,
      createdAt: '2024-01-10',
      scheduledFor: '2024-01-12',
    },
    {
      id: 3,
      name: 'Follow-up Campaign',
      status: 'scheduled',
      sent: 0,
      delivered: 0,
      read: 0,
      response: 0,
      createdAt: '2024-01-18',
      scheduledFor: '2024-01-25',
    },
    {
      id: 4,
      name: 'Holiday Greetings',
      status: 'draft',
      sent: 0,
      delivered: 0,
      read: 0,
      response: 0,
      createdAt: '2024-01-20',
      scheduledFor: null,
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'success';
      case 'completed': return 'primary';
      case 'scheduled': return 'warning';
      case 'draft': return 'default';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running': return <PlayArrow />;
      case 'completed': return <Stop />;
      case 'scheduled': return <Pause />;
      case 'draft': return <Edit />;
      default: return <Campaign />;
    }
  };

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          Campaigns
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setOpenDialog(true)}
        >
          Create Campaign
        </Button>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                All Campaigns ({campaigns.length})
              </Typography>
              <List>
                {campaigns.map((campaign) => (
                  <ListItem key={campaign.id} divider>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="h6">{campaign.name}</Typography>
                          <Chip
                            icon={getStatusIcon(campaign.status)}
                            label={campaign.status}
                            size="small"
                            color={getStatusColor(campaign.status) as any}
                          />
                        </Box>
                      }
                      secondary={
                        <Box sx={{ mt: 1 }}>
                          <Grid container spacing={2}>
                            <Grid item xs={6} sm={3}>
                              <Typography variant="body2" color="text.secondary">
                                Sent: {campaign.sent}
                              </Typography>
                            </Grid>
                            <Grid item xs={6} sm={3}>
                              <Typography variant="body2" color="text.secondary">
                                Delivered: {campaign.delivered}
                              </Typography>
                            </Grid>
                            <Grid item xs={6} sm={3}>
                              <Typography variant="body2" color="text.secondary">
                                Read: {campaign.read}
                              </Typography>
                            </Grid>
                            <Grid item xs={6} sm={3}>
                              <Typography variant="body2" color="text.secondary">
                                Response: {campaign.response}
                              </Typography>
                            </Grid>
                          </Grid>
                          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                            Created: {campaign.createdAt}
                            {campaign.scheduledFor && ` • Scheduled: ${campaign.scheduledFor}`}
                          </Typography>
                        </Box>
                      }
                    />
                    <ListItemSecondaryAction>
                      <IconButton edge="end">
                        <MoreVert />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Campaign Statistics
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography>Total Campaigns</Typography>
                  <Typography variant="h6">24</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography>Active</Typography>
                  <Typography variant="h6" color="success.main">3</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography>Completed</Typography>
                  <Typography variant="h6" color="primary.main">18</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography>Draft</Typography>
                  <Typography variant="h6" color="text.secondary">3</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography>Avg. Response Rate</Typography>
                  <Typography variant="h6" color="primary.main">23.5%</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>

          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Quick Actions
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Button variant="outlined" startIcon={<Add />} fullWidth>
                  Create Campaign
                </Button>
                <Button variant="outlined" startIcon={<Campaign />} fullWidth>
                  Import Contacts
                </Button>
                <Button variant="outlined" startIcon={<Edit />} fullWidth>
                  Templates
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Create Campaign Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Create New Campaign</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField label="Campaign Name" fullWidth />
            <TextField label="Message Content" fullWidth multiline rows={4} />
            <FormControl fullWidth>
              <InputLabel>Target Audience</InputLabel>
              <Select label="Target Audience">
                <MenuItem value="all">All Contacts</MenuItem>
                <MenuItem value="vip">VIP Customers</MenuItem>
                <MenuItem value="leads">Leads</MenuItem>
                <MenuItem value="custom">Custom Segment</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Schedule Date"
              type="datetime-local"
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => setOpenDialog(false)}>
            Create Campaign
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Campaigns;
