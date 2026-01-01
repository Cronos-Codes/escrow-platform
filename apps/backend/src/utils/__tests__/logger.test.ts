import { StructuredLogger } from '../logger';
import { getFirestore } from 'firebase-admin/firestore';

jest.mock('firebase-admin/firestore', () => ({
  getFirestore: jest.fn(),
}));

describe('StructuredLogger', () => {
  let logger: StructuredLogger;
  let mockFirestore: any;
  let mockCollection: any;
  let mockDoc: any;
  let mockAdd: jest.Mock;

  beforeEach(() => {
    mockAdd = jest.fn().mockResolvedValue({ id: 'test-log-id' });
    mockCollection = {
      add: mockAdd,
    };
    mockFirestore = {
      collection: jest.fn().mockReturnValue(mockCollection),
    };
    (getFirestore as jest.Mock).mockReturnValue(mockFirestore);

    logger = new StructuredLogger();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('logAuthEvent', () => {
    const testEvent = {
      action: 'login',
      status: 'success',
      metadata: {
        userId: 'test-user',
        method: 'email',
      },
    };

    it('should log auth events with correct structure', async () => {
      await logger.logAuthEvent(
        testEvent.action,
        testEvent.status,
        testEvent.metadata
      );

      expect(mockFirestore.collection).toHaveBeenCalledWith('logs');
      expect(mockAdd).toHaveBeenCalledWith(expect.objectContaining({
        type: 'auth',
        action: testEvent.action,
        status: testEvent.status,
        metadata: testEvent.metadata,
        timestamp: expect.any(Number),
        environment: expect.any(String),
      }));
    });

    it('should handle logging errors gracefully', async () => {
      mockAdd.mockRejectedValue(new Error('Logging failed'));

      await expect(logger.logAuthEvent(
        testEvent.action,
        testEvent.status,
        testEvent.metadata
      )).rejects.toThrow('Logging failed');
    });

    it('should sanitize sensitive information', async () => {
      const sensitiveData = {
        action: 'login',
        status: 'success',
        metadata: {
          email: 'user@example.com',
          password: 'secret123',
          phoneNumber: '+1234567890',
        },
      };

      await logger.logAuthEvent(
        sensitiveData.action,
        sensitiveData.status,
        sensitiveData.metadata
      );

      expect(mockAdd).toHaveBeenCalledWith(expect.objectContaining({
        metadata: expect.objectContaining({
          email: expect.not.stringContaining('user@'),
          password: expect.not.stringContaining('secret123'),
          phoneNumber: expect.not.stringContaining('4567'),
        }),
      }));
    });
  });

  describe('environment handling', () => {
    let originalEnv: string | undefined;

    beforeEach(() => {
      originalEnv = process.env.NODE_ENV;
    });

    afterEach(() => {
      Object.defineProperty(process.env, 'NODE_ENV', {
        value: originalEnv,
      });
    });

    it('should set correct environment in production', () => {
      Object.defineProperty(process.env, 'NODE_ENV', {
        value: 'production',
      });
      const prodLogger = new StructuredLogger();

      return prodLogger.logAuthEvent('test', 'success', {}).then(() => {
        expect(mockAdd).toHaveBeenCalledWith(expect.objectContaining({
          environment: 'production',
        }));
      });
    });

    it('should set correct environment in development', () => {
      Object.defineProperty(process.env, 'NODE_ENV', {
        value: 'development',
      });
      const devLogger = new StructuredLogger();

      return devLogger.logAuthEvent('test', 'success', {}).then(() => {
        expect(mockAdd).toHaveBeenCalledWith(expect.objectContaining({
          environment: 'development',
        }));
      });
    });
  });
});
