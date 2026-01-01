import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  IconButton,
  Tooltip,
  CircularProgress,
  Alert,
  AlertTitle,
  Snackbar,
  Menu,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Button,
} from '@mui/material';
import {
  AccountBalance,
  Security,
  Timeline,
  Gavel,
  MoreVert,
  Refresh,
  Visibility,
  VisibilityOff,
  Download,
  Print,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import LuxuryNavbar from '../../components/shared/LuxuryNavbar';
import LuxuryFooter from '../../components/shared/LuxuryFooter';
import FloatingChatbot from '../../components/shared/FloatingChatbot';
import { MetricCard, TransactionList, PerformanceChart, QuickActions } from '../../components/dashboard';
import useDashboard from '../../hooks/useDashboard';
import { Timeframe } from '@escrow/schemas';

interface UserDashboardProps {
  user: {
    id?: string;
    name: string;
    email: string;
    role: 'buyer' | 'seller';
    kycLevel: 'basic' | 'verified' | 'premium';
  };
}

const UserDashboard: React.FC<UserDashboardProps> = ({ user }) => {
  const router = useRouter();
  const { data, loading, error, refetch, updateTimeframe, timeframe } = useDashboard(user.id);
  
  const [showBalance, setShowBalance] = useState(true);
  const [expandedKPIs, setExpandedKPIs] = useState<{[key: string]: boolean}>({});
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [snackbar, setSnackbar] = useState({ 
    open: false, 
    message: '', 
    severity: 'success' as 'success' | 'error' | 'info' 
  });

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleExport = async (format: 'pdf' | 'csv') => {
    try {
      setSnackbar({ open: true, message: `Exporting dashboard as ${format.toUpperCase()}...`, severity: 'info' });
      // Implement export logic here
      setTimeout(() => {
        setSnackbar({ open: true, message: `Dashboard exported successfully!`, severity: 'success' });
      }, 1500);
    } catch (err) {
      setSnackbar({ open: true, message: 'Export failed', severity: 'error' });
    }
    handleMenuClose();
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
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  // Error state
  if (error) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <LuxuryNavbar user={user} notifications={0} theme="light" />
        <Container maxWidth="xl" sx={{ py: 8, flexGrow: 1 }}>
          <Alert severity="error">
            <AlertTitle>Error Loading Dashboard</AlertTitle>
            {error}
          </Alert>
          <Button variant="contained" onClick={handleRefresh} sx={{ mt: 2 }}>
            Retry
          </Button>
        </Container>
        <LuxuryFooter theme="light" />
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
      color: '#4CAF50',
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
      color: '#2196F3',
      description: 'Currently active escrow transactions',
      detail: `Total Value: ${formatCurrency(data.escrows.totalValue)} | Completed: ${data.escrows.completed}`,
    },
    {
      id: 'transactions',
      title: 'Total Transactions',
      value: data.transactions.total.toString(),
      change: `${data.transactions.pending} pending`,
      trend: 'up' as const,
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
      trend: 'down' as const,
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
        <LuxuryNavbar 
          user={user}
          notifications={2}
          theme="light"
        />
        
        <Box component="main" sx={{ flexGrow: 1, pt: 8, bgcolor: '#f5f5f5' }}>
          <Container maxWidth="xl" sx={{ py: 4 }}>
            {/* Header Section */}
            <Box mb={4}>
              <Box display="flex" flexDirection={{ xs: 'column', lg: 'row' }} alignItems={{ lg: 'center' }} justifyContent="space-between" mb={4}>
                <Box mb={{ xs: 2, lg: 0 }}>
                  <Typography variant="h4" fontWeight="bold" color="text.primary" gutterBottom>
                    Welcome back, {user.name}!
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Here's what's happening with your Gold Escrow account
                  </Typography>
                </Box>
                
                <Box display="flex" alignItems="center" gap={2} flexWrap="wrap">
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
                    <IconButton onClick={handleRefresh} disabled={loading}>
                      <Refresh />
                    </IconButton>
                  </Tooltip>
                  
                  <Tooltip title={showBalance ? 'Hide Balance' : 'Show Balance'}>
                    <IconButton onClick={() => setShowBalance(!showBalance)}>
                      {showBalance ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </Tooltip>

                  <Tooltip title="More Options">
                    <IconButton onClick={handleMenuOpen}>
                      <MoreVert />
                    </IconButton>
                  </Tooltip>

                  <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleMenuClose}
                  >
                    <MenuItem onClick={() => handleExport('pdf')}>
                      <Download sx={{ mr: 1 }} /> Export as PDF
                    </MenuItem>
                    <MenuItem onClick={() => handleExport('csv')}>
                      <Download sx={{ mr: 1 }} /> Export as CSV
                    </MenuItem>
                    <MenuItem onClick={handleMenuClose}>
                      <Print sx={{ mr: 1 }} /> Print Dashboard
                    </MenuItem>
                    <MenuItem onClick={() => router.push('/user-dashboard/profile')}>
                      <SettingsIcon sx={{ mr: 1 }} /> Settings
                    </MenuItem>
                  </Menu>
                </Box>
              </Box>

              {/* KPI Cards */}
              <Grid container spacing={3} mb={4}>
                {kpiData.map((kpi) => (
                  <Grid item xs={12} sm={6} lg={3} key={kpi.id}>
                    <MetricCard
                      {...kpi}
                      expanded={expandedKPIs[kpi.id]}
                      onClick={() => setExpandedKPIs(prev => ({
                        ...prev,
                        [kpi.id]: !prev[kpi.id]
                      }))}
                      loading={loading}
                    />
                  </Grid>
                ))}
              </Grid>

              {/* Charts and Actions Section */}
              <Grid container spacing={3} mb={4}>
                <Grid item xs={12} lg={8}>
                  <PerformanceChart
                    data={data?.analytics.chartData || []}
                    timeframe={timeframe}
                    title="Portfolio Performance"
                  />
                </Grid>
                
                <Grid item xs={12} lg={4}>
                  <QuickActions
                    onNewEscrow={() => router.push('/escrow/create')}
                    onManageWallet={() => router.push('/user-dashboard/wallet')}
                    onViewTransactions={() => router.push('/user-dashboard/transactions')}
                    onExportReport={() => handleExport('pdf')}
                    performanceMetrics={data?.analytics.performanceMetrics}
                  />
                </Grid>
              </Grid>

              {/* Recent Transactions */}
              <TransactionList
                transactions={data?.transactions.recentTransactions || []}
                onViewAll={() => router.push('/user-dashboard/transactions')}
                maxItems={5}
              />
            </Box>
          </Container>
        </Box>
        
        <LuxuryFooter theme="light" />
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

export default UserDashboard;
