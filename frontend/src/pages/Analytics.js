import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
  Users,
  Package,
  Shield,
  Globe,
  Calendar,
  Filter,
  Download,
  RefreshCw
} from 'lucide-react';

const Analytics = () => {
  const [timeRange, setTimeRange] = useState('7d');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({});

  useEffect(() => {
    loadAnalyticsData();
  }, [timeRange]);

  const loadAnalyticsData = async () => {
    setLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const mockData = {
      overview: {
        totalBatches: 1247,
        verifiedBatches: 1089,
        activeUsers: 156,
        complianceRate: 94.2,
        trends: {
          batches: 12.5,
          verified: 8.3,
          users: 15.7,
          compliance: 2.1
        }
      },
      batchTrends: [
        { date: '2024-01-01', batches: 45, verified: 42 },
        { date: '2024-01-02', batches: 52, verified: 48 },
        { date: '2024-01-03', batches: 38, verified: 36 },
        { date: '2024-01-04', batches: 61, verified: 58 },
        { date: '2024-01-05', batches: 49, verified: 47 },
        { date: '2024-01-06', batches: 55, verified: 52 },
        { date: '2024-01-07', batches: 43, verified: 41 }
      ],
      herbDistribution: [
        { name: 'Ashwagandha', value: 285, color: '#22c55e' },
        { name: 'Turmeric', value: 234, color: '#f59e0b' },
        { name: 'Neem', value: 189, color: '#3b82f6' },
        { name: 'Brahmi', value: 156, color: '#8b5cf6' },
        { name: 'Tulsi', value: 143, color: '#ef4444' },
        { name: 'Others', value: 240, color: '#6b7280' }
      ],
      qualityMetrics: [
        { month: 'Jan', purity: 94, potency: 92, safety: 96 },
        { month: 'Feb', purity: 95, potency: 93, safety: 97 },
        { month: 'Mar', purity: 93, potency: 91, safety: 95 },
        { month: 'Apr', purity: 96, potency: 94, safety: 98 },
        { month: 'May', purity: 97, potency: 95, safety: 97 },
        { month: 'Jun', purity: 95, potency: 93, safety: 96 }
      ],
      regionData: [
        { region: 'Kerala', batches: 342, verified: 325 },
        { region: 'Tamil Nadu', batches: 298, verified: 284 },
        { region: 'Karnataka', batches: 245, verified: 232 },
        { region: 'Gujarat', batches: 189, verified: 178 },
        { region: 'Maharashtra', batches: 173, verified: 165 }
      ]
    };
    
    setData(mockData);
    setLoading(false);
  };

  const StatCard = ({ title, value, change, icon: Icon, color = 'blue' }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          <div className="flex items-center mt-2">
            {change > 0 ? (
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
            )}
            <span className={`text-sm font-medium ${change > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {Math.abs(change)}%
            </span>
            <span className="text-sm text-gray-500 ml-1">vs last period</span>
          </div>
        </div>
        <div className={`p-3 rounded-xl bg-${color}-100`}>
          <Icon className={`w-6 h-6 text-${color}-600`} />
        </div>
      </div>
    </motion.div>
  );

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600">Comprehensive insights into herb traceability</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="input-field"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
          
          <button
            onClick={loadAnalyticsData}
            className="btn-outline flex items-center"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </button>
          
          <button className="btn-primary flex items-center">
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Batches"
          value={data.overview?.totalBatches?.toLocaleString()}
          change={data.overview?.trends?.batches}
          icon={Package}
          color="blue"
        />
        <StatCard
          title="Verified Batches"
          value={data.overview?.verifiedBatches?.toLocaleString()}
          change={data.overview?.trends?.verified}
          icon={Shield}
          color="green"
        />
        <StatCard
          title="Active Users"
          value={data.overview?.activeUsers?.toLocaleString()}
          change={data.overview?.trends?.users}
          icon={Users}
          color="purple"
        />
        <StatCard
          title="Compliance Rate"
          value={`${data.overview?.complianceRate}%`}
          change={data.overview?.trends?.compliance}
          icon={Activity}
          color="orange"
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Batch Trends */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="card"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Batch Trends</h3>
            <BarChart3 className="w-5 h-5 text-gray-400" />
          </div>
          
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data.batchTrends}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                stroke="#6b7280"
              />
              <YAxis stroke="#6b7280" />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="batches"
                stackId="1"
                stroke="#3b82f6"
                fill="#3b82f6"
                fillOpacity={0.3}
                name="Total Batches"
              />
              <Area
                type="monotone"
                dataKey="verified"
                stackId="2"
                stroke="#22c55e"
                fill="#22c55e"
                fillOpacity={0.3}
                name="Verified Batches"
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Herb Distribution */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="card"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Herb Distribution</h3>
            <PieChartIcon className="w-5 h-5 text-gray-400" />
          </div>
          
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data.herbDistribution}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {data.herbDistribution?.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          
          <div className="grid grid-cols-2 gap-2 mt-4">
            {data.herbDistribution?.map((item, index) => (
              <div key={index} className="flex items-center space-x-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: item.color }}
                ></div>
                <span className="text-sm text-gray-600">{item.name}</span>
                <span className="text-sm font-medium text-gray-900">{item.value}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Quality Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Quality Metrics</h3>
            <Activity className="w-5 h-5 text-gray-400" />
          </div>
          
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.qualityMetrics}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" stroke="#6b7280" />
              <YAxis domain={[85, 100]} stroke="#6b7280" />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="purity"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                name="Purity %"
              />
              <Line
                type="monotone"
                dataKey="potency"
                stroke="#22c55e"
                strokeWidth={2}
                dot={{ fill: '#22c55e', strokeWidth: 2, r: 4 }}
                name="Potency %"
              />
              <Line
                type="monotone"
                dataKey="safety"
                stroke="#f59e0b"
                strokeWidth={2}
                dot={{ fill: '#f59e0b', strokeWidth: 2, r: 4 }}
                name="Safety %"
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Regional Performance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Regional Performance</h3>
            <Globe className="w-5 h-5 text-gray-400" />
          </div>
          
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.regionData} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis type="number" stroke="#6b7280" />
              <YAxis dataKey="region" type="category" stroke="#6b7280" width={80} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="batches" fill="#e5e7eb" name="Total Batches" />
              <Bar dataKey="verified" fill="#22c55e" name="Verified Batches" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Detailed Metrics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="card"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Key Performance Indicators</h3>
        
        <div className="grid md:grid-cols-3 gap-6">
          <div className="text-center p-6 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl">
            <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-3">
              <Package className="w-6 h-6 text-white" />
            </div>
            <h4 className="font-semibold text-gray-900 mb-1">Processing Efficiency</h4>
            <p className="text-2xl font-bold text-blue-600">96.2%</p>
            <p className="text-sm text-gray-600">Average processing time: 2.4 days</p>
          </div>
          
          <div className="text-center p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl">
            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <h4 className="font-semibold text-gray-900 mb-1">Quality Pass Rate</h4>
            <p className="text-2xl font-bold text-green-600">94.7%</p>
            <p className="text-sm text-gray-600">Tests passed on first attempt</p>
          </div>
          
          <div className="text-center p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
            <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-3">
              <Users className="w-6 h-6 text-white" />
            </div>
            <h4 className="font-semibold text-gray-900 mb-1">User Engagement</h4>
            <p className="text-2xl font-bold text-purple-600">87.3%</p>
            <p className="text-sm text-gray-600">Monthly active users</p>
          </div>
        </div>
      </motion.div>

      {/* Recent Activity Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="card"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-6">System Health</h3>
        
        <div className="grid md:grid-cols-4 gap-4">
          <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
            <div>
              <p className="text-sm font-medium text-green-700">API Response</p>
              <p className="text-lg font-bold text-green-900">98.7%</p>
            </div>
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
            <div>
              <p className="text-sm font-medium text-blue-700">Blockchain Sync</p>
              <p className="text-lg font-bold text-blue-900">100%</p>
            </div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
            <div>
              <p className="text-sm font-medium text-yellow-700">IPFS Storage</p>
              <p className="text-lg font-bold text-yellow-900">89.2%</p>
            </div>
            <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
            <div>
              <p className="text-sm font-medium text-purple-700">Database</p>
              <p className="text-lg font-bold text-purple-900">99.9%</p>
            </div>
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Analytics;
