import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Paper,
  Button,
  styled,
  Container,
  IconButton,
  Chip,
  Badge,
  Divider,
  Avatar
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import NotificationsIcon from '@mui/icons-material/Notifications';
import InfoIcon from '@mui/icons-material/Info';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';

// Styled components matching VolunteerDash
const StyledContainer = styled(Box)(() => ({
  minHeight: '100vh',
  width: '100vw',
  background: 'linear-gradient(135deg, #3AB795 0%, #F76C5E 50%, #FFD972 100%)',
  padding: '40px 20px',
}));

const HeaderCard = styled(Paper)(() => ({
  padding: '24px 32px',
  borderRadius: '24px',
  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.85) 100%)',
  backdropFilter: 'blur(10px)',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
  border: '1px solid rgba(58, 183, 149, 0.2)',
  marginBottom: '24px',
}));

const StyledPaper = styled(Paper)(() => ({
  padding: '32px',
  borderRadius: '24px',
  background: '#F9F9F9',
  backdropFilter: 'blur(10px)',
  boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
  border: '1px solid rgba(58, 183, 149, 0.1)',
  marginBottom: '24px',
}));

const NotificationItem = styled(Paper)(() => ({
  padding: '16px 20px',
  borderRadius: '12px',
  background: '#ffffff',
  marginBottom: '12px',
  transition: 'all 0.3s ease',
  border: '1px solid rgba(0, 0, 0, 0.05)',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 20px rgba(0, 0, 0, 0.08)',
  },
}));

const BackButton = styled(Button)(() => ({
  padding: '10px 20px',
  borderRadius: '12px',
  fontWeight: 600,
  textTransform: 'none',
  color: '#666666',
  border: '2px solid #e0e6ed',
  backgroundColor: 'rgba(255, 255, 255, 0.9)',
  '&:hover': {
    backgroundColor: '#ffffff',
    borderColor: '#3AB795',
    color: '#3AB795',
  },
}));

const SectionTitle = styled(Typography)(() => ({
  color: '#333333',
  fontWeight: 700,
  marginBottom: '24px',
  fontSize: '1.5rem',
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  '&:after': {
    content: '""',
    flex: 1,
    height: '2px',
    background: 'linear-gradient(to right, #3AB795, transparent)',
  }
}));

