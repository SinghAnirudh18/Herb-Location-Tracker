# Herb Traceability System - Complete API Documentation

## Overview

This document provides comprehensive documentation for all API endpoints in the Herb Traceability System with blockchain integration.

## Base URL
```
http://localhost:5000/api
```

## Authentication
All endpoints (except health check) require authentication. Include the JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

---

## 🔗 Blockchain Routes

### Core Blockchain Information

#### Get Blockchain Network Information
```http
GET /api/blockchain/network
```
**Response:**
```json
{
  "message": "Blockchain network information",
  "network": {
    "chainId": "1337",
    "name": "localhost",
    "blockNumber": 12345,
    "gasPrice": {
      "gasPrice": "20000000000",
      "maxFeePerGas": "25000000000",
      "maxPriorityFeePerGas": "2000000000"
    }
  }
}
```

#### Get Blockchain Status
```http
GET /api/blockchain/status
```
**Response:**
```json
{
  "message": "Blockchain status",
  "status": {
    "connected": true,
    "blockNumber": 12345,
    "gasPrice": "20000000000",
    "network": "localhost",
    "chainId": "1337",
    "timestamp": "2024-01-15T10:30:00.000Z"
  }
}
```

#### Get Latest Block
```http
GET /api/blockchain/latest-block
```

#### Get Specific Block
```http
GET /api/blockchain/block/:blockNumber
```

#### Get Transaction by Hash
```http
GET /api/blockchain/transaction/:txHash
```

#### Get Contract Addresses
```http
GET /api/blockchain/contracts
```
**Response:**
```json
{
  "message": "Smart contract addresses",
  "contracts": {
    "herbTraceability": "0x1234...",
    "complianceManager": "0x5678...",
    "sustainabilityTracker": "0x9abc..."
  }
}
```

---

## 🌱 Collection Routes

### Record Collection Event
```http
POST /api/blockchain/collection/record
```
**Request Body:**
```json
{
  "batchId": "BATCH_001_2024",
  "species": "Withania somnifera",
  "latitude": 30.3753,
  "longitude": 78.0042,
  "quantity": 100,
  "qualityMetrics": {
    "moistureContent": 8.5,
    "foreignMatter": 1.2,
    "otherImpurities": 0.5
  },
  "sustainabilityCompliance": {
    "isWithinApprovedZone": true,
    "isWithinSeason": true,
    "isWithinQuota": true
  },
  "images": ["image1.jpg", "image2.jpg"],
  "documents": ["certificate.pdf"]
}
```

### Get Collection Event
```http
GET /api/blockchain/collection/:batchId
```

### Verify Collection Event
```http
GET /api/blockchain/collection/:batchId/verify
```

### Get Collection History by Collector
```http
GET /api/blockchain/collection/collector/:collectorAddress?limit=50&offset=0
```

### Get Collections by Species
```http
GET /api/blockchain/collection/species/:species?limit=50&offset=0
```

### Get Collections by Location
```http
GET /api/blockchain/collection/location/nearby?latitude=30.3753&longitude=78.0042&radius=10
```

### Get Collection Statistics
```http
GET /api/blockchain/collection/stats/overview
```

---

## ⚙️ Processing Routes

### Record Processing Step
```http
POST /api/blockchain/processing/record
```
**Request Body:**
```json
{
  "batchId": "PROC_001_2024",
  "stepType": "drying",
  "inputBatchId": "BATCH_001_2024",
  "outputBatchId": "DRIED_001_2024",
  "processDetails": {
    "temperature": 45,
    "duration": 24,
    "method": "air_drying"
  },
  "images": ["before.jpg", "after.jpg"],
  "documents": ["process_log.pdf"]
}
```

### Get Processing Step
```http
GET /api/blockchain/processing/:batchId
```

### Get Processing Chain
```http
GET /api/blockchain/processing/chain/:batchId
```

### Get Processing Steps by Processor
```http
GET /api/blockchain/processing/processor/:processorAddress?limit=50&offset=0
```

### Get Processing Steps by Type
```http
GET /api/blockchain/processing/type/:stepType?limit=50&offset=0
```

### Get Processing Timeline
```http
GET /api/blockchain/processing/timeline/:batchId
```

