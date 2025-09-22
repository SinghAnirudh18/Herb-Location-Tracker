import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { BlockchainProvider } from './contexts/BlockchainContext';

// Layout Components
import Navbar from './components/Layout/Navbar';
import Sidebar from './components/Layout/Sidebar';

// Pages
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import TraceabilityFlow from './pages/TraceabilityFlow';
import BatchDetails from './pages/BatchDetails';
import QRScanner from './pages/QRScanner';
import Analytics from './pages/Analytics';
import Profile from './pages/Profile';
import Settings from './pages/Settings';

// Role-specific pages
import FarmerDashboard from './pages/Roles/FarmerDashboard';
import ProcessorDashboard from './pages/Roles/ProcessorDashboard';
import LabDashboard from './pages/Roles/LabDashboard';
import ConsumerDashboard from './pages/Roles/ConsumerDashboard';

// Protected Route Component
import ProtectedRoute from './components/Auth/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <BlockchainProvider>
        <Router>
          <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
            <Toaster 
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '12px',
                  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                },
                success: {
                  iconTheme: {
                    primary: '#22c55e',
                    secondary: '#ffffff',
                  },
                },
                error: {
                  iconTheme: {
                    primary: '#ef4444',
                    secondary: '#ffffff',
                  },
                },
              }}
            />
            
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/scan" element={<QRScanner />} />
              <Route path="/trace/:batchId" element={<BatchDetails />} />
              
              {/* Protected Routes */}
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <div className="flex">
                    <Sidebar />
                    <div className="flex-1 flex flex-col">
                      <Navbar />
                      <main className="flex-1 p-6">
                        <Dashboard />
                      </main>
                    </div>
                  </div>
                </ProtectedRoute>
              } />
              
              <Route path="/traceability" element={
                <ProtectedRoute>
                  <div className="flex">
                    <Sidebar />
                    <div className="flex-1 flex flex-col">
                      <Navbar />
                      <main className="flex-1 p-6">
                        <TraceabilityFlow />
                      </main>
                    </div>
                  </div>
                </ProtectedRoute>
              } />
              
              <Route path="/analytics" element={
                <ProtectedRoute>
                  <div className="flex">
                    <Sidebar />
                    <div className="flex-1 flex flex-col">
                      <Navbar />
                      <main className="flex-1 p-6">
                        <Analytics />
                      </main>
                    </div>
                  </div>
                </ProtectedRoute>
              } />
              
              <Route path="/profile" element={
                <ProtectedRoute>
                  <div className="flex">
                    <Sidebar />
                    <div className="flex-1 flex flex-col">
                      <Navbar />
                      <main className="flex-1 p-6">
                        <Profile />
                      </main>
                    </div>
                  </div>
                </ProtectedRoute>
              } />
              
              <Route path="/settings" element={
                <ProtectedRoute>
                  <div className="flex">
                    <Sidebar />
                    <div className="flex-1 flex flex-col">
                      <Navbar />
                      <main className="flex-1 p-6">
                        <Settings />
                      </main>
                    </div>
                  </div>
                </ProtectedRoute>
              } />
              
              {/* Role-specific Routes */}
              <Route path="/farmer" element={
                <ProtectedRoute requiredRole="farmer">
                  <div className="flex">
                    <Sidebar />
                    <div className="flex-1 flex flex-col">
                      <Navbar />
                      <main className="flex-1 p-6">
                        <FarmerDashboard />
                      </main>
                    </div>
                  </div>
                </ProtectedRoute>
              } />
              
              <Route path="/processor" element={
                <ProtectedRoute requiredRole="processor">
                  <div className="flex">
                    <Sidebar />
                    <div className="flex-1 flex flex-col">
                      <Navbar />
                      <main className="flex-1 p-6">
                        <ProcessorDashboard />
                      </main>
                    </div>
                  </div>
                </ProtectedRoute>
              } />
              
              <Route path="/lab" element={
                <ProtectedRoute requiredRole="lab">
                  <div className="flex">
                    <Sidebar />
                    <div className="flex-1 flex flex-col">
                      <Navbar />
                      <main className="flex-1 p-6">
                        <LabDashboard />
                      </main>
                    </div>
                  </div>
                </ProtectedRoute>
              } />
              
              <Route path="/consumer" element={
                <ProtectedRoute requiredRole="consumer">
                  <div className="flex">
                    <Sidebar />
                    <div className="flex-1 flex flex-col">
                      <Navbar />
                      <main className="flex-1 p-6">
                        <ConsumerDashboard />
                      </main>
                    </div>
                  </div>
                </ProtectedRoute>
              } />
            </Routes>
          </div>
        </Router>
      </BlockchainProvider>
    </AuthProvider>
  );
}

export default App;
