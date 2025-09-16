import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  TextField,
  Switch,
  FormControlLabel,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
} from '@mui/material';
import { Add, Edit, Delete, SmartToy, PlayArrow, Pause } from '@mui/icons-material';

const Chatbot: React.FC = () => {
  const [isEnabled, setIsEnabled] = useState(true);

  // Mock data - in real app, this would come from API
  const chatbotFlows = [
    {
      id: 1,
      name: 'Welcome Flow',
      trigger: 'New Contact',
      status: 'active',
      responses: 45,
      lastUsed: '2 hours ago',
    },
    {
      id: 2,
      name: 'Support Flow',
      trigger: 'Help Request',
      status: 'active',
      responses: 23,
      lastUsed: '1 day ago',
    },
    {
      id: 3,
      name: 'Sales Flow',
      trigger: 'Product Inquiry',
      status: 'inactive',
      responses: 12,
      lastUsed: '3 days ago',
    },
  ];

  const quickReplies = [
    { id: 1, text: 'Hello! How can I help you?', category: 'Greeting' },
    { id: 2, text: 'Thank you for your message!', category: 'Acknowledgment' },
    { id: 3, text: 'Please wait while I connect you to a human agent.', category: 'Transfer' },
    { id: 4, text: 'Sorry, I didn\'t understand. Can you rephrase?', category: 'Clarification' },
  ];

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          Chatbot
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <FormControlLabel
            control={
              <Switch
                checked={isEnabled}
                onChange={(e) => setIsEnabled(e.target.checked)}
                color="primary"
              />
            }
            label="Enable Chatbot"
          />
          <Button variant="contained" startIcon={<Add />}>
            Create Flow
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Conversation Flows
              </Typography>
              <List>
                {chatbotFlows.map((flow) => (
                  <ListItem key={flow.id} divider>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <SmartToy color="primary" />
                          <Typography variant="h6">{flow.name}</Typography>
                          <Chip
                            label={flow.status}
                            size="small"
                            color={flow.status === 'active' ? 'success' : 'default'}
                          />
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            Trigger: {flow.trigger}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Responses: {flow.responses} • Last used: {flow.lastUsed}
                          </Typography>
                        </Box>
                      }
                    />
                    <ListItemSecondaryAction>
                      <IconButton edge="end" color="primary">
                        <PlayArrow />
                      </IconButton>
                      <IconButton edge="end">
                        <Edit />
                      </IconButton>
                      <IconButton edge="end" color="error">
                        <Delete />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Quick Replies
              </Typography>
              <List>
                {quickReplies.map((reply) => (
                  <ListItem key={reply.id} divider>
                    <ListItemText
                      primary={reply.text}
                      secondary={
                        <Chip label={reply.category} size="small" variant="outlined" />
                      }
                    />
                    <ListItemSecondaryAction>
                      <IconButton edge="end">
                        <Edit />
                      </IconButton>
                      <IconButton edge="end" color="error">
                        <Delete />
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
                Chatbot Statistics
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography>Total Conversations</Typography>
                  <Typography variant="h6">1,234</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography>Auto Responses</Typography>
                  <Typography variant="h6" color="success.main">980</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography>Human Handoffs</Typography>
                  <Typography variant="h6" color="primary.main">254</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography>Response Rate</Typography>
                  <Typography variant="h6" color="primary.main">79.4%</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>

          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Add Quick Reply
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  label="Reply Text"
                  multiline
                  rows={3}
                  fullWidth
                />
                <TextField
                  label="Category"
                  fullWidth
                />
                <Button variant="contained" fullWidth>
                  Add Reply
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Chatbot;
