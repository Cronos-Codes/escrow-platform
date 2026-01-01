import React, { useState } from 'react';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  Container,
  Typography,
  Avatar,
  Chip,
  IconButton,
  Tooltip,
  alpha,
  useTheme,
  useMediaQuery,
  Divider,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Badge,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Security,
  Timeline,
  AccountBalance,
  Gavel,
  Receipt,
  Settings as SettingsIcon,
  Help,
  ExitToApp,
  Menu as MenuIcon,
  Notifications,
  Refresh,
  Person,
} from '@mui/icons-material';
import { useRouter } from 'next/router';

const drawerWidth = 280;

interface DashboardLayoutProps {
  children: React.ReactNode;
  title: string;
  user: {
    name: string;
    email: string;
    role: 'buyer' | 'seller';
    kycLevel: 'basic' | 'verified' | 'premium';
  };
  activePage?: string;
  onRefresh?: () => void;
  showRefresh?: boolean;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | false;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  title,
  user,
  activePage = '',
  onRefresh,
  showRefresh = true,
  maxWidth = 'xl',
}) => {
  const theme = useTheme();
  const router = useRouter();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'));
  
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuAnchor, setUserMenuAnchor] = useState<null | HTMLElement>(null);

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/user-dashboard', key: 'dashboard' },
    { text: 'My Escrows', icon: <Security />, path: '/user-dashboard/escrows', key: 'escrows' },
    { text: 'Transactions', icon: <Timeline />, path: '/user-dashboard/transactions', key: 'transactions' },
    { text: 'Wallet', icon: <AccountBalance />, path: '/user-dashboard/wallet', key: 'wallet' },
    { text: 'Disputes', icon: <Gavel />, path: '/user-dashboard/disputes', key: 'disputes' },
    { text: 'Reports', icon: <Receipt />, path: '/user-dashboard/reports', key: 'reports' },
    { text: 'Profile', icon: <Person />, path: '/user-dashboard/profile', key: 'profile' },
    { text: 'Notifications', icon: <Notifications />, path: '/user-dashboard/notifications', key: 'notifications' },
  ];

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);

  const getKycColor = (level: string) => {
    switch (level) {
      case 'premium': return 'secondary';
      case 'verified': return 'success';
      default: return 'default';
    }
  };

  // Sidebar drawer content
  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* User Profile Section */}
      <Box sx={{ p: 3 }}>
        <Box display="flex" alignItems="center" gap={2}>
          <Avatar 
            sx={{ 
              width: 56, 
              height: 56, 
              bgcolor: 'primary.main',
              fontSize: '1.5rem',
              fontWeight: 'bold',
            }}
          >
            {user.name.charAt(0)}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="subtitle1" fontWeight="bold" noWrap>
              {user.name}
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block" noWrap>
              {user.email}
            </Typography>
            <Chip 
              label={user.kycLevel.toUpperCase()} 
              size="small" 
              color={getKycColor(user.kycLevel) as any}
              sx={{ mt: 0.5, fontWeight: 600, fontSize: '0.7rem' }} 
            />
          </Box>
        </Box>
      </Box>
      
      <Divider />
      
      {/* Main Navigation */}
      <Box sx={{ flex: 1, overflowY: 'auto', px: 2, py: 2 }}>
        <List disablePadding>
          {menuItems.map((item) => {
            const isActive = activePage === item.key;
            return (
              <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton
                  selected={isActive}
                  onClick={() => {
                    router.push(item.path);
                    if (isMobile) setMobileOpen(false);
                  }}
                  sx={{
                    borderRadius: 2,
                    py: 1.5,
                    transition: 'all 0.2s',
                    '&:hover': {
                      bgcolor: alpha(theme.palette.primary.main, 0.08),
                      transform: 'translateX(4px)',
                    },
                    '&.Mui-selected': {
                      bgcolor: alpha(theme.palette.primary.main, 0.12),
                      '&:hover': {
                        bgcolor: alpha(theme.palette.primary.main, 0.16),
                      },
                    },
                  }}
                >
                  <ListItemIcon 
                    sx={{ 
                      minWidth: 40, 
                      color: isActive ? 'primary.main' : 'text.secondary',
                      transition: 'color 0.2s',
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText 
                    primary={item.text}
                    primaryTypographyProps={{
                      fontWeight: isActive ? 600 : 500,
                      color: isActive ? 'primary.main' : 'text.primary',
                      fontSize: '0.95rem',
                    }}
                  />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </Box>

      <Divider />

      {/* Bottom Navigation */}
      <Box sx={{ p: 2 }}>
        <List disablePadding>
          <ListItem disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton 
              onClick={() => {
                router.push('/user-dashboard/settings');
                if (isMobile) setMobileOpen(false);
              }}
              sx={{ 
                borderRadius: 2,
                py: 1.5,
                transition: 'all 0.2s',
                '&:hover': {
                  bgcolor: alpha(theme.palette.primary.main, 0.08),
                  transform: 'translateX(4px)',
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 40, color: 'text.secondary' }}>
                <SettingsIcon />
              </ListItemIcon>
              <ListItemText 
                primary="Settings" 
                primaryTypographyProps={{ fontWeight: 500, fontSize: '0.95rem' }}
              />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton 
              onClick={() => {
                router.push('/user-dashboard/help');
                if (isMobile) setMobileOpen(false);
              }}
              sx={{ 
                borderRadius: 2,
                py: 1.5,
                transition: 'all 0.2s',
                '&:hover': {
                  bgcolor: alpha(theme.palette.primary.main, 0.08),
                  transform: 'translateX(4px)',
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 40, color: 'text.secondary' }}>
                <Help />
              </ListItemIcon>
              <ListItemText 
                primary="Help & Support" 
                primaryTypographyProps={{ fontWeight: 500, fontSize: '0.95rem' }}
              />
            </ListItemButton>
          </ListItem>
        </List>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#fafafa' }}>
      {/* App Bar */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          bgcolor: 'white',
          color: 'text.primary',
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        }}
      >
        <Toolbar sx={{ minHeight: { xs: 64, sm: 70 } }}>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ 
              mr: 2, 
              display: { md: 'none' },
              '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.08) },
            }}
          >
            <MenuIcon />
          </IconButton>
          
          <Typography 
            variant="h6" 
            noWrap 
            component="div" 
            sx={{ 
              flexGrow: 1, 
              fontWeight: 700,
              fontSize: { xs: '1.1rem', sm: '1.25rem' },
            }}
          >
            {title}
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.5, sm: 1 } }}>
            {showRefresh && onRefresh && (
              <Tooltip title="Refresh">
                <IconButton 
                  onClick={onRefresh} 
                  size="small"
                  sx={{
                    transition: 'all 0.2s',
                    '&:hover': { 
                      bgcolor: alpha(theme.palette.primary.main, 0.08),
                      transform: 'rotate(180deg)',
                    },
                  }}
                >
                  <Refresh />
                </IconButton>
              </Tooltip>
            )}

            <Tooltip title="Notifications">
              <IconButton 
                size="small"
                sx={{
                  transition: 'all 0.2s',
                  '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.08) },
                }}
              >
                <Badge badgeContent={2} color="error">
                  <Notifications />
                </Badge>
              </IconButton>
            </Tooltip>

            <IconButton
              onClick={(e) => setUserMenuAnchor(e.currentTarget)}
              size="small"
              sx={{ 
                ml: { xs: 0.5, sm: 1 },
                transition: 'all 0.2s',
                '&:hover': { transform: 'scale(1.05)' },
              }}
            >
              <Avatar sx={{ width: 36, height: 36, fontSize: '1rem' }}>
                {user.name.charAt(0)}
              </Avatar>
            </IconButton>

            <Menu
              anchorEl={userMenuAnchor}
              open={Boolean(userMenuAnchor)}
              onClose={() => setUserMenuAnchor(null)}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              PaperProps={{
                elevation: 3,
                sx: {
                  mt: 1.5,
                  minWidth: 200,
                  borderRadius: 2,
                },
              }}
            >
              <MenuItem 
                onClick={() => router.push('/profile')}
                sx={{
                  py: 1.5,
                  '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.08) },
                }}
              >
                Profile
              </MenuItem>
              <MenuItem 
                onClick={() => router.push('/user-dashboard/settings')}
                sx={{
                  py: 1.5,
                  '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.08) },
                }}
              >
                Settings
              </MenuItem>
              <Divider sx={{ my: 0.5 }} />
              <MenuItem 
                onClick={() => router.push('/logout')}
                sx={{
                  py: 1.5,
                  color: 'error.main',
                  '&:hover': { bgcolor: alpha(theme.palette.error.main, 0.08) },
                }}
              >
                <ExitToApp sx={{ mr: 1, fontSize: 20 }} /> Logout
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Sidebar Drawer */}
      <Box component="nav" sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}>
        {/* Mobile drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              borderRight: 'none',
            },
          }}
        >
          {drawer}
        </Drawer>

        {/* Desktop drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              borderRight: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
              bgcolor: 'white',
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { xs: '100%', md: `calc(100% - ${drawerWidth}px)` },
          minHeight: '100vh',
          bgcolor: '#fafafa',
        }}
      >
        <Toolbar sx={{ minHeight: { xs: 64, sm: 70 } }} />
        
        <Container 
          maxWidth={maxWidth} 
          sx={{ 
            py: { xs: 2, sm: 3, md: 4 },
            px: { xs: 2, sm: 3 },
          }}
        >
          {children}
        </Container>
      </Box>

      {/* Floating Help Button */}
      <Box 
        sx={{ 
          position: 'fixed', 
          bottom: { xs: 16, sm: 24 }, 
          right: { xs: 16, sm: 24 }, 
          zIndex: 1000,
        }}
      >
        <Tooltip title="Need Help?" placement="left">
          <IconButton
            sx={{
              width: { xs: 52, sm: 56 },
              height: { xs: 52, sm: 56 },
              bgcolor: 'primary.main',
              color: 'white',
              boxShadow: 3,
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': { 
                bgcolor: 'primary.dark',
                transform: 'scale(1.1)',
                boxShadow: 6,
              },
            }}
            onClick={() => router.push('/user-dashboard/help')}
          >
            <Help sx={{ fontSize: { xs: 24, sm: 28 } }} />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );
};

export default DashboardLayout;
