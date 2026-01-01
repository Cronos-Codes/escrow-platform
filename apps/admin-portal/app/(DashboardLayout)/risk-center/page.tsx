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
  Divider,
  Switch,
  FormControlLabel,
  AlertTitle,
} from '@mui/material';
import {
  IconSearch,
  IconFilter,
  IconEye,
  IconAlertTriangle,
  IconShield,
  IconShieldCheck,
  IconShieldX,
  IconClock,
  IconCheck,
  IconX,
  IconRefresh,
  IconDownload,
  IconSettings,
  IconTrendingUp,
  IconTrendingDown,
  IconFlag,
  IconLock,
  IconCoins,
  IconReceipt,
  IconDiamond,
  IconShieldLock,
  IconAlertCircle,
  IconBrain,
  IconRadar,
} from '@tabler/icons-react';
import { motion } from 'framer-motion';
import { alpha } from '@mui/material/styles';
import PageContainer from '@/app/(DashboardLayout)/components/container/PageContainer';
import { useRequireRole } from '@/hooks/useRequireRole';

// Mock data for risk flags
const mockRiskFlags = [
  {
    id: 'RF-001',
    type: 'suspicious_activity',
    severity: 'high',
    status: 'active',
    entity: 'ESC-004',
    entityType: 'escrow',
    description: 'Unusual transaction pattern detected',
    riskScore: 85,
    createdAt: '2024-01-22',
    lastUpdated: '2024-01-23',
    assignedTo: 'Sarah Johnson',
    autoAction: 'flag',
    manualAction: null,
  },
  {
    id: 'RF-002',
    type: 'kyc_verification',
    severity: 'medium',
    status: 'resolved',
    entity: 'USER-003',
    entityType: 'user',
    description: 'KYC verification failed',
    riskScore: 65,
    createdAt: '2024-01-20',
    lastUpdated: '2024-01-21',
    assignedTo: 'Michael Chen',
    autoAction: 'suspend',
    manualAction: 'kyc_review',
  },
  {
    id: 'RF-003',
    type: 'payment_anomaly',
    severity: 'critical',
    status: 'active',
    entity: 'ESC-002',
    entityType: 'escrow',
    description: 'Payment amount exceeds normal limits',
    riskScore: 95,
    createdAt: '2024-01-23',
    lastUpdated: '2024-01-23',
    assignedTo: null,
    autoAction: 'lock',
    manualAction: null,
  },
  {
    id: 'RF-004',
    type: 'geographic_risk',
    severity: 'low',
    status: 'monitoring',
    entity: 'USER-007',
    entityType: 'user',
    description: 'User from high-risk jurisdiction',
    riskScore: 45,
    createdAt: '2024-01-19',
    lastUpdated: '2024-01-20',
    assignedTo: 'Emily Davis',
    autoAction: 'monitor',
    manualAction: null,
  },
  {
    id: 'RF-005',
    type: 'behavioral_pattern',
    severity: 'medium',
    status: 'active',
    entity: 'ESC-001',
    entityType: 'escrow',
    description: 'Unusual user behavior pattern',
    riskScore: 70,
    createdAt: '2024-01-21',
    lastUpdated: '2024-01-22',
    assignedTo: 'Robert Wilson',
    autoAction: 'flag',
    manualAction: null,
  },
];

// Mock risk rules
const mockRiskRules = [
  {
    id: 'RR-001',
    name: 'High Value Transaction Alert',
    description: 'Flag transactions above $100,000',
    status: 'active',
    threshold: '$100,000',
    action: 'flag',
    priority: 'high',
  },
  {
    id: 'RR-002',
    name: 'Rapid Transaction Detection',
    description: 'Detect multiple transactions in short time',
    status: 'active',
    threshold: '5 transactions/hour',
    action: 'suspend',
    priority: 'medium',
  },
  {
    id: 'RR-003',
    name: 'Geographic Risk Assessment',
    description: 'Monitor high-risk jurisdictions',
    status: 'active',
    threshold: 'Risk score > 80',
    action: 'monitor',
    priority: 'low',
  },
];

