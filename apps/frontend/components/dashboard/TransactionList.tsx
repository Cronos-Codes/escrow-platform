import React from 'react';
import {
  Card,
  CardContent,
  Box,
  Typography,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Avatar,
  Chip,
  Button,
  alpha,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Shield,
  Receipt,
  LockOpen,
  ArrowDownward,
  Circle,
  ArrowUpward,
  TrendingUp,
  TrendingDown,
} from '@mui/icons-material';
import { DEFAULT_MAX_TRANSACTIONS, DATE_FORMAT_OPTIONS } from '../../config/dashboard-constants';
import { useDeviceOptimization } from '../../hooks/useDeviceOptimization';

interface Transaction {
  id: string;
  type: string;
  amount: number;
  description: string;
  timestamp: string;
  status: string;
}

interface TransactionListProps {
  transactions: Transaction[];
  onViewAll?: () => void;
  maxItems?: number;
  loading?: boolean;
}

export const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  onViewAll,
  maxItems = DEFAULT_MAX_TRANSACTIONS,
  loading = false,
}) => {
  const theme = useTheme();
  const device = useDeviceOptimization();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'escrow_created':
        return <Shield sx={{ fontSize: 20 }} />;
      case 'deposit':
        return <ArrowDownward sx={{ fontSize: 20 }} />;
      case 'escrow_release':
        return <LockOpen sx={{ fontSize: 20 }} />;
      case 'withdrawal':
        return <ArrowUpward sx={{ fontSize: 20 }} />;
      default:
        return <Receipt sx={{ fontSize: 20 }} />;
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'escrow_created':
        return { bg: alpha('#667eea', 0.1), color: '#667eea' };
      case 'deposit':
        return { bg: alpha('#4CAF50', 0.1), color: '#4CAF50' };
      case 'escrow_release':
        return { bg: alpha('#FF9800', 0.1), color: '#FF9800' };
      case 'withdrawal':
        return { bg: alpha('#F44336', 0.1), color: '#F44336' };
      default:
        return { bg: alpha('#2196F3', 0.1), color: '#2196F3' };
    }
  };

  const getStatusColor = (status: string): 'success' | 'info' | 'warning' | 'error' | 'default' => {
    const statusMap: Record<string, 'success' | 'info' | 'warning' | 'error' | 'default'> = {
      completed: 'success',
      active: 'info',
      pending: 'warning',
      failed: 'error',
    };
    return statusMap[status] || 'default';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', DATE_FORMAT_OPTIONS);
  };

  const displayTransactions = transactions.slice(0, maxItems);

  return (
    <Card sx={{ boxShadow: 2, height: '100%', borderRadius: { xs: 2, sm: 3 } }}>
      <CardContent sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
        <Box 
          display="flex" 
          alignItems="center" 
          justifyContent="space-between" 
          mb={{ xs: 2, sm: 3 }}
          flexWrap="wrap"
          gap={1}
        >
          <Box sx={{ flex: { xs: '1 1 100%', sm: '0 0 auto' }, mb: { xs: 1, sm: 0 } }}>
            <Typography 
              variant="h6" 
              fontWeight="700"
              sx={{ fontSize: { xs: '1rem', sm: '1.1rem', md: '1.25rem' } }}
            >
              Recent Transactions
            </Typography>
            <Typography 
              variant="caption" 
              color="text.secondary"
              sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
            >
              Your latest transaction activity
            </Typography>
          </Box>
          {onViewAll && (
            <Button 
              variant="outlined" 
              size="small" 
              onClick={onViewAll}
              sx={{ 
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600,
                minHeight: { xs: 44, sm: 36 },
                px: { xs: 2, sm: 1.5 },
                fontSize: { xs: '0.875rem', sm: '0.875rem' },
                touchAction: 'manipulation',
                width: { xs: '100%', sm: 'auto' },
              }}
            >
              View All
            </Button>
          )}
        </Box>

        <List sx={{ px: 0 }}>
          {displayTransactions.map((transaction, index) => {
            const colors = getTransactionColor(transaction.type);
            const isPositive = transaction.amount > 0;
            
            return (
              <ListItem
                key={transaction.id}
                sx={{
                  mb: index < displayTransactions.length - 1 ? { xs: 1.5, sm: 2 } : 0,
                  px: { xs: 1, sm: 2 },
                  py: { xs: 1.5, sm: 2 },
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: 'divider',
                  transition: 'all 0.2s',
                  flexDirection: { xs: 'column', sm: 'row' },
                  alignItems: { xs: 'flex-start', sm: 'center' },
                  touchAction: 'manipulation',
                  '&:hover': {
                    bgcolor: device.supportsTouch ? 'transparent' : 'action.hover',
                    borderColor: 'primary.main',
                    transform: device.supportsTouch ? 'none' : 'translateX(4px)',
                    boxShadow: device.supportsTouch ? 0 : 1,
                  },
                  '&:active': {
                    bgcolor: 'action.hover',
                    transform: { xs: 'scale(0.98)', sm: 'translateX(4px)' },
                  },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', mb: { xs: 1, sm: 0 } }}>
                  <ListItemAvatar sx={{ minWidth: { xs: 40, sm: 48 } }}>
                    <Avatar
                      sx={{
                        bgcolor: colors.bg,
                        color: colors.color,
                        width: { xs: 40, sm: 48 },
                        height: { xs: 40, sm: 48 },
                      }}
                    >
                      {getTransactionIcon(transaction.type)}
                    </Avatar>
                  </ListItemAvatar>

                  <ListItemText
                    sx={{ 
                      flex: 1,
                      minWidth: 0,
                      '& .MuiListItemText-primary': {
                        mb: { xs: 0.5, sm: 0.5 },
                      }
                    }}
                    primary={
                      <Typography 
                        variant="subtitle2" 
                        fontWeight="600" 
                        sx={{ 
                          mb: 0.5,
                          fontSize: { xs: '0.875rem', sm: '0.95rem' },
                          wordBreak: 'break-word',
                        }}
                      >
                        {transaction.description}
                      </Typography>
                    }
                    secondary={
                      <Box 
                        display="flex" 
                        alignItems="center" 
                        gap={1}
                        flexWrap="wrap"
                      >
                        <Typography 
                          variant="caption" 
                          color="text.secondary"
                          sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                        >
                          {formatDate(transaction.timestamp)}
                        </Typography>
                        {!isMobile && (
                          <>
                            <Box sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: 'divider' }} />
                            <Chip
                              label={transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                              color={getStatusColor(transaction.status)}
                              size="small"
                              sx={{ 
                                height: { xs: 18, sm: 20 },
                                fontSize: { xs: '0.65rem', sm: '0.7rem' },
                                fontWeight: 600,
                                '& .MuiChip-label': { px: { xs: 0.75, sm: 1 } }
                              }}
                            />
                          </>
                        )}
                      </Box>
                    }
                  />

                  <ListItemSecondaryAction 
                    sx={{ 
                      position: { xs: 'relative', sm: 'absolute' },
                      right: { xs: 0, sm: 16 },
                      top: { xs: 'auto', sm: '50%' },
                      transform: { xs: 'none', sm: 'translateY(-50%)' },
                      mb: { xs: 1, sm: 0 },
                    }}
                  >
                    <Box textAlign={{ xs: 'left', sm: 'right' }} width="100%">
                      <Box 
                        display="flex" 
                        alignItems="center" 
                        justifyContent={{ xs: 'flex-start', sm: 'flex-end' }}
                        gap={0.5}
                        flexWrap="wrap"
                      >
                        {isPositive ? (
                          <TrendingUp sx={{ fontSize: { xs: 16, sm: 18 }, color: 'success.main' }} />
                        ) : (
                          <TrendingDown sx={{ fontSize: { xs: 16, sm: 18 }, color: 'error.main' }} />
                        )}
                        <Typography
                          variant="h6"
                          fontWeight="700"
                          color={isPositive ? 'success.main' : 'error.main'}
                          sx={{
                            fontSize: { xs: '1rem', sm: '1.1rem', md: '1.25rem' },
                          }}
                        >
                          {isPositive ? '+' : ''}
                          {formatCurrency(Math.abs(transaction.amount))}
                        </Typography>
                      </Box>
                      <Box display="flex" alignItems="center" gap={1} mt={0.5}>
                        {isMobile && (
                          <Chip
                            label={transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                            color={getStatusColor(transaction.status)}
                            size="small"
                            sx={{ 
                              height: 18,
                              fontSize: '0.65rem',
                              fontWeight: 600,
                              '& .MuiChip-label': { px: 0.75 }
                            }}
                          />
                        )}
                        <Typography 
                          variant="caption" 
                          color="text.secondary" 
                          sx={{ 
                            display: 'block',
                            fontSize: { xs: '0.7rem', sm: '0.75rem' }
                          }}
                        >
                          {isPositive ? 'Received' : 'Sent'}
                        </Typography>
                      </Box>
                    </Box>
                  </ListItemSecondaryAction>
                </Box>
              </ListItem>
            );
          })}
        </List>

        {!loading && transactions.length === 0 && (
          <Box 
            textAlign="center" 
            py={6}
            sx={{
              border: '2px dashed',
              borderColor: 'divider',
              borderRadius: 2,
              bgcolor: 'action.hover'
            }}
          >
            <Receipt sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
            <Typography variant="body2" color="text.secondary" fontWeight="500">
              No transactions yet
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Your transaction history will appear here
            </Typography>
          </Box>
        )}
        
        {loading && (
          <Box textAlign="center" py={6}>
            <Typography variant="body2" color="text.secondary" fontWeight="500">
              Loading transactions...
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default TransactionList;
