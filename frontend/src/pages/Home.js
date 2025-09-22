import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Leaf, 
  Shield, 
  Zap, 
  Globe, 
  QrCode, 
  TrendingUp,
  Users,
  Award,
  ChevronRight,
  Play,
  CheckCircle,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useBlockchain } from '../contexts/BlockchainContext';

const Home = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { blockchainStatus } = useBlockchain();
  const [stats, setStats] = useState({
    totalBatches: 12847,
    verifiedProducts: 8932,
    activeUsers: 2156,
    carbonSaved: 45.2
  });

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.3,
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100
      }
    }
  };

  const floatingVariants = {
    animate: {
      y: [-10, 10, -10],
      transition: {
        duration: 6,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  // Features data
  const features = [
    {
      icon: <Leaf className="w-8 h-8" />,
      title: "Complete Traceability",
      description: "Track every herb from seed to shelf with blockchain-verified authenticity",
      color: "from-green-500 to-emerald-600"
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Quality Assurance",
      description: "Lab-verified quality tests and compliance certificates on blockchain",
      color: "from-blue-500 to-cyan-600"
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Real-time Verification",
      description: "Instant QR code scanning for immediate product authentication",
      color: "from-purple-500 to-pink-600"
    },
    {
      icon: <Globe className="w-8 h-8" />,
      title: "Global Standards",
      description: "Compliant with international Ayurvedic and herbal medicine regulations",
      color: "from-orange-500 to-red-600"
    }
  ];

  // Process steps
  const processSteps = [
    {
      step: "01",
      title: "Collection",
      description: "Farmers record herb collection with GPS location and quality metrics",
      icon: <Leaf className="w-6 h-6" />
    },
    {
      step: "02", 
      title: "Processing",
      description: "Each processing step is documented with batch tracking",
      icon: <Zap className="w-6 h-6" />
    },
    {
      step: "03",
      title: "Quality Testing",
      description: "Lab analysis and certification recorded on blockchain",
      icon: <Shield className="w-6 h-6" />
    },
    {
      step: "04",
      title: "Consumer Access",
      description: "QR code scanning reveals complete product journey",
      icon: <QrCode className="w-6 h-6" />
    }
  ];

  return (
    <div className="min-h-screen overflow-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 glass-effect border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <motion.div 
              className="flex items-center space-x-2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                <Leaf className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold gradient-text">HerbTrace</span>
            </motion.div>

            <motion.div 
              className="flex items-center space-x-4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              {blockchainStatus.connected && (
                <div className="flex items-center space-x-2 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span>Blockchain Connected</span>
                </div>
              )}
              
              {isAuthenticated ? (
                <Link to="/dashboard" className="btn-primary">
                  Dashboard
                </Link>
              ) : (
                <div className="flex items-center space-x-3">
                  <Link to="/login" className="text-gray-700 hover:text-primary-600 font-medium transition-colors">
                    Login
                  </Link>
                  <Link to="/register" className="btn-primary">
                    Get Started
                  </Link>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-green-50 via-white to-blue-50"></div>
        
        {/* Floating Elements */}
        <motion.div 
          className="absolute top-20 left-10 w-20 h-20 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full opacity-20"
          variants={floatingVariants}
          animate="animate"
        />
        <motion.div 
          className="absolute top-40 right-20 w-16 h-16 bg-gradient-to-r from-blue-400 to-cyan-500 rounded-full opacity-20"
          variants={floatingVariants}
          animate="animate"
          transition={{ delay: 1 }}
        />
        <motion.div 
          className="absolute bottom-20 left-1/4 w-12 h-12 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full opacity-20"
          variants={floatingVariants}
          animate="animate"
          transition={{ delay: 2 }}
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={itemVariants} className="mb-6">
              <span className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 rounded-full text-sm font-medium">
                <Sparkles className="w-4 h-4 mr-2" />
                Powered by Blockchain Technology
              </span>
            </motion.div>

            <motion.h1 
              variants={itemVariants}
              className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight"
            >
              <span className="gradient-text">Ayurvedic Herb</span>
              <br />
              <span className="text-gray-800">Traceability</span>
            </motion.h1>

            <motion.p 
              variants={itemVariants}
              className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed"
            >
              Ensuring authenticity and quality of Ayurvedic herbs through 
              <span className="text-primary-600 font-semibold"> blockchain-powered traceability</span> 
              from farm to pharmacy.
            </motion.p>

            <motion.div 
              variants={itemVariants}
              className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6"
            >
              <Link to="/register" className="btn-primary text-lg px-8 py-4">
                Start Tracing
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
              
              <Link to="/scan" className="btn-outline text-lg px-8 py-4">
                <QrCode className="w-5 h-5 mr-2" />
                Scan Product
              </Link>
            </motion.div>

            {/* Stats */}
            <motion.div 
              variants={itemVariants}
              className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16"
            >
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold gradient-text mb-2">
                  {stats.totalBatches.toLocaleString()}+
                </div>
                <div className="text-gray-600">Batches Tracked</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold gradient-text mb-2">
                  {stats.verifiedProducts.toLocaleString()}+
                </div>
                <div className="text-gray-600">Verified Products</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold gradient-text mb-2">
                  {stats.activeUsers.toLocaleString()}+
                </div>
                <div className="text-gray-600">Active Users</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold gradient-text mb-2">
                  {stats.carbonSaved}kg
                </div>
                <div className="text-gray-600">CO₂ Saved</div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Why Choose <span className="gradient-text">HerbTrace</span>?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Revolutionary blockchain technology meets traditional Ayurvedic wisdom
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="card group cursor-pointer"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <div className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              How It <span className="gradient-text">Works</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From farm to pharmacy, every step is recorded and verified
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {processSteps.map((step, index) => (
              <motion.div
                key={index}
                className="relative"
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
              >
                {/* Connection Line */}
                {index < processSteps.length - 1 && (
                  <div className="hidden lg:block absolute top-12 left-full w-full h-0.5 bg-gradient-to-r from-primary-300 to-primary-500 z-0"></div>
                )}
                
                <div className="relative z-10 text-center">
                  <div className="w-24 h-24 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white mx-auto mb-6 shadow-lg">
                    <div className="text-center">
                      <div className="text-xs font-bold opacity-80">{step.step}</div>
                      {step.icon}
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-primary-700 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to Transform Your Supply Chain?
            </h2>
            <p className="text-xl text-green-100 mb-8 max-w-3xl mx-auto">
              Join thousands of farmers, processors, and consumers who trust HerbTrace 
              for authentic Ayurvedic herb verification.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
              <Link to="/register" className="bg-white text-primary-600 hover:bg-gray-50 font-medium px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                Get Started Free
                <ArrowRight className="w-5 h-5 ml-2 inline" />
              </Link>
              
              <Link to="/scan" className="border-2 border-white text-white hover:bg-white hover:text-primary-600 font-medium px-8 py-4 rounded-xl transition-all duration-300 transform hover:scale-105">
                <QrCode className="w-5 h-5 mr-2 inline" />
                Try QR Scanner
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                  <Leaf className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">HerbTrace</span>
              </div>
              <p className="text-gray-400 leading-relaxed">
                Revolutionizing Ayurvedic herb traceability with blockchain technology.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Platform</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/scan" className="hover:text-white transition-colors">QR Scanner</Link></li>
                <li><Link to="/register" className="hover:text-white transition-colors">Get Started</Link></li>
                <li><Link to="/login" className="hover:text-white transition-colors">Login</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Resources</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API Reference</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Support</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 HerbTrace. All rights reserved. Built with ❤️ for Ayurvedic authenticity.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
