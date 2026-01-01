import type { NextApiRequest, NextApiResponse } from 'next';

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}

interface ActivityItem {
  id: string;
  type: 'escrow' | 'transaction' | 'dispute' | 'profile' | 'security' | 'system';
  title: string;
  description: string;
  timestamp: number;
  status?: 'completed' | 'pending' | 'failed' | 'active';
  amount?: number;
  icon?: string;
}

const createResponse = <T>(success: boolean, data?: T, error?: string): ApiResponse<T> => ({
  success,
  data,
  error,
  timestamp: new Date().toISOString(),
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<ActivityItem[]>>
) {
  if (req.method !== 'GET') {
    return res.status(405).json(createResponse(false, undefined, 'Method not allowed'));
  }

  const userId = req.query.userId as string;
  const limit = parseInt(req.query.limit as string) || 50;

  if (process.env.NODE_ENV === 'production' && !userId) {
    return res.status(401).json(createResponse(false, undefined, 'User not authenticated'));
  }

  try {
    await new Promise(resolve => setTimeout(resolve, 300));

    // Mock activity data - In production, fetch from Firestore/database
    const mockActivities: ActivityItem[] = [
      {
        id: '1',
        type: 'escrow',
        title: 'Escrow Completed',
        description: 'Escrow #ESC-2024-015 has been successfully completed',
        timestamp: Date.now() - 2 * 60 * 60 * 1000, // 2 hours ago
        status: 'completed',
        amount: 50000,
      },
      {
        id: '2',
        type: 'transaction',
        title: 'Payment Received',
        description: 'Received $5,000.00 in your wallet from Escrow #ESC-2024-015',
        timestamp: Date.now() - 2 * 60 * 60 * 1000 + 60000, // 2 hours ago + 1 min
        status: 'completed',
        amount: 5000,
      },
      {
        id: '3',
        type: 'escrow',
        title: 'Escrow Created',
        description: 'Created new escrow #ESC-2024-016 for $25,000',
        timestamp: Date.now() - 5 * 60 * 60 * 1000, // 5 hours ago
        status: 'active',
        amount: 25000,
      },
      {
        id: '4',
        type: 'dispute',
        title: 'Dispute Resolved',
        description: 'Dispute #DSP-2024-003 has been resolved in your favor',
        timestamp: Date.now() - 24 * 60 * 60 * 1000, // 1 day ago
        status: 'completed',
      },
      {
        id: '5',
        type: 'profile',
        title: 'Profile Updated',
        description: 'Updated your professional summary',
        timestamp: Date.now() - 2 * 24 * 60 * 60 * 1000, // 2 days ago
        status: 'completed',
      },
      {
        id: '6',
        type: 'security',
        title: 'Email Verification',
        description: 'Your email address has been verified',
        timestamp: Date.now() - 3 * 24 * 60 * 60 * 1000, // 3 days ago
        status: 'completed',
      },
      {
        id: '7',
        type: 'escrow',
        title: 'Escrow Milestone Completed',
        description: 'Milestone 2 of 3 completed for Escrow #ESC-2024-014',
        timestamp: Date.now() - 4 * 24 * 60 * 60 * 1000, // 4 days ago
        status: 'completed',
        amount: 15000,
      },
      {
        id: '8',
        type: 'transaction',
        title: 'Withdrawal Processed',
        description: 'Withdrawal of $10,000.00 has been processed',
        timestamp: Date.now() - 5 * 24 * 60 * 60 * 1000, // 5 days ago
        status: 'completed',
        amount: 10000,
      },
      {
        id: '9',
        type: 'escrow',
        title: 'Escrow Cancelled',
        description: 'Escrow #ESC-2024-012 has been cancelled',
        timestamp: Date.now() - 7 * 24 * 60 * 60 * 1000, // 7 days ago
        status: 'failed',
        amount: 8000,
      },
      {
        id: '10',
        type: 'system',
        title: 'KYC Verification Approved',
        description: 'Your KYC verification has been approved',
        timestamp: Date.now() - 10 * 24 * 60 * 60 * 1000, // 10 days ago
        status: 'completed',
      },
    ];

    // In production, fetch from Firestore/database
    // const activities = await getUserActivity(userId, limit);

    return res.status(200).json(createResponse(true, mockActivities.slice(0, limit)));
  } catch (error) {
    console.error('Profile activity API error:', error);
    return res.status(500).json(
      createResponse(false, undefined, error instanceof Error ? error.message : 'Internal server error')
    );
  }
}



