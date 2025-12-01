const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying V1 with:", deployer.address);

  const initialSupply = ethers.parseUnits("1000", 18);

  const MyTokenV1 = await ethers.getContractFactory("MyTokenV1");
  const tokenV1 = await MyTokenV1.deploy(initialSupply);

  await tokenV1.waitForDeployment();

  console.log("V1 deployed at:", await tokenV1.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
