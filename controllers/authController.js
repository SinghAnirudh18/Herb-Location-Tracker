// Authentication controller for user management
const User = require('../models/User');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

const register = async (req, res) => {
  try {
    const { name, email, password, role, organization, location } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ 
        success: false, 
        message: 'User already exists' 
      });
    }

    const user = await User.create({
      name,
      email,
      password,
      role,
      organization,
      location: location || 'Not specified'
    });

    if (user) {
      res.status(201).json({
        success: true,
        token: generateToken(user._id),
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          organization: user.organization,
          location: user.location,
          createdAt: user.createdAt
        }
      });
    } else {
      res.status(400).json({ 
        success: false, 
        message: 'Invalid user data' 
      });
    }
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      res.json({
        success: true,
        token: generateToken(user._id),
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          organization: user.organization,
          location: user.location,
          createdAt: user.createdAt
        }
      });
    } else {
      res.status(401).json({ 
        success: false, 
        message: 'Invalid email or password' 
      });
    }
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json({
      success: true,
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      organization: user.organization,
      location: user.location,
      createdAt: user.createdAt
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { name, organization, location } = req.body;
    
    const user = await User.findById(req.user.id);
    
    if (user) {
      user.name = name || user.name;
      user.organization = organization || user.organization;
      user.location = location || user.location;
      
      const updatedUser = await user.save();
      
      res.json({
        success: true,
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        organization: updatedUser.organization,
        location: updatedUser.location,
        createdAt: updatedUser.createdAt
      });
    } else {
      res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    const user = await User.findById(req.user.id);
    
    if (user && (await user.matchPassword(currentPassword))) {
      user.password = newPassword;
      await user.save();
      
      res.json({
        success: true,
        message: 'Password updated successfully'
      });
    } else {
      res.status(400).json({ 
        success: false, 
        message: 'Current password is incorrect' 
      });
    }
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

module.exports = { register, login, getProfile, updateProfile, changePassword };