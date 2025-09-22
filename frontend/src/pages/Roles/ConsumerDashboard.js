import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  QrCode,
  Search,
  Shield,
  CheckCircle,
  AlertTriangle,
  Eye,
  Download,
  Share2,
  Leaf,
  MapPin,
  Calendar,
  User,
  Package
} from 'lucide-react';
import { consumerAPI, handleAPIError } from '../../services/api';
import { toast } from 'react-hot-toast';

const ConsumerDashboard = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [verificationResult, setVerificationResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [recentScans, setRecentScans] = useState([]);

  const handleVerification = async (identifier) => {
    if (!identifier.trim()) {
      toast.error('Please enter a batch ID or QR code');
      return;
    }

    setLoading(true);
    try {
      const result = await consumerAPI.verifyProduct(identifier);
      setVerificationResult(result);
      
      // Add to recent scans
      setRecentScans(prev => [
        { id: identifier, timestamp: new Date(), result: result.verified },
        ...prev.slice(0, 4)
      ]);
      
      if (result.verified) {
        toast.success('Product verified successfully! ✅');
      } else {
        toast.warning('Product verification failed');
      }
    } catch (error) {
      handleAPIError(error, 'Failed to verify product');
      setVerificationResult(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    handleVerification(searchQuery);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Product Verification</h1>
        <p className="text-gray-600">Verify the authenticity of Ayurvedic herb products</p>
      </div>

      {/* Search Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card"
      >
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <QrCode className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Verify Product</h3>
          <p className="text-gray-600">Enter batch ID or scan QR code to verify authenticity</p>
        </div>

        <form onSubmit={handleSearch} className="space-y-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field pl-10"
              placeholder="Enter batch ID (e.g., ASH-2024-001)"
            />
          </div>
          
          <div className="flex space-x-4">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex-1"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Verifying...
                </div>
              ) : (
                <>
                  <Shield className="w-4 h-4 mr-2" />
                  Verify Product
                </>
              )}
            </button>
            
            <button
              type="button"
              onClick={() => window.location.href = '/scan'}
              className="btn-outline"
            >
              <QrCode className="w-4 h-4 mr-2" />
              Scan QR Code
            </button>
          </div>
        </form>
      </motion.div>

      {/* Verification Result */}
      {verificationResult && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="card"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              {verificationResult.verified ? (
                <CheckCircle className="w-8 h-8 text-green-500" />
              ) : (
                <AlertTriangle className="w-8 h-8 text-red-500" />
              )}
              <div>
                <h3 className="text-xl font-semibold text-gray-900">
                  {verificationResult.verified ? 'Verified Product' : 'Verification Failed'}
                </h3>
                <p className="text-gray-600">
                  {verificationResult.verified 
                    ? 'This product is authentic and traceable'
                    : 'This product could not be verified'
                  }
                </p>
              </div>
            </div>
            
            <div className="flex space-x-2">
              <button className="btn-outline text-sm">
                <Share2 className="w-4 h-4 mr-1" />
                Share
              </button>
              <button className="btn-outline text-sm">
                <Download className="w-4 h-4 mr-1" />
                Report
              </button>
            </div>
          </div>

          {verificationResult.verified && verificationResult.product && (
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Product Information</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Batch ID:</span>
                    <span className="font-medium">{verificationResult.product.batchId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Herb Species:</span>
                    <span className="font-medium">{verificationResult.product.herbSpecies}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Quality Grade:</span>
                    <span className="font-medium">{verificationResult.product.qualityGrade}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Collection Date:</span>
                    <span className="font-medium">
                      {new Date(verificationResult.product.collectionDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Traceability</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Origin:</span>
                    <span className="font-medium">{verificationResult.product.location}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Farmer:</span>
                    <span className="font-medium">{verificationResult.product.farmerName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Processing:</span>
                    <span className="font-medium">
                      {verificationResult.product.processingCompleted ? 'Completed' : 'In Progress'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Quality Tests:</span>
                    <span className="font-medium">
                      {verificationResult.product.qualityTestPassed ? 'Passed' : 'Pending'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {verificationResult.verified && (
            <div className="mt-6 pt-6 border-t">
              <button
                onClick={() => window.location.href = `/trace/${verificationResult.product.batchId}`}
                className="btn-primary"
              >
                <Eye className="w-4 h-4 mr-2" />
                View Complete Traceability
              </button>
            </div>
          )}
        </motion.div>
      )}

      {/* Recent Scans */}
      {recentScans.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Verifications</h3>
          
          <div className="space-y-3">
            {recentScans.map((scan, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  {scan.result ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-red-500" />
                  )}
                  <div>
                    <p className="font-medium text-gray-900">{scan.id}</p>
                    <p className="text-sm text-gray-600">
                      {scan.timestamp.toLocaleString()}
                    </p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  scan.result ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  {scan.result ? 'Verified' : 'Failed'}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Information Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card text-center"
        >
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Leaf className="w-6 h-6 text-green-600" />
          </div>
          <h4 className="font-semibold text-gray-900 mb-2">Authentic Herbs</h4>
          <p className="text-sm text-gray-600">
            Verify the authenticity and quality of Ayurvedic herbs from trusted sources
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card text-center"
        >
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <MapPin className="w-6 h-6 text-blue-600" />
          </div>
          <h4 className="font-semibold text-gray-900 mb-2">Full Traceability</h4>
          <p className="text-sm text-gray-600">
            Track the complete journey from farm to your hands with blockchain verification
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card text-center"
        >
          <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Shield className="w-6 h-6 text-purple-600" />
          </div>
          <h4 className="font-semibold text-gray-900 mb-2">Quality Assured</h4>
          <p className="text-sm text-gray-600">
            Every product is tested and certified by authorized laboratories
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default ConsumerDashboard;
