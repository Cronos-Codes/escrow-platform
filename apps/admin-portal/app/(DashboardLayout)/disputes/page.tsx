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
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
  LinearProgress,
  Badge,
  Tabs,
  Tab,
  ListItemIcon,
  AlertTitle,
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  IconSearch,
  IconFilter,
  IconEye,
  IconGavel,
  IconUserCheck,
  IconAlertTriangle,
  IconClock,
  IconCheck,
  IconX,
  IconRefresh,
  IconDownload,
  IconChevronDown,
  IconFileText,
  IconMessage,
  IconCalendar,
  IconEdit,
  IconTrash,
  IconUserX,
  IconMail,
  IconPhone,
  IconSettings,
  IconKey,
  IconUserPlus,
  IconUserMinus,
  IconCertificate,
  IconDatabase,
  IconActivity,
  IconHistory,
  IconFlag,
  IconSend,
  IconBan,
  IconExclamationCircle,
  IconInfoCircle,
  IconCurrencyDollar,
  IconCoin,
  IconTrendingUp,
  IconTrendingDown,
  IconChartBar,
  IconMapPin,
  IconCreditCard,
  IconWallet,
  IconBuildingBank,
  IconReceipt,
  IconFileInvoice,
  IconScale,
  IconTarget,
  IconRocket,
  IconStar,
  IconAward,
  IconTrophy,
  IconMedal,
  IconCrown,
  IconDiamond,
  IconCoins,
  IconLockAccess,
  IconFingerprint,
  IconQrcode,
  IconBarcode,
  IconTag,
  IconDiscount,
  IconPercentage,
  IconCalculator,
  IconAbacus,
  IconChartLine,
  IconChartArea,
  IconChartDots,
  IconChartCandle,
  IconChartArcs,
  IconChartDonut,
  IconChartRadar,
  IconChartScatter,
  IconChartInfographic,
  IconBulb,
  IconBulbOff,
  IconSun,
  IconMoon,
  IconCloud,
  IconCloudRain,
  IconCloudSnow,
  IconWind,
  IconDroplet,
  IconFlame,
  IconSparkles,
  IconWand,
  IconCrystalBall,
  IconBook,
  IconBookmark,
  IconLibrary,
  IconSchool,
  IconHeart,
  IconThumbUp,
  IconThumbDown,
  IconShield,
} from '@tabler/icons-react';
import { motion } from 'framer-motion';
import { alpha } from '@mui/material/styles';
import PageContainer from '@/app/(DashboardLayout)/components/container/PageContainer';
import { useRequireRole } from '@/hooks/useRequireRole';

