// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "@account-abstraction/contracts/core/BasePaymaster.sol";
import "@account-abstraction/contracts/interfaces/IEntryPoint.sol";

/**
 * @title Paymaster
 * @dev ERC-4337 compliant paymaster for gasless transactions with sponsor management
 * @author AI-Powered Escrow Platform
 * @notice This contract enables gasless transactions by allowing sponsors to pay for user gas costs
 */
contract Paymaster is BasePaymaster, AccessControl, Pausable, ReentrancyGuard {
    using Address for address payable;

    // ============ Constants ============

    /// @notice Role for contract administrators
    bytes32 public constant DEFAULT_ADMIN_ROLE = 0x00;
    
    /// @notice Role for sponsors who can fund gas costs
    bytes32 public constant SPONSOR_ROLE = keccak256("SPONSOR_ROLE");
    
    /// @notice Role for operators who can manage whitelists
    bytes32 public constant OPERATOR_ROLE = keccak256("OPERATOR_ROLE");

    // ============ State Variables ============

    /// @notice Mapping from sponsor address to their balance
    mapping(address => uint256) public sponsorBalances;
    
    /// @notice Mapping from sponsor address to whitelisted users
    mapping(address => mapping(address => bool)) public whitelistedUsers;
    
    /// @notice Mapping from sponsor address to their metadata
    mapping(address => SponsorMetadata) public sponsorMetadata;
    
    /// @notice Rate limiter contract address (optional)
    address public rateLimiter;
    
    /// @notice Total gas costs paid by all sponsors
    uint256 public totalGasPaid;
    
    /// @notice Total number of sponsored transactions
    uint256 public totalSponsoredTx;

    // ============ Structs ============

    /**
     * @dev Metadata for a sponsor
     */
    struct SponsorMetadata {
        string name;
        uint256 maxDailySpend;
        uint256 dailySpent;
        uint256 lastResetTime;
        bool isActive;
        uint256 createdAt;
    }

    /**
     * @dev Context data for paymaster operations
     */
    struct PaymasterContext {
        address sponsor;
        uint256 estimatedGas;
        uint256 maxCost;
    }

    // ============ Events ============

    /**
     * @dev Emitted when a sponsor is added
     * @param sponsor Address of the sponsor
     * @param initialDeposit Initial deposit amount
     * @param name Sponsor name
     */
    event SponsorAdded(
        address indexed sponsor,
        uint256 initialDeposit,
        string name
    );

    /**
     * @dev Emitted when a sponsor is removed
     * @param sponsor Address of the sponsor
     * @param remainingBalance Remaining balance returned
     */
    event SponsorRemoved(
        address indexed sponsor,
        uint256 remainingBalance
    );

    /**
     * @dev Emitted when funds are deposited to a sponsor
     * @param sponsor Address of the sponsor
     * @param amount Amount deposited
     * @param newBalance New total balance
     */
    event SponsorFunded(
        address indexed sponsor,
        uint256 amount,
        uint256 newBalance
    );

    /**
     * @dev Emitted when a user is whitelisted
     * @param sponsor Address of the sponsor
     * @param user Address of the whitelisted user
     */
    event UserWhitelisted(
        address indexed sponsor,
        address indexed user
    );

    /**
     * @dev Emitted when a user is removed from whitelist
     * @param sponsor Address of the sponsor
     * @param user Address of the removed user
     */
    event UserRemovedFromWhitelist(
        address indexed sponsor,
        address indexed user
    );

    /**
     * @dev Emitted when gas is reserved for a transaction
     * @param sponsor Address of the sponsor
     * @param user Address of the user
     * @param gasReserved Amount of gas reserved
     * @param maxCost Maximum cost allowed
     */
    event GasReserved(
        address indexed sponsor,
        address indexed user,
        uint256 gasReserved,
        uint256 maxCost
    );

    /**
     * @dev Emitted when gas is paid for a transaction
     * @param sponsor Address of the sponsor
     * @param user Address of the user
     * @param actualGasCost Actual gas cost paid
     */
    event GasPaid(
        address indexed sponsor,
        address indexed user,
        uint256 actualGasCost
    );

    /**
     * @dev Emitted when unused gas is refunded
     * @param sponsor Address of the sponsor
     * @param refundAmount Amount refunded
     */
    event Refunded(
        address indexed sponsor,
        uint256 refundAmount
    );

    /**
     * @dev Emitted when an escrow is revoked
     * @param escrowId Unique identifier for the escrow
     * @param reason Reason for revocation
     */
    event EscrowRevoked(
        bytes32 indexed escrowId,
        string reason
    );

    /**
     * @dev Emitted when funds are force transferred
     * @param from Address funds were taken from
     * @param to Address funds were sent to
     * @param amount Amount transferred
     * @param reason Reason for transfer
     */
    event ForceTransfer(
        address indexed from,
        address indexed to,
        uint256 amount,
        string reason
    );

    /**
     * @dev Emitted when rate limiter is updated
     * @param oldLimiter Previous rate limiter address
     * @param newLimiter New rate limiter address
     */
    event RateLimiterUpdated(
        address indexed oldLimiter,
        address indexed newLimiter
    );

    // ============ Modifiers ============

    /**
     * @dev Modifier to ensure sponsor exists and is active
     * @param sponsor Address of the sponsor
     */
    modifier onlyActiveSponsor(address sponsor) {
        require(sponsorMetadata[sponsor].isActive, "Sponsor not active");
        _;
    }

    /**
     * @dev Modifier to ensure user is whitelisted by sponsor
     * @param sponsor Address of the sponsor
     * @param user Address of the user
     */
    modifier onlyWhitelistedUser(address sponsor, address user) {
        require(whitelistedUsers[sponsor][user], "User not whitelisted");
        _;
    }

    // ============ Constructor ============

    /**
     * @dev Constructor sets up initial roles and entry point
     * @param _entryPoint Address of the EntryPoint contract
     * @param _admin Address of the initial admin
     */
    constructor(IEntryPoint _entryPoint, address _admin) BasePaymaster(_entryPoint) {
        _grantRole(DEFAULT_ADMIN_ROLE, _admin);
        _grantRole(SPONSOR_ROLE, _admin);
        _grantRole(OPERATOR_ROLE, _admin);
    }

    // ============ Core Paymaster Functions ============

    /**
     * @dev Validates a paymaster user operation
     * @param userOp The user operation to validate
     * @param userOpHash Hash of the user operation
     * @param maxCost Maximum cost allowed for this operation
     * @return context Context data for postOp
     * @return validationData Validation data for the operation
     */
    function _validatePaymasterUserOp(
        UserOperation calldata userOp,
        bytes32 userOpHash,
        uint256 maxCost
    ) internal virtual override whenNotPaused returns (bytes memory context, uint256 validationData) {
        // Decode sponsor address from paymasterAndData
        require(userOp.paymasterAndData.length >= 20, "Invalid paymaster data");
        address sponsor = address(uint160(uint256(bytes32(userOp.paymasterAndData[0:20]))));
        
        // Validate sponsor is active
        require(sponsorMetadata[sponsor].isActive, "Sponsor not active");
        
        // Validate user is whitelisted
        require(whitelistedUsers[sponsor][userOp.sender], "User not whitelisted");
        
        // Validate sponsor has sufficient balance
        require(sponsorBalances[sponsor] >= maxCost, "Insufficient sponsor balance");
        
        // Check daily spending limit
        _checkDailySpendingLimit(sponsor, maxCost);
        
        // Reserve the estimated gas cost
        sponsorBalances[sponsor] -= maxCost;
        
        // Emit gas reserved event
        emit GasReserved(sponsor, userOp.sender, maxCost, maxCost);
        
        // Return context for postOp
        context = abi.encode(PaymasterContext({
            sponsor: sponsor,
            estimatedGas: maxCost,
            maxCost: maxCost
        }));
        
        // Return validation data (0 = valid)
        validationData = 0;
    }

    /**
     * @dev Handles post-operation logic
     * @param mode Post operation mode
     * @param context Context data from validatePaymasterUserOp
     * @param actualGasCost Actual gas cost of the operation
     */
    function _postOp(
        PostOpMode mode,
        bytes calldata context,
        uint256 actualGasCost
    ) internal virtual override {
        PaymasterContext memory ctx = abi.decode(context, (PaymasterContext));
        address sponsor = ctx.sponsor;
        
        if (mode == PostOpMode.opSucceeded) {
            // Operation succeeded, update daily spent
            _updateDailySpending(sponsor, actualGasCost);
            
            // Update total gas paid
            totalGasPaid += actualGasCost;
            totalSponsoredTx += 1;
            
            // Emit gas paid event
            emit GasPaid(sponsor, msg.sender, actualGasCost);
            
            // Refund unused gas if any
            if (ctx.maxCost > actualGasCost) {
                uint256 refundAmount = ctx.maxCost - actualGasCost;
                sponsorBalances[sponsor] += refundAmount;
                emit Refunded(sponsor, refundAmount);
            }
        } else {
            // Operation failed, refund the reserved amount
            sponsorBalances[sponsor] += ctx.maxCost;
            emit Refunded(sponsor, ctx.maxCost);
        }
    }

    // ============ Admin Functions ============

    /**
     * @dev Adds a new sponsor
     * @param sponsor Address of the sponsor
     * @param initialDeposit Initial deposit amount
     * @param name Sponsor name
     * @param maxDailySpend Maximum daily spending limit
     */
    function addSponsor(
        address sponsor,
        uint256 initialDeposit,
        string memory name,
        uint256 maxDailySpend
    ) external onlyRole(ADMIN_ROLE) {
        require(sponsor != address(0), "Invalid sponsor address");
        require(!sponsorMetadata[sponsor].isActive, "Sponsor already exists");
        require(initialDeposit > 0, "Initial deposit must be positive");
        
        // Grant sponsor role
        _grantRole(SPONSOR_ROLE, sponsor);
        
        // Set sponsor metadata
        sponsorMetadata[sponsor] = SponsorMetadata({
            name: name,
            maxDailySpend: maxDailySpend,
            dailySpent: 0,
            lastResetTime: block.timestamp,
            isActive: true,
            createdAt: block.timestamp
        });
        
        // Add initial deposit
        sponsorBalances[sponsor] = initialDeposit;
        
        emit SponsorAdded(sponsor, initialDeposit, name);
    }

    /**
     * @dev Removes a sponsor and returns remaining balance
     * @param sponsor Address of the sponsor to remove
     */
    function removeSponsor(address sponsor) external onlyRole(ADMIN_ROLE) {
        require(sponsorMetadata[sponsor].isActive, "Sponsor not active");
        
        uint256 remainingBalance = sponsorBalances[sponsor];
        
        // Revoke sponsor role
        _revokeRole(SPONSOR_ROLE, sponsor);
        
        // Mark as inactive
        sponsorMetadata[sponsor].isActive = false;
        
        // Return remaining balance to sponsor
        if (remainingBalance > 0) {
            payable(sponsor).sendValue(remainingBalance);
        }
        
        emit SponsorRemoved(sponsor, remainingBalance);
    }

    /**
     * @dev Whitelists a user for a sponsor
     * @param sponsor Address of the sponsor
     * @param user Address of the user to whitelist
     */
    function whitelistUser(address sponsor, address user) external onlyRole(OPERATOR_ROLE) {
        require(sponsorMetadata[sponsor].isActive, "Sponsor not active");
        require(user != address(0), "Invalid user address");
        require(!whitelistedUsers[sponsor][user], "User already whitelisted");
        
        whitelistedUsers[sponsor][user] = true;
        emit UserWhitelisted(sponsor, user);
    }

    /**
     * @dev Removes a user from sponsor's whitelist
     * @param sponsor Address of the sponsor
     * @param user Address of the user to remove
     */
    function removeWhitelistedUser(address sponsor, address user) external onlyRole(OPERATOR_ROLE) {
        require(whitelistedUsers[sponsor][user], "User not whitelisted");
        
        whitelistedUsers[sponsor][user] = false;
        emit UserRemovedFromWhitelist(sponsor, user);
    }

    /**
     * @dev Revokes an active escrow based on misuse or fraud
     * @param escrowId Unique identifier for the escrow
     * @param reason Reason for revocation
     */
    function revokeEscrow(bytes32 escrowId, string memory reason) external onlyRole(ADMIN_ROLE) {
        // This would integrate with the Escrow contract
        // For now, we just emit the event
        emit EscrowRevoked(escrowId, reason);
    }

    /**
     * @dev Force transfers funds to an external address (compliance seizure or cleanup)
     * @param from Address to take funds from
     * @param to Address to send funds to
     * @param amount Amount to transfer
     * @param reason Reason for transfer
     */
    function forceWithdraw(
        address from,
        address to,
        uint256 amount,
        string memory reason
    ) external onlyRole(ADMIN_ROLE) {
        require(to != address(0), "Invalid destination address");
        require(amount > 0, "Amount must be positive");
        require(sponsorBalances[from] >= amount, "Insufficient balance");
        
        sponsorBalances[from] -= amount;
        payable(to).sendValue(amount);
        
        emit ForceTransfer(from, to, amount, reason);
    }

    /**
     * @dev Pauses the paymaster (emergency stop)
     */
    function pausePaymaster() external onlyRole(ADMIN_ROLE) {
        _pause();
    }

    /**
     * @dev Unpauses the paymaster
     */
    function unpausePaymaster() external onlyRole(ADMIN_ROLE) {
        _unpause();
    }

    /**
     * @dev Sets the rate limiter contract
     * @param limiterContract Address of the rate limiter contract
     */
    function setRateLimiter(address limiterContract) external onlyRole(ADMIN_ROLE) {
        address oldLimiter = rateLimiter;
        rateLimiter = limiterContract;
        emit RateLimiterUpdated(oldLimiter, limiterContract);
    }

    // ============ View Functions ============

    /**
     * @dev Gets the balance of a sponsor
     * @param sponsor Address of the sponsor
     * @return Balance of the sponsor
     */
    function getSponsorBalance(address sponsor) external view returns (uint256) {
        return sponsorBalances[sponsor];
    }

    /**
     * @dev Gets the metadata of a sponsor
     * @param sponsor Address of the sponsor
     * @return Metadata of the sponsor
     */
    function getSponsorMetadata(address sponsor) external view returns (SponsorMetadata memory) {
        return sponsorMetadata[sponsor];
    }

    /**
     * @dev Checks if a user is whitelisted by a sponsor
     * @param sponsor Address of the sponsor
     * @param user Address of the user
     * @return True if user is whitelisted
     */
    function isUserWhitelisted(address sponsor, address user) external view returns (bool) {
        return whitelistedUsers[sponsor][user];
    }

    // ============ Internal Functions ============

    /**
     * @dev Checks daily spending limit for a sponsor
     * @param sponsor Address of the sponsor
     * @param amount Amount to spend
     */
    function _checkDailySpendingLimit(address sponsor, uint256 amount) internal view {
        SponsorMetadata storage metadata = sponsorMetadata[sponsor];
        
        // Reset daily spent if 24 hours have passed
        if (block.timestamp >= metadata.lastResetTime + 1 days) {
            // Daily limit resets, allow the transaction
            return;
        }
        
        require(
            metadata.dailySpent + amount <= metadata.maxDailySpend,
            "Daily spending limit exceeded"
        );
    }

    /**
     * @dev Updates daily spending for a sponsor
     * @param sponsor Address of the sponsor
     * @param amount Amount spent
     */
    function _updateDailySpending(address sponsor, uint256 amount) internal {
        SponsorMetadata storage metadata = sponsorMetadata[sponsor];
        
        // Reset daily spent if 24 hours have passed
        if (block.timestamp >= metadata.lastResetTime + 1 days) {
            metadata.dailySpent = amount;
            metadata.lastResetTime = block.timestamp;
        } else {
            metadata.dailySpent += amount;
        }
    }

    // ============ Receive Function ============

    /**
     * @dev Allows the contract to receive ETH
     */
    receive() external payable {
        // Contract can receive ETH for sponsor deposits
    }
} 