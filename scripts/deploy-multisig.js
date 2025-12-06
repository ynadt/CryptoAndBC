import { ethers } from "ethers";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();

async function main() {
  const RPC_URL = process.env.SEPOLIA_RPC_URL;
  const PRIVATE_KEY = process.env.PRIVATE_KEY;

  if (!RPC_URL) throw new Error("Missing SEPOLIA_RPC_URL in .env");
  if (!PRIVATE_KEY) throw new Error("Missing PRIVATE_KEY in .env");

  // Load compiled artifact (ABI + bytecode)
  const artifactPath = "./artifacts/contracts/MultiSigWallet.sol/MultiSigWallet.json";
  const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));

  // Create JSON-RPC provider + wallet signer (ethers v6)
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

  // Constructor args
  const owners = [
    "0x1111111111111111111111111111111111111111",
    "0x2222222222222222222222222222222222222222",
    "0x3333333333333333333333333333333333333333",
  ];

  const requiredConfirmations = 2;

  console.log("Deploying MultiSigWallet...");

  // Create factory manually using ABI + bytecode
  const factory = new ethers.ContractFactory(
    artifact.abi,
    artifact.bytecode,
    wallet
  );

  // Deploy contract
  const contract = await factory.deploy(owners, requiredConfirmations);

  console.log("Waiting for deployment...");
  await contract.waitForDeployment();

  console.log("🚀 MultiSigWallet deployed at:", await contract.getAddress());
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