// Enhanced mock data for comprehensive dispute management
const mockDisputes = [
  {
    id: 'DISP-001',
    escrowId: 'ESC-002',
    buyer: {
      id: 'user1',
      name: 'Alice Brown',
      email: 'alice.brown@example.com',
      phone: '+1-555-0123',
      country: 'USA',
      kycLevel: 'verified',
      riskScore: 15,
      contactInfo: {
        address: '123 Main St, New York, NY 10001',
        phone: '+1-555-0123',
        email: 'alice.brown@example.com'
      }
    },
    seller: {
      id: 'user2',
      name: 'Charlie Davis',
      email: 'charlie.davis@example.com',
      phone: '+1-555-0456',
      country: 'Canada',
      kycLevel: 'verified',
      riskScore: 25,
      contactInfo: {
        address: '456 Oak Ave, Toronto, ON M5V 2H1',
        phone: '+1-555-0456',
        email: 'charlie.davis@example.com'
      }
    },
    arbiter: {
      id: 'arbiter1',
      name: 'Sarah Johnson',
      email: 'sarah.johnson@arbiter.com',
      specialization: 'Commercial',
      availability: 'available',
      experience: '5 years',
      successRate: 95
    },
    amount: 15000,
    currency: 'USD',
    status: 'open',
    priority: 'high',
    category: 'delivery',
    createdAt: 1704067200000, // 2024-01-01
    lastActivity: 1704153600000, // 2024-01-02
    description: 'Buyer claims goods not received as described',
    evidenceCount: 3,
    // Enhanced data
    evidence: [
      {
        id: 'ev1',
        type: 'document',
        name: 'Purchase Agreement',
        uploadedBy: 'Alice Brown',
        uploadedAt: 1704067200000,
        status: 'verified',
        description: 'Original purchase agreement with specifications'
      },
      {
        id: 'ev2',
        type: 'image',
        name: 'Received Goods Photos',
        uploadedBy: 'Alice Brown',
        uploadedAt: 1704153600000,
        status: 'pending',
        description: 'Photos of goods received showing discrepancies'
      },
      {
        id: 'ev3',
        type: 'document',
        name: 'Delivery Receipt',
        uploadedBy: 'Charlie Davis',
        uploadedAt: 1704153600000,
        status: 'verified',
        description: 'Proof of delivery with buyer signature'
      }
    ],
    timeline: [
      {
        id: 'tl1',
        event: 'dispute_filed',
        timestamp: 1704067200000,
        description: 'Dispute filed by buyer',
        actor: 'Alice Brown',
        actorRole: 'buyer'
      },
      {
        id: 'tl2',
        event: 'evidence_submitted',
        timestamp: 1704153600000,
        description: 'Evidence submitted by buyer',
        actor: 'Alice Brown',
        actorRole: 'buyer'
      },
      {
        id: 'tl3',
        event: 'evidence_submitted',
        timestamp: 1704153600000,
        description: 'Counter-evidence submitted by seller',
        actor: 'Charlie Davis',
        actorRole: 'seller'
      }
    ],
    riskAssessment: {
      score: 65,
      level: 'medium',
      factors: ['high_amount', 'delivery_dispute', 'verified_parties'],
      recommendations: ['mediate_dispute', 'require_additional_evidence'],
      trend: 'stable'
    },
    resolution: {
      status: 'pending',
      estimatedTime: '7 days',
      options: ['refund_buyer', 'partial_refund', 'continue_escrow'],
      notes: 'Requires additional evidence from both parties'
    },
    communication: [
      {
        id: 'comm1',
        from: 'Alice Brown',
        to: 'Charlie Davis',
        timestamp: 1704067200000,
        message: 'I received the goods but they do not match the description in our agreement.',
        type: 'dispute_notification'
      },
      {
        id: 'comm2',
        from: 'Charlie Davis',
        to: 'Alice Brown',
        timestamp: 1704153600000,
        message: 'The goods were delivered exactly as specified. Please provide specific details about the discrepancies.',
        type: 'response'
      }
    ]
  },
  {
    id: 'DISP-002',
    escrowId: 'ESC-004',
    buyer: {
      id: 'user3',
      name: 'Ivy Wang',
      email: 'ivy.wang@example.com',
      phone: '+1-555-0321',
      country: 'China',
      kycLevel: 'verified',
      riskScore: 40,
      contactInfo: {
        address: '789 Business Ave, Shanghai, China 200000',
        phone: '+1-555-0321',
        email: 'ivy.wang@example.com'
      }
    },
    seller: {
      id: 'user4',
      name: 'Jack Taylor',
      email: 'jack.taylor@example.com',
      phone: '+1-555-0654',
      country: 'USA',
      kycLevel: 'verified',
      riskScore: 55,
      contactInfo: {
        address: '321 Commerce St, Los Angeles, CA 90210',
        phone: '+1-555-0654',
        email: 'jack.taylor@example.com'
      }
    },
    arbiter: {
      id: 'arbiter2',
      name: 'Michael Chen',
      email: 'michael.chen@arbiter.com',
      specialization: 'Quality',
      availability: 'available',
      experience: '8 years',
      successRate: 92
    },
    amount: 75000,
    currency: 'USD',
    status: 'in_review',
    priority: 'critical',
    category: 'payment',
    createdAt: 1704153600000, // 2024-01-02
    lastActivity: 1704240000000, // 2024-01-03
    description: 'Dispute over payment terms and delivery schedule',
    evidenceCount: 5,
    // Enhanced data
    evidence: [
      {
        id: 'ev4',
        type: 'document',
        name: 'Payment Terms Agreement',
        uploadedBy: 'Ivy Wang',
        uploadedAt: 1704153600000,
        status: 'verified',
        description: 'Original payment terms agreement'
      },
      {
        id: 'ev5',
        type: 'document',
        name: 'Payment Receipts',
        uploadedBy: 'Ivy Wang',
        uploadedAt: 1704153600000,
        status: 'verified',
        description: 'Proof of payments made'
      },
      {
        id: 'ev6',
        type: 'document',
        name: 'Delivery Schedule',
        uploadedBy: 'Jack Taylor',
        uploadedAt: 1704240000000,
        status: 'pending',
        description: 'Proposed delivery schedule'
      },
      {
        id: 'ev7',
        type: 'image',
        name: 'Quality Inspection Report',
        uploadedBy: 'Jack Taylor',
        uploadedAt: 1704240000000,
        status: 'verified',
        description: 'Quality inspection report for goods'
      },
      {
        id: 'ev8',
        type: 'document',
        name: 'Communication Log',
        uploadedBy: 'System',
        uploadedAt: 1704240000000,
        status: 'verified',
        description: 'Complete communication history'
      }
    ],
    timeline: [
      {
        id: 'tl4',
        event: 'dispute_filed',
        timestamp: 1704153600000,
        description: 'Dispute filed by buyer',
        actor: 'Ivy Wang',
        actorRole: 'buyer'
      },
      {
        id: 'tl5',
        event: 'arbiter_assigned',
        timestamp: 1704240000000,
        description: 'Arbiter assigned to case',
        actor: 'Michael Chen',
        actorRole: 'arbiter'
      },
      {
        id: 'tl6',
        event: 'evidence_review',
        timestamp: 1704240000000,
        description: 'Evidence review initiated',
        actor: 'Michael Chen',
        actorRole: 'arbiter'
      }
    ],
    riskAssessment: {
      score: 85,
      level: 'high',
      factors: ['high_amount', 'payment_dispute', 'international_transaction'],
      recommendations: ['mediate_dispute', 'require_arbitration', 'monitor_closely'],
      trend: 'increasing'
    },
    resolution: {
      status: 'in_progress',
      estimatedTime: '14 days',
      options: ['payment_plan', 'partial_refund', 'continue_with_conditions'],
      notes: 'Complex international dispute requiring careful mediation'
    },
    communication: [
      {
        id: 'comm3',
        from: 'Ivy Wang',
        to: 'Jack Taylor',
        timestamp: 1704153600000,
        message: 'The payment terms have not been met as agreed. I need clarification on the delivery schedule.',
        type: 'dispute_notification'
      },
      {
        id: 'comm4',
        from: 'Jack Taylor',
        to: 'Ivy Wang',
        timestamp: 1704240000000,
        message: 'The delivery schedule is flexible as per our agreement. The goods are ready for shipment.',
        type: 'response'
      }
    ]
  },
  {
    id: 'DISP-003',
    escrowId: 'ESC-005',
    buyer: {
      id: 'user5',
      name: 'Liam O\'Connor',
      email: 'liam.oconnor@example.com',
      phone: '+1-555-0789',
      country: 'Ireland',
      kycLevel: 'verified',
      riskScore: 20,
      contactInfo: {
        address: '10 Dublin St, Dublin, Ireland D01 1234',
        phone: '+1-555-0789',
        email: 'liam.oconnor@example.com'
      }
    },
    seller: {
      id: 'user6',
      name: 'Mia Rodriguez',
      email: 'mia.rodriguez@example.com',
      phone: '+1-555-0123',
      country: 'Spain',
      kycLevel: 'verified',
      riskScore: 30,
      contactInfo: {
        address: '25 Madrid Ave, Madrid, Spain 28001',
        phone: '+1-555-0123',
        email: 'mia.rodriguez@example.com'
      }
    },
    arbiter: {
      id: 'arbiter2',
      name: 'Michael Chen',
      email: 'michael.chen@arbiter.com',
      specialization: 'Quality',
      availability: 'available',
      experience: '8 years',
      successRate: 92
    },
    amount: 30000,
    currency: 'USD',
    status: 'resolved',
    priority: 'medium',
    category: 'quality',
    createdAt: 1705795200000, // 2024-01-21
    lastActivity: 1706054400000, // 2024-01-24
    description: 'Quality dispute - buyer claims defective goods',
    evidenceCount: 2,
    // Enhanced data
    evidence: [
      {
        id: 'ev9',
        type: 'document',
        name: 'Quality Inspection Report',
        uploadedBy: 'Liam O\'Connor',
        uploadedAt: 1705795200000,
        status: 'verified',
        description: 'Detailed quality inspection showing defects'
      },
      {
        id: 'ev10',
        type: 'image',
        name: 'Defective Goods Photos',
        uploadedBy: 'Liam O\'Connor',
        uploadedAt: 1706054400000,
        status: 'verified',
        description: 'Photographic evidence of defective goods'
      }
    ],
    timeline: [
      {
        id: 'tl7',
        event: 'dispute_filed',
        timestamp: 1705795200000,
        description: 'Quality dispute filed by buyer',
        actor: 'Liam O\'Connor',
        actorRole: 'buyer'
      },
      {
        id: 'tl8',
        event: 'arbiter_assigned',
        timestamp: 1705881600000,
        description: 'Arbiter assigned to case',
        actor: 'Michael Chen',
        actorRole: 'arbiter'
      },
      {
        id: 'tl9',
        event: 'dispute_resolved',
        timestamp: 1706054400000,
        description: 'Dispute resolved with partial refund',
        actor: 'Michael Chen',
        actorRole: 'arbiter'
      }
    ],
    riskAssessment: {
      score: 45,
      level: 'medium',
      factors: ['quality_dispute', 'verified_parties', 'moderate_amount'],
      recommendations: ['mediate_dispute', 'require_quality_inspection'],
      trend: 'decreasing'
    },
    resolution: {
      status: 'completed',
      estimatedTime: '3 days',
      options: ['refund_buyer', 'partial_refund', 'continue_escrow'],
      notes: 'Dispute resolved with partial refund to buyer',
      outcome: 'Partial refund to buyer',
      amount: 15000
    },
    communication: [
      {
        id: 'comm5',
        from: 'Liam O\'Connor',
        to: 'Mia Rodriguez',
        timestamp: 1705795200000,
        message: 'The goods received do not meet the quality standards specified in our agreement.',
        type: 'dispute_notification'
      },
      {
        id: 'comm6',
        from: 'Mia Rodriguez',
        to: 'Liam O\'Connor',
        timestamp: 1705881600000,
        message: 'I understand your concerns. Let me review the quality specifications.',
        type: 'response'
      }
    ]
  },
  {
    id: 'DISP-004',
    escrowId: 'ESC-001',
    buyer: {
      id: 'user7',
      name: 'John Doe',
      email: 'john.doe@example.com',
      phone: '+1-555-0456',
      country: 'USA',
      kycLevel: 'verified',
      riskScore: 10,
      contactInfo: {
        address: '100 Main St, Boston, MA 02101',
        phone: '+1-555-0456',
        email: 'john.doe@example.com'
      }
    },
    seller: {
      id: 'user8',
      name: 'Jane Smith',
      email: 'jane.smith@example.com',
      phone: '+1-555-0789',
      country: 'USA',
      kycLevel: 'verified',
      riskScore: 15,
      contactInfo: {
        address: '200 Oak St, Chicago, IL 60601',
        phone: '+1-555-0789',
        email: 'jane.smith@example.com'
      }
    },
    arbiter: null,
    amount: 25000,
    currency: 'USD',
    status: 'open',
    priority: 'low',
    category: 'timing',
    createdAt: 1705708800000, // 2024-01-20
    lastActivity: 1705708800000, // 2024-01-20
    description: 'Timing dispute - seller claims late payment',
    evidenceCount: 1,
    // Enhanced data
    evidence: [
      {
        id: 'ev11',
        type: 'document',
        name: 'Payment Schedule',
        uploadedBy: 'Jane Smith',
        uploadedAt: 1705708800000,
        status: 'verified',
        description: 'Original payment schedule agreement'
      }
    ],
    timeline: [
      {
        id: 'tl10',
        event: 'dispute_filed',
        timestamp: 1705708800000,
        description: 'Timing dispute filed by seller',
        actor: 'Jane Smith',
        actorRole: 'seller'
      }
    ],
    riskAssessment: {
      score: 25,
      level: 'low',
      factors: ['timing_dispute', 'verified_parties', 'low_amount'],
      recommendations: ['mediate_dispute', 'clarify_payment_terms'],
      trend: 'stable'
    },
    resolution: {
      status: 'pending',
      estimatedTime: '5 days',
      options: ['extend_payment', 'continue_escrow', 'partial_penalty'],
      notes: 'Requires clarification of payment terms and schedule'
    },
    communication: [
      {
        id: 'comm7',
        from: 'Jane Smith',
        to: 'John Doe',
        timestamp: 1705708800000,
        message: 'Payment was received 3 days after the agreed deadline. This affects our delivery schedule.',
        type: 'dispute_notification'
      }
    ]
  },
];

