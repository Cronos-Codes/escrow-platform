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
  LinearProgress,
  Tab,
  Tabs,
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
  Person,
  Refresh,
  Visibility,
  VisibilityOff,
  Add,
  Remove,
  SwapHoriz,
  TrendingUp,
  TrendingDown,
  AttachMoney,
  AccountBalanceWallet,
  CurrencyBitcoin,
  Diamond,
} from '@mui/icons-material';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  LineChart,
  Line,
} from 'recharts';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';

const drawerWidth = 280;

// Mock wallet data
const walletBalances = {
  total: 152500,
  crypto: 75000,
  fiat: 65000,
  gold: 12500,
  available: 140000,
  locked: 12500,
};

const balanceHistory = [
  { date: 'Jan 1', balance: 120000 },
  { date: 'Jan 5', balance: 125000 },
  { date: 'Jan 10', balance: 130000 },
  { date: 'Jan 15', balance: 135000 },
  { date: 'Jan 20', balance: 145000 },
  { date: 'Jan 25', balance: 150000 },
  { date: 'Jan 30', balance: 152500 },
];

const recentActivity = [
  { type: 'deposit', amount: 25000, date: '2 hours ago', status: 'completed', description: 'Bank Transfer' },
  { type: 'withdrawal', amount: 10000, date: '1 day ago', status: 'completed', description: 'To Bank Account' },
  { type: 'transfer', amount: 5000, date: '2 days ago', status: 'completed', description: 'To Escrow #1234' },
  { type: 'deposit', amount: 15000, date: '3 days ago', status: 'completed', description: 'Crypto Deposit' },
  { type: 'withdrawal', amount: 8000, date: '5 days ago', status: 'pending', description: 'Withdrawal Request' },
  { type: 'transfer', amount: 3500, date: '1 week ago', status: 'completed', description: 'To Escrow #1189' },
];

interface UserWalletProps {
  user: {
    name: string;
    email: string;
    role: 'buyer' | 'seller';
    kycLevel: 'basic' | 'verified' | 'premium';
  };
}