---

## 🧪 Quality Test Routes

### Record Quality Test
```http
POST /api/blockchain/quality/record
```
**Request Body:**
```json
{
  "batchId": "BATCH_001_2024",
  "testType": "comprehensive",
  "testResults": {
    "moistureContent": {
      "value": 8.5,
      "passed": true,
      "limit": 12
    },
    "pesticideResidue": {
      "value": 0.05,
      "passed": true,
      "limit": 0.1
    },
    "heavyMetals": {
      "value": 0.02,
      "passed": true,
      "limit": 0.05
    },
    "microbialContamination": {
      "value": 100,
      "passed": true,
      "limit": 1000
    },
    "dnaBarcode": {
      "speciesIdentified": "Withania somnifera",
      "matchConfidence": 99.8,
      "passed": true
    }
  },
  "passed": true,
  "certificateUrl": "certificate.pdf",
  "testImages": ["test1.jpg", "test2.jpg"],
  "labReports": ["report.pdf"]
}
```

### Get Quality Test
```http
GET /api/blockchain/quality/:batchId
```

### Get Quality Test Certificate
```http
GET /api/blockchain/quality/:batchId/certificate
```

### Get Quality Tests by Lab
```http
GET /api/blockchain/quality/lab/:labAddress?limit=50&offset=0
```

### Get Quality Tests by Type
```http
GET /api/blockchain/quality/type/:testType?limit=50&offset=0
```

### Get Quality Tests by Result
```http
GET /api/blockchain/quality/result/:passed?limit=50&offset=0
```

### Get Quality Test Timeline
```http
GET /api/blockchain/quality/timeline/:batchId
```

---

## 📦 Product Routes

### Create Product
```http
POST /api/blockchain/product/create
```
**Request Body:**
```json
{
  "batchId": "PROD_001_2024",
  "productName": "Premium Ashwagandha Powder",
  "formulation": {
    "ingredients": [
      {
        "name": "Withania somnifera root powder",
        "percentage": 100
      }
    ],
    "dosageForm": "powder",
    "batchSize": 1000
  },
  "qrCode": "QR_ASHWAGANDHA_001_2024",
  "productImages": ["product1.jpg", "product2.jpg"],
  "packagingImages": ["packaging1.jpg"],
  "documentation": ["label.pdf", "instructions.pdf"]
}
```

### Get Product
```http
GET /api/blockchain/product/:batchId
```

### Get Product by QR Code
```http
GET /api/blockchain/product/qr/:qrCode
```

### Get Product Traceability Chain
```http
GET /api/blockchain/product/:batchId/traceability
```

### Get Product Quality Summary
```http
GET /api/blockchain/product/:batchId/quality-summary
```

### Get Products by Manufacturer
```http
GET /api/blockchain/product/manufacturer/:manufacturerAddress?limit=50&offset=0
```

### Get Products by Name
```http
GET /api/blockchain/product/name/:productName?limit=50&offset=0
```

### Get Product Timeline
```http
GET /api/blockchain/product/:batchId/timeline
```

---

## ✅ Verification Routes

### Verify Batch
```http
POST /api/verification/batch/:batchId
```

### Generate Verification Report
```http
GET /api/verification/report/:batchId
```

### Get Verification Status
```http
GET /api/verification/status/:batchId
```

### Verify Compliance
```http
POST /api/verification/compliance/:batchId
```

### Verify Sustainability
```http
POST /api/verification/sustainability/:batchId
```

### Verify Quality
```http
POST /api/verification/quality/:batchId
```

### Get Verification History
```http
GET /api/verification/history/:batchId
```

### Bulk Verification
```http
POST /api/verification/bulk
```
**Request Body:**
```json
{
  "batchIds": ["BATCH_001_2024", "BATCH_002_2024", "BATCH_003_2024"]
}
```

---

## 📁 IPFS Routes

### Get IPFS Node Information
```http
GET /api/blockchain/ipfs/info
```

### Get Pinned Files
```http
GET /api/blockchain/ipfs/pinned
```

### Upload File to IPFS
```http
POST /api/blockchain/ipfs/upload
```
**Request Body:**
```json
{
  "data": {
    "type": "document",
    "content": "file content or metadata"
  },
  "fileName": "document.pdf"
}
```

