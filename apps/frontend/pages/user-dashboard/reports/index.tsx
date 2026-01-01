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
  FormControl,
  InputLabel,
  Select,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
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
  PictureAsPdf,
  TableChart,
  Assessment,
  TrendingUp,
  TrendingDown,
  AttachMoney,
  ShowChart,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  DateRange,
  Folder,
  Description,
  CloudUpload,
  Visibility,
  Delete,
  Share,
  MoreVert,
  InsertDriveFile,
  Image,
  VideoLibrary,
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
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend,
  ComposedChart,
} from 'recharts';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';

const drawerWidth = 280;

// Mock report data
const monthlyPerformance = [
  { month: 'Jul', revenue: 45000, expenses: 12000, profit: 33000, deals: 12 },
  { month: 'Aug', revenue: 52000, expenses: 14000, profit: 38000, deals: 15 },
  { month: 'Sep', revenue: 48000, expenses: 13000, profit: 35000, deals: 14 },
  { month: 'Oct', revenue: 61000, expenses: 16000, profit: 45000, deals: 18 },
  { month: 'Nov', revenue: 58000, expenses: 15000, profit: 43000, deals: 16 },
  { month: 'Dec', revenue: 72000, expenses: 18000, profit: 54000, deals: 21 },
  { month: 'Jan', revenue: 85000, expenses: 20000, profit: 65000, deals: 24 },
];

const categoryBreakdown = [
  { category: 'Gold Bars', value: 45, amount: 125000, color: '#FFD700' },
  { category: 'Gold Coins', value: 30, amount: 85000, color: '#FFA500' },
  { category: 'Jewelry', value: 15, amount: 42000, color: '#FF6B6B' },
  { category: 'Bullion', value: 10, amount: 28000, color: '#4ECDC4' },
];

const topPerformers = [
  { name: 'Premium Gold Bars', deals: 45, revenue: 125000, growth: 18 },
  { name: 'Investment Coins', deals: 38, revenue: 98000, growth: 12 },
  { name: 'Certified Bullion', deals: 32, revenue: 87000, growth: 15 },
  { name: 'Rare Coins', deals: 28, revenue: 76000, growth: 8 },
  { name: 'Gold Jewelry', deals: 22, revenue: 54000, growth: -3 },
];

const recentReports = [
  { id: 'RPT-2024-001', name: 'Monthly Financial Summary', type: 'Financial', date: '2024-01-20', status: 'ready' },
  { id: 'RPT-2024-002', name: 'Transaction Analysis Q1', type: 'Transaction', date: '2024-01-18', status: 'ready' },
  { id: 'RPT-2024-003', name: 'Dispute Resolution Report', type: 'Dispute', date: '2024-01-15', status: 'ready' },
  { id: 'RPT-2024-004', name: 'Escrow Performance Metrics', type: 'Performance', date: '2024-01-12', status: 'generating' },
];

const userDocuments = [
  { id: 'DOC-001', name: 'KYC Verification Documents', type: 'PDF', size: '2.4 MB', uploadDate: '2024-01-15', category: 'Identity', status: 'verified' },
  { id: 'DOC-002', name: 'Gold Purchase Agreement ESC-001', type: 'PDF', size: '1.8 MB', uploadDate: '2024-01-18', category: 'Contract', status: 'active' },
  { id: 'DOC-003', name: 'Bank Statement - January 2024', type: 'PDF', size: '856 KB', uploadDate: '2024-01-20', category: 'Financial', status: 'verified' },
  { id: 'DOC-004', name: 'Gold Certification - Premium Bars', type: 'PDF', size: '3.2 MB', uploadDate: '2024-01-17', category: 'Certificate', status: 'verified' },
  { id: 'DOC-005', name: 'Proof of Address', type: 'Image', size: '1.2 MB', uploadDate: '2024-01-14', category: 'Identity', status: 'verified' },
  { id: 'DOC-006', name: 'Tax Documents 2023', type: 'PDF', size: '4.1 MB', uploadDate: '2024-01-10', category: 'Tax', status: 'archived' },
];

interface UserReportsProps {
  user: {
    name: string;
    email: string;
    role: 'buyer' | 'seller';
    kycLevel: 'basic' | 'verified' | 'premium';
  };
}

