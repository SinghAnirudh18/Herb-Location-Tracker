// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title SustainabilityTracker
 * @dev Smart contract for tracking sustainability metrics and fair trade practices
 * @author HerbTraceability Team
 */
contract SustainabilityTracker {
    
    struct SustainabilityMetrics {
        string batchId;
        address collector;
        uint256 latitude;
        uint256 longitude;
        bool isWithinApprovedZone;
        bool isWithinSeason;
        bool isWithinQuota;
        uint256 collectionDate;
        string species;
        uint256 quantity;
        string sustainabilityScore; // JSON string with detailed metrics
        string ipfsHash;
    }
    
    struct FairTradeRecord {
        string batchId;
        address collector;
        uint256 basePrice;
        uint256 fairTradePremium;
        uint256 totalPayment;
        uint256 paymentTimestamp;
        string paymentMethod;
        bool isPaid;
    }
    
    struct EnvironmentalImpact {
        string batchId;
        uint256 carbonFootprint;
        uint256 waterUsage;
        uint256 soilImpact;
        string conservationStatus;
        string ipfsHash;
    }
    
    // State variables
    mapping(string => SustainabilityMetrics) public sustainabilityMetrics;
    mapping(string => FairTradeRecord) public fairTradeRecords;
    mapping(string => EnvironmentalImpact) public environmentalImpacts;
    mapping(address => uint256) public collectorEarnings;
    mapping(string => bool) public approvedZones; // zone hash => approved
    mapping(string => bool) public seasonalRestrictions; // species => restricted
    
    address public owner;
    
    // Events
    event SustainabilityRecorded(string indexed batchId, address indexed collector, uint256 timestamp);
    event FairTradePayment(string indexed batchId, address indexed collector, uint256 amount, uint256 timestamp);
    event EnvironmentalImpactRecorded(string indexed batchId, uint256 carbonFootprint, uint256 timestamp);
    event ZoneApproved(string indexed zoneHash, uint256 timestamp);
    event SeasonalRestrictionAdded(string indexed species, uint256 timestamp);
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }
    
    constructor() {
        owner = msg.sender;
    }
    
    // Zone and season management
    function approveZone(string memory _zoneHash) external onlyOwner {
        approvedZones[_zoneHash] = true;
        emit ZoneApproved(_zoneHash, block.timestamp);
    }
    
    function addSeasonalRestriction(string memory _species) external onlyOwner {
        seasonalRestrictions[_species] = true;
        emit SeasonalRestrictionAdded(_species, block.timestamp);
    }
    
    // Sustainability metrics recording
    function recordSustainabilityMetrics(
        string memory _batchId,
        address _collector,
        uint256 _latitude,
        uint256 _longitude,
        uint256 _quantity,
        string memory _species,
        string memory _sustainabilityScore,
        string memory _ipfsHash
    ) external {
        require(bytes(sustainabilityMetrics[_batchId].batchId).length == 0, "Metrics already recorded");
        
        // Check if zone is approved
        string memory zoneHash = string(abi.encodePacked(_species, _latitude, _longitude));
        bool isWithinApprovedZone = approvedZones[zoneHash];
        
        // Check seasonal restrictions (simplified - in real implementation, you'd check actual dates)
        bool isWithinSeason = !seasonalRestrictions[_species];
        
        // Check quota (simplified - in real implementation, you'd track actual quotas)
        bool isWithinQuota = true;
        
        sustainabilityMetrics[_batchId] = SustainabilityMetrics({
            batchId: _batchId,
            collector: _collector,
            latitude: _latitude,
            longitude: _longitude,
            isWithinApprovedZone: isWithinApprovedZone,
            isWithinSeason: isWithinSeason,
            isWithinQuota: isWithinQuota,
            collectionDate: block.timestamp,
            species: _species,
            quantity: _quantity,
            sustainabilityScore: _sustainabilityScore,
            ipfsHash: _ipfsHash
        });
        
        emit SustainabilityRecorded(_batchId, _collector, block.timestamp);
    }
    
    // Fair trade payment recording
    function recordFairTradePayment(
        string memory _batchId,
        address _collector,
        uint256 _basePrice,
        uint256 _fairTradePremium,
        string memory _paymentMethod
    ) external payable {
        require(bytes(sustainabilityMetrics[_batchId].batchId).length > 0, "Sustainability metrics not found");
        require(sustainabilityMetrics[_batchId].collector == _collector, "Collector mismatch");
        
        uint256 totalPayment = _basePrice + _fairTradePremium;
        require(msg.value >= totalPayment, "Insufficient payment");
        
        fairTradeRecords[_batchId] = FairTradeRecord({
            batchId: _batchId,
            collector: _collector,
            basePrice: _basePrice,
            fairTradePremium: _fairTradePremium,
            totalPayment: totalPayment,
            paymentTimestamp: block.timestamp,
            paymentMethod: _paymentMethod,
            isPaid: true
        });
        
        collectorEarnings[_collector] += totalPayment;
        
        // Transfer payment to collector
        payable(_collector).transfer(totalPayment);
        
        emit FairTradePayment(_batchId, _collector, totalPayment, block.timestamp);
    }
    
    // Environmental impact recording
    function recordEnvironmentalImpact(
        string memory _batchId,
        uint256 _carbonFootprint,
        uint256 _waterUsage,
        uint256 _soilImpact,
        string memory _conservationStatus,
        string memory _ipfsHash
    ) external {
        require(bytes(sustainabilityMetrics[_batchId].batchId).length > 0, "Sustainability metrics not found");
        
        environmentalImpacts[_batchId] = EnvironmentalImpact({
            batchId: _batchId,
            carbonFootprint: _carbonFootprint,
            waterUsage: _waterUsage,
            soilImpact: _soilImpact,
            conservationStatus: _conservationStatus,
            ipfsHash: _ipfsHash
        });
        
        emit EnvironmentalImpactRecorded(_batchId, _carbonFootprint, block.timestamp);
    }
    
    // Query functions
    function getSustainabilityMetrics(string memory _batchId) external view returns (SustainabilityMetrics memory) {
        return sustainabilityMetrics[_batchId];
    }
    
    function getFairTradeRecord(string memory _batchId) external view returns (FairTradeRecord memory) {
        return fairTradeRecords[_batchId];
    }
    
    function getEnvironmentalImpact(string memory _batchId) external view returns (EnvironmentalImpact memory) {
        return environmentalImpacts[_batchId];
    }
    
    function getCollectorEarnings(address _collector) external view returns (uint256) {
        return collectorEarnings[_collector];
    }
    
    function isSustainable(string memory _batchId) external view returns (bool) {
        SustainabilityMetrics memory metrics = sustainabilityMetrics[_batchId];
        if (bytes(metrics.batchId).length == 0) return false;
        
        return metrics.isWithinApprovedZone && 
               metrics.isWithinSeason && 
               metrics.isWithinQuota;
    }
    
    function isFairTrade(string memory _batchId) external view returns (bool) {
        FairTradeRecord memory record = fairTradeRecords[_batchId];
        return record.isPaid && record.fairTradePremium > 0;
    }
    
    // Calculate sustainability score
    function calculateSustainabilityScore(string memory _batchId) external view returns (uint256) {
        SustainabilityMetrics memory metrics = sustainabilityMetrics[_batchId];
        if (bytes(metrics.batchId).length == 0) return 0;
        
        uint256 score = 0;
        
        if (metrics.isWithinApprovedZone) score += 40;
        if (metrics.isWithinSeason) score += 30;
        if (metrics.isWithinQuota) score += 30;
        
        return score;
    }
}
