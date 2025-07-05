const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("DisputeArbitrator", function () {
  let DisputeArbitrator;
  let disputeArbitrator;
  let owner;
  let arbiter;
  let superArbiter;
  let escalationRole;
  let trustMonitor;
  let user1;
  let user2;
  let user3;

  const ARBITER_ROLE = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("ARBITER_ROLE"));
  const ADMIN_ROLE = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("ADMIN_ROLE"));
  const SUPER_ARBITER_ROLE = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("SUPER_ARBITER_ROLE"));
  const ESCALATION_ROLE = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("ESCALATION_ROLE"));
  const TRUST_MONITOR_ROLE = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("TRUST_MONITOR_ROLE"));

  beforeEach(async function () {
    [owner, arbiter, superArbiter, escalationRole, trustMonitor, user1, user2, user3] = await ethers.getSigners();

    DisputeArbitrator = await ethers.getContractFactory("DisputeArbitrator");
    disputeArbitrator = await DisputeArbitrator.deploy();
    await disputeArbitrator.deployed();

    // Grant roles
    await disputeArbitrator.grantRole(ARBITER_ROLE, arbiter.address);
    await disputeArbitrator.grantRole(SUPER_ARBITER_ROLE, superArbiter.address);
    await disputeArbitrator.grantRole(ESCALATION_ROLE, escalationRole.address);
    await disputeArbitrator.grantRole(TRUST_MONITOR_ROLE, trustMonitor.address);
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await disputeArbitrator.hasRole(await disputeArbitrator.DEFAULT_ADMIN_ROLE(), owner.address)).to.equal(true);
    });

    it("Should grant initial roles to owner", async function () {
      expect(await disputeArbitrator.hasRole(ADMIN_ROLE, owner.address)).to.equal(true);
      expect(await disputeArbitrator.hasRole(SUPER_ARBITER_ROLE, owner.address)).to.equal(true);
      expect(await disputeArbitrator.hasRole(ESCALATION_ROLE, owner.address)).to.equal(true);
      expect(await disputeArbitrator.hasRole(TRUST_MONITOR_ROLE, owner.address)).to.equal(true);
    });

    it("Should start with 0 disputes", async function () {
      expect(await disputeArbitrator.getTotalDisputes()).to.equal(0);
    });
  });

  describe("Dispute Filing", function () {
    it("Should allow users to file disputes", async function () {
      const dealId = 1;
      const reason = "Item not received";
      const severity = 4;
      const riskLevel = "high";

      await expect(disputeArbitrator.connect(user1).fileDispute(dealId, reason, severity, riskLevel))
        .to.emit(disputeArbitrator, "DisputeFiled")
        .withArgs(1, dealId, user1.address, reason, severity, riskLevel);

      const dispute = await disputeArbitrator.getDispute(1);
      expect(dispute.dealId).to.equal(dealId);
      expect(dispute.initiator).to.equal(user1.address);
      expect(dispute.reason).to.equal(reason);
      expect(dispute.severity).to.equal(severity);
      expect(dispute.status).to.equal(0); // active
      expect(dispute.requiresSuperArbiter).to.equal(true); // severity >= 4
    });

    it("Should reject disputes with invalid severity", async function () {
      await expect(
        disputeArbitrator.connect(user1).fileDispute(1, "Test", 6, "low")
      ).to.be.revertedWith("Invalid severity level");

      await expect(
        disputeArbitrator.connect(user1).fileDispute(1, "Test", 0, "low")
      ).to.be.revertedWith("Invalid severity level");
    });

    it("Should reject disputes with invalid risk level", async function () {
      await expect(
        disputeArbitrator.connect(user1).fileDispute(1, "Test", 3, "invalid")
      ).to.be.revertedWith("Invalid risk level");
    });

    it("Should reject disputes from blacklisted users", async function () {
      await disputeArbitrator.connect(trustMonitor).blacklistUser(user1.address, "Test blacklist");
      
      await expect(
        disputeArbitrator.connect(user1).fileDispute(1, "Test", 3, "low")
      ).to.be.revertedWith("User is blacklisted");
    });

    it("Should reject disputes with empty reason", async function () {
      await expect(
        disputeArbitrator.connect(user1).fileDispute(1, "", 3, "low")
      ).to.be.revertedWith("Reason cannot be empty");
    });

    it("Should update trust score when filing dispute", async function () {
      await disputeArbitrator.connect(user1).fileDispute(1, "Test", 3, "low");
      
      const trustScore = await disputeArbitrator.getTrustScore(user1.address);
      expect(trustScore.disputesFiled).to.equal(1);
      expect(trustScore.score).to.equal(500); // Initial neutral score
    });
  });

  describe("Voting", function () {
    let disputeId;

    beforeEach(async function () {
      await disputeArbitrator.connect(user1).fileDispute(1, "Test dispute", 3, "med");
      disputeId = 1;
    });

    it("Should allow arbiters to vote", async function () {
      const reasoning = "Clear evidence supports initiator";
      
      await expect(disputeArbitrator.connect(arbiter).vote(disputeId, true, reasoning))
        .to.emit(disputeArbitrator, "VoteCast")
        .withArgs(disputeId, arbiter.address, true, reasoning);

      const vote = await disputeArbitrator.getVote(disputeId, arbiter.address);
      expect(vote.arbiter).to.equal(arbiter.address);
      expect(vote.voteForInitiator).to.equal(true);
      expect(vote.reasoning).to.equal(reasoning);
    });

    it("Should reject votes from non-arbiters", async function () {
      await expect(
        disputeArbitrator.connect(user2).vote(disputeId, true, "Test")
      ).to.be.revertedWith("Must be arbiter");
    });

    it("Should reject votes on resolved disputes", async function () {
      // Resolve the dispute first
      await disputeArbitrator.connect(owner).resolveDispute(disputeId, "Admin resolution");
      
      await expect(
        disputeArbitrator.connect(arbiter).vote(disputeId, true, "Test")
      ).to.be.revertedWith("Dispute not active");
    });

    it("Should reject duplicate votes", async function () {
      await disputeArbitrator.connect(arbiter).vote(disputeId, true, "First vote");
      
      await expect(
        disputeArbitrator.connect(arbiter).vote(disputeId, false, "Second vote")
      ).to.be.revertedWith("Already voted");
    });

    it("Should reject votes with empty reasoning", async function () {
      await expect(
        disputeArbitrator.connect(arbiter).vote(disputeId, true, "")
      ).to.be.revertedWith("Reasoning cannot be empty");
    });

    it("Should track vote counts correctly", async function () {
      await disputeArbitrator.connect(arbiter).vote(disputeId, true, "For initiator");
      await disputeArbitrator.connect(superArbiter).vote(disputeId, false, "For respondent");
      
      const dispute = await disputeArbitrator.getDispute(disputeId);
      expect(dispute.votesForInitiator).to.equal(1);
      expect(dispute.votesForRespondent).to.equal(1);
      expect(dispute.totalVotes).to.equal(2);
    });
  });

  describe("Dispute Resolution", function () {
    let disputeId;

    beforeEach(async function () {
      await disputeArbitrator.connect(user1).fileDispute(1, "Test dispute", 3, "med");
      disputeId = 1;
    });

    it("Should resolve dispute when enough votes are cast", async function () {
      // Cast minimum votes for resolution
      await disputeArbitrator.connect(arbiter).vote(disputeId, true, "Vote 1");
      await disputeArbitrator.connect(superArbiter).vote(disputeId, true, "Vote 2");
      await disputeArbitrator.connect(owner).vote(disputeId, true, "Vote 3");

      const dispute = await disputeArbitrator.getDispute(disputeId);
      expect(dispute.status).to.equal(1); // resolved
      expect(dispute.resolution).to.equal(1); // initiator wins
    });

    it("Should allow manual resolution by arbiters", async function () {
      await expect(disputeArbitrator.connect(arbiter).resolveDispute(disputeId, "Manual resolution"))
        .to.emit(disputeArbitrator, "DisputeResolved")
        .withArgs(disputeId, 1, arbiter.address, "Manual resolution");

      const dispute = await disputeArbitrator.getDispute(disputeId);
      expect(dispute.status).to.equal(1); // resolved
    });

    it("Should reject manual resolution from non-arbiters", async function () {
      await expect(
        disputeArbitrator.connect(user2).resolveDispute(disputeId, "Test")
      ).to.be.revertedWith("Must be arbiter or super arbiter");
    });

    it("Should reject resolution of inactive disputes", async function () {
      // Resolve first
      await disputeArbitrator.connect(arbiter).resolveDispute(disputeId, "First resolution");
      
      await expect(
        disputeArbitrator.connect(arbiter).resolveDispute(disputeId, "Second resolution")
      ).to.be.revertedWith("Dispute not active");
    });

    it("Should update trust scores on resolution", async function () {
      await disputeArbitrator.connect(arbiter).vote(disputeId, true, "Vote 1");
      await disputeArbitrator.connect(superArbiter).vote(disputeId, true, "Vote 2");
      await disputeArbitrator.connect(owner).vote(disputeId, true, "Vote 3");

      const trustScore = await disputeArbitrator.getTrustScore(user1.address);
      expect(trustScore.disputesWon).to.equal(1);
      expect(trustScore.score).to.equal(525); // 500 + 25 for winning
    });
  });

  describe("Escalation", function () {
    let disputeId;

    beforeEach(async function () {
      await disputeArbitrator.connect(user1).fileDispute(1, "Test dispute", 3, "med");
      disputeId = 1;
    });

    it("Should allow escalation by authorized roles", async function () {
      await expect(disputeArbitrator.connect(escalationRole).escalateToSuperArbiter(disputeId, "Complex case"))
        .to.emit(disputeArbitrator, "EscalationRequested")
        .withArgs(disputeId, escalationRole.address, "Complex case");

      const dispute = await disputeArbitrator.getDispute(disputeId);
      expect(dispute.status).to.equal(2); // escalated
      expect(dispute.requiresSuperArbiter).to.equal(true);
      expect(dispute.escalationCount).to.equal(1);
    });

    it("Should reject escalation from unauthorized roles", async function () {
      await expect(
        disputeArbitrator.connect(user2).escalateToSuperArbiter(disputeId, "Test")
      ).to.be.revertedWith("Must have escalation role");
    });

    it("Should enforce escalation cooldown", async function () {
      await disputeArbitrator.connect(escalationRole).escalateToSuperArbiter(disputeId, "First escalation");
      
      await expect(
        disputeArbitrator.connect(escalationRole).escalateToSuperArbiter(disputeId, "Second escalation")
      ).to.be.revertedWith("Escalation cooldown not met");
    });

    it("Should limit escalation count", async function () {
      // First escalation
      await disputeArbitrator.connect(escalationRole).escalateToSuperArbiter(disputeId, "First");
      
      // Fast forward time
      await ethers.provider.send("evm_increaseTime", [24 * 60 * 60]); // 24 hours
      await ethers.provider.send("evm_mine");
      
      // Second escalation
      await disputeArbitrator.connect(escalationRole).escalateToSuperArbiter(disputeId, "Second");
      
      // Fast forward time again
      await ethers.provider.send("evm_increaseTime", [24 * 60 * 60]);
      await ethers.provider.send("evm_mine");
      
      // Third escalation should fail
      await expect(
        disputeArbitrator.connect(escalationRole).escalateToSuperArbiter(disputeId, "Third")
      ).to.be.revertedWith("Max escalations reached");
    });
  });

  describe("Dispute Revocation", function () {
    let disputeId;

    beforeEach(async function () {
      await disputeArbitrator.connect(user1).fileDispute(1, "Test dispute", 3, "med");
      disputeId = 1;
    });

    it("Should allow revocation by admin or super arbiter", async function () {
      await expect(disputeArbitrator.connect(owner).revokeDispute(disputeId, "Invalid dispute"))
        .to.emit(disputeArbitrator, "DisputeRevoked")
        .withArgs(disputeId, owner.address, "Invalid dispute");

      const dispute = await disputeArbitrator.getDispute(disputeId);
      expect(dispute.status).to.equal(3); // revoked
    });

    it("Should reject revocation from unauthorized roles", async function () {
      await expect(
        disputeArbitrator.connect(user2).revokeDispute(disputeId, "Test")
      ).to.be.revertedWith("Must be admin or super arbiter");
    });

    it("Should reject revocation of inactive disputes", async function () {
      // Resolve first
      await disputeArbitrator.connect(arbiter).resolveDispute(disputeId, "Resolution");
      
      await expect(
        disputeArbitrator.connect(owner).revokeDispute(disputeId, "Test")
      ).to.be.revertedWith("Dispute not active");
    });
  });

  describe("Fund Redirection", function () {
    let disputeId;

    beforeEach(async function () {
      await disputeArbitrator.connect(user1).fileDispute(1, "Test dispute", 3, "med");
      disputeId = 1;
    });

    it("Should allow fund redirection by admin or super arbiter", async function () {
      await expect(disputeArbitrator.connect(owner).forceFundRedirect(disputeId, user1.address, user2.address, ethers.utils.parseEther("1"), "Emergency redirect"))
        .to.emit(disputeArbitrator, "FundRedirected")
        .withArgs(disputeId, user1.address, user2.address, ethers.utils.parseEther("1"), "Emergency redirect");
    });

    it("Should reject fund redirection from unauthorized roles", async function () {
      await expect(
        disputeArbitrator.connect(user2).forceFundRedirect(disputeId, user1.address, user2.address, ethers.utils.parseEther("1"), "Test")
      ).to.be.revertedWith("Must be admin or super arbiter");
    });

    it("Should reject fund redirection with invalid addresses", async function () {
      await expect(
        disputeArbitrator.connect(owner).forceFundRedirect(disputeId, ethers.constants.AddressZero, user2.address, ethers.utils.parseEther("1"), "Test")
      ).to.be.revertedWith("Invalid addresses");
    });

    it("Should reject fund redirection with zero amount", async function () {
      await expect(
        disputeArbitrator.connect(owner).forceFundRedirect(disputeId, user1.address, user2.address, 0, "Test")
      ).to.be.revertedWith("Amount must be positive");
    });
  });

  describe("User Blacklisting", function () {
    it("Should allow trust monitor to blacklist users", async function () {
      await expect(disputeArbitrator.connect(trustMonitor).blacklistUser(user1.address, "Fraudulent activity"))
        .to.emit(disputeArbitrator, "UserBlacklisted")
        .withArgs(user1.address, trustMonitor.address, "Fraudulent activity");

      expect(await disputeArbitrator.isBlacklisted(user1.address)).to.equal(true);
      
      const trustScore = await disputeArbitrator.getTrustScore(user1.address);
      expect(trustScore.isBlacklisted).to.equal(true);
      expect(trustScore.score).to.equal(0);
    });

    it("Should reject blacklisting from unauthorized roles", async function () {
      await expect(
        disputeArbitrator.connect(user2).blacklistUser(user1.address, "Test")
      ).to.be.revertedWith("Must be trust monitor");
    });

    it("Should reject blacklisting with invalid address", async function () {
      await expect(
        disputeArbitrator.connect(trustMonitor).blacklistUser(ethers.constants.AddressZero, "Test")
      ).to.be.revertedWith("Invalid user address");
    });

    it("Should allow trust monitor to unblacklist users", async function () {
      await disputeArbitrator.connect(trustMonitor).blacklistUser(user1.address, "Test");
      
      await expect(disputeArbitrator.connect(trustMonitor).unblacklistUser(user1.address, "Rehabilitation"))
        .to.emit(disputeArbitrator, "UserUnblacklisted")
        .withArgs(user1.address, trustMonitor.address, "Rehabilitation");

      expect(await disputeArbitrator.isBlacklisted(user1.address)).to.equal(false);
      
      const trustScore = await disputeArbitrator.getTrustScore(user1.address);
      expect(trustScore.isBlacklisted).to.equal(false);
      expect(trustScore.score).to.equal(500); // Reset to neutral
    });
  });

  describe("Arbiter Reassignment", function () {
    let disputeId;

    beforeEach(async function () {
      await disputeArbitrator.connect(user1).fileDispute(1, "Test dispute", 3, "med");
      disputeId = 1;
    });

    it("Should allow admin to reassign arbiters", async function () {
      await disputeArbitrator.connect(owner).reassignArbiter(disputeId, user2.address);
      
      const dispute = await disputeArbitrator.getDispute(disputeId);
      expect(dispute.lastModifiedBy).to.equal(owner.address);
    });

    it("Should reject reassignment from non-admin", async function () {
      await expect(
        disputeArbitrator.connect(user2).reassignArbiter(disputeId, user3.address)
      ).to.be.revertedWith("Must be admin");
    });

    it("Should reject reassignment to non-arbiter", async function () {
      await expect(
        disputeArbitrator.connect(owner).reassignArbiter(disputeId, user2.address)
      ).to.be.revertedWith("New arbiter must have ARBITER_ROLE");
    });
  });

  describe("Pause/Unpause", function () {
    it("Should allow admin to pause and unpause", async function () {
      await disputeArbitrator.connect(owner).pause();
      expect(await disputeArbitrator.paused()).to.equal(true);

      await disputeArbitrator.connect(owner).unpause();
      expect(await disputeArbitrator.paused()).to.equal(false);
    });

    it("Should reject pause from non-admin", async function () {
      await expect(
        disputeArbitrator.connect(user1).pause()
      ).to.be.revertedWith("Must be admin");
    });

    it("Should prevent dispute filing when paused", async function () {
      await disputeArbitrator.connect(owner).pause();
      
      await expect(
        disputeArbitrator.connect(user1).fileDispute(1, "Test", 3, "low")
      ).to.be.revertedWith("Pausable: paused");
    });
  });

  describe("Gas Optimization", function () {
    it("Should optimize gas usage for dispute filing", async function () {
      const tx = await disputeArbitrator.connect(user1).fileDispute(1, "Test dispute", 3, "med");
      const receipt = await tx.wait();
      
      // Gas usage should be reasonable (less than 200k gas)
      expect(receipt.gasUsed).to.be.lessThan(200000);
    });

    it("Should optimize gas usage for voting", async function () {
      await disputeArbitrator.connect(user1).fileDispute(1, "Test dispute", 3, "med");
      
      const tx = await disputeArbitrator.connect(arbiter).vote(1, true, "Test vote");
      const receipt = await tx.wait();
      
      // Gas usage should be reasonable (less than 100k gas)
      expect(receipt.gasUsed).to.be.lessThan(100000);
    });
  });

  describe("Edge Cases", function () {
    it("Should handle tie votes correctly", async function () {
      await disputeArbitrator.connect(user1).fileDispute(1, "Test dispute", 3, "med");
      
      await disputeArbitrator.connect(arbiter).vote(1, true, "For initiator");
      await disputeArbitrator.connect(superArbiter).vote(1, false, "For respondent");
      await disputeArbitrator.connect(owner).vote(1, true, "For initiator");
      await disputeArbitrator.connect(escalationRole).vote(1, false, "For respondent");

      const dispute = await disputeArbitrator.getDispute(1);
      expect(dispute.resolution).to.equal(3); // split (tie)
    });

    it("Should handle multiple disputes correctly", async function () {
      await disputeArbitrator.connect(user1).fileDispute(1, "Dispute 1", 3, "med");
      await disputeArbitrator.connect(user2).fileDispute(2, "Dispute 2", 4, "high");
      await disputeArbitrator.connect(user3).fileDispute(3, "Dispute 3", 2, "low");

      expect(await disputeArbitrator.getTotalDisputes()).to.equal(3);
      
      const dispute1 = await disputeArbitrator.getDispute(1);
      const dispute2 = await disputeArbitrator.getDispute(2);
      const dispute3 = await disputeArbitrator.getDispute(3);
      
      expect(dispute1.initiator).to.equal(user1.address);
      expect(dispute2.initiator).to.equal(user2.address);
      expect(dispute3.initiator).to.equal(user3.address);
    });
  });
}); 