import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { motion } from 'framer-motion';
import { 
  Leaf, 
  Eye, 
  EyeOff, 
  Lock, 
  Mail, 
  User, 
  MapPin, 
  Building, 
  ArrowRight,
  CheckCircle
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const Register = () => {
  const navigate = useNavigate();
  const { register, loading } = useAuth();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: '',
    organization: '',
    location: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1);

  const roles = [
    {
      id: 'farmer',
      title: 'Farmer/Collector',
      description: 'Collect and record herb information from farms',
      icon: '🌱',
      color: 'from-green-500 to-emerald-600'
    },
    {
      id: 'processor',
      title: 'Processor',
      description: 'Process and prepare herbs for distribution',
      icon: '⚙️',
      color: 'from-blue-500 to-cyan-600'
    },
    {
      id: 'lab',
      title: 'Laboratory',
      description: 'Conduct quality tests and certifications',
      icon: '🔬',
      color: 'from-purple-500 to-pink-600'
    },
    {
      id: 'manufacturer',
      title: 'Manufacturer',
      description: 'Create final products from processed herbs',
      icon: '🏭',
      color: 'from-orange-500 to-red-600'
    },
    {
      id: 'consumer',
      title: 'Consumer',
      description: 'Verify product authenticity and traceability',
      icon: '👤',
      color: 'from-indigo-500 to-purple-600'
    },
    {
      id: 'regulator',
      title: 'Regulator',
      description: 'Oversee compliance and verify certifications',
      icon: '🛡️',
      color: 'from-gray-500 to-gray-600'
    }
  ];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleRoleSelect = (roleId) => {
    setFormData({
      ...formData,
      role: roleId,
    });
    setStep(2);
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      toast.error('Name is required');
      return false;
    }
    if (!formData.email.trim()) {
      toast.error('Email is required');
      return false;
    }
    if (!formData.password) {
      toast.error('Password is required');
      return false;
    }
    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return false;
    }
    if (!formData.role) {
      toast.error('Please select a role');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);

    try {
      const result = await register(formData);
      if (result.success) {
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Registration error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl w-full space-y-8"
      >
        {/* Header */}
        <div className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="mx-auto w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mb-4"
          >
            <Leaf className="w-8 h-8 text-white" />
          </motion.div>
          
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Join <span className="gradient-text">HerbTrace</span>
          </h2>
          <p className="text-gray-600">
            Create your account to start tracking herb authenticity
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="flex items-center justify-center space-x-4 mb-8">
          <div className={`flex items-center space-x-2 ${step >= 1 ? 'text-primary-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              step >= 1 ? 'bg-primary-600 text-white' : 'bg-gray-200'
            }`}>
              1
            </div>
            <span className="text-sm font-medium">Choose Role</span>
          </div>
          <div className={`w-16 h-0.5 ${step >= 2 ? 'bg-primary-600' : 'bg-gray-200'}`}></div>
          <div className={`flex items-center space-x-2 ${step >= 2 ? 'text-primary-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              step >= 2 ? 'bg-primary-600 text-white' : 'bg-gray-200'
            }`}>
              2
            </div>
            <span className="text-sm font-medium">Account Details</span>
          </div>
        </div>

        {step === 1 ? (
          /* Step 1: Role Selection */
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">What's your role?</h3>
              <p className="text-gray-600">Select the role that best describes your involvement in the herb supply chain</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {roles.map((role) => (
                <motion.button
                  key={role.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleRoleSelect(role.id)}
                  className={`p-6 rounded-2xl border-2 text-left transition-all ${
                    formData.role === role.id
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className="text-3xl mb-3">{role.icon}</div>
                  <h4 className="font-semibold text-gray-900 mb-2">{role.title}</h4>
                  <p className="text-sm text-gray-600">{role.description}</p>
                </motion.button>
              ))}
            </div>
          </motion.div>
        ) : (
          /* Step 2: Account Details */
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="max-w-2xl mx-auto"
          >
            <div className="card">
              <div className="text-center mb-6">
                <div className="text-3xl mb-2">
                  {roles.find(r => r.id === formData.role)?.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900">
                  {roles.find(r => r.id === formData.role)?.title}
                </h3>
                <button
                  onClick={() => setStep(1)}
                  className="text-sm text-primary-600 hover:text-primary-700 mt-1"
                >
                  Change role
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  {/* Name Field */}
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="name"
                        name="name"
                        type="text"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        className="input-field pl-10"
                        placeholder="Enter your full name"
                      />
                    </div>
                  </div>

                  {/* Email Field */}
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        className="input-field pl-10"
                        placeholder="Enter your email"
                      />
                    </div>
                  </div>

                  {/* Password Field */}
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="new-password"
                        required
                        value={formData.password}
                        onChange={handleChange}
                        className="input-field pl-10 pr-10"
                        placeholder="Create a password"
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                        ) : (
                          <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password Field */}
                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        autoComplete="new-password"
                        required
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className="input-field pl-10 pr-10"
                        placeholder="Confirm your password"
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                        ) : (
                          <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Organization Field */}
                  <div>
                    <label htmlFor="organization" className="block text-sm font-medium text-gray-700 mb-2">
                      Organization
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Building className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="organization"
                        name="organization"
                        type="text"
                        value={formData.organization}
                        onChange={handleChange}
                        className="input-field pl-10"
                        placeholder="Your organization name"
                      />
                    </div>
                  </div>

                  {/* Location Field */}
                  <div>
                    <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                      Location
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <MapPin className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="location"
                        name="location"
                        type="text"
                        value={formData.location}
                        onChange={handleChange}
                        className="input-field pl-10"
                        placeholder="City, State, Country"
                      />
                    </div>
                  </div>
                </div>

                {/* Terms and Conditions */}
                <div className="flex items-center">
                  <input
                    id="terms"
                    name="terms"
                    type="checkbox"
                    required
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label htmlFor="terms" className="ml-2 block text-sm text-gray-700">
                    I agree to the{' '}
                    <a href="#" className="text-primary-600 hover:text-primary-500">
                      Terms of Service
                    </a>{' '}
                    and{' '}
                    <a href="#" className="text-primary-600 hover:text-primary-500">
                      Privacy Policy
                    </a>
                  </label>
                </div>

                {/* Submit Button */}
                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={isLoading || loading}
                    className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    {isLoading ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Creating account...
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Create Account
                        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    )}
                  </button>
                </div>

                {/* Sign In Link */}
                <div className="text-center pt-4">
                  <p className="text-sm text-gray-600">
                    Already have an account?{' '}
                    <Link
                      to="/login"
                      className="font-medium text-primary-600 hover:text-primary-500 transition-colors"
                    >
                      Sign in here
                    </Link>
                  </p>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default Register;
