import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
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
  TextField,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  InputAdornment,
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
  Search,
  ExpandMore,
  Email,
  Phone,
  Chat,
  Article,
  VideoLibrary,
  QuestionAnswer,
  Support,
  ContactSupport,
  LiveHelp,
  Description,
  Person,
} from '@mui/icons-material';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';

const drawerWidth = 260;

const faqs = [
  {
    category: 'Getting Started',
    questions: [
      {
        question: 'How do I create an escrow?',
        answer: 'To create an escrow, navigate to the "My Escrows" page and click the "Create New Escrow" button. Fill in the required details including the gold type, quantity, price, and counterparty information. Once submitted, the escrow will be created and both parties will be notified.',
      },
      {
        question: 'What KYC levels are available?',
        answer: 'We offer three KYC levels: Basic (email verification), Verified (ID and address verification), and Premium (enhanced verification with additional benefits like lower fees and priority support).',
      },
      {
        question: 'How do I connect my wallet?',
        answer: 'Go to Settings > Wallet Connection and click "Connect New Wallet". You can connect MetaMask, WalletConnect, or other supported wallets. Your wallet address will be used for all transactions.',
      },
    ],
  },
  {
    category: 'Transactions',
    questions: [
      {
        question: 'How long do transactions take?',
        answer: 'Transaction times vary based on network congestion and payment method. Cryptocurrency transactions typically take 10-30 minutes, while bank transfers may take 1-3 business days.',
      },
      {
        question: 'What are the transaction fees?',
        answer: 'Transaction fees vary by KYC level: Basic users pay 2.5%, Verified users pay 1.5%, and Premium users pay 0.8%. Additional network fees may apply for cryptocurrency transactions.',
      },
      {
        question: 'Can I cancel a transaction?',
        answer: 'Transactions can only be cancelled before they are confirmed by both parties. Once confirmed, you must contact support or initiate a dispute if there are issues.',
      },
    ],
  },
  {
    category: 'Escrow Process',
    questions: [
      {
        question: 'What happens after I create an escrow?',
        answer: 'After creating an escrow, the counterparty will be notified and must accept the terms. Once accepted, funds are locked in escrow. The seller ships the gold, and upon delivery confirmation, funds are released.',
      },
      {
        question: 'How is gold verified?',
        answer: 'All gold must be certified by approved assayers. Certificates are uploaded to the platform and verified by our team. We also offer optional third-party inspection services.',
      },
      {
        question: 'What if there is a dispute?',
        answer: 'If there is a dispute, either party can file a dispute claim. Our arbitration team will review evidence from both parties and make a binding decision within 5-7 business days.',
      },
    ],
  },
  {
    category: 'Security',
    questions: [
      {
        question: 'How secure is my account?',
        answer: 'We use bank-level security including 256-bit encryption, two-factor authentication, and cold storage for funds. Your private keys are never stored on our servers.',
      },
      {
        question: 'What is two-factor authentication?',
        answer: '2FA adds an extra layer of security by requiring a code from your phone in addition to your password. We support SMS, authenticator apps, and hardware keys.',
      },
      {
        question: 'How do I report suspicious activity?',
        answer: 'If you notice suspicious activity, immediately contact our security team at security@goldescrow.com or use the "Report Issue" button in your account settings.',
      },
    ],
  },
];

const contactMethods = [
  {
    icon: <Email sx={{ fontSize: 40 }} />,
    title: 'Email Support',
    description: 'Get help via email within 24 hours',
    contact: 'support@goldescrow.com',
    color: '#2196F3',
  },
  {
    icon: <Phone sx={{ fontSize: 40 }} />,
    title: 'Phone Support',
    description: 'Speak with our team directly',
    contact: '+1 (555) 123-4567',
    color: '#4CAF50',
  },
  {
    icon: <Chat sx={{ fontSize: 40 }} />,
    title: 'Live Chat',
    description: 'Chat with us in real-time',
    contact: 'Available 24/7',
    color: '#FF9800',
  },
  {
    icon: <Support sx={{ fontSize: 40 }} />,
    title: 'Support Ticket',
    description: 'Submit a detailed support request',
    contact: 'Create Ticket',
    color: '#9C27B0',
  },
];

const resources = [
  { icon: <Article />, title: 'Documentation', description: 'Complete platform guides', link: '/docs' },
  { icon: <VideoLibrary />, title: 'Video Tutorials', description: 'Step-by-step video guides', link: '/tutorials' },
  { icon: <Description />, title: 'API Reference', description: 'Developer documentation', link: '/api-docs' },
  { icon: <QuestionAnswer />, title: 'Community Forum', description: 'Ask the community', link: '/forum' },
];

interface HelpSupportProps {
  user: {
    name: string;
    email: string;
    role: 'buyer' | 'seller';
    kycLevel: 'basic' | 'verified' | 'premium';
  };
}

