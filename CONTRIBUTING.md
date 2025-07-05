# Contributing to Escrow Platform

Thank you for your interest in contributing to the Escrow Platform! This document provides guidelines and information for contributors.

## Table of Contents
1. [Getting Started](#getting-started)
2. [Development Setup](#development-setup)
3. [Coding Standards](#coding-standards)
4. [Testing Guidelines](#testing-guidelines)
5. [Pull Request Process](#pull-request-process)
6. [Code Review Guidelines](#code-review-guidelines)
7. [Release Process](#release-process)

## Getting Started

### Prerequisites
- Node.js 18+ and npm/pnpm
- Git
- Docker (optional)
- Solidity development environment
- Firebase CLI (for backend development)

### Fork and Clone
1. Fork the repository on GitHub
2. Clone your fork locally:
   ```bash
   git clone https://github.com/your-username/escrow-platform.git
   cd escrow-platform
   ```
3. Add the upstream remote:
   ```bash
   git remote add upstream https://github.com/original-org/escrow-platform.git
   ```

### Issue Tracking
- Check existing issues before creating new ones
- Use appropriate issue templates
- Provide detailed reproduction steps
- Include relevant logs and screenshots

## Development Setup

### Environment Setup
1. Copy environment template:
   ```bash
   cp env.example .env
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Setup Firebase (for backend):
   ```bash
   cd apps/backend
   firebase login
   firebase init
   ```

4. Setup Hardhat (for contracts):
   ```bash
   cd apps/contracts
   npm install
   npx hardhat compile
   ```

### Development Scripts
```bash
# Start all services
pnpm dev

# Start specific service
pnpm dev:frontend
pnpm dev:backend
pnpm dev:contracts

# Run tests
pnpm test
pnpm test:watch
pnpm test:coverage

# Run linting
pnpm lint
pnpm lint:fix

# Run type checking
pnpm type-check
```

### Database Setup
1. Start Firebase emulator:
   ```bash
   firebase emulators:start
   ```

2. Import test data:
   ```bash
   firebase emulators:export ./test-data
   ```

## Coding Standards

### General Principles
- **Readability:** Code should be self-documenting
- **Maintainability:** Follow DRY and SOLID principles
- **Performance:** Optimize for user experience
- **Security:** Follow security best practices
- **Accessibility:** Ensure WCAG 2.2 AA compliance

### TypeScript/JavaScript
```typescript
// Use TypeScript for all new code
interface User {
  id: string;
  email: string;
  role: UserRole;
  createdAt: Date;
}

// Prefer const over let, avoid var
const user: User = {
  id: 'user-123',
  email: 'user@example.com',
  role: UserRole.BUYER,
  createdAt: new Date()
};

// Use async/await over Promises
async function fetchUser(id: string): Promise<User> {
  const response = await fetch(`/api/users/${id}`);
  return response.json();
}

// Use proper error handling
try {
  const user = await fetchUser('user-123');
} catch (error) {
  console.error('Failed to fetch user:', error);
  throw new Error('User not found');
}
```

### React Components
```typescript
// Use functional components with hooks
import React, { useState, useEffect } from 'react';

interface UserCardProps {
  user: User;
  onEdit: (user: User) => void;
}

export const UserCard: React.FC<UserCardProps> = ({ user, onEdit }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleEdit = async () => {
    setIsLoading(true);
    try {
      await onEdit(user);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="user-card">
      <h3>{user.email}</h3>
      <button 
        onClick={handleEdit}
        disabled={isLoading}
        data-testid="edit-user-button"
      >
        {isLoading ? 'Editing...' : 'Edit'}
      </button>
    </div>
  );
};
```

### Solidity Smart Contracts
```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

contract Escrow is AccessControl, ReentrancyGuard, Pausable {
    // Events
    event DealCreated(uint256 indexed dealId, address indexed buyer, address indexed seller);
    event DealFunded(uint256 indexed dealId, uint256 amount);
    
    // State variables
    mapping(uint256 => Deal) public deals;
    uint256 public dealCounter;
    
    // Structs
    struct Deal {
        address buyer;
        address seller;
        uint256 amount;
        DealStatus status;
        uint256 createdAt;
    }
    
    // Enums
    enum DealStatus { Created, Funded, Approved, Released, Disputed }
    
    // Constructor
    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }
    
    // Functions
    function createDeal(
        address seller,
        uint256 amount
    ) external whenNotPaused returns (uint256 dealId) {
        require(seller != address(0), "Invalid seller address");
        require(amount > 0, "Amount must be greater than 0");
        
        dealId = dealCounter++;
        deals[dealId] = Deal({
            buyer: msg.sender,
            seller: seller,
            amount: amount,
            status: DealStatus.Created,
            createdAt: block.timestamp
        });
        
        emit DealCreated(dealId, msg.sender, seller);
    }
}
```

### CSS/Styling
```scss
// Use CSS modules or styled-components
// Prefer CSS Grid and Flexbox over floats
// Use CSS custom properties for theming

.user-card {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  padding: var(--spacing-lg);
  border-radius: var(--border-radius);
  background-color: var(--color-background);
  border: 1px solid var(--color-border);
  
  &__title {
    font-size: var(--font-size-lg);
    font-weight: var(--font-weight-bold);
    color: var(--color-text-primary);
  }
  
  &__button {
    align-self: flex-start;
    padding: var(--spacing-sm) var(--spacing-md);
    border-radius: var(--border-radius-sm);
    background-color: var(--color-primary);
    color: var(--color-white);
    border: none;
    cursor: pointer;
    
    &:hover {
      background-color: var(--color-primary-dark);
    }
    
    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  }
}
```

## Testing Guidelines

### Test Structure
```
tests/
├── unit/           # Unit tests
├── integration/    # Integration tests
├── e2e/           # End-to-end tests
└── fixtures/      # Test data
```

### Unit Tests
```typescript
// Use descriptive test names
describe('UserService', () => {
  describe('createUser', () => {
    it('should create a new user with valid data', async () => {
      const userData = {
        email: 'test@example.com',
        role: UserRole.BUYER
      };
      
      const user = await userService.createUser(userData);
      
      expect(user).toMatchObject(userData);
      expect(user.id).toBeDefined();
      expect(user.createdAt).toBeInstanceOf(Date);
    });
    
    it('should throw error for invalid email', async () => {
      const userData = {
        email: 'invalid-email',
        role: UserRole.BUYER
      };
      
      await expect(userService.createUser(userData))
        .rejects
        .toThrow('Invalid email format');
    });
  });
});
```

### Integration Tests
```typescript
// Test API endpoints
describe('User API', () => {
  it('should create user via API', async () => {
    const response = await request(app)
      .post('/api/users')
      .send({
        email: 'test@example.com',
        role: 'buyer'
      })
      .expect(201);
    
    expect(response.body).toHaveProperty('id');
    expect(response.body.email).toBe('test@example.com');
  });
});
```

### E2E Tests
```typescript
// Use Playwright for E2E tests
test('user can create escrow deal', async ({ page }) => {
  await page.goto('/');
  await page.click('[data-testid="login-button"]');
  await page.fill('[data-testid="email-input"]', 'test@example.com');
  await page.click('[data-testid="login-submit"]');
  
  await page.click('[data-testid="create-deal-button"]');
  await page.fill('[data-testid="deal-title"]', 'Test Deal');
  await page.fill('[data-testid="deal-amount"]', '1000');
  await page.click('[data-testid="submit-deal"]');
  
  await expect(page.locator('[data-testid="deal-created"]')).toBeVisible();
});
```

### Smart Contract Tests
```solidity
// Use Foundry for contract tests
contract EscrowTest is Test {
    Escrow public escrow;
    address public buyer = address(1);
    address public seller = address(2);
    
    function setUp() public {
        escrow = new Escrow();
        vm.label(buyer, "Buyer");
        vm.label(seller, "Seller");
    }
    
    function testCreateDeal() public {
        vm.startPrank(buyer);
        
        uint256 dealId = escrow.createDeal(seller, 1000);
        
        (address dealBuyer, address dealSeller, uint256 amount, , ) = escrow.deals(dealId);
        
        assertEq(dealBuyer, buyer);
        assertEq(dealSeller, seller);
        assertEq(amount, 1000);
        
        vm.stopPrank();
    }
}
```

## Pull Request Process

### Before Submitting
1. **Update your fork:**
   ```bash
   git fetch upstream
   git checkout main
   git merge upstream/main
   ```

2. **Create feature branch:**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make your changes:**
   - Follow coding standards
   - Write tests for new functionality
   - Update documentation

4. **Run tests:**
   ```bash
   pnpm test
   pnpm lint
   pnpm type-check
   ```

5. **Commit your changes:**
   ```bash
   git add .
   git commit -m "feat: add user authentication feature

   - Add phone OTP authentication
   - Implement email verification
   - Add wallet connection support
   - Update API documentation"
   ```

### Commit Message Format
Use conventional commits format:
```
type(scope): description

[optional body]

[optional footer]
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Test changes
- `chore`: Build/tooling changes

### Pull Request Template
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] E2E tests pass
- [ ] Manual testing completed

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No breaking changes
- [ ] Tests added/updated

## Screenshots (if applicable)
```

## Code Review Guidelines

### Review Process
1. **Automated checks must pass:**
   - CI/CD pipeline
   - Code coverage thresholds
   - Security scans

2. **Manual review required:**
   - At least one approval from maintainers
   - Security review for sensitive changes
   - Performance review for major changes

### Review Checklist
- [ ] Code follows standards
- [ ] Tests are comprehensive
- [ ] Documentation is updated
- [ ] No security vulnerabilities
- [ ] Performance impact considered
- [ ] Accessibility maintained

### Review Comments
- Be constructive and specific
- Suggest improvements
- Ask questions when unclear
- Use code suggestions when possible

## Release Process

### Version Management
- Use semantic versioning (MAJOR.MINOR.PATCH)
- Update version in all package.json files
- Create release notes

### Release Steps
1. **Prepare release:**
   ```bash
   git checkout main
   git pull upstream main
   pnpm version patch  # or minor/major
   ```

2. **Create release branch:**
   ```bash
   git checkout -b release/v1.0.0
   ```

3. **Update changelog:**
   - Add release notes
   - Update version numbers
   - Document breaking changes

4. **Deploy:**
   ```bash
   pnpm run deploy:staging
   pnpm run test:e2e:staging
   pnpm run deploy:production
   ```

5. **Create release:**
   - Tag the release
   - Create GitHub release
   - Update documentation

### Hotfix Process
1. Create hotfix branch from main
2. Fix the issue
3. Add tests
4. Deploy to staging
5. Deploy to production
6. Merge back to main

## Community Guidelines

### Communication
- Be respectful and inclusive
- Use clear, professional language
- Provide constructive feedback
- Help other contributors

### Recognition
- Contributors are recognized in README
- Significant contributions get special mention
- Regular contributors may become maintainers

### Support
- Help new contributors
- Answer questions in issues
- Review pull requests
- Maintain documentation

---

**Need Help?**
- [Documentation](https://docs.escrowplatform.com)
- [Discussions](https://github.com/org/escrow-platform/discussions)
- [Issues](https://github.com/org/escrow-platform/issues)

**Last Updated:** $(date)
**Version:** 1.0.0 