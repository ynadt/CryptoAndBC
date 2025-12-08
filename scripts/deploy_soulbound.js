import { network } from "hardhat";

async function main() {
  const { ethers } = await network.connect();

  console.log("Deploying SoulboundVisitCardERC721...");

  const ContractFactory = await ethers.getContractFactory("SoulboundVisitCardERC721");

  const contract = await ContractFactory.deploy();

  const tx = await contract.deploymentTransaction();
  console.log("TX hash:", tx.hash);

  console.log("Waiting for deployment...");
  await contract.waitForDeployment();

  console.log("Deployed at:", await contract.getAddress());
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
