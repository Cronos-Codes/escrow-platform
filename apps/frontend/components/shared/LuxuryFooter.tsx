'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  Box,
  Container,
  Typography,
  Stack,
  IconButton,
  Link,
  Divider,
  alpha,
  useTheme,
} from '@mui/material';
import {
  GitHub,
  Twitter,
  LinkedIn,
  Telegram,
  Email,
  Phone,
  LocationOn,
  Forum,
} from '@mui/icons-material';

interface LuxuryFooterProps {
  theme?: 'light' | 'dark';
}

const LuxuryFooter: React.FC<LuxuryFooterProps> = ({ theme = 'light' }) => {
  const muiTheme = useTheme();

  const footerLinks = {
    platform: [
      { label: 'How It Works', href: '/how-it-works' },
      { label: 'Features', href: '/features' },
      { label: 'Pricing', href: '/pricing' },
      { label: 'Security', href: '/security' },
    ],
    resources: [
      { label: 'Documentation', href: '/docs' },
      { label: 'API Reference', href: '/api' },
      { label: 'Help Center', href: '/help' },
      { label: 'Status', href: '/status' },
    ],
    legal: [
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Terms of Service', href: '/terms' },
      { label: 'Cookie Policy', href: '/cookies' },
      { label: 'Compliance', href: '/compliance' },
    ],
    company: [
      { label: 'About Us', href: '/about' },
      { label: 'Careers', href: '/careers' },
      { label: 'Press', href: '/press' },
      { label: 'Contact', href: '/contact' },
    ],
  };

  const socialLinks = [
    { icon: <GitHub />, href: 'https://github.com/goldescrow', label: 'GitHub' },
    { icon: <Twitter />, href: 'https://twitter.com/goldescrow', label: 'Twitter' },
    { icon: <LinkedIn />, href: 'https://linkedin.com/company/goldescrow', label: 'LinkedIn' },
    { icon: <Telegram />, href: 'https://t.me/goldescrow', label: 'Telegram' },
    { icon: <Forum />, href: 'https://discord.gg/goldescrow', label: 'Discord' },
  ];

  return (
    <Box
      component="footer"
      sx={{
        background: theme === 'dark'
          ? 'linear-gradient(135deg, rgba(0, 0, 0, 0.95) 0%, rgba(30, 30, 30, 0.95) 100%)'
          : 'linear-gradient(135deg, rgba(248, 249, 250, 0.95) 0%, rgba(255, 255, 255, 0.95) 100%)',
        backdropFilter: 'blur(20px)',
        borderTop: `1px solid ${alpha('#FFC107', 0.2)}`,
        mt: 'auto',
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '1px',
          background: 'linear-gradient(90deg, transparent 0%, #FFC107 50%, transparent 100%)',
        },
      }}
    >
      <Container maxWidth="xl" sx={{ py: 6 }}>
        {/* Main Footer Content */}
        <Stack spacing={6}>
          {/* Top Section */}
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={6}
            justifyContent="space-between"
            alignItems={{ xs: 'center', md: 'flex-start' }}
          >
            {/* Brand Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <Box sx={{ maxWidth: 300, textAlign: { xs: 'center', md: 'left' } }}>
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 700,
                    background: 'linear-gradient(45deg, #FFC107, #FF9800)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    mb: 2,
                  }}
                >
                  Gold Escrow
                </Typography>
                
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 3, lineHeight: 1.6 }}
                >
                  The world's most secure and trusted platform for gold-backed escrow transactions. 
                  Empowering businesses with blockchain technology and traditional security.
                </Typography>

                {/* Contact Info */}
                <Stack spacing={1}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Email sx={{ fontSize: 16, color: '#FFC107' }} />
                    <Typography variant="body2" color="text.secondary">
                      support@goldescrow.com
                    </Typography>
                  </Stack>
                  
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Phone sx={{ fontSize: 16, color: '#FFC107' }} />
                    <Typography variant="body2" color="text.secondary">
                      +1 (555) 123-4567
                    </Typography>
                  </Stack>
                  
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <LocationOn sx={{ fontSize: 16, color: '#FFC107' }} />
                    <Typography variant="body2" color="text.secondary">
                      New York, NY, USA
                    </Typography>
                  </Stack>
                </Stack>
              </Box>
            </motion.div>

            {/* Links Sections */}
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={6}
              sx={{ flex: 1, justifyContent: 'space-around' }}
            >
              {/* Platform Links */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                viewport={{ once: true }}
              >
                <Box sx={{ textAlign: { xs: 'center', md: 'left' } }}>
                  <Typography
                    variant="subtitle2"
                    sx={{
                      fontWeight: 600,
                      mb: 2,
                      color: theme === 'dark' ? '#FFC107' : '#2c3e50',
                    }}
                  >
                    Platform
                  </Typography>
                  <Stack spacing={1}>
                    {footerLinks.platform.map((link, index) => (
                      <Link
                        key={index}
                        href={link.href}
                        sx={{
                          color: 'text.secondary',
                          textDecoration: 'none',
                          fontSize: '0.875rem',
                          transition: 'color 0.3s ease',
                          '&:hover': {
                            color: '#FFC107',
                          },
                        }}
                      >
                        {link.label}
                      </Link>
                    ))}
                  </Stack>
                </Box>
              </motion.div>

              {/* Resources Links */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                viewport={{ once: true }}
              >
                <Box sx={{ textAlign: { xs: 'center', md: 'left' } }}>
                  <Typography
                    variant="subtitle2"
                    sx={{
                      fontWeight: 600,
                      mb: 2,
                      color: theme === 'dark' ? '#FFC107' : '#2c3e50',
                    }}
                  >
                    Resources
                  </Typography>
                  <Stack spacing={1}>
                    {footerLinks.resources.map((link, index) => (
                      <Link
                        key={index}
                        href={link.href}
                        sx={{
                          color: 'text.secondary',
                          textDecoration: 'none',
                          fontSize: '0.875rem',
                          transition: 'color 0.3s ease',
                          '&:hover': {
                            color: '#FFC107',
                          },
                        }}
                      >
                        {link.label}
                      </Link>
                    ))}
                  </Stack>
                </Box>
              </motion.div>

              {/* Legal Links */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                viewport={{ once: true }}
              >
                <Box sx={{ textAlign: { xs: 'center', md: 'left' } }}>
                  <Typography
                    variant="subtitle2"
                    sx={{
                      fontWeight: 600,
                      mb: 2,
                      color: theme === 'dark' ? '#FFC107' : '#2c3e50',
                    }}
                  >
                    Legal
                  </Typography>
                  <Stack spacing={1}>
                    {footerLinks.legal.map((link, index) => (
                      <Link
                        key={index}
                        href={link.href}
                        sx={{
                          color: 'text.secondary',
                          textDecoration: 'none',
                          fontSize: '0.875rem',
                          transition: 'color 0.3s ease',
                          '&:hover': {
                            color: '#FFC107',
                          },
                        }}
                      >
                        {link.label}
                      </Link>
                    ))}
                  </Stack>
                </Box>
              </motion.div>

              {/* Company Links */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                viewport={{ once: true }}
              >
                <Box sx={{ textAlign: { xs: 'center', md: 'left' } }}>
                  <Typography
                    variant="subtitle2"
                    sx={{
                      fontWeight: 600,
                      mb: 2,
                      color: theme === 'dark' ? '#FFC107' : '#2c3e50',
                    }}
                  >
                    Company
                  </Typography>
                  <Stack spacing={1}>
                    {footerLinks.company.map((link, index) => (
                      <Link
                        key={index}
                        href={link.href}
                        sx={{
                          color: 'text.secondary',
                          textDecoration: 'none',
                          fontSize: '0.875rem',
                          transition: 'color 0.3s ease',
                          '&:hover': {
                            color: '#FFC107',
                          },
                        }}
                      >
                        {link.label}
                      </Link>
                    ))}
                  </Stack>
                </Box>
              </motion.div>
            </Stack>
          </Stack>

          <Divider sx={{ borderColor: alpha('#FFC107', 0.1) }} />

          {/* Bottom Section */}
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={3}
            justifyContent="space-between"
            alignItems="center"
          >
            {/* Copyright */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              viewport={{ once: true }}
            >
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ textAlign: { xs: 'center', md: 'left' } }}
              >
                © {new Date().getFullYear()} Gold Escrow. All rights reserved.
              </Typography>
            </motion.div>

            {/* Social Links */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              viewport={{ once: true }}
            >
              <Stack direction="row" spacing={1}>
                {socialLinks.map((social, index) => (
                  <IconButton
                    key={index}
                    component="a"
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{
                      color: 'text.secondary',
                      '&:hover': {
                        color: '#FFC107',
                        background: alpha('#FFC107', 0.1),
                        transform: 'translateY(-2px)',
                      },
                      transition: 'all 0.3s ease',
                    }}
                  >
                    {social.icon}
                  </IconButton>
                ))}
              </Stack>
            </motion.div>
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
};

export default LuxuryFooter;
















