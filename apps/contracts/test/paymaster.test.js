const { expect } = require("chai");
const { ethers } = require("hardhat");
const { parseEther } = ethers;

describe("Paymaster", function () {
  let paymaster;
  let entryPoint;
  let owner;
  let sponsor;
  let user;
  let admin;
  let operator;

  beforeEach(async function () {
    [owner, sponsor, user, admin, operator] = await ethers.getSigners();

    // Deploy mock EntryPoint
    const EntryPoint = await ethers.getContractFactory("MockEntryPoint");
    entryPoint = await EntryPoint.deploy();

    // Deploy Paymaster
    const Paymaster = await ethers.getContractFactory("Paymaster");
    paymaster = await Paymaster.deploy(entryPoint.address, owner.address);

    // Grant roles
    await paymaster.grantRole(await paymaster.ADMIN_ROLE(), admin.address);
    await paymaster.grantRole(await paymaster.OPERATOR_ROLE(), operator.address);
  });

  describe("Deployment", function () {
    it("Should set the correct entry point", async function () {
      expect(await paymaster.entryPoint()).to.equal(entryPoint.address);
    });

    it("Should grant admin role to owner", async function () {
      expect(await paymaster.hasRole(await paymaster.DEFAULT_ADMIN_ROLE(), owner.address)).to.be.true;
    });

    it("Should grant sponsor role to owner", async function () {
      expect(await paymaster.hasRole(await paymaster.SPONSOR_ROLE(), owner.address)).to.be.true;
    });
  });

  describe("Sponsor Management", function () {
    it("Should add a new sponsor", async function () {
      const initialDeposit = parseEther("1");
      const name = "Test Sponsor";
      const maxDailySpend = parseEther("10");

      await expect(paymaster.connect(admin).addSponsor(
        sponsor.address,
        initialDeposit,
        name,
        maxDailySpend
      ))
        .to.emit(paymaster, "SponsorAdded")
        .withArgs(sponsor.address, initialDeposit, name);

      expect(await paymaster.getSponsorBalance(sponsor.address)).to.equal(initialDeposit);
      
      const metadata = await paymaster.getSponsorMetadata(sponsor.address);
      expect(metadata.name).to.equal(name);
      expect(metadata.maxDailySpend).to.equal(maxDailySpend);
      expect(metadata.isActive).to.be.true;
    });

    it("Should fail to add sponsor with zero deposit", async function () {
      await expect(
        paymaster.connect(admin).addSponsor(
          sponsor.address,
          0,
          "Test Sponsor",
          parseEther("10")
        )
      ).to.be.revertedWith("Initial deposit must be positive");
    });

    it("Should fail to add duplicate sponsor", async function () {
      await paymaster.connect(admin).addSponsor(
        sponsor.address,
        parseEther("1"),
        "Test Sponsor",
        parseEther("10")
      );

      await expect(
        paymaster.connect(admin).addSponsor(
          sponsor.address,
          parseEther("1"),
          "Test Sponsor",
          parseEther("10")
        )
      ).to.be.revertedWith("Sponsor already exists");
    });

    it("Should remove a sponsor", async function () {
      const initialDeposit = parseEther("1");
      
      await paymaster.connect(admin).addSponsor(
        sponsor.address,
        initialDeposit,
        "Test Sponsor",
        parseEther("10")
      );

      await expect(paymaster.connect(admin).removeSponsor(sponsor.address))
        .to.emit(paymaster, "SponsorRemoved")
        .withArgs(sponsor.address, initialDeposit);

      const metadata = await paymaster.getSponsorMetadata(sponsor.address);
      expect(metadata.isActive).to.be.false;
    });

    it("Should fail to remove inactive sponsor", async function () {
      await expect(
        paymaster.connect(admin).removeSponsor(sponsor.address)
      ).to.be.revertedWith("Sponsor not active");
    });
  });

  describe("User Whitelisting", function () {
    beforeEach(async function () {
      await paymaster.connect(admin).addSponsor(
        sponsor.address,
        parseEther("1"),
        "Test Sponsor",
        parseEther("10")
      );
    });

    it("Should whitelist a user", async function () {
      await expect(paymaster.connect(operator).whitelistUser(sponsor.address, user.address))
        .to.emit(paymaster, "UserWhitelisted")
        .withArgs(sponsor.address, user.address);

      expect(await paymaster.isUserWhitelisted(sponsor.address, user.address)).to.be.true;
    });

    it("Should fail to whitelist user for inactive sponsor", async function () {
      await paymaster.connect(admin).removeSponsor(sponsor.address);

      await expect(
        paymaster.connect(operator).whitelistUser(sponsor.address, user.address)
      ).to.be.revertedWith("Sponsor not active");
    });

    it("Should fail to whitelist already whitelisted user", async function () {
      await paymaster.connect(operator).whitelistUser(sponsor.address, user.address);

      await expect(
        paymaster.connect(operator).whitelistUser(sponsor.address, user.address)
      ).to.be.revertedWith("User already whitelisted");
    });

    it("Should remove user from whitelist", async function () {
      await paymaster.connect(operator).whitelistUser(sponsor.address, user.address);

      await expect(paymaster.connect(operator).removeWhitelistedUser(sponsor.address, user.address))
        .to.emit(paymaster, "UserRemovedFromWhitelist")
        .withArgs(sponsor.address, user.address);

      expect(await paymaster.isUserWhitelisted(sponsor.address, user.address)).to.be.false;
    });

    it("Should fail to remove non-whitelisted user", async function () {
      await expect(
        paymaster.connect(operator).removeWhitelistedUser(sponsor.address, user.address)
      ).to.be.revertedWith("User not whitelisted");
    });
  });

  describe("Gas Management", function () {
    beforeEach(async function () {
      await paymaster.connect(admin).addSponsor(
        sponsor.address,
        parseEther("1"),
        "Test Sponsor",
        parseEther("10")
      );
      await paymaster.connect(operator).whitelistUser(sponsor.address, user.address);
    });

    it("Should validate user operation with sufficient balance", async function () {
      const userOp = {
        sender: user.address,
        nonce: 0,
        initCode: "0x",
        callData: "0x",
        callGasLimit: 100000,
        verificationGasLimit: 100000,
        preVerificationGas: 100000,
        maxFeePerGas: parseEther("0.00000002"),
        maxPriorityFeePerGas: parseEther("0.00000001"),
        paymasterAndData: ethers.zeroPadValue(sponsor.address, 32),
        signature: "0x"
      };

      const userOpHash = ethers.keccak256(ethers.AbiCoder.defaultAbiCoder().encode(
        ["address", "uint256", "bytes32", "bytes", "uint256", "uint256", "uint256", "uint256", "uint256", "bytes", "bytes"],
        [userOp.sender, userOp.nonce, ethers.keccak256(userOp.initCode), ethers.keccak256(userOp.callData), userOp.callGasLimit, userOp.verificationGasLimit, userOp.preVerificationGas, userOp.maxFeePerGas, userOp.maxPriorityFeePerGas, ethers.keccak256(userOp.paymasterAndData), ethers.keccak256(userOp.signature)]
      ));

      const maxCost = parseEther("0.01");

      const [context, validationData] = await paymaster.validatePaymasterUserOp(userOp, userOpHash, maxCost);
      
      expect(validationData).to.equal(0); // Valid operation
      expect(context).to.not.equal("0x");
    });

    it("Should fail validation with insufficient balance", async function () {
      const userOp = {
        sender: user.address,
        nonce: 0,
        initCode: "0x",
        callData: "0x",
        callGasLimit: 100000,
        verificationGasLimit: 100000,
        preVerificationGas: 100000,
        maxFeePerGas: parseEther("0.00000002"),
        maxPriorityFeePerGas: parseEther("0.00000001"),
        paymasterAndData: ethers.zeroPadValue(sponsor.address, 32),
        signature: "0x"
      };

      const userOpHash = ethers.keccak256(ethers.AbiCoder.defaultAbiCoder().encode(
        ["address", "uint256", "bytes32", "bytes", "uint256", "uint256", "uint256", "uint256", "uint256", "bytes", "bytes"],
        [userOp.sender, userOp.nonce, ethers.keccak256(userOp.initCode), ethers.keccak256(userOp.callData), userOp.callGasLimit, userOp.verificationGasLimit, userOp.preVerificationGas, userOp.maxFeePerGas, userOp.maxPriorityFeePerGas, ethers.keccak256(userOp.paymasterAndData), ethers.keccak256(userOp.signature)]
      ));

      const maxCost = parseEther("2"); // More than sponsor balance

      await expect(
        paymaster.validatePaymasterUserOp(userOp, userOpHash, maxCost)
      ).to.be.revertedWith("Insufficient sponsor balance");
    });

    it("Should fail validation for non-whitelisted user", async function () {
      const userOp = {
        sender: admin.address, // Not whitelisted
        nonce: 0,
        initCode: "0x",
        callData: "0x",
        callGasLimit: 100000,
        verificationGasLimit: 100000,
        preVerificationGas: 100000,
        maxFeePerGas: parseEther("0.00000002"),
        maxPriorityFeePerGas: parseEther("0.00000001"),
        paymasterAndData: ethers.zeroPadValue(sponsor.address, 32),
        signature: "0x"
      };

      const userOpHash = ethers.keccak256(ethers.AbiCoder.defaultAbiCoder().encode(
        ["address", "uint256", "bytes32", "bytes", "uint256", "uint256", "uint256", "uint256", "uint256", "bytes", "bytes"],
        [userOp.sender, userOp.nonce, ethers.keccak256(userOp.initCode), ethers.keccak256(userOp.callData), userOp.callGasLimit, userOp.verificationGasLimit, userOp.preVerificationGas, userOp.maxFeePerGas, userOp.maxPriorityFeePerGas, ethers.keccak256(userOp.paymasterAndData), ethers.keccak256(userOp.signature)]
      ));

      const maxCost = parseEther("0.01");

      await expect(
        paymaster.validatePaymasterUserOp(userOp, userOpHash, maxCost)
      ).to.be.revertedWith("User not whitelisted");
    });
  });

  describe("Admin Functions", function () {
    beforeEach(async function () {
      await paymaster.connect(admin).addSponsor(
        sponsor.address,
        parseEther("1"),
        "Test Sponsor",
        parseEther("10")
      );
    });

    it("Should revoke escrow", async function () {
      const escrowId = ethers.keccak256(ethers.toUtf8Bytes("test-escrow"));
      const reason = "Fraud detected";

      await expect(paymaster.connect(admin).revokeEscrow(escrowId, reason))
        .to.emit(paymaster, "EscrowRevoked")
        .withArgs(escrowId, reason);
    });

    it("Should force withdraw funds", async function () {
      const amount = parseEther("0.5");
      const reason = "Compliance seizure";

      await expect(paymaster.connect(admin).forceWithdraw(sponsor.address, admin.address, amount, reason))
        .to.emit(paymaster, "ForceTransfer")
        .withArgs(sponsor.address, admin.address, amount, reason);

      expect(await paymaster.getSponsorBalance(sponsor.address)).to.equal(parseEther("0.5"));
    });

    it("Should pause and unpause paymaster", async function () {
      await paymaster.connect(admin).pausePaymaster();
      expect(await paymaster.paused()).to.be.true;

      await paymaster.connect(admin).unpausePaymaster();
      expect(await paymaster.paused()).to.be.false;
    });

    it("Should set rate limiter", async function () {
      const newLimiter = admin.address;

      await expect(paymaster.connect(admin).setRateLimiter(newLimiter))
        .to.emit(paymaster, "RateLimiterUpdated")
        .withArgs(ethers.ZeroAddress, newLimiter);

      expect(await paymaster.rateLimiter()).to.equal(newLimiter);
    });
  });

  describe("Daily Spending Limits", function () {
    beforeEach(async function () {
      await paymaster.connect(admin).addSponsor(
        sponsor.address,
        parseEther("1"),
        "Test Sponsor",
        parseEther("0.1") // Low daily limit for testing
      );
      await paymaster.connect(operator).whitelistUser(sponsor.address, user.address);
    });

    it("Should enforce daily spending limit", async function () {
      const userOp = {
        sender: user.address,
        nonce: 0,
        initCode: "0x",
        callData: "0x",
        callGasLimit: 100000,
        verificationGasLimit: 100000,
        preVerificationGas: 100000,
        maxFeePerGas: parseEther("0.00000002"),
        maxPriorityFeePerGas: parseEther("0.00000001"),
        paymasterAndData: ethers.zeroPadValue(sponsor.address, 32),
        signature: "0x"
      };

      const userOpHash = ethers.keccak256(ethers.AbiCoder.defaultAbiCoder().encode(
        ["address", "uint256", "bytes32", "bytes", "uint256", "uint256", "uint256", "uint256", "uint256", "bytes", "bytes"],
        [userOp.sender, userOp.nonce, ethers.keccak256(userOp.initCode), ethers.keccak256(userOp.callData), userOp.callGasLimit, userOp.verificationGasLimit, userOp.preVerificationGas, userOp.maxFeePerGas, userOp.maxPriorityFeePerGas, ethers.keccak256(userOp.paymasterAndData), ethers.keccak256(userOp.signature)]
      ));

      const maxCost = parseEther("0.2"); // Exceeds daily limit

      await expect(
        paymaster.validatePaymasterUserOp(userOp, userOpHash, maxCost)
      ).to.be.revertedWith("Daily spending limit exceeded");
    });
  });

  describe("Events", function () {
    it("Should emit all required events", async function () {
      // Test SponsorAdded event
      await expect(paymaster.connect(admin).addSponsor(
        sponsor.address,
        parseEther("1"),
        "Test Sponsor",
        parseEther("10")
      ))
        .to.emit(paymaster, "SponsorAdded")
        .withArgs(sponsor.address, parseEther("1"), "Test Sponsor");

      // Test UserWhitelisted event
      await expect(paymaster.connect(operator).whitelistUser(sponsor.address, user.address))
        .to.emit(paymaster, "UserWhitelisted")
        .withArgs(sponsor.address, user.address);

      // Test UserRemovedFromWhitelist event
      await expect(paymaster.connect(operator).removeWhitelistedUser(sponsor.address, user.address))
        .to.emit(paymaster, "UserRemovedFromWhitelist")
        .withArgs(sponsor.address, user.address);

      // Test SponsorRemoved event
      await expect(paymaster.connect(admin).removeSponsor(sponsor.address))
        .to.emit(paymaster, "SponsorRemoved")
        .withArgs(sponsor.address, parseEther("1"));
    });
  });
});

// Mock EntryPoint contract for testing
contract("MockEntryPoint", function () {
  // This is a minimal mock for testing purposes
  // In a real implementation, you would use the actual EntryPoint contract
}); 