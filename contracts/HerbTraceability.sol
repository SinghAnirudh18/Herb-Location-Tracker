// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @title HerbTraceability
 * @dev Main smart contract for Ayurvedic herb traceability system
 * @author HerbTraceability Team
 */
contract HerbTraceability is Ownable, ReentrancyGuard, Pausable {
    
    // Structs for different entities in the supply chain
    struct CollectionEvent {
        address collector;
        string species;
        uint256 latitude;
        uint256 longitude;
        uint256 timestamp;
        uint256 quantity;
        string qualityMetrics; // JSON string
        string sustainabilityCompliance; // JSON string
        string ipfsHash; // For storing detailed data
        bool verified;
    }
    
    struct ProcessingStep {
        address processor;
        string stepType;
        uint256 timestamp;
        string inputBatchId;
        string outputBatchId;
        string processDetails; // JSON string
        string ipfsHash;
        bool verified;
    }
    
    struct QualityTest {
        address lab;
        string testType;
        uint256 timestamp;
        string batchId;
        string testResults; // JSON string
        bool passed;
        string certificateHash; // IPFS hash for certificate
        bool verified;
    }
    
    struct Product {
        string batchId;
        address manufacturer;
        string productName;
        string formulation; // JSON string
        uint256 timestamp;
        string qrCode;
        string ipfsHash;
        bool verified;
    }
    
    // State variables
    mapping(string => CollectionEvent) public collectionEvents;
    mapping(string => ProcessingStep) public processingSteps;
    mapping(string => QualityTest) public qualityTests;
    mapping(string => Product) public products;
    
    // Batch tracking
    mapping(string => string[]) public batchHistory; // batchId => array of transaction hashes
    mapping(string => bool) public batchExists; // Quick check if batch exists
    
    // Access control
    mapping(address => bool) public authorizedCollectors;
    mapping(address => bool) public authorizedProcessors;
    mapping(address => bool) public authorizedLabs;
    mapping(address => bool) public authorizedManufacturers;
    mapping(address => bool) public authorizedRegulators;
    
    // Statistics
    uint256 public totalCollections;
    uint256 public totalProcessingSteps;
    uint256 public totalQualityTests;
    uint256 public totalProducts;
    
    // Contract version
    string public constant VERSION = "1.0.0";
    
    // Events
    event CollectionRecorded(string indexed batchId, address indexed collector, string species, uint256 quantity, uint256 timestamp);
    event ProcessingRecorded(string indexed batchId, address indexed processor, string stepType, uint256 timestamp);
    event QualityTestRecorded(string indexed batchId, address indexed lab, string testType, bool passed, uint256 timestamp);
    event ProductCreated(string indexed batchId, address indexed manufacturer, string productName, uint256 timestamp);
    event BatchVerified(string indexed batchId, bool verified, uint256 timestamp);
    event AuthorizationUpdated(address indexed user, string role, bool authorized, uint256 timestamp);
    event ContractPaused(address indexed by, uint256 timestamp);
    event ContractUnpaused(address indexed by, uint256 timestamp);
    
    modifier onlyAuthorizedCollector() {
        require(authorizedCollectors[msg.sender], "Not an authorized collector");
        _;
    }
    
    modifier onlyAuthorizedProcessor() {
        require(authorizedProcessors[msg.sender], "Not an authorized processor");
        _;
    }
    
    modifier onlyAuthorizedLab() {
        require(authorizedLabs[msg.sender], "Not an authorized lab");
        _;
    }
    
    modifier onlyAuthorizedManufacturer() {
        require(authorizedManufacturers[msg.sender], "Not an authorized manufacturer");
        _;
    }
    
    modifier onlyAuthorizedRegulator() {
        require(authorizedRegulators[msg.sender], "Not an authorized regulator");
        _;
    }
    
    constructor() {
        // Owner is set by Ownable constructor
    }
    
    // Access control functions
    function addAuthorizedCollector(address _collector) external onlyOwner {
        authorizedCollectors[_collector] = true;
        emit AuthorizationUpdated(_collector, "collector", true, block.timestamp);
    }
    
    function removeAuthorizedCollector(address _collector) external onlyOwner {
        authorizedCollectors[_collector] = false;
        emit AuthorizationUpdated(_collector, "collector", false, block.timestamp);
    }
    
    function addAuthorizedProcessor(address _processor) external onlyOwner {
        authorizedProcessors[_processor] = true;
        emit AuthorizationUpdated(_processor, "processor", true, block.timestamp);
    }
    
    function removeAuthorizedProcessor(address _processor) external onlyOwner {
        authorizedProcessors[_processor] = false;
        emit AuthorizationUpdated(_processor, "processor", false, block.timestamp);
    }
    
    function addAuthorizedLab(address _lab) external onlyOwner {
        authorizedLabs[_lab] = true;
        emit AuthorizationUpdated(_lab, "lab", true, block.timestamp);
    }
    
    function removeAuthorizedLab(address _lab) external onlyOwner {
        authorizedLabs[_lab] = false;
        emit AuthorizationUpdated(_lab, "lab", false, block.timestamp);
    }
    
    function addAuthorizedManufacturer(address _manufacturer) external onlyOwner {
        authorizedManufacturers[_manufacturer] = true;
        emit AuthorizationUpdated(_manufacturer, "manufacturer", true, block.timestamp);
    }
    
    function removeAuthorizedManufacturer(address _manufacturer) external onlyOwner {
        authorizedManufacturers[_manufacturer] = false;
        emit AuthorizationUpdated(_manufacturer, "manufacturer", false, block.timestamp);
    }
    
    function addAuthorizedRegulator(address _regulator) external onlyOwner {
        authorizedRegulators[_regulator] = true;
        emit AuthorizationUpdated(_regulator, "regulator", true, block.timestamp);
    }
    
    function removeAuthorizedRegulator(address _regulator) external onlyOwner {
        authorizedRegulators[_regulator] = false;
        emit AuthorizationUpdated(_regulator, "regulator", false, block.timestamp);
    }
    
    // Emergency functions
    function pause() external onlyOwner {
        _pause();
        emit ContractPaused(msg.sender, block.timestamp);
    }
    
    function unpause() external onlyOwner {
        _unpause();
        emit ContractUnpaused(msg.sender, block.timestamp);
    }
    
    // Collection event recording
    function recordCollection(
        string memory _batchId,
        string memory _species,
        uint256 _latitude,
        uint256 _longitude,
        uint256 _quantity,
        string memory _qualityMetrics,
        string memory _sustainabilityCompliance,
        string memory _ipfsHash
    ) external onlyAuthorizedCollector whenNotPaused nonReentrant {
        require(bytes(collectionEvents[_batchId].species).length == 0, "Collection already recorded for this batch");
        require(bytes(_batchId).length > 0, "Batch ID cannot be empty");
        require(bytes(_species).length > 0, "Species cannot be empty");
        require(_quantity > 0, "Quantity must be greater than 0");
        
        collectionEvents[_batchId] = CollectionEvent({
            collector: msg.sender,
            species: _species,
            latitude: _latitude,
            longitude: _longitude,
            timestamp: block.timestamp,
            quantity: _quantity,
            qualityMetrics: _qualityMetrics,
            sustainabilityCompliance: _sustainabilityCompliance,
            ipfsHash: _ipfsHash,
            verified: false
        });
        
        batchExists[_batchId] = true;
        batchHistory[_batchId].push("collection");
        totalCollections++;
        
        emit CollectionRecorded(_batchId, msg.sender, _species, _quantity, block.timestamp);
    }
    
    // Processing step recording
    function recordProcessing(
        string memory _batchId,
        string memory _stepType,
        string memory _inputBatchId,
        string memory _outputBatchId,
        string memory _processDetails,
        string memory _ipfsHash
    ) external onlyAuthorizedProcessor {
        require(bytes(collectionEvents[_inputBatchId].species).length > 0, "Input batch not found");
        
        processingSteps[_batchId] = ProcessingStep({
            processor: msg.sender,
            stepType: _stepType,
            timestamp: block.timestamp,
            inputBatchId: _inputBatchId,
            outputBatchId: _outputBatchId,
            processDetails: _processDetails,
            ipfsHash: _ipfsHash,
            verified: false
        });
        
        batchHistory[_outputBatchId].push(_batchId);
        
        emit ProcessingRecorded(_batchId, msg.sender, _stepType, block.timestamp);
    }
    
    // Quality test recording
    function recordQualityTest(
        string memory _batchId,
        string memory _testType,
        string memory _testResults,
        bool _passed,
        string memory _certificateHash
    ) external onlyAuthorizedLab {
        require(bytes(collectionEvents[_batchId].species).length > 0 || 
                bytes(processingSteps[_batchId].stepType).length > 0, "Batch not found");
        
        qualityTests[_batchId] = QualityTest({
            lab: msg.sender,
            testType: _testType,
            timestamp: block.timestamp,
            batchId: _batchId,
            testResults: _testResults,
            passed: _passed,
            certificateHash: _certificateHash,
            verified: false
        });
        
        emit QualityTestRecorded(_batchId, msg.sender, _testType, _passed, block.timestamp);
    }
    
    // Product creation
    function createProduct(
        string memory _batchId,
        string memory _productName,
        string memory _formulation,
        string memory _qrCode,
        string memory _ipfsHash
    ) external onlyAuthorizedManufacturer {
        require(bytes(collectionEvents[_batchId].species).length > 0, "Collection event not found");
        require(qualityTests[_batchId].passed, "Quality test not passed");
        
        products[_batchId] = Product({
            batchId: _batchId,
            manufacturer: msg.sender,
            productName: _productName,
            formulation: _formulation,
            timestamp: block.timestamp,
            qrCode: _qrCode,
            ipfsHash: _ipfsHash,
            verified: false
        });
        
        emit ProductCreated(_batchId, msg.sender, _productName, block.timestamp);
    }
    
    // Verification functions
    function verifyBatch(string memory _batchId) external onlyAuthorizedRegulator {
        require(bytes(collectionEvents[_batchId].species).length > 0, "Batch not found");
        
        collectionEvents[_batchId].verified = true;
        
        if (bytes(processingSteps[_batchId].stepType).length > 0) {
            processingSteps[_batchId].verified = true;
        }
        
        if (bytes(qualityTests[_batchId].testType).length > 0) {
            qualityTests[_batchId].verified = true;
        }
        
        if (bytes(products[_batchId].batchId).length > 0) {
            products[_batchId].verified = true;
        }
        
        emit BatchVerified(_batchId, true, block.timestamp);
    }
    
    // Query functions
    function getBatchHistory(string memory _batchId) external view returns (string[] memory) {
        return batchHistory[_batchId];
    }
    
    function getCollectionEvent(string memory _batchId) external view returns (CollectionEvent memory) {
        return collectionEvents[_batchId];
    }
    
    function getProcessingStep(string memory _batchId) external view returns (ProcessingStep memory) {
        return processingSteps[_batchId];
    }
    
    function getQualityTest(string memory _batchId) external view returns (QualityTest memory) {
        return qualityTests[_batchId];
    }
    
    function getProduct(string memory _batchId) external view returns (Product memory) {
        return products[_batchId];
    }
    
    function isBatchVerified(string memory _batchId) external view returns (bool) {
        return collectionEvents[_batchId].verified;
    }
    
    // Compliance checking
    function checkCompliance(string memory _batchId) external view returns (bool) {
        CollectionEvent memory collection = collectionEvents[_batchId];
        if (bytes(collection.species).length == 0) return false;
        
        // Check if all required steps are completed and verified
        bool hasCollection = collection.verified;
        bool hasQualityTest = bytes(qualityTests[_batchId].testType).length > 0 && 
                             qualityTests[_batchId].verified && 
                             qualityTests[_batchId].passed;
        
        return hasCollection && hasQualityTest;
    }
}
