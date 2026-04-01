import React from 'react';
import { Box, Typography } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { ROUTES } from '../../config/constants';
import NotificationMenu from '../../components/common/NotificationMenu';

// Icons
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import PlayCircleOutlineRoundedIcon from '@mui/icons-material/PlayCircleOutlineRounded';
import AddCircleOutlineRoundedIcon from '@mui/icons-material/AddCircleOutlineRounded';
import NotificationsNoneRoundedIcon from '@mui/icons-material/NotificationsNoneRounded';
import PersonOutlineRoundedIcon from '@mui/icons-material/PersonOutlineRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import notificationService from '../../services/notificationService';

const WebSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Notification menu state
  const [notifAnchorEl, setNotifAnchorEl] = React.useState(null);
  const isNotifOpen = Boolean(notifAnchorEl);
  const [unreadCount, setUnreadCount] = React.useState(0);

  React.useEffect(() => {
    const fetchCount = async () => {
      try {
        const res = await notificationService.getNotifications();
        setUnreadCount(res.unreadCount || 0);
      } catch (err) {
        console.error('Failed to fetch unread count', err);
      }
    };
    fetchCount();
  }, []);

  const handleNotifClick = (e) => setNotifAnchorEl(e.currentTarget);
  const handleNotifClose = () => {
    setNotifAnchorEl(null);
    setUnreadCount(0);
  };

  const navItems = [
    { label: 'Home', path: ROUTES.FEED, ActiveIcon: HomeRoundedIcon, InactiveIcon: HomeOutlinedIcon },
    { label: 'Reels', path: '#', ActiveIcon: PlayCircleOutlineRoundedIcon, InactiveIcon: PlayCircleOutlineRoundedIcon },
    { label: 'Create', path: ROUTES.CREATE_POST, ActiveIcon: AddCircleOutlineRoundedIcon, InactiveIcon: AddCircleOutlineRoundedIcon },
    { label: 'Notifications', path: '#', ActiveIcon: NotificationsNoneRoundedIcon, InactiveIcon: NotificationsNoneRoundedIcon },
    { label: 'Profile', path: ROUTES.PROFILE, ActiveIcon: PersonRoundedIcon, InactiveIcon: PersonOutlineRoundedIcon },
  ];

  return (
    <Box
      sx={{
        width: 250,
        height: '100vh',
        position: 'fixed',
        left: 0,
        top: 0,
        borderRight: '1px solid #EAEAEA',
        backgroundColor: '#FFFFFF',
        display: 'flex',
        flexDirection: 'column',
        py: 4,
        px: 2,
        zIndex: 1000,
      }}
    >
      {/* Logo */}
      <Box sx={{ mb: 6, px: 2 }}>
        <Box
          component="img"
          src="/app-logo/header-logo.png"
          alt="SocialX"
          sx={{
            height: 32,
            width: 'auto',
            objectFit: 'contain',
            display: 'block',
            cursor: 'pointer',
          }}
          onClick={() => navigate(ROUTES.FEED)}
        />
      </Box>

      {/* Nav Items */}
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = isActive ? item.ActiveIcon : item.InactiveIcon;

          return (
            <Box
              key={item.label}
              onClick={(e) => {
                if (item.label === 'Notifications') {
                  handleNotifClick(e);
                  return;
                }
                if (item.path !== '#') navigate(item.path);
              }}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                px: 2,
                py: 1.5,
                borderRadius: '12px',
                cursor: 'pointer',
                transition: 'background-color 0.2s',
                backgroundColor: isActive ? '#F5F5F5' : 'transparent',
                '&:hover': {
                  backgroundColor: '#F5F5F5',
                  '& .MuiTypography-root': {
                    transform: 'scale(1.02)',
                  }
                },
              }}
            >
              <Box sx={{ position: 'relative', display: 'flex' }}>
                <Icon sx={{ fontSize: 28, color: isActive || (item.label === 'Notifications' && isNotifOpen) ? '#1A1A1A' : '#4A4A4A' }} />
                {item.label === 'Notifications' && unreadCount > 0 && (
                  <Box sx={{ 
                    position: 'absolute', top: -4, right: -4, 
                    minWidth: 18, height: 18, p: '0 4px',
                    bgcolor: '#FA587D', borderRadius: '50%', color: '#FFF',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.65rem', fontWeight: 700, border: '2px solid #FFF'
                  }}>
                    {unreadCount}
                  </Box>
                )}
              </Box>
              <Typography
                sx={{
                  fontSize: '1.05rem',
                  fontWeight: isActive || (item.label === 'Notifications' && isNotifOpen) ? 700 : 400,
                  color: isActive || (item.label === 'Notifications' && isNotifOpen) ? '#1A1A1A' : '#4A4A4A',
                  transition: 'transform 0.2s'
                }}
              >
                {item.label}
              </Typography>
            </Box>
          );
        })}

        <NotificationMenu 
          anchorEl={notifAnchorEl} 
          open={isNotifOpen} 
          onClose={handleNotifClose} 
          onMarkRead={() => setUnreadCount(0)}
        />
      </Box>

    </Box>
  );
};

export default WebSidebar;
