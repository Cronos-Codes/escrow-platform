// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../../contracts/Escrow.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockERC20 is ERC20 {
    constructor() ERC20("Test Token", "TEST") {}

    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
}

contract EscrowTest is Test {
    Escrow public escrow;
    MockERC20 public testToken;
    
    address public owner;
    address public payer;
    address public payee;
    address public arbiter;
    address public creator;
    
    uint256 public constant DEAL_AMOUNT = 1 ether;
    string public constant METADATA = "ipfs://QmTestMetadata";

    event DealCreated(
        uint256 indexed dealId,
        address indexed payer,
        address indexed payee,
        address token,
        uint256 amount,
        string metadata
    );

    event DealFunded(
        uint256 indexed dealId,
        address indexed funder,
        uint256 amount
    );

    event DealApproved(
        uint256 indexed dealId,
        address indexed arbiter
    );

    event FundsReleased(
        uint256 indexed dealId,
        address indexed payee,
        uint256 amount
    );

    event DisputeRaised(
        uint256 indexed dealId,
        address indexed disputer,
        string reason
    );

    event DealCancelled(
        uint256 indexed dealId,
        address indexed canceller,
        string reason
    );

    function setUp() public {
        owner = makeAddr("owner");
        payer = makeAddr("payer");
        payee = makeAddr("payee");
        arbiter = makeAddr("arbiter");
        creator = makeAddr("creator");

        vm.startPrank(owner);
        
        escrow = new Escrow(owner);
        testToken = new MockERC20();
        
        escrow.grantRole(escrow.CREATOR_ROLE(), creator);
        escrow.grantRole(escrow.ARBITER_ROLE(), arbiter);
        
        vm.stopPrank();
    }

    function test_Deployment() public {
        assertTrue(escrow.hasRole(escrow.DEFAULT_ADMIN_ROLE(), owner));
        assertTrue(escrow.hasRole(escrow.ADMIN_ROLE(), owner));
        assertTrue(escrow.hasRole(escrow.CREATOR_ROLE(), owner));
        assertTrue(escrow.hasRole(escrow.ARBITER_ROLE(), owner));
        assertEq(escrow.getDealCount(), 0);
    }

    function test_CreateDeal() public {
        vm.prank(creator);
        
        vm.expectEmit(true, true, true, true);
        emit DealCreated(0, payer, payee, address(0), DEAL_AMOUNT, METADATA);
        
        escrow.createDeal(payer, payee, address(0), DEAL_AMOUNT, METADATA);
        
        assertEq(escrow.getDealCount(), 1);
        assertEq(uint256(escrow.getDealState(0)), uint256(Escrow.EscrowState.Created));
        
        Escrow.Deal memory deal = escrow.getDeal(0);
        assertEq(deal.payer, payer);
        assertEq(deal.payee, payee);
        assertEq(deal.token, address(0));
        assertEq(deal.amount, DEAL_AMOUNT);
        assertEq(deal.metadata, METADATA);
    }

    function test_CreateDealWithToken() public {
        vm.prank(creator);
        
        vm.expectEmit(true, true, true, true);
        emit DealCreated(0, payer, payee, address(testToken), DEAL_AMOUNT, METADATA);
        
        escrow.createDeal(payer, payee, address(testToken), DEAL_AMOUNT, METADATA);
        
        Escrow.Deal memory deal = escrow.getDeal(0);
        assertEq(deal.token, address(testToken));
    }

    function test_CreateDeal_RevertIfNotCreator() public {
        vm.prank(payer);
        
        vm.expectRevert("AccessControl");
        escrow.createDeal(payer, payee, address(0), DEAL_AMOUNT, METADATA);
    }

    function test_CreateDeal_RevertIfZeroPayer() public {
        vm.prank(creator);
        
        vm.expectRevert("Payer cannot be zero address");
        escrow.createDeal(address(0), payee, address(0), DEAL_AMOUNT, METADATA);
    }

    function test_CreateDeal_RevertIfZeroPayee() public {
        vm.prank(creator);
        
        vm.expectRevert("Payee cannot be zero address");
        escrow.createDeal(payer, address(0), address(0), DEAL_AMOUNT, METADATA);
    }

    function test_CreateDeal_RevertIfZeroAmount() public {
        vm.prank(creator);
        
        vm.expectRevert("Amount must be greater than zero");
        escrow.createDeal(payer, payee, address(0), 0, METADATA);
    }

    function test_CreateDeal_RevertIfSamePayerPayee() public {
        vm.prank(creator);
        
        vm.expectRevert("Payer and payee cannot be the same");
        escrow.createDeal(payer, payer, address(0), DEAL_AMOUNT, METADATA);
    }

    function test_FundDeal() public {
        vm.prank(creator);
        escrow.createDeal(payer, payee, address(0), DEAL_AMOUNT, METADATA);
        
        vm.prank(payer);
        vm.expectEmit(true, true, false, true);
        emit DealFunded(0, payer, DEAL_AMOUNT);
        
        escrow.fundDeal{value: DEAL_AMOUNT}(0);
        
        assertEq(uint256(escrow.getDealState(0)), uint256(Escrow.EscrowState.Funded));
    }

    function test_FundDealWithToken() public {
        vm.prank(creator);
        escrow.createDeal(payer, payee, address(testToken), DEAL_AMOUNT, METADATA);
        
        testToken.mint(payer, DEAL_AMOUNT);
        vm.startPrank(payer);
        testToken.approve(address(escrow), DEAL_AMOUNT);
        
        vm.expectEmit(true, true, false, true);
        emit DealFunded(0, payer, DEAL_AMOUNT);
        
        escrow.fundDeal(0);
        vm.stopPrank();
        
        assertEq(uint256(escrow.getDealState(0)), uint256(Escrow.EscrowState.Funded));
    }

    function test_FundDeal_RevertIfIncorrectAmount() public {
        vm.prank(creator);
        escrow.createDeal(payer, payee, address(0), DEAL_AMOUNT, METADATA);
        
        vm.prank(payer);
        vm.expectRevert("Incorrect ETH amount");
        escrow.fundDeal{value: DEAL_AMOUNT + 0.1 ether}(0);
    }

    function test_FundDeal_RevertIfEthForTokenDeal() public {
        vm.prank(creator);
        escrow.createDeal(payer, payee, address(testToken), DEAL_AMOUNT, METADATA);
        
        vm.prank(payer);
        vm.expectRevert("ETH not accepted for token deals");
        escrow.fundDeal{value: DEAL_AMOUNT}(0);
    }

    function test_FundDeal_RevertIfDealNotExists() public {
        vm.prank(payer);
        vm.expectRevert("Deal does not exist");
        escrow.fundDeal{value: DEAL_AMOUNT}(999);
    }

    function test_FundDeal_RevertIfWrongState() public {
        vm.prank(creator);
        escrow.createDeal(payer, payee, address(0), DEAL_AMOUNT, METADATA);
        
        vm.prank(payer);
        escrow.fundDeal{value: DEAL_AMOUNT}(0);
        
        vm.prank(payee);
        vm.expectRevert("Deal is not in expected state");
        escrow.fundDeal{value: DEAL_AMOUNT}(0);
    }

    function test_ApproveMilestone() public {
        vm.prank(creator);
        escrow.createDeal(payer, payee, address(0), DEAL_AMOUNT, METADATA);
        
        vm.prank(payer);
        escrow.fundDeal{value: DEAL_AMOUNT}(0);
        
        vm.prank(arbiter);
        vm.expectEmit(true, true, false, false);
        emit DealApproved(0, arbiter);
        
        escrow.approveMilestone(0);
        
        assertEq(uint256(escrow.getDealState(0)), uint256(Escrow.EscrowState.Approved));
    }

    function test_ApproveMilestone_RevertIfNotArbiter() public {
        vm.prank(creator);
        escrow.createDeal(payer, payee, address(0), DEAL_AMOUNT, METADATA);
        
        vm.prank(payer);
        escrow.fundDeal{value: DEAL_AMOUNT}(0);
        
        vm.prank(payer);
        vm.expectRevert("AccessControl");
        escrow.approveMilestone(0);
    }

    function test_ApproveMilestone_RevertIfNotFunded() public {
        vm.prank(creator);
        escrow.createDeal(payer, payee, address(0), DEAL_AMOUNT, METADATA);
        
        vm.prank(arbiter);
        vm.expectRevert("Deal is not in expected state");
        escrow.approveMilestone(0);
    }

    function test_ReleaseFunds() public {
        vm.prank(creator);
        escrow.createDeal(payer, payee, address(0), DEAL_AMOUNT, METADATA);
        
        vm.prank(payer);
        escrow.fundDeal{value: DEAL_AMOUNT}(0);
        
        vm.prank(arbiter);
        escrow.approveMilestone(0);
        
        uint256 payeeBalanceBefore = payee.balance;
        
        vm.prank(arbiter);
        vm.expectEmit(true, true, false, true);
        emit FundsReleased(0, payee, DEAL_AMOUNT);
        
        escrow.releaseFunds(0);
        
        assertEq(uint256(escrow.getDealState(0)), uint256(Escrow.EscrowState.Released));
        assertEq(payee.balance, payeeBalanceBefore + DEAL_AMOUNT);
    }

    function test_ReleaseFundsWithToken() public {
        vm.prank(creator);
        escrow.createDeal(payer, payee, address(testToken), DEAL_AMOUNT, METADATA);
        
        testToken.mint(payer, DEAL_AMOUNT);
        vm.startPrank(payer);
        testToken.approve(address(escrow), DEAL_AMOUNT);
        escrow.fundDeal(0);
        vm.stopPrank();
        
        vm.prank(arbiter);
        escrow.approveMilestone(0);
        
        uint256 payeeBalanceBefore = testToken.balanceOf(payee);
        
        vm.prank(arbiter);
        vm.expectEmit(true, true, false, true);
        emit FundsReleased(0, payee, DEAL_AMOUNT);
        
        escrow.releaseFunds(0);
        
        assertEq(testToken.balanceOf(payee), payeeBalanceBefore + DEAL_AMOUNT);
    }

    function test_ReleaseFunds_RevertIfNotArbiter() public {
        vm.prank(creator);
        escrow.createDeal(payer, payee, address(0), DEAL_AMOUNT, METADATA);
        
        vm.prank(payer);
        escrow.fundDeal{value: DEAL_AMOUNT}(0);
        
        vm.prank(arbiter);
        escrow.approveMilestone(0);
        
        vm.prank(payer);
        vm.expectRevert("AccessControl");
        escrow.releaseFunds(0);
    }

    function test_ReleaseFunds_RevertIfNotApproved() public {
        vm.prank(creator);
        escrow.createDeal(payer, payee, address(0), DEAL_AMOUNT, METADATA);
        
        vm.prank(payer);
        escrow.fundDeal{value: DEAL_AMOUNT}(0);
        
        vm.prank(arbiter);
        vm.expectRevert("Deal is not in expected state");
        escrow.releaseFunds(0);
    }

    function test_RaiseDispute() public {
        vm.prank(creator);
        escrow.createDeal(payer, payee, address(0), DEAL_AMOUNT, METADATA);
        
        vm.prank(payer);
        vm.expectEmit(true, true, false, false);
        emit DisputeRaised(0, payer, "Quality issue");
        
        escrow.raiseDispute(0, "Quality issue");
        
        assertEq(uint256(escrow.getDealState(0)), uint256(Escrow.EscrowState.Disputed));
    }

    function test_RaiseDisputeOnApprovedDeal() public {
        vm.prank(creator);
        escrow.createDeal(payer, payee, address(0), DEAL_AMOUNT, METADATA);
        
        vm.prank(payer);
        escrow.fundDeal{value: DEAL_AMOUNT}(0);
        
        vm.prank(arbiter);
        escrow.approveMilestone(0);
        
        vm.prank(payee);
        vm.expectEmit(true, true, false, false);
        emit DisputeRaised(0, payee, "Payment issue");
        
        escrow.raiseDispute(0, "Payment issue");
        
        assertEq(uint256(escrow.getDealState(0)), uint256(Escrow.EscrowState.Disputed));
    }

    function test_RaiseDispute_RevertIfNotFunded() public {
        vm.prank(creator);
        escrow.createDeal(payer, payee, address(0), DEAL_AMOUNT, METADATA);
        
        vm.prank(payer);
        vm.expectRevert("Can only dispute funded or approved deals");
        escrow.raiseDispute(0, "Too early");
    }

    function test_RaiseDispute_RevertIfReleased() public {
        vm.prank(creator);
        escrow.createDeal(payer, payee, address(0), DEAL_AMOUNT, METADATA);
        
        vm.prank(payer);
        escrow.fundDeal{value: DEAL_AMOUNT}(0);
        
        vm.prank(arbiter);
        escrow.approveMilestone(0);
        
        vm.prank(arbiter);
        escrow.releaseFunds(0);
        
        vm.prank(payer);
        vm.expectRevert("Can only dispute funded or approved deals");
        escrow.raiseDispute(0, "Too late");
    }

    function test_CancelDeal() public {
        vm.prank(creator);
        escrow.createDeal(payer, payee, address(0), DEAL_AMOUNT, METADATA);
        
        vm.prank(owner);
        vm.expectEmit(true, true, false, false);
        emit DealCancelled(0, owner, "Mutual agreement");
        
        escrow.cancelDeal(0, "Mutual agreement");
        
        assertEq(uint256(escrow.getDealState(0)), uint256(Escrow.EscrowState.Cancelled));
    }

    function test_CancelFundedDeal() public {
        vm.prank(creator);
        escrow.createDeal(payer, payee, address(0), DEAL_AMOUNT, METADATA);
        
        vm.prank(payer);
        escrow.fundDeal{value: DEAL_AMOUNT}(0);
        
        uint256 payerBalanceBefore = payer.balance;
        
        vm.prank(owner);
        vm.expectEmit(true, true, false, false);
        emit DealCancelled(0, owner, "Dispute resolution");
        
        escrow.cancelDeal(0, "Dispute resolution");
        
        assertEq(uint256(escrow.getDealState(0)), uint256(Escrow.EscrowState.Cancelled));
        assertEq(payer.balance, payerBalanceBefore + DEAL_AMOUNT);
    }

    function test_CancelDeal_RevertIfNotAdmin() public {
        vm.prank(creator);
        escrow.createDeal(payer, payee, address(0), DEAL_AMOUNT, METADATA);
        
        vm.prank(payer);
        vm.expectRevert("AccessControl");
        escrow.cancelDeal(0, "Unauthorized");
    }

    function test_CancelDeal_RevertIfReleased() public {
        vm.prank(creator);
        escrow.createDeal(payer, payee, address(0), DEAL_AMOUNT, METADATA);
        
        vm.prank(payer);
        escrow.fundDeal{value: DEAL_AMOUNT}(0);
        
        vm.prank(arbiter);
        escrow.approveMilestone(0);
        
        vm.prank(arbiter);
        escrow.releaseFunds(0);
        
        vm.prank(owner);
        vm.expectRevert("Cannot cancel released deals");
        escrow.cancelDeal(0, "Too late");
    }

    function test_CompleteWorkflow() public {
        // Create deal
        vm.prank(creator);
        escrow.createDeal(payer, payee, address(0), DEAL_AMOUNT, METADATA);
        assertEq(uint256(escrow.getDealState(0)), uint256(Escrow.EscrowState.Created));

        // Fund deal
        vm.prank(payer);
        escrow.fundDeal{value: DEAL_AMOUNT}(0);
        assertEq(uint256(escrow.getDealState(0)), uint256(Escrow.EscrowState.Funded));

        // Approve deal
        vm.prank(arbiter);
        escrow.approveMilestone(0);
        assertEq(uint256(escrow.getDealState(0)), uint256(Escrow.EscrowState.Approved));

        // Release funds
        vm.prank(arbiter);
        escrow.releaseFunds(0);
        assertEq(uint256(escrow.getDealState(0)), uint256(Escrow.EscrowState.Released));
    }

    function test_DisputeWorkflow() public {
        // Create deal
        vm.prank(creator);
        escrow.createDeal(payer, payee, address(0), DEAL_AMOUNT, METADATA);
        assertEq(uint256(escrow.getDealState(0)), uint256(Escrow.EscrowState.Created));

        // Fund deal
        vm.prank(payer);
        escrow.fundDeal{value: DEAL_AMOUNT}(0);
        assertEq(uint256(escrow.getDealState(0)), uint256(Escrow.EscrowState.Funded));

        // Raise dispute
        vm.prank(payer);
        escrow.raiseDispute(0, "Quality issue");
        assertEq(uint256(escrow.getDealState(0)), uint256(Escrow.EscrowState.Disputed));

        // Cancel deal
        vm.prank(owner);
        escrow.cancelDeal(0, "Dispute resolution");
        assertEq(uint256(escrow.getDealState(0)), uint256(Escrow.EscrowState.Cancelled));
    }

    // Fuzzing tests
    function testFuzz_CreateDeal(uint256 amount) public {
        vm.assume(amount > 0 && amount <= 1000 ether);
        
        vm.prank(creator);
        escrow.createDeal(payer, payee, address(0), amount, METADATA);
        
        assertEq(escrow.getDealCount(), 1);
        assertEq(uint256(escrow.getDealState(0)), uint256(Escrow.EscrowState.Created));
        
        Escrow.Deal memory deal = escrow.getDeal(0);
        assertEq(deal.amount, amount);
    }

    function testFuzz_FundDeal(uint256 amount) public {
        vm.assume(amount > 0 && amount <= 1000 ether);
        
        vm.prank(creator);
        escrow.createDeal(payer, payee, address(0), amount, METADATA);
        
        vm.prank(payer);
        escrow.fundDeal{value: amount}(0);
        
        assertEq(uint256(escrow.getDealState(0)), uint256(Escrow.EscrowState.Funded));
    }

    function testFuzz_DealId(uint256 dealId) public {
        vm.assume(dealId > 0);
        
        vm.expectRevert("Deal does not exist");
        escrow.getDealState(dealId);
    }

    // Gas benchmarking
    function testGas_CreateDeal() public {
        vm.prank(creator);
        uint256 gasBefore = gasleft();
        escrow.createDeal(payer, payee, address(0), DEAL_AMOUNT, METADATA);
        uint256 gasUsed = gasBefore - gasleft();
        
        console.log("Gas used for createDeal:", gasUsed);
        assertTrue(gasUsed < 200000, "Gas usage too high for createDeal");
    }

    function testGas_FundDeal() public {
        vm.prank(creator);
        escrow.createDeal(payer, payee, address(0), DEAL_AMOUNT, METADATA);
        
        vm.prank(payer);
        uint256 gasBefore = gasleft();
        escrow.fundDeal{value: DEAL_AMOUNT}(0);
        uint256 gasUsed = gasBefore - gasleft();
        
        console.log("Gas used for fundDeal:", gasUsed);
        assertTrue(gasUsed < 100000, "Gas usage too high for fundDeal");
    }

    function testGas_ReleaseFunds() public {
        vm.prank(creator);
        escrow.createDeal(payer, payee, address(0), DEAL_AMOUNT, METADATA);
        
        vm.prank(payer);
        escrow.fundDeal{value: DEAL_AMOUNT}(0);
        
        vm.prank(arbiter);
        escrow.approveMilestone(0);
        
        vm.prank(arbiter);
        uint256 gasBefore = gasleft();
        escrow.releaseFunds(0);
        uint256 gasUsed = gasBefore - gasleft();
        
        console.log("Gas used for releaseFunds:", gasUsed);
        assertTrue(gasUsed < 80000, "Gas usage too high for releaseFunds");
    }

    function testGas_CompleteWorkflow() public {
        vm.prank(creator);
        uint256 gasBefore = gasleft();
        
        escrow.createDeal(payer, payee, address(0), DEAL_AMOUNT, METADATA);
        
        vm.prank(payer);
        escrow.fundDeal{value: DEAL_AMOUNT}(0);
        
        vm.prank(arbiter);
        escrow.approveMilestone(0);
        
        vm.prank(arbiter);
        escrow.releaseFunds(0);
        
        uint256 gasUsed = gasBefore - gasleft();
        console.log("Total gas used for complete workflow:", gasUsed);
        assertTrue(gasUsed < 400000, "Gas usage too high for complete workflow");
    }
} 