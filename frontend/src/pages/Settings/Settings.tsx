import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
} from '@mui/material';
import {
  Save,
  Edit,
  Delete,
  Add,
  Security,
  Notifications,
  WhatsApp,
  Api,
} from '@mui/icons-material';

const Settings: React.FC = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [settings, setSettings] = useState({
    organizationName: 'My Company',
    timezone: 'UTC-5',
    language: 'en',
    notifications: {
      email: true,
      sms: false,
      push: true,
    },
    whatsapp: {
      accessToken: 'your-access-token',
      phoneNumberId: 'your-phone-number-id',
      webhookUrl: 'https://your-domain.com/webhook',
    },
  });

  const handleSave = () => {
    // In real app, this would save to API
    console.log('Settings saved:', settings);
  };

  const apiKeys = [
    { id: 1, name: 'WhatsApp Business API', key: 'wha_****1234', created: '2024-01-15' },
    { id: 2, name: 'OpenAI API', key: 'sk-****5678', created: '2024-01-10' },
    { id: 3, name: 'Twilio API', key: 'AC****9012', created: '2024-01-05' },
  ];

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Settings
      </Typography>

      <Grid container spacing={3}>
        {/* General Settings */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                General Settings
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  label="Organization Name"
                  value={settings.organizationName}
                  onChange={(e) => setSettings({ ...settings, organizationName: e.target.value })}
                  fullWidth
                />
                <TextField
                  label="Timezone"
                  value={settings.timezone}
                  onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
                  fullWidth
                  select
                  SelectProps={{ native: true }}
                >
                  <option value="UTC-5">UTC-5 (EST)</option>
                  <option value="UTC-8">UTC-8 (PST)</option>
                  <option value="UTC+0">UTC+0 (GMT)</option>
                  <option value="UTC+5:30">UTC+5:30 (IST)</option>
                </TextField>
                <TextField
                  label="Language"
                  value={settings.language}
                  onChange={(e) => setSettings({ ...settings, language: e.target.value })}
                  fullWidth
                  select
                  SelectProps={{ native: true }}
                >
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                  <option value="de">German</option>
                </TextField>
                <Button variant="contained" startIcon={<Save />} onClick={handleSave}>
                  Save Changes
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Notification Settings */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Notification Settings
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.notifications.email}
                      onChange={(e) => setSettings({
                        ...settings,
                        notifications: { ...settings.notifications, email: e.target.checked }
                      })}
                    />
                  }
                  label="Email Notifications"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.notifications.sms}
                      onChange={(e) => setSettings({
                        ...settings,
                        notifications: { ...settings.notifications, sms: e.target.checked }
                      })}
                    />
                  }
                  label="SMS Notifications"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.notifications.push}
                      onChange={(e) => setSettings({
                        ...settings,
                        notifications: { ...settings.notifications, push: e.target.checked }
                      })}
                    />
                  }
                  label="Push Notifications"
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* WhatsApp Settings */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                WhatsApp Configuration
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  label="Access Token"
                  value={settings.whatsapp.accessToken}
                  onChange={(e) => setSettings({
                    ...settings,
                    whatsapp: { ...settings.whatsapp, accessToken: e.target.value }
                  })}
                  fullWidth
                  type="password"
                />
                <TextField
                  label="Phone Number ID"
                  value={settings.whatsapp.phoneNumberId}
                  onChange={(e) => setSettings({
                    ...settings,
                    whatsapp: { ...settings.whatsapp, phoneNumberId: e.target.value }
                  })}
                  fullWidth
                />
                <TextField
                  label="Webhook URL"
                  value={settings.whatsapp.webhookUrl}
                  onChange={(e) => setSettings({
                    ...settings,
                    whatsapp: { ...settings.whatsapp, webhookUrl: e.target.value }
                  })}
                  fullWidth
                />
                <Button variant="outlined" startIcon={<WhatsApp />}>
                  Test Connection
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* API Keys */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  API Keys
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<Add />}
                  onClick={() => setOpenDialog(true)}
                >
                  Add Key
                </Button>
              </Box>
              <List>
                {apiKeys.map((apiKey) => (
                  <ListItem key={apiKey.id} divider>
                    <ListItemText
                      primary={apiKey.name}
                      secondary={`Created: ${apiKey.created}`}
                    />
                    <ListItemSecondaryAction>
                      <IconButton edge="end" size="small">
                        <Edit />
                      </IconButton>
                      <IconButton edge="end" size="small" color="error">
                        <Delete />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Security Settings */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Security
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <Button variant="outlined" startIcon={<Security />} fullWidth>
                    Change Password
                  </Button>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Button variant="outlined" startIcon={<Api />} fullWidth>
                    Two-Factor Authentication
                  </Button>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Button variant="outlined" color="error" fullWidth>
                    Delete Account
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Add API Key Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New API Key</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField label="API Key Name" fullWidth />
            <TextField label="API Key Value" fullWidth type="password" />
            <TextField label="Description" fullWidth multiline rows={2} />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => setOpenDialog(false)}>
            Add Key
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Settings;
