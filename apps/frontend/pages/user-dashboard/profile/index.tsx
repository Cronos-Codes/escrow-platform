import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Avatar,
  Chip,
  IconButton,
  Tooltip,
  alpha,
  useTheme,
  useMediaQuery,
  Divider,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Badge,
  Menu,
  MenuItem,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  CircularProgress,
  Tab,
  Tabs,
  Paper,
  Stack,
  FormControl,
  InputLabel,
  Select,
  AlertTitle,
  LinearProgress,
  Chip as MuiChip,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Security as SecurityIcon,
  Timeline,
  AccountBalance,
  Gavel,
  Receipt,
  Settings as SettingsIcon,
  Help,
  ExitToApp,
  Menu as MenuIcon,
  Notifications,
  Person,
  Edit,
  Save,
  Cancel,
  VerifiedUser,
  Email,
  Phone,
  LocationOn,
  CalendarToday,
  Business,
  Language,
  CreditCard,
  Fingerprint,
  Shield,
  AccountBalanceWallet,
  TrendingUp,
  CheckCircle,
  Warning,
  Info,
  History,
  QrCode2,
  VpnKey,
  Lock,
  Description,
  AccountBox,
  BusinessCenter,
  CorporateFare,
  Apartment,
  AccountCircle,
  AccessTime,
} from '@mui/icons-material';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';

const drawerWidth = 280;

interface UserProfileProps {
  user: {
    id: string;
    name: string;
    email: string;
    phone: string;
    role: 'buyer' | 'seller';
    kycLevel: 'basic' | 'verified' | 'premium';
    walletAddress?: string;
  };
}

interface ProfileData {
  name: string;
  email: string;
  phone: string;
  bio: string;
  location: string;
  accountType: 'individual' | 'company' | 'broker' | 'institution';
  language: string;
  timezone: string;
  displayName: string;
}

interface ActivityStats {
  totalEscrows: number;
  completedEscrows: number;
  totalVolume: number;
  disputesResolved: number;
  successRate: number;
}

interface ActivityItem {
  id: string;
  type: 'escrow' | 'transaction' | 'dispute' | 'profile' | 'security' | 'system';
  title: string;
  description: string;
  timestamp: number;
  status?: 'completed' | 'pending' | 'failed' | 'active';
  amount?: number;
}

