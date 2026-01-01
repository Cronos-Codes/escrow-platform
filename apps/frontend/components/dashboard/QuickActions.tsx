import React from 'react';
import {
  Card,
  CardContent,
  Box,
  Typography,
  Stack,
  Button,
  Divider,
  LinearProgress,
  useTheme,
  alpha,
} from '@mui/material';
import {
  Security,
  AccountBalance,
  Timeline,
  Download,
} from '@mui/icons-material';

interface PerformanceMetrics {
  successRate: number;
  avgDealDuration: number;
  totalVolume: number;
}

interface QuickActionsProps {
  onNewEscrow?: () => void;
  onManageWallet?: () => void;
  onViewTransactions?: () => void;
  onExportReport?: () => void;
  performanceMetrics?: PerformanceMetrics;
}

export const QuickActions: React.FC<QuickActionsProps> = ({
  onNewEscrow,
  onManageWallet,
  onViewTransactions,
  onExportReport,
  performanceMetrics,
}) => {
  const theme = useTheme();
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Card sx={{ 
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      borderRadius: 3,
      border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
      transition: 'all 0.3s',
      '&:hover': {
        boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
      }
    }}>
      <CardContent sx={{ 
        p: { xs: 2, sm: 2.5, md: 3 },
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        minHeight: 0,
      }}>
        <Typography variant="h6" fontWeight="700" gutterBottom sx={{ fontSize: { xs: '1rem', sm: '1.1rem', md: '1.25rem' }, flexShrink: 0 }}>
          Quick Actions
        </Typography>

        <Stack spacing={{ xs: 1.5, sm: 2 }} mt={{ xs: 2, sm: 2.5 }} sx={{ flexShrink: 0 }}>
          <Button
            variant="contained"
            startIcon={<Security sx={{ fontSize: { xs: 18, sm: 20 } }} />}
            fullWidth
            onClick={onNewEscrow}
            sx={{
              bgcolor: '#D4AF37',
              color: '#1C2A39',
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              py: { xs: 1.75, sm: 1.5 },
              fontSize: { xs: '0.875rem', sm: '0.9rem', md: '0.95rem' },
              minHeight: { xs: 44, sm: 40 },
              '&:hover': {
                bgcolor: '#B8941F',
                boxShadow: '0 4px 12px rgba(212,175,55,0.4)',
              },
              transition: 'all 0.3s',
            }}
          >
            New Escrow
          </Button>

          <Button
            variant="outlined"
            startIcon={<AccountBalance sx={{ fontSize: { xs: 18, sm: 20 } }} />}
            fullWidth
            onClick={onManageWallet}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              py: { xs: 1.75, sm: 1.5 },
              fontSize: { xs: '0.875rem', sm: '0.9rem', md: '0.95rem' },
              minHeight: { xs: 44, sm: 40 },
              borderColor: alpha(theme.palette.primary.main, 0.3),
              '&:hover': {
                borderColor: theme.palette.primary.main,
                bgcolor: alpha(theme.palette.primary.main, 0.04),
              },
              transition: 'all 0.2s',
            }}
          >
            Manage Wallet
          </Button>

          <Button
            variant="outlined"
            startIcon={<Timeline sx={{ fontSize: { xs: 18, sm: 20 } }} />}
            fullWidth
            onClick={onViewTransactions}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              py: { xs: 1.75, sm: 1.5 },
              fontSize: { xs: '0.875rem', sm: '0.9rem', md: '0.95rem' },
              minHeight: { xs: 44, sm: 40 },
              borderColor: alpha(theme.palette.primary.main, 0.3),
              '&:hover': {
                borderColor: theme.palette.primary.main,
                bgcolor: alpha(theme.palette.primary.main, 0.04),
              },
              transition: 'all 0.2s',
            }}
          >
            View Transactions
          </Button>

          <Button
            variant="outlined"
            startIcon={<Download sx={{ fontSize: { xs: 18, sm: 20 } }} />}
            fullWidth
            onClick={onExportReport}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              py: { xs: 1.75, sm: 1.5 },
              fontSize: { xs: '0.875rem', sm: '0.9rem', md: '0.95rem' },
              minHeight: { xs: 44, sm: 40 },
              borderColor: alpha(theme.palette.primary.main, 0.3),
              '&:hover': {
                borderColor: theme.palette.primary.main,
                bgcolor: alpha(theme.palette.primary.main, 0.04),
              },
              transition: 'all 0.2s',
            }}
          >
            Export Report
          </Button>
        </Stack>

        {performanceMetrics && (
          <Box sx={{ mt: 'auto', pt: 3, flexShrink: 0 }}>
            <Divider sx={{ mb: 3, borderColor: alpha(theme.palette.divider, 0.1) }} />

            <Typography variant="subtitle2" fontWeight="700" gutterBottom sx={{ fontSize: '0.95rem' }}>
              Performance Metrics
            </Typography>

            <Stack spacing={2.5} mt={2}>
              <Box>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                    Success Rate
                  </Typography>
                  <Typography variant="caption" fontWeight="700" sx={{ color: 'success.main' }}>
                    {performanceMetrics.successRate.toFixed(1)}%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={performanceMetrics.successRate}
                  sx={{
                    height: 8,
                    borderRadius: 2,
                    bgcolor: alpha(theme.palette.success.main, 0.1),
                    '& .MuiLinearProgress-bar': {
                      borderRadius: 2,
                      bgcolor: 'success.main',
                      background: 'linear-gradient(90deg, #4CAF50 0%, #66BB6A 100%)',
                    },
                  }}
                />
              </Box>

              <Box sx={{ 
                p: 2, 
                borderRadius: 2, 
                bgcolor: alpha(theme.palette.primary.main, 0.04),
                border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
              }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500, display: 'block', mb: 0.5 }}>
                  Avg Deal Duration
                </Typography>
                <Typography variant="body2" fontWeight="700" sx={{ fontSize: '1rem' }}>
                  {performanceMetrics.avgDealDuration.toFixed(1)} hours
                </Typography>
              </Box>

              <Box sx={{ 
                p: 2, 
                borderRadius: 2, 
                bgcolor: alpha('#D4AF37', 0.08),
                border: `1px solid ${alpha('#D4AF37', 0.2)}`
              }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500, display: 'block', mb: 0.5 }}>
                  Total Volume
                </Typography>
                <Typography variant="body2" fontWeight="700" sx={{ fontSize: '1rem', color: '#D4AF37' }}>
                  {formatCurrency(performanceMetrics.totalVolume)}
                </Typography>
              </Box>
            </Stack>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default QuickActions;
