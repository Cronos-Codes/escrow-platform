 'use client'
// TODO: Analytics Page - Escrow Status Distribution Chart
// ✅ Remove detailed breakdown below chart
// ✅ Enhance hover tooltips with rich data display
// ✅ Clean, minimal design with data revealed on hover
// ✅ Fix tooltip formatter error (Cannot read properties of undefined)
// ✅ Fix pie chart colors and enhance 3D depth effects
// ✅ Simplify 3D effects for better visibility and functionality
// ✅ Increase donut radius to 75% for better proportions
// ✅ Remove legend/color describers for cleaner look
// ✅ Enhance chart distinctiveness with better colors, stroke, and labels
// ✅ Fix percentage labels in donut cuts with smart visibility
// ✅ Remove percentage numbers for cleaner donut appearance
// ✅ Enhance blockchain performance visualization with interactive charts and animations
// 🎯 Next: Consider adding real-time data refresh functionality

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Stack,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  IconButton,
  Tooltip,
  Divider,
} from '@mui/material';
import {
  IconDownload,
  IconRefresh,
  IconCalendar,
  IconTrendingUp,
  IconTrendingDown,
  IconUsers,
  IconCreditCard,
  IconGavel,
  IconAlertTriangle,
  IconSettings,
  IconShield,
  IconShieldLock,
  IconAlertCircle,
  IconBrain,
  IconRadar,
  IconCheck,
  IconX,
} from '@tabler/icons-react';
import { motion } from 'framer-motion';
import { alpha } from '@mui/material/styles';
import dynamic from 'next/dynamic';
import PageContainer from '@/app/(DashboardLayout)/components/container/PageContainer';
import { useRequireRole } from '@/hooks/useRequireRole';
import type { ApexOptions } from 'apexcharts';

// Dynamically import charts to avoid SSR issues
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

// CSS Animations for enhanced blockchain performance visualization
const animationStyles = `
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.6; }
  }
  
  @keyframes blink {
    0%, 50% { opacity: 1; }
    51%, 100% { opacity: 0.3; }
  }
  
  @keyframes flow {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }
  
  @keyframes bounce {
    0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
    40% { transform: translateY(-10px); }
    60% { transform: translateY(-5px); }
  }
  
  @keyframes growUp {
    0% { height: 0%; }
    100% { height: var(--final-height); }
  }
`;

