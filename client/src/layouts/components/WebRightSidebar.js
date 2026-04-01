import React from 'react';
import { Box, Typography, Avatar } from '@mui/material';
import { useAuth } from '../../context/AuthContext';

const WebRightSidebar = () => {
  const { user } = useAuth();
  return (
    <Box
      sx={{
        width: 320,
        height: '100vh',
        position: 'fixed',
        right: 0,
        top: 0,
        backgroundColor: '#FFFFFF',
        display: 'flex',
        flexDirection: 'column',
        pt: 6,
        px: 3,
        zIndex: 1000,
        overflowY: 'auto',
      }}
    >
      {/* Current User Logged In Summary */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar src={user?.avatar} sx={{ width: 44, height: 44, border: '1px solid #EAEAEA' }} />
          <Box>
            <Typography sx={{ fontWeight: 600, fontSize: '0.95rem', color: '#1A1A1A' }}>
              {user?.fullName}
            </Typography>
          </Box>
        </Box>
        <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: '#0984E3', cursor: 'pointer' }}>
          Switch
        </Typography>
      </Box>

    </Box>
  );
};

export default WebRightSidebar;
