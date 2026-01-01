'use client'
import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Button,
  TextField,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Avatar,
  Tooltip,
  Alert,
  AlertTitle,
  LinearProgress,
  Divider,
} from '@mui/material';
import {
  IconSearch,
  IconFilter,
  IconEye,
  IconCreditCard,
  IconPlus,
  IconMinus,
  IconSettings,
  IconAlertTriangle,
  IconCheck,
  IconX,
  IconRefresh,
  IconDownload,
  IconWallet,
  IconShield,
  IconTrendingUp,
  IconTrendingDown,
  IconGavel,
  IconCurrencyDollar,
  IconActivity,
  IconDatabase,
  IconShieldCheck,
  IconExclamationCircle,
  IconClock,
  IconChartBar,
  IconBolt,
  IconAlertCircle,
  IconHeartbeat,
  IconFileText,
  IconHistory,
  IconTarget,
  IconLock,
  IconBan,
  IconFlag,
  IconMessage,
  IconInfoCircle,
} from '@tabler/icons-react';
import { motion } from 'framer-motion';
import PageContainer from '@/app/(DashboardLayout)/components/container/PageContainer';
import { useRequireRole } from '@/hooks/useRequireRole';

// Enhanced mock data for comprehensive paymaster management
const mockPaymasters = [
  {
    id: 'PM-001',
    name: 'Main Paymaster',
    address: '0x1234567890abcdef1234567890abcdef12345678',
    balance: 500000,
    currency: 'USD',
    status: 'active',
    dailyLimit: 50000,
    monthlyLimit: 1000000,
    dailyUsed: 15000,
    monthlyUsed: 250000,
    lastTopUp: 1704067200000,
    lastWithdrawal: 1703980800000,
    policy: 'standard',
    riskLevel: 'low',
    contractAddress: '0xabcdef1234567890abcdef1234567890abcdef12',
    deploymentHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
    uptime: 99.8,
    performanceScore: 95,
    gasUsage: {
      daily: 1500,
      monthly: 45000,
      averagePerTransaction: 0.05,
      totalTransactions: 30000,
    },
    allocations: {
      activeEscrows: 60,
      pendingReleases: 25,
      disputeReserves: 10,
      platformFees: 5,
    },
    transactions: [
      {
        id: 'TX-001',
        type: 'escrow_funded',
        amount: 25000,
        timestamp: 1704153600000,
        escrowId: 'ESC-001',
        gasUsed: 0.03,
        status: 'completed',
      },
      {
        id: 'TX-002',
        type: 'gas_sponsored',
        amount: 0.05,
        timestamp: 1704147200000,
        escrowId: 'ESC-002',
        gasUsed: 0.05,
        status: 'completed',
      },
      {
        id: 'TX-003',
        type: 'withdrawal',
        amount: 10000,
        timestamp: 1704140800000,
        recipient: '0x9876543210fedcba9876543210fedcba98765432',
        gasUsed: 0.02,
        status: 'completed',
      },
      {
        id: 'TX-004',
        type: 'top_up',
        amount: 50000,
        timestamp: 1704134400000,
        source: '0x1111111111111111111111111111111111111111',
        gasUsed: 0.01,
        status: 'completed',
      },
      {
        id: 'TX-005',
        type: 'allocation_update',
        amount: 0,
        timestamp: 1704128000000,
        details: 'Updated escrow allocation to 60%',
        gasUsed: 0.01,
        status: 'completed',
      },
    ],
    fraudAlerts: [
      {
        id: 'FA-001',
        type: 'suspicious_transaction',
        severity: 'medium',
        description: 'Unusual gas usage pattern detected',
        timestamp: 1704150000000,
        status: 'investigating',
      },
      {
        id: 'FA-002',
        type: 'repeated_failed_attempts',
        severity: 'high',
        description: 'Multiple failed withdrawal attempts from same address',
        timestamp: 1704146400000,
        status: 'resolved',
      },
    ],
    riskAssessment: {
      overallScore: 15,
      factors: [
        { name: 'Balance Adequacy', score: 85, status: 'good' },
        { name: 'Gas Efficiency', score: 92, status: 'excellent' },
        { name: 'Fraud Risk', score: 25, status: 'low' },
        { name: 'Operational Risk', score: 78, status: 'good' },
      ],
      recommendations: [
        'Monitor gas usage patterns more closely',
        'Consider increasing dispute reserves',
        'Review withdrawal limits for high-value transactions',
      ],
    },
    healthMetrics: {
      contractVersion: 'v2.1.0',
      lastAudit: 1704067200000,
      securityScore: 94,
      complianceStatus: 'compliant',
      backupStatus: 'active',
      monitoringStatus: 'active',
    },
  },
  {
    id: 'PM-002',
    name: 'High-Value Paymaster',
    address: '0x876543210fedcba876543210fedcba876543210f',
    balance: 2000000,
    currency: 'USD',
    status: 'active',
    dailyLimit: 200000,
    monthlyLimit: 5000000,
    dailyUsed: 75000,
    monthlyUsed: 1500000,
    lastTopUp: 1703980800000,
    lastWithdrawal: 1703894400000,
    policy: 'premium',
    riskLevel: 'medium',
    contractAddress: '0x2222222222222222222222222222222222222222',
    deploymentHash: '0x876543210fedcba876543210fedcba876543210fedcba876543210fedcba8765',
    uptime: 99.9,
    performanceScore: 98,
    gasUsage: {
      daily: 2500,
      monthly: 75000,
      averagePerTransaction: 0.08,
      totalTransactions: 50000,
    },
    allocations: {
      activeEscrows: 70,
      pendingReleases: 20,
      disputeReserves: 8,
      platformFees: 2,
    },
    transactions: [
      {
        id: 'TX-006',
        type: 'escrow_funded',
        amount: 100000,
        timestamp: 1704153600000,
        escrowId: 'ESC-003',
        gasUsed: 0.06,
        status: 'completed',
      },
    ],
    fraudAlerts: [],
    riskAssessment: {
      overallScore: 28,
      factors: [
        { name: 'Balance Adequacy', score: 90, status: 'excellent' },
        { name: 'Gas Efficiency', score: 88, status: 'good' },
        { name: 'Fraud Risk', score: 35, status: 'medium' },
        { name: 'Operational Risk', score: 85, status: 'good' },
      ],
      recommendations: [
        'Implement additional fraud detection for high-value transactions',
        'Consider automated risk scoring',
      ],
    },
    healthMetrics: {
      contractVersion: 'v2.1.0',
      lastAudit: 1704067200000,
      securityScore: 96,
      complianceStatus: 'compliant',
      backupStatus: 'active',
      monitoringStatus: 'active',
    },
  },
  {
    id: 'PM-003',
    name: 'Test Paymaster',
    address: '0xabcd1234efgh5678abcd1234efgh5678abcd1234',
    balance: 50000,
    currency: 'USD',
    status: 'inactive',
    dailyLimit: 5000,
    monthlyLimit: 100000,
    dailyUsed: 0,
    monthlyUsed: 0,
    lastTopUp: 1703894400000,
    lastWithdrawal: 1703808000000,
    policy: 'test',
    riskLevel: 'low',
    contractAddress: '0x3333333333333333333333333333333333333333',
    deploymentHash: '0xabcd1234efgh5678abcd1234efgh5678abcd1234efgh5678abcd1234efgh5678',
    uptime: 100,
    performanceScore: 100,
    gasUsage: {
      daily: 0,
      monthly: 0,
      averagePerTransaction: 0,
      totalTransactions: 0,
    },
    allocations: {
      activeEscrows: 0,
      pendingReleases: 0,
      disputeReserves: 0,
      platformFees: 0,
    },
    transactions: [],
    fraudAlerts: [],
    riskAssessment: {
      overallScore: 5,
      factors: [
        { name: 'Balance Adequacy', score: 100, status: 'excellent' },
        { name: 'Gas Efficiency', score: 100, status: 'excellent' },
        { name: 'Fraud Risk', score: 0, status: 'none' },
        { name: 'Operational Risk', score: 100, status: 'excellent' },
      ],
      recommendations: [
        'Ready for production deployment',
        'Monitor performance in live environment',
      ],
    },
    healthMetrics: {
      contractVersion: 'v2.1.0',
      lastAudit: 1704067200000,
      securityScore: 100,
      complianceStatus: 'compliant',
      backupStatus: 'active',
      monitoringStatus: 'active',
    },
  },
];

