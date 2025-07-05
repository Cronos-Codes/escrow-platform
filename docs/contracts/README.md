# Smart Contract Documentation

## Overview
This document provides comprehensive documentation for the Escrow platform smart contracts, including technical specifications, usage examples, and security considerations.

## Contract Architecture

### Core Contracts

#### 1. Escrow.sol
The main escrow contract that handles the core escrow functionality.

**Key Features:**
- Multi-token support (USDC, USDT, ETH, MATIC)
- Role-based access control
- Pausable functionality
- Dispute resolution integration
- Industry adapter support

**State Variables:**
```solidity
struct Deal {
    address buyer;
    address seller;
    uint256 amount;
    string currency;
    DealStatus status;
    uint256 createdAt;
    uint256 fundedAt;
    uint256 approvedAt;
    uint256 releasedAt;
}

enum DealStatus {
    Created,
    Funded,
    Approved,
    Released,
    Disputed,
    Cancelled
}
```

**Key Functions:**

**createDeal**
```solidity
function createDeal(
    string memory title,
    string memory description,
    uint256 amount,
    string memory currency,
    address seller,
    string memory industryAdapter
) external returns (uint256 dealId)
```
Creates a new escrow deal.

**fundDeal**
```solidity
function fundDeal(uint256 dealId) external payable
```
Funds an escrow deal with the specified amount.

**approveDeal**
```solidity
function approveDeal(uint256 dealId) external
```
Approves a deal by the seller.

**releaseFunds**
```solidity
function releaseFunds(uint256 dealId) external
```
Releases funds to the seller.

**createDispute**
```solidity
function createDispute(uint256 dealId, string memory reason) external
```
Creates a dispute for an escrow deal.

#### 2. Paymaster.sol
Handles gas fee sponsorship for gasless transactions.

**Key Features:**
- Gas fee sponsorship
- Whitelist management
- Rate limiting
- Emergency controls

**Key Functions:**

**sponsorTransaction**
```solidity
function sponsorTransaction(
    UserOperation calldata userOp,
    bytes32 userOpHash,
    uint256 maxCost
) external returns (uint256 gasUsed)
```
Sponsors gas fees for a user operation.

**addToWhitelist**
```solidity
function addToWhitelist(address user) external onlyAdmin
```
Adds a user to the gas sponsorship whitelist.

#### 3. DisputeArbitrator.sol
Manages dispute resolution and arbitration.

**Key Features:**
- Multi-party voting
- Weighted voting system
- Appeal mechanism
- Evidence submission

**Key Functions:**

**submitVote**
```solidity
function submitVote(
    uint256 disputeId,
    Vote vote,
    string memory reason
) external
```
Submits a vote on a dispute.

**resolveDispute**
```solidity
function resolveDispute(uint256 disputeId) external onlyArbitrator
```
Resolves a dispute based on votes.

#### 4. RealEstateToken.sol
Handles real estate tokenization and verification.

**Key Features:**
- Property tokenization
- Verification system
- Transfer restrictions
- Compliance checks

**Key Functions:**

**tokenizeProperty**
```solidity
function tokenizeProperty(
    string memory propertyId,
    string memory metadata,
    uint256 value
) external onlyVerifier returns (uint256 tokenId)
```
Tokenizes a real estate property.

**verifyProperty**
```solidity
function verifyProperty(uint256 tokenId) external onlyVerifier
```
Verifies a tokenized property.

## Security Features

### Access Control
All contracts implement role-based access control using OpenZeppelin's `AccessControl`:

- **DEFAULT_ADMIN_ROLE**: Full administrative access
- **PAUSER_ROLE**: Can pause/unpause contracts
- **ARBITRATOR_ROLE**: Can resolve disputes
- **VERIFIER_ROLE**: Can verify properties/assays

### Reentrancy Protection
All external functions are protected against reentrancy attacks using the `nonReentrant` modifier.

### Pausable Functionality
Critical functions can be paused in emergency situations using the `whenNotPaused` modifier.

### Input Validation
Comprehensive input validation for all parameters:
- Address validation
- Amount validation
- String length limits
- Enum value validation

## Gas Optimization

### Storage Optimization
- Packed structs where possible
- Use of uint256 for gas efficiency
- Minimal storage reads/writes

