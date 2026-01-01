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
  Stack,
  Button,
  Avatar,
  Chip,
  LinearProgress,
  IconButton,
  Tooltip,
  alpha,
  useTheme,
  useMediaQuery,
  Paper,
  Divider,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  ListItemAvatar,
  ListItemSecondaryAction,
  Badge,
  CircularProgress,
  Skeleton,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Menu,
} from '@mui/material';

const drawerWidth = 280;
import {
  TrendingUp,
  TrendingDown,
  AccountBalance,
  Security,
  Warning,
  CheckCircle,
  Error,
  Info,
  MoreVert,
  Download,
  Refresh,
  Visibility,
  VisibilityOff,
  ArrowForward,
  ArrowUpward,
  ArrowDownward,
  Circle,
  AttachMoney,
  People,
  Business,
  Speed,
  Timeline,
  Assessment,
  Analytics,
  Dashboard as DashboardIcon,
  Notifications,
  Settings as SettingsIcon,
  Add,
  Send,
  Receipt,
  Lock,
  LockOpen,
  Gavel,
  Shield,
  Star,
  StarBorder,
  FilterList,
  Search,
  Diamond,
  LocalShipping,
  Verified,
  Flag,
  Menu as MenuIcon,
  ChevronLeft,
  Help,
  ExitToApp,
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
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  BarChart,
  Bar,
} from 'recharts';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';

// Mock escrow data
const mockEscrowDeals = [
  {
    id: 'ESC-2024-001',
    title: 'Premium Gold Bars - 1kg Investment Grade',
    description: 'High-purity gold bars from certified refinery, perfect for investment portfolio',
    amount: 75000,
    currency: 'USD',
    status: 'active',
    stage: 'inspection',
    buyer: {
      id: 'buyer-001',
      name: 'John Smith',
      email: 'john.smith@email.com',
      rating: 4.8,
      verified: true
    },
    seller: {
      id: 'seller-001',
      name: 'Gold Investment Corp',
      email: 'sales@goldinvestment.com',
      rating: 4.9,
      verified: true
    },
    goldDetails: {
      type: 'Investment Gold Bars',
      weight: 1000,
      purity: 99.99,
      form: 'Bullion Bars',
      certification: 'LBMA Certified',
    },
    timeline: [
      { date: '2024-01-15T10:00:00Z', action: 'Deal Initiated', description: 'Escrow deal created and terms agreed', status: 'completed' },
      { date: '2024-01-15T14:30:00Z', action: 'Funds Deposited', description: 'Buyer deposited $75,000 to escrow', status: 'completed' },
      { date: '2024-01-16T09:00:00Z', action: 'Gold Shipped', description: 'Seller shipped gold with tracking', status: 'completed' },
      { date: '2024-01-18T11:00:00Z', action: 'Inspection Period', description: 'Buyer inspecting received gold', status: 'pending' },
      { date: '2024-01-20T17:00:00Z', action: 'Completion', description: 'Deal completion and fund release', status: 'upcoming' }
    ],
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-18T11:00:00Z',
    deadline: '2024-01-20T17:00:00Z',
    riskScore: 15,
    location: {
      country: 'United States',
      city: 'New York'
    }
  },
  {
    id: 'ESC-2024-002',
    title: 'Vintage Gold Coins Collection - Rare Set',
    description: 'Authentic vintage gold coins from 1800s, certified and appraised',
    amount: 45000,
    currency: 'USD',
    status: 'pending',
    stage: 'initiated',
    buyer: {
      id: 'buyer-002',
      name: 'Sarah Johnson',
      email: 'sarah.johnson@email.com',
      rating: 4.5,
      verified: true
    },
    seller: {
      id: 'seller-002',
      name: 'Heritage Coins LLC',
      email: 'info@heritagecoins.com',
      rating: 4.7,
      verified: true
    },
    goldDetails: {
      type: 'Vintage Gold Coins',
      weight: 500,
      purity: 90.0,
      form: 'Coin Collection',
      certification: 'NGC Certified',
    },
    timeline: [
      { date: '2024-01-17T15:00:00Z', action: 'Deal Initiated', description: 'Escrow deal created and terms agreed', status: 'completed' },
      { date: '2024-01-18T10:00:00Z', action: 'Funds Deposited', description: 'Buyer to deposit $45,000 to escrow', status: 'upcoming' },
      { date: '2024-01-19T09:00:00Z', action: 'Gold Shipped', description: 'Seller to ship coins with tracking', status: 'upcoming' },
      { date: '2024-01-21T11:00:00Z', action: 'Inspection Period', description: 'Buyer to inspect received coins', status: 'upcoming' },
      { date: '2024-01-23T17:00:00Z', action: 'Completion', description: 'Deal completion and fund release', status: 'upcoming' }
    ],
    createdAt: '2024-01-17T15:00:00Z',
    updatedAt: '2024-01-17T15:00:00Z',
    deadline: '2024-01-23T17:00:00Z',
    riskScore: 25,
    location: {
      country: 'United Kingdom',
      city: 'London'
    }
  }
];

