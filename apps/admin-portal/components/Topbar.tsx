'use client';

import { useState } from 'react';
import { 
  IconSearch, 
  IconMenu2, 
  IconBell, 
  IconSettings, 
  IconUser, 
  IconLogout, 
  IconSun, 
  IconMoon 
} from '@tabler/icons-react';
import { useAuth } from './auth/AuthProvider';
import { useTheme } from './theme/ThemeProvider';
import { 
  Button, 
  TextField, 
  Menu, 
  MenuItem, 
  IconButton, 
  Chip,
  Box,
  Typography,
  AppBar,
  Toolbar
} from '@mui/material';

interface TopbarProps {
  onMenuToggle: () => void;
  onRightDrawerToggle: () => void;
  isMobile?: boolean;
  isTablet?: boolean;
}

export function Topbar({ onMenuToggle, onRightDrawerToggle, isMobile = false, isTablet = false }: TopbarProps) {
  const { user, signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [showMobileSearch, setShowMobileSearch] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement global search functionality
    console.log('Searching for:', searchQuery);
  };

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <AppBar position="sticky" sx={{ zIndex: 50 }}>
      <Toolbar sx={{ 
        justifyContent: 'space-between',
        minHeight: isMobile ? '56px' : '64px',
        px: isMobile ? 1 : 2
      }}>
        {/* Left side */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: isMobile ? 1 : 2 }}>
          <IconButton
            onClick={onMenuToggle}
            sx={{ 
              display: { lg: 'none' },
              minWidth: isMobile ? '40px' : '44px',
              minHeight: isMobile ? '40px' : '44px'
            }}
          >
            <IconMenu2 size={isMobile ? 20 : 24} />
          </IconButton>

          {/* Logo */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ 
              width: isMobile ? 28 : 32, 
              height: isMobile ? 28 : 32, 
              bgcolor: 'primary.main', 
              borderRadius: 1, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center' 
            }}>
              <Typography 
                variant="body2" 
                sx={{ 
                  color: 'primary.contrastText', 
                  fontWeight: 'bold',
                  fontSize: isMobile ? '0.875rem' : '1rem'
                }}
              >
                G
              </Typography>
            </Box>
            <Typography 
              variant="h6" 
              sx={{ 
                display: { xs: 'none', sm: 'block' },
                fontSize: isMobile ? '1rem' : '1.25rem'
              }}
            >
              {isMobile ? 'Gold Escrow' : 'Gold Escrow Admin'}
            </Typography>
          </Box>
        </Box>

        {/* Center - Search - Hidden on mobile, shown in popup */}
        {!isMobile && (
          <Box sx={{ flex: 1, maxWidth: 600, mx: 4, display: { xs: 'none', md: 'block' } }}>
            <form onSubmit={handleSearch}>
              <TextField
                type="text"
                placeholder="Search users, escrows, disputes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                size="small"
                fullWidth
                InputProps={{
                  startAdornment: <IconSearch style={{ marginRight: 8 }} />
                }}
              />
            </form>
          </Box>
        )}

        {/* Right side */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: isMobile ? 0.5 : 1 }}>
          {/* Mobile Search Button */}
          {isMobile && (
            <IconButton
              onClick={() => setShowMobileSearch(!showMobileSearch)}
              sx={{ minWidth: '40px', minHeight: '40px' }}
            >
              <IconSearch size={20} />
            </IconButton>
          )}

          {/* Theme Toggle */}
          <IconButton
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            sx={{ 
              minWidth: isMobile ? '40px' : '44px',
              minHeight: isMobile ? '40px' : '44px',
              display: { xs: 'none', sm: 'flex' }
            }}
          >
            {theme === 'light' ? <IconMoon size={isMobile ? 18 : 20} /> : <IconSun size={isMobile ? 18 : 20} />}
          </IconButton>

          {/* Notifications */}
          <IconButton 
            sx={{ 
              position: 'relative',
              minWidth: isMobile ? '40px' : '44px',
              minHeight: isMobile ? '40px' : '44px'
            }}
          >
            <IconBell size={isMobile ? 18 : 20} />
            <Chip 
              label="3" 
              size="small" 
              sx={{ 
                position: 'absolute', 
                top: -8, 
                right: -8, 
                height: 18, 
                minWidth: 18,
                fontSize: '0.75rem'
              }} 
            />
          </IconButton>

          {/* Settings */}
          <IconButton 
            onClick={onRightDrawerToggle}
            sx={{ 
              minWidth: isMobile ? '40px' : '44px',
              minHeight: isMobile ? '40px' : '44px'
            }}
          >
            <IconSettings size={isMobile ? 18 : 20} />
          </IconButton>

          {/* User Menu - Hidden on mobile */}
          {!isMobile && (
            <IconButton>
              <IconUser size={20} />
            </IconButton>
          )}
        </Box>
      </Toolbar>

      {/* Mobile Search Bar */}
      {isMobile && showMobileSearch && (
        <Box sx={{ 
          p: 2, 
          bgcolor: 'background.paper',
          borderTop: '1px solid',
          borderColor: 'divider'
        }}>
          <form onSubmit={handleSearch}>
            <TextField
              type="text"
              placeholder="Search users, escrows, disputes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              fullWidth
              autoFocus
              InputProps={{
                startAdornment: <IconSearch style={{ marginRight: 8 }} />
              }}
            />
          </form>
        </Box>
      )}
    </AppBar>
  );
}
