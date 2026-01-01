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
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Menu,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  LinearProgress,
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
  Download,
  FilterList,
  Search,
  TrendingUp,
  TrendingDown,
  ArrowUpward,
  ArrowDownward,
  CheckCircle,
  Pending,
  Error as ErrorIcon,
  AttachMoney,
  SwapHoriz,
  Send,
  CallReceived,
  MoreVert,
  Person,
} from '@mui/icons-material';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';

const drawerWidth = 280;

// Mock transaction data
const mockTransactions = [
  {
    id: 'TXN-2024-001',
    type: 'deposit',
    amount: 75000,
    currency: 'USD',
    status: 'completed',
    from: 'Bank Account ****1234',
    to: 'Escrow Wallet',
    timestamp: '2024-01-18T14:30:00Z',
    fee: 150,
    escrowId: 'ESC-2024-001',
    description: 'Deposit for Premium Gold Bars purchase',
  },
  {
    id: 'TXN-2024-002',
    type: 'withdrawal',
    amount: 45000,
    currency: 'USD',
    status: 'pending',
    from: 'Escrow Wallet',
    to: 'Bank Account ****5678',
    timestamp: '2024-01-19T10:15:00Z',
    fee: 90,
    escrowId: 'ESC-2024-002',
    description: 'Withdrawal from completed deal',
  },
  {
    id: 'TXN-2024-003',
    type: 'transfer',
    amount: 12500,
    currency: 'USD',
    status: 'completed',
    from: 'Escrow Wallet',
    to: 'Gold Investment Corp',
    timestamp: '2024-01-17T16:45:00Z',
    fee: 25,
    escrowId: 'ESC-2024-001',
    description: 'Partial payment for gold delivery',
  },
  {
    id: 'TXN-2024-004',
    type: 'deposit',
    amount: 30000,
    currency: 'USD',
    status: 'completed',
    from: 'Crypto Wallet',
    to: 'Escrow Wallet',
    timestamp: '2024-01-16T09:20:00Z',
    fee: 60,
    escrowId: null,
    description: 'Crypto to fiat conversion',
  },
  {
    id: 'TXN-2024-005',
    type: 'fee',
    amount: 250,
    currency: 'USD',
    status: 'completed',
    from: 'Escrow Wallet',
    to: 'Platform Fee',
    timestamp: '2024-01-15T11:00:00Z',
    fee: 0,
    escrowId: 'ESC-2024-001',
    description: 'Escrow service fee',
  },
];

// Chart data
const transactionVolumeData = [
  { month: 'Jul', volume: 45000, count: 12 },
  { month: 'Aug', volume: 52000, count: 15 },
  { month: 'Sep', volume: 48000, count: 14 },
  { month: 'Oct', volume: 61000, count: 18 },
  { month: 'Nov', volume: 58000, count: 16 },
  { month: 'Dec', volume: 72000, count: 21 },
  { month: 'Jan', volume: 85000, count: 24 },
];

const transactionTypeData = [
  { name: 'Deposits', value: 45, color: '#4CAF50' },
  { name: 'Withdrawals', value: 25, color: '#2196F3' },
  { name: 'Transfers', value: 20, color: '#FF9800' },
  { name: 'Fees', value: 10, color: '#F44336' },
];

interface UserTransactionsProps {
  user: {
    name: string;
    email: string;
    role: 'buyer' | 'seller';
    kycLevel: 'basic' | 'verified' | 'premium';
  };
}