interface UserEscrowsProps {
  user: {
    name: string;
    email: string;
    role: 'buyer' | 'seller';
    kycLevel: 'basic' | 'verified' | 'premium';
  };
}

const UserEscrows: React.FC<UserEscrowsProps> = ({ user }) => {
  const theme = useTheme();
  const router = useRouter();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [escrowDeals, setEscrowDeals] = useState(mockEscrowDeals);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [stageFilter, setStageFilter] = useState('all');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuAnchor, setUserMenuAnchor] = useState<null | HTMLElement>(null);

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/user-dashboard' },
    { text: 'My Escrows', icon: <Security />, path: '/user-dashboard/escrows', active: true },
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

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'pending': return 'warning';
      case 'completed': return 'info';
      case 'disputed': return 'error';
      case 'cancelled': return 'default';
      default: return 'default';
    }
  };

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'initiated': return 'primary';
      case 'funded': return 'success';
      case 'inspection': return 'warning';
      case 'delivery': return 'info';
      case 'completion': return 'secondary';
      case 'released': return 'success';
      default: return 'default';
    }
  };

  const getRiskLevel = (score: number) => {
    if (score <= 15) return { level: 'Low', color: 'success' };
    if (score <= 30) return { level: 'Medium', color: 'warning' };
    return { level: 'High', color: 'error' };
  };

  const filteredDeals = escrowDeals.filter(deal => {
    const matchesSearch = deal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         deal.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || deal.status === statusFilter;
    const matchesStage = stageFilter === 'all' || deal.stage === stageFilter;
    return matchesSearch && matchesStatus && matchesStage;
  });

  const stats = {
    totalDeals: escrowDeals.length,
    activeDeals: escrowDeals.filter(d => d.status === 'active').length,
    completedDeals: escrowDeals.filter(d => d.status === 'completed').length,
    disputedDeals: escrowDeals.filter(d => d.status === 'disputed').length,
    totalValue: escrowDeals.reduce((sum, deal) => sum + deal.amount, 0),
  };

  // Sidebar drawer content
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
                  '&:hover': {
                    bgcolor: alpha(theme.palette.primary.main, 0.15),
                  },
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
        <title>My Escrows - Gold Escrow</title>
        <meta name="description" content="Manage your gold escrow transactions and deals" />
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
              My Escrows
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Tooltip title="Refresh">
                <IconButton onClick={() => setIsLoading(true)} disabled={isLoading} size="small">
                  <Refresh className={isLoading ? 'animate-spin' : ''} />
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
          <Toolbar /> {/* Spacer for AppBar */}
          
          <Container maxWidth="xl" sx={{ py: { xs: 2, sm: 3, md: 4 }, px: { xs: 2, sm: 3 } }}>
            {/* Header Section */}
            <Box className="mb-8">
              <Box className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
                <Box>
                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <Typography variant="h4" className="font-bold text-gray-900">
                      My Escrow Deals
                    </Typography>
                    {user.kycLevel === 'premium' && (
                      <Tooltip title="KYC Verified - All checks complete">
                        <Chip
                          icon={<CheckCircle sx={{ fontSize: 18 }} />}
                          label="Verified"
                          size="small"
                          color="success"
                          sx={{ fontWeight: 600 }}
                        />
                      </Tooltip>
                    )}
                  </Box>
                  <Typography variant="body1" className="text-gray-600">
                    Manage your gold trading escrow transactions
                  </Typography>
                </Box>
                
                <Box className="flex items-center space-x-4 mt-4 lg:mt-0">
                  <Button
                    variant="contained"
                    startIcon={<Add />}
                    className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-xl shadow-lg"
                  >
                    New Deal
                  </Button>
                  
                  <IconButton onClick={() => setIsLoading(true)}>
                    <Refresh className={isLoading ? 'animate-spin' : ''} />
                  </IconButton>
                </Box>
              </Box>

              {/* Statistics Cards */}
              <Grid container spacing={{ xs: 2, sm: 3 }} mb={{ xs: 3, sm: 4 }}>
                {[
                  { title: 'Total Deals', value: stats.totalDeals, icon: <Business />, color: '#2196F3', trend: '+12%' },
                  { title: 'Active Deals', value: stats.activeDeals, icon: <Security />, color: '#4CAF50', trend: '+5%' },
                  { title: 'Completed', value: stats.completedDeals, icon: <CheckCircle />, color: '#9C27B0', trend: '+8%' },
                  { title: 'Total Value', value: formatCurrency(stats.totalValue), icon: <AttachMoney />, color: '#FF9800', trend: '+15%' }
                ].map((stat, index) => (
                  <Grid item xs={12} sm={6} lg={3} key={stat.title}>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
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
                                {stat.title}
                              </Typography>
                              <Typography variant="h5" fontWeight="bold">
                                {stat.value}
                              </Typography>
                            </Box>
                            <Avatar 
                              sx={{ 
                                bgcolor: alpha(stat.color, 0.1), 
                                color: stat.color,
                                width: { xs: 40, sm: 48 },
                                height: { xs: 40, sm: 48 },
                              }}
                            >
                              {stat.icon}
                            </Avatar>
                          </Box>
                          <Box display="flex" alignItems="center" gap={0.5}>
                            <TrendingUp sx={{ fontSize: 16, color: 'success.main' }} />
                            <Typography variant="caption" color="success.main" fontWeight="medium">
                              {stat.trend}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              vs last month
                            </Typography>
                          </Box>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </Grid>
                ))}
              </Grid>

              {/* Filters */}
              <Card className="mb-6">
                <CardContent className="p-6">
                  <Box className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
                    <TextField
                      fullWidth
                      placeholder="Search deals..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      InputProps={{
                        startAdornment: <Search className="mr-2" />
                      }}
                    />
                    
                    <FormControl className="min-w-[150px]">
                      <InputLabel>Status</InputLabel>
                      <Select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                      >
                        <MenuItem value="all">All Status</MenuItem>
                        <MenuItem value="pending">Pending</MenuItem>
                        <MenuItem value="active">Active</MenuItem>
                        <MenuItem value="completed">Completed</MenuItem>
                        <MenuItem value="disputed">Disputed</MenuItem>
                        <MenuItem value="cancelled">Cancelled</MenuItem>
                      </Select>
                    </FormControl>
                    
                    <FormControl className="min-w-[150px]">
                      <InputLabel>Stage</InputLabel>
                      <Select
                        value={stageFilter}
                        onChange={(e) => setStageFilter(e.target.value)}
                      >
                        <MenuItem value="all">All Stages</MenuItem>
                        <MenuItem value="initiated">Initiated</MenuItem>
                        <MenuItem value="funded">Funded</MenuItem>
                        <MenuItem value="inspection">Inspection</MenuItem>
                        <MenuItem value="delivery">Delivery</MenuItem>
                        <MenuItem value="completion">Completion</MenuItem>
                        <MenuItem value="released">Released</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>
                </CardContent>
              </Card>

              {/* Deals List */}
              <Box className="space-y-4">
                {filteredDeals.map((deal, index) => (
                  <motion.div
                    key={deal.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <Card className="hover:shadow-lg transition-shadow duration-300">
                      <CardContent className="p-6">
                        <Box className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
                          <Box className="flex-1">
                            <Box className="flex items-start justify-between mb-4">
                              <Box>
                                <Typography variant="h6" className="font-bold mb-2">
                                  {deal.title}
                                </Typography>
                                <Typography variant="body2" className="text-gray-600 mb-2">
                                  {deal.description}
                                </Typography>
                                <Box className="flex items-center space-x-2 mb-2">
                                  <Chip label={deal.id} size="small" variant="outlined" />
                                  <Chip 
                                    label={deal.status} 
                                    color={getStatusColor(deal.status) as any}
                                    size="small" 
                                  />
                                  <Chip 
                                    label={deal.stage} 
                                    color={getStageColor(deal.stage) as any}
                                    size="small" 
                                    variant="outlined"
                                  />
                                </Box>
                              </Box>
                              
                              <Box className="text-right">
                                <Typography variant="h5" className="font-bold text-amber-600">
                                  {formatCurrency(deal.amount)}
                                </Typography>
                                <Typography variant="body2" className="text-gray-500">
                                  Deadline: {formatDate(deal.deadline)}
                                </Typography>
                              </Box>
                            </Box>

                            {/* Gold Details */}
                            <Box className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                              <Box>
                                <Typography variant="body2" className="text-gray-600">
                                  Gold Type
                                </Typography>
                                <Typography variant="body1" className="font-medium">
                                  {deal.goldDetails.type}
                                </Typography>
                              </Box>
                              <Box>
                                <Typography variant="body2" className="text-gray-600">
                                  Weight
                                </Typography>
                                <Typography variant="body1" className="font-medium">
                                  {deal.goldDetails.weight}g
                                </Typography>
                              </Box>
                              <Box>
                                <Typography variant="body2" className="text-gray-600">
                                  Purity
                                </Typography>
                                <Typography variant="body1" className="font-medium">
                                  {deal.goldDetails.purity}%
                                </Typography>
                              </Box>
                              <Box>
                                <Typography variant="body2" className="text-gray-600">
                                  Risk Score
                                </Typography>
                                <Chip
                                  label={getRiskLevel(deal.riskScore).level}
                                  color={getRiskLevel(deal.riskScore).color as any}
                                  size="small"
                                />
                              </Box>
                            </Box>

                            {/* Timeline Preview */}
                            <Box className="mb-4">
                              <Typography variant="body2" className="text-gray-600 mb-2">
                                Progress Timeline
                              </Typography>
                              <Box className="flex items-center space-x-2">
                                {deal.timeline.map((step, stepIndex) => (
                                  <Tooltip key={stepIndex} title={`${step.action}: ${step.description}`}>
                                    <Box
                                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                        step.status === 'completed' 
                                          ? 'bg-green-500 text-white' 
                                          : step.status === 'pending'
                                          ? 'bg-yellow-500 text-white'
                                          : 'bg-gray-300 text-gray-600'
                                      }`}
                                    >
                                      {step.status === 'completed' ? (
                                        <CheckCircle className="w-4 h-4" />
                                      ) : step.status === 'pending' ? (
                                        <Security className="w-4 h-4" />
                                      ) : (
                                        <Circle className="w-4 h-4" />
                                      )}
                                    </Box>
                                  </Tooltip>
                                ))}
                              </Box>
                            </Box>

                            {/* Action Buttons */}
                            <Box className="flex flex-wrap gap-2">
                              <Button
                                size="small"
                                variant="outlined"
                                startIcon={<Timeline />}
                              >
                                View Timeline
                              </Button>
                              <Button
                                size="small"
                                variant="outlined"
                                startIcon={<Assessment />}
                              >
                                Documents
                              </Button>
                              <Button
                                size="small"
                                variant="outlined"
                                startIcon={<Send />}
                              >
                                Message
                              </Button>
                              {deal.status === 'active' && (
                                <Button
                                  size="small"
                                  variant="contained"
                                  color="success"
                                  startIcon={<CheckCircle />}
                                >
                                  Approve
                                </Button>
                              )}
                              {deal.status === 'active' && (
                                <Button
                                  size="small"
                                  variant="contained"
                                  color="error"
                                  startIcon={<Flag />}
                                >
                                  Dispute
                                </Button>
                              )}
                            </Box>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </Box>

              {/* Empty State */}
              {filteredDeals.length === 0 && (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Business className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <Typography variant="h6" className="text-gray-600 mb-2">
                      No deals found
                    </Typography>
                    <Typography variant="body2" className="text-gray-500 mb-4">
                      Try adjusting your search criteria or create a new deal
                    </Typography>
                    <Button
                      variant="contained"
                      startIcon={<Add />}
                      className="bg-amber-600 hover:bg-amber-700"
                    >
                      Create New Deal
                    </Button>
                  </CardContent>
                </Card>
              )}
            </Box>
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
              '&:hover': { bgcolor: 'primary.dark' },
              boxShadow: 3,
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

export default UserEscrows;



