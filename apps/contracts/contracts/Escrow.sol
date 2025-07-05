// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title Escrow
 * @dev A secure escrow contract implementing a finite state machine for deal management
 * @author AI-Powered Escrow Platform
 * @notice This contract manages escrow deals with role-based access control and state transitions
 */
contract Escrow is AccessControl, ReentrancyGuard {
    using SafeERC20 for IERC20;

    // ============ Constants ============

    /// @notice Role for contract administrators
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    
    /// @notice Role for deal creators
    bytes32 public constant CREATOR_ROLE = keccak256("CREATOR_ROLE");
    
    /// @notice Role for arbiters who can approve deals
    bytes32 public constant ARBITER_ROLE = keccak256("ARBITER_ROLE");

    // ============ State Variables ============

    /// @notice Mapping from deal ID to deal state
    mapping(uint256 => EscrowState) public dealStates;
    
    /// @notice Mapping from deal ID to deal details
    mapping(uint256 => Deal) public deals;
    
    /// @notice Counter for generating unique deal IDs
    uint256 private _dealCounter;

    // ============ Structs ============

    /**
     * @dev Represents the state of an escrow deal
     */
    enum EscrowState {
        Created,    // Deal created, waiting for funding
        Funded,     // Deal funded, waiting for approval
        Approved,   // Deal approved, ready for release
        Released,   // Funds released to payee
        Disputed,   // Deal under dispute
        Cancelled   // Deal cancelled, funds refunded
    }

    /**
     * @dev Represents the details of an escrow deal
     */
    struct Deal {
        address payer;           // Address of the payer
        address payee;           // Address of the payee
        address token;           // Token address (address(0) for native ETH)
        uint256 amount;          // Amount to be escrowed
        uint256 createdAt;       // Timestamp when deal was created
        uint256 fundedAt;        // Timestamp when deal was funded
        uint256 approvedAt;      // Timestamp when deal was approved
        uint256 releasedAt;      // Timestamp when funds were released
        uint256 cancelledAt;     // Timestamp when deal was cancelled
        string metadata;         // Additional deal metadata (IPFS hash)
    }

    // ============ Events ============

    /**
     * @dev Emitted when a deal is created
     * @param dealId Unique identifier for the deal
     * @param payer Address of the payer
     * @param payee Address of the payee
     * @param token Token address
     * @param amount Amount to be escrowed
     * @param metadata Deal metadata
     */
    event DealCreated(
        uint256 indexed dealId,
        address indexed payer,
        address indexed payee,
        address token,
        uint256 amount,
        string metadata
    );

    /**
     * @dev Emitted when a deal is funded
     * @param dealId Unique identifier for the deal
     * @param funder Address that funded the deal
     * @param amount Amount funded
     */
    event DealFunded(
        uint256 indexed dealId,
        address indexed funder,
        uint256 amount
    );

    /**
     * @dev Emitted when a deal is approved
     * @param dealId Unique identifier for the deal
     * @param arbiter Address of the arbiter who approved
     */
    event DealApproved(
        uint256 indexed dealId,
        address indexed arbiter
    );

    /**
     * @dev Emitted when funds are released
     * @param dealId Unique identifier for the deal
     * @param payee Address that received the funds
     * @param amount Amount released
     */
    event FundsReleased(
        uint256 indexed dealId,
        address indexed payee,
        uint256 amount
    );

    /**
     * @dev Emitted when a dispute is raised
     * @param dealId Unique identifier for the deal
     * @param disputer Address that raised the dispute
     * @param reason Reason for the dispute
     */
    event DisputeRaised(
        uint256 indexed dealId,
        address indexed disputer,
        string reason
    );

    /**
     * @dev Emitted when a deal is cancelled
     * @param dealId Unique identifier for the deal
     * @param canceller Address that cancelled the deal
     * @param reason Reason for cancellation
     */
    event DealCancelled(
        uint256 indexed dealId,
        address indexed canceller,
        string reason
    );

    /**
     * @dev Emitted when the deal state changes
     * @param dealId Unique identifier for the deal
     * @param oldState Previous state
     * @param newState New state
     */
    event StateChanged(
        uint256 indexed dealId,
        EscrowState oldState,
        EscrowState newState
    );

    // ============ Modifiers ============

    /**
     * @dev Modifier to ensure deal exists
     * @param dealId Unique identifier for the deal
     */
    modifier dealExists(uint256 dealId) {
        require(dealStates[dealId] != EscrowState.Created || deals[dealId].payer != address(0), "Deal does not exist");
        _;
    }

    /**
     * @dev Modifier to ensure deal is in a specific state
     * @param dealId Unique identifier for the deal
     * @param expectedState Expected state of the deal
     */
    modifier onlyInState(uint256 dealId, EscrowState expectedState) {
        require(dealStates[dealId] == expectedState, "Deal is not in expected state");
        _;
    }

    // ============ Constructor ============

    /**
     * @dev Constructor sets up initial roles
     * @param admin Address of the initial admin
     */
    constructor(address admin) {
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(ADMIN_ROLE, admin);
        _grantRole(CREATOR_ROLE, admin);
        _grantRole(ARBITER_ROLE, admin);
    }

    // ============ Core Functions ============

    /**
     * @dev Creates a new escrow deal
     * @param payer Address of the payer
     * @param payee Address of the payee
     * @param token Token address (address(0) for native ETH)
     * @param amount Amount to be escrowed
     * @param metadata Deal metadata (IPFS hash)
     * @return dealId Unique identifier for the created deal
     */
    function createDeal(
        address payer,
        address payee,
        address token,
        uint256 amount,
        string calldata metadata
    ) external onlyRole(CREATOR_ROLE) returns (uint256 dealId) {
        require(payer != address(0), "Payer cannot be zero address");
        require(payee != address(0), "Payee cannot be zero address");
        require(amount > 0, "Amount must be greater than zero");
        require(payer != payee, "Payer and payee cannot be the same");

        dealId = _dealCounter++;
        
        deals[dealId] = Deal({
            payer: payer,
            payee: payee,
            token: token,
            amount: amount,
            createdAt: block.timestamp,
            fundedAt: 0,
            approvedAt: 0,
            releasedAt: 0,
            cancelledAt: 0,
            metadata: metadata
        });

        dealStates[dealId] = EscrowState.Created;

        emit DealCreated(dealId, payer, payee, token, amount, metadata);
        emit StateChanged(dealId, EscrowState.Created, EscrowState.Created);
    }

    /**
     * @dev Funds an escrow deal
     * @param dealId Unique identifier for the deal
     */
    function fundDeal(uint256 dealId) 
        external 
        payable 
        dealExists(dealId)
        onlyInState(dealId, EscrowState.Created)
        nonReentrant 
    {
        Deal storage deal = deals[dealId];
        
        if (deal.token == address(0)) {
            // Native ETH
            require(msg.value == deal.amount, "Incorrect ETH amount");
        } else {
            // ERC20 token
            require(msg.value == 0, "ETH not accepted for token deals");
            IERC20 token = IERC20(deal.token);
            token.safeTransferFrom(msg.sender, address(this), deal.amount);
        }

        deal.fundedAt = block.timestamp;
        EscrowState oldState = dealStates[dealId];
        dealStates[dealId] = EscrowState.Funded;

        emit DealFunded(dealId, msg.sender, deal.amount);
        emit StateChanged(dealId, oldState, EscrowState.Funded);
    }

    /**
     * @dev Approves a deal for release
     * @param dealId Unique identifier for the deal
     */
    function approveMilestone(uint256 dealId) 
        external 
        onlyRole(ARBITER_ROLE)
        dealExists(dealId)
        onlyInState(dealId, EscrowState.Funded)
    {
        Deal storage deal = deals[dealId];
        deal.approvedAt = block.timestamp;
        
        EscrowState oldState = dealStates[dealId];
        dealStates[dealId] = EscrowState.Approved;

        emit DealApproved(dealId, msg.sender);
        emit StateChanged(dealId, oldState, EscrowState.Approved);
    }

    /**
     * @dev Releases funds to the payee
     * @param dealId Unique identifier for the deal
     */
    function releaseFunds(uint256 dealId) 
        external 
        onlyRole(ARBITER_ROLE)
        dealExists(dealId)
        onlyInState(dealId, EscrowState.Approved)
        nonReentrant 
    {
        Deal storage deal = deals[dealId];
        deal.releasedAt = block.timestamp;

        if (deal.token == address(0)) {
            // Native ETH
            (bool success, ) = deal.payee.call{value: deal.amount}("");
            require(success, "ETH transfer failed");
        } else {
            // ERC20 token
            IERC20 token = IERC20(deal.token);
            token.safeTransfer(deal.payee, deal.amount);
        }

        EscrowState oldState = dealStates[dealId];
        dealStates[dealId] = EscrowState.Released;

        emit FundsReleased(dealId, deal.payee, deal.amount);
        emit StateChanged(dealId, oldState, EscrowState.Released);
    }

    /**
     * @dev Raises a dispute on a deal
     * @param dealId Unique identifier for the deal
     * @param reason Reason for the dispute
     */
    function raiseDispute(uint256 dealId, string calldata reason) 
        external 
        dealExists(dealId)
    {
        EscrowState currentState = dealStates[dealId];
        require(
            currentState == EscrowState.Funded || currentState == EscrowState.Approved,
            "Can only dispute funded or approved deals"
        );

        EscrowState oldState = dealStates[dealId];
        dealStates[dealId] = EscrowState.Disputed;

        emit DisputeRaised(dealId, msg.sender, reason);
        emit StateChanged(dealId, oldState, EscrowState.Disputed);
    }

    /**
     * @dev Cancels a deal and refunds funds
     * @param dealId Unique identifier for the deal
     * @param reason Reason for cancellation
     */
    function cancelDeal(uint256 dealId, string calldata reason) 
        external 
        onlyRole(ADMIN_ROLE)
        dealExists(dealId)
        nonReentrant 
    {
        EscrowState currentState = dealStates[dealId];
        require(
            currentState == EscrowState.Created || 
            currentState == EscrowState.Funded || 
            currentState == EscrowState.Approved || 
            currentState == EscrowState.Disputed,
            "Cannot cancel released deals"
        );

        Deal storage deal = deals[dealId];
        deal.cancelledAt = block.timestamp;

        // Refund funds if deal was funded
        if (currentState == EscrowState.Funded || currentState == EscrowState.Approved || currentState == EscrowState.Disputed) {
            if (deal.token == address(0)) {
                // Native ETH
                (bool success, ) = deal.payer.call{value: deal.amount}("");
                require(success, "ETH refund failed");
            } else {
                // ERC20 token
                IERC20 token = IERC20(deal.token);
                token.safeTransfer(deal.payer, deal.amount);
            }
        }

        EscrowState oldState = dealStates[dealId];
        dealStates[dealId] = EscrowState.Cancelled;

        emit DealCancelled(dealId, msg.sender, reason);
        emit StateChanged(dealId, oldState, EscrowState.Cancelled);
    }

    // ============ View Functions ============

    /**
     * @dev Gets the current state of a deal
     * @param dealId Unique identifier for the deal
     * @return Current state of the deal
     */
    function getDealState(uint256 dealId) external view returns (EscrowState) {
        return dealStates[dealId];
    }

    /**
     * @dev Gets the details of a deal
     * @param dealId Unique identifier for the deal
     * @return Deal details
     */
    function getDeal(uint256 dealId) external view returns (Deal memory) {
        return deals[dealId];
    }

    /**
     * @dev Gets the total number of deals created
     * @return Total number of deals
     */
    function getDealCount() external view returns (uint256) {
        return _dealCounter;
    }

    /**
     * @dev Checks if a deal exists
     * @param dealId Unique identifier for the deal
     * @return True if deal exists, false otherwise
     */
    function dealExists(uint256 dealId) external view returns (bool) {
        return dealStates[dealId] != EscrowState.Created || deals[dealId].payer != address(0);
    }

    // ============ Admin Functions ============

    /**
     * @dev Grants a role to an address (admin only)
     * @param role Role to grant
     * @param account Address to grant role to
     */
    function grantRole(bytes32 role, address account) 
        public 
        override 
        onlyRole(ADMIN_ROLE) 
    {
        super.grantRole(role, account);
    }

    /**
     * @dev Revokes a role from an address (admin only)
     * @param role Role to revoke
     * @param account Address to revoke role from
     */
    function revokeRole(bytes32 role, address account) 
        public 
        override 
        onlyRole(ADMIN_ROLE) 
    {
        super.revokeRole(role, account);
    }

    // ============ Emergency Functions ============

    /**
     * @dev Emergency function to recover stuck tokens (admin only)
     * @param token Token address to recover
     * @param to Address to send tokens to
     * @param amount Amount to recover
     */
    function emergencyRecover(
        address token,
        address to,
        uint256 amount
    ) external onlyRole(ADMIN_ROLE) {
        require(to != address(0), "Cannot recover to zero address");
        
        if (token == address(0)) {
            (bool success, ) = to.call{value: amount}("");
            require(success, "ETH recovery failed");
        } else {
            IERC20(token).safeTransfer(to, amount);
        }
    }

    // ============ Receive Function ============

    /**
     * @dev Allows the contract to receive ETH
     */
    receive() external payable {
        // Contract can receive ETH for escrow deals
    }
} 