export default function AdminNotifications() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([
    { 
      id: 1, 
      message: 'New volunteer John Doe registered for Beach Cleanup event', 
      type: 'info', 
      timestamp: new Date(Date.now() - 3600000),
      read: false 
    },
    { 
      id: 2, 
      message: 'Food Drive event needs 3 more volunteers - urgent!', 
      type: 'warning', 
      timestamp: new Date(Date.now() - 7200000),
      read: false 
    },
    { 
      id: 3, 
      message: 'Clothing Distribution completed successfully with 15 volunteers', 
      type: 'success', 
      timestamp: new Date(Date.now() - 86400000),
      read: true 
    },
    { 
      id: 4, 
      message: 'Tree Planting event cancelled due to weather conditions', 
      type: 'error', 
      timestamp: new Date(Date.now() - 172800000),
      read: true 
    },
    { 
      id: 5, 
      message: 'New event "Community Garden Setup" created and published', 
      type: 'success', 
      timestamp: new Date(Date.now() - 259200000),
      read: true 
    }
  ]);

  const getNotificationIcon = (type) => {
    switch(type) {
      case 'success': return <CheckCircleIcon sx={{ color: '#2ecc71' }} />;
      case 'warning': return <WarningIcon sx={{ color: '#f39c12' }} />;
      case 'error': return <ErrorIcon sx={{ color: '#e74c3c' }} />;
      default: return <InfoIcon sx={{ color: '#3AB795' }} />;
    }
  };

  const getNotificationColor = (type) => {
    switch(type) {
      case 'success': return 'rgba(46, 204, 113, 0.1)';
      case 'warning': return 'rgba(243, 156, 18, 0.1)';
      case 'error': return 'rgba(231, 76, 60, 0.1)';
      default: return 'rgba(58, 183, 149, 0.1)';
    }
  };

  const getTypeChipColor = (type) => {
    switch(type) {
      case 'success': return { bg: 'rgba(46, 204, 113, 0.1)', color: '#2ecc71' };
      case 'warning': return { bg: 'rgba(243, 156, 18, 0.1)', color: '#f39c12' };
      case 'error': return { bg: 'rgba(231, 76, 60, 0.1)', color: '#e74c3c' };
      default: return { bg: 'rgba(58, 183, 149, 0.1)', color: '#3AB795' };
    }
  };

  const formatTimestamp = (date) => {
    const now = new Date();
    const diff = now - date;
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    return 'Just now';
  };

  const handleMarkAsRead = (id) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const handleDeleteNotification = (id) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <StyledContainer>
      <Container maxWidth="lg">
        {/* Header Section */}
        <HeaderCard elevation={0}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box>
              <Box display="flex" alignItems="center" gap={2}>
                <Badge badgeContent={unreadCount} color="error">
                  <Avatar sx={{ bgcolor: '#3AB795', width: 48, height: 48 }}>
                    <NotificationsIcon />
                  </Avatar>
                </Badge>
                <Box>
                  <Typography variant="h4" fontWeight="bold" sx={{ color: '#333333' }}>
                    Notifications Center
                  </Typography>
                  <Typography variant="body1" sx={{ color: '#666666' }}>
                    Stay updated with your volunteer management activities
                  </Typography>
                </Box>
              </Box>
            </Box>
            <BackButton 
              onClick={() => navigate('/admin')}
              startIcon={<ArrowBackIcon />}
            >
              Back to Dashboard
            </BackButton>
          </Box>
        </HeaderCard>

        {/* Stats Cards */}
        <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
          <Paper sx={{ 
            flex: 1, 
            minWidth: '200px',
            p: 2, 
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
            border: '1px solid rgba(58, 183, 149, 0.1)'
          }}>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography variant="h4" fontWeight="bold" sx={{ color: '#3AB795' }}>
                  {unreadCount}
                </Typography>
                <Typography variant="body2" sx={{ color: '#666666' }}>
                  Unread
                </Typography>
              </Box>
              <NotificationsIcon sx={{ fontSize: 32, color: '#3AB795', opacity: 0.3 }} />
            </Box>
          </Paper>
          
          <Paper sx={{ 
            flex: 1, 
            minWidth: '200px',
            p: 2, 
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
            border: '1px solid rgba(243, 156, 18, 0.1)'
          }}>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography variant="h4" fontWeight="bold" sx={{ color: '#f39c12' }}>
                  {notifications.filter(n => n.type === 'warning').length}
                </Typography>
                <Typography variant="body2" sx={{ color: '#666666' }}>
                  Warnings
                </Typography>
              </Box>
              <WarningIcon sx={{ fontSize: 32, color: '#f39c12', opacity: 0.3 }} />
            </Box>
          </Paper>
          
          <Paper sx={{ 
            flex: 1, 
            minWidth: '200px',
            p: 2, 
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
            border: '1px solid rgba(46, 204, 113, 0.1)'
          }}>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography variant="h4" fontWeight="bold" sx={{ color: '#2ecc71' }}>
                  {notifications.filter(n => n.type === 'success').length}
                </Typography>
                <Typography variant="body2" sx={{ color: '#666666' }}>
                  Success
                </Typography>
              </Box>
              <CheckCircleIcon sx={{ fontSize: 32, color: '#2ecc71', opacity: 0.3 }} />
            </Box>
          </Paper>
        </Box>

        {/* Notifications List */}
        <StyledPaper elevation={0}>
          <SectionTitle variant="h5">
            <NotificationsIcon sx={{ color: '#3AB795' }} />
            Recent Notifications
          </SectionTitle>

          {notifications.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 6 }}>
              <NotificationsIcon sx={{ fontSize: 64, color: '#e0e6ed', mb: 2 }} />
              <Typography variant="h6" sx={{ color: '#666666', mb: 1 }}>
                No notifications yet
              </Typography>
              <Typography variant="body2" sx={{ color: '#999999' }}>
                You'll see important updates about your events and volunteers here
              </Typography>
            </Box>
          ) : (
            <List sx={{ p: 0 }}>
              {notifications.map((notification) => (
                <NotificationItem 
                  key={notification.id} 
                  elevation={0}
                  sx={{ 
                    borderLeft: `4px solid ${notification.read ? 'transparent' : '#3AB795'}`,
                    backgroundColor: notification.read ? '#ffffff' : getNotificationColor(notification.type)
                  }}
                >
                  <Box display="flex" alignItems="flex-start" gap={2}>
                    <Box sx={{ mt: 0.5 }}>
                      {getNotificationIcon(notification.type)}
                    </Box>
                    <Box flex={1}>
                      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
                        <Typography 
                          variant="body1" 
                          sx={{ 
                            color: '#333333',
                            fontWeight: notification.read ? 400 : 600,
                            flex: 1,
                            mr: 2
                          }}
                        >
                          {notification.message}
                        </Typography>
                        <Box display="flex" gap={1}>
                          {!notification.read && (
                            <IconButton 
                              size="small"
                              onClick={() => handleMarkAsRead(notification.id)}
                              sx={{ color: '#3AB795' }}
                            >
                              <CheckCircleIcon fontSize="small" />
                            </IconButton>
                          )}
                          <IconButton 
                            size="small"
                            onClick={() => handleDeleteNotification(notification.id)}
                            sx={{ color: '#999999' }}
                          >
                            <DeleteOutlineIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </Box>
                      <Box display="flex" alignItems="center" gap={2}>
                        <Chip 
                          label={notification.type.charAt(0).toUpperCase() + notification.type.slice(1)}
                          size="small"
                          sx={{
                            backgroundColor: getTypeChipColor(notification.type).bg,
                            color: getTypeChipColor(notification.type).color,
                            fontWeight: 500,
                            border: 'none'
                          }}
                        />
                        <Box display="flex" alignItems="center" gap={0.5}>
                          <AccessTimeIcon sx={{ fontSize: 14, color: '#999999' }} />
                          <Typography variant="caption" sx={{ color: '#999999' }}>
                            {formatTimestamp(notification.timestamp)}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  </Box>
                </NotificationItem>
              ))}
            </List>
          )}
        </StyledPaper>
      </Container>
    </StyledContainer>
  );
}