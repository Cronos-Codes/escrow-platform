# Authentication API Documentation

## Overview

The authentication system provides three methods of authentication:
1. Phone OTP authentication
2. Email OTP authentication
3. Wallet-based authentication

All endpoints follow a consistent response format and include rate limiting, structured logging, and proper error handling.

## Common Response Format

All API responses follow this structure:

```typescript
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}
```

## Rate Limiting

All authentication methods are protected by rate limiting:

- Phone OTP: 5 attempts per hour
- Email OTP: 5 attempts per hour
- Wallet Login: 10 attempts per hour

## Endpoints

### Phone Authentication

#### `loginPhone`

Initiates phone number authentication by sending an OTP.

**Request:**
```typescript
{
  phoneNumber: string; // E.164 format: +[country code][number]
}
```

**Response Success:**
```typescript
{
  success: true,
  data: {
    message: string;
    phoneNumber: string; // Partially masked
  },
  timestamp: string;
}
```

#### `verifyPhoneOtp`

Verifies the phone OTP and returns an authentication token.

**Request:**
```typescript
{
  phoneNumber: string; // E.164 format
  otpCode: string;    // 6-digit code
}
```

**Response Success:**
```typescript
{
  success: true,
  data: {
    token: string;
    user: {
      id: string;
      phoneNumber: string;
      displayName: string;
      role: string;
      kycStatus: string;
      createdAt: number;
      updatedAt: number;
    }
  },
  timestamp: string;
}
```

### Email Authentication

#### `loginEmail`

Initiates email authentication by sending an OTP.

**Request:**
```typescript
{
  email: string;
}
```

**Response Success:**
```typescript
{
  success: true,
  data: {
    message: string;
    email: string; // Partially masked
  },
  timestamp: string;
}
```

#### `verifyEmailOtp`

Verifies the email OTP and returns an authentication token.

**Request:**
```typescript
{
  email: string;
  otpCode: string; // 6-digit code
}
```

**Response Success:**
```typescript
{
  success: true,
  data: {
    token: string;
    user: {
      id: string;
      email: string;
      displayName: string;
      role: string;
      kycStatus: string;
      createdAt: number;
      updatedAt: number;
    }
  },
  timestamp: string;
}
```

### Wallet Authentication

#### `walletLogin`

Authenticates users using their Ethereum wallet.

**Request:**
```typescript
{
  address: string;  // Ethereum address (0x...)
  signature: string; // Signed message
}
```

**Response Success:**
```typescript
{
  success: true,
  data: {
    token: string;
    user: {
      id: string;
      address: string;
      displayName: string;
      role: string;
      kycStatus: string;
      createdAt: number;
      updatedAt: number;
    }
  },
  timestamp: string;
}
```

## Error Responses

All endpoints return a consistent error format:

```typescript
{
  success: false,
  error: string,
  timestamp: string;
}
```

Common error messages:
- "Invalid input format"
- "Too many attempts. Please try again later."
- "Invalid OTP format"
- "Failed to verify OTP"
- "Invalid signature"

## Security Features

1. Rate Limiting
   - Prevents brute force attacks
   - Configurable windows and attempt limits
   - Fails open if rate limiting service is unavailable

2. Data Privacy
   - Sensitive information is masked in logs
   - Phone numbers are partially redacted
   - Email addresses are partially redacted

3. Audit Logging
   - All authentication attempts are logged
   - Includes success/failure status
   - Tracks response times
   - Environment-aware logging

4. Error Handling
   - Consistent error format
   - Safe error messages (no sensitive info)
   - Proper exception handling

## User Management

- New users are automatically created on first successful authentication
- Users maintain separate IDs for different auth methods
- Custom claims are used to track:
  - Authentication method
  - Role information
  - KYC status

## Integration Notes

1. Environment Variables:
   - NODE_ENV: Controls development/production behavior
   - Firebase configuration required

2. Dependencies:
   - Firebase Admin SDK
   - Firestore for rate limiting and logging
   - Custom rate limiting implementation
   - Structured logging system

3. Testing:
   - Full test suite available
   - Mocked Firebase services
   - Rate limiting tests
   - Error case coverage
