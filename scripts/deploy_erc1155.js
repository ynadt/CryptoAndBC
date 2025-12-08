// scripts/deploy_erc1155.js
// Deploy GameCharacterCollectionERC1155 to Sepolia (or another network configured in Hardhat)

import { network } from "hardhat";

async function main() {
  const { ethers } = await network.connect();

  console.log("Deploying GameCharacterCollectionERC1155...");

  const ContractFactory = await ethers.getContractFactory(
    "GameCharacterCollectionERC1155"
  );

  const contract = await ContractFactory.deploy();

  const deploymentTx = await contract.deploymentTransaction();
  console.log("TX hash:", deploymentTx.hash);

  console.log("Waiting for deployment...");
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log("Deployed GameCharacterCollectionERC1155 at:", address);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
