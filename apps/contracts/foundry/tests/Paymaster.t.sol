// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../../contracts/Paymaster.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract MockEntryPoint {
    function depositTo(address account) external payable {}
}

contract PaymasterTest is Test {
    Paymaster public paymaster;
    MockEntryPoint public entryPoint;
    
    address public admin = address(0x1);
    address public sponsor = address(0x2);
    address public user = address(0x3);
    address public operator = address(0x4);
    
    event SponsorAdded(address indexed sponsor, uint256 initialDeposit, string name);
    event UserWhitelisted(address indexed sponsor, address indexed user);
    event GasReserved(address indexed sponsor, address indexed user, uint256 gasReserved, uint256 maxCost);
    event GasPaid(address indexed sponsor, address indexed user, uint256 actualGasCost);
    event Refunded(address indexed sponsor, uint256 refundAmount);

    function setUp() public {
        entryPoint = new MockEntryPoint();
        paymaster = new Paymaster(IEntryPoint(address(entryPoint)), admin);
        
        // Grant roles
        paymaster.grantRole(paymaster.ADMIN_ROLE(), admin);
        paymaster.grantRole(paymaster.OPERATOR_ROLE(), operator);
    }

    // ============ Gas Benchmarking Tests ============

    function testGas_validatePaymasterUserOp() public {
        // Setup sponsor and user
        paymaster.addSponsor(sponsor, 1 ether, "Test Sponsor", 10 ether);
        paymaster.whitelistUser(sponsor, user);
        
        // Create user operation
        UserOperation memory userOp = UserOperation({
            sender: user,
            nonce: 0,
            initCode: "",
            callData: "",
            callGasLimit: 100000,
            verificationGasLimit: 100000,
            preVerificationGas: 100000,
            maxFeePerGas: 20 gwei,
            maxPriorityFeePerGas: 10 gwei,
            paymasterAndData: abi.encodePacked(sponsor),
            signature: ""
        });
        
        bytes32 userOpHash = keccak256(abi.encode(userOp));
        uint256 maxCost = 0.01 ether;
        
        // Measure gas usage
        uint256 gasBefore = gasleft();
        paymaster.validatePaymasterUserOp(userOp, userOpHash, maxCost);
        uint256 gasUsed = gasBefore - gasleft();
        
        // Assert gas usage is below 60,000
        assertLt(gasUsed, 60_000, "Gas usage exceeds 60,000 limit");
        
        console.log("validatePaymasterUserOp gas used:", gasUsed);
    }

    function testGas_postOp() public {
        // Setup sponsor and user
        paymaster.addSponsor(sponsor, 1 ether, "Test Sponsor", 10 ether);
        paymaster.whitelistUser(sponsor, user);
        
        // Create context from validatePaymasterUserOp
        UserOperation memory userOp = UserOperation({
            sender: user,
            nonce: 0,
            initCode: "",
            callData: "",
            callGasLimit: 100000,
            verificationGasLimit: 100000,
            preVerificationGas: 100000,
            maxFeePerGas: 20 gwei,
            maxPriorityFeePerGas: 10 gwei,
            paymasterAndData: abi.encodePacked(sponsor),
            signature: ""
        });
        
        bytes32 userOpHash = keccak256(abi.encode(userOp));
        uint256 maxCost = 0.01 ether;
        
        (bytes memory context,) = paymaster.validatePaymasterUserOp(userOp, userOpHash, maxCost);
        
        // Measure gas usage for postOp
        uint256 gasBefore = gasleft();
        paymaster.postOp(IPaymaster.PostOpMode.opSucceeded, context, 0.005 ether);
        uint256 gasUsed = gasBefore - gasleft();
        
        console.log("postOp gas used:", gasUsed);
    }

    // ============ Fuzzing Tests ============

    function testFuzz_AddSponsor(
        address fuzzSponsor,
        uint256 fuzzDeposit,
        string memory fuzzName,
        uint256 fuzzMaxDailySpend
    ) public {
        vm.assume(fuzzSponsor != address(0));
        vm.assume(fuzzDeposit > 0);
        vm.assume(fuzzDeposit <= 1000 ether); // Reasonable upper bound
        vm.assume(fuzzMaxDailySpend > 0);
        vm.assume(fuzzMaxDailySpend <= 10000 ether); // Reasonable upper bound
        
        vm.prank(admin);
        paymaster.addSponsor(fuzzSponsor, fuzzDeposit, fuzzName, fuzzMaxDailySpend);
        
        assertEq(paymaster.getSponsorBalance(fuzzSponsor), fuzzDeposit);
        
        Paymaster.SponsorMetadata memory metadata = paymaster.getSponsorMetadata(fuzzSponsor);
        assertEq(metadata.name, fuzzName);
        assertEq(metadata.maxDailySpend, fuzzMaxDailySpend);
        assertTrue(metadata.isActive);
    }

    function testFuzz_WhitelistUser(address fuzzSponsor, address fuzzUser) public {
        vm.assume(fuzzSponsor != address(0));
        vm.assume(fuzzUser != address(0));
        vm.assume(fuzzSponsor != fuzzUser);
        
        // Add sponsor first
        vm.prank(admin);
        paymaster.addSponsor(fuzzSponsor, 1 ether, "Test Sponsor", 10 ether);
        
        // Whitelist user
        vm.prank(operator);
        paymaster.whitelistUser(fuzzSponsor, fuzzUser);
        
        assertTrue(paymaster.isUserWhitelisted(fuzzSponsor, fuzzUser));
    }

    function testFuzz_ForceWithdraw(
        address fuzzFrom,
        address fuzzTo,
        uint256 fuzzAmount
    ) public {
        vm.assume(fuzzFrom != address(0));
        vm.assume(fuzzTo != address(0));
        vm.assume(fuzzAmount > 0);
        vm.assume(fuzzAmount <= 1 ether);
        
        // Add sponsor with balance
        vm.prank(admin);
        paymaster.addSponsor(fuzzFrom, 1 ether, "Test Sponsor", 10 ether);
        
        uint256 balanceBefore = paymaster.getSponsorBalance(fuzzFrom);
        uint256 toBalanceBefore = fuzzTo.balance;
        
        vm.prank(admin);
        paymaster.forceWithdraw(fuzzFrom, fuzzTo, fuzzAmount, "Test withdrawal");
        
        assertEq(paymaster.getSponsorBalance(fuzzFrom), balanceBefore - fuzzAmount);
        assertEq(fuzzTo.balance, toBalanceBefore + fuzzAmount);
    }

    // ============ Reentrancy Tests ============

    function testReentrancy_validatePaymasterUserOp() public {
        // Setup sponsor and user
        paymaster.addSponsor(sponsor, 1 ether, "Test Sponsor", 10 ether);
        paymaster.whitelistUser(sponsor, user);
        
        // Create user operation
        UserOperation memory userOp = UserOperation({
            sender: user,
            nonce: 0,
            initCode: "",
            callData: "",
            callGasLimit: 100000,
            verificationGasLimit: 100000,
            preVerificationGas: 100000,
            maxFeePerGas: 20 gwei,
            maxPriorityFeePerGas: 10 gwei,
            paymasterAndData: abi.encodePacked(sponsor),
            signature: ""
        });
        
        bytes32 userOpHash = keccak256(abi.encode(userOp));
        uint256 maxCost = 0.01 ether;
        
        // First call should succeed
        paymaster.validatePaymasterUserOp(userOp, userOpHash, maxCost);
        
        // Second call with same userOp should fail due to insufficient balance
        vm.expectRevert("Insufficient sponsor balance");
        paymaster.validatePaymasterUserOp(userOp, userOpHash, maxCost);
    }

    // ============ Edge Case Tests ============

    function testEdgeCase_ZeroAddressSponsor() public {
        vm.prank(admin);
        vm.expectRevert("Invalid sponsor address");
        paymaster.addSponsor(address(0), 1 ether, "Test Sponsor", 10 ether);
    }

    function testEdgeCase_ZeroDeposit() public {
        vm.prank(admin);
        vm.expectRevert("Initial deposit must be positive");
        paymaster.addSponsor(sponsor, 0, "Test Sponsor", 10 ether);
    }

    function testEdgeCase_DuplicateSponsor() public {
        vm.prank(admin);
        paymaster.addSponsor(sponsor, 1 ether, "Test Sponsor", 10 ether);
        
        vm.prank(admin);
        vm.expectRevert("Sponsor already exists");
        paymaster.addSponsor(sponsor, 1 ether, "Test Sponsor", 10 ether);
    }

    function testEdgeCase_RemoveNonExistentSponsor() public {
        vm.prank(admin);
        vm.expectRevert("Sponsor not active");
        paymaster.removeSponsor(sponsor);
    }

    function testEdgeCase_WhitelistUserForInactiveSponsor() public {
        vm.prank(operator);
        vm.expectRevert("Sponsor not active");
        paymaster.whitelistUser(sponsor, user);
    }

    function testEdgeCase_WhitelistZeroAddressUser() public {
        paymaster.addSponsor(sponsor, 1 ether, "Test Sponsor", 10 ether);
        
        vm.prank(operator);
        vm.expectRevert("Invalid user address");
        paymaster.whitelistUser(sponsor, address(0));
    }

    function testEdgeCase_DuplicateWhitelist() public {
        paymaster.addSponsor(sponsor, 1 ether, "Test Sponsor", 10 ether);
        
        vm.prank(operator);
        paymaster.whitelistUser(sponsor, user);
        
        vm.prank(operator);
        vm.expectRevert("User already whitelisted");
        paymaster.whitelistUser(sponsor, user);
    }

    // ============ Daily Spending Limit Tests ============

    function testDailySpendingLimit_ResetAfter24Hours() public {
        paymaster.addSponsor(sponsor, 1 ether, "Test Sponsor", 0.1 ether);
        paymaster.whitelistUser(sponsor, user);
        
        // First transaction
        UserOperation memory userOp = UserOperation({
            sender: user,
            nonce: 0,
            initCode: "",
            callData: "",
            callGasLimit: 100000,
            verificationGasLimit: 100000,
            preVerificationGas: 100000,
            maxFeePerGas: 20 gwei,
            maxPriorityFeePerGas: 10 gwei,
            paymasterAndData: abi.encodePacked(sponsor),
            signature: ""
        });
        
        bytes32 userOpHash = keccak256(abi.encode(userOp));
        uint256 maxCost = 0.05 ether;
        
        paymaster.validatePaymasterUserOp(userOp, userOpHash, maxCost);
        
        // Second transaction should fail due to daily limit
        userOp.nonce = 1;
        userOpHash = keccak256(abi.encode(userOp));
        
        vm.expectRevert("Daily spending limit exceeded");
        paymaster.validatePaymasterUserOp(userOp, userOpHash, maxCost);
        
        // Fast forward 25 hours
        vm.warp(block.timestamp + 25 hours);
        
        // Third transaction should succeed after reset
        userOp.nonce = 2;
        userOpHash = keccak256(abi.encode(userOp));
        
        paymaster.validatePaymasterUserOp(userOp, userOpHash, maxCost);
    }

    // ============ Event Emission Tests ============

    function testEvents_SponsorAdded() public {
        vm.prank(admin);
        vm.expectEmit(true, false, false, true);
        emit SponsorAdded(sponsor, 1 ether, "Test Sponsor");
        paymaster.addSponsor(sponsor, 1 ether, "Test Sponsor", 10 ether);
    }

    function testEvents_UserWhitelisted() public {
        paymaster.addSponsor(sponsor, 1 ether, "Test Sponsor", 10 ether);
        
        vm.prank(operator);
        vm.expectEmit(true, true, false, false);
        emit UserWhitelisted(sponsor, user);
        paymaster.whitelistUser(sponsor, user);
    }

    function testEvents_GasReserved() public {
        paymaster.addSponsor(sponsor, 1 ether, "Test Sponsor", 10 ether);
        paymaster.whitelistUser(sponsor, user);
        
        UserOperation memory userOp = UserOperation({
            sender: user,
            nonce: 0,
            initCode: "",
            callData: "",
            callGasLimit: 100000,
            verificationGasLimit: 100000,
            preVerificationGas: 100000,
            maxFeePerGas: 20 gwei,
            maxPriorityFeePerGas: 10 gwei,
            paymasterAndData: abi.encodePacked(sponsor),
            signature: ""
        });
        
        bytes32 userOpHash = keccak256(abi.encode(userOp));
        uint256 maxCost = 0.01 ether;
        
        vm.expectEmit(true, true, false, true);
        emit GasReserved(sponsor, user, maxCost, maxCost);
        paymaster.validatePaymasterUserOp(userOp, userOpHash, maxCost);
    }

    // ============ Access Control Tests ============

    function testAccessControl_OnlyAdminCanAddSponsor() public {
        vm.prank(user);
        vm.expectRevert();
        paymaster.addSponsor(sponsor, 1 ether, "Test Sponsor", 10 ether);
    }

    function testAccessControl_OnlyOperatorCanWhitelist() public {
        paymaster.addSponsor(sponsor, 1 ether, "Test Sponsor", 10 ether);
        
        vm.prank(user);
        vm.expectRevert();
        paymaster.whitelistUser(sponsor, user);
    }

    function testAccessControl_OnlyAdminCanRemoveSponsor() public {
        paymaster.addSponsor(sponsor, 1 ether, "Test Sponsor", 10 ether);
        
        vm.prank(user);
        vm.expectRevert();
        paymaster.removeSponsor(sponsor);
    }

    // ============ Pausable Tests ============

    function testPausable_PauseAndUnpause() public {
        vm.prank(admin);
        paymaster.pausePaymaster();
        assertTrue(paymaster.paused());
        
        vm.prank(admin);
        paymaster.unpausePaymaster();
        assertFalse(paymaster.paused());
    }

    function testPausable_CannotValidateWhenPaused() public {
        paymaster.addSponsor(sponsor, 1 ether, "Test Sponsor", 10 ether);
        paymaster.whitelistUser(sponsor, user);
        
        vm.prank(admin);
        paymaster.pausePaymaster();
        
        UserOperation memory userOp = UserOperation({
            sender: user,
            nonce: 0,
            initCode: "",
            callData: "",
            callGasLimit: 100000,
            verificationGasLimit: 100000,
            preVerificationGas: 100000,
            maxFeePerGas: 20 gwei,
            maxPriorityFeePerGas: 10 gwei,
            paymasterAndData: abi.encodePacked(sponsor),
            signature: ""
        });
        
        bytes32 userOpHash = keccak256(abi.encode(userOp));
        uint256 maxCost = 0.01 ether;
        
        vm.expectRevert("Pausable: paused");
        paymaster.validatePaymasterUserOp(userOp, userOpHash, maxCost);
    }

    // ============ Integration Tests ============

    function testIntegration_FullSponsorLifecycle() public {
        // 1. Add sponsor
        vm.prank(admin);
        paymaster.addSponsor(sponsor, 1 ether, "Test Sponsor", 10 ether);
        
        // 2. Whitelist user
        vm.prank(operator);
        paymaster.whitelistUser(sponsor, user);
        
        // 3. Validate user operation
        UserOperation memory userOp = UserOperation({
            sender: user,
            nonce: 0,
            initCode: "",
            callData: "",
            callGasLimit: 100000,
            verificationGasLimit: 100000,
            preVerificationGas: 100000,
            maxFeePerGas: 20 gwei,
            maxPriorityFeePerGas: 10 gwei,
            paymasterAndData: abi.encodePacked(sponsor),
            signature: ""
        });
        
        bytes32 userOpHash = keccak256(abi.encode(userOp));
        uint256 maxCost = 0.01 ether;
        
        (bytes memory context,) = paymaster.validatePaymasterUserOp(userOp, userOpHash, maxCost);
        
        // 4. Post operation
        paymaster.postOp(IPaymaster.PostOpMode.opSucceeded, context, 0.005 ether);
        
        // 5. Remove user from whitelist
        vm.prank(operator);
        paymaster.removeWhitelistedUser(sponsor, user);
        
        // 6. Remove sponsor
        vm.prank(admin);
        paymaster.removeSponsor(sponsor);
        
        // Verify final state
        assertFalse(paymaster.isUserWhitelisted(sponsor, user));
        Paymaster.SponsorMetadata memory metadata = paymaster.getSponsorMetadata(sponsor);
        assertFalse(metadata.isActive);
    }
} 