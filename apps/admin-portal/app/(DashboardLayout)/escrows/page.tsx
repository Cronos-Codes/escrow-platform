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
  LinearProgress,
  Grid,
  Divider,
  Badge,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  AlertTitle,
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  IconSearch,
  IconFilter,
  IconEye,
  IconShield,
  IconShieldCheck,
  IconShieldX,
  IconAlertTriangle,
  IconClock,
  IconCheck,
  IconX,
  IconRefresh,
  IconDownload,
  IconFileText,
  IconHistory,
  IconTrendingUp,
  IconReceipt,
  IconDiamond,
  IconCoins,
} from '@tabler/icons-react';
import { motion } from 'framer-motion';
import { alpha } from '@mui/material/styles';
import PageContainer from '@/app/(DashboardLayout)/components/container/PageContainer';
import { useRequireRole } from '@/hooks/useRequireRole';

// Enhanced mock data for comprehensive escrow management
const mockEscrows = [
  {
    id: 'ESC-001',
    buyer: {
      id: 'user1',
      name: 'John Doe',
      email: 'john.doe@example.com',
      phone: '+1-555-0123',
      country: 'USA',
      kycLevel: 'verified',
      riskScore: 15,
    },
    seller: {
      id: 'user2',
      name: 'Jane Smith',
      email: 'jane.smith@example.com',
      phone: '+1-555-0456',
      country: 'Canada',
      kycLevel: 'verified',
      riskScore: 25,
    },
    broker: {
      id: 'broker1',
      name: 'Bob Wilson',
      email: 'bob.wilson@broker.com',
      phone: '+1-555-0789',
      commission: 2.5,
    },
    amount: 25000,
    currency: 'USD',
    status: 'active',
    type: 'gold_escrow',
    createdAt: 1704067200000, // 2024-01-01
    expiresAt: 1706745600000, // 2024-02-01
    contractAddress: '0x1234567890abcdef1234567890abcdef12345678',
    riskLevel: 'low',
    disputes: 0,
    lastActivity: 1704153600000, // 2024-01-02
    escrowFee: 250,
    platformFee: 125,
    totalFees: 375,
    // Enhanced data
    goldDetails: {
      weight: 500, // grams
      purity: 99.9,
      type: 'Gold Bullion',
      storageLocation: 'Brink\'s Secure Storage',
      insuranceStatus: 'insured',
      certificateNumber: 'CERT-001-2024',
      assayReport: 'ASSAY-001-2024',
    },
    paymentDetails: {
      method: 'bank_transfer',
      status: 'pending',
      transactionId: 'TXN-001-2024',
      expectedDate: 1704153600000, // 2024-01-02
    },
    timeline: [
      {
        event: 'escrow_created',
        timestamp: 1704067200000,
        description: 'Escrow created by buyer',
        actor: 'John Doe',
      },
      {
        event: 'payment_initiated',
        timestamp: 1704153600000,
        description: 'Payment initiated by buyer',
        actor: 'John Doe',
      },
    ],
    documents: [
      {
        id: 'doc1',
        name: 'Purchase Agreement',
        type: 'contract',
        status: 'signed',
        uploadedBy: 'John Doe',
        uploadedAt: 1704067200000,
      },
      {
        id: 'doc2',
        name: 'Gold Certificate',
        type: 'certificate',
        status: 'verified',
        uploadedBy: 'Jane Smith',
        uploadedAt: 1704153600000,
      },
    ],
    riskAssessment: {
      score: 15,
      factors: ['verified_users', 'low_amount', 'gold_backed'],
      recommendations: ['proceed_normal'],
    },
    compliance: {
      status: 'compliant',
      checks: ['kyc_verified', 'aml_clear', 'sanctions_clear'],
      lastCheck: 1704153600000,
    },
  },
  {
    id: 'ESC-002',
    buyer: {
      id: 'user3',
      name: 'Alice Brown',
      email: 'alice.brown@example.com',
      phone: '+1-555-0321',
      country: 'Australia',
      kycLevel: 'verified',
      riskScore: 35,
    },
    seller: {
      id: 'user4',
      name: 'Charlie Davis',
      email: 'charlie.davis@example.com',
      phone: '+1-555-0654',
      country: 'Germany',
      kycLevel: 'pending',
      riskScore: 65,
    },
    broker: {
      id: 'broker2',
      name: 'Eve Johnson',
      email: 'eve.johnson@broker.com',
      phone: '+1-555-0987',
      commission: 3.0,
    },
    amount: 15000,
    currency: 'USD',
    status: 'pending',
    type: 'standard_escrow',
    createdAt: 1704153600000, // 2024-01-02
    expiresAt: 1706832000000, // 2024-02-02
    contractAddress: '0x876543210fedcba9876543210fedcba9876543210',
    riskLevel: 'medium',
    disputes: 1,
    lastActivity: 1704240000000, // 2024-01-03
    escrowFee: 150,
    platformFee: 75,
    totalFees: 225,
    // Enhanced data
    goldDetails: null, // Not a gold escrow
    paymentDetails: {
      method: 'crypto',
      status: 'pending',
      transactionId: 'TXN-002-2024',
      expectedDate: 1704240000000, // 2024-01-03
    },
    timeline: [
      {
        event: 'escrow_created',
        timestamp: 1704153600000,
        description: 'Escrow created by buyer',
        actor: 'Alice Brown',
      },
      {
        event: 'dispute_raised',
        timestamp: 1704240000000,
        description: 'Dispute raised by seller',
        actor: 'Charlie Davis',
      },
    ],
    documents: [
      {
        id: 'doc3',
        name: 'Service Agreement',
        type: 'contract',
        status: 'pending',
        uploadedBy: 'Alice Brown',
        uploadedAt: 1704153600000,
      },
    ],
    riskAssessment: {
      score: 45,
      factors: ['unverified_seller', 'medium_amount', 'dispute_history'],
      recommendations: ['monitor_closely', 'require_additional_docs'],
    },
    compliance: {
      status: 'pending',
      checks: ['kyc_pending', 'aml_clear', 'sanctions_clear'],
      lastCheck: 1704153600000,
    },
  },
  {
    id: 'ESC-003',
    buyer: {
      id: 'user5',
      name: 'Frank Miller',
      email: 'frank.miller@example.com',
      phone: '+1-555-0125',
      country: 'UK',
      kycLevel: 'verified',
      riskScore: 20,
    },
    seller: {
      id: 'user6',
      name: 'Grace Lee',
      email: 'grace.lee@example.com',
      phone: '+1-555-0458',
      country: 'Singapore',
      kycLevel: 'verified',
      riskScore: 18,
    },
    broker: {
      id: 'broker3',
      name: 'Henry Chen',
      email: 'henry.chen@broker.com',
      phone: '+1-555-0789',
      commission: 2.0,
    },
    amount: 50000,
    currency: 'USD',
    status: 'completed',
    type: 'gold_escrow',
    createdAt: 1703376000000, // 2023-12-24
    expiresAt: 1706054400000, // 2024-01-24
    contractAddress: '0xabcdef1234567890abcdef1234567890abcdef12',
    riskLevel: 'low',
    disputes: 0,
    lastActivity: 1704153600000, // 2024-01-02
    escrowFee: 500,
    platformFee: 250,
    totalFees: 750,
    // Enhanced data
    goldDetails: {
      weight: 1000, // grams
      purity: 99.5,
      type: 'Gold Coins',
      storageLocation: 'HSBC Secure Storage',
      insuranceStatus: 'insured',
      certificateNumber: 'CERT-003-2024',
      assayReport: 'ASSAY-003-2024',
    },
    paymentDetails: {
      method: 'bank_transfer',
      status: 'completed',
      transactionId: 'TXN-003-2024',
      completedDate: 1704153600000, // 2024-01-02
    },
    timeline: [
      {
        event: 'escrow_created',
        timestamp: 1703376000000,
        description: 'Escrow created by buyer',
        actor: 'Frank Miller',
      },
      {
        event: 'payment_completed',
        timestamp: 1703462400000,
        description: 'Payment completed by buyer',
        actor: 'Frank Miller',
      },
      {
        event: 'gold_delivered',
        timestamp: 1703548800000,
        description: 'Gold delivered to buyer',
        actor: 'Grace Lee',
      },
      {
        event: 'escrow_completed',
        timestamp: 1704153600000,
        description: 'Escrow completed successfully',
        actor: 'System',
      },
    ],
    documents: [
      {
        id: 'doc5',
        name: 'Purchase Agreement',
        type: 'contract',
        status: 'signed',
        uploadedBy: 'Frank Miller',
        uploadedAt: 1703376000000,
      },
      {
        id: 'doc6',
        name: 'Gold Certificate',
        type: 'certificate',
        status: 'verified',
        uploadedBy: 'Grace Lee',
        uploadedAt: 1703462400000,
      },
      {
        id: 'doc7',
        name: 'Delivery Receipt',
        type: 'receipt',
        status: 'signed',
        uploadedBy: 'Frank Miller',
        uploadedAt: 1704153600000,
      },
    ],
    riskAssessment: {
      score: 20,
      factors: ['verified_users', 'gold_backed', 'successful_history'],
      recommendations: ['proceed_normal'],
    },
    compliance: {
      status: 'compliant',
      checks: ['kyc_verified', 'aml_clear', 'sanctions_clear'],
      lastCheck: 1704153600000,
    },
  },
  {
    id: 'ESC-004',
    buyer: {
      id: 'user7',
      name: 'Ivy Wang',
      email: 'ivy.wang@example.com',
      phone: '+1-555-0127',
      country: 'China',
      kycLevel: 'verified',
      riskScore: 40,
    },
    seller: {
      id: 'user8',
      name: 'Jack Taylor',
      email: 'jack.taylor@example.com',
      phone: '+1-555-0450',
      country: 'USA',
      kycLevel: 'verified',
      riskScore: 55,
    },
    broker: {
      id: 'broker4',
      name: 'Kate Anderson',
      email: 'kate.anderson@broker.com',
      phone: '+1-555-0783',
      commission: 3.5,
    },
    amount: 75000,
    currency: 'USD',
    status: 'disputed',
    type: 'gold_escrow',
    createdAt: 1703289600000, // 2023-12-23
    expiresAt: 1705968000000, // 2024-01-23
    contractAddress: '0x9876543210fedcba9876543210fedcba9876543210',
    riskLevel: 'high',
    disputes: 2,
    lastActivity: 1704240000000, // 2024-01-03
    escrowFee: 750,
    platformFee: 375,
    totalFees: 1125,
    // Enhanced data
    goldDetails: {
      weight: 1500, // grams
      purity: 99.0,
      type: 'Gold Bars',
      storageLocation: 'Loomis Secure Storage',
      insuranceStatus: 'insured',
      certificateNumber: 'CERT-004-2024',
      assayReport: 'ASSAY-004-2024',
    },
    paymentDetails: {
      method: 'crypto',
      status: 'completed',
      transactionId: 'TXN-004-2024',
      completedDate: 1703376000000, // 2023-12-24
    },
    timeline: [
      {
        event: 'escrow_created',
        timestamp: 1703289600000,
        description: 'Escrow created by buyer',
        actor: 'Ivy Wang',
      },
      {
        event: 'payment_completed',
        timestamp: 1703376000000,
        description: 'Payment completed by buyer',
        actor: 'Ivy Wang',
      },
      {
        event: 'dispute_raised',
        timestamp: 1703462400000,
        description: 'Dispute raised by buyer',
        actor: 'Ivy Wang',
      },
      {
        event: 'dispute_raised',
        timestamp: 1704240000000,
        description: 'Counter-dispute raised by seller',
        actor: 'Jack Taylor',
      },
    ],
    documents: [
      {
        id: 'doc9',
        name: 'Purchase Agreement',
        type: 'contract',
        status: 'signed',
        uploadedBy: 'Ivy Wang',
        uploadedAt: 1703289600000,
      },
      {
        id: 'doc10',
        name: 'Gold Certificate',
        type: 'certificate',
        status: 'verified',
        uploadedBy: 'Jack Taylor',
        uploadedAt: 1703376000000,
      },
      {
        id: 'doc11',
        name: 'Dispute Document',
        type: 'dispute',
        status: 'pending',
        uploadedBy: 'Ivy Wang',
        uploadedAt: 1704240000000,
      },
    ],
    riskAssessment: {
      score: 75,
      factors: ['high_amount', 'multiple_disputes', 'complex_transaction'],
      recommendations: ['mediate_dispute', 'require_arbitration'],
    },
    compliance: {
      status: 'under_review',
      checks: ['kyc_verified', 'aml_clear', 'sanctions_clear'],
      lastCheck: 1704240000000,
    },
  },
  {
    id: 'ESC-005',
    buyer: {
      id: 'user9',
      name: 'Liam O\'Connor',
      email: 'liam.oconnor@example.com',
      phone: '+1-555-0129',
      country: 'Ireland',
      kycLevel: 'unverified',
      riskScore: 85,
    },
    seller: {
      id: 'user10',
      name: 'Mia Rodriguez',
      email: 'mia.rodriguez@example.com',
      phone: '+1-555-0452',
      country: 'Spain',
      kycLevel: 'verified',
      riskScore: 30,
    },
    broker: {
      id: 'broker5',
      name: 'Noah Thompson',
      email: 'noah.thompson@broker.com',
      phone: '+1-555-0785',
      commission: 2.8,
    },
    amount: 30000,
    currency: 'USD',
    status: 'cancelled',
    type: 'standard_escrow',
    createdAt: 1703203200000, // 2023-12-22
    expiresAt: 1705881600000, // 2024-01-22
    contractAddress: '0x1111111111111111111111111111111111111111',
    riskLevel: 'medium',
    disputes: 1,
    lastActivity: 1704153600000, // 2024-01-02
    escrowFee: 300,
    platformFee: 150,
    totalFees: 450,
    // Enhanced data
    goldDetails: null, // Not a gold escrow
    paymentDetails: {
      method: 'bank_transfer',
      status: 'cancelled',
      transactionId: 'TXN-005-2024',
      cancelledDate: 1704153600000, // 2024-01-02
    },
    timeline: [
      {
        event: 'escrow_created',
        timestamp: 1703203200000,
        description: 'Escrow created by buyer',
        actor: 'Liam O\'Connor',
      },
      {
        event: 'kyc_failed',
        timestamp: 1703289600000,
        description: 'KYC verification failed',
        actor: 'System',
      },
      {
        event: 'escrow_cancelled',
        timestamp: 1704153600000,
        description: 'Escrow cancelled due to KYC failure',
        actor: 'System',
      },
    ],
    documents: [
      {
        id: 'doc13',
        name: 'Service Agreement',
        type: 'contract',
        status: 'cancelled',
        uploadedBy: 'Liam O\'Connor',
        uploadedAt: 1703203200000,
      },
    ],
    riskAssessment: {
      score: 85,
      factors: ['unverified_buyer', 'kyc_failed', 'suspicious_activity'],
      recommendations: ['cancel_escrow', 'flag_user'],
    },
    compliance: {
      status: 'non_compliant',
      checks: ['kyc_failed', 'aml_clear', 'sanctions_clear'],
      lastCheck: 1704153600000,
    },
  },
];

