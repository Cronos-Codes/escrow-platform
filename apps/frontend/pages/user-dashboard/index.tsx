import React, { useState, useEffect } from 'react';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Container,
  Grid,
  Card,
  CardContent,
  Avatar,
  Chip,
  Button,
  Menu,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  CircularProgress,
  Alert,
  AlertTitle,
  Snackbar,
  Tooltip,
  Badge,
  alpha,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  AccountBalance,
  Security,
  Timeline,
  Gavel,
  Settings as SettingsIcon,
  Notifications,
  Refresh,
  Visibility,
  VisibilityOff,
  Download,
  ChevronLeft,
  Receipt,
  TrendingUp,
  Help,
  ExitToApp,
  Add as AddIcon,
  ArrowUpward,
  ArrowDownward,
  MoreVert,
  CheckCircle,
  Warning,
  Info,
  Lightbulb,
  Person,
} from '@mui/icons-material';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { MetricCard, TransactionList, PerformanceChart, QuickActions } from '../../components/dashboard';
import useDashboard, { Timeframe } from '../../hooks/useDashboard';
import { DRAWER_WIDTH, KPI_COLORS } from '../../config/dashboard-constants';

const drawerWidth = DRAWER_WIDTH;

interface UserDashboardProps {
  user: {
    id: string;
    name: string;
    email: string;
    role: 'buyer' | 'seller';
    kycLevel: 'basic' | 'verified' | 'premium';
  };
}

