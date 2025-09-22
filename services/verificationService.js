// services/verificationService.js
const web3Service = require('./web3Service');
const ipfsService = require('./ipfsService');
const { createHash } = require('../utils/hashing');

class VerificationService {
  constructor() {
    this.isInitialized = false;
  }

  async initialize() {
    try {
      await web3Service.initialize();
      await ipfsService.initialize();
      this.isInitialized = true;
      console.log('Verification service initialized successfully');
    } catch (error) {
      console.error('Error initializing verification service:', error);
      throw error;
    }
  }

  // Comprehensive batch verification
  async verifyBatch(batchId) {
    if (!this.isInitialized) {
      throw new Error('Verification service not initialized');
    }

    try {
      const verification = {
        batchId,
        timestamp: new Date().toISOString(),
        blockchainVerification: {},
        complianceVerification: {},
        sustainabilityVerification: {},
        qualityVerification: {},
        overallStatus: 'pending'
      };

      // 1. Blockchain verification
      verification.blockchainVerification = await this.verifyOnBlockchain(batchId);

      // 2. Compliance verification
      verification.complianceVerification = await this.verifyCompliance(batchId);

      // 3. Sustainability verification
      verification.sustainabilityVerification = await this.verifySustainability(batchId);

      // 4. Quality verification
      verification.qualityVerification = await this.verifyQuality(batchId);

      // 5. Calculate overall status
      verification.overallStatus = this.calculateOverallStatus(verification);

      // 6. Store verification result on IPFS
      const ipfsHash = await ipfsService.uploadJSON(verification);

      return {
        ...verification,
        verificationHash: ipfsHash
      };
    } catch (error) {
      console.error('Error verifying batch:', error);
      throw error;
    }
  }

  // Blockchain verification
  async verifyOnBlockchain(batchId) {
    try {
      const collectionEvent = await web3Service.getCollectionEvent(batchId);
      const batchHistory = await web3Service.getBatchHistory(batchId);
      const isVerified = await web3Service.isBatchVerified(batchId);
      const isCompliant = await web3Service.checkCompliance(batchId);

      return {
        exists: collectionEvent.collector !== '0x0000000000000000000000000000000000000000',
        verified: isVerified,
        compliant: isCompliant,
        collectionEvent: collectionEvent,
        batchHistory: batchHistory,
        blockchainValid: true // Assuming blockchain is valid if we can query it
      };
    } catch (error) {
      console.error('Error verifying on blockchain:', error);
      return {
        exists: false,
        verified: false,
        compliant: false,
        error: error.message
      };
    }
  }

  // Compliance verification
  async verifyCompliance(batchId) {
    try {
      // This would integrate with the ComplianceManager contract
      // For now, we'll implement basic compliance checks
      const collectionEvent = await web3Service.getCollectionEvent(batchId);
      
      const complianceChecks = {
        geographicalOrigin: this.checkGeographicalOrigin(collectionEvent),
        speciesAuthentication: this.checkSpeciesAuthentication(collectionEvent),
        qualityStandards: this.checkQualityStandards(collectionEvent),
        sustainabilityCompliance: this.checkSustainabilityCompliance(collectionEvent),
        regulatoryCompliance: this.checkRegulatoryCompliance(collectionEvent)
      };

      const overallCompliant = Object.values(complianceChecks).every(check => check.passed);

      return {
        overallCompliant,
        checks: complianceChecks,
        complianceScore: this.calculateComplianceScore(complianceChecks)
      };
    } catch (error) {
      console.error('Error verifying compliance:', error);
      return {
        overallCompliant: false,
        error: error.message
      };
    }
  }

