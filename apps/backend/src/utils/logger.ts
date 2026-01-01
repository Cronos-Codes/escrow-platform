import { getFirestore } from 'firebase-admin/firestore';

interface LogEntry {
  userId?: string;
  dealId?: string;
  role?: string;
  action: string;
  status: 'success' | 'error';
  timestamp: string;
  module: string;
  error?: {
    message: string;
    stack?: string;
  };
  metadata?: Record<string, any>;
}

export class StructuredLogger {
  private db: FirebaseFirestore.Firestore;
  private collection: string;

  constructor() {
    this.db = getFirestore();
    this.collection = 'systemLogs';
  }

  async log(entry: Omit<LogEntry, 'timestamp'>): Promise<void> {
    const logEntry: LogEntry = {
      ...entry,
      timestamp: new Date().toISOString(),
    };

    try {
      await this.db.collection(this.collection).add(logEntry);

      // Also log to console in development
      if (process.env.NODE_ENV !== 'production') {
        console.log(JSON.stringify(logEntry, null, 2));
      }
    } catch (error) {
      // Fail silently but log to console
      console.error('Logging failed:', error);
    }
  }

  async logAuthEvent(
    action: string,
    status: 'success' | 'error',
    metadata: {
      userId?: string;
      role?: string;
      error?: Error;
      [key: string]: any;
    }
  ): Promise<void> {
    await this.log({
      userId: metadata.userId,
      role: metadata.role,
      action,
      status,
      module: 'auth',
      ...(metadata.error && {
        error: {
          message: metadata.error.message,
          stack: metadata.error.stack,
        },
      }),
      metadata: {
        ...metadata,
        error: undefined, // Remove error from metadata as it's handled above
      },
    });
  }
}

export const logger = new StructuredLogger();
