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
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
} from '@mui/material';
import {
  IconSearch,
  IconFilter,
  IconEye,
  IconFileText,
  IconDownload,
  IconRefresh,
  IconShield,
  IconUser,
  IconSettings,
  IconCreditCard,
  IconGavel,
  IconAlertTriangle,
  IconCheck,
  IconX,
  IconChevronDown,
  IconCalendar,
  IconClock,
  IconHash,
  IconShieldLock,
  IconAlertCircle,
  IconBrain,
  IconRadar,
} from '@tabler/icons-react';
import { motion } from 'framer-motion';
import { alpha } from '@mui/material/styles';
import PageContainer from '@/app/(DashboardLayout)/components/container/PageContainer';
import { useRequireRole } from '@/hooks/useRequireRole';

// Mock data for audit logs
const mockAuditLogs = [
  {
    id: 'AUDIT-001',
    timestamp: '2024-01-23T10:30:00Z',
    actor: 'admin@goldescrow.com',
    actorRoles: ['ADMIN'],
    entity: 'escrow',
    entityId: 'ESC-004',
    action: 'force_release',
    description: 'Force released escrow funds to seller',
    before: { status: 'active', balance: '$75,000' },
    after: { status: 'completed', balance: '$0' },
    signature: '0x1234567890abcdef...',
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0...',
    riskLevel: 'high',
  },
  {
    id: 'AUDIT-002',
    timestamp: '2024-01-23T09:15:00Z',
    actor: 'operator@goldescrow.com',
    actorRoles: ['OPERATOR'],
    entity: 'user',
    entityId: 'USER-003',
    action: 'suspend_user',
    description: 'Suspended user account due to KYC failure',
    before: { status: 'active', kycLevel: 'pending' },
    after: { status: 'suspended', kycLevel: 'failed' },
    signature: '0xabcdef1234567890...',
    ipAddress: '192.168.1.101',
    userAgent: 'Mozilla/5.0...',
    riskLevel: 'medium',
  },
  {
    id: 'AUDIT-003',
    timestamp: '2024-01-23T08:45:00Z',
    actor: 'admin@goldescrow.com',
    actorRoles: ['ADMIN'],
    entity: 'paymaster',
    entityId: 'PM-001',
    action: 'withdraw_funds',
    description: 'Withdrew $50,000 from paymaster account',
    before: { balance: '$500,000' },
    after: { balance: '$450,000' },
    signature: '0x9876543210fedcba...',
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0...',
    riskLevel: 'high',
  },
  {
    id: 'AUDIT-004',
    timestamp: '2024-01-23T08:00:00Z',
    actor: 'arbiter@goldescrow.com',
    actorRoles: ['ARBITER'],
    entity: 'dispute',
    entityId: 'DISP-002',
    action: 'assign_arbiter',
    description: 'Assigned arbiter to dispute resolution',
    before: { assignedArbiter: null, status: 'open' },
    after: { assignedArbiter: 'Sarah Johnson', status: 'in_review' },
    signature: '0xfedcba0987654321...',
    ipAddress: '192.168.1.102',
    userAgent: 'Mozilla/5.0...',
    riskLevel: 'low',
  },
  {
    id: 'AUDIT-005',
    timestamp: '2024-01-23T07:30:00Z',
    actor: 'admin@goldescrow.com',
    actorRoles: ['ADMIN'],
    entity: 'risk_flag',
    entityId: 'RF-003',
    action: 'resolve_risk_flag',
    description: 'Resolved critical risk flag as false positive',
    before: { status: 'active', severity: 'critical' },
    after: { status: 'resolved', severity: 'critical' },
    signature: '0x1234567890abcdef...',
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0...',
    riskLevel: 'medium',
  },
];

