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
  ListItemAvatar,
  Avatar,
  Chip,
  TextField,
  IconButton,
  Badge,
} from '@mui/material';
import {
  Search,
  Reply,
  Archive,
  Delete,
  MarkAsUnread,
  MoreVert,
  Message,
} from '@mui/icons-material';

const Inbox: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedConversation, setSelectedConversation] = useState<number | null>(null);

  // Mock data - in real app, this would come from API
  const conversations = [
    {
      id: 1,
      contact: { name: 'John Doe', phone: '+1234567890', avatar: 'JD' },
      lastMessage: 'Thank you for the information!',
      timestamp: '2 minutes ago',
      unread: 2,
      status: 'active',
    },
    {
      id: 2,
      contact: { name: 'Jane Smith', phone: '+1234567891', avatar: 'JS' },
      lastMessage: 'Can you send me more details about the product?',
      timestamp: '15 minutes ago',
      unread: 1,
      status: 'active',
    },
    {
      id: 3,
      contact: { name: 'Bob Johnson', phone: '+1234567892', avatar: 'BJ' },
      lastMessage: 'I\'m interested in your services',
      timestamp: '1 hour ago',
      unread: 0,
      status: 'active',
    },
    {
      id: 4,
      contact: { name: 'Alice Brown', phone: '+1234567893', avatar: 'AB' },
      lastMessage: 'When will my order be delivered?',
      timestamp: '2 hours ago',
      unread: 0,
      status: 'resolved',
    },
  ];

  const filteredConversations = conversations.filter(conv =>
    conv.contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.contact.phone.includes(searchTerm) ||
    conv.lastMessage.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedConv = conversations.find(conv => conv.id === selectedConversation);

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Inbox
      </Typography>

      <Grid container spacing={3} sx={{ height: 'calc(100vh - 200px)' }}>
        {/* Conversations List */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ mb: 2 }}>
                <TextField
                  fullWidth
                  placeholder="Search conversations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
                  }}
                />
              </Box>
              <List sx={{ height: 'calc(100% - 80px)', overflow: 'auto' }}>
                {filteredConversations.map((conversation) => (
                  <ListItem
                    key={conversation.id}
                    button
                    selected={selectedConversation === conversation.id}
                    onClick={() => setSelectedConversation(conversation.id)}
                    sx={{
                      borderRadius: 1,
                      mb: 1,
                      '&.Mui-selected': {
                        backgroundColor: 'primary.light',
                        '&:hover': {
                          backgroundColor: 'primary.light',
                        },
                      },
                    }}
                  >
                    <ListItemAvatar>
                      <Badge
                        badgeContent={conversation.unread}
                        color="error"
                        invisible={conversation.unread === 0}
                      >
                        <Avatar sx={{ bgcolor: 'primary.main' }}>
                          {conversation.contact.avatar}
                        </Avatar>
                      </Badge>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="subtitle1" fontWeight={conversation.unread > 0 ? 'bold' : 'normal'}>
                            {conversation.contact.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {conversation.timestamp}
                          </Typography>
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              fontWeight: conversation.unread > 0 ? 'bold' : 'normal',
                            }}
                          >
                            {conversation.lastMessage}
                          </Typography>
                          <Chip
                            label={conversation.status}
                            size="small"
                            color={conversation.status === 'active' ? 'success' : 'default'}
                            sx={{ mt: 0.5 }}
                          />
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Conversation Detail */}
        <Grid item xs={12} md={8}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              {selectedConv ? (
                <>
                  {/* Conversation Header */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, pb: 2, borderBottom: 1, borderColor: 'divider' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
                        {selectedConv.contact.avatar}
                      </Avatar>
                      <Box>
                        <Typography variant="h6">{selectedConv.contact.name}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {selectedConv.contact.phone}
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <IconButton>
                        <Reply />
                      </IconButton>
                      <IconButton>
                        <Archive />
                      </IconButton>
                      <IconButton>
                        <Delete />
                      </IconButton>
                      <IconButton>
                        <MoreVert />
                      </IconButton>
                    </Box>
                  </Box>

                  {/* Messages Area */}
                  <Box sx={{ flexGrow: 1, overflow: 'auto', mb: 2 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                      Conversation messages will appear here
                    </Typography>
                  </Box>

                  {/* Message Input */}
                  <Box sx={{ display: 'flex', gap: 1, pt: 2, borderTop: 1, borderColor: 'divider' }}>
                    <TextField
                      fullWidth
                      placeholder="Type your message..."
                      multiline
                      maxRows={3}
                    />
                    <Button variant="contained" startIcon={<Message />}>
                      Send
                    </Button>
                  </Box>
                </>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                  <Message sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary">
                    Select a conversation to start messaging
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Inbox;