const RiskCenterPage = () => {
  // Require admin or operator role
  useRequireRole(['ADMIN', 'OPERATOR']);

  const [riskFlags, setRiskFlags] = useState(mockRiskFlags);
  const [riskRules] = useState(mockRiskRules);
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedFlag, setSelectedFlag] = useState<any>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [selectedAction, setSelectedAction] = useState('');
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

  // Helper function for currency formatting
  const formatCurrency = (amount: number, currency: string = 'USD') => {
    if (!isClient) return 'Loading...';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  // Filter risk flags based on search and filters
  const filteredRiskFlags = riskFlags.filter(flag => {
    const matchesSearch = flag.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         flag.entity.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         flag.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSeverity = severityFilter === 'all' || flag.severity === severityFilter;
    const matchesStatus = statusFilter === 'all' || flag.status === statusFilter;
    
    return matchesSearch && matchesSeverity && matchesStatus;
  });

  const handleViewDetails = (flag: any) => {
    setSelectedFlag(flag);
    setDetailDialogOpen(true);
  };

  const handleTakeAction = (flag: any) => {
    setSelectedFlag(flag);
    setActionDialogOpen(true);
  };

  const handleConfirmAction = () => {
    if (!selectedFlag || !selectedAction) return;
    
    // Execute the selected action
    const updatedFlag = { ...selectedFlag };
    
    switch (selectedAction) {
      case 'investigate':
        updatedFlag.status = 'monitoring';
        updatedFlag.manualAction = 'Under Investigation';
        break;
      case 'resolve':
        updatedFlag.status = 'resolved';
        updatedFlag.manualAction = 'Manually Resolved';
        break;
      case 'escalate':
        updatedFlag.status = 'active';
        updatedFlag.manualAction = 'Escalated for Review';
        updatedFlag.severity = 'critical';
        break;
      case 'false_positive':
        updatedFlag.status = 'resolved';
        updatedFlag.manualAction = 'False Positive';
        break;
      default:
        break;
    }
    
    updatedFlag.lastUpdated = new Date().toISOString().split('T')[0];
    
    setRiskFlags(riskFlags.map((flag: any) => 
      flag.id === selectedFlag.id ? updatedFlag : flag
    ) as any);
    
    setActionDialogOpen(false);
    setSelectedFlag(null);
    setSelectedAction('');
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'success';
      case 'medium': return 'warning';
      case 'high': return 'error';
      case 'critical': return 'error';
      default: return 'default';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'error';
      case 'monitoring': return 'warning';
      case 'resolved': return 'success';
      default: return 'default';
    }
  };

  const getRiskScoreColor = (score: number) => {
    if (score >= 80) return 'error';
    if (score >= 60) return 'warning';
    return 'success';
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'flag': return <IconFlag size={16} />;
      case 'suspend': return <IconShieldX size={16} />;
      case 'lock': return <IconLock size={16} />;
      case 'monitor': return <IconEye size={16} />;
      default: return <IconShield size={16} />;
    }
  };

  // Function to execute auto actions
  const executeAutoAction = (flag: any) => {
    const updatedFlag = { ...flag };
    
    switch (flag.autoAction) {
      case 'flag':
        // Flag the entity for review
        updatedFlag.status = 'active';
        updatedFlag.manualAction = 'Auto-flagged for review';
        break;
      case 'suspend':
        // Suspend the entity
        updatedFlag.status = 'active';
        updatedFlag.manualAction = 'Auto-suspended';
        updatedFlag.severity = 'high';
        break;
      case 'lock':
        // Lock the entity
        updatedFlag.status = 'active';
        updatedFlag.manualAction = 'Auto-locked';
        updatedFlag.severity = 'critical';
        break;
      case 'monitor':
        // Put under monitoring
        updatedFlag.status = 'monitoring';
        updatedFlag.manualAction = 'Auto-monitoring';
        break;
      default:
        break;
    }
    
    updatedFlag.lastUpdated = new Date().toISOString().split('T')[0];
    return updatedFlag;
  };

  // Function to handle auto action execution
  const handleAutoAction = (flag: any) => {
    const updatedFlag = executeAutoAction(flag);
    setRiskFlags(riskFlags.map((f: any) => 
      f.id === flag.id ? updatedFlag : f
    ) as any);
  };

  return (
    <PageContainer title="Risk Center" description="Monitor and manage risk flags and automated risk assessment">
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
                    Risk Center
                  </Typography>
                  <Typography variant="body1" color="textSecondary">
                    Advanced risk monitoring and automated threat detection system
                  </Typography>
                </Box>
                <Stack direction="row" spacing={2}>
                  <Button 
                    variant="outlined" 
                    startIcon={<IconSettings />}
                    sx={{ 
                      borderColor: '#FFC107',
                      color: '#FFC107',
                      '&:hover': { 
                        borderColor: '#FFC107', 
                        backgroundColor: 'rgba(255, 193, 7, 0.05)' 
                      }
                    }}
                  >
                    Risk Rules
                  </Button>
                  <Button 
                    variant="outlined" 
                    startIcon={<IconShield />}
                    onClick={() => {
                      const pendingFlags = riskFlags.filter(f => !f.manualAction && f.status === 'active');
                      pendingFlags.forEach(flag => handleAutoAction(flag));
                    }}
                    sx={{ 
                      borderColor: '#FFC107',
                      color: '#FFC107',
                      '&:hover': { 
                        borderColor: '#FFC107', 
                        backgroundColor: 'rgba(255, 193, 7, 0.05)' 
                      }
                    }}
                  >
                    Execute All Auto Actions
                  </Button>
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
                    Export Report
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
                      <IconAlertTriangle size={24} style={{ color: '#F44336' }} />
                    </Box>
                    <Typography variant="h5" fontWeight="bold" sx={{ color: '#F44336', mb: 0.5 }}>
                      {formatNumber(riskFlags.filter(f => f.status === 'active').length)}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Active Flags
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
                      <IconShieldLock size={24} style={{ color: '#FF9800' }} />
                    </Box>
                    <Typography variant="h5" fontWeight="bold" sx={{ color: '#FF9800', mb: 0.5 }}>
                      {formatNumber(riskFlags.filter(f => f.severity === 'critical').length)}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Critical Risks
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
                      <IconCheck size={24} style={{ color: '#4CAF50' }} />
                    </Box>
                    <Typography variant="h5" fontWeight="bold" sx={{ color: '#4CAF50', mb: 0.5 }}>
                      {formatNumber(riskFlags.filter(f => f.status === 'resolved').length)}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Resolved
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
                      <IconBrain size={24} style={{ color: '#2196F3' }} />
                    </Box>
                    <Typography variant="h5" fontWeight="bold" sx={{ color: '#2196F3', mb: 0.5 }}>
                      {formatNumber(riskRules.filter(r => r.status === 'active').length)}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Active Rules
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
                      <IconRadar size={24} style={{ color: '#9C27B0' }} />
                    </Box>
                    <Typography variant="h5" fontWeight="bold" sx={{ color: '#9C27B0', mb: 0.5 }}>
                      {formatNumber(riskFlags.filter(f => f.severity === 'high').length)}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      High Risk
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
                      <IconAlertCircle size={24} style={{ color: '#FF5722' }} />
                    </Box>
                    <Typography variant="h5" fontWeight="bold" sx={{ color: '#FF5722', mb: 0.5 }}>
                      {formatNumber(riskFlags.filter(f => f.status === 'monitoring').length)}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Monitoring
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
                      <IconShield size={24} style={{ color: '#FFC107' }} />
                    </Box>
                    <Typography variant="h5" fontWeight="bold" sx={{ color: '#FFC107', mb: 0.5 }}>
                      {formatNumber(riskFlags.filter(f => !f.manualAction && f.status === 'active').length)}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Pending Auto Actions
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
                placeholder="Search risk flags..."
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
                <InputLabel>Severity</InputLabel>
                <Select
                  value={severityFilter}
                  onChange={(e) => setSeverityFilter(e.target.value)}
                  label="Severity"
                >
                  <MenuItem value="all">All Severities</MenuItem>
                  <MenuItem value="low">Low</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                  <MenuItem value="critical">Critical</MenuItem>
                </Select>
              </FormControl>

              <FormControl sx={{ minWidth: { xs: '100%', sm: 150 } }}>
                <InputLabel>Status</InputLabel>
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  label="Status"
                >
                  <MenuItem value="all">All Status</MenuItem>
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="monitoring">Monitoring</MenuItem>
                  <MenuItem value="resolved">Resolved</MenuItem>
                </Select>
              </FormControl>

              <Button
                variant="outlined"
                startIcon={<IconFilter />}
                onClick={() => {
                  setSearchQuery('');
                  setSeverityFilter('all');
                  setStatusFilter('all');
                }}
                sx={{ minWidth: { xs: '100%', sm: 'auto' } }}
              >
                Clear Filters
              </Button>
            </Stack>
          </CardContent>
        </Card>

        {/* Risk Flags Table */}
        <Card>
          <CardContent>
            <TableContainer component={Paper} elevation={0} sx={{ overflowX: 'auto' }}>
              <Table sx={{ minWidth: 650 }}>
                <TableHead>
                  <TableRow>
                    <TableCell>Flag ID</TableCell>
                    <TableCell>Entity</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Severity</TableCell>
                    <TableCell>Risk Score</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Auto Action</TableCell>
                    <TableCell>Assigned To</TableCell>
                    <TableCell>Last Updated</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredRiskFlags.map((flag) => (
                    <TableRow key={flag.id} hover>
                      <TableCell>
                        <Typography variant="subtitle2" fontWeight="bold">
                          {flag.id}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          {flag.createdAt}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" fontWeight="bold">
                            {flag.entity}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            {flag.entityType}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {flag.type.replace('_', ' ')}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={flag.severity}
                          color={getSeverityColor(flag.severity)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" fontWeight="bold">
                            {flag.riskScore}
                          </Typography>
                          <LinearProgress
                            variant="determinate"
                            value={flag.riskScore}
                            color={getRiskScoreColor(flag.riskScore)}
                            sx={{ mt: 0.5, height: 4 }}
                          />
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={flag.status}
                          color={getStatusColor(flag.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          icon={getActionIcon(flag.autoAction)}
                          label={flag.autoAction}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {flag.assignedTo || 'Unassigned'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="textSecondary">
                          {flag.lastUpdated}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={1}>
                          <Tooltip title="View Details">
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => handleViewDetails(flag)}
                            >
                              <IconEye size={16} />
                            </IconButton>
                          </Tooltip>
                          {flag.status === 'active' && (
                            <Tooltip title="Take Manual Action">
                              <IconButton
                                size="small"
                                color="warning"
                                onClick={() => handleTakeAction(flag)}
                              >
                                <IconShieldCheck size={16} />
                              </IconButton>
                            </Tooltip>
                          )}
                          {!flag.manualAction && (
                            <Tooltip title="Execute Auto Action">
                              <IconButton
                                size="small"
                                color="info"
                                onClick={() => handleAutoAction(flag)}
                              >
                                <IconShield size={16} />
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

        {/* Risk Flag Details Dialog */}
        <Dialog open={detailDialogOpen} onClose={() => setDetailDialogOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle>Risk Flag Details - {selectedFlag?.id}</DialogTitle>
          <DialogContent>
            {selectedFlag && (
              <Stack spacing={3} sx={{ mt: 2 }}>
                <Box>
                  <Typography variant="h6" gutterBottom>Risk Information</Typography>
                  <Stack direction="row" spacing={4}>
                    <Box>
                      <Typography variant="body2" color="textSecondary">Risk Score</Typography>
                      <Typography variant="h6" color={getRiskScoreColor(selectedFlag.riskScore)}>
                        {selectedFlag.riskScore}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="textSecondary">Severity</Typography>
                      <Chip
                        label={selectedFlag.severity}
                        color={getSeverityColor(selectedFlag.severity)}
                        size="small"
                      />
                    </Box>
                    <Box>
                      <Typography variant="body2" color="textSecondary">Status</Typography>
                      <Chip
                        label={selectedFlag.status}
                        color={getStatusColor(selectedFlag.status)}
                        size="small"
                      />
                    </Box>
                  </Stack>
                </Box>

                <Box>
                  <Typography variant="h6" gutterBottom>Description</Typography>
                  <Typography variant="body1">{selectedFlag.description}</Typography>
                </Box>

                <Box>
                  <Typography variant="h6" gutterBottom>Entity Information</Typography>
                  <Stack spacing={1}>
                    <Box>
                      <Typography variant="body2" color="textSecondary">Entity ID</Typography>
                      <Typography variant="body1">{selectedFlag.entity}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="textSecondary">Entity Type</Typography>
                      <Typography variant="body1">{selectedFlag.entityType}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="textSecondary">Risk Type</Typography>
                      <Typography variant="body1">{selectedFlag.type.replace('_', ' ')}</Typography>
                    </Box>
                  </Stack>
                </Box>

                <Box>
                  <Typography variant="h6" gutterBottom>Actions</Typography>
                  <Stack spacing={2}>
                    <Box>
                      <Typography variant="body2" color="textSecondary">Automatic Action</Typography>
                      <Chip
                        icon={getActionIcon(selectedFlag.autoAction)}
                        label={selectedFlag.autoAction}
                        size="small"
                      />
                    </Box>
                    {selectedFlag.manualAction && (
                      <Box>
                        <Typography variant="body2" color="textSecondary">Manual Action</Typography>
                        <Chip
                          label={selectedFlag.manualAction}
                          size="small"
                          variant="outlined"
                        />
                      </Box>
                    )}
                    <Box>
                      <Typography variant="body2" color="textSecondary">Assigned To</Typography>
                      <Typography variant="body1">{selectedFlag.assignedTo || 'Unassigned'}</Typography>
                    </Box>
                  </Stack>
                </Box>

                <Box>
                  <Typography variant="h6" gutterBottom>Timeline</Typography>
                  <Stack spacing={1}>
                    <Box>
                      <Typography variant="body2" color="textSecondary">Created</Typography>
                      <Typography variant="body1">{selectedFlag.createdAt}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="textSecondary">Last Updated</Typography>
                      <Typography variant="body1">{selectedFlag.lastUpdated}</Typography>
                    </Box>
                  </Stack>
                </Box>
              </Stack>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDetailDialogOpen(false)}>Close</Button>
          </DialogActions>
        </Dialog>

        {/* Take Action Dialog */}
        <Dialog open={actionDialogOpen} onClose={() => setActionDialogOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle sx={{ 
            background: 'linear-gradient(45deg, #FFC107, #FF9800)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontWeight: 'bold'
          }}>
            Take Action on Risk Flag - {selectedFlag?.id}
          </DialogTitle>
          <DialogContent>
            {selectedFlag && (
              <Stack spacing={3} sx={{ mt: 2 }}>
                <Box>
                  <Typography variant="h6" gutterBottom>Risk Flag Details</Typography>
                  <Stack direction="row" spacing={4}>
                    <Box>
                      <Typography variant="body2" color="textSecondary">Risk Score</Typography>
                      <Typography variant="h6" color={getRiskScoreColor(selectedFlag.riskScore)}>
                        {selectedFlag.riskScore}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="textSecondary">Severity</Typography>
                      <Chip
                        label={selectedFlag.severity}
                        color={getSeverityColor(selectedFlag.severity)}
                        size="small"
                      />
                    </Box>
                    <Box>
                      <Typography variant="body2" color="textSecondary">Auto Action</Typography>
                      <Chip
                        icon={getActionIcon(selectedFlag.autoAction)}
                        label={selectedFlag.autoAction}
                        size="small"
                        variant="outlined"
                      />
                    </Box>
                  </Stack>
                </Box>

                <Box>
                  <Typography variant="h6" gutterBottom>Select Manual Action</Typography>
                  <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                    Choose an action to override the automatic action ({selectedFlag.autoAction})
                  </Typography>
                  <FormControl fullWidth>
                    <InputLabel>Action</InputLabel>
                    <Select
                      value={selectedAction}
                      onChange={(e) => setSelectedAction(e.target.value)}
                      label="Action"
                    >
                      <MenuItem value="investigate">
                        <Stack direction="row" spacing={1} alignItems="center">
                          <IconEye size={16} />
                          <Box>
                            <Typography variant="body2">Investigate</Typography>
                            <Typography variant="caption" color="textSecondary">
                              Put under monitoring for further analysis
                            </Typography>
                          </Box>
                        </Stack>
                      </MenuItem>
                      <MenuItem value="resolve">
                        <Stack direction="row" spacing={1} alignItems="center">
                          <IconShieldCheck size={16} />
                          <Box>
                            <Typography variant="body2">Resolve</Typography>
                            <Typography variant="caption" color="textSecondary">
                              Mark as resolved and close the flag
                            </Typography>
                          </Box>
                        </Stack>
                      </MenuItem>
                      <MenuItem value="escalate">
                        <Stack direction="row" spacing={1} alignItems="center">
                          <IconAlertTriangle size={16} />
                          <Box>
                            <Typography variant="body2">Escalate</Typography>
                            <Typography variant="caption" color="textSecondary">
                              Escalate to critical priority for immediate attention
                            </Typography>
                          </Box>
                        </Stack>
                      </MenuItem>
                      <MenuItem value="false_positive">
                        <Stack direction="row" spacing={1} alignItems="center">
                          <IconX size={16} />
                          <Box>
                            <Typography variant="body2">Mark as False Positive</Typography>
                            <Typography variant="caption" color="textSecondary">
                              Flag as incorrect detection and resolve
                            </Typography>
                          </Box>
                        </Stack>
                      </MenuItem>
                    </Select>
                  </FormControl>
                </Box>

                {selectedAction && (
                  <Box>
                    <Typography variant="h6" gutterBottom>Action Preview</Typography>
                    <Alert severity="info">
                      <AlertTitle>Action Summary</AlertTitle>
                      <Typography variant="body2">
                        {selectedAction === 'investigate' && 'This will put the risk flag under monitoring status for further investigation.'}
                        {selectedAction === 'resolve' && 'This will mark the risk flag as resolved and close it.'}
                        {selectedAction === 'escalate' && 'This will escalate the risk flag to critical priority for immediate attention.'}
                        {selectedAction === 'false_positive' && 'This will mark the risk flag as a false positive and resolve it.'}
                      </Typography>
                    </Alert>
                  </Box>
                )}
              </Stack>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setActionDialogOpen(false)}>Cancel</Button>
            <Button 
              variant="contained" 
              onClick={handleConfirmAction}
              disabled={!selectedAction}
              sx={{
                background: 'linear-gradient(45deg, #FFC107, #FF9800)',
                '&:hover': { background: 'linear-gradient(45deg, #FF9800, #FFC107)' }
              }}
            >
              Confirm Action
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </PageContainer>
  );
};

export default RiskCenterPage;
