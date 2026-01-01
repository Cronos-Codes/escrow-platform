import React from 'react';
import {
  Card,
  CardContent,
  Box,
  Typography,
  Chip,
  useTheme,
  alpha,
  useMediaQuery,
} from '@mui/material';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  LineChart,
  Line,
  BarChart,
  Bar,
} from 'recharts';
import { DEFAULT_CHART_HEIGHT, CHART_MARGIN } from '../../config/dashboard-constants';
import { useDeviceOptimization } from '../../hooks/useDeviceOptimization';

interface ChartDataPoint {
  month: string;
  balance: number;
  escrows: number;
}

interface PerformanceChartProps {
  data: ChartDataPoint[];
  timeframe?: string;
  type?: 'area' | 'line' | 'bar';
  title?: string;
  height?: number;
}

export const PerformanceChart: React.FC<PerformanceChartProps> = ({
  data,
  timeframe = '30d',
  type = 'area',
  title = 'Portfolio Performance',
  height = DEFAULT_CHART_HEIGHT,
}) => {
  const theme = useTheme();
  const device = useDeviceOptimization();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // Responsive chart margins
  const chartMargin = isMobile 
    ? { top: 10, right: 5, left: -20, bottom: 5 }
    : { top: 10, right: 10, left: 0, bottom: 0 };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <Box
          sx={{
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            border: '1px solid #e0e0e0',
            borderRadius: 2,
            p: 2,
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          }}
        >
          <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
            {label}
          </Typography>
          {payload.map((entry: any, index: number) => (
            <Box key={index} display="flex" alignItems="center" gap={1}>
              <Box
                sx={{
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  bgcolor: entry.color,
                }}
              />
              <Typography variant="body2">
                {entry.name === 'balance' ? 'Balance' : 'Escrows'}:{' '}
                <strong>
                  {entry.name === 'balance'
                    ? formatCurrency(entry.value)
                    : entry.value}
                </strong>
              </Typography>
            </Box>
          ))}
        </Box>
      );
    }
    return null;
  };

  const renderChart = () => {
    const commonProps = {
      data,
      margin: chartMargin,
    };

    const chartColor = theme.palette.primary.main;
    const fontSize = isMobile ? 10 : 12;

    switch (type) {
      case 'line':
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
            <XAxis 
              dataKey="month" 
              stroke="#666" 
              tick={{ fontSize }}
              angle={isMobile ? -45 : 0}
              textAnchor={isMobile ? 'end' : 'middle'}
              height={isMobile ? 60 : 30}
            />
            <YAxis 
              stroke="#666" 
              tick={{ fontSize }}
              width={isMobile ? 40 : 60}
              tickFormatter={(value) => isMobile ? `$${(value / 1000).toFixed(0)}k` : formatCurrency(value)}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="balance"
              stroke={chartColor}
              strokeWidth={isMobile ? 2 : 3}
              dot={{ fill: chartColor, r: isMobile ? 3 : 4 }}
              activeDot={{ r: isMobile ? 5 : 6 }}
            />
          </LineChart>
        );

      case 'bar':
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
            <XAxis 
              dataKey="month" 
              stroke="#666" 
              tick={{ fontSize }}
              angle={isMobile ? -45 : 0}
              textAnchor={isMobile ? 'end' : 'middle'}
              height={isMobile ? 60 : 30}
            />
            <YAxis 
              stroke="#666" 
              tick={{ fontSize }}
              width={isMobile ? 40 : 60}
              tickFormatter={(value) => isMobile ? `$${(value / 1000).toFixed(0)}k` : formatCurrency(value)}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="balance" fill={chartColor} radius={isMobile ? [4, 4, 0, 0] : [8, 8, 0, 0]} />
          </BarChart>
        );

      case 'area':
      default:
        return (
          <AreaChart {...commonProps}>
            <defs>
              <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={chartColor} stopOpacity={0.3} />
                <stop offset="95%" stopColor={chartColor} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
            <XAxis 
              dataKey="month" 
              stroke="#666" 
              tick={{ fontSize }}
              angle={isMobile ? -45 : 0}
              textAnchor={isMobile ? 'end' : 'middle'}
              height={isMobile ? 60 : 30}
            />
            <YAxis 
              stroke="#666" 
              tick={{ fontSize }}
              width={isMobile ? 40 : 60}
              tickFormatter={(value) => isMobile ? `$${(value / 1000).toFixed(0)}k` : formatCurrency(value)}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="balance"
              stroke={chartColor}
              fill="url(#colorBalance)"
              strokeWidth={isMobile ? 2 : 3}
            />
          </AreaChart>
        );
    }
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
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={{ xs: 2, sm: 2.5, md: 3 }} flexShrink={0} flexWrap="wrap" gap={1}>
          <Typography variant="h6" fontWeight="700" sx={{ fontSize: { xs: '1rem', sm: '1.1rem', md: '1.25rem' } }}>
            {title}
          </Typography>
          <Chip
            label={timeframe.toUpperCase()}
            size="small"
            sx={{
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              color: theme.palette.primary.main,
              fontWeight: 600,
              fontSize: { xs: '0.65rem', sm: '0.7rem' },
              height: { xs: 20, sm: 24 },
              border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
            }}
          />
        </Box>

        <Box 
          sx={{ 
            position: 'relative',
            flex: 1,
            minHeight: { xs: 200, sm: 250, md: 300, lg: 400 },
            width: '100%',
            overflowX: { xs: 'auto', sm: 'visible' },
            WebkitOverflowScrolling: 'touch',
          }}
        >
          <ResponsiveContainer width="100%" height="100%" minHeight={device.isMobile ? 200 : 300}>
            {renderChart()}
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  );
};

export default PerformanceChart;
