// migrations/1_deploy_contracts.js
const HerbTraceability = artifacts.require("HerbTraceability");
const ComplianceManager = artifacts.require("ComplianceManager");
const SustainabilityTracker = artifacts.require("SustainabilityTracker");

module.exports = async function (deployer, network, accounts) {
  console.log("Deploying contracts to network:", network);
  console.log("Deployer account:", accounts[0]);

  // Deploy HerbTraceability contract
  await deployer.deploy(HerbTraceability);
  const herbTraceability = await HerbTraceability.deployed();
  console.log("HerbTraceability deployed at:", herbTraceability.address);

  // Deploy ComplianceManager contract
  await deployer.deploy(ComplianceManager);
  const complianceManager = await ComplianceManager.deployed();
  console.log("ComplianceManager deployed at:", complianceManager.address);

  // Deploy SustainabilityTracker contract
  await deployer.deploy(SustainabilityTracker);
  const sustainabilityTracker = await SustainabilityTracker.deployed();
  console.log("SustainabilityTracker deployed at:", sustainabilityTracker.address);

  // Set up initial configuration
  if (network === "development" || network === "ganache") {
    console.log("Setting up development environment...");
    
    // Add some test authorized addresses
    await herbTraceability.addAuthorizedCollector(accounts[1]);
    await herbTraceability.addAuthorizedProcessor(accounts[2]);
    await herbTraceability.addAuthorizedLab(accounts[3]);
    await herbTraceability.addAuthorizedManufacturer(accounts[4]);
    await herbTraceability.addAuthorizedRegulator(accounts[5]);

    await complianceManager.addAuthorizedRegulator(accounts[5]);
    await complianceManager.addAuthorizedCertifier(accounts[6]);

    console.log("Development environment setup complete");
  }

  // Save contract addresses to environment file
  const fs = require('fs');
  const contractAddresses = {
    HerbTraceability: herbTraceability.address,
    ComplianceManager: complianceManager.address,
    SustainabilityTracker: sustainabilityTracker.address,
    network: network,
    deployedAt: new Date().toISOString()
  };

  fs.writeFileSync(
    './contract-addresses.json',
    JSON.stringify(contractAddresses, null, 2)
  );

  console.log("Contract addresses saved to contract-addresses.json");
};
