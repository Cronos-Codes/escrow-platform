import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Stack,
  Button,
  Avatar,
  Chip,
  IconButton,
  Tooltip,
  alpha,
  useTheme,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemSecondaryAction,
  CircularProgress,
  Alert,
  AlertTitle,
  Snackbar,
  Menu,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  AccountBalance,
  Security,
  CheckCircle,
  Error as ErrorIcon,
  MoreVert,
  Download,
  Refresh,
  Visibility,
  VisibilityOff,
  ArrowUpward,
  ArrowDownward,
  Shield,
  Timeline,
  Gavel,
  Receipt,
  LockOpen,
  Circle,
  FilterList,
  Share,
  Print,
  Settings as SettingsIcon,
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
  BarChart,
  Bar,
} from 'recharts';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import LuxuryNavbar from '../../components/shared/LuxuryNavbar';
import LuxuryFooter from '../../components/shared/LuxuryFooter';
import FloatingChatbot from '../../components/shared/FloatingChatbot';
import useDashboard, { Timeframe } from '../../hooks/useDashboard';

interface UserDashboardProps {
  user: {
    id: string;
    name: string;
    email: string;
    role: 'buyer' | 'seller';
    kycLevel: 'basic' | 'verified' | 'premium';
  };
}

const EnhancedUserDashboard: React.FC<UserDashboardProps> = ({ user }) => {
  const theme = useTheme();
  const router = useRouter();
  const { data, loading, error, refetch, updateTimeframe, timeframe } = useDashboard(user.id);
  
  const [showBalance, setShowBalance] = useState(true);
  const [expandedKPIs, setExpandedKPIs] = useState<{[key: string]: boolean}>({});
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' | 'info' });
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null);

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'escrow_created': return <Shield />;
      case 'deposit': return <Receipt />;
      case 'escrow_release': return <LockOpen />;
      case 'withdrawal': return <ArrowDownward />;
      default: return <Circle />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'active': return 'info';
      case 'pending': return 'warning';
      case 'failed': return 'error';
      default: return 'default';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp color="success" />;
      case 'down': return <TrendingDown color="error" />;
      default: return <Circle color="disabled" />;
    }
  };

  if (loading && !data) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Container maxWidth="xl" sx={{ py: 8, flexGrow: 1 }}>
          <Alert severity="error">
            <AlertTitle>Error Loading Dashboard</AlertTitle>
            {error}
          </Alert>
          <Button variant="contained" onClick={handleRefresh} sx={{ mt: 2 }}>
            Retry
          </Button>
        </Container>
      </Box>
    );
  }

  const kpiData = data ? [
    {
      id: 'wallet',
      title: 'Wallet Balance',
      value: showBalance ? formatCurrency(data.wallet.totalBalance) : '••••••',
      change: data.wallet.change24h,
      trend: data.wallet.trend,
      icon: <AccountBalance />,
      color: '#4CAF50',
      description: 'Total portfolio value',
      detail: `Crypto: ${formatCurrency(data.wallet.cryptoBalance)} | Fiat: ${formatCurrency(data.wallet.fiatBalance)} | Gold: ${formatCurrency(data.wallet.goldValue)}`,
    },
    {
      id: 'escrows',
      title: 'Active Escrows',
      value: data.escrows.active.toString(),
      change: `${data.escrows.pending} pending`,
      trend: 'up',
      icon: <Security />,
      color: '#2196F3',
      description: 'Currently active escrow transactions',
      detail: `Total Value: ${formatCurrency(data.escrows.totalValue)} | Completed: ${data.escrows.completed}`,
    },
    {
      id: 'transactions',
      title: 'Total Transactions',
      value: data.transactions.total.toString(),
      change: `${data.transactions.pending} pending`,
      trend: 'up',
      icon: <Timeline />,
      color: '#FF9800',
      description: 'All-time transaction count',
      detail: `Completed: ${data.transactions.completed} | Failed: ${data.transactions.failed}`,
    },
    {
      id: 'disputes',
      title: 'Disputes',
      value: data.disputes.open.toString(),
      change: `${data.disputes.resolved} resolved`,
      trend: 'down',
      icon: <Gavel />,
      color: '#F44336',
      description: 'Open dispute cases',
      detail: `Resolved: ${data.disputes.resolved} | Escalated: ${data.disputes.escalated}`,
    }
  ] : [];

  return (
    <>
      <Head>
        <title>User Dashboard - Gold Escrow</title>
        <meta name="description" content="Gold Escrow User Dashboard - Manage your escrow transactions, wallet, and disputes" />
      </Head>

      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Box component="main" sx={{ flexGrow: 1, bgcolor: '#f5f5f5' }}>
          <Container maxWidth="xl" sx={{ py: 4 }}>
            {/* Header Section */}
            <Box className="mb-8">
              <Box className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
                <Box>
                  <Typography variant="h4" className="font-bold text-gray-900 mb-2">
                    Welcome back, {user.name}!
                  </Typography>
                  <Typography variant="body1" className="text-gray-600">
                    Here's what's happening with your Gold Escrow account
                  </Typography>
                </Box>
                
                <Box className="flex items-center space-x-4 mt-4 lg:mt-0">
                  <FormControl size="small" sx={{ minWidth: 120 }}>
                    <InputLabel>Timeframe</InputLabel>
                    <Select
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

                  <Tooltip title="Refresh Dashboard">
                    <IconButton 
                      onClick={handleRefresh} 
                      disabled={loading}
                      aria-label="Refresh dashboard"
                    >
                      <Refresh className={loading ? 'animate-spin' : ''} />
                    </IconButton>
                  </Tooltip>
                  
                  <Tooltip title={showBalance ? 'Hide Balance' : 'Show Balance'}>
                    <IconButton 
                      onClick={() => setShowBalance(!showBalance)}
                      aria-label={showBalance ? 'Hide balance' : 'Show balance'}
                    >
                      {showBalance ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </Tooltip>

                  <Tooltip title="More Options">
                    <IconButton 
                      onClick={handleMenuOpen}
                      aria-label="More options"
                    >
                      <MoreVert />
                    </IconButton>
                  </Tooltip>

                  <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleMenuClose}
                  >
                    <MenuItem onClick={() => handleExport('pdf')} disabled={isExporting}>
                      <Download sx={{ mr: 1 }} /> Export as PDF
                    </MenuItem>
                    <MenuItem onClick={() => handleExport('csv')} disabled={isExporting}>
                      <Download sx={{ mr: 1 }} /> Export as CSV
                    </MenuItem>
                    <MenuItem onClick={handleMenuClose} disabled={isExporting}>
                      <Print sx={{ mr: 1 }} /> Print Dashboard
                    </MenuItem>
                    <MenuItem onClick={() => router.push('/user-dashboard/profile')}>
                      <SettingsIcon sx={{ mr: 1 }} /> Settings
                    </MenuItem>
                  </Menu>
                </Box>
              </Box>

              {/* KPI Cards */}
              <Grid container spacing={3} className="mb-8">
                {kpiData.map((kpi, index) => (
                  <Grid item xs={12} sm={6} lg={3} key={kpi.id}>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                    >
                      <Card 
                        className="cursor-pointer hover:shadow-xl transition-all duration-300"
                        onClick={() => setExpandedKPIs(prev => ({
                          ...prev,
                          [kpi.id]: !prev[kpi.id]
                        }))}
                        sx={{
                          height: '100%',
                          background: `linear-gradient(135deg, ${alpha(kpi.color, 0.05)} 0%, ${alpha(kpi.color, 0.02)} 100%)`,
                          borderLeft: `4px solid ${kpi.color}`,
                        }}
                      >
                        <CardContent className="p-6">
                          <Box className="flex items-center justify-between mb-4">
                            <Avatar 
                              sx={{ 
                                bgcolor: alpha(kpi.color, 0.1),
                                color: kpi.color,
                                width: 56,
                                height: 56
                              }}
                            >
                              {kpi.icon}
                            </Avatar>
                            
                            <Box className="text-right">
                              <Typography 
                                variant="h4" 
                                className="font-bold"
                                sx={{ color: kpi.color }}
                              >
                                {kpi.value}
                              </Typography>
                              <Box className="flex items-center justify-end mt-1">
                                {getTrendIcon(kpi.trend)}
                                <Typography variant="caption" className="ml-1 text-gray-600">
                                  {kpi.change}
                                </Typography>
                              </Box>
                            </Box>
                          </Box>
                          
                          <Typography variant="h6" className="font-medium mb-2">
                            {kpi.title}
                          </Typography>
                          
                          <Typography variant="body2" className="text-gray-600 mb-3">
                            {kpi.description}
                          </Typography>
                          
                          <AnimatePresence>
                            {expandedKPIs[kpi.id] && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                              >
                                <Divider sx={{ my: 2 }} />
                                <Typography variant="caption" className="text-gray-500">
                                  {kpi.detail}
                                </Typography>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </Grid>
                ))}
              </Grid>

              {/* Charts Section */}
              <Grid container spacing={3} className="mb-8">
                <Grid item xs={12} lg={8}>
                  <Card sx={{ height: '100%' }}>
                    <CardContent className="p-6">
                      <Box className="flex items-center justify-between mb-4">
                        <Typography variant="h6" className="font-semibold">
                          Portfolio Performance
                        </Typography>
                        <Chip 
                          label={`${timeframe.toUpperCase()}`} 
                          size="small" 
                          color="primary" 
                          variant="outlined"
                        />
                      </Box>
                      <Box className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={data?.analytics.chartData || []}>
                            <defs>
                              <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#4CAF50" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#4CAF50" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                            <XAxis dataKey="month" stroke="#666" />
                            <YAxis stroke="#666" />
                            <RechartsTooltip 
                              contentStyle={{ 
                                backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                                border: '1px solid #e0e0e0',
                                borderRadius: '8px',
                                boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                              }}
                              formatter={(value, name) => [
                                name === 'balance' ? formatCurrency(Number(value)) : value,
                                name === 'balance' ? 'Balance' : 'Escrows'
                              ]}
                            />
                            <Area 
                              type="monotone" 
                              dataKey="balance" 
                              stroke="#4CAF50" 
                              fill="url(#colorBalance)"
                              strokeWidth={3}
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} lg={4}>
                  <Card sx={{ height: '100%' }}>
                    <CardContent className="p-6">
                      <Typography variant="h6" className="mb-4 font-semibold">
                        Quick Actions
                      </Typography>
                      <Stack spacing={2}>
                        <Button
                          variant="contained"
                          startIcon={<Security />}
                          className="bg-blue-600 hover:bg-blue-700"
                          fullWidth
                          onClick={() => router.push('/escrow/create')}
                        >
                          New Escrow
                        </Button>
                        <Button
                          variant="outlined"
                          startIcon={<AccountBalance />}
                          fullWidth
                          onClick={() => router.push('/user-dashboard/wallet')}
                        >
                          Manage Wallet
                        </Button>
                        <Button
                          variant="outlined"
                          startIcon={<Timeline />}
                          fullWidth
                          onClick={() => router.push('/user-dashboard/transactions')}
                        >
                          View Transactions
                        </Button>
                        <Button
                          variant="outlined"
                          startIcon={<Download />}
                          fullWidth
                          onClick={() => handleExport('pdf')}
                        >
                          Export Report
                        </Button>
                      </Stack>

                      <Divider sx={{ my: 3 }} />

                      <Typography variant="subtitle2" className="mb-2 font-semibold">
                        Performance Metrics
                      </Typography>
                      <Stack spacing={1.5}>
                        <Box>
                          <Box className="flex justify-between mb-1">
                            <Typography variant="caption">Success Rate</Typography>
                            <Typography variant="caption" className="font-semibold">
                              {data?.analytics.performanceMetrics.successRate.toFixed(1)}%
                            </Typography>
                          </Box>
                          <Box sx={{ 
                            height: 6, 
                            bgcolor: '#e0e0e0', 
                            borderRadius: 1,
                            overflow: 'hidden'
                          }}>
                            <Box sx={{ 
                              width: `${data?.analytics.performanceMetrics.successRate}%`,
                              height: '100%',
                              bgcolor: '#4CAF50',
                              transition: 'width 0.3s ease'
                            }} />
                          </Box>
                        </Box>
                        <Box>
                          <Typography variant="caption" className="text-gray-600">
                            Avg Deal Duration
                          </Typography>
                          <Typography variant="body2" className="font-semibold">
                            {data?.analytics.performanceMetrics.avgDealDuration.toFixed(1)} hours
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="caption" className="text-gray-600">
                            Total Volume
                          </Typography>
                          <Typography variant="body2" className="font-semibold">
                            {formatCurrency(data?.analytics.performanceMetrics.totalVolume || 0)}
                          </Typography>
                        </Box>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              {/* Recent Transactions */}
              <Card>
                <CardContent className="p-6">
                  <Box className="flex items-center justify-between mb-4">
                    <Typography variant="h6" className="font-semibold">
                      Recent Transactions
                    </Typography>
                    <Button 
                      variant="outlined" 
                      size="small"
                      onClick={() => router.push('/user-dashboard/transactions')}
                    >
                      View All
                    </Button>
                  </Box>
                  
                  <List>
                    {data?.transactions.recentTransactions.slice(0, 5).map((transaction, index) => (
                      <ListItem 
                        key={transaction.id} 
                        className="hover:bg-gray-50 rounded-lg transition-colors"
                        sx={{ mb: 1 }}
                      >
                        <ListItemAvatar>
                          <Avatar
                            sx={{
                              bgcolor: alpha('#2196F3', 0.1),
                              color: '#2196F3',
                            }}
                          >
                            {getTransactionIcon(transaction.type)}
                          </Avatar>
                        </ListItemAvatar>
                        
                        <ListItemText
                          primary={
                            <Typography variant="subtitle2" className="font-medium">
                              {transaction.description}
                            </Typography>
                          }
                          secondary={
                            <Typography variant="body2" className="text-gray-600">
                              {formatDate(transaction.timestamp)}
                            </Typography>
                          }
                        />
                        
                        <ListItemSecondaryAction>
                          <Box className="text-right">
                            <Typography 
                              variant="subtitle2" 
                              className={`font-semibold ${
                                transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                              }`}
                            >
                              {transaction.amount > 0 ? '+' : ''}{formatCurrency(transaction.amount)}
                            </Typography>
                            <Chip
                              label={transaction.status}
                              color={getStatusColor(transaction.status)}
                              size="small"
                              sx={{ mt: 0.5 }}
                            />
                          </Box>
                        </ListItemSecondaryAction>
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Box>
          </Container>
        </Box>
        
        <FloatingChatbot theme="light" />
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
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

export default EnhancedUserDashboard;
