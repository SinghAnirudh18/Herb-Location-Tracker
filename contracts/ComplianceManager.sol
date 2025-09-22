// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title ComplianceManager
 * @dev Smart contract for managing regulatory compliance and standards
 * @author HerbTraceability Team
 */
contract ComplianceManager {
    
    struct ComplianceRule {
        string ruleId;
        string ruleName;
        string description;
        string applicableSpecies;
        string region;
        bool isActive;
        uint256 createdAt;
    }
    
    struct ComplianceCheck {
        string batchId;
        string ruleId;
        bool passed;
        string details;
        uint256 timestamp;
        address checker;
    }
    
    struct Certification {
        string certificateId;
        string batchId;
        string certType;
        string issuer;
        uint256 validFrom;
        uint256 validUntil;
        string ipfsHash;
        bool isActive;
    }
    
    // State variables
    mapping(string => ComplianceRule) public complianceRules;
    mapping(string => ComplianceCheck[]) public complianceChecks;
    mapping(string => Certification[]) public certifications;
    mapping(address => bool) public authorizedRegulators;
    mapping(address => bool) public authorizedCertifiers;
    
    address public owner;
    
    // Events
    event ComplianceRuleAdded(string indexed ruleId, string ruleName, uint256 timestamp);
    event ComplianceCheckPerformed(string indexed batchId, string indexed ruleId, bool passed, uint256 timestamp);
    event CertificationIssued(string indexed certificateId, string indexed batchId, uint256 timestamp);
    event CertificationRevoked(string indexed certificateId, uint256 timestamp);
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }
    
    modifier onlyAuthorizedRegulator() {
        require(authorizedRegulators[msg.sender], "Not an authorized regulator");
        _;
    }
    
    modifier onlyAuthorizedCertifier() {
        require(authorizedCertifiers[msg.sender], "Not an authorized certifier");
        _;
    }
    
    constructor() {
        owner = msg.sender;
    }
    
    // Access control
    function addAuthorizedRegulator(address _regulator) external onlyOwner {
        authorizedRegulators[_regulator] = true;
    }
    
    function addAuthorizedCertifier(address _certifier) external onlyOwner {
        authorizedCertifiers[_certifier] = true;
    }
    
    // Compliance rule management
    function addComplianceRule(
        string memory _ruleId,
        string memory _ruleName,
        string memory _description,
        string memory _applicableSpecies,
        string memory _region
    ) external onlyAuthorizedRegulator {
        require(bytes(complianceRules[_ruleId].ruleId).length == 0, "Rule already exists");
        
        complianceRules[_ruleId] = ComplianceRule({
            ruleId: _ruleId,
            ruleName: _ruleName,
            description: _description,
            applicableSpecies: _applicableSpecies,
            region: _region,
            isActive: true,
            createdAt: block.timestamp
        });
        
        emit ComplianceRuleAdded(_ruleId, _ruleName, block.timestamp);
    }
    
    function updateComplianceRule(
        string memory _ruleId,
        bool _isActive
    ) external onlyAuthorizedRegulator {
        require(bytes(complianceRules[_ruleId].ruleId).length > 0, "Rule not found");
        
        complianceRules[_ruleId].isActive = _isActive;
    }
    
    // Compliance checking
    function performComplianceCheck(
        string memory _batchId,
        string memory _ruleId,
        bool _passed,
        string memory _details
    ) external onlyAuthorizedRegulator {
        require(bytes(complianceRules[_ruleId].ruleId).length > 0, "Rule not found");
        require(complianceRules[_ruleId].isActive, "Rule is not active");
        
        complianceChecks[_batchId].push(ComplianceCheck({
            batchId: _batchId,
            ruleId: _ruleId,
            passed: _passed,
            details: _details,
            timestamp: block.timestamp,
            checker: msg.sender
        }));
        
        emit ComplianceCheckPerformed(_batchId, _ruleId, _passed, block.timestamp);
    }
    
    // Certification management
    function issueCertification(
        string memory _certificateId,
        string memory _batchId,
        string memory _certType,
        string memory _issuer,
        uint256 _validUntil,
        string memory _ipfsHash
    ) external onlyAuthorizedCertifier {
        require(bytes(certifications[_batchId][0].certificateId).length == 0 || 
                certifications[_batchId].length == 0, "Certificate already exists for this batch");
        
        certifications[_batchId].push(Certification({
            certificateId: _certificateId,
            batchId: _batchId,
            certType: _certType,
            issuer: _issuer,
            validFrom: block.timestamp,
            validUntil: _validUntil,
            ipfsHash: _ipfsHash,
            isActive: true
        }));
        
        emit CertificationIssued(_certificateId, _batchId, block.timestamp);
    }
    
    function revokeCertification(
        string memory _batchId,
        string memory _certificateId
    ) external onlyAuthorizedCertifier {
        // Find and revoke the certificate
        for (uint i = 0; i < certifications[_batchId].length; i++) {
            if (keccak256(bytes(certifications[_batchId][i].certificateId)) == 
                keccak256(bytes(_certificateId))) {
                certifications[_batchId][i].isActive = false;
                emit CertificationRevoked(_certificateId, block.timestamp);
                break;
            }
        }
    }
    
    // Query functions
    function getComplianceRule(string memory _ruleId) external view returns (ComplianceRule memory) {
        return complianceRules[_ruleId];
    }
    
    function getComplianceChecks(string memory _batchId) external view returns (ComplianceCheck[] memory) {
        return complianceChecks[_batchId];
    }
    
    function getCertifications(string memory _batchId) external view returns (Certification[] memory) {
        return certifications[_batchId];
    }
    
    function isBatchCompliant(string memory _batchId) external view returns (bool) {
        ComplianceCheck[] memory checks = complianceChecks[_batchId];
        
        if (checks.length == 0) return false;
        
        for (uint i = 0; i < checks.length; i++) {
            if (!checks[i].passed) {
                return false;
            }
        }
        
        return true;
    }
    
    function hasValidCertification(string memory _batchId) external view returns (bool) {
        Certification[] memory certs = certifications[_batchId];
        
        for (uint i = 0; i < certs.length; i++) {
            if (certs[i].isActive && 
                block.timestamp >= certs[i].validFrom && 
                block.timestamp <= certs[i].validUntil) {
                return true;
            }
        }
        
        return false;
    }
}
