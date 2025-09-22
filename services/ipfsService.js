// services/ipfsService.js
const fs = require('fs');
const path = require('path');

class IPFSService {
  constructor() {
    this.ipfs = null;
    this.isInitialized = false;
    this.isAvailable = false;
  }

  async initialize() {
    try {
      // Try to initialize IPFS client
      const { create } = require('ipfs-http-client');
      
      this.ipfs = create({
        host: process.env.IPFS_HOST || 'localhost',
        port: process.env.IPFS_PORT || 5001,
        protocol: process.env.IPFS_PROTOCOL || 'http'
      });

      // Test connection with timeout
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('IPFS connection timeout')), 5000)
      );
      
      const versionPromise = this.ipfs.version();
      const version = await Promise.race([versionPromise, timeoutPromise]);
      
      console.log('✅ IPFS version:', version.version);
      this.isInitialized = true;
      this.isAvailable = true;
      console.log('✅ IPFS service initialized successfully');
    } catch (error) {
      console.warn('⚠️  IPFS service not available:', error.message);
      console.log('📝 IPFS is optional. System will work without it.');
      console.log('💡 To enable IPFS: Install IPFS Desktop or start local daemon');
      this.isInitialized = true; // Mark as initialized but not available
      this.isAvailable = false;
    }
  }

  async uploadFile(input, fileName = null) {
    if (!this.isInitialized) {
      throw new Error('IPFS service not initialized');
    }

    if (!this.isAvailable) {
      console.warn('⚠️  IPFS not available, returning mock hash');
      const name = fileName || (typeof input === 'string' ? path.basename(input) : 'file');
      return `mock-hash-${Date.now()}-${name}`;
    }

    try {
      let fileBuffer;
      let name = fileName;
      
      // Handle different input types
      if (Buffer.isBuffer(input)) {
        fileBuffer = input;
        name = fileName || `buffer-${Date.now()}`;
      } else if (typeof input === 'string') {
        // Assume it's a file path
        fileBuffer = fs.readFileSync(input);
        name = fileName || path.basename(input);
      } else {
        throw new Error('Invalid input type. Expected Buffer or file path string.');
      }

      const result = await this.ipfs.add(fileBuffer, {
        pin: true,
        progress: (prog) => console.log(`Upload progress: ${prog}`)
      });
      
      console.log(`File uploaded to IPFS: ${name} -> ${result.path}`);
      return result.path;
    } catch (error) {
      console.error('Error uploading file to IPFS:', error);
      // Return mock hash as fallback
      const name = fileName || (typeof input === 'string' ? path.basename(input) : 'file');
      return `error-hash-${Date.now()}-${name}`;
    }
  }

  async uploadBuffer(buffer, fileName) {
    if (!this.isInitialized) {
      throw new Error('IPFS service not initialized');
    }

    try {
      const result = await this.ipfs.add(buffer, {
        pin: true,
        progress: (prog) => console.log(`Upload progress: ${prog}`)
      });
      
      console.log('Buffer uploaded to IPFS:', result.path);
      return result.path;
    } catch (error) {
      console.error('Error uploading buffer to IPFS:', error);
      throw error;
    }
  }

  async uploadJSON(data) {
    if (!this.isInitialized) {
      throw new Error('IPFS service not initialized');
    }

    if (!this.isAvailable) {
      console.warn('⚠️  IPFS not available, returning mock hash for JSON data');
      return `mock-json-hash-${Date.now()}-${Object.keys(data).length}keys`;
    }

    try {
      const jsonString = JSON.stringify(data, null, 2);
      const result = await this.ipfs.add(jsonString, {
        pin: true
      });
      
      console.log('JSON uploaded to IPFS:', result.path);
      return result.path;
    } catch (error) {
      console.error('Error uploading JSON to IPFS:', error);
      // Return mock hash as fallback
      return `error-json-hash-${Date.now()}-${Object.keys(data).length}keys`;
    }
  }

  async uploadCollectionEventData(collectionEvent) {
    if (!this.isInitialized) {
      throw new Error('IPFS service not initialized');
    }

    try {
      const data = {
        collectorId: collectionEvent.collectorId,
        species: collectionEvent.species,
        location: collectionEvent.location,
        timestamp: collectionEvent.timestamp,
        quantity: collectionEvent.quantity,
        qualityMetrics: collectionEvent.qualityMetrics,
        sustainabilityCompliance: collectionEvent.sustainabilityCompliance,
        images: collectionEvent.images || [],
        documents: collectionEvent.documents || [],
        metadata: {
          uploadedAt: new Date().toISOString(),
          version: '1.0'
        }
      };

      return await this.uploadJSON(data);
    } catch (error) {
      console.error('Error uploading collection event data:', error);
      throw error;
    }
  }

  async uploadQualityTestData(qualityTest) {
    if (!this.isInitialized) {
      throw new Error('IPFS service not initialized');
    }

    try {
      const data = {
        labId: qualityTest.labId,
        collectionEventId: qualityTest.collectionEventId,
        timestamp: qualityTest.timestamp,
        tests: qualityTest.tests,
        overallResult: qualityTest.overallResult,
        certificateUrl: qualityTest.certificateUrl,
        testImages: qualityTest.testImages || [],
        labReports: qualityTest.labReports || [],
        metadata: {
          uploadedAt: new Date().toISOString(),
          version: '1.0'
        }
      };

      return await this.uploadJSON(data);
    } catch (error) {
      console.error('Error uploading quality test data:', error);
      throw error;
    }
  }

  async uploadProductData(product) {
    if (!this.isInitialized) {
      throw new Error('IPFS service not initialized');
    }

    try {
      const data = {
        batchId: product.batchId,
        productName: product.productName,
        collectionEventId: product.collectionEventId,
        processingSteps: product.processingSteps,
        qualityTests: product.qualityTests,
        manufacturerId: product.manufacturerId,
        formulation: product.formulation,
        qrCode: product.qrCode,
        productImages: product.productImages || [],
        packagingImages: product.packagingImages || [],
        metadata: {
          uploadedAt: new Date().toISOString(),
          version: '1.0'
        }
      };

      return await this.uploadJSON(data);
    } catch (error) {
      console.error('Error uploading product data:', error);
      throw error;
    }
  }

  async uploadCertificate(certificatePath) {
    if (!this.isInitialized) {
      throw new Error('IPFS service not initialized');
    }

    try {
      const result = await this.uploadFile(certificatePath);
      return result;
    } catch (error) {
      console.error('Error uploading certificate:', error);
      throw error;
    }
  }

  async uploadImage(imagePath) {
    if (!this.isInitialized) {
      throw new Error('IPFS service not initialized');
    }

    try {
      const result = await this.uploadFile(imagePath);
      return result;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  }

  async downloadFile(ipfsHash, outputPath) {
    if (!this.isInitialized) {
      throw new Error('IPFS service not initialized');
    }

    try {
      const chunks = [];
      for await (const chunk of this.ipfs.cat(ipfsHash)) {
        chunks.push(chunk);
      }
      
      const fileBuffer = Buffer.concat(chunks);
      fs.writeFileSync(outputPath, fileBuffer);
      
      console.log('File downloaded from IPFS:', outputPath);
      return outputPath;
    } catch (error) {
      console.error('Error downloading file from IPFS:', error);
      throw error;
    }
  }

  async getFileContent(ipfsHash) {
    if (!this.isInitialized) {
      throw new Error('IPFS service not initialized');
    }

    try {
      const chunks = [];
      for await (const chunk of this.ipfs.cat(ipfsHash)) {
        chunks.push(chunk);
      }
      
      const content = Buffer.concat(chunks).toString();
      return content;
    } catch (error) {
      console.error('Error getting file content from IPFS:', error);
      throw error;
    }
  }

  async pinFile(ipfsHash) {
    if (!this.isInitialized) {
      throw new Error('IPFS service not initialized');
    }

    try {
      await this.ipfs.pin.add(ipfsHash);
      console.log('File pinned:', ipfsHash);
      return true;
    } catch (error) {
      console.error('Error pinning file:', error);
      throw error;
    }
  }

  async unpinFile(ipfsHash) {
    if (!this.isInitialized) {
      throw new Error('IPFS service not initialized');
    }

    try {
      await this.ipfs.pin.rm(ipfsHash);
      console.log('File unpinned:', ipfsHash);
      return true;
    } catch (error) {
      console.error('Error unpinning file:', error);
      throw error;
    }
  }

  async getPinnedFiles() {
    if (!this.isInitialized) {
      throw new Error('IPFS service not initialized');
    }

    try {
      const pins = [];
      for await (const pin of this.ipfs.pin.ls()) {
        pins.push(pin);
      }
      return pins;
    } catch (error) {
      console.error('Error getting pinned files:', error);
      throw error;
    }
  }

  async getNodeInfo() {
    if (!this.isInitialized) {
      throw new Error('IPFS service not initialized');
    }

    if (!this.isAvailable) {
      return null; // Return null when IPFS is not available
    }

    try {
      const info = await this.ipfs.id();
      return info;
    } catch (error) {
      console.error('Error getting node info:', error);
      return null;
    }
  }

  async getStats() {
    if (!this.isInitialized) {
      throw new Error('IPFS service not initialized');
    }

    try {
      const stats = await this.ipfs.stats.repo();
      return stats;
    } catch (error) {
      console.error('Error getting IPFS stats:', error);
      throw error;
    }
  }
}

module.exports = new IPFSService();
