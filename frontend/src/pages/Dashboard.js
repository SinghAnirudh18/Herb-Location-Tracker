import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useBlockchain } from '../contexts/BlockchainContext';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  Package,
  ShieldCheck,
  Users,
  Activity,
  AlertCircle,
  CheckCircle,
  Clock,
  Leaf,
  BarChart3,
  QrCode,
  Globe
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const { isConnected, blockchainStatus, connectWallet } = useBlockchain();
  const [stats, setStats] = useState({
    totalBatches: 0,
    verifiedBatches: 0,
    pendingTests: 0,
    activeUsers: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading dashboard data
    const loadDashboardData = async () => {
      try {
        // This would be actual API calls in production
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setStats({
          totalBatches: 1247,
          verifiedBatches: 1089,
          pendingTests: 23,
          activeUsers: 156
        });

        setRecentActivity([
          {
            id: 1,
            type: 'collection',
            message: 'New batch collected: Ashwagandha #ASH-2024-001',
            time: '2 minutes ago',
            status: 'success'
          },
          {
            id: 2,
            type: 'verification',
            message: 'Batch verified: Turmeric #TUR-2024-045',
            time: '15 minutes ago',
            status: 'success'
          },
          {
            id: 3,
            type: 'processing',
            message: 'Processing started: Brahmi #BRA-2024-012',
            time: '1 hour ago',
            status: 'pending'
          },
          {
            id: 4,
            type: 'quality',
            message: 'Quality test completed: Neem #NEE-2024-089',
            time: '2 hours ago',
            status: 'success'
          }
        ]);
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const getRoleSpecificStats = () => {
    switch (user?.role) {
      case 'farmer':
        return [
          { label: 'Collections This Month', value: '47', icon: Leaf, color: 'text-green-600' },
          { label: 'Verified Batches', value: '42', icon: CheckCircle, color: 'text-blue-600' },
          { label: 'Pending Verification', value: '5', icon: Clock, color: 'text-yellow-600' },
          { label: 'Quality Score', value: '94%', icon: ShieldCheck, color: 'text-purple-600' }
        ];
      case 'processor':
        return [
          { label: 'Processed Batches', value: '89', icon: Package, color: 'text-blue-600' },
          { label: 'In Processing', value: '12', icon: Activity, color: 'text-orange-600' },
          { label: 'Completed', value: '77', icon: CheckCircle, color: 'text-green-600' },
          { label: 'Efficiency Rate', value: '96%', icon: TrendingUp, color: 'text-purple-600' }
        ];
      case 'lab':
        return [
          { label: 'Tests Conducted', value: '234', icon: ShieldCheck, color: 'text-blue-600' },
          { label: 'Pending Tests', value: '8', icon: Clock, color: 'text-yellow-600' },
          { label: 'Pass Rate', value: '92%', icon: CheckCircle, color: 'text-green-600' },
          { label: 'Avg. Test Time', value: '2.4h', icon: Activity, color: 'text-purple-600' }
        ];
      default:
        return [
          { label: 'Total Batches', value: stats.totalBatches.toString(), icon: Package, color: 'text-blue-600' },
          { label: 'Verified', value: stats.verifiedBatches.toString(), icon: CheckCircle, color: 'text-green-600' },
          { label: 'Pending Tests', value: stats.pendingTests.toString(), icon: Clock, color: 'text-yellow-600' },
          { label: 'Active Users', value: stats.activeUsers.toString(), icon: Users, color: 'text-purple-600' }
        ];
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Activity className="w-4 h-4 text-blue-500" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl p-6 text-white"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">
              {getGreeting()}, {user?.name || 'User'}! 🌿
            </h1>
            <p className="text-primary-100">
              Welcome to your HerbTrace dashboard. Track, verify, and manage your herb traceability.
            </p>
          </div>
          <div className="hidden md:block">
            <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center">
              <Leaf className="w-10 h-10 text-white" />
            </div>
          </div>
        </div>

        {/* Blockchain Status */}
        <div className="mt-4 flex items-center space-x-4">
          <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm ${
            isConnected ? 'bg-green-500/20 text-green-100' : 'bg-red-500/20 text-red-100'
          }`}>
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'} animate-pulse`}></div>
            <span>{isConnected ? 'Blockchain Connected' : 'Blockchain Disconnected'}</span>
          </div>
          
          {!isConnected && (
            <button
              onClick={connectWallet}
              className="px-4 py-1 bg-white/20 hover:bg-white/30 rounded-full text-sm transition-colors"
            >
              Connect Wallet
            </button>
          )}
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {getRoleSpecificStats().map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="card"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-xl bg-gray-50 ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="card"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
            <Activity className="w-5 h-5 text-gray-400" />
          </div>
          
          <div className="space-y-3">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                {getStatusIcon(activity.status)}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{activity.message}</p>
                  <p className="text-xs text-gray-500">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
          
          <button className="w-full mt-4 text-sm text-primary-600 hover:text-primary-700 font-medium">
            View All Activity
          </button>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="card"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
            <Globe className="w-5 h-5 text-gray-400" />
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <button className="flex flex-col items-center p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl hover:from-green-100 hover:to-emerald-100 transition-colors">
              <QrCode className="w-8 h-8 text-green-600 mb-2" />
              <span className="text-sm font-medium text-green-700">Scan QR</span>
            </button>
            
            <button className="flex flex-col items-center p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl hover:from-blue-100 hover:to-cyan-100 transition-colors">
              <Package className="w-8 h-8 text-blue-600 mb-2" />
              <span className="text-sm font-medium text-blue-700">New Batch</span>
            </button>
            
            <button className="flex flex-col items-center p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl hover:from-purple-100 hover:to-pink-100 transition-colors">
              <BarChart3 className="w-8 h-8 text-purple-600 mb-2" />
              <span className="text-sm font-medium text-purple-700">Analytics</span>
            </button>
            
            <button className="flex flex-col items-center p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl hover:from-orange-100 hover:to-red-100 transition-colors">
              <ShieldCheck className="w-8 h-8 text-orange-600 mb-2" />
              <span className="text-sm font-medium text-orange-700">Verify</span>
            </button>
          </div>
        </motion.div>
      </div>

      {/* System Status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="card"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">System Status</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="text-sm font-medium text-green-700">API Services</span>
            </div>
            <span className="text-xs text-green-600">Online</span>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center space-x-2">
              <Activity className="w-5 h-5 text-blue-500" />
              <span className="text-sm font-medium text-blue-700">Database</span>
            </div>
            <span className="text-xs text-blue-600">Connected</span>
          </div>
          
          <div className={`flex items-center justify-between p-3 rounded-lg ${
            blockchainStatus.connected ? 'bg-green-50' : 'bg-yellow-50'
          }`}>
            <div className="flex items-center space-x-2">
              <Globe className={`w-5 h-5 ${blockchainStatus.connected ? 'text-green-500' : 'text-yellow-500'}`} />
              <span className={`text-sm font-medium ${blockchainStatus.connected ? 'text-green-700' : 'text-yellow-700'}`}>
                Blockchain
              </span>
            </div>
            <span className={`text-xs ${blockchainStatus.connected ? 'text-green-600' : 'text-yellow-600'}`}>
              {blockchainStatus.connected ? 'Connected' : 'Syncing'}
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard;