const HelpSupport: React.FC<HelpSupportProps> = ({ user }) => {
  const theme = useTheme();
  const router = useRouter();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuAnchor, setUserMenuAnchor] = useState<null | HTMLElement>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFaq, setExpandedFaq] = useState<string | false>(false);

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/user-dashboard' },
    { text: 'My Escrows', icon: <Security />, path: '/user-dashboard/escrows' },
    { text: 'Transactions', icon: <Timeline />, path: '/user-dashboard/transactions' },
    { text: 'Wallet', icon: <AccountBalance />, path: '/user-dashboard/wallet' },
    { text: 'Disputes', icon: <Gavel />, path: '/user-dashboard/disputes' },
    { text: 'Reports', icon: <Receipt />, path: '/user-dashboard/reports' },
    { text: 'Profile', icon: <Person />, path: '/user-dashboard/profile' },
    { text: 'Notifications', icon: <Notifications />, path: '/user-dashboard/notifications' },
  ];

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);

  const handleFaqChange = (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpandedFaq(isExpanded ? panel : false);
  };

  const filteredFaqs = faqs.map(category => ({
    ...category,
    questions: category.questions.filter(
      q => q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
           q.answer.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  })).filter(category => category.questions.length > 0);

  // Sidebar drawer
  const drawer = (
    <Box>
      <Box sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Avatar sx={{ width: 48, height: 48, bgcolor: 'primary.main' }}>
          {user.name.charAt(0)}
        </Avatar>
        <Box sx={{ flex: 1 }}>
          <Typography variant="subtitle1" fontWeight="bold" noWrap>
            {user.name}
          </Typography>
          <Chip label={user.kycLevel} size="small" color="primary" sx={{ mt: 0.5 }} />
        </Box>
      </Box>
      
      <Divider />
      
      <List sx={{ px: 2, py: 1 }}>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton
              onClick={() => router.push(item.path)}
              sx={{ borderRadius: 2 }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <Divider sx={{ my: 2 }} />

      <List sx={{ px: 2 }}>
        <ListItem disablePadding>
          <ListItemButton onClick={() => router.push('/user-dashboard/settings')} sx={{ borderRadius: 2 }}>
            <ListItemIcon sx={{ minWidth: 40 }}>
              <SettingsIcon />
            </ListItemIcon>
            <ListItemText primary="Settings" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton 
            selected
            sx={{ 
              borderRadius: 2,
              bgcolor: alpha(theme.palette.primary.main, 0.1),
            }}
          >
            <ListItemIcon sx={{ minWidth: 40, color: 'primary.main' }}>
              <Help />
            </ListItemIcon>
            <ListItemText primary="Help & Support" primaryTypographyProps={{ color: 'primary.main', fontWeight: 600 }} />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );

  return (
    <>
      <Head>
        <title>Help & Support - Gold Escrow</title>
        <meta name="description" content="Get help and support" />
      </Head>

      <Box sx={{ display: 'flex', minHeight: '100vh' }}>
        {/* App Bar */}
        <AppBar
          position="fixed"
          sx={{
            width: { md: `calc(100% - ${drawerWidth}px)` },
            ml: { md: `${drawerWidth}px` },
            bgcolor: 'white',
            color: 'text.primary',
            boxShadow: 1,
          }}
        >
          <Toolbar>
            <IconButton
              color="inherit"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, display: { md: 'none' } }}
            >
              <MenuIcon />
            </IconButton>
            
            <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, fontWeight: 600 }}>
              Help & Support
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Tooltip title="Notifications">
                <IconButton size="small">
                  <Badge badgeContent={2} color="error">
                    <Notifications />
                  </Badge>
                </IconButton>
              </Tooltip>

              <IconButton
                onClick={(e) => setUserMenuAnchor(e.currentTarget)}
                size="small"
                sx={{ ml: 1 }}
              >
                <Avatar sx={{ width: 32, height: 32 }}>{user.name.charAt(0)}</Avatar>
              </IconButton>

              <Menu
                anchorEl={userMenuAnchor}
                open={Boolean(userMenuAnchor)}
                onClose={() => setUserMenuAnchor(null)}
              >
                <MenuItem onClick={() => router.push('/user-dashboard/profile')}>Profile</MenuItem>
                <MenuItem onClick={() => router.push('/user-dashboard/settings')}>Settings</MenuItem>
                <Divider />
                <MenuItem onClick={() => router.push('/logout')}>
                  <ExitToApp sx={{ mr: 1 }} /> Logout
                </MenuItem>
              </Menu>
            </Box>
          </Toolbar>
        </AppBar>

        {/* Sidebar Drawer */}
        <Box component="nav" sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}>
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={handleDrawerToggle}
            ModalProps={{ keepMounted: true }}
            sx={{
              display: { xs: 'block', md: 'none' },
              '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
            }}
          >
            {drawer}
          </Drawer>

          <Drawer
            variant="permanent"
            sx={{
              display: { xs: 'none', md: 'block' },
              '& .MuiDrawer-paper': { 
                boxSizing: 'border-box', 
                width: drawerWidth,
                borderRight: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
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
            p: 3,
            width: { md: `calc(100% - ${drawerWidth}px)` },
            bgcolor: '#f5f5f5',
            minHeight: '100vh',
          }}
        >
          <Toolbar />
          
          <Container maxWidth="lg" sx={{ mt: 2 }}>
            {/* Header */}
            <Box mb={4} textAlign="center">
              <Typography variant="h3" fontWeight="bold" gutterBottom>
                How can we help you?
              </Typography>
              <Typography variant="body1" color="text.secondary" mb={3}>
                Search our knowledge base or contact support
              </Typography>
              
              {/* Search Bar */}
              <TextField
                fullWidth
                placeholder="Search for help..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                sx={{ maxWidth: 600, mx: 'auto' }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
              />
            </Box>

            {/* Contact Methods */}
            <Grid container spacing={3} mb={6}>
              {contactMethods.map((method, index) => (
                <Grid item xs={12} sm={6} md={3} key={method.title}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <Card
                      sx={{
                        height: '100%',
                        textAlign: 'center',
                        transition: 'all 0.3s',
                        cursor: 'pointer',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: 4,
                        },
                      }}
                    >
                      <CardContent sx={{ p: 3 }}>
                        <Box
                          sx={{
                            width: 80,
                            height: 80,
                            borderRadius: '50%',
                            bgcolor: alpha(method.color, 0.1),
                            color: method.color,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mx: 'auto',
                            mb: 2,
                          }}
                        >
                          {method.icon}
                        </Box>
                        <Typography variant="h6" fontWeight="semibold" gutterBottom>
                          {method.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" mb={2}>
                          {method.description}
                        </Typography>
                        <Typography variant="body2" fontWeight="medium" color="primary">
                          {method.contact}
                        </Typography>
                      </CardContent>
                    </Card>
                  </motion.div>
                </Grid>
              ))}
            </Grid>

            {/* FAQs */}
            <Card sx={{ mb: 4 }}>
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h5" fontWeight="bold" gutterBottom mb={3}>
                  Frequently Asked Questions
                </Typography>
                
                {filteredFaqs.map((category, catIndex) => (
                  <Box key={category.category} mb={3}>
                    <Typography variant="h6" fontWeight="semibold" color="primary" mb={2}>
                      {category.category}
                    </Typography>
                    {category.questions.map((faq, qIndex) => (
                      <Accordion
                        key={`${catIndex}-${qIndex}`}
                        expanded={expandedFaq === `${catIndex}-${qIndex}`}
                        onChange={handleFaqChange(`${catIndex}-${qIndex}`)}
                        sx={{ mb: 1 }}
                      >
                        <AccordionSummary expandIcon={<ExpandMore />}>
                          <Typography fontWeight="medium">{faq.question}</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                          <Typography color="text.secondary">{faq.answer}</Typography>
                        </AccordionDetails>
                      </Accordion>
                    ))}
                  </Box>
                ))}

                {filteredFaqs.length === 0 && searchQuery && (
                  <Box textAlign="center" py={4}>
                    <LiveHelp sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary">
                      No results found for "{searchQuery}"
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Try different keywords or contact support
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>

            {/* Resources */}
            <Card>
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h5" fontWeight="bold" gutterBottom mb={3}>
                  Additional Resources
                </Typography>
                <Grid container spacing={3}>
                  {resources.map((resource, index) => (
                    <Grid item xs={12} sm={6} md={3} key={resource.title}>
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                      >
                        <Card
                          sx={{
                            textAlign: 'center',
                            transition: 'all 0.3s',
                            cursor: 'pointer',
                            '&:hover': {
                              transform: 'translateY(-4px)',
                              boxShadow: 4,
                            },
                          }}
                        >
                          <CardContent>
                            <Box
                              sx={{
                                color: 'primary.main',
                                mb: 2,
                              }}
                            >
                              {React.cloneElement(resource.icon, { sx: { fontSize: 48 } })}
                            </Box>
                            <Typography variant="subtitle1" fontWeight="semibold" gutterBottom>
                              {resource.title}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {resource.description}
                            </Typography>
                          </CardContent>
                        </Card>
                      </motion.div>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          </Container>
        </Box>
      </Box>
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const user = {
    name: 'John Smith',
    email: 'john.smith@email.com',
    role: 'buyer' as const,
    kycLevel: 'premium' as const,
  };

  return {
    props: {
      user,
    },
  };
};

export default HelpSupport;
