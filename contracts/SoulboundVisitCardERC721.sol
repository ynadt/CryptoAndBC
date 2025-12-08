// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract SoulboundVisitCardERC721 is ERC721URIStorage, Ownable {

    uint256 private _nextTokenId = 1;

    mapping(address => bool) public hasVisitCard;
    mapping(address => uint256) private _visitCardTokenId;

    event VisitCardMinted(address indexed student, uint256 indexed tokenId);

    constructor()
    ERC721("StudentVisitCard", "SVC")
    Ownable(msg.sender)
    {}

    function mintVisitCard(address to, string calldata tokenUri)
    external
    onlyOwner
    returns (uint256 tokenId)
    {
        require(to != address(0), "Invalid address");
        require(!hasVisitCard[to], "Already minted");

        tokenId = _nextTokenId++;
        hasVisitCard[to] = true;
        _visitCardTokenId[to] = tokenId;

        _safeMint(to, tokenId);
        _setTokenURI(tokenId, tokenUri);

        emit VisitCardMinted(to, tokenId);
    }

    function getVisitCardTokenId(address student)
    external
    view
    returns (uint256)
    {
        require(hasVisitCard[student], "No card");
        return _visitCardTokenId[student];
    }

    /**
     * @dev Core soulbound logic for OpenZeppelin v5.
     * `_update` is called on mint, transfer and burn.
     * We block any transfer where both `from` and `to` are non-zero.
     */
    function _update(
        address to,
        uint256 tokenId,
        address auth
    )
    internal
    override
    returns (address)
    {
        address from = _ownerOf(tokenId);

        // Reject transfers: only allow mint (from == 0)
        if (from != address(0) && to != address(0)) {
            revert("Soulbound: transfer disabled");
        }

        // Reject burn
        if (to == address(0)) {
            revert("Soulbound: burn disabled");
        }

        return super._update(to, tokenId, auth);
    }
}