const PaymasterPage = () => {
  // Require admin or operator role
  useRequireRole(['ADMIN', 'OPERATOR']);

  // State management
  const [paymasters, setPaymasters] = useState(mockPaymasters);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [policyFilter, setPolicyFilter] = useState('all');
  const [selectedPaymaster, setSelectedPaymaster] = useState<any>(null);
  const [isClient, setIsClient] = useState(false);
  
  // Dialog states
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [topUpDialogOpen, setTopUpDialogOpen] = useState(false);
  const [withdrawDialogOpen, setWithdrawDialogOpen] = useState(false);
  const [allocationDialogOpen, setAllocationDialogOpen] = useState(false);
  const [gasDialogOpen, setGasDialogOpen] = useState(false);
  const [fraudDialogOpen, setFraudDialogOpen] = useState(false);
  const [healthDialogOpen, setHealthDialogOpen] = useState(false);
  const [transactionsDialogOpen, setTransactionsDialogOpen] = useState(false);
  const [quickAllocationDialogOpen, setQuickAllocationDialogOpen] = useState(false);
  const [selectedAllocationType, setSelectedAllocationType] = useState('');
  const [allocationAmount, setAllocationAmount] = useState('');
  const [allocationLoading, setAllocationLoading] = useState(false);
  const [allocationSuccess, setAllocationSuccess] = useState(false);
  
  // Form states
  const [topUpAmount, setTopUpAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawAddress, setWithdrawAddress] = useState('');
  const [allocationValues, setAllocationValues] = useState({
    activeEscrows: 60,
    pendingReleases: 25,
    disputeReserves: 10,
    platformFees: 5,
  });
  const [gasSettings, setGasSettings] = useState({
    dailyLimit: 1000,
    dailyQuota: 500,
    autoSponsor: true,
  });

  // Client-side rendering protection
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Helper functions
  const formatCurrency = (amount: number) => {
    if (!isClient) return '$0';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatNumber = (number: number) => {
    if (!isClient) return '0';
    return new Intl.NumberFormat('en-US').format(number);
  };

  const formatDate = (timestamp: number) => {
    if (!isClient) return '';
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatAddress = (address: string) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatHash = (hash: string) => {
    if (!hash) return '';
    return `${hash.slice(0, 8)}...${hash.slice(-8)}`;
  };

  const calculateUsagePercentage = (used: number, limit: number) => {
    if (!limit || limit === 0) return 0;
    return Math.min((used / limit) * 100, 100);
  };

  // Quick Allocation Functions
  const handleQuickAllocation = (type: string) => {
    setSelectedAllocationType(type);
    setAllocationAmount('');
    setAllocationSuccess(false);
    setQuickAllocationDialogOpen(true);
  };

  const executeAllocation = async () => {
    if (!allocationAmount || parseFloat(allocationAmount) <= 0) return;
    
    setAllocationLoading(true);
    
    try {
      // Simulate API call to backend
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update local state
      const updatedPaymasters = paymasters.map(pm => {
        if (pm.id === 'PM-001') { // Main paymaster
          const amount = parseFloat(allocationAmount);
          return {
            ...pm,
            balance: pm.balance - amount,
            allocations: {
              ...pm.allocations,
              [selectedAllocationType]: (pm.allocations as any)[selectedAllocationType] + amount
            }
          };
        }
        return pm;
      });
      
      setPaymasters(updatedPaymasters as any);
      setAllocationSuccess(true);
      
      // Reset after success
      setTimeout(() => {
        setQuickAllocationDialogOpen(false);
        setAllocationSuccess(false);
        setAllocationAmount('');
        setSelectedAllocationType('');
      }, 2000);
      
    } catch (error) {
      console.error('Allocation failed:', error);
    } finally {
      setAllocationLoading(false);
    }
  };

  const getAllocationTypeInfo = (type: string) => {
    const typeInfo = {
      'activeEscrows': {
        title: 'Allocate to Active Escrows',
        description: 'Fund active escrow contracts that are currently processing transactions',
        color: '#4CAF50',
        icon: 'IconCheck'
      },
      'pendingReleases': {
        title: 'Allocate to Pending Releases',
        description: 'Reserve funds for escrows awaiting release conditions',
        color: '#2196F3',
        icon: 'IconClock'
      },
      'disputeReserves': {
        title: 'Reserve for Disputes',
        description: 'Set aside funds for potential dispute resolutions',
        color: '#FF9800',
        icon: 'IconShield'
      },
      'platformFees': {
        title: 'Allocate Platform Fees',
        description: 'Reserve funds for platform operational costs',
        color: '#9C27B0',
        icon: 'IconSettings'
      },
      'emergencyFund': {
        title: 'Emergency Fund',
        description: 'Create emergency reserve for critical situations',
        color: '#F44336',
        icon: 'IconAlertTriangle'
      },
      'bulkAllocation': {
        title: 'Bulk Smart Allocation',
        description: 'AI-powered allocation across multiple categories',
        color: '#00BCD4',
        icon: 'IconTarget'
      }
    };
    return (typeInfo as any)[type] || {};
  };

  // Calculate statistics
  const stats = {
    total: paymasters.length,
    active: paymasters.filter((pm: any) => pm.status === 'active').length,
    totalBalance: paymasters.reduce((sum: number, pm: any) => sum + pm.balance, 0),
    totalDailyUsed: paymasters.reduce((sum: number, pm: any) => sum + pm.dailyUsed, 0),
    totalMonthlyUsed: paymasters.reduce((sum: number, pm: any) => sum + pm.monthlyUsed, 0),
    averageUptime: paymasters.reduce((sum: number, pm: any) => sum + pm.uptime, 0) / paymasters.length,
    averagePerformance: paymasters.reduce((sum: number, pm: any) => sum + pm.performanceScore, 0) / paymasters.length,
    totalGasUsed: paymasters.reduce((sum: number, pm: any) => sum + pm.gasUsage.monthly, 0),
  };

  // Filter paymasters based on search and filters
  const filteredPaymasters = paymasters.filter((paymaster: any) => {
    const matchesSearch = paymaster.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         paymaster.address.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || paymaster.status === statusFilter;
    const matchesPolicy = policyFilter === 'all' || paymaster.policy === policyFilter;
    
    return matchesSearch && matchesStatus && matchesPolicy;
  });

  const handleViewDetails = (paymaster: any) => {
    setSelectedPaymaster(paymaster);
    setDetailDialogOpen(true);
  };

  const handleTopUp = (paymaster: any) => {
    setSelectedPaymaster(paymaster);
    setTopUpDialogOpen(true);
  };

  const handleWithdraw = (paymaster: any) => {
    setSelectedPaymaster(paymaster);
    setWithdrawDialogOpen(true);
  };

  const handleAllocationManagement = (paymaster: any) => {
    setSelectedPaymaster(paymaster);
    setAllocationValues(paymaster.allocations);
    setAllocationDialogOpen(true);
  };

  const handleGasSponsorship = (paymaster: any) => {
    setSelectedPaymaster(paymaster);
    setGasSettings({
      dailyLimit: paymaster.gasUsage.daily,
      dailyQuota: paymaster.gasUsage.daily * 0.5,
      autoSponsor: true,
    });
    setGasDialogOpen(true);
  };

  const handleFraudControl = (paymaster: any) => {
    setSelectedPaymaster(paymaster);
    setFraudDialogOpen(true);
  };

  const handleContractHealth = (paymaster: any) => {
    setSelectedPaymaster(paymaster);
    setHealthDialogOpen(true);
  };

  const handleTransactionHistory = (paymaster: any) => {
    setSelectedPaymaster(paymaster);
    setTransactionsDialogOpen(true);
  };

  const handleConfirmTopUp = () => {
    const amount = parseFloat(topUpAmount);
    setPaymasters(paymasters.map((pm: any) => 
      pm.id === selectedPaymaster?.id 
        ? { 
            ...pm, 
            balance: pm.balance + amount,
            lastTopUp: Date.now()
          }
        : pm
    ) as any);
    setTopUpDialogOpen(false);
    setSelectedPaymaster(null);
    setTopUpAmount('');
  };

  const handleConfirmWithdraw = () => {
    const amount = parseFloat(withdrawAmount);
    setPaymasters(paymasters.map((pm: any) => 
      pm.id === selectedPaymaster?.id 
        ? { 
            ...pm, 
            balance: pm.balance - amount,
            lastWithdrawal: Date.now()
          }
        : pm
    ) as any);
    setWithdrawDialogOpen(false);
    setSelectedPaymaster(null);
    setWithdrawAmount('');
    setWithdrawAddress('');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'default';
      case 'suspended': return 'error';
      default: return 'default';
    }
  };

  const getPolicyColor = (policy: string) => {
    switch (policy) {
      case 'standard': return 'primary';
      case 'premium': return 'secondary';
      case 'test': return 'default';
      default: return 'default';
    }
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low': return 'success';
      case 'medium': return 'warning';
      case 'high': return 'error';
      default: return 'default';
    }
  };



  return (
    <PageContainer title="Paymaster Management" description="Manage Gold Escrow paymaster accounts and policies">
      <Box>
                 {/* Header */}
         <Card sx={{ mb: 3 }}>
           <CardContent>
             <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
               <Box>
                 <Typography variant="h4" fontWeight="bold" sx={{ mb: 1 }}>
                   Paymaster Management
                 </Typography>
                 <Typography variant="body1" color="textSecondary">
                   Full control over paymaster accounts, policies, and financial operations
                 </Typography>
               </Box>
               <Stack direction="row">
                 <Button 
                   variant="outlined" 
                   startIcon={<IconDownload />}
                 >
                   Export Data
                 </Button>
                 <Button 
                   variant="outlined" 
                   startIcon={<IconRefresh />}
                 >
                   Refresh
                 </Button>
               </Stack>
             </Stack>
           </CardContent>
         </Card>

                   {/* Key Metrics div */}
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 1, overflowX: 'auto', mb: 3 }}>
             <Card sx={{ 
               boxShadow: 1,
               '&:hover': { boxShadow: 2 },
               transition: 'all 0.3s ease',
               height: '100%'
             }}>
               <CardContent sx={{ textAlign: 'center', py: 2 }}>
                 <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 1 }}>
                   <IconCurrencyDollar size={24} style={{ color: '#4CAF50' }} />
                 </Box>
                 <Typography variant="h5" fontWeight="bold" sx={{ color: '#4CAF50', mb: 0.5 }}>
                   {formatCurrency(stats.totalBalance)}
                 </Typography>
                 <Typography variant="body2" color="textSecondary">
                   Total Balance
                 </Typography>
               </CardContent>
             </Card>
             <Card sx={{ 
               boxShadow: 1,
               '&:hover': { boxShadow: 2 },
               transition: 'all 0.3s ease',
               height: '100%'
             }}>
               <CardContent sx={{ textAlign: 'center', py: 2 }}>
                 <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 1 }}>
                   <IconGavel size={24} style={{ color: '#2196F3' }} />
                 </Box>
                 <Typography variant="h5" fontWeight="bold" sx={{ color: '#2196F3', mb: 0.5 }}>
                   {formatNumber(stats.total)}
                 </Typography>
                 <Typography variant="body2" color="textSecondary">
                   Total Paymasters
                 </Typography>
               </CardContent>
             </Card>

             <Card sx={{ 
               boxShadow: 1,
               '&:hover': { boxShadow: 2 },
               transition: 'all 0.3s ease',
               height: '100%'
             }}>
               <CardContent sx={{ textAlign: 'center', py: 2 }}>
                 <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 1 }}>
                   <IconBolt size={24} style={{ color: '#FF9800' }} />
                 </Box>
                 <Typography variant="h5" fontWeight="bold" sx={{ color: '#FF9800', mb: 0.5 }}>
                   {formatCurrency(stats.totalGasUsed)}
                 </Typography>
                 <Typography variant="body2" color="textSecondary">
                   Gas Used (Monthly)
                 </Typography>
               </CardContent>
             </Card>

             <Card sx={{ 
               boxShadow: 1,
               '&:hover': { boxShadow: 2 },
               transition: 'all 0.3s ease',
               height: '100%'
             }}>
               <CardContent sx={{ textAlign: 'center', py: 2 }}>
                 <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 1 }}>
                   <IconActivity size={24} style={{ color: '#F44336' }} />
                 </Box>
                 <Typography variant="h5" fontWeight="bold" sx={{ color: '#F44336', mb: 0.5 }}>
                   {formatNumber(stats.active)}
                 </Typography>
                 <Typography variant="body2" color="textSecondary">
                   Active Paymasters
                 </Typography>
               </CardContent>
             </Card>

             <Card sx={{ 
               boxShadow: 1,
               '&:hover': { boxShadow: 2 },
               transition: 'all 0.3s ease',
               height: '100%'
             }}>
               <CardContent sx={{ textAlign: 'center', py: 2 }}>
                 <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 1 }}>
                   <IconHeartbeat size={24} style={{ color: '#9C27B0' }} />
                 </Box>
                 <Typography variant="h5" fontWeight="bold" sx={{ color: '#9C27B0', mb: 0.5 }}>
                   {stats.averageUptime.toFixed(1)}%
                 </Typography>
                 <Typography variant="body2" color="textSecondary">
                   Average Uptime
                 </Typography>
               </CardContent>
             </Card>

             <Card sx={{ 
               boxShadow: 1,
               '&:hover': { boxShadow: 2 },
               transition: 'all 0.3s ease',
               height: '100%'
             }}>
               <CardContent sx={{ textAlign: 'center', py: 2 }}>
                 <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 1 }}>
                   <IconChartBar size={24} style={{ color: '#FFC107' }} />
                 </Box>
                 <Typography variant="h5" fontWeight="bold" sx={{ color: '#FFC107', mb: 0.5 }}>
                   {stats.averagePerformance.toFixed(0)}
                 </Typography>
                 <Typography variant="body2" color="textSecondary">
                   Performance Score
                 </Typography>
               </CardContent>
             </Card>
         </Box>

        {/* Filters */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Stack direction="row" alignItems="center">
              <TextField
                placeholder="Search paymasters..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <IconSearch size={20} />
                    </InputAdornment>
                  ),
                }}
                sx={{ minWidth: 300 }}
              />
              
              <FormControl sx={{ minWidth: 150 }}>
                <InputLabel>Status</InputLabel>
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  label="Status"
                >
                  <MenuItem value="all">All Status</MenuItem>
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                  <MenuItem value="suspended">Suspended</MenuItem>
                </Select>
              </FormControl>

              <FormControl sx={{ minWidth: 150 }}>
                <InputLabel>Policy</InputLabel>
                <Select
                  value={policyFilter}
                  onChange={(e) => setPolicyFilter(e.target.value)}
                  label="Policy"
                >
                  <MenuItem value="all">All Policies</MenuItem>
                  <MenuItem value="standard">Standard</MenuItem>
                  <MenuItem value="premium">Premium</MenuItem>
                  <MenuItem value="test">Test</MenuItem>
                </Select>
              </FormControl>

              <Button
                variant="outlined"
                startIcon={<IconFilter />}
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('all');
                  setPolicyFilter('all');
                }}
              >
                Clear Filters
              </Button>
            </Stack>
          </CardContent>
        </Card>

        {/* Paymasters Table */}
        <Card>
          <CardContent>
            <TableContainer component={Paper} elevation={0}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Paymaster</TableCell>
                    <TableCell>Address</TableCell>
                    <TableCell>Balance</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Policy</TableCell>
                    <TableCell>Daily Usage</TableCell>
                    <TableCell>Monthly Usage</TableCell>
                    <TableCell>Risk Level</TableCell>
                    <TableCell>Last Activity</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredPaymasters.map((paymaster) => (
                    <TableRow key={paymaster.id} hover>
                      <TableCell>
                        <Stack direction="row" alignItems="center">
                          <Avatar sx={{ bgcolor: 'primary.main' }}>
                            <IconWallet size={20} />
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle2" fontWeight="bold">
                              {paymaster.name}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                              {paymaster.id}
                            </Typography>
                          </Box>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontFamily="monospace">
                          {formatAddress(paymaster.address)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="subtitle2" fontWeight="bold">
                          {paymaster.balance}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          {paymaster.currency}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={paymaster.status}
                          color={getStatusColor(paymaster.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={paymaster.policy}
                          color={getPolicyColor(paymaster.policy)}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body2">
                            {paymaster.dailyUsed} / {paymaster.dailyLimit}
                          </Typography>
                          <LinearProgress
                            variant="determinate"
                            value={calculateUsagePercentage(paymaster.dailyUsed, paymaster.dailyLimit)}
                            sx={{ mt: 0.5, height: 4 }}
                          />
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body2">
                            {paymaster.monthlyUsed} / {paymaster.monthlyLimit}
                          </Typography>
                          <LinearProgress
                            variant="determinate"
                            value={calculateUsagePercentage(paymaster.monthlyUsed, paymaster.monthlyLimit)}
                            sx={{ mt: 0.5, height: 4 }}
                          />
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={paymaster.riskLevel}
                          color={getRiskColor(paymaster.riskLevel)}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="textSecondary">
                          {paymaster.lastTopUp}
                        </Typography>
                      </TableCell>
                                             <TableCell>
                         <Stack direction="row">
                           <Tooltip title="View Details">
                             <IconButton
                               size="small"
                               color="primary"
                               onClick={() => handleViewDetails(paymaster)}
                             >
                               <IconEye size={16} />
                             </IconButton>
                           </Tooltip>
                           <Tooltip title="Top Up">
                             <IconButton
                               size="small"
                               color="success"
                               onClick={() => handleTopUp(paymaster)}
                             >
                               <IconPlus size={16} />
                             </IconButton>
                           </Tooltip>
                           <Tooltip title="Withdraw">
                             <IconButton
                               size="small"
                               color="warning"
                               onClick={() => handleWithdraw(paymaster)}
                             >
                               <IconMinus size={16} />
                             </IconButton>
                           </Tooltip>
                           <Tooltip title="Allocation Management">
                             <IconButton
                               size="small"
                               color="info"
                               onClick={() => handleAllocationManagement(paymaster)}
                             >
                               <IconTarget size={16} />
                             </IconButton>
                           </Tooltip>
                           <Tooltip title="Gas Sponsorship">
                             <IconButton
                               size="small"
                               color="secondary"
                               onClick={() => handleGasSponsorship(paymaster)}
                             >
                                                               <IconBolt size={16} />
                             </IconButton>
                           </Tooltip>
                           <Tooltip title="Fraud Control">
                             <IconButton
                               size="small"
                               color="error"
                               onClick={() => handleFraudControl(paymaster)}
                             >
                               <IconShield size={16} />
                             </IconButton>
                           </Tooltip>
                           <Tooltip title="Contract Health">
                             <IconButton
                               size="small"
                               sx={{ color: '#9C27B0' }}
                               onClick={() => handleContractHealth(paymaster)}
                             >
                               <IconHeartbeat size={16} />
                             </IconButton>
                           </Tooltip>
                           <Tooltip title="Transaction History">
                             <IconButton
                               size="small"
                               sx={{ color: '#FF9800' }}
                               onClick={() => handleTransactionHistory(paymaster)}
                             >
                               <IconHistory size={16} />
                             </IconButton>
                           </Tooltip>
                         </Stack>
                       </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
                 </Card>

         {/* ⚡ Core Additions to the Paymaster Page (Efficiency-Driven) */}
         <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' }, gap: 3, mt: 3 }}>
                           {/* Left Column - Real-Time Escrow Funding Monitor */}
                <Card sx={{ height: 700 }}>
             <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
               <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                 <Typography variant="h6" sx={{ color: '#FF6B35', fontWeight: 'bold' }}>
                   <IconActivity size={20} style={{ marginRight: 8, verticalAlign: 'middle' }} />
                   Real-Time Escrow Funding Monitor
                 </Typography>
                 <Chip 
                   label="Live" 
                   color="success" 
                   size="small" 
                   icon={<IconActivity size={12} />}
                 />
               </Stack>
               
               <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
                 Live feed of escrows requesting gas sponsorship or top-ups. Approve/deny instantly.
               </Typography>

               {/* Mock Live Feed Data */}
               <Box sx={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
                 <Stack>
                   {/* Pending Request */}
                   <Card sx={{ 
                     border: '2px solid #FF9800', 
                     bgcolor: 'rgba(255, 152, 0, 0.05)',
                     '&:hover': { bgcolor: 'rgba(255, 152, 0, 0.1)' },
                     minHeight: 120
                   }}>
                     <CardContent sx={{ py: 2, px: 2 }}>
                       <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                         <Box sx={{ flex: 1, minWidth: 0 }}>
                           <Typography variant="subtitle2" fontWeight="bold" sx={{ color: '#FF9800', wordBreak: 'break-word' }}>
                             ESC-007 - Gas Sponsorship Request
                           </Typography>
                           <Typography variant="body2" color="textSecondary" sx={{ wordBreak: 'break-word', mt: 0.5 }}>
                             Buyer: Alice Brown • Seller: Charlie Davis
                           </Typography>
                           <Typography variant="body2" color="textSecondary" sx={{ wordBreak: 'break-word', mt: 0.5 }}>
                             Amount: $25,000 • Gas Needed: $0.05
                           </Typography>
                           <Typography variant="caption" color="textSecondary" sx={{ mt: 0.5, display: 'block' }}>
                             2 minutes ago
                     </Typography>
                   </Box>
                         <Stack direction="row" sx={{ flexShrink: 0 }}>
                           <Button 
                             size="small" 
                             variant="contained" 
                             color="success"
                             startIcon={<IconCheck size={16} />}
                             sx={{ minWidth: 80, height: 32 }}
                           >
                             Approve
                           </Button>
                           <Button 
                             size="small" 
                             variant="outlined" 
                             color="error"
                             startIcon={<IconX size={16} />}
                             sx={{ minWidth: 80, height: 32 }}
                           >
                             Deny
                           </Button>
                         </Stack>
                       </Stack>
                     </CardContent>
                   </Card>

                   {/* Approved Request */}
                   <Card sx={{ 
                     border: '2px solid #4CAF50', 
                     bgcolor: 'rgba(76, 175, 80, 0.05)'
                   }}>
                     <CardContent sx={{ py: 2 }}>
                       <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                         <Box sx={{ flex: 1 }}>
                           <Typography variant="subtitle2" fontWeight="bold" sx={{ color: '#4CAF50' }}>
                             ESC-006 - Top-up Request ✓
                           </Typography>
                           <Typography variant="body2" color="textSecondary">
                             Buyer: John Smith • Seller: Jane Doe
                           </Typography>
                           <Typography variant="body2" color="textSecondary">
                             Amount: $15,000 • Gas Sponsored: $0.03
                           </Typography>
                           <Typography variant="caption" color="textSecondary">
                             5 minutes ago • Approved by Admin
                     </Typography>
                   </Box>
                         <Chip 
                           label="Completed" 
                           color="success" 
                           size="small" 
                           icon={<IconCheck size={12} />}
                         />
                       </Stack>
                     </CardContent>
                   </Card>

                   {/* High Priority Request */}
                   <Card sx={{ 
                     border: '2px solid #F44336', 
                     bgcolor: 'rgba(244, 67, 54, 0.05)',
                     '&:hover': { bgcolor: 'rgba(244, 67, 54, 0.1)' }
                   }}>
                     <CardContent sx={{ py: 2 }}>
                       <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                         <Box sx={{ flex: 1 }}>
                           <Typography variant="subtitle2" fontWeight="bold" sx={{ color: '#F44336' }}>
                             ESC-008 - Critical Gas Request ⚡
                           </Typography>
                           <Typography variant="body2" color="textSecondary">
                             Buyer: High-Value Client • Seller: Premium Partner
                           </Typography>
                           <Typography variant="body2" color="textSecondary">
                             Amount: $100,000 • Gas Needed: $0.08 • Priority: Critical
                           </Typography>
                           <Typography variant="caption" color="textSecondary">
                             30 seconds ago
                     </Typography>
                   </Box>
                         <Stack direction="row">
                           <Button 
                             size="small" 
                             variant="contained" 
                             color="success"
                             startIcon={<IconCheck size={16} />}
                             sx={{ minWidth: 80 }}
                           >
                             Approve
                           </Button>
                           <Button 
                             size="small" 
                             variant="outlined" 
                             color="error"
                             startIcon={<IconX size={16} />}
                             sx={{ minWidth: 80 }}
                           >
                             Deny
                           </Button>
                         </Stack>
                 </Stack>
               </CardContent>
             </Card>

                   {/* Pending Review */}
                   <Card sx={{ 
                     border: '2px solid #2196F3', 
                     bgcolor: 'rgba(33, 150, 243, 0.05)',
                     '&:hover': { bgcolor: 'rgba(33, 150, 243, 0.1)' }
                   }}>
                     <CardContent sx={{ py: 2 }}>
                       <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                         <Box sx={{ flex: 1 }}>
                           <Typography variant="subtitle2" fontWeight="bold" sx={{ color: '#2196F3' }}>
                             ESC-009 - Bulk Allocation Request
                 </Typography>
                           <Typography variant="body2" color="textSecondary">
                             Multiple Escrows • Group: Premium Tier
                           </Typography>
                           <Typography variant="body2" color="textSecondary">
                             Total Amount: $75,000 • Gas Needed: $0.15
                           </Typography>
                           <Typography variant="caption" color="textSecondary">
                             1 minute ago
                     </Typography>
                   </Box>
                         <Stack direction="row">
                           <Button 
                             size="small" 
                             variant="contained" 
                             color="primary"
                             startIcon={<IconCheck size={16} />}
                             sx={{ minWidth: 80 }}
                           >
                             Review
                           </Button>
                         </Stack>
                       </Stack>
                     </CardContent>
                   </Card>
                 </Stack>

                 {/* Quick Stats */}
                 <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                   <Stack direction="row" justifyContent="space-between">
                     <Typography variant="body2" color="textSecondary">
                       Pending: <strong style={{ color: '#FF9800' }}>3</strong>
                     </Typography>
                     <Typography variant="body2" color="textSecondary">
                       Approved Today: <strong style={{ color: '#4CAF50' }}>12</strong>
                     </Typography>
                     <Typography variant="body2" color="textSecondary">
                       Total Gas Sponsored: <strong style={{ color: '#2196F3' }}>$0.31</strong>
                     </Typography>
                   </Stack>
                   </Box>
               </Box>
               </CardContent>
             </Card>

                           {/* Right Column - Balance Allocation Panel */}
                <Card sx={{ height: 700 }}>
             <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
               <Typography variant="h6" sx={{ color: '#FF6B35', fontWeight: 'bold', mb: 2 }}>
                   <IconTarget size={20} style={{ marginRight: 8, verticalAlign: 'middle' }} />
                   Balance Allocation Panel
                 </Typography>
                 
                 <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
                   One-click allocation of balance to specific escrows or groups of escrows with bulk actions.
                 </Typography>

                 {/* Scrollable Content Area */}
                 <Box sx={{ flex: 1, overflowY: 'auto', pr: 1 }}>

                 {/* Quick Allocation Actions */}
                 <Stack sx={{ mb: 3 }}>
                   <Typography variant="subtitle2" fontWeight="bold" color="textSecondary">
                     Quick Allocation Actions
                   </Typography>
                   
                   <div>
                     <div>
                       <Button
                         fullWidth
                         variant="outlined"
                         startIcon={<IconCheck size={16} />}
                         onClick={() => handleQuickAllocation('activeEscrows')}
                         sx={{ 
                           borderColor: '#4CAF50',
                           color: '#4CAF50',
                           '&:hover': { borderColor: '#4CAF50', bgcolor: 'rgba(76, 175, 80, 0.05)' }
                         }}
                       >
                         Active Escrows
                       </Button>
                     
                       <Button
                         fullWidth
                         variant="outlined"
                         startIcon={<IconClock size={16} />}
                         onClick={() => handleQuickAllocation('pendingReleases')}
                         sx={{ 
                           borderColor: '#2196F3',
                           color: '#2196F3',
                           '&:hover': { borderColor: '#2196F3', bgcolor: 'rgba(33, 150, 243, 0.05)' }
                         }}
                       >
                         Pending Releases
                       </Button>
                     
                       <Button
                         fullWidth
                         variant="outlined"
                         startIcon={<IconShield size={16} />}
                         onClick={() => handleQuickAllocation('disputeReserves')}
                         sx={{ 
                           borderColor: '#FF9800',
                           color: '#FF9800',
                           '&:hover': { borderColor: '#FF9800', bgcolor: 'rgba(255, 152, 0, 0.05)' }
                         }}
                       >
                         Dispute Reserves
                       </Button>
                     
                       <Button
                         fullWidth
                         variant="outlined"
                         startIcon={<IconSettings size={16} />}
                         onClick={() => handleQuickAllocation('platformFees')}
                         sx={{ 
                           borderColor: '#9C27B0',
                           color: '#9C27B0',
                           '&:hover': { borderColor: '#9C27B0', bgcolor: 'rgba(156, 39, 176, 0.05)' }
                         }}
                       >
                         Platform Fees
                       </Button>
                     
                       <Button
                         fullWidth
                         variant="outlined"
                         startIcon={<IconAlertTriangle size={16} />}
                         onClick={() => handleQuickAllocation('emergencyFund')}
                         sx={{ 
                           borderColor: '#F44336',
                           color: '#F44336',
                           '&:hover': { borderColor: '#F44336', bgcolor: 'rgba(244, 67, 54, 0.05)' }
                         }}
                       >
                         Emergency Fund
                       </Button>
                     
                       <Button
                         fullWidth
                         variant="outlined"
                         startIcon={<IconTarget size={16} />}
                         onClick={() => handleQuickAllocation('bulkAllocation')}
                         sx={{ 
                           borderColor: '#00BCD4',
                           color: '#00BCD4',
                           '&:hover': { borderColor: '#00BCD4', bgcolor: 'rgba(0, 188, 212, 0.05)' }
                         }}
                       >
                         Smart Allocation
                       </Button>
                     </div>
                   </div>
                 </Stack>

                 {/* Escrow Groups */}
                 <Stack sx={{ mb: 3 }}>
                   <Typography variant="subtitle2" fontWeight="bold" color="textSecondary">
                     Escrow Groups
                   </Typography>
                   
                   <Stack>
                     {/* Premium Tier */}
                     <Card sx={{ 
                       border: '1px solid #FFC107',
                       bgcolor: 'rgba(255, 215, 0, 0.05)',
                       '&:hover': { bgcolor: 'rgba(255, 215, 0, 0.1)' }
                     }}>
                       <CardContent sx={{ py: 1.5 }}>
                         <Stack direction="row" justifyContent="space-between" alignItems="center">
                           <Box>
                             <Typography variant="subtitle2" fontWeight="bold" sx={{ color: '#FFC107' }}>
                               Premium Tier Escrows
                             </Typography>
                             <Typography variant="body2" color="textSecondary">
                               15 escrows • Total: $750,000
                     </Typography>
                   </Box>
                           <Stack direction="row">
                             <Button size="small" variant="contained" color="primary">
                               Allocate $50K
                             </Button>
                             <Button size="small" variant="outlined">
                               View
                             </Button>
                           </Stack>
                 </Stack>
               </CardContent>
             </Card>

                     {/* Standard Tier */}
                     <Card sx={{ 
                       border: '1px solid #2196F3',
                       bgcolor: 'rgba(33, 150, 243, 0.05)',
                       '&:hover': { bgcolor: 'rgba(33, 150, 243, 0.1)' }
                     }}>
                       <CardContent sx={{ py: 1.5 }}>
                         <Stack direction="row" justifyContent="space-between" alignItems="center">
                           <Box>
                             <Typography variant="subtitle2" fontWeight="bold" sx={{ color: '#2196F3' }}>
                               Standard Tier Escrows
                             </Typography>
                             <Typography variant="body2" color="textSecondary">
                               42 escrows • Total: $1,200,000
                             </Typography>
                           </Box>
                           <Stack direction="row">
                             <Button size="small" variant="contained" color="primary">
                               Allocate $100K
                             </Button>
                             <Button size="small" variant="outlined">
                               View
                             </Button>
                           </Stack>
                         </Stack>
                       </CardContent>
                     </Card>

                     {/* High-Risk Escrows */}
                     <Card sx={{ 
                       border: '1px solid #F44336',
                       bgcolor: 'rgba(244, 67, 54, 0.05)',
                       '&:hover': { bgcolor: 'rgba(244, 67, 54, 0.1)' }
                     }}>
                       <CardContent sx={{ py: 1.5 }}>
                         <Stack direction="row" justifyContent="space-between" alignItems="center">
                           <Box>
                             <Typography variant="subtitle2" fontWeight="bold" sx={{ color: '#F44336' }}>
                               High-Risk Escrows
                             </Typography>
                             <Typography variant="body2" color="textSecondary">
                               8 escrows • Total: $300,000
                             </Typography>
                           </Box>
                           <Stack direction="row">
                             <Button size="small" variant="contained" color="warning">
                               Review
                             </Button>
                             <Button size="small" variant="outlined">
                               View
                             </Button>
                           </Stack>
                         </Stack>
                       </CardContent>
                     </Card>

                     {/* Additional Escrow Groups for Demo */}
                     <Card sx={{ 
                       border: '1px solid #4CAF50',
                       bgcolor: 'rgba(76, 175, 80, 0.05)',
                       '&:hover': { bgcolor: 'rgba(76, 175, 80, 0.1)' }
                     }}>
                       <CardContent sx={{ py: 1.5 }}>
                         <Stack direction="row" justifyContent="space-between" alignItems="center">
                           <Box>
                             <Typography variant="subtitle2" fontWeight="bold" sx={{ color: '#4CAF50' }}>
                               Verified Partners
                             </Typography>
                             <Typography variant="body2" color="textSecondary">
                               28 escrows • Total: $950,000
                             </Typography>
                           </Box>
                           <Stack direction="row">
                             <Button size="small" variant="contained" color="success">
                               Allocate $75K
                             </Button>
                             <Button size="small" variant="outlined">
                               View
                             </Button>
                           </Stack>
                         </Stack>
                       </CardContent>
                     </Card>

                     <Card sx={{ 
                       border: '1px solid #9C27B0',
                       bgcolor: 'rgba(156, 39, 176, 0.05)',
                       '&:hover': { bgcolor: 'rgba(156, 39, 176, 0.1)' }
                     }}>
                       <CardContent sx={{ py: 1.5 }}>
                         <Stack direction="row" justifyContent="space-between" alignItems="center">
                           <Box>
                             <Typography variant="subtitle2" fontWeight="bold" sx={{ color: '#9C27B0' }}>
                               International Escrows
                             </Typography>
                             <Typography variant="body2" color="textSecondary">
                               12 escrows • Total: $600,000
                             </Typography>
                           </Box>
                           <Stack direction="row">
                             <Button size="small" variant="contained" color="secondary">
                               Allocate $40K
                             </Button>
                             <Button size="small" variant="outlined">
                               View
                             </Button>
                           </Stack>
                         </Stack>
                       </CardContent>
                     </Card>

                     <Card sx={{ 
                       border: '1px solid #FF9800',
                       bgcolor: 'rgba(255, 152, 0, 0.05)',
                       '&:hover': { bgcolor: 'rgba(255, 152, 0, 0.1)' }
                     }}>
                       <CardContent sx={{ py: 1.5 }}>
                         <Stack direction="row" justifyContent="space-between" alignItems="center">
                           <Box>
                             <Typography variant="subtitle2" fontWeight="bold" sx={{ color: '#FF9800' }}>
                               New User Escrows
                             </Typography>
                             <Typography variant="body2" color="textSecondary">
                               35 escrows • Total: $180,000
                             </Typography>
                           </Box>
                           <Stack direction="row">
                             <Button size="small" variant="contained" color="warning">
                               Allocate $25K
                             </Button>
                             <Button size="small" variant="outlined">
                               View
                             </Button>
                           </Stack>
                         </Stack>
                       </CardContent>
                     </Card>

                     <Card sx={{ 
                       border: '1px solid #00BCD4',
                       bgcolor: 'rgba(0, 188, 212, 0.05)',
                       '&:hover': { bgcolor: 'rgba(0, 188, 212, 0.1)' }
                     }}>
                       <CardContent sx={{ py: 1.5 }}>
                         <Stack direction="row" justifyContent="space-between" alignItems="center">
                           <Box>
                             <Typography variant="subtitle2" fontWeight="bold" sx={{ color: '#00BCD4' }}>
                               Corporate Escrows
                             </Typography>
                             <Typography variant="body2" color="textSecondary">
                               22 escrows • Total: $1,500,000
                             </Typography>
                           </Box>
                           <Stack direction="row">
                             <Button size="small" variant="contained" sx={{ bgcolor: '#00BCD4' }}>
                               Allocate $200K
                             </Button>
                             <Button size="small" variant="outlined">
                               View
                             </Button>
                           </Stack>
                         </Stack>
                       </CardContent>
                     </Card>
                   </Stack>
                 </Stack>

                 {/* Allocation Summary */}
                 <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                   <Typography variant="subtitle2" fontWeight="bold" color="textSecondary" sx={{ mb: 1 }}>
                     Allocation Summary
                   </Typography>
                   <Stack>
                     <Stack direction="row" justifyContent="space-between">
                       <Typography variant="body2">Available for Allocation:</Typography>
                       <Typography variant="body2" fontWeight="bold" sx={{ color: '#4CAF50' }}>
                         {formatCurrency(500000)}
                       </Typography>
                     </Stack>
                     <Stack direction="row" justifyContent="space-between">
                       <Typography variant="body2">Reserved for Disputes:</Typography>
                       <Typography variant="body2" fontWeight="bold" sx={{ color: '#FF9800' }}>
                         {formatCurrency(150000)}
                       </Typography>
                     </Stack>
                     <Stack direction="row" justifyContent="space-between">
                       <Typography variant="body2">Auto-Allocated Today:</Typography>
                       <Typography variant="body2" fontWeight="bold" sx={{ color: '#2196F3' }}>
                         {formatCurrency(75000)}
                       </Typography>
                     </Stack>
                   </Stack>
                 </Box>
                 </Box>
               </CardContent>
             </Card>
           </Box>

         {/* Paymaster Details Dialog */}
        <Dialog open={detailDialogOpen} onClose={() => setDetailDialogOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle>Paymaster Details - {selectedPaymaster?.name}</DialogTitle>
          <DialogContent>
            {selectedPaymaster && (
              <Stack spacing={3} sx={{ mt: 2 }}>
                <Box>
                  <Typography variant="h6" gutterBottom>Account Information</Typography>
                  <Stack direction="row" spacing={4}>
                    <Box>
                      <Typography variant="body2" color="textSecondary">Balance</Typography>
                      <Typography variant="h6">{selectedPaymaster.balance} {selectedPaymaster.currency}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="textSecondary">Status</Typography>
                      <Chip
                        label={selectedPaymaster.status}
                        color={getStatusColor(selectedPaymaster.status)}
                        size="small"
                      />
                    </Box>
                    <Box>
                      <Typography variant="body2" color="textSecondary">Policy</Typography>
                      <Chip
                        label={selectedPaymaster.policy}
                        color={getPolicyColor(selectedPaymaster.policy)}
                        size="small"
                      />
                    </Box>
                  </Stack>
                </Box>

                <Box>
                  <Typography variant="h6" gutterBottom>Contract Address</Typography>
                  <Typography variant="body2" fontFamily="monospace" sx={{ bgcolor: 'grey.100', p: 1, borderRadius: 1 }}>
                    {formatAddress(selectedPaymaster.address)}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="h6" gutterBottom>Usage Limits</Typography>
                  <div>
                    <div>
                      <Typography variant="body2" color="textSecondary">Daily Limit</Typography>
                      <Typography variant="body1">{selectedPaymaster.dailyLimit}</Typography>
                    
                      <Typography variant="body2" color="textSecondary">Monthly Limit</Typography>
                      <Typography variant="body1">{selectedPaymaster.monthlyLimit}</Typography>
                    
                      <Typography variant="body2" color="textSecondary">Daily Used</Typography>
                      <Typography variant="body1">{selectedPaymaster.dailyUsed}</Typography>
                    
                      <Typography variant="body2" color="textSecondary">Monthly Used</Typography>
                      <Typography variant="body1">{selectedPaymaster.monthlyUsed}</Typography>
                    </div>
                  </div>
                </Box>

                <Box>
                  <Typography variant="h6" gutterBottom>Activity History</Typography>
                  <Stack>
                    <Box>
                      <Typography variant="body2" color="textSecondary">Last Top Up</Typography>
                      <Typography variant="body1">{selectedPaymaster.lastTopUp}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="textSecondary">Last Withdrawal</Typography>
                      <Typography variant="body1">{selectedPaymaster.lastWithdrawal}</Typography>
                    </Box>
                  </Stack>
                </Box>

                <Box>
                  <Typography variant="h6" gutterBottom>Risk Assessment</Typography>
                  <Chip
                    label={selectedPaymaster.riskLevel}
                    color={getRiskColor(selectedPaymaster.riskLevel)}
                    size="small"
                  />
                </Box>
              </Stack>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDetailDialogOpen(false)}>Close</Button>
          </DialogActions>
        </Dialog>

        {/* Top Up Dialog */}
        <Dialog open={topUpDialogOpen} onClose={() => setTopUpDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Top Up Paymaster</DialogTitle>
          <DialogContent>
            <Typography variant="body1" sx={{ mb: 2 }}>
              Add funds to {selectedPaymaster?.name}:
            </Typography>
            <TextField
              label="Amount (USD)"
              type="number"
              fullWidth
              value={topUpAmount}
              onChange={(e) => setTopUpAmount(e.target.value)}
              InputProps={{
                startAdornment: <InputAdornment position="start">$</InputAdornment>,
              }}
              sx={{ mb: 2 }}
            />
            <Alert severity="info">
              Current balance: {selectedPaymaster?.balance}
            </Alert>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setTopUpDialogOpen(false)}>Cancel</Button>
            <Button 
              variant="contained" 
              onClick={handleConfirmTopUp}
              disabled={!topUpAmount || parseFloat(topUpAmount) <= 0}
            >
              Top Up
            </Button>
          </DialogActions>
        </Dialog>

        {/* Withdraw Dialog */}
        <Dialog open={withdrawDialogOpen} onClose={() => setWithdrawDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Withdraw from Paymaster</DialogTitle>
          <DialogContent>
            <Alert severity="warning" sx={{ mb: 2 }}>
              This action will withdraw funds from {selectedPaymaster?.name}. This is a high-risk action that requires confirmation.
            </Alert>
            <TextField
              label="Amount (USD)"
              type="number"
              fullWidth
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
              InputProps={{
                startAdornment: <InputAdornment position="start">$</InputAdornment>,
              }}
              sx={{ mb: 2 }}
            />
            <TextField
              label="Recipient Address"
              fullWidth
              value={withdrawAddress}
              onChange={(e) => setWithdrawAddress(e.target.value)}
              placeholder="0x..."
              sx={{ mb: 2 }}
            />
            <Alert severity="info">
              Current balance: {selectedPaymaster?.balance}
            </Alert>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setWithdrawDialogOpen(false)}>Cancel</Button>
            <Button 
              variant="contained" 
              color="error"
              onClick={handleConfirmWithdraw}
              disabled={!withdrawAmount || !withdrawAddress || parseFloat(withdrawAmount) <= 0}
            >
              Withdraw
            </Button>
          </DialogActions>
                           </Dialog>

          {/* Gas Sponsorship Dialog */}
          <Dialog open={gasDialogOpen} onClose={() => setGasDialogOpen(false)} maxWidth="md" fullWidth>
            <DialogTitle>
              <Stack direction="row" alignItems="center">
                <IconBolt size={24} style={{ color: '#FF9800' }} />
                <Typography variant="h6">Gas Sponsorship - {selectedPaymaster?.name}</Typography>
              </Stack>
            </DialogTitle>
            <DialogContent>
              {selectedPaymaster && (
                <Stack spacing={3} sx={{ mt: 2 }}>
                  <Alert severity="info">
                    Configure gas sponsorship settings and limits for this paymaster.
                  </Alert>
                  
                  <div>
                    <div>
                      <TextField
                        label="Daily Gas Limit ($)"
                        type="number"
                        fullWidth
                        value={gasSettings.dailyLimit}
                        onChange={(e) => setGasSettings({
                          ...gasSettings,
                          dailyLimit: parseFloat(e.target.value) || 0
                        })}
                        InputProps={{
                          startAdornment: <InputAdornment position="start">$</InputAdornment>,
                        }}
                      />
                    
                      <TextField
                        label="Daily Quota ($)"
                        type="number"
                        fullWidth
                        value={gasSettings.dailyQuota}
                        onChange={(e) => setGasSettings({
                          ...gasSettings,
                          dailyQuota: parseFloat(e.target.value) || 0
                        })}
                        InputProps={{
                          startAdornment: <InputAdornment position="start">$</InputAdornment>,
                        }}
                      />
                    </div>
                  </div>

                  <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                    <Typography variant="subtitle2" color="textSecondary">Current Gas Usage</Typography>
                    <Typography variant="h6" sx={{ color: '#FF9800', fontWeight: 'bold' }}>
                      {formatCurrency(selectedPaymaster.gasUsage.daily)} / {formatCurrency(selectedPaymaster.gasUsage.monthly)} (Monthly)
                    </Typography>
                  </Box>
                </Stack>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setGasDialogOpen(false)}>Cancel</Button>
              <Button 
                variant="contained" 
                color="primary"
                onClick={() => {
                  // Update paymaster gas settings
                  setPaymasters(paymasters.map(pm => 
                    pm.id === selectedPaymaster.id 
                      ? { 
                          ...pm, 
                          gasUsage: {
                            ...pm.gasUsage,
                            daily: gasSettings.dailyLimit
                          }
                        }
                      : pm
                  ));
                  setGasDialogOpen(false);
                }}
              >
                Update Gas Settings
              </Button>
            </DialogActions>
          </Dialog>

          {/* Fraud Control Dialog */}
          <Dialog open={fraudDialogOpen} onClose={() => setFraudDialogOpen(false)} maxWidth="md" fullWidth>
            <DialogTitle>
              <Stack direction="row" alignItems="center">
                <IconShield size={24} style={{ color: '#F44336' }} />
                <Typography variant="h6">Fraud Control - {selectedPaymaster?.name}</Typography>
              </Stack>
            </DialogTitle>
            <DialogContent>
              {selectedPaymaster && (
                <Stack spacing={3} sx={{ mt: 2 }}>
                  <Alert severity="warning">
                    Manage fraud detection and security settings for this paymaster.
                  </Alert>
                  
                  <Box>
                    <Typography variant="h6" gutterBottom>Active Alerts ({selectedPaymaster.fraudAlerts.length})</Typography>
                    {selectedPaymaster.fraudAlerts.length > 0 ? (
                      <Stack>
                        {selectedPaymaster.fraudAlerts.map((alert: any) => (
                          <Alert key={alert.id} severity={alert.severity === 'high' ? 'error' : 'warning'}>
                            <Typography variant="subtitle2">{alert.type}</Typography>
                            <Typography variant="body2">{alert.description}</Typography>
                            <Typography variant="caption">{formatDate(alert.timestamp)}</Typography>
                          </Alert>
                        ))}
                      </Stack>
                    ) : (
                      <Alert severity="success">No active fraud alerts</Alert>
                    )}
                  </Box>

                  <Box>
                    <Typography variant="h6" gutterBottom>Risk Assessment</Typography>
                    <Typography variant="body1" sx={{ color: '#F44336', fontWeight: 'bold' }}>
                      Overall Risk Score: {selectedPaymaster.riskAssessment.overallScore}/100
                    </Typography>
                  </Box>
                </Stack>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setFraudDialogOpen(false)}>Close</Button>
            </DialogActions>
          </Dialog>

          {/* Contract Health Dialog */}
          <Dialog open={healthDialogOpen} onClose={() => setHealthDialogOpen(false)} maxWidth="md" fullWidth>
            <DialogTitle>
              <Stack direction="row" alignItems="center">
                <IconHeartbeat size={24} style={{ color: '#9C27B0' }} />
                <Typography variant="h6">Contract Health - {selectedPaymaster?.name}</Typography>
              </Stack>
            </DialogTitle>
            <DialogContent>
              {selectedPaymaster && (
                <Stack spacing={3} sx={{ mt: 2 }}>
                  <Alert severity="info">
                    Monitor contract health and performance metrics.
                  </Alert>
                  
                  <div>
                    <div>
                      <Typography variant="subtitle2" color="textSecondary">Contract Version</Typography>
                      <Typography variant="h6">{selectedPaymaster.healthMetrics.contractVersion}</Typography>
                    
                      <Typography variant="subtitle2" color="textSecondary">Security Score</Typography>
                      <Typography variant="h6" sx={{ color: '#4CAF50' }}>{selectedPaymaster.healthMetrics.securityScore}/100</Typography>
                    
                      <Typography variant="subtitle2" color="textSecondary">Uptime</Typography>
                      <Typography variant="h6" sx={{ color: '#9C27B0' }}>{selectedPaymaster.uptime}%</Typography>
                    
                      <Typography variant="subtitle2" color="textSecondary">Performance Score</Typography>
                      <Typography variant="h6" sx={{ color: '#FFC107' }}>{selectedPaymaster.performanceScore}/100</Typography>
                    </div>
                  </div>

                  <Box>
                    <Typography variant="h6" gutterBottom>Contract Address</Typography>
                    <Typography variant="body2" fontFamily="monospace" sx={{ bgcolor: 'grey.100', p: 1, borderRadius: 1 }}>
                      {formatAddress(selectedPaymaster.contractAddress)}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="h6" gutterBottom>Deployment Hash</Typography>
                    <Typography variant="body2" fontFamily="monospace" sx={{ bgcolor: 'grey.100', p: 1, borderRadius: 1 }}>
                      {formatHash(selectedPaymaster.deploymentHash)}
                    </Typography>
                  </Box>
                </Stack>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setHealthDialogOpen(false)}>Close</Button>
            </DialogActions>
          </Dialog>

          {/* Transaction History Dialog */}
          <Dialog open={transactionsDialogOpen} onClose={() => setTransactionsDialogOpen(false)} maxWidth="lg" fullWidth>
            <DialogTitle>
              <Stack direction="row" alignItems="center">
                <IconHistory size={24} style={{ color: '#FF9800' }} />
                <Typography variant="h6">Transaction History - {selectedPaymaster?.name}</Typography>
              </Stack>
            </DialogTitle>
            <DialogContent>
              {selectedPaymaster && (
                <Stack spacing={3} sx={{ mt: 2 }}>
                  <Alert severity="info">
                    View recent transaction history and gas usage details.
                  </Alert>
                  
                  {selectedPaymaster.transactions.length > 0 ? (
                    <TableContainer component={Paper} elevation={0}>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell>Transaction ID</TableCell>
                            <TableCell>Type</TableCell>
                            <TableCell>Amount</TableCell>
                            <TableCell>Gas Used</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Date</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {selectedPaymaster.transactions.map((tx: any) => (
                            <TableRow key={tx.id}>
                              <TableCell>
                                <Typography variant="body2" fontFamily="monospace">
                                  {formatHash(tx.id)}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Chip 
                                  label={tx.type.replace('_', ' ')} 
                                  size="small" 
                                  color="primary" 
                                  variant="outlined"
                                />
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2" fontWeight="bold">
                                  {formatCurrency(tx.amount)}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2" color="textSecondary">
                                  {formatCurrency(tx.gasUsed)}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Chip 
                                  label={tx.status} 
                                  size="small" 
                                  color="success"
                                />
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2" color="textSecondary">
                                  {formatDate(tx.timestamp)}
                                </Typography>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  ) : (
                    <Alert severity="info">No transaction history available</Alert>
                  )}
                </Stack>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setTransactionsDialogOpen(false)}>Close</Button>
            </DialogActions>
          </Dialog>

          {/* Allocation Management Dialog */}
         <Dialog open={allocationDialogOpen} onClose={() => setAllocationDialogOpen(false)} maxWidth="md" fullWidth>
           <DialogTitle>
             <Stack direction="row" alignItems="center">
               <IconTarget size={24} style={{ color: '#2196F3' }} />
               <Typography variant="h6">Allocation Management - {selectedPaymaster?.name}</Typography>
             </Stack>
           </DialogTitle>
           <DialogContent>
             {selectedPaymaster && (
               <Stack spacing={3} sx={{ mt: 2 }}>
                 <Alert severity="info">
                   Manage fund allocation percentages for different escrow states. Total must equal 100%.
                 </Alert>
                 
                 <div>
                   <div>
                     <TextField
                       label="Active Escrows (%)"
                       type="number"
                       fullWidth
                       value={allocationValues.activeEscrows}
                       onChange={(e) => setAllocationValues({
                         ...allocationValues,
                         activeEscrows: parseInt(e.target.value) || 0
                       })}
                       InputProps={{
                         endAdornment: <Typography variant="caption">%</Typography>,
                       }}
                     />
                   
                     <TextField
                       label="Pending Releases (%)"
                       type="number"
                       fullWidth
                       value={allocationValues.pendingReleases}
                       onChange={(e) => setAllocationValues({
                         ...allocationValues,
                         pendingReleases: parseInt(e.target.value) || 0
                       })}
                       InputProps={{
                         endAdornment: <Typography variant="caption">%</Typography>,
                       }}
                     />
                   
                     <TextField
                       label="Dispute Reserves (%)"
                       type="number"
                       fullWidth
                       value={allocationValues.disputeReserves}
                       onChange={(e) => setAllocationValues({
                         ...allocationValues,
                         disputeReserves: parseInt(e.target.value) || 0
                       })}
                       InputProps={{
                         endAdornment: <Typography variant="caption">%</Typography>,
                       }}
                     />
                   
                     <TextField
                       label="Platform Fees (%)"
                       type="number"
                       fullWidth
                       value={allocationValues.platformFees}
                       onChange={(e) => setAllocationValues({
                         ...allocationValues,
                         platformFees: parseInt(e.target.value) || 0
                       })}
                       InputProps={{
                         endAdornment: <Typography variant="caption">%</Typography>,
                       }}
                     />
                   </div>
                 </div>

                 <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                   <Typography variant="subtitle2" color="textSecondary">Total Allocation</Typography>
                   <Typography variant="h6" sx={{ 
                     color: (allocationValues.activeEscrows + allocationValues.pendingReleases + 
                            allocationValues.disputeReserves + allocationValues.platformFees) === 100 
                       ? '#4CAF50' : '#F44336',
                     fontWeight: 'bold'
                   }}>
                     {(allocationValues.activeEscrows + allocationValues.pendingReleases + 
                       allocationValues.disputeReserves + allocationValues.platformFees)}%
                   </Typography>
                 </Box>
               </Stack>
             )}
           </DialogContent>
           <DialogActions>
             <Button onClick={() => setAllocationDialogOpen(false)}>Cancel</Button>
             <Button 
               variant="contained" 
               color="primary"
               onClick={() => {
                 // Update paymaster allocations
                setPaymasters(paymasters.map((pm: any) => 
                  pm.id === selectedPaymaster?.id 
                     ? { ...pm, allocations: allocationValues }
                     : pm
                ) as any);
                 setAllocationDialogOpen(false);
               }}
               disabled={(allocationValues.activeEscrows + allocationValues.pendingReleases + 
                        allocationValues.disputeReserves + allocationValues.platformFees) !== 100}
             >
               Update Allocations
             </Button>
           </DialogActions>
         </Dialog>

         {/* Quick Allocation Dialog */}
         <Dialog open={quickAllocationDialogOpen} onClose={() => setQuickAllocationDialogOpen(false)} maxWidth="sm" fullWidth>
           <DialogTitle>
             <Stack direction="row" alignItems="center">
               <IconTarget size={24} style={{ color: getAllocationTypeInfo(selectedAllocationType).color }} />
               <Typography variant="h6">{getAllocationTypeInfo(selectedAllocationType).title}</Typography>
             </Stack>
           </DialogTitle>
           <DialogContent>
             <Stack spacing={3} sx={{ mt: 2 }}>
               {allocationSuccess ? (
                 <Alert severity="success" sx={{ mb: 2 }}>
                   <AlertTitle>Allocation Successful!</AlertTitle>
                   Successfully allocated ${allocationAmount} to {getAllocationTypeInfo(selectedAllocationType).title}
                 </Alert>
               ) : (
                 <>
                   <Alert severity="info">
                     {getAllocationTypeInfo(selectedAllocationType).description}
                   </Alert>
                   
                   <TextField
                     label="Allocation Amount ($)"
                     type="number"
                     fullWidth
                     value={allocationAmount}
                     onChange={(e) => setAllocationAmount(e.target.value)}
                     placeholder="Enter amount to allocate"
                     InputProps={{
                       startAdornment: <InputAdornment position="start">$</InputAdornment>,
                     }}
                   />
                   
                   <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                     <Typography variant="subtitle2" color="textSecondary">Current Balance</Typography>
                     <Typography variant="h6" sx={{ color: '#2196F3', fontWeight: 'bold' }}>
                       {formatCurrency(paymasters.find(pm => pm.id === 'PM-001')?.balance || 0)}
                     </Typography>
                   </Box>
                   
                   {allocationAmount && parseFloat(allocationAmount) > 0 && (
                     <Box sx={{ p: 2, bgcolor: 'rgba(76, 175, 80, 0.05)', borderRadius: 1, border: '1px solid #4CAF50' }}>
                       <Typography variant="subtitle2" color="textSecondary">Allocation Preview</Typography>
                       <Typography variant="body2">
                         Amount: <strong>{formatCurrency(parseFloat(allocationAmount))}</strong>
                       </Typography>
                       <Typography variant="body2">
                         Remaining Balance: <strong>{formatCurrency((paymasters.find(pm => pm.id === 'PM-001')?.balance || 0) - parseFloat(allocationAmount))}</strong>
                       </Typography>
                     </Box>
                   )}
                 </>
               )}
             </Stack>
           </DialogContent>
           <DialogActions>
             {!allocationSuccess && (
               <>
                 <Button onClick={() => setQuickAllocationDialogOpen(false)}>Cancel</Button>
                 <Button 
                   variant="contained" 
                   color="primary"
                   onClick={executeAllocation}
                   disabled={!allocationAmount || parseFloat(allocationAmount) <= 0 || allocationLoading}
                   startIcon={allocationLoading ? <IconRefresh size={16} /> : null}
                 >
                   {allocationLoading ? 'Processing...' : 'Execute Allocation'}
                 </Button>
               </>
             )}
           </DialogActions>
         </Dialog>
       </Box>
     </PageContainer>
   );
 };

export default PaymasterPage;
