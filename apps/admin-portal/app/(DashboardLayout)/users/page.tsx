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
  Badge,
  Grid,
  Divider,
  Alert,
  Switch,
  FormControlLabel,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  AlertTitle,
} from '@mui/material';
import {
  IconSearch,
  IconFilter,
  IconEdit,
  IconTrash,
  IconUserCheck,
  IconUserX,
  IconShield,
  IconMail,
  IconPhone,
  IconEye,
  IconLock,
  IconAlertTriangle,
  IconCheck,
  IconX,
  IconClock,
  IconDownload,
  IconUpload,
  IconRefresh,
  IconPlus,
  IconSettings,
  IconKey,
  IconShieldCheck,
  IconShieldX,
  IconUserPlus,
  IconUserMinus,
  IconCertificate,
  IconFileText,
  IconDatabase,
  IconActivity,
  IconHistory,
  IconFlag,
  IconMessage,
  IconSend,
  IconBan,
  IconExclamationCircle,
  IconInfoCircle,
  IconCurrencyDollar,
  IconCoin,
} from '@tabler/icons-react';
import { motion } from 'framer-motion';
import { alpha } from '@mui/material/styles';
import PageContainer from '@/app/(DashboardLayout)/components/container/PageContainer';
import { useRequireRole } from '@/hooks/useRequireRole';
import userManagementAPI, { userManagementUtils, EnhancedUserData } from '@/lib/api/userManagement';

// Enhanced mock data for comprehensive user management
const mockUsers = [
  {
    id: '1',
    email: 'john.doe@example.com',
    name: 'John Doe',
    role: 'BUYER',
    status: 'active',
    kycLevel: 'verified',
    kycStatus: 'approved',
    createdAt: 1704067200000, // 2024-01-01
    lastLogin: 1704153600000, // 2024-01-02
    lastActivity: 1704157200000, // 2024-01-02
    escrowsCount: 5,
    totalVolume: 25000,
    phone: '+1-555-0123',
    country: 'USA',
    ipAddress: '192.168.1.100',
    deviceInfo: 'Chrome 120.0 / Windows 11',
    riskScore: 15,
    flags: ['high_volume', 'verified_phone'],
    notes: 'Reliable buyer, completes transactions quickly',
    twoFactorEnabled: true,
    emailVerified: true,
    phoneVerified: true,
    loginAttempts: 0,
    failedLogins: 0,
    accountAge: '5 days',
    complianceStatus: 'compliant',
    restrictions: [],
    // Enhanced data
    tradingLimits: {
      daily: 50000,
      monthly: 500000,
      singleTransaction: 25000,
    },
    paymentMethods: {
      bankAccounts: [
        {
          id: 'bank1',
          accountNumber: '****1234',
          bankName: 'Chase Bank',
          verified: true,
        }
      ],
      cryptoWallets: [
        {
          id: 'crypto1',
          address: '0x1234...5678',
          network: 'Ethereum',
          verified: true,
        }
      ],
    },
    dealsWithGold: true, // Only for users involved in gold/mineral escrow
    goldHoldings: {
      totalWeight: 500, // grams
      purity: 99.9,
      storageLocation: 'Brink\'s Secure Storage',
      insuranceStatus: 'insured',
      lastValuation: 32500,
      valuationDate: 1703462400000, // 2023-12-25
    },
    escrowHistory: {
      total: 5,
      successful: 5,
      failed: 0,
      totalVolume: 25000,
      averageTransactionSize: 5000,
    },
    disputeHistory: {
      initiated: 0,
      involved: 1,
      resolved: 1,
      won: 1,
      lost: 0,
    },
    securitySettings: {
      ipWhitelist: ['192.168.1.100', '192.168.1.101'],
      geographicRestrictions: [],
      deviceManagement: {
        authorizedDevices: [
          {
            deviceId: 'device1',
            deviceInfo: 'Chrome 120.0 / Windows 11',
            lastUsed: 1704153600000, // 2024-01-02
            trusted: true,
          }
        ],
      },
      sessionManagement: {
        activeSessions: [
          {
            sessionId: 'session1',
            deviceInfo: 'Chrome 120.0 / Windows 11',
            ipAddress: '192.168.1.100',
            lastActivity: Date.now() - (30 * 60 * 1000),
          }
        ],
      },
    },
    auditTrail: [
      {
        action: 'account_created',
        adminId: 'admin1',
        timestamp: 1704067200000, // 2024-01-01
        reason: 'New user registration',
        metadata: { source: 'web_registration' },
      }
    ],
    updatedAt: 1704153600000, // 2024-01-02
  },
  {
    id: '2',
    email: 'jane.smith@example.com',
    name: 'Jane Smith',
    role: 'SELLER',
    status: 'active',
    kycLevel: 'pending',
    kycStatus: 'under_review',
    createdAt: '2024-01-10',
    lastLogin: '2024-01-19 09:15',
    lastActivity: '2024-01-19 16:20',
    escrowsCount: 3,
    totalVolume: '$15,000',
    phone: '+1-555-0456',
    country: 'Canada',
    ipAddress: '192.168.1.101',
    deviceInfo: 'Safari 17.0 / macOS 14',
    riskScore: 45,
    flags: ['kyc_pending', 'new_user'],
    notes: 'New seller, KYC documents submitted',
    twoFactorEnabled: false,
    emailVerified: true,
    phoneVerified: false,
    loginAttempts: 2,
    failedLogins: 1,
    accountAge: '10 days',
    complianceStatus: 'pending',
    restrictions: ['kyc_required'],
    // Enhanced data
    dealsWithGold: false, // Regular seller, not involved in gold/mineral escrow
    tradingLimits: {
      daily: 25000,
      monthly: 250000,
      singleTransaction: 15000,
    },
    paymentMethods: {
      bankAccounts: [
        {
          id: 'bank2',
          accountNumber: '****5678',
          bankName: 'Royal Bank of Canada',
          verified: false,
        }
      ],
      cryptoWallets: [],
    },
    goldHoldings: null, // No gold holdings for non-gold users
    escrowHistory: {
      total: 3,
      successful: 2,
      failed: 1,
      totalVolume: 15000,
      averageTransactionSize: 5000,
    },
    disputeHistory: {
      initiated: 0,
      involved: 0,
      resolved: 0,
      won: 0,
      lost: 0,
    },
    securitySettings: {
      ipWhitelist: [],
      geographicRestrictions: [],
      deviceManagement: {
        authorizedDevices: [],
      },
      sessionManagement: {
        activeSessions: [],
      },
    },
    auditTrail: [
      {
        action: 'account_created',
        adminId: 'admin1',
        timestamp: 1703376000000, // 2023-12-24
        reason: 'New user registration',
        metadata: { source: 'web_registration' },
      }
    ],
    updatedAt: 1704067200000, // 2024-01-01
  },
  {
    id: '3',
    email: 'bob.wilson@example.com',
    name: 'Bob Wilson',
    role: 'BROKER',
    status: 'suspended',
    kycLevel: 'verified',
    kycStatus: 'approved',
    createdAt: '2024-01-05',
    lastLogin: '2024-01-18 11:30',
    lastActivity: '2024-01-18 12:45',
    escrowsCount: 12,
    totalVolume: '$75,000',
    phone: '+1-555-0789',
    country: 'UK',
    ipAddress: '192.168.1.102',
    deviceInfo: 'Firefox 121.0 / Ubuntu 22.04',
    riskScore: 85,
    flags: ['suspended', 'high_risk', 'multiple_disputes'],
    notes: 'Suspended due to multiple dispute violations',
    twoFactorEnabled: true,
    emailVerified: true,
    phoneVerified: true,
    loginAttempts: 5,
    failedLogins: 3,
    accountAge: '15 days',
    complianceStatus: 'violation',
    restrictions: ['trading_suspended', 'dispute_restricted'],
    // Enhanced data
    dealsWithGold: true, // Broker involved in gold/mineral escrow
    tradingLimits: {
      daily: 100000,
      monthly: 1000000,
      singleTransaction: 50000,
    },
    paymentMethods: {
      bankAccounts: [
        {
          id: 'bank3',
          accountNumber: '****9012',
          bankName: 'Barclays Bank',
          verified: true,
        }
      ],
      cryptoWallets: [
        {
          id: 'crypto3',
          address: '0x5678...9012',
          network: 'Ethereum',
          verified: true,
        }
      ],
    },
    goldHoldings: {
      totalWeight: 250, // grams
      purity: 99.5,
      storageLocation: 'HSBC Secure Storage',
      insuranceStatus: 'insured',
      lastValuation: 16250,
      valuationDate: 1703376000000, // 2023-12-24
    },
    escrowHistory: {
      total: 12,
      successful: 8,
      failed: 4,
      totalVolume: 75000,
      averageTransactionSize: 6250,
    },
    disputeHistory: {
      initiated: 2,
      involved: 5,
      resolved: 3,
      won: 1,
      lost: 2,
    },
    securitySettings: {
      ipWhitelist: ['192.168.1.102'],
      geographicRestrictions: [],
      deviceManagement: {
        authorizedDevices: [
          {
            deviceId: 'device3',
            deviceInfo: 'Firefox 121.0 / Ubuntu 22.04',
            lastUsed: 1704153600000, // 2024-01-02
            trusted: true,
          }
        ],
      },
      sessionManagement: {
        activeSessions: [],
      },
    },
    auditTrail: [
      {
        action: 'account_suspended',
        adminId: 'admin1',
        timestamp: 1704067200000, // 2024-01-01
        reason: 'Multiple dispute violations',
        metadata: { disputes: 5 },
      }
    ],
    updatedAt: 1704067200000, // 2024-01-01
  },
  {
    id: '4',
    email: 'alice.brown@example.com',
    name: 'Alice Brown',
    role: 'BUYER',
    status: 'active',
    kycLevel: 'verified',
    kycStatus: 'approved',
    createdAt: '2024-01-12',
    lastLogin: '2024-01-20 08:45',
    lastActivity: '2024-01-20 14:15',
    escrowsCount: 8,
    totalVolume: '$45,000',
    phone: '+1-555-0321',
    country: 'Australia',
    ipAddress: '192.168.1.103',
    deviceInfo: 'Edge 120.0 / Windows 10',
    riskScore: 8,
    flags: ['premium_user', 'fast_payer'],
    notes: 'Premium buyer, excellent payment history',
    twoFactorEnabled: true,
    emailVerified: true,
    phoneVerified: true,
    loginAttempts: 0,
    failedLogins: 0,
    accountAge: '8 days',
    complianceStatus: 'compliant',
    restrictions: [],
    // Enhanced data
    dealsWithGold: false, // Regular buyer, not involved in gold/mineral escrow
    tradingLimits: {
      daily: 75000,
      monthly: 750000,
      singleTransaction: 45000,
    },
    paymentMethods: {
      bankAccounts: [
        {
          id: 'bank4',
          accountNumber: '****3456',
          bankName: 'Commonwealth Bank',
          verified: true,
        }
      ],
      cryptoWallets: [
        {
          id: 'crypto4',
          address: '0x3456...7890',
          network: 'Bitcoin',
          verified: true,
        }
      ],
    },
    goldHoldings: null, // No gold holdings for non-gold users
    escrowHistory: {
      total: 8,
      successful: 8,
      failed: 0,
      totalVolume: 45000,
      averageTransactionSize: 5625,
    },
    disputeHistory: {
      initiated: 0,
      involved: 0,
      resolved: 0,
      won: 0,
      lost: 0,
    },
    securitySettings: {
      ipWhitelist: ['192.168.1.103'],
      geographicRestrictions: [],
      deviceManagement: {
        authorizedDevices: [
          {
            deviceId: 'device4',
            deviceInfo: 'Edge 120.0 / Windows 10',
            lastUsed: 1704157200000, // 2024-01-02
            trusted: true,
          }
        ],
      },
      sessionManagement: {
        activeSessions: [
          {
            sessionId: 'session4',
            deviceInfo: 'Edge 120.0 / Windows 10',
            ipAddress: '192.168.1.103',
            lastActivity: Date.now() - (30 * 60 * 1000),
          }
        ],
      },
    },
    auditTrail: [
      {
        action: 'account_created',
        adminId: 'admin1',
        timestamp: 1703289600000, // 2023-12-23
        reason: 'New user registration',
        metadata: { source: 'web_registration' },
      }
    ],
    updatedAt: 1704157200000, // 2024-01-02
  },
  {
    id: '5',
    email: 'charlie.davis@example.com',
    name: 'Charlie Davis',
    role: 'SELLER',
    status: 'inactive',
    kycLevel: 'unverified',
    kycStatus: 'rejected',
    createdAt: '2024-01-08',
    lastLogin: '2024-01-15 16:20',
    lastActivity: '2024-01-15 17:30',
    escrowsCount: 2,
    totalVolume: '$8,000',
    phone: '+1-555-0654',
    country: 'Germany',
    ipAddress: '192.168.1.104',
    deviceInfo: 'Chrome 119.0 / macOS 13',
    riskScore: 92,
    flags: ['inactive', 'kyc_rejected', 'suspicious_activity'],
    notes: 'KYC rejected, account inactive',
    twoFactorEnabled: false,
    emailVerified: true,
    phoneVerified: false,
    loginAttempts: 8,
    failedLogins: 6,
    accountAge: '12 days',
    complianceStatus: 'non_compliant',
    restrictions: ['kyc_required', 'trading_suspended'],
    // Enhanced data
    dealsWithGold: false, // Regular seller, not involved in gold/mineral escrow
    tradingLimits: {
      daily: 10000,
      monthly: 100000,
      singleTransaction: 8000,
    },
    paymentMethods: {
      bankAccounts: [
        {
          id: 'bank5',
          accountNumber: '****7890',
          bankName: 'Deutsche Bank',
          verified: false,
        }
      ],
      cryptoWallets: [],
    },
    goldHoldings: null, // No gold holdings for non-gold users
    escrowHistory: {
      total: 2,
      successful: 1,
      failed: 1,
      totalVolume: 8000,
      averageTransactionSize: 4000,
    },
    disputeHistory: {
      initiated: 0,
      involved: 0,
      resolved: 0,
      won: 0,
      lost: 0,
    },
    securitySettings: {
      ipWhitelist: [],
      geographicRestrictions: [],
      deviceManagement: {
        authorizedDevices: [],
      },
      sessionManagement: {
        activeSessions: [],
      },
    },
    auditTrail: [
      {
        action: 'kyc_rejected',
        adminId: 'admin1',
        timestamp: 1704067200000, // 2024-01-01
        reason: 'KYC documents rejected',
        metadata: { reason: 'invalid_documents' },
      }
    ],
    updatedAt: 1704067200000, // 2024-01-01
  },
];