// Mock arbiters
const mockArbiters = [
  { id: '1', name: 'Sarah Johnson', specialization: 'Commercial', availability: 'available' },
  { id: '2', name: 'Michael Chen', specialization: 'Quality', availability: 'available' },
  { id: '3', name: 'Emily Davis', specialization: 'Payment', availability: 'busy' },
  { id: '4', name: 'Robert Wilson', specialization: 'Delivery', availability: 'available' },
];

const DisputesPage = () => {
  // Require admin, operator, or arbiter role
  useRequireRole(['ADMIN', 'OPERATOR', 'ARBITER']);

  const [disputes, setDisputes] = useState(mockDisputes);
  const [arbiters, setArbiters] = useState(mockArbiters);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [selectedDispute, setSelectedDispute] = useState<any>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [assignArbiterDialogOpen, setAssignArbiterDialogOpen] = useState(false);
  const [selectedArbiter, setSelectedArbiter] = useState('');
  const [isClient, setIsClient] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  
  // New dialog states for enhanced functionality
  const [evidenceDialogOpen, setEvidenceDialogOpen] = useState(false);
  const [timelineDialogOpen, setTimelineDialogOpen] = useState(false);
  const [riskDialogOpen, setRiskDialogOpen] = useState(false);
  const [resolutionDialogOpen, setResolutionDialogOpen] = useState(false);
  const [communicationDialogOpen, setCommunicationDialogOpen] = useState(false);

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

  // Calculate statistics
  const stats = {
    total: disputes.length,
    open: disputes.filter(d => d.status === 'open').length,
    inReview: disputes.filter(d => d.status === 'in_review').length,
    resolved: disputes.filter(d => d.status === 'resolved').length,
    totalAmount: disputes.reduce((sum, d) => sum + d.amount, 0),
    averageResolutionTime: 7.5, // Mock average in days
    criticalPriority: disputes.filter(d => d.priority === 'critical').length,
  };

  // Filter disputes based on search and filters
  const filteredDisputes = disputes.filter(dispute => {
    const matchesSearch = dispute.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         dispute.buyer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         dispute.seller.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || dispute.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || dispute.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const handleViewDetails = (dispute: any) => {
    setSelectedDispute(dispute);
    setDetailDialogOpen(true);
  };

  const handleAssignArbiter = (dispute: any) => {
    setSelectedDispute(dispute);
    setAssignArbiterDialogOpen(true);
  };

  const handleEvidenceManagement = (dispute: any) => {
    if (!dispute.evidence) {
      console.warn('No evidence data available for dispute:', dispute.id);
      return;
    }
    setSelectedDispute(dispute);
    setEvidenceDialogOpen(true);
  };

  const handleTimelineView = (dispute: any) => {
    if (!dispute.timeline) {
      console.warn('No timeline data available for dispute:', dispute.id);
      return;
    }
    setSelectedDispute(dispute);
    setTimelineDialogOpen(true);
  };

  const handleRiskAssessment = (dispute: any) => {
    if (!dispute.riskAssessment) {
      console.warn('No risk assessment data available for dispute:', dispute.id);
      return;
    }
    setSelectedDispute(dispute);
    setRiskDialogOpen(true);
  };

  const handleCommunicationManagement = (dispute: any) => {
    if (!dispute.communication) {
      console.warn('No communication data available for dispute:', dispute.id);
      return;
    }
    setSelectedDispute(dispute);
    setCommunicationDialogOpen(true);
  };

  const handleResolutionManagement = (dispute: any) => {
    if (!dispute.resolution) {
      console.warn('No resolution data available for dispute:', dispute.id);
      return;
    }
    setSelectedDispute(dispute);
    setResolutionDialogOpen(true);
  };

  const handleConfirmAssignArbiter = () => {
    const arbiter = arbiters.find(a => a.id === selectedArbiter);
    setDisputes(disputes.map(dispute => 
      dispute.id === selectedDispute.id 
        ? { 
            ...dispute, 
            arbiter: arbiter ? {
              id: arbiter.id,
              name: arbiter.name,
              email: arbiter.name + '@goldescrow.com',
              specialization: arbiter.specialization,
              availability: arbiter.availability,
              experience: '5 years',
              successRate: 90
            } : null,
            status: 'in_review',
            lastActivity: Date.now()
          } as any
        : dispute
    ));
    setAssignArbiterDialogOpen(false);
    setSelectedDispute(null);
    setSelectedArbiter('');
  };

  const handleResolveDispute = (disputeId: string, resolution: string) => {
    setDisputes(disputes.map(dispute => 
      dispute.id === disputeId 
        ? { 
            ...dispute, 
            status: 'resolved',
            resolution: { ...dispute.resolution, outcome: resolution },
            lastActivity: Date.now()
          } as any
        : dispute
    ));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'error';
      case 'in_review': return 'warning';
      case 'resolved': return 'success';
      default: return 'default';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'success';
      case 'medium': return 'warning';
      case 'high': return 'error';
      case 'critical': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open': return <IconAlertTriangle size={16} />;
      case 'in_review': return <IconClock size={16} />;
      case 'resolved': return <IconCheck size={16} />;
      default: return <IconGavel size={16} />;
    }
  };

  return (
    <PageContainer title="Dispute Management" description="Manage and resolve escrow disputes">
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
                  <Typography variant="h4" fontWeight="bold" sx={{ color: '#FF6B35', mb: 1 }}>
                    Dispute Management
                  </Typography>
                  <Typography variant="body1" color="textSecondary">
                    Comprehensive oversight of all dispute resolution and arbitration processes
                  </Typography>
                </Box>
                <Stack direction="row" spacing={2}>
                  <Button 
                    variant="outlined" 
                    startIcon={<IconDownload />}
                    sx={{ 
                      borderColor: '#FF6B35',
                      color: '#FF6B35',
                      '&:hover': { 
                        borderColor: '#FF6B35', 
                        backgroundColor: 'rgba(255, 107, 53, 0.05)' 
                      }
                    }}
                  >
                    Export Data
                  </Button>
                  <Button 
                    variant="contained" 
                    startIcon={<IconRefresh />}
                    sx={{ 
                      backgroundColor: '#FF6B35', 
                      color: '#ffffff',
                      '&:hover': { backgroundColor: '#E55A2B' }
                    }}
                  >
                    Refresh
                  </Button>
                </Stack>
              </Stack>

                             {/* Key Metrics Grid */}
               <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 1, overflowX: 'auto' }}>
                 <Box>
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
                         {formatCurrency(stats.totalAmount)}
                       </Typography>
                       <Typography variant="body2" color="textSecondary">
                         Total Amount
                       </Typography>
                     </CardContent>
                   </Card>
                 </Box>
                <Box>
                  <Card sx={{ 
                    boxShadow: 1,
                    '&:hover': { boxShadow: 2 },
                    transition: 'all 0.3s ease',
                    height: '100%'
                  }}>
                    <CardContent sx={{ textAlign: 'center', py: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 1 }}>
                        <IconAlertTriangle size={24} style={{ color: '#F44336' }} />
                      </Box>
                      <Typography variant="h5" fontWeight="bold" sx={{ color: '#F44336', mb: 0.5 }}>
                        {formatNumber(stats.open)}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Open Disputes
                      </Typography>
                    </CardContent>
                  </Card>
                </Box>
                <Box>
                  <Card sx={{ 
                    boxShadow: 1,
                    '&:hover': { boxShadow: 2 },
                    transition: 'all 0.3s ease',
                    height: '100%'
                  }}>
                    <CardContent sx={{ textAlign: 'center', py: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 1 }}>
                        <IconClock size={24} style={{ color: '#FF9800' }} />
                      </Box>
                      <Typography variant="h5" fontWeight="bold" sx={{ color: '#FF9800', mb: 0.5 }}>
                        {formatNumber(stats.inReview)}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        In Review
                      </Typography>
                    </CardContent>
                  </Card>
                </Box>
                <Box>
                  <Card sx={{ 
                    boxShadow: 1,
                    '&:hover': { boxShadow: 2 },
                    transition: 'all 0.3s ease',
                    height: '100%'
                  }}>
                    <CardContent sx={{ textAlign: 'center', py: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 1 }}>
                        <IconCheck size={24} style={{ color: '#4CAF50' }} />
                      </Box>
                      <Typography variant="h5" fontWeight="bold" sx={{ color: '#4CAF50', mb: 0.5 }}>
                        {formatNumber(stats.resolved)}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Resolved
                      </Typography>
                    </CardContent>
                  </Card>
                </Box>
                <Box>
                  <Card sx={{ 
                    boxShadow: 1,
                    '&:hover': { boxShadow: 2 },
                    transition: 'all 0.3s ease',
                    height: '100%'
                  }}>
                    <CardContent sx={{ textAlign: 'center', py: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 1 }}>
                        <IconGavel size={24} style={{ color: '#FF6B35' }} />
                      </Box>
                      <Typography variant="h5" fontWeight="bold" sx={{ color: '#FF6B35', mb: 0.5 }}>
                        {formatNumber(stats.total)}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Total Disputes
                      </Typography>
                    </CardContent>
                  </Card>
                </Box>
                <Box>
                  <Card sx={{ 
                    boxShadow: 1,
                    '&:hover': { boxShadow: 2 },
                    transition: 'all 0.3s ease',
                    height: '100%'
                  }}>
                    <CardContent sx={{ textAlign: 'center', py: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 1 }}>
                        <IconClock size={24} style={{ color: '#FFC107' }} />
                      </Box>
                      <Typography variant="h5" fontWeight="bold" sx={{ color: '#FFC107', mb: 0.5 }}>
                        {stats.averageResolutionTime}d
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Avg Resolution
                      </Typography>
                    </CardContent>
                  </Card>
                </Box>
                <Box>
                  <Card sx={{ 
                    boxShadow: 1,
                    '&:hover': { boxShadow: 2 },
                    transition: 'all 0.3s ease',
                    height: '100%'
                  }}>
                    <CardContent sx={{ textAlign: 'center', py: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 1 }}>
                        <IconExclamationCircle size={24} style={{ color: '#F44336' }} />
                      </Box>
                      <Typography variant="h5" fontWeight="bold" sx={{ color: '#F44336', mb: 0.5 }}>
                        {formatNumber(stats.criticalPriority)}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Critical Priority
                      </Typography>
                    </CardContent>
                  </Card>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </motion.div>

        {/* Filters */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
                         <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ xs: 'stretch', sm: 'center' }}>
               <TextField
                 placeholder="Search disputes..."
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
                   <MenuItem value="open">Open</MenuItem>
                   <MenuItem value="in_review">In Review</MenuItem>
                   <MenuItem value="resolved">Resolved</MenuItem>
                 </Select>
               </FormControl>

               <FormControl sx={{ minWidth: { xs: '100%', sm: 150 } }}>
                 <InputLabel>Priority</InputLabel>
                 <Select
                   value={priorityFilter}
                   onChange={(e) => setPriorityFilter(e.target.value)}
                   label="Priority"
                 >
                   <MenuItem value="all">All Priorities</MenuItem>
                   <MenuItem value="low">Low</MenuItem>
                   <MenuItem value="medium">Medium</MenuItem>
                   <MenuItem value="high">High</MenuItem>
                   <MenuItem value="critical">Critical</MenuItem>
                 </Select>
               </FormControl>

               <Button
                 variant="outlined"
                 startIcon={<IconFilter />}
                 onClick={() => {
                   setSearchQuery('');
                   setStatusFilter('all');
                   setPriorityFilter('all');
                 }}
                 sx={{ minWidth: { xs: '100%', sm: 'auto' } }}
               >
                 Clear Filters
               </Button>
             </Stack>
          </CardContent>
        </Card>

        {/* Disputes Table */}
        <Card>
          <CardContent>
            <TableContainer component={Paper} elevation={0}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Dispute ID</TableCell>
                    <TableCell>Escrow</TableCell>
                    <TableCell>Parties</TableCell>
                    <TableCell>Amount</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Priority</TableCell>
                    <TableCell>Arbiter</TableCell>
                    <TableCell>Evidence</TableCell>
                    <TableCell>Last Activity</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredDisputes.map((dispute) => (
                    <TableRow key={dispute.id} hover>
                      <TableCell>
                        <Typography variant="subtitle2" fontWeight="bold">
                          {dispute.id}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          {dispute.category}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight="bold">
                          {dispute.escrowId}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body2">
                            <strong>Buyer:</strong> {dispute.buyer.name}
                          </Typography>
                          <Typography variant="body2">
                            <strong>Seller:</strong> {dispute.seller.name}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="subtitle2" fontWeight="bold">
                          {formatCurrency(dispute.amount, dispute.currency)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          icon={getStatusIcon(dispute.status)}
                          label={dispute.status}
                          color={getStatusColor(dispute.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={dispute.priority}
                          color={getPriorityColor(dispute.priority)}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {dispute.arbiter ? dispute.arbiter.name : 'Unassigned'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {dispute.evidenceCount} items
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="textSecondary">
                          {formatDate(dispute.lastActivity, 'date')}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: 0.5, alignItems: 'flex-start' }}>
                          {/* View Details - Always First */}
                          <Tooltip title="View Details">
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => handleViewDetails(dispute)}
                              sx={{ 
                                backgroundColor: 'rgba(33, 150, 243, 0.1)',
                                '&:hover': { backgroundColor: 'rgba(33, 150, 243, 0.2)' }
                              }}
                            >
                              <IconEye size={16} />
                            </IconButton>
                          </Tooltip>

                          {/* Evidence Management - Always Second */}
                          <Tooltip title="Evidence Management">
                            <IconButton
                              size="small"
                              color="info"
                              onClick={() => handleEvidenceManagement(dispute)}
                              sx={{ 
                                backgroundColor: 'rgba(0, 188, 212, 0.1)',
                                '&:hover': { backgroundColor: 'rgba(0, 188, 212, 0.2)' }
                              }}
                            >
                              <IconFileText size={16} />
                            </IconButton>
                          </Tooltip>

                          {/* Timeline View - Always Third */}
                          <Tooltip title="Timeline View">
                            <IconButton
                              size="small"
                              color="secondary"
                              onClick={() => handleTimelineView(dispute)}
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
                              onClick={() => handleRiskAssessment(dispute)}
                              sx={{ 
                                backgroundColor: 'rgba(244, 67, 54, 0.1)',
                                '&:hover': { backgroundColor: 'rgba(244, 67, 54, 0.2)' }
                              }}
                            >
                              <IconShield size={16} />
                            </IconButton>
                          </Tooltip>

                          {/* Communication Management - Always Fifth */}
                          <Tooltip title="Communication Management">
                            <IconButton
                              size="small"
                              color="success"
                              onClick={() => handleCommunicationManagement(dispute)}
                              sx={{ 
                                backgroundColor: 'rgba(76, 175, 80, 0.1)',
                                '&:hover': { backgroundColor: 'rgba(76, 175, 80, 0.2)' }
                              }}
                            >
                              <IconMessage size={16} />
                            </IconButton>
                          </Tooltip>

                          {/* Resolution Management - Always Sixth */}
                          <Tooltip title="Resolution Management">
                            <IconButton
                              size="small"
                              color="warning"
                              onClick={() => handleResolutionManagement(dispute)}
                              sx={{ 
                                backgroundColor: 'rgba(255, 193, 7, 0.1)',
                                '&:hover': { backgroundColor: 'rgba(255, 193, 7, 0.2)' }
                              }}
                            >
                              <IconGavel size={16} />
                            </IconButton>
                          </Tooltip>

                          {/* Assign Arbiter - Conditional Seventh */}
                          {!dispute.arbiter ? (
                            <Tooltip title="Assign Arbiter">
                              <IconButton
                                size="small"
                                sx={{ 
                                  color: '#FF6B35',
                                  backgroundColor: 'rgba(255, 107, 53, 0.1)',
                                  '&:hover': { backgroundColor: 'rgba(255, 107, 53, 0.2)' }
                                }}
                                onClick={() => handleAssignArbiter(dispute)}
                              >
                                <IconUserCheck size={16} />
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

        {/* Dispute Details Dialog */}
        <Dialog open={detailDialogOpen} onClose={() => setDetailDialogOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle>Dispute Details - {selectedDispute?.id}</DialogTitle>
          <DialogContent>
            {selectedDispute && (
              <Stack spacing={3} sx={{ mt: 2 }}>
                <Box>
                  <Typography variant="h6" gutterBottom>Dispute Information</Typography>
                  <Stack direction="row" spacing={4}>
                                         <Box>
                       <Typography variant="body2" color="textSecondary">Amount</Typography>
                       <Typography variant="h6">
                         {typeof selectedDispute.amount === 'string' ? selectedDispute.amount : formatCurrency(selectedDispute.amount, selectedDispute.currency)}
                       </Typography>
                     </Box>
                    <Box>
                      <Typography variant="body2" color="textSecondary">Status</Typography>
                      <Chip
                        icon={getStatusIcon(selectedDispute.status)}
                        label={selectedDispute.status}
                        color={getStatusColor(selectedDispute.status)}
                        size="small"
                      />
                    </Box>
                    <Box>
                      <Typography variant="body2" color="textSecondary">Priority</Typography>
                      <Chip
                        label={selectedDispute.priority}
                        color={getPriorityColor(selectedDispute.priority)}
                        size="small"
                      />
                    </Box>
                  </Stack>
                </Box>

                <Box>
                  <Typography variant="h6" gutterBottom>Description</Typography>
                  <Typography variant="body1">{selectedDispute.description}</Typography>
                </Box>

                                 <Box>
                   <Typography variant="h6" gutterBottom>Parties</Typography>
                   <Stack spacing={1}>
                     <Box>
                       <Typography variant="body2" color="textSecondary">Buyer</Typography>
                       <Typography variant="body1">
                         {typeof selectedDispute.buyer === 'string' ? selectedDispute.buyer : selectedDispute.buyer.name}
                       </Typography>
                     </Box>
                     <Box>
                       <Typography variant="body2" color="textSecondary">Seller</Typography>
                       <Typography variant="body1">
                         {typeof selectedDispute.seller === 'string' ? selectedDispute.seller : selectedDispute.seller.name}
                       </Typography>
                     </Box>
                     {selectedDispute.arbiter && (
                       <Box>
                         <Typography variant="body2" color="textSecondary">Assigned Arbiter</Typography>
                         <Typography variant="body1">{selectedDispute.arbiter.name}</Typography>
                       </Box>
                     )}
                   </Stack>
                 </Box>

                <Box>
                  <Typography variant="h6" gutterBottom>Evidence ({selectedDispute.evidenceCount} items)</Typography>
                  <Accordion>
                    <AccordionSummary expandIcon={<IconChevronDown />}>
                      <Typography>View Evidence</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <List>
                        <ListItem>
                          <ListItemAvatar>
                            <Avatar>
                              <IconFileText />
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary="Buyer Evidence"
                            secondary="Documentation of goods received"
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemAvatar>
                            <Avatar>
                              <IconFileText />
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary="Seller Evidence"
                            secondary="Proof of delivery and quality"
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemAvatar>
                            <Avatar>
                              <IconMessage />
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary="Communication Log"
                            secondary="Email and message history"
                          />
                        </ListItem>
                      </List>
                    </AccordionDetails>
                  </Accordion>
                </Box>

                <Box>
                  <Typography variant="h6" gutterBottom>Timeline</Typography>
                  <Stack spacing={1}>
                    <Box>
                      <Typography variant="body2" color="textSecondary">Created</Typography>
                      <Typography variant="body1">{selectedDispute.createdAt}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="textSecondary">Last Activity</Typography>
                      <Typography variant="body1">{selectedDispute.lastActivity}</Typography>
                    </Box>
                  </Stack>
                </Box>

                {selectedDispute.resolution && (
                  <Alert severity="success">
                    <Typography variant="subtitle2">Resolution</Typography>
                    <Typography variant="body2">{selectedDispute.resolution}</Typography>
                  </Alert>
                )}
              </Stack>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDetailDialogOpen(false)}>Close</Button>
          </DialogActions>
        </Dialog>

        {/* Evidence Management Dialog */}
        <Dialog open={evidenceDialogOpen} onClose={() => setEvidenceDialogOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle>Evidence Management - {selectedDispute?.id}</DialogTitle>
          <DialogContent>
            {selectedDispute && (
              <Stack spacing={3} sx={{ mt: 2 }}>
                <Typography variant="h6" gutterBottom>Evidence Items ({selectedDispute.evidence.length})</Typography>
                <List>
                  {selectedDispute.evidence.map((ev: any) => (
                    <ListItem key={ev.id} divider>
                      <ListItemAvatar>
                        <Avatar>
                          <IconFileText />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={ev.name}
                        secondary={
                          <Box>
                            <Typography variant="body2">Type: {ev.type}</Typography>
                            <Typography variant="body2">Uploaded by: {ev.uploadedBy}</Typography>
                            <Typography variant="body2">Date: {formatDate(ev.uploadedAt, 'datetime')}</Typography>
                            <Typography variant="body2">Status: {ev.status}</Typography>
                            <Typography variant="body2">Description: {ev.description}</Typography>
                          </Box>
                        }
                      />
                      <Chip 
                        label={ev.status} 
                        color={ev.status === 'verified' ? 'success' : ev.status === 'pending' ? 'warning' : 'default'}
                        size="small"
                      />
                    </ListItem>
                  ))}
                </List>
              </Stack>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEvidenceDialogOpen(false)}>Close</Button>
          </DialogActions>
        </Dialog>

        {/* Timeline View Dialog */}
        <Dialog open={timelineDialogOpen} onClose={() => setTimelineDialogOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle>Timeline View - {selectedDispute?.id}</DialogTitle>
          <DialogContent>
            {selectedDispute && (
              <Stack spacing={3} sx={{ mt: 2 }}>
                <Typography variant="h6" gutterBottom>Dispute Timeline</Typography>
                <List>
                  {selectedDispute.timeline.map((event: any) => (
                    <ListItem key={event.id} divider>
                      <ListItemAvatar>
                        <Avatar>
                          <IconHistory />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={event.description}
                        secondary={
                          <Box>
                            <Typography variant="body2">Event: {event.event}</Typography>
                            <Typography variant="body2">Actor: {event.actor} ({event.actorRole})</Typography>
                            <Typography variant="body2">Date: {formatDate(event.timestamp, 'datetime')}</Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </Stack>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setTimelineDialogOpen(false)}>Close</Button>
          </DialogActions>
        </Dialog>

        {/* Risk Assessment Dialog */}
        <Dialog open={riskDialogOpen} onClose={() => setRiskDialogOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle>Risk Assessment - {selectedDispute?.id}</DialogTitle>
          <DialogContent>
            {selectedDispute && (
              <Stack spacing={3} sx={{ mt: 2 }}>
                <Box>
                  <Typography variant="h6" gutterBottom>Risk Score</Typography>
                  <Typography variant="h4" color="error" gutterBottom>
                    {selectedDispute.riskAssessment.score}/100
                  </Typography>
                  <Chip 
                    label={selectedDispute.riskAssessment.level.toUpperCase()} 
                    color={selectedDispute.riskAssessment.level === 'high' ? 'error' : selectedDispute.riskAssessment.level === 'medium' ? 'warning' : 'success'}
                  />
                </Box>
                
                <Box>
                  <Typography variant="h6" gutterBottom>Risk Factors</Typography>
                  <List>
                    {selectedDispute.riskAssessment.factors.map((factor: string, index: number) => (
                      <ListItem key={index}>
                        <ListItemIcon>
                          <IconAlertTriangle color="error" />
                        </ListItemIcon>
                        <ListItemText primary={factor} />
                      </ListItem>
                    ))}
                  </List>
                </Box>

                <Box>
                  <Typography variant="h6" gutterBottom>Recommendations</Typography>
                  <List>
                    {selectedDispute.riskAssessment.recommendations.map((rec: string, index: number) => (
                      <ListItem key={index}>
                        <ListItemIcon>
                          <IconCheck color="success" />
                        </ListItemIcon>
                        <ListItemText primary={rec} />
                      </ListItem>
                    ))}
                  </List>
                </Box>

                <Box>
                  <Typography variant="h6" gutterBottom>Trend</Typography>
                  <Chip 
                    label={selectedDispute.riskAssessment.trend} 
                    color={selectedDispute.riskAssessment.trend === 'increasing' ? 'error' : selectedDispute.riskAssessment.trend === 'decreasing' ? 'success' : 'default'}
                  />
                </Box>
              </Stack>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setRiskDialogOpen(false)}>Close</Button>
          </DialogActions>
        </Dialog>

        {/* Communication Management Dialog */}
        <Dialog open={communicationDialogOpen} onClose={() => setCommunicationDialogOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle>Communication Management - {selectedDispute?.id}</DialogTitle>
          <DialogContent>
            {selectedDispute && (
              <Stack spacing={3} sx={{ mt: 2 }}>
                <Typography variant="h6" gutterBottom>Communication History</Typography>
                <List>
                  {selectedDispute.communication.map((comm: any) => (
                    <ListItem key={comm.id} divider>
                      <ListItemAvatar>
                        <Avatar>
                          <IconMessage />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={`${comm.from} → ${comm.to}`}
                        secondary={
                          <Box>
                            <Typography variant="body2" sx={{ mb: 1 }}>{comm.message}</Typography>
                            <Typography variant="body2" color="textSecondary">
                              {formatDate(comm.timestamp, 'datetime')} - {comm.type}
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </Stack>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCommunicationDialogOpen(false)}>Close</Button>
          </DialogActions>
        </Dialog>

        {/* Resolution Management Dialog */}
        <Dialog open={resolutionDialogOpen} onClose={() => setResolutionDialogOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle>Resolution Management - {selectedDispute?.id}</DialogTitle>
          <DialogContent>
            {selectedDispute && (
              <Stack spacing={3} sx={{ mt: 2 }}>
                <Box>
                  <Typography variant="h6" gutterBottom>Current Status</Typography>
                  <Chip 
                    label={selectedDispute.resolution.status} 
                    color={selectedDispute.resolution.status === 'completed' ? 'success' : selectedDispute.resolution.status === 'in_progress' ? 'warning' : 'default'}
                  />
                </Box>

                <Box>
                  <Typography variant="h6" gutterBottom>Estimated Resolution Time</Typography>
                  <Typography variant="body1">{selectedDispute.resolution.estimatedTime}</Typography>
                </Box>

                <Box>
                  <Typography variant="h6" gutterBottom>Resolution Options</Typography>
                  <List>
                    {selectedDispute.resolution.options.map((option: string, index: number) => (
                      <ListItem key={index}>
                        <ListItemIcon>
                          <IconGavel />
                        </ListItemIcon>
                        <ListItemText primary={option} />
                      </ListItem>
                    ))}
                  </List>
                </Box>

                <Box>
                  <Typography variant="h6" gutterBottom>Notes</Typography>
                  <Typography variant="body1">{selectedDispute.resolution.notes}</Typography>
                </Box>

                {selectedDispute.resolution.outcome && (
                  <Alert severity="success">
                    <Typography variant="subtitle2">Resolution Outcome</Typography>
                    <Typography variant="body2">Outcome: {selectedDispute.resolution.outcome}</Typography>
                    {selectedDispute.resolution.amount && (
                      <Typography variant="body2">Amount: {formatCurrency(selectedDispute.resolution.amount, selectedDispute.currency)}</Typography>
                    )}
                  </Alert>
                )}
              </Stack>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setResolutionDialogOpen(false)}>Close</Button>
          </DialogActions>
        </Dialog>

        {/* Assign Arbiter Dialog */}
        <Dialog open={assignArbiterDialogOpen} onClose={() => setAssignArbiterDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Assign Arbiter</DialogTitle>
          <DialogContent>
            <Typography variant="body1" sx={{ mb: 2 }}>
              Select an arbiter to handle dispute {selectedDispute?.id}:
            </Typography>
            <FormControl fullWidth>
              <InputLabel>Arbiter</InputLabel>
              <Select
                value={selectedArbiter}
                onChange={(e) => setSelectedArbiter(e.target.value)}
                label="Arbiter"
              >
                {arbiters.filter(a => a.availability === 'available').map((arbiter) => (
                  <MenuItem key={arbiter.id} value={arbiter.id}>
                    {arbiter.name} - {arbiter.specialization}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setAssignArbiterDialogOpen(false)}>Cancel</Button>
            <Button 
              variant="contained" 
              onClick={handleConfirmAssignArbiter}
              disabled={!selectedArbiter}
            >
              Assign Arbiter
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </PageContainer>
  );
};

export default DisputesPage;
