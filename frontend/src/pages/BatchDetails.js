import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  MapPin,
  Calendar,
  User,
  Package,
  FlaskConical,
  ShoppingCart,
  CheckCircle,
  Clock,
  AlertCircle,
  ExternalLink,
  Download,
  Share2,
  QrCode,
  Leaf,
  Shield,
  Zap,
  Globe,
  Hash,
  Eye,
  Copy
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const BatchDetails = () => {
  const { batchId } = useParams();
  const navigate = useNavigate();
  const [batch, setBatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    loadBatchDetails();
  }, [batchId]);

  const loadBatchDetails = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock batch data
      const mockBatch = {
        id: batchId,
        herbSpecies: 'Ashwagandha',
        status: 'verified',
        createdAt: '2024-01-15T10:30:00Z',
        qrCode: `QR_${batchId}`,
        blockchain: {
          contractAddress: '0x742d35Cc6634C0532925a3b8D4C0b4E5C5e8b4f8',
          txHash: '0x1234567890abcdef1234567890abcdef12345678',
          blockNumber: 19234567,
          gasUsed: '234567',
          verified: true
        },
        steps: [
          {
            id: 'collection',
            title: 'Collection',
            status: 'completed',
            timestamp: '2024-01-15T10:30:00Z',
            data: {
              farmerName: 'Rajesh Kumar',
              location: 'Kottayam, Kerala, India',
              coordinates: '9.5915° N, 76.5222° E',
              quantity: '50 kg',
              qualityGrade: 'Premium',
              organicCertified: true,
              harvestMethod: 'Hand-picked',
              weatherConditions: 'Sunny, 28°C',
              soilType: 'Red laterite'
            },
            blockchain: {
              txHash: '0xabc123def456...',
              blockNumber: 19234500,
              gasUsed: '45678'
            }
          },
          {
            id: 'processing',
            title: 'Processing',
            status: 'completed',
            timestamp: '2024-01-16T14:20:00Z',
            data: {
              processorName: 'ABC Ayurvedic Processing Pvt Ltd',
              location: 'Thrissur, Kerala, India',
              processingType: 'Traditional Drying',
              temperature: '45°C',
              duration: '72 hours',
              yield: '85%',
              moistureContent: '8%',
              batchSize: '42.5 kg'
            },
            blockchain: {
              txHash: '0xdef456ghi789...',
              blockNumber: 19234520,
              gasUsed: '52341'
            }
          },
          {
            id: 'quality',
            title: 'Quality Testing',
            status: 'completed',
            timestamp: '2024-01-18T09:15:00Z',
            data: {
              labName: 'Kerala Ayurveda Quality Control Lab',
              location: 'Kochi, Kerala, India',
              testType: 'Comprehensive Analysis',
              purityLevel: '98.5%',
              potency: '2.3% Withanolides',
              contaminants: 'None detected',
              microbiology: 'Pass',
              heavyMetals: 'Within limits',
              certificateNumber: 'KAQCL-2024-0156'
            },
            blockchain: {
              txHash: '0xghi789jkl012...',
              blockNumber: 19234580,
              gasUsed: '48923'
            }
          },
          {
            id: 'product',
            title: 'Product Creation',
            status: 'completed',
            timestamp: '2024-01-20T16:45:00Z',
            data: {
              manufacturer: 'HerbCorp Ayurvedic Products',
              location: 'Bangalore, Karnataka, India',
              productName: 'Premium Ashwagandha Powder',
              packageSize: '100g, 250g, 500g',
              batchSize: '400 units',
              expiryDate: '2026-01-20',
              barcode: '8901234567890',
              distributionChannels: 'Retail, Online, Export'
            },
            blockchain: {
              txHash: '0xjkl012mno345...',
              blockNumber: 19234620,
              gasUsed: '56789'
            }
          }
        ]
      };
      
      setBatch(mockBatch);
    } catch (error) {
      console.error('Failed to load batch details:', error);
      toast.error('Failed to load batch details');
    } finally {
      setLoading(false);
    }
  };

  const getStepIcon = (stepId) => {
    const icons = {
      collection: Leaf,
      processing: Package,
      quality: FlaskConical,
      product: ShoppingCart
    };
    return icons[stepId] || Package;
  };

  const getStepColor = (stepId) => {
    const colors = {
      collection: 'from-green-500 to-emerald-600',
      processing: 'from-blue-500 to-cyan-600',
      quality: 'from-purple-500 to-pink-600',
      product: 'from-orange-500 to-red-600'
    };
    return colors[stepId] || 'from-gray-500 to-gray-600';
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'processing':
        return <Clock className="w-5 h-5 text-blue-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-400" />;
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const shareDetails = () => {
    if (navigator.share) {
      navigator.share({
        title: `Herb Batch ${batch.id}`,
        text: `Check out the traceability details for ${batch.herbSpecies} batch ${batch.id}`,
        url: window.location.href
      });
    } else {
      copyToClipboard(window.location.href);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!batch) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Batch Not Found</h3>
        <p className="text-gray-600 mb-6">The requested batch could not be found.</p>
        <button onClick={() => navigate('/dashboard')} className="btn-primary">
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Batch Details</h1>
            <p className="text-gray-600">Complete traceability information for {batch.herbSpecies}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={shareDetails}
            className="btn-outline flex items-center"
          >
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </button>
          <button className="btn-outline flex items-center">
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Batch Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card"
      >
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">Batch ID</h3>
            <div className="flex items-center space-x-2">
              <span className="font-mono text-lg font-bold text-gray-900">{batch.id}</span>
              <button
                onClick={() => copyToClipboard(batch.id)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <Copy className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">Herb Species</h3>
            <div className="flex items-center space-x-2">
              <Leaf className="w-5 h-5 text-green-500" />
              <span className="text-lg font-semibold text-gray-900">{batch.herbSpecies}</span>
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">Status</h3>
            <div className="flex items-center space-x-2">
              {getStatusIcon(batch.status)}
              <span className={`text-lg font-semibold capitalize ${
                batch.status === 'verified' ? 'text-green-600' : 'text-blue-600'
              }`}>
                {batch.status}
              </span>
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">Created</h3>
            <div className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-gray-400" />
              <span className="text-lg font-semibold text-gray-900">
                {new Date(batch.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Blockchain Information */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="card"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Blockchain Verification</h3>
          <div className="flex items-center space-x-2">
            {batch.blockchain.verified ? (
              <div className="flex items-center space-x-1 text-green-600">
                <Shield className="w-4 h-4" />
                <span className="text-sm font-medium">Verified</span>
              </div>
            ) : (
              <div className="flex items-center space-x-1 text-yellow-600">
                <Clock className="w-4 h-4" />
                <span className="text-sm font-medium">Pending</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500 mb-1">Contract Address</p>
            <div className="flex items-center space-x-1">
              <span className="font-mono text-sm">{`${batch.blockchain.contractAddress.slice(0, 8)}...${batch.blockchain.contractAddress.slice(-6)}`}</span>
              <button
                onClick={() => copyToClipboard(batch.blockchain.contractAddress)}
                className="p-1 hover:bg-gray-200 rounded"
              >
                <Copy className="w-3 h-3 text-gray-400" />
              </button>
            </div>
          </div>
          
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500 mb-1">Transaction Hash</p>
            <div className="flex items-center space-x-1">
              <span className="font-mono text-sm">{`${batch.blockchain.txHash.slice(0, 8)}...${batch.blockchain.txHash.slice(-6)}`}</span>
              <a
                href={`https://sepolia.etherscan.io/tx/${batch.blockchain.txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1 hover:bg-gray-200 rounded"
              >
                <ExternalLink className="w-3 h-3 text-gray-400" />
              </a>
            </div>
          </div>
          
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500 mb-1">Block Number</p>
            <span className="font-mono text-sm font-medium">{batch.blockchain.blockNumber.toLocaleString()}</span>
          </div>
          
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500 mb-1">Gas Used</p>
            <span className="font-mono text-sm font-medium">{batch.blockchain.gasUsed}</span>
          </div>
        </div>
      </motion.div>

      {/* Traceability Timeline */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="card"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Traceability Timeline</h3>
        
        {/* Step Navigation */}
        <div className="flex items-center justify-between mb-8">
          {batch.steps.map((step, index) => {
            const StepIcon = getStepIcon(step.id);
            const isActive = index === activeStep;
            const isCompleted = step.status === 'completed';
            
            return (
              <div key={step.id} className="flex flex-col items-center relative">
                {/* Connection Line */}
                {index < batch.steps.length - 1 && (
                  <div className={`absolute top-6 left-1/2 w-full h-0.5 ${
                    batch.steps[index + 1].status === 'completed' ? 'bg-green-500' : 'bg-gray-300'
                  }`} style={{ transform: 'translateX(50%)' }} />
                )}
                
                {/* Step Circle */}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setActiveStep(index)}
                  className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center cursor-pointer transition-colors ${
                    isCompleted ? 'bg-green-500 text-white' :
                    isActive ? 'bg-blue-500 text-white' :
                    'bg-gray-300 text-gray-600'
                  }`}
                >
                  <StepIcon className="w-5 h-5" />
                </motion.button>
                
                {/* Step Label */}
                <div className="mt-2 text-center">
                  <div className="text-sm font-medium text-gray-900">{step.title}</div>
                  <div className="text-xs text-gray-500">
                    {new Date(step.timestamp).toLocaleDateString()}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Step Details */}
        <motion.div
          key={activeStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
          {batch.steps[activeStep] && (
            <>
              <div className="flex items-center space-x-3 mb-4">
                <div className={`w-10 h-10 bg-gradient-to-r ${getStepColor(batch.steps[activeStep].id)} rounded-xl flex items-center justify-center text-white`}>
                  {React.createElement(getStepIcon(batch.steps[activeStep].id), { className: "w-5 h-5" })}
                </div>
                <div>
                  <h4 className="text-xl font-semibold text-gray-900">{batch.steps[activeStep].title}</h4>
                  <p className="text-gray-600">
                    {new Date(batch.steps[activeStep].timestamp).toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Step Data */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h5 className="font-semibold text-gray-900 mb-3">Details</h5>
                  <div className="space-y-3">
                    {Object.entries(batch.steps[activeStep].data).map(([key, value]) => (
                      <div key={key} className="flex justify-between items-start">
                        <span className="text-sm text-gray-600 capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}:
                        </span>
                        <span className="text-sm font-medium text-gray-900 text-right ml-4">
                          {typeof value === 'boolean' ? (value ? 'Yes' : 'No') : value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h5 className="font-semibold text-gray-900 mb-3">Blockchain Record</h5>
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <span className="text-sm text-gray-600">Transaction:</span>
                      <div className="flex items-center space-x-1">
                        <span className="text-sm font-mono">
                          {`${batch.steps[activeStep].blockchain.txHash.slice(0, 8)}...${batch.steps[activeStep].blockchain.txHash.slice(-6)}`}
                        </span>
                        <a
                          href={`https://sepolia.etherscan.io/tx/${batch.steps[activeStep].blockchain.txHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1 hover:bg-gray-100 rounded"
                        >
                          <ExternalLink className="w-3 h-3 text-gray-400" />
                        </a>
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Block:</span>
                      <span className="text-sm font-mono">{batch.steps[activeStep].blockchain.blockNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Gas Used:</span>
                      <span className="text-sm font-mono">{batch.steps[activeStep].blockchain.gasUsed}</span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </motion.div>
      </motion.div>

      {/* QR Code */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="card text-center"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">QR Code</h3>
        <div className="inline-flex flex-col items-center space-y-4">
          <div className="w-32 h-32 bg-gray-100 rounded-lg flex items-center justify-center">
            <QrCode className="w-16 h-16 text-gray-400" />
          </div>
          <p className="text-sm text-gray-600">
            Scan this QR code to verify batch authenticity
          </p>
          <button className="btn-outline text-sm">
            Download QR Code
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default BatchDetails;