const UserReports: React.FC<UserReportsProps> = ({ user }) => {
  const theme = useTheme();
  const router = useRouter();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuAnchor, setUserMenuAnchor] = useState<null | HTMLElement>(null);
  const [reportPeriod, setReportPeriod] = useState('monthly');
  const [reportType, setReportType] = useState('all');
  const [activeTab, setActiveTab] = useState(0);
  const [documentFilter, setDocumentFilter] = useState('all');

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/user-dashboard' },
    { text: 'My Escrows', icon: <Security />, path: '/user-dashboard/escrows' },
    { text: 'Transactions', icon: <Timeline />, path: '/user-dashboard/transactions' },
    { text: 'Wallet', icon: <AccountBalance />, path: '/user-dashboard/wallet' },
    { text: 'Disputes', icon: <Gavel />, path: '/user-dashboard/disputes' },
    { text: 'Reports', icon: <Receipt />, path: '/user-dashboard/reports', active: true },
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
    });
  };

  const totalRevenue = monthlyPerformance.reduce((sum, m) => sum + m.revenue, 0);
  const totalProfit = monthlyPerformance.reduce((sum, m) => sum + m.profit, 0);
  const totalDeals = monthlyPerformance.reduce((sum, m) => sum + m.deals, 0);
  const avgDealValue = totalRevenue / totalDeals;

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
        <title>Reports - Gold Escrow</title>
        <meta name="description" content="View and generate reports" />
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
              Reports & Analytics
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Tooltip title="Refresh">
                <IconButton size="small">
                  <Refresh />
                </IconButton>
              </Tooltip>

              <Tooltip title="Export All">
                <IconButton size="small">
                  <Download />
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
            {/* Header */}
            <Box mb={4}>
              <Typography variant="h4" fontWeight="bold" gutterBottom>
                Reports & Documents
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Comprehensive insights and document management
              </Typography>
            </Box>

            {/* Tabs */}
            <Card sx={{ mb: 4 }}>
              <Tabs 
                value={activeTab} 
                onChange={(e, newValue) => setActiveTab(newValue)}
                sx={{ borderBottom: 1, borderColor: 'divider' }}
              >
                <Tab label="Analytics & Reports" icon={<Assessment />} iconPosition="start" />
                <Tab label="My Documents" icon={<Folder />} iconPosition="start" />
              </Tabs>
            </Card>

            {/* Tab Content - Analytics */}
            {activeTab === 0 && (
              <Box>

            {/* Period Selector */}
            <Card sx={{ mb: 4 }}>
              <CardContent>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} sm={6} md={3}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Period</InputLabel>
                      <Select
                        value={reportPeriod}
                        label="Period"
                        onChange={(e) => setReportPeriod(e.target.value)}
                      >
                        <MenuItem value="daily">Daily</MenuItem>
                        <MenuItem value="weekly">Weekly</MenuItem>
                        <MenuItem value="monthly">Monthly</MenuItem>
                        <MenuItem value="quarterly">Quarterly</MenuItem>
                        <MenuItem value="yearly">Yearly</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Report Type</InputLabel>
                      <Select
                        value={reportType}
                        label="Report Type"
                        onChange={(e) => setReportType(e.target.value)}
                      >
                        <MenuItem value="all">All Reports</MenuItem>
                        <MenuItem value="financial">Financial</MenuItem>
                        <MenuItem value="transaction">Transaction</MenuItem>
                        <MenuItem value="performance">Performance</MenuItem>
                        <MenuItem value="dispute">Dispute</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<PictureAsPdf />}
                      color="error"
                    >
                      Export PDF
                    </Button>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<TableChart />}
                      color="success"
                    >
                      Export Excel
                    </Button>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Key Metrics */}
            <Grid container spacing={3} mb={4}>
              {[
                { title: 'Total Revenue', value: formatCurrency(totalRevenue), icon: <AttachMoney />, color: '#4CAF50', trend: '+22%' },
                { title: 'Total Profit', value: formatCurrency(totalProfit), icon: <TrendingUp />, color: '#2196F3', trend: '+18%' },
                { title: 'Total Deals', value: totalDeals, icon: <Assessment />, color: '#FF9800', trend: '+15%' },
                { title: 'Avg Deal Value', value: formatCurrency(avgDealValue), icon: <ShowChart />, color: '#9C27B0', trend: '+8%' },
              ].map((metric, index) => (
                <Grid item xs={12} sm={6} lg={3} key={metric.title}>
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
                      <CardContent>
                        <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
                          <Box>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                              {metric.title}
                            </Typography>
                            <Typography variant="h5" fontWeight="bold">
                              {metric.value}
                            </Typography>
                          </Box>
                          <Avatar sx={{ bgcolor: alpha(metric.color, 0.1), color: metric.color }}>
                            {metric.icon}
                          </Avatar>
                        </Box>
                        <Box display="flex" alignItems="center" gap={0.5}>
                          <TrendingUp sx={{ fontSize: 16, color: 'success.main' }} />
                          <Typography variant="caption" color="success.main" fontWeight="medium">
                            {metric.trend}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            vs last period
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </motion.div>
                </Grid>
              ))}
            </Grid>

            {/* Charts Section */}
            <Grid container spacing={3} mb={4}>
              {/* Revenue vs Profit Chart */}
              <Grid item xs={12} lg={8}>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <Card>
                    <CardContent>
                      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                        <Typography variant="h6" fontWeight="semibold">
                          Revenue & Profit Analysis
                        </Typography>
                        <Chip icon={<BarChartIcon />} label="7 Months" size="small" />
                      </Box>
                      <Box sx={{ width: '100%', height: 350, mt: 2 }}>
                        <ResponsiveContainer>
                          <ComposedChart data={monthlyPerformance}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis dataKey="month" stroke="#666" />
                            <YAxis stroke="#666" />
                            <RechartsTooltip 
                              contentStyle={{ 
                                backgroundColor: 'white', 
                                border: '1px solid #e0e0e0',
                                borderRadius: 8,
                              }}
                            />
                            <Legend />
                            <Bar dataKey="revenue" fill="#4CAF50" radius={[8, 8, 0, 0]} />
                            <Bar dataKey="expenses" fill="#F44336" radius={[8, 8, 0, 0]} />
                            <Line type="monotone" dataKey="profit" stroke="#2196F3" strokeWidth={3} />
                          </ComposedChart>
                        </ResponsiveContainer>
                      </Box>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>

              {/* Category Breakdown */}
              <Grid item xs={12} lg={4}>
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <Card sx={{ height: '100%' }}>
                    <CardContent>
                      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                        <Typography variant="h6" fontWeight="semibold">
                          Category Breakdown
                        </Typography>
                        <Chip icon={<PieChartIcon />} label="By Value" size="small" />
                      </Box>
                      <Box sx={{ width: '100%', height: 250 }}>
                        <ResponsiveContainer>
                          <PieChart>
                            <Pie
                              data={categoryBreakdown}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={90}
                              paddingAngle={5}
                              dataKey="value"
                            >
                              {categoryBreakdown.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <RechartsTooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      </Box>
                      <Box mt={2}>
                        {categoryBreakdown.map((item) => (
                          <Box key={item.category} display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                            <Box display="flex" alignItems="center" gap={1}>
                              <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: item.color }} />
                              <Typography variant="body2">{item.category}</Typography>
                            </Box>
                            <Typography variant="body2" fontWeight="medium">
                              {formatCurrency(item.amount)}
                            </Typography>
                          </Box>
                        ))}
                      </Box>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            </Grid>

            {/* Top Performers Table */}
            <Grid container spacing={3} mb={4}>
              <Grid item xs={12}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <Card>
                    <CardContent>
                      <Typography variant="h6" fontWeight="semibold" gutterBottom>
                        Top Performing Products
                      </Typography>
                      <TableContainer>
                        <Table>
                          <TableHead>
                            <TableRow>
                              <TableCell>Product Name</TableCell>
                              <TableCell align="right">Deals</TableCell>
                              <TableCell align="right">Revenue</TableCell>
                              <TableCell align="right">Growth</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {topPerformers.map((product, index) => (
                              <TableRow 
                                key={product.name}
                                sx={{
                                  '&:hover': {
                                    bgcolor: alpha(theme.palette.primary.main, 0.05),
                                  },
                                }}
                              >
                                <TableCell>
                                  <Box display="flex" alignItems="center" gap={1}>
                                    <Chip 
                                      label={index + 1} 
                                      size="small" 
                                      sx={{ 
                                        width: 28,
                                        height: 28,
                                        bgcolor: index < 3 ? alpha('#FFD700', 0.2) : alpha('#9E9E9E', 0.1),
                                        color: index < 3 ? '#B8860B' : '#666',
                                        fontWeight: 'bold',
                                      }}
                                    />
                                    <Typography variant="body2" fontWeight="medium">
                                      {product.name}
                                    </Typography>
                                  </Box>
                                </TableCell>
                                <TableCell align="right">
                                  <Typography variant="body2" fontWeight="medium">
                                    {product.deals}
                                  </Typography>
                                </TableCell>
                                <TableCell align="right">
                                  <Typography variant="body2" fontWeight="bold" color="success.main">
                                    {formatCurrency(product.revenue)}
                                  </Typography>
                                </TableCell>
                                <TableCell align="right">
                                  <Box display="flex" alignItems="center" justifyContent="flex-end" gap={0.5}>
                                    {product.growth >= 0 ? (
                                      <TrendingUp sx={{ fontSize: 16, color: 'success.main' }} />
                                    ) : (
                                      <TrendingDown sx={{ fontSize: 16, color: 'error.main' }} />
                                    )}
                                    <Typography 
                                      variant="body2" 
                                      fontWeight="medium"
                                      color={product.growth >= 0 ? 'success.main' : 'error.main'}
                                    >
                                      {product.growth > 0 ? '+' : ''}{product.growth}%
                                    </Typography>
                                  </Box>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            </Grid>

            {/* Recent Reports */}
            <Grid container spacing={{ xs: 2, sm: 3 }}>
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                      <Typography variant="h6" fontWeight="semibold">
                        Recent Reports
                      </Typography>
                      <Button variant="contained" startIcon={<Assessment />}>
                        Generate New Report
                      </Button>
                    </Box>
                    <Grid container spacing={2}>
                      {recentReports.map((report, index) => (
                        <Grid item xs={12} sm={6} lg={3} key={report.id}>
                          <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.3, delay: index * 0.1 }}
                          >
                            <Card 
                              sx={{ 
                                transition: 'all 0.3s',
                                cursor: 'pointer',
                                '&:hover': { 
                                  transform: 'translateY(-4px)',
                                  boxShadow: 4,
                                },
                              }}
                            >
                              <CardContent>
                                <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
                                  <Receipt sx={{ fontSize: 32, color: 'primary.main' }} />
                                  <Chip 
                                    label={report.status} 
                                    size="small" 
                                    color={report.status === 'ready' ? 'success' : 'warning'}
                                    sx={{ textTransform: 'capitalize' }}
                                  />
                                </Box>
                                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                                  {report.name}
                                </Typography>
                                <Typography variant="caption" color="text.secondary" display="block" mb={1}>
                                  {report.type} • {formatDate(report.date)}
                                </Typography>
                                <Box display="flex" gap={1} mt={2}>
                                  <Button size="small" variant="outlined" startIcon={<Download />} fullWidth>
                                    Download
                                  </Button>
                                </Box>
                              </CardContent>
                            </Card>
                          </motion.div>
                        </Grid>
                      ))}
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
              </Box>
            )}

            {/* Tab Content - Documents */}
            {activeTab === 1 && (
              <Box>
                {/* Document Upload & Filter */}
                <Card sx={{ mb: 4 }}>
                  <CardContent>
                    <Grid container spacing={2} alignItems="center">
                      <Grid item xs={12} md={6}>
                        <Button
                          variant="contained"
                          startIcon={<CloudUpload />}
                          size="large"
                          fullWidth
                        >
                          Upload New Document
                        </Button>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <FormControl fullWidth size="small">
                          <InputLabel>Category</InputLabel>
                          <Select
                            value={documentFilter}
                            label="Category"
                            onChange={(e) => setDocumentFilter(e.target.value)}
                          >
                            <MenuItem value="all">All Categories</MenuItem>
                            <MenuItem value="Identity">Identity</MenuItem>
                            <MenuItem value="Contract">Contract</MenuItem>
                            <MenuItem value="Financial">Financial</MenuItem>
                            <MenuItem value="Certificate">Certificate</MenuItem>
                            <MenuItem value="Tax">Tax</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>

                {/* Documents Grid */}
                <Grid container spacing={{ xs: 2, sm: 3 }}>
                  {userDocuments
                    .filter(doc => documentFilter === 'all' || doc.category === documentFilter)
                    .map((doc, index) => (
                    <Grid item xs={12} sm={6} lg={4} key={doc.id}>
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                      >
                        <Card
                          sx={{
                            transition: 'all 0.3s',
                            '&:hover': {
                              transform: 'translateY(-4px)',
                              boxShadow: 4,
                            },
                          }}
                        >
                          <CardContent>
                            <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
                              <Avatar
                                sx={{
                                  bgcolor: doc.type === 'PDF' ? alpha('#F44336', 0.1) : alpha('#2196F3', 0.1),
                                  color: doc.type === 'PDF' ? '#F44336' : '#2196F3',
                                  width: 48,
                                  height: 48,
                                }}
                              >
                                {doc.type === 'PDF' ? <PictureAsPdf /> : <Image />}
                              </Avatar>
                              <Chip
                                label={doc.status}
                                size="small"
                                color={doc.status === 'verified' ? 'success' : doc.status === 'active' ? 'primary' : 'default'}
                                sx={{ textTransform: 'capitalize' }}
                              />
                            </Box>
                            <Typography variant="subtitle2" fontWeight="bold" gutterBottom noWrap>
                              {doc.name}
                            </Typography>
                            <Box display="flex" gap={1} mb={2}>
                              <Chip label={doc.category} size="small" variant="outlined" />
                              <Chip label={doc.size} size="small" variant="outlined" />
                            </Box>
                            <Typography variant="caption" color="text.secondary" display="block" mb={2}>
                              Uploaded: {formatDate(doc.uploadDate)}
                            </Typography>
                            <Box display="flex" gap={1}>
                              <Tooltip title="View">
                                <IconButton size="small" color="primary">
                                  <Visibility />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Download">
                                <IconButton size="small" color="success">
                                  <Download />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Share">
                                <IconButton size="small" color="info">
                                  <Share />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Delete">
                                <IconButton size="small" color="error">
                                  <Delete />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </CardContent>
                        </Card>
                      </motion.div>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}
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

export default UserReports;
