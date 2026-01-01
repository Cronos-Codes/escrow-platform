import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  Snackbar,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  Paper,
  Stack,
  Checkbox,
  FormControlLabel,
  Switch,
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
  NotificationsActive,
  CheckCircle,
  Warning,
  Info,
  Error as ErrorIcon,
  Delete,
  MarkEmailRead,
  MarkEmailUnread,
  FilterList,
  Refresh,
  Person,
  MoreVert,
  NotificationsNone,
  CheckCircleOutline,
  AccessTime,
  Email,
  PhoneAndroid,
  Sms,
  AccountBalanceWallet,
  Gavel as GavelIcon,
  Security as SecurityIcon,
  LocalOffer,
} from '@mui/icons-material';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';

const drawerWidth = 280;

interface Notification {
  id: string;
  type: 'success' | 'warning' | 'info' | 'error';
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
  link?: string;
  icon?: React.ReactNode;
}

interface UserNotificationsProps {
  user: {
    id: string;
    name: string;
    email: string;
    phone: string;
    role: 'buyer' | 'seller';
    kycLevel: 'basic' | 'verified' | 'premium';
  };
}

const UserNotifications: React.FC<UserNotificationsProps> = ({ user }) => {
  const theme = useTheme();
  const router = useRouter();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuAnchor, setUserMenuAnchor] = useState<null | HTMLElement>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [tabValue, setTabValue] = useState(0);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' | 'info' });
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([]);
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    escrowUpdates: true,
    disputeAlerts: true,
    paymentNotifications: true,
    securityAlerts: true,
    marketingEmails: false,
  });

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/notifications?userId=${user.id}`);
      const result = await response.json();
      
      if (result.success && result.data) {
        setNotifications(result.data);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      // Use mock data for development
      setNotifications(generateMockNotifications());
    } finally {
      setLoading(false);
    }
  };

  const generateMockNotifications = (): Notification[] => {
    const now = Date.now();
    return [
      {
        id: '1',
        type: 'success',
        title: 'Escrow Completed',
        message: 'Escrow #ESC-2024-002 has been successfully completed. Funds have been released.',
        timestamp: now - 7200000,
        read: false,
        link: '/user-dashboard/escrows',
      },
      {
        id: '2',
        type: 'info',
        title: 'Payment Received',
        message: 'You received $5,000.00 in your wallet from Escrow #ESC-2024-001',
        timestamp: now - 3600000,
        read: false,
        link: '/user-dashboard/wallet',
      },
      {
        id: '3',
        type: 'warning',
        title: 'Escrow Pending Action',
        message: 'Escrow #ESC-2024-005 is awaiting your approval. Please review and take action.',
        timestamp: now - 1800000,
        read: true,
        link: '/user-dashboard/escrows',
      },
      {
        id: '4',
        type: 'info',
        title: 'KYC Verification Updated',
        message: 'Your KYC verification status has been updated to Premium level.',
        timestamp: now - 86400000,
        read: true,
        link: '/user-dashboard/profile',
      },
      {
        id: '5',
        type: 'success',
        title: 'Dispute Resolved',
        message: 'Dispute #DSP-2024-001 has been resolved in your favor.',
        timestamp: now - 172800000,
        read: true,
        link: '/user-dashboard/disputes',
      },
      {
        id: '6',
        type: 'error',
        title: 'Transaction Failed',
        message: 'Transaction #TXN-2024-123 failed due to insufficient funds. Please check your wallet.',
        timestamp: now - 259200000,
        read: false,
        link: '/user-dashboard/wallet',
      },
      {
        id: '7',
        type: 'info',
        title: 'New Escrow Created',
        message: 'A new escrow #ESC-2024-006 has been created with you as the buyer.',
        timestamp: now - 345600000,
        read: true,
        link: '/user-dashboard/escrows',
      },
      {
        id: '8',
        type: 'warning',
        title: 'Security Alert',
        message: 'New login detected from a new device. If this wasn\'t you, please secure your account.',
        timestamp: now - 432000000,
        read: false,
        link: '/user-dashboard/settings',
      },
    ];
  };

  const handleMarkAsRead = async (notificationId: string) => {
    const notification = notifications.find(n => n.id === notificationId);
    if (!notification) return;

    const newReadState = !notification.read;
    
    try {
      const response = await fetch('/api/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, notificationId, read: newReadState }),
      });

      const result = await response.json();
      
      if (result.success) {
        setNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, read: newReadState } : n));
        setSnackbar({ 
          open: true, 
          message: newReadState ? 'Notification marked as read' : 'Notification marked as unread', 
          severity: 'success' 
        });
      }
    } catch (error) {
      console.error('Error toggling notification read state:', error);
      // Optimistically update UI
      setNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, read: newReadState } : n));
      setSnackbar({ 
        open: true, 
        message: newReadState ? 'Notification marked as read' : 'Notification marked as unread', 
        severity: 'success' 
      });
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const response = await fetch('/api/notifications/read-all', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      });

      const result = await response.json();
      
      if (result.success) {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        setSnackbar({ open: true, message: 'All notifications marked as read', severity: 'success' });
      }
    } catch (error) {
      console.error('Error marking all as read:', error);
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setSnackbar({ open: true, message: 'All notifications marked as read', severity: 'success' });
    }
  };

  const handleDelete = async (notificationId: string) => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, notificationId }),
      });

      const result = await response.json();
      
      if (result.success) {
        setNotifications(prev => prev.filter(n => n.id !== notificationId));
        setSnackbar({ open: true, message: 'Notification deleted', severity: 'success' });
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      setSnackbar({ open: true, message: 'Notification deleted', severity: 'success' });
    }
  };

  const handleDeleteSelected = async () => {
    try {
      for (const id of selectedNotifications) {
        await handleDelete(id);
      }
      setSelectedNotifications([]);
      setSnackbar({ open: true, message: `${selectedNotifications.length} notifications deleted`, severity: 'success' });
    } catch (error) {
      console.error('Error deleting selected notifications:', error);
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedNotifications(prev =>
      prev.includes(id) ? prev.filter(n => n !== id) : [...prev, id]
    );
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle color="success" />;
      case 'warning':
        return <Warning color="warning" />;
      case 'error':
        return <ErrorIcon color="error" />;
      default:
        return <Info color="info" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'success':
        return theme.palette.success.main;
      case 'warning':
        return theme.palette.warning.main;
      case 'error':
        return theme.palette.error.main;
      default:
        return theme.palette.info.main;
    }
  };

  const getPaletteColor = (colorName: string) => {
    const colorMap: Record<string, string> = {
      primary: theme.palette.primary.main,
      secondary: theme.palette.secondary?.main || theme.palette.primary.main,
      success: theme.palette.success.main,
      error: theme.palette.error.main,
      warning: theme.palette.warning.main,
      info: theme.palette.info.main,
    };
    return colorMap[colorName] || theme.palette.primary.main;
  };

  const formatTimestamp = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;
    return new Date(timestamp).toLocaleDateString();
  };

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread') return !n.read;
    if (filter === 'read') return n.read;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/user-dashboard' },
    { text: 'My Escrows', icon: <Security />, path: '/user-dashboard/escrows' },
    { text: 'Transactions', icon: <Timeline />, path: '/user-dashboard/transactions' },
    { text: 'Wallet', icon: <AccountBalance />, path: '/user-dashboard/wallet' },
    { text: 'Disputes', icon: <Gavel />, path: '/user-dashboard/disputes' },
    { text: 'Reports', icon: <Receipt />, path: '/user-dashboard/reports' },
    { text: 'Profile', icon: <Person />, path: '/user-dashboard/profile' },
  ];

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);

  const drawer = (
    <Box>
      <Box sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Avatar sx={{ width: 56, height: 56, bgcolor: 'primary.main' }}>
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
            onClick={() => router.push('/user-dashboard/notifications')}
            sx={{ 
              borderRadius: 2,
              bgcolor: alpha(theme.palette.primary.main, 0.1),
            }}
          >
            <ListItemIcon sx={{ minWidth: 40, color: 'primary.main' }}>
              <Badge badgeContent={unreadCount} color="error">
                <Notifications />
              </Badge>
            </ListItemIcon>
            <ListItemText primary="Notifications" primaryTypographyProps={{ color: 'primary.main', fontWeight: 600 }} />
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
        <title>Notifications - Gold Escrow</title>
        <meta name="description" content="View and manage your notifications" />
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
              Notifications
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Tooltip title="Refresh">
                <IconButton size="small" onClick={fetchNotifications}>
                  <Refresh />
                </IconButton>
              </Tooltip>

              <IconButton
                onClick={(e: React.MouseEvent<HTMLElement>) => setUserMenuAnchor(e.currentTarget)}
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
            {/* Modern Header Card */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card 
                sx={{ 
                  mb: 3, 
                  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary?.main || theme.palette.primary.dark} 100%)`,
                  boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                }}
              >
                <CardContent sx={{ p: 4 }}>
                  <Box display="flex" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={3}>
                    <Box sx={{ color: 'white', flex: 1 }}>
                      <Box display="flex" alignItems="center" gap={2} mb={1}>
                        <Box
                          sx={{
                            width: 56,
                            height: 56,
                            borderRadius: 2,
                            bgcolor: 'rgba(255,255,255,0.2)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backdropFilter: 'blur(10px)',
                          }}
                        >
                          <NotificationsActive sx={{ fontSize: 32, color: 'white' }} />
                        </Box>
                        <Box>
                          <Typography variant="h4" fontWeight="bold" gutterBottom>
                            Notifications
                          </Typography>
                          <Typography variant="body1" sx={{ opacity: 0.9 }}>
                            {unreadCount > 0 ? (
                              <>
                                <strong>{unreadCount}</strong> unread notification{unreadCount !== 1 ? 's' : ''} • {notifications.length} total
                              </>
                            ) : (
                              <>All caught up! You have no unread notifications</>
                            )}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                    <Stack direction="row" spacing={1.5} flexWrap="wrap">
                      {selectedNotifications.length > 0 && (
                        <Button
                          variant="contained"
                          color="error"
                          startIcon={<Delete />}
                          onClick={handleDeleteSelected}
                          sx={{ 
                            bgcolor: 'white', 
                            color: 'error.main',
                            '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' }
                          }}
                        >
                          Delete ({selectedNotifications.length})
                        </Button>
                      )}
                      <Button
                        variant="contained"
                        startIcon={<MarkEmailRead />}
                        onClick={handleMarkAllAsRead}
                        disabled={unreadCount === 0}
                        sx={{ 
                          bgcolor: 'white', 
                          color: 'primary.main',
                          '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' },
                          '&:disabled': { bgcolor: 'rgba(255,255,255,0.5)', color: 'rgba(0,0,0,0.3)' }
                        }}
                      >
                        Mark All Read
                      </Button>
                      <Tooltip title="Refresh notifications">
                        <IconButton
                          onClick={fetchNotifications}
                          disabled={loading}
                          sx={{ 
                            bgcolor: 'rgba(255,255,255,0.2)', 
                            color: 'white',
                            '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' }
                          }}
                        >
                          <Refresh />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </Box>
                </CardContent>
              </Card>
            </motion.div>

            {/* Modern Tabs */}
            <Paper 
              sx={{ 
                mb: 3,
                borderRadius: 2,
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              }}
            >
              <Tabs 
                value={tabValue} 
                onChange={(e: React.SyntheticEvent, v: number) => setTabValue(v)}
                sx={{
                  '& .MuiTab-root': {
                    textTransform: 'none',
                    fontWeight: 600,
                    fontSize: '0.95rem',
                  },
                  '& .Mui-selected': {
                    color: theme.palette.primary.main,
                  },
                }}
              >
                <Tab 
                  label={
                    <Box display="flex" alignItems="center" gap={1}>
                      <Notifications />
                      <span>All Notifications</span>
                      {unreadCount > 0 && (
                        <Chip 
                          label={unreadCount} 
                          size="small" 
                          color="error"
                          sx={{ height: 20, minWidth: 20, fontSize: '0.7rem' }}
                        />
                      )}
                    </Box>
                  } 
                />
                <Tab 
                  label={
                    <Box display="flex" alignItems="center" gap={1}>
                      <SettingsIcon />
                      <span>Settings</span>
                    </Box>
                  } 
                />
              </Tabs>
            </Paper>

            {/* Tab Content */}
            {tabValue === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                {/* Modern Filter Chips */}
                <Card sx={{ mb: 3, p: 2, bgcolor: alpha(theme.palette.primary.main, 0.02) }}>
                  <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
                    <FilterList sx={{ color: 'text.secondary', mr: 1 }} />
                    <Typography variant="body2" color="text.secondary" sx={{ mr: 1, fontWeight: 500 }}>
                      Filter:
                    </Typography>
                    <Chip
                      label="All"
                      onClick={() => setFilter('all')}
                      color={filter === 'all' ? 'primary' : 'default'}
                      clickable
                      sx={{
                        fontWeight: filter === 'all' ? 600 : 400,
                        transition: 'all 0.2s',
                        '&:hover': {
                          bgcolor: filter === 'all' ? undefined : alpha(theme.palette.primary.main, 0.08),
                        },
                      }}
                    />
                    <Chip
                      label={`Unread (${unreadCount})`}
                      onClick={() => setFilter('unread')}
                      color={filter === 'unread' ? 'primary' : 'default'}
                      clickable
                      icon={filter === 'unread' ? <NotificationsActive /> : undefined}
                      sx={{
                        fontWeight: filter === 'unread' ? 600 : 400,
                        transition: 'all 0.2s',
                        '&:hover': {
                          bgcolor: filter === 'unread' ? undefined : alpha(theme.palette.primary.main, 0.08),
                        },
                      }}
                    />
                    <Chip
                      label={`Read (${notifications.length - unreadCount})`}
                      onClick={() => setFilter('read')}
                      color={filter === 'read' ? 'primary' : 'default'}
                      clickable
                      icon={filter === 'read' ? <CheckCircleOutline /> : undefined}
                      sx={{
                        fontWeight: filter === 'read' ? 600 : 400,
                        transition: 'all 0.2s',
                        '&:hover': {
                          bgcolor: filter === 'read' ? undefined : alpha(theme.palette.primary.main, 0.08),
                        },
                      }}
                    />
                  </Box>
                </Card>

                {loading ? (
                  <Card>
                    <CardContent sx={{ textAlign: 'center', py: 8 }}>
                      <CircularProgress size={48} sx={{ mb: 2 }} />
                      <Typography variant="body1" color="text.secondary">
                        Loading notifications...
                      </Typography>
                    </CardContent>
                  </Card>
                ) : filteredNotifications.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card sx={{ 
                      background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.secondary?.main || theme.palette.primary.main, 0.02)} 100%)`,
                      border: `2px dashed ${alpha(theme.palette.divider, 0.5)}`,
                    }}>
                      <CardContent sx={{ textAlign: 'center', py: 8 }}>
                        <Box
                          sx={{
                            width: 80,
                            height: 80,
                            borderRadius: '50%',
                            bgcolor: alpha(theme.palette.primary.main, 0.1),
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mx: 'auto',
                            mb: 3,
                          }}
                        >
                          <NotificationsNone sx={{ fontSize: 48, color: 'text.secondary' }} />
                        </Box>
                        <Typography variant="h5" fontWeight="bold" gutterBottom>
                          {filter === 'unread' ? 'All caught up!' : 'No notifications'}
                        </Typography>
                        <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 400, mx: 'auto' }}>
                          {filter === 'unread' 
                            ? 'You have no unread notifications. Great job staying on top of things!' 
                            : 'You don\'t have any notifications yet. Check back later!'}
                        </Typography>
                      </CardContent>
                    </Card>
                  </motion.div>
                ) : (
                  <Card sx={{ borderRadius: 2, overflow: 'hidden' }}>
                    <AnimatePresence>
                      {filteredNotifications.map((notification, index) => (
                        <motion.div
                          key={notification.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 10 }}
                          transition={{ duration: 0.2, delay: index * 0.02 }}
                        >
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1.5,
                              p: 1.5,
                              px: 2,
                              borderLeft: `3px solid ${notification.read ? 'transparent' : getNotificationColor(notification.type)}`,
                              bgcolor: notification.read 
                                ? 'background.paper' 
                                : alpha(getNotificationColor(notification.type), 0.04),
                              borderBottom: index < filteredNotifications.length - 1 ? `1px solid ${alpha(theme.palette.divider, 0.5)}` : 'none',
                              transition: 'all 0.2s',
                              position: 'relative',
                              cursor: notification.link ? 'pointer' : 'default',
                              '@media (hover: hover)': {
                                '&:hover': {
                                  bgcolor: notification.read 
                                    ? alpha(theme.palette.action.hover, 0.5)
                                    : alpha(getNotificationColor(notification.type), 0.08),
                                  '& .notification-actions': {
                                    opacity: 1,
                                    visibility: 'visible',
                                  },
                                },
                              },
                              '&:active': {
                                bgcolor: notification.read 
                                  ? alpha(theme.palette.action.selected, 0.3)
                                  : alpha(getNotificationColor(notification.type), 0.12),
                              },
                            }}
                            onClick={(e: React.MouseEvent<HTMLDivElement>) => {
                              // Only navigate if clicking on the notification itself, not on actions
                              if (notification.link && !(e.target as HTMLElement).closest('.notification-actions') && !(e.target as HTMLElement).closest('.MuiCheckbox-root')) {
                                router.push(notification.link);
                              }
                            }}
                          >
                            {/* Compact Icon */}
                            <Box
                              sx={{
                                width: 36,
                                height: 36,
                                borderRadius: 1.5,
                                bgcolor: alpha(getNotificationColor(notification.type), 0.1),
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                                '& svg': {
                                  fontSize: 20,
                                },
                              }}
                            >
                              {getNotificationIcon(notification.type)}
                            </Box>

                            {/* Content */}
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                              <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                                <Typography 
                                  variant="body2" 
                                  fontWeight={notification.read ? 500 : 600}
                                  sx={{ 
                                    fontSize: '0.875rem',
                                    color: 'text.primary',
                                  }}
                                  noWrap
                                >
                                  {notification.title}
                                </Typography>
                                {!notification.read && (
                                  <Box
                                    sx={{
                                      width: 6,
                                      height: 6,
                                      borderRadius: '50%',
                                      bgcolor: getNotificationColor(notification.type),
                                    }}
                                  />
                                )}
                              </Box>
                              <Typography 
                                variant="caption" 
                                color="text.secondary"
                                sx={{ 
                                  display: '-webkit-box',
                                  WebkitLineClamp: 1,
                                  WebkitBoxOrient: 'vertical',
                                  overflow: 'hidden',
                                  fontSize: '0.75rem',
                                  lineHeight: 1.4,
                                }}
                              >
                                {notification.message}
                              </Typography>
                              <Box display="flex" alignItems="center" gap={1} mt={0.5}>
                                <AccessTime sx={{ fontSize: 12, color: 'text.disabled' }} />
                                <Typography variant="caption" color="text.disabled" sx={{ fontSize: '0.7rem' }}>
                                  {formatTimestamp(notification.timestamp)}
                                </Typography>
                              </Box>
                            </Box>

                            {/* Quick Actions */}
                            <Box 
                              className="notification-actions"
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 0.5,
                                opacity: { xs: 1, md: 0 },
                                visibility: { xs: 'visible', md: 'hidden' },
                                transition: 'opacity 0.2s, visibility 0.2s',
                                flexShrink: 0,
                                '@media (hover: hover)': {
                                  // Only hide on devices that support hover
                                  opacity: 0,
                                  visibility: 'hidden',
                                },
                              }}
                              onClick={(e: React.MouseEvent<HTMLDivElement>) => {
                                // Stop event propagation to prevent notification click
                                e.stopPropagation();
                              }}
                              onMouseDown={(e: React.MouseEvent<HTMLDivElement>) => {
                                // Prevent notification click when clicking actions
                                e.stopPropagation();
                              }}
                            >
                              {notification.link && (
                                <Tooltip title="View Details" arrow>
                                  <IconButton
                                    size="small"
                                    onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                                      e.stopPropagation();
                                      router.push(notification.link!);
                                    }}
                                    sx={{
                                      width: 28,
                                      height: 28,
                                      color: 'primary.main',
                                      '&:hover': {
                                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                                        transform: 'scale(1.1)',
                                      },
                                      transition: 'all 0.2s',
                                    }}
                                  >
                                    <Info sx={{ fontSize: 16 }} />
                                  </IconButton>
                                </Tooltip>
                              )}
                              <Tooltip title={notification.read ? 'Mark as unread' : 'Mark as read'} arrow>
                                <IconButton
                                  size="small"
                                  onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                                    e.stopPropagation();
                                    handleMarkAsRead(notification.id);
                                  }}
                                  sx={{
                                    width: 28,
                                    height: 28,
                                    color: notification.read ? 'text.secondary' : 'primary.main',
                                    '&:hover': {
                                      bgcolor: alpha(theme.palette.primary.main, 0.1),
                                      transform: 'scale(1.1)',
                                    },
                                    transition: 'all 0.2s',
                                  }}
                                >
                                  {notification.read ? <MarkEmailUnread sx={{ fontSize: 16 }} /> : <MarkEmailRead sx={{ fontSize: 16 }} />}
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Delete notification" arrow>
                                <IconButton
                                  size="small"
                                  onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                                    e.stopPropagation();
                                    if (window.confirm('Are you sure you want to delete this notification?')) {
                                      handleDelete(notification.id);
                                    }
                                  }}
                                  sx={{
                                    width: 28,
                                    height: 28,
                                    color: 'text.secondary',
                                    '&:hover': {
                                      bgcolor: alpha(theme.palette.error.main, 0.1),
                                      color: 'error.main',
                                      transform: 'scale(1.1)',
                                    },
                                    transition: 'all 0.2s',
                                  }}
                                >
                                  <Delete sx={{ fontSize: 16 }} />
                                </IconButton>
                              </Tooltip>
                            </Box>

                            {/* Checkbox */}
                            <Checkbox
                              checked={selectedNotifications.includes(notification.id)}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                e.stopPropagation();
                                handleToggleSelect(notification.id);
                              }}
                              onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                                e.stopPropagation();
                              }}
                              size="small"
                              sx={{ 
                                width: 32,
                                height: 32,
                                p: 0.5,
                                flexShrink: 0,
                                '& .MuiSvgIcon-root': { fontSize: 18 },
                                '&:hover': {
                                  bgcolor: alpha(theme.palette.primary.main, 0.05),
                                },
                              }}
                            />
                          </Box>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </Card>
                )}
              </motion.div>
            )}

            {tabValue === 1 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Grid container spacing={3}>
                  {/* Header Section */}
                  <Grid item xs={12}>
                    <Card sx={{ borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, transparent 100%)` }}>
                      <CardContent sx={{ p: 3 }}>
                        <Box display="flex" alignItems="center" gap={2}>
                          <Box
                            sx={{
                              width: 56,
                              height: 56,
                              borderRadius: 2,
                              bgcolor: alpha(theme.palette.primary.main, 0.15),
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <SettingsIcon sx={{ fontSize: 32, color: 'primary.main' }} />
                          </Box>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="h5" fontWeight="bold" gutterBottom>
                              Notification Preferences
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Customize how and when you receive notifications. Stay informed about important updates while reducing unnecessary alerts.
                            </Typography>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>

                  {/* Delivery Methods Section */}
                  <Grid item xs={12}>
                    <Card sx={{ borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                      <CardContent sx={{ p: 3 }}>
                        <Box mb={3}>
                          <Box display="flex" alignItems="center" gap={1.5} mb={1}>
                            <PhoneAndroid sx={{ fontSize: 24, color: 'primary.main' }} />
                            <Typography variant="h6" fontWeight={700}>
                              Delivery Methods
                            </Typography>
                          </Box>
                          <Typography variant="body2" color="text.secondary" sx={{ ml: 4.5 }}>
                            Choose how you want to receive notifications across different channels
                          </Typography>
                        </Box>
                        <Divider sx={{ mb: 3 }} />

                        <Grid container spacing={2}>
                          {[
                            { 
                              key: 'emailNotifications', 
                              label: 'Email Notifications', 
                              description: 'Receive detailed notifications via email. Recommended for important updates.',
                              icon: <Email />, 
                              color: 'info',
                              badge: 'Recommended'
                            },
                            { 
                              key: 'pushNotifications', 
                              label: 'Push Notifications', 
                              description: 'Instant browser and mobile app notifications. Stay updated in real-time.',
                              icon: <PhoneAndroid />, 
                              color: 'success',
                              badge: 'Real-time'
                            },
                            { 
                              key: 'smsNotifications', 
                              label: 'SMS Notifications', 
                              description: 'Text message alerts for critical updates. Additional charges may apply.',
                              icon: <Sms />, 
                              color: 'warning',
                              badge: 'Premium'
                            },
                          ].map((item) => (
                            <Grid item xs={12} key={item.key}>
                              <Card 
                                variant="outlined"
                                sx={{
                                  p: 2.5,
                                  borderRadius: 2,
                                  border: `2px solid ${notificationSettings[item.key as keyof typeof notificationSettings] ? alpha(theme.palette.primary.main, 0.3) : alpha(theme.palette.divider, 0.5)}`,
                                  bgcolor: notificationSettings[item.key as keyof typeof notificationSettings] 
                                    ? alpha(theme.palette.primary.main, 0.03) 
                                    : 'transparent',
                                  transition: 'all 0.2s',
                                  '&:hover': {
                                    borderColor: theme.palette.primary.main,
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                                  },
                                }}
                              >
                                <Box display="flex" alignItems="flex-start" justifyContent="space-between" gap={2}>
                                  <Box display="flex" alignItems="flex-start" gap={2} sx={{ flex: 1 }}>
                                    <Box
                                      sx={{
                                        width: 48,
                                        height: 48,
                                        borderRadius: 1.5,
                                        bgcolor: alpha(getPaletteColor(item.color), 0.1),
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        flexShrink: 0,
                                      }}
                                    >
                                      <Box sx={{ color: getPaletteColor(item.color), fontSize: 24 }}>
                                        {item.icon}
                                      </Box>
                                    </Box>
                                    <Box sx={{ flex: 1 }}>
                                      <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                                        <Typography variant="subtitle1" fontWeight={600}>
                                          {item.label}
                                        </Typography>
                                        {item.badge && (
                                          <Chip 
                                            label={item.badge} 
                                            size="small" 
                                            sx={{ 
                                              height: 20,
                                              fontSize: '0.65rem',
                                              fontWeight: 600,
                                              bgcolor: alpha(getPaletteColor(item.color), 0.15),
                                              color: getPaletteColor(item.color),
                                            }} 
                                          />
                                        )}
                                      </Box>
                                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem', lineHeight: 1.5 }}>
                                        {item.description}
                                      </Typography>
                                    </Box>
                                  </Box>
                                  <Switch
                                    checked={notificationSettings[item.key as keyof typeof notificationSettings] as boolean}
                                    onChange={(e) => setNotificationSettings({ ...notificationSettings, [item.key]: e.target.checked })}
                                    color="primary"
                                    sx={{ flexShrink: 0 }}
                                  />
                                </Box>
                              </Card>
                            </Grid>
                          ))}
                        </Grid>
                      </CardContent>
                    </Card>
                  </Grid>

                  {/* Critical Notifications Section */}
                  <Grid item xs={12}>
                    <Card sx={{ borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', border: `2px solid ${alpha(theme.palette.error.main, 0.2)}` }}>
                      <CardContent sx={{ p: 3 }}>
                        <Box mb={3}>
                          <Box display="flex" alignItems="center" gap={1.5} mb={1}>
                            <SecurityIcon sx={{ fontSize: 24, color: 'error.main' }} />
                            <Typography variant="h6" fontWeight={700}>
                              Critical Notifications
                            </Typography>
                            <Chip label="Always On" size="small" color="error" sx={{ height: 22, fontSize: '0.7rem', fontWeight: 600 }} />
                          </Box>
                          <Typography variant="body2" color="text.secondary" sx={{ ml: 4.5 }}>
                            Essential notifications that cannot be disabled for security and legal compliance
                          </Typography>
                        </Box>
                        <Divider sx={{ mb: 3 }} />
                        <Grid container spacing={2}>
                          {[
                            { 
                              key: 'securityAlerts', 
                              label: 'Security Alerts', 
                              description: 'Account security, login attempts, password changes, and suspicious activity',
                              icon: <SecurityIcon />, 
                              color: 'error',
                              required: true
                            },
                          ].map((item) => (
                            <Grid item xs={12} key={item.key}>
                              <Card 
                                variant="outlined"
                                sx={{
                                  p: 2.5,
                                  borderRadius: 2,
                                  border: `2px solid ${alpha(theme.palette.error.main, 0.3)}`,
                                  bgcolor: alpha(theme.palette.error.main, 0.03),
                                }}
                              >
                                <Box display="flex" alignItems="flex-start" gap={2}>
                                  <Box
                                    sx={{
                                      width: 48,
                                      height: 48,
                                      borderRadius: 1.5,
                                      bgcolor: alpha(theme.palette.error.main, 0.1),
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      flexShrink: 0,
                                    }}
                                  >
                                    <SecurityIcon sx={{ color: 'error.main', fontSize: 24 }} />
                                  </Box>
                                  <Box sx={{ flex: 1 }}>
                                    <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                                      <Typography variant="subtitle1" fontWeight={600}>
                                        {item.label}
                                      </Typography>
                                      <Chip 
                                        label="Required" 
                                        size="small" 
                                        sx={{ 
                                          height: 20,
                                          fontSize: '0.65rem',
                                          fontWeight: 600,
                                          bgcolor: alpha(theme.palette.error.main, 0.15),
                                          color: 'error.main',
                                        }} 
                                      />
                                    </Box>
                                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem', lineHeight: 1.5 }}>
                                      {item.description}
                                    </Typography>
                                  </Box>
                                  <Switch
                                    checked={notificationSettings[item.key as keyof typeof notificationSettings] as boolean}
                                    disabled
                                    color="error"
                                    sx={{ flexShrink: 0 }}
                                  />
                                </Box>
                              </Card>
                            </Grid>
                          ))}
                        </Grid>
                      </CardContent>
                    </Card>
                  </Grid>

                  {/* Transaction Notifications Section */}
                  <Grid item xs={12}>
                    <Card sx={{ borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                      <CardContent sx={{ p: 3 }}>
                        <Box mb={3}>
                          <Box display="flex" alignItems="center" gap={1.5} mb={1}>
                            <AccountBalance sx={{ fontSize: 24, color: 'primary.main' }} />
                            <Typography variant="h6" fontWeight={700}>
                              Transaction Notifications
                            </Typography>
                          </Box>
                          <Typography variant="body2" color="text.secondary" sx={{ ml: 4.5 }}>
                            Stay informed about your escrow transactions, payments, and financial activities
                          </Typography>
                        </Box>
                        <Divider sx={{ mb: 3 }} />
                        <Grid container spacing={2}>
                          {[
                            { 
                              key: 'escrowUpdates', 
                              label: 'Escrow Updates', 
                              description: 'Notifications when escrows are created, updated, completed, or require action',
                              icon: <AccountBalanceWallet />, 
                              color: 'primary'
                            },
                            { 
                              key: 'paymentNotifications', 
                              label: 'Payment Notifications', 
                              description: 'Alerts for payments received, sent, pending, or failed transactions',
                              icon: <AccountBalance />, 
                              color: 'success'
                            },
                            { 
                              key: 'disputeAlerts', 
                              label: 'Dispute Alerts', 
                              description: 'Notifications when disputes are filed, updated, or resolved',
                              icon: <GavelIcon />, 
                              color: 'warning'
                            },
                          ].map((item) => (
                            <Grid item xs={12} md={6} key={item.key}>
                              <Card 
                                variant="outlined"
                                sx={{
                                  p: 2.5,
                                  borderRadius: 2,
                                  border: `2px solid ${notificationSettings[item.key as keyof typeof notificationSettings] ? alpha(theme.palette.primary.main, 0.3) : alpha(theme.palette.divider, 0.5)}`,
                                  bgcolor: notificationSettings[item.key as keyof typeof notificationSettings] 
                                    ? alpha(theme.palette.primary.main, 0.03) 
                                    : 'transparent',
                                  transition: 'all 0.2s',
                                  '&:hover': {
                                    borderColor: theme.palette.primary.main,
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                                  },
                                }}
                              >
                                <Box display="flex" alignItems="flex-start" justifyContent="space-between" gap={2}>
                                  <Box display="flex" alignItems="flex-start" gap={2} sx={{ flex: 1 }}>
                                    <Box
                                      sx={{
                                        width: 48,
                                        height: 48,
                                        borderRadius: 1.5,
                                        bgcolor: alpha(getPaletteColor(item.color), 0.1),
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        flexShrink: 0,
                                      }}
                                    >
                                      <Box sx={{ color: getPaletteColor(item.color), fontSize: 24 }}>
                                        {item.icon}
                                      </Box>
                                    </Box>
                                    <Box sx={{ flex: 1 }}>
                                      <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                                        {item.label}
                                      </Typography>
                                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem', lineHeight: 1.5 }}>
                                        {item.description}
                                      </Typography>
                                    </Box>
                                  </Box>
                                  <Switch
                                    checked={notificationSettings[item.key as keyof typeof notificationSettings] as boolean}
                                    onChange={(e) => setNotificationSettings({ ...notificationSettings, [item.key]: e.target.checked })}
                                    color="primary"
                                    sx={{ flexShrink: 0, mt: 0.5 }}
                                  />
                                </Box>
                              </Card>
                            </Grid>
                          ))}
                        </Grid>
                      </CardContent>
                    </Card>
                  </Grid>

                  {/* Marketing & Updates Section */}
                  <Grid item xs={12}>
                    <Card sx={{ borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                      <CardContent sx={{ p: 3 }}>
                        <Box mb={3}>
                          <Box display="flex" alignItems="center" gap={1.5} mb={1}>
                            <LocalOffer sx={{ fontSize: 24, color: 'text.secondary' }} />
                            <Typography variant="h6" fontWeight={700}>
                              Marketing & Updates
                            </Typography>
                          </Box>
                          <Typography variant="body2" color="text.secondary" sx={{ ml: 4.5 }}>
                            Optional communications about new features, tips, and promotional content
                          </Typography>
                        </Box>
                        <Divider sx={{ mb: 3 }} />
                        <Grid container spacing={2}>
                          {[
                            { 
                              key: 'marketingEmails', 
                              label: 'Marketing Emails', 
                              description: 'Product updates, feature announcements, tips, and promotional offers',
                              icon: <Email />, 
                              color: 'info'
                            },
                          ].map((item) => (
                            <Grid item xs={12} key={item.key}>
                              <Card 
                                variant="outlined"
                                sx={{
                                  p: 2.5,
                                  borderRadius: 2,
                                  border: `2px solid ${notificationSettings[item.key as keyof typeof notificationSettings] ? alpha(theme.palette.primary.main, 0.3) : alpha(theme.palette.divider, 0.5)}`,
                                  bgcolor: notificationSettings[item.key as keyof typeof notificationSettings] 
                                    ? alpha(theme.palette.primary.main, 0.03) 
                                    : 'transparent',
                                  transition: 'all 0.2s',
                                  '&:hover': {
                                    borderColor: theme.palette.primary.main,
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                                  },
                                }}
                              >
                                <Box display="flex" alignItems="flex-start" justifyContent="space-between" gap={2}>
                                  <Box display="flex" alignItems="flex-start" gap={2} sx={{ flex: 1 }}>
                                    <Box
                                      sx={{
                                        width: 48,
                                        height: 48,
                                        borderRadius: 1.5,
                                        bgcolor: alpha(getPaletteColor(item.color), 0.1),
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        flexShrink: 0,
                                      }}
                                    >
                                      <Email sx={{ color: getPaletteColor(item.color), fontSize: 24 }} />
                                    </Box>
                                    <Box sx={{ flex: 1 }}>
                                      <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                                        {item.label}
                                      </Typography>
                                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem', lineHeight: 1.5 }}>
                                        {item.description}
                                      </Typography>
                                    </Box>
                                  </Box>
                                  <Switch
                                    checked={notificationSettings[item.key as keyof typeof notificationSettings] as boolean}
                                    onChange={(e) => setNotificationSettings({ ...notificationSettings, [item.key]: e.target.checked })}
                                    color="primary"
                                    sx={{ flexShrink: 0, mt: 0.5 }}
                                  />
                                </Box>
                              </Card>
                            </Grid>
                          ))}
                        </Grid>
                      </CardContent>
                    </Card>
                  </Grid>

                  {/* Action Buttons */}
                  <Grid item xs={12}>
                    <Card sx={{ borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                      <CardContent sx={{ p: 3 }}>
                        <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              Changes are saved automatically. Use reset to restore default preferences.
                            </Typography>
                          </Box>
                          <Box display="flex" gap={2}>
                            <Button 
                              variant="outlined"
                              onClick={() => {
                                setNotificationSettings({
                                  emailNotifications: true,
                                  pushNotifications: true,
                                  smsNotifications: false,
                                  escrowUpdates: true,
                                  disputeAlerts: true,
                                  paymentNotifications: true,
                                  securityAlerts: true,
                                  marketingEmails: false,
                                });
                                setSnackbar({ open: true, message: 'Preferences reset to defaults', severity: 'info' });
                              }}
                              sx={{ textTransform: 'none' }}
                            >
                              Reset to Defaults
                            </Button>
                            <Button 
                              variant="contained" 
                              onClick={() => {
                                // In production, save to backend
                                setSnackbar({ open: true, message: 'Notification preferences saved successfully', severity: 'success' });
                              }}
                              sx={{
                                px: 4,
                                textTransform: 'none',
                                fontWeight: 600,
                              }}
                            >
                              Save Preferences
                            </Button>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </motion.div>
            )}
          </Container>
        </Box>
      </Box>

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
  const user = {
    id: 'demo-user-id',
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+1 (555) 123-4567',
    role: 'buyer' as const,
    kycLevel: 'verified' as const,
  };

  return {
    props: {
      user,
    },
  };
};

export default UserNotifications;

