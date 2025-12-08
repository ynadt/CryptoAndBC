// scripts/transfer_to_student.js
// Transfer 1–2 ERC1155 character NFTs from owner to the student wallet

import { network } from "hardhat";

async function main() {
  const { ethers } = await network.connect();

  const contractAddress = process.env.GAME_ERC1155_ADDRESS;
  if (!contractAddress) {
    throw new Error("Missing GAME_ERC1155_ADDRESS in .env");
  }

  // Owner is the account that deployed and did mintBatch
  const [owner] = await ethers.getSigners();

  //  wallet (MetaMask) address
  const studentAddress = "0x36e4fca2b9896d020ae3384e0094233fa7b2c89d";

  console.log("Using ERC1155 contract:", contractAddress);
  console.log("Owner (sender):   ", owner.address);
  console.log("Student (receiver):", studentAddress);

  const erc1155 = await ethers.getContractAt(
    "GameCharacterCollectionERC1155",
    contractAddress,
    owner
  );

  // Example: transfer token IDs 1 and 2, 1 piece each
  const ids = [1, 2];
  const amounts = [1, 1];

  console.log(
    `Transferring character IDs ${ids.join(", ")} from owner to student...`
  );

  const tx = await erc1155.safeBatchTransferFrom(
    owner.address,
    studentAddress,
    ids,
    amounts,
    "0x"
  );

  console.log("Transfer TX hash:", tx.hash);

  const receipt = await tx.wait();
  console.log("Transfer mined in block:", receipt.blockNumber);

  console.log(
    "Transfer completed. Student now owns these character NFTs on ERC-1155."
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
