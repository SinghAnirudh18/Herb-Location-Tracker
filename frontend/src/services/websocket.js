import { toast } from 'react-hot-toast';

class WebSocketService {
  constructor() {
    this.socket = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectInterval = 5000;
    this.listeners = new Map();
    this.isConnected = false;
  }

  connect(token) {
    const wsUrl = process.env.REACT_APP_WS_URL || 'ws://localhost:5000';
    
    try {
      this.socket = new WebSocket(`${wsUrl}?token=${token}`);
      
      this.socket.onopen = () => {
        console.log('WebSocket connected');
        this.isConnected = true;
        this.reconnectAttempts = 0;
        this.emit('connected');
        
        // Send authentication
        this.send('authenticate', { token });
      };

      this.socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleMessage(data);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      this.socket.onclose = (event) => {
        console.log('WebSocket disconnected:', event.code, event.reason);
        this.isConnected = false;
        this.emit('disconnected');
        
        if (!event.wasClean && this.reconnectAttempts < this.maxReconnectAttempts) {
          this.reconnect(token);
        }
      };

      this.socket.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.emit('error', error);
      };

    } catch (error) {
      console.error('Failed to connect to WebSocket:', error);
    }
  }

  reconnect(token) {
    this.reconnectAttempts++;
    console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
    
    setTimeout(() => {
      this.connect(token);
    }, this.reconnectInterval);
  }

  disconnect() {
    if (this.socket) {
      this.socket.close(1000, 'Client disconnect');
      this.socket = null;
      this.isConnected = false;
    }
  }

  send(type, data) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({ type, data }));
    } else {
      console.warn('WebSocket not connected, cannot send message');
    }
  }

  handleMessage(message) {
    const { type, data } = message;
    
    switch (type) {
      case 'batch_updated':
        this.emit('batchUpdated', data);
        this.showNotification('Batch Updated', `Batch ${data.batchId} has been updated`, 'info');
        break;
        
      case 'processing_started':
        this.emit('processingStarted', data);
        this.showNotification('Processing Started', `Processing started for batch ${data.batchId}`, 'info');
        break;
        
      case 'processing_completed':
        this.emit('processingCompleted', data);
        this.showNotification('Processing Completed', `Processing completed for batch ${data.batchId}`, 'success');
        break;
        
      case 'quality_test_completed':
        this.emit('qualityTestCompleted', data);
        const testResult = data.result === 'pass' ? 'passed' : 'failed';
        this.showNotification('Quality Test Completed', `Quality test ${testResult} for batch ${data.batchId}`, 
          data.result === 'pass' ? 'success' : 'error');
        break;
        
      case 'batch_verified':
        this.emit('batchVerified', data);
        this.showNotification('Batch Verified', `Batch ${data.batchId} has been verified on blockchain`, 'success');
        break;
        
      case 'compliance_alert':
        this.emit('complianceAlert', data);
        this.showNotification('Compliance Alert', data.message, 'warning');
        break;
        
      case 'new_batch_assigned':
        this.emit('newBatchAssigned', data);
        this.showNotification('New Batch Assigned', `You have been assigned batch ${data.batchId}`, 'info');
        break;
        
      case 'blockchain_sync':
        this.emit('blockchainSync', data);
        break;
        
      case 'user_notification':
        this.emit('userNotification', data);
        this.showNotification(data.title, data.message, data.type || 'info');
        break;
        
      default:
        console.log('Unknown message type:', type, data);
        this.emit(type, data);
    }
  }

  showNotification(title, message, type = 'info') {
    const options = {
      duration: 4000,
      position: 'top-right',
    };

    switch (type) {
      case 'success':
        toast.success(`${title}: ${message}`, options);
        break;
      case 'error':
        toast.error(`${title}: ${message}`, options);
        break;
      case 'warning':
        toast(`${title}: ${message}`, { ...options, icon: '⚠️' });
        break;
      default:
        toast(`${title}: ${message}`, { ...options, icon: 'ℹ️' });
    }
  }

  // Event listener management
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  off(event, callback) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('Error in WebSocket event callback:', error);
        }
      });
    }
  }

  // Specific methods for different types of updates
  subscribeToBatchUpdates(batchId, callback) {
    this.send('subscribe_batch', { batchId });
    this.on('batchUpdated', (data) => {
      if (data.batchId === batchId) {
        callback(data);
      }
    });
  }

  unsubscribeFromBatch(batchId) {
    this.send('unsubscribe_batch', { batchId });
  }

  subscribeToUserUpdates(callback) {
    this.on('userNotification', callback);
    this.on('newBatchAssigned', callback);
    this.on('complianceAlert', callback);
  }

  subscribeToProcessingUpdates(callback) {
    this.on('processingStarted', callback);
    this.on('processingCompleted', callback);
  }

  subscribeToQualityUpdates(callback) {
    this.on('qualityTestCompleted', callback);
  }

  subscribeToBlockchainUpdates(callback) {
    this.on('batchVerified', callback);
    this.on('blockchainSync', callback);
  }

  // Request real-time data
  requestBatchStatus(batchId) {
    this.send('get_batch_status', { batchId });
  }

  requestProcessingStatus() {
    this.send('get_processing_status', {});
  }

  requestQualityTestStatus() {
    this.send('get_quality_test_status', {});
  }

  // Send updates (for processors, labs, etc.)
  updateProcessingStatus(batchId, status, progress) {
    this.send('update_processing_status', {
      batchId,
      status,
      progress,
      timestamp: new Date().toISOString()
    });
  }

  updateQualityTestStatus(testId, status, results) {
    this.send('update_quality_test_status', {
      testId,
      status,
      results,
      timestamp: new Date().toISOString()
    });
  }

  // Utility methods
  getConnectionStatus() {
    return {
      connected: this.isConnected,
      readyState: this.socket ? this.socket.readyState : WebSocket.CLOSED,
      reconnectAttempts: this.reconnectAttempts
    };
  }
}

// Create singleton instance
const websocketService = new WebSocketService();

export default websocketService;
