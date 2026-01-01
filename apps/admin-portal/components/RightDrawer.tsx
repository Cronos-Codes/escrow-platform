'use client';

import { useState } from 'react';
import { 
  Box,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  Divider,
  Typography,
  IconButton,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Paper,
  Drawer
} from '@mui/material';
import { 
  IconX, 
  IconSettings, 
  IconBell, 
  IconMessage, 
  IconUser, 
  IconShield,
  IconDatabase,
  IconActivity,
  IconChartBar,
  IconAlertTriangle,
  IconCircle,
  IconClock,
  IconMail,
  IconPhone,
  IconMapPin,
  IconGlobe,
  IconLock,
  IconEye,
  IconEyeOff,
  IconDownload,
  IconUpload,
  IconRefresh,
  IconTrash
} from '@tabler/icons-react';

interface RightDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  isMobile?: boolean;
}

export function RightDrawer({ isOpen, onClose, isMobile = false }: RightDrawerProps) {
  return (
    <Drawer 
      anchor="right" 
      open={isOpen} 
      onClose={onClose}
      sx={{ 
        '& .MuiDrawer-paper': { 
          width: isMobile ? '100vw' : 400,
          maxWidth: isMobile ? '100vw' : 400,
          height: '100%'
        } 
      }}
    >
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6">Admin Panel</Typography>
          <IconButton onClick={onClose} size="small">
            <IconX />
          </IconButton>
        </Box>
      </Box>

      <Box sx={{ p: 2 }}>
        <Typography variant="body1">
          Admin panel content will be implemented here.
        </Typography>
      </Box>
    </Drawer>
  );
}
