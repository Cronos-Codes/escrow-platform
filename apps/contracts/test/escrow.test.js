const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Escrow", function () {
  let Escrow;
  let escrow;
  let owner;
  let payer;
  let payee;
  let arbiter;
  let creator;
  let addr1;
  let addr2;
  let addrs;

  // Test token for ERC20 testing
  let TestToken;
  let testToken;

  beforeEach(async function () {
    // Get signers
    [owner, payer, payee, arbiter, creator, addr1, addr2, ...addrs] = await ethers.getSigners();

    // Deploy test token
    TestToken = await ethers.getContractFactory("MockERC20");
    testToken = await TestToken.deploy("Test Token", "TEST");

    // Deploy Escrow contract
    Escrow = await ethers.getContractFactory("Escrow");
    escrow = await Escrow.deploy(owner.address);

    // Setup roles
    await escrow.grantRole(await escrow.CREATOR_ROLE(), creator.address);
    await escrow.grantRole(await escrow.ARBITER_ROLE(), arbiter.address);
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await escrow.hasRole(await escrow.DEFAULT_ADMIN_ROLE(), owner.address)).to.equal(true);
      expect(await escrow.hasRole(await escrow.ADMIN_ROLE(), owner.address)).to.equal(true);
      expect(await escrow.hasRole(await escrow.CREATOR_ROLE(), owner.address)).to.equal(true);
      expect(await escrow.hasRole(await escrow.ARBITER_ROLE(), owner.address)).to.equal(true);
    });

    it("Should start with zero deals", async function () {
      expect(await escrow.getDealCount()).to.equal(0);
    });
  });

  describe("Role Management", function () {
    it("Should allow admin to grant roles", async function () {
      await escrow.grantRole(await escrow.CREATOR_ROLE(), addr1.address);
      expect(await escrow.hasRole(await escrow.CREATOR_ROLE(), addr1.address)).to.equal(true);
    });

    it("Should allow admin to revoke roles", async function () {
      await escrow.grantRole(await escrow.CREATOR_ROLE(), addr1.address);
      await escrow.revokeRole(await escrow.CREATOR_ROLE(), addr1.address);
      expect(await escrow.hasRole(await escrow.CREATOR_ROLE(), addr1.address)).to.equal(false);
    });

    it("Should not allow non-admin to grant roles", async function () {
      await expect(
        escrow.connect(addr1).grantRole(await escrow.CREATOR_ROLE(), addr2.address)
      ).to.be.revertedWith("AccessControl");
    });
  });

  describe("Deal Creation", function () {
    const amount = ethers.parseEther("1.0");
    const metadata = "ipfs://QmTestMetadata";

    it("Should create a deal with ETH", async function () {
      await expect(
        escrow.connect(creator).createDeal(payer.address, payee.address, ethers.ZeroAddress, amount, metadata)
      )
        .to.emit(escrow, "DealCreated")
        .withArgs(0, payer.address, payee.address, ethers.ZeroAddress, amount, metadata);

      expect(await escrow.getDealCount()).to.equal(1);
      expect(await escrow.getDealState(0)).to.equal(0); // Created state
      
      const deal = await escrow.getDeal(0);
      expect(deal.payer).to.equal(payer.address);
      expect(deal.payee).to.equal(payee.address);
      expect(deal.token).to.equal(ethers.ZeroAddress);
      expect(deal.amount).to.equal(amount);
      expect(deal.metadata).to.equal(metadata);
    });

    it("Should create a deal with ERC20 token", async function () {
      await expect(
        escrow.connect(creator).createDeal(payer.address, payee.address, testToken.address, amount, metadata)
      )
        .to.emit(escrow, "DealCreated")
        .withArgs(0, payer.address, payee.address, testToken.address, amount, metadata);

      const deal = await escrow.getDeal(0);
      expect(deal.token).to.equal(testToken.address);
    });

    it("Should not allow non-creator to create deals", async function () {
      await expect(
        escrow.connect(addr1).createDeal(payer.address, payee.address, ethers.ZeroAddress, amount, metadata)
      ).to.be.revertedWith("AccessControl");
    });

    it("Should not create deal with zero payer", async function () {
      await expect(
        escrow.connect(creator).createDeal(ethers.ZeroAddress, payee.address, ethers.ZeroAddress, amount, metadata)
      ).to.be.revertedWith("Payer cannot be zero address");
    });

    it("Should not create deal with zero payee", async function () {
      await expect(
        escrow.connect(creator).createDeal(payer.address, ethers.ZeroAddress, ethers.ZeroAddress, amount, metadata)
      ).to.be.revertedWith("Payee cannot be zero address");
    });

    it("Should not create deal with zero amount", async function () {
      await expect(
        escrow.connect(creator).createDeal(payer.address, payee.address, ethers.ZeroAddress, 0, metadata)
      ).to.be.revertedWith("Amount must be greater than zero");
    });

    it("Should not create deal with same payer and payee", async function () {
      await expect(
        escrow.connect(creator).createDeal(payer.address, payer.address, ethers.ZeroAddress, amount, metadata)
      ).to.be.revertedWith("Payer and payee cannot be the same");
    });
  });

  describe("Deal Funding", function () {
    const amount = ethers.parseEther("1.0");
    const metadata = "ipfs://QmTestMetadata";

    beforeEach(async function () {
      await escrow.connect(creator).createDeal(payer.address, payee.address, ethers.ZeroAddress, amount, metadata);
    });

    it("Should fund deal with ETH", async function () {
      await expect(
        escrow.connect(payer).fundDeal(0, { value: amount })
      )
        .to.emit(escrow, "DealFunded")
        .withArgs(0, payer.address, amount);

      expect(await escrow.getDealState(0)).to.equal(1); // Funded state
    });

    it("Should fund deal with ERC20 token", async function () {
      // Create deal with token
      await escrow.connect(creator).createDeal(payer.address, payee.address, testToken.address, amount, metadata);
      
      // Mint tokens to payer
      await testToken.mint(payer.address, amount);
      await testToken.connect(payer).approve(escrow.address, amount);

      await expect(
        escrow.connect(payer).fundDeal(1)
      )
        .to.emit(escrow, "DealFunded")
        .withArgs(1, payer.address, amount);

      expect(await escrow.getDealState(1)).to.equal(1); // Funded state
    });

    it("Should not fund deal with incorrect ETH amount", async function () {
      await expect(
        escrow.connect(payer).fundDeal(0, { value: amount + ethers.parseEther("0.1") })
      ).to.be.revertedWith("Incorrect ETH amount");
    });

    it("Should not fund deal with ETH for token deals", async function () {
      await escrow.connect(creator).createDeal(payer.address, payee.address, testToken.address, amount, metadata);
      
      await expect(
        escrow.connect(payer).fundDeal(1, { value: amount })
      ).to.be.revertedWith("ETH not accepted for token deals");
    });

    it("Should not fund non-existent deal", async function () {
      await expect(
        escrow.connect(payer).fundDeal(999, { value: amount })
      ).to.be.revertedWith("Deal does not exist");
    });

    it("Should not fund deal that is not in Created state", async function () {
      await escrow.connect(payer).fundDeal(0, { value: amount });
      
      await expect(
        escrow.connect(addr1).fundDeal(0, { value: amount })
      ).to.be.revertedWith("Deal is not in expected state");
    });
  });

  describe("Deal Approval", function () {
    const amount = ethers.parseEther("1.0");
    const metadata = "ipfs://QmTestMetadata";

    beforeEach(async function () {
      await escrow.connect(creator).createDeal(payer.address, payee.address, ethers.ZeroAddress, amount, metadata);
      await escrow.connect(payer).fundDeal(0, { value: amount });
    });

    it("Should approve deal", async function () {
      await expect(
        escrow.connect(arbiter).approveMilestone(0)
      )
        .to.emit(escrow, "DealApproved")
        .withArgs(0, arbiter.address);

      expect(await escrow.getDealState(0)).to.equal(2); // Approved state
    });

    it("Should not allow non-arbiter to approve", async function () {
      await expect(
        escrow.connect(addr1).approveMilestone(0)
      ).to.be.revertedWith("AccessControl");
    });

    it("Should not approve deal that is not funded", async function () {
      await escrow.connect(creator).createDeal(addr1.address, addr2.address, ethers.ZeroAddress, amount, metadata);
      
      await expect(
        escrow.connect(arbiter).approveMilestone(1)
      ).to.be.revertedWith("Deal is not in expected state");
    });
  });

  describe("Fund Release", function () {
    const amount = ethers.parseEther("1.0");
    const metadata = "ipfs://QmTestMetadata";

    beforeEach(async function () {
      await escrow.connect(creator).createDeal(payer.address, payee.address, ethers.ZeroAddress, amount, metadata);
      await escrow.connect(payer).fundDeal(0, { value: amount });
      await escrow.connect(arbiter).approveMilestone(0);
    });

    it("Should release funds to payee", async function () {
      const payeeBalanceBefore = await ethers.provider.getBalance(payee.address);
      
      await expect(
        escrow.connect(arbiter).releaseFunds(0)
      )
        .to.emit(escrow, "FundsReleased")
        .withArgs(0, payee.address, amount);

      expect(await escrow.getDealState(0)).to.equal(3); // Released state
      
      const payeeBalanceAfter = await ethers.provider.getBalance(payee.address);
      expect(payeeBalanceAfter).to.equal(payeeBalanceBefore + amount);
    });

    it("Should release ERC20 tokens to payee", async function () {
      // Create and fund token deal
      await escrow.connect(creator).createDeal(payer.address, payee.address, testToken.address, amount, metadata);
      await testToken.mint(payer.address, amount);
      await testToken.connect(payer).approve(escrow.address, amount);
      await escrow.connect(payer).fundDeal(1);
      await escrow.connect(arbiter).approveMilestone(1);

      const payeeBalanceBefore = await testToken.balanceOf(payee.address);
      
      await expect(
        escrow.connect(arbiter).releaseFunds(1)
      )
        .to.emit(escrow, "FundsReleased")
        .withArgs(1, payee.address, amount);

      const payeeBalanceAfter = await testToken.balanceOf(payee.address);
      expect(payeeBalanceAfter).to.equal(payeeBalanceBefore + amount);
    });

    it("Should not allow non-arbiter to release funds", async function () {
      await expect(
        escrow.connect(addr1).releaseFunds(0)
      ).to.be.revertedWith("AccessControl");
    });

    it("Should not release funds from non-approved deal", async function () {
      await escrow.connect(creator).createDeal(addr1.address, addr2.address, ethers.ZeroAddress, amount, metadata);
      await escrow.connect(addr1).fundDeal(1, { value: amount });
      
      await expect(
        escrow.connect(arbiter).releaseFunds(1)
      ).to.be.revertedWith("Deal is not in expected state");
    });
  });

  describe("Dispute Resolution", function () {
    const amount = ethers.parseEther("1.0");
    const metadata = "ipfs://QmTestMetadata";

    beforeEach(async function () {
      await escrow.connect(creator).createDeal(payer.address, payee.address, ethers.ZeroAddress, amount, metadata);
    });

    it("Should raise dispute on funded deal", async function () {
      await escrow.connect(payer).fundDeal(0, { value: amount });
      
      await expect(
        escrow.connect(payer).raiseDispute(0, "Quality issue")
      )
        .to.emit(escrow, "DisputeRaised")
        .withArgs(0, payer.address, "Quality issue");

      expect(await escrow.getDealState(0)).to.equal(4); // Disputed state
    });

    it("Should raise dispute on approved deal", async function () {
      await escrow.connect(payer).fundDeal(0, { value: amount });
      await escrow.connect(arbiter).approveMilestone(0);
      
      await expect(
        escrow.connect(payee).raiseDispute(0, "Payment issue")
      )
        .to.emit(escrow, "DisputeRaised")
        .withArgs(0, payee.address, "Payment issue");

      expect(await escrow.getDealState(0)).to.equal(4); // Disputed state
    });

    it("Should not raise dispute on created deal", async function () {
      await expect(
        escrow.connect(payer).raiseDispute(0, "Too early")
      ).to.be.revertedWith("Can only dispute funded or approved deals");
    });

    it("Should not raise dispute on released deal", async function () {
      await escrow.connect(payer).fundDeal(0, { value: amount });
      await escrow.connect(arbiter).approveMilestone(0);
      await escrow.connect(arbiter).releaseFunds(0);
      
      await expect(
        escrow.connect(payer).raiseDispute(0, "Too late")
      ).to.be.revertedWith("Can only dispute funded or approved deals");
    });
  });

  describe("Deal Cancellation", function () {
    const amount = ethers.parseEther("1.0");
    const metadata = "ipfs://QmTestMetadata";

    beforeEach(async function () {
      await escrow.connect(creator).createDeal(payer.address, payee.address, ethers.ZeroAddress, amount, metadata);
    });

    it("Should cancel created deal", async function () {
      await expect(
        escrow.connect(owner).cancelDeal(0, "Mutual agreement")
      )
        .to.emit(escrow, "DealCancelled")
        .withArgs(0, owner.address, "Mutual agreement");

      expect(await escrow.getDealState(0)).to.equal(5); // Cancelled state
    });

    it("Should cancel funded deal and refund payer", async function () {
      await escrow.connect(payer).fundDeal(0, { value: amount });
      
      const payerBalanceBefore = await ethers.provider.getBalance(payer.address);
      
      await expect(
        escrow.connect(owner).cancelDeal(0, "Dispute resolution")
      )
        .to.emit(escrow, "DealCancelled")
        .withArgs(0, owner.address, "Dispute resolution");

      expect(await escrow.getDealState(0)).to.equal(5); // Cancelled state
      
      const payerBalanceAfter = await ethers.provider.getBalance(payer.address);
      expect(payerBalanceAfter).to.equal(payerBalanceBefore + amount);
    });

    it("Should not allow non-admin to cancel deal", async function () {
      await expect(
        escrow.connect(addr1).cancelDeal(0, "Unauthorized")
      ).to.be.revertedWith("AccessControl");
    });

    it("Should not cancel released deal", async function () {
      await escrow.connect(payer).fundDeal(0, { value: amount });
      await escrow.connect(arbiter).approveMilestone(0);
      await escrow.connect(arbiter).releaseFunds(0);
      
      await expect(
        escrow.connect(owner).cancelDeal(0, "Too late")
      ).to.be.revertedWith("Cannot cancel released deals");
    });
  });

  describe("Complete Workflow", function () {
    const amount = ethers.parseEther("1.0");
    const metadata = "ipfs://QmTestMetadata";

    it("Should complete full happy path: Create -> Fund -> Approve -> Release", async function () {
      // Create deal
      await escrow.connect(creator).createDeal(payer.address, payee.address, ethers.ZeroAddress, amount, metadata);
      expect(await escrow.getDealState(0)).to.equal(0); // Created

      // Fund deal
      await escrow.connect(payer).fundDeal(0, { value: amount });
      expect(await escrow.getDealState(0)).to.equal(1); // Funded

      // Approve deal
      await escrow.connect(arbiter).approveMilestone(0);
      expect(await escrow.getDealState(0)).to.equal(2); // Approved

      // Release funds
      await escrow.connect(arbiter).releaseFunds(0);
      expect(await escrow.getDealState(0)).to.equal(3); // Released
    });

    it("Should handle dispute path: Create -> Fund -> Dispute -> Cancel", async function () {
      // Create deal
      await escrow.connect(creator).createDeal(payer.address, payee.address, ethers.ZeroAddress, amount, metadata);
      expect(await escrow.getDealState(0)).to.equal(0); // Created

      // Fund deal
      await escrow.connect(payer).fundDeal(0, { value: amount });
      expect(await escrow.getDealState(0)).to.equal(1); // Funded

      // Raise dispute
      await escrow.connect(payer).raiseDispute(0, "Quality issue");
      expect(await escrow.getDealState(0)).to.equal(4); // Disputed

      // Cancel deal
      await escrow.connect(owner).cancelDeal(0, "Dispute resolution");
      expect(await escrow.getDealState(0)).to.equal(5); // Cancelled
    });
  });

  describe("Emergency Functions", function () {
    it("Should allow admin to recover stuck ETH", async function () {
      const recoveryAmount = ethers.parseEther("0.5");
      
      // Send ETH to contract
      await owner.sendTransaction({ to: escrow.address, value: recoveryAmount });
      
      const recipientBalanceBefore = await ethers.provider.getBalance(addr1.address);
      
      await escrow.connect(owner).emergencyRecover(ethers.ZeroAddress, addr1.address, recoveryAmount);
      
      const recipientBalanceAfter = await ethers.provider.getBalance(addr1.address);
      expect(recipientBalanceAfter).to.equal(recipientBalanceBefore + recoveryAmount);
    });

    it("Should allow admin to recover stuck ERC20 tokens", async function () {
      const recoveryAmount = ethers.parseEther("1.0");
      
      // Mint tokens to contract
      await testToken.mint(escrow.address, recoveryAmount);
      
      const recipientBalanceBefore = await testToken.balanceOf(addr1.address);
      
      await escrow.connect(owner).emergencyRecover(testToken.address, addr1.address, recoveryAmount);
      
      const recipientBalanceAfter = await testToken.balanceOf(addr1.address);
      expect(recipientBalanceAfter).to.equal(recipientBalanceBefore + recoveryAmount);
    });

    it("Should not allow non-admin to recover funds", async function () {
      await expect(
        escrow.connect(addr1).emergencyRecover(ethers.ZeroAddress, addr2.address, ethers.parseEther("1.0"))
      ).to.be.revertedWith("AccessControl");
    });
  });

  describe("View Functions", function () {
    const amount = ethers.parseEther("1.0");
    const metadata = "ipfs://QmTestMetadata";

    beforeEach(async function () {
      await escrow.connect(creator).createDeal(payer.address, payee.address, ethers.ZeroAddress, amount, metadata);
    });

    it("Should return correct deal state", async function () {
      expect(await escrow.getDealState(0)).to.equal(0); // Created
      
      await escrow.connect(payer).fundDeal(0, { value: amount });
      expect(await escrow.getDealState(0)).to.equal(1); // Funded
    });

    it("Should return correct deal details", async function () {
      const deal = await escrow.getDeal(0);
      expect(deal.payer).to.equal(payer.address);
      expect(deal.payee).to.equal(payee.address);
      expect(deal.token).to.equal(ethers.ZeroAddress);
      expect(deal.amount).to.equal(amount);
      expect(deal.metadata).to.equal(metadata);
    });

    it("Should return correct deal count", async function () {
      expect(await escrow.getDealCount()).to.equal(1);
      
      await escrow.connect(creator).createDeal(addr1.address, addr2.address, ethers.ZeroAddress, amount, metadata);
      expect(await escrow.getDealCount()).to.equal(2);
    });

    it("Should correctly check if deal exists", async function () {
      expect(await escrow.dealExists(0)).to.equal(true);
      expect(await escrow.dealExists(999)).to.equal(false);
    });
  });
}); 