### Get File from IPFS
```http
GET /api/blockchain/ipfs/file/:hash
```

---

## 🔐 Authentication Routes

### Register User
```http
POST /api/auth/register
```
**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "collector",
  "organization": "Herb Farm Co."
}
```

### Login User
```http
POST /api/auth/login
```
**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

### Get Current User
```http
GET /api/auth/me
```

---

## 👥 User Role Routes

### Farmer/Collector Routes
```http
GET /api/farmers/collections
POST /api/farmers/collections
GET /api/farmers/collections/:id
```

### Processor Routes
```http
GET /api/processors/processing
POST /api/processors/processing
GET /api/processors/processing/:id
```

### Lab Routes
```http
GET /api/labs/tests
POST /api/labs/tests
GET /api/labs/tests/:id
```

### Consumer Routes
```http
GET /api/consumers/verify/:qrCode
GET /api/consumers/traceability/:batchId
```

---

## 📊 Statistics Routes

### Get Collection Statistics
```http
GET /api/blockchain/collection/stats/overview
```

### Get Processing Statistics
```http
GET /api/blockchain/processing/stats/overview
```

### Get Quality Statistics
```http
GET /api/blockchain/quality/stats/overview
```

### Get Product Statistics
```http
GET /api/blockchain/product/stats/overview
```

---

## 🚨 Error Responses

### 400 Bad Request
```json
{
  "message": "Missing required fields: batchId, species, latitude, longitude, quantity"
}
```

### 401 Unauthorized
```json
{
  "message": "Access denied. No token provided."
}
```

### 404 Not Found
```json
{
  "message": "Collection event not found"
}
```

### 500 Internal Server Error
```json
{
  "message": "Error recording collection on blockchain",
  "error": "Transaction failed"
}
```

---

## 🔄 Response Format

All successful responses follow this format:
```json
{
  "message": "Operation completed successfully",
  "data": {
    // Response data
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

---

## 📝 Usage Examples

### Complete Herb Traceability Workflow

1. **Record Collection**
```bash
curl -X POST http://localhost:5000/api/blockchain/collection/record \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "batchId": "BATCH_001_2024",
    "species": "Withania somnifera",
    "latitude": 30.3753,
    "longitude": 78.0042,
    "quantity": 100
  }'
```

2. **Record Processing**
```bash
curl -X POST http://localhost:5000/api/blockchain/processing/record \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "batchId": "PROC_001_2024",
    "stepType": "drying",
    "inputBatchId": "BATCH_001_2024",
    "outputBatchId": "DRIED_001_2024"
  }'
```

3. **Record Quality Test**
```bash
curl -X POST http://localhost:5000/api/blockchain/quality/record \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "batchId": "BATCH_001_2024",
    "testType": "comprehensive",
    "passed": true
  }'
```

4. **Create Product**
```bash
curl -X POST http://localhost:5000/api/blockchain/product/create \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "batchId": "PROD_001_2024",
    "productName": "Premium Ashwagandha Powder",
    "qrCode": "QR_ASHWAGANDHA_001_2024"
  }'
```

5. **Verify Product**
```bash
curl -X GET http://localhost:5000/api/verification/status/PROD_001_2024 \
  -H "Authorization: Bearer <token>"
```

---

## 🛠️ Development Setup

1. **Install Dependencies**
```bash
npm install
```

2. **Set Environment Variables**
```bash
cp env.example .env
# Edit .env with your configuration
```

3. **Start IPFS**
```bash
ipfs daemon
```

4. **Start Blockchain (Ganache)**
```bash
ganache-cli --port 8545
```

5. **Deploy Smart Contracts**
```bash
truffle migrate --network development
```

6. **Start Server**
```bash
npm run dev
```

---

## 📈 Monitoring

### Health Check
```http
GET /api/health
```

### Blockchain Status
```http
GET /api/blockchain/status
```

### IPFS Status
```http
GET /api/blockchain/ipfs/info
```

This comprehensive API documentation covers all endpoints in the Herb Traceability System with full blockchain integration. Each endpoint is designed to work with the smart contracts and provide complete traceability from collection to consumer.
