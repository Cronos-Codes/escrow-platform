import React, { memo } from 'react';
import { motion } from 'framer-motion';
import {
  Card,
  CardContent,
  Box,
  Typography,
  Avatar,
  alpha,
  Divider,
  useTheme,
} from '@mui/material';
import { TrendingUp, TrendingDown, Circle } from '@mui/icons-material';

interface MetricCardProps {
  id: string;
  title: string;
  value: string | number;
  change?: string;
  trend?: 'up' | 'down' | 'stable';
  icon: React.ReactNode;
  color: string;
  description?: string;
  detail?: string;
  expanded?: boolean;
  onClick?: () => void;
  loading?: boolean;
}

const MetricCardComponent: React.FC<MetricCardProps> = ({
  id,
  title,
  value,
  change,
  trend = 'stable',
  icon,
  color,
  description,
  detail,
  expanded = false,
  onClick,
  loading = false,
}) => {
  const theme = useTheme();
  
  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return <TrendingUp sx={{ fontSize: 16, color: 'success.main' }} />;
      case 'down':
        return <TrendingDown sx={{ fontSize: 16, color: 'error.main' }} />;
      default:
        return <Circle sx={{ fontSize: 16, color: 'text.disabled' }} />;
    }
  };

  return (
    <Box
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      } : undefined}
      aria-expanded={onClick ? expanded : undefined}
      aria-label={`${title}: ${value}`}
      sx={{
        p: { xs: 1.75, sm: 2, md: 2.5, lg: 3 },
        border: '1px solid',
        borderColor: alpha(theme.palette.divider, 0.2),
        borderRadius: { xs: 2, sm: 3 },
        height: '100%',
        bgcolor: 'white',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative',
        overflow: 'hidden',
        minHeight: { xs: '130px', sm: '150px', md: '160px' },
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          width: { xs: '3px', sm: '4px' },
          height: '100%',
          bgcolor: color,
          opacity: expanded ? 1 : 0.6,
          transition: 'opacity 0.3s',
        },
        '&:hover': {
          borderColor: color,
          boxShadow: `0 8px 24px ${alpha(color, 0.2)}`,
          transform: { xs: 'none', sm: 'translateY(-6px)' },
          '&::before': {
            opacity: 1,
          },
        },
        '&:active': {
          transform: { xs: 'scale(0.98)', sm: 'translateY(-6px)' },
        },
      }}
    >
      <Box display="flex" justifyContent="space-between" alignItems="start" mb={{ xs: 1.25, sm: 1.5, md: 2 }}>
        <Box flex={1} sx={{ minWidth: 0, pr: { xs: 0.75, sm: 1 } }}>
          <Typography 
            variant="subtitle1" 
            fontWeight="700" 
            gutterBottom
            sx={{
              fontSize: { xs: '0.8rem', sm: '0.875rem', md: '0.95rem', lg: '1rem' },
              lineHeight: { xs: 1.3, sm: 1.4 },
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {title}
          </Typography>
          <Typography 
            variant="caption" 
            color="text.secondary" 
            display="block" 
            mb={{ xs: 0.75, sm: 1 }}
            sx={{
              fontSize: { xs: '0.625rem', sm: '0.65rem', md: '0.7rem', lg: '0.75rem' },
              lineHeight: { xs: 1.25, sm: 1.3 },
              minHeight: { xs: '2em', sm: '2.2em', md: '2.4em', lg: '2.6em' },
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {description || 'Current status'}
          </Typography>
          {change && (
            <Box display="flex" alignItems="center" gap={0.5} sx={{ flexWrap: 'wrap', mt: { xs: 0.25, sm: 0.5 } }}>
              {getTrendIcon()}
              <Typography 
                variant="caption" 
                fontWeight="600" 
                color="text.secondary"
                sx={{
                  fontSize: { xs: '0.625rem', sm: '0.65rem', md: '0.7rem' },
                }}
              >
                {change}
              </Typography>
            </Box>
          )}
        </Box>
        <Avatar
          sx={{
            bgcolor: alpha(color, 0.12),
            color: color,
            width: { xs: 32, sm: 36, md: 40, lg: 48 },
            height: { xs: 32, sm: 36, md: 40, lg: 48 },
            boxShadow: `0 2px 8px ${alpha(color, 0.2)}`,
            transition: 'all 0.3s',
            flexShrink: 0,
          }}
        >
          {icon}
        </Avatar>
      </Box>
      
      <Divider sx={{ my: { xs: 1.25, sm: 1.5, md: 2 }, borderColor: alpha(theme.palette.divider, 0.1) }} />
      
      <Box>
        <Typography 
          variant="caption" 
          color="text.secondary" 
          display="block" 
          mb={0.5} 
          sx={{ 
            fontSize: { xs: '0.625rem', sm: '0.65rem', md: '0.7rem', lg: '0.75rem' }, 
            fontWeight: 500 
          }}
        >
          Total
        </Typography>
        <Typography 
          variant="h5" 
          fontWeight="800" 
          sx={{ 
            color: color, 
            fontSize: { xs: '1.1rem', sm: '1.25rem', md: '1.5rem', lg: '1.75rem' },
            lineHeight: { xs: 1.2, sm: 1.3 },
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }} 
          gutterBottom
        >
          {loading ? '...' : value}
        </Typography>
        
        {expanded && detail && (
          <Box 
            mt={2}
            sx={{
              animation: 'fadeIn 0.3s ease-in',
              '@keyframes fadeIn': {
                from: { opacity: 0, transform: 'translateY(-10px)' },
                to: { opacity: 1, transform: 'translateY(0)' },
              }
            }}
          >
            <Divider sx={{ mb: 1.5, borderColor: alpha(theme.palette.divider, 0.1) }} />
            <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.7, fontSize: '0.8rem' }}>
              {detail}
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};

// Memoize to prevent unnecessary re-renders
export const MetricCard = memo(MetricCardComponent, (prevProps, nextProps) => {
  return (
    prevProps.value === nextProps.value &&
    prevProps.change === nextProps.change &&
    prevProps.trend === nextProps.trend &&
    prevProps.expanded === nextProps.expanded &&
    prevProps.loading === nextProps.loading
  );
});

export default MetricCard;
