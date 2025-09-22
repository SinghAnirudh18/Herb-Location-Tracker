import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useBlockchain } from '../contexts/BlockchainContext';
import { consumerAPI, blockchainAPI, processorAPI, handleAPIError } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Leaf,
  Package,
  FlaskConical,
  ShoppingCart,
  CheckCircle,
  Clock,
  AlertCircle,
  Shield,
  QrCode,
  X
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const TraceabilityFlow = () => {
  const { user } = useAuth();
  const { isConnected, recordOnBlockchain, verifyOnBlockchain } = useBlockchain();
  const [activeStep, setActiveStep] = useState(0);
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [verificationStatus, setVerificationStatus] = useState(null);

  const steps = [
    {
      id: 'collection',
      title: 'Collection',
      icon: Leaf,
      color: 'from-green-500 to-emerald-600',
      description: 'Herb collection from farms',
      fields: [
        { name: 'herbSpecies', label: 'Herb Species', type: 'select', options: ['Ashwagandha', 'Turmeric', 'Neem', 'Brahmi', 'Tulsi'] },
        { name: 'quantity', label: 'Quantity (kg)', type: 'number' },
        { name: 'location', label: 'Collection Location', type: 'text' },
        { name: 'collectionDate', label: 'Collection Date', type: 'date' },
        { name: 'farmerName', label: 'Farmer Name', type: 'text' },
        { name: 'qualityNotes', label: 'Quality Notes', type: 'textarea' }
      ]
    },
    {
      id: 'processing',
      title: 'Processing',
      icon: Package,
      color: 'from-blue-500 to-cyan-600',
      description: 'Processing and preparation',
      fields: [
        { name: 'processingType', label: 'Processing Type', type: 'select', options: ['Drying', 'Grinding', 'Extraction', 'Purification'] },
        { name: 'processingDate', label: 'Processing Date', type: 'date' },
        { name: 'processorName', label: 'Processor Name', type: 'text' },
        { name: 'temperature', label: 'Temperature (°C)', type: 'number' },
        { name: 'duration', label: 'Duration (hours)', type: 'number' },
        { name: 'yield', label: 'Yield (%)', type: 'number' }
      ]
    },
    {
      id: 'quality',
      title: 'Quality Testing',
      icon: FlaskConical,
      color: 'from-purple-500 to-pink-600',
      description: 'Laboratory quality analysis',
      fields: [
        { name: 'testType', label: 'Test Type', type: 'select', options: ['Purity Test', 'Potency Test', 'Contamination Test', 'Authenticity Test'] },
        { name: 'testDate', label: 'Test Date', type: 'date' },
        { name: 'labName', label: 'Laboratory Name', type: 'text' },
        { name: 'testResults', label: 'Test Results', type: 'select', options: ['Pass', 'Fail', 'Conditional Pass'] },
        { name: 'purityLevel', label: 'Purity Level (%)', type: 'number' },
        { name: 'certificateNumber', label: 'Certificate Number', type: 'text' }
      ]
    },
    {
      id: 'product',
      title: 'Product Creation',
      icon: ShoppingCart,
      color: 'from-orange-500 to-red-600',
      description: 'Final product packaging',
      fields: [
        { name: 'productName', label: 'Product Name', type: 'text' },
        { name: 'packageDate', label: 'Package Date', type: 'date' },
        { name: 'manufacturer', label: 'Manufacturer', type: 'text' },
        { name: 'batchSize', label: 'Batch Size', type: 'number' },
        { name: 'expiryDate', label: 'Expiry Date', type: 'date' },
        { name: 'qrCode', label: 'QR Code', type: 'text' }
      ]
    }
  ];

  const loadBatches = useCallback(async () => {
    setDataLoading(true);
    try {
      // For now, we'll load sample data since this is primarily a search-based interface
      // In production, you might load recent batches or user-specific batches
      const sampleData = await loadSampleBatches();
      setBatches(sampleData);
    } catch (error) {
      handleAPIError(error, 'Failed to load batches');
      // Fallback to sample data for demo
      const sampleData = await loadSampleBatches();
      setBatches(sampleData);
    } finally {
      setDataLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBatches();
  }, [loadBatches]);

  const loadSampleBatches = async () => {
    // This will be replaced with real API calls based on user role
    return [
      {
        id: 'ASH-2024-001',
        batchId: 'ASH-2024-001',
        herbSpecies: 'Ashwagandha',
        currentStep: 2,
        status: 'quality_testing',
        createdAt: '2024-01-15',
        steps: {
          collection: { completed: true, data: { farmerName: 'Rajesh Kumar', location: 'Kerala', quantity: 50 } },
          processing: { completed: true, data: { processingType: 'Drying', processorName: 'ABC Processing' } },
          quality: { completed: false, data: {} },
          product: { completed: false, data: {} }
        }
      }
    ];
  };

  const transformBatchData = (batch) => {
    // Transform backend batch data to frontend format
    return {
      id: batch.batchId || batch.id,
      batchId: batch.batchId || batch.id,
      herbSpecies: batch.herbSpecies,
      currentStep: getCurrentStepIndex(batch.status),
      status: batch.status,
      createdAt: batch.collectionDate ? new Date(batch.collectionDate).toISOString().split('T')[0] : 
                 batch.createdAt ? new Date(batch.createdAt).toISOString().split('T')[0] : 
                 new Date().toISOString().split('T')[0],
      steps: {
        collection: {
          completed: true,
          data: {
            farmerName: batch.farmerName,
            location: batch.location,
            quantity: batch.quantity,
            qualityGrade: batch.qualityGrade,
            harvestMethod: batch.harvestMethod,
            organicCertified: batch.organicCertified,
            collectionDate: batch.collectionDate,
            weatherConditions: batch.weatherConditions,
            soilType: batch.soilType
          }
        },
        processing: {
          completed: batch.processingSteps && batch.processingSteps.length > 0,
          data: batch.processingSteps?.[0] || {}
        },
        quality: {
          completed: batch.qualityTests && batch.qualityTests.length > 0,
          data: batch.qualityTests?.[0] || {}
        },
        product: {
          completed: batch.status === 'completed' || batch.status === 'verified',
          data: {
            productName: batch.productName || `${batch.herbSpecies} Product`,
            manufacturer: batch.manufacturerName || (batch.farmer?.organization || 'Unknown')
          }
        }
      }
    };
  };

  const getCurrentStepIndex = (status) => {
    switch (status) {
      case 'pending': return 0;
      case 'processing': return 1;
      case 'testing': return 2;
      case 'completed': case 'verified': return 3;
      default: return 0;
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const currentStepId = steps[activeStep].id;
      
      // This form is primarily for viewing/verification, not creating new data
      // In a real app, only authorized roles would be able to add data
      if (user?.role === 'consumer') {
        toast.error('Consumers can only view batch information, not modify it');
        setShowForm(false);
        return;
      }

      // Save to database first based on step type
      let dbResult;
      if (currentStepId === 'processing') {
        // Save processing step to database
        dbResult = await processorAPI.recordProcessingStep({
          batchId: selectedBatch?.batchId || selectedBatch?.id,
          processType: (formData.processingType || 'drying').toLowerCase(),
          parameters: {
            temperature: parseFloat(formData.temperature) || 0,
            duration: parseFloat(formData.duration) || 0,
            method: formData.method || 'Standard processing'
          },
          inputQuantity: selectedBatch?.quantity || 0,
          outputQuantity: parseFloat(formData.yield) || 0,
          equipment: {
            name: formData.processingType || 'Processing Equipment',
            id: formData.equipmentId || 'EQ-001'
          },
          notes: formData.notes || ''
        });
      }

      // Then record on blockchain if connected and database save was successful
      if (isConnected && dbResult?.success) {
        let blockchainResult;
        
        // Use the correct endpoint based on the step type
        if (currentStepId === 'processing') {
          blockchainResult = await blockchainAPI.recordProcessing({
            batchId: selectedBatch?.batchId || selectedBatch?.id,
            stepType: formData.processingType || 'Processing',
            inputBatchId: selectedBatch?.batchId || selectedBatch?.id,
            outputBatchId: selectedBatch?.batchId || selectedBatch?.id,
            processDetails: formData,
            qualityMetrics: formData
          });
        } else {
          // For other steps, use the appropriate endpoint
          blockchainResult = await recordOnBlockchain(`${currentStepId}/record`, {
            batchId: selectedBatch?.batchId || selectedBatch?.id,
            step: currentStepId,
            data: formData
          });
        }
        
        if (blockchainResult && !blockchainResult.success && blockchainResult.success !== undefined) {
          console.warn('Blockchain recording failed, but database save was successful');
        }
      }

      // For demo purposes, we'll update local state
      // In production, this would call the appropriate API based on user role
      if (selectedBatch) {
        const updatedBatch = { ...selectedBatch };
        updatedBatch.steps[currentStepId] = {
          completed: true,
          data: formData,
          timestamp: new Date().toISOString(),
          txHash: isConnected ? '0x1234...abcd' : null
        };
        
        // Update batches
        setBatches(prev => prev.map(b => b.id === selectedBatch.id ? updatedBatch : b));
        setSelectedBatch(updatedBatch);
      }

      toast.success(`${steps[activeStep].title} recorded successfully! 🎉`);
      setShowForm(false);
      setFormData({});
      
    } catch (error) {
      console.error('Form submission error:', error);
      handleAPIError(error, 'Failed to record data');
    } finally {
      setLoading(false);
    }
  };

  const searchBatch = async (query) => {
    if (!query.trim()) {
      loadBatches();
      return;
    }

    setDataLoading(true);
    setVerificationStatus(null);
    
    try {
      // First verify on blockchain if connected
      let blockchainVerification = null;
      if (isConnected) {
        try {
          blockchainVerification = await verifyOnBlockchain(query.trim());
        } catch (error) {
          console.error('Blockchain verification error:', error);
          // Continue with API even if blockchain verification fails
        }
      }

      // Then check with the API
      const response = await blockchainAPI.searchBatch(query.trim());
      if (response.success && response.batch) {
        const batchData = response.batch;
        
        // Add blockchain verification data if available
        if (blockchainVerification) {
          batchData.blockchainVerification = blockchainVerification;
          batchData.verifiedOnBlockchain = blockchainVerification.verified;
        }
        
        setBatches([batchData]);
        setSelectedBatch(batchData);
        setVerificationStatus({
          verified: true,
          blockchainVerified: blockchainVerification?.verified || batchData.verifiedOnBlockchain || false,
          details: blockchainVerification || batchData.blockchainVerification || {}
        });
        
        toast.success(`✅ Batch ${query.trim()} found successfully`);
        if (blockchainVerification?.verified || batchData.verifiedOnBlockchain) {
          toast.success('🔗 Verified on blockchain');
        }
      }
    } catch (error) {
      // If the API call fails, check if it's a 404 (batch not found) vs other errors
      if (error.message.includes('404')) {
        setBatches([]);
        toast.error(`Batch ${query.trim()} not found`);
      } else {
        handleAPIError(error, 'Failed to search batch');
        setBatches([]);
      }
    } finally {
      setDataLoading(false);
    }
  };

  const getStepStatus = (batch, stepIndex) => {
    const step = steps[stepIndex];
    const stepData = batch.steps[step.id];
    
    if (stepData.completed) return 'completed';
    if (stepIndex === batch.currentStep) return 'active';
    if (stepIndex < batch.currentStep) return 'completed';
    return 'pending';
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'active':
        return <Clock className="w-5 h-5 text-blue-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Traceability Flow</h1>
            <p className="text-gray-600">Track herbs from farm to pharmacy</p>
          </div>
          {user?.role !== 'consumer' && (
            <button
              onClick={() => {
                setSelectedBatch(null);
                setActiveStep(0);
                setShowForm(true);
              }}
              className="btn-primary flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Batch
            </button>
          )}
        </div>
        
        {/* Search Bar */}
        <div className="flex space-x-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by Batch ID (e.g., ASH-2024-001)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && searchBatch(searchQuery)}
              className="input-field"
            />
          </div>
          <button
            onClick={() => searchBatch(searchQuery)}
            className="btn-outline"
          >
            Search
          </button>
          <button
            onClick={() => {
              setSearchQuery('');
              loadBatches();
            }}
            className="btn-outline"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Blockchain and Verification Status */}
      <div className="space-y-3">
        {!isConnected && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-yellow-50 border border-yellow-200 rounded-xl p-4"
          >
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-yellow-600" />
              <span className="text-yellow-800">
                Connect your wallet to record and verify data on blockchain for enhanced security
              </span>
            </div>
          </motion.div>
        )}

        {selectedBatch && verificationStatus && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-xl p-4 ${
              verificationStatus.verified && verificationStatus.blockchainVerified
                ? 'bg-green-50 border border-green-200'
                : 'bg-yellow-50 border border-yellow-200'
            }`}
          >
            <div className="flex items-start space-x-3">
              {verificationStatus.verified && verificationStatus.blockchainVerified ? (
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
              )}
              <div>
                <h4 className="font-medium text-gray-900">
                  {verificationStatus.verified && verificationStatus.blockchainVerified
                    ? '✅ Verified on Blockchain'
                    : '⚠️ Verification Status'}
                </h4>
                <div className="mt-1 text-sm text-gray-700 space-y-1">
                  <div className="flex items-center">
                    <span className="w-32">Batch ID:</span>
                    <span className="font-mono">{selectedBatch.id}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-32">System Verification:</span>
                    <span className={verificationStatus.verified ? 'text-green-600 font-medium' : 'text-yellow-600'}>
                      {verificationStatus.verified ? 'Verified' : 'Not Verified'}
                    </span>
                  </div>
                  {verificationStatus.details && (
                    <div className="flex items-center">
                      <span className="w-32">Blockchain:</span>
                      <span className={verificationStatus.blockchainVerified ? 'text-green-600 font-medium' : 'text-yellow-600'}>
                        {verificationStatus.blockchainVerified 
                          ? `Verified (Block #${verificationStatus.details.blockNumber || 'N/A'})` 
                          : 'Not Verified on Blockchain'}
                      </span>
                    </div>
                  )}
                  {verificationStatus.details?.txHash && (
                    <div className="flex items-start">
                      <span className="w-32">Transaction:</span>
                      <a 
                        href={`https://sepolia.etherscan.io/tx/${verificationStatus.details.txHash}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline break-all"
                      >
                        {verificationStatus.details.txHash.substring(0, 20)}...
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Batch List */}
        <div className="lg:col-span-1">
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Active Batches</h3>
            {dataLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
                <span className="ml-2 text-gray-600">Loading batches...</span>
              </div>
            ) : batches.length === 0 ? (
              <div className="text-center py-8">
                <Leaf className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500">No batches found</p>
                <p className="text-sm text-gray-400">Try searching with a specific Batch ID</p>
              </div>
            ) : (
              <div className="space-y-3">
                {batches.map((batch) => (
                <motion.button
                  key={batch.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedBatch(batch)}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                    selectedBatch?.id === batch.id
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-sm font-medium">{batch.id}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      batch.status === 'verified' ? 'bg-green-100 text-green-700' :
                      batch.status === 'quality_testing' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {batch.status.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    <div>{batch.herbSpecies}</div>
                    <div>Created: {batch.createdAt}</div>
                  </div>
                  <div className="mt-2 flex space-x-1">
                    {steps.map((_, index) => (
                      <div
                        key={index}
                        className={`h-2 flex-1 rounded-full ${
                          getStepStatus(batch, index) === 'completed' ? 'bg-green-500' :
                          getStepStatus(batch, index) === 'active' ? 'bg-blue-500' :
                          'bg-gray-200'
                        }`}
                      />
                    ))}
                  </div>
                  </motion.button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2">
          {selectedBatch ? (
            <div className="space-y-6">
              {/* Batch Details */}
              <div className="card">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">{selectedBatch.id}</h2>
                    <p className="text-gray-600">{selectedBatch.herbSpecies} Batch</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <QrCode className="w-5 h-5 text-gray-400" />
                    <button className="btn-outline text-sm">
                      Generate QR
                    </button>
                  </div>
                </div>

                {/* Progress Steps */}
                <div className="relative">
                  <div className="flex items-center justify-between">
                    {steps.map((step, index) => {
                      const status = getStepStatus(selectedBatch, index);
                      const StepIcon = step.icon;
                      
                      return (
                        <div key={step.id} className="flex flex-col items-center relative">
                          {/* Connection Line */}
                          {index < steps.length - 1 && (
                            <div className={`absolute top-6 left-1/2 w-full h-0.5 ${
                              getStepStatus(selectedBatch, index + 1) === 'completed' ? 'bg-green-500' : 'bg-gray-300'
                            }`} style={{ transform: 'translateX(50%)' }} />
                          )}
                          
                          {/* Step Circle */}
                          <motion.div
                            whileHover={{ scale: 1.1 }}
                            className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center cursor-pointer ${
                              status === 'completed' ? 'bg-green-500 text-white' :
                              status === 'active' ? 'bg-blue-500 text-white' :
                              'bg-gray-300 text-gray-600'
                            }`}
                            onClick={() => {
                              setActiveStep(index);
                              if (!selectedBatch.steps[step.id].completed) {
                                setFormData(selectedBatch.steps[step.id].data || {});
                                setShowForm(true);
                              }
                            }}
                          >
                            <StepIcon className="w-5 h-5" />
                          </motion.div>
                          
                          {/* Step Label */}
                          <div className="mt-2 text-center">
                            <div className="text-sm font-medium text-gray-900">{step.title}</div>
                            <div className="text-xs text-gray-500">{step.description}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Step Details */}
              <div className="grid md:grid-cols-2 gap-6">
                {steps.map((step, index) => {
                  const stepData = selectedBatch.steps[step.id];
                  const StepIcon = step.icon;
                  
                  return (
                    <motion.div
                      key={step.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="card"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className={`w-10 h-10 bg-gradient-to-r ${step.color} rounded-xl flex items-center justify-center text-white`}>
                            <StepIcon className="w-5 h-5" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{step.title}</h3>
                            <p className="text-sm text-gray-600">{step.description}</p>
                          </div>
                        </div>
                        {getStatusIcon(getStepStatus(selectedBatch, index))}
                      </div>
                      
                      {stepData.completed ? (
                        <div className="space-y-2">
                          {Object.entries(stepData.data).map(([key, value]) => (
                            <div key={key} className="flex justify-between text-sm">
                              <span className="text-gray-600 capitalize">{key.replace(/([A-Z])/g, ' $1')}:</span>
                              <span className="font-medium">{value}</span>
                            </div>
                          ))}
                          {stepData.timestamp && (
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Recorded:</span>
                              <span className="font-medium">{new Date(stepData.timestamp).toLocaleString()}</span>
                            </div>
                          )}
                          {stepData.txHash && (
                            <div className="mt-2 pt-2 border-t border-gray-100">
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600 flex items-center">
                                  <Shield className="w-3.5 h-3.5 mr-1.5 text-green-500" />
                                  Blockchain Verified
                                </span>
                                <a 
                                  href={`https://sepolia.etherscan.io/tx/${stepData.txHash}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:underline text-xs flex items-center"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  View on Etherscan
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                  </svg>
                                </a>
                              </div>
                              <div className="mt-1">
                                <div className="text-xs font-mono text-gray-500 break-all">
                                  {stepData.txHash.substring(0, 20)}...{stepData.txHash.substring(stepData.txHash.length - 10)}
                                </div>
                                {stepData.blockNumber && (
                                  <div className="text-xs text-gray-500 mt-1">
                                    Block #{stepData.blockNumber}
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-center py-4">
                          <p className="text-gray-500 mb-3">No data recorded yet</p>
                          <button
                            onClick={() => {
                              setActiveStep(index);
                              setFormData({});
                              setShowForm(true);
                            }}
                            className="btn-outline text-sm"
                          >
                            <Plus className="w-4 h-4 mr-1" />
                            Add Data
                          </button>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="card text-center py-12">
              <Leaf className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Batch Selected</h3>
              <p className="text-gray-600 mb-6">Select a batch from the list to view its traceability flow</p>
              <button
                onClick={() => {
                  setSelectedBatch(null);
                  setActiveStep(0);
                  setShowForm(true);
                }}
                className="btn-primary"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create New Batch
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Form Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 bg-gradient-to-r ${steps[activeStep].color} rounded-xl flex items-center justify-center text-white`}>
                    {React.createElement(steps[activeStep].icon, { className: "w-5 h-5" })}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">{steps[activeStep].title}</h3>
                    <p className="text-sm text-gray-600">{steps[activeStep].description}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowForm(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  {steps[activeStep].fields.map((field) => (
                    <div key={field.name} className={field.type === 'textarea' ? 'md:col-span-2' : ''}>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {field.label}
                      </label>
                      {field.type === 'select' ? (
                        <select
                          name={field.name}
                          value={formData[field.name] || ''}
                          onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                          className="input-field"
                          required
                        >
                          <option value="">Select {field.label}</option>
                          {field.options.map((option) => (
                            <option key={option} value={option}>{option}</option>
                          ))}
                        </select>
                      ) : field.type === 'textarea' ? (
                        <textarea
                          name={field.name}
                          value={formData[field.name] || ''}
                          onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                          className="input-field"
                          rows={3}
                          placeholder={`Enter ${field.label.toLowerCase()}`}
                        />
                      ) : (
                        <input
                          type={field.type}
                          name={field.name}
                          value={formData[field.name] || ''}
                          onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                          className="input-field"
                          placeholder={`Enter ${field.label.toLowerCase()}`}
                          required
                        />
                      )}
                    </div>
                  ))}
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
                      <>
                        <Shield className="w-4 h-4 mr-2" />
                        Record on Blockchain
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TraceabilityFlow;
