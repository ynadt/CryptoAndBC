# Upgradeable ERC20 Token (Transparent Proxy, Hardhat 2)

**Author:** Yuliya Nadtacheyeva  
**Network:** Sepolia Testnet

This project implements an upgradeable ERC20 token using the **Transparent Proxy pattern**. Users always interact with the proxy, while the implementation (logic) contract can be upgraded without changing the token address or balances.

---

## 1. Contract Addresses (Sepolia)

| Component             | Address                                    |
|-----------------------|--------------------------------------------|
| **Proxy** (main token address) | `0x0568F953f18B4d8520C89aFf3C2a15a5010A61bE` |
| Implementation V1     | `0xf7eC1Ec51Ea7335ABf7b9FA58489381497F4Afff` |
| Implementation V2     | `0x57f47112Ed2e89E08B1Ee53C71022ACe8aC9827f` |
| ProxyAdmin            | `0x9C4B630c8e59860D52Edf4Ab780764560f8BcdDC` |

---

## 2. Verified Etherscan Links

| Contract       | Link                                                                                                      |
|----------------|-----------------------------------------------------------------------------------------------------------|
| MyTokenV1 (implementation) | [🔗 Etherscan](https://sepolia.etherscan.io/address/0xf7eC1Ec51Ea7335ABf7b9FA58489381497F4Afff#code) |
| MyTokenV2 (implementation) | [🔗 Etherscan](https://sepolia.etherscan.io/address/0x57f47112Ed2e89E08B1Ee53C71022ACe8aC9827f#code) |
| Proxy (main token)         | [🔗 Etherscan](https://sepolia.etherscan.io/address/0x0568F953f18B4d8520C89aFf3C2a15a5010A61bE)       |
| ProxyAdmin                 | [🔗 Etherscan](https://sepolia.etherscan.io/address/0x9C4B630c8e59860D52Edf4Ab780764560f8BcdDC)       |

---

## 3. Implemented Components

### ERC20 V1
- Standard ERC20 token
- `mint()` restricted to owner
- Passed to proxy as initial implementation

### Proxy (Transparent Proxy)
- Created through OpenZeppelin Hardhat Upgrades
- Holds all token balances
- Delegates all calls to implementation contract

### ERC20 V2
- Same storage layout as V1
- Added new function:
  ```solidity
  function version() public pure returns (string memory) {
      return "V2";
  }

## 4. Detailed Deployment Steps

Below is the full deployment and upgrade flow exactly as executed on Sepolia.

### Step 1 — Deploy ERC20 V1 (Logic Contract)
```bash
npx hardhat run scripts/deployV1.js --network sepolia
```
**Result:**
```
MyTokenV1 deployed at 0xf7eC1Ec51Ea7335ABf7b9FA58489381497F4Afff
```

---

### Step 2 — Deploy Transparent Proxy (with ProxyAdmin)
```bash
npx hardhat run scripts/deployProxyV1.js --network sepolia
```
**Results:**
```
Proxy: 0x0568F953f18B4d8520C89aFf3C2a15a5010A61bE
Implementation (V1): 0xf7eC1Ec51Ea7335ABf7b9FA58489381497F4Afff
ProxyAdmin: 0x9C4B630c8e59860D52Edf4Ab780764560f8BcdDC
```

---

### Step 3 — Verify Implementation V1 on Etherscan
```bash
npx hardhat verify --network sepolia 0xf7eC1Ec51Ea7335ABf7b9FA58489381497F4Afff
```

---

### Step 4 — Interact With the Proxy

**Through Etherscan → Contract → Write as Proxy:**
```
mint(0x31Bf433d9999A4299B53Bb1D648EFb3CBce5495A, 1000)
transfer(0x31Bf433d9999A4299B53Bb1D648EFb3CBce5495A, 500)
```

**Through Read as Proxy:**
```
balanceOf(0x31Bf433d9999A4299B53Bb1D648EFb3CBce5495A)
```

This confirmed that the proxy correctly delegates calls to V1.

---

### Step 5 — Deploy ERC20 V2 (New Logic)

**Added only:**
```solidity
// MyTokenV2.sol
function version() public pure returns (string memory) {
    return "V2";
}
```

**Compilation:**
```bash
npx hardhat compile
```

**Deployment:**
```bash
npx hardhat run scripts/deployV2.js --network sepolia
```
**Result:**
```
MyTokenV2 deployed at 0x57f47112Ed2e89E08B1Ee53C71022ACe8aC9827f
```

---

### Step 6 — Upgrade the Proxy to V2
```bash
npx hardhat run scripts/upgradeToV2.js --network sepolia
```
**Results:**
```
Proxy upgraded to V2 implementation
New implementation address: 0x57f47112Ed2e89E08B1Ee53C71022ACe8aC9827f
```

---

### Step 7 — Verify Implementation V2 on Etherscan
```bash
npx hardhat verify --network sepolia 0x57f47112Ed2e89E08B1Ee53C71022ACe8aC9827f
```

---

### Step 8 — Validate Upgrade

**Test 1: Verify balances unchanged**
```bash
# Before upgrade
npx hardhat run scripts/checkBalance.js --network sepolia
```
```
Balance of 0x31Bf433d9999A4299B53Bb1D648EFb3CBce5495A: 500 tokens
```

```bash
# After upgrade
npx hardhat run scripts/checkBalance.js --network sepolia
```
```
Balance of 0x31Bf433d9999A4299B53Bb1D648EFb3CBce5495A: 500 tokens
```

**Test 2: Verify new function available**
```bash
npx hardhat run scripts/checkVersion.js --network sepolia
```
```
Contract version: V2
```

**Direct Etherscan verification:**
```
Read as Proxy → version() → returns: "V2"
```

---

## 5. Summary

```text
This project demonstrates:
✓ Creation of an ERC20 logic contract (V1)
✓ Deployment of Transparent Proxy + ProxyAdmin
✓ Token interaction via proxy (mint, transfer)
✓ Safe creation of new logic contract (V2)
✓ Successful proxy upgrade from V1 → V2
✓ Verified unchanged balances after upgrade
✓ Verified new V2 logic through proxy (version())
✓ All contracts verified on Etherscan
```