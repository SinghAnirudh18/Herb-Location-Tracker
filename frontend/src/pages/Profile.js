import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useBlockchain } from '../contexts/BlockchainContext';
import { motion } from 'framer-motion';
import {
  User,
  Mail,
  MapPin,
  Building,
  Calendar,
  Edit,
  Save,
  X,
  Shield,
  Award,
  Activity,
  Wallet,
  Copy,
  ExternalLink
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const { account, isConnected, connectWallet } = useBlockchain();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    organization: user?.organization || '',
    location: user?.location || '',
    bio: user?.bio || ''
  });

  const handleSave = async () => {
    setLoading(true);
    try {
      const result = await updateProfile(formData);
      if (result.success) {
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Profile update error:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const getRoleBadgeColor = (role) => {
    const colors = {
      farmer: 'bg-green-100 text-green-800',
      processor: 'bg-blue-100 text-blue-800',
      lab: 'bg-purple-100 text-purple-800',
      manufacturer: 'bg-orange-100 text-orange-800',
      consumer: 'bg-indigo-100 text-indigo-800',
      regulator: 'bg-gray-100 text-gray-800'
    };
    return colors[role] || 'bg-gray-100 text-gray-800';
  };

  const stats = [
    { label: 'Batches Created', value: '47', icon: Activity },
    { label: 'Verifications', value: '156', icon: Shield },
    { label: 'Quality Score', value: '94%', icon: Award },
    { label: 'Days Active', value: '89', icon: Calendar }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Profile Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card"
      >
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="w-20 h-20 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{user?.name || 'User'}</h1>
              <p className="text-gray-600">{user?.email}</p>
              <div className="flex items-center space-x-2 mt-2">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getRoleBadgeColor(user?.role)}`}>
                  {user?.role || 'user'}
                </span>
                <span className="text-sm text-gray-500">•</span>
                <span className="text-sm text-gray-500">Member since {new Date(user?.createdAt || Date.now()).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
          
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="btn-outline flex items-center"
          >
            {isEditing ? <X className="w-4 h-4 mr-2" /> : <Edit className="w-4 h-4 mr-2" />}
            {isEditing ? 'Cancel' : 'Edit Profile'}
          </button>
        </div>

        {/* Profile Form */}
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
            {isEditing ? (
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="input-field"
              />
            ) : (
              <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                <User className="w-4 h-4 text-gray-400" />
                <span>{user?.name || 'Not provided'}</span>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
            {isEditing ? (
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="input-field"
              />
            ) : (
              <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                <Mail className="w-4 h-4 text-gray-400" />
                <span>{user?.email || 'Not provided'}</span>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Organization</label>
            {isEditing ? (
              <input
                type="text"
                value={formData.organization}
                onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                className="input-field"
                placeholder="Your organization"
              />
            ) : (
              <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                <Building className="w-4 h-4 text-gray-400" />
                <span>{user?.organization || 'Not provided'}</span>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
            {isEditing ? (
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="input-field"
                placeholder="City, State, Country"
              />
            ) : (
              <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                <MapPin className="w-4 h-4 text-gray-400" />
                <span>{user?.location || 'Not provided'}</span>
              </div>
            )}
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
            {isEditing ? (
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                className="input-field"
                rows={3}
                placeholder="Tell us about yourself..."
              />
            ) : (
              <div className="p-3 bg-gray-50 rounded-lg">
                <span>{user?.bio || 'No bio provided'}</span>
              </div>
            )}
          </div>
        </div>

        {isEditing && (
          <div className="flex justify-end space-x-4 mt-6 pt-6 border-t">
            <button
              onClick={() => setIsEditing(false)}
              className="btn-outline"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={loading}
              className="btn-primary flex items-center"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Save Changes
            </button>
          </div>
        )}
      </motion.div>

      {/* Blockchain Wallet */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="card"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Blockchain Wallet</h3>
        
        {isConnected ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                  <Wallet className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-medium text-green-900">Wallet Connected</p>
                  <p className="text-sm text-green-700">Sepolia Testnet</p>
                </div>
              </div>
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">Address:</span>
              <div className="flex items-center space-x-2">
                <span className="font-mono text-sm">{`${account.slice(0, 6)}...${account.slice(-4)}`}</span>
                <button
                  onClick={() => copyToClipboard(account)}
                  className="p-1 hover:bg-gray-200 rounded"
                >
                  <Copy className="w-4 h-4 text-gray-400" />
                </button>
                <a
                  href={`https://sepolia.etherscan.io/address/${account}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1 hover:bg-gray-200 rounded"
                >
                  <ExternalLink className="w-4 h-4 text-gray-400" />
                </a>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-6">
            <Wallet className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h4 className="font-medium text-gray-900 mb-2">No Wallet Connected</h4>
            <p className="text-gray-600 mb-4">Connect your MetaMask wallet to interact with blockchain features</p>
            <button
              onClick={connectWallet}
              className="btn-primary"
            >
              Connect Wallet
            </button>
          </div>
        )}
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="card"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Activity Overview</h3>
        
        <div className="grid md:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-sm text-gray-600">{stat.label}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="card"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Recent Activity</h3>
        
        <div className="space-y-4">
          {[
            { action: 'Created batch ASH-2024-001', time: '2 hours ago', type: 'creation' },
            { action: 'Verified quality test for TUR-2024-045', time: '1 day ago', type: 'verification' },
            { action: 'Updated processing data for NEE-2024-089', time: '2 days ago', type: 'update' },
            { action: 'Completed compliance check', time: '3 days ago', type: 'compliance' }
          ].map((activity, index) => (
            <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className={`w-2 h-2 rounded-full ${
                activity.type === 'creation' ? 'bg-green-500' :
                activity.type === 'verification' ? 'bg-blue-500' :
                activity.type === 'update' ? 'bg-yellow-500' :
                'bg-purple-500'
              }`}></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                <p className="text-xs text-gray-500">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default Profile;
