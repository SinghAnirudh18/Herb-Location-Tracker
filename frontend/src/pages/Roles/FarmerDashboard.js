import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useBlockchain } from '../../contexts/BlockchainContext';
import { farmerAPI, handleAPIError } from '../../services/api';
import websocketService from '../../services/websocket';
import { motion } from 'framer-motion';
import {
  Plus,
  Leaf,
  MapPin,
  Calendar,
  TrendingUp,
  Package,
  CheckCircle,
  Clock,
  AlertCircle,
  Thermometer,
  Droplets,
  Sun,
  Eye,
  Download,
  Camera,
  RefreshCw
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const FarmerDashboard = () => {
  const { user } = useAuth();
  const { isConnected } = useBlockchain();
  const [collections, setCollections] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [formData, setFormData] = useState({
    herbSpecies: '',
    quantity: '',
    location: '',
    qualityGrade: '',
    harvestMethod: '',
    organicCertified: false,
    weatherConditions: '',
    soilType: '',
    notes: ''
  });

  const [stats, setStats] = useState({
    totalCollections: 0,
    thisMonth: 0,
    verified: 0,
    pending: 0,
    totalQuantity: 0,
    averageQuality: 0
  });

  const [weatherData, setWeatherData] = useState({
    temperature: null,
    humidity: null,
    condition: 'Loading...',
    forecast: 'Loading weather data...'
  });

  const loadWeatherData = useCallback(async () => {
    try {
      const location = user?.location || 'Kerala, India';
      
      // Try to fetch real weather data from a weather API
      // For now, we'll use a more realistic approach with location-based defaults
      const weatherApiKey = process.env.REACT_APP_WEATHER_API_KEY;
      
      if (weatherApiKey) {
        // If we have a weather API key, fetch real data
        const response = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(location)}&appid=${weatherApiKey}&units=metric`
        );
        
        if (response.ok) {
          const data = await response.json();
          setWeatherData({
            temperature: Math.round(data.main.temp),
            humidity: data.main.humidity,
            condition: data.weather[0].main,
            forecast: `Current conditions in ${location.split(',')[0]} are ${data.weather[0].description}`
          });
          return;
        }
      }
      
      // Fallback: Use location-based realistic defaults instead of random values
      const locationDefaults = {
        'Kerala': { temp: 28, humidity: 75, condition: 'Humid' },
        'Tamil Nadu': { temp: 32, humidity: 65, condition: 'Hot' },
        'Karnataka': { temp: 26, humidity: 70, condition: 'Moderate' },
        'default': { temp: 28, humidity: 65, condition: 'Clear' }
      };
      
      const locationKey = location.toLowerCase().includes('kerala') ? 'Kerala' :
                         location.toLowerCase().includes('tamil') ? 'Tamil Nadu' :
                         location.toLowerCase().includes('karnataka') ? 'Karnataka' : 'default';
      
      const defaults = locationDefaults[locationKey];
      
      setWeatherData({
        temperature: defaults.temp,
        humidity: defaults.humidity,
        condition: defaults.condition,
        forecast: `Typical conditions in ${location.split(',')[0]} - ${defaults.condition} with ${defaults.humidity}% humidity`
      });
      
    } catch (error) {
      console.error('Failed to load weather data:', error);
      // Fallback weather data
      setWeatherData({
        temperature: 28,
        humidity: 65,
        condition: 'Clear',
        forecast: 'Weather data unavailable - using default values'
      });
    }
  }, [user?.location]);

  const loadDashboardData = useCallback(async () => {
    setDataLoading(true);
    try {
      // Load farmer's own collections and stats
      const [collectionsData, statsData] = await Promise.all([
        farmerAPI.getMyCollections(),
        farmerAPI.getMyStats()
      ]);
      
      setCollections(collectionsData.collections || []);
      setStats(statsData || {
        totalCollections: 0,
        thisMonth: 0,
        verified: 0,
        pending: 0,
        totalQuantity: 0,
        averageQuality: 0
      });
      
      // Load weather data (you can integrate with a real weather API)
      await loadWeatherData();
      
    } catch (error) {
      handleAPIError(error, 'Failed to load dashboard data');
    } finally {
      setDataLoading(false);
    }
  }, [loadWeatherData]);

  // Real-time update handlers
  const handleBatchUpdate = useCallback((data) => {
    if (data.farmerId === user?.id) {
      setCollections(prev => 
        prev.map(collection => 
          collection.id === data.batchId 
            ? { ...collection, ...data.updates }
            : collection
        )
      );
      
      // Update stats if needed
      loadDashboardData();
    }
  }, [user?.id, loadDashboardData]);

  const handleProcessingUpdate = useCallback((data) => {
    if (data.farmerId === user?.id) {
      setCollections(prev => 
        prev.map(collection => 
          collection.id === data.batchId 
            ? { ...collection, status: 'processing' }
            : collection
        )
      );
    }
  }, [user?.id]);

  const handleQualityUpdate = useCallback((data) => {
    if (data.farmerId === user?.id) {
      setCollections(prev => 
        prev.map(collection => 
          collection.id === data.batchId 
            ? { 
                ...collection, 
                status: data.result === 'pass' ? 'verified' : 'failed',
                qualityResults: data.results
              }
            : collection
        )
      );
    }
  }, [user?.id]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  useEffect(() => {
    // Subscribe to real-time updates for farmer's collections
    websocketService.on('batchUpdated', handleBatchUpdate);
    websocketService.on('processingStarted', handleProcessingUpdate);
    websocketService.on('qualityTestCompleted', handleQualityUpdate);
    
    return () => {
      websocketService.off('batchUpdated', handleBatchUpdate);
      websocketService.off('processingStarted', handleProcessingUpdate);
      websocketService.off('qualityTestCompleted', handleQualityUpdate);
    };
  }, [handleBatchUpdate, handleProcessingUpdate, handleQualityUpdate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Client-side validation
      if (!formData.herbSpecies) {
        toast.error('Please select an herb species');
        setLoading(false);
        return;
      }
      if (!formData.quantity || parseFloat(formData.quantity) <= 0) {
        toast.error('Please enter a valid quantity');
        setLoading(false);
        return;
      }
      if (!formData.location) {
        toast.error('Please enter a collection location');
        setLoading(false);
        return;
      }
      if (!formData.qualityGrade) {
        toast.error('Please select a quality grade');
        setLoading(false);
        return;
      }

      // Prepare collection data - only send fields expected by backend
      const collectionData = {
        herbSpecies: formData.herbSpecies.trim(),
        quantity: parseFloat(formData.quantity),
        location: formData.location.trim(),
        qualityGrade: formData.qualityGrade,
        harvestMethod: formData.harvestMethod || 'Hand-picked',
        organicCertified: formData.organicCertified,
        weatherConditions: formData.weatherConditions || `${weatherData.temperature}°C, ${weatherData.condition}`,
        soilType: formData.soilType,
        notes: formData.notes
      };

      console.log('Submitting collection data:', collectionData);

      // Create collection via API (backend handles blockchain integration)
      const response = await farmerAPI.createCollection(collectionData);
      const newCollection = response.collection;

      // Show success message with detailed blockchain info
      const blockchainInfo = response.blockchain;
      if (blockchainInfo) {
        if (blockchainInfo.recorded) {
          toast.success(`🔗 Collection & Blockchain recorded! Batch ID: ${newCollection.batchId}`);
          if (blockchainInfo.transactionHash) {
            toast.success(`📋 TX: ${blockchainInfo.transactionHash.substring(0, 10)}...`);
          }
        } else if (blockchainInfo.services?.blockchain || blockchainInfo.services?.ipfs) {
          toast.success(`✅ Collection recorded! Batch ID: ${newCollection.batchId}`);
          toast('🔄 Blockchain services in development mode - data stored in database', {
            icon: 'ℹ️',
            duration: 4000,
          });
        } else {
          toast.success(`✅ Collection recorded! Batch ID: ${newCollection.batchId}`);
          toast('💡 Blockchain services not available - data stored in database only', {
            icon: 'ℹ️',
            duration: 4000,
          });
        }
      } else {
        toast.success(`✅ Collection recorded! Batch ID: ${newCollection.batchId}`);
      }

      // Refresh dashboard data to get updated stats
      await loadDashboardData();
      setShowForm(false);
      setFormData({
        herbSpecies: '',
        quantity: '',
        location: '',
        qualityGrade: '',
        harvestMethod: '',
        organicCertified: false,
        weatherConditions: '',
        soilType: '',
        notes: ''
      });

      // Notify other users via WebSocket
      websocketService.send('collection_created', {
        batchId: newCollection.id,
        herbSpecies: newCollection.herbSpecies,
        farmerId: user.id,
        farmerName: user.name
      });

    } catch (error) {
      console.error('Collection creation error:', error);
      
      // Show specific validation errors
      if (error.response?.data?.errors) {
        error.response.data.errors.forEach(err => {
          toast.error(`Validation Error: ${err}`);
        });
      } else if (error.response?.data?.message) {
        toast.error(`Error: ${error.response.data.message}`);
      } else {
        handleAPIError(error, 'Failed to record collection');
      }
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'verified':
      case 'completed':
        return 'text-green-600 bg-green-100';
      case 'recorded':
        return 'text-emerald-600 bg-emerald-100';
      case 'processing':
        return 'text-blue-600 bg-blue-100';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'rejected':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'verified':
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'recorded':
        return <Package className="w-4 h-4" />;
      case 'processing':
        return <Clock className="w-4 h-4" />;
      case 'pending':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const herbOptions = [
    'Ashwagandha',
    'Turmeric',
    'Neem',
    'Brahmi',
    'Tulsi',
    'Amla',
    'Ginger',
    'Cardamom',
    'Black Pepper',
    'Cinnamon'
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Farmer Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user?.name}! Track your herb collections and harvests.</p>
          {dataLoading && (
            <p className="text-sm text-blue-600 flex items-center mt-1">
              <RefreshCw className="w-4 h-4 mr-1 animate-spin" />
              Loading your data...
            </p>
          )}
        </div>
        
        <div className="flex items-center space-x-3">
          {/* Blockchain Status Indicator */}
          <div className="flex items-center space-x-2">
            {isConnected ? (
              <div className="flex items-center space-x-1 px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Blockchain Connected</span>
              </div>
            ) : (
              <div className="flex items-center space-x-1 px-2 py-1 rounded-full bg-yellow-100 text-yellow-700 text-xs">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span>Blockchain Offline</span>
              </div>
            )}
          </div>
          
          <button
            onClick={loadDashboardData}
            disabled={dataLoading}
            className="btn-outline flex items-center"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${dataLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="btn-primary flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Collection
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Total Collections</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalCollections}</p>
              <div className="flex items-center mt-2">
                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-sm font-medium text-green-600">
                  {stats.trends?.batches > 0 ? `+${stats.trends.batches}%` : 
                   stats.trends?.batches < 0 ? `${stats.trends.batches}%` : '0%'}
                </span>
                <span className="text-sm text-gray-500 ml-1">vs last month</span>
              </div>
            </div>
            <div className="p-3 rounded-xl bg-green-100">
              <Leaf className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">This Month</p>
              <p className="text-2xl font-bold text-gray-900">{stats.thisMonth}</p>
              <div className="flex items-center mt-2">
                <Calendar className="w-4 h-4 text-blue-500 mr-1" />
                <span className="text-sm text-gray-500">Collections</span>
              </div>
            </div>
            <div className="p-3 rounded-xl bg-blue-100">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Total Quantity</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalQuantity} kg</p>
              <div className="flex items-center mt-2">
                <Package className="w-4 h-4 text-purple-500 mr-1" />
                <span className="text-sm text-gray-500">Harvested</span>
              </div>
            </div>
            <div className="p-3 rounded-xl bg-purple-100">
              <Package className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Quality Score</p>
              <p className="text-2xl font-bold text-gray-900">{stats.averageQuality}%</p>
              <div className="flex items-center mt-2">
                <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-sm text-gray-500">Average</span>
              </div>
            </div>
            <div className="p-3 rounded-xl bg-orange-100">
              <CheckCircle className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </motion.div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Collections */}
        <div className="lg:col-span-2">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="card"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Recent Collections</h3>
              <button className="text-sm text-primary-600 hover:text-primary-700">
                View All
              </button>
            </div>
            
            <div className="space-y-4">
              {collections.map((collection, index) => (
                <motion.div
                  key={collection.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center text-white font-medium">
                      {collection.herbSpecies.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{collection.herbSpecies}</h4>
                      <p className="text-sm font-mono text-blue-600 bg-blue-50 px-2 py-1 rounded text-xs mb-1">
                        ID: {collection.batchId}
                      </p>
                      <p className="text-sm text-gray-600">
                        {collection.quantity} kg • {collection.location}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(collection.collectionDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="flex flex-col space-y-1">
                      <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(collection.status)}`}>
                        {getStatusIcon(collection.status)}
                        <span className="capitalize">{collection.status}</span>
                      </span>
                      {collection.blockchainRecorded && (
                        <span className="inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium text-green-600 bg-green-100">
                          <CheckCircle className="w-3 h-3" />
                          <span>Blockchain</span>
                        </span>
                      )}
                      {collection.ipfsHash && (
                        <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${
                          collection.ipfsHash.includes('mock') || collection.ipfsHash.includes('error') 
                            ? 'text-orange-600 bg-orange-100' 
                            : 'text-blue-600 bg-blue-100'
                        }`}>
                          <Package className="w-3 h-3" />
                          <span>{collection.ipfsHash.includes('mock') ? 'IPFS (Mock)' : 'IPFS'}</span>
                        </span>
                      )}
                    </div>
                    <button 
                      className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Weather & Quick Actions */}
        <div className="space-y-6">
          {/* Weather Widget */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="card"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Weather Conditions</h3>
            
            <div className="text-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <Sun className="w-8 h-8 text-white" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{weatherData.temperature}°C</p>
              <p className="text-gray-600">{weatherData.condition}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <Droplets className="w-5 h-5 text-blue-500 mx-auto mb-1" />
                <p className="text-sm font-medium text-blue-700">{weatherData.humidity}%</p>
                <p className="text-xs text-blue-600">Humidity</p>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <Thermometer className="w-5 h-5 text-green-500 mx-auto mb-1" />
                <p className="text-sm font-medium text-green-700">Ideal</p>
                <p className="text-xs text-green-600">Conditions</p>
              </div>
            </div>
            
            <div className="p-3 bg-yellow-50 rounded-lg">
              <p className="text-sm text-yellow-800 font-medium mb-1">Harvest Forecast</p>
              <p className="text-xs text-yellow-700">{weatherData.forecast}</p>
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            className="card"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            
            <div className="space-y-3">
              <button
                onClick={() => setShowForm(true)}
                className="w-full flex items-center space-x-3 p-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
              >
                <Plus className="w-5 h-5 text-green-600" />
                <span className="font-medium text-green-700">Record Collection</span>
              </button>
              
              <button className="w-full flex items-center space-x-3 p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                <Camera className="w-5 h-5 text-blue-600" />
                <span className="font-medium text-blue-700">Photo Documentation</span>
              </button>
              
              <button className="w-full flex items-center space-x-3 p-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors">
                <MapPin className="w-5 h-5 text-purple-600" />
                <span className="font-medium text-purple-700">Field Mapping</span>
              </button>
              
              <button className="w-full flex items-center space-x-3 p-3 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors">
                <Download className="w-5 h-5 text-orange-600" />
                <span className="font-medium text-orange-700">Export Records</span>
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Collection Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Record New Collection</h3>
              <button
                onClick={() => setShowForm(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Herb Species *
                  </label>
                  <select
                    value={formData.herbSpecies}
                    onChange={(e) => setFormData({ ...formData, herbSpecies: e.target.value })}
                    className="input-field"
                    required
                  >
                    <option value="">Select herb species</option>
                    {herbOptions.map((herb) => (
                      <option key={herb} value={herb}>{herb}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantity (kg) *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    className="input-field"
                    placeholder="Enter quantity (e.g., 5.5)"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Collection Location *
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="input-field"
                    placeholder="e.g., Field A-1, Kottayam"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quality Grade *
                  </label>
                  <select
                    value={formData.qualityGrade}
                    onChange={(e) => setFormData({ ...formData, qualityGrade: e.target.value })}
                    className="input-field"
                    required
                  >
                    <option value="">Select quality grade</option>
                    <option value="Premium">Premium</option>
                    <option value="Standard">Standard</option>
                    <option value="Basic">Basic</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Harvest Method
                  </label>
                  <select
                    value={formData.harvestMethod}
                    onChange={(e) => setFormData({ ...formData, harvestMethod: e.target.value })}
                    className="input-field"
                  >
                    <option value="">Select harvest method</option>
                    <option value="Hand-picked">Hand-picked</option>
                    <option value="Machine">Machine</option>
                    <option value="Traditional">Traditional</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Soil Type
                  </label>
                  <input
                    type="text"
                    value={formData.soilType}
                    onChange={(e) => setFormData({ ...formData, soilType: e.target.value })}
                    className="input-field"
                    placeholder="e.g., Red laterite, Alluvial"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Weather Conditions
                </label>
                <input
                  type="text"
                  value={formData.weatherConditions}
                  onChange={(e) => setFormData({ ...formData, weatherConditions: e.target.value })}
                  className="input-field"
                  placeholder="e.g., Sunny, 28°C, Low humidity"
                />
              </div>

              <div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.organicCertified}
                    onChange={(e) => setFormData({ ...formData, organicCertified: e.target.checked })}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Organic Certified</span>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="input-field"
                  rows={3}
                  placeholder="Any additional information about the collection..."
                />
              </div>

              <div className="flex justify-end space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="btn-outline"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary"
                >
                  {loading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Recording...
                    </div>
                  ) : (
                    'Record Collection'
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default FarmerDashboard;
