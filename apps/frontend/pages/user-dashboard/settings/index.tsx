import React, { useState } from 'react';
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
  Switch,
  TextField,
  FormControlLabel,
  Select,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Security,
  Timeline,
  AccountBalance,
  Gavel,
  Receipt,
  Settings as SettingsIcon,
  Help,
  ExitToApp,
  Menu as MenuIcon,
  Notifications,
  Refresh,
  Person,
  Lock,
  Language,
  Palette,
  NotificationsActive,
  VerifiedUser,
  CreditCard,
  Shield,
  Email,
  Phone,
  Edit,
  Save,
  Cancel,
  AccountBalanceWallet,
  QrCode2,
  Delete,
  Visibility,
  VisibilityOff,
  CloudDownload,
  Block,
  Warning,
  CheckCircle,
  Info,
  MonetizationOn,
  History,
  PrivacyTip,
  Devices,
  LocationOn,
  VpnKey,
  Fingerprint,
} from '@mui/icons-material';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';

const drawerWidth = 260;

interface UserSettingsProps {
  user: {
    name: string;
    email: string;
    phone: string;
    role: 'buyer' | 'seller';
    kycLevel: 'basic' | 'verified' | 'premium';
    walletAddress: string;
  };
}

const UserSettings: React.FC<UserSettingsProps> = ({ user }) => {
  const theme = useTheme();
  const router = useRouter();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuAnchor, setUserMenuAnchor] = useState<null | HTMLElement>(null);
  const [editMode, setEditMode] = useState(false);
  const [walletDialogOpen, setWalletDialogOpen] = useState(false);
  
  // Settings state
  const [settings, setSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    marketingEmails: false,
    twoFactorAuth: true,
    biometricAuth: false,
    darkMode: false,
    language: 'en',
    currency: 'USD',
    timezone: 'UTC',
  });

  // Profile state
  const [profile, setProfile] = useState({
    name: user.name,
    email: user.email,
    phone: user.phone,
  });

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/user-dashboard' },
    { text: 'My Escrows', icon: <Security />, path: '/user-dashboard/escrows' },
    { text: 'Transactions', icon: <Timeline />, path: '/user-dashboard/transactions' },
    { text: 'Wallet', icon: <AccountBalance />, path: '/user-dashboard/wallet' },
    { text: 'Disputes', icon: <Gavel />, path: '/user-dashboard/disputes' },
    { text: 'Reports', icon: <Receipt />, path: '/user-dashboard/reports' },
    { text: 'Profile', icon: <Person />, path: '/user-dashboard/profile' },
    { text: 'Notifications', icon: <Notifications />, path: '/user-dashboard/notifications' },
  ];

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);

  const handleSettingChange = (setting: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setSettings({ ...settings, [setting]: event.target.checked });
  };

  const handleSaveProfile = () => {
    // Save profile logic here
    setEditMode(false);
  };

  // Sidebar drawer
  const drawer = (
    <Box>
      <Box sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Avatar sx={{ width: 48, height: 48, bgcolor: 'primary.main' }}>
          {user.name.charAt(0)}
        </Avatar>
        <Box sx={{ flex: 1 }}>
          <Typography variant="subtitle1" fontWeight="bold" noWrap>
            {user.name}
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
              sx={{
                borderRadius: 2,
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                {item.icon}
              </ListItemIcon>
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
            onClick={() => router.push('/user-dashboard/settings')}
            sx={{ 
              borderRadius: 2,
              bgcolor: alpha(theme.palette.primary.main, 0.1),
            }}
          >
            <ListItemIcon sx={{ minWidth: 40, color: 'primary.main' }}>
              <SettingsIcon />
            </ListItemIcon>
            <ListItemText primary="Settings" primaryTypographyProps={{ color: 'primary.main', fontWeight: 600 }} />
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
        <title>Settings - Gold Escrow</title>
        <meta name="description" content="Manage your account settings" />
      </Head>

      <Box sx={{ display: 'flex', minHeight: '100vh' }}>
        {/* App Bar */}
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
              Settings
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Tooltip title="Notifications">
                <IconButton size="small">
                  <Badge badgeContent={2} color="error">
                    <Notifications />
                  </Badge>
                </IconButton>
              </Tooltip>

              <IconButton
                onClick={(e) => setUserMenuAnchor(e.currentTarget)}
                size="small"
                sx={{ ml: 1 }}
              >
                <Avatar sx={{ width: 32, height: 32 }}>{user.name.charAt(0)}</Avatar>
              </IconButton>

              <Menu
                anchorEl={userMenuAnchor}
                open={Boolean(userMenuAnchor)}
                onClose={() => setUserMenuAnchor(null)}
              >
                <MenuItem onClick={() => router.push('/user-dashboard/profile')}>Profile</MenuItem>
                <MenuItem onClick={() => router.push('/user-dashboard/settings')}>Settings</MenuItem>
                <Divider />
                <MenuItem onClick={() => router.push('/logout')}>
                  <ExitToApp sx={{ mr: 1 }} /> Logout
                </MenuItem>
              </Menu>
            </Box>
          </Toolbar>
        </AppBar>

        {/* Sidebar Drawer */}
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
              '& .MuiDrawer-paper': { 
                boxSizing: 'border-box', 
                width: drawerWidth,
                borderRight: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              },
            }}
            open
          >
            {drawer}
          </Drawer>
        </Box>

        {/* Main Content */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            width: { md: `calc(100% - ${drawerWidth}px)` },
            bgcolor: '#f5f5f5',
            minHeight: '100vh',
          }}
        >
          <Toolbar />
          
          <Container maxWidth="xl" sx={{ py: { xs: 2, sm: 3, md: 4 } }}>
            {/* Header */}
            <Box mb={5}>
              <Typography variant="h4" fontWeight="bold" gutterBottom>
                Account Settings
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Manage your account preferences and security
              </Typography>
            </Box>

            {/* Account Section */}
            <Box mb={5}>
              <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ mb: 3 }}>
                Account Information
              </Typography>
              <Grid container spacing={3}>
              {/* Profile Information */}
              <Grid item xs={12}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card>
                    <CardContent sx={{ p: 3 }}>
                      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                        <Box display="flex" alignItems="center" gap={2}>
                          <Person color="primary" />
                          <Typography variant="h6" fontWeight="semibold">
                            Profile Information
                          </Typography>
                        </Box>
                        {!editMode ? (
                          <Button startIcon={<Edit />} onClick={() => setEditMode(true)}>
                            Edit
                          </Button>
                        ) : (
                          <Box display="flex" gap={1}>
                            <Button startIcon={<Save />} variant="contained" onClick={handleSaveProfile}>
                              Save
                            </Button>
                            <Button startIcon={<Cancel />} onClick={() => setEditMode(false)}>
                              Cancel
                            </Button>
                          </Box>
                        )}
                      </Box>
                      <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                          <TextField
                            fullWidth
                            label="Full Name"
                            value={profile.name}
                            onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                            disabled={!editMode}
                          />
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <TextField
                            fullWidth
                            label="Email Address"
                            value={profile.email}
                            onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                            disabled={!editMode}
                            type="email"
                          />
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <TextField
                            fullWidth
                            label="Phone Number"
                            value={profile.phone}
                            onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                            disabled={!editMode}
                          />
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <Box>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                              KYC Status
                            </Typography>
                            <Chip 
                              label={user.kycLevel.toUpperCase()} 
                              color="success" 
                              icon={<VerifiedUser />}
                              sx={{ mt: 1 }}
                            />
                          </Box>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>

              {/* Wallet Connection */}
              <Grid item xs={12}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                >
                  <Card>
                    <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                      <Box display="flex" alignItems="center" gap={2} mb={3}>
                        <AccountBalanceWallet color="primary" />
                        <Typography variant="h6" fontWeight="semibold">
                          Wallet Connection
                        </Typography>
                      </Box>
                      <Box 
                        sx={{ 
                          p: 3, 
                          bgcolor: alpha(theme.palette.success.main, 0.1),
                          borderRadius: 2,
                          border: `1px solid ${alpha(theme.palette.success.main, 0.3)}`,
                        }}
                      >
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                          <Box>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                              Connected Wallet
                            </Typography>
                            <Typography variant="body1" fontWeight="medium" fontFamily="monospace">
                              {user.walletAddress}
                            </Typography>
                          </Box>
                          <Box display="flex" gap={1}>
                            <Tooltip title="Show QR Code">
                              <IconButton onClick={() => setWalletDialogOpen(true)}>
                                <QrCode2 />
                              </IconButton>
                            </Tooltip>
                            <Button variant="outlined" size="small">
                              Disconnect
                            </Button>
                          </Box>
                        </Box>
                      </Box>
                      <Button 
                        variant="contained" 
                        startIcon={<AccountBalanceWallet />}
                        sx={{ mt: 2 }}
                      >
                        Connect New Wallet
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
              </Grid>
            </Box>

            {/* Security & Privacy Section */}
            <Box mb={5}>
              <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ mb: 3 }}>
                Security & Privacy
              </Typography>
              <Grid container spacing={3}>
              {/* Security Settings */}
              <Grid item xs={12} md={6}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                >
                  <Card sx={{ height: '100%' }}>
                    <CardContent sx={{ p: 3 }}>
                      <Box display="flex" alignItems="center" gap={2} mb={3}>
                        <Shield color="primary" />
                        <Typography variant="h6" fontWeight="semibold">
                          Security
                        </Typography>
                      </Box>
                      <List>
                        <ListItem>
                          <ListItemText 
                            primary="Two-Factor Authentication" 
                            secondary="Add an extra layer of security"
                          />
                          <Switch
                            checked={settings.twoFactorAuth}
                            onChange={handleSettingChange('twoFactorAuth')}
                          />
                        </ListItem>
                        <Divider />
                        <ListItem>
                          <ListItemText 
                            primary="Biometric Authentication" 
                            secondary="Use fingerprint or face ID"
                          />
                          <Switch
                            checked={settings.biometricAuth}
                            onChange={handleSettingChange('biometricAuth')}
                          />
                        </ListItem>
                        <Divider />
                        <ListItem>
                          <Button variant="outlined" fullWidth startIcon={<Lock />}>
                            Change Password
                          </Button>
                        </ListItem>
                      </List>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>

              {/* Notification Settings */}
              <Grid item xs={12} md={6}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.3 }}
                >
                  <Card sx={{ height: '100%' }}>
                    <CardContent sx={{ p: 3 }}>
                      <Box display="flex" alignItems="center" gap={2} mb={3}>
                        <NotificationsActive color="primary" />
                        <Typography variant="h6" fontWeight="semibold">
                          Notifications
                        </Typography>
                      </Box>
                      <List>
                        <ListItem>
                          <ListItemText 
                            primary="Email Notifications" 
                            secondary="Receive updates via email"
                          />
                          <Switch
                            checked={settings.emailNotifications}
                            onChange={handleSettingChange('emailNotifications')}
                          />
                        </ListItem>
                        <Divider />
                        <ListItem>
                          <ListItemText 
                            primary="SMS Notifications" 
                            secondary="Receive text message alerts"
                          />
                          <Switch
                            checked={settings.smsNotifications}
                            onChange={handleSettingChange('smsNotifications')}
                          />
                        </ListItem>
                        <Divider />
                        <ListItem>
                          <ListItemText 
                            primary="Push Notifications" 
                            secondary="Browser push notifications"
                          />
                          <Switch
                            checked={settings.pushNotifications}
                            onChange={handleSettingChange('pushNotifications')}
                          />
                        </ListItem>
                        <Divider />
                        <ListItem>
                          <ListItemText 
                            primary="Marketing Emails" 
                            secondary="Promotional content and offers"
                          />
                          <Switch
                            checked={settings.marketingEmails}
                            onChange={handleSettingChange('marketingEmails')}
                          />
                        </ListItem>
                      </List>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>

              {/* Privacy & Data */}
              <Grid item xs={12} sm={6}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.5 }}
                >
                  <Card sx={{ height: '100%' }}>
                    <CardContent sx={{ p: 3 }}>
                      <Box display="flex" alignItems="center" gap={2} mb={3}>
                        <PrivacyTip color="primary" />
                        <Typography variant="h6" fontWeight="semibold">
                          Privacy & Data
                        </Typography>
                      </Box>
                      <List>
                        <ListItem>
                          <ListItemIcon>
                            <CloudDownload />
                          </ListItemIcon>
                          <ListItemText 
                            primary="Download Your Data" 
                            secondary="Export all your account data"
                          />
                          <Button size="small" variant="outlined">
                            Export
                          </Button>
                        </ListItem>
                        <Divider />
                        <ListItem>
                          <ListItemIcon>
                            <History />
                          </ListItemIcon>
                          <ListItemText 
                            primary="Activity Log" 
                            secondary="View your account activity"
                          />
                          <Button size="small" variant="outlined">
                            View
                          </Button>
                        </ListItem>
                        <Divider />
                        <ListItem>
                          <ListItemIcon>
                            <Devices />
                          </ListItemIcon>
                          <ListItemText 
                            primary="Active Sessions" 
                            secondary="Manage logged-in devices"
                          />
                          <Button size="small" variant="outlined">
                            Manage
                          </Button>
                        </ListItem>
                      </List>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
              </Grid>
            </Box>

            {/* Notifications & Preferences Section */}
            <Box mb={5}>
              <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ mb: 3 }}>
                Notifications & Preferences
              </Typography>
              <Grid container spacing={3}>
              {/* Notification Settings */}
              <Grid item xs={12}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card>
                    <CardContent sx={{ p: 3 }}>
                      <Box display="flex" alignItems="center" gap={2} mb={3}>
                        <NotificationsActive color="primary" />
                        <Typography variant="h6" fontWeight="semibold">
                          Preferences
                        </Typography>
                      </Box>
                      <Grid container spacing={3}>
                        <Grid item xs={12} md={4}>
                          <FormControl fullWidth>
                            <InputLabel>Language</InputLabel>
                            <Select
                              value={settings.language}
                              label="Language"
                              onChange={(e) => setSettings({ ...settings, language: e.target.value })}
                            >
                              <MenuItem value="en">English</MenuItem>
                              <MenuItem value="es">Spanish</MenuItem>
                              <MenuItem value="fr">French</MenuItem>
                              <MenuItem value="de">German</MenuItem>
                            </Select>
                          </FormControl>
                        </Grid>
                        <Grid item xs={12} md={4}>
                          <FormControl fullWidth>
                            <InputLabel>Currency</InputLabel>
                            <Select
                              value={settings.currency}
                              label="Currency"
                              onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                            >
                              <MenuItem value="USD">USD ($)</MenuItem>
                              <MenuItem value="EUR">EUR (€)</MenuItem>
                              <MenuItem value="GBP">GBP (£)</MenuItem>
                              <MenuItem value="JPY">JPY (¥)</MenuItem>
                            </Select>
                          </FormControl>
                        </Grid>
                        <Grid item xs={12} md={4}>
                          <FormControl fullWidth>
                            <InputLabel>Timezone</InputLabel>
                            <Select
                              value={settings.timezone}
                              label="Timezone"
                              onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
                            >
                              <MenuItem value="UTC">UTC</MenuItem>
                              <MenuItem value="EST">EST</MenuItem>
                              <MenuItem value="PST">PST</MenuItem>
                              <MenuItem value="GMT">GMT</MenuItem>
                            </Select>
                          </FormControl>
                        </Grid>
                        <Grid item xs={12}>
                          <FormControlLabel
                            control={
                              <Switch
                                checked={settings.darkMode}
                                onChange={handleSettingChange('darkMode')}
                              />
                            }
                            label="Dark Mode"
                          />
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>

              {/* Privacy & Data */}
              <Grid item xs={12} sm={6}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.5 }}
                >
                  <Card sx={{ height: '100%' }}>
                    <CardContent sx={{ p: 3 }}>
                      <Box display="flex" alignItems="center" gap={2} mb={3}>
                        <PrivacyTip color="primary" />
                        <Typography variant="h6" fontWeight="semibold">
                          Privacy & Data
                        </Typography>
                      </Box>
                      <List>
                        <ListItem>
                          <ListItemIcon>
                            <CloudDownload />
                          </ListItemIcon>
                          <ListItemText 
                            primary="Download Your Data" 
                            secondary="Export all your account data"
                          />
                          <Button size="small" variant="outlined">
                            Export
                          </Button>
                        </ListItem>
                        <Divider />
                        <ListItem>
                          <ListItemIcon>
                            <History />
                          </ListItemIcon>
                          <ListItemText 
                            primary="Activity Log" 
                            secondary="View your account activity"
                          />
                          <Button size="small" variant="outlined">
                            View
                          </Button>
                        </ListItem>
                        <Divider />
                        <ListItem>
                          <ListItemIcon>
                            <Devices />
                          </ListItemIcon>
                          <ListItemText 
                            primary="Active Sessions" 
                            secondary="Manage logged-in devices"
                          />
                          <Button size="small" variant="outlined">
                            Manage
                          </Button>
                        </ListItem>
                      </List>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>

              {/* Payment Methods */}
              <Grid item xs={12} sm={6}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.6 }}
                >
                  <Card sx={{ height: '100%' }}>
                    <CardContent sx={{ p: 3 }}>
                      <Box display="flex" alignItems="center" gap={2} mb={3}>
                        <CreditCard color="primary" />
                        <Typography variant="h6" fontWeight="semibold">
                          Payment Methods
                        </Typography>
                      </Box>
                      <List>
                        <ListItem>
                          <ListItemIcon>
                            <CreditCard />
                          </ListItemIcon>
                          <ListItemText 
                            primary="Visa •••• 4242" 
                            secondary="Expires 12/25"
                          />
                          <IconButton size="small">
                            <Delete />
                          </IconButton>
                        </ListItem>
                        <Divider />
                        <ListItem>
                          <ListItemIcon>
                            <AccountBalanceWallet />
                          </ListItemIcon>
                          <ListItemText 
                            primary="Bank Account" 
                            secondary="Chase •••• 1234"
                          />
                          <IconButton size="small">
                            <Delete />
                          </IconButton>
                        </ListItem>
                        <Divider />
                        <ListItem>
                          <Button 
                            variant="outlined" 
                            fullWidth 
                            startIcon={<CreditCard />}
                          >
                            Add Payment Method
                          </Button>
                        </ListItem>
                      </List>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
              </Grid>
            </Box>

            {/* Financial Section */}
            <Box mb={5}>
              <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ mb: 3 }}>
                Financial Settings
              </Typography>
              <Grid container spacing={3}>
              {/* Transaction Limits */}
              <Grid item xs={12}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.7 }}
                >
                  <Card>
                    <CardContent sx={{ p: 3 }}>
                      <Box display="flex" alignItems="center" gap={2} mb={3}>
                        <MonetizationOn color="primary" />
                        <Typography variant="h6" fontWeight="semibold">
                          Transaction Limits
                        </Typography>
                      </Box>
                      <Grid container spacing={3}>
                        <Grid item xs={12} sm={6} md={3}>
                          <Box 
                            sx={{ 
                              p: 2, 
                              border: '1px solid',
                              borderColor: 'divider',
                              borderRadius: 2,
                            }}
                          >
                            <Typography variant="caption" color="text.secondary">
                              Daily Limit
                            </Typography>
                            <Typography variant="h5" fontWeight="bold" color="primary.main">
                              $50,000
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Used: $12,500 (25%)
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                          <Box 
                            sx={{ 
                              p: 2, 
                              border: '1px solid',
                              borderColor: 'divider',
                              borderRadius: 2,
                            }}
                          >
                            <Typography variant="caption" color="text.secondary">
                              Weekly Limit
                            </Typography>
                            <Typography variant="h5" fontWeight="bold" color="primary.main">
                              $250,000
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Used: $45,000 (18%)
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                          <Box 
                            sx={{ 
                              p: 2, 
                              border: '1px solid',
                              borderColor: 'divider',
                              borderRadius: 2,
                            }}
                          >
                            <Typography variant="caption" color="text.secondary">
                              Monthly Limit
                            </Typography>
                            <Typography variant="h5" fontWeight="bold" color="primary.main">
                              $1,000,000
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Used: $152,500 (15%)
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                          <Box 
                            sx={{ 
                              p: 2, 
                              border: '1px solid',
                              borderColor: 'divider',
                              borderRadius: 2,
                            }}
                          >
                            <Typography variant="caption" color="text.secondary">
                              Per Transaction
                            </Typography>
                            <Typography variant="h5" fontWeight="bold" color="primary.main">
                              $100,000
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Maximum single amount
                            </Typography>
                          </Box>
                        </Grid>
                      </Grid>
                      <Box mt={2}>
                        <Button variant="outlined" startIcon={<Info />}>
                          Request Limit Increase
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
              </Grid>
            </Box>

            {/* Developer Section */}
            <Box mb={5}>
              <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ mb: 3 }}>
                Developer Settings
              </Typography>
              <Grid container spacing={3}>
              {/* API Keys */}
              <Grid item xs={12}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.8 }}
                >
                  <Card>
                    <CardContent sx={{ p: 3 }}>
                      <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
                        <Box display="flex" alignItems="center" gap={2}>
                          <VpnKey color="primary" />
                          <Typography variant="h6" fontWeight="semibold">
                            API Keys
                          </Typography>
                        </Box>
                        <Button variant="contained" startIcon={<VpnKey />}>
                          Generate New Key
                        </Button>
                      </Box>
                      <List>
                        <ListItem>
                          <ListItemIcon>
                            <VpnKey />
                          </ListItemIcon>
                          <ListItemText 
                            primary="Production API Key" 
                            secondary="Created: Jan 15, 2024 • Last used: 2 hours ago"
                          />
                          <Box display="flex" gap={1}>
                            <IconButton size="small">
                              <Visibility />
                            </IconButton>
                            <IconButton size="small" color="error">
                              <Delete />
                            </IconButton>
                          </Box>
                        </ListItem>
                        <Divider />
                        <ListItem>
                          <ListItemIcon>
                            <VpnKey />
                          </ListItemIcon>
                          <ListItemText 
                            primary="Development API Key" 
                            secondary="Created: Dec 10, 2023 • Last used: 1 day ago"
                          />
                          <Box display="flex" gap={1}>
                            <IconButton size="small">
                              <Visibility />
                            </IconButton>
                            <IconButton size="small" color="error">
                              <Delete />
                            </IconButton>
                          </Box>
                        </ListItem>
                      </List>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
              </Grid>
            </Box>

            {/* Danger Zone Section */}
            <Box mb={3}>
              <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ mb: 3 }} color="error.main">
                Danger Zone
              </Typography>
              <Grid container spacing={3}>
              {/* Danger Zone */}
              <Grid item xs={12}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.9 }}
                >
                  <Card 
                    sx={{ 
                      border: '2px solid',
                      borderColor: 'error.main',
                    }}
                  >
                    <CardContent sx={{ p: 3 }}>
                      <Box display="flex" alignItems="center" gap={2} mb={3}>
                        <Warning color="error" />
                        <Typography variant="h6" fontWeight="semibold" color="error.main">
                          Danger Zone
                        </Typography>
                      </Box>
                      <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                          <Box 
                            sx={{ 
                              p: 2, 
                              border: '1px solid',
                              borderColor: 'error.light',
                              borderRadius: 2,
                              bgcolor: alpha(theme.palette.error.main, 0.05),
                            }}
                          >
                            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                              Deactivate Account
                            </Typography>
                            <Typography variant="body2" color="text.secondary" mb={2}>
                              Temporarily disable your account. You can reactivate it anytime.
                            </Typography>
                            <Button 
                              variant="outlined" 
                              color="error" 
                              size="small"
                              startIcon={<Block />}
                            >
                              Deactivate Account
                            </Button>
                          </Box>
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <Box 
                            sx={{ 
                              p: 2, 
                              border: '1px solid',
                              borderColor: 'error.main',
                              borderRadius: 2,
                              bgcolor: alpha(theme.palette.error.main, 0.05),
                            }}
                          >
                            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                              Delete Account
                            </Typography>
                            <Typography variant="body2" color="text.secondary" mb={2}>
                              Permanently delete your account and all data. This cannot be undone.
                            </Typography>
                            <Button 
                              variant="contained" 
                              color="error" 
                              size="small"
                              startIcon={<Delete />}
                            >
                              Delete Account
                            </Button>
                          </Box>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
              </Grid>
            </Box>
          </Container>
        </Box>
      </Box>

      {/* Wallet QR Dialog */}
      <Dialog open={walletDialogOpen} onClose={() => setWalletDialogOpen(false)}>
        <DialogTitle>Wallet QR Code</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" alignItems="center" p={3}>
            <Box 
              sx={{ 
                width: 200, 
                height: 200, 
                bgcolor: '#f0f0f0', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                borderRadius: 2,
              }}
            >
              <QrCode2 sx={{ fontSize: 100, color: 'text.secondary' }} />
            </Box>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 2, textAlign: 'center' }}>
              {user.walletAddress}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setWalletDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Floating Help Button */}
      <Box sx={{ position: 'fixed', bottom: 24, right: 24, zIndex: 1000 }}>
        <Tooltip title="Need Help?">
          <IconButton
            sx={{
              width: 56,
              height: 56,
              bgcolor: 'primary.main',
              color: 'white',
              '&:hover': { bgcolor: 'primary.dark', transform: 'scale(1.1)' },
              boxShadow: 3,
              transition: 'all 0.3s',
            }}
            onClick={() => router.push('/user-dashboard/help')}
          >
            <Help />
          </IconButton>
        </Tooltip>
      </Box>
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const user = {
    name: 'John Smith',
    email: 'john.smith@email.com',
    phone: '+1 (555) 123-4567',
    role: 'buyer' as const,
    kycLevel: 'premium' as const,
    walletAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
  };

  return {
    props: {
      user,
    },
  };
};

export default UserSettings;