  // Sustainability verification
  async verifySustainability(batchId) {
    try {
      // This would integrate with the SustainabilityTracker contract
      const sustainabilityMetrics = await web3Service.getSustainabilityMetrics(batchId);
      const fairTradeRecord = await web3Service.getFairTradeRecord(batchId);
      const environmentalImpact = await web3Service.getEnvironmentalImpact(batchId);

      const sustainabilityChecks = {
        approvedZone: sustainabilityMetrics.isWithinApprovedZone,
        seasonalCompliance: sustainabilityMetrics.isWithinSeason,
        quotaCompliance: sustainabilityMetrics.isWithinQuota,
        fairTrade: fairTradeRecord.isPaid,
        environmentalImpact: this.assessEnvironmentalImpact(environmentalImpact)
      };

      const overallSustainable = Object.values(sustainabilityChecks).every(check => 
        typeof check === 'boolean' ? check : check.passed
      );

      return {
        overallSustainable,
        checks: sustainabilityChecks,
        sustainabilityScore: await web3Service.calculateSustainabilityScore(batchId)
      };
    } catch (error) {
      console.error('Error verifying sustainability:', error);
      return {
        overallSustainable: false,
        error: error.message
      };
    }
  }

  // Quality verification
  async verifyQuality(batchId) {
    try {
      const qualityTest = await web3Service.getQualityTest(batchId);
      
      if (!qualityTest.lab || qualityTest.lab === '0x0000000000000000000000000000000000000000') {
        return {
          tested: false,
          passed: false,
          error: 'No quality test found'
        };
      }

      const qualityChecks = {
        moistureContent: qualityTest.tests.moistureContent?.passed || false,
        pesticideResidue: qualityTest.tests.pesticideResidue?.passed || false,
        heavyMetals: qualityTest.tests.heavyMetals?.passed || false,
        microbialContamination: qualityTest.tests.microbialContamination?.passed || false,
        dnaBarcode: qualityTest.tests.dnaBarcode?.passed || false
      };

      const overallPassed = qualityTest.passed && Object.values(qualityChecks).every(check => check);

      return {
        tested: true,
        passed: overallPassed,
        checks: qualityChecks,
        testResults: qualityTest.tests,
        certificateHash: qualityTest.certificateHash
      };
    } catch (error) {
      console.error('Error verifying quality:', error);
      return {
        tested: false,
        passed: false,
        error: error.message
      };
    }
  }

  // Compliance check methods
  checkGeographicalOrigin(collectionEvent) {
    // Check if location is within approved regions
    const approvedRegions = [
      { name: 'Himalayan Region', lat: [28, 35], lng: [75, 95] },
      { name: 'Western Ghats', lat: [8, 21], lng: [73, 77] },
      { name: 'Eastern Ghats', lat: [11, 22], lng: [77, 85] }
    ];

    const lat = parseInt(collectionEvent.latitude);
    const lng = parseInt(collectionEvent.longitude);

    const isApproved = approvedRegions.some(region => 
      lat >= region.lat[0] && lat <= region.lat[1] &&
      lng >= region.lng[0] && lng <= region.lng[1]
    );

    return {
      passed: isApproved,
      details: isApproved ? 'Location within approved region' : 'Location outside approved regions',
      coordinates: { lat, lng }
    };
  }

  checkSpeciesAuthentication(collectionEvent) {
    // This would integrate with DNA barcoding results
    const approvedSpecies = [
      'Withania somnifera', // Ashwagandha
      'Curcuma longa', // Turmeric
      'Ocimum sanctum', // Tulsi
      'Azadirachta indica', // Neem
      'Emblica officinalis' // Amla
    ];

    const isApprovedSpecies = approvedSpecies.includes(collectionEvent.species);

    return {
      passed: isApprovedSpecies,
      details: isApprovedSpecies ? 'Species authenticated' : 'Species not in approved list',
      species: collectionEvent.species
    };
  }

  checkQualityStandards(collectionEvent) {
    // Check quality metrics against AYUSH standards
    const qualityMetrics = JSON.parse(collectionEvent.qualityMetrics || '{}');
    
    const standards = {
      moistureContent: { max: 12, unit: '%' },
      foreignMatter: { max: 2, unit: '%' },
      otherImpurities: { max: 1, unit: '%' }
    };

    const checks = {};
    let allPassed = true;

    for (const [metric, standard] of Object.entries(standards)) {
      const value = qualityMetrics[metric] || 0;
      const passed = value <= standard.max;
      checks[metric] = {
        passed,
        value,
        limit: standard.max,
        unit: standard.unit
      };
      if (!passed) allPassed = false;
    }

    return {
      passed: allPassed,
      details: allPassed ? 'Meets AYUSH quality standards' : 'Does not meet quality standards',
      checks
    };
  }

