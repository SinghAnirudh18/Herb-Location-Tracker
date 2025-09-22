import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useBlockchain } from '../../contexts/BlockchainContext';
import { processorAPI, handleAPIError } from '../../services/api';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import {
  Package,
  Play,
  Pause,
  CheckCircle,
  Clock,
  Thermometer,
  Timer,
  Scale,
  TrendingUp,
  AlertCircle,
  Settings,
  BarChart3,
  Activity,
  Search,
  Eye,
  ArrowRight
} from 'lucide-react';

const ProcessorDashboard = () => {
  const { user } = useAuth();
  const { isConnected } = useBlockchain();
  
  const [processingBatches, setProcessingBatches] = useState([]);
  const [availableBatches, setAvailableBatches] = useState([]);
  const [activeProcesses, setActiveProcesses] = useState([]);
  const [stats, setStats] = useState({
    totalProcessed: 0,
    inProgress: 0,
    completed: 0,
    efficiency: 0,
    avgProcessingTime: 0,
    qualityRate: 0
  });
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);

  // Batch lookup functionality
  const [batchLookup, setBatchLookup] = useState({
    batchId: '',
    batchData: null,
    loading: false,
    error: null
  });
  const [showBatchLookup, setShowBatchLookup] = useState(false);
  const [grindingData, setGrindingData] = useState({
    inputBatchId: '',
    outputBatchId: '',
    grindingType: '',
    inputQuantity: '',
    outputQuantity: '',
    grindingParameters: {
      particleSize: '',
      moistureContent: '',
      temperature: '',
      duration: ''
    },
    equipment: {
      grinderType: '',
      screenSize: '',
      capacity: ''
    },
    qualityCheck: {
      color: '',
      aroma: '',
      texture: '',
      moisture: ''
    },
    notes: '',
    loading: false
  });
  const [showGrindingForm, setShowGrindingForm] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setDataLoading(true);
    try {
      // Load available processor data
      const [assignedResponse, statsResponse] = await Promise.all([
        processorAPI.getAssignedBatches(),
        processorAPI.getMyStats()
      ]);

      if (assignedResponse.success) {
        const batches = assignedResponse.batches || [];
        setProcessingBatches(batches);
        // Set available batches as pending batches
        setAvailableBatches(batches.filter(batch => batch.status === 'pending'));
      }

      if (statsResponse.success) {
        setStats({
          totalProcessed: statsResponse.totalProcessed || 0,
          inProgress: statsResponse.currentlyProcessing || 0,
          completed: statsResponse.completed || 0,
          efficiency: statsResponse.efficiency || 0,
          avgProcessingTime: 24, // Default value
          qualityRate: 95 // Default value
        });
      }

      // Load sample active processes for demo
      loadSampleActiveProcesses();

    } catch (error) {
      handleAPIError(error, 'Failed to load dashboard data');
      // Fallback to sample data for demo
      loadSampleData();
    } finally {
      setDataLoading(false);
    }
  };

  const loadSampleActiveProcesses = () => {
    const activeProcs = [
      {
        id: 'PROC-001',
        batchId: 'ASH-2024-001',
        equipment: 'Drying Chamber A',
        temperature: 45,
        targetTemp: 45,
        humidity: 15,
        duration: 47,
        targetDuration: 72,
        status: 'running'
      },
      {
        id: 'PROC-002',
        batchId: 'BRA-2024-012',
        equipment: 'Grinding Mill B',
        speed: 1200,
        targetSpeed: 1200,
        particleSize: 150,
        targetSize: 100,
        duration: 2.5,
        targetDuration: 4,
        status: 'running'
      }
    ];
    
    setActiveProcesses(activeProcs);
  };

  const loadSampleData = () => {
    const mockBatches = [
      {
        id: 'ASH-2024-001',
        batchId: 'ASH-2024-001',
        herbSpecies: 'Ashwagandha',
        inputQuantity: 50,
        currentQuantity: 42.5,
        processType: 'Traditional Drying',
        status: 'processing',
        startTime: '2024-01-16T10:00:00Z',
        estimatedCompletion: '2024-01-19T10:00:00Z',
        temperature: 45,
        humidity: 15,
        progress: 65
      },
      {
        id: 'TUR-2024-045',
        herbSpecies: 'Turmeric',
        inputQuantity: 75,
        currentQuantity: 63.8,
        processType: 'Grinding',
        status: 'completed',
        startTime: '2024-01-15T14:00:00Z',
        completionTime: '2024-01-16T18:00:00Z',
        yield: 85.1,
        qualityGrade: 'Premium'
      },
      {
        id: 'NEE-2024-089',
        herbSpecies: 'Neem',
        inputQuantity: 60,
        currentQuantity: 60,
        processType: 'Extraction',
        status: 'pending',
        scheduledStart: '2024-01-22T09:00:00Z',
        estimatedDuration: 48
      }
    ];
    
    setProcessingBatches(mockBatches);
    setAvailableBatches(mockBatches.filter(batch => batch.status === 'pending'));
    loadSampleActiveProcesses();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-100';
      case 'in_progress':
        return 'text-blue-600 bg-blue-100';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'paused':
        return 'text-orange-600 bg-orange-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const startProcessing = async (batchId, processingData) => {
    setLoading(true);
    try {
      const response = await processorAPI.startProcessing(batchId, processingData);
      if (response.success) {
        toast.success('Processing started successfully!');
        // Move batch from available to processing
        const batch = availableBatches.find(b => b.batchId === batchId);
        if (batch) {
          setAvailableBatches(prev => prev.filter(b => b.batchId !== batchId));
          setProcessingBatches(prev => [...prev, { ...batch, status: 'processing', startTime: new Date().toISOString() }]);
        }
        loadDashboardData(); // Refresh data
      }
    } catch (error) {
      handleAPIError(error, 'Failed to start processing');
    } finally {
      setLoading(false);
    }
  };

  const updateProcessing = async (batchId, updateData) => {
    setLoading(true);
    try {
      const response = await processorAPI.updateProcessing(batchId, updateData);
      if (response.success) {
        toast.success('Processing updated successfully!');
        loadDashboardData(); // Refresh data
      }
    } catch (error) {
      handleAPIError(error, 'Failed to update processing');
    } finally {
      setLoading(false);
    }
  };

  const completeProcessing = async (batchId, completionData) => {
    setLoading(true);
    try {
      const response = await processorAPI.completeProcessing(batchId, completionData);
      if (response.success) {
        toast.success('Processing completed successfully!');
        // Update batch status to completed
        setProcessingBatches(prev => 
          prev.map(batch => 
            batch.batchId === batchId 
              ? { ...batch, status: 'completed', completionTime: new Date().toISOString() }
              : batch
          )
        );
        loadDashboardData(); // Refresh data
      }
    } catch (error) {
      handleAPIError(error, 'Failed to complete processing');
    } finally {
      setLoading(false);
    }
  };

  const startProcess = async (batchId) => {
    setLoading(true);
    try {
      const response = await processorAPI.startProcessing(batchId);
      if (response.success) {
        toast.success('Processing started successfully!');
        loadDashboardData(); // Refresh data
      }
    } catch (error) {
      handleAPIError(error, 'Failed to start processing');
    } finally {
      setLoading(false);
    }
  };

  const pauseProcess = (batchId) => {
    // For demo - in production this would call a pause API
    setProcessingBatches(prev => 
      prev.map(batch => 
        batch.batchId === batchId 
          ? { ...batch, status: 'paused' }
          : batch
      )
    );
    toast.success('Process paused');
  };

  const completeProcess = async (batchId) => {
    setLoading(true);
    try {
      const response = await processorAPI.completeProcessing(batchId);
      if (response.success) {
        toast.success('Processing completed successfully!');
        loadDashboardData(); // Refresh data
      }
    } catch (error) {
      handleAPIError(error, 'Failed to complete processing');
    } finally {
      setLoading(false);
    }
  };

  const lookupBatch = async () => {
    if (!batchLookup.batchId.trim()) {
      toast.error('Please enter a batch ID');
      return;
    }

    setBatchLookup(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const response = await processorAPI.lookupBatch(batchLookup.batchId);
      if (response.success) {
        setBatchLookup(prev => ({ 
          ...prev, 
          batchData: response.batch, 
          loading: false,
          error: null 
        }));
        setShowBatchLookup(true);
        toast.success('Batch found successfully!');
      } else {
        setBatchLookup(prev => ({ 
          ...prev, 
          loading: false, 
          error: response.message || 'Batch not found' 
        }));
        toast.error(response.message || 'Batch not found');
      }
    } catch (error) {
      setBatchLookup(prev => ({ 
        ...prev, 
        loading: false, 
        error: error.message || 'Failed to lookup batch' 
      }));
      toast.error('Failed to lookup batch');
    }
  };

  const handleGrindingSubmit = async (e) => {
    e.preventDefault();
    if (!grindingData.inputBatchId || !grindingData.outputBatchId || !grindingData.grindingType) {
      toast.error('Please fill in all required fields');
      return;
    }

    setGrindingData(prev => ({ ...prev, loading: true }));

    try {
      const response = await processorAPI.recordGrindingStep({
        batchId: `GRIND-${Date.now()}`,
        inputBatchId: grindingData.inputBatchId,
        outputBatchId: grindingData.outputBatchId,
        grindingType: grindingData.grindingType,
        inputQuantity: parseFloat(grindingData.inputQuantity),
        outputQuantity: parseFloat(grindingData.outputQuantity),
        grindingParameters: grindingData.grindingParameters,
        equipment: grindingData.equipment,
        qualityCheck: grindingData.qualityCheck,
        notes: grindingData.notes
      });

      if (response.success) {
        toast.success('Grinding step recorded successfully!');
        setShowGrindingForm(false);
        setGrindingData({
          inputBatchId: '',
          outputBatchId: '',
          grindingType: '',
          inputQuantity: '',
          outputQuantity: '',
          grindingParameters: {
            particleSize: '',
            moistureContent: '',
            temperature: '',
            duration: ''
          },
          equipment: {
            grinderType: '',
            screenSize: '',
            capacity: ''
          },
          qualityCheck: {
            color: '',
            aroma: '',
            texture: '',
            moisture: ''
          },
          notes: '',
          loading: false
        });
        loadDashboardData(); // Refresh data
      }
    } catch (error) {
      handleAPIError(error, 'Failed to record grinding step');
    } finally {
      setGrindingData(prev => ({ ...prev, loading: false }));
    }
  };

  const openGrindingForm = () => {
    setShowGrindingForm(true);
  };

  const closeGrindingForm = () => {
    setShowGrindingForm(false);
    setGrindingData({
      inputBatchId: '',
      outputBatchId: '',
      grindingType: '',
      inputQuantity: '',
      outputQuantity: '',
      grindingParameters: {
        particleSize: '',
        moistureContent: '',
        temperature: '',
        duration: ''
      },
      equipment: {
        grinderType: '',
        screenSize: '',
        capacity: ''
      },
      qualityCheck: {
        color: '',
        aroma: '',
        texture: '',
        moisture: ''
      },
      notes: '',
      loading: false
    });
  };

  const clearBatchLookup = () => {
    setBatchLookup({
      batchId: '',
      batchData: null,
      loading: false,
      error: null
    });
    setShowBatchLookup(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Processing Dashboard</h1>
          <p className="text-gray-600">Monitor and manage herb processing operations</p>
        </div>
        
        <div className="flex items-center space-x-3">
          {/* Batch Lookup */}
          <div className="flex items-center space-x-2">
            <div className="relative">
              <input
                type="text"
                placeholder="Enter Batch ID..."
                value={batchLookup.batchId}
                onChange={(e) => setBatchLookup(prev => ({ ...prev, batchId: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                onKeyPress={(e) => e.key === 'Enter' && lookupBatch()}
              />
              <button
                onClick={lookupBatch}
                disabled={batchLookup.loading}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-blue-500 disabled:opacity-50"
              >
                {batchLookup.loading ? (
                  <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Search className="w-4 h-4" />
                )}
              </button>
            </div>
            <button
              onClick={() => setShowBatchLookup(!showBatchLookup)}
              className="btn-outline flex items-center text-sm"
            >
              <Eye className="w-4 h-4 mr-1" />
              View Batch
            </button>
          </div>
          
          <button className="btn-outline flex items-center">
            <Settings className="w-4 h-4 mr-2" />
            Equipment Settings
          </button>
          <button
            onClick={openGrindingForm}
            className="btn-primary flex items-center"
          >
            <Package className="w-4 h-4 mr-2" />
            Record Grinding
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
              <p className="text-sm font-medium text-gray-600 mb-1">Total Processed</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalProcessed}</p>
              <div className="flex items-center mt-2">
                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-sm font-medium text-green-600">+8.3%</span>
              </div>
            </div>
            <div className="p-3 rounded-xl bg-blue-100">
              <Package className="w-6 h-6 text-blue-600" />
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
              <p className="text-sm font-medium text-gray-600 mb-1">In Progress</p>
              <p className="text-2xl font-bold text-gray-900">{stats.inProgress}</p>
              <div className="flex items-center mt-2">
                <Activity className="w-4 h-4 text-blue-500 mr-1" />
                <span className="text-sm text-gray-500">Active batches</span>
              </div>
            </div>
            <div className="p-3 rounded-xl bg-orange-100">
              <Clock className="w-6 h-6 text-orange-600" />
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
              <p className="text-sm font-medium text-gray-600 mb-1">Efficiency Rate</p>
              <p className="text-2xl font-bold text-gray-900">{stats.efficiency}%</p>
              <div className="flex items-center mt-2">
                <BarChart3 className="w-4 h-4 text-purple-500 mr-1" />
                <span className="text-sm text-gray-500">Performance</span>
              </div>
            </div>
            <div className="p-3 rounded-xl bg-purple-100">
              <TrendingUp className="w-6 h-6 text-purple-600" />
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
              <p className="text-sm font-medium text-gray-600 mb-1">Avg. Process Time</p>
              <p className="text-2xl font-bold text-gray-900">{stats.avgProcessingTime}h</p>
              <div className="flex items-center mt-2">
                <Timer className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-sm text-gray-500">Per batch</span>
              </div>
            </div>
            <div className="p-3 rounded-xl bg-green-100">
              <Timer className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Batch Lookup Results */}
      {showBatchLookup && batchLookup.batchData && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Batch Details</h3>
            <button
              onClick={clearBatchLookup}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Basic Information</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Batch ID:</span>
                    <span className="font-medium">{batchLookup.batchData.batchId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Herb Species:</span>
                    <span className="font-medium">{batchLookup.batchData.herbSpecies}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Quantity:</span>
                    <span className="font-medium">{batchLookup.batchData.quantity} {batchLookup.batchData.unit}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Location:</span>
                    <span className="font-medium">{batchLookup.batchData.location}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Quality Grade:</span>
                    <span className="font-medium">{batchLookup.batchData.qualityGrade}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      batchLookup.batchData.status === 'recorded' ? 'bg-green-100 text-green-800' :
                      batchLookup.batchData.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                      batchLookup.batchData.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {batchLookup.batchData.status}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Blockchain Info */}
              {batchLookup.batchData.blockchainRecorded && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Blockchain Record</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Recorded:</span>
                      <span className="text-green-600 font-medium">✅ Yes</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Transaction:</span>
                      <span className="font-mono text-xs text-blue-600">
                        {batchLookup.batchData.transactionHash?.substring(0, 10)}...
                      </span>
                    </div>
                    {batchLookup.batchData.ipfsHash && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">IPFS Hash:</span>
                        <span className="font-mono text-xs text-purple-600">
                          {batchLookup.batchData.ipfsHash.substring(0, 10)}...
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            {/* Farmer & Processing Info */}
            <div className="space-y-4">
              {batchLookup.batchData.farmer && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Farmer Information</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Name:</span>
                      <span className="font-medium">{batchLookup.batchData.farmer.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Organization:</span>
                      <span className="font-medium">{batchLookup.batchData.farmer.organization}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Location:</span>
                      <span className="font-medium">{batchLookup.batchData.farmer.location}</span>
                    </div>
                  </div>
                </div>
              )}
              
              {batchLookup.batchData.processor && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Processor Information</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Name:</span>
                      <span className="font-medium">{batchLookup.batchData.processor.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Organization:</span>
                      <span className="font-medium">{batchLookup.batchData.processor.organization}</span>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Processing Steps */}
              {/* Processing Steps */}
{/* Processing Steps - SAFE RENDERING */}

{batchLookup.batchData.processingSteps && batchLookup.batchData.processingSteps.length > 0 && (
  <div>
    <h4 className="font-medium text-gray-900 mb-3">Processing Steps</h4>
    <div className="space-y-2 max-h-32 overflow-y-auto">
      {batchLookup.batchData.processingSteps.map((step, index) => {
        // SAFELY extract the processType - it might be an object!
        const processType = typeof step.processType === 'string' 
          ? step.processType 
          : (step.processType?.processType || 'Unknown Step');
        
        // SAFELY extract notes
        const notes = typeof step.notes === 'string' 
          ? step.notes 
          : (step.notes?.notes || '');

        return (
          <div key={step.id || index} className="p-2 bg-gray-50 rounded text-sm">
            <div className="flex justify-between items-center">
              <span className="font-medium">{processType}</span> {/* ✅ FIXED */}
              <span className="text-gray-500">
                {step.createdAt ? new Date(step.createdAt).toLocaleDateString() : 'Unknown date'}
              </span>
            </div>
            {notes && (
              <p className="text-gray-600 text-xs mt-1">{notes}</p> 
            )}
          </div>
        );
      })}
    </div>
  </div>
)}
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="mt-6 flex justify-end space-x-3">
            {batchLookup.batchData.status === 'pending' && (
              <button
                onClick={() => startProcess(batchLookup.batchData.batchId)}
                className="btn-primary flex items-center"
              >
                <Play className="w-4 h-4 mr-2" />
                Start Processing
              </button>
            )}
            {batchLookup.batchData.status === 'processing' && (
              <button
                onClick={() => completeProcess(batchLookup.batchData.batchId)}
                className="btn-primary flex items-center"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Complete Processing
              </button>
            )}
            <button
              onClick={clearBatchLookup}
              className="btn-outline flex items-center"
            >
              <ArrowRight className="w-4 h-4 mr-2" />
              Close
            </button>
          </div>
        </motion.div>
      )}

      {/* Grinding Processing Form */}
      {showGrindingForm && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Record Grinding Process</h3>
            <button
              onClick={closeGrindingForm}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleGrindingSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Basic Information</h4>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Input Batch ID *
                  </label>
                  <input
                    type="text"
                    value={grindingData.inputBatchId}
                    onChange={(e) => setGrindingData(prev => ({ ...prev, inputBatchId: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter input batch ID"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Output Batch ID *
                  </label>
                  <input
                    type="text"
                    value={grindingData.outputBatchId}
                    onChange={(e) => setGrindingData(prev => ({ ...prev, outputBatchId: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter output batch ID"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Grinding Type *
                  </label>
                  <select
                    value={grindingData.grindingType}
                    onChange={(e) => setGrindingData(prev => ({ ...prev, grindingType: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select grinding type</option>
                    <option value="coarse">Coarse Grinding</option>
                    <option value="medium">Medium Grinding</option>
                    <option value="fine">Fine Grinding</option>
                    <option value="ultra-fine">Ultra-fine Grinding</option>
                    <option value="cryogenic">Cryogenic Grinding</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Input Quantity (kg) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={grindingData.inputQuantity}
                      onChange={(e) => setGrindingData(prev => ({ ...prev, inputQuantity: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="0.00"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Output Quantity (kg) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={grindingData.outputQuantity}
                      onChange={(e) => setGrindingData(prev => ({ ...prev, outputQuantity: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="0.00"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Grinding Parameters */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Grinding Parameters</h4>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Particle Size (μm)
                    </label>
                    <input
                      type="text"
                      value={grindingData.grindingParameters.particleSize}
                      onChange={(e) => setGrindingData(prev => ({
                        ...prev,
                        grindingParameters: { ...prev.grindingParameters, particleSize: e.target.value }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="100-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Moisture Content (%)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={grindingData.grindingParameters.moistureContent}
                      onChange={(e) => setGrindingData(prev => ({
                        ...prev,
                        grindingParameters: { ...prev.grindingParameters, moistureContent: e.target.value }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="5.00"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Temperature (°C)
                    </label>
                    <input
                      type="number"
                      value={grindingData.grindingParameters.temperature}
                      onChange={(e) => setGrindingData(prev => ({
                        ...prev,
                        grindingParameters: { ...prev.grindingParameters, temperature: e.target.value }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="25"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Duration (min)
                    </label>
                    <input
                      type="number"
                      value={grindingData.grindingParameters.duration}
                      onChange={(e) => setGrindingData(prev => ({
                        ...prev,
                        grindingParameters: { ...prev.grindingParameters, duration: e.target.value }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="30"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Equipment Information */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Equipment Information</h4>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Grinder Type
                  </label>
                  <input
                    type="text"
                    value={grindingData.equipment.grinderType}
                    onChange={(e) => setGrindingData(prev => ({
                      ...prev,
                      equipment: { ...prev.equipment, grinderType: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ball Mill"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Screen Size (mesh)
                  </label>
                  <input
                    type="text"
                    value={grindingData.equipment.screenSize}
                    onChange={(e) => setGrindingData(prev => ({
                      ...prev,
                      equipment: { ...prev.equipment, screenSize: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="200"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Capacity (kg/h)
                  </label>
                  <input
                    type="number"
                    value={grindingData.equipment.capacity}
                    onChange={(e) => setGrindingData(prev => ({
                      ...prev,
                      equipment: { ...prev.equipment, capacity: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="50"
                  />
                </div>
              </div>
            </div>

            {/* Quality Check */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Quality Check</h4>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Color
                  </label>
                  <select
                    value={grindingData.qualityCheck.color}
                    onChange={(e) => setGrindingData(prev => ({
                      ...prev,
                      qualityCheck: { ...prev.qualityCheck, color: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select</option>
                    <option value="excellent">Excellent</option>
                    <option value="good">Good</option>
                    <option value="fair">Fair</option>
                    <option value="poor">Poor</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Aroma
                  </label>
                  <select
                    value={grindingData.qualityCheck.aroma}
                    onChange={(e) => setGrindingData(prev => ({
                      ...prev,
                      qualityCheck: { ...prev.qualityCheck, aroma: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select</option>
                    <option value="excellent">Excellent</option>
                    <option value="good">Good</option>
                    <option value="fair">Fair</option>
                    <option value="poor">Poor</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Texture
                  </label>
                  <select
                    value={grindingData.qualityCheck.texture}
                    onChange={(e) => setGrindingData(prev => ({
                      ...prev,
                      qualityCheck: { ...prev.qualityCheck, texture: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select</option>
                    <option value="excellent">Excellent</option>
                    <option value="good">Good</option>
                    <option value="fair">Fair</option>
                    <option value="poor">Poor</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Moisture (%)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={grindingData.qualityCheck.moisture}
                    onChange={(e) => setGrindingData(prev => ({
                      ...prev,
                      qualityCheck: { ...prev.qualityCheck, moisture: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="5.00"
                  />
                </div>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                value={grindingData.notes}
                onChange={(e) => setGrindingData(prev => ({ ...prev, notes: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Any additional notes about the grinding process..."
              />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={closeGrindingForm}
                className="btn-outline"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={grindingData.loading}
                className="btn-primary flex items-center"
              >
                {grindingData.loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Recording...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Record Grinding Step
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Active Processes */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="card"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Active Processes</h3>
          
          <div className="space-y-4">
            {activeProcesses.map((process, index) => (
              <div key={process.id} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-medium text-gray-900">{process.equipment}</h4>
                    <p className="text-sm text-gray-600">Batch: {process.batchId}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium text-green-600">Running</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  {process.temperature && (
                    <div className="flex items-center space-x-2">
                      <Thermometer className="w-4 h-4 text-red-500" />
                      <span className="text-sm">
                        {process.temperature}°C / {process.targetTemp}°C
                      </span>
                    </div>
                  )}
                  
                  {process.speed && (
                    <div className="flex items-center space-x-2">
                      <Settings className="w-4 h-4 text-blue-500" />
                      <span className="text-sm">
                        {process.speed} RPM
                      </span>
                    </div>
                  )}
                  
                  <div className="flex items-center space-x-2">
                    <Timer className="w-4 h-4 text-purple-500" />
                    <span className="text-sm">
                      {process.duration}h / {process.targetDuration}h
                    </span>
                  </div>
                  
                  {process.humidity && (
                    <div className="flex items-center space-x-2">
                      <Scale className="w-4 h-4 text-cyan-500" />
                      <span className="text-sm">
                        {process.humidity}% humidity
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="mt-3">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Progress</span>
                    <span>{Math.round((process.duration / process.targetDuration) * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(process.duration / process.targetDuration) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Equipment Status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="card"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Equipment Status</h3>
        
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { name: 'Drying Chamber A', status: 'active', utilization: 85, maintenance: 'Good' },
            { name: 'Grinding Mill B', status: 'active', utilization: 72, maintenance: 'Good' },
            { name: 'Extraction Unit C', status: 'idle', utilization: 0, maintenance: 'Due Soon' }
          ].map((equipment, index) => (
            <div key={index} className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-900">{equipment.name}</h4>
                <div className={`w-3 h-3 rounded-full ${
                  equipment.status === 'active' ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
                }`}></div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Utilization</span>
                  <span className="font-medium">{equipment.utilization}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      equipment.utilization > 80 ? 'bg-red-500' :
                      equipment.utilization > 60 ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${equipment.utilization}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Maintenance</span>
                  <span className={`font-medium ${
                    equipment.maintenance === 'Good' ? 'text-green-600' : 'text-yellow-600'
                  }`}>
                    {equipment.maintenance}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default ProcessorDashboard;
