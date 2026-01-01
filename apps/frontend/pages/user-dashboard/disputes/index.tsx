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
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Stepper,
  Step,
  StepLabel,
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
  Search,
  FilterList,
  Flag,
  CheckCircle,
  Error as ErrorIcon,
  Pending,
  Warning,
  Message,
  AttachFile,
  Send,
  Close,
  Info,
  Person,
} from '@mui/icons-material';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';

const drawerWidth = 280;

// Mock dispute data
const mockDisputes = [
  {
    id: 'DIS-2024-001',
    escrowId: 'ESC-2024-003',
    title: 'Product Quality Issue',
    description: 'Received gold bars do not match the purity specified in the agreement',
    status: 'open',
    priority: 'high',
    createdAt: '2024-01-18T10:00:00Z',
    updatedAt: '2024-01-19T14:30:00Z',
    amount: 50000,
    initiatedBy: 'buyer',
    respondent: 'Gold Traders LLC',
    arbiter: 'John Arbiter',
    messages: 12,
    attachments: 5,
    stage: 'investigation',
    resolution: null,
  },
  {
    id: 'DIS-2024-002',
    escrowId: 'ESC-2024-005',
    title: 'Delayed Delivery',
    description: 'Seller failed to deliver gold coins within agreed timeframe',
    status: 'in_review',
    priority: 'medium',
    createdAt: '2024-01-15T09:00:00Z',
    updatedAt: '2024-01-19T11:00:00Z',
    amount: 35000,
    initiatedBy: 'buyer',
    respondent: 'Heritage Coins',
    arbiter: 'Sarah Mediator',
    messages: 8,
    attachments: 3,
    stage: 'mediation',
    resolution: null,
  },
  {
    id: 'DIS-2024-003',
    escrowId: 'ESC-2024-001',
    title: 'Payment Dispute',
    description: 'Buyer claims unauthorized charge on escrow account',
    status: 'resolved',
    priority: 'low',
    createdAt: '2024-01-10T15:00:00Z',
    updatedAt: '2024-01-17T16:00:00Z',
    amount: 15000,
    initiatedBy: 'buyer',
    respondent: 'Platform',
    arbiter: 'Mike Resolver',
    messages: 15,
    attachments: 7,
    stage: 'closed',
    resolution: 'Refund issued to buyer',
  },
];

const disputeStages = [
  'Filed',
  'Under Review',
  'Investigation',
  'Mediation',
  'Resolution',
];

interface UserDisputesProps {
  user: {
    name: string;
    email: string;
    role: 'buyer' | 'seller';
    kycLevel: 'basic' | 'verified' | 'premium';
  };
}

