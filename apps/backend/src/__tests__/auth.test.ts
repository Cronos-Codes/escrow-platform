import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import { loginPhone, verifyPhoneOtp, loginEmail, verifyEmailOtp, walletLogin } from '../auth';
import { rateLimiter } from '../utils/rateLimiter';
import { logger } from '../utils/logger';

jest.mock('firebase-admin');
jest.mock('firebase-admin/auth');
jest.mock('../utils/rateLimiter');
jest.mock('../utils/logger');

describe('Authentication Functions', () => {
  let mockAuthInstance: any;
  const mockContext = { auth: undefined } as functions.https.CallableContext;

  beforeEach(() => {
    jest.clearAllMocks();
    mockAuthInstance = {
      createCustomToken: jest.fn(),
      createUser: jest.fn(),
      getUserByPhoneNumber: jest.fn(),
      getUserByEmail: jest.fn(),
      getUser: jest.fn(),
      setCustomUserClaims: jest.fn(),
    };
    (admin.auth as jest.Mock).mockReturnValue(mockAuthInstance);
    (rateLimiter.isRateLimited as jest.Mock).mockResolvedValue(false);
    (logger.logAuthEvent as jest.Mock).mockResolvedValue(undefined);
  });

  describe('loginPhone', () => {
    const validPhoneNumber = '+1234567890';

    it('should handle valid phone number input', async () => {
      const result = await loginPhone.run({ phoneNumber: validPhoneNumber }, mockContext);

      expect(result.success).toBe(true);
      expect(result.data?.message).toBe('OTP sent successfully');
      expect(logger.logAuthEvent).toHaveBeenCalledWith(
        'loginPhone',
        'success',
        expect.any(Object)
      );
    });

    it('should handle invalid phone number format', async () => {
      const result = await loginPhone.run({ phoneNumber: 'invalid' }, mockContext);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid phone number format');
      expect(logger.logAuthEvent).toHaveBeenCalledWith(
        'loginPhone',
        'error',
        expect.any(Object)
      );
    });

    it('should handle rate limiting', async () => {
      (rateLimiter.isRateLimited as jest.Mock).mockResolvedValue(true);

      const result = await loginPhone.run({ phoneNumber: validPhoneNumber }, mockContext);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Too many attempts. Please try again later.');
    });
  });

  describe('verifyPhoneOtp', () => {
    const validData = {
      phoneNumber: '+1234567890',
      otpCode: '123456'
    };

    beforeEach(() => {
      mockAuthInstance.createCustomToken.mockResolvedValue('mock-token');
      mockAuthInstance.getUserByPhoneNumber.mockResolvedValue({
        uid: 'test-uid',
        phoneNumber: validData.phoneNumber,
        displayName: 'Test User',
        metadata: { creationTime: new Date().toISOString() }
      } as admin.auth.UserRecord);
    });

    it('should verify valid OTP and create token', async () => {
      const result = await verifyPhoneOtp.run(validData, mockContext);

      expect(result.success).toBe(true);
      expect(result.data?.token).toBe('mock-token');
      expect(result.data?.user).toBeDefined();
      expect(rateLimiter.clearRateLimit).toHaveBeenCalled();
    });

    it('should handle invalid OTP format', async () => {
      const result = await verifyPhoneOtp.run(
        { ...validData, otpCode: '12345' },
        mockContext
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid OTP format');
    });

    it('should handle new user creation', async () => {
      mockAuthInstance.getUserByPhoneNumber.mockRejectedValue(new Error('User not found'));
      mockAuthInstance.createUser.mockResolvedValue({
        uid: 'new-user-uid',
        phoneNumber: validData.phoneNumber,
        displayName: expect.any(String),
        metadata: { creationTime: new Date().toISOString() }
      } as admin.auth.UserRecord);

      const result = await verifyPhoneOtp.run(validData, mockContext);

      expect(result.success).toBe(true);
      expect(mockAuthInstance.createUser).toHaveBeenCalled();
    });
  });

  describe('loginEmail', () => {
    const validEmail = 'test@example.com';

    it('should handle valid email input', async () => {
      const result = await loginEmail.run({ email: validEmail }, mockContext);

      expect(result.success).toBe(true);
      expect(result.data?.message).toBe('Email OTP sent successfully');
      expect(logger.logAuthEvent).toHaveBeenCalledWith(
        'loginEmail',
        'success',
        expect.any(Object)
      );
    });

    it('should handle invalid email format', async () => {
      const result = await loginEmail.run({ email: 'invalid-email' }, mockContext);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid email format');
    });

    it('should handle rate limiting', async () => {
      (rateLimiter.isRateLimited as jest.Mock).mockResolvedValue(true);

      const result = await loginEmail.run({ email: validEmail }, mockContext);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Too many attempts. Please try again later.');
    });
  });

  describe('verifyEmailOtp', () => {
    const validData = {
      email: 'test@example.com',
      otpCode: '123456'
    };

    beforeEach(() => {
      mockAuthInstance.createCustomToken.mockResolvedValue('mock-token');
      mockAuthInstance.getUserByEmail.mockResolvedValue({
        uid: 'test-uid',
        email: validData.email,
        displayName: 'Test User',
        metadata: { creationTime: new Date().toISOString() }
      } as admin.auth.UserRecord);
    });

    it('should verify valid OTP and create token', async () => {
      const result = await verifyEmailOtp.run(validData, mockContext);

      expect(result.success).toBe(true);
      expect(result.data?.token).toBe('mock-token');
      expect(result.data?.user).toBeDefined();
      expect(rateLimiter.clearRateLimit).toHaveBeenCalled();
    });

    it('should handle invalid OTP format', async () => {
      const result = await verifyEmailOtp.run(
        { ...validData, otpCode: '12345' },
        mockContext
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid OTP format');
    });

    it('should handle new user creation', async () => {
      mockAuthInstance.getUserByEmail.mockRejectedValue(new Error('User not found'));
      mockAuthInstance.createUser.mockResolvedValue({
        uid: 'new-user-uid',
        email: validData.email,
        displayName: expect.any(String),
        metadata: { creationTime: new Date().toISOString() }
      } as admin.auth.UserRecord);

      const result = await verifyEmailOtp.run(validData, mockContext);

      expect(result.success).toBe(true);
      expect(mockAuth.createUser).toHaveBeenCalled();
    });
  });

  describe('walletLogin', () => {
    const validData = {
      address: '0x1234567890abcdef1234567890abcdef12345678',
      signature: '0xvalid-signature'
    };

    beforeEach(() => {
      mockAuthInstance.createCustomToken.mockResolvedValue('mock-token');
      mockAuthInstance.getUser.mockResolvedValue({
        uid: `wallet_${validData.address.toLowerCase()}`,
        displayName: expect.any(String),
        metadata: { creationTime: new Date().toISOString() }
      } as admin.auth.UserRecord);
    });

    it('should authenticate valid wallet signature', async () => {
      const result = await walletLogin.run(validData, mockContext);

      expect(result.success).toBe(true);
      expect(result.data?.token).toBe('mock-token');
      expect(result.data?.user).toBeDefined();
      expect(rateLimiter.clearRateLimit).toHaveBeenCalled();
    });

    it('should handle invalid wallet address format', async () => {
      const result = await walletLogin.run(
        { ...validData, address: 'invalid-address' },
        mockContext
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid wallet address format');
    });

    it('should handle invalid signature', async () => {
      const result = await walletLogin.run(
        { ...validData, signature: '' },
        mockContext
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid signature');
    });

    it('should handle new wallet user creation', async () => {
      mockAuthInstance.getUser.mockRejectedValue(new Error('User not found'));
      mockAuthInstance.createUser.mockResolvedValue({
        uid: `wallet_${validData.address.toLowerCase()}`,
        displayName: expect.any(String),
        metadata: { creationTime: new Date().toISOString() }
      } as admin.auth.UserRecord);

      const result = await walletLogin.run(validData, mockContext);

      expect(result.success).toBe(true);
      expect(mockAuthInstance.createUser).toHaveBeenCalled();
    });

    it('should handle rate limiting', async () => {
      (rateLimiter.isRateLimited as jest.Mock).mockResolvedValue(true);

      const result = await walletLogin.run(validData, mockContext);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Too many attempts. Please try again later.');
    });
  });
});
