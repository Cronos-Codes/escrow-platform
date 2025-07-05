// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title DisputeArbitrator
 * @dev Smart contract for managing dispute resolution and arbitration in the escrow platform
 * @author Escrow Platform Team
 * @notice This contract handles dispute filing, voting, resolution, and escalation with role-based access control
 */
contract DisputeArbitrator is AccessControl, Pausable, ReentrancyGuard {
    using Counters for Counters.Counter;

    // ============ Roles ============
    bytes32 public constant ARBITER_ROLE = keccak256("ARBITER_ROLE");
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant SUPER_ARBITER_ROLE = keccak256("SUPER_ARBITER_ROLE");
    bytes32 public constant ESCALATION_ROLE = keccak256("ESCALATION_ROLE");
    bytes32 public constant TRUST_MONITOR_ROLE = keccak256("TRUST_MONITOR_ROLE");

    // ============ Structs ============
    struct Dispute {
        uint256 disputeId;
        uint256 dealId;
        address initiator;
        string reason;
        uint8 severity; // 1-5 scale
        uint256 votesForInitiator;
        uint256 votesForRespondent;
        uint256 totalVotes;
        uint8 resolution; // 0=pending, 1=initiator wins, 2=respondent wins, 3=split
        uint8 status; // 0=active, 1=resolved, 2=escalated, 3=revoked
        uint256 timeCreated;
        uint256 timeResolved;
        string auditTrail;
        string riskLevel; // "low", "med", "high"
        address lastModifiedBy;
        uint256 escalationCount;
        uint256 lastEscalationTime;
        bool requiresSuperArbiter;
    }

    struct Vote {
        address arbiter;
        bool voteForInitiator;
        uint256 timestamp;
        string reasoning;
    }

    struct TrustScore {
        uint256 score; // 0-1000 scale
        uint256 disputesFiled;
        uint256 disputesWon;
        uint256 disputesLost;
        uint256 lastUpdated;
        bool isBlacklisted;
    }

    // ============ State Variables ============
    Counters.Counter private _disputeIds;
    
    mapping(uint256 => Dispute) public disputes;
    mapping(uint256 => mapping(address => Vote)) public votes;
    mapping(address => TrustScore) public trustScores;
    mapping(address => bool) public blacklistedUsers;
    
    uint256 public constant MIN_VOTES_FOR_RESOLUTION = 3;
    uint256 public constant ESCALATION_COOLDOWN = 24 hours;
    uint256 public constant MAX_ESCALATIONS_PER_DISPUTE = 2;
    uint256 public constant TRUST_SCORE_DECREASE_ON_LOSS = 50;
    uint256 public constant TRUST_SCORE_INCREASE_ON_WIN = 25;
    
    // ============ Events ============
    event DisputeFiled(
        uint256 indexed disputeId,
        uint256 indexed dealId,
        address indexed initiator,
        string reason,
        uint8 severity,
        string riskLevel
    );
    
    event VoteCast(
        uint256 indexed disputeId,
        address indexed arbiter,
        bool voteForInitiator,
        string reasoning
    );
    
    event DisputeResolved(
        uint256 indexed disputeId,
        uint8 resolution,
        address resolvedBy,
        string reasoning
    );
    
    event EscalationRequested(
        uint256 indexed disputeId,
        address indexed requester,
        string reason
    );
    
    event FundRedirected(
        uint256 indexed disputeId,
        address indexed from,
        address indexed to,
        uint256 amount,
        string reason
    );
    
    event TrustScoreChanged(
        address indexed user,
        uint256 oldScore,
        uint256 newScore,
        string reason
    );
    
    event UserBlacklisted(
        address indexed user,
        address indexed blacklistedBy,
        string reason
    );
    
    event UserUnblacklisted(
        address indexed user,
        address indexed unblacklistedBy,
        string reason
    );
    
    event DisputeRevoked(
        uint256 indexed disputeId,
        address indexed revokedBy,
        string reason
    );

    // ============ Constructor ============
    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        _grantRole(SUPER_ARBITER_ROLE, msg.sender);
        _grantRole(ESCALATION_ROLE, msg.sender);
        _grantRole(TRUST_MONITOR_ROLE, msg.sender);
    }

    // ============ Core Functions ============

    /**
     * @dev Files a new dispute
     * @param dealId The ID of the deal being disputed
     * @param reason The reason for the dispute
     * @param severity The severity level (1-5)
     * @param riskLevel The risk level ("low", "med", "high")
     */
    function fileDispute(
        uint256 dealId,
        string calldata reason,
        uint8 severity,
        string calldata riskLevel
    ) external whenNotPaused nonReentrant {
        require(severity >= 1 && severity <= 5, "Invalid severity level");
        require(
            keccak256(bytes(riskLevel)) == keccak256(bytes("low")) ||
            keccak256(bytes(riskLevel)) == keccak256(bytes("med")) ||
            keccak256(bytes(riskLevel)) == keccak256(bytes("high")),
            "Invalid risk level"
        );
        require(!blacklistedUsers[msg.sender], "User is blacklisted");
        require(bytes(reason).length > 0, "Reason cannot be empty");

        _disputeIds.increment();
        uint256 disputeId = _disputeIds.current();

        disputes[disputeId] = Dispute({
            disputeId: disputeId,
            dealId: dealId,
            initiator: msg.sender,
            reason: reason,
            severity: severity,
            votesForInitiator: 0,
            votesForRespondent: 0,
            totalVotes: 0,
            resolution: 0,
            status: 0,
            timeCreated: block.timestamp,
            timeResolved: 0,
            auditTrail: "",
            riskLevel: riskLevel,
            lastModifiedBy: msg.sender,
            escalationCount: 0,
            lastEscalationTime: 0,
            requiresSuperArbiter: severity >= 4
        });

        // Update trust score
        _updateTrustScore(msg.sender, 0, "dispute_filed");

        emit DisputeFiled(disputeId, dealId, msg.sender, reason, severity, riskLevel);
    }

    /**
     * @dev Casts a vote on a dispute (only arbiters)
     * @param disputeId The ID of the dispute
     * @param voteForInitiator True if voting for initiator, false for respondent
     * @param reasoning The reasoning for the vote
     */
    function vote(
        uint256 disputeId,
        bool voteForInitiator,
        string calldata reasoning
    ) external whenNotPaused nonReentrant {
        require(hasRole(ARBITER_ROLE, msg.sender), "Must be arbiter");
        require(disputes[disputeId].status == 0, "Dispute not active");
        require(votes[disputeId][msg.sender].timestamp == 0, "Already voted");
        require(bytes(reasoning).length > 0, "Reasoning cannot be empty");

        Dispute storage dispute = disputes[disputeId];
        
        if (voteForInitiator) {
            dispute.votesForInitiator++;
        } else {
            dispute.votesForRespondent++;
        }
        dispute.totalVotes++;

        votes[disputeId][msg.sender] = Vote({
            arbiter: msg.sender,
            voteForInitiator: voteForInitiator,
            timestamp: block.timestamp,
            reasoning: reasoning
        });

        dispute.lastModifiedBy = msg.sender;

        emit VoteCast(disputeId, msg.sender, voteForInitiator, reasoning);

        // Check if enough votes for resolution
        if (dispute.totalVotes >= MIN_VOTES_FOR_RESOLUTION) {
            _resolveDispute(disputeId);
        }
    }

    /**
     * @dev Resolves a dispute based on votes
     * @param disputeId The ID of the dispute
     * @param reasoning The reasoning for the resolution
     */
    function resolveDispute(
        uint256 disputeId,
        string calldata reasoning
    ) external whenNotPaused nonReentrant {
        require(
            hasRole(ARBITER_ROLE, msg.sender) || hasRole(SUPER_ARBITER_ROLE, msg.sender),
            "Must be arbiter or super arbiter"
        );
        require(disputes[disputeId].status == 0, "Dispute not active");
        require(bytes(reasoning).length > 0, "Reasoning cannot be empty");

        _resolveDispute(disputeId);
        
        Dispute storage dispute = disputes[disputeId];
        dispute.auditTrail = string(abi.encodePacked(
            dispute.auditTrail,
            " | Resolved by: ",
            _addressToString(msg.sender),
            " | Reason: ",
            reasoning
        ));
    }

    /**
     * @dev Escalates a dispute to super arbiter
     * @param disputeId The ID of the dispute
     * @param reason The reason for escalation
     */
    function escalateToSuperArbiter(
        uint256 disputeId,
        string calldata reason
    ) external whenNotPaused nonReentrant {
        require(
            hasRole(ESCALATION_ROLE, msg.sender) || hasRole(SUPER_ARBITER_ROLE, msg.sender),
            "Must have escalation role"
        );
        require(disputes[disputeId].status == 0, "Dispute not active");
        require(
            block.timestamp >= disputes[disputeId].lastEscalationTime + ESCALATION_COOLDOWN,
            "Escalation cooldown not met"
        );
        require(
            disputes[disputeId].escalationCount < MAX_ESCALATIONS_PER_DISPUTE,
            "Max escalations reached"
        );

        Dispute storage dispute = disputes[disputeId];
        dispute.status = 2; // escalated
        dispute.escalationCount++;
        dispute.lastEscalationTime = block.timestamp;
        dispute.requiresSuperArbiter = true;
        dispute.lastModifiedBy = msg.sender;
        dispute.auditTrail = string(abi.encodePacked(
            dispute.auditTrail,
            " | Escalated by: ",
            _addressToString(msg.sender),
            " | Reason: ",
            reason
        ));

        emit EscalationRequested(disputeId, msg.sender, reason);
    }

    /**
     * @dev Revokes a dispute (only admin or super arbiter)
     * @param disputeId The ID of the dispute
     * @param reason The reason for revocation
     */
    function revokeDispute(
        uint256 disputeId,
        string calldata reason
    ) external whenNotPaused nonReentrant {
        require(
            hasRole(ADMIN_ROLE, msg.sender) || hasRole(SUPER_ARBITER_ROLE, msg.sender),
            "Must be admin or super arbiter"
        );
        require(disputes[disputeId].status == 0, "Dispute not active");
        require(bytes(reason).length > 0, "Reason cannot be empty");

        Dispute storage dispute = disputes[disputeId];
        dispute.status = 3; // revoked
        dispute.lastModifiedBy = msg.sender;
        dispute.auditTrail = string(abi.encodePacked(
            dispute.auditTrail,
            " | Revoked by: ",
            _addressToString(msg.sender),
            " | Reason: ",
            reason
        ));

        emit DisputeRevoked(disputeId, msg.sender, reason);
    }

    /**
     * @dev Forces fund redirection (only admin or super arbiter)
     * @param disputeId The ID of the dispute
     * @param from The address to redirect from
     * @param to The address to redirect to
     * @param amount The amount to redirect
     * @param reason The reason for redirection
     */
    function forceFundRedirect(
        uint256 disputeId,
        address from,
        address to,
        uint256 amount,
        string calldata reason
    ) external whenNotPaused nonReentrant {
        require(
            hasRole(ADMIN_ROLE, msg.sender) || hasRole(SUPER_ARBITER_ROLE, msg.sender),
            "Must be admin or super arbiter"
        );
        require(from != address(0) && to != address(0), "Invalid addresses");
        require(amount > 0, "Amount must be positive");
        require(bytes(reason).length > 0, "Reason cannot be empty");

        // This would integrate with the escrow contract
        // For now, we just emit the event
        emit FundRedirected(disputeId, from, to, amount, reason);
    }

    /**
     * @dev Reassigns an arbiter to a dispute (admin only)
     * @param disputeId The ID of the dispute
     * @param newArbiter The new arbiter address
     */
    function reassignArbiter(
        uint256 disputeId,
        address newArbiter
    ) external whenNotPaused nonReentrant {
        require(hasRole(ADMIN_ROLE, msg.sender), "Must be admin");
        require(hasRole(ARBITER_ROLE, newArbiter), "New arbiter must have ARBITER_ROLE");
        require(disputes[disputeId].status == 0, "Dispute not active");

        Dispute storage dispute = disputes[disputeId];
        dispute.lastModifiedBy = msg.sender;
        dispute.auditTrail = string(abi.encodePacked(
            dispute.auditTrail,
            " | Arbiter reassigned by: ",
            _addressToString(msg.sender),
            " | New arbiter: ",
            _addressToString(newArbiter)
        ));
    }

    /**
     * @dev Blacklists a user (trust monitor only)
     * @param user The user to blacklist
     * @param reason The reason for blacklisting
     */
    function blacklistUser(
        address user,
        string calldata reason
    ) external whenNotPaused nonReentrant {
        require(hasRole(TRUST_MONITOR_ROLE, msg.sender), "Must be trust monitor");
        require(user != address(0), "Invalid user address");
        require(bytes(reason).length > 0, "Reason cannot be empty");

        blacklistedUsers[user] = true;
        trustScores[user].isBlacklisted = true;
        trustScores[user].score = 0;

        emit UserBlacklisted(user, msg.sender, reason);
    }

    /**
     * @dev Unblacklists a user (trust monitor only)
     * @param user The user to unblacklist
     * @param reason The reason for unblacklisting
     */
    function unblacklistUser(
        address user,
        string calldata reason
    ) external whenNotPaused nonReentrant {
        require(hasRole(TRUST_MONITOR_ROLE, msg.sender), "Must be trust monitor");
        require(user != address(0), "Invalid user address");
        require(bytes(reason).length > 0, "Reason cannot be empty");

        blacklistedUsers[user] = false;
        trustScores[user].isBlacklisted = false;
        trustScores[user].score = 500; // Reset to neutral score

        emit UserUnblacklisted(user, msg.sender, reason);
    }

    // ============ View Functions ============

    /**
     * @dev Gets dispute details
     * @param disputeId The ID of the dispute
     * @return The dispute struct
     */
    function getDispute(uint256 disputeId) external view returns (Dispute memory) {
        return disputes[disputeId];
    }

    /**
     * @dev Gets vote details for an arbiter
     * @param disputeId The ID of the dispute
     * @param arbiter The arbiter address
     * @return The vote struct
     */
    function getVote(uint256 disputeId, address arbiter) external view returns (Vote memory) {
        return votes[disputeId][arbiter];
    }

    /**
     * @dev Gets trust score for a user
     * @param user The user address
     * @return The trust score struct
     */
    function getTrustScore(address user) external view returns (TrustScore memory) {
        return trustScores[user];
    }

    /**
     * @dev Checks if user is blacklisted
     * @param user The user address
     * @return True if blacklisted
     */
    function isBlacklisted(address user) external view returns (bool) {
        return blacklistedUsers[user];
    }

    /**
     * @dev Gets total dispute count
     * @return The total number of disputes
     */
    function getTotalDisputes() external view returns (uint256) {
        return _disputeIds.current();
    }

    // ============ Admin Functions ============

    /**
     * @dev Pauses the contract (admin only)
     */
    function pause() external onlyRole(ADMIN_ROLE) {
        _pause();
    }

    /**
     * @dev Unpauses the contract (admin only)
     */
    function unpause() external onlyRole(ADMIN_ROLE) {
        _unpause();
    }

    // ============ Internal Functions ============

    /**
     * @dev Internal function to resolve a dispute
     * @param disputeId The ID of the dispute
     */
    function _resolveDispute(uint256 disputeId) internal {
        Dispute storage dispute = disputes[disputeId];
        
        if (dispute.votesForInitiator > dispute.votesForRespondent) {
            dispute.resolution = 1; // initiator wins
            _updateTrustScore(dispute.initiator, TRUST_SCORE_INCREASE_ON_WIN, "dispute_won");
        } else if (dispute.votesForRespondent > dispute.votesForInitiator) {
            dispute.resolution = 2; // respondent wins
            _updateTrustScore(dispute.initiator, TRUST_SCORE_DECREASE_ON_LOSS, "dispute_lost");
        } else {
            dispute.resolution = 3; // split
        }
        
        dispute.status = 1; // resolved
        dispute.timeResolved = block.timestamp;
        dispute.lastModifiedBy = msg.sender;

        emit DisputeResolved(disputeId, dispute.resolution, msg.sender, "Vote-based resolution");
    }

    /**
     * @dev Updates trust score for a user
     * @param user The user address
     * @param scoreChange The change in score
     * @param reason The reason for the change
     */
    function _updateTrustScore(
        address user,
        uint256 scoreChange,
        string memory reason
    ) internal {
        TrustScore storage score = trustScores[user];
        uint256 oldScore = score.score;
        
        if (score.score == 0) {
            score.score = 500; // Initialize to neutral
        }
        
        if (keccak256(bytes(reason)) == keccak256(bytes("dispute_filed"))) {
            score.disputesFiled++;
        } else if (keccak256(bytes(reason)) == keccak256(bytes("dispute_won"))) {
            score.disputesWon++;
            score.score = score.score + scoreChange > 1000 ? 1000 : score.score + scoreChange;
        } else if (keccak256(bytes(reason)) == keccak256(bytes("dispute_lost"))) {
            score.disputesLost++;
            score.score = score.score < scoreChange ? 0 : score.score - scoreChange;
        }
        
        score.lastUpdated = block.timestamp;
        
        emit TrustScoreChanged(user, oldScore, score.score, reason);
    }

    /**
     * @dev Converts address to string
     * @param addr The address to convert
     * @return The string representation
     */
    function _addressToString(address addr) internal pure returns (string memory) {
        return string(abi.encodePacked(addr));
    }

    // ============ Override Functions ============

    /**
     * @dev Required override for AccessControl
     */
    function supportsInterface(bytes4 interfaceId) public view override(AccessControl) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
} 