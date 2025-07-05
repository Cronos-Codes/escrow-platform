// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @title RealEstateToken
 * @dev ERC-721 token representing real estate properties with verification capabilities
 */
contract RealEstateToken is ERC721, AccessControl, Pausable {
    using Counters for Counters.Counter;

    bytes32 public constant REAL_ESTATE_VERIFIER_ROLE = keccak256("REAL_ESTATE_VERIFIER_ROLE");
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    Counters.Counter private _tokenIds;

    struct PropertyData {
        string propertyId;
        string dealId;
        string location;
        uint256 size;
        uint256 valuation;
        string zoning;
        string documentUri;
        bool verified;
        uint256 mintedAt;
        address owner;
    }

    // Mapping from token ID to property data
    mapping(uint256 => PropertyData) public properties;
    
    // Mapping from deal ID to token ID
    mapping(string => uint256) public dealToToken;
    
    // Mapping from property ID to token ID
    mapping(string => uint256) public propertyToToken;

    // Events
    event PropertyTokenized(
        uint256 indexed tokenId,
        string indexed propertyId,
        string dealId,
        address indexed owner,
        string location,
        uint256 valuation
    );

    event PropertyVerified(
        uint256 indexed tokenId,
        string indexed propertyId,
        address indexed verifier
    );

    event TokenRevoked(
        uint256 indexed tokenId,
        string reason,
        address indexed revokedBy
    );

    event PropertyDataUpdated(
        uint256 indexed tokenId,
        string propertyId,
        address indexed updatedBy
    );

    constructor() ERC721("Real Estate Token", "RET") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
        _grantRole(REAL_ESTATE_VERIFIER_ROLE, msg.sender);
    }

    /**
     * @dev Mint a new property token
     * @param to The address that will own the token
     * @param tokenURI The URI for the token metadata
     * @param propertyId The unique property identifier
     * @param dealId The associated deal identifier
     * @param location The property location
     * @param size The property size in square feet
     * @param valuation The property valuation in USD
     * @param zoning The zoning classification
     * @param documentUri The URI to the property documents
     */
    function mint(
        address to,
        string memory tokenURI,
        string memory propertyId,
        string memory dealId,
        string memory location,
        uint256 size,
        uint256 valuation,
        string memory zoning,
        string memory documentUri
    ) external onlyRole(MINTER_ROLE) whenNotPaused returns (uint256) {
        require(bytes(propertyId).length > 0, "Property ID cannot be empty");
        require(bytes(dealId).length > 0, "Deal ID cannot be empty");
        require(propertyToToken[propertyId] == 0, "Property already tokenized");
        require(dealToToken[dealId] == 0, "Deal already tokenized");

        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();

        _safeMint(to, newTokenId);
        _setTokenURI(newTokenId, tokenURI);

        PropertyData memory property = PropertyData({
            propertyId: propertyId,
            dealId: dealId,
            location: location,
            size: size,
            valuation: valuation,
            zoning: zoning,
            documentUri: documentUri,
            verified: false,
            mintedAt: block.timestamp,
            owner: to
        });

        properties[newTokenId] = property;
        dealToToken[dealId] = newTokenId;
        propertyToToken[propertyId] = newTokenId;

        emit PropertyTokenized(
            newTokenId,
            propertyId,
            dealId,
            to,
            location,
            valuation
        );

        return newTokenId;
    }

    /**
     * @dev Verify a property token
     * @param tokenId The token ID to verify
     */
    function verifyProperty(uint256 tokenId) external onlyRole(REAL_ESTATE_VERIFIER_ROLE) {
        require(_exists(tokenId), "Token does not exist");
        require(!properties[tokenId].verified, "Property already verified");

        properties[tokenId].verified = true;

        emit PropertyVerified(
            tokenId,
            properties[tokenId].propertyId,
            msg.sender
        );
    }

    /**
     * @dev Revoke a property token
     * @param tokenId The token ID to revoke
     * @param reason The reason for revocation
     */
    function revokePropertyToken(uint256 tokenId, string memory reason) 
        external 
        onlyRole(REAL_ESTATE_VERIFIER_ROLE) 
    {
        require(_exists(tokenId), "Token does not exist");
        require(bytes(reason).length > 0, "Reason cannot be empty");

        // Burn the token
        _burn(tokenId);

        // Clear mappings
        string memory propertyId = properties[tokenId].propertyId;
        string memory dealId = properties[tokenId].dealId;
        
        delete propertyToToken[propertyId];
        delete dealToToken[dealId];
        delete properties[tokenId];

        emit TokenRevoked(tokenId, reason, msg.sender);
    }

    /**
     * @dev Update property data
     * @param tokenId The token ID
     * @param newValuation The new valuation
     * @param newZoning The new zoning classification
     */
    function updatePropertyData(
        uint256 tokenId,
        uint256 newValuation,
        string memory newZoning
    ) external onlyRole(REAL_ESTATE_VERIFIER_ROLE) {
        require(_exists(tokenId), "Token does not exist");
        require(newValuation > 0, "Valuation must be positive");

        properties[tokenId].valuation = newValuation;
        properties[tokenId].zoning = newZoning;

        emit PropertyDataUpdated(
            tokenId,
            properties[tokenId].propertyId,
            msg.sender
        );
    }

    /**
     * @dev Get property data by token ID
     * @param tokenId The token ID
     */
    function getPropertyData(uint256 tokenId) 
        external 
        view 
        returns (PropertyData memory) 
    {
        require(_exists(tokenId), "Token does not exist");
        return properties[tokenId];
    }

    /**
     * @dev Get token ID by deal ID
     * @param dealId The deal ID
     */
    function getTokenIdByDealId(string memory dealId) 
        external 
        view 
        returns (uint256) 
    {
        return dealToToken[dealId];
    }

    /**
     * @dev Get token ID by property ID
     * @param propertyId The property ID
     */
    function getTokenIdByPropertyId(string memory propertyId) 
        external 
        view 
        returns (uint256) 
    {
        return propertyToToken[propertyId];
    }

    /**
     * @dev Check if property is verified
     * @param tokenId The token ID
     */
    function isPropertyVerified(uint256 tokenId) external view returns (bool) {
        require(_exists(tokenId), "Token does not exist");
        return properties[tokenId].verified;
    }

    /**
     * @dev Pause the contract
     */
    function pause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _pause();
    }

    /**
     * @dev Unpause the contract
     */
    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
    }

    /**
     * @dev Override required by Solidity
     */
    function _burn(uint256 tokenId) internal override(ERC721) {
        super._burn(tokenId);
    }

    /**
     * @dev Override required by Solidity
     */
    function tokenURI(uint256 tokenId) 
        public 
        view 
        override(ERC721) 
        returns (string memory) 
    {
        return super.tokenURI(tokenId);
    }

    /**
     * @dev Override required by Solidity
     */
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
} 