const UserWallet: React.FC<UserWalletProps> = ({ user }) => {
  const theme = useTheme();
  const router = useRouter();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuAnchor, setUserMenuAnchor] = useState<null | HTMLElement>(null);
  const [showBalance, setShowBalance] = useState(true);

  const handleDeposit = () => {
    router.push('/user-dashboard/wallet/deposit');
  };

  const handleWithdraw = () => {
    router.push('/user-dashboard/wallet/withdraw');
  };

  const handleTransfer = () => {
    router.push('/user-dashboard/wallet/transfer');
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'deposit':
        return <Add />;
      case 'withdrawal':
        return <Remove />;
      case 'transfer':
        return <SwapHoriz />;
      default:
        return <Timeline />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'deposit':
        return '#4CAF50';
      case 'withdrawal':
        return '#F44336';
      case 'transfer':
        return '#2196F3';
      default:
        return '#9E9E9E';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'failed':
        return 'error';
      default:
        return 'default';
    }
  };

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/user-dashboard' },
    { text: 'My Escrows', icon: <Security />, path: '/user-dashboard/escrows' },
    { text: 'Transactions', icon: <Timeline />, path: '/user-dashboard/transactions' },
    { text: 'Wallet', icon: <AccountBalance />, path: '/user-dashboard/wallet', active: true },
    { text: 'Disputes', icon: <Gavel />, path: '/user-dashboard/disputes' },
    { text: 'Reports', icon: <Receipt />, path: '/user-dashboard/reports' },
    { text: 'Profile', icon: <Person />, path: '/user-dashboard/profile' },
    { text: 'Notifications', icon: <Notifications />, path: '/user-dashboard/notifications' },
  ];

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);

  const formatCurrency = (amount: number) => {
    if (!showBalance) return '••••••';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
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
              selected={item.active}
              onClick={() => router.push(item.path)}
              sx={{
                borderRadius: 2,
                '&.Mui-selected': {
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.15) },
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 40, color: item.active ? 'primary.main' : 'inherit' }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.text}
                primaryTypographyProps={{
                  fontWeight: item.active ? 600 : 400,
                  color: item.active ? 'primary.main' : 'text.primary',
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <Divider sx={{ my: 2 }} />

      <List sx={{ px: 2 }}>
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
        <title>Wallet - Gold Escrow</title>
        <meta name="description" content="Manage your wallet and balances" />
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
              Wallet
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Tooltip title={showBalance ? 'Hide Balance' : 'Show Balance'}>
                <IconButton onClick={() => setShowBalance(!showBalance)} size="small">
                  {showBalance ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </Tooltip>

              <Tooltip title="Refresh">
                <IconButton size="small">
                  <Refresh />
                </IconButton>
              </Tooltip>

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
          
          <Container maxWidth="xl" sx={{ py: { xs: 2, sm: 3, md: 4 }, px: { xs: 2, sm: 3 } }}>
            {/* Total Balance Card */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card 
                sx={{ 
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  mb: { xs: 3, sm: 4 },
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'all 0.3s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 6,
                  },
                }}
              >
                <Box
                  sx={{
                    position: 'absolute',
                    top: -50,
                    right: -50,
                    width: 200,
                    height: 200,
                    borderRadius: '50%',
                    bgcolor: 'rgba(255,255,255,0.1)',
                  }}
                />
                <CardContent sx={{ p: { xs: 3, sm: 4 }, position: 'relative', zIndex: 1 }}>
                  <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                    Total Balance
                  </Typography>
                  <Typography variant="h3" fontWeight="bold" gutterBottom>
                    {formatCurrency(walletBalances.total)}
                  </Typography>
                  <Box display="flex" alignItems="center" gap={1} mb={3}>
                    <TrendingUp />
                    <Typography variant="body2">
                      +12.5% from last month
                    </Typography>
                  </Box>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={4}>
                      <Button
                        fullWidth
                        variant="contained"
                        startIcon={<Add />}
                        onClick={handleDeposit}
                        sx={{ 
                          bgcolor: 'rgba(255,255,255,0.2)', 
                          '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' },
                        }}
                      >
                        Deposit
                      </Button>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Button
                        fullWidth
                        variant="contained"
                        startIcon={<Remove />}
                        onClick={handleWithdraw}
                        sx={{ 
                          bgcolor: 'rgba(255,255,255,0.2)', 
                          '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' },
                        }}
                      >
                        Withdraw
                      </Button>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Button
                        fullWidth
                        variant="contained"
                        startIcon={<SwapHoriz />}
                        onClick={handleTransfer}
                        sx={{ 
                          bgcolor: 'rgba(255,255,255,0.2)', 
                          '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' },
                        }}
                      >
                        Transfer
                      </Button>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </motion.div>

            {/* Balance Breakdown */}
            <Grid container spacing={{ xs: 2, sm: 3 }} mb={{ xs: 3, sm: 4 }}>
              {[
                { title: 'Crypto Balance', value: walletBalances.crypto, icon: <CurrencyBitcoin />, color: '#FF9800', percentage: 49 },
                { title: 'Fiat Balance', value: walletBalances.fiat, icon: <AttachMoney />, color: '#4CAF50', percentage: 43 },
                { title: 'Gold Value', value: walletBalances.gold, icon: <Diamond />, color: '#FFD700', percentage: 8 },
              ].map((item, index) => (
                <Grid item xs={12} sm={6} md={4} key={item.title}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <Card
                      sx={{
                        height: '100%',
                        transition: 'all 0.3s',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: 4,
                        },
                      }}
                    >
                      <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                        <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
                          <Box>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                              {item.title}
                            </Typography>
                            <Typography variant="h5" fontWeight="bold">
                              {formatCurrency(item.value)}
                            </Typography>
                          </Box>
                          <Avatar sx={{ bgcolor: alpha(item.color, 0.1), color: item.color }}>
                            {item.icon}
                          </Avatar>
                        </Box>
                        <Box>
                          <Box display="flex" justifyContent="space-between" mb={0.5}>
                            <Typography variant="caption" color="text.secondary">
                              {item.percentage}% of total
                            </Typography>
                          </Box>
                          <LinearProgress 
                            variant="determinate" 
                            value={item.percentage} 
                            sx={{ 
                              height: 6, 
                              borderRadius: 3,
                              bgcolor: alpha(item.color, 0.1),
                              '& .MuiLinearProgress-bar': {
                                bgcolor: item.color,
                              },
                            }}
                          />
                        </Box>
                      </CardContent>
                    </Card>
                  </motion.div>
                </Grid>
              ))}
            </Grid>

            {/* Available vs Locked Balance */}
            <Grid container spacing={{ xs: 2, sm: 3 }} mb={{ xs: 3, sm: 4 }}>
              <Grid item xs={12} sm={6}>
                <Card
                  sx={{
                    background: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)',
                    color: 'white',
                    transition: 'all 0.3s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 4,
                    },
                  }}
                >
                  <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                    <Box display="flex" alignItems="center" gap={2} mb={2}>
                      <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 48, height: 48 }}>
                        <AccountBalanceWallet />
                      </Avatar>
                      <Box>
                        <Typography variant="body2" sx={{ opacity: 0.9 }}>
                          Available Balance
                        </Typography>
                        <Typography variant="h4" fontWeight="bold">
                          {formatCurrency(walletBalances.available)}
                        </Typography>
                      </Box>
                    </Box>
                    <Typography variant="caption" sx={{ opacity: 0.8 }}>
                      Ready to use for transactions
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Card
                  sx={{
                    background: 'linear-gradient(135deg, #FF9800 0%, #F57C00 100%)',
                    color: 'white',
                    transition: 'all 0.3s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 4,
                    },
                  }}
                >
                  <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                    <Box display="flex" alignItems="center" gap={2} mb={2}>
                      <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 48, height: 48 }}>
                        <Security />
                      </Avatar>
                      <Box>
                        <Typography variant="body2" sx={{ opacity: 0.9 }}>
                          Locked in Escrow
                        </Typography>
                        <Typography variant="h4" fontWeight="bold">
                          {formatCurrency(walletBalances.locked)}
                        </Typography>
                      </Box>
                    </Box>
                    <Typography variant="caption" sx={{ opacity: 0.8 }}>
                      Funds held in active escrows
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Balance History Chart */}
            <Grid container spacing={{ xs: 2, sm: 2, md: 3 }} mb={{ xs: 3, sm: 4 }}>
              <Grid item xs={12}>
                <Card>
                  <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                    <Typography variant="h6" fontWeight="semibold" gutterBottom>
                      Balance History
                    </Typography>
                    <Box sx={{ width: '100%', height: { xs: 250, sm: 280, md: 300 }, mt: 1 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart 
                          data={balanceHistory}
                          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                        >
                          <defs>
                            <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#667eea" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#667eea" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                          <XAxis 
                            dataKey="date" 
                            stroke="#666" 
                            style={{ fontSize: '12px' }}
                            tick={{ fill: '#666' }}
                          />
                          <YAxis 
                            stroke="#666" 
                            style={{ fontSize: '12px' }}
                            tick={{ fill: '#666' }}
                            tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                          />
                          <RechartsTooltip 
                            contentStyle={{ 
                              backgroundColor: 'white', 
                              border: '1px solid #e0e0e0',
                              borderRadius: 8,
                              padding: '8px 12px',
                            }}
                            formatter={(value: any) => [`$${value.toLocaleString()}`, 'Balance']}
                          />
                          <Area 
                            type="monotone" 
                            dataKey="balance" 
                            stroke="#667eea" 
                            strokeWidth={2}
                            fillOpacity={1} 
                            fill="url(#colorBalance)" 
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Recent Activity */}
            <Grid container spacing={{ xs: 2, sm: 2, md: 3 }}>
              <Grid item xs={12}>
                <Card>
                  <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                    <Typography variant="h6" fontWeight="semibold" gutterBottom>
                      Recent Activity
                    </Typography>
                    <Box sx={{ mt: 2 }}>
                      <List sx={{ py: 0 }}>
                        {recentActivity.map((activity, index) => (
                          <ListItem 
                            key={index}
                            sx={{
                              px: 0,
                              py: 2,
                              borderBottom: index < recentActivity.length - 1 ? '1px solid #f0f0f0' : 'none',
                            }}
                          >
                            <ListItemIcon sx={{ minWidth: 40 }}>
                              <Avatar 
                                sx={{ 
                                  width: 40, 
                                  height: 40,
                                  bgcolor: alpha(getActivityColor(activity.type), 0.1),
                                  color: getActivityColor(activity.type),
                                }}
                              >
                                {getActivityIcon(activity.type)}
                              </Avatar>
                            </ListItemIcon>
                            <ListItemText
                              primary={
                                <Box display="flex" alignItems="center" gap={1}>
                                  <Typography variant="body2" fontWeight="600">
                                    {activity.type === 'deposit' ? '+' : activity.type === 'withdrawal' ? '-' : ''}{formatCurrency(activity.amount)}
                                  </Typography>
                                  <Chip 
                                    label={activity.status} 
                                    size="small" 
                                    color={getStatusColor(activity.status) as any}
                                    sx={{ height: 20, fontSize: '0.7rem', textTransform: 'capitalize' }}
                                  />
                                </Box>
                              }
                              secondary={
                                <Box>
                                  <Typography variant="caption" color="text.secondary" display="block">
                                    {activity.description}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    {activity.date}
                                  </Typography>
                                </Box>
                              }
                            />
                          </ListItem>
                        ))}
                      </List>
                    </Box>
                    <Box sx={{ pt: 2, borderTop: '1px solid #f0f0f0', mt: 2 }}>
                      <Button fullWidth variant="text" size="small">
                        View All Activity
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Container>
        </Box>
      </Box>

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
    role: 'buyer' as const,
    kycLevel: 'premium' as const,
  };

  return {
    props: {
      user,
    },
  };
};

export default UserWallet;
