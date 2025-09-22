import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useBlockchain } from '../../contexts/BlockchainContext';
import { 
  Menu, 
  X, 
  Bell, 
  Search, 
  User, 
  LogOut,
  ChevronDown,
  Settings,
  HelpCircle,
  MessageSquare,
  Moon,
  Sun
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';

const Navbar = ({ toggleSidebar }) => {
  const { user, logout } = useAuth();
  const { account, isConnected, connectWallet, disconnectWallet } = useBlockchain();
  const [isOpen, setIsOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const location = useLocation();

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
    localStorage.setItem('darkMode', !darkMode);
  };

  useEffect(() => {
    // Check for dark mode preference
    if (localStorage.getItem('darkMode') === 'true' || 
        (!localStorage.getItem('darkMode') && 
         window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      if (isConnected) {
        disconnectWallet();
      }
      toast.success('Successfully logged out');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to log out');
    }
  };

  const navigation = [
    { name: 'Dashboard', path: '/dashboard', icon: 'grid' },
    { name: 'Traceability', path: '/traceability', icon: 'layers' },
    { name: 'Analytics', path: '/analytics', icon: 'bar-chart-2' },
    { name: 'Profile', path: '/profile', icon: 'user' },
  ];

  const userNavigation = [
    { name: 'Your Profile', path: '/profile', icon: User },
    { name: 'Settings', path: '/settings', icon: Settings },
    { name: 'Help & Support', path: '/help', icon: HelpCircle },
    { name: 'Feedback', path: '/feedback', icon: MessageSquare },
  ];

  const getPageTitle = () => {
    const currentNav = navigation.find(nav => nav.path === location.pathname);
    return currentNav ? currentNav.name : 'HerbTrace';
  };

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm z-10">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <button
              onClick={toggleSidebar}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-500 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
            >
              <span className="sr-only">Open sidebar</span>
              <Menu className="h-6 w-6" />
            </button>
            <h1 className="ml-4 text-xl font-semibold text-gray-900 dark:text-white">
              {getPageTitle()}
            </h1>
          </div>

          <div className="flex items-center">
            {/* Search Bar */}
            <div className="hidden md:flex items-center relative mx-4">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent sm:text-sm"
              />
            </div>

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-full text-gray-500 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <span className="sr-only">Toggle dark mode</span>
              {darkMode ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </button>

            {/* Notifications */}
            <button className="ml-2 p-2 rounded-full text-gray-500 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
              <span className="sr-only">View notifications</span>
              <div className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
              </div>
            </button>

            {/* Wallet Connection */}
            {!isConnected ? (
              <button
                onClick={connectWallet}
                className="ml-2 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-full shadow-sm text-white bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Connect Wallet
              </button>
            ) : (
              <div className="ml-2 flex items-center space-x-2">
                <div className="hidden md:flex items-center px-3 py-1.5 rounded-full bg-green-100 text-green-800 text-xs font-medium">
                  <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                  {`${account.slice(0, 6)}...${account.slice(-4)}`}
                </div>
              </div>
            )}

            {/* Profile dropdown */}
            <div className="ml-4 relative">
              <div>
                <button
                  onClick={() => setIsOpen(!isOpen)}
                  className="flex items-center max-w-xs rounded-full bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  id="user-menu"
                  aria-expanded="false"
                  aria-haspopup="true"
                >
                  <span className="sr-only">Open user menu</span>
                  <div className="h-8 w-8 rounded-full bg-gradient-to-r from-primary-500 to-primary-600 flex items-center justify-center text-white font-medium">
                    {user?.name?.charAt(0) || 'U'}
                  </div>
                  <ChevronDown className="ml-1 h-4 w-4 text-gray-500" />
                </button>
              </div>

              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 focus:outline-none z-50"
                    role="menu"
                    aria-orientation="vertical"
                    aria-labelledby="user-menu"
                  >
                    <div className="py-1" role="none">
                      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                        <p className="text-sm text-gray-900 dark:text-white font-medium">
                          {user?.name || 'User'}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {user?.email || 'user@example.com'}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Role: <span className="capitalize">{user?.role || 'user'}</span>
                        </p>
                      </div>
                      
                      {userNavigation.map((item) => (
                        <Link
                          key={item.name}
                          to={item.path}
                          className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                          role="menuitem"
                          onClick={() => setIsOpen(false)}
                        >
                          <item.icon className="mr-3 h-5 w-5 text-gray-400" />
                          {item.name}
                        </Link>
                      ))}
                      
                      <button
                        onClick={handleLogout}
                        className="w-full text-left flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                        role="menuitem"
                      >
                        <LogOut className="mr-3 h-5 w-5 text-red-400" />
                        Sign out
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
