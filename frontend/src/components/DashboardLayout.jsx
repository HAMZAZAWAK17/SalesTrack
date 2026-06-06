import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Sidebar from './Sidebar';
import { Box, Drawer, IconButton, Typography, Tooltip } from '@mui/material';

// Icons
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import StorefrontIcon from '@mui/icons-material/Storefront';
import MapIcon from '@mui/icons-material/Map';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import LogoutIcon from '@mui/icons-material/Logout';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import AddLocationIcon from '@mui/icons-material/AddLocation';

export default function DashboardLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logoutUser, theme, toggleTheme } = useAuth();
  
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = () => {
    logoutUser();
    navigate('/login');
  };

  // Mobile menu items mapping
  const getNavItems = () => {
    const role = user?.role;
    const baseItems = [
      { text: 'Tableau de bord', icon: <DashboardIcon />, path: '/dashboard' }
    ];

    if (role === 'ADMIN') {
      return [
        ...baseItems,
        { text: 'Utilisateurs', icon: <PeopleIcon />, path: '/users' },
        { text: 'Clients', icon: <StorefrontIcon />, path: '/clients' },
        { text: 'Visites', icon: <MapIcon />, path: '/visits' },
        { text: 'Commandes', icon: <ShoppingCartIcon />, path: '/orders' }
      ];
    } else if (role === 'MANAGER') {
      return [
        ...baseItems,
        { text: 'Clients Équipe', icon: <StorefrontIcon />, path: '/clients' },
        { text: 'Visites Équipe', icon: <MapIcon />, path: '/visits' },
        { text: 'Commandes Équipe', icon: <ShoppingCartIcon />, path: '/orders' }
      ];
    } else if (role === 'COMMERCIAL') {
      return [
        ...baseItems,
        { text: 'Mes Clients', icon: <StorefrontIcon />, path: '/clients' },
        { text: 'Mes Visites', icon: <MapIcon />, path: '/visits' },
        { text: 'Mes Commandes', icon: <ShoppingCartIcon />, path: '/orders' }
      ];
    }
    return baseItems;
  };

  const navItems = getNavItems();

  return (
    <Box className={`min-h-screen flex w-full transition-colors duration-300 ${
      theme === 'dark' ? 'bg-slate-950 text-slate-100 grid-pattern' : 'bg-slate-50 text-slate-800 grid-pattern-light'
    }`}>
      {/* 1. Desktop Sidebar */}
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />

      {/* 2. Main Content Frame */}
      <Box className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* Mobile Header Bar */}
        <header className={`md:hidden h-16 flex items-center justify-between px-4 border-b shrink-0 z-30 ${
          theme === 'dark' ? 'glass-panel border-slate-900 bg-slate-950/90' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <div className="flex items-center gap-3">
            <IconButton
              onClick={handleDrawerToggle}
              className={`p-2 rounded-xl border ${
                theme === 'dark' ? 'border-slate-800 text-slate-200' : 'border-slate-200 text-slate-700'
              }`}
            >
              <MenuIcon />
            </IconButton>
            <div className="flex items-center gap-2">
              <Box className="w-8 h-8 bg-gradient-to-tr from-indigo-600 to-purple-500 rounded-lg flex items-center justify-center text-white font-black">
                S
              </Box>
              <Typography className="font-extrabold text-sm tracking-tight bg-gradient-to-r from-indigo-500 to-indigo-400 bg-clip-text text-transparent">
                SalesTrack
              </Typography>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <IconButton onClick={toggleTheme} className={theme === 'dark' ? 'text-yellow-400' : 'text-slate-500'}>
              {theme === 'dark' ? <LightModeIcon fontSize="small" /> : <DarkModeIcon fontSize="small" />}
            </IconButton>
            
            {user && (
              <Box className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 text-white font-bold flex items-center justify-center text-xs">
                {user.firstName[0].toUpperCase()}{user.lastName[0].toUpperCase()}
              </Box>
            )}
          </div>
        </header>

        {/* 3. Scrolling Content Workspace */}
        <main className="flex-grow overflow-y-auto w-full relative">
          {children}
        </main>

        {/* Commercial quick floating button or bottom actions on mobile */}
        {user?.role === 'COMMERCIAL' && (
          <Box className="md:hidden fixed bottom-6 right-6 z-40">
            <button
              onClick={() => navigate('/visits/create')}
              className="w-14 h-14 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-full flex items-center justify-center text-white shadow-xl shadow-indigo-600/30 border border-indigo-400/20 active:scale-95 transition-premium cursor-pointer"
            >
              <AddLocationIcon />
            </button>
          </Box>
        )}
      </Box>

      {/* 4. Mobile Drawer Navigation */}
      <Drawer
        anchor="left"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }} // Better mobile performance
        PaperProps={{
          className: `w-72 flex flex-col h-full border-r ${
            theme === 'dark' ? 'bg-slate-950 text-slate-100 border-slate-900' : 'bg-white text-slate-800 border-slate-200'
          }`,
        }}
      >
        <Box className="p-4 flex items-center justify-between border-b border-slate-800/10">
          <div className="flex items-center gap-2">
            <Box className="w-8 h-8 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center text-white font-black">
              S
            </Box>
            <Typography className="font-extrabold text-sm tracking-tight text-indigo-400">
              SalesTrack Mobile
            </Typography>
          </div>
          <IconButton onClick={handleDrawerToggle} className="text-slate-400">
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Mobile Navigation List */}
        <Box className="flex-grow py-4 px-2 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            return (
              <button
                key={item.text}
                onClick={() => {
                  navigate(item.path);
                  setMobileOpen(false);
                }}
                className={`w-full min-h-[48px] px-4 rounded-xl text-sm font-bold flex items-center gap-4 transition-premium cursor-pointer ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-lg'
                    : theme === 'dark'
                    ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {item.icon}
                <span>{item.text}</span>
              </button>
            );
          })}
        </Box>

        {/* Mobile Navigation Footer */}
        {user && (
          <Box className="p-4 border-t border-slate-800/10 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 text-white font-bold flex items-center justify-center text-sm">
                {user.firstName[0].toUpperCase()}{user.lastName[0].toUpperCase()}
              </div>
              <div className="overflow-hidden">
                <Typography className="text-sm font-bold truncate">
                  {user.firstName} {user.lastName}
                </Typography>
                <Typography className="text-[10px] font-black uppercase text-indigo-400 tracking-wider">
                  {user.role}
                </Typography>
              </div>
            </div>

            <button
              onClick={() => {
                handleLogout();
                setMobileOpen(false);
              }}
              className="w-full min-h-[48px] px-4 border border-red-500/30 hover:bg-red-500/10 text-red-400 rounded-xl text-sm font-bold flex items-center gap-4 transition-premium cursor-pointer"
            >
              <LogoutIcon />
              <span>Déconnexion</span>
            </button>
          </Box>
        )}
      </Drawer>
    </Box>
  );
}
