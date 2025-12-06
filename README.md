# Multi-Signature Wallet (Module 8 – Multi-Signature Wallet Contract)

## Overview
This project implements a secure N-of-M Multi-Signature Wallet in Solidity.  
A transaction can be submitted by any owner, but it executes only after receiving the required number of confirmations.  
The project includes a Hardhat setup, automated tests, and a deployment script.

---

## Features
- Fixed list of owners defined at deployment
- Required confirmation threshold
- Transaction lifecycle: submit → confirm → execute → revoke
- Prevention of duplicate confirmations
- Secure Ether transfers (checks-effects-interactions pattern)
- Event logging for all major actions
- Full test suite using Hardhat v3 with Mocha/Chai

---

## Contract Structure
- **submitTransaction()** – proposes a new transfer
- **confirmTransaction()** – owner approves the transaction
- **revokeConfirmation()** – owner removes approval before execution
- **executeTransaction()** – executes after reaching confirmation threshold
- **getTransaction()** – returns stored transaction information
- **getConfirmationCount()** – returns how many owners approved a transaction

---

## Install & Setup
Install dependencies:
```sh
npm install
```
## Project Configuration

### Create .env and include:
```env
SEPOLIA_RPC_URL=YOUR_RPC_URL
PRIVATE_KEY=YOUR_PRIVATE_KEY
```

---

## Running Tests

### Execute the full test suite:
```bash
npx hardhat test
```

### The tests cover:
```text
- Contract deployment and initialization
- Transaction submission
- Confirmation and revocation logic
- Execution with sufficient confirmations
- Protection against duplicate confirmations
- Rejection of unauthorized actions
```

---

## Deployment

### Deploy to Local Hardhat Network
```bash
npx hardhat run scripts/deploy.js --network localhost
```

### Deploy to Sepolia
```bash
npx hardhat run scripts/deploy.js --network sepolia
```

---

## Project Structure
```text
contracts/
  MultiSigWallet.sol
scripts/
  deploy.js
test/
  multisig.test.js
hardhat.config.ts
README.md
```

---

## Security Notes
```text
- Checks-effects-interactions pattern applied
- Only registered owners can submit, confirm, revoke, or execute
- Internal tracking prevents duplicate confirmations
- Execution forbidden without the required threshold
- Events emitted for transparency and auditability
```

---

## Purpose of Multi-Sig Wallets
```text
Multi-signature wallets enhance security by requiring multiple approvals for sensitive operations.
They are widely used for:

- Treasury management
- DAO governance
- Secure team-controlled funds
- Reducing risks of a single private-key compromise

Multi-sig designs significantly strengthen safety in decentralized applications by enforcing shared control, reducing attack vectors, and providing transparent transaction approval flows.
```