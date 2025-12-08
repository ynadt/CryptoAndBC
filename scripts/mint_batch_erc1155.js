// scripts/mint_batch_erc1155.js
// Batch-mint 10 character NFTs (ID 1..10, amount 1 each) to the owner address

import { network } from "hardhat";

async function main() {
  const { ethers } = await network.connect();

  const contractAddress = process.env.GAME_ERC1155_ADDRESS;
  if (!contractAddress) {
    throw new Error("Missing GAME_ERC1155_ADDRESS in .env");
  }

  const [owner] = await ethers.getSigners();

  console.log("Using ERC1155 contract:", contractAddress);
  console.log("Owner (minter) address:", owner.address);

  const erc1155 = await ethers.getContractAt(
    "GameCharacterCollectionERC1155",
    contractAddress,
    owner
  );

  // IDs 1..10
  const ids = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  // One NFT per ID
  const amounts = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1];

  console.log("Minting batch of 10 character NFTs to owner...");
  console.log("IDs:     ", ids);
  console.log("Amounts: ", amounts);

  const tx = await erc1155.mintBatchCharacters(owner.address, ids, amounts);
  console.log("Mint batch TX hash:", tx.hash);

  const receipt = await tx.wait();
  console.log("Mint batch mined in block:", receipt.blockNumber);

  console.log("Batch mint completed. Owner now holds 10 character NFTs (1..10).");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
