'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Badge,
  Box,
  Stack,
  Chip,
  Tooltip,
  alpha,
  useTheme,
  Button,
  Divider,
} from '@mui/material';
import {
  Notifications,
  AccountBalance,
  Settings,
  Logout,
  Person,
  Security,
  Help,
  Brightness4,
  Brightness7,
  Menu as MenuIcon,
} from '@mui/icons-material';

interface LuxuryNavbarProps {
  onMenuToggle?: () => void;
  user?: {
    name: string;
    email: string;
    avatar?: string;
    role: 'buyer' | 'seller';
    kycLevel: 'basic' | 'verified' | 'premium';
  };
  notifications?: number;
  theme?: 'light' | 'dark';
  onThemeToggle?: () => void;
}

const LuxuryNavbar: React.FC<LuxuryNavbarProps> = ({
  onMenuToggle,
  user,
  notifications = 0,
  theme = 'light',
  onThemeToggle,
}) => {
  const muiTheme = useTheme();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [walletBalance, setWalletBalance] = useState('$0.00');
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    // Simulate real-time balance updates
    const interval = setInterval(() => {
      setWalletBalance(`$${(Math.random() * 100000).toLocaleString('en-US', { minimumFractionDigits: 2 })}`);
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const getKYCColor = (level: string) => {
    switch (level) {
      case 'premium': return '#4CAF50';
      case 'verified': return '#2196F3';
      default: return '#FF9800';
    }
  };

  const getKYCIcon = (level: string) => {
    switch (level) {
      case 'premium': return <Security sx={{ fontSize: 16 }} />;
      case 'verified': return <AccountBalance sx={{ fontSize: 16 }} />;
      default: return <Person sx={{ fontSize: 16 }} />;
    }
  };

  return (
    <AppBar
      position="fixed"
      sx={{
        background: theme === 'dark' 
          ? 'linear-gradient(135deg, rgba(0, 0, 0, 0.95) 0%, rgba(30, 30, 30, 0.95) 100%)'
          : 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 249, 250, 0.95) 100%)',
        backdropFilter: 'blur(20px)',
        borderBottom: `1px solid ${alpha('#FFC107', 0.2)}`,
        boxShadow: `0 8px 32px ${alpha('#FFC107', 0.1)}`,
        zIndex: 1200,
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 2, md: 4 } }}>
        {/* Left Section */}
        <Stack direction="row" alignItems="center" spacing={2}>
          {onMenuToggle && (
            <IconButton
              edge="start"
              color="inherit"
              onClick={onMenuToggle}
              sx={{
                color: theme === 'dark' ? '#FFC107' : '#2c3e50',
                '&:hover': {
                  background: alpha('#FFC107', 0.1),
                },
              }}
            >
              <MenuIcon />
            </IconButton>
          )}
          
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                background: 'linear-gradient(45deg, #FFC107, #FF9800)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textShadow: '0 0 20px rgba(255, 193, 7, 0.2)',
                fontSize: { xs: '1.1rem', md: '1.3rem' },
              }}
            >
              Gold Escrow
            </Typography>
          </motion.div>
        </Stack>

        {/* Center Section - Quick Stats */}
        <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 3 }}>
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Tooltip title="Wallet Balance">
              <Chip
                icon={<AccountBalance sx={{ fontSize: 16 }} />}
                label={walletBalance}
                variant="outlined"
                sx={{
                  borderColor: alpha('#FFC107', 0.5),
                  color: theme === 'dark' ? '#FFC107' : '#2c3e50',
                  '&:hover': {
                    borderColor: '#FFC107',
                    background: alpha('#FFC107', 0.05),
                  },
                }}
              />
            </Tooltip>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Tooltip title="Active Escrows">
              <Chip
                icon={<Security sx={{ fontSize: 16 }} />}
                label="3 Active"
                variant="outlined"
                sx={{
                  borderColor: alpha('#4CAF50', 0.5),
                  color: '#4CAF50',
                  '&:hover': {
                    borderColor: '#4CAF50',
                    background: alpha('#4CAF50', 0.05),
                  },
                }}
              />
            </Tooltip>
          </motion.div>
        </Box>

        {/* Right Section */}
        <Stack direction="row" alignItems="center" spacing={1}>
          {/* Theme Toggle */}
          {onThemeToggle && (
            <Tooltip title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}>
              <IconButton
                onClick={onThemeToggle}
                sx={{
                  color: theme === 'dark' ? '#FFC107' : '#2c3e50',
                  '&:hover': {
                    background: alpha('#FFC107', 0.1),
                  },
                }}
              >
                {theme === 'light' ? <Brightness4 /> : <Brightness7 />}
              </IconButton>
            </Tooltip>
          )}

          {/* Notifications */}
          <Tooltip title="Notifications">
            <IconButton
              sx={{
                color: theme === 'dark' ? '#FFC107' : '#2c3e50',
                '&:hover': {
                  background: alpha('#FFC107', 0.1),
                },
              }}
            >
              <Badge badgeContent={notifications} color="error">
                <Notifications />
              </Badge>
            </IconButton>
          </Tooltip>

          {/* Help */}
          <Tooltip title="Help & Support">
            <IconButton
              sx={{
                color: theme === 'dark' ? '#FFC107' : '#2c3e50',
                '&:hover': {
                  background: alpha('#FFC107', 0.1),
                },
              }}
            >
              <Help />
            </IconButton>
          </Tooltip>

          {/* User Profile */}
          {user && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <Stack direction="row" alignItems="center" spacing={2}>
                <Chip
                  icon={getKYCIcon(user.kycLevel)}
                  label={user.kycLevel.toUpperCase()}
                  size="small"
                  sx={{
                    bgcolor: alpha(getKYCColor(user.kycLevel), 0.1),
                    color: getKYCColor(user.kycLevel),
                    border: `1px solid ${alpha(getKYCColor(user.kycLevel), 0.3)}`,
                  }}
                />
                
                <Tooltip title="Account Menu">
                  <IconButton
                    onClick={handleProfileMenuOpen}
                    sx={{
                      '&:hover': {
                        background: alpha('#FFC107', 0.1),
                      },
                    }}
                  >
                    <Avatar
                      src={user.avatar}
                      sx={{
                        width: 40,
                        height: 40,
                        border: `2px solid ${alpha('#FFC107', 0.3)}`,
                        '&:hover': {
                          border: `2px solid ${alpha('#FFC107', 0.8)}`,
                        },
                      }}
                    >
                      {user.name.charAt(0).toUpperCase()}
                    </Avatar>
                  </IconButton>
                </Tooltip>
              </Stack>
            </motion.div>
          )}
        </Stack>
      </Toolbar>

      {/* Profile Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleProfileMenuClose}
        PaperProps={{
          sx: {
            mt: 1,
            minWidth: 280,
            background: theme === 'dark' 
              ? 'rgba(30, 30, 30, 0.95)' 
              : 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            border: `1px solid ${alpha('#FFC107', 0.2)}`,
            boxShadow: `0 8px 32px ${alpha('#FFC107', 0.1)}`,
          },
        }}
      >
        {user && (
          <>
            <Box sx={{ p: 2, borderBottom: `1px solid ${alpha('#FFC107', 0.1)}` }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                {user.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {user.email}
              </Typography>
              <Chip
                label={user.role}
                size="small"
                sx={{
                  mt: 1,
                  bgcolor: alpha('#FFC107', 0.1),
                  color: '#FFC107',
                }}
              />
            </Box>
            
            <MenuItem onClick={handleProfileMenuClose}>
              <Person sx={{ mr: 2 }} />
              Profile
            </MenuItem>
            
            <MenuItem onClick={handleProfileMenuClose}>
              <Settings sx={{ mr: 2 }} />
              Settings
            </MenuItem>
            
            <MenuItem onClick={handleProfileMenuClose}>
              <Security sx={{ mr: 2 }} />
              Security
            </MenuItem>
            
            <Divider />
            
            <MenuItem onClick={handleProfileMenuClose}>
              <Logout sx={{ mr: 2 }} />
              Logout
            </MenuItem>
          </>
        )}
      </Menu>
    </AppBar>
  );
};

export default LuxuryNavbar;
