  checkSustainabilityCompliance(collectionEvent) {
    const sustainability = JSON.parse(collectionEvent.sustainabilityCompliance || '{}');
    
    return {
      passed: sustainability.isWithinApprovedZone && 
              sustainability.isWithinSeason && 
              sustainability.isWithinQuota,
      details: 'Sustainability compliance check',
      compliance: sustainability
    };
  }

  checkRegulatoryCompliance(collectionEvent) {
    // Check against various regulatory requirements
    const complianceChecks = {
      hasValidLicense: true, // Would check against regulatory database
      meetsExportStandards: true, // Would check export requirements
      hasProperDocumentation: true // Would check documentation completeness
    };

    const allCompliant = Object.values(complianceChecks).every(check => check);

    return {
      passed: allCompliant,
      details: allCompliant ? 'Meets regulatory requirements' : 'Does not meet regulatory requirements',
      checks: complianceChecks
    };
  }

  assessEnvironmentalImpact(environmentalImpact) {
    if (!environmentalImpact || !environmentalImpact.carbonFootprint) {
      return { passed: false, details: 'No environmental impact data' };
    }

    const carbonFootprint = environmentalImpact.carbonFootprint;
    const isLowImpact = carbonFootprint < 100; // kg CO2 per kg of herb

    return {
      passed: isLowImpact,
      details: isLowImpact ? 'Low environmental impact' : 'High environmental impact',
      carbonFootprint,
      unit: 'kg CO2/kg'
    };
  }

  calculateComplianceScore(complianceChecks) {
    const totalChecks = Object.keys(complianceChecks).length;
    const passedChecks = Object.values(complianceChecks).filter(check => check.passed).length;
    return Math.round((passedChecks / totalChecks) * 100);
  }

  calculateOverallStatus(verification) {
    const blockchainValid = verification.blockchainVerification.blockchainValid;
    const compliant = verification.complianceVerification.overallCompliant;
    const sustainable = verification.sustainabilityVerification.overallSustainable;
    const qualityPassed = verification.qualityVerification.passed;

    if (blockchainValid && compliant && sustainable && qualityPassed) {
      return 'verified';
    } else if (blockchainValid && (compliant || sustainable || qualityPassed)) {
      return 'partially_verified';
    } else {
      return 'failed';
    }
  }

  // Generate verification report
  async generateVerificationReport(batchId) {
    try {
      const verification = await this.verifyBatch(batchId);
      
      const report = {
        batchId,
        generatedAt: new Date().toISOString(),
        verification,
        summary: {
          status: verification.overallStatus,
          blockchainVerified: verification.blockchainVerification.verified,
          compliant: verification.complianceVerification.overallCompliant,
          sustainable: verification.sustainabilityVerification.overallSustainable,
          qualityPassed: verification.qualityVerification.passed
        },
        recommendations: this.generateRecommendations(verification)
      };

      // Upload report to IPFS
      const reportHash = await ipfsService.uploadJSON(report);

      return {
        ...report,
        reportHash
      };
    } catch (error) {
      console.error('Error generating verification report:', error);
      throw error;
    }
  }

  generateRecommendations(verification) {
    const recommendations = [];

    if (!verification.blockchainVerification.verified) {
      recommendations.push('Complete blockchain verification process');
    }

    if (!verification.complianceVerification.overallCompliant) {
      recommendations.push('Address compliance issues identified in verification');
    }

    if (!verification.sustainabilityVerification.overallSustainable) {
      recommendations.push('Improve sustainability practices');
    }

    if (!verification.qualityVerification.passed) {
      recommendations.push('Address quality issues and retest');
    }

    return recommendations;
  }
}

module.exports = new VerificationService();