const UserTransactions: React.FC<UserTransactionsProps> = ({ user }) => {
  const theme = useTheme();
  const router = useRouter();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [transactions, setTransactions] = useState(mockTransactions);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuAnchor, setUserMenuAnchor] = useState<null | HTMLElement>(null);
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTxn, setSelectedTxn] = useState<string | null>(null);

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/user-dashboard' },
    { text: 'My Escrows', icon: <Security />, path: '/user-dashboard/escrows' },
    { text: 'Transactions', icon: <Timeline />, path: '/user-dashboard/transactions', active: true },
    { text: 'Wallet', icon: <AccountBalance />, path: '/user-dashboard/wallet' },
    { text: 'Disputes', icon: <Gavel />, path: '/user-dashboard/disputes' },
    { text: 'Reports', icon: <Receipt />, path: '/user-dashboard/reports' },
    { text: 'Profile', icon: <Person />, path: '/user-dashboard/profile' },
    { text: 'Notifications', icon: <Notifications />, path: '/user-dashboard/notifications' },
  ];

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'deposit': return <CallReceived color="success" />;
      case 'withdrawal': return <Send color="primary" />;
      case 'transfer': return <SwapHoriz color="info" />;
      case 'fee': return <AttachMoney color="warning" />;
      default: return <SwapHoriz />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'pending': return 'warning';
      case 'failed': return 'error';
      default: return 'default';
    }
  };

  const filteredTransactions = transactions.filter(txn => {
    const matchesType = filterType === 'all' || txn.type === filterType;
    const matchesStatus = filterStatus === 'all' || txn.status === filterStatus;
    const matchesSearch = txn.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         txn.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesStatus && matchesSearch;
  });

  const stats = {
    totalVolume: transactions.reduce((sum, txn) => sum + txn.amount, 0),
    totalFees: transactions.reduce((sum, txn) => sum + txn.fee, 0),
    completedCount: transactions.filter(t => t.status === 'completed').length,
    pendingCount: transactions.filter(t => t.status === 'pending').length,
  };

  // Sidebar drawer
  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: { xs: 2, sm: 2.5 }, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Avatar sx={{ width: { xs: 44, sm: 48 }, height: { xs: 44, sm: 48 }, bgcolor: 'primary.main' }}>
          {user.name.charAt(0)}
        </Avatar>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography 
            variant="subtitle1" 
            fontWeight={600} 
            noWrap
            sx={{ fontSize: { xs: '0.9375rem', sm: '1rem' } }}
          >
            {user.name}
          </Typography>
          <Chip 
            label={user.kycLevel} 
            size="small" 
            color="primary" 
            sx={{ 
              mt: 0.5,
              fontSize: '0.7rem',
              height: 20,
              fontWeight: 500
            }} 
          />
        </Box>
      </Box>
      
      <Divider sx={{ mx: 2 }} />
      
      <List sx={{ px: { xs: 1.5, sm: 2 }, py: { xs: 1, sm: 1.5 }, flex: 1 }}>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton
              selected={item.active}
              onClick={() => router.push(item.path)}
              sx={{
                borderRadius: 1.5,
                py: { xs: 1, sm: 1.25 },
                px: { xs: 1.5, sm: 2 },
                '&.Mui-selected': {
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.15) },
                },
                '&:hover': {
                  bgcolor: alpha(theme.palette.action.hover, 0.8),
                }
              }}
            >
              <ListItemIcon sx={{ minWidth: { xs: 36, sm: 40 }, color: item.active ? 'primary.main' : 'inherit' }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.text}
                primaryTypographyProps={{
                  fontWeight: item.active ? 600 : 500,
                  fontSize: { xs: '0.875rem', sm: '0.9375rem' },
                  color: item.active ? 'primary.main' : 'text.primary',
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <Divider sx={{ mx: 2 }} />

      <List sx={{ px: { xs: 1.5, sm: 2 }, py: { xs: 1, sm: 1.5 } }}>
        <ListItem disablePadding sx={{ mb: 0.5 }}>
          <ListItemButton 
            onClick={() => router.push('/user-dashboard/settings')} 
            sx={{ 
              borderRadius: 1.5,
              py: { xs: 1, sm: 1.25 },
              px: { xs: 1.5, sm: 2 },
              '&:hover': {
                bgcolor: alpha(theme.palette.action.hover, 0.8),
              }
            }}
          >
            <ListItemIcon sx={{ minWidth: { xs: 36, sm: 40 } }}>
              <SettingsIcon />
            </ListItemIcon>
            <ListItemText 
              primary="Settings"
              primaryTypographyProps={{
                fontSize: { xs: '0.875rem', sm: '0.9375rem' },
                fontWeight: 500,
              }}
            />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton 
            onClick={() => router.push('/user-dashboard/help')} 
            sx={{ 
              borderRadius: 1.5,
              py: { xs: 1, sm: 1.25 },
              px: { xs: 1.5, sm: 2 },
              '&:hover': {
                bgcolor: alpha(theme.palette.action.hover, 0.8),
              }
            }}
          >
            <ListItemIcon sx={{ minWidth: { xs: 36, sm: 40 } }}>
              <Help />
            </ListItemIcon>
            <ListItemText 
              primary="Help & Support"
              primaryTypographyProps={{
                fontSize: { xs: '0.875rem', sm: '0.9375rem' },
                fontWeight: 500,
              }}
            />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );

  return (
    <>
      <Head>
        <title>Transactions - Gold Escrow</title>
        <meta name="description" content="View and manage your transaction history" />
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
            boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
            borderBottom: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
          }}
        >
          <Toolbar sx={{ px: { xs: 1.5, sm: 2, md: 2.5 }, minHeight: { xs: 56, sm: 64 } }}>
            <IconButton
              color="inherit"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ 
                mr: { xs: 1, sm: 2 }, 
                display: { md: 'none' },
                '&:hover': {
                  bgcolor: alpha(theme.palette.action.hover, 0.8)
                }
              }}
            >
              <MenuIcon />
            </IconButton>
            
            <Typography 
              variant="h6" 
              noWrap 
              component="div" 
              sx={{ 
                flexGrow: 1, 
                fontWeight: 600,
                fontSize: { xs: '1.125rem', sm: '1.25rem' }
              }}
            >
              Transactions
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.5, sm: 1 } }}>
              <Tooltip title="Refresh">
                <IconButton 
                  size="small"
                  sx={{ 
                    '&:hover': {
                      bgcolor: alpha(theme.palette.action.hover, 0.8)
                    }
                  }}
                >
                  <Refresh sx={{ fontSize: { xs: 20, sm: 22 } }} />
                </IconButton>
              </Tooltip>

              <Tooltip title="Export">
                <IconButton 
                  size="small"
                  sx={{ 
                    '&:hover': {
                      bgcolor: alpha(theme.palette.action.hover, 0.8)
                    }
                  }}
                >
                  <Download sx={{ fontSize: { xs: 20, sm: 22 } }} />
                </IconButton>
              </Tooltip>

              <Tooltip title="Notifications">
                <IconButton 
                  size="small"
                  sx={{ 
                    '&:hover': {
                      bgcolor: alpha(theme.palette.action.hover, 0.8)
                    }
                  }}
                >
                  <Badge badgeContent={2} color="error" sx={{ '& .MuiBadge-badge': { fontSize: '0.7rem', minWidth: 16, height: 16 } }}>
                    <Notifications sx={{ fontSize: { xs: 20, sm: 22 } }} />
                  </Badge>
                </IconButton>
              </Tooltip>

              <IconButton
                onClick={(e) => setUserMenuAnchor(e.currentTarget)}
                size="small"
                sx={{ 
                  ml: { xs: 0.5, sm: 1 },
                  '&:hover': {
                    bgcolor: alpha(theme.palette.action.hover, 0.8)
                  }
                }}
              >
                <Avatar sx={{ width: { xs: 28, sm: 32 }, height: { xs: 28, sm: 32 } }}>
                  {user.name.charAt(0)}
                </Avatar>
              </IconButton>

              <Menu
                anchorEl={userMenuAnchor}
                open={Boolean(userMenuAnchor)}
                onClose={() => setUserMenuAnchor(null)}
                PaperProps={{
                  sx: {
                    mt: 1,
                    minWidth: 180,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
                  }
                }}
              >
                <MenuItem 
                  onClick={() => router.push('/user-dashboard/profile')}
                  sx={{ fontSize: '0.875rem', py: 1 }}
                >
                  Profile
                </MenuItem>
                <MenuItem 
                  onClick={() => router.push('/user-dashboard/settings')}
                  sx={{ fontSize: '0.875rem', py: 1 }}
                >
                  Settings
                </MenuItem>
                <Divider />
                <MenuItem 
                  onClick={() => router.push('/logout')}
                  sx={{ fontSize: '0.875rem', py: 1 }}
                >
                  <ExitToApp sx={{ mr: 1.5, fontSize: 18 }} /> Logout
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
                borderRight: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
                bgcolor: 'white',
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
            p: { xs: 1.5, sm: 2, md: 2.5 },
            width: { md: `calc(100% - ${drawerWidth}px)` },
            bgcolor: '#f5f5f5',
            minHeight: '100vh',
          }}
        >
          <Toolbar />
          
          <Container maxWidth="xl" sx={{ py: { xs: 1.5, sm: 2 }, px: { xs: 1.5, sm: 2, md: 2.5 } }}>
            {/* Header */}
            <Box mb={{ xs: 2.5, sm: 3 }}>
              <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ fontSize: { xs: '1.75rem', sm: '2rem' } }}>
                Transaction History
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.875rem', sm: '0.9375rem' } }}>
                Track all your financial activities
              </Typography>
            </Box>

            {/* Statistics Cards */}
            <Grid container spacing={{ xs: 1.5, sm: 2, md: 2.5 }} mb={{ xs: 2.5, sm: 3 }}>
              {[
                { title: 'Total Volume', value: formatCurrency(stats.totalVolume), icon: <AttachMoney />, color: '#4CAF50', trend: '+18%' },
                { title: 'Total Fees', value: formatCurrency(stats.totalFees), icon: <Receipt />, color: '#FF9800', trend: '-5%' },
                { title: 'Completed', value: stats.completedCount, icon: <CheckCircle />, color: '#2196F3', trend: '+12%' },
                { title: 'Pending', value: stats.pendingCount, icon: <Pending />, color: '#9C27B0', trend: '0%' },
              ].map((stat, index) => (
                <Grid item xs={12} sm={6} lg={3} key={stat.title}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    style={{ height: '100%' }}
                  >
                    <Card 
                      sx={{ 
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        transition: 'all 0.3s',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                        border: `1px solid ${alpha(theme.palette.divider, 0.05)}`,
                        '&:hover': { 
                          transform: 'translateY(-2px)',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
                        },
                      }}
                    >
                      <CardContent sx={{ p: { xs: 2, sm: 2.5 }, flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1.5}>
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography 
                              variant="caption" 
                              color="text.secondary" 
                              gutterBottom
                              sx={{ 
                                fontSize: '0.75rem',
                                fontWeight: 500,
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px',
                                mb: 0.5
                              }}
                            >
                              {stat.title}
                            </Typography>
                            <Typography 
                              variant="h5" 
                              fontWeight="bold"
                              sx={{ 
                                fontSize: { xs: '1.25rem', sm: '1.5rem' },
                                lineHeight: 1.2,
                                wordBreak: 'break-word'
                              }}
                            >
                              {stat.value}
                            </Typography>
                          </Box>
                          <Avatar 
                            sx={{ 
                              bgcolor: alpha(stat.color, 0.12), 
                              color: stat.color,
                              width: { xs: 40, sm: 44 },
                              height: { xs: 40, sm: 44 },
                              ml: 1,
                              flexShrink: 0
                            }}
                          >
                            {stat.icon}
                          </Avatar>
                        </Box>
                        <Box 
                          display="flex" 
                          alignItems="center" 
                          gap={0.5}
                          sx={{ mt: 'auto', pt: 1 }}
                        >
                          {stat.trend.startsWith('+') ? (
                            <TrendingUp sx={{ fontSize: 14, color: 'success.main' }} />
                          ) : stat.trend.startsWith('-') ? (
                            <TrendingDown sx={{ fontSize: 14, color: 'error.main' }} />
                          ) : null}
                          <Typography 
                            variant="caption" 
                            color={stat.trend.startsWith('+') ? 'success.main' : stat.trend.startsWith('-') ? 'error.main' : 'text.secondary'}
                            fontWeight={600}
                            sx={{ fontSize: '0.75rem' }}
                          >
                            {stat.trend}
                          </Typography>
                          <Typography 
                            variant="caption" 
                            color="text.secondary"
                            sx={{ fontSize: '0.7rem', ml: 0.5 }}
                          >
                            vs last month
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </motion.div>
                </Grid>
              ))}
            </Grid>

            {/* Charts */}
            <Grid container spacing={{ xs: 1.5, sm: 2, md: 2.5 }} mb={{ xs: 2.5, sm: 3 }}>
              {/* Volume Chart */}
              <Grid item xs={12} lg={8}>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5 }}
                  style={{ height: '100%' }}
                >
                  <Card 
                    sx={{ 
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                      border: `1px solid ${alpha(theme.palette.divider, 0.05)}`,
                    }}
                  >
                    <CardContent sx={{ p: { xs: 2, sm: 2.5 }, flex: 1, display: 'flex', flexDirection: 'column' }}>
                      <Typography 
                        variant="h6" 
                        fontWeight={600} 
                        gutterBottom
                        sx={{ fontSize: { xs: '1rem', sm: '1.125rem' }, mb: 1.5 }}
                      >
                        Transaction Volume Trend
                      </Typography>
                      <Box sx={{ width: '100%', height: { xs: 240, sm: 280, md: 320 }, mt: 'auto' }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={transactionVolumeData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                            <defs>
                              <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#2196F3" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#2196F3" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                            <XAxis 
                              dataKey="month" 
                              stroke="#666" 
                              tick={{ fontSize: 12 }}
                              axisLine={false}
                              tickLine={false}
                            />
                            <YAxis 
                              stroke="#666" 
                              tick={{ fontSize: 12 }}
                              axisLine={false}
                              tickLine={false}
                            />
                            <RechartsTooltip 
                              contentStyle={{ 
                                backgroundColor: 'white', 
                                border: '1px solid #e0e0e0',
                                borderRadius: 8,
                                padding: '8px 12px',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                              }}
                            />
                            <Area 
                              type="monotone" 
                              dataKey="volume" 
                              stroke="#2196F3" 
                              strokeWidth={2}
                              fillOpacity={1} 
                              fill="url(#colorVolume)" 
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      </Box>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>

              {/* Type Distribution */}
              <Grid item xs={12} lg={4}>
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5 }}
                  style={{ height: '100%' }}
                >
                  <Card 
                    sx={{ 
                      height: '100%', 
                      display: 'flex', 
                      flexDirection: 'column',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                      border: `1px solid ${alpha(theme.palette.divider, 0.05)}`,
                    }}
                  >
                    <CardContent sx={{ p: { xs: 2, sm: 2.5 }, flex: 1, display: 'flex', flexDirection: 'column' }}>
                      <Typography 
                        variant="h6" 
                        fontWeight={600} 
                        gutterBottom
                        sx={{ fontSize: { xs: '1rem', sm: '1.125rem' }, mb: 1.5 }}
                      >
                        Transaction Types
                      </Typography>
                      <Box sx={{ width: '100%', height: { xs: 200, sm: 220, md: 240 }, mt: 'auto', mb: 2 }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={transactionTypeData}
                              cx="50%"
                              cy="50%"
                              innerRadius={55}
                              outerRadius={85}
                              paddingAngle={3}
                              dataKey="value"
                            >
                              {transactionTypeData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <RechartsTooltip 
                              contentStyle={{ 
                                backgroundColor: 'white', 
                                border: '1px solid #e0e0e0',
                                borderRadius: 8,
                                padding: '8px 12px',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                              }}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      </Box>
                      <Box sx={{ mt: 'auto' }}>
                        {transactionTypeData.map((item, idx) => (
                          <Box 
                            key={item.name} 
                            display="flex" 
                            justifyContent="space-between" 
                            alignItems="center" 
                            mb={idx < transactionTypeData.length - 1 ? 1.25 : 0}
                            sx={{ py: 0.25 }}
                          >
                            <Box display="flex" alignItems="center" gap={1.25}>
                              <Box 
                                sx={{ 
                                  width: 10, 
                                  height: 10, 
                                  borderRadius: '50%', 
                                  bgcolor: item.color,
                                  flexShrink: 0
                                }} 
                              />
                              <Typography 
                                variant="body2" 
                                sx={{ 
                                  fontSize: '0.8125rem',
                                  fontWeight: 500
                                }}
                              >
                                {item.name}
                              </Typography>
                            </Box>
                            <Typography 
                              variant="body2" 
                              fontWeight={600}
                              sx={{ fontSize: '0.8125rem' }}
                            >
                              {item.value}%
                            </Typography>
                          </Box>
                        ))}
                      </Box>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            </Grid>

            {/* Filters */}
            <Card 
              sx={{ 
                mb: { xs: 2, sm: 2.5 },
                boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                border: `1px solid ${alpha(theme.palette.divider, 0.05)}`,
              }}
            >
              <CardContent sx={{ p: { xs: 2, sm: 2.5 } }}>
                <Grid container spacing={{ xs: 1.5, sm: 2 }} alignItems="center">
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      size="small"
                      placeholder="Search transactions..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          fontSize: '0.875rem',
                        }
                      }}
                      InputProps={{
                        startAdornment: <Search sx={{ mr: 1, color: 'text.secondary', fontSize: 20 }} />,
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={2.5}>
                    <FormControl fullWidth size="small">
                      <InputLabel sx={{ fontSize: '0.875rem' }}>Type</InputLabel>
                      <Select
                        value={filterType}
                        label="Type"
                        onChange={(e) => setFilterType(e.target.value)}
                        sx={{ fontSize: '0.875rem' }}
                      >
                        <MenuItem value="all" sx={{ fontSize: '0.875rem' }}>All Types</MenuItem>
                        <MenuItem value="deposit" sx={{ fontSize: '0.875rem' }}>Deposits</MenuItem>
                        <MenuItem value="withdrawal" sx={{ fontSize: '0.875rem' }}>Withdrawals</MenuItem>
                        <MenuItem value="transfer" sx={{ fontSize: '0.875rem' }}>Transfers</MenuItem>
                        <MenuItem value="fee" sx={{ fontSize: '0.875rem' }}>Fees</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6} md={2.5}>
                    <FormControl fullWidth size="small">
                      <InputLabel sx={{ fontSize: '0.875rem' }}>Status</InputLabel>
                      <Select
                        value={filterStatus}
                        label="Status"
                        onChange={(e) => setFilterStatus(e.target.value)}
                        sx={{ fontSize: '0.875rem' }}
                      >
                        <MenuItem value="all" sx={{ fontSize: '0.875rem' }}>All Status</MenuItem>
                        <MenuItem value="completed" sx={{ fontSize: '0.875rem' }}>Completed</MenuItem>
                        <MenuItem value="pending" sx={{ fontSize: '0.875rem' }}>Pending</MenuItem>
                        <MenuItem value="failed" sx={{ fontSize: '0.875rem' }}>Failed</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<FilterList sx={{ fontSize: 18 }} />}
                      size="small"
                      sx={{ 
                        fontSize: '0.875rem',
                        py: 1,
                        textTransform: 'none',
                        fontWeight: 500
                      }}
                    >
                      More Filters
                    </Button>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Transactions Table */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card
                sx={{
                  boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                  border: `1px solid ${alpha(theme.palette.divider, 0.05)}`,
                  overflow: 'hidden',
                }}
              >
                <TableContainer>
                  <Table sx={{ minWidth: 650 }}>
                    <TableHead>
                      <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.02) }}>
                        <TableCell 
                          sx={{ 
                            fontWeight: 600, 
                            fontSize: '0.8125rem',
                            py: 1.5,
                            color: 'text.primary',
                            borderBottom: `2px solid ${alpha(theme.palette.divider, 0.1)}`
                          }}
                        >
                          Transaction ID
                        </TableCell>
                        <TableCell 
                          sx={{ 
                            fontWeight: 600, 
                            fontSize: '0.8125rem',
                            py: 1.5,
                            color: 'text.primary',
                            borderBottom: `2px solid ${alpha(theme.palette.divider, 0.1)}`
                          }}
                        >
                          Type
                        </TableCell>
                        <TableCell 
                          sx={{ 
                            fontWeight: 600, 
                            fontSize: '0.8125rem',
                            py: 1.5,
                            color: 'text.primary',
                            borderBottom: `2px solid ${alpha(theme.palette.divider, 0.1)}`
                          }}
                        >
                          Amount
                        </TableCell>
                        <TableCell 
                          sx={{ 
                            fontWeight: 600, 
                            fontSize: '0.8125rem',
                            py: 1.5,
                            color: 'text.primary',
                            borderBottom: `2px solid ${alpha(theme.palette.divider, 0.1)}`
                          }}
                        >
                          Status
                        </TableCell>
                        <TableCell 
                          sx={{ 
                            fontWeight: 600, 
                            fontSize: '0.8125rem',
                            py: 1.5,
                            color: 'text.primary',
                            borderBottom: `2px solid ${alpha(theme.palette.divider, 0.1)}`
                          }}
                        >
                          Date
                        </TableCell>
                        <TableCell 
                          sx={{ 
                            fontWeight: 600, 
                            fontSize: '0.8125rem',
                            py: 1.5,
                            color: 'text.primary',
                            borderBottom: `2px solid ${alpha(theme.palette.divider, 0.1)}`
                          }}
                        >
                          Description
                        </TableCell>
                        <TableCell 
                          align="right"
                          sx={{ 
                            fontWeight: 600, 
                            fontSize: '0.8125rem',
                            py: 1.5,
                            color: 'text.primary',
                            borderBottom: `2px solid ${alpha(theme.palette.divider, 0.1)}`
                          }}
                        >
                          Actions
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredTransactions.map((txn, index) => (
                        <motion.tr
                          key={txn.id}
                          component={TableRow}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                          sx={{
                            '&:hover': {
                              bgcolor: alpha(theme.palette.primary.main, 0.04),
                              cursor: 'pointer',
                            },
                            '&:not(:last-child)': {
                              borderBottom: `1px solid ${alpha(theme.palette.divider, 0.05)}`,
                            }
                          }}
                          onClick={() => setSelectedTxn(txn.id)}
                        >
                          <TableCell sx={{ py: 1.75 }}>
                            <Typography 
                              variant="body2" 
                              fontWeight={600}
                              sx={{ fontSize: '0.8125rem' }}
                            >
                              {txn.id}
                            </Typography>
                          </TableCell>
                          <TableCell sx={{ py: 1.75 }}>
                            <Box display="flex" alignItems="center" gap={1.25}>
                              {getTypeIcon(txn.type)}
                              <Typography 
                                variant="body2" 
                                sx={{ 
                                  textTransform: 'capitalize',
                                  fontSize: '0.8125rem',
                                  fontWeight: 500
                                }}
                              >
                                {txn.type}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell sx={{ py: 1.75 }}>
                            <Typography 
                              variant="body2" 
                              fontWeight={700}
                              color={txn.type === 'deposit' ? 'success.main' : 'text.primary'}
                              sx={{ fontSize: '0.875rem', mb: 0.25 }}
                            >
                              {txn.type === 'deposit' ? '+' : '-'}{formatCurrency(txn.amount)}
                            </Typography>
                            <Typography 
                              variant="caption" 
                              color="text.secondary"
                              sx={{ fontSize: '0.7rem' }}
                            >
                              Fee: {formatCurrency(txn.fee)}
                            </Typography>
                          </TableCell>
                          <TableCell sx={{ py: 1.75 }}>
                            <Chip 
                              label={txn.status} 
                              size="small" 
                              color={getStatusColor(txn.status) as any}
                              sx={{ 
                                textTransform: 'capitalize',
                                fontSize: '0.7rem',
                                height: 24,
                                fontWeight: 500
                              }}
                            />
                          </TableCell>
                          <TableCell sx={{ py: 1.75 }}>
                            <Typography 
                              variant="body2"
                              sx={{ fontSize: '0.8125rem' }}
                            >
                              {formatDate(txn.timestamp)}
                            </Typography>
                          </TableCell>
                          <TableCell sx={{ py: 1.75 }}>
                            <Typography 
                              variant="body2" 
                              color="text.secondary" 
                              noWrap 
                              sx={{ 
                                maxWidth: { xs: 150, sm: 200, md: 250 },
                                fontSize: '0.8125rem'
                              }}
                            >
                              {txn.description}
                            </Typography>
                          </TableCell>
                          <TableCell align="right" sx={{ py: 1.75 }}>
                            <IconButton 
                              size="small"
                              sx={{ 
                                '&:hover': {
                                  bgcolor: alpha(theme.palette.action.hover, 0.8)
                                }
                              }}
                            >
                              <MoreVert sx={{ fontSize: 20 }} />
                            </IconButton>
                          </TableCell>
                        </motion.tr>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Card>
            </motion.div>
          </Container>
        </Box>
      </Box>

      {/* Floating Help Button */}
      <Box sx={{ position: 'fixed', bottom: { xs: 16, sm: 24 }, right: { xs: 16, sm: 24 }, zIndex: 1000 }}>
        <Tooltip title="Need Help?" placement="left">
          <IconButton
            sx={{
              width: { xs: 48, sm: 56 },
              height: { xs: 48, sm: 56 },
              bgcolor: 'primary.main',
              color: 'white',
              '&:hover': { 
                bgcolor: 'primary.dark', 
                transform: 'scale(1.05)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
              },
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              transition: 'all 0.3s',
            }}
            onClick={() => router.push('/user-dashboard/help')}
          >
            <Help sx={{ fontSize: { xs: 22, sm: 24 } }} />
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
    role: 'buyer' as const,
    kycLevel: 'premium' as const,
  };

  return {
    props: {
      user,
    },
  };
};

export default UserTransactions;
