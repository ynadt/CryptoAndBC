const { ethers, upgrades } = require("hardhat");

async function main() {
  const proxyAddress = "0x0568F953f18B4d8520C89aFf3C2a15a5010A61bE";

  console.log("Upgrading proxy:", proxyAddress);

  const MyTokenV2 = await ethers.getContractFactory("MyTokenV2");

  const upgraded = await upgrades.upgradeProxy(proxyAddress, MyTokenV2);

  console.log("Proxy upgraded to MyTokenV2");

  const v = await upgraded.version();
  console.log("version() via proxy:", v);

  const implAddress = await upgrades.erc1967.getImplementationAddress(
    proxyAddress
  );
  console.log("New implementation (logic) address:", implAddress);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
