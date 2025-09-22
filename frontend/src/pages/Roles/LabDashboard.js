import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { motion } from 'framer-motion';
import {
  FlaskConical,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  FileText,
  Download,
  Upload,
  Microscope,
  BarChart3,
  TrendingUp,
  Award,
  Calendar
} from 'lucide-react';

const LabDashboard = () => {
  const { user } = useAuth();
  const [tests, setTests] = useState([]);
  const [stats, setStats] = useState({
    totalTests: 234,
    pendingTests: 8,
    passRate: 92.3,
    avgTestTime: 2.4,
    completedToday: 12,
    qualityScore: 96.8
  });

  useEffect(() => {
    loadTestData();
  }, []);

  const loadTestData = () => {
    const mockTests = [
      {
        id: 'TEST-2024-001',
        batchId: 'ASH-2024-001',
        herbSpecies: 'Ashwagandha',
        testType: 'Purity Analysis',
        status: 'completed',
        result: 'pass',
        purityLevel: 98.5,
        potency: '2.3% Withanolides',
        submittedDate: '2024-01-18T09:00:00Z',
        completedDate: '2024-01-18T15:30:00Z',
        technician: 'Dr. Priya Sharma',
        certificateNumber: 'CERT-2024-001'
      },
      {
        id: 'TEST-2024-002',
        batchId: 'TUR-2024-045',
        herbSpecies: 'Turmeric',
        testType: 'Curcumin Content',
        status: 'in_progress',
        submittedDate: '2024-01-19T10:00:00Z',
        estimatedCompletion: '2024-01-19T16:00:00Z',
        technician: 'Dr. Rajesh Kumar',
        progress: 75
      },
      {
        id: 'TEST-2024-003',
        batchId: 'NEE-2024-089',
        herbSpecies: 'Neem',
        testType: 'Microbiology Test',
        status: 'pending',
        submittedDate: '2024-01-20T14:00:00Z',
        priority: 'high'
      }
    ];
    setTests(mockTests);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-100';
      case 'in_progress':
        return 'text-blue-600 bg-blue-100';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'failed':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getResultIcon = (result) => {
    switch (result) {
      case 'pass':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'fail':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Laboratory Dashboard</h1>
          <p className="text-gray-600">Quality testing and certification management</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button className="btn-outline flex items-center">
            <Upload className="w-4 h-4 mr-2" />
            Import Results
          </button>
          <button className="btn-primary flex items-center">
            <FlaskConical className="w-4 h-4 mr-2" />
            New Test
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
              <p className="text-sm font-medium text-gray-600 mb-1">Total Tests</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalTests}</p>
              <div className="flex items-center mt-2">
                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-sm font-medium text-green-600">+15.2%</span>
              </div>
            </div>
            <div className="p-3 rounded-xl bg-blue-100">
              <FlaskConical className="w-6 h-6 text-blue-600" />
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
              <p className="text-sm font-medium text-gray-600 mb-1">Pass Rate</p>
              <p className="text-2xl font-bold text-gray-900">{stats.passRate}%</p>
              <div className="flex items-center mt-2">
                <Award className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-sm text-gray-500">Quality metric</span>
              </div>
            </div>
            <div className="p-3 rounded-xl bg-green-100">
              <CheckCircle className="w-6 h-6 text-green-600" />
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
              <p className="text-sm font-medium text-gray-600 mb-1">Pending Tests</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pendingTests}</p>
              <div className="flex items-center mt-2">
                <Clock className="w-4 h-4 text-yellow-500 mr-1" />
                <span className="text-sm text-gray-500">In queue</span>
              </div>
            </div>
            <div className="p-3 rounded-xl bg-yellow-100">
              <Clock className="w-6 h-6 text-yellow-600" />
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
              <p className="text-sm font-medium text-gray-600 mb-1">Avg. Test Time</p>
              <p className="text-2xl font-bold text-gray-900">{stats.avgTestTime}h</p>
              <div className="flex items-center mt-2">
                <BarChart3 className="w-4 h-4 text-purple-500 mr-1" />
                <span className="text-sm text-gray-500">Per test</span>
              </div>
            </div>
            <div className="p-3 rounded-xl bg-purple-100">
              <Microscope className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </motion.div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Active Tests */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="card"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Active Tests</h3>
          
          <div className="space-y-4">
            {tests.map((test, index) => (
              <div key={test.id} className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-medium text-gray-900">{test.testType}</h4>
                    <p className="text-sm text-gray-600">{test.herbSpecies} - {test.batchId}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(test.status)}`}>
                      {test.status.replace('_', ' ')}
                    </span>
                    {test.result && getResultIcon(test.result)}
                  </div>
                </div>
                
                {test.status === 'in_progress' && test.progress && (
                  <div className="mb-3">
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Progress</span>
                      <span>{test.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${test.progress}%` }}
                      ></div>
                    </div>
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Technician</p>
                    <p className="font-medium">{test.technician || 'Unassigned'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Submitted</p>
                    <p className="font-medium">{new Date(test.submittedDate).toLocaleDateString()}</p>
                  </div>
                </div>
                
                {test.result === 'pass' && (
                  <div className="mt-3 p-3 bg-green-50 rounded-lg">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      {test.purityLevel && (
                        <div>
                          <p className="text-green-600 font-medium">Purity: {test.purityLevel}%</p>
                        </div>
                      )}
                      {test.potency && (
                        <div>
                          <p className="text-green-600 font-medium">Potency: {test.potency}</p>
                        </div>
                      )}
                    </div>
                    {test.certificateNumber && (
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-xs text-green-600">Certificate: {test.certificateNumber}</span>
                        <button className="text-xs text-green-600 hover:text-green-700 flex items-center">
                          <Download className="w-3 h-3 mr-1" />
                          Download
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Test Categories */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="card"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Test Categories</h3>
          
          <div className="space-y-4">
            {[
              { name: 'Purity Analysis', count: 45, passRate: 96.2, icon: '🧪' },
              { name: 'Potency Testing', count: 38, passRate: 94.7, icon: '💊' },
              { name: 'Contamination Check', count: 52, passRate: 98.1, icon: '🔬' },
              { name: 'Microbiology', count: 29, passRate: 89.6, icon: '🦠' },
              { name: 'Heavy Metals', count: 34, passRate: 97.1, icon: '⚗️' },
              { name: 'Authenticity', count: 36, passRate: 95.8, icon: '🔍' }
            ].map((category, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{category.icon}</span>
                  <div>
                    <p className="font-medium text-gray-900">{category.name}</p>
                    <p className="text-sm text-gray-600">{category.count} tests this month</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">{category.passRate}%</p>
                  <p className="text-xs text-gray-500">Pass rate</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Equipment & Resources */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="card"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Laboratory Resources</h3>
        
        <div className="grid md:grid-cols-4 gap-6">
          {[
            { name: 'HPLC System', status: 'operational', utilization: 85, nextMaintenance: '2024-02-15' },
            { name: 'Microscope Array', status: 'operational', utilization: 72, nextMaintenance: '2024-01-30' },
            { name: 'Spectrophotometer', status: 'maintenance', utilization: 0, nextMaintenance: '2024-01-25' },
            { name: 'Incubator Units', status: 'operational', utilization: 90, nextMaintenance: '2024-03-01' }
          ].map((equipment, index) => (
            <div key={index} className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-900 text-sm">{equipment.name}</h4>
                <div className={`w-3 h-3 rounded-full ${
                  equipment.status === 'operational' ? 'bg-green-500' :
                  equipment.status === 'maintenance' ? 'bg-yellow-500' : 'bg-red-500'
                }`}></div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600">Utilization</span>
                  <span className="font-medium">{equipment.utilization}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div 
                    className={`h-1.5 rounded-full ${
                      equipment.utilization > 80 ? 'bg-red-500' :
                      equipment.utilization > 60 ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${equipment.utilization}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600">Next Service</span>
                  <span className="font-medium">{new Date(equipment.nextMaintenance).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Quality Metrics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="card"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Quality Metrics</h3>
        
        <div className="grid md:grid-cols-3 gap-6">
          <div className="text-center p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl">
            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3">
              <Award className="w-6 h-6 text-white" />
            </div>
            <h4 className="font-semibold text-gray-900 mb-1">Overall Quality Score</h4>
            <p className="text-2xl font-bold text-green-600">{stats.qualityScore}%</p>
            <p className="text-sm text-gray-600">Excellent performance</p>
          </div>
          
          <div className="text-center p-6 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl">
            <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-3">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <h4 className="font-semibold text-gray-900 mb-1">Tests Completed Today</h4>
            <p className="text-2xl font-bold text-blue-600">{stats.completedToday}</p>
            <p className="text-sm text-gray-600">Above average productivity</p>
          </div>
          
          <div className="text-center p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
            <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-3">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <h4 className="font-semibold text-gray-900 mb-1">Certificates Issued</h4>
            <p className="text-2xl font-bold text-purple-600">187</p>
            <p className="text-sm text-gray-600">This month</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default LabDashboard;
