import { Paper, Box } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { ROUTES } from '../../config/constants';

// Icons
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import PlayCircleOutlineRoundedIcon from '@mui/icons-material/PlayCircleOutlineRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import NoteAltOutlinedIcon from '@mui/icons-material/NoteAltOutlined';
import PersonOutlineRoundedIcon from '@mui/icons-material/PersonOutlineRounded';

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const currentPath = location.pathname;

  return (
    <Paper
      elevation={0}
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        width: '100vw',
        paddingBottom: 'env(safe-area-inset-bottom)',
        zIndex: 1000,
        backgroundColor: 'transparent',
        borderTop: '1px solid #E0E0E0',
        borderRadius: '35px 35px 0 0',
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 3, pt: 1, pb: 2, backgroundColor: '#FFFFFF' }}>
        
        {/* Home */}
        <Box 
          onClick={() => navigate(ROUTES.FEED)}
          sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', flex: 1 }}
        >
          <HomeOutlinedIcon sx={{ color: currentPath === ROUTES.FEED ? '#000' : '#A0A0A0', fontSize: 28 }} />
        </Box>

        {/* Reels */}
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', flex: 1 }}>
          <PlayCircleOutlineRoundedIcon sx={{ color: '#A0A0A0', fontSize: 28 }} />
        </Box>

        {/* Create (Mockup Central Pink Button) */}
        <Box 
          onClick={() => navigate(ROUTES.CREATE_POST)}
          sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', flex: 1, mt: -4 }}
        >
          <Box
            sx={{
              width: 65,
              height: 65,
              borderRadius: '50%',
              backgroundColor: '#FA587D', 
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 24px rgba(250, 88, 125, 0.4)',
              transition: 'transform 0.2s',
              '&:active': { transform: 'scale(0.92)' }
            }}
          >
            <AddRoundedIcon sx={{ color: '#FFF', fontSize: 36 }} />
          </Box>
        </Box>

        {/* Notifications */}
        <Box 
          onClick={() => navigate(ROUTES.NOTIFICATIONS)}
          sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', flex: 1 }}
        >
          <NoteAltOutlinedIcon sx={{ color: currentPath === ROUTES.NOTIFICATIONS ? '#000' : '#A0A0A0', fontSize: 28 }} />
        </Box>

        {/* Profile */}
        <Box 
          onClick={() => navigate(ROUTES.PROFILE)}
          sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', flex: 1 }}
        >
           <PersonOutlineRoundedIcon sx={{ color: currentPath === ROUTES.PROFILE ? '#000' : '#A0A0A0', fontSize: 28 }} />
        </Box>

      </Box>
    </Paper>
  );
};

export default BottomNav;
