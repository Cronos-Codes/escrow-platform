// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/utils/Address.sol";

/**
 * @title Escrow
 * @dev A gas-optimized escrow contract implementing a complete FSM for deal management
 * @author AI-Powered Escrow Platform
 * @notice This contract manages escrow deals with automated milestone tracking and comprehensive event logging
 * @custom:version 2.0.0
 * @custom:security-contact security@escrowplatform.com
 */
contract Escrow is AccessControl, ReentrancyGuard, Pausable {
    using SafeERC20 for IERC20;
    using Address for address payable;

    // ============ Constants ============

    /// @notice Role for contract administrators
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    
    /// @notice Role for deal creators
    bytes32 public constant CREATOR_ROLE = keccak256("CREATOR_ROLE");
    
    /// @notice Role for arbiters who can approve deals
    bytes32 public constant ARBITER_ROLE = keccak256("ARBITER_ROLE");
    
    /// @notice Role for milestone validators
    bytes32 public constant VALIDATOR_ROLE = keccak256("VALIDATOR_ROLE");
    
    /// @notice Maximum number of milestones per deal
    uint256 public constant MAX_MILESTONES = 50;
    
    /// @notice Maximum deal duration in seconds (1 year)
    uint256 public constant MAX_DEAL_DURATION = 365 days;
    
    /// @notice Minimum deal amount (to prevent spam)
    uint256 public constant MIN_DEAL_AMOUNT = 1000; // 1000 wei
    
    /// @notice Fee basis points (100 = 1%)
    uint256 public constant FEE_BASIS_POINTS = 100;
    
    /// @notice Maximum fee basis points (1000 = 10%)
    uint256 public constant MAX_FEE_BASIS_POINTS = 1000;
    
    /// @notice Recovery timelock duration (7 days)
    uint256 public constant RECOVERY_TIMELOCK = 7 days;
    
    /// @notice Maximum recovery timelock (30 days)
    uint256 public constant MAX_RECOVERY_TIMELOCK = 30 days;

    // ============ State Variables ============

    /// @notice Mapping from deal ID to deal state (packed for gas optimization)
    mapping(uint256 => uint8) public dealStates;
    
    /// @notice Mapping from deal ID to deal details
    mapping(uint256 => Deal) public deals;
    
    /// @notice Mapping from deal ID to milestones
    mapping(uint256 => mapping(uint256 => Milestone)) public milestones;
    
    /// @notice Mapping from deal ID to milestone count
    mapping(uint256 => uint256) public milestoneCount;
    
    /// @notice Counter for generating unique deal IDs
    uint256 private _dealCounter;
    
    /// @notice Platform fee recipient
    address public feeRecipient;
    
    /// @notice Current fee basis points
    uint256 public feeBasisPoints;
    
    /// @notice Total fees collected
    uint256 public totalFeesCollected;
    
    /// @notice Emergency pause flag
    bool public emergencyPaused;
    
    /// @notice Mapping from user address to their recovery address
    mapping(address => address) public recoveryAddresses;
    
    /// @notice Mapping from deal ID to recovery requests
    mapping(uint256 => RecoveryRequest) public recoveryRequests;

    // ============ Structs ============

    /**
     * @dev Represents the state of an escrow deal (optimized for gas)
     */
    enum EscrowState {
        Created,        // 0: Deal created, waiting for funding
        Funded,         // 1: Deal funded, waiting for milestone completion
        InProgress,     // 2: Milestones in progress
        Completed,      // 3: All milestones completed, ready for release
        Released,       // 4: Funds released to payee
        Disputed,       // 5: Deal under dispute
        Cancelled,      // 6: Deal cancelled, funds refunded
        Expired         // 7: Deal expired without completion
    }

    /**
     * @dev Represents the details of an escrow deal (packed for gas optimization)
     */
    struct Deal {
        address payer;           // Address of the payer (20 bytes)
        address payee;           // Address of the payee (20 bytes)
        address token;           // Token address (address(0) for native ETH) (20 bytes)
        uint128 amount;          // Amount to be escrowed (16 bytes)
        uint128 feeAmount;       // Fee amount (16 bytes)
        uint64 createdAt;        // Timestamp when deal was created (8 bytes)
        uint64 expiresAt;        // Timestamp when deal expires (8 bytes)
        uint32 timeoutDuration;  // Timeout duration in seconds (4 bytes)
        bool autoRelease;        // Auto-release when all milestones complete (1 byte)
        string metadata;         // Additional deal metadata (IPFS hash)
    }

    /**
     * @dev Represents a milestone within a deal
     */
    struct Milestone {
        string description;      // Milestone description
        uint128 amount;          // Amount allocated to this milestone
        uint64 dueDate;          // Due date for milestone completion
        uint8 status;            // 0: Pending, 1: Completed, 2: Disputed
        bool isCompleted;        // Completion status
        address validator;       // Address that can validate this milestone
        bytes32 evidenceHash;    // Hash of evidence for completion
    }

    /**
     * @dev Represents dispute information
     */
    struct DisputeInfo {
        address disputer;        // Address that raised the dispute
        string reason;           // Reason for dispute
        uint64 raisedAt;         // Timestamp when dispute was raised
        uint8 status;            // 0: Open, 1: Resolved, 2: Escalated
        bytes32 evidenceHash;    // Hash of dispute evidence
    }

    /**
     * @dev Represents a recovery request for compromised wallets
     */
    struct RecoveryRequest {
        address requester;       // Address that requested recovery
        address recoveryAddress; // Address to send funds to
        uint64 requestedAt;      // Timestamp when recovery was requested
        uint64 executionTime;    // Timestamp when recovery can be executed
        bool isExecuted;         // Whether recovery has been executed
        string reason;           // Reason for recovery request
    }

    // ============ Events ============

    /**
     * @dev Emitted when a deal is created
     * @param dealId Unique identifier for the deal
     * @param payer Address of the payer
     * @param payee Address of the payee
     * @param token Token address
     * @param amount Amount to be escrowed
     * @param feeAmount Fee amount
     * @param expiresAt Expiration timestamp
     * @param metadata Deal metadata
     */
    event DealCreated(
        uint256 indexed dealId,
        address indexed payer,
        address indexed payee,
        address token,
        uint256 amount,
        uint256 feeAmount,
        uint256 expiresAt,
        string metadata
    );

    /**
     * @dev Emitted when milestones are added to a deal
     * @param dealId Unique identifier for the deal
     * @param milestoneCount Number of milestones added
     * @param totalAmount Total amount across all milestones
     */
    event MilestonesAdded(
        uint256 indexed dealId,
        uint256 milestoneCount,
        uint256 totalAmount
    );

    /**
     * @dev Emitted when a deal is funded
     * @param dealId Unique identifier for the deal
     * @param funder Address that funded the deal
     * @param amount Amount funded
     * @param timestamp Funding timestamp
     */
    event DealFunded(
        uint256 indexed dealId,
        address indexed funder,
        uint256 amount,
        uint256 timestamp
    );

    /**
     * @dev Emitted when a milestone is completed
     * @param dealId Unique identifier for the deal
     * @param milestoneId Milestone identifier
     * @param validator Address that validated the milestone
     * @param evidenceHash Hash of completion evidence
     * @param timestamp Completion timestamp
     */
    event MilestoneCompleted(
        uint256 indexed dealId,
        uint256 indexed milestoneId,
        address indexed validator,
        bytes32 evidenceHash,
        uint256 timestamp
    );

    /**
     * @dev Emitted when all milestones are completed
     * @param dealId Unique identifier for the deal
     * @param completedAt Completion timestamp
     * @param autoRelease Whether auto-release is enabled
     */
    event AllMilestonesCompleted(
        uint256 indexed dealId,
        uint256 completedAt,
        bool autoRelease
    );

    /**
     * @dev Emitted when funds are released
     * @param dealId Unique identifier for the deal
     * @param payee Address that received the funds
     * @param amount Amount released
     * @param feeAmount Fee amount deducted
     * @param timestamp Release timestamp
     */
    event FundsReleased(
        uint256 indexed dealId,
        address indexed payee,
        uint256 amount,
        uint256 feeAmount,
        uint256 timestamp
    );

    /**
     * @dev Emitted when a dispute is raised
     * @param dealId Unique identifier for the deal
     * @param milestoneId Milestone identifier (if applicable)
     * @param disputer Address that raised the dispute
     * @param reason Reason for the dispute
     * @param evidenceHash Hash of dispute evidence
     * @param timestamp Dispute timestamp
     */
    event DisputeRaised(
        uint256 indexed dealId,
        uint256 indexed milestoneId,
        address indexed disputer,
        string reason,
        bytes32 evidenceHash,
        uint256 timestamp
    );

    /**
     * @dev Emitted when a dispute is resolved
     * @param dealId Unique identifier for the deal
     * @param milestoneId Milestone identifier (if applicable)
     * @param resolver Address that resolved the dispute
     * @param resolution Resolution decision
     * @param timestamp Resolution timestamp
     */
    event DisputeResolved(
        uint256 indexed dealId,
        uint256 indexed milestoneId,
        address indexed resolver,
        string resolution,
        uint256 timestamp
    );

    /**
     * @dev Emitted when a deal is cancelled
     * @param dealId Unique identifier for the deal
     * @param canceller Address that cancelled the deal
     * @param reason Reason for cancellation
     * @param refundAmount Amount refunded to payer
     * @param timestamp Cancellation timestamp
     */
    event DealCancelled(
        uint256 indexed dealId,
        address indexed canceller,
        string reason,
        uint256 refundAmount,
        uint256 timestamp
    );

    /**
     * @dev Emitted when a deal expires
     * @param dealId Unique identifier for the deal
     * @param refundAmount Amount refunded to payer
     * @param timestamp Expiration timestamp
     */
    event DealExpired(
        uint256 indexed dealId,
        uint256 refundAmount,
        uint256 timestamp
    );

    /**
     * @dev Emitted when the deal state changes
     * @param dealId Unique identifier for the deal
     * @param oldState Previous state
     * @param newState New state
     * @param timestamp State change timestamp
     * @param actor Address that triggered the state change
     */
    event StateChanged(
        uint256 indexed dealId,
        EscrowState oldState,
        EscrowState newState,
        uint256 timestamp,
        address indexed actor
    );

    /**
     * @dev Emitted when fees are updated
     * @param oldFeeBasisPoints Previous fee basis points
     * @param newFeeBasisPoints New fee basis points
     * @param updatedBy Address that updated the fees
     */
    event FeesUpdated(
        uint256 oldFeeBasisPoints,
        uint256 newFeeBasisPoints,
        address indexed updatedBy
    );

    /**
     * @dev Emitted when fees are collected
     * @param recipient Fee recipient address
     * @param amount Fee amount collected
     * @param token Token address (address(0) for ETH)
     */
    event FeesCollected(
        address indexed recipient,
        uint256 amount,
        address indexed token
    );

    /**
     * @dev Emitted for transaction tracking
     * @param dealId Unique identifier for the deal
     * @param action Action performed
     * @param actor Address that performed the action
     * @param timestamp Action timestamp
     * @param gasUsed Gas used for the transaction
     */
    event TransactionTracked(
        uint256 indexed dealId,
        string action,
        address indexed actor,
        uint256 timestamp,
        uint256 gasUsed
    );

    /**
     * @dev Emitted when a recovery address is set
     * @param user User address
     * @param recoveryAddress Recovery address
     * @param timestamp When recovery address was set
     */
    event RecoveryAddressSet(
        address indexed user,
        address indexed recoveryAddress,
        uint256 timestamp
    );

    /**
     * @dev Emitted when a recovery request is initiated
     * @param dealId Deal identifier
     * @param requester Address that requested recovery
     * @param recoveryAddress Address to recover funds to
     * @param executionTime When recovery can be executed
     * @param reason Reason for recovery
     */
    event RecoveryRequested(
        uint256 indexed dealId,
        address indexed requester,
        address indexed recoveryAddress,
        uint256 executionTime,
        string reason
    );

    /**
     * @dev Emitted when a recovery request is cancelled
     * @param dealId Deal identifier
     * @param canceller Address that cancelled the recovery
     * @param reason Reason for cancellation
     */
    event RecoveryCancelled(
        uint256 indexed dealId,
        address indexed canceller,
        string reason
    );

    /**
     * @dev Emitted when funds are recovered to alternative address
     * @param dealId Deal identifier
     * @param originalAddress Original address (payer/payee)
     * @param recoveryAddress Address that received the funds
     * @param amount Amount recovered
     * @param timestamp Recovery timestamp
     */
    event FundsRecovered(
        uint256 indexed dealId,
        address indexed originalAddress,
        address indexed recoveryAddress,
        uint256 amount,
        uint256 timestamp
    );

    /**
     * @dev Emitted when admin sets or removes recovery address for a user
     * @param admin Admin address that performed the action
     * @param user User address affected
     * @param oldRecoveryAddress Previous recovery address
     * @param newRecoveryAddress New recovery address
     * @param reason Reason for admin action
     */
    event AdminRecoveryAddressChanged(
        address indexed admin,
        address indexed user,
        address indexed oldRecoveryAddress,
        address newRecoveryAddress,
        string reason
    );

    // ============ Custom Errors ============

    /// @notice Thrown when a deal does not exist
    error DealNotFound(uint256 dealId);
    
    /// @notice Thrown when a deal is not in the expected state
    error InvalidDealState(uint256 dealId, EscrowState current, EscrowState expected);
    
    /// @notice Thrown when an invalid address is provided
    error InvalidAddress(address addr);
    
    /// @notice Thrown when an invalid amount is provided
    error InvalidAmount(uint256 provided, uint256 expected);
    
    /// @notice Thrown when the same address is used for payer and payee
    error SamePayerPayee(address addr);
    
    /// @notice Thrown when a deal has expired
    error DealExpired(uint256 dealId, uint256 expiresAt);
    
    /// @notice Thrown when milestone limit is exceeded
    error TooManyMilestones(uint256 count, uint256 max);
    
    /// @notice Thrown when milestone amounts don't match deal amount
    error MilestoneAmountMismatch(uint256 totalMilestones, uint256 dealAmount);
    
    /// @notice Thrown when milestone is not found
    error MilestoneNotFound(uint256 dealId, uint256 milestoneId);
    
    /// @notice Thrown when milestone is already completed
    error MilestoneAlreadyCompleted(uint256 dealId, uint256 milestoneId);
    
    /// @notice Thrown when caller is not authorized for milestone validation
    error UnauthorizedValidator(address caller, address expected);
    
    /// @notice Thrown when insufficient balance for operation
    error InsufficientBalance(uint256 available, uint256 required);
    
    /// @notice Thrown when transfer fails
    error TransferFailed(address to, uint256 amount);
    
    /// @notice Thrown when fee is too high
    error FeeTooHigh(uint256 fee, uint256 max);
    
    /// @notice Thrown when contract is in emergency pause
    error EmergencyPaused();
    
    /// @notice Thrown when operation is not allowed in current state
    error OperationNotAllowed(string operation, EscrowState state);
    
    /// @notice Thrown when recovery address is not set
    error RecoveryAddressNotSet(address user);
    
    /// @notice Thrown when recovery request already exists
    error RecoveryRequestExists(uint256 dealId);
    
    /// @notice Thrown when recovery request does not exist
    error RecoveryRequestNotFound(uint256 dealId);
    
    /// @notice Thrown when recovery timelock has not expired
    error RecoveryTimelockActive(uint256 dealId, uint256 executionTime);
    
    /// @notice Thrown when recovery has already been executed
    error RecoveryAlreadyExecuted(uint256 dealId);
    
    /// @notice Thrown when caller is not authorized for recovery
    error UnauthorizedRecovery(address caller, address expected);

    // ============ Modifiers ============

    /**
     * @dev Modifier to ensure deal exists
     * @param dealId Unique identifier for the deal
     */
    modifier dealExists(uint256 dealId) {
        if (dealId >= _dealCounter || deals[dealId].payer == address(0)) {
            revert DealNotFound(dealId);
        }
        _;
    }

    /**
     * @dev Modifier to ensure deal is in a specific state
     * @param dealId Unique identifier for the deal
     * @param expectedState Expected state of the deal
     */
    modifier onlyInState(uint256 dealId, EscrowState expectedState) {
        EscrowState currentState = EscrowState(dealStates[dealId]);
        if (currentState != expectedState) {
            revert InvalidDealState(dealId, currentState, expectedState);
        }
        _;
    }

    /**
     * @dev Modifier to ensure deal has not expired
     * @param dealId Unique identifier for the deal
     */
    modifier notExpired(uint256 dealId) {
        Deal storage deal = deals[dealId];
        if (block.timestamp > deal.expiresAt) {
            revert DealExpired(dealId, deal.expiresAt);
        }
        _;
    }

    /**
     * @dev Modifier to check for emergency pause
     */
    modifier notEmergencyPaused() {
        if (emergencyPaused) {
            revert EmergencyPaused();
        }
        _;
    }

    /**
     * @dev Modifier to track gas usage for transactions
     * @param dealId Deal identifier for tracking
     * @param action Action being performed
     */
    modifier trackGas(uint256 dealId, string memory action) {
        uint256 gasStart = gasleft();
        _;
        uint256 gasUsed = gasStart - gasleft();
        emit TransactionTracked(dealId, action, msg.sender, block.timestamp, gasUsed);
    }

    // ============ Constructor ============

    /**
     * @dev Constructor sets up initial roles and configuration
     * @param admin Address of the initial admin
     * @param _feeRecipient Address to receive platform fees
     * @param _feeBasisPoints Initial fee basis points (100 = 1%)
     */
    constructor(
        address admin,
        address _feeRecipient,
        uint256 _feeBasisPoints
    ) {
        if (admin == address(0)) revert InvalidAddress(admin);
        if (_feeRecipient == address(0)) revert InvalidAddress(_feeRecipient);
        if (_feeBasisPoints > MAX_FEE_BASIS_POINTS) revert FeeTooHigh(_feeBasisPoints, MAX_FEE_BASIS_POINTS);

        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(ADMIN_ROLE, admin);
        _grantRole(CREATOR_ROLE, admin);
        _grantRole(ARBITER_ROLE, admin);
        _grantRole(VALIDATOR_ROLE, admin);

        feeRecipient = _feeRecipient;
        feeBasisPoints = _feeBasisPoints;
    }

    // ============ Core Functions ============

    /**
     * @dev Creates a new escrow deal with enhanced validation and gas optimization
     * @param payer Address of the payer
     * @param payee Address of the payee
     * @param token Token address (address(0) for native ETH)
     * @param amount Amount to be escrowed
     * @param timeoutDuration Duration in seconds before deal expires
     * @param autoRelease Whether to auto-release funds when all milestones complete
     * @param metadata Deal metadata (IPFS hash)
     * @return dealId Unique identifier for the created deal
     */
    function createDeal(
        address payer,
        address payee,
        address token,
        uint256 amount,
        uint256 timeoutDuration,
        bool autoRelease,
        string calldata metadata
    ) external onlyRole(CREATOR_ROLE) whenNotPaused notEmergencyPaused returns (uint256 dealId) {
        // Input validation with custom errors for gas efficiency
        if (payer == address(0)) revert InvalidAddress(payer);
        if (payee == address(0)) revert InvalidAddress(payee);
        if (amount < MIN_DEAL_AMOUNT) revert InvalidAmount(amount, MIN_DEAL_AMOUNT);
        if (payer == payee) revert SamePayerPayee(payer);
        if (timeoutDuration > MAX_DEAL_DURATION) revert InvalidAmount(timeoutDuration, MAX_DEAL_DURATION);

        // Calculate fee amount
        uint256 feeAmount = (amount * feeBasisPoints) / 10000;
        
        // Use unchecked for gas optimization (overflow impossible with validation)
        unchecked {
            dealId = _dealCounter++;
        }
        
        uint64 currentTime = uint64(block.timestamp);
        uint64 expiresAt = currentTime + uint64(timeoutDuration);
        
        // Pack struct for gas optimization
        deals[dealId] = Deal({
            payer: payer,
            payee: payee,
            token: token,
            amount: uint128(amount),
            feeAmount: uint128(feeAmount),
            createdAt: currentTime,
            expiresAt: expiresAt,
            timeoutDuration: uint32(timeoutDuration),
            autoRelease: autoRelease,
            metadata: metadata
        });

        dealStates[dealId] = uint8(EscrowState.Created);

        emit DealCreated(dealId, payer, payee, token, amount, feeAmount, expiresAt, metadata);
        emit StateChanged(dealId, EscrowState.Created, EscrowState.Created, block.timestamp, msg.sender);
    }

    /**
     * @dev Adds milestones to a deal
     * @param dealId Unique identifier for the deal
     * @param descriptions Array of milestone descriptions
     * @param amounts Array of milestone amounts
     * @param dueDates Array of milestone due dates
     * @param validators Array of milestone validators
     */
    function addMilestones(
        uint256 dealId,
        string[] calldata descriptions,
        uint256[] calldata amounts,
        uint256[] calldata dueDates,
        address[] calldata validators
    ) external onlyRole(CREATOR_ROLE) dealExists(dealId) onlyInState(dealId, EscrowState.Created) {
        uint256 length = descriptions.length;
        
        // Validate input arrays
        if (length != amounts.length || length != dueDates.length || length != validators.length) {
            revert InvalidAmount(length, amounts.length);
        }
        
        if (length > MAX_MILESTONES) {
            revert TooManyMilestones(length, MAX_MILESTONES);
        }

        Deal storage deal = deals[dealId];
        uint256 totalMilestoneAmount = 0;
        
        // Add milestones
        for (uint256 i = 0; i < length;) {
            if (validators[i] == address(0)) revert InvalidAddress(validators[i]);
            
            milestones[dealId][i] = Milestone({
                description: descriptions[i],
                amount: uint128(amounts[i]),
                dueDate: uint64(dueDates[i]),
                status: 0, // Pending
                isCompleted: false,
                validator: validators[i],
                evidenceHash: bytes32(0)
            });
            
            unchecked {
                totalMilestoneAmount += amounts[i];
                ++i;
            }
        }
        
        // Validate total milestone amount matches deal amount
        if (totalMilestoneAmount != deal.amount) {
            revert MilestoneAmountMismatch(totalMilestoneAmount, deal.amount);
        }
        
        milestoneCount[dealId] = length;
        
        emit MilestonesAdded(dealId, length, totalMilestoneAmount);
    }

    /**
     * @dev Funds an escrow deal with enhanced validation and gas optimization
     * @param dealId Unique identifier for the deal
     */
    function fundDeal(uint256 dealId) 
        external 
        payable 
        dealExists(dealId)
        onlyInState(dealId, EscrowState.Created)
        notExpired(dealId)
        whenNotPaused
        notEmergencyPaused
        nonReentrant
        trackGas(dealId, "fundDeal")
    {
        Deal storage deal = deals[dealId];
        uint256 totalAmount = deal.amount + deal.feeAmount;
        
        if (deal.token == address(0)) {
            // Native ETH - validate exact amount including fees
            if (msg.value != totalAmount) {
                revert InvalidAmount(msg.value, totalAmount);
            }
        } else {
            // ERC20 token - no ETH should be sent
            if (msg.value != 0) {
                revert InvalidAmount(msg.value, 0);
            }
            
            IERC20 token = IERC20(deal.token);
            // Transfer total amount including fees
            token.safeTransferFrom(msg.sender, address(this), totalAmount);
        }

        // Update state efficiently
        EscrowState oldState = EscrowState(dealStates[dealId]);
        EscrowState newState = milestoneCount[dealId] > 0 ? EscrowState.InProgress : EscrowState.Funded;
        dealStates[dealId] = uint8(newState);

        emit DealFunded(dealId, msg.sender, deal.amount, block.timestamp);
        emit StateChanged(dealId, oldState, newState, block.timestamp, msg.sender);
    }

    /**
     * @dev Completes a milestone with evidence validation
     * @param dealId Unique identifier for the deal
     * @param milestoneId Milestone identifier
     * @param evidenceHash Hash of completion evidence
     */
    function completeMilestone(
        uint256 dealId,
        uint256 milestoneId,
        bytes32 evidenceHash
    ) 
        external 
        dealExists(dealId)
        notExpired(dealId)
        whenNotPaused
        trackGas(dealId, "completeMilestone")
    {
        if (milestoneId >= milestoneCount[dealId]) {
            revert MilestoneNotFound(dealId, milestoneId);
        }
        
        Milestone storage milestone = milestones[dealId][milestoneId];
        
        // Check authorization - validator or arbiter can complete
        if (msg.sender != milestone.validator && !hasRole(ARBITER_ROLE, msg.sender)) {
            revert UnauthorizedValidator(msg.sender, milestone.validator);
        }
        
        if (milestone.isCompleted) {
            revert MilestoneAlreadyCompleted(dealId, milestoneId);
        }
        
        // Mark milestone as completed
        milestone.isCompleted = true;
        milestone.status = 1; // Completed
        milestone.evidenceHash = evidenceHash;
        
        emit MilestoneCompleted(dealId, milestoneId, msg.sender, evidenceHash, block.timestamp);
        
        // Check if all milestones are completed
        if (_areAllMilestonesCompleted(dealId)) {
            Deal storage deal = deals[dealId];
            EscrowState oldState = EscrowState(dealStates[dealId]);
            dealStates[dealId] = uint8(EscrowState.Completed);
            
            emit AllMilestonesCompleted(dealId, block.timestamp, deal.autoRelease);
            emit StateChanged(dealId, oldState, EscrowState.Completed, block.timestamp, msg.sender);
            
            // Auto-release if enabled
            if (deal.autoRelease) {
                _releaseFunds(dealId);
            }
        }
    }

    /**
     * @dev Approves a deal for release (legacy function for backward compatibility)
     * @param dealId Unique identifier for the deal
     */
    function approveMilestone(uint256 dealId) 
        external 
        onlyRole(ARBITER_ROLE)
        dealExists(dealId)
        whenNotPaused
        trackGas(dealId, "approveMilestone")
    {
        EscrowState currentState = EscrowState(dealStates[dealId]);
        
        if (currentState == EscrowState.Funded) {
            // Simple approval for deals without milestones
            EscrowState oldState = currentState;
            dealStates[dealId] = uint8(EscrowState.Completed);
            
            emit StateChanged(dealId, oldState, EscrowState.Completed, block.timestamp, msg.sender);
        } else if (currentState == EscrowState.Completed) {
            // Already completed, allow release
            return;
        } else {
            revert InvalidDealState(dealId, currentState, EscrowState.Funded);
        }
    }

    /**
     * @dev Releases funds to the payee with fee handling
     * @param dealId Unique identifier for the deal
     */
    function releaseFunds(uint256 dealId) 
        external 
        onlyRole(ARBITER_ROLE)
        dealExists(dealId)
        onlyInState(dealId, EscrowState.Completed)
        whenNotPaused
        nonReentrant
        trackGas(dealId, "releaseFunds")
    {
        _releaseFunds(dealId);
    }

    /**
     * @dev Internal function to release funds with fee collection
     * @param dealId Unique identifier for the deal
     */
    function _releaseFunds(uint256 dealId) internal {
        Deal storage deal = deals[dealId];
        
        // Calculate amounts
        uint256 payeeAmount = deal.amount;
        uint256 feeAmount = deal.feeAmount;
        
        EscrowState oldState = EscrowState(dealStates[dealId]);
        dealStates[dealId] = uint8(EscrowState.Released);

        if (deal.token == address(0)) {
            // Native ETH transfers
            if (payeeAmount > 0) {
                (bool success, ) = payable(deal.payee).call{value: payeeAmount}("");
                if (!success) revert TransferFailed(deal.payee, payeeAmount);
            }
            
            if (feeAmount > 0) {
                (bool success, ) = payable(feeRecipient).call{value: feeAmount}("");
                if (!success) revert TransferFailed(feeRecipient, feeAmount);
                
                unchecked {
                    totalFeesCollected += feeAmount;
                }
                emit FeesCollected(feeRecipient, feeAmount, address(0));
            }
        } else {
            // ERC20 token transfers
            IERC20 token = IERC20(deal.token);
            
            if (payeeAmount > 0) {
                token.safeTransfer(deal.payee, payeeAmount);
            }
            
            if (feeAmount > 0) {
                token.safeTransfer(feeRecipient, feeAmount);
                
                unchecked {
                    totalFeesCollected += feeAmount;
                }
                emit FeesCollected(feeRecipient, feeAmount, deal.token);
            }
        }

        emit FundsReleased(dealId, deal.payee, payeeAmount, feeAmount, block.timestamp);
        emit StateChanged(dealId, oldState, EscrowState.Released, block.timestamp, msg.sender);
    }

    /**
     * @dev Raises a dispute on a deal or milestone
     * @param dealId Unique identifier for the deal
     * @param milestoneId Milestone identifier (use type(uint256).max for deal-level dispute)
     * @param reason Reason for the dispute
     * @param evidenceHash Hash of dispute evidence
     */
    function raiseDispute(
        uint256 dealId,
        uint256 milestoneId,
        string calldata reason,
        bytes32 evidenceHash
    ) 
        external 
        dealExists(dealId)
        whenNotPaused
        trackGas(dealId, "raiseDispute")
    {
        EscrowState currentState = EscrowState(dealStates[dealId]);
        
        // Validate disputable states
        if (currentState != EscrowState.Funded && 
            currentState != EscrowState.InProgress && 
            currentState != EscrowState.Completed) {
            revert OperationNotAllowed("dispute", currentState);
        }

        // Handle milestone-specific dispute
        if (milestoneId != type(uint256).max) {
            if (milestoneId >= milestoneCount[dealId]) {
                revert MilestoneNotFound(dealId, milestoneId);
            }
            
            Milestone storage milestone = milestones[dealId][milestoneId];
            milestone.status = 2; // Disputed
        }

        EscrowState oldState = currentState;
        dealStates[dealId] = uint8(EscrowState.Disputed);

        emit DisputeRaised(dealId, milestoneId, msg.sender, reason, evidenceHash, block.timestamp);
        emit StateChanged(dealId, oldState, EscrowState.Disputed, block.timestamp, msg.sender);
    }

    /**
     * @dev Resolves a dispute
     * @param dealId Unique identifier for the deal
     * @param milestoneId Milestone identifier (use type(uint256).max for deal-level dispute)
     * @param resolution Resolution decision
     * @param newState New state after resolution
     */
    function resolveDispute(
        uint256 dealId,
        uint256 milestoneId,
        string calldata resolution,
        EscrowState newState
    )
        external
        onlyRole(ARBITER_ROLE)
        dealExists(dealId)
        onlyInState(dealId, EscrowState.Disputed)
        whenNotPaused
        trackGas(dealId, "resolveDispute")
    {
        // Validate new state
        if (newState != EscrowState.InProgress && 
            newState != EscrowState.Completed && 
            newState != EscrowState.Cancelled) {
            revert InvalidDealState(dealId, EscrowState.Disputed, newState);
        }

        // Handle milestone-specific resolution
        if (milestoneId != type(uint256).max) {
            if (milestoneId >= milestoneCount[dealId]) {
                revert MilestoneNotFound(dealId, milestoneId);
            }
            
            Milestone storage milestone = milestones[dealId][milestoneId];
            milestone.status = 1; // Resolved
        }

        EscrowState oldState = EscrowState.Disputed;
        dealStates[dealId] = uint8(newState);

        emit DisputeResolved(dealId, milestoneId, msg.sender, resolution, block.timestamp);
        emit StateChanged(dealId, oldState, newState, block.timestamp, msg.sender);

        // Auto-release if resolved to completed and auto-release is enabled
        if (newState == EscrowState.Completed) {
            Deal storage deal = deals[dealId];
            if (deal.autoRelease) {
                _releaseFunds(dealId);
            }
        }
    }

    /**
     * @dev Cancels a deal and refunds funds with enhanced validation
     * @param dealId Unique identifier for the deal
     * @param reason Reason for cancellation
     */
    function cancelDeal(uint256 dealId, string calldata reason) 
        external 
        onlyRole(ADMIN_ROLE)
        dealExists(dealId)
        whenNotPaused
        nonReentrant
        trackGas(dealId, "cancelDeal")
    {
        EscrowState currentState = EscrowState(dealStates[dealId]);
        
        // Validate cancellable states
        if (currentState == EscrowState.Released || currentState == EscrowState.Cancelled) {
            revert OperationNotAllowed("cancel", currentState);
        }

        Deal storage deal = deals[dealId];
        uint256 refundAmount = 0;

        // Calculate refund amount based on state
        if (currentState == EscrowState.Funded || 
            currentState == EscrowState.InProgress || 
            currentState == EscrowState.Completed || 
            currentState == EscrowState.Disputed) {
            
            refundAmount = deal.amount + deal.feeAmount;
            
            if (deal.token == address(0)) {
                // Native ETH refund
                (bool success, ) = payable(deal.payer).call{value: refundAmount}("");
                if (!success) revert TransferFailed(deal.payer, refundAmount);
            } else {
                // ERC20 token refund
                IERC20 token = IERC20(deal.token);
                token.safeTransfer(deal.payer, refundAmount);
            }
        }

        EscrowState oldState = currentState;
        dealStates[dealId] = uint8(EscrowState.Cancelled);

        emit DealCancelled(dealId, msg.sender, reason, refundAmount, block.timestamp);
        emit StateChanged(dealId, oldState, EscrowState.Cancelled, block.timestamp, msg.sender);
    }

    /**
     * @dev Expires a deal that has passed its expiration time
     * @param dealId Unique identifier for the deal
     */
    function expireDeal(uint256 dealId) 
        external 
        dealExists(dealId)
        whenNotPaused
        nonReentrant
        trackGas(dealId, "expireDeal")
    {
        Deal storage deal = deals[dealId];
        
        if (block.timestamp <= deal.expiresAt) {
            revert InvalidAmount(block.timestamp, deal.expiresAt);
        }
        
        EscrowState currentState = EscrowState(dealStates[dealId]);
        
        // Only expire deals that haven't been released or cancelled
        if (currentState == EscrowState.Released || 
            currentState == EscrowState.Cancelled || 
            currentState == EscrowState.Expired) {
            revert OperationNotAllowed("expire", currentState);
        }

        uint256 refundAmount = 0;

        // Refund if deal was funded
        if (currentState == EscrowState.Funded || 
            currentState == EscrowState.InProgress || 
            currentState == EscrowState.Completed || 
            currentState == EscrowState.Disputed) {
            
            refundAmount = deal.amount + deal.feeAmount;
            
            if (deal.token == address(0)) {
                // Native ETH refund
                (bool success, ) = payable(deal.payer).call{value: refundAmount}("");
                if (!success) revert TransferFailed(deal.payer, refundAmount);
            } else {
                // ERC20 token refund
                IERC20 token = IERC20(deal.token);
                token.safeTransfer(deal.payer, refundAmount);
            }
        }

        EscrowState oldState = currentState;
        dealStates[dealId] = uint8(EscrowState.Expired);

        emit DealExpired(dealId, refundAmount, block.timestamp);
        emit StateChanged(dealId, oldState, EscrowState.Expired, block.timestamp, msg.sender);
    }

    // ============ Internal Helper Functions ============

    /**
     * @dev Checks if all milestones for a deal are completed
     * @param dealId Unique identifier for the deal
     * @return True if all milestones are completed
     */
    function _areAllMilestonesCompleted(uint256 dealId) internal view returns (bool) {
        uint256 count = milestoneCount[dealId];
        if (count == 0) return true;
        
        for (uint256 i = 0; i < count;) {
            if (!milestones[dealId][i].isCompleted) {
                return false;
            }
            unchecked { ++i; }
        }
        return true;
    }

    // ============ View Functions ============

    /**
     * @dev Gets the current state of a deal
     * @param dealId Unique identifier for the deal
     * @return Current state of the deal
     */
    function getDealState(uint256 dealId) external view returns (EscrowState) {
        return EscrowState(dealStates[dealId]);
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
     * @dev Gets milestone details
     * @param dealId Unique identifier for the deal
     * @param milestoneId Milestone identifier
     * @return Milestone details
     */
    function getMilestone(uint256 dealId, uint256 milestoneId) external view returns (Milestone memory) {
        if (milestoneId >= milestoneCount[dealId]) {
            revert MilestoneNotFound(dealId, milestoneId);
        }
        return milestones[dealId][milestoneId];
    }

    /**
     * @dev Gets all milestones for a deal
     * @param dealId Unique identifier for the deal
     * @return Array of milestone details
     */
    function getAllMilestones(uint256 dealId) external view returns (Milestone[] memory) {
        uint256 count = milestoneCount[dealId];
        Milestone[] memory result = new Milestone[](count);
        
        for (uint256 i = 0; i < count;) {
            result[i] = milestones[dealId][i];
            unchecked { ++i; }
        }
        
        return result;
    }

    /**
     * @dev Gets milestone completion status
     * @param dealId Unique identifier for the deal
     * @return completed Number of completed milestones
     * @return total Total number of milestones
     */
    function getMilestoneProgress(uint256 dealId) external view returns (uint256 completed, uint256 total) {
        total = milestoneCount[dealId];
        completed = 0;
        
        for (uint256 i = 0; i < total;) {
            if (milestones[dealId][i].isCompleted) {
                unchecked { ++completed; }
            }
            unchecked { ++i; }
        }
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
    function isDealExists(uint256 dealId) external view returns (bool) {
        return dealId < _dealCounter && deals[dealId].payer != address(0);
    }

    /**
     * @dev Checks if a deal has expired
     * @param dealId Unique identifier for the deal
     * @return True if deal has expired
     */
    function isDealExpired(uint256 dealId) external view returns (bool) {
        if (dealId >= _dealCounter) return false;
        return block.timestamp > deals[dealId].expiresAt;
    }

    /**
     * @dev Gets deal summary information
     * @param dealId Unique identifier for the deal
     * @return payer Payer address
     * @return payee Payee address
     * @return amount Deal amount
     * @return state Current state
     * @return isExpired Whether deal has expired
     * @return completedMilestones Number of completed milestones
     * @return totalMilestones Total number of milestones
     */
    function getDealSummary(uint256 dealId) external view returns (
        address payer,
        address payee,
        uint256 amount,
        EscrowState state,
        bool isExpired,
        uint256 completedMilestones,
        uint256 totalMilestones
    ) {
        if (dealId >= _dealCounter) {
            revert DealNotFound(dealId);
        }
        
        Deal storage deal = deals[dealId];
        payer = deal.payer;
        payee = deal.payee;
        amount = deal.amount;
        state = EscrowState(dealStates[dealId]);
        isExpired = block.timestamp > deal.expiresAt;
        totalMilestones = milestoneCount[dealId];
        
        // Count completed milestones
        completedMilestones = 0;
        for (uint256 i = 0; i < totalMilestones;) {
            if (milestones[dealId][i].isCompleted) {
                unchecked { ++completedMilestones; }
            }
            unchecked { ++i; }
        }
    }

    // ============ Admin Functions ============

    /**
     * @dev Updates platform fee basis points
     * @param newFeeBasisPoints New fee basis points (100 = 1%)
     */
    function updateFees(uint256 newFeeBasisPoints) 
        external 
        onlyRole(ADMIN_ROLE) 
        whenNotPaused
    {
        if (newFeeBasisPoints > MAX_FEE_BASIS_POINTS) {
            revert FeeTooHigh(newFeeBasisPoints, MAX_FEE_BASIS_POINTS);
        }
        
        uint256 oldFeeBasisPoints = feeBasisPoints;
        feeBasisPoints = newFeeBasisPoints;
        
        emit FeesUpdated(oldFeeBasisPoints, newFeeBasisPoints, msg.sender);
    }

    /**
     * @dev Updates fee recipient address
     * @param newFeeRecipient New fee recipient address
     */
    function updateFeeRecipient(address newFeeRecipient) 
        external 
        onlyRole(ADMIN_ROLE) 
        whenNotPaused
    {
        if (newFeeRecipient == address(0)) {
            revert InvalidAddress(newFeeRecipient);
        }
        
        feeRecipient = newFeeRecipient;
    }

    /**
     * @dev Sets emergency pause state
     * @param paused Whether to pause emergency functions
     */
    function setEmergencyPause(bool paused) 
        external 
        onlyRole(ADMIN_ROLE) 
    {
        emergencyPaused = paused;
    }

    /**
     * @dev Pauses the contract
     */
    function pause() external onlyRole(ADMIN_ROLE) {
        _pause();
    }

    /**
     * @dev Unpauses the contract
     */
    function unpause() external onlyRole(ADMIN_ROLE) {
        _unpause();
    }

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

    // ============ Recovery Functions ============

    /**
     * @dev Sets a recovery address for the caller in case their wallet is compromised
     * @param recoveryAddress Address to recover funds to
     */
    function setRecoveryAddress(address recoveryAddress) 
        external 
        whenNotPaused
    {
        if (recoveryAddress == address(0)) {
            revert InvalidAddress(recoveryAddress);
        }
        
        if (recoveryAddress == msg.sender) {
            revert SamePayerPayee(recoveryAddress);
        }
        
        recoveryAddresses[msg.sender] = recoveryAddress;
        
        emit RecoveryAddressSet(msg.sender, recoveryAddress, block.timestamp);
    }

    /**
     * @dev Admin function to force set recovery address for any user
     * @param user User address to set recovery for
     * @param recoveryAddress Address to recover funds to
     * @param reason Reason for admin override
     */
    function adminSetRecoveryAddress(
        address user,
        address recoveryAddress,
        string calldata reason
    ) 
        external 
        onlyRole(ADMIN_ROLE)
        whenNotPaused
    {
        if (user == address(0)) {
            revert InvalidAddress(user);
        }
        
        if (recoveryAddress == address(0)) {
            revert InvalidAddress(recoveryAddress);
        }
        
        if (recoveryAddress == user) {
            revert SamePayerPayee(recoveryAddress);
        }
        
        address oldRecoveryAddress = recoveryAddresses[user];
        recoveryAddresses[user] = recoveryAddress;
        
        emit RecoveryAddressSet(user, recoveryAddress, block.timestamp);
        emit AdminRecoveryAddressChanged(msg.sender, user, oldRecoveryAddress, recoveryAddress, reason);
    }

    /**
     * @dev Admin function to remove recovery address for any user
     * @param user User address to remove recovery for
     * @param reason Reason for removal
     */
    function adminRemoveRecoveryAddress(
        address user,
        string calldata reason
    ) 
        external 
        onlyRole(ADMIN_ROLE)
        whenNotPaused
    {
        if (user == address(0)) {
            revert InvalidAddress(user);
        }
        
        address oldRecoveryAddress = recoveryAddresses[user];
        if (oldRecoveryAddress == address(0)) {
            revert RecoveryAddressNotSet(user);
        }
        
        delete recoveryAddresses[user];
        
        emit RecoveryAddressSet(user, address(0), block.timestamp);
        emit AdminRecoveryAddressChanged(msg.sender, user, oldRecoveryAddress, address(0), reason);
    }

    /**
     * @dev Initiates a recovery request for a deal where the user's wallet may be compromised
     * @param dealId Deal identifier
     * @param reason Reason for recovery request
     */
    function requestRecovery(
        uint256 dealId,
        string calldata reason
    ) 
        external 
        dealExists(dealId)
        whenNotPaused
        trackGas(dealId, "requestRecovery")
    {
        Deal storage deal = deals[dealId];
        
        // Only payer or payee can request recovery for their own funds
        if (msg.sender != deal.payer && msg.sender != deal.payee) {
            revert UnauthorizedRecovery(msg.sender, deal.payer);
        }
        
        // Check if recovery address is set
        address recoveryAddr = recoveryAddresses[msg.sender];
        if (recoveryAddr == address(0)) {
            revert RecoveryAddressNotSet(msg.sender);
        }
        
        // Check if recovery request already exists
        if (recoveryRequests[dealId].requester != address(0)) {
            revert RecoveryRequestExists(dealId);
        }
        
        // Validate deal state - can only recover from active deals
        EscrowState currentState = EscrowState(dealStates[dealId]);
        if (currentState == EscrowState.Released || 
            currentState == EscrowState.Cancelled || 
            currentState == EscrowState.Expired) {
            revert OperationNotAllowed("recovery", currentState);
        }
        
        uint64 executionTime = uint64(block.timestamp + RECOVERY_TIMELOCK);
        
        recoveryRequests[dealId] = RecoveryRequest({
            requester: msg.sender,
            recoveryAddress: recoveryAddr,
            requestedAt: uint64(block.timestamp),
            executionTime: executionTime,
            isExecuted: false,
            reason: reason
        });
        
        emit RecoveryRequested(dealId, msg.sender, recoveryAddr, executionTime, reason);
    }

    /**
     * @dev Executes a recovery request after timelock expires
     * @param dealId Deal identifier
     */
    function executeRecovery(uint256 dealId) 
        external 
        dealExists(dealId)
        whenNotPaused
        nonReentrant
        trackGas(dealId, "executeRecovery")
    {
        RecoveryRequest storage request = recoveryRequests[dealId];
        
        if (request.requester == address(0)) {
            revert RecoveryRequestNotFound(dealId);
        }
        
        if (request.isExecuted) {
            revert RecoveryAlreadyExecuted(dealId);
        }
        
        if (block.timestamp < request.executionTime) {
            revert RecoveryTimelockActive(dealId, request.executionTime);
        }
        
        // Only the recovery address or admin can execute
        if (msg.sender != request.recoveryAddress && !hasRole(ADMIN_ROLE, msg.sender)) {
            revert UnauthorizedRecovery(msg.sender, request.recoveryAddress);
        }
        
        Deal storage deal = deals[dealId];
        EscrowState currentState = EscrowState(dealStates[dealId]);
        
        // Validate deal is still recoverable
        if (currentState == EscrowState.Released || 
            currentState == EscrowState.Cancelled || 
            currentState == EscrowState.Expired) {
            revert OperationNotAllowed("recovery execution", currentState);
        }
        
        // Mark recovery as executed
        request.isExecuted = true;
        
        uint256 recoveryAmount = 0;
        address originalAddress = request.requester;
        
        // Determine recovery amount and execute transfer
        if (currentState == EscrowState.Funded || 
            currentState == EscrowState.InProgress || 
            currentState == EscrowState.Completed || 
            currentState == EscrowState.Disputed) {
            
            if (originalAddress == deal.payer) {
                // Recover payer's funds (refund scenario)
                recoveryAmount = deal.amount + deal.feeAmount;
            } else if (originalAddress == deal.payee) {
                // Recover payee's funds (release scenario)
                recoveryAmount = deal.amount;
                // Fees still go to fee recipient
                if (deal.feeAmount > 0) {
                    if (deal.token == address(0)) {
                        (bool success, ) = payable(feeRecipient).call{value: deal.feeAmount}("");
                        if (!success) revert TransferFailed(feeRecipient, deal.feeAmount);
                    } else {
                        IERC20 token = IERC20(deal.token);
                        token.safeTransfer(feeRecipient, deal.feeAmount);
                    }
                    emit FeesCollected(feeRecipient, deal.feeAmount, deal.token);
                }
            }
            
            // Transfer recovery amount to recovery address
            if (recoveryAmount > 0) {
                if (deal.token == address(0)) {
                    (bool success, ) = payable(request.recoveryAddress).call{value: recoveryAmount}("");
                    if (!success) revert TransferFailed(request.recoveryAddress, recoveryAmount);
                } else {
                    IERC20 token = IERC20(deal.token);
                    token.safeTransfer(request.recoveryAddress, recoveryAmount);
                }
            }
        }
        
        // Update deal state
        EscrowState oldState = currentState;
        EscrowState newState = (originalAddress == deal.payee) ? EscrowState.Released : EscrowState.Cancelled;
        dealStates[dealId] = uint8(newState);
        
        emit FundsRecovered(dealId, originalAddress, request.recoveryAddress, recoveryAmount, block.timestamp);
        emit StateChanged(dealId, oldState, newState, block.timestamp, msg.sender);
    }

    /**
     * @dev Cancels a recovery request (can be done by original requester or admin)
     * @param dealId Deal identifier
     * @param reason Reason for cancellation
     */
    function cancelRecovery(
        uint256 dealId,
        string calldata reason
    ) 
        external 
        dealExists(dealId)
        whenNotPaused
        trackGas(dealId, "cancelRecovery")
    {
        RecoveryRequest storage request = recoveryRequests[dealId];
        
        if (request.requester == address(0)) {
            revert RecoveryRequestNotFound(dealId);
        }
        
        if (request.isExecuted) {
            revert RecoveryAlreadyExecuted(dealId);
        }
        
        // Only requester or admin can cancel
        if (msg.sender != request.requester && !hasRole(ADMIN_ROLE, msg.sender)) {
            revert UnauthorizedRecovery(msg.sender, request.requester);
        }
        
        // Clear the recovery request
        delete recoveryRequests[dealId];
        
        emit RecoveryCancelled(dealId, msg.sender, reason);
    }

    /**
     * @dev Admin function to force initiate recovery request (bypasses user authorization)
     * @param dealId Deal identifier
     * @param userAddress User address (payer or payee) to recover for
     * @param customTimelock Custom timelock duration (0 for default)
     * @param reason Reason for admin-initiated recovery
     */
    function adminRequestRecovery(
        uint256 dealId,
        address userAddress,
        uint256 customTimelock,
        string calldata reason
    ) 
        external 
        onlyRole(ADMIN_ROLE)
        dealExists(dealId)
        whenNotPaused
        trackGas(dealId, "adminRequestRecovery")
    {
        Deal storage deal = deals[dealId];
        
        // Validate user is part of the deal
        if (userAddress != deal.payer && userAddress != deal.payee) {
            revert UnauthorizedRecovery(userAddress, deal.payer);
        }
        
        // Check if recovery address is set
        address recoveryAddr = recoveryAddresses[userAddress];
        if (recoveryAddr == address(0)) {
            revert RecoveryAddressNotSet(userAddress);
        }
        
        // Check if recovery request already exists
        if (recoveryRequests[dealId].requester != address(0)) {
            revert RecoveryRequestExists(dealId);
        }
        
        // Validate deal state
        EscrowState currentState = EscrowState(dealStates[dealId]);
        if (currentState == EscrowState.Released || 
            currentState == EscrowState.Cancelled || 
            currentState == EscrowState.Expired) {
            revert OperationNotAllowed("admin recovery", currentState);
        }
        
        // Use custom timelock or default
        uint256 timelock = customTimelock > 0 ? customTimelock : RECOVERY_TIMELOCK;
        if (timelock > MAX_RECOVERY_TIMELOCK) {
            revert InvalidAmount(timelock, MAX_RECOVERY_TIMELOCK);
        }
        
        uint64 executionTime = uint64(block.timestamp + timelock);
        
        recoveryRequests[dealId] = RecoveryRequest({
            requester: userAddress,
            recoveryAddress: recoveryAddr,
            requestedAt: uint64(block.timestamp),
            executionTime: executionTime,
            isExecuted: false,
            reason: string(abi.encodePacked("admin_initiated: ", reason))
        });
        
        emit RecoveryRequested(dealId, userAddress, recoveryAddr, executionTime, reason);
        emit TransactionTracked(dealId, string(abi.encodePacked("admin_request_recovery: ", reason)), msg.sender, block.timestamp, 0);
    }

    /**
     * @dev Admin function to force execute recovery with custom timelock (emergency)
     * @param dealId Deal identifier
     * @param recoveryAddress Address to recover funds to
     * @param reason Reason for emergency recovery
     */
    function emergencyRecovery(
        uint256 dealId,
        address recoveryAddress,
        string calldata reason
    ) 
        external 
        onlyRole(ADMIN_ROLE)
        dealExists(dealId)
        whenPaused
        nonReentrant
        trackGas(dealId, "emergencyRecovery")
    {
        if (recoveryAddress == address(0)) {
            revert InvalidAddress(recoveryAddress);
        }
        
        Deal storage deal = deals[dealId];
        EscrowState currentState = EscrowState(dealStates[dealId]);
        
        // Validate deal is recoverable
        if (currentState == EscrowState.Released || 
            currentState == EscrowState.Cancelled || 
            currentState == EscrowState.Expired) {
            revert OperationNotAllowed("emergency recovery", currentState);
        }
        
        uint256 recoveryAmount = deal.amount + deal.feeAmount;
        
        // Transfer all funds to recovery address
        if (deal.token == address(0)) {
            (bool success, ) = payable(recoveryAddress).call{value: recoveryAmount}("");
            if (!success) revert TransferFailed(recoveryAddress, recoveryAmount);
        } else {
            IERC20 token = IERC20(deal.token);
            token.safeTransfer(recoveryAddress, recoveryAmount);
        }
        
        // Update deal state
        EscrowState oldState = currentState;
        dealStates[dealId] = uint8(EscrowState.Cancelled);
        
        // Clear any existing recovery request
        if (recoveryRequests[dealId].requester != address(0)) {
            delete recoveryRequests[dealId];
        }
        
        emit FundsRecovered(dealId, deal.payer, recoveryAddress, recoveryAmount, block.timestamp);
        emit StateChanged(dealId, oldState, EscrowState.Cancelled, block.timestamp, msg.sender);
        emit TransactionTracked(dealId, string(abi.encodePacked("emergency_recovery: ", reason)), msg.sender, block.timestamp, 0);
    }

    // ============ Recovery View Functions ============

    /**
     * @dev Gets the recovery address for a user
     * @param user User address
     * @return Recovery address
     */
    function getRecoveryAddress(address user) external view returns (address) {
        return recoveryAddresses[user];
    }

    /**
     * @dev Gets recovery request details
     * @param dealId Deal identifier
     * @return Recovery request details
     */
    function getRecoveryRequest(uint256 dealId) external view returns (RecoveryRequest memory) {
        return recoveryRequests[dealId];
    }

    /**
     * @dev Checks if a recovery request can be executed
     * @param dealId Deal identifier
     * @return canExecute Whether recovery can be executed
     * @return timeRemaining Time remaining until execution (0 if ready)
     */
    function canExecuteRecovery(uint256 dealId) external view returns (bool canExecute, uint256 timeRemaining) {
        RecoveryRequest storage request = recoveryRequests[dealId];
        
        if (request.requester == address(0) || request.isExecuted) {
            return (false, 0);
        }
        
        if (block.timestamp >= request.executionTime) {
            return (true, 0);
        } else {
            return (false, request.executionTime - block.timestamp);
        }
    }

    /**
     * @dev Checks if a user has a recovery address set
     * @param user User address
     * @return hasRecovery Whether user has recovery address set
     */
    function hasRecoveryAddress(address user) external view returns (bool hasRecovery) {
        return recoveryAddresses[user] != address(0);
    }

    // ============ Emergency Functions ============

    /**
     * @dev Emergency function to recover stuck tokens (admin only)
     * @param token Token address to recover (address(0) for ETH)
     * @param to Address to send tokens to
     * @param amount Amount to recover
     */
    function emergencyRecover(
        address token,
        address to,
        uint256 amount
    ) external onlyRole(ADMIN_ROLE) whenPaused {
        if (to == address(0)) revert InvalidAddress(to);
        if (amount == 0) revert InvalidAmount(amount, 1);
        
        if (token == address(0)) {
            // Recover ETH
            if (address(this).balance < amount) {
                revert InsufficientBalance(address(this).balance, amount);
            }
            
            (bool success, ) = payable(to).call{value: amount}("");
            if (!success) revert TransferFailed(to, amount);
        } else {
            // Recover ERC20 tokens
            IERC20 tokenContract = IERC20(token);
            uint256 balance = tokenContract.balanceOf(address(this));
            
            if (balance < amount) {
                revert InsufficientBalance(balance, amount);
            }
            
            tokenContract.safeTransfer(to, amount);
        }
    }

    /**
     * @dev Emergency function to force release funds from a specific deal
     * @param dealId Deal identifier
     * @param reason Reason for emergency release
     */
    function emergencyRelease(
        uint256 dealId,
        string calldata reason
    ) external onlyRole(ADMIN_ROLE) whenPaused dealExists(dealId) nonReentrant {
        EscrowState currentState = EscrowState(dealStates[dealId]);
        
        if (currentState == EscrowState.Released || currentState == EscrowState.Cancelled) {
            revert OperationNotAllowed("emergency release", currentState);
        }
        
        // Force release to payee
        Deal storage deal = deals[dealId];
        uint256 payeeAmount = deal.amount;
        uint256 feeAmount = deal.feeAmount;
        
        EscrowState oldState = currentState;
        dealStates[dealId] = uint8(EscrowState.Released);

        if (deal.token == address(0)) {
            // Native ETH transfers
            if (payeeAmount > 0) {
                (bool success, ) = payable(deal.payee).call{value: payeeAmount}("");
                if (!success) revert TransferFailed(deal.payee, payeeAmount);
            }
            
            if (feeAmount > 0) {
                (bool success, ) = payable(feeRecipient).call{value: feeAmount}("");
                if (!success) revert TransferFailed(feeRecipient, feeAmount);
            }
        } else {
            // ERC20 token transfers
            IERC20 token = IERC20(deal.token);
            
            if (payeeAmount > 0) {
                token.safeTransfer(deal.payee, payeeAmount);
            }
            
            if (feeAmount > 0) {
                token.safeTransfer(feeRecipient, feeAmount);
            }
        }

        emit FundsReleased(dealId, deal.payee, payeeAmount, feeAmount, block.timestamp);
        emit StateChanged(dealId, oldState, EscrowState.Released, block.timestamp, msg.sender);
        
        // Emit emergency event with reason
        emit TransactionTracked(dealId, string(abi.encodePacked("emergency_release: ", reason)), msg.sender, block.timestamp, 0);
    }

    /**
     * @dev Emergency function to force refund funds from a specific deal
     * @param dealId Deal identifier
     * @param reason Reason for emergency refund
     */
    function emergencyRefund(
        uint256 dealId,
        string calldata reason
    ) external onlyRole(ADMIN_ROLE) whenPaused dealExists(dealId) nonReentrant {
        EscrowState currentState = EscrowState(dealStates[dealId]);
        
        if (currentState == EscrowState.Released || currentState == EscrowState.Cancelled) {
            revert OperationNotAllowed("emergency refund", currentState);
        }
        
        // Force refund to payer
        Deal storage deal = deals[dealId];
        uint256 refundAmount = deal.amount + deal.feeAmount;
        
        EscrowState oldState = currentState;
        dealStates[dealId] = uint8(EscrowState.Cancelled);

        if (deal.token == address(0)) {
            // Native ETH refund
            (bool success, ) = payable(deal.payer).call{value: refundAmount}("");
            if (!success) revert TransferFailed(deal.payer, refundAmount);
        } else {
            // ERC20 token refund
            IERC20 token = IERC20(deal.token);
            token.safeTransfer(deal.payer, refundAmount);
        }

        emit DealCancelled(dealId, msg.sender, string(abi.encodePacked("emergency_refund: ", reason)), refundAmount, block.timestamp);
        emit StateChanged(dealId, oldState, EscrowState.Cancelled, block.timestamp, msg.sender);
    }

    // ============ Receive Function ============

    /**
     * @dev Allows the contract to receive ETH
     */
    receive() external payable {
        // Contract can receive ETH for escrow deals
    }
} 