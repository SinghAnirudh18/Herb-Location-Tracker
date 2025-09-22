import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useBlockchain } from '../contexts/BlockchainContext';
import { motion } from 'framer-motion';
import {
  Settings as SettingsIcon,
  Bell,
  Shield,
  Globe,
  Moon,
  Sun,
  Smartphone,
  Mail,
  Lock,
  Key,
  Database,
  Wifi,
  AlertTriangle,
  CheckCircle,
  Save,
  RefreshCw,
  Download,
  Upload,
  Trash2
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const Settings = () => {
  const { user, changePassword, logout } = useAuth();
  const { isConnected, disconnectWallet } = useBlockchain();
  
  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(localStorage.getItem('darkMode') === 'true');
  
  const [settings, setSettings] = useState({
    notifications: {
      email: true,
      push: true,
      sms: false,
      batchUpdates: true,
      qualityAlerts: true,
      complianceReminders: true
    },
    privacy: {
      profileVisibility: 'public',
      dataSharing: true,
      analyticsTracking: false,
      marketingEmails: false
    },
    blockchain: {
      autoSync: true,
      gasLimit: '3000000',
      confirmations: 3,
      network: 'sepolia'
    }
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const tabs = [
    { id: 'general', label: 'General', icon: SettingsIcon },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Privacy & Security', icon: Shield },
    { id: 'blockchain', label: 'Blockchain', icon: Globe },
    { id: 'data', label: 'Data Management', icon: Database }
  ];

  const handleSettingChange = (category, key, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    
    if (passwordForm.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const result = await changePassword(passwordForm.currentPassword, passwordForm.newPassword);
      if (result.success) {
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      }
    } catch (error) {
      console.error('Password change error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    setLoading(true);
    try {
      // Simulate API call to save settings
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Settings saved successfully!');
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('darkMode', newDarkMode);
    document.documentElement.classList.toggle('dark', newDarkMode);
    toast.success(`${newDarkMode ? 'Dark' : 'Light'} mode enabled`);
  };

  const exportData = () => {
    toast.success('Data export initiated. You will receive an email when ready.');
  };

  const deleteAccount = () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      toast.error('Account deletion is not implemented in demo mode');
    }
  };

  const renderGeneralSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Appearance</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              {darkMode ? <Moon className="w-5 h-5 text-gray-600" /> : <Sun className="w-5 h-5 text-gray-600" />}
              <div>
                <p className="font-medium text-gray-900">Dark Mode</p>
                <p className="text-sm text-gray-600">Toggle between light and dark themes</p>
              </div>
            </div>
            <button
              onClick={toggleDarkMode}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                darkMode ? 'bg-primary-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  darkMode ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Language & Region</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
            <select className="input-field">
              <option>English (US)</option>
              <option>Hindi</option>
              <option>Tamil</option>
              <option>Bengali</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
            <select className="input-field">
              <option>Asia/Kolkata (IST)</option>
              <option>UTC</option>
              <option>America/New_York</option>
              <option>Europe/London</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Notification Channels</h3>
        <div className="space-y-4">
          {[
            { key: 'email', label: 'Email Notifications', icon: Mail, description: 'Receive notifications via email' },
            { key: 'push', label: 'Push Notifications', icon: Smartphone, description: 'Browser push notifications' },
            { key: 'sms', label: 'SMS Notifications', icon: Smartphone, description: 'Text message notifications' }
          ].map((channel) => (
            <div key={channel.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <channel.icon className="w-5 h-5 text-gray-600" />
                <div>
                  <p className="font-medium text-gray-900">{channel.label}</p>
                  <p className="text-sm text-gray-600">{channel.description}</p>
                </div>
              </div>
              <button
                onClick={() => handleSettingChange('notifications', channel.key, !settings.notifications[channel.key])}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.notifications[channel.key] ? 'bg-primary-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.notifications[channel.key] ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Notification Types</h3>
        <div className="space-y-4">
          {[
            { key: 'batchUpdates', label: 'Batch Updates', description: 'When batches are updated or verified' },
            { key: 'qualityAlerts', label: 'Quality Alerts', description: 'Quality test results and alerts' },
            { key: 'complianceReminders', label: 'Compliance Reminders', description: 'Compliance deadlines and requirements' }
          ].map((type) => (
            <div key={type.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">{type.label}</p>
                <p className="text-sm text-gray-600">{type.description}</p>
              </div>
              <button
                onClick={() => handleSettingChange('notifications', type.key, !settings.notifications[type.key])}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.notifications[type.key] ? 'bg-primary-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.notifications[type.key] ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderPrivacySettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Password & Security</h3>
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
            <input
              type="password"
              value={passwordForm.currentPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
              className="input-field"
              placeholder="Enter current password"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
            <input
              type="password"
              value={passwordForm.newPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
              className="input-field"
              placeholder="Enter new password"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
            <input
              type="password"
              value={passwordForm.confirmPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
              className="input-field"
              placeholder="Confirm new password"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary flex items-center"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            ) : (
              <Lock className="w-4 h-4 mr-2" />
            )}
            Change Password
          </button>
        </form>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Privacy Controls</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Profile Visibility</label>
            <select
              value={settings.privacy.profileVisibility}
              onChange={(e) => handleSettingChange('privacy', 'profileVisibility', e.target.value)}
              className="input-field"
            >
              <option value="public">Public</option>
              <option value="network">Network Only</option>
              <option value="private">Private</option>
            </select>
          </div>
          
          {[
            { key: 'dataSharing', label: 'Data Sharing', description: 'Allow data sharing with partners' },
            { key: 'analyticsTracking', label: 'Analytics Tracking', description: 'Help improve our service with usage analytics' },
            { key: 'marketingEmails', label: 'Marketing Emails', description: 'Receive promotional emails and updates' }
          ].map((setting) => (
            <div key={setting.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">{setting.label}</p>
                <p className="text-sm text-gray-600">{setting.description}</p>
              </div>
              <button
                onClick={() => handleSettingChange('privacy', setting.key, !settings.privacy[setting.key])}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.privacy[setting.key] ? 'bg-primary-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.privacy[setting.key] ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderBlockchainSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Wallet Connection</h3>
        {isConnected ? (
          <div className="p-4 bg-green-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <div>
                  <p className="font-medium text-green-900">Wallet Connected</p>
                  <p className="text-sm text-green-700">Sepolia Testnet</p>
                </div>
              </div>
              <button
                onClick={disconnectWallet}
                className="btn-outline text-sm"
              >
                Disconnect
              </button>
            </div>
          </div>
        ) : (
          <div className="p-4 bg-yellow-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="w-5 h-5 text-yellow-500" />
              <div>
                <p className="font-medium text-yellow-900">No Wallet Connected</p>
                <p className="text-sm text-yellow-700">Connect your wallet to use blockchain features</p>
              </div>
            </div>
          </div>
        )}
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Blockchain Configuration</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Network</label>
            <select
              value={settings.blockchain.network}
              onChange={(e) => handleSettingChange('blockchain', 'network', e.target.value)}
              className="input-field"
            >
              <option value="sepolia">Sepolia Testnet</option>
              <option value="mainnet">Ethereum Mainnet</option>
              <option value="polygon">Polygon</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Gas Limit</label>
            <input
              type="number"
              value={settings.blockchain.gasLimit}
              onChange={(e) => handleSettingChange('blockchain', 'gasLimit', e.target.value)}
              className="input-field"
              placeholder="3000000"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Required Confirmations</label>
            <select
              value={settings.blockchain.confirmations}
              onChange={(e) => handleSettingChange('blockchain', 'confirmations', parseInt(e.target.value))}
              className="input-field"
            >
              <option value={1}>1 Confirmation</option>
              <option value={3}>3 Confirmations</option>
              <option value={6}>6 Confirmations</option>
              <option value={12}>12 Confirmations</option>
            </select>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">Auto-sync with Blockchain</p>
              <p className="text-sm text-gray-600">Automatically sync data with blockchain</p>
            </div>
            <button
              onClick={() => handleSettingChange('blockchain', 'autoSync', !settings.blockchain.autoSync)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.blockchain.autoSync ? 'bg-primary-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.blockchain.autoSync ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderDataManagement = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Data Export</h3>
        <div className="p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-700 mb-4">
            Export all your data including batches, transactions, and profile information.
          </p>
          <button
            onClick={exportData}
            className="btn-primary flex items-center"
          >
            <Download className="w-4 h-4 mr-2" />
            Export Data
          </button>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Data Import</h3>
        <div className="p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600 mb-4">
            Import data from other traceability systems or backup files.
          </p>
          <button className="btn-outline flex items-center">
            <Upload className="w-4 h-4 mr-2" />
            Import Data
          </button>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Danger Zone</h3>
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <h4 className="font-medium text-red-900 mb-2">Delete Account</h4>
          <p className="text-sm text-red-700 mb-4">
            Permanently delete your account and all associated data. This action cannot be undone.
          </p>
          <button
            onClick={deleteAccount}
            className="bg-red-600 hover:bg-red-700 text-white font-medium px-4 py-2 rounded-lg flex items-center transition-colors"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete Account
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600">Manage your account preferences and system configuration</p>
        </div>
        
        <button
          onClick={handleSaveSettings}
          disabled={loading}
          className="btn-primary flex items-center"
        >
          {loading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          Save Settings
        </button>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <nav className="space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center space-x-3 px-3 py-2 text-left rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-primary-100 text-primary-700 border-primary-200'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="card"
          >
            {activeTab === 'general' && renderGeneralSettings()}
            {activeTab === 'notifications' && renderNotificationSettings()}
            {activeTab === 'privacy' && renderPrivacySettings()}
            {activeTab === 'blockchain' && renderBlockchainSettings()}
            {activeTab === 'data' && renderDataManagement()}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
