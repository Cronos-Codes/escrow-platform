'use client'
import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Stack,
  Switch,
  FormControlLabel,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Divider,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tabs,
  Tab,
} from '@mui/material';
import {
  IconSettings,
  IconShield,
  IconUsers,
  IconBell,
  IconDatabase,
  IconKey,
  IconDownload,
  IconUpload,
  IconRefresh,
  IconDeviceFloppy,
  IconEdit,
  IconTrash,
  IconPlus,
  IconChevronDown,
  IconEye,
  IconEyeOff,
} from '@tabler/icons-react';
import PageContainer from '@/app/(DashboardLayout)/components/container/PageContainer';
import { useRequireRole } from '@/hooks/useRequireRole';

const SettingsPage = () => {
  // Require admin role for settings
  useRequireRole(['ADMIN']);

  const [activeTab, setActiveTab] = useState(0);

  const [settings, setSettings] = useState({
    // System Settings
    maintenanceMode: false,
    debugMode: false,
    autoBackup: true,
    emailNotifications: true,
    smsNotifications: false,
    
    // Security Settings
    twoFactorRequired: true,
    sessionTimeout: 30,
    maxLoginAttempts: 5,
    passwordMinLength: 12,
    requireSpecialChars: true,
    
    // Feature Flags
    webAuthnEnabled: true,
    riskScoringEnabled: true,
    autoArbitrationEnabled: false,
    advancedAnalyticsEnabled: true,
  });

  const [rbacMatrix, setRbacMatrix] = useState([
    {
      role: 'ADMIN',
      permissions: {
        userManagement: true,
        escrowManagement: true,
        disputeManagement: true,
        paymasterManagement: true,
        riskManagement: true,
        auditLogs: true,
        analytics: true,
        settings: true,
      }
    },
    {
      role: 'OPERATOR',
      permissions: {
        userManagement: true,
        escrowManagement: true,
        disputeManagement: true,
        paymasterManagement: true,
        riskManagement: true,
        auditLogs: false,
        analytics: true,
        settings: false,
      }
    },
    {
      role: 'ARBITER',
      permissions: {
        userManagement: false,
        escrowManagement: false,
        disputeManagement: true,
        paymasterManagement: false,
        riskManagement: false,
        auditLogs: false,
        analytics: false,
        settings: false,
      }
    },
    {
      role: 'SUPPORT',
      permissions: {
        userManagement: false,
        escrowManagement: false,
        disputeManagement: false,
        paymasterManagement: false,
        riskManagement: false,
        auditLogs: false,
        analytics: false,
        settings: false,
      }
    },
  ]);

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<any>(null);

  const handleSettingChange = (setting: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  const handlePermissionChange = (role: string, permission: string, value: boolean) => {
    setRbacMatrix(prev => prev.map(r => 
      r.role === role 
        ? { ...r, permissions: { ...r.permissions, [permission]: value } }
        : r
    ));
  };

  const handleSaveSettings = () => {
    // Mock save functionality
    console.log('Saving settings:', settings);
    console.log('Saving RBAC matrix:', rbacMatrix);
  };

  const handleExportConfig = () => {
    // Mock export functionality
    console.log('Exporting configuration...');
  };

  const handleImportConfig = () => {
    // Mock import functionality
    console.log('Importing configuration...');
  };

  const permissions = [
    { key: 'userManagement', label: 'User Management' },
    { key: 'escrowManagement', label: 'Escrow Management' },
    { key: 'disputeManagement', label: 'Dispute Management' },
    { key: 'paymasterManagement', label: 'Paymaster Management' },
    { key: 'riskManagement', label: 'Risk Management' },
    { key: 'auditLogs', label: 'Audit Logs' },
    { key: 'analytics', label: 'Analytics' },
    { key: 'settings', label: 'Settings' },
  ];

  return (
    <PageContainer title="Settings" description="System configuration and administration settings">
      <Box>
        {/* Header */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h4" fontWeight="bold">
                Platform Settings
              </Typography>
              <Stack direction="row" spacing={2}>
                <Button variant="outlined" startIcon={<IconDownload />} onClick={handleExportConfig}>
                  Export Config
                </Button>
                <Button variant="outlined" startIcon={<IconUpload />} onClick={handleImportConfig}>
                  Import Config
                </Button>
                <Button variant="contained" color="primary" startIcon={<IconDeviceFloppy />} onClick={handleSaveSettings}>
                  Save Changes
                </Button>
              </Stack>
            </Stack>
          </CardContent>
        </Card>

        {/* Tabbed Navigation */}
        <Card sx={{ mb: 3 }}>
          <Tabs
            value={activeTab}
            onChange={(e, newValue) => setActiveTab(newValue)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              borderBottom: 1,
              borderColor: 'divider',
              '& .MuiTab-root': {
                minHeight: 48,
                textTransform: 'none',
                fontWeight: 500,
              }
            }}
          >
            <Tab 
              label="General" 
              icon={<IconSettings size={20} />} 
              iconPosition="start"
            />
            <Tab 
              label="Security" 
              icon={<IconShield size={20} />} 
              iconPosition="start"
            />
            <Tab 
              label="Notifications" 
              icon={<IconBell size={20} />} 
              iconPosition="start"
            />
            <Tab 
              label="API & Integrations" 
              icon={<IconKey size={20} />} 
              iconPosition="start"
            />
            <Tab 
              label="User Roles" 
              icon={<IconUsers size={20} />} 
              iconPosition="start"
            />
          </Tabs>
        </Card>

        {/* Tab Content */}
        {activeTab === 0 && (
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
          {/* System Settings */}
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                <IconSettings size={20} style={{ marginRight: 8, verticalAlign: 'middle' }} />
                System Configuration
              </Typography>
              <Stack spacing={2}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.maintenanceMode}
                      onChange={(e) => handleSettingChange('maintenanceMode', e.target.checked)}
                      color="warning"
                    />
                  }
                  label="Maintenance Mode"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.debugMode}
                      onChange={(e) => handleSettingChange('debugMode', e.target.checked)}
                      color="info"
                    />
                  }
                  label="Debug Mode"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.autoBackup}
                      onChange={(e) => handleSettingChange('autoBackup', e.target.checked)}
                    />
                  }
                  label="Automatic Backups"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.emailNotifications}
                      onChange={(e) => handleSettingChange('emailNotifications', e.target.checked)}
                    />
                  }
                  label="Email Notifications"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.smsNotifications}
                      onChange={(e) => handleSettingChange('smsNotifications', e.target.checked)}
                    />
                  }
                  label="SMS Notifications"
                />
              </Stack>
            </CardContent>
          </Card>

          {/* Security Settings */}
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                <IconShield size={20} style={{ marginRight: 8, verticalAlign: 'middle' }} />
                Security Configuration
              </Typography>
              <Stack spacing={2}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.twoFactorRequired}
                      onChange={(e) => handleSettingChange('twoFactorRequired', e.target.checked)}
                      color="primary"
                    />
                  }
                  label="Require 2FA for All Users"
                />
                <FormControl fullWidth size="small">
                  <InputLabel>Session Timeout (minutes)</InputLabel>
                  <Select
                    value={settings.sessionTimeout}
                    onChange={(e) => handleSettingChange('sessionTimeout', e.target.value)}
                    label="Session Timeout (minutes)"
                  >
                    <MenuItem value={15}>15 minutes</MenuItem>
                    <MenuItem value={30}>30 minutes</MenuItem>
                    <MenuItem value={60}>1 hour</MenuItem>
                    <MenuItem value={120}>2 hours</MenuItem>
                  </Select>
                </FormControl>
                <FormControl fullWidth size="small">
                  <InputLabel>Max Login Attempts</InputLabel>
                  <Select
                    value={settings.maxLoginAttempts}
                    onChange={(e) => handleSettingChange('maxLoginAttempts', e.target.value)}
                    label="Max Login Attempts"
                  >
                    <MenuItem value={3}>3 attempts</MenuItem>
                    <MenuItem value={5}>5 attempts</MenuItem>
                    <MenuItem value={10}>10 attempts</MenuItem>
                  </Select>
                </FormControl>
                <FormControl fullWidth size="small">
                  <InputLabel>Password Min Length</InputLabel>
                  <Select
                    value={settings.passwordMinLength}
                    onChange={(e) => handleSettingChange('passwordMinLength', e.target.value)}
                    label="Password Min Length"
                  >
                    <MenuItem value={8}>8 characters</MenuItem>
                    <MenuItem value={12}>12 characters</MenuItem>
                    <MenuItem value={16}>16 characters</MenuItem>
                  </Select>
                </FormControl>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.requireSpecialChars}
                      onChange={(e) => handleSettingChange('requireSpecialChars', e.target.checked)}
                    />
                  }
                  label="Require Special Characters"
                />
              </Stack>
            </CardContent>
          </Card>

          {/* Feature Flags */}
          <Card sx={{ gridColumn: '1 / -1' }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                <IconKey size={20} style={{ marginRight: 8, verticalAlign: 'middle' }} />
                Feature Flags
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, 1fr)' }, gap: 2 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.webAuthnEnabled}
                      onChange={(e) => handleSettingChange('webAuthnEnabled', e.target.checked)}
                      color="primary"
                    />
                  }
                  label="WebAuthn Support"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.riskScoringEnabled}
                      onChange={(e) => handleSettingChange('riskScoringEnabled', e.target.checked)}
                      color="warning"
                    />
                  }
                  label="Risk Scoring"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.autoArbitrationEnabled}
                      onChange={(e) => handleSettingChange('autoArbitrationEnabled', e.target.checked)}
                      color="info"
                    />
                  }
                  label="Auto Arbitration"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.advancedAnalyticsEnabled}
                      onChange={(e) => handleSettingChange('advancedAnalyticsEnabled', e.target.checked)}
                      color="success"
                    />
                  }
                  label="Advanced Analytics"
                />
              </Box>
            </CardContent>
          </Card>

          {/* RBAC Matrix */}
          <Card sx={{ gridColumn: '1 / -1' }}>
            <CardContent>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  <IconUsers size={20} style={{ marginRight: 8, verticalAlign: 'middle' }} />
                  Role-Based Access Control (RBAC)
                </Typography>
                <Alert severity="info" sx={{ mb: 2 }}>
                  Configure permissions for different user roles. Changes will affect all users with the specified role.
                </Alert>
                
                <TableContainer component={Paper} elevation={0}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Role</TableCell>
                        {permissions.map(permission => (
                          <TableCell key={permission.key} align="center">
                            {permission.label}
                          </TableCell>
                        ))}
                        <TableCell align="center">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {rbacMatrix.map((role) => (
                        <TableRow key={role.role}>
                          <TableCell>
                            <Chip
                              label={role.role}
                              color={role.role === 'ADMIN' ? 'error' : 
                                     role.role === 'OPERATOR' ? 'primary' :
                                     role.role === 'ARBITER' ? 'secondary' : 'default'}
                              size="small"
                            />
                          </TableCell>
                          {permissions.map(permission => (
                            <TableCell key={permission.key} align="center">
                              <Switch
                                checked={role.permissions[permission.key as keyof typeof role.permissions]}
                                onChange={(e) => handlePermissionChange(role.role, permission.key, e.target.checked)}
                                size="small"
                                disabled={role.role === 'ADMIN'} // Admin should have all permissions
                              />
                            </TableCell>
                          ))}
                          <TableCell align="center">
                            <Tooltip title="Edit Role">
                              <IconButton
                                size="small"
                                onClick={() => {
                                  setSelectedRole(role);
                                  setEditDialogOpen(true);
                                }}
                              >
                                <IconEdit size={16} />
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

          {/* System Information */}
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                <IconDatabase size={20} style={{ marginRight: 8, verticalAlign: 'middle' }} />
                System Information
              </Typography>
              <Stack spacing={2}>
                <Box>
                  <Typography variant="body2" color="textSecondary">Version</Typography>
                  <Typography variant="body1">Gold Escrow Admin v1.0.0</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="textSecondary">Last Updated</Typography>
                  <Typography variant="body1">January 23, 2024</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="textSecondary">Database Status</Typography>
                  <Chip label="Connected" color="success" size="small" />
                </Box>
                <Box>
                  <Typography variant="body2" color="textSecondary">API Status</Typography>
                  <Chip label="Healthy" color="success" size="small" />
                </Box>
              </Stack>
            </CardContent>
          </Card>

          {/* Maintenance */}
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                <IconBell size={20} style={{ marginRight: 8, verticalAlign: 'middle' }} />
                Maintenance & Monitoring
              </Typography>
              <Stack spacing={2}>
                <Button variant="outlined" color="warning" fullWidth>
                  Enter Maintenance Mode
                </Button>
                <Button variant="outlined" color="info" fullWidth>
                  Clear Cache
                </Button>
                <Button variant="outlined" color="secondary" fullWidth>
                  Regenerate API Keys
                </Button>
                <Button variant="outlined" color="error" fullWidth>
                  Emergency Shutdown
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Box>
        )}

        {/* Security Tab */}
        {activeTab === 1 && (
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  <IconShield size={20} style={{ marginRight: 8, verticalAlign: 'middle' }} />
                  Security Configuration
                </Typography>
                <Stack spacing={2}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.twoFactorRequired}
                        onChange={(e) => handleSettingChange('twoFactorRequired', e.target.checked)}
                        color="primary"
                      />
                    }
                    label="Require Two-Factor Authentication"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.webAuthnEnabled}
                        onChange={(e) => handleSettingChange('webAuthnEnabled', e.target.checked)}
                        color="primary"
                      />
                    }
                    label="Enable WebAuthn (Biometric Login)"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.requireSpecialChars}
                        onChange={(e) => handleSettingChange('requireSpecialChars', e.target.checked)}
                        color="primary"
                      />
                    }
                    label="Require Special Characters in Passwords"
                  />
                  <TextField
                    label="Session Timeout (minutes)"
                    type="number"
                    value={settings.sessionTimeout}
                    onChange={(e) => handleSettingChange('sessionTimeout', parseInt(e.target.value))}
                    fullWidth
                  />
                  <TextField
                    label="Max Login Attempts"
                    type="number"
                    value={settings.maxLoginAttempts}
                    onChange={(e) => handleSettingChange('maxLoginAttempts', parseInt(e.target.value))}
                    fullWidth
                  />
                  <TextField
                    label="Minimum Password Length"
                    type="number"
                    value={settings.passwordMinLength}
                    onChange={(e) => handleSettingChange('passwordMinLength', parseInt(e.target.value))}
                    fullWidth
                  />
                </Stack>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  <IconKey size={20} style={{ marginRight: 8, verticalAlign: 'middle' }} />
                  API Security
                </Typography>
                <Stack spacing={2}>
                  <Alert severity="info">
                    Configure API access and security settings for external integrations.
                  </Alert>
                  <Button variant="outlined" color="primary" fullWidth>
                    Generate New API Key
                  </Button>
                  <Button variant="outlined" color="warning" fullWidth>
                    Rotate All Keys
                  </Button>
                  <Button variant="outlined" color="error" fullWidth>
                    Revoke All Keys
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          </Box>
        )}

        {/* Notifications Tab */}
        {activeTab === 2 && (
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  <IconBell size={20} style={{ marginRight: 8, verticalAlign: 'middle' }} />
                  Notification Settings
                </Typography>
                <Stack spacing={2}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.emailNotifications}
                        onChange={(e) => handleSettingChange('emailNotifications', e.target.checked)}
                        color="primary"
                      />
                    }
                    label="Email Notifications"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.smsNotifications}
                        onChange={(e) => handleSettingChange('smsNotifications', e.target.checked)}
                        color="primary"
                      />
                    }
                    label="SMS Notifications"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.riskScoringEnabled}
                        onChange={(e) => handleSettingChange('riskScoringEnabled', e.target.checked)}
                        color="primary"
                      />
                    }
                    label="Risk Alert Notifications"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.autoArbitrationEnabled}
                        onChange={(e) => handleSettingChange('autoArbitrationEnabled', e.target.checked)}
                        color="primary"
                      />
                    }
                    label="Auto-Arbitration Alerts"
                  />
                </Stack>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  <IconSettings size={20} style={{ marginRight: 8, verticalAlign: 'middle' }} />
                  Notification Channels
                </Typography>
                <Stack spacing={2}>
                  <Alert severity="info">
                    Configure notification delivery channels and preferences.
                  </Alert>
                  <Button variant="outlined" color="primary" fullWidth>
                    Test Email Delivery
                  </Button>
                  <Button variant="outlined" color="info" fullWidth>
                    Test SMS Delivery
                  </Button>
                  <Button variant="outlined" color="secondary" fullWidth>
                    Configure Webhooks
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          </Box>
        )}

        {/* API & Integrations Tab */}
        {activeTab === 3 && (
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  <IconKey size={20} style={{ marginRight: 8, verticalAlign: 'middle' }} />
                  API Configuration
                </Typography>
                <Stack spacing={2}>
                  <Alert severity="info">
                    Manage API keys and integration settings.
                  </Alert>
                  <TextField
                    label="API Base URL"
                    value="https://api.goldescrow.com/v1"
                    disabled
                    fullWidth
                  />
                  <TextField
                    label="Webhook URL"
                    placeholder="https://your-domain.com/webhook"
                    fullWidth
                  />
                  <Button variant="outlined" color="primary" fullWidth>
                    Generate New API Key
                  </Button>
                  <Button variant="outlined" color="warning" fullWidth>
                    View API Documentation
                  </Button>
                </Stack>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  <IconDatabase size={20} style={{ marginRight: 8, verticalAlign: 'middle' }} />
                  Integration Status
                </Typography>
                <Stack spacing={2}>
                  <Alert severity="success">
                    Firebase: Connected
                  </Alert>
                  <Alert severity="success">
                    Stripe: Connected
                  </Alert>
                  <Alert severity="warning">
                    Twilio: Pending Configuration
                  </Alert>
                  <Button variant="outlined" color="primary" fullWidth>
                    Add New Integration
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          </Box>
        )}

        {/* User Roles Tab */}
        {activeTab === 4 && (
          <Box>
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  <IconUsers size={20} style={{ marginRight: 8, verticalAlign: 'middle' }} />
                  Role-Based Access Control (RBAC)
                </Typography>
                <Alert severity="info" sx={{ mb: 3 }}>
                  Configure permissions for different user roles. Changes take effect immediately.
                </Alert>
                
                <TableContainer component={Paper} elevation={0}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Role</TableCell>
                        {permissions.map((permission) => (
                          <TableCell key={permission.key} align="center">
                            {permission.label}
                          </TableCell>
                        ))}
                        <TableCell align="center">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {rbacMatrix.map((role) => (
                        <TableRow key={role.role}>
                          <TableCell>
                            <Chip 
                              label={role.role} 
                              color={role.role === 'ADMIN' ? 'error' : role.role === 'OPERATOR' ? 'warning' : 'default'}
                              variant="outlined"
                            />
                          </TableCell>
                          {permissions.map((permission) => (
                            <TableCell key={permission.key} align="center">
                              <Switch
                                checked={role.permissions[permission.key as keyof typeof role.permissions]}
                                onChange={(e) => handlePermissionChange(role.role, permission.key, e.target.checked)}
                                color="primary"
                                size="small"
                              />
                            </TableCell>
                          ))}
                          <TableCell align="center">
                            <IconButton
                              size="small"
                              onClick={() => {
                                setSelectedRole(role);
                                setEditDialogOpen(true);
                              }}
                            >
                              <IconEdit size={16} />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Box>
        )}

        {/* Edit Role Dialog */}
        <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle>Edit Role: {selectedRole?.role}</DialogTitle>
          <DialogContent>
            {selectedRole && (
              <Stack spacing={2} sx={{ mt: 2 }}>
                <Typography variant="body1">
                  Configure permissions for the {selectedRole.role} role:
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                  {permissions.map(permission => (
                    <FormControlLabel
                      key={permission.key}
                      control={
                        <Switch
                          checked={selectedRole.permissions[permission.key as keyof typeof selectedRole.permissions]}
                          onChange={(e) => handlePermissionChange(selectedRole.role, permission.key, e.target.checked)}
                          disabled={selectedRole.role === 'ADMIN'}
                        />
                      }
                      label={permission.label}
                    />
                  ))}
                </Box>
              </Stack>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
            <Button variant="contained" onClick={() => setEditDialogOpen(false)}>
              Save Changes
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </PageContainer>
  );
};

export default SettingsPage;
