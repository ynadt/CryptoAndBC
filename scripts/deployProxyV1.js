const { ethers, upgrades } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying MyTokenV1 proxy with deployer:", deployer.address);

  const MyTokenV1 = await ethers.getContractFactory("MyTokenV1");

  const initialSupply = ethers.parseUnits("1000000", 18);

  const proxy = await upgrades.deployProxy(MyTokenV1, [initialSupply], {
    initializer: "initialize",
  });

  await proxy.waitForDeployment();

  const proxyAddress = await proxy.getAddress();
  const implAddress = await upgrades.erc1967.getImplementationAddress(
    proxyAddress
  );
  const adminAddress = await upgrades.erc1967.getAdminAddress(proxyAddress);

  console.log("MyTokenV1 proxy deployed at:", proxyAddress);
  console.log("MyTokenV1 implementation (logic) at:", implAddress);
  console.log("ProxyAdmin at:", adminAddress);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
