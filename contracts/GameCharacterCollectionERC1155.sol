// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title GameCharacterCollectionERC1155
 * @dev 10-token ERC-1155 collection with metadata stored on IPFS.
 *      Supports batch minting and normal transfers (not soulbound).
 */
contract GameCharacterCollectionERC1155 is ERC1155, Ownable {

    uint256 public constant TOTAL_CHARACTERS = 10;

    constructor()
    ERC1155("ipfs://bafybeifnm6ausz4vvtsp4yrrentpnhufb4dasoehnszviy3oleecoutnve/{id}.json")
    Ownable(msg.sender)
    {}

    /**
     * @notice Mint a single character NFT.
     * @param to Receiver wallet
     * @param id Token ID (1–10)
     * @param amount Quantity to mint
     */
    function mint(
        address to,
        uint256 id,
        uint256 amount
    ) external onlyOwner {
        require(id >= 1 && id <= TOTAL_CHARACTERS, "Invalid character ID");
        _mint(to, id, amount, "");
    }

    /**
     * @notice Batch mint multiple character NFTs.
     * @param to Receiver wallet
     * @param ids Array of token IDs
     * @param amounts Array of amounts
     */
    function mintBatchCharacters(
        address to,
        uint256[] calldata ids,
        uint256[] calldata amounts
    ) external onlyOwner {
        require(ids.length == amounts.length, "Array length mismatch");

        for (uint256 i = 0; i < ids.length; i++) {
            require(ids[i] >= 1 && ids[i] <= TOTAL_CHARACTERS, "Invalid character ID");
        }

        _mintBatch(to, ids, amounts, "");
    }
}