const EscrowsPage = () => {
  // Require admin or operator role
  useRequireRole(['ADMIN', 'OPERATOR']);

  const [escrows, setEscrows] = useState(mockEscrows);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [riskFilter, setRiskFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedEscrow, setSelectedEscrow] = useState<any>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [forceReleaseDialogOpen, setForceReleaseDialogOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  
  // New dialog states
  const [disputeDialogOpen, setDisputeDialogOpen] = useState(false);
  const [documentDialogOpen, setDocumentDialogOpen] = useState(false);
  const [timelineDialogOpen, setTimelineDialogOpen] = useState(false);
  const [riskDialogOpen, setRiskDialogOpen] = useState(false);
  const [complianceDialogOpen, setComplianceDialogOpen] = useState(false);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [goldDetailsDialogOpen, setGoldDetailsDialogOpen] = useState(false);

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

  // Helper function for currency formatting
  const formatCurrency = (amount: number, currency: string = 'USD') => {
    if (!isClient) return 'Loading...';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  // Filter escrows based on search and filters
  const filteredEscrows = escrows.filter(escrow => {
    const matchesSearch = escrow.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         escrow.buyer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         escrow.seller.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         escrow.broker.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || escrow.status === statusFilter;
    const matchesRisk = riskFilter === 'all' || escrow.riskLevel === riskFilter;
    const matchesType = typeFilter === 'all' || escrow.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesRisk && matchesType;
  });

  // Calculate statistics
  const stats = {
    total: escrows.length,
    active: escrows.filter(e => e.status === 'active').length,
    pending: escrows.filter(e => e.status === 'pending').length,
    completed: escrows.filter(e => e.status === 'completed').length,
    disputed: escrows.filter(e => e.status === 'disputed').length,
    cancelled: escrows.filter(e => e.status === 'cancelled').length,
    totalVolume: escrows.reduce((sum, e) => sum + e.amount, 0),
    totalFees: escrows.reduce((sum, e) => sum + e.totalFees, 0),
    goldEscrows: escrows.filter(e => e.type === 'gold_escrow').length,
    standardEscrows: escrows.filter(e => e.type === 'standard_escrow').length,
    highRisk: escrows.filter(e => e.riskLevel === 'high').length,
    mediumRisk: escrows.filter(e => e.riskLevel === 'medium').length,
    lowRisk: escrows.filter(e => e.riskLevel === 'low').length,
  };

  const handleViewDetails = (escrow: any) => {
    setSelectedEscrow(escrow);
    setActiveTab(0);
    setDetailDialogOpen(true);
  };

  const handleForceRelease = (escrow: any) => {
    setSelectedEscrow(escrow);
    setForceReleaseDialogOpen(true);
  };

  const handleConfirmForceRelease = () => {
    if (!selectedEscrow) return;
    
    // Update escrow status to completed
    setEscrows(escrows.map(escrow => 
      escrow.id === selectedEscrow.id 
        ? { 
            ...escrow, 
            status: 'completed', 
            lastActivity: Date.now(),
            timeline: [
              ...escrow.timeline,
              {
                event: 'force_released',
                timestamp: Date.now(),
                description: 'Escrow force released by admin',
                actor: 'Admin',
              }
            ]
          }
        : escrow
    ));
    setForceReleaseDialogOpen(false);
    setSelectedEscrow(null);
  };

  const handleCancelEscrow = (escrowId: string) => {
    setEscrows(escrows.map(escrow => 
      escrow.id === escrowId 
        ? { 
            ...escrow, 
            status: 'cancelled', 
            lastActivity: Date.now(),
            timeline: [
              ...escrow.timeline,
              {
                event: 'escrow_cancelled',
                timestamp: Date.now(),
                description: 'Escrow cancelled by admin',
                actor: 'Admin',
              }
            ]
          }
        : escrow
    ));
  };

  const handleDisputeManagement = (escrow: any) => {
    setSelectedEscrow(escrow);
    setDisputeDialogOpen(true);
  };

  const handleDocumentManagement = (escrow: any) => {
    setSelectedEscrow(escrow);
    setDocumentDialogOpen(true);
  };

  const handleTimelineView = (escrow: any) => {
    setSelectedEscrow(escrow);
    setTimelineDialogOpen(true);
  };

  const handleRiskAssessment = (escrow: any) => {
    setSelectedEscrow(escrow);
    setRiskDialogOpen(true);
  };

  const handleComplianceCheck = (escrow: any) => {
    setSelectedEscrow(escrow);
    setComplianceDialogOpen(true);
  };

  const handlePaymentManagement = (escrow: any) => {
    setSelectedEscrow(escrow);
    setPaymentDialogOpen(true);
  };

  const handleGoldDetails = (escrow: any) => {
    setSelectedEscrow(escrow);
    setGoldDetailsDialogOpen(true);
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

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low': return 'success';
      case 'medium': return 'warning';
      case 'high': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <IconShieldCheck size={16} />;
      case 'pending': return <IconClock size={16} />;
      case 'completed': return <IconCheck size={16} />;
      case 'disputed': return <IconAlertTriangle size={16} />;
      case 'cancelled': return <IconX size={16} />;
      default: return <IconShield size={16} />;
    }
  };

  return (
    <PageContainer title="Escrow Management" description="Manage Gold Escrow transactions and monitor escrow status">
      <Box>
                           {/* Clean Professional Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Header Section */}
            <Card sx={{ mb: 4, boxShadow: 2 }}>
              <CardContent sx={{ py: 4 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
                  <Box>
                                      <Typography variant="h4" fontWeight="bold" sx={{ color: '#FFC107', mb: 1 }}>
                    Escrow Management
                  </Typography>
                    <Typography variant="body1" color="textSecondary">
                      Comprehensive oversight of all escrow transactions and gold-backed deals
                    </Typography>
                  </Box>
                  <Stack direction="row" spacing={2}>
                    <Button 
                      variant="outlined" 
                      startIcon={<IconDownload />}
                                          sx={{ 
                      borderColor: '#FFC107',
                      color: '#FFC107',
                      '&:hover': { 
                        borderColor: '#FFC107', 
                        backgroundColor: 'rgba(255, 193, 7, 0.05)' 
                      }
                    }}
                    >
                      Export Data
                    </Button>
                    <Button 
                      variant="contained" 
                      startIcon={<IconRefresh />}
                                          sx={{ 
                      backgroundColor: '#FFC107', 
                      color: '#1a1a1a',
                      '&:hover': { backgroundColor: '#FFB300' }
                    }}
                    >
                      Refresh
                    </Button>
                  </Stack>
                </Stack>

                                 {/* Key Metrics Grid */}
                 <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 1, overflowX: 'auto' }}>
                   <Card sx={{ 
                     boxShadow: 1,
                     '&:hover': { boxShadow: 2 },
                     transition: 'all 0.3s ease',
                     height: '100%'
                   }}>
                     <CardContent sx={{ textAlign: 'center', py: 2 }}>
                       <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 1 }}>
                         <IconCoins size={24} style={{ color: '#4CAF50' }} />
                       </Box>
                       <Typography variant="h5" fontWeight="bold" sx={{ color: '#4CAF50', mb: 0.5 }}>
                         {formatCurrency(stats.totalVolume)}
                       </Typography>
                       <Typography variant="body2" color="textSecondary">
                         Total Volume
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
                         <IconTrendingUp size={24} style={{ color: '#2196F3' }} />
                       </Box>
                       <Typography variant="h5" fontWeight="bold" sx={{ color: '#2196F3', mb: 0.5 }}>
                         {formatNumber(stats.active)}
                       </Typography>
                       <Typography variant="body2" color="textSecondary">
                         Active Escrows
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
                         <IconAlertTriangle size={24} style={{ color: '#FF9800' }} />
                       </Box>
                       <Typography variant="h5" fontWeight="bold" sx={{ color: '#FF9800', mb: 0.5 }}>
                         {formatNumber(stats.disputed)}
                       </Typography>
                       <Typography variant="body2" color="textSecondary">
                         Disputed Escrows
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
                         <IconShield size={24} style={{ color: '#9C27B0' }} />
                       </Box>
                       <Typography variant="h5" fontWeight="bold" sx={{ color: '#9C27B0', mb: 0.5 }}>
                         {formatNumber(stats.total)}
                       </Typography>
                       <Typography variant="body2" color="textSecondary">
                         Total Escrows
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
                         <IconReceipt size={24} style={{ color: '#F44336' }} />
                       </Box>
                       <Typography variant="h5" fontWeight="bold" sx={{ color: '#F44336', mb: 0.5 }}>
                         {formatCurrency(stats.totalFees)}
                       </Typography>
                       <Typography variant="body2" color="textSecondary">
                            Escrow Revenue
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
                          <IconDiamond size={24} style={{ color: '#FFC107' }} />
                        </Box>
                        <Typography variant="h5" fontWeight="bold" sx={{ color: '#FFC107', mb: 0.5 }}>
                          {formatNumber(stats.goldEscrows)}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          Gold Escrows
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
                          <IconCheck size={24} style={{ color: '#2196F3' }} />
                        </Box>
                        <Typography variant="h5" fontWeight="bold" sx={{ color: '#2196F3', mb: 0.5 }}>
                          {formatNumber(stats.completed)}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          Completed
                        </Typography>
                      </CardContent>
                    </Card>
                 </Box>
              </CardContent>
            </Card>

            
          </motion.div>

        {/* Filters */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
                         <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ xs: 'stretch', sm: 'center' }}>
               <TextField
                 placeholder="Search escrows..."
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
                 InputProps={{
                   startAdornment: (
                     <InputAdornment position="start">
                       <IconSearch size={20} />
                     </InputAdornment>
                   ),
                 }}
                 sx={{ minWidth: { xs: '100%', sm: 300 } }}
               />
               
               <FormControl sx={{ minWidth: { xs: '100%', sm: 150 } }}>
                 <InputLabel>Status</InputLabel>
                 <Select
                   value={statusFilter}
                   onChange={(e) => setStatusFilter(e.target.value)}
                   label="Status"
                 >
                   <MenuItem value="all">All Status</MenuItem>
                   <MenuItem value="active">Active</MenuItem>
                   <MenuItem value="pending">Pending</MenuItem>
                   <MenuItem value="completed">Completed</MenuItem>
                   <MenuItem value="disputed">Disputed</MenuItem>
                   <MenuItem value="cancelled">Cancelled</MenuItem>
                 </Select>
               </FormControl>

               <FormControl sx={{ minWidth: { xs: '100%', sm: 150 } }}>
                 <InputLabel>Risk Level</InputLabel>
                 <Select
                   value={riskFilter}
                   onChange={(e) => setRiskFilter(e.target.value)}
                   label="Risk Level"
                 >
                   <MenuItem value="all">All Risk Levels</MenuItem>
                   <MenuItem value="low">Low Risk</MenuItem>
                   <MenuItem value="medium">Medium Risk</MenuItem>
                   <MenuItem value="high">High Risk</MenuItem>
                 </Select>
               </FormControl>

               <Button
                 variant="outlined"
                 startIcon={<IconFilter />}
                 onClick={() => {
                   setSearchQuery('');
                   setStatusFilter('all');
                   setRiskFilter('all');
                 }}
                 sx={{ minWidth: { xs: '100%', sm: 'auto' } }}
               >
                 Clear Filters
               </Button>
             </Stack>
          </CardContent>
        </Card>

        {/* Escrows Table */}
        <Card>
          <CardContent>
                         <TableContainer component={Paper} elevation={0} sx={{ overflowX: 'auto' }}>
               <Table sx={{ minWidth: 650 }}>
                <TableHead>
                  <TableRow>
                    <TableCell>Escrow ID</TableCell>
                    <TableCell>Parties</TableCell>
                    <TableCell>Amount</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Risk Level</TableCell>
                    <TableCell>Disputes</TableCell>
                    <TableCell>Contract</TableCell>
                    <TableCell>Last Activity</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredEscrows.map((escrow) => (
                    <TableRow key={escrow.id} hover>
                                             <TableCell>
                         <Typography variant="subtitle2" fontWeight="bold">
                           {escrow.id}
                         </Typography>
                         <Typography variant="body2" color="textSecondary">
                           Created: {formatDate(escrow.createdAt, 'date')}
                         </Typography>
                       </TableCell>
                                             <TableCell>
                         <Box>
                           <Typography variant="body2">
                             <strong>Buyer:</strong> {escrow.buyer.name}
                           </Typography>
                           <Typography variant="body2">
                             <strong>Seller:</strong> {escrow.seller.name}
                           </Typography>
                           <Typography variant="body2" color="textSecondary">
                             <strong>Broker:</strong> {escrow.broker.name}
                           </Typography>
                         </Box>
                       </TableCell>
                                             <TableCell>
                         <Typography variant="subtitle2" fontWeight="bold">
                           {formatCurrency(escrow.amount, escrow.currency)}
                         </Typography>
                         <Typography variant="body2" color="textSecondary">
                           {escrow.type === 'gold_escrow' ? 'Gold Escrow' : 'Standard Escrow'}
                         </Typography>
                       </TableCell>
                      <TableCell>
                        <Chip
                          icon={getStatusIcon(escrow.status)}
                          label={escrow.status}
                          color={getStatusColor(escrow.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={escrow.riskLevel}
                          color={getRiskColor(escrow.riskLevel)}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {escrow.disputes} dispute{escrow.disputes !== 1 ? 's' : ''}
                        </Typography>
                      </TableCell>
                                             <TableCell>
                         <Typography variant="body2" fontFamily="monospace">
                           {escrow.contractAddress.slice(0, 6)}...{escrow.contractAddress.slice(-4)}
                         </Typography>
                       </TableCell>
                                             <TableCell>
                         <Typography variant="body2" color="textSecondary">
                           {formatDate(escrow.lastActivity, 'datetime')}
                         </Typography>
                       </TableCell>
                                                                     <TableCell>
                          <Box sx={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: 0.5, alignItems: 'flex-start' }}>
                            {/* View Details - Always First */}
                            <Tooltip title="View Details">
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={() => handleViewDetails(escrow)}
                                sx={{ 
                                  backgroundColor: 'rgba(33, 150, 243, 0.1)',
                                  '&:hover': { backgroundColor: 'rgba(33, 150, 243, 0.2)' }
                                }}
                              >
                                <IconEye size={16} />
                              </IconButton>
                            </Tooltip>

                            {/* Document Management - Always Second */}
                            <Tooltip title="Documents">
                              <IconButton
                                size="small"
                                color="info"
                                onClick={() => handleDocumentManagement(escrow)}
                                sx={{ 
                                  backgroundColor: 'rgba(0, 188, 212, 0.1)',
                                  '&:hover': { backgroundColor: 'rgba(0, 188, 212, 0.2)' }
                                }}
                              >
                                <IconFileText size={16} />
                              </IconButton>
                            </Tooltip>

                            {/* Timeline View - Always Third */}
                            <Tooltip title="Timeline">
                              <IconButton
                                size="small"
                                color="secondary"
                                onClick={() => handleTimelineView(escrow)}
                                sx={{ 
                                  backgroundColor: 'rgba(156, 39, 176, 0.1)',
                                  '&:hover': { backgroundColor: 'rgba(156, 39, 176, 0.2)' }
                                }}
                              >
                                <IconHistory size={16} />
                              </IconButton>
                            </Tooltip>

                            {/* Risk Assessment - Always Fourth */}
                            <Tooltip title="Risk Assessment">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleRiskAssessment(escrow)}
                                sx={{ 
                                  backgroundColor: 'rgba(244, 67, 54, 0.1)',
                                  '&:hover': { backgroundColor: 'rgba(244, 67, 54, 0.2)' }
                                }}
                              >
                                <IconShield size={16} />
                              </IconButton>
                            </Tooltip>

                            {/* Compliance Check - Always Fifth */}
                            <Tooltip title="Compliance">
                              <IconButton
                                size="small"
                                color="success"
                                onClick={() => handleComplianceCheck(escrow)}
                                sx={{ 
                                  backgroundColor: 'rgba(76, 175, 80, 0.1)',
                                  '&:hover': { backgroundColor: 'rgba(76, 175, 80, 0.2)' }
                                }}
                              >
                                <IconCheck size={16} />
                              </IconButton>
                            </Tooltip>

                            {/* Payment Management - Always Sixth */}
                            <Tooltip title="Payment">
                              <IconButton
                                size="small"
                                color="warning"
                                onClick={() => handlePaymentManagement(escrow)}
                                sx={{ 
                                  backgroundColor: 'rgba(255, 193, 7, 0.1)',
                                  '&:hover': { backgroundColor: 'rgba(255, 193, 7, 0.2)' }
                                }}
                              >
                                <IconReceipt size={16} />
                              </IconButton>
                            </Tooltip>

                            {/* Dispute Management - Conditional Seventh */}
                            {escrow.disputes > 0 ? (
                              <Tooltip title="Manage Disputes">
                                <IconButton
                                  size="small"
                                  color="warning"
                                  onClick={() => handleDisputeManagement(escrow)}
                                  sx={{ 
                                    backgroundColor: 'rgba(255, 152, 0, 0.1)',
                                    '&:hover': { backgroundColor: 'rgba(255, 152, 0, 0.2)' }
                                  }}
                                >
                                  <IconAlertTriangle size={16} />
                                </IconButton>
                              </Tooltip>
                            ) : (
                              <Box sx={{ width: 32, height: 32 }} /> // Placeholder for consistent spacing
                            )}

                            {/* Gold Details - Conditional Eighth */}
                            {escrow.type === 'gold_escrow' && escrow.goldDetails ? (
                              <Tooltip title="Gold Details">
                                <IconButton
                                  size="small"
                                                                     sx={{ 
                                     color: '#FFC107',
                                     backgroundColor: 'rgba(255, 193, 7, 0.1)',
                                     '&:hover': { backgroundColor: 'rgba(255, 193, 7, 0.2)' }
                                   }}
                                  onClick={() => handleGoldDetails(escrow)}
                                >
                                  <IconDiamond size={16} />
                                </IconButton>
                              </Tooltip>
                            ) : (
                              <Box sx={{ width: 32, height: 32 }} /> // Placeholder for consistent spacing
                            )}

                            {/* Force Release - Conditional Ninth */}
                            {escrow.status === 'active' ? (
                              <Tooltip title="Force Release">
                                <IconButton
                                  size="small"
                                  color="success"
                                  onClick={() => handleForceRelease(escrow)}
                                  sx={{ 
                                    backgroundColor: 'rgba(76, 175, 80, 0.1)',
                                    '&:hover': { backgroundColor: 'rgba(76, 175, 80, 0.2)' }
                                  }}
                                >
                                  <IconShieldCheck size={16} />
                                </IconButton>
                              </Tooltip>
                            ) : (
                              <Box sx={{ width: 32, height: 32 }} /> // Placeholder for consistent spacing
                            )}

                            {/* Cancel Escrow - Conditional Tenth */}
                            {(escrow.status === 'active' || escrow.status === 'pending') ? (
                              <Tooltip title="Cancel Escrow">
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() => handleCancelEscrow(escrow.id)}
                                  sx={{ 
                                    backgroundColor: 'rgba(244, 67, 54, 0.1)',
                                    '&:hover': { backgroundColor: 'rgba(244, 67, 54, 0.2)' }
                                  }}
                                >
                                  <IconShieldX size={16} />
                                </IconButton>
                              </Tooltip>
                            ) : (
                              <Box sx={{ width: 32, height: 32 }} /> // Placeholder for consistent spacing
                            )}
                          </Box>
                        </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>

        {/* Escrow Details Dialog */}
        <Dialog open={detailDialogOpen} onClose={() => setDetailDialogOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle>Escrow Details - {selectedEscrow?.id}</DialogTitle>
          <DialogContent>
            {selectedEscrow && (
              <Stack spacing={3} sx={{ mt: 2 }}>
                <Box>
                  <Typography variant="h6" gutterBottom>Transaction Information</Typography>
                  <Stack direction="row" spacing={4}>
                    <Box>
                      <Typography variant="body2" color="textSecondary">Amount</Typography>
                      <Typography variant="h6">{selectedEscrow.amount} {selectedEscrow.currency}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="textSecondary">Status</Typography>
                      <Chip
                        icon={getStatusIcon(selectedEscrow.status)}
                        label={selectedEscrow.status}
                        color={getStatusColor(selectedEscrow.status)}
                        size="small"
                      />
                    </Box>
                    <Box>
                      <Typography variant="body2" color="textSecondary">Risk Level</Typography>
                      <Chip
                        label={selectedEscrow.riskLevel}
                        color={getRiskColor(selectedEscrow.riskLevel)}
                        size="small"
                      />
                    </Box>
                  </Stack>
                </Box>

                                 <Box>
                   <Typography variant="h6" gutterBottom>Parties</Typography>
                   <Stack spacing={2}>
                     <Box>
                       <Typography variant="body2" color="textSecondary">Buyer</Typography>
                       <Typography variant="body1">{selectedEscrow.buyer.name}</Typography>
                       <Typography variant="body2" color="textSecondary">{selectedEscrow.buyer.email}</Typography>
                     </Box>
                     <Box>
                       <Typography variant="body2" color="textSecondary">Seller</Typography>
                       <Typography variant="body1">{selectedEscrow.seller.name}</Typography>
                       <Typography variant="body2" color="textSecondary">{selectedEscrow.seller.email}</Typography>
                     </Box>
                     <Box>
                       <Typography variant="body2" color="textSecondary">Broker</Typography>
                       <Typography variant="body1">{selectedEscrow.broker.name}</Typography>
                       <Typography variant="body2" color="textSecondary">{selectedEscrow.broker.email}</Typography>
                     </Box>
                   </Stack>
                 </Box>

                                 <Box>
                   <Typography variant="h6" gutterBottom>Contract Information</Typography>
                   <Typography variant="body2" fontFamily="monospace" sx={{ bgcolor: 'grey.100', p: 1, borderRadius: 1 }}>
                     {selectedEscrow.contractAddress.slice(0, 6)}...{selectedEscrow.contractAddress.slice(-4)}
                   </Typography>
                   <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
                     Full Address: {selectedEscrow.contractAddress}
                   </Typography>
                 </Box>

                                 <Box>
                   <Typography variant="h6" gutterBottom>Timeline</Typography>
                   <Stack spacing={1}>
                     <Box>
                       <Typography variant="body2" color="textSecondary">Created</Typography>
                       <Typography variant="body1">{formatDate(selectedEscrow.createdAt, 'datetime')}</Typography>
                     </Box>
                     <Box>
                       <Typography variant="body2" color="textSecondary">Expires</Typography>
                       <Typography variant="body1">{formatDate(selectedEscrow.expiresAt, 'datetime')}</Typography>
                     </Box>
                     <Box>
                       <Typography variant="body2" color="textSecondary">Last Activity</Typography>
                       <Typography variant="body1">{formatDate(selectedEscrow.lastActivity, 'datetime')}</Typography>
                     </Box>
                   </Stack>
                 </Box>

                {selectedEscrow.disputes > 0 && (
                  <Alert severity="warning">
                    This escrow has {selectedEscrow.disputes} active dispute{selectedEscrow.disputes !== 1 ? 's' : ''}.
                  </Alert>
                )}
              </Stack>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDetailDialogOpen(false)}>Close</Button>
          </DialogActions>
        </Dialog>

        {/* Force Release Confirmation Dialog */}
        <Dialog open={forceReleaseDialogOpen} onClose={() => setForceReleaseDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Force Release Escrow</DialogTitle>
          <DialogContent>
            <Alert severity="warning" sx={{ mb: 2 }}>
              This action will force release the escrow funds to the seller. This is a high-risk action that requires confirmation.
            </Alert>
            {selectedEscrow && (
              <Typography>
                Are you sure you want to force release escrow <strong>{selectedEscrow.id}</strong> for <strong>{selectedEscrow.amount}</strong>?
              </Typography>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setForceReleaseDialogOpen(false)}>Cancel</Button>
            <Button variant="contained" color="error" onClick={handleConfirmForceRelease}>
              Force Release
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </PageContainer>
  );
};

export default EscrowsPage;