const AnalyticsPage = () => {
  // Require admin or operator role
  useRequireRole(['ADMIN', 'OPERATOR']);

  const [timeRange, setTimeRange] = useState('30d');
  const [isClient, setIsClient] = useState(false);

  // Prevent hydration mismatch by only rendering formatted dates on client
  useEffect(() => {
    setIsClient(true);
  }, []);

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

  // Mock data for charts
  const transactionVolumeData = {
    series: [
      {
        name: 'Transaction Volume',
        data: [25000, 35000, 28000, 42000, 38000, 45000, 52000, 48000, 55000, 62000, 58000, 65000]
      }
    ],
    options: {
      chart: {
        type: 'area' as const,
        height: 350,
        toolbar: {
          show: false
        }
      },
      dataLabels: {
        enabled: false
      },
      stroke: {
        curve: 'smooth' as const,
        width: 3
      },
      colors: ['#FFC107'],
      fill: {
        type: 'gradient' as const,
        gradient: {
          shadeIntensity: 1,
          opacityFrom: 0.7,
          opacityTo: 0.3,
          stops: [0, 90, 100]
        }
      },
      xaxis: {
        categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
      },
      yaxis: {
        labels: {
          formatter: function (val: number) {
            return '$' + val.toLocaleString();
          }
        }
      },
      tooltip: {
        y: {
          formatter: function (val: number) {
            return '$' + val.toLocaleString();
          }
        }
      }
    } as ApexOptions
  };

  // Escrow Status Data - Ready for backend integration
  // TODO: Replace with API call - const { data: escrowStats } = useQuery(['escrowStats'], fetchEscrowStatistics)
  // Expected API Response: { 
  //   escrowCounts: [156, 89, 23, 12, 8, 5], // [active, completed, disputed, pending, cancelled, awaiting]
  //   totalValue: 2400000, successRate: 84.2, disputeRate: 7.8 
  // }
  // Enhanced tooltip reveals all data on hover - no need for additional breakdown sections
  const escrowStatusData = {
    escrowCounts: [156, 89, 23, 12, 8, 5], // Real-time counts from: GET /api/escrows/statistics
    options: {
      chart: {
        type: 'donut' as const,
        height: 380,
        background: 'transparent',
        animations: {
          enabled: true,
          easing: 'easeinout',
          speed: 600
        }
      },
      labels: [
        'Active Escrows', 
        'Completed Successfully', 
        'Under Dispute', 
        'Pending Release',
        'Expired/Cancelled',
        'Awaiting Approval'
      ],
      fill: {
        type: 'solid'
      },
      colors: [
        '#10b981', // Active - Emerald Green
        '#2563eb', // Completed - Royal Blue  
        '#d97706', // Disputed - Orange
        '#7c3aed', // Pending - Violet
        '#dc2626', // Cancelled - Red
        '#0891b2'  // Awaiting - Teal
      ],
      legend: {
        show: false
      },
      plotOptions: {
        pie: {
          donut: {
            size: '70%',
            background: 'transparent',
            labels: {
              show: true,
              name: {
                show: true,
                fontSize: '18px',
                fontFamily: 'Inter, sans-serif',
                fontWeight: 700,
                color: '#111827',
                offsetY: -10
              },
              value: {
                show: true,
                fontSize: '32px',
                fontFamily: 'Inter, sans-serif',
                fontWeight: 'bold',
                color: '#059669',
                offsetY: 10
              },
              total: {
                show: true,
                showAlways: true,
                label: 'Total Escrows',
                fontSize: '16px',
                fontFamily: 'Inter, sans-serif',
                fontWeight: 600,
                color: '#374151'
              }
            }
          },
          expandOnClick: true,
          startAngle: -90,
          endAngle: 270,
          offsetY: 0,
          customScale: 1,
          dataLabels: {
            offset: 0,
            minAngleToShowLabel: 10
          }
        }
      },
      dataLabels: {
        enabled: false
      },
      stroke: {
        width: 4,
        colors: ['#ffffff']
      },
      tooltip: {
        enabled: true,
        theme: 'light' as const,
        style: {
          fontSize: '13px',
          fontFamily: 'Inter, sans-serif'
        },
        y: {
          formatter: function (val: number, opts: any) {
            if (!opts || !opts.series) return `${val} escrows`;
            const total = opts.series.reduce((a: number, b: number) => a + b, 0);
            const percentage = ((val / total) * 100).toFixed(1);
            return `${val} escrows (${percentage}%)`;
          }
        }
      },
      states: {
        hover: {
          filter: {
            type: 'lighten',
            value: 0.1
          }
        },
        active: {
          allowMultipleDataPointsSelection: false,
          filter: {
            type: 'darken',
            value: 0.1
          }
        }
      },
      responsive: [
        {
          breakpoint: 768,
          options: {
            chart: {
              height: 320
            },
            legend: {
              position: 'bottom' as const,
              fontSize: '11px'
            },
            plotOptions: {
              pie: {
                donut: {
                  size: '60%',
                  labels: {
                    show: true,
                    value: {
                      fontSize: '24px'
                    }
                  }
                }
              }
            }
          }
        }
      ]
    } as ApexOptions
  };

  const userGrowthData = {
    series: [
      {
        name: 'New Users',
        data: [120, 150, 180, 200, 220, 250, 280, 300, 320, 350, 380, 400]
      },
      {
        name: 'Active Users',
        data: [100, 130, 160, 180, 200, 230, 260, 280, 300, 330, 360, 380]
      }
    ],
    options: {
      chart: {
        type: 'line' as const,
        height: 350,
        toolbar: {
          show: false
        }
      },
      stroke: {
        width: 3,
        curve: 'smooth' as const
      },
      colors: ['#eab308', '#3b82f6'],
      xaxis: {
        categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
      },
      yaxis: {
        labels: {
          formatter: function (val: number) {
            return val.toLocaleString();
          }
        }
      },
      legend: {
        position: 'top' as const
      }
    } as ApexOptions
  };

  const disputeResolutionData = {
    series: [
      {
        name: 'Resolution Time (Days)',
        data: [2, 3, 1, 4, 2, 3, 1, 2, 3, 2, 1, 2]
      }
    ],
    options: {
      chart: {
        type: 'bar' as const,
        height: 300,
        toolbar: {
          show: false
        }
      },
      colors: ['#8b5cf6'],
      xaxis: {
        categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
      },
      yaxis: {
        title: {
          text: 'Days'
        }
      },
      plotOptions: {
        bar: {
          borderRadius: 4,
          horizontal: false,
        }
      }
    } as ApexOptions
  };

  // Mock metrics data
  const metrics = {
    totalVolume: '$2,450,000',
    totalUsers: '1,250',
    activeEscrows: '45',
    disputeRate: '2.3%',
    avgResolutionTime: '2.1 days',
    successRate: '97.7%',
    monthlyGrowth: '+12.5%',
    riskScore: 'Low'
  };

  return (
    <PageContainer title="Analytics" description="Gold Escrow performance analytics and insights">
      <style dangerouslySetInnerHTML={{ __html: animationStyles }} />
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
                    Analytics Dashboard
                  </Typography>
                  <Typography variant="body1" color="textSecondary">
                    Comprehensive performance analytics and business insights
                  </Typography>
                </Box>
                <Stack direction="row" spacing={2}>
                  <FormControl sx={{ minWidth: { xs: '100%', sm: 150 } }}>
                    <InputLabel>Time Range</InputLabel>
                    <Select
                      value={timeRange}
                      onChange={(e) => setTimeRange(e.target.value)}
                      label="Time Range"
                      size="small"
                    >
                      <MenuItem value="7d">Last 7 Days</MenuItem>
                      <MenuItem value="30d">Last 30 Days</MenuItem>
                      <MenuItem value="90d">Last 90 Days</MenuItem>
                      <MenuItem value="1y">Last Year</MenuItem>
                    </Select>
                  </FormControl>
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
            </CardContent>
          </Card>
        </motion.div>

        {/* Key Metrics Grid */}
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1, overflowX: 'auto', mb: 4 }}>
          <Card sx={{ 
            boxShadow: 1,
            '&:hover': { boxShadow: 2 },
            transition: 'all 0.3s ease',
            height: '100%'
          }}>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 1 }}>
                <IconCreditCard size={24} style={{ color: '#FFC107' }} />
              </Box>
              <Typography variant="h5" fontWeight="bold" sx={{ color: '#FFC107', mb: 0.5 }}>
                {metrics.totalVolume}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Total Transaction Volume
              </Typography>
              <Stack direction="row" alignItems="center" justifyContent="center" spacing={0.5} sx={{ mt: 1 }}>
                <IconTrendingUp size={16} style={{ color: '#22c55e' }} />
                <Typography variant="caption" color="success.main">
                  {metrics.monthlyGrowth}
                </Typography>
              </Stack>
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
                <IconUsers size={24} style={{ color: '#2196F3' }} />
              </Box>
              <Typography variant="h5" fontWeight="bold" sx={{ color: '#2196F3', mb: 0.5 }}>
                {metrics.totalUsers}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Total Users
              </Typography>
              <Stack direction="row" alignItems="center" justifyContent="center" spacing={0.5} sx={{ mt: 1 }}>
                <IconTrendingUp size={16} style={{ color: '#22c55e' }} />
                <Typography variant="caption" color="success.main">
                  +8.2%
                </Typography>
              </Stack>
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
                <IconGavel size={24} style={{ color: '#FF9800' }} />
              </Box>
              <Typography variant="h5" fontWeight="bold" sx={{ color: '#FF9800', mb: 0.5 }}>
                {metrics.activeEscrows}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Active Escrows
              </Typography>
              <Stack direction="row" alignItems="center" justifyContent="center" spacing={0.5} sx={{ mt: 1 }}>
                <IconTrendingUp size={16} style={{ color: '#22c55e' }} />
                <Typography variant="caption" color="success.main">
                  +15.3%
                </Typography>
              </Stack>
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
                {metrics.successRate}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Success Rate
              </Typography>
              <Stack direction="row" alignItems="center" justifyContent="center" spacing={0.5} sx={{ mt: 1 }}>
                <IconTrendingUp size={16} style={{ color: '#22c55e' }} />
                <Typography variant="caption" color="success.main">
                  +2.1%
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Box>

                {/* Charts Row 1 */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' }, gap: 3, mb: 3 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Transaction Volume Trend
              </Typography>
              {isClient ? (
                <Chart
                  options={transactionVolumeData.options}
                  series={transactionVolumeData.series}
                  height={350}
                />
              ) : (
                <Box 
                  sx={{ 
                    height: 350, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    backgroundColor: 'rgba(0,0,0,0.02)',
                    borderRadius: 1
                  }}
                >
                  <Typography variant="body1" color="textSecondary">
                    Loading chart...
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>

          <Card sx={{ 
            boxShadow: 2,
            '&:hover': { boxShadow: 4 },
            transition: 'all 0.3s ease',
            border: '1px solid rgba(34, 197, 94, 0.1)'
          }}>
            <CardContent sx={{ p: 3 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
                <Box>
                  <Typography variant="h6" fontWeight="bold" sx={{ color: '#22c55e', mb: 0.5 }}>
                    Escrow Status Distribution
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Current distribution of escrow statuses across the platform
                  </Typography>
                </Box>
                <Chip 
                  label="293 Total" 
                  color="success" 
                  size="small"
                  sx={{ 
                    backgroundColor: 'rgba(34, 197, 94, 0.1)',
                    color: '#22c55e',
                    fontWeight: 'bold'
                  }}
                />
              </Stack>
              {isClient ? (
                <Chart
                  options={escrowStatusData.options}
                  series={escrowStatusData.escrowCounts}
                  type="donut"
                  height={380}
                />
              ) : (
                <Box 
                  sx={{ 
                    height: 380, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    backgroundColor: 'rgba(0,0,0,0.02)',
                    borderRadius: 1
                  }}
                >
                  <Typography variant="body1" color="textSecondary">
                    Loading escrow analytics...
                  </Typography>
                </Box>
                            )}

              {/* Clean, minimal design - data revealed on hover */}
            </CardContent>
          </Card>
        </Box>

        {/* Charts Row 2 */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' }, gap: 3, mb: 3 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                User Growth
              </Typography>
              {isClient ? (
                <Chart
                  options={userGrowthData.options}
                  series={userGrowthData.series}
                  height={350}
                />
              ) : (
                <Box 
                  sx={{ 
                    height: 350, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    backgroundColor: 'rgba(0,0,0,0.02)',
                    borderRadius: 1
                  }}
                >
                  <Typography variant="body1" color="textSecondary">
                    Loading chart...
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Dispute Resolution Time
              </Typography>
              {isClient ? (
                <Chart
                  options={disputeResolutionData.options}
                  series={disputeResolutionData.series}
                  height={350}
                />
              ) : (
                <Box 
                  sx={{ 
                    height: 350, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    backgroundColor: 'rgba(0,0,0,0.02)',
                    borderRadius: 1
                  }}
                >
                  <Typography variant="body1" color="textSecondary">
                    Loading chart...
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Box>

        {/* Blockchain & Contract Metrics */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' }, gap: 3, mb: 3 }}>
          <Card sx={{ 
            boxShadow: 2,
            '&:hover': { boxShadow: 4 },
            transition: 'all 0.3s ease',
            border: '1px solid rgba(255, 193, 7, 0.1)'
          }}>
            <CardContent sx={{ p: 3 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
                <Box>
                  <Typography variant="h6" fontWeight="bold" sx={{ color: '#FFC107', mb: 0.5 }}>
                    Blockchain Performance
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Real-time blockchain metrics and network health
                  </Typography>
                </Box>
                <Chip 
                  label="Live Data" 
                  color="success" 
                  size="small"
                  sx={{ 
                    backgroundColor: 'rgba(76, 175, 80, 0.1)',
                    color: '#4CAF50',
                    fontWeight: 'bold'
                  }}
                />
              </Stack>
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 3, mb: 3 }}>
                <Box sx={{ 
                  textAlign: 'center', 
                  p: 2, 
                  borderRadius: 2,
                  backgroundColor: 'rgba(255, 193, 7, 0.05)',
                  border: '1px solid rgba(255, 193, 7, 0.1)',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  <Box sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '3px',
                    background: 'linear-gradient(90deg, #FFC107, #FF9800)',
                    animation: 'pulse 2s infinite'
                  }} />
                  <Typography variant="h4" sx={{ color: '#FFC107' }} fontWeight="bold">
                    2.3s
                  </Typography>
                  <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                    Avg Block Time
                  </Typography>
                  <Chip 
                    label="Optimal" 
                    size="small" 
                    sx={{ 
                      backgroundColor: 'rgba(76, 175, 80, 0.1)',
                      color: '#4CAF50',
                      fontSize: '0.7rem'
                    }}
                  />
                  <Box sx={{
                    position: 'absolute',
                    bottom: 8,
                    right: 8,
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    backgroundColor: '#4CAF50',
                    animation: 'blink 1.5s infinite'
                  }} />
                </Box>
                <Box sx={{ 
                  textAlign: 'center', 
                  p: 2, 
                  borderRadius: 2,
                  backgroundColor: 'rgba(33, 150, 243, 0.05)',
                  border: '1px solid rgba(33, 150, 243, 0.1)',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  <Box sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '3px',
                    background: 'linear-gradient(90deg, #2196F3, #1976D2)',
                    animation: 'pulse 2s infinite'
                  }} />
                  <Typography variant="h4" sx={{ color: '#2196F3' }} fontWeight="bold">
                    15.2k
                  </Typography>
                  <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                    TPS (Peak)
                  </Typography>
                  <Chip 
                    label="High" 
                    size="small" 
                    sx={{ 
                      backgroundColor: 'rgba(76, 175, 80, 0.1)',
                      color: '#4CAF50',
                      fontSize: '0.7rem'
                    }}
                  />
                  <Box sx={{
                    position: 'absolute',
                    bottom: 8,
                    right: 8,
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    backgroundColor: '#4CAF50',
                    animation: 'blink 1.5s infinite'
                  }} />
                </Box>
                <Box sx={{ 
                  textAlign: 'center', 
                  p: 2, 
                  borderRadius: 2,
                  backgroundColor: 'rgba(76, 175, 80, 0.05)',
                  border: '1px solid rgba(76, 175, 80, 0.1)',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  <Box sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '3px',
                    background: 'linear-gradient(90deg, #4CAF50, #45A049)',
                    animation: 'pulse 2s infinite'
                  }} />
                  <Typography variant="h4" sx={{ color: '#4CAF50' }} fontWeight="bold">
                    99.98%
                  </Typography>
                  <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                    Uptime
                  </Typography>
                  <Chip 
                    label="Excellent" 
                    size="small" 
                    sx={{ 
                      backgroundColor: 'rgba(76, 175, 80, 0.1)',
                      color: '#4CAF50',
                      fontSize: '0.7rem'
                    }}
                  />
                  <Box sx={{
                    position: 'absolute',
                    bottom: 8,
                    right: 8,
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    backgroundColor: '#4CAF50',
                    animation: 'blink 1.5s infinite'
                  }} />
                </Box>
                <Box sx={{ 
                  textAlign: 'center', 
                  p: 2, 
                  borderRadius: 2,
                  backgroundColor: 'rgba(156, 39, 176, 0.05)',
                  border: '1px solid rgba(156, 39, 176, 0.1)',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  <Box sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '3px',
                    background: 'linear-gradient(90deg, #9C27B0, #7B1FA2)',
                    animation: 'pulse 2s infinite'
                  }} />
                  <Typography variant="h4" sx={{ color: '#9C27B0' }} fontWeight="bold">
                    0.12s
                  </Typography>
                  <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                    Avg Latency
                  </Typography>
                  <Chip 
                    label="Fast" 
                    size="small" 
                    sx={{ 
                      backgroundColor: 'rgba(76, 175, 80, 0.1)',
                      color: '#4CAF50',
                      fontSize: '0.7rem'
                    }}
                  />
                  <Box sx={{
                    position: 'absolute',
                    bottom: 8,
                    right: 8,
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    backgroundColor: '#4CAF50',
                    animation: 'blink 1.5s infinite'
                  }} />
                </Box>
              </Box>
              
              {/* Network Health Chart */}
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" color="textSecondary" sx={{ mb: 2, textAlign: 'center' }}>
                  Network Health Trend (Last 24h)
                </Typography>
                <Box sx={{ 
                  height: 120, 
                  background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.1), rgba(33, 150, 243, 0.1))',
                  borderRadius: 2,
                  p: 2,
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  {/* Simulated network health line */}
                  <Box sx={{
                    position: 'absolute',
                    top: '50%',
                    left: 0,
                    right: 0,
                    height: '2px',
                    background: 'linear-gradient(90deg, #4CAF50, #2196F3, #4CAF50, #FFC107, #4CAF50)',
                    transform: 'translateY(-50%)',
                    animation: 'flow 8s linear infinite'
                  }} />
                  {/* Health indicators */}
                  <Box sx={{
                    position: 'absolute',
                    top: '20%',
                    left: '15%',
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    backgroundColor: '#4CAF50',
                    animation: 'bounce 2s infinite'
                  }} />
                  <Box sx={{
                    position: 'absolute',
                    top: '60%',
                    left: '45%',
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    backgroundColor: '#2196F3',
                    animation: 'bounce 2s infinite 0.5s'
                  }} />
                  <Box sx={{
                    position: 'absolute',
                    top: '30%',
                    left: '75%',
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    backgroundColor: '#FFC107',
                    animation: 'bounce 2s infinite 1s'
                  }} />
                </Box>
              </Box>
            </CardContent>
          </Card>

          <Card sx={{ 
            boxShadow: 2,
            '&:hover': { boxShadow: 4 },
            transition: 'all 0.3s ease',
            border: '1px solid rgba(33, 150, 243, 0.1)'
          }}>
            <CardContent sx={{ p: 3 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
                <Box>
                  <Typography variant="h6" fontWeight="bold" sx={{ color: '#2196F3', mb: 0.5 }}>
                    Smart Contract Health
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Contract performance and security monitoring
                  </Typography>
                </Box>
                <Chip 
                  label="Live" 
                  color="success" 
                  size="small"
                  sx={{ 
                    backgroundColor: 'rgba(76, 175, 80, 0.1)',
                    color: '#4CAF50',
                    fontWeight: 'bold'
                  }}
                />
              </Stack>
              
              <Stack spacing={3}>
                {/* Contract Status */}
                <Box sx={{ 
                  p: 2, 
                  borderRadius: 2,
                  backgroundColor: 'rgba(76, 175, 80, 0.05)',
                  border: '1px solid rgba(76, 175, 80, 0.2)'
                }}>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Box sx={{ 
                      width: 40, 
                      height: 40, 
                      borderRadius: '50%', 
                      backgroundColor: 'rgba(76, 175, 80, 0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <IconCheck size={20} style={{ color: '#4CAF50' }} />
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body1" fontWeight="bold" sx={{ color: '#4CAF50' }}>
                        Escrow Contract: Active
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Contract deployed at 0x7a2...3f4e - 1,247 transactions
                      </Typography>
                    </Box>
                    <Button 
                      variant="outlined" 
                      size="small"
                      sx={{ 
                        borderColor: '#4CAF50',
                        color: '#4CAF50',
                        '&:hover': { 
                          borderColor: '#4CAF50',
                          backgroundColor: 'rgba(76, 175, 80, 0.05)'
                        }
                      }}
                    >
                      View
                    </Button>
                  </Stack>
                </Box>

                {/* Gas Optimization */}
                <Box sx={{ 
                  p: 2, 
                  borderRadius: 2,
                  backgroundColor: 'rgba(255, 193, 7, 0.05)',
                  border: '1px solid rgba(255, 193, 7, 0.2)'
                }}>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Box sx={{ 
                      width: 40, 
                      height: 40, 
                      borderRadius: '50%', 
                      backgroundColor: 'rgba(255, 193, 7, 0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <IconTrendingUp size={20} style={{ color: '#FFC107' }} />
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body1" fontWeight="bold" sx={{ color: '#FFC107' }}>
                        Gas Usage: Optimized
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Average gas cost: 45,000 wei per transaction
                      </Typography>
                    </Box>
                    <Button 
                      variant="outlined" 
                      size="small"
                      sx={{ 
                        borderColor: '#FFC107',
                        color: '#FFC107',
                        '&:hover': { 
                          borderColor: '#FFC107',
                          backgroundColor: 'rgba(255, 193, 7, 0.05)'
                        }
                      }}
                    >
                      Optimize
                    </Button>
                  </Stack>
                </Box>

                {/* Security Audit */}
                <Box sx={{ 
                  p: 2, 
                  borderRadius: 2,
                  backgroundColor: 'rgba(33, 150, 243, 0.05)',
                  border: '1px solid rgba(33, 150, 243, 0.2)'
                }}>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Box sx={{ 
                      width: 40, 
                      height: 40, 
                      borderRadius: '50%', 
                      backgroundColor: 'rgba(33, 150, 243, 0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <IconShield size={20} style={{ color: '#2196F3' }} />
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body1" fontWeight="bold" sx={{ color: '#2196F3' }}>
                        Security Score: 98/100
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Last audit: 2 days ago - No critical vulnerabilities
                      </Typography>
                    </Box>
                    <Button 
                      variant="outlined" 
                      size="small"
                      sx={{ 
                        borderColor: '#2196F3',
                        color: '#2196F3',
                        '&:hover': { 
                          borderColor: '#2196F3',
                          backgroundColor: 'rgba(33, 150, 243, 0.05)'
                        }
                      }}
                    >
                      Audit
                    </Button>
                  </Stack>
                </Box>

                {/* Event Monitoring */}
                <Box sx={{ 
                  p: 2, 
                  borderRadius: 2,
                  backgroundColor: 'rgba(255, 152, 0, 0.05)',
                  border: '1px solid rgba(255, 152, 0, 0.2)'
                }}>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Box sx={{ 
                      width: 40, 
                      height: 40, 
                      borderRadius: '50%', 
                      backgroundColor: 'rgba(255, 152, 0, 0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <IconAlertCircle size={20} style={{ color: '#FF9800' }} />
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body1" fontWeight="bold" sx={{ color: '#FF9800' }}>
                        Event Monitoring: Active
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        156 events processed in last 24 hours
                      </Typography>
                    </Box>
                    <Button 
                      variant="outlined" 
                      size="small"
                      sx={{ 
                        borderColor: '#FF9800',
                        color: '#FF9800',
                        '&:hover': { 
                          borderColor: '#FF9800',
                          backgroundColor: 'rgba(255, 152, 0, 0.05)'
                        }
                      }}
                    >
                      Monitor
                    </Button>
                  </Stack>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Box>

        {/* Additional Blockchain Metrics */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' }, gap: 3 }}>
          <Card sx={{ 
            boxShadow: 2,
            '&:hover': { boxShadow: 4 },
            transition: 'all 0.3s ease',
            border: '1px solid rgba(156, 39, 176, 0.1)'
          }}>
            <CardContent sx={{ p: 3 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" fontWeight="bold" sx={{ color: '#9C27B0' }}>
                  Network Statistics
                </Typography>
                <IconTrendingUp size={20} style={{ color: '#9C27B0' }} />
              </Stack>
              <Stack spacing={2}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" color="textSecondary">Total Nodes</Typography>
                  <Typography variant="body1" fontWeight="bold">1,247</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" color="textSecondary">Active Validators</Typography>
                  <Typography variant="body1" fontWeight="bold">892</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" color="textSecondary">Network Hash Rate</Typography>
                  <Typography variant="body1" fontWeight="bold">2.4 TH/s</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" color="textSecondary">Difficulty</Typography>
                  <Typography variant="body1" fontWeight="bold">15.2M</Typography>
                </Box>
              </Stack>
              
              {/* Network Health Indicator */}
              <Box sx={{ mt: 3, textAlign: 'center' }}>
                <Box sx={{
                  width: '100%',
                  height: 6,
                  backgroundColor: 'rgba(156, 39, 176, 0.1)',
                  borderRadius: 3,
                  overflow: 'hidden',
                  position: 'relative'
                }}>
                  <Box sx={{
                    width: '85%',
                    height: '100%',
                    background: 'linear-gradient(90deg, #4CAF50, #9C27B0)',
                    borderRadius: 3,
                    animation: 'pulse 3s infinite'
                  }} />
                </Box>
                <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
                  Network Health: 85% Optimal
                </Typography>
              </Box>
            </CardContent>
          </Card>

          <Card sx={{ 
            boxShadow: 2,
            '&:hover': { boxShadow: 4 },
            transition: 'all 0.3s ease',
            border: '1px solid rgba(233, 30, 99, 0.1)'
          }}>
            <CardContent sx={{ p: 3 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" fontWeight="bold" sx={{ color: '#E91E63' }}>
                  Transaction Analytics
                </Typography>
                <IconCreditCard size={20} style={{ color: '#E91E63' }} />
              </Stack>
              <Stack spacing={2}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" color="textSecondary">Pending TX</Typography>
                  <Typography variant="body1" fontWeight="bold">1,234</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" color="textSecondary">Avg Gas Price</Typography>
                  <Typography variant="body1" fontWeight="bold">25 Gwei</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" color="textSecondary">Failed TX</Typography>
                  <Typography variant="body1" fontWeight="bold" sx={{ color: '#f44336' }}>12</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" color="textSecondary">Success Rate</Typography>
                  <Typography variant="body1" fontWeight="bold" sx={{ color: '#4CAF50' }}>99.1%</Typography>
                </Box>
              </Stack>
              
              {/* Transaction Success Chart */}
              <Box sx={{ mt: 3 }}>
                <Typography variant="caption" color="textSecondary" sx={{ mb: 2, display: 'block' }}>
                  Success Rate Trend
                </Typography>
                <Box sx={{ 
                  height: 60, 
                  background: 'rgba(233, 30, 99, 0.05)',
                  borderRadius: 2,
                  p: 1,
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  {/* Success rate bars */}
                  <Box sx={{
                    position: 'absolute',
                    bottom: 8,
                    left: '5%',
                    width: '8%',
                    height: '60%',
                    backgroundColor: '#4CAF50',
                    borderRadius: '2px 2px 0 0',
                    animation: 'growUp 2s ease-out'
                  }} />
                  <Box sx={{
                    position: 'absolute',
                    bottom: 8,
                    left: '20%',
                    width: '8%',
                    height: '80%',
                    backgroundColor: '#4CAF50',
                    borderRadius: '2px 2px 0 0',
                    animation: 'growUp 2s ease-out 0.2s'
                  }} />
                  <Box sx={{
                    position: 'absolute',
                    bottom: 8,
                    left: '35%',
                    width: '8%',
                    height: '90%',
                    backgroundColor: '#4CAF50',
                    borderRadius: '2px 2px 0 0',
                    animation: 'growUp 2s ease-out 0.4s'
                  }} />
                  <Box sx={{
                    position: 'absolute',
                    bottom: 8,
                    left: '50%',
                    width: '8%',
                    height: '85%',
                    backgroundColor: '#4CAF50',
                    borderRadius: '2px 2px 0 0',
                    animation: 'growUp 2s ease-out 0.6s'
                  }} />
                  <Box sx={{
                    position: 'absolute',
                    bottom: 8,
                    left: '65%',
                    width: '8%',
                    height: '95%',
                    backgroundColor: '#4CAF50',
                    borderRadius: '2px 2px 0 0',
                    animation: 'growUp 2s ease-out 0.8s'
                  }} />
                  <Box sx={{
                    position: 'absolute',
                    bottom: 8,
                    left: '80%',
                    width: '8%',
                    height: '99%',
                    backgroundColor: '#4CAF50',
                    borderRadius: '2px 2px 0 0',
                    animation: 'growUp 2s ease-out 1s'
                  }} />
                </Box>
              </Box>
            </CardContent>
          </Card>

          <Card sx={{ 
            boxShadow: 2,
            '&:hover': { boxShadow: 4 },
            transition: 'all 0.3s ease',
            border: '1px solid rgba(0, 150, 136, 0.1)'
          }}>
            <CardContent sx={{ p: 3 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" fontWeight="bold" sx={{ color: '#009688' }}>
                  Smart Contract Events
                </Typography>
                <IconAlertCircle size={20} style={{ color: '#009688' }} />
              </Stack>
              <Stack spacing={2}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" color="textSecondary">Escrow Created</Typography>
                  <Typography variant="body1" fontWeight="bold">156</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" color="textSecondary">Funds Released</Typography>
                  <Typography variant="body1" fontWeight="bold">89</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" color="textSecondary">Disputes Raised</Typography>
                  <Typography variant="body1" fontWeight="bold" sx={{ color: '#FF9800' }}>23</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" color="textSecondary">Contract Calls</Typography>
                  <Typography variant="body1" fontWeight="bold">2,847</Typography>
                </Box>
              </Stack>
              
              {/* Event Activity Visualization */}
              <Box sx={{ mt: 3 }}>
                <Typography variant="caption" color="textSecondary" sx={{ mb: 2, display: 'block' }}>
                  Event Activity (Last 24h)
                </Typography>
                <Box sx={{ 
                  height: 60, 
                  background: 'rgba(0, 150, 136, 0.05)',
                  borderRadius: 2,
                  p: 1,
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  {/* Activity dots */}
                  <Box sx={{
                    position: 'absolute',
                    top: '20%',
                    left: '10%',
                    width: 4,
                    height: 4,
                    borderRadius: '50%',
                    backgroundColor: '#009688',
                    animation: 'pulse 1.5s infinite'
                  }} />
                  <Box sx={{
                    position: 'absolute',
                    top: '60%',
                    left: '25%',
                    width: 4,
                    height: 4,
                    borderRadius: '50%',
                    backgroundColor: '#4CAF50',
                    animation: 'pulse 1.5s infinite 0.3s'
                  }} />
                  <Box sx={{
                    position: 'absolute',
                    top: '30%',
                    left: '40%',
                    width: 4,
                    height: 4,
                    borderRadius: '50%',
                    backgroundColor: '#FF9800',
                    animation: 'pulse 1.5s infinite 0.6s'
                  }} />
                  <Box sx={{
                    position: 'absolute',
                    top: '70%',
                    left: '55%',
                    width: 4,
                    height: 4,
                    borderRadius: '50%',
                    backgroundColor: '#009688',
                    animation: 'pulse 1.5s infinite 0.9s'
                  }} />
                  <Box sx={{
                    position: 'absolute',
                    top: '15%',
                    left: '70%',
                    width: 4,
                    height: 4,
                    borderRadius: '50%',
                    backgroundColor: '#4CAF50',
                    animation: 'pulse 1.5s infinite 1.2s'
                  }} />
                  <Box sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '85%',
                    width: 4,
                    height: 4,
                    borderRadius: '50%',
                    backgroundColor: '#FF9800',
                    animation: 'pulse 1.5s infinite 1.5s'
                  }} />
                  
                  {/* Activity line */}
                  <Box sx={{
                    position: 'absolute',
                    top: '50%',
                    left: 0,
                    right: 0,
                    height: '1px',
                    background: 'linear-gradient(90deg, transparent, rgba(0, 150, 136, 0.3), transparent)',
                    transform: 'translateY(-50%)'
                  }} />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </PageContainer>
  );
};

export default AnalyticsPage;