const UserDashboard: React.FC<UserDashboardProps> = ({ user }) => {
  const theme = useTheme();
  const router = useRouter();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.between('md', 'lg'));
  const { data, loading, error, refetch, updateTimeframe, timeframe } = useDashboard(user.id);

  const [mobileOpen, setMobileOpen] = useState(false);
  const [showBalance, setShowBalance] = useState(true);
  const [expandedKPIs, setExpandedKPIs] = useState<{ [key: string]: boolean }>({});
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [userMenuAnchor, setUserMenuAnchor] = useState<null | HTMLElement>(null);
  const [notificationAnchor, setNotificationAnchor] = useState<null | HTMLElement>(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'info'
  });

  // Time-based greeting - computed on client side only to avoid hydration mismatch
  const [greeting, setGreeting] = useState('Welcome');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) {
      setGreeting('Good Morning');
    } else if (hour < 18) {
      setGreeting('Good Afternoon');
    } else {
      setGreeting('Good Evening');
    }
  }, []);

  // Mock notifications data
  const notifications = [
    {
      id: '1',
      type: 'success' as const,
      title: 'Escrow Completed',
      message: 'Escrow #ESC-2024-002 has been successfully completed',
      timestamp: new Date(Date.now() - 7200000),
      read: false,
      icon: <CheckCircle sx={{ color: 'success.main' }} />,
    },
    {
      id: '2',
      type: 'info' as const,
      title: 'Payment Received',
      message: 'You received $5,000.00 in your wallet',
      timestamp: new Date(Date.now() - 3600000),
      read: false,
      icon: <TrendingUp sx={{ color: '#D4AF37' }} />,
    },
    {
      id: '3',
      type: 'warning' as const,
      title: 'Escrow Pending',
      message: 'Escrow #ESC-2024-005 is awaiting your action',
      timestamp: new Date(Date.now() - 1800000),
      read: true,
      icon: <Warning sx={{ color: 'warning.main' }} />,
    },
  ];

  const unreadCount = notifications.filter(n => !n.read).length;

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/user-dashboard', active: true },
    { text: 'My Escrows', icon: <Security />, path: '/user-dashboard/escrows' },
    { text: 'Transactions', icon: <Timeline />, path: '/user-dashboard/transactions' },
    { text: 'Wallet', icon: <AccountBalance />, path: '/user-dashboard/wallet' },
    { text: 'Disputes', icon: <Gavel />, path: '/user-dashboard/disputes' },
    { text: 'Reports', icon: <Receipt />, path: '/user-dashboard/reports' },
    { text: 'Profile', icon: <Person />, path: '/user-dashboard/profile' },
    { text: 'Notifications', icon: <Notifications />, path: '/user-dashboard/notifications' },
  ];

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async (format: 'pdf' | 'csv') => {
    if (isExporting) return;

    try {
      setIsExporting(true);
      setSnackbar({ open: true, message: `Exporting dashboard as ${format.toUpperCase()}...`, severity: 'info' });
      // Implement export logic here
      await new Promise(resolve => setTimeout(resolve, 1500));
      setSnackbar({ open: true, message: `Dashboard exported successfully!`, severity: 'success' });
    } catch (err) {
      setSnackbar({ open: true, message: 'Export failed', severity: 'error' });
    } finally {
      setIsExporting(false);
      handleMenuClose();
    }
  };

  const handleRefresh = async () => {
    try {
      await refetch();
      setSnackbar({ open: true, message: 'Dashboard refreshed', severity: 'success' });
    } catch (err) {
      setSnackbar({ open: true, message: 'Refresh failed', severity: 'error' });
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  // Loading state
  if (loading && !data) {
    return (
      <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        bgcolor: '#fafafa',
        gap: 2
      }}>
        <CircularProgress size={60} sx={{ color: '#D4AF37' }} />
        <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500 }}>
          Loading your dashboard...
        </Typography>
      </Box>
    );
  }

  // Error state
  if (error) {
    return (
      <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        bgcolor: '#fafafa',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <Container maxWidth="sm" sx={{ py: 8 }}>
          <Alert
            severity="error"
            sx={{
              borderRadius: 3,
              boxShadow: 2,
              '& .MuiAlert-icon': { fontSize: 32 }
            }}
          >
            <AlertTitle sx={{ fontWeight: 700, fontSize: '1.1rem' }}>
              Error Loading Dashboard
            </AlertTitle>
            <Typography variant="body2" sx={{ mt: 1 }}>
              {error}
            </Typography>
          </Alert>
          <Button
            variant="contained"
            onClick={handleRefresh}
            sx={{
              mt: 3,
              px: 4,
              py: 1.5,
              borderRadius: 2,
              bgcolor: '#D4AF37',
              '&:hover': { bgcolor: '#B8941F' },
              fontWeight: 600,
              textTransform: 'none'
            }}
            startIcon={<Refresh />}
          >
            Retry Loading
          </Button>
        </Container>
      </Box>
    );
  }

  // Prepare KPI data
  const kpiData = data ? [
    {
      id: 'wallet',
      title: 'Wallet Balance',
      value: showBalance ? formatCurrency(data.wallet.totalBalance) : '••••••',
      change: data.wallet.change24h,
      trend: data.wallet.trend as 'up' | 'down' | 'stable',
      icon: <AccountBalance />,
      color: KPI_COLORS.wallet,
      description: 'Total portfolio value',
      detail: `Crypto: ${formatCurrency(data.wallet.cryptoBalance)} | Fiat: ${formatCurrency(data.wallet.fiatBalance)} | Gold: ${formatCurrency(data.wallet.goldValue)}`,
    },
    {
      id: 'escrows',
      title: 'Active Escrows',
      value: data.escrows.active.toString(),
      change: `${data.escrows.pending} pending`,
      trend: 'up' as const,
      icon: <Security />,
      color: KPI_COLORS.escrows,
      description: 'Active escrow transactions',
      detail: `Total Value: ${formatCurrency(data.escrows.totalValue)} | Completed: ${data.escrows.completed}`,
    },
    {
      id: 'transactions',
      title: 'Total Transactions',
      value: data.transactions.total.toString(),
      change: `${data.transactions.pending} pending`,
      trend: 'up' as const,
      icon: <Timeline />,
      color: KPI_COLORS.transactions,
      description: 'All-time transaction count',
      detail: `Completed: ${data.transactions.completed} | Failed: ${data.transactions.failed}`,
    },
    {
      id: 'disputes',
      title: 'Disputes',
      value: data.disputes.open.toString(),
      change: `${data.disputes.resolved} resolved`,
      trend: 'down' as const,
      icon: <Gavel />,
      color: KPI_COLORS.disputes,
      description: 'Open dispute cases count',
      detail: `Resolved: ${data.disputes.resolved} | Escalated: ${data.disputes.escalated}`,
    }
  ] : [];

  // Sidebar drawer content
  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: 'white' }}>
      <Box sx={{
        p: 3,
        background: 'linear-gradient(135deg, #D4AF37 0%, #B8941F 100%)',
        color: '#1C2A39',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%)',
          pointerEvents: 'none'
        }
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2, position: 'relative', zIndex: 1 }}>
          <Avatar sx={{
            width: 56,
            height: 56,
            bgcolor: '#1C2A39',
            color: '#D4AF37',
            fontWeight: 'bold',
            fontSize: '1.5rem',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
          }}>
            {user.name.charAt(0)}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="subtitle1" fontWeight="bold" noWrap sx={{ color: '#1C2A39', mb: 0.5 }}>
              {user.name}
            </Typography>
            <Typography variant="caption" sx={{ color: 'rgba(28,42,57,0.7)', display: 'block', noWrap: true }}>
              {user.email}
            </Typography>
          </Box>
        </Box>
        <Chip
          label={user.kycLevel.toUpperCase()}
          size="small"
          sx={{
            bgcolor: 'rgba(28,42,57,0.15)',
            color: '#1C2A39',
            fontWeight: 700,
            fontSize: '0.7rem',
            height: 24,
            border: '1px solid rgba(28,42,57,0.2)',
            position: 'relative',
            zIndex: 1
          }}
        />
      </Box>

      <Divider />

      <List sx={{ px: 2, py: 2, flex: 1, overflowY: 'auto' }}>
        {menuItems.map((item, index) => (
          <motion.div
            key={item.text}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
          >
            <ListItem disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                selected={item.active}
                onClick={() => {
                  router.push(item.path);
                  if (isMobile) setMobileOpen(false);
                }}
                sx={{
                  borderRadius: 2,
                  py: 1.5,
                  px: 2,
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&.Mui-selected': {
                    bgcolor: alpha('#D4AF37', 0.12),
                    borderLeft: '3px solid',
                    borderColor: '#D4AF37',
                    '&:hover': {
                      bgcolor: alpha('#D4AF37', 0.18),
                    },
                    '& .MuiListItemIcon-root': {
                      color: '#D4AF37',
                    },
                  },
                  '&:hover': {
                    bgcolor: alpha(theme.palette.primary.main, 0.06),
                    transform: 'translateX(4px)',
                  },
                }}
              >
                <ListItemIcon sx={{
                  minWidth: 40,
                  color: item.active ? '#D4AF37' : 'text.secondary',
                  transition: 'color 0.2s'
                }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{
                    fontWeight: item.active ? 700 : 500,
                    color: item.active ? '#D4AF37' : 'text.primary',
                    fontSize: '0.95rem',
                    letterSpacing: item.active ? '0.01em' : '0',
                  }}
                />
              </ListItemButton>
            </ListItem>
          </motion.div>
        ))}
      </List>

      <Divider sx={{ my: 2 }} />

      <List sx={{ px: 2, pb: 2 }}>
        <ListItem disablePadding sx={{ mb: 0.5 }}>
          <ListItemButton
            onClick={() => {
              router.push('/user-dashboard/settings');
              if (isMobile) setMobileOpen(false);
            }}
            sx={{
              borderRadius: 2,
              py: 1.5,
              px: 2,
              transition: 'all 0.2s',
              '&:hover': {
                bgcolor: alpha(theme.palette.primary.main, 0.06),
                transform: 'translateX(4px)',
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 40, color: 'text.secondary' }}>
              <SettingsIcon />
            </ListItemIcon>
            <ListItemText
              primary="Settings"
              primaryTypographyProps={{ fontWeight: 500, fontSize: '0.95rem' }}
            />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton
            onClick={() => {
              router.push('/user-dashboard/help');
              if (isMobile) setMobileOpen(false);
            }}
            sx={{
              borderRadius: 2,
              py: 1.5,
              px: 2,
              transition: 'all 0.2s',
              '&:hover': {
                bgcolor: alpha(theme.palette.primary.main, 0.06),
                transform: 'translateX(4px)',
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 40, color: 'text.secondary' }}>
              <Help />
            </ListItemIcon>
            <ListItemText
              primary="Help & Support"
              primaryTypographyProps={{ fontWeight: 500, fontSize: '0.95rem' }}
            />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );

  return (
    <>
      <Head>
        <title>Dashboard - Gold Escrow Platform</title>
        <meta name="description" content="Professional escrow management dashboard with real-time analytics and insights" />
      </Head>

      <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#fafafa' }}>
        {/* App Bar */}
        <AppBar
          position="fixed"
          elevation={0}
          sx={{
            width: { md: `calc(100% - ${drawerWidth}px)` },
            ml: { md: `${drawerWidth}px` },
            bgcolor: 'white',
            color: 'text.primary',
            borderBottom: '2px solid',
            borderColor: alpha('#D4AF37', 0.15),
            backdropFilter: 'blur(20px)',
            background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.98) 0%, rgba(255, 255, 255, 0.95) 100%)',
            boxShadow: '0 2px 8px rgba(212, 175, 55, 0.08)',
            zIndex: (theme) => theme.zIndex.drawer + 1,
            '&::before': {
              content: '""',
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: '2px',
              background: 'linear-gradient(90deg, transparent 0%, #D4AF37 50%, transparent 100%)',
              opacity: 0.3,
            },
          }}
        >
          <Toolbar sx={{
            minHeight: { xs: 56, sm: 64, md: 72 },
            px: { xs: 1.5, sm: 2, md: 3 },
            py: { xs: 1, sm: 0 },
          }}>
            <IconButton
              color="inherit"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{
                mr: { xs: 1, sm: 2 },
                display: { md: 'none' },
                color: '#1C2A39',
                padding: { xs: 1, sm: 1.5 },
                minWidth: 44,
                minHeight: 44,
                '&:hover': {
                  bgcolor: alpha('#D4AF37', 0.12),
                  color: '#D4AF37',
                }
              }}
            >
              <MenuIcon sx={{ fontSize: { xs: 20, sm: 24 } }} />
            </IconButton>

            <Box sx={{ flexGrow: 1, minWidth: 0 }}>
              <Typography
                variant="h5"
                noWrap
                component="div"
                sx={{
                  fontWeight: 800,
                  background: 'linear-gradient(135deg, #1C2A39 0%, #D4AF37 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  fontSize: { xs: '1.1rem', sm: '1.25rem', md: '1.5rem' },
                  letterSpacing: '-0.5px',
                  mb: { xs: 0, sm: 0.5 }
                }}
              >
                Dashboard
              </Typography>
              <Box sx={{ display: { xs: 'none', sm: 'flex' }, alignItems: 'center', gap: 1 }}>
                <Typography
                  variant="caption"
                  sx={{
                    color: 'text.secondary',
                    fontSize: { sm: '0.8rem', md: '0.85rem' },
                    fontWeight: 500,
                  }}
                >
                  Welcome back,
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: '#D4AF37',
                    fontSize: { sm: '0.8rem', md: '0.85rem' },
                    fontWeight: 700,
                  }}
                >
                  {user.name.split(' ')[0]}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.25, sm: 0.5, md: 1 } }}>
              <Tooltip title="Refresh Dashboard" arrow placement="bottom">
                <IconButton
                  onClick={handleRefresh}
                  disabled={loading}
                  size="small"
                  aria-label="Refresh dashboard"
                  sx={{
                    color: '#1C2A39',
                    transition: 'all 0.3s',
                    padding: { xs: 1, sm: 1.5 },
                    minWidth: { xs: 44, sm: 40 },
                    minHeight: { xs: 44, sm: 40 },
                    '&:hover': {
                      bgcolor: alpha('#D4AF37', 0.12),
                      color: '#D4AF37',
                      transform: 'rotate(180deg)'
                    },
                    '&:disabled': { opacity: 0.5 }
                  }}
                >
                  <Refresh sx={{ fontSize: { xs: 18, sm: 20 } }} />
                </IconButton>
              </Tooltip>

              <Tooltip title={showBalance ? 'Hide Balance' : 'Show Balance'} arrow placement="bottom">
                <IconButton
                  onClick={() => setShowBalance(!showBalance)}
                  size="small"
                  aria-label={showBalance ? 'Hide balance' : 'Show balance'}
                  sx={{
                    color: '#1C2A39',
                    transition: 'all 0.2s',
                    padding: { xs: 1, sm: 1.5 },
                    minWidth: { xs: 44, sm: 40 },
                    minHeight: { xs: 44, sm: 40 },
                    '&:hover': {
                      bgcolor: alpha('#D4AF37', 0.12),
                      color: '#D4AF37',
                    }
                  }}
                >
                  {showBalance ? <VisibilityOff sx={{ fontSize: { xs: 18, sm: 20 } }} /> : <Visibility sx={{ fontSize: { xs: 18, sm: 20 } }} />}
                </IconButton>
              </Tooltip>

              <Tooltip title="Notifications" arrow placement="bottom">
                <IconButton
                  onClick={(e: React.MouseEvent<HTMLElement>) => setNotificationAnchor(e.currentTarget)}
                  size="small"
                  aria-label="View notifications"
                  sx={{
                    color: '#1C2A39',
                    transition: 'all 0.2s',
                    position: 'relative',
                    padding: { xs: 1, sm: 1.5 },
                    minWidth: { xs: 44, sm: 40 },
                    minHeight: { xs: 44, sm: 40 },
                    '&:hover': {
                      bgcolor: alpha('#D4AF37', 0.12),
                      color: '#D4AF37',
                    }
                  }}
                >
                  <Badge
                    badgeContent={unreadCount}
                    sx={{
                      '& .MuiBadge-badge': {
                        fontSize: { xs: '0.65rem', sm: '0.7rem' },
                        height: { xs: 16, sm: 18 },
                        minWidth: { xs: 16, sm: 18 },
                        bgcolor: '#D4AF37',
                        color: '#1C2A39',
                        fontWeight: 700,
                      }
                    }}
                  >
                    <Notifications sx={{ fontSize: { xs: 18, sm: 20 } }} />
                  </Badge>
                </IconButton>
              </Tooltip>

              {/* Notifications Menu */}
              <Menu
                anchorEl={notificationAnchor}
                open={Boolean(notificationAnchor)}
                onClose={() => setNotificationAnchor(null)}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                PaperProps={{
                  elevation: 12,
                  sx: {
                    mt: 1.5,
                    width: { xs: 'calc(100vw - 32px)', sm: 380 },
                    maxWidth: { xs: 'calc(100vw - 32px)', sm: 380 },
                    maxHeight: { xs: 'calc(100vh - 100px)', sm: '70vh' },
                    borderRadius: 3,
                    boxShadow: '0 12px 32px rgba(0,0,0,0.15)',
                    border: `1px solid ${alpha('#D4AF37', 0.2)}`,
                    overflow: 'hidden',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: '3px',
                      background: 'linear-gradient(90deg, #D4AF37 0%, #B8941F 100%)',
                    },
                  },
                }}
              >
                <Box sx={{ p: 2, borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`, bgcolor: alpha('#D4AF37', 0.04) }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography variant="h6" fontWeight="700" sx={{ color: '#1C2A39', fontSize: '1rem' }}>
                      Notifications
                    </Typography>
                    {unreadCount > 0 && (
                      <Chip
                        label={unreadCount}
                        size="small"
                        sx={{
                          bgcolor: '#D4AF37',
                          color: '#1C2A39',
                          fontWeight: 700,
                          height: 22,
                        }}
                      />
                    )}
                  </Box>
                </Box>
                <Box sx={{ maxHeight: '50vh', overflowY: 'auto' }}>
                  {notifications.length === 0 ? (
                    <Box sx={{ p: 3, textAlign: 'center' }}>
                      <Notifications sx={{ fontSize: 48, color: 'text.disabled', mb: 1, opacity: 0.5 }} />
                      <Typography variant="body2" color="text.secondary">
                        No notifications
                      </Typography>
                    </Box>
                  ) : (
                    notifications.map((notification) => (
                      <MenuItem
                        key={notification.id}
                        onClick={() => {
                          setNotificationAnchor(null);
                          // Handle notification click - navigate to relevant page
                        }}
                        sx={{
                          py: 1.5,
                          px: 2,
                          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.05)}`,
                          bgcolor: notification.read ? 'transparent' : alpha('#D4AF37', 0.04),
                          transition: 'all 0.2s',
                          '&:hover': {
                            bgcolor: alpha('#D4AF37', 0.1),
                          }
                        }}
                      >
                        <Box sx={{ display: 'flex', gap: 1.5, width: '100%' }}>
                          <Box sx={{
                            width: 40,
                            height: 40,
                            borderRadius: '50%',
                            bgcolor: alpha('#D4AF37', 0.1),
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                          }}>
                            {notification.icon}
                          </Box>
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography variant="subtitle2" fontWeight="700" sx={{ fontSize: '0.875rem', mb: 0.5 }}>
                              {notification.title}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem', display: 'block', mb: 0.5 }}>
                              {notification.message}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                              {notification.timestamp.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                            </Typography>
                          </Box>
                          {!notification.read && (
                            <Box sx={{
                              width: 8,
                              height: 8,
                              borderRadius: '50%',
                              bgcolor: '#D4AF37',
                              flexShrink: 0,
                              mt: 1,
                            }} />
                          )}
                        </Box>
                      </MenuItem>
                    ))
                  )}
                </Box>
                <Box sx={{ p: 1.5, borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
                  <Button
                    fullWidth
                    size="small"
                    onClick={() => {
                      router.push('/user-dashboard/notifications');
                      setNotificationAnchor(null);
                    }}
                    sx={{
                      textTransform: 'none',
                      fontWeight: 600,
                      color: '#D4AF37',
                      '&:hover': {
                        bgcolor: alpha('#D4AF37', 0.08),
                      }
                    }}
                  >
                    View All Notifications
                  </Button>
                </Box>
              </Menu>

              <Box sx={{ ml: { xs: 0.25, sm: 0.5, md: 1 }, position: 'relative' }}>
                <IconButton
                  onClick={(e: React.MouseEvent<HTMLElement>) => setUserMenuAnchor(e.currentTarget)}
                  size="small"
                  sx={{
                    transition: 'all 0.2s',
                    padding: { xs: 0.5, sm: 1 },
                    minWidth: { xs: 44, sm: 40 },
                    minHeight: { xs: 44, sm: 40 },
                    '&:hover': { transform: 'scale(1.05)' }
                  }}
                >
                  <Avatar
                    sx={{
                      width: { xs: 32, sm: 36, md: 40 },
                      height: { xs: 32, sm: 36, md: 40 },
                      background: 'linear-gradient(135deg, #D4AF37 0%, #B8941F 100%)',
                      color: '#1C2A39',
                      fontWeight: 700,
                      fontSize: { xs: '0.875rem', sm: '0.95rem', md: '1.1rem' },
                      boxShadow: '0 2px 8px rgba(212, 175, 55, 0.3)',
                      border: '2px solid rgba(255, 255, 255, 0.3)',
                    }}
                  >
                    {user.name.charAt(0)}
                  </Avatar>
                </IconButton>
              </Box>

              <Menu
                anchorEl={userMenuAnchor}
                open={Boolean(userMenuAnchor)}
                onClose={() => setUserMenuAnchor(null)}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                PaperProps={{
                  elevation: 12,
                  sx: {
                    mt: 1.5,
                    minWidth: { xs: 'calc(100vw - 32px)', sm: 240 },
                    maxWidth: { xs: 'calc(100vw - 32px)', sm: 280 },
                    borderRadius: 3,
                    boxShadow: '0 12px 32px rgba(0,0,0,0.15)',
                    border: `1px solid ${alpha('#D4AF37', 0.2)}`,
                    overflow: 'hidden',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: '3px',
                      background: 'linear-gradient(90deg, #D4AF37 0%, #B8941F 100%)',
                    },
                  },
                }}
              >
                <Box sx={{ p: { xs: 1.5, sm: 2 }, borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`, bgcolor: alpha('#D4AF37', 0.04) }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1.25, sm: 1.5 } }}>
                    <Avatar
                      sx={{
                        width: { xs: 36, sm: 40 },
                        height: { xs: 36, sm: 40 },
                        background: 'linear-gradient(135deg, #D4AF37 0%, #B8941F 100%)',
                        color: '#1C2A39',
                        fontWeight: 700,
                        fontSize: { xs: '1rem', sm: '1.1rem' },
                      }}
                    >
                      {user.name.charAt(0)}
                    </Avatar>
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <Typography variant="subtitle2" fontWeight="700" sx={{ color: '#1C2A39', fontSize: { xs: '0.875rem', sm: '0.9rem' } }}>
                        {user.name}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: { xs: '0.7rem', sm: '0.75rem' }, wordBreak: 'break-word' }}>
                        {user.email}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
                <MenuItem
                  onClick={() => {
                    router.push('/user-dashboard/profile');
                    setUserMenuAnchor(null);
                  }}
                  sx={{
                    py: { xs: 1.75, sm: 1.5 },
                    px: { xs: 2, sm: 2 },
                    minHeight: { xs: 48, sm: 40 },
                    fontSize: { xs: '0.875rem', sm: '0.9rem' },
                    transition: 'all 0.2s',
                    '&:hover': {
                      bgcolor: alpha('#D4AF37', 0.1),
                      color: '#D4AF37',
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1.25, sm: 1.5 }, width: '100%' }}>
                    <Person sx={{ fontSize: { xs: 18, sm: 20 }, color: '#D4AF37' }} />
                    <Typography fontWeight={500}>My Profile</Typography>
                  </Box>
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    router.push('/user-dashboard/wallet');
                    setUserMenuAnchor(null);
                  }}
                  sx={{
                    py: { xs: 1.75, sm: 1.5 },
                    px: { xs: 2, sm: 2 },
                    minHeight: { xs: 48, sm: 40 },
                    fontSize: { xs: '0.875rem', sm: '0.9rem' },
                    transition: 'all 0.2s',
                    '&:hover': {
                      bgcolor: alpha('#D4AF37', 0.1),
                      color: '#D4AF37',
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1.25, sm: 1.5 }, width: '100%' }}>
                    <AccountBalance sx={{ fontSize: { xs: 18, sm: 20 }, color: '#D4AF37' }} />
                    <Typography fontWeight={500}>Wallet</Typography>
                  </Box>
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    router.push('/user-dashboard/escrows');
                    setUserMenuAnchor(null);
                  }}
                  sx={{
                    py: { xs: 1.75, sm: 1.5 },
                    px: { xs: 2, sm: 2 },
                    minHeight: { xs: 48, sm: 40 },
                    fontSize: { xs: '0.875rem', sm: '0.9rem' },
                    transition: 'all 0.2s',
                    '&:hover': {
                      bgcolor: alpha('#D4AF37', 0.1),
                      color: '#D4AF37',
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1.25, sm: 1.5 }, width: '100%' }}>
                    <Security sx={{ fontSize: { xs: 18, sm: 20 }, color: '#D4AF37' }} />
                    <Typography fontWeight={500}>My Escrows</Typography>
                  </Box>
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    router.push('/user-dashboard/transactions');
                    setUserMenuAnchor(null);
                  }}
                  sx={{
                    py: { xs: 1.75, sm: 1.5 },
                    px: { xs: 2, sm: 2 },
                    minHeight: { xs: 48, sm: 40 },
                    fontSize: { xs: '0.875rem', sm: '0.9rem' },
                    transition: 'all 0.2s',
                    '&:hover': {
                      bgcolor: alpha('#D4AF37', 0.1),
                      color: '#D4AF37',
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1.25, sm: 1.5 }, width: '100%' }}>
                    <Timeline sx={{ fontSize: { xs: 18, sm: 20 }, color: '#D4AF37' }} />
                    <Typography fontWeight={500}>Transactions</Typography>
                  </Box>
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    router.push('/user-dashboard/disputes');
                    setUserMenuAnchor(null);
                  }}
                  sx={{
                    py: { xs: 1.75, sm: 1.5 },
                    px: { xs: 2, sm: 2 },
                    minHeight: { xs: 48, sm: 40 },
                    fontSize: { xs: '0.875rem', sm: '0.9rem' },
                    transition: 'all 0.2s',
                    '&:hover': {
                      bgcolor: alpha('#D4AF37', 0.1),
                      color: '#D4AF37',
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1.25, sm: 1.5 }, width: '100%' }}>
                    <Gavel sx={{ fontSize: { xs: 18, sm: 20 }, color: '#D4AF37' }} />
                    <Typography fontWeight={500}>Disputes</Typography>
                  </Box>
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    router.push('/user-dashboard/reports');
                    setUserMenuAnchor(null);
                  }}
                  sx={{
                    py: { xs: 1.75, sm: 1.5 },
                    px: { xs: 2, sm: 2 },
                    minHeight: { xs: 48, sm: 40 },
                    fontSize: { xs: '0.875rem', sm: '0.9rem' },
                    transition: 'all 0.2s',
                    '&:hover': {
                      bgcolor: alpha('#D4AF37', 0.1),
                      color: '#D4AF37',
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1.25, sm: 1.5 }, width: '100%' }}>
                    <Receipt sx={{ fontSize: { xs: 18, sm: 20 }, color: '#D4AF37' }} />
                    <Typography fontWeight={500}>Reports</Typography>
                  </Box>
                </MenuItem>
                <Divider sx={{ my: { xs: 0.75, sm: 0.5 }, borderColor: alpha(theme.palette.divider, 0.1) }} />
                <MenuItem
                  onClick={() => {
                    router.push('/user-dashboard/settings');
                    setUserMenuAnchor(null);
                  }}
                  sx={{
                    py: { xs: 1.75, sm: 1.5 },
                    px: { xs: 2, sm: 2 },
                    minHeight: { xs: 48, sm: 40 },
                    fontSize: { xs: '0.875rem', sm: '0.9rem' },
                    transition: 'all 0.2s',
                    '&:hover': {
                      bgcolor: alpha('#D4AF37', 0.1),
                      color: '#D4AF37',
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1.25, sm: 1.5 }, width: '100%' }}>
                    <SettingsIcon sx={{ fontSize: { xs: 18, sm: 20 }, color: '#D4AF37' }} />
                    <Typography fontWeight={500}>Settings</Typography>
                  </Box>
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    router.push('/user-dashboard/help');
                    setUserMenuAnchor(null);
                  }}
                  sx={{
                    py: { xs: 1.75, sm: 1.5 },
                    px: { xs: 2, sm: 2 },
                    minHeight: { xs: 48, sm: 40 },
                    fontSize: { xs: '0.875rem', sm: '0.9rem' },
                    transition: 'all 0.2s',
                    '&:hover': {
                      bgcolor: alpha('#D4AF37', 0.1),
                      color: '#D4AF37',
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1.25, sm: 1.5 }, width: '100%' }}>
                    <Help sx={{ fontSize: { xs: 18, sm: 20 }, color: '#D4AF37' }} />
                    <Typography fontWeight={500}>Help & Support</Typography>
                  </Box>
                </MenuItem>
                <Divider sx={{ my: { xs: 0.75, sm: 0.5 }, borderColor: alpha(theme.palette.divider, 0.1) }} />
                <MenuItem
                  onClick={() => {
                    router.push('/logout');
                    setUserMenuAnchor(null);
                  }}
                  sx={{
                    py: { xs: 1.75, sm: 1.5 },
                    px: { xs: 2, sm: 2 },
                    minHeight: { xs: 48, sm: 40 },
                    fontSize: { xs: '0.875rem', sm: '0.9rem' },
                    color: 'error.main',
                    transition: 'all 0.2s',
                    '&:hover': {
                      bgcolor: alpha(theme.palette.error.main, 0.1),
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1.25, sm: 1.5 }, width: '100%' }}>
                    <ExitToApp sx={{ fontSize: { xs: 18, sm: 20 } }} />
                    <Typography fontWeight={500}>Logout</Typography>
                  </Box>
                </MenuItem>
              </Menu>
            </Box>
          </Toolbar>
        </AppBar>

        {/* Sidebar Drawer */}
        <Box
          component="nav"
          sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
        >
          {/* Mobile drawer */}
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

          {/* Desktop drawer */}
          <Drawer
            variant="permanent"
            sx={{
              display: { xs: 'none', md: 'block' },
              '& .MuiDrawer-paper': {
                boxSizing: 'border-box',
                width: drawerWidth,
                borderRight: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
                bgcolor: 'white',
                boxShadow: '2px 0 8px rgba(0,0,0,0.04)',
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
            p: { xs: 1, sm: 1.5, md: 2, lg: 3 },
            width: { md: `calc(100% - ${drawerWidth}px)` },
            bgcolor: '#fafafa',
            minHeight: '100vh',
            position: 'relative',
            zIndex: 1,
            display: 'block',
            visibility: 'visible',
            opacity: 1,
            paddingBottom: { xs: 'env(safe-area-inset-bottom)', md: 0 },
          }}
        >
          <Toolbar sx={{ minHeight: { xs: 56, sm: 64, md: 72 } }} /> {/* Spacer for AppBar */}

          <Container
            maxWidth="xl"
            sx={{
              mt: { xs: 0.5, sm: 1, md: 2, lg: 3 },
              mb: { xs: 2, sm: 3, md: 4 },
              px: { xs: 1, sm: 1.5, md: 2, lg: 3 },
              position: 'relative',
              zIndex: 1
            }}
          >
            {/* Header Section */}
            <Box mb={4}>
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                style={{ display: 'block', visibility: 'visible' }}
              >
                {/* Main Header Container */}
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', md: 'row' },
                    alignItems: { xs: 'flex-start', md: 'center' },
                    justifyContent: 'space-between',
                    gap: { xs: 2, sm: 2.5, md: 3 },
                    mb: { xs: 2.5, sm: 3, md: 4 },
                    pb: { xs: 2, sm: 2.5, md: 3 },
                    position: 'relative',
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      height: '1px',
                      background: `linear-gradient(90deg, transparent 0%, ${alpha('#D4AF37', 0.3)} 50%, transparent 100%)`,
                    },
                  }}
                >
                  {/* Left Side - Greeting and Description */}
                  <Box sx={{ flex: 1, minWidth: 0, width: '100%' }}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: { xs: 1, sm: 1.5 }, mb: { xs: 1, sm: 1.5 } }}>
                      <Box
                        sx={{
                          width: { xs: 3, sm: 4, md: 5 },
                          height: { xs: 32, sm: 40, md: 48 },
                          borderRadius: '4px',
                          background: 'linear-gradient(180deg, #D4AF37 0%, #B8941F 100%)',
                          boxShadow: `0 2px 8px ${alpha('#D4AF37', 0.3)}`,
                          flexShrink: 0,
                        }}
                      />
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography
                          variant="h4"
                          fontWeight="800"
                          sx={{
                            letterSpacing: '-0.5px',
                            fontSize: { xs: '1.25rem', sm: '1.5rem', md: '1.75rem', lg: '2rem' },
                            background: 'linear-gradient(135deg, #1C2A39 0%, #D4AF37 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text',
                            lineHeight: { xs: 1.3, sm: 1.2 },
                            mb: { xs: 0.5, sm: 0.75 },
                            wordBreak: 'break-word',
                          }}
                        >
                          {greeting} 👋
                        </Typography>
                        <Typography
                          variant="body1"
                          color="text.secondary"
                          sx={{
                            fontSize: { xs: '0.8rem', sm: '0.875rem', md: '0.95rem', lg: '1rem' },
                            fontWeight: 400,
                            lineHeight: { xs: 1.5, sm: 1.6 },
                            maxWidth: { md: '600px' },
                          }}
                        >
                          Here's what's happening with your escrow portfolio today
                        </Typography>
                      </Box>
                    </Box>
                  </Box>

                  {/* Right Side - Controls */}
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: { xs: 'stretch', sm: 'center' },
                      gap: { xs: 1, sm: 1.5, md: 2 },
                      flexWrap: 'wrap',
                      flexShrink: 0,
                      width: { xs: '100%', md: 'auto' },
                    }}
                  >
                    <FormControl
                      size="small"
                      sx={{
                        minWidth: { xs: '100%', sm: 140, md: 160 },
                        width: { xs: '100%', sm: 'auto' },
                        flex: { xs: '1 1 auto', sm: '0 0 auto' },
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          bgcolor: 'white',
                          height: { xs: 48, sm: 44, md: 40, lg: 36 },
                          minHeight: { xs: 48 },
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: alpha(theme.palette.divider, 0.2),
                          },
                          '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: alpha(theme.palette.primary.main, 0.5),
                          },
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: theme.palette.primary.main,
                            borderWidth: 2,
                          },
                        },
                        '& .MuiInputLabel-root': {
                          fontSize: { xs: '0.875rem', sm: '0.875rem', md: '0.9rem' },
                        },
                        '& .MuiSelect-select': {
                          py: { xs: 1.75, sm: 1.5, md: 1.25, lg: 1 },
                          fontSize: { xs: '0.875rem', sm: '0.875rem', md: '0.9rem' },
                        },
                      }}
                    >
                      <InputLabel id="timeframe-label">Timeframe</InputLabel>
                      <Select
                        labelId="timeframe-label"
                        value={timeframe}
                        label="Timeframe"
                        onChange={(e) => updateTimeframe(e.target.value as Timeframe)}
                      >
                        <MenuItem value="24h">24 Hours</MenuItem>
                        <MenuItem value="7d">7 Days</MenuItem>
                        <MenuItem value="30d">30 Days</MenuItem>
                        <MenuItem value="90d">90 Days</MenuItem>
                        <MenuItem value="1y">1 Year</MenuItem>
                        <MenuItem value="all">All Time</MenuItem>
                      </Select>
                    </FormControl>

                    <Button
                      variant="outlined"
                      startIcon={<Download sx={{ fontSize: { xs: 18, sm: 18, md: 20 } }} />}
                      onClick={handleMenuOpen}
                      size="small"
                      disabled={isExporting}
                      sx={{
                        borderRadius: 2,
                        textTransform: 'none',
                        fontWeight: 600,
                        px: { xs: 2, sm: 2, md: 2.5 },
                        py: { xs: 1.75, sm: 1.5, md: 1.25, lg: 1 },
                        fontSize: { xs: '0.875rem', sm: '0.875rem', md: '0.9rem' },
                        borderColor: alpha(theme.palette.primary.main, 0.3),
                        color: theme.palette.primary.main,
                        height: { xs: 48, sm: 44, md: 40, lg: 36 },
                        minHeight: { xs: 48 },
                        width: { xs: '100%', sm: 'auto' },
                        flex: { xs: '1 1 auto', sm: '0 0 auto' },
                        touchAction: 'manipulation',
                        WebkitTapHighlightColor: 'transparent',
                        '&:hover': {
                          borderColor: theme.palette.primary.main,
                          bgcolor: alpha(theme.palette.primary.main, 0.08),
                        },
                        '&:active': {
                          transform: { xs: 'scale(0.98)', sm: 'none' },
                        },
                        '&:disabled': {
                          opacity: 0.6,
                        },
                      }}
                    >
                      {isExporting ? 'Exporting...' : 'Export'}
                    </Button>

                    <Menu
                      anchorEl={anchorEl}
                      open={Boolean(anchorEl)}
                      onClose={handleMenuClose}
                      transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                      anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                      PaperProps={{
                        elevation: 8,
                        sx: {
                          mt: 1,
                          borderRadius: 2,
                          minWidth: 200,
                          boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                          border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
                        }
                      }}
                    >
                      <MenuItem
                        onClick={() => handleExport('pdf')}
                        disabled={isExporting}
                        sx={{
                          py: 1.5,
                          px: 2,
                          fontSize: '0.9rem',
                          '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.08) }
                        }}
                      >
                        <Download sx={{ mr: 1.5, fontSize: 20 }} /> Export as PDF
                      </MenuItem>
                      <MenuItem
                        onClick={() => handleExport('csv')}
                        disabled={isExporting}
                        sx={{
                          py: 1.5,
                          px: 2,
                          fontSize: '0.9rem',
                          '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.08) }
                        }}
                      >
                        <Download sx={{ mr: 1.5, fontSize: 20 }} /> Export as CSV
                      </MenuItem>
                    </Menu>
                  </Box>
                </Box>
              </motion.div>

              {/* KPI Cards Container */}
              <Box sx={{ mb: { xs: 3, sm: 4 } }}>
                <Typography
                  variant="h6"
                  fontWeight="700"
                  gutterBottom
                  mb={{ xs: 2, sm: 3 }}
                  sx={{
                    fontSize: { xs: '1rem', sm: '1.1rem', md: '1.25rem' },
                    color: 'text.primary',
                    letterSpacing: '-0.3px'
                  }}
                >
                  Key Performance Indicators
                </Typography>
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'row',
                    gap: { xs: 1, sm: 1.25, md: 1.5, lg: 2.5 },
                    width: '100%',
                    overflowX: { xs: 'auto', sm: 'visible' },
                    overflowY: 'hidden',
                    pb: { xs: 1.5, sm: 0 },
                    px: { xs: 0.5, sm: 0 },
                    alignItems: 'stretch',
                    WebkitOverflowScrolling: 'touch',
                    scrollbarWidth: 'thin',
                    scrollSnapType: { xs: 'x mandatory', sm: 'none' },
                    '&::-webkit-scrollbar': {
                      height: { xs: '8px', sm: '6px' },
                    },
                    '&::-webkit-scrollbar-track': {
                      background: alpha(theme.palette.divider, 0.1),
                      borderRadius: '4px',
                    },
                    '&::-webkit-scrollbar-thumb': {
                      background: alpha(theme.palette.primary.main, 0.3),
                      borderRadius: '4px',
                      '&:hover': {
                        background: alpha(theme.palette.primary.main, 0.5),
                      },
                    },
                  }}
                >
                  {kpiData.map((kpi, index) => (
                    <Box
                      key={kpi.id}
                      sx={{
                        flex: { xs: '0 0 auto', sm: '1 1 0%' },
                        minWidth: { xs: 'calc(85vw - 24px)', sm: 0 },
                        width: { xs: 'calc(85vw - 24px)', sm: 0 },
                        maxWidth: { xs: 'calc(85vw - 24px)', sm: 'none' },
                        display: 'flex',
                        flexDirection: 'column',
                        scrollSnapAlign: { xs: 'start', sm: 'none' },
                      }}
                    >
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: index * 0.1 }}
                        style={{
                          width: '100%',
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                        }}
                      >
                        <MetricCard
                          {...kpi}
                          expanded={expandedKPIs[kpi.id]}
                          onClick={() => setExpandedKPIs(prev => ({
                            ...prev,
                            [kpi.id]: !prev[kpi.id]
                          }))}
                          loading={loading}
                        />
                      </motion.div>
                    </Box>
                  ))}
                </Box>
              </Box>

              {/* Portfolio Performance & Quick Actions Row */}
              <Box
                sx={{
                  mb: { xs: 3, sm: 4 },
                  width: '100%',
                  display: 'flex',
                  flexDirection: { xs: 'column', md: 'row' },
                  gap: { xs: 2, sm: 2.5, md: 3 },
                  alignItems: 'stretch',
                }}
              >
                <Box
                  sx={{
                    width: { xs: '100%', md: 0 },
                    flex: { xs: '0 0 auto', md: '2 1 0%' },
                    display: 'flex',
                    flexDirection: 'column',
                    minHeight: { xs: 'auto', md: '500px' },
                  }}
                >
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    style={{
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                  >
                    <PerformanceChart
                      data={data?.analytics.chartData || []}
                      timeframe={timeframe}
                      title="Portfolio Performance"
                    />
                  </motion.div>
                </Box>

                <Box
                  sx={{
                    width: { xs: '100%', md: 0 },
                    flex: { xs: '0 0 auto', md: '1 1 0%' },
                    display: 'flex',
                    flexDirection: 'column',
                    minHeight: { xs: 'auto', md: '500px' },
                  }}
                >
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    style={{
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                  >
                    <QuickActions
                      onNewEscrow={() => router.push('/escrow/create')}
                      onManageWallet={() => router.push('/user-dashboard/wallet')}
                      onViewTransactions={() => router.push('/user-dashboard/transactions')}
                      onExportReport={() => handleExport('pdf')}
                      performanceMetrics={data?.analytics.performanceMetrics}
                    />
                  </motion.div>
                </Box>
              </Box>

              {/* Recent Transactions - Full Width */}
              <Box mb={{ xs: 3, sm: 4 }}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                >
                  <TransactionList
                    transactions={data?.transactions.recentTransactions || []}
                    onViewAll={() => router.push('/user-dashboard/transactions')}
                    maxItems={5}
                    loading={loading}
                  />
                </motion.div>
              </Box>

              {/* Activity & Insights Row */}
              <Box
                sx={{
                  mb: { xs: 3, sm: 4 },
                  width: '100%',
                  display: 'flex',
                  flexDirection: { xs: 'column', md: 'row' },
                  gap: { xs: 2, sm: 2.5, md: 3 },
                  alignItems: 'stretch',
                }}
              >
                {/* Recent Activity */}
                <Box
                  sx={{
                    width: { xs: '100%', md: 0 },
                    flex: { xs: '0 0 auto', md: '1 1 0%' },
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                    style={{
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                  >
                    <Card sx={{
                      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      borderRadius: 3,
                      border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
                      transition: 'all 0.3s',
                      '&:hover': {
                        boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
                      }
                    }}>
                      <CardContent sx={{ p: 3, display: 'flex', flexDirection: 'column', flex: 1 }}>
                        <Box display="flex" alignItems="center" justifyContent="space-between" mb={3} flexShrink={0}>
                          <Typography variant="h6" fontWeight="700" sx={{ fontSize: '1.1rem' }}>
                            Recent Activity
                          </Typography>
                          <IconButton
                            size="small"
                            sx={{
                              '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.08) }
                            }}
                          >
                            <MoreVert fontSize="small" />
                          </IconButton>
                        </Box>
                        <List dense sx={{ px: 0, flex: 1 }}>
                          {[
                            { icon: <CheckCircle />, text: 'New escrow created', time: '2 hours ago', colorPath: 'success.main', bgColor: alpha(theme.palette.success.main, 0.12) },
                            { icon: <TrendingUp />, text: 'Payment received', time: '5 hours ago', colorPath: '#D4AF37', bgColor: alpha('#D4AF37', 0.12) },
                            { icon: <Receipt />, text: 'Document uploaded', time: '1 day ago', colorPath: 'info.main', bgColor: alpha(theme.palette.info.main, 0.12) },
                          ].map((activity, idx) => (
                            <ListItem
                              key={idx}
                              sx={{
                                px: 0,
                                py: 1.5,
                                borderRadius: 2,
                                mb: 1,
                                transition: 'all 0.2s',
                                '&:hover': {
                                  bgcolor: alpha(theme.palette.primary.main, 0.04),
                                  transform: 'translateX(4px)'
                                },
                              }}
                            >
                              <ListItemIcon sx={{ minWidth: 44 }}>
                                <Avatar sx={{
                                  width: 36,
                                  height: 36,
                                  bgcolor: activity.bgColor,
                                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                                }}>
                                  {React.cloneElement(activity.icon, { sx: { fontSize: 18, color: activity.colorPath } })}
                                </Avatar>
                              </ListItemIcon>
                              <ListItemText
                                primary={activity.text}
                                secondary={activity.time}
                                primaryTypographyProps={{
                                  variant: 'body2',
                                  fontWeight: 600,
                                  fontSize: '0.9rem'
                                }}
                                secondaryTypographyProps={{
                                  variant: 'caption',
                                  color: 'text.secondary',
                                  fontSize: '0.75rem'
                                }}
                              />
                            </ListItem>
                          ))}
                        </List>
                        <Button
                          fullWidth
                          variant="outlined"
                          size="small"
                          sx={{
                            mt: 2,
                            borderRadius: 2,
                            textTransform: 'none',
                            fontWeight: 600,
                            borderColor: alpha(theme.palette.primary.main, 0.3),
                            flexShrink: 0,
                            '&:hover': {
                              borderColor: theme.palette.primary.main,
                              bgcolor: alpha(theme.palette.primary.main, 0.04),
                            }
                          }}
                        >
                          View All Activity
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                </Box>

                {/* Smart Insights */}
                <Box
                  sx={{
                    width: { xs: '100%', md: 0 },
                    flex: { xs: '0 0 auto', md: '1 1 0%' },
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.6 }}
                    style={{
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                  >
                    <Card sx={{
                      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      borderRadius: 3,
                      background: 'linear-gradient(135deg, #D4AF37 0%, #B8941F 100%)',
                      color: '#1C2A39',
                      position: 'relative',
                      overflow: 'hidden',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        right: 0,
                        width: '60%',
                        height: '60%',
                        background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
                        pointerEvents: 'none'
                      }
                    }}>
                      <CardContent sx={{ p: 3, position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', flex: 1 }}>
                        <Box display="flex" alignItems="center" gap={1.5} mb={2.5} flexShrink={0}>
                          <Lightbulb sx={{ fontSize: 28 }} />
                          <Typography variant="h6" fontWeight="700" sx={{ fontSize: '1.1rem' }}>
                            Smart Insights
                          </Typography>
                        </Box>
                        <Typography variant="body2" sx={{ mb: 2, lineHeight: 1.7, fontWeight: 500, flexShrink: 0 }}>
                          Your success rate is <strong>{data?.analytics.performanceMetrics.successRate.toFixed(0)}%</strong>! Keep up the great work.
                        </Typography>
                        <Box
                          sx={{
                            p: 2,
                            borderRadius: 2,
                            bgcolor: 'rgba(28,42,57,0.1)',
                            border: '1px solid rgba(28,42,57,0.15)',
                            flexShrink: 0,
                          }}
                        >
                          <Typography variant="body2" sx={{ fontWeight: 500, display: 'flex', alignItems: 'center', gap: 1 }}>
                            💡 <span>Tip: Complete your KYC verification to unlock premium features.</span>
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </motion.div>
                </Box>
              </Box>

              {/* Active Escrows Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.7 }}
              >
                <Card sx={{
                  mb: 4,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                  borderRadius: 3,
                  border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
                }}>
                  <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                    <Box
                      display="flex"
                      flexDirection={{ xs: 'column', sm: 'row' }}
                      justifyContent="space-between"
                      alignItems={{ xs: 'flex-start', sm: 'center' }}
                      mb={3}
                      gap={2}
                    >
                      <Box>
                        <Typography variant="h6" fontWeight="700" sx={{ fontSize: '1.1rem', mb: 0.5 }}>
                          Active Escrows
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
                          Manage your ongoing transactions
                        </Typography>
                      </Box>
                      <Button
                        variant="contained"
                        size="medium"
                        startIcon={<AddIcon />}
                        onClick={() => router.push('/escrow/create')}
                        sx={{
                          borderRadius: 2,
                          textTransform: 'none',
                          fontWeight: 600,
                          px: 3,
                          bgcolor: '#D4AF37',
                          '&:hover': {
                            bgcolor: '#B8941F',
                            boxShadow: '0 4px 12px rgba(212,175,55,0.4)',
                          }
                        }}
                      >
                        New Escrow
                      </Button>
                    </Box>

                    {data?.escrows.recentEscrows && data.escrows.recentEscrows.length > 0 ? (
                      <Grid container spacing={{ xs: 2, sm: 3 }}>
                        {data.escrows.recentEscrows.map((escrow, index) => (
                          <Grid item xs={12} sm={6} lg={3} key={escrow.id}>
                            <motion.div
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ duration: 0.3, delay: index * 0.1 }}
                            >
                              <Box
                                sx={{
                                  p: { xs: 2, sm: 3 },
                                  border: '1px solid',
                                  borderColor: alpha(theme.palette.divider, 0.2),
                                  borderRadius: 3,
                                  height: '100%',
                                  bgcolor: 'white',
                                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                  cursor: 'pointer',
                                  '&:hover': {
                                    borderColor: '#D4AF37',
                                    boxShadow: '0 8px 24px rgba(212,175,55,0.15)',
                                    transform: 'translateY(-6px)',
                                  },
                                }}
                                onClick={() => router.push(`/user-dashboard/escrows/${escrow.id}`)}
                              >
                                <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
                                  <Box flex={1}>
                                    <Typography variant="subtitle1" fontWeight="700" gutterBottom sx={{ fontSize: '1rem' }}>
                                      {escrow.title}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary" display="block" mb={1.5} sx={{ fontSize: '0.75rem' }}>
                                      ID: {escrow.id.slice(0, 8)}...
                                    </Typography>
                                    <Chip
                                      label={escrow.status.toUpperCase()}
                                      size="small"
                                      color={escrow.status === 'active' ? 'success' : 'warning'}
                                      sx={{
                                        fontWeight: 700,
                                        fontSize: '0.7rem',
                                        height: 22
                                      }}
                                    />
                                  </Box>
                                </Box>

                                <Divider sx={{ my: 2, borderColor: alpha(theme.palette.divider, 0.1) }} />

                                <Box>
                                  <Typography variant="caption" color="text.secondary" display="block" mb={0.5} sx={{ fontSize: '0.75rem' }}>
                                    Amount
                                  </Typography>
                                  <Typography variant="h5" fontWeight="800" sx={{
                                    color: '#D4AF37',
                                    fontSize: { xs: '1.5rem', sm: '1.75rem' },
                                    mb: 2
                                  }}>
                                    ${escrow.amount.toLocaleString()}
                                  </Typography>

                                  <Button
                                    fullWidth
                                    variant="outlined"
                                    size="small"
                                    endIcon={<TrendingUp />}
                                    sx={{
                                      mt: 1,
                                      borderRadius: 2,
                                      textTransform: 'none',
                                      fontWeight: 600,
                                      borderColor: alpha('#D4AF37', 0.5),
                                      color: '#D4AF37',
                                      '&:hover': {
                                        borderColor: '#D4AF37',
                                        bgcolor: alpha('#D4AF37', 0.08),
                                      }
                                    }}
                                  >
                                    View Details
                                  </Button>
                                </Box>
                              </Box>
                            </motion.div>
                          </Grid>
                        ))}
                      </Grid>
                    ) : (
                      <Box
                        textAlign="center"
                        py={8}
                        sx={{
                          border: '2px dashed',
                          borderColor: alpha(theme.palette.divider, 0.3),
                          borderRadius: 3,
                          bgcolor: alpha(theme.palette.primary.main, 0.02)
                        }}
                      >
                        <Security sx={{ fontSize: 64, color: 'text.disabled', mb: 2, opacity: 0.5 }} />
                        <Typography variant="h6" fontWeight="700" gutterBottom sx={{ mb: 1 }}>
                          No Active Escrows
                        </Typography>
                        <Typography variant="body2" color="text.secondary" mb={3} sx={{ maxWidth: 400, mx: 'auto' }}>
                          Start your first escrow transaction to secure your deals and protect your assets
                        </Typography>
                        <Button
                          variant="contained"
                          size="large"
                          startIcon={<AddIcon />}
                          onClick={() => router.push('/escrow/create')}
                          sx={{
                            borderRadius: 2,
                            textTransform: 'none',
                            fontWeight: 600,
                            px: 4,
                            py: 1.5,
                            bgcolor: '#D4AF37',
                            '&:hover': {
                              bgcolor: '#B8941F',
                              boxShadow: '0 4px 12px rgba(212,175,55,0.4)',
                            }
                          }}
                        >
                          Create Your First Escrow
                        </Button>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </Box>
          </Container>
        </Box>
      </Box>

      {/* Floating Action Button - Quick Actions */}
      <Box sx={{ position: 'fixed', bottom: { xs: 20, sm: 24 }, right: { xs: 20, sm: 24 }, zIndex: 1000 }}>
        <Tooltip title="Create New Escrow" placement="left" arrow>
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              variant="contained"
              sx={{
                width: { xs: 56, sm: 64 },
                height: { xs: 56, sm: 64 },
                borderRadius: '50%',
                minWidth: 'unset',
                bgcolor: '#D4AF37',
                color: '#1C2A39',
                boxShadow: '0 8px 24px rgba(212,175,55,0.4)',
                '&:hover': {
                  bgcolor: '#B8941F',
                  boxShadow: '0 12px 32px rgba(212,175,55,0.5)',
                },
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
              onClick={() => router.push('/escrow/create')}
            >
              <AddIcon sx={{ fontSize: { xs: 28, sm: 32 } }} />
            </Button>
          </motion.div>
        </Tooltip>
      </Box>

      {/* Help Button */}
      <Box sx={{ position: 'fixed', bottom: { xs: 90, sm: 100 }, right: { xs: 20, sm: 24 }, zIndex: 1000 }}>
        <Tooltip title="Need Help?" placement="left" arrow>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <IconButton
              sx={{
                width: { xs: 48, sm: 56 },
                height: { xs: 48, sm: 56 },
                bgcolor: 'white',
                color: '#D4AF37',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                '&:hover': {
                  bgcolor: 'white',
                  boxShadow: '0 6px 20px rgba(0,0,0,0.2)',
                },
                transition: 'all 0.2s',
              }}
              onClick={() => router.push('/user-dashboard/help')}
            >
              <Help sx={{ fontSize: { xs: 22, sm: 24 } }} />
            </IconButton>
          </motion.div>
        </Tooltip>
      </Box>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        sx={{ bottom: { xs: 90, sm: 24 } }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          sx={{
            borderRadius: 2,
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            minWidth: { xs: 'auto', sm: 300 },
            '& .MuiAlert-icon': {
              fontSize: 24
            }
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  // This would normally fetch user data from your authentication system
  const user = {
    id: context.req.headers['x-user-id'] as string || 'demo-user-id',
    name: 'John Smith',
    email: 'john.smith@email.com',
    role: 'buyer' as const,
    kycLevel: 'premium' as const,
  };

  return {
    props: {
      user,
    },
  };
};

export default UserDashboard;



