import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Box, Button, Tooltip, IconButton, Typography } from '@mui/material';

// Material Icons
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import StorefrontIcon from '@mui/icons-material/Storefront';
import MapIcon from '@mui/icons-material/Map';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';

export default function Sidebar({ collapsed, setCollapsed }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logoutUser, theme, toggleTheme } = useAuth();

  // Navigation definition based on roles
  const getNavItems = () => {
    const role = user?.role;
    const baseItems = [
      { text: 'Tableau de bord', icon: <DashboardIcon />, path: '/dashboard' }
    ];

    if (role === 'ADMIN') {
      return [
        ...baseItems,
        { text: 'Utilisateurs', icon: <PeopleIcon />, path: '/users' },
        { text: 'Portefeuille Clients', icon: <StorefrontIcon />, path: '/clients' },
        { text: 'Rapports Visites', icon: <MapIcon />, path: '/visits' },
        { text: 'Commandes & Devis', icon: <ShoppingCartIcon />, path: '/orders' }
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

  const handleLogout = () => {
    logoutUser();
    navigate('/login');
  };

  return (
    <Box
      className={`h-screen hidden md:flex flex-col border-r transition-all duration-300 relative print:hidden ${
        theme === 'dark'
          ? 'glass-panel border-slate-800/80 bg-slate-950/70 text-slate-100'
          : 'bg-white border-slate-200 text-slate-800 shadow-xl'
      } ${collapsed ? 'w-20' : 'w-64'}`}
      sx={{ zIndex: 100 }}
    >
      {/* Sidebar Toggle Button */}
      <IconButton
        onClick={() => setCollapsed(!collapsed)}
        className={`absolute -right-3.5 top-6 p-1 rounded-full border shadow-md hover:scale-110 transition-premium cursor-pointer ${
          theme === 'dark'
            ? 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-150'
        }`}
        size="small"
      >
        {collapsed ? <ChevronRightIcon fontSize="small" /> : <ChevronLeftIcon fontSize="small" />}
      </IconButton>

      {/* Sidebar Header Brand Logo */}
      <Box className="p-6 flex items-center gap-3 h-20 border-b border-slate-800/30 overflow-hidden">
        <Box
          className="w-10 h-10 shrink-0 bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20 cursor-pointer"
          onClick={() => navigate('/dashboard')}
        >
          <svg className="w-5 h-5 text-white animate-pulse-slow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Box>
        {!collapsed && (
          <Box className="flex flex-col select-none animate-fade-in">
            <span className="text-lg font-black tracking-tight bg-gradient-to-r from-indigo-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
              SalesTrack
            </span>
            <span className={`text-[9px] font-extrabold uppercase tracking-widest ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>
              Version 1.0
            </span>
          </Box>
        )}
      </Box>

      {/* Nav List */}
      <Box className="flex-1 py-6 px-3 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location.pathname.startsWith(item.path);
          return (
            <Tooltip
              key={item.text}
              title={collapsed ? item.text : ''}
              placement="right"
              arrow
            >
              <button
                onClick={() => navigate(item.path)}
                className={`w-full min-h-[48px] px-3.5 rounded-xl text-sm font-bold flex items-center gap-4 transition-premium cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-lg shadow-indigo-600/15'
                    : theme === 'dark'
                    ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border border-transparent'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-transparent'
                }`}
              >
                <span className={`shrink-0 flex items-center justify-center ${isActive ? 'text-white' : theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                  {item.icon}
                </span>
                {!collapsed && (
                  <span className="text-left font-sans tracking-wide leading-none">{item.text}</span>
                )}
              </button>
            </Tooltip>
          );
        })}
      </Box>

      {/* Bottom Profile & Options Panel */}
      <Box className={`p-4 border-t border-slate-800/30 space-y-3 ${collapsed ? 'items-center' : ''}`}>
        {!collapsed && user && (
          <Box 
            onClick={() => navigate('/profile')}
            className="flex items-center gap-3 p-2 rounded-xl bg-slate-900/30 border border-slate-800/10 cursor-pointer hover:bg-slate-800/20 active:scale-[0.98] transition-premium"
          >
            <Box className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 text-white font-extrabold flex items-center justify-center text-sm shadow">
              {user.firstName[0].toUpperCase()}{user.lastName[0].toUpperCase()}
            </Box>
            <Box className="overflow-hidden">
              <Typography className="text-sm font-bold truncate text-slate-200">
                {user.firstName} {user.lastName}
              </Typography>
              <Typography className="text-[10px] font-black uppercase text-indigo-400 tracking-wider">
                {user.role}
              </Typography>
            </Box>
          </Box>
        )}

        <Box className="flex flex-col gap-1.5">
          {/* Theme Switcher */}
          <Tooltip title={theme === 'dark' ? 'Mode clair' : 'Mode sombre'} placement="right" arrow={collapsed}>
            <button
              onClick={toggleTheme}
              className={`w-full min-h-[48px] px-3.5 rounded-xl text-sm font-bold flex items-center gap-4 transition-premium cursor-pointer ${
                theme === 'dark'
                  ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <span className="shrink-0 flex items-center justify-center">
                {theme === 'dark' ? <LightModeIcon className="text-yellow-400" /> : <DarkModeIcon className="text-slate-500" />}
              </span>
              {!collapsed && (
                <span className="font-sans leading-none">{theme === 'dark' ? 'Mode Clair' : 'Mode Sombre'}</span>
              )}
            </button>
          </Tooltip>

          {/* Logout button */}
          <Tooltip title="Se déconnecter" placement="right" arrow={collapsed}>
            <button
              onClick={handleLogout}
              className={`w-full min-h-[48px] px-3.5 rounded-xl text-sm font-bold flex items-center gap-4 transition-premium cursor-pointer hover:bg-red-500/15 ${
                theme === 'dark' ? 'text-red-400' : 'text-red-650'
              }`}
            >
              <span className="shrink-0 flex items-center justify-center">
                <LogoutIcon />
              </span>
              {!collapsed && <span className="font-sans leading-none">Déconnexion</span>}
            </button>
          </Tooltip>
        </Box>
      </Box>
    </Box>
  );
}
