# MyToken – ERC-20 Token on Hardhat 3 (Ethers v6 + TypeScript)

This project implements a custom ERC-20 token using **Hardhat 3**, **Ethers v6**, and **OpenZeppelin**.  
It includes full deployment to a local Hardhat network and Mocha tests for transfers and minting.

---

## **Project Version**
When creating the project, the following initialization options were selected:

- **Hardhat version:** 3.x (ESM-only)
- **Project type:** Ethers + Mocha toolbox
- **Language:** TypeScript
- **Toolbox:** `@nomicfoundation/hardhat-toolbox-mocha-ethers`
- **Solidity version:** 0.8.28

This means the project uses:
- new Hardhat plugin architecture
- modern ESM imports
- Ethers v6 API
- Hardhat Ignition folder structure

---

## **Contract Description**

The project contains a single ERC-20 token:

### `contracts/MyToken.sol`
Features:
- Inherits `ERC20` and `Ownable` from OpenZeppelin
- Constructor mints initial supply to deployer
- Additional `mint()` function restricted by `onlyOwner`
- Compatible with Hardhat 3 + Solc 0.8.28

---

## **Project Structure**
mytoken/
│  hardhat.config.ts  
│  package.json  
│  tsconfig.json  
│  README.md  
│
├── contracts/  
│     MyToken.sol  
│
├── scripts/  
│     deploy.js  
│
└── test/  
MyToken.js

## 1. Install dependencies
Run this once inside the project folder:
npx install  

## 2. Compile the smart contract
npx hardhat compile  

## 3. Start local Hardhat blockchain
This terminal must remain running:
npx hardhat node  

## 4. Deploy the contract to localhost
Open a second terminal in the same project folder:  
npx hardhat run scripts/deploy.js --network localhost  

## 5. Run the test suite
npx hardhat test  