### Function Optimization
- Batch operations where applicable
- Efficient loops and conditionals
- Minimal external calls

## Testing

### Test Coverage
- Unit tests for all functions
- Integration tests for workflows
- Fuzz testing for edge cases
- Gas usage tests

### Test Commands
```bash
# Run all tests
npm test

# Run specific test file
npm test Escrow.t.sol

# Run with gas reporting
npm test -- --gas

# Run with coverage
npm test -- --coverage
```

## Deployment

### Network Configuration
```javascript
// hardhat.config.js
module.exports = {
  networks: {
    mainnet: {
      url: process.env.MAINNET_RPC_URL,
      accounts: [process.env.PRIVATE_KEY],
      gasPrice: 20000000000
    },
    polygon: {
      url: process.env.POLYGON_RPC_URL,
      accounts: [process.env.PRIVATE_KEY],
      gasPrice: 30000000000
    }
  }
};
```

### Deployment Script
```javascript
// scripts/deploy.js
async function main() {
  // Deploy Escrow
  const Escrow = await ethers.getContractFactory("Escrow");
  const escrow = await Escrow.deploy();
  await escrow.deployed();
  
  // Deploy Paymaster
  const Paymaster = await ethers.getContractFactory("Paymaster");
  const paymaster = await Paymaster.deploy();
  await paymaster.deployed();
  
  // Deploy DisputeArbitrator
  const DisputeArbitrator = await ethers.getContractFactory("DisputeArbitrator");
  const arbitrator = await DisputeArbitrator.deploy();
  await arbitrator.deployed();
  
  // Deploy RealEstateToken
  const RealEstateToken = await ethers.getContractFactory("RealEstateToken");
  const realEstateToken = await RealEstateToken.deploy();
  await realEstateToken.deployed();
  
  console.log("Contracts deployed:");
  console.log("Escrow:", escrow.address);
  console.log("Paymaster:", paymaster.address);
  console.log("DisputeArbitrator:", arbitrator.address);
  console.log("RealEstateToken:", realEstateToken.address);
}
```

## Integration

### Frontend Integration
```javascript
// Example: Create escrow deal
const escrowContract = new ethers.Contract(escrowAddress, escrowABI, signer);
const tx = await escrowContract.createDeal(
  "Property Sale",
  "Luxury apartment in downtown",
  ethers.utils.parseEther("100000"),
  "USDC",
  sellerAddress,
  "real-estate"
);
await tx.wait();
```

### Backend Integration
```javascript
// Example: Monitor events
escrowContract.on("DealCreated", (dealId, buyer, seller, amount, event) => {
  console.log(`Deal ${dealId} created by ${buyer} for ${seller}`);
  // Update database
});
```

## Monitoring

### Events
All contracts emit comprehensive events for monitoring:
- `DealCreated`
- `DealFunded`
- `DealApproved`
- `FundsReleased`
- `DisputeCreated`
- `VoteSubmitted`
- `DisputeResolved`

### Health Checks
```javascript
// Check contract health
async function checkContractHealth() {
  const isPaused = await escrowContract.paused();
  const adminRole = await escrowContract.DEFAULT_ADMIN_ROLE();
  const hasAdmin = await escrowContract.hasRole(adminRole, adminAddress);
  
  return {
    isPaused,
    hasAdmin,
    timestamp: Date.now()
  };
}
```

## Emergency Procedures

### Pause Contracts
```javascript
// Emergency pause
await escrowContract.pause();
await paymasterContract.pause();
```

### Emergency Withdraw
```javascript
// Emergency fund withdrawal
await escrowContract.emergencyWithdraw();
```

### Role Management
```javascript
// Grant emergency role
await escrowContract.grantRole(EMERGENCY_ROLE, emergencyAddress);
```

## Compliance

### KYC/AML Integration
- User verification through external providers
- Transaction monitoring
- Suspicious activity detection

### Regulatory Compliance
- GDPR compliance for data handling
- Local jurisdiction requirements
- Tax reporting integration

## Support

### Documentation
- [API Reference](./api.md)
- [Integration Guide](./integration.md)
- [Security Guide](./security.md)

### Contact
- Technical Support: tech@escrowplatform.com
- Security Issues: security@escrowplatform.com
- Emergency: +1-555-EMERGENCY

---

**Last Updated:** $(date)
**Version:** 1.0.0 