const UsersPage = () => {
  // Require admin or operator role
  useRequireRole(['ADMIN', 'OPERATOR']);

  const [users, setUsers] = useState(mockUsers);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [kycFilter, setKycFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [userDetailDialogOpen, setUserDetailDialogOpen] = useState(false);
  const [bulkActionDialogOpen, setBulkActionDialogOpen] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [activeTab, setActiveTab] = useState(0);
  const [kycReviewDialogOpen, setKycReviewDialogOpen] = useState(false);
  const [securityDialogOpen, setSecurityDialogOpen] = useState(false);
  
  // New dialog states
  const [tradingLimitsDialogOpen, setTradingLimitsDialogOpen] = useState(false);
  const [goldHoldingsDialogOpen, setGoldHoldingsDialogOpen] = useState(false);
  const [bulkOperationsDialogOpen, setBulkOperationsDialogOpen] = useState(false);
  const [securityTab, setSecurityTab] = useState(0);
  const [bulkOperation, setBulkOperation] = useState('');
  const [bulkParameters, setBulkParameters] = useState<any>({});
  const [bulkOperationReason, setBulkOperationReason] = useState('');
  const [isClient, setIsClient] = useState(false);

  // Prevent hydration mismatch by only rendering formatted dates on client
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Helper function for safe date formatting
  const formatDate = (timestamp: number | string, format: 'date' | 'datetime' = 'date') => {
    if (!isClient) return 'Loading...';
    const date = new Date(timestamp);
    return format === 'datetime' ? date.toLocaleString() : date.toLocaleDateString();
  };

  // Helper function for safe number formatting
  const formatNumber = (value: number) => {
    if (!isClient) return 'Loading...';
    return value.toLocaleString();
  };

  // Filter users based on search and filters
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.phone.includes(searchQuery);
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesKyc = kycFilter === 'all' || user.kycLevel === kycFilter;
    
    return matchesSearch && matchesStatus && matchesRole && matchesKyc;
  });

  const handleEditUser = (user: any) => {
    setSelectedUser(user);
    setEditDialogOpen(true);
  };

  const handleViewUserDetails = (user: any) => {
    setSelectedUser(user);
    setUserDetailDialogOpen(true);
  };

  const handleKycReview = (user: any) => {
    setSelectedUser(user);
    setKycReviewDialogOpen(true);
  };

  const handleSecuritySettings = (user: any) => {
    setSelectedUser(user);
    setSecurityDialogOpen(true);
  };

  const handleUpdateUser = (updatedUser: any) => {
    setUsers(users.map(user => 
      user.id === updatedUser.id ? updatedUser : user
    ));
    setEditDialogOpen(false);
    setSelectedUser(null);
  };

  const handleSuspendUser = (userId: string) => {
    setUsers(users.map(user => 
      user.id === userId 
        ? { ...user, status: user.status === 'suspended' ? 'active' : 'suspended' }
        : user
    ));
  };

  const handleBulkAction = (action) => {
    // Implement bulk actions
    console.log(`Bulk action: ${action} on users:`, selectedUsers);
    setBulkActionDialogOpen(false);
    setSelectedUsers([]);
  };

  // New handler functions
  const handleTradingLimits = (user: any) => {
    setSelectedUser(user);
    setTradingLimitsDialogOpen(true);
  };

  const handleGoldHoldings = (user: any) => {
    setSelectedUser(user);
    setGoldHoldingsDialogOpen(true);
  };

  const handleBulkOperations = () => {
    setBulkOperationsDialogOpen(true);
  };

  const handleUpdateTradingLimits = async () => {
    try {
      // Implementation for updating trading limits
      console.log('Updating trading limits for user:', selectedUser.id);
      setTradingLimitsDialogOpen(false);
    } catch (error) {
      console.error('Error updating trading limits:', error);
    }
  };

  const handleUpdateSecuritySettings = async () => {
    try {
      // Implementation for updating security settings
      console.log('Updating security settings for user:', selectedUser.id);
      setSecurityDialogOpen(false);
    } catch (error) {
      console.error('Error updating security settings:', error);
    }
  };

  const handleUpdateGoldHoldings = async () => {
    try {
      // Implementation for updating gold holdings
      console.log('Updating gold holdings for user:', selectedUser.id);
      setGoldHoldingsDialogOpen(false);
    } catch (error) {
      console.error('Error updating gold holdings:', error);
    }
  };

  const handleBulkOperation = async () => {
    try {
      // Implementation for bulk operations
      console.log('Executing bulk operation:', bulkOperation, 'on users:', selectedUsers);
      setBulkOperationsDialogOpen(false);
      setSelectedUsers([]);
    } catch (error) {
      console.error('Error executing bulk operation:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'suspended': return 'error';
      case 'inactive': return 'warning';
      default: return 'default';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'error';
      case 'OPERATOR': return 'warning';
      case 'ARBITER': return 'info';
      case 'BUYER': return 'primary';
      case 'SELLER': return 'secondary';
      case 'BROKER': return 'success';
      default: return 'default';
    }
  };

  const getKycColor = (kycLevel: string) => {
    switch (kycLevel) {
      case 'verified': return 'success';
      case 'pending': return 'warning';
      case 'unverified': return 'error';
      default: return 'default';
    }
  };

  const getRiskScoreColor = (score: number) => {
    if (score <= 20) return 'success';
    if (score <= 50) return 'warning';
    return 'error';
  };

  const getRiskScoreLabel = (score) => {
    if (score <= 20) return 'Low';
    if (score <= 50) return 'Medium';
    return 'High';
  };

  return (
    <PageContainer title="User Management" description="Comprehensive user management and control">
      <Box sx={{ p: 3 }}>
        {/* Header with essential stats */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card sx={{ mb: 3, background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 249, 250, 0.9) 100%)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255, 215, 0, 0.2)' }}>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700, background: 'linear-gradient(45deg, #FFC107, #FF9800)', backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    👥 User Management
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Full control over user accounts, roles, and security
                  </Typography>
                </Box>
                <Stack direction="row" spacing={2}>
                  <Button 
                    variant="outlined" 
                    startIcon={<IconDownload />}
                    sx={{ borderColor: 'rgba(255, 215, 0, 0.3)', color: '#2c3e50' }}
                  >
                    Export Users
                  </Button>
                  <Button 
                    variant="outlined" 
                    startIcon={<IconActivity />}
                    onClick={handleBulkOperations}
                    sx={{ borderColor: 'rgba(255, 215, 0, 0.3)', color: '#2c3e50' }}
                  >
                    Bulk Operations
                  </Button>
                  <Button 
                    variant="contained" 
                    startIcon={<IconUserPlus />}
                    sx={{ 
                      background: 'linear-gradient(45deg, #FFC107, #FF9800)',
                                              '&:hover': { background: 'linear-gradient(45deg, #FF9800, #FFC107)' }
                    }}
                  >
                    Add User
                  </Button>
                </Stack>
              </Stack>
              
              <Grid container spacing={3}>
                <Grid size={{ xs: 6, sm: 3 }}>
                  <Box textAlign="center" sx={{ p: 2, borderRadius: 2, background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.1) 0%, rgba(76, 175, 80, 0.05) 100%)', border: '1px solid rgba(76, 175, 80, 0.2)' }}>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#2e7d32' }}>
                      {users.length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Users
                    </Typography>
                  </Box>
                </Grid>
                <Grid size={{ xs: 6, sm: 3 }}>
                  <Box textAlign="center" sx={{ p: 2, borderRadius: 2, background: 'linear-gradient(135deg, rgba(33, 150, 243, 0.1) 0%, rgba(33, 150, 243, 0.05) 100%)', border: '1px solid rgba(33, 150, 243, 0.2)' }}>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#1976d2' }}>
                      {users.filter(u => u.status === 'active').length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Active Users
                    </Typography>
                  </Box>
                </Grid>
                <Grid size={{ xs: 6, sm: 3 }}>
                  <Box textAlign="center" sx={{ p: 2, borderRadius: 2, background: 'linear-gradient(135deg, rgba(255, 152, 0, 0.1) 0%, rgba(255, 152, 0, 0.05) 100%)', border: '1px solid rgba(255, 152, 0, 0.2)' }}>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#f57c00' }}>
                      {users.filter(u => u.kycLevel === 'pending').length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Pending KYC
                    </Typography>
                  </Box>
                </Grid>
                <Grid size={{ xs: 6, sm: 3 }}>
                  <Box textAlign="center" sx={{ p: 2, borderRadius: 2, background: 'linear-gradient(135deg, rgba(244, 67, 54, 0.1) 0%, rgba(244, 67, 54, 0.05) 100%)', border: '1px solid rgba(244, 67, 54, 0.2)' }}>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#d32f2f' }}>
                      {users.filter(u => u.riskScore > 70).length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      High Risk
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </motion.div>

        {/* Advanced Filters */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card sx={{ mb: 3, background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.8) 0%, rgba(248, 249, 250, 0.8) 100%)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255, 215, 0, 0.2)' }}>
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
                <TextField
                  placeholder="Search by name, email, or phone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <IconSearch size={20} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ minWidth: 300, flex: 1 }}
                />
                
                <FormControl sx={{ minWidth: 120 }}>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    label="Status"
                  >
                    <MenuItem value="all">All Status</MenuItem>
                    <MenuItem value="active">Active</MenuItem>
                    <MenuItem value="suspended">Suspended</MenuItem>
                    <MenuItem value="inactive">Inactive</MenuItem>
                  </Select>
                </FormControl>

                <FormControl sx={{ minWidth: 120 }}>
                  <InputLabel>Role</InputLabel>
                  <Select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    label="Role"
                  >
                    <MenuItem value="all">All Roles</MenuItem>
                    <MenuItem value="BUYER">Buyer</MenuItem>
                    <MenuItem value="SELLER">Seller</MenuItem>
                    <MenuItem value="BROKER">Broker</MenuItem>
                    <MenuItem value="ADMIN">Admin</MenuItem>
                    <MenuItem value="OPERATOR">Operator</MenuItem>
                    <MenuItem value="ARBITER">Arbiter</MenuItem>
                  </Select>
                </FormControl>

                <FormControl sx={{ minWidth: 120 }}>
                  <InputLabel>KYC Level</InputLabel>
                  <Select
                    value={kycFilter}
                    onChange={(e) => setKycFilter(e.target.value)}
                    label="KYC Level"
                  >
                    <MenuItem value="all">All KYC</MenuItem>
                    <MenuItem value="verified">Verified</MenuItem>
                    <MenuItem value="pending">Pending</MenuItem>
                    <MenuItem value="unverified">Unverified</MenuItem>
                  </Select>
                </FormControl>

                <Button
                  variant="outlined"
                  startIcon={<IconRefresh />}
                  onClick={() => {
                    setSearchQuery('');
                    setStatusFilter('all');
                    setRoleFilter('all');
                    setKycFilter('all');
                  }}
                  sx={{ borderColor: 'rgba(255, 215, 0, 0.3)', color: '#2c3e50' }}
                >
                  Clear
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </motion.div>

        {/* Users Table */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card sx={{ background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 249, 250, 0.9) 100%)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255, 215, 0, 0.2)' }}>
            <CardContent>
              <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 2 }}>
                <Table>
                  <TableHead>
                    <TableRow sx={{ background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.1) 0%, rgba(255, 215, 0, 0.05) 100%)' }}>
                      <TableCell sx={{ fontWeight: 600 }}>User</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Role & Status</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>KYC & Risk</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Activity</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Security</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id} hover sx={{ '&:hover': { background: 'rgba(255, 215, 0, 0.05)' } }}>
                        <TableCell>
                          <Stack direction="row" spacing={2} alignItems="center">
                            <Avatar sx={{ bgcolor: 'primary.main', width: 40, height: 40 }}>
                              {user.name.charAt(0)}
                            </Avatar>
                            <Box>
                              <Typography variant="subtitle2" fontWeight="bold">
                                {user.name}
                              </Typography>
                              <Typography variant="body2" color="textSecondary">
                                {user.email}
                              </Typography>
                              <Typography variant="caption" color="textSecondary">
                                {user.phone}
                              </Typography>
                            </Box>
                          </Stack>
                        </TableCell>
                        <TableCell>
                          <Stack spacing={1}>
                            <Chip
                              label={user.role}
                              color={getRoleColor(user.role)}
                              size="small"
                              variant="outlined"
                            />
                            <Chip
                              label={user.status}
                              color={getStatusColor(user.status)}
                              size="small"
                            />
                          </Stack>
                        </TableCell>
                        <TableCell>
                          <Stack spacing={1}>
                            <Chip
                              label={user.kycLevel}
                              color={getKycColor(user.kycLevel)}
                              size="small"
                              variant="outlined"
                            />
                            <Chip
                              label={`Risk: ${getRiskScoreLabel(user.riskScore)}`}
                              color={getRiskScoreColor(user.riskScore)}
                              size="small"
                              icon={<IconAlertTriangle size={12} />}
                            />
                          </Stack>
                        </TableCell>
                        <TableCell>
                          <Stack spacing={0.5}>
                            <Typography variant="body2" fontWeight="bold">
                              {user.escrowsCount} escrows
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                              {user.totalVolume}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                              Last: {user.lastActivity}
                            </Typography>
                          </Stack>
                        </TableCell>
                        <TableCell>
                          <Stack direction="row" spacing={1} alignItems="center">
                            {user.twoFactorEnabled && (
                              <Tooltip title="2FA Enabled">
                                <IconShieldCheck size={16} color="green" />
                              </Tooltip>
                            )}
                            {user.emailVerified && (
                              <Tooltip title="Email Verified">
                                <IconCheck size={16} color="green" />
                              </Tooltip>
                            )}
                            {user.phoneVerified && (
                              <Tooltip title="Phone Verified">
                                <IconPhone size={16} color="green" />
                              </Tooltip>
                            )}
                            {user.failedLogins > 0 && (
                              <Tooltip title={`${user.failedLogins} failed logins`}>
                                <IconAlertTriangle size={16} color="orange" />
                              </Tooltip>
                            )}
                          </Stack>
                        </TableCell>
                                                 <TableCell>
                           <Stack direction="row" spacing={1}>
                             <Tooltip title="View Details">
                               <IconButton
                                 size="small"
                                 color="primary"
                                 onClick={() => handleViewUserDetails(user)}
                               >
                                 <IconEye size={16} />
                               </IconButton>
                             </Tooltip>
                             <Tooltip title="Edit User">
                               <IconButton
                                 size="small"
                                 color="primary"
                                 onClick={() => handleEditUser(user)}
                               >
                                 <IconEdit size={16} />
                               </IconButton>
                             </Tooltip>
                             <Tooltip title="Trading Limits">
                               <IconButton
                                 size="small"
                                 color="success"
                                 onClick={() => handleTradingLimits(user)}
                               >
                                 <IconSettings size={16} />
                               </IconButton>
                             </Tooltip>
                                                           <Tooltip title="Review KYC">
                                <IconButton
                                  size="small"
                                  color="warning"
                                  onClick={() => handleKycReview(user)}
                                >
                                  <IconCertificate size={16} />
                                </IconButton>
                              </Tooltip>
                             <Tooltip title="Security Settings">
                               <IconButton
                                 size="small"
                                 color="info"
                                 onClick={() => handleSecuritySettings(user)}
                               >
                                 <IconShield size={16} />
                               </IconButton>
                             </Tooltip>
                             <Tooltip title="Trading Limits">
                               <IconButton
                                 size="small"
                                 color="primary"
                                 onClick={() => handleTradingLimits(user)}
                               >
                                 <IconCurrencyDollar size={16} />
                               </IconButton>
                             </Tooltip>
                             <Tooltip title={user.status === 'suspended' ? 'Activate User' : 'Suspend User'}>
                               <IconButton
                                 size="small"
                                 color={user.status === 'suspended' ? 'success' : 'warning'}
                                 onClick={() => handleSuspendUser(user.id)}
                               >
                                 {user.status === 'suspended' ? <IconUserCheck size={16} /> : <IconUserX size={16} />}
                               </IconButton>
                             </Tooltip>
                             {user.dealsWithGold && (
                               <Tooltip title="Gold Holdings">
                                 <IconButton
                                   size="small"
                                   color="warning"
                                   onClick={() => handleGoldHoldings(user)}
                                 >
                                   <IconDatabase size={16} />
                                 </IconButton>
                               </Tooltip>
                             )}
                           </Stack>
                         </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* User Detail Dialog */}
        <Dialog 
          open={userDetailDialogOpen} 
          onClose={() => setUserDetailDialogOpen(false)} 
          maxWidth="md" 
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 3,
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 249, 250, 0.95) 100%)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 215, 0, 0.3)',
            }
          }}
        >
          <DialogTitle sx={{ 
            background: 'linear-gradient(45deg, #FFC107, #FF9800)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontWeight: 700,
            fontSize: '1.5rem',
            textAlign: 'center',
            py: 3,
          }}>
            User Details - {selectedUser?.name}
          </DialogTitle>
          <DialogContent>
            {selectedUser && (
              <Box sx={{ mt: 2 }}>
                <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)} sx={{ mb: 3 }}>
                  <Tab label="Profile" />
                  <Tab label="Financial" />
                  {selectedUser.dealsWithGold && <Tab label="Gold Holdings" />}
                  <Tab label="Activity" />
                  <Tab label="Security" />
                  <Tab label="Compliance" />
                  <Tab label="Notes" />
                </Tabs>

                {activeTab === 0 && (
                  <Grid container spacing={3}>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Card sx={{ p: 2, background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.8) 0%, rgba(248, 249, 250, 0.8) 100%)', border: '1px solid rgba(255, 215, 0, 0.2)' }}>
                        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>Basic Information</Typography>
                        <Stack spacing={2}>
                          <Box>
                            <Typography variant="body2" color="textSecondary">Name</Typography>
                            <Typography variant="body1" fontWeight="bold">{selectedUser.name}</Typography>
                          </Box>
                          <Box>
                            <Typography variant="body2" color="textSecondary">Email</Typography>
                            <Typography variant="body1">{selectedUser.email}</Typography>
                          </Box>
                          <Box>
                            <Typography variant="body2" color="textSecondary">Phone</Typography>
                            <Typography variant="body1">{selectedUser.phone}</Typography>
                          </Box>
                          <Box>
                            <Typography variant="body2" color="textSecondary">Country</Typography>
                            <Typography variant="body1">{selectedUser.country}</Typography>
                          </Box>
                                                     <Box>
                             <Typography variant="body2" color="textSecondary">Member Since</Typography>
                             <Typography variant="body1">{formatDate(selectedUser.createdAt)}</Typography>
                           </Box>
                           <Box>
                             <Typography variant="body2" color="textSecondary">Last Login</Typography>
                             <Typography variant="body1">{formatDate(selectedUser.lastLogin)}</Typography>
                           </Box>
                        </Stack>
                      </Card>
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Card sx={{ p: 2, background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.8) 0%, rgba(248, 249, 250, 0.8) 100%)', border: '1px solid rgba(255, 215, 0, 0.2)' }}>
                        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>Account Status</Typography>
                        <Stack spacing={2}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="body2" color="textSecondary">Status</Typography>
                            <Chip label={selectedUser.status} color={getStatusColor(selectedUser.status)} size="small" />
                          </Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="body2" color="textSecondary">Role</Typography>
                            <Chip label={selectedUser.role} color={getRoleColor(selectedUser.role)} size="small" variant="outlined" />
                          </Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="body2" color="textSecondary">KYC Level</Typography>
                            <Chip label={selectedUser.kycLevel} color={getKycColor(selectedUser.kycLevel)} size="small" />
                          </Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="body2" color="textSecondary">Risk Score</Typography>
                            <Chip 
                              label={`${selectedUser.riskScore} - ${getRiskScoreLabel(selectedUser.riskScore)}`} 
                              color={getRiskScoreColor(selectedUser.riskScore)} 
                              size="small" 
                            />
                          </Box>
                        </Stack>
                      </Card>
                    </Grid>
                  </Grid>
                )}

                {activeTab === 1 && (
                  <Grid container spacing={3}>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Card sx={{ p: 2, background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.8) 0%, rgba(248, 249, 250, 0.8) 100%)', border: '1px solid rgba(255, 215, 0, 0.2)' }}>
                        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>Trading Limits</Typography>
                        <Stack spacing={2}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="body2" color="textSecondary">Daily Limit</Typography>
                                                         <Typography variant="body1" fontWeight="bold">${formatNumber(selectedUser.tradingLimits.daily)}</Typography>
                          </Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="body2" color="textSecondary">Monthly Limit</Typography>
                                                         <Typography variant="body1" fontWeight="bold">${formatNumber(selectedUser.tradingLimits.monthly)}</Typography>
                          </Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="body2" color="textSecondary">Single Transaction</Typography>
                                                         <Typography variant="body1" fontWeight="bold">${formatNumber(selectedUser.tradingLimits.singleTransaction)}</Typography>
                          </Box>
                          <Button 
                            variant="outlined" 
                            size="small" 
                            onClick={() => handleTradingLimits(selectedUser)}
                            startIcon={<IconEdit size={16} />}
                          >
                            Update Limits
                          </Button>
                        </Stack>
                      </Card>
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Card sx={{ p: 2, background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.8) 0%, rgba(248, 249, 250, 0.8) 100%)', border: '1px solid rgba(255, 215, 0, 0.2)' }}>
                        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>Payment Methods</Typography>
                        <Stack spacing={2}>
                          <Box>
                            <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>Bank Accounts</Typography>
                            {selectedUser.paymentMethods.bankAccounts.length > 0 ? (
                              <Stack spacing={1}>
                                {selectedUser.paymentMethods.bankAccounts.map((account, index) => (
                                  <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Typography variant="body2">****{account.accountNumber.slice(-4)}</Typography>
                                    <Chip 
                                      label={account.verified ? 'Verified' : 'Pending'} 
                                      color={account.verified ? 'success' : 'warning'} 
                                      size="small" 
                                    />
                                  </Box>
                                ))}
                              </Stack>
                            ) : (
                              <Typography variant="body2" color="textSecondary">No bank accounts</Typography>
                            )}
                          </Box>
                          <Box>
                            <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>Crypto Wallets</Typography>
                            {selectedUser.paymentMethods.cryptoWallets.length > 0 ? (
                              <Stack spacing={1}>
                                {selectedUser.paymentMethods.cryptoWallets.map((wallet, index) => (
                                  <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                                      {wallet.address.slice(0, 8)}...{wallet.address.slice(-6)}
                                    </Typography>
                                    <Chip 
                                      label={wallet.verified ? 'Verified' : 'Pending'} 
                                      color={wallet.verified ? 'success' : 'warning'} 
                                      size="small" 
                                    />
                                  </Box>
                                ))}
                              </Stack>
                            ) : (
                              <Typography variant="body2" color="textSecondary">No crypto wallets</Typography>
                            )}
                          </Box>
                        </Stack>
                      </Card>
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                      <Card sx={{ p: 2, background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.8) 0%, rgba(248, 249, 250, 0.8) 100%)', border: '1px solid rgba(255, 215, 0, 0.2)' }}>
                        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>Escrow History</Typography>
                        <Stack spacing={2}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="body2" color="textSecondary">Total Escrows</Typography>
                            <Typography variant="body1" fontWeight="bold">{selectedUser.escrowHistory.total}</Typography>
                          </Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="body2" color="textSecondary">Successful</Typography>
                            <Typography variant="body1" fontWeight="bold" color="success.main">{selectedUser.escrowHistory.successful}</Typography>
                          </Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="body2" color="textSecondary">Failed</Typography>
                            <Typography variant="body1" fontWeight="bold" color="error.main">{selectedUser.escrowHistory.failed}</Typography>
                          </Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="body2" color="textSecondary">Total Volume</Typography>
                                                         <Typography variant="body1" fontWeight="bold">${formatNumber(selectedUser.escrowHistory.totalVolume)}</Typography>
                          </Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="body2" color="textSecondary">Average Transaction</Typography>
                                                         <Typography variant="body1" fontWeight="bold">${formatNumber(selectedUser.escrowHistory.averageTransactionSize)}</Typography>
                          </Box>
                        </Stack>
                      </Card>
                    </Grid>
                  </Grid>
                )}

                                {activeTab === 2 && (
                  selectedUser.dealsWithGold ? (
                    <Grid container spacing={3}>
                      <Grid size={{ xs: 12, md: 6 }}>
                        <Card sx={{ p: 2, background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.8) 0%, rgba(248, 249, 250, 0.8) 100%)', border: '1px solid rgba(255, 215, 0, 0.2)' }}>
                          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>Gold Holdings Summary</Typography>
                          <Stack spacing={2}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Typography variant="body2" color="textSecondary">Total Weight</Typography>
                              <Typography variant="body1" fontWeight="bold" color="warning.main">
                                {selectedUser.goldHoldings.totalWeight >= 1000 
                                  ? `${(selectedUser.goldHoldings.totalWeight / 1000).toFixed(2)} kg` 
                                  : `${selectedUser.goldHoldings.totalWeight.toFixed(2)} g`}
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Typography variant="body2" color="textSecondary">Purity</Typography>
                              <Typography variant="body1" fontWeight="bold">{selectedUser.goldHoldings.purity}%</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Typography variant="body2" color="textSecondary">Current Value</Typography>
                              <Typography variant="body1" fontWeight="bold" color="success.main">
                                                                 ${formatNumber(selectedUser.goldHoldings.lastValuation)}
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Typography variant="body2" color="textSecondary">Insurance Status</Typography>
                              <Chip 
                                label={selectedUser.goldHoldings.insuranceStatus} 
                                color={selectedUser.goldHoldings.insuranceStatus === 'insured' ? 'success' : 'warning'} 
                                size="small" 
                              />
                            </Box>
                            <Button 
                              variant="outlined" 
                              size="small" 
                              onClick={() => handleGoldHoldings(selectedUser)}
                              startIcon={<IconEdit size={16} />}
                            >
                              Update Holdings
                            </Button>
                          </Stack>
                        </Card>
                      </Grid>
                      <Grid size={{ xs: 12, md: 6 }}>
                        <Card sx={{ p: 2, background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.8) 0%, rgba(248, 249, 250, 0.8) 100%)', border: '1px solid rgba(255, 215, 0, 0.2)' }}>
                          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>Storage & Verification</Typography>
                          <Stack spacing={2}>
                            <Box>
                              <Typography variant="body2" color="textSecondary">Storage Location</Typography>
                              <Typography variant="body1" fontWeight="bold">{selectedUser.goldHoldings.storageLocation}</Typography>
                            </Box>
                                                         <Box>
                               <Typography variant="body2" color="textSecondary">Last Valuation Date</Typography>
                               <Typography variant="body1">{formatDate(selectedUser.goldHoldings.valuationDate)}</Typography>
                             </Box>
                            <Box>
                              <Typography variant="body2" color="textSecondary">Purity Certification</Typography>
                              <Chip 
                                label={selectedUser.goldHoldings.purity >= 99.5 ? 'Investment Grade' : 'Commercial Grade'} 
                                color={selectedUser.goldHoldings.purity >= 99.5 ? 'success' : 'warning'} 
                                size="small" 
                              />
                            </Box>
                            <Box>
                              <Typography variant="body2" color="textSecondary">Storage Security</Typography>
                              <Chip 
                                label="Vault Secured" 
                                color="success" 
                                size="small" 
                                icon={<IconShieldCheck size={12} />}
                              />
                            </Box>
                          </Stack>
                        </Card>
                      </Grid>
                      <Grid size={{ xs: 12 }}>
                        <Card sx={{ p: 2, background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.8) 0%, rgba(248, 249, 250, 0.8) 100%)', border: '1px solid rgba(255, 215, 0, 0.2)' }}>
                          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>Gold Transaction History</Typography>
                          <Stack spacing={2}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Typography variant="body2" color="textSecondary">Total Gold Purchases</Typography>
                              <Typography variant="body1" fontWeight="bold">24 transactions</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Typography variant="body2" color="textSecondary">Total Gold Sold</Typography>
                              <Typography variant="body1" fontWeight="bold">8 transactions</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Typography variant="body2" color="textSecondary">Net Gold Position</Typography>
                              <Typography variant="body1" fontWeight="bold" color="success.main">+{selectedUser.goldHoldings.totalWeight.toFixed(2)}g</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Typography variant="body2" color="textSecondary">Average Purchase Price</Typography>
                              <Typography variant="body1" fontWeight="bold">$2,150/oz</Typography>
                            </Box>
                          </Stack>
                        </Card>
                      </Grid>
                    </Grid>
                  ) : (
                    <Card sx={{ p: 4, textAlign: 'center', background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.8) 0%, rgba(248, 249, 250, 0.8) 100%)', border: '1px solid rgba(255, 215, 0, 0.2)' }}>
                      <IconCoin size={48} color="#ccc" style={{ marginBottom: '16px' }} />
                      <Typography variant="h6" color="textSecondary" sx={{ mb: 2 }}>
                        No Gold Holdings
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        This user is not involved in gold or mineral escrow deals.
                      </Typography>
                    </Card>
                                     )
                 )}

                {activeTab === (selectedUser.dealsWithGold ? 3 : 2) && (
                  <Grid container spacing={3}>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Card sx={{ p: 2, background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.8) 0%, rgba(248, 249, 250, 0.8) 100%)', border: '1px solid rgba(255, 215, 0, 0.2)' }}>
                        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>Recent Activity</Typography>
                        <Stack spacing={2}>
                                                     <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                             <Typography variant="body2" color="textSecondary">Last Login</Typography>
                             <Typography variant="body1">{formatDate(selectedUser.lastLogin, 'datetime')}</Typography>
                           </Box>
                           <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                             <Typography variant="body2" color="textSecondary">Last Activity</Typography>
                             <Typography variant="body1">{formatDate(selectedUser.lastActivity, 'datetime')}</Typography>
                           </Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="body2" color="textSecondary">Account Age</Typography>
                            <Typography variant="body1">{selectedUser.accountAge} days</Typography>
                          </Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="body2" color="textSecondary">Failed Logins</Typography>
                            <Typography variant="body1" color={selectedUser.failedLogins > 0 ? 'error.main' : 'success.main'}>
                              {selectedUser.failedLogins}
                            </Typography>
                          </Box>
                        </Stack>
                      </Card>
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Card sx={{ p: 2, background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.8) 0%, rgba(248, 249, 250, 0.8) 100%)', border: '1px solid rgba(255, 215, 0, 0.2)' }}>
                        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>Dispute History</Typography>
                        <Stack spacing={2}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="body2" color="textSecondary">Disputes Initiated</Typography>
                            <Typography variant="body1" fontWeight="bold">{selectedUser.disputeHistory.initiated}</Typography>
                          </Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="body2" color="textSecondary">Disputes Involved</Typography>
                            <Typography variant="body1" fontWeight="bold">{selectedUser.disputeHistory.involved}</Typography>
                          </Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="body2" color="textSecondary">Resolved</Typography>
                            <Typography variant="body1" fontWeight="bold" color="success.main">{selectedUser.disputeHistory.resolved}</Typography>
                          </Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="body2" color="textSecondary">Won/Lost</Typography>
                            <Typography variant="body1" fontWeight="bold">
                              {selectedUser.disputeHistory.won}/{selectedUser.disputeHistory.lost}
                            </Typography>
                          </Box>
                        </Stack>
                      </Card>
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                      <Card sx={{ p: 2, background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.8) 0%, rgba(248, 249, 250, 0.8) 100%)', border: '1px solid rgba(255, 215, 0, 0.2)' }}>
                        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>Activity Timeline</Typography>
                        <Stack spacing={2}>
                          {selectedUser.auditTrail.slice(0, 5).map((activity, index) => (
                            <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1, border: '1px solid rgba(0,0,0,0.1)', borderRadius: 1 }}>
                              <Box>
                                <Typography variant="body2" fontWeight="bold">{activity.action}</Typography>
                                <Typography variant="caption" color="textSecondary">{activity.reason}</Typography>
                              </Box>
                                                             <Typography variant="caption" color="textSecondary">
                                 {formatDate(activity.timestamp)}
                               </Typography>
                            </Box>
                          ))}
                        </Stack>
                      </Card>
                    </Grid>
                  </Grid>
                )}

                {activeTab === (selectedUser.dealsWithGold ? 4 : 3) && (
                  <Grid container spacing={3}>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Card sx={{ p: 2, background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.8) 0%, rgba(248, 249, 250, 0.8) 100%)', border: '1px solid rgba(255, 215, 0, 0.2)' }}>
                        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>Security Status</Typography>
                        <Stack spacing={2}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="body2" color="textSecondary">Two-Factor Authentication</Typography>
                            <Chip 
                              label={selectedUser.twoFactorEnabled ? 'Enabled' : 'Disabled'} 
                              color={selectedUser.twoFactorEnabled ? 'success' : 'error'} 
                              size="small" 
                            />
                          </Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="body2" color="textSecondary">Email Verification</Typography>
                            <Chip 
                              label={selectedUser.emailVerified ? 'Verified' : 'Unverified'} 
                              color={selectedUser.emailVerified ? 'success' : 'error'} 
                              size="small" 
                            />
                          </Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="body2" color="textSecondary">Phone Verification</Typography>
                            <Chip 
                              label={selectedUser.phoneVerified ? 'Verified' : 'Unverified'} 
                              color={selectedUser.phoneVerified ? 'success' : 'error'} 
                              size="small" 
                            />
                          </Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="body2" color="textSecondary">Failed Login Attempts</Typography>
                            <Chip 
                              label={selectedUser.failedLogins} 
                              color={selectedUser.failedLogins > 0 ? 'warning' : 'success'} 
                              size="small" 
                            />
                          </Box>
                          <Button 
                            variant="outlined" 
                            size="small" 
                            onClick={() => handleSecuritySettings(selectedUser)}
                            startIcon={<IconShield size={16} />}
                          >
                            Security Settings
                          </Button>
                        </Stack>
                      </Card>
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Card sx={{ p: 2, background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.8) 0%, rgba(248, 249, 250, 0.8) 100%)', border: '1px solid rgba(255, 215, 0, 0.2)' }}>
                        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>Device & Session Management</Typography>
                        <Stack spacing={2}>
                          <Box>
                            <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>Authorized Devices</Typography>
                            {selectedUser.securitySettings.deviceManagement.authorizedDevices.length > 0 ? (
                              <Stack spacing={1}>
                                {selectedUser.securitySettings.deviceManagement.authorizedDevices.slice(0, 3).map((device, index) => (
                                  <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>{device.deviceInfo}</Typography>
                                    <Chip 
                                      label={device.trusted ? 'Trusted' : 'New'} 
                                      color={device.trusted ? 'success' : 'warning'} 
                                      size="small" 
                                    />
                                  </Box>
                                ))}
                              </Stack>
                            ) : (
                              <Typography variant="body2" color="textSecondary">No devices registered</Typography>
                            )}
                          </Box>
                          <Box>
                            <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>Active Sessions</Typography>
                            <Typography variant="body2" fontWeight="bold">{selectedUser.securitySettings.sessionManagement.activeSessions.length} active</Typography>
                          </Box>
                        </Stack>
                      </Card>
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                      <Card sx={{ p: 2, background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.8) 0%, rgba(248, 249, 250, 0.8) 100%)', border: '1px solid rgba(255, 215, 0, 0.2)' }}>
                        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>Access Controls</Typography>
                        <Stack spacing={2}>
                          <Box>
                            <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>IP Whitelist</Typography>
                            {selectedUser.securitySettings.ipWhitelist.length > 0 ? (
                              <Stack direction="row" spacing={1} flexWrap="wrap">
                                {selectedUser.securitySettings.ipWhitelist.map((ip, index) => (
                                  <Chip key={index} label={ip} color="info" size="small" variant="outlined" />
                                ))}
                              </Stack>
                            ) : (
                              <Typography variant="body2" color="textSecondary">No IP restrictions</Typography>
                            )}
                          </Box>
                          <Box>
                            <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>Geographic Restrictions</Typography>
                            {selectedUser.securitySettings.geographicRestrictions.length > 0 ? (
                              <Stack direction="row" spacing={1} flexWrap="wrap">
                                {selectedUser.securitySettings.geographicRestrictions.map((country, index) => (
                                  <Chip key={index} label={country} color="warning" size="small" variant="outlined" />
                                ))}
                              </Stack>
                            ) : (
                              <Typography variant="body2" color="textSecondary">No geographic restrictions</Typography>
                            )}
                          </Box>
                        </Stack>
                      </Card>
                    </Grid>
                  </Grid>
                )}

                {activeTab === (selectedUser.dealsWithGold ? 5 : 4) && (
                  <Grid container spacing={3}>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Card sx={{ p: 2, background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.8) 0%, rgba(248, 249, 250, 0.8) 100%)', border: '1px solid rgba(255, 215, 0, 0.2)' }}>
                        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>Compliance Status</Typography>
                        <Stack spacing={2}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="body2" color="textSecondary">KYC Level</Typography>
                            <Chip 
                              label={selectedUser.kycLevel} 
                              color={getKycColor(selectedUser.kycLevel)} 
                              size="small" 
                            />
                          </Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="body2" color="textSecondary">KYC Status</Typography>
                            <Chip 
                              label={selectedUser.kycStatus} 
                              color={selectedUser.kycStatus === 'approved' ? 'success' : 'warning'} 
                              size="small" 
                            />
                          </Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="body2" color="textSecondary">Compliance Status</Typography>
                            <Chip 
                              label={selectedUser.complianceStatus} 
                              color={selectedUser.complianceStatus === 'compliant' ? 'success' : 'error'} 
                              size="small" 
                            />
                          </Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="body2" color="textSecondary">Risk Score</Typography>
                            <Chip 
                              label={`${selectedUser.riskScore} - ${getRiskScoreLabel(selectedUser.riskScore)}`} 
                              color={getRiskScoreColor(selectedUser.riskScore)} 
                              size="small" 
                            />
                          </Box>
                        </Stack>
                      </Card>
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Card sx={{ p: 2, background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.8) 0%, rgba(248, 249, 250, 0.8) 100%)', border: '1px solid rgba(255, 215, 0, 0.2)' }}>
                        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>Restrictions & Flags</Typography>
                        <Stack spacing={2}>
                          <Box>
                            <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>Current Restrictions</Typography>
                            {selectedUser.restrictions.length > 0 ? (
                              <Stack spacing={1}>
                                {selectedUser.restrictions.map((restriction, index) => (
                                  <Chip key={index} label={restriction} color="warning" size="small" variant="outlined" />
                                ))}
                              </Stack>
                            ) : (
                              <Typography variant="body2" color="success.main">No restrictions</Typography>
                            )}
                          </Box>
                          <Box>
                            <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>Flags</Typography>
                            <Stack direction="row" spacing={1} flexWrap="wrap">
                              {selectedUser.flags.map((flag, index) => (
                                <Chip key={index} label={flag} color="info" size="small" variant="outlined" />
                              ))}
                            </Stack>
                          </Box>
                        </Stack>
                      </Card>
                    </Grid>
                  </Grid>
                )}

                {activeTab === (selectedUser.dealsWithGold ? 6 : 5) && (
                  <Card sx={{ p: 2, background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.8) 0%, rgba(248, 249, 250, 0.8) 100%)', border: '1px solid rgba(255, 215, 0, 0.2)' }}>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>Admin Notes</Typography>
                    <TextField
                      multiline
                      rows={4}
                      fullWidth
                      defaultValue={selectedUser.notes}
                      placeholder="Add admin notes about this user..."
                      variant="outlined"
                    />
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>Admin Notes History</Typography>
                      <TextField
                        multiline
                        rows={3}
                        fullWidth
                        defaultValue={selectedUser.adminNotes}
                        placeholder="Internal admin notes..."
                        variant="outlined"
                      />
                    </Box>
                  </Card>
                )}
              </Box>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={() => setUserDetailDialogOpen(false)}>Close</Button>
            <Button variant="contained" onClick={() => handleEditUser(selectedUser)}>Edit User</Button>
          </DialogActions>
        </Dialog>

        {/* Edit User Dialog */}
        <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Edit User</DialogTitle>
          <DialogContent>
            {selectedUser && (
              <Stack spacing={3} sx={{ mt: 2 }}>
                <TextField
                  label="Name"
                  fullWidth
                  defaultValue={selectedUser.name}
                />
                <TextField
                  label="Email"
                  fullWidth
                  defaultValue={selectedUser.email}
                  disabled
                />
                <FormControl fullWidth>
                  <InputLabel>Role</InputLabel>
                  <Select
                    defaultValue={selectedUser.role}
                    label="Role"
                  >
                    <MenuItem value="BUYER">Buyer</MenuItem>
                    <MenuItem value="SELLER">Seller</MenuItem>
                    <MenuItem value="BROKER">Broker</MenuItem>
                    <MenuItem value="ADMIN">Admin</MenuItem>
                    <MenuItem value="OPERATOR">Operator</MenuItem>
                    <MenuItem value="ARBITER">Arbiter</MenuItem>
                  </Select>
                </FormControl>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    defaultValue={selectedUser.status}
                    label="Status"
                  >
                    <MenuItem value="active">Active</MenuItem>
                    <MenuItem value="suspended">Suspended</MenuItem>
                    <MenuItem value="inactive">Inactive</MenuItem>
                  </Select>
                </FormControl>
                <FormControl fullWidth>
                  <InputLabel>KYC Level</InputLabel>
                  <Select
                    defaultValue={selectedUser.kycLevel}
                    label="KYC Level"
                  >
                    <MenuItem value="verified">Verified</MenuItem>
                    <MenuItem value="pending">Pending</MenuItem>
                    <MenuItem value="unverified">Unverified</MenuItem>
                  </Select>
                </FormControl>
              </Stack>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
            <Button variant="contained" onClick={() => handleUpdateUser(selectedUser)}>
              Update User
            </Button>
          </DialogActions>
        </Dialog>

        {/* Trading Limits Dialog */}
        <Dialog open={tradingLimitsDialogOpen} onClose={() => setTradingLimitsDialogOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle sx={{ 
            background: 'linear-gradient(45deg, #FFC107, #FF9800)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontWeight: 700,
            textAlign: 'center',
          }}>
            💰 Trading Limits Management
          </DialogTitle>
          <DialogContent>
            {selectedUser && (
              <Stack spacing={3} sx={{ mt: 2 }}>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <TextField
                      label="Daily Limit ($)"
                      type="number"
                      fullWidth
                      defaultValue={selectedUser.tradingLimits?.daily || 0}
                      InputProps={{
                        startAdornment: <InputAdornment position="start">$</InputAdornment>,
                      }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <TextField
                      label="Monthly Limit ($)"
                      type="number"
                      fullWidth
                      defaultValue={selectedUser.tradingLimits?.monthly || 0}
                      InputProps={{
                        startAdornment: <InputAdornment position="start">$</InputAdornment>,
                      }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <TextField
                      label="Single Transaction Limit ($)"
                      type="number"
                      fullWidth
                      defaultValue={selectedUser.tradingLimits?.singleTransaction || 0}
                      InputProps={{
                        startAdornment: <InputAdornment position="start">$</InputAdornment>,
                      }}
                    />
                  </Grid>
                </Grid>
                <TextField
                  label="Reason for Update"
                  multiline
                  rows={3}
                  fullWidth
                  placeholder="Explain why you're updating these limits..."
                />
              </Stack>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setTradingLimitsDialogOpen(false)}>Cancel</Button>
            <Button variant="contained" onClick={() => handleUpdateTradingLimits()}>
              Update Limits
            </Button>
          </DialogActions>
        </Dialog>

        {/* Security Settings Dialog */}
        <Dialog open={securityDialogOpen} onClose={() => setSecurityDialogOpen(false)} maxWidth="lg" fullWidth>
          <DialogTitle sx={{ 
            background: 'linear-gradient(45deg, #FFC107, #FF9800)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontWeight: 700,
            textAlign: 'center',
          }}>
            🔒 Security Settings Management
          </DialogTitle>
          <DialogContent>
            {selectedUser && (
              <Stack spacing={3} sx={{ mt: 2 }}>
                <Tabs value={securityTab} onChange={(e, newValue) => setSecurityTab(newValue)}>
                  <Tab label="IP Whitelist" />
                  <Tab label="Device Management" />
                  <Tab label="Session Management" />
                  <Tab label="Geographic Restrictions" />
                </Tabs>

                {securityTab === 0 && (
                  <Box>
                    <Typography variant="h6" sx={{ mb: 2 }}>IP Address Whitelist</Typography>
                    <Stack spacing={2}>
                      {selectedUser.securitySettings?.ipWhitelist?.map((ip, index) => (
                        <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <TextField
                            value={ip}
                            fullWidth
                            size="small"
                          />
                          <IconButton color="error" size="small">
                            <IconTrash size={16} />
                          </IconButton>
                        </Box>
                      ))}
                      <Button variant="outlined" startIcon={<IconPlus />}>
                        Add IP Address
                      </Button>
                    </Stack>
                  </Box>
                )}

                {securityTab === 1 && (
                  <Box>
                    <Typography variant="h6" sx={{ mb: 2 }}>Authorized Devices</Typography>
                    <Stack spacing={2}>
                      {selectedUser.securitySettings?.deviceManagement?.authorizedDevices?.map((device, index) => (
                        <Card key={index} sx={{ p: 2 }}>
                          <Stack direction="row" justifyContent="space-between" alignItems="center">
                            <Box>
                              <Typography variant="subtitle2">{device.deviceInfo}</Typography>
                              <Typography variant="caption" color="text.secondary">
                                Last used: {userManagementUtils.getTimeAgo(device.lastUsed)}
                              </Typography>
                            </Box>
                            <Stack direction="row" spacing={1}>
                              <Chip 
                                label={device.trusted ? 'Trusted' : 'Untrusted'} 
                                color={device.trusted ? 'success' : 'warning'} 
                                size="small" 
                              />
                              <IconButton color="error" size="small">
                                <IconTrash size={16} />
                              </IconButton>
                            </Stack>
                          </Stack>
                        </Card>
                      ))}
                    </Stack>
                  </Box>
                )}

                {securityTab === 2 && (
                  <Box>
                    <Typography variant="h6" sx={{ mb: 2 }}>Active Sessions</Typography>
                    <Stack spacing={2}>
                      {selectedUser.securitySettings?.sessionManagement?.activeSessions?.map((session, index) => (
                        <Card key={index} sx={{ p: 2 }}>
                          <Stack direction="row" justifyContent="space-between" alignItems="center">
                            <Box>
                              <Typography variant="subtitle2">{session.deviceInfo}</Typography>
                              <Typography variant="caption" color="text.secondary">
                                IP: {session.ipAddress} • Last activity: {userManagementUtils.getTimeAgo(session.lastActivity)}
                              </Typography>
                            </Box>
                            <Button variant="outlined" color="error" size="small">
                              Force Logout
                            </Button>
                          </Stack>
                        </Card>
                      ))}
                    </Stack>
                  </Box>
                )}

                {securityTab === 3 && (
                  <Box>
                    <Typography variant="h6" sx={{ mb: 2 }}>Geographic Restrictions</Typography>
                    <Stack spacing={2}>
                      <TextField
                        label="Restricted Countries"
                        multiline
                        rows={3}
                        fullWidth
                        placeholder="Enter country codes separated by commas (e.g., US, CA, UK)"
                        defaultValue={selectedUser.securitySettings?.geographicRestrictions?.join(', ')}
                      />
                    </Stack>
                  </Box>
                )}
              </Stack>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setSecurityDialogOpen(false)}>Cancel</Button>
            <Button variant="contained" onClick={() => handleUpdateSecuritySettings()}>
              Update Security Settings
            </Button>
          </DialogActions>
        </Dialog>

        {/* Gold Holdings Dialog */}
        <Dialog open={goldHoldingsDialogOpen} onClose={() => setGoldHoldingsDialogOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle sx={{ 
            background: 'linear-gradient(45deg, #FFC107, #FF9800)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontWeight: 700,
            textAlign: 'center',
          }}>
            🏆 Gold Holdings Management
          </DialogTitle>
          <DialogContent>
            {selectedUser && (
              <Stack spacing={3} sx={{ mt: 2 }}>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      label="Total Weight (grams)"
                      type="number"
                      fullWidth
                      defaultValue={selectedUser.goldHoldings?.totalWeight || 0}
                      InputProps={{
                        endAdornment: <InputAdornment position="end">g</InputAdornment>,
                      }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      label="Purity (%)"
                      type="number"
                      fullWidth
                      defaultValue={selectedUser.goldHoldings?.purity || 0}
                      InputProps={{
                        endAdornment: <InputAdornment position="end">%</InputAdornment>,
                      }}
                    />
                  </Grid>
                </Grid>
                <TextField
                  label="Storage Location"
                  fullWidth
                  defaultValue={selectedUser.goldHoldings?.storageLocation || ''}
                />
                <FormControl fullWidth>
                  <InputLabel>Insurance Status</InputLabel>
                  <Select
                    defaultValue={selectedUser.goldHoldings?.insuranceStatus || 'uninsured'}
                    label="Insurance Status"
                  >
                    <MenuItem value="insured">Insured</MenuItem>
                    <MenuItem value="uninsured">Uninsured</MenuItem>
                    <MenuItem value="pending">Pending</MenuItem>
                  </Select>
                </FormControl>
                <TextField
                  label="Reason for Update"
                  multiline
                  rows={3}
                  fullWidth
                  placeholder="Explain why you're updating these holdings..."
                />
              </Stack>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setGoldHoldingsDialogOpen(false)}>Cancel</Button>
            <Button variant="contained" onClick={() => handleUpdateGoldHoldings()}>
              Update Holdings
            </Button>
          </DialogActions>
        </Dialog>

        {/* Bulk Operations Dialog */}
        <Dialog open={bulkOperationsDialogOpen} onClose={() => setBulkOperationsDialogOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle sx={{ 
            background: 'linear-gradient(45deg, #FFC107, #FF9800)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontWeight: 700,
            textAlign: 'center',
          }}>
            ⚡ Bulk Operations
          </DialogTitle>
          <DialogContent>
            <Stack spacing={3} sx={{ mt: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Operation Type</InputLabel>
                <Select
                  value={bulkOperation}
                  onChange={(e) => setBulkOperation(e.target.value)}
                  label="Operation Type"
                >
                  <MenuItem value="suspend">Suspend Users</MenuItem>
                  <MenuItem value="activate">Activate Users</MenuItem>
                  <MenuItem value="update_role">Update Role</MenuItem>
                  <MenuItem value="update_kyc">Update KYC Level</MenuItem>
                  <MenuItem value="update_trading_limits">Update Trading Limits</MenuItem>
                </Select>
              </FormControl>

              {bulkOperation === 'update_role' && (
                <FormControl fullWidth>
                  <InputLabel>New Role</InputLabel>
                  <Select
                    value={bulkParameters.role || ''}
                    onChange={(e) => setBulkParameters({ ...bulkParameters, role: e.target.value })}
                    label="New Role"
                  >
                    <MenuItem value="BUYER">Buyer</MenuItem>
                    <MenuItem value="SELLER">Seller</MenuItem>
                    <MenuItem value="BROKER">Broker</MenuItem>
                    <MenuItem value="ADMIN">Admin</MenuItem>
                    <MenuItem value="OPERATOR">Operator</MenuItem>
                    <MenuItem value="ARBITER">Arbiter</MenuItem>
                  </Select>
                </FormControl>
              )}

              {bulkOperation === 'update_kyc' && (
                <FormControl fullWidth>
                  <InputLabel>New KYC Level</InputLabel>
                  <Select
                    value={bulkParameters.kycLevel || ''}
                    onChange={(e) => setBulkParameters({ ...bulkParameters, kycLevel: e.target.value })}
                    label="New KYC Level"
                  >
                    <MenuItem value="verified">Verified</MenuItem>
                    <MenuItem value="pending">Pending</MenuItem>
                    <MenuItem value="unverified">Unverified</MenuItem>
                  </Select>
                </FormControl>
              )}

              <TextField
                label="Reason for Bulk Operation"
                multiline
                rows={3}
                fullWidth
                placeholder="Explain why you're performing this bulk operation..."
                value={bulkOperationReason}
                onChange={(e) => setBulkOperationReason(e.target.value)}
              />

              <Alert severity="warning">
                <AlertTitle>Warning</AlertTitle>
                This operation will affect {selectedUsers.length} users. This action cannot be undone.
              </Alert>
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setBulkOperationsDialogOpen(false)}>Cancel</Button>
            <Button variant="contained" color="warning" onClick={() => handleBulkOperation()}>
              Execute Bulk Operation
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </PageContainer>
  );
};

export default UsersPage;
