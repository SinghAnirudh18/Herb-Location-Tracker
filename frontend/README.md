# HerbTrace Frontend

A modern React application for Ayurvedic herb traceability with blockchain integration.

## 🚀 Features

### Real-Time Functionality
- **Live Updates**: WebSocket integration for real-time batch updates
- **Role-Based Access**: Different dashboards for farmers, processors, labs, and consumers
- **Blockchain Integration**: MetaMask wallet connection and smart contract interaction
- **QR Code Scanner**: Real-time product verification
- **Analytics Dashboard**: Comprehensive data visualization

### User Roles & Permissions

#### 👨‍🌾 Farmer Dashboard
- View **only their own** collections and batches
- Record new herb collections with GPS coordinates
- Upload photos and documentation
- Track processing status of their batches
- Real-time weather data for optimal harvesting

#### 🏭 Processor Dashboard
- View **only assigned batches** from farmers
- Cannot see all farmer data - only batches assigned to them
- Start and monitor processing operations
- Update processing status in real-time
- Equipment monitoring and utilization

#### 🔬 Lab Dashboard
- View **only batches assigned** for testing
- Conduct quality tests and record results
- Generate certificates and compliance reports
- Equipment status and maintenance tracking

#### 👤 Consumer Dashboard
- **Public access** to verify any product via QR code
- View complete traceability chain
- Report issues with products
- No access to sensitive farmer/processor data

### Security & Privacy
- **JWT Authentication**: Secure token-based authentication
- **Role-Based Access Control**: Users can only access their own data or assigned batches
- **API Rate Limiting**: Protection against abuse
- **Data Encryption**: Sensitive data encrypted in transit and at rest

## 🛠️ Technology Stack

- **Frontend**: React 18, TypeScript (optional)
- **Styling**: Tailwind CSS with custom components
- **Animations**: Framer Motion
- **Charts**: Recharts for data visualization
- **State Management**: React Context + Hooks
- **Real-time**: WebSocket for live updates
- **Blockchain**: Ethers.js for Web3 integration
- **HTTP Client**: Axios with interceptors

## 📦 Installation

### Prerequisites
- Node.js 16+ and npm
- Backend server running on port 5000
- MetaMask browser extension (for blockchain features)

### Setup

1. **Install Dependencies**
```bash
cd frontend
npm install
```

2. **Environment Configuration**
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. **Start Development Server**
```bash
npm start
```

The app will open at `http://localhost:3000`

## 🔧 Configuration

### Environment Variables

```env
# API Configuration
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_WS_URL=ws://localhost:5000

# Blockchain Configuration
REACT_APP_BLOCKCHAIN_NETWORK=sepolia
REACT_APP_ETHERSCAN_URL=https://sepolia.etherscan.io

# Optional APIs
REACT_APP_WEATHER_API_KEY=your_weather_api_key
REACT_APP_MAPS_API_KEY=your_maps_api_key
```

### Backend Integration

The frontend connects to the backend API with the following endpoints:

#### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/me` - Get current user profile

#### Farmer APIs
- `GET /api/farmers/my-collections` - Get farmer's own collections only
- `POST /api/farmers/collections` - Create new collection
- `GET /api/farmers/my-stats` - Get farmer's statistics

#### Processor APIs
- `GET /api/processors/assigned-batches` - Get batches assigned to this processor
- `POST /api/processors/batches/:id/start-processing` - Start processing

#### Lab APIs
- `GET /api/labs/assigned-batches` - Get batches assigned for testing
- `POST /api/labs/batches/:id/quality-test` - Record quality test

#### Consumer APIs
- `GET /api/consumers/verify/:id` - Verify product (public access)
- `GET /api/consumers/batch/:id` - Get batch info (public access)

## 🔄 Real-Time Features

### WebSocket Events

The app subscribes to real-time events:

```javascript
// Batch updates
websocketService.on('batchUpdated', (data) => {
  // Only updates if user has access to this batch
});

// Processing updates
websocketService.on('processingStarted', (data) => {
  // Notifies farmer when their batch starts processing
});

// Quality test results
websocketService.on('qualityTestCompleted', (data) => {
  // Notifies farmer of test results
});
```

### Role-Based Event Filtering

Events are filtered based on user roles:
- **Farmers**: Only receive updates for their own batches
- **Processors**: Only receive updates for assigned batches
- **Labs**: Only receive updates for batches they're testing
- **Consumers**: Receive public verification updates

## 🎨 UI Components

### Custom Components
- `Card` - Glassmorphism card with hover effects
- `Button` - Primary, secondary, and outline variants
- `StatusBadge` - Color-coded status indicators
- `LoadingSpinner` - Animated loading states
- `QRScanner` - Camera-based QR code scanning

### Animations
- **Page Transitions**: Smooth fade and slide animations
- **Loading States**: Skeleton screens and spinners
- **Interactive Elements**: Hover and click animations
- **Real-time Updates**: Smooth data transitions

## 🔐 Security Implementation

### Authentication Flow
1. User logs in with email/password
2. Backend returns JWT token
3. Token stored in localStorage
4. All API requests include Authorization header
5. WebSocket connection authenticated with token

### Role-Based Access
```javascript
// Example: Farmer can only see their own data
const collections = await farmerAPI.getMyCollections(); // Only farmer's data

// Processor can only see assigned batches
const batches = await processorAPI.getAssignedBatches(); // Only assigned batches

// Consumer has public access to verification
const verification = await consumerAPI.verifyProduct(qrCode); // Public data only
```

### Data Privacy
- Farmers cannot see other farmers' data
- Processors cannot access farmer's personal information
- Labs only see batches assigned for testing
- All sensitive operations require authentication

## 📱 Responsive Design

- **Mobile First**: Optimized for mobile devices
- **Tablet Support**: Adaptive layouts for tablets
- **Desktop**: Full-featured desktop experience
- **Touch Friendly**: Large touch targets and gestures

## 🧪 Testing

### Unit Tests
```bash
npm test
```

### E2E Tests
```bash
npm run test:e2e
```

### API Integration Tests
```bash
npm run test:api
```

## 🚀 Deployment

### Production Build
```bash
npm run build
```

### Environment-Specific Builds
```bash
# Staging
npm run build:staging

# Production
npm run build:production
```

## 📊 Performance

### Optimization Features
- **Code Splitting**: Lazy loading of route components
- **Image Optimization**: WebP format with fallbacks
- **Caching**: Service worker for offline functionality
- **Bundle Analysis**: Webpack bundle analyzer integration

### Performance Metrics
- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Time to Interactive**: < 3.5s
- **Cumulative Layout Shift**: < 0.1

## 🐛 Troubleshooting

### Common Issues

1. **WebSocket Connection Failed**
   - Check if backend server is running
   - Verify WS_URL in environment variables
   - Check firewall settings

2. **MetaMask Connection Issues**
   - Ensure MetaMask is installed
   - Switch to Sepolia testnet
   - Check if wallet is unlocked

3. **API Authentication Errors**
   - Clear localStorage and re-login
   - Check if backend JWT_SECRET matches
   - Verify API_URL configuration

### Debug Mode
```bash
# Enable debug logging
REACT_APP_DEBUG=true npm start
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Submit pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation wiki

---

**Built with ❤️ for Ayurvedic herb authenticity and traceability**