const AuditLogsPage = () => {
  // Require admin role for audit logs
  useRequireRole(['ADMIN']);

  const [auditLogs, setAuditLogs] = useState(mockAuditLogs);
  const [searchQuery, setSearchQuery] = useState('');
  const [entityFilter, setEntityFilter] = useState('all');
  const [actionFilter, setActionFilter] = useState('all');
  const [riskFilter, setRiskFilter] = useState('all');
  const [selectedLog, setSelectedLog] = useState<any>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
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

  // Filter audit logs based on search and filters
  const filteredAuditLogs = auditLogs.filter(log => {
    const matchesSearch = log.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         log.actor.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         log.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesEntity = entityFilter === 'all' || log.entity === entityFilter;
    const matchesAction = actionFilter === 'all' || log.action === actionFilter;
    const matchesRisk = riskFilter === 'all' || log.riskLevel === riskFilter;
    
    return matchesSearch && matchesEntity && matchesAction && matchesRisk;
  });

  const handleViewDetails = (log: any) => {
    setSelectedLog(log);
    setDetailDialogOpen(true);
  };

  const handleExportLogs = () => {
    // Mock export functionality
    console.log('Exporting audit logs...');
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low': return 'success';
      case 'medium': return 'warning';
      case 'high': return 'error';
      default: return 'default';
    }
  };

  const getEntityIcon = (entity: string) => {
    switch (entity) {
      case 'user': return <IconUser size={16} />;
      case 'escrow': return <IconCreditCard size={16} />;
      case 'dispute': return <IconGavel size={16} />;
      case 'paymaster': return <IconSettings size={16} />;
      case 'risk_flag': return <IconAlertTriangle size={16} />;
      default: return <IconFileText size={16} />;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'force_release':
      case 'withdraw_funds':
        return 'error';
      case 'suspend_user':
      case 'resolve_risk_flag':
        return 'warning';
      case 'assign_arbiter':
        return 'info';
      default:
        return 'default';
    }
  };

  const formatTimestamp = (timestamp: string | number) => {
    return new Date(timestamp).toLocaleString();
  };

  const formatSignature = (signature: string) => {
    return `${signature.substring(0, 20)}...`;
  };

  return (
    <PageContainer title="Audit Logs" description="View and manage system audit trail">
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
                    Audit Logs
                  </Typography>
                  <Typography variant="body1" color="textSecondary">
                    Comprehensive system audit trail and security monitoring
                  </Typography>
                </Box>
                <Stack direction="row" spacing={2}>
                  <Button 
                    variant="outlined" 
                    startIcon={<IconDownload />}
                    onClick={handleExportLogs}
                    sx={{ 
                      borderColor: '#FFC107',
                      color: '#FFC107',
                      '&:hover': { 
                        borderColor: '#FFC107', 
                        backgroundColor: 'rgba(255, 193, 7, 0.05)' 
                      }
                    }}
                  >
                    Export Logs
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
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1, overflowX: 'auto' }}>
                <Card sx={{ 
                  boxShadow: 1,
                  '&:hover': { boxShadow: 2 },
                  transition: 'all 0.3s ease',
                  height: '100%'
                }}>
                  <CardContent sx={{ textAlign: 'center', py: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 1 }}>
                      <IconFileText size={24} style={{ color: '#2196F3' }} />
                    </Box>
                    <Typography variant="h5" fontWeight="bold" sx={{ color: '#2196F3', mb: 0.5 }}>
                      {formatNumber(auditLogs.length)}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Total Logs
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
                      <IconAlertTriangle size={24} style={{ color: '#F44336' }} />
                    </Box>
                    <Typography variant="h5" fontWeight="bold" sx={{ color: '#F44336', mb: 0.5 }}>
                      {formatNumber(auditLogs.filter(l => l.riskLevel === 'high').length)}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      High Risk Actions
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
                      <IconAlertCircle size={24} style={{ color: '#FF9800' }} />
                    </Box>
                    <Typography variant="h5" fontWeight="bold" sx={{ color: '#FF9800', mb: 0.5 }}>
                      {formatNumber(auditLogs.filter(l => l.riskLevel === 'medium').length)}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Medium Risk Actions
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
                      {formatNumber(auditLogs.filter(l => l.riskLevel === 'low').length)}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Low Risk Actions
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
                placeholder="Search audit logs..."
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
                <InputLabel>Entity</InputLabel>
                <Select
                  value={entityFilter}
                  onChange={(e) => setEntityFilter(e.target.value)}
                  label="Entity"
                >
                  <MenuItem value="all">All Entities</MenuItem>
                  <MenuItem value="user">User</MenuItem>
                  <MenuItem value="escrow">Escrow</MenuItem>
                  <MenuItem value="dispute">Dispute</MenuItem>
                  <MenuItem value="paymaster">Paymaster</MenuItem>
                  <MenuItem value="risk_flag">Risk Flag</MenuItem>
                </Select>
              </FormControl>

              <FormControl sx={{ minWidth: { xs: '100%', sm: 150 } }}>
                <InputLabel>Action</InputLabel>
                <Select
                  value={actionFilter}
                  onChange={(e) => setActionFilter(e.target.value)}
                  label="Action"
                >
                  <MenuItem value="all">All Actions</MenuItem>
                  <MenuItem value="force_release">Force Release</MenuItem>
                  <MenuItem value="suspend_user">Suspend User</MenuItem>
                  <MenuItem value="withdraw_funds">Withdraw Funds</MenuItem>
                  <MenuItem value="assign_arbiter">Assign Arbiter</MenuItem>
                  <MenuItem value="resolve_risk_flag">Resolve Risk Flag</MenuItem>
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
                  <MenuItem value="low">Low</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                </Select>
              </FormControl>

              <Button
                variant="outlined"
                startIcon={<IconFilter />}
                onClick={() => {
                  setSearchQuery('');
                  setEntityFilter('all');
                  setActionFilter('all');
                  setRiskFilter('all');
                }}
                sx={{ minWidth: { xs: '100%', sm: 'auto' } }}
              >
                Clear Filters
              </Button>
            </Stack>
          </CardContent>
        </Card>

        {/* Audit Logs Table */}
        <Card>
          <CardContent>
            <TableContainer component={Paper} elevation={0} sx={{ overflowX: 'auto' }}>
              <Table sx={{ minWidth: 650 }}>
                <TableHead>
                  <TableRow>
                    <TableCell>Log ID</TableCell>
                    <TableCell>Timestamp</TableCell>
                    <TableCell>Actor</TableCell>
                    <TableCell>Entity</TableCell>
                    <TableCell>Action</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Risk Level</TableCell>
                    <TableCell>Signature</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredAuditLogs.map((log) => (
                    <TableRow key={log.id} hover>
                      <TableCell>
                        <Typography variant="subtitle2" fontWeight="bold">
                          {log.id}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {formatTimestamp(log.timestamp)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" fontWeight="bold">
                            {log.actor}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            {log.actorRoles.join(', ')}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={1} alignItems="center">
                          {getEntityIcon(log.entity)}
                          <Box>
                            <Typography variant="body2" fontWeight="bold">
                              {log.entity}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                              {log.entityId}
                            </Typography>
                          </Box>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={log.action.replace('_', ' ')}
                          color={getActionColor(log.action)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ maxWidth: 200 }}>
                          {log.description}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={log.riskLevel}
                          color={getRiskColor(log.riskLevel)}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontFamily="monospace" fontSize="0.75rem">
                          {formatSignature(log.signature)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Tooltip title="View Details">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleViewDetails(log)}
                          >
                            <IconEye size={16} />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>

        {/* Audit Log Details Dialog */}
        <Dialog open={detailDialogOpen} onClose={() => setDetailDialogOpen(false)} maxWidth="lg" fullWidth>
          <DialogTitle sx={{ 
            background: 'linear-gradient(45deg, #FFC107, #FF9800)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontWeight: 'bold'
          }}>
            Audit Log Details - {selectedLog?.id}
          </DialogTitle>
          <DialogContent>
            {selectedLog && (
              <Stack spacing={3} sx={{ mt: 2 }}>
                <Box>
                  <Typography variant="h6" gutterBottom>Basic Information</Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                    <Box>
                      <Typography variant="body2" color="textSecondary">Log ID</Typography>
                      <Typography variant="body1" fontWeight="bold">{selectedLog.id}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="textSecondary">Timestamp</Typography>
                      <Typography variant="body1">{formatTimestamp(selectedLog.timestamp)}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="textSecondary">Actor</Typography>
                      <Typography variant="body1">{selectedLog.actor}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="textSecondary">Roles</Typography>
                      <Typography variant="body1">{selectedLog.actorRoles.join(', ')}</Typography>
                    </Box>
                  </Box>
                </Box>

                <Box>
                  <Typography variant="h6" gutterBottom>Action Details</Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                    <Box>
                      <Typography variant="body2" color="textSecondary">Entity</Typography>
                      <Typography variant="body1">{selectedLog.entity}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="textSecondary">Entity ID</Typography>
                      <Typography variant="body1">{selectedLog.entityId}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="textSecondary">Action</Typography>
                      <Chip
                        label={selectedLog.action.replace('_', ' ')}
                        color={getActionColor(selectedLog.action)}
                        size="small"
                      />
                    </Box>
                    <Box>
                      <Typography variant="body2" color="textSecondary">Risk Level</Typography>
                      <Chip
                        label={selectedLog.riskLevel}
                        color={getRiskColor(selectedLog.riskLevel)}
                        size="small"
                      />
                    </Box>
                  </Box>
                </Box>

                <Box>
                  <Typography variant="h6" gutterBottom>Description</Typography>
                  <Typography variant="body1">{selectedLog.description}</Typography>
                </Box>

                <Box>
                  <Typography variant="h6" gutterBottom>Changes</Typography>
                  <Accordion>
                    <AccordionSummary expandIcon={<IconChevronDown />}>
                      <Typography>View Before/After Changes</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                        <Box>
                          <Typography variant="subtitle2" color="error">Before</Typography>
                          <Box sx={{ bgcolor: 'grey.50', p: 1, borderRadius: 1 }}>
                            <pre style={{ margin: 0, fontSize: '0.875rem' }}>
                              {JSON.stringify(selectedLog.before, null, 2)}
                            </pre>
                          </Box>
                        </Box>
                        <Box>
                          <Typography variant="subtitle2" color="success.main">After</Typography>
                          <Box sx={{ bgcolor: 'grey.50', p: 1, borderRadius: 1 }}>
                            <pre style={{ margin: 0, fontSize: '0.875rem' }}>
                              {JSON.stringify(selectedLog.after, null, 2)}
                            </pre>
                          </Box>
                        </Box>
                      </Box>
                    </AccordionDetails>
                  </Accordion>
                </Box>

                <Box>
                  <Typography variant="h6" gutterBottom>Security Information</Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr', gap: 2 }}>
                    <Box>
                      <Typography variant="body2" color="textSecondary">Digital Signature</Typography>
                      <Typography variant="body2" fontFamily="monospace" sx={{ bgcolor: 'grey.100', p: 1, borderRadius: 1 }}>
                        {selectedLog.signature}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                      <Box>
                        <Typography variant="body2" color="textSecondary">IP Address</Typography>
                        <Typography variant="body1">{selectedLog.ipAddress}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="textSecondary">User Agent</Typography>
                        <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
                          {selectedLog.userAgent}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </Box>
              </Stack>
            )}
          </DialogContent>
          <DialogActions>
            <Button 
              onClick={() => setDetailDialogOpen(false)}
              sx={{
                background: 'linear-gradient(45deg, #FFC107, #FF9800)',
                '&:hover': { background: 'linear-gradient(45deg, #FF9800, #FFC107)' }
              }}
            >
              Close
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </PageContainer>
  );
};

export default AuditLogsPage;
