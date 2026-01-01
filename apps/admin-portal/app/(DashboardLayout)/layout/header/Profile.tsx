import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Avatar,
  Box,
  Menu,
  Button,
  IconButton,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Typography,
  Chip,
} from "@mui/material";

import { IconListCheck, IconMail, IconUser, IconLogout, IconSettings } from "@tabler/icons-react";
import { useAuth } from "@/components/auth/AuthProvider";

const Profile = () => {
  const { user, userRoles, signOut } = useAuth();
  const router = useRouter();
  const [anchorEl2, setAnchorEl2] = useState(null);
  
  const handleClick2 = (event: any) => {
    setAnchorEl2(event.currentTarget);
  };
  const handleClose2 = () => {
    setAnchorEl2(null);
  };

  const handleProfileClick = () => {
    router.push('/admin/profile');
    handleClose2();
  };

  const handleSettingsClick = () => {
    router.push('/admin/settings');
    handleClose2();
  };

  const handleSignOut = async () => {
    await signOut();
    handleClose2();
    router.push('/authentication/login');
  };

  return (
    <Box>
      <IconButton
        size="large"
        aria-label="show 11 new notifications"
        color="inherit"
        aria-controls="msgs-menu"
        aria-haspopup="true"
        sx={{
          ...(typeof anchorEl2 === "object" && {
            color: "primary.main",
          }),
        }}
        onClick={handleClick2}
      >
        <Avatar
          sx={{
            width: 35,
            height: 35,
            bgcolor: 'primary.main',
          }}
        >
          {user?.email?.charAt(0).toUpperCase() || 'A'}
        </Avatar>
      </IconButton>
      {/* ------------------------------------------- */}
      {/* Message Dropdown */}
      {/* ------------------------------------------- */}
      <Menu
        id="msgs-menu"
        anchorEl={anchorEl2}
        keepMounted
        open={Boolean(anchorEl2)}
        onClose={handleClose2}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        sx={{
          "& .MuiMenu-paper": {
            width: "200px",
          },
        }}
      >
        {user ? [
          <Box key="user-info" px={2} py={1}>
            <Typography variant="subtitle2" fontWeight="bold">
              {user.email}
            </Typography>
            <Box sx={{ mt: 1 }}>
              {userRoles.map((role) => (
                <Chip
                  key={role}
                  label={role}
                  size="small"
                  color="primary"
                  variant="outlined"
                  sx={{ mr: 0.5, mb: 0.5 }}
                />
              ))}
            </Box>
          </Box>,
          <MenuItem key="profile" onClick={handleProfileClick}>
            <ListItemIcon>
              <IconUser width={20} />
            </ListItemIcon>
            <ListItemText>My Profile</ListItemText>
          </MenuItem>,
          <MenuItem key="settings" onClick={handleSettingsClick}>
            <ListItemIcon>
              <IconSettings width={20} />
            </ListItemIcon>
            <ListItemText>Settings</ListItemText>
          </MenuItem>,
          <Box key="signout" mt={1} py={1} px={2}>
            <Button
              onClick={handleSignOut}
              variant="outlined"
              color="error"
              fullWidth
              startIcon={<IconLogout width={16} />}
            >
              Sign Out
            </Button>
          </Box>
        ] : (
          <Box px={2} py={1}>
            <Button
              href="/authentication/login"
              variant="contained"
              color="primary"
              component={Link}
              fullWidth
            >
              Sign In
            </Button>
          </Box>
        )}
      </Menu>
    </Box>
  );
};

export default Profile;
