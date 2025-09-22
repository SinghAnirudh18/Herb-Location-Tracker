import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard,
  Layers,
  BarChart2,
  Settings,
  QrCode,
  Leaf,
  FlaskConical,
  Package,
  Users,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  User
} from 'lucide-react';

const Sidebar = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  // Navigation items based on user role
  const getNavigationItems = () => {
    const baseItems = [
      { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
      { name: 'Traceability', path: '/traceability', icon: Layers },
      { name: 'Analytics', path: '/analytics', icon: BarChart2 },
      { name: 'QR Scanner', path: '/scan', icon: QrCode },
    ];

    const roleSpecificItems = {
      farmer: [
        { name: 'My Collections', path: '/farmer', icon: Leaf },
      ],
      processor: [
        { name: 'Processing', path: '/processor', icon: Package },
      ],
      lab: [
        { name: 'Lab Tests', path: '/lab', icon: FlaskConical },
      ],
      consumer: [
        { name: 'Verify Products', path: '/consumer', icon: ShieldCheck },
      ],
      regulator: [
        { name: 'Compliance', path: '/regulator', icon: Users },
      ]
    };

    const userRoleItems = roleSpecificItems[user?.role] || [];
    
    return [
      ...baseItems,
      ...userRoleItems,
      { name: 'Profile', path: '/profile', icon: User },
      { name: 'Settings', path: '/settings', icon: Settings },
    ];
  };

  const navigationItems = getNavigationItems();

  const isActive = (path) => location.pathname === path;

  return (
    <motion.div
      initial={{ width: collapsed ? 80 : 256 }}
      animate={{ width: collapsed ? 80 : 256 }}
      transition={{ duration: 0.3 }}
      className="bg-white dark:bg-gray-800 shadow-lg h-screen flex flex-col border-r border-gray-200 dark:border-gray-700"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        {!collapsed && (
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold gradient-text">HerbTrace</span>
          </Link>
        )}
        
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          {collapsed ? (
            <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          ) : (
            <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`
                flex items-center space-x-3 px-3 py-2.5 rounded-xl transition-all duration-200
                ${active 
                  ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg' 
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }
                ${collapsed ? 'justify-center' : ''}
              `}
              title={collapsed ? item.name : ''}
            >
              <Icon className={`w-5 h-5 ${active ? 'text-white' : 'text-gray-500 dark:text-gray-400'}`} />
              {!collapsed && (
                <span className="font-medium">{item.name}</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Info */}
      {!collapsed && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white font-medium">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {user?.name || 'User'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate capitalize">
                {user?.role || 'user'}
              </p>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default Sidebar;
