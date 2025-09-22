// migrations/1_deploy_contracts.js
import HerbTraceability from "../contracts/HerbTraceability.sol";
import ComplianceManager from "../contracts/ComplianceManager.sol";
import SustainabilityTracker from "../contracts/SustainabilityTracker.sol";

export default async function (deployer, network, accounts) {
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

  // Save contract addresses to environment file
  import('fs').then(fs => {
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
  });
}