const UserDisputes: React.FC<UserDisputesProps> = ({ user }) => {
  const theme = useTheme();
  const router = useRouter();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [disputes, setDisputes] = useState(mockDisputes);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuAnchor, setUserMenuAnchor] = useState<null | HTMLElement>(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDispute, setSelectedDispute] = useState<string | null>(null);
  const [messageDialogOpen, setMessageDialogOpen] = useState(false);

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/user-dashboard' },
    { text: 'My Escrows', icon: <Security />, path: '/user-dashboard/escrows' },
    { text: 'Transactions', icon: <Timeline />, path: '/user-dashboard/transactions' },
    { text: 'Wallet', icon: <AccountBalance />, path: '/user-dashboard/wallet' },
    { text: 'Disputes', icon: <Gavel />, path: '/user-dashboard/disputes', active: true },
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
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'error';
      case 'in_review': return 'warning';
      case 'resolved': return 'success';
      case 'closed': return 'default';
      default: return 'default';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#F44336';
      case 'medium': return '#FF9800';
      case 'low': return '#4CAF50';
      default: return '#9E9E9E';
    }
  };

  const getStageIndex = (stage: string) => {
    const stageMap: { [key: string]: number } = {
      'filed': 0,
      'under_review': 1,
      'investigation': 2,
      'mediation': 3,
      'closed': 4,
    };
    return stageMap[stage] || 0;
  };

  const filteredDisputes = disputes.filter(dispute => {
    const matchesStatus = filterStatus === 'all' || dispute.status === filterStatus;
    const matchesSearch = dispute.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         dispute.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const stats = {
    total: disputes.length,
    open: disputes.filter(d => d.status === 'open').length,
    inReview: disputes.filter(d => d.status === 'in_review').length,
    resolved: disputes.filter(d => d.status === 'resolved').length,
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
        <title>Disputes - Gold Escrow</title>
        <meta name="description" content="Manage your dispute cases" />
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
              Disputes
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Tooltip title="Refresh">
                <IconButton size="small">
                  <Refresh />
                </IconButton>
              </Tooltip>

              <Tooltip title="Notifications">
                <IconButton size="small">
                  <Badge badgeContent={stats.open} color="error">
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
                Dispute Management
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Track and resolve your dispute cases
              </Typography>
            </Box>

            {/* Statistics Cards */}
            <Grid container spacing={{ xs: 2, sm: 3 }} mb={{ xs: 3, sm: 4 }}>
              {[
                { title: 'Total Disputes', value: stats.total, icon: <Gavel />, color: '#2196F3' },
                { title: 'Open Cases', value: stats.open, icon: <Flag />, color: '#F44336' },
                { title: 'Under Review', value: stats.inReview, icon: <Pending />, color: '#FF9800' },
                { title: 'Resolved', value: stats.resolved, icon: <CheckCircle />, color: '#4CAF50' },
              ].map((stat, index) => (
                <Grid item xs={12} sm={6} lg={3} key={stat.title}>
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
                        <Box display="flex" justifyContent="space-between" alignItems="start">
                          <Box>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                              {stat.title}
                            </Typography>
                            <Typography variant="h4" fontWeight="bold">
                              {stat.value}
                            </Typography>
                          </Box>
                          <Avatar sx={{ bgcolor: alpha(stat.color, 0.1), color: stat.color }}>
                            {stat.icon}
                          </Avatar>
                        </Box>
                      </CardContent>
                    </Card>
                  </motion.div>
                </Grid>
              ))}
            </Grid>

            {/* Filters */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      size="small"
                      placeholder="Search disputes..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      InputProps={{
                        startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Status</InputLabel>
                      <Select
                        value={filterStatus}
                        label="Status"
                        onChange={(e) => setFilterStatus(e.target.value)}
                      >
                        <MenuItem value="all">All Status</MenuItem>
                        <MenuItem value="open">Open</MenuItem>
                        <MenuItem value="in_review">Under Review</MenuItem>
                        <MenuItem value="resolved">Resolved</MenuItem>
                        <MenuItem value="closed">Closed</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Button
                      fullWidth
                      variant="contained"
                      startIcon={<Flag />}
                      color="error"
                    >
                      File New Dispute
                    </Button>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Disputes List */}
            <Grid container spacing={3}>
              {filteredDisputes.map((dispute, index) => (
                <Grid item xs={12} key={dispute.id}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <Card
                      sx={{
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        transition: 'all 0.3s',
                        '&:hover': {
                          boxShadow: 4,
                          transform: 'translateY(-2px)',
                        },
                      }}
                    >
                      <CardContent sx={{ p: { xs: 2, sm: 3 }, flex: 1, display: 'flex', flexDirection: 'column' }}>
                        {/* Header */}
                        <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
                          <Box flex={1} minWidth={0}>
                            <Box display="flex" alignItems="center" gap={1} mb={1} flexWrap="wrap">
                              <Typography variant="h6" fontWeight="bold" noWrap sx={{ maxWidth: { xs: '100%', sm: '300px' } }}>
                                {dispute.title}
                              </Typography>
                              <Chip 
                                label={dispute.status.replace('_', ' ')} 
                                size="small" 
                                color={getStatusColor(dispute.status) as any}
                                sx={{ textTransform: 'capitalize' }}
                              />
                              <Chip 
                                label={dispute.priority} 
                                size="small"
                                sx={{ 
                                  bgcolor: alpha(getPriorityColor(dispute.priority), 0.1),
                                  color: getPriorityColor(dispute.priority),
                                  textTransform: 'capitalize',
                                }}
                              />
                            </Box>
                            <Typography 
                              variant="body2" 
                              color="text.secondary" 
                              gutterBottom
                              sx={{
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                minHeight: '40px',
                              }}
                            >
                              {dispute.description}
                            </Typography>
                            <Box display="flex" gap={1} mt={1} flexWrap="wrap">
                              <Chip label={`ID: ${dispute.id}`} size="small" variant="outlined" />
                              <Chip label={`Escrow: ${dispute.escrowId}`} size="small" variant="outlined" />
                            </Box>
                          </Box>
                          <Box textAlign="right" ml={2} flexShrink={0}>
                            <Typography variant="h5" fontWeight="bold" color="error.main">
                              {formatCurrency(dispute.amount)}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" display="block">
                              Disputed Amount
                            </Typography>
                          </Box>
                        </Box>

                        {/* Progress Stepper */}
                        <Box mb={3}>
                          <Stepper activeStep={getStageIndex(dispute.stage)} alternativeLabel>
                            {disputeStages.map((label) => (
                              <Step key={label}>
                                <StepLabel>{label}</StepLabel>
                              </Step>
                            ))}
                          </Stepper>
                        </Box>

                        {/* Details Grid */}
                        <Grid container spacing={2} mb={2}>
                          <Grid item xs={6} sm={3}>
                            <Typography variant="caption" color="text.secondary" display="block">
                              Initiated By
                            </Typography>
                            <Typography variant="body2" fontWeight="medium" noWrap>
                              {dispute.initiatedBy === 'buyer' ? 'You (Buyer)' : dispute.initiatedBy}
                            </Typography>
                          </Grid>
                          <Grid item xs={6} sm={3}>
                            <Typography variant="caption" color="text.secondary" display="block">
                              Respondent
                            </Typography>
                            <Typography variant="body2" fontWeight="medium" noWrap>
                              {dispute.respondent}
                            </Typography>
                          </Grid>
                          <Grid item xs={6} sm={3}>
                            <Typography variant="caption" color="text.secondary" display="block">
                              Arbiter
                            </Typography>
                            <Typography variant="body2" fontWeight="medium" noWrap>
                              {dispute.arbiter}
                            </Typography>
                          </Grid>
                          <Grid item xs={6} sm={3}>
                            <Typography variant="caption" color="text.secondary" display="block">
                              Last Updated
                            </Typography>
                            <Typography variant="body2" fontWeight="medium" noWrap>
                              {formatDate(dispute.updatedAt)}
                            </Typography>
                          </Grid>
                        </Grid>

                        {/* Action Buttons */}
                        <Box display="flex" gap={1} flexWrap="wrap">
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<Message />}
                            onClick={() => setMessageDialogOpen(true)}
                          >
                            Messages ({dispute.messages})
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<AttachFile />}
                          >
                            Attachments ({dispute.attachments})
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<Info />}
                          >
                            View Details
                          </Button>
                          {dispute.status === 'open' && (
                            <Button
                              size="small"
                              variant="contained"
                              color="success"
                              startIcon={<CheckCircle />}
                            >
                              Accept Resolution
                            </Button>
                          )}
                        </Box>

                        {/* Resolution */}
                        {dispute.resolution && (
                          <Box 
                            mt={2} 
                            p={2} 
                            bgcolor={alpha('#4CAF50', 0.1)} 
                            borderRadius={2}
                            border={`1px solid ${alpha('#4CAF50', 0.3)}`}
                          >
                            <Box display="flex" alignItems="center" gap={1} mb={1}>
                              <CheckCircle sx={{ color: '#4CAF50' }} />
                              <Typography variant="subtitle2" fontWeight="bold" color="#4CAF50">
                                Resolution
                              </Typography>
                            </Box>
                            <Typography variant="body2">
                              {dispute.resolution}
                            </Typography>
                          </Box>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                </Grid>
              ))}
            </Grid>

            {/* Empty State */}
            {filteredDisputes.length === 0 && (
              <Card>
                <CardContent sx={{ p: 8, textAlign: 'center' }}>
                  <Gavel sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    No disputes found
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Try adjusting your filters or file a new dispute
                  </Typography>
                </CardContent>
              </Card>
            )}
          </Container>
        </Box>
      </Box>

      {/* Message Dialog */}
      <Dialog 
        open={messageDialogOpen} 
        onClose={() => setMessageDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Dispute Messages</Typography>
            <IconButton onClick={() => setMessageDialogOpen(false)}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            Message thread functionality would be implemented here
          </Typography>
        </DialogContent>
        <DialogActions>
          <TextField
            fullWidth
            size="small"
            placeholder="Type your message..."
            sx={{ mr: 1 }}
          />
          <Button variant="contained" startIcon={<Send />}>
            Send
          </Button>
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
    role: 'buyer' as const,
    kycLevel: 'premium' as const,
  };

  return {
    props: {
      user,
    },
  };
};

export default UserDisputes;