const UserProfile: React.FC<UserProfileProps> = ({ user }) => {
  const theme = useTheme();
  const router = useRouter();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuAnchor, setUserMenuAnchor] = useState<null | HTMLElement>(null);
  const [editMode, setEditMode] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' | 'info' });
  const [avatarDialogOpen, setAvatarDialogOpen] = useState(false);
  
  const [profileData, setProfileData] = useState<ProfileData>({
    name: user.name,
    email: user.email,
    phone: user.phone,
    bio: 'Gold Escrow Platform User',
    location: 'United States',
    accountType: 'individual',
    language: 'English',
    timezone: 'UTC',
    displayName: user.name,
  });

  const [emailChangeDialogOpen, setEmailChangeDialogOpen] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [emailChangeReason, setEmailChangeReason] = useState('');
  const [requestingEmailChange, setRequestingEmailChange] = useState(false);
  
  const [phoneChangeDialogOpen, setPhoneChangeDialogOpen] = useState(false);
  const [newPhone, setNewPhone] = useState('');
  const [phoneChangeReason, setPhoneChangeReason] = useState('');
  const [requestingPhoneChange, setRequestingPhoneChange] = useState(false);

  const [activityStats, setActivityStats] = useState<ActivityStats>({
    totalEscrows: 0,
    completedEscrows: 0,
    totalVolume: 0,
    disputesResolved: 0,
    successRate: 0,
  });

  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loadingActivities, setLoadingActivities] = useState(false);

  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [activeSessions, setActiveSessions] = useState([
    {
      id: '1',
      device: 'Chrome on Windows',
      location: 'New York, US',
      ipAddress: '192.168.1.100',
      lastActive: Date.now() - 5 * 60 * 1000, // 5 minutes ago
      current: true,
    },
    {
      id: '2',
      device: 'Safari on iPhone',
      location: 'New York, US',
      ipAddress: '192.168.1.101',
      lastActive: Date.now() - 2 * 60 * 60 * 1000, // 2 hours ago
      current: false,
    },
  ]);

  useEffect(() => {
    fetchProfileData();
    fetchActivityStats();
  }, []);

  useEffect(() => {
    if (tabValue === 1) {
      fetchActivities();
    }
  }, [tabValue]);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/profile?userId=${user.id}`);
      const result = await response.json();
      
      if (result.success && result.data) {
        setProfileData(prev => ({ ...prev, ...result.data }));
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchActivityStats = async () => {
    try {
      const response = await fetch(`/api/profile/stats?userId=${user.id}`);
      const result = await response.json();
      
      if (result.success && result.data) {
        setActivityStats(result.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchActivities = async () => {
    try {
      setLoadingActivities(true);
      const response = await fetch(`/api/profile/activity?userId=${user.id}&limit=50`);
      const result = await response.json();
      
      if (result.success && result.data) {
        setActivities(result.data);
      }
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setLoadingActivities(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, ...profileData }),
      });

      const result = await response.json();
      
      if (result.success) {
        setSnackbar({ open: true, message: 'Profile updated successfully!', severity: 'success' });
        setEditMode(false);
      } else {
        setSnackbar({ open: true, message: result.error || 'Failed to update profile', severity: 'error' });
      }
    } catch (error) {
      setSnackbar({ open: true, message: 'Error updating profile', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/user-dashboard' },
    { text: 'My Escrows', icon: <SecurityIcon />, path: '/user-dashboard/escrows' },
    { text: 'Transactions', icon: <Timeline />, path: '/user-dashboard/transactions' },
    { text: 'Wallet', icon: <AccountBalance />, path: '/user-dashboard/wallet' },
    { text: 'Disputes', icon: <Gavel />, path: '/user-dashboard/disputes' },
    { text: 'Reports', icon: <Receipt />, path: '/user-dashboard/reports' },
    { text: 'Notifications', icon: <Notifications />, path: '/user-dashboard/notifications' },
  ];

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);

  const drawer = (
    <Box>
      <Box sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Avatar sx={{ width: 56, height: 56, bgcolor: 'primary.main', cursor: 'pointer' }} onClick={() => setAvatarDialogOpen(true)}>
          {profileData.displayName.charAt(0).toUpperCase()}
        </Avatar>
        <Box sx={{ flex: 1 }}>
          <Typography variant="subtitle1" fontWeight="bold" noWrap>
            {profileData.displayName}
          </Typography>
          <Chip label={user.kycLevel} size="small" color="primary" sx={{ mt: 0.5 }} />
        </Box>
      </Box>
      
      <Divider />
      
      <List sx={{ px: 2, py: 1 }}>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton
              onClick={() => router.push(item.path)}
              sx={{ borderRadius: 2 }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <Divider sx={{ my: 2 }} />

      <List sx={{ px: 2 }}>
        <ListItem disablePadding>
          <ListItemButton 
            selected
            onClick={() => router.push('/user-dashboard/profile')}
            sx={{ 
              borderRadius: 2,
              bgcolor: alpha(theme.palette.primary.main, 0.1),
            }}
          >
            <ListItemIcon sx={{ minWidth: 40, color: 'primary.main' }}>
              <Person />
            </ListItemIcon>
            <ListItemText primary="Profile" primaryTypographyProps={{ color: 'primary.main', fontWeight: 600 }} />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton onClick={() => router.push('/user-dashboard/settings')} sx={{ borderRadius: 2 }}>
            <ListItemIcon sx={{ minWidth: 40 }}>
              <SettingsIcon />
            </ListItemIcon>
            <ListItemText primary="Settings" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton onClick={() => router.push('/user-dashboard/help')} sx={{ borderRadius: 2 }}>
            <ListItemIcon sx={{ minWidth: 40 }}>
              <Help />
            </ListItemIcon>
            <ListItemText primary="Help & Support" />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );

  return (
    <>
      <Head>
        <title>Profile - Gold Escrow</title>
        <meta name="description" content="View and edit your profile" />
      </Head>

      <Box sx={{ display: 'flex', minHeight: '100vh' }}>
        <AppBar
          position="fixed"
          sx={{
            width: { md: `calc(100% - ${drawerWidth}px)` },
            ml: { md: `${drawerWidth}px` },
            bgcolor: 'white',
            color: 'text.primary',
            boxShadow: 1,
          }}
        >
          <Toolbar>
            <IconButton
              color="inherit"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, display: { md: 'none' } }}
            >
              <MenuIcon />
            </IconButton>
            
            <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, fontWeight: 600 }}>
              Profile
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Tooltip title="Notifications">
                <IconButton size="small" onClick={() => router.push('/user-dashboard/notifications')}>
                  <Badge badgeContent={0} color="error">
                    <Notifications />
                  </Badge>
                </IconButton>
              </Tooltip>

              <IconButton
                onClick={(e) => setUserMenuAnchor(e.currentTarget)}
                size="small"
                sx={{ ml: 1 }}
              >
                <Avatar sx={{ width: 32, height: 32 }}>{profileData.displayName.charAt(0)}</Avatar>
              </IconButton>

              <Menu
                anchorEl={userMenuAnchor}
                open={Boolean(userMenuAnchor)}
                onClose={() => setUserMenuAnchor(null)}
              >
                <MenuItem onClick={() => { router.push('/user-dashboard/profile'); setUserMenuAnchor(null); }}>Profile</MenuItem>
                <MenuItem onClick={() => { router.push('/user-dashboard/settings'); setUserMenuAnchor(null); }}>Settings</MenuItem>
                <Divider />
                <MenuItem onClick={() => router.push('/logout')}>
                  <ExitToApp sx={{ mr: 1 }} /> Logout
                </MenuItem>
              </Menu>
            </Box>
          </Toolbar>
        </AppBar>

        <Box component="nav" sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}>
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={handleDrawerToggle}
            ModalProps={{ keepMounted: true }}
            sx={{
              display: { xs: 'block', md: 'none' },
              '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
            }}
          >
            {drawer}
          </Drawer>

          <Drawer
            variant="permanent"
            sx={{
              display: { xs: 'none', md: 'block' },
              '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
            }}
            open
          >
            {drawer}
          </Drawer>
        </Box>

        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            width: { md: `calc(100% - ${drawerWidth}px)` },
            mt: '64px',
          }}
        >
          <Container maxWidth="lg">
            {loading && !profileData.name ? (
              <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
                <CircularProgress />
              </Box>
            ) : (
              <>
                {/* Profile Header */}
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <Card sx={{ mb: 3, background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)` }}>
                    <CardContent sx={{ p: 4 }}>
                      <Box display="flex" alignItems="center" gap={3} flexWrap="wrap">
                        <Avatar
                          sx={{
                            width: 120,
                            height: 120,
                            bgcolor: 'white',
                            color: 'primary.main',
                            fontSize: '3rem',
                            border: '4px solid white',
                            cursor: 'pointer',
                          }}
                          onClick={() => setAvatarDialogOpen(true)}
                        >
                          {profileData.displayName.charAt(0).toUpperCase()}
                        </Avatar>
                        <Box sx={{ flex: 1, color: 'white' }}>
                          <Typography variant="h4" fontWeight="bold" gutterBottom>
                            {profileData.displayName}
                          </Typography>
                          <Typography variant="body1" sx={{ mb: 2, opacity: 0.9 }}>
                            {profileData.bio}
                          </Typography>
                          <Box display="flex" gap={2} flexWrap="wrap">
                            <Chip
                              icon={<VerifiedUser />}
                              label={user.kycLevel.toUpperCase()}
                              sx={{ bgcolor: 'white', color: 'primary.main', fontWeight: 'bold' }}
                            />
                            <Chip
                              icon={<Business />}
                              label={profileData.accountType.charAt(0).toUpperCase() + profileData.accountType.slice(1)}
                              sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
                            />
                            <Chip
                              icon={<LocationOn />}
                              label={profileData.location}
                              sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
                            />
                          </Box>
                        </Box>
                        <Box>
                          {editMode ? (
                            <Stack direction="row" spacing={1}>
                              <Button
                                variant="contained"
                                startIcon={<Save />}
                                onClick={handleSaveProfile}
                                disabled={loading}
                                sx={{ bgcolor: 'white', color: 'primary.main', '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' } }}
                              >
                                Save
                              </Button>
                              <Button
                                variant="outlined"
                                startIcon={<Cancel />}
                                onClick={() => {
                                  setEditMode(false);
                                  fetchProfileData();
                                }}
                                sx={{ borderColor: 'white', color: 'white', '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' } }}
                              >
                                Cancel
                              </Button>
                            </Stack>
                          ) : (
                            <Button
                              variant="contained"
                              startIcon={<Edit />}
                              onClick={() => setEditMode(true)}
                              sx={{ bgcolor: 'white', color: 'primary.main', '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' } }}
                            >
                              Edit Profile
                            </Button>
                          )}
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Tabs */}
                <Paper sx={{ mb: 3 }}>
                  <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)}>
                    <Tab label="Overview" />
                    <Tab label="Activity" />
                    <Tab label="Security" />
                  </Tabs>
                </Paper>

                {/* Tab Content */}
                {tabValue === 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Grid container spacing={3} sx={{ alignItems: 'stretch' }}>
                      {/* Left Column - Profile Form */}
                      <Grid item xs={12} lg={8} sx={{ display: 'flex', flexDirection: 'column' }}>
                        {/* Basic Information Section */}
                        <Card sx={{ mb: 3 }}>
                          <CardContent>
                            <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                              <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1, fontWeight: 600 }}>
                                <Person /> Basic Information
                              </Typography>
                              {editMode && (
                                <Chip 
                                  label="Editing" 
                                  color="primary" 
                                  size="small" 
                                  icon={<Edit />}
                                />
                              )}
                            </Box>
                            <Divider sx={{ mb: 3 }} />
                            <Grid container spacing={3}>
                              <Grid item xs={12} sm={6}>
                                <TextField
                                  fullWidth
                                  label="Display Name"
                                  value={profileData.displayName}
                                  onChange={(e) => setProfileData({ ...profileData, displayName: e.target.value })}
                                  disabled={!editMode}
                                  helperText={editMode ? "This is how your name appears to other users" : undefined}
                                  InputProps={{
                                    startAdornment: <Person sx={{ mr: 1, color: editMode ? 'primary.main' : 'text.secondary' }} />,
                                  }}
                                  sx={{
                                    '& .MuiInputBase-root': {
                                      bgcolor: editMode ? alpha(theme.palette.primary.main, 0.03) : 'transparent',
                                    },
                                  }}
                                />
                              </Grid>
                              <Grid item xs={12} sm={6}>
                                <TextField
                                  fullWidth
                                  label="Full Name (Legal)"
                                  value={profileData.name}
                                  disabled
                                  helperText="Verified from KYC documents"
                                  InputProps={{
                                    startAdornment: <VerifiedUser sx={{ mr: 1, color: 'success.main' }} />,
                                    endAdornment: <Lock sx={{ color: 'text.disabled', fontSize: 18 }} />,
                                  }}
                                />
                              </Grid>
                            </Grid>
                          </CardContent>
                        </Card>

                        {/* Contact Information Section */}
                        <Card sx={{ mb: 3 }}>
                          <CardContent>
                            <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                              <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1, fontWeight: 600 }}>
                                <Email /> Contact Information
                              </Typography>
                              {editMode && (
                                <Chip 
                                  label="Security Verified" 
                                  color="warning" 
                                  size="small" 
                                  icon={<SecurityIcon />}
                                />
                              )}
                            </Box>
                            <Divider sx={{ mb: 3 }} />
                            <Grid container spacing={3}>
                              <Grid item xs={12} sm={6}>
                                <Box
                                  sx={{
                                    p: 2,
                                    borderRadius: 2,
                                    border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
                                    bgcolor: editMode ? alpha(theme.palette.warning.main, 0.05) : 'transparent',
                                    transition: 'all 0.2s',
                                  }}
                                >
                                  <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                                    <Box display="flex" alignItems="center" gap={1}>
                                      <Email sx={{ color: 'text.secondary', fontSize: 20 }} />
                                      <Typography variant="body2" color="text.secondary" fontWeight={500}>
                                        Email Address
                                      </Typography>
                                    </Box>
                                    {editMode && (
                                      <IconButton
                                        size="small"
                                        onClick={() => setEmailChangeDialogOpen(true)}
                                        sx={{ 
                                          color: 'warning.main',
                                          '&:hover': { bgcolor: alpha(theme.palette.warning.main, 0.1) }
                                        }}
                                      >
                                        <Edit fontSize="small" />
                                      </IconButton>
                                    )}
                                  </Box>
                                  <Typography variant="body1" fontWeight={600} sx={{ mb: 1 }}>
                                    {profileData.email}
                                  </Typography>
                                  {editMode ? (
                                    <Button
                                      size="small"
                                      variant="outlined"
                                      startIcon={<Edit />}
                                      onClick={() => setEmailChangeDialogOpen(true)}
                                      sx={{ mt: 1, textTransform: 'none', borderColor: 'warning.main', color: 'warning.main' }}
                                    >
                                      Request Change
                                    </Button>
                                  ) : (
                                    <Typography variant="caption" color="text.secondary">
                                      Verified and secured
                                    </Typography>
                                  )}
                                </Box>
                              </Grid>
                              <Grid item xs={12} sm={6}>
                                <Box
                                  sx={{
                                    p: 2,
                                    borderRadius: 2,
                                    border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
                                    bgcolor: editMode ? alpha(theme.palette.warning.main, 0.05) : 'transparent',
                                    transition: 'all 0.2s',
                                  }}
                                >
                                  <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                                    <Box display="flex" alignItems="center" gap={1}>
                                      <Phone sx={{ color: 'text.secondary', fontSize: 20 }} />
                                      <Typography variant="body2" color="text.secondary" fontWeight={500}>
                                        Phone Number
                                      </Typography>
                                    </Box>
                                    {editMode && (
                                      <IconButton
                                        size="small"
                                        onClick={() => setPhoneChangeDialogOpen(true)}
                                        sx={{ 
                                          color: 'warning.main',
                                          '&:hover': { bgcolor: alpha(theme.palette.warning.main, 0.1) }
                                        }}
                                      >
                                        <Edit fontSize="small" />
                                      </IconButton>
                                    )}
                                  </Box>
                                  <Typography variant="body1" fontWeight={600} sx={{ mb: 1 }}>
                                    {profileData.phone}
                                  </Typography>
                                  {editMode ? (
                                    <Button
                                      size="small"
                                      variant="outlined"
                                      startIcon={<Edit />}
                                      onClick={() => setPhoneChangeDialogOpen(true)}
                                      sx={{ mt: 1, textTransform: 'none', borderColor: 'warning.main', color: 'warning.main' }}
                                    >
                                      Request Change
                                    </Button>
                                  ) : (
                                    <Typography variant="caption" color="text.secondary">
                                      Verified and active
                                    </Typography>
                                  )}
                                </Box>
                              </Grid>
                            </Grid>
                          </CardContent>
                        </Card>

                        {/* Account Settings Section */}
                        <Card sx={{ mb: 3 }}>
                          <CardContent>
                            <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                              <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1, fontWeight: 600 }}>
                                <Business /> Account Settings
                              </Typography>
                            </Box>
                            <Divider sx={{ mb: 3 }} />
                            <Grid container spacing={3}>
                              <Grid item xs={12} sm={6}>
                                <FormControl fullWidth>
                                  <InputLabel>Country/Location</InputLabel>
                                  <Select
                                    value={profileData.location}
                                    label="Country/Location"
                                    onChange={(e) => setProfileData({ ...profileData, location: e.target.value })}
                                    disabled={!editMode}
                                  >
                                    <MenuItem value="United States">United States</MenuItem>
                                    <MenuItem value="United Kingdom">United Kingdom</MenuItem>
                                    <MenuItem value="Canada">Canada</MenuItem>
                                    <MenuItem value="Australia">Australia</MenuItem>
                                    <MenuItem value="Germany">Germany</MenuItem>
                                    <MenuItem value="France">France</MenuItem>
                                    <MenuItem value="Switzerland">Switzerland</MenuItem>
                                    <MenuItem value="Singapore">Singapore</MenuItem>
                                    <MenuItem value="United Arab Emirates">United Arab Emirates</MenuItem>
                                    <MenuItem value="Other">Other</MenuItem>
                                  </Select>
                                </FormControl>
                              </Grid>
                              <Grid item xs={12} sm={6}>
                                <FormControl fullWidth>
                                  <InputLabel>Account Type</InputLabel>
                                  <Select
                                    value={profileData.accountType}
                                    label="Account Type"
                                    onChange={(e) => setProfileData({ ...profileData, accountType: e.target.value as ProfileData['accountType'] })}
                                    disabled={!editMode}
                                  >
                                    <MenuItem value="individual">
                                      <Box display="flex" alignItems="center" gap={1}>
                                        <AccountBox fontSize="small" />
                                        Individual Trader
                                      </Box>
                                    </MenuItem>
                                    <MenuItem value="company">
                                      <Box display="flex" alignItems="center" gap={1}>
                                        <BusinessCenter fontSize="small" />
                                        Company/Corporation
                                      </Box>
                                    </MenuItem>
                                    <MenuItem value="broker">
                                      <Box display="flex" alignItems="center" gap={1}>
                                        <CorporateFare fontSize="small" />
                                        Broker/Dealer
                                      </Box>
                                    </MenuItem>
                                    <MenuItem value="institution">
                                      <Box display="flex" alignItems="center" gap={1}>
                                        <Apartment fontSize="small" />
                                        Financial Institution
                                      </Box>
                                    </MenuItem>
                                  </Select>
                                </FormControl>
                              </Grid>
                            </Grid>
                          </CardContent>
                        </Card>

                        {/* Bio Section */}
                        <Card sx={{ mb: 3 }}>
                          <CardContent>
                            <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                              <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1, fontWeight: 600 }}>
                                <Description /> Professional Summary
                              </Typography>
                              <Typography
                                variant="caption"
                                sx={{
                                  color: profileData.bio.length > 250 ? 'error.main' : 'text.secondary',
                                  fontWeight: 500,
                                }}
                              >
                                {profileData.bio.length}/500
                              </Typography>
                            </Box>
                            <Divider sx={{ mb: 3 }} />
                            <Paper
                              variant="outlined"
                              sx={{
                                p: 2.5,
                                bgcolor: editMode ? alpha(theme.palette.primary.main, 0.02) : alpha(theme.palette.action.hover, 0.3),
                                border: `1px solid ${alpha(theme.palette.primary.main, editMode ? 0.2 : 0.1)}`,
                                transition: 'all 0.2s',
                                borderRadius: 2,
                              }}
                            >
                              {editMode ? (
                                <>
                                  <TextField
                                    fullWidth
                                    placeholder="Tell us about yourself, your business, or your trading preferences..."
                                    value={profileData.bio}
                                    onChange={(e) => {
                                      if (e.target.value.length <= 500) {
                                        setProfileData({ ...profileData, bio: e.target.value });
                                      }
                                    }}
                                    multiline
                                    rows={5}
                                    sx={{
                                      '& .MuiOutlinedInput-root': {
                                        bgcolor: 'transparent',
                                      },
                                    }}
                                  />
                                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1.5, display: 'block' }}>
                                    Share your professional background, trading experience, or any relevant information that helps others understand your profile.
                                  </Typography>
                                </>
                              ) : (
                                <Typography 
                                  variant="body1" 
                                  color={profileData.bio ? 'text.primary' : 'text.secondary'}
                                  sx={{ 
                                    minHeight: 100,
                                    whiteSpace: 'pre-wrap',
                                    fontStyle: !profileData.bio ? 'italic' : 'normal'
                                  }}
                                >
                                  {profileData.bio || 'No bio added yet. Click Edit Profile to add one.'}
                                </Typography>
                              )}
                            </Paper>
                          </CardContent>
                        </Card>

                        {/* KYC Verification Section */}
                        <Card sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                          <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                            <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                              <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1, fontWeight: 600 }}>
                                <Shield /> KYC Verification
                              </Typography>
                              <MuiChip
                                label={user.kycLevel.charAt(0).toUpperCase() + user.kycLevel.slice(1)}
                                color="success"
                                size="small"
                                sx={{ fontWeight: 600 }}
                              />
                            </Box>
                            <Divider sx={{ mb: 3 }} />
                            <Paper
                              variant="outlined"
                              sx={{
                                p: 2.5,
                                bgcolor: alpha(theme.palette.success.main, 0.05),
                                border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
                                borderRadius: 2,
                                flex: 1,
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between',
                              }}
                            >
                              <Box>
                                <Box display="flex" alignItems="center" gap={2} mb={2.5}>
                                  <Box
                                    sx={{
                                      p: 1.5,
                                      borderRadius: 2,
                                      bgcolor: alpha(theme.palette.success.main, 0.15),
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                    }}
                                  >
                                    <VerifiedUser sx={{ color: 'success.main', fontSize: 28 }} />
                                  </Box>
                                  <Box>
                                    <Typography variant="h6" fontWeight={700} color="success.main">
                                      Identity Verified
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                      KYC documents approved
                                    </Typography>
                                  </Box>
                                </Box>
                                <Stack spacing={2}>
                                  <Box display="flex" alignItems="center" gap={1.5}>
                                    <CheckCircle sx={{ color: 'success.main', fontSize: 20 }} />
                                    <Typography variant="body2" fontWeight={500}>
                                      Identity Document Verified
                                    </Typography>
                                  </Box>
                                  <Box display="flex" alignItems="center" gap={1.5}>
                                    <CheckCircle sx={{ color: 'success.main', fontSize: 20 }} />
                                    <Typography variant="body2" fontWeight={500}>
                                      Address Verification Complete
                                    </Typography>
                                  </Box>
                                  <Box display="flex" alignItems="center" gap={1.5}>
                                    <CheckCircle sx={{ color: 'success.main', fontSize: 20 }} />
                                    <Typography variant="body2" fontWeight={500}>
                                      Compliance Status: Active
                                    </Typography>
                                  </Box>
                                </Stack>
                              </Box>
                              <Box mt={2} pt={2} borderTop={`1px solid ${alpha(theme.palette.success.main, 0.2)}`}>
                                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                                  Last verified: {new Date(user.createdAt || Date.now()).toLocaleDateString('en-US', { 
                                    month: 'long', 
                                    year: 'numeric' 
                                  })}
                                </Typography>
                              </Box>
                            </Paper>
                          </CardContent>
                        </Card>
                      </Grid>

                      {/* Right Column - Stats Cards */}
                      <Grid item xs={12} lg={4}>
                        <Stack spacing={2}>
                          {/* Activity Statistics */}
                          <Card
                            sx={{
                              background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.08)} 0%, ${alpha(theme.palette.secondary.main, 0.08)} 100%)`,
                              border: `1px solid ${alpha(theme.palette.primary.main, 0.12)}`,
                            }}
                          >
                            <CardContent sx={{ p: 2.5 }}>
                              <Box display="flex" alignItems="center" gap={1.5} mb={2.5}>
                                <Box
                                  sx={{
                                    p: 1,
                                    borderRadius: 1.5,
                                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                  }}
                                >
                                  <TrendingUp sx={{ color: 'primary.main', fontSize: 20 }} />
                                </Box>
                                <Typography variant="subtitle1" fontWeight={600}>
                                  Activity Insights
                                </Typography>
                              </Box>
                              <Stack spacing={2}>
                                <Box>
                                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
                                    <Typography variant="caption" color="text.secondary" fontWeight={500}>
                                      Total Escrows
                                    </Typography>
                                    <Typography variant="h6" fontWeight={700} color="primary.main">
                                      {activityStats.totalEscrows}
                                    </Typography>
                                  </Box>
                                  <LinearProgress
                                    variant="determinate"
                                    value={activityStats.totalEscrows > 0 ? (activityStats.completedEscrows / activityStats.totalEscrows) * 100 : 0}
                                    sx={{
                                      height: 3,
                                      borderRadius: 2,
                                      bgcolor: alpha(theme.palette.primary.main, 0.1),
                                      '& .MuiLinearProgress-bar': {
                                        borderRadius: 2,
                                      },
                                    }}
                                  />
                                </Box>
                                <Box
                                  sx={{
                                    p: 1.5,
                                    borderRadius: 1.5,
                                    bgcolor: alpha(theme.palette.success.main, 0.08),
                                    border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
                                  }}
                                >
                                  <Typography variant="caption" color="text.secondary" fontWeight={500} display="block" gutterBottom>
                                    Completed
                                  </Typography>
                                  <Typography variant="h5" fontWeight={700} color="success.main">
                                    {activityStats.completedEscrows}
                                  </Typography>
                                </Box>
                                <Box>
                                  <Typography variant="caption" color="text.secondary" fontWeight={500} display="block" gutterBottom>
                                    Total Volume
                                  </Typography>
                                  <Typography variant="h6" fontWeight={700} sx={{ fontFamily: 'monospace' }}>
                                    ${activityStats.totalVolume.toLocaleString()}
                                  </Typography>
                                </Box>
                                <Box
                                  sx={{
                                    p: 1.5,
                                    borderRadius: 1.5,
                                    bgcolor: alpha(theme.palette.success.main, 0.08),
                                    border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
                                  }}
                                >
                                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
                                    <Typography variant="caption" color="text.secondary" fontWeight={500}>
                                      Success Rate
                                    </Typography>
                                    <CheckCircle sx={{ color: 'success.main', fontSize: 18 }} />
                                  </Box>
                                  <Typography variant="h5" fontWeight={700} color="success.main">
                                    {activityStats.successRate}%
                                  </Typography>
                                </Box>
                              </Stack>
                            </CardContent>
                          </Card>

                          {/* Security Status */}
                          <Card
                            sx={{
                              background: `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.08)} 0%, ${alpha(theme.palette.info.main, 0.08)} 100%)`,
                              border: `1px solid ${alpha(theme.palette.success.main, 0.12)}`,
                            }}
                          >
                            <CardContent sx={{ p: 2.5 }}>
                              <Box display="flex" alignItems="center" gap={1.5} mb={2.5}>
                                <Box
                                  sx={{
                                    p: 1,
                                    borderRadius: 1.5,
                                    bgcolor: alpha(theme.palette.success.main, 0.1),
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                  }}
                                >
                                  <Shield sx={{ color: 'success.main', fontSize: 20 }} />
                                </Box>
                                <Typography variant="subtitle1" fontWeight={600}>
                                  Security Status
                                </Typography>
                              </Box>
                              <Stack spacing={2}>
                                <Box
                                  sx={{
                                    p: 1.5,
                                    borderRadius: 1.5,
                                    bgcolor: alpha(theme.palette.success.main, 0.1),
                                    border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
                                  }}
                                >
                                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
                                    <Box display="flex" alignItems="center" gap={1}>
                                      <VerifiedUser sx={{ color: 'success.main', fontSize: 18 }} />
                                      <Typography variant="caption" fontWeight={600}>
                                        KYC Status
                                      </Typography>
                                    </Box>
                                    <MuiChip
                                      label={user.kycLevel.charAt(0).toUpperCase() + user.kycLevel.slice(1)}
                                      color="success"
                                      size="small"
                                      sx={{ fontWeight: 600, height: 20, fontSize: '0.65rem' }}
                                    />
                                  </Box>
                                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                                    Verified & compliant
                                  </Typography>
                                </Box>
                                <Box
                                  sx={{
                                    p: 1.5,
                                    borderRadius: 1.5,
                                    bgcolor: alpha(theme.palette.success.main, 0.1),
                                    border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
                                  }}
                                >
                                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
                                    <Box display="flex" alignItems="center" gap={1}>
                                      <Email sx={{ color: 'success.main', fontSize: 18 }} />
                                      <Typography variant="caption" fontWeight={600}>
                                        Email
                                      </Typography>
                                    </Box>
                                    <CheckCircle sx={{ color: 'success.main', fontSize: 18 }} />
                                  </Box>
                                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                                    Verified & secured
                                  </Typography>
                                </Box>
                                <Box
                                  sx={{
                                    p: 1.5,
                                    borderRadius: 1.5,
                                    bgcolor: alpha(theme.palette.success.main, 0.1),
                                    border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
                                  }}
                                >
                                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
                                    <Box display="flex" alignItems="center" gap={1}>
                                      <Phone sx={{ color: 'success.main', fontSize: 18 }} />
                                      <Typography variant="caption" fontWeight={600}>
                                        Phone
                                      </Typography>
                                    </Box>
                                    <CheckCircle sx={{ color: 'success.main', fontSize: 18 }} />
                                  </Box>
                                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                                    Verified & active
                                  </Typography>
                                </Box>
                              </Stack>
                            </CardContent>
                          </Card>

                          {/* Account Overview */}
                          <Card
                            sx={{
                              background: `linear-gradient(135deg, ${alpha(theme.palette.info.main, 0.08)} 0%, ${alpha(theme.palette.secondary.main, 0.08)} 100%)`,
                              border: `1px solid ${alpha(theme.palette.info.main, 0.12)}`,
                            }}
                          >
                          <CardContent sx={{ p: 2.5 }}>
                            <Box display="flex" alignItems="center" gap={1.5} mb={2.5}>
                              <Box
                                sx={{
                                  p: 1,
                                  borderRadius: 1.5,
                                  bgcolor: alpha(theme.palette.info.main, 0.1),
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                }}
                              >
                                <AccountCircle sx={{ color: 'info.main', fontSize: 20 }} />
                              </Box>
                              <Typography variant="subtitle1" fontWeight={600}>
                                Account Overview
                              </Typography>
                            </Box>
                            <Stack spacing={2}>
                              <Box
                                sx={{
                                  p: 1.5,
                                  borderRadius: 1.5,
                                  bgcolor: alpha(theme.palette.info.main, 0.1),
                                  border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
                                }}
                              >
                                <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
                                  <Box display="flex" alignItems="center" gap={1}>
                                    <CalendarToday sx={{ color: 'info.main', fontSize: 18 }} />
                                    <Typography variant="caption" fontWeight={600}>
                                      Member Since
                                    </Typography>
                                  </Box>
                                </Box>
                                <Typography variant="body2" fontWeight={600} color="text.primary">
                                  {new Date(user.createdAt || Date.now() - 365 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { 
                                    month: 'short', 
                                    year: 'numeric' 
                                  })}
                                </Typography>
                                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem', mt: 0.5, display: 'block' }}>
                                  {Math.floor((Date.now() - (user.createdAt || Date.now() - 365 * 24 * 60 * 60 * 1000)) / (1000 * 60 * 60 * 24))} days active
                                </Typography>
                              </Box>
                              <Box
                                sx={{
                                  p: 1.5,
                                  borderRadius: 1.5,
                                  bgcolor: alpha(theme.palette.success.main, 0.1),
                                  border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
                                }}
                              >
                                <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
                                  <Box display="flex" alignItems="center" gap={1}>
                                    <VerifiedUser sx={{ color: 'success.main', fontSize: 18 }} />
                                    <Typography variant="caption" fontWeight={600}>
                                      Account Status
                                    </Typography>
                                  </Box>
                                  <MuiChip
                                    label="Active"
                                    color="success"
                                    size="small"
                                    sx={{ fontWeight: 600, height: 20, fontSize: '0.65rem' }}
                                  />
                                </Box>
                                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                                  Account in good standing
                                </Typography>
                              </Box>
                              <Box>
                                <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
                                  <Box display="flex" alignItems="center" gap={1}>
                                    <AccessTime sx={{ color: 'text.secondary', fontSize: 18 }} />
                                    <Typography variant="caption" fontWeight={600} color="text.secondary">
                                      Last Login
                                    </Typography>
                                  </Box>
                                </Box>
                                <Typography variant="body2" fontWeight={600} color="text.primary">
                                  {user.lastLogin 
                                    ? new Date(user.lastLogin).toLocaleDateString('en-US', { 
                                        month: 'short', 
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                      })
                                    : 'Today'}
                                </Typography>
                              </Box>
                              <Box
                                sx={{
                                  p: 1.5,
                                  borderRadius: 1.5,
                                  bgcolor: alpha(theme.palette.primary.main, 0.08),
                                  border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                                }}
                              >
                                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                                  <Typography variant="caption" fontWeight={600} color="text.secondary">
                                    Profile Completion
                                  </Typography>
                                  <Typography variant="caption" fontWeight={700} color="primary.main">
                                    {(() => {
                                      const fields = [
                                        profileData.displayName,
                                        profileData.bio,
                                        profileData.location,
                                        profileData.accountType,
                                      ];
                                      const completed = fields.filter(f => f && f.trim() !== '').length;
                                      return Math.round((completed / fields.length) * 100);
                                    })()}%
                                  </Typography>
                                </Box>
                                <LinearProgress
                                  variant="determinate"
                                  value={(() => {
                                    const fields = [
                                      profileData.displayName,
                                      profileData.bio,
                                      profileData.location,
                                      profileData.accountType,
                                    ];
                                    const completed = fields.filter(f => f && f.trim() !== '').length;
                                    return (completed / fields.length) * 100;
                                  })()}
                                  sx={{
                                    height: 4,
                                    borderRadius: 2,
                                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                                    '& .MuiLinearProgress-bar': {
                                      borderRadius: 2,
                                    },
                                  }}
                                />
                              </Box>
                            </Stack>
                          </CardContent>
                        </Card>
                        </Stack>
                      </Grid>
                    </Grid>
                  </motion.div>
                )}

                {tabValue === 1 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card>
                      <CardContent>
                        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                          <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1, fontWeight: 600 }}>
                            <History /> Recent Activity
                          </Typography>
                          <Button
                            size="small"
                            startIcon={<History />}
                            onClick={fetchActivities}
                            disabled={loadingActivities}
                          >
                            Refresh
                          </Button>
                        </Box>
                        <Divider sx={{ mb: 3 }} />
                        {loadingActivities ? (
                          <Box display="flex" justifyContent="center" alignItems="center" py={4}>
                            <CircularProgress />
                          </Box>
                        ) : activities.length === 0 ? (
                          <Box textAlign="center" py={4}>
                            <History sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
                            <Typography variant="body1" color="text.secondary" gutterBottom>
                              No activity found
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Your activity history will appear here
                            </Typography>
                          </Box>
                        ) : (
                          <Stack spacing={2}>
                            {activities.map((activity) => {
                              const getIcon = () => {
                                switch (activity.type) {
                                  case 'escrow':
                                    return <AccountBalance sx={{ color: 'primary.main' }} />;
                                  case 'transaction':
                                    return <Receipt sx={{ color: 'success.main' }} />;
                                  case 'dispute':
                                    return <Gavel sx={{ color: 'warning.main' }} />;
                                  case 'profile':
                                    return <Person sx={{ color: 'info.main' }} />;
                                  case 'security':
                                    return <SecurityIcon sx={{ color: 'error.main' }} />;
                                  case 'system':
                                    return <Info sx={{ color: 'text.secondary' }} />;
                                  default:
                                    return <History sx={{ color: 'text.secondary' }} />;
                                }
                              };

                              const getStatusColor = () => {
                                switch (activity.status) {
                                  case 'completed':
                                    return 'success';
                                  case 'pending':
                                    return 'warning';
                                  case 'failed':
                                    return 'error';
                                  case 'active':
                                    return 'info';
                                  default:
                                    return 'default';
                                }
                              };

                              const formatTimeAgo = (timestamp: number) => {
                                const seconds = Math.floor((Date.now() - timestamp) / 1000);
                                if (seconds < 60) return 'Just now';
                                const minutes = Math.floor(seconds / 60);
                                if (minutes < 60) return `${minutes}m ago`;
                                const hours = Math.floor(minutes / 60);
                                if (hours < 24) return `${hours}h ago`;
                                const days = Math.floor(hours / 24);
                                if (days < 7) return `${days}d ago`;
                                return new Date(timestamp).toLocaleDateString('en-US', { 
                                  month: 'short', 
                                  day: 'numeric',
                                  year: 'numeric'
                                });
                              };

                              return (
                                <Box
                                  key={activity.id}
                                  sx={{
                                    p: 2,
                                    borderRadius: 2,
                                    border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
                                    bgcolor: alpha(theme.palette.action.hover, 0.3),
                                    transition: 'all 0.2s',
                                    '&:hover': {
                                      bgcolor: alpha(theme.palette.action.hover, 0.5),
                                      borderColor: theme.palette.divider,
                                    },
                                  }}
                                >
                                  <Box display="flex" gap={2}>
                                    <Box
                                      sx={{
                                        p: 1,
                                        borderRadius: 1.5,
                                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        minWidth: 40,
                                        height: 40,
                                      }}
                                    >
                                      {getIcon()}
                                    </Box>
                                    <Box flex={1}>
                                      <Box display="flex" alignItems="center" justifyContent="space-between" mb={0.5}>
                                        <Typography variant="subtitle2" fontWeight={600}>
                                          {activity.title}
                                        </Typography>
                                        {activity.status && (
                                          <MuiChip
                                            label={activity.status.charAt(0).toUpperCase() + activity.status.slice(1)}
                                            color={getStatusColor() as any}
                                            size="small"
                                            sx={{ height: 20, fontSize: '0.65rem', fontWeight: 600 }}
                                          />
                                        )}
                                      </Box>
                                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                        {activity.description}
                                      </Typography>
                                      <Box display="flex" alignItems="center" justifyContent="space-between">
                                        <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                          <AccessTime sx={{ fontSize: 14 }} />
                                          {formatTimeAgo(activity.timestamp)}
                                        </Typography>
                                        {activity.amount && (
                                          <Typography variant="body2" fontWeight={600} color="primary.main">
                                            ${activity.amount.toLocaleString()}
                                          </Typography>
                                        )}
                                      </Box>
                                    </Box>
                                  </Box>
                                </Box>
                              );
                            })}
                          </Stack>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                )}

                {tabValue === 2 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    {/* Security Overview Header */}
                    <Card sx={{ mb: 3, background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.08)} 0%, ${alpha(theme.palette.secondary.main, 0.08)} 100%)` }}>
                      <CardContent>
                        <Box display="flex" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={2}>
                          <Box>
                            <Typography variant="h5" fontWeight={700} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                              <Shield sx={{ fontSize: 32, color: 'primary.main' }} />
                              Security Center
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Manage your account security settings and monitor active sessions
                            </Typography>
                          </Box>
                          <Box textAlign="right">
                            <MuiChip 
                              label="Security Score: 85%" 
                              color="success" 
                              sx={{ fontWeight: 700, fontSize: '0.875rem', height: 32 }}
                            />
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                              {(() => {
                                const checks = [
                                  true, // Email
                                  true, // Phone
                                  twoFactorEnabled,
                                  true, // KYC
                                ];
                                const passed = checks.filter(Boolean).length;
                                return `${passed} of ${checks.length} security checks passed`;
                              })()}
                            </Typography>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>

                    <Grid container spacing={3} sx={{ alignItems: 'stretch' }}>
                      {/* Account Protection Section */}
                      <Grid item xs={12} sm={6} lg={6}>
                        <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                          <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                            <Box display="flex" alignItems="center" gap={1.5} mb={3}>
                              <Box
                                sx={{
                                  p: 1.5,
                                  borderRadius: 2,
                                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                }}
                              >
                                <Lock sx={{ color: 'primary.main', fontSize: 24 }} />
                              </Box>
                              <Box>
                                <Typography variant="h6" fontWeight={600}>
                                  Account Protection
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  Strengthen your account security
                                </Typography>
                              </Box>
                            </Box>
                            <Divider sx={{ mb: 3 }} />

                            <Stack spacing={3} sx={{ flex: 1 }}>
                              {/* Password Security */}
                              <Paper
                                variant="outlined"
                                sx={{
                                  p: 2.5,
                                  borderRadius: 2,
                                  border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
                                  bgcolor: alpha(theme.palette.action.hover, 0.3),
                                  width: '100%',
                                }}
                              >
                                <Box display="flex" alignItems="flex-start" justifyContent="space-between" gap={2} flexWrap="wrap">
                                  <Box flex={1} minWidth={200}>
                                    <Box display="flex" alignItems="center" gap={1.5} mb={1}>
                                      <VpnKey sx={{ color: 'text.secondary', fontSize: 20 }} />
                                      <Typography variant="subtitle1" fontWeight={600}>
                                        Password Security
                                      </Typography>
                                    </Box>
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                                      Last changed 90 days ago • Recommended to update every 90 days
                                    </Typography>
                                    <LinearProgress
                                      variant="determinate"
                                      value={75}
                                      sx={{
                                        height: 6,
                                        borderRadius: 3,
                                        bgcolor: alpha(theme.palette.warning.main, 0.1),
                                        '& .MuiLinearProgress-bar': {
                                          bgcolor: 'warning.main',
                                          borderRadius: 3,
                                        },
                                      }}
                                    />
                                    <Typography variant="caption" color="warning.main" sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                      <Warning sx={{ fontSize: 14 }} />
                                      Consider updating your password for better security
                                    </Typography>
                                  </Box>
                                  <Button
                                    variant="contained"
                                    size="small"
                                    startIcon={<VpnKey />}
                                    onClick={() => setSnackbar({ open: true, message: 'Password change dialog coming soon', severity: 'info' })}
                                    sx={{ flexShrink: 0 }}
                                  >
                                    Change Password
                                  </Button>
                                </Box>
                              </Paper>

                              {/* Two-Factor Authentication */}
                              <Paper
                                variant="outlined"
                                sx={{
                                  p: 2.5,
                                  borderRadius: 2,
                                  border: `1px solid ${twoFactorEnabled ? alpha(theme.palette.success.main, 0.3) : alpha(theme.palette.divider, 0.5)}`,
                                  bgcolor: twoFactorEnabled ? alpha(theme.palette.success.main, 0.05) : alpha(theme.palette.action.hover, 0.3),
                                  transition: 'all 0.2s',
                                  width: '100%',
                                }}
                              >
                                <Box display="flex" alignItems="flex-start" justifyContent="space-between" gap={2} flexWrap="wrap">
                                  <Box flex={1} minWidth={200}>
                                    <Box display="flex" alignItems="center" gap={1.5} mb={1} flexWrap="wrap">
                                      <SecurityIcon sx={{ color: twoFactorEnabled ? 'success.main' : 'text.secondary', fontSize: 20 }} />
                                      <Typography variant="subtitle1" fontWeight={600}>
                                        Two-Factor Authentication (2FA)
                                      </Typography>
                                      <MuiChip
                                        label={twoFactorEnabled ? 'Enabled' : 'Not Enabled'}
                                        color={twoFactorEnabled ? 'success' : 'default'}
                                        size="small"
                                        sx={{ fontWeight: 600 }}
                                      />
                                    </Box>
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                                      {twoFactorEnabled 
                                        ? 'An extra layer of security is protecting your account. You will need a verification code when signing in.'
                                        : 'Add an extra layer of security by requiring a verification code in addition to your password.'}
                                    </Typography>
                                    {!twoFactorEnabled && (
                                      <Alert severity="warning" icon={<Warning />} sx={{ mt: 1 }}>
                                        <Typography variant="caption">
                                          Enabling 2FA significantly improves your account security. Highly recommended.
                                        </Typography>
                                      </Alert>
                                    )}
                                  </Box>
                                  <Button
                                    variant={twoFactorEnabled ? 'outlined' : 'contained'}
                                    color={twoFactorEnabled ? 'error' : 'primary'}
                                    size="small"
                                    startIcon={<SecurityIcon />}
                                    onClick={() => {
                                      setTwoFactorEnabled(!twoFactorEnabled);
                                      setSnackbar({
                                        open: true,
                                        message: twoFactorEnabled ? '2FA disabled' : '2FA enabled successfully',
                                        severity: 'success',
                                      });
                                    }}
                                    sx={{ flexShrink: 0 }}
                                  >
                                    {twoFactorEnabled ? 'Disable' : 'Enable'}
                                  </Button>
                                </Box>
                              </Paper>

                              {/* Biometric Authentication */}
                              <Paper
                                variant="outlined"
                                sx={{
                                  p: 2.5,
                                  borderRadius: 2,
                                  border: `1px solid ${biometricEnabled ? alpha(theme.palette.success.main, 0.3) : alpha(theme.palette.divider, 0.5)}`,
                                  bgcolor: biometricEnabled ? alpha(theme.palette.success.main, 0.05) : alpha(theme.palette.action.hover, 0.3),
                                  transition: 'all 0.2s',
                                  width: '100%',
                                }}
                              >
                                <Box display="flex" alignItems="flex-start" justifyContent="space-between" gap={2} flexWrap="wrap">
                                  <Box flex={1} minWidth={200}>
                                    <Box display="flex" alignItems="center" gap={1.5} mb={1} flexWrap="wrap">
                                      <Fingerprint sx={{ color: biometricEnabled ? 'success.main' : 'text.secondary', fontSize: 20 }} />
                                      <Typography variant="subtitle1" fontWeight={600}>
                                        Biometric Authentication
                                      </Typography>
                                      <MuiChip
                                        label={biometricEnabled ? 'Enabled' : 'Not Enabled'}
                                        color={biometricEnabled ? 'success' : 'default'}
                                        size="small"
                                        sx={{ fontWeight: 600 }}
                                      />
                                    </Box>
                                    <Typography variant="body2" color="text.secondary">
                                      {biometricEnabled 
                                        ? 'Use your fingerprint or face ID for quick and secure access.'
                                        : 'Enable fingerprint or face ID for faster and more secure login on supported devices.'}
                                    </Typography>
                                  </Box>
                                  <Button
                                    variant={biometricEnabled ? 'outlined' : 'contained'}
                                    color={biometricEnabled ? 'error' : 'primary'}
                                    size="small"
                                    startIcon={<Fingerprint />}
                                    onClick={() => {
                                      setBiometricEnabled(!biometricEnabled);
                                      setSnackbar({
                                        open: true,
                                        message: biometricEnabled ? 'Biometric auth disabled' : 'Biometric auth enabled',
                                        severity: 'success',
                                      });
                                    }}
                                    sx={{ flexShrink: 0 }}
                                  >
                                    {biometricEnabled ? 'Disable' : 'Enable'}
                                  </Button>
                                </Box>
                              </Paper>
                            </Stack>
                          </CardContent>
                        </Card>
                      </Grid>

                      {/* Active Sessions Section */}
                      <Grid item xs={12} sm={6} lg={6}>
                        <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                          <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                            <Box display="flex" alignItems="center" justifyContent="space-between" mb={3} flexWrap="wrap" gap={2}>
                              <Box display="flex" alignItems="center" gap={1.5}>
                                <Box
                                  sx={{
                                    p: 1.5,
                                    borderRadius: 2,
                                    bgcolor: alpha(theme.palette.info.main, 0.1),
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                  }}
                                >
                                  <History sx={{ color: 'info.main', fontSize: 24 }} />
                                </Box>
                                <Box>
                                  <Typography variant="h6" fontWeight={600}>
                                    Active Sessions
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    Monitor and manage devices signed into your account
                                  </Typography>
                                </Box>
                              </Box>
                              {activeSessions.filter(s => !s.current).length > 0 && (
                                <Button
                                  size="small"
                                  color="error"
                                  variant="outlined"
                                  onClick={() => {
                                    setActiveSessions(activeSessions.filter(s => s.current));
                                    setSnackbar({ open: true, message: 'All other sessions terminated', severity: 'success' });
                                  }}
                                >
                                  End All Others
                                </Button>
                              )}
                            </Box>
                            <Divider sx={{ mb: 3 }} />
                            <Stack spacing={2} sx={{ flex: 1 }}>
                              {activeSessions.map((session) => (
                                <Paper
                                  key={session.id}
                                  variant="outlined"
                                  sx={{
                                    p: 2.5,
                                    borderRadius: 2,
                                    border: `1px solid ${session.current ? alpha(theme.palette.primary.main, 0.3) : alpha(theme.palette.divider, 0.5)}`,
                                    bgcolor: session.current ? alpha(theme.palette.primary.main, 0.05) : 'transparent',
                                    transition: 'all 0.2s',
                                  }}
                                >
                                  <Box display="flex" alignItems="flex-start" justifyContent="space-between">
                                    <Box display="flex" gap={2} flex={1}>
                                      <Box
                                        sx={{
                                          p: 1.5,
                                          borderRadius: 1.5,
                                          bgcolor: session.current ? 'primary.main' : alpha(theme.palette.action.hover, 0.5),
                                          display: 'flex',
                                          alignItems: 'center',
                                          justifyContent: 'center',
                                          minWidth: 48,
                                          height: 48,
                                        }}
                                      >
                                        <AccessTime sx={{ fontSize: 20, color: session.current ? 'white' : 'text.secondary' }} />
                                      </Box>
                                      <Box flex={1}>
                                        <Box display="flex" alignItems="center" gap={1.5} mb={0.5}>
                                          <Typography variant="subtitle1" fontWeight={600}>
                                            {session.device}
                                          </Typography>
                                          {session.current && (
                                            <MuiChip label="Current Session" color="primary" size="small" sx={{ fontWeight: 600 }} />
                                          )}
                                        </Box>
                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                          {session.location} • IP: {session.ipAddress}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                          <AccessTime sx={{ fontSize: 12 }} />
                                          Last active: {(() => {
                                            const minutes = Math.floor((Date.now() - session.lastActive) / 60000);
                                            if (minutes < 60) return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
                                            const hours = Math.floor(minutes / 60);
                                            return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
                                          })()}
                                        </Typography>
                                      </Box>
                                    </Box>
                                    {!session.current && (
                                      <Button
                                        size="small"
                                        color="error"
                                        variant="outlined"
                                        sx={{ ml: 2 }}
                                        onClick={() => {
                                          setActiveSessions(activeSessions.filter(s => s.id !== session.id));
                                          setSnackbar({ open: true, message: 'Session terminated', severity: 'success' });
                                        }}
                                      >
                                        End Session
                                      </Button>
                                    )}
                                  </Box>
                                </Paper>
                              ))}
                            </Stack>
                          </CardContent>
                        </Card>
                      </Grid>

                      {/* Security Status Card */}
                      <Grid item xs={12} sm={6} lg={6}>
                        <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                          <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                            <Box display="flex" alignItems="center" gap={1.5} mb={3}>
                              <Box
                                sx={{
                                  p: 1.5,
                                  borderRadius: 2,
                                  bgcolor: alpha(theme.palette.success.main, 0.1),
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                }}
                              >
                                <Shield sx={{ color: 'success.main', fontSize: 24 }} />
                              </Box>
                              <Box>
                                <Typography variant="h6" fontWeight={600}>
                                  Security Status
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  Account verification checklist
                                </Typography>
                              </Box>
                            </Box>
                            <Divider sx={{ mb: 3 }} />
                            <Stack spacing={2.5} sx={{ flex: 1 }}>
                              <Box
                                sx={{
                                  p: 2,
                                  borderRadius: 2,
                                  bgcolor: alpha(theme.palette.success.main, 0.05),
                                  border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
                                }}
                              >
                                <Box display="flex" alignItems="center" justifyContent="space-between" mb={0.5}>
                                  <Box display="flex" alignItems="center" gap={1.5}>
                                    <CheckCircle sx={{ color: 'success.main', fontSize: 20 }} />
                                    <Typography variant="body2" fontWeight={600}>
                                      Email Verified
                                    </Typography>
                                  </Box>
                                  <CheckCircle sx={{ color: 'success.main' }} />
                                </Box>
                                <Typography variant="caption" color="text.secondary">
                                  {profileData.email}
                                </Typography>
                              </Box>

                              <Box
                                sx={{
                                  p: 2,
                                  borderRadius: 2,
                                  bgcolor: alpha(theme.palette.success.main, 0.05),
                                  border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
                                }}
                              >
                                <Box display="flex" alignItems="center" justifyContent="space-between" mb={0.5}>
                                  <Box display="flex" alignItems="center" gap={1.5}>
                                    <CheckCircle sx={{ color: 'success.main', fontSize: 20 }} />
                                    <Typography variant="body2" fontWeight={600}>
                                      Phone Verified
                                    </Typography>
                                  </Box>
                                  <CheckCircle sx={{ color: 'success.main' }} />
                                </Box>
                                <Typography variant="caption" color="text.secondary">
                                  {profileData.phone}
                                </Typography>
                              </Box>

                              <Box
                                sx={{
                                  p: 2,
                                  borderRadius: 2,
                                  bgcolor: twoFactorEnabled 
                                    ? alpha(theme.palette.success.main, 0.05) 
                                    : alpha(theme.palette.warning.main, 0.05),
                                  border: `1px solid ${twoFactorEnabled 
                                    ? alpha(theme.palette.success.main, 0.2) 
                                    : alpha(theme.palette.warning.main, 0.2)}`,
                                }}
                              >
                                <Box display="flex" alignItems="center" justifyContent="space-between" mb={0.5}>
                                  <Box display="flex" alignItems="center" gap={1.5}>
                                    {twoFactorEnabled ? (
                                      <CheckCircle sx={{ color: 'success.main', fontSize: 20 }} />
                                    ) : (
                                      <Warning sx={{ color: 'warning.main', fontSize: 20 }} />
                                    )}
                                    <Typography variant="body2" fontWeight={600}>
                                      Two-Factor Auth
                                    </Typography>
                                  </Box>
                                  {twoFactorEnabled ? (
                                    <CheckCircle sx={{ color: 'success.main' }} />
                                  ) : (
                                    <Warning sx={{ color: 'warning.main' }} />
                                  )}
                                </Box>
                                <Typography variant="caption" color="text.secondary">
                                  {twoFactorEnabled ? 'Enabled and active' : 'Not enabled - recommended'}
                                </Typography>
                              </Box>

                              <Box
                                sx={{
                                  p: 2,
                                  borderRadius: 2,
                                  bgcolor: alpha(theme.palette.success.main, 0.05),
                                  border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
                                }}
                              >
                                <Box display="flex" alignItems="center" justifyContent="space-between" mb={0.5}>
                                  <Box display="flex" alignItems="center" gap={1.5}>
                                    <CheckCircle sx={{ color: 'success.main', fontSize: 20 }} />
                                    <Typography variant="body2" fontWeight={600}>
                                      KYC Verified
                                    </Typography>
                                  </Box>
                                  <CheckCircle sx={{ color: 'success.main' }} />
                                </Box>
                                <Typography variant="caption" color="text.secondary">
                                  {user.kycLevel.charAt(0).toUpperCase() + user.kycLevel.slice(1)} level
                                </Typography>
                              </Box>
                            </Stack>
                            <Divider sx={{ my: 3 }} />
                            <Alert severity="success" icon={<Shield />}>
                              <Typography variant="caption" fontWeight={600} display="block" gutterBottom>
                                Security Score: 85%
                              </Typography>
                              <Typography variant="caption">
                                Your account is well protected. Keep 2FA enabled for maximum security.
                              </Typography>
                            </Alert>
                          </CardContent>
                        </Card>
                      </Grid>

                      {/* Wallet Connection Card */}
                      <Grid item xs={12} sm={6} lg={6}>
                        <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                          <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                            <Box display="flex" alignItems="center" gap={1.5} mb={3}>
                              <Box
                                sx={{
                                  p: 1.5,
                                  borderRadius: 2,
                                  bgcolor: alpha(theme.palette.info.main, 0.1),
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                }}
                              >
                                <AccountBalanceWallet sx={{ color: 'info.main', fontSize: 24 }} />
                              </Box>
                              <Box flex={1}>
                                <Typography variant="h6" fontWeight={600}>
                                  Wallet Connection
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  Crypto wallet management
                                </Typography>
                              </Box>
                              {user.walletAddress && (
                                <MuiChip label="Connected" color="success" size="small" sx={{ fontWeight: 600 }} />
                              )}
                            </Box>
                            <Divider sx={{ mb: 3 }} />
                            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                              {user.walletAddress ? (
                                <>
                                  <Box mb={2} flex={1}>
                                    <Typography variant="caption" color="text.secondary" fontWeight={600} display="block" gutterBottom>
                                      Connected Wallet Address
                                    </Typography>
                                    <Paper
                                      variant="outlined"
                                      sx={{
                                        p: 1.5,
                                        bgcolor: alpha(theme.palette.success.main, 0.05),
                                        border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
                                        borderRadius: 1.5,
                                      }}
                                    >
                                      <Typography variant="body2" fontFamily="monospace" sx={{ wordBreak: 'break-all', fontSize: '0.75rem' }}>
                                        {user.walletAddress}
                                      </Typography>
                                    </Paper>
                                  </Box>
                                  <Button
                                    variant="outlined"
                                    color="error"
                                    startIcon={<QrCode2 />}
                                    fullWidth
                                    onClick={() => setSnackbar({ open: true, message: 'Wallet disconnection coming soon', severity: 'info' })}
                                  >
                                    Disconnect Wallet
                                  </Button>
                                </>
                              ) : (
                                <>
                                  <Alert severity="info" icon={<Info />} sx={{ mb: 2 }}>
                                    <Typography variant="caption">
                                      Connect your wallet to enable cryptocurrency transactions and manage digital assets securely.
                                    </Typography>
                                  </Alert>
                                  <Button
                                    variant="contained"
                                    startIcon={<QrCode2 />}
                                    fullWidth
                                    onClick={() => setSnackbar({ open: true, message: 'Wallet connection dialog coming soon', severity: 'info' })}
                                  >
                                    Connect Wallet
                                  </Button>
                                </>
                              )}
                            </Box>
                          </CardContent>
                        </Card>
                      </Grid>
                    </Grid>
                  </motion.div>
                )}
              </>
            )}
          </Container>
        </Box>
      </Box>

      {/* Avatar Dialog */}
      <Dialog open={avatarDialogOpen} onClose={() => setAvatarDialogOpen(false)}>
        <DialogTitle>Change Avatar</DialogTitle>
        <DialogContent>
          <Typography>Avatar upload functionality coming soon!</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAvatarDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Email Change Request Dialog */}
      <Dialog
        open={emailChangeDialogOpen}
        onClose={() => {
          setEmailChangeDialogOpen(false);
          setNewEmail('');
          setEmailChangeReason('');
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <SecurityIcon color="warning" />
          Request Email Change
        </DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 3 }}>
            <AlertTitle>Security Verification Required</AlertTitle>
            Changing your email address requires security verification. You'll receive confirmation emails at both your current and new email addresses.
          </Alert>
          <Stack spacing={3} sx={{ mt: 2 }}>
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Current Email
              </Typography>
              <TextField
                fullWidth
                value={profileData.email}
                disabled
                InputProps={{
                  startAdornment: <Email sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
              />
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                New Email Address
              </Typography>
              <TextField
                fullWidth
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="Enter your new email address"
                InputProps={{
                  startAdornment: <Email sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
              />
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Reason for Change <Typography component="span" color="error">*</Typography>
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={3}
                value={emailChangeReason}
                onChange={(e) => setEmailChangeReason(e.target.value)}
                placeholder="Please provide a reason for changing your email address..."
                helperText="This helps us verify the legitimacy of your request"
              />
            </Box>
            <Alert severity="info" icon={<Info />}>
              After submitting this request, you'll receive verification codes at both email addresses. The change will be processed after successful verification.
            </Alert>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button
            onClick={() => {
              setEmailChangeDialogOpen(false);
              setNewEmail('');
              setEmailChangeReason('');
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={async () => {
              if (!newEmail || !emailChangeReason) {
                setSnackbar({ open: true, message: 'Please fill in all required fields', severity: 'error' });
                return;
              }
              setRequestingEmailChange(true);
              try {
                const response = await fetch('/api/profile/change-request', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    userId: user.id,
                    type: 'email',
                    currentValue: profileData.email,
                    newValue: newEmail,
                    reason: emailChangeReason,
                  }),
                });

                const result = await response.json();
                
                if (result.success) {
                  setSnackbar({
                    open: true,
                    message: 'Email change request submitted successfully. Our support team will review and process your request.',
                    severity: 'success',
                  });
                  setEmailChangeDialogOpen(false);
                  setNewEmail('');
                  setEmailChangeReason('');
                } else {
                  setSnackbar({ open: true, message: result.error || 'Failed to submit email change request', severity: 'error' });
                }
              } catch (error) {
                setSnackbar({ open: true, message: 'Failed to submit email change request', severity: 'error' });
              } finally {
                setRequestingEmailChange(false);
              }
            }}
            disabled={requestingEmailChange || !newEmail || !emailChangeReason}
            startIcon={requestingEmailChange ? <CircularProgress size={16} /> : <SecurityIcon />}
          >
            {requestingEmailChange ? 'Submitting...' : 'Submit Request'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Phone Change Request Dialog */}
      <Dialog
        open={phoneChangeDialogOpen}
        onClose={() => {
          setPhoneChangeDialogOpen(false);
          setNewPhone('');
          setPhoneChangeReason('');
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <SecurityIcon color="warning" />
          Request Phone Number Change
        </DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 3 }}>
            <AlertTitle>Security Verification Required</AlertTitle>
            Changing your phone number requires security verification. You'll receive verification codes via SMS at both your current and new phone numbers. Your request will be reviewed by our support team.
          </Alert>
          <Stack spacing={3} sx={{ mt: 2 }}>
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Current Phone Number
              </Typography>
              <TextField
                fullWidth
                value={profileData.phone}
                disabled
                InputProps={{
                  startAdornment: <Phone sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
              />
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                New Phone Number <Typography component="span" color="error">*</Typography>
              </Typography>
              <TextField
                fullWidth
                type="tel"
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
                placeholder="+1 (555) 123-4567"
                helperText="Include country code (e.g., +1 for US)"
                InputProps={{
                  startAdornment: <Phone sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
              />
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Reason for Change <Typography component="span" color="error">*</Typography>
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={3}
                value={phoneChangeReason}
                onChange={(e) => setPhoneChangeReason(e.target.value)}
                placeholder="Please provide a reason for changing your phone number..."
                helperText="This helps our support team verify the legitimacy of your request"
              />
            </Box>
            <Alert severity="info" icon={<Info />}>
              After submitting this request, you'll receive verification codes via SMS at both phone numbers. The change will be processed after successful verification and admin approval.
            </Alert>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button
            onClick={() => {
              setPhoneChangeDialogOpen(false);
              setNewPhone('');
              setPhoneChangeReason('');
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={async () => {
              if (!newPhone || !phoneChangeReason) {
                setSnackbar({ open: true, message: 'Please fill in all required fields', severity: 'error' });
                return;
              }
              setRequestingPhoneChange(true);
              try {
                const response = await fetch('/api/profile/change-request', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    userId: user.id,
                    type: 'phone',
                    currentValue: profileData.phone,
                    newValue: newPhone,
                    reason: phoneChangeReason,
                  }),
                });

                const result = await response.json();
                
                if (result.success) {
                  setSnackbar({
                    open: true,
                    message: 'Phone change request submitted successfully. Our support team will review and process your request.',
                    severity: 'success',
                  });
                  setPhoneChangeDialogOpen(false);
                  setNewPhone('');
                  setPhoneChangeReason('');
                } else {
                  setSnackbar({ open: true, message: result.error || 'Failed to submit phone change request', severity: 'error' });
                }
              } catch (error) {
                setSnackbar({ open: true, message: 'Failed to submit phone change request', severity: 'error' });
              } finally {
                setRequestingPhoneChange(false);
              }
            }}
            disabled={requestingPhoneChange || !newPhone || !phoneChangeReason}
            startIcon={requestingPhoneChange ? <CircularProgress size={16} /> : <SecurityIcon />}
          >
            {requestingPhoneChange ? 'Submitting...' : 'Submit Request'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  // Mock user data for development
  const user = {
    id: 'demo-user-id',
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+1 (555) 123-4567',
    role: 'buyer' as const,
    kycLevel: 'verified' as const,
    walletAddress: '0x1234567890abcdef1234567890abcdef12345678',
  };

  return {
    props: {
      user,
    },
  };
};

export default UserProfile;

