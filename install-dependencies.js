#!/usr/bin/env node

/**
 * Clean Installation Script
 * Handles dependency installation with proper cleanup
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🧹 Cleaning and Installing Dependencies...\n');

function runCommand(command, description) {
  console.log(`📦 ${description}...`);
  try {
    execSync(command, { stdio: 'inherit' });
    console.log(`✅ ${description} completed\n`);
    return true;
  } catch (error) {
    console.log(`❌ ${description} failed:`, error.message);
    return false;
  }
}

function cleanInstall() {
  // Remove node_modules and package-lock.json
  console.log('🗑️  Cleaning previous installation...');
  
  if (fs.existsSync('node_modules')) {
    console.log('   Removing node_modules...');
    fs.rmSync('node_modules', { recursive: true, force: true });
  }
  
  if (fs.existsSync('package-lock.json')) {
    console.log('   Removing package-lock.json...');
    fs.unlinkSync('package-lock.json');
  }
  
  console.log('✅ Cleanup completed\n');
}

function main() {
  // Clean previous installation
  cleanInstall();
  
  // Install dependencies
  if (!runCommand('npm install --legacy-peer-deps', 'Installing dependencies')) {
    console.log('\n⚠️  Installation failed. Trying alternative approach...\n');
    
    // Try with different flags
    if (!runCommand('npm install --force', 'Installing with force flag')) {
      console.log('\n❌ Installation failed. Please check the error messages above.');
      console.log('\n💡 Try manually installing specific packages:');
      console.log('   npm install ethers web3 express mongoose');
      console.log('   npm install --save-dev truffle @truffle/hdwallet-provider');
      process.exit(1);
    }
  }
  
  console.log('🎉 Dependencies installed successfully!');
  console.log('\n📋 Next steps:');
  console.log('   1. Update your .env file with required values');
  console.log('   2. Run: npm run setup');
  console.log('   3. Run: npm start');
}

if (require.main === module) {
  main();
}
