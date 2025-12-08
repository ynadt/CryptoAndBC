import { network } from "hardhat";

async function main() {
  const { ethers } = await network.connect();

  const contractAddress = "0x8D9B0bfba0d42D72964aFC39AFE3aFcB025F7e0E";

  const studentAddress = process.env.STUDENT_ADDRESS;
  const metadataUri = process.env.SVC_METADATA_URI;

  if (!studentAddress) {
    throw new Error("STUDENT_ADDRESS is not set in .env");
  }

  if (!metadataUri) {
    throw new Error("SVC_METADATA_URI is not set in .env");
  }

  console.log("Using contract:", contractAddress);
  console.log("Minting visit card to:", studentAddress);
  console.log("Metadata URI:", metadataUri);

  const contract = await ethers.getContractAt(
    "SoulboundVisitCardERC721",
    contractAddress
  );

  const tx = await contract.mintVisitCard(studentAddress, metadataUri);
  console.log("Mint transaction hash:", tx.hash);

  const receipt = await tx.wait();
  console.log("Mint transaction mined in block:", receipt.blockNumber);

  const tokenId = await contract.getVisitCardTokenId(studentAddress);
  console.log("Minted soulbound visit card tokenId:", tokenId.toString());
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
