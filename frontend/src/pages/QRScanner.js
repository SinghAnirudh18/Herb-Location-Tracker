import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  QrCode, 
  Camera, 
  Upload, 
  X, 
  CheckCircle, 
  AlertCircle,
  Leaf,
  Search,
  Zap,
  Shield,
  ArrowRight,
  Scan,
  FileImage
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const QRScanner = () => {
  const navigate = useNavigate();
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [manualInput, setManualInput] = useState('');
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // Mock QR scanning function (in production, use a proper QR library)
  const simulateQRScan = (data) => {
    // Simulate different types of QR codes
    const mockResults = {
      'ASH-2024-001': {
        batchId: 'ASH-2024-001',
        herbName: 'Ashwagandha',
        farmer: 'Rajesh Kumar',
        location: 'Kerala, India',
        collectionDate: '2024-01-15',
        status: 'verified',
        blockchain: {
          txHash: '0x1234...abcd',
          blockNumber: 19234567,
          verified: true
        }
      },
      'TUR-2024-045': {
        batchId: 'TUR-2024-045',
        herbName: 'Turmeric',
        farmer: 'Priya Sharma',
        location: 'Tamil Nadu, India',
        collectionDate: '2024-01-20',
        status: 'processing',
        blockchain: {
          txHash: '0x5678...efgh',
          blockNumber: 19234890,
          verified: true
        }
      },
      'NEE-2024-089': {
        batchId: 'NEE-2024-089',
        herbName: 'Neem',
        farmer: 'Amit Patel',
        location: 'Gujarat, India',
        collectionDate: '2024-01-25',
        status: 'quality_testing',
        blockchain: {
          txHash: '0x9abc...ijkl',
          blockNumber: 19235123,
          verified: false
        }
      }
    };

    return mockResults[data] || null;
  };

  const handleScan = async (data) => {
    if (!data) return;
    
    setLoading(true);
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const result = simulateQRScan(data);
      if (result) {
        setScanResult(result);
        toast.success('QR Code scanned successfully! 🎉');
      } else {
        toast.error('Invalid QR code or batch not found');
      }
    } catch (error) {
      console.error('Scan error:', error);
      toast.error('Failed to scan QR code');
    } finally {
      setLoading(false);
      setIsScanning(false);
    }
  };

  const handleManualSearch = async () => {
    if (!manualInput.trim()) {
      toast.error('Please enter a batch ID');
      return;
    }
    
    await handleScan(manualInput.trim());
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // In production, use a QR code reader library to decode from image
      toast('Image QR scanning coming soon! 📸', {
        icon: 'ℹ️',
        duration: 3000,
      });
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsScanning(true);
      }
    } catch (error) {
      console.error('Camera access error:', error);
      toast.error('Camera access denied or not available');
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsScanning(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'verified':
        return 'text-green-600 bg-green-100';
      case 'processing':
        return 'text-blue-600 bg-blue-100';
      case 'quality_testing':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'verified':
        return <CheckCircle className="w-4 h-4" />;
      case 'processing':
        return <Zap className="w-4 h-4" />;
      case 'quality_testing':
        return <Shield className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                <QrCode className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">QR Scanner</h1>
                <p className="text-sm text-gray-600">Verify herb authenticity instantly</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!scanResult ? (
          <div className="space-y-8">
            {/* Scanner Options */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid md:grid-cols-3 gap-6"
            >
              {/* Camera Scan */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={startCamera}
                className="card text-center p-8 hover:shadow-xl transition-all duration-300"
              >
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Camera className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Camera Scan</h3>
                <p className="text-gray-600">Use your camera to scan QR codes</p>
              </motion.button>

              {/* File Upload */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => fileInputRef.current?.click()}
                className="card text-center p-8 hover:shadow-xl transition-all duration-300"
              >
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <FileImage className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Upload Image</h3>
                <p className="text-gray-600">Upload a QR code image</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </motion.button>

              {/* Manual Entry */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="card p-8"
              >
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Manual Entry</h3>
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Enter Batch ID (e.g., ASH-2024-001)"
                    value={manualInput}
                    onChange={(e) => setManualInput(e.target.value)}
                    className="input-field"
                    onKeyPress={(e) => e.key === 'Enter' && handleManualSearch()}
                  />
                  <button
                    onClick={handleManualSearch}
                    disabled={loading}
                    className="btn-primary w-full"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Searching...
                      </div>
                    ) : (
                      'Search'
                    )}
                  </button>
                </div>
              </motion.div>
            </motion.div>

            {/* Demo Batch IDs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="card"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Try Demo Batch IDs:</h3>
              <div className="grid md:grid-cols-3 gap-4">
                {['ASH-2024-001', 'TUR-2024-045', 'NEE-2024-089'].map((batchId) => (
                  <button
                    key={batchId}
                    onClick={() => handleScan(batchId)}
                    disabled={loading}
                    className="p-3 bg-gray-50 hover:bg-gray-100 rounded-lg text-left transition-colors"
                  >
                    <div className="font-mono text-sm text-gray-900">{batchId}</div>
                    <div className="text-xs text-gray-500 mt-1">Click to test</div>
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        ) : (
          /* Scan Results */
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6"
          >
            {/* Result Header */}
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                    <Leaf className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{scanResult.herbName}</h2>
                    <p className="text-gray-600">Batch ID: {scanResult.batchId}</p>
                  </div>
                </div>
                <button
                  onClick={() => setScanResult(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Batch Information</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Farmer:</span>
                      <span className="font-medium">{scanResult.farmer}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Location:</span>
                      <span className="font-medium">{scanResult.location}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Collection Date:</span>
                      <span className="font-medium">{scanResult.collectionDate}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Status:</span>
                      <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(scanResult.status)}`}>
                        {getStatusIcon(scanResult.status)}
                        <span className="capitalize">{scanResult.status.replace('_', ' ')}</span>
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Blockchain Verification</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Verified:</span>
                      <span className={`inline-flex items-center space-x-1 ${scanResult.blockchain.verified ? 'text-green-600' : 'text-yellow-600'}`}>
                        {scanResult.blockchain.verified ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                        <span>{scanResult.blockchain.verified ? 'Yes' : 'Pending'}</span>
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Block:</span>
                      <span className="font-mono text-sm">{scanResult.blockchain.blockNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tx Hash:</span>
                      <span className="font-mono text-sm">{scanResult.blockchain.txHash}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex space-x-4">
                <button
                  onClick={() => navigate(`/trace/${scanResult.batchId}`)}
                  className="btn-primary flex items-center"
                >
                  View Full Traceability
                  <ArrowRight className="w-4 h-4 ml-2" />
                </button>
                <button
                  onClick={() => setScanResult(null)}
                  className="btn-outline"
                >
                  Scan Another
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Camera Modal */}
        <AnimatePresence>
          {isScanning && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-2xl p-6 max-w-md w-full"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Scan QR Code</h3>
                  <button
                    onClick={stopCamera}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="relative">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="w-full h-64 bg-gray-900 rounded-xl object-cover"
                  />
                  <canvas ref={canvasRef} className="hidden" />
                  
                  {/* Scanning Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-48 h-48 border-4 border-white rounded-2xl relative">
                      <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary-500 rounded-tl-lg"></div>
                      <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary-500 rounded-tr-lg"></div>
                      <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary-500 rounded-bl-lg"></div>
                      <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary-500 rounded-br-lg"></div>
                      
                      {/* Scanning Line Animation */}
                      <motion.div
                        animate={{ y: [0, 192, 0] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        className="absolute left-0 w-full h-1 bg-primary-500 shadow-lg"
                      />
                    </div>
                  </div>
                </div>

                <p className="text-center text-gray-600 mt-4">
                  Position the QR code within the frame
                </p>

                {/* Manual trigger for demo */}
                <div className="mt-4 space-y-2">
                  <p className="text-xs text-gray-500 text-center">Demo: Click to simulate scan</p>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleScan('ASH-2024-001')}
                      className="flex-1 px-3 py-2 bg-green-100 text-green-700 rounded-lg text-sm hover:bg-green-200 transition-colors"
                    >
                      Ashwagandha
                    </button>
                    <button
                      onClick={() => handleScan('TUR-2024-045')}
                      className="flex-1 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm hover:bg-blue-200 transition-colors"
                    >
                      Turmeric
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading Overlay */}
        <AnimatePresence>
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 flex items-center justify-center"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-2xl p-8 text-center"
              >
                <div className="w-16 h-16 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Scan className="w-8 h-8 text-white animate-pulse" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Processing QR Code</h3>
                <p className="text-gray-600">Verifying on blockchain...</p>
                <div className="mt-4 flex justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-500"></div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default QRScanner;
