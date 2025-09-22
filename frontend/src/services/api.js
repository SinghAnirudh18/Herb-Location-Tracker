import axios from 'axios';
import { toast } from 'react-hot-toast';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Authentication API
export const authAPI = {
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  getProfile: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  updateProfile: async (profileData) => {
    const response = await api.put('/auth/profile', profileData);
    return response.data;
  },

  changePassword: async (currentPassword, newPassword) => {
    const response = await api.put('/auth/change-password', {
      currentPassword,
      newPassword,
    });
    return response.data;
  },
};

// Farmer API
export const farmerAPI = {
  // Get farmer's own collections only
  getMyCollections: async () => {
    const response = await api.get('/farmers/my-collections');
    return response.data;
  },

  // Create new collection
  createCollection: async (collectionData) => {
    const response = await api.post('/farmers/collections', collectionData);
    return response.data;
  },

  // Update collection
  updateCollection: async (collectionId, updateData) => {
    const response = await api.put(`/farmers/collections/${collectionId}`, updateData);
    return response.data;
  },

  // Get farmer's statistics
  getMyStats: async () => {
    const response = await api.get('/farmers/my-stats');
    return response.data;
  },

  // Upload collection images
  uploadCollectionImages: async (collectionId, images) => {
    const formData = new FormData();
    images.forEach((image) => {
      formData.append(`images`, image);
    });
    
    const response = await api.post(`/farmers/collections/${collectionId}/images`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};

// Processor API
export const processorAPI = {
  // Get batches assigned to this processor
  getAssignedBatches: async () => {
    const response = await api.get('/processors/assigned-batches');
    return response.data;
  },

  // Start processing a batch
  startProcessing: async (batchId, processingData = {}) => {
    const response = await api.post(`/processors/batches/${batchId}/start`, processingData);
    return response.data;
  },

  // Record a processing step
  recordProcessingStep: async (processingData) => {
    const response = await api.post('/processors/processing-steps', processingData);
    return response.data;
  },

  // Record grinding step
  recordGrindingStep: async (grindingData) => {
    const response = await api.post('/processors/grinding-steps', grindingData);
    return response.data;
  },

  // Complete processing
  completeProcessing: async (batchId, completionData = {}) => {
    const response = await api.post(`/processors/batches/${batchId}/complete`, completionData);
    return response.data;
  },

  // Get processor statistics
  getMyStats: async () => {
    const response = await api.get('/processors/my-stats');
    return response.data;
  },

  // Get processing history
  getProcessingHistory: async () => {
    const response = await api.get('/processors/processing-history');
    return response.data;
  },

  // Lookup batch by batch ID
  lookupBatch: async (batchId) => {
    const response = await api.get(`/processors/batches/${batchId}`);
    return response.data;
  },
};

// Lab API
export const labAPI = {
  // Get batches assigned for testing
  getAssignedBatches: async () => {
    const response = await api.get('/labs/assigned-batches');
    return response.data;
  },

  // Get available batches for testing
  getAvailableBatches: async () => {
    const response = await api.get('/labs/available-batches');
    return response.data;
  },

  // Create quality test
  createQualityTest: async (batchId, testData) => {
    const response = await api.post(`/labs/batches/${batchId}/quality-test`, testData);
    return response.data;
  },

  // Update test results
  updateTestResults: async (testId, results) => {
    const response = await api.put(`/labs/tests/${testId}/results`, results);
    return response.data;
  },

  // Get lab statistics
  getMyStats: async () => {
    const response = await api.get('/labs/my-stats');
    return response.data;
  },

  // Get active tests
  getActiveTests: async () => {
    const response = await api.get('/labs/active-tests');
    return response.data;
  },

  // Generate certificate
  generateCertificate: async (testId) => {
    const response = await api.post(`/labs/tests/${testId}/certificate`);
    return response.data;
  },
};

// Lab API
export const consumerAPI = {
  // Verify product by QR code or batch ID
  verifyProduct: async (identifier) => {
    const response = await api.get(`/consumers/verify/${identifier}`);
    return response.data;
  },

  // Get public batch information
  getBatchInfo: async (batchId) => {
    const response = await api.get(`/consumers/batch/${batchId}`);
    return response.data;
  },

  // Report issue with product
  reportIssue: async (batchId, issueData) => {
    const response = await api.post(`/consumers/batch/${batchId}/report-issue`, issueData);
    return response.data;
  },
};

// Blockchain API
export const blockchainAPI = {
  // Record collection on blockchain
  recordCollection: async (collectionData) => {
    const response = await api.post('/blockchain/record-collection', collectionData);
    return response.data;
  },

  // Get blockchain status
  getStatus: async () => {
    const response = await api.get('/blockchain/status');
    return response.data;
  },

  // Get transaction details
  getTransaction: async (txHash) => {
    const response = await api.get(`/blockchain/transaction/${txHash}`);
    return response.data;
  },

  // Get batch verification status
  verifyBatch: async (batchId) => {
    const response = await api.get(`/blockchain/verify/${batchId}`);
    return response.data;
  },

  // Get batch history from blockchain
  getBatchHistory: async (batchId) => {
    const response = await api.get(`/blockchain/batch-history/${batchId}`);
    return response.data;
  },

  // Get collection event from blockchain
  getCollection: async (batchId) => {
    const response = await api.get(`/blockchain/collection/${batchId}`);
    return response.data;
  },

  // Upload file to IPFS
  uploadToIPFS: async (data, fileName) => {
    const response = await api.post('/blockchain/ipfs/upload', { data, fileName });
    return response.data;
  },

  // Get file from IPFS
  getFromIPFS: async (hash) => {
    const response = await api.get(`/blockchain/ipfs/file/${hash}`);
    return response.data;
  },

  // Record processing step on blockchain
  recordProcessing: async (processingData) => {
    const response = await api.post('/blockchain/processing/record', processingData);
    return response.data;
  },

  // Get processing step from blockchain
  getProcessingStep: async (batchId) => {
    const response = await api.get(`/blockchain/processing/${batchId}`);
    return response.data;
  },

  // Get processing chain for a batch
  getProcessingChain: async (batchId) => {
    const response = await api.get(`/blockchain/processing/chain/${batchId}`);
    return response.data;
  },

  // Search for batch by batchId
  searchBatch: async (batchId) => {
    const response = await api.get(`/blockchain/search-batch/${batchId}`);
    return response.data;
  },
};

// Verification API
export const verificationAPI = {
  // Get batch traceability
  getBatchTraceability: async (batchId) => {
    const response = await api.get(`/verification/batch/${batchId}/traceability`);
    return response.data;
  },

  // Verify batch compliance
  verifyCompliance: async (batchId) => {
    const response = await api.get(`/verification/batch/${batchId}/compliance`);
    return response.data;
  },

  // Get verification history
  getVerificationHistory: async (batchId) => {
    const response = await api.get(`/verification/batch/${batchId}/history`);
    return response.data;
  },
};

// Analytics API
export const analyticsAPI = {
  // Get dashboard analytics based on user role
  getDashboardAnalytics: async (timeRange = '7d') => {
    const response = await api.get(`/analytics/dashboard?timeRange=${timeRange}`);
    return response.data;
  },

  // Get batch trends
  getBatchTrends: async (timeRange = '30d') => {
    const response = await api.get(`/analytics/batch-trends?timeRange=${timeRange}`);
    return response.data;
  },

  // Get quality metrics
  getQualityMetrics: async (timeRange = '30d') => {
    const response = await api.get(`/analytics/quality-metrics?timeRange=${timeRange}`);
    return response.data;
  },

  // Get regional performance
  getRegionalPerformance: async () => {
    const response = await api.get('/analytics/regional-performance');
    return response.data;
  },

  // Get user-specific analytics
  getMyAnalytics: async (timeRange = '30d') => {
    const response = await api.get(`/analytics/my-analytics?timeRange=${timeRange}`);
    return response.data;
  },
};

// Notification API
export const notificationAPI = {
  // Get user notifications
  getNotifications: async (limit = 20) => {
    const response = await api.get(`/notifications?limit=${limit}`);
    return response.data;
  },

  // Mark notification as read
  markAsRead: async (notificationId) => {
    const response = await api.put(`/notifications/${notificationId}/read`);
    return response.data;
  },

  // Mark all notifications as read
  markAllAsRead: async () => {
    const response = await api.put('/notifications/mark-all-read');
    return response.data;
  },

  // Get notification settings
  getSettings: async () => {
    const response = await api.get('/notifications/settings');
    return response.data;
  },

  // Update notification settings
  updateSettings: async (settings) => {
    const response = await api.put('/notifications/settings', settings);
    return response.data;
  },
};

// Health check
export const healthAPI = {
  check: async () => {
    const response = await api.get('/health');
    return response.data;
  },
};

// Error handler utility
export const handleAPIError = (error, customMessage) => {
  console.error('API Error:', error);
  
  let message = customMessage || 'An error occurred';
  
  if (error.response?.data?.message) {
    message = error.response.data.message;
  } else if (error.message) {
    message = error.message;
  }
  
  toast.error(message);
  return { success: false, error: message };
};

// Success handler utility
export const handleAPISuccess = (data, successMessage) => {
  if (successMessage) {
    toast.success(successMessage);
  }
  return { success: true, data };
};

export default api;
