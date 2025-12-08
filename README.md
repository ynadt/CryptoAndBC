# README – Soulbound ERC‑721 + ERC‑1155 Game Character NFT Collection

## 1. Project Overview
This project implements two separate smart contracts deployed on the Sepolia test network:

1. **SoulboundVisitCardERC721** – a non‑transferable (soulbound) student visit card NFT.
2. **GameCharacterCollectionERC1155** – a collection of 10 ERC‑1155 game character NFTs, each with unique metadata and attributes.

Both contracts follow OpenZeppelin security standards, use off‑chain metadata via IPFS, and include full interaction scripts (deployment, minting, and transferring).

---

## 2. Deployed Contracts (Sepolia)

### **ERC‑721 Soulbound Visit Card**
**Address:**  
`0x8D9B0bfba0d42D72964aFC39AFE3aFcB025F7e0E`  
**Etherscan:**  
https://sepolia.etherscan.io/address/0x8D9B0bfba0d42D72964aFC39AFE3aFcB025F7e0E

---

### **ERC‑1155 Game Character Collection**
**Address:**  
`0x468F5A2614F95B57bfABE2FeD70e640056A93e0E`  
**Etherscan:**  
https://sepolia.etherscan.io/address/0x468F5A2614F95B57bfABE2FeD70e640056A93e0E

---

## 3. Metadata (IPFS)

### **ERC‑721 Visit Card Metadata**
Example URI (your uploaded file):  
`ipfs://bafkreibpu5cafrg4owzfilg6isxvgroa7sgispn6z4jpjg66xd72u3453m/metadata.json`

This file contains:
- image  
- studentName  
- studentId  
- course / year  

---

### **ERC‑1155 Game Characters Metadata**

Folder CID containing **10 metadata JSON files**:  
`bafybeifnm6ausz4vvtsp4yrrentpnhufb4dasoehnszviy3oleecoutnve`

Folder CID containing **10 character images**:  
`bafybeifnjdgsq7fms4235n7ewi44f7qf3q4v2e2xcqjzn2vwxyupbgt4pe`

Each metadata file follows the ERC‑1155 standard:

```
{
  "name": "Character 1",
  "description": "One of 10 unique game characters.",
  "image": "ipfs://<image_cid>/1.png",
  "attributes": [
    { "trait_type": "Color", "value": "Blue" },
    { "trait_type": "Strength", "value": 73 }
  ]
}
```

OpenSea/marketplaces **automatically read these files**, so your collection is marketplace‑compatible.

---

## 4. Deployment Scripts (Hardhat 3 + ESM)

### Deployment scripts:
- `deploy_soulbound.js`
- `deploy_erc1155.js`

### Minting scripts:
- `mint_soulbound.js`
- `mint_batch_erc1155.js`

### Transfer script:
- `transfer_to_student.js`

Location: `scripts/`

---

## 5. Proof of Functionality

### ✔ Soulbound ERC‑721 Minted  
Mint TX:  
`0x63d9b63df780fd3bf20b810ebec033109875b3d9c24766c2945ffe07f99f6cd1`  
Token ID: `1`  
Receiver wallet: `0x31Bf433d9999A4299B53Bb1D648Efb3CBce5495A`  
Non‑transferability confirmed (MetaMask cannot transfer).

---

### ✔ ERC‑1155 Batch Mint (10 tokens)
Mint TX:  
`0xe3eee2ce11a48639e983cf8fa5ab246cacbcc553661a6bdea3bd6512effe9733`  
IDs minted: `1–10` with quantity `1` each.

---

### ✔ ERC‑1155 Transfer to Student
Transferred IDs: **1, 2**  
To: `0x36e4fca2b9896d020ae3384e0094233fa7b2c89d`

Transfer TX:  
`0xf9a3d8c6fa3bc701ea03dd52051b8bc1efc7c0e4c7cf67425d041ef05bead7a4`

---

## 6. How to Deploy (Step‑by‑Step)

Install dependencies:

```
npm install
```

Compile:

```
npx hardhat compile
```

Deploy ERC‑721:

```
npx hardhat run scripts/deploy_soulbound.js --network sepolia
```

Deploy ERC‑1155:

```
npx hardhat run scripts/deploy_erc1155.js --network sepolia
```

---

## 7. How to Mint

### Mint soulbound ERC‑721:

```
npx hardhat run scripts/mint_soulbound.js --network sepolia
```

### Mint full ERC‑1155 collection:

```
npx hardhat run scripts/mint_batch_erc1155.js --network sepolia
```

---

## 8. How to Transfer ERC‑1155 NFTs

```
npx hardhat run scripts/transfer_to_student.js --network sepolia
```

---
