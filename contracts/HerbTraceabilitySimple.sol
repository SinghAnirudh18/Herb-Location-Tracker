// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title HerbTraceabilitySimple
 * @dev Simplified smart contract for Ayurvedic herb traceability system
 * @author HerbTraceability Team
 */
contract HerbTraceabilitySimple is Ownable {
    
    // Simplified structs
    struct CollectionEvent {
        address collector;
        string species;
        uint256 timestamp;
        uint256 quantity;
        string ipfsHash;
        bool verified;
    }
    
    struct ProcessingStep {
        address processor;
        string stepType;
        uint256 timestamp;
        string ipfsHash;
        bool verified;
    }
    
    struct QualityTest {
        address lab;
        string testType;
        uint256 timestamp;
        bool passed;
        string certificateHash;
        bool verified;
    }
    
    struct Product {
        string batchId;
        address manufacturer;
        string productName;
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
    string public constant VERSION = "1.0.0-Simple";
    
    // Events
    event CollectionRecorded(string indexed batchId, address indexed collector, string species, uint256 quantity, uint256 timestamp);
    event ProcessingRecorded(string indexed batchId, address indexed processor, string stepType, uint256 timestamp);
    event QualityTestRecorded(string indexed batchId, address indexed lab, string testType, bool passed, uint256 timestamp);
    event ProductCreated(string indexed batchId, address indexed manufacturer, string productName, uint256 timestamp);
    event BatchVerified(string indexed batchId, bool verified, uint256 timestamp);
    event AuthorizationUpdated(address indexed user, string role, bool authorized, uint256 timestamp);
    
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
        // Initialize with owner as authorized for all roles
        authorizedCollectors[msg.sender] = true;
        authorizedProcessors[msg.sender] = true;
        authorizedLabs[msg.sender] = true;
        authorizedManufacturers[msg.sender] = true;
        authorizedRegulators[msg.sender] = true;
    }
    
    // Collection recording
    function recordCollection(
        string memory _batchId,
        string memory _species,
        uint256 _quantity,
        string memory _ipfsHash
    ) external onlyAuthorizedCollector {
        require(bytes(_batchId).length > 0, "Batch ID cannot be empty");
        require(bytes(collectionEvents[_batchId].species).length == 0, "Batch already exists");
        
        collectionEvents[_batchId] = CollectionEvent({
            collector: msg.sender,
            species: _species,
            timestamp: block.timestamp,
            quantity: _quantity,
            ipfsHash: _ipfsHash,
            verified: false
        });
        
        totalCollections++;
        
        emit CollectionRecorded(_batchId, msg.sender, _species, _quantity, block.timestamp);
    }
    
    // Processing step recording
    function recordProcessing(
        string memory _batchId,
        string memory _stepType,
        string memory _ipfsHash
    ) external onlyAuthorizedProcessor {
        require(bytes(collectionEvents[_batchId].species).length > 0, "Collection event not found");
        
        processingSteps[_batchId] = ProcessingStep({
            processor: msg.sender,
            stepType: _stepType,
            timestamp: block.timestamp,
            ipfsHash: _ipfsHash,
            verified: false
        });
        
        totalProcessingSteps++;
        
        emit ProcessingRecorded(_batchId, msg.sender, _stepType, block.timestamp);
    }
    
    // Quality test recording
    function recordQualityTest(
        string memory _batchId,
        string memory _testType,
        bool _passed,
        string memory _certificateHash
    ) external onlyAuthorizedLab {
        require(bytes(collectionEvents[_batchId].species).length > 0, "Batch not found");
        
        qualityTests[_batchId] = QualityTest({
            lab: msg.sender,
            testType: _testType,
            timestamp: block.timestamp,
            passed: _passed,
            certificateHash: _certificateHash,
            verified: false
        });
        
        totalQualityTests++;
        
        emit QualityTestRecorded(_batchId, msg.sender, _testType, _passed, block.timestamp);
    }
    
    // Product creation
    function createProduct(
        string memory _batchId,
        string memory _productName,
        string memory _qrCode,
        string memory _ipfsHash
    ) external onlyAuthorizedManufacturer {
        require(bytes(collectionEvents[_batchId].species).length > 0, "Collection event not found");
        require(qualityTests[_batchId].passed, "Quality test not passed");
        
        products[_batchId] = Product({
            batchId: _batchId,
            manufacturer: msg.sender,
            productName: _productName,
            timestamp: block.timestamp,
            qrCode: _qrCode,
            ipfsHash: _ipfsHash,
            verified: false
        });
        
        totalProducts++;
        
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
    
    // Authorization management
    function addAuthorizedCollector(address _collector) external onlyOwner {
        authorizedCollectors[_collector] = true;
        emit AuthorizationUpdated(_collector, "collector", true, block.timestamp);
    }
    
    function addAuthorizedProcessor(address _processor) external onlyOwner {
        authorizedProcessors[_processor] = true;
        emit AuthorizationUpdated(_processor, "processor", true, block.timestamp);
    }
    
    function addAuthorizedLab(address _lab) external onlyOwner {
        authorizedLabs[_lab] = true;
        emit AuthorizationUpdated(_lab, "lab", true, block.timestamp);
    }
    
    function addAuthorizedManufacturer(address _manufacturer) external onlyOwner {
        authorizedManufacturers[_manufacturer] = true;
        emit AuthorizationUpdated(_manufacturer, "manufacturer", true, block.timestamp);
    }
    
    function addAuthorizedRegulator(address _regulator) external onlyOwner {
        authorizedRegulators[_regulator] = true;
        emit AuthorizationUpdated(_regulator, "regulator", true, block.timestamp);
    }
    
    // View functions
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
    
    function checkCompliance(string memory _batchId) external view returns (bool) {
        return collectionEvents[_batchId].verified && 
               qualityTests[_batchId].passed && 
               qualityTests[_batchId].verified;
    }
}
