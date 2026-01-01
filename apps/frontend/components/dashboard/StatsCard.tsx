import React from 'react';
import { motion } from 'framer-motion';
import {
  Card,
  CardContent,
  Box,
  Typography,
  Avatar,
  alpha,
  useTheme,
} from '@mui/material';
import { TrendingUp, TrendingDown } from '@mui/icons-material';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color?: string;
  trend?: {
    value: string;
    isPositive: boolean;
    label?: string;
  };
  delay?: number;
  onClick?: () => void;
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon,
  color = '#2196F3',
  trend,
  delay = 0,
  onClick,
}) => {
  const theme = useTheme();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.4, 
        delay,
        ease: [0.4, 0, 0.2, 1],
      }}
      style={{ height: '100%' }}
    >
      <Card
        onClick={onClick}
        sx={{
          height: '100%',
          cursor: onClick ? 'pointer' : 'default',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
          '&:hover': {
            transform: 'translateY(-6px)',
            boxShadow: `0 12px 24px ${alpha(color, 0.15)}`,
            borderColor: alpha(color, 0.3),
          },
        }}
      >
        <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
          <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
            <Box flex={1}>
              <Typography 
                variant="body2" 
                color="text.secondary" 
                gutterBottom
                sx={{ 
                  fontWeight: 500,
                  fontSize: { xs: '0.8rem', sm: '0.875rem' },
                  letterSpacing: 0.5,
                }}
              >
                {title}
              </Typography>
              <Typography 
                variant="h4" 
                fontWeight="bold"
                sx={{
                  fontSize: { xs: '1.75rem', sm: '2rem', md: '2.125rem' },
                  lineHeight: 1.2,
                  mt: 0.5,
                }}
              >
                {value}
              </Typography>
            </Box>
            <Avatar
              sx={{
                bgcolor: alpha(color, 0.1),
                color: color,
                width: { xs: 48, sm: 56 },
                height: { xs: 48, sm: 56 },
                transition: 'all 0.3s',
                '.MuiCard-root:hover &': {
                  bgcolor: alpha(color, 0.15),
                  transform: 'scale(1.05)',
                },
              }}
            >
              {icon}
            </Avatar>
          </Box>

          {trend && (
            <Box 
              display="flex" 
              alignItems="center" 
              gap={0.5}
              sx={{
                pt: 1.5,
                borderTop: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
              }}
            >
              {trend.isPositive ? (
                <TrendingUp sx={{ fontSize: 18, color: 'success.main' }} />
              ) : (
                <TrendingDown sx={{ fontSize: 18, color: 'error.main' }} />
              )}
              <Typography
                variant="body2"
                fontWeight="600"
                sx={{
                  color: trend.isPositive ? 'success.main' : 'error.main',
                  fontSize: { xs: '0.8rem', sm: '0.875rem' },
                }}
              >
                {trend.value}
              </Typography>
              {trend.label && (
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                >
                  {trend.label}
                </Typography>
              )}
            </Box>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default StatsCard;
