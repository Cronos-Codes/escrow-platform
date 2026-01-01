'use client'
import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Stack,
  Button,
  TextField,
  Avatar,
  Chip,
  Divider,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
} from '@mui/material';
import {
  IconUser,
  IconMail,
  IconCalendar,
  IconShield,
  IconEdit,
  IconDeviceFloppy,
  IconX,
  IconCamera,
  IconKey,
  IconBell,
  IconSettings,
  IconCheck,
  IconAlertCircle,
} from '@tabler/icons-react';
import { motion } from 'framer-motion';
import PageContainer from '@/app/(DashboardLayout)/components/container/PageContainer';
import { useRequireRole } from '@/hooks/useRequireRole';
import { useAuth } from '@/components/auth/AuthProvider';

const ProfilePage = () => {
  // Require admin or operator role
  useRequireRole(['ADMIN', 'OPERATOR']);

  const { user, userRoles } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  
  // Form states
  const [profileData, setProfileData] = useState({
    name: '',
    displayName: '',
    email: '',
    phone: '',
    department: '',
    bio: '',
  });

  // Password change states
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Notification preferences
  const [notificationPrefs, setNotificationPrefs] = useState({
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    securityAlerts: true,
    systemUpdates: true,
    weeklyReports: false,
  });

  // Client-side rendering protection
  useEffect(() => {
    setIsClient(true);
    if (user) {
      setProfileData({
        name: user.displayName || 'Admin User',
        displayName: user.displayName || 'Admin User',
        email: user.email || '',
        phone: user.phoneNumber || '',
        department: 'Administration',
        bio: 'Gold Escrow Platform Administrator',
      });
    }
  }, [user]);

  // Helper functions
  const formatDate = (timestamp: number | string) => {
    if (!isClient) return 'Loading...';
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleSaveProfile = async () => {
    try {
      // TODO: Implement Firebase profile update
      console.log('Saving profile:', profileData);
      setIsEditing(false);
      // Show success message
    } catch (error) {
      console.error('Error saving profile:', error);
    }
  };

  const handleChangePassword = async () => {
    try {
      // TODO: Implement password change
      console.log('Changing password');
      setShowChangePassword(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      // Show success message
    } catch (error) {
      console.error('Error changing password:', error);
    }
  };

  const handleSaveNotifications = () => {
    try {
      // TODO: Implement notification preferences save
      console.log('Saving notification preferences:', notificationPrefs);
      setShowNotifications(false);
      // Show success message
    } catch (error) {
      console.error('Error saving notification preferences:', error);
    }
  };

  return (
    <PageContainer title="My Profile" description="Manage your admin profile and preferences">
      <Box>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Card sx={{ mb: 4, boxShadow: 2 }}>
            <CardContent sx={{ py: 4 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
                <Box>
                  <Typography variant="h4" fontWeight="bold" sx={{ color: '#FF6B35', mb: 1 }}>
                    My Profile
                  </Typography>
                  <Typography variant="body1" color="textSecondary">
                    Manage your admin profile, security settings, and preferences
                  </Typography>
                </Box>
                <Stack direction="row" spacing={2}>
                  <Button 
                    variant="outlined" 
                    startIcon={<IconBell />}
                    onClick={() => setShowNotifications(true)}
                    sx={{ 
                      borderColor: '#FF6B35',
                      color: '#FF6B35',
                      '&:hover': { 
                        borderColor: '#FF6B35', 
                        backgroundColor: 'rgba(255, 107, 53, 0.05)' 
                      }
                    }}
                  >
                    Notifications
                  </Button>
                  <Button 
                    variant="contained" 
                    startIcon={isEditing ? <IconX /> : <IconEdit />}
                    onClick={() => setIsEditing(!isEditing)}
                    sx={{ 
                      backgroundColor: '#FF6B35', 
                      color: '#ffffff',
                      '&:hover': { backgroundColor: '#E55A2B' }
                    }}
                  >
                    {isEditing ? 'Cancel' : 'Edit Profile'}
                  </Button>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        </motion.div>

        <Grid container spacing={3}>
          {/* Left Column - Profile Information */}
          <Grid item xs={12} lg={8}>
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ color: '#FF6B35', fontWeight: 'bold' }}>
                  <IconUser size={20} style={{ marginRight: 8, verticalAlign: 'middle' }} />
                  Profile Information
                </Typography>
                
                <Grid container spacing={3} sx={{ mt: 2 }}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Full Name"
                      value={profileData.name}
                      onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                      disabled={!isEditing}
                      fullWidth
                      InputProps={{
                        startAdornment: <IconUser size={20} style={{ marginRight: 8, color: '#666' }} />
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Display Name"
                      value={profileData.displayName}
                      onChange={(e) => setProfileData({ ...profileData, displayName: e.target.value })}
                      disabled={!isEditing}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Email Address"
                      value={profileData.email}
                      disabled
                      fullWidth
                      InputProps={{
                        startAdornment: <IconMail size={20} style={{ marginRight: 8, color: '#666' }} />
                      }}
                      helperText="Email cannot be changed"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Phone Number"
                      value={profileData.phone}
                      onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                      disabled={!isEditing}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Department"
                      value={profileData.department}
                      onChange={(e) => setProfileData({ ...profileData, department: e.target.value })}
                      disabled={!isEditing}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      label="Bio"
                      value={profileData.bio}
                      onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                      disabled={!isEditing}
                      fullWidth
                      multiline
                      rows={3}
                    />
                  </Grid>
                </Grid>

                {isEditing && (
                  <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                    <Button
                      variant="outlined"
                      onClick={() => setIsEditing(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="contained"
                      startIcon={<IconDeviceFloppy />}
                      onClick={handleSaveProfile}
                      sx={{ 
                        backgroundColor: '#4CAF50', 
                        '&:hover': { backgroundColor: '#45a049' }
                      }}
                    >
                      Save Changes
                    </Button>
                  </Box>
                )}
              </CardContent>
            </Card>

            {/* Account Information */}
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ color: '#FF6B35', fontWeight: 'bold' }}>
                  <IconShield size={20} style={{ marginRight: 8, verticalAlign: 'middle' }} />
                  Account Information
                </Typography>
                
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <IconUser />
                    </ListItemIcon>
                    <ListItemText
                      primary="User ID"
                      secondary={user?.uid || 'Loading...'}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <IconCalendar />
                    </ListItemIcon>
                    <ListItemText
                      primary="Account Created"
                      secondary={user?.metadata?.creationTime ? formatDate(user.metadata.creationTime) : 'Loading...'}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <IconCalendar />
                    </ListItemIcon>
                    <ListItemText
                      primary="Last Sign In"
                      secondary={user?.metadata?.lastSignInTime ? formatDate(user.metadata.lastSignInTime) : 'Loading...'}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <IconShield />
                    </ListItemIcon>
                    <ListItemText
                      primary="Email Verified"
                      secondary={user?.emailVerified ? 'Yes' : 'No'}
                    />
                    <ListItemSecondaryAction>
                      <Chip 
                        label={user?.emailVerified ? 'Verified' : 'Unverified'} 
                        color={user?.emailVerified ? 'success' : 'warning'}
                        size="small"
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>

          {/* Right Column - Profile Picture & Quick Actions */}
          <Grid item xs={12} lg={4}>
            {/* Profile Picture */}
            <Card sx={{ mb: 3 }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h6" gutterBottom sx={{ color: '#FF6B35', fontWeight: 'bold' }}>
                  Profile Picture
                </Typography>
                
                <Box sx={{ position: 'relative', display: 'inline-block', mb: 2 }}>
                  <Avatar
                    sx={{
                      width: 120,
                      height: 120,
                      bgcolor: 'primary.main',
                      fontSize: '3rem',
                      mb: 2
                    }}
                  >
                    {profileData.name.charAt(0).toUpperCase()}
                  </Avatar>
                  {isEditing && (
                    <Tooltip title="Change Profile Picture">
                      <IconButton
                        sx={{
                          position: 'absolute',
                          bottom: 8,
                          right: 8,
                          bgcolor: 'primary.main',
                          color: 'white',
                          '&:hover': { bgcolor: 'primary.dark' }
                        }}
                      >
                        <IconCamera size={20} />
                      </IconButton>
                    </Tooltip>
                  )}
                </Box>

                <Typography variant="body2" color="textSecondary">
                  {profileData.displayName}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {profileData.department}
                </Typography>
              </CardContent>
            </Card>

            {/* User Roles */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ color: '#FF6B35', fontWeight: 'bold' }}>
                  User Roles
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  {userRoles.map((role) => (
                    <Chip
                      key={role}
                      label={role}
                      color="primary"
                      variant="outlined"
                      size="small"
                    />
                  ))}
                </Stack>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ color: '#FF6B35', fontWeight: 'bold' }}>
                  Quick Actions
                </Typography>
                <Stack spacing={2}>
                  <Button
                    variant="outlined"
                    startIcon={<IconKey />}
                    onClick={() => setShowChangePassword(true)}
                    fullWidth
                    sx={{ 
                      borderColor: '#FF9800',
                      color: '#FF9800',
                      '&:hover': { 
                        borderColor: '#FF9800', 
                        backgroundColor: 'rgba(255, 152, 0, 0.05)' 
                      }
                    }}
                  >
                    Change Password
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<IconBell />}
                    onClick={() => setShowNotifications(true)}
                    fullWidth
                    sx={{ 
                      borderColor: '#2196F3',
                      color: '#2196F3',
                      '&:hover': { 
                        borderColor: '#2196F3', 
                        backgroundColor: 'rgba(33, 150, 243, 0.05)' 
                      }
                    }}
                  >
                    Notification Settings
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<IconSettings />}
                    onClick={() => window.location.href = '/admin/settings'}
                    fullWidth
                    sx={{ 
                      borderColor: '#9C27B0',
                      color: '#9C27B0',
                      '&:hover': { 
                        borderColor: '#9C27B0', 
                        backgroundColor: 'rgba(156, 39, 176, 0.05)' 
                      }
                    }}
                  >
                    Platform Settings
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Change Password Dialog */}
        <Dialog open={showChangePassword} onClose={() => setShowChangePassword(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Change Password</DialogTitle>
          <DialogContent>
            <Stack spacing={3} sx={{ mt: 2 }}>
              <TextField
                label="Current Password"
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                fullWidth
              />
              <TextField
                label="New Password"
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                fullWidth
              />
              <TextField
                label="Confirm New Password"
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                fullWidth
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowChangePassword(false)}>Cancel</Button>
            <Button 
              variant="contained" 
              onClick={handleChangePassword}
              disabled={!passwordData.currentPassword || !passwordData.newPassword || passwordData.newPassword !== passwordData.confirmPassword}
            >
              Change Password
            </Button>
          </DialogActions>
        </Dialog>

        {/* Notification Preferences Dialog */}
        <Dialog open={showNotifications} onClose={() => setShowNotifications(false)} maxWidth="md" fullWidth>
          <DialogTitle>Notification Preferences</DialogTitle>
          <DialogContent>
            <Stack spacing={3} sx={{ mt: 2 }}>
              <Alert severity="info">
                Configure how you want to receive notifications from the Gold Escrow platform.
              </Alert>
              
              <List>
                <ListItem>
                  <ListItemText
                    primary="Email Notifications"
                    secondary="Receive notifications via email"
                  />
                  <ListItemSecondaryAction>
                    <Button
                      variant={notificationPrefs.emailNotifications ? "contained" : "outlined"}
                      size="small"
                      onClick={() => setNotificationPrefs({ ...notificationPrefs, emailNotifications: !notificationPrefs.emailNotifications })}
                    >
                      {notificationPrefs.emailNotifications ? 'On' : 'Off'}
                    </Button>
                  </ListItemSecondaryAction>
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Push Notifications"
                    secondary="Receive push notifications in browser"
                  />
                  <ListItemSecondaryAction>
                    <Button
                      variant={notificationPrefs.pushNotifications ? "contained" : "outlined"}
                      size="small"
                      onClick={() => setNotificationPrefs({ ...notificationPrefs, pushNotifications: !notificationPrefs.pushNotifications })}
                    >
                      {notificationPrefs.pushNotifications ? 'On' : 'Off'}
                    </Button>
                  </ListItemSecondaryAction>
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Security Alerts"
                    secondary="Important security-related notifications"
                  />
                  <ListItemSecondaryAction>
                    <Button
                      variant={notificationPrefs.securityAlerts ? "contained" : "outlined"}
                      size="small"
                      onClick={() => setNotificationPrefs({ ...notificationPrefs, securityAlerts: !notificationPrefs.securityAlerts })}
                    >
                      {notificationPrefs.securityAlerts ? 'On' : 'Off'}
                    </Button>
                  </ListItemSecondaryAction>
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="System Updates"
                    secondary="Platform updates and maintenance notifications"
                  />
                  <ListItemSecondaryAction>
                    <Button
                      variant={notificationPrefs.systemUpdates ? "contained" : "outlined"}
                      size="small"
                      onClick={() => setNotificationPrefs({ ...notificationPrefs, systemUpdates: !notificationPrefs.systemUpdates })}
                    >
                      {notificationPrefs.systemUpdates ? 'On' : 'Off'}
                    </Button>
                  </ListItemSecondaryAction>
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Weekly Reports"
                    secondary="Weekly summary reports"
                  />
                  <ListItemSecondaryAction>
                    <Button
                      variant={notificationPrefs.weeklyReports ? "contained" : "outlined"}
                      size="small"
                      onClick={() => setNotificationPrefs({ ...notificationPrefs, weeklyReports: !notificationPrefs.weeklyReports })}
                    >
                      {notificationPrefs.weeklyReports ? 'On' : 'Off'}
                    </Button>
                  </ListItemSecondaryAction>
                </ListItem>
              </List>
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowNotifications(false)}>Cancel</Button>
            <Button 
              variant="contained" 
              onClick={handleSaveNotifications}
            >
              Save Preferences
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </PageContainer>
  );
};

export default ProfilePage;


