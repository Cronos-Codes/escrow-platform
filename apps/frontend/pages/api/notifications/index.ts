import type { NextApiRequest, NextApiResponse } from 'next';

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}

interface Notification {
  id: string;
  type: 'success' | 'warning' | 'info' | 'error';
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
  link?: string;
}

const createResponse = <T>(success: boolean, data?: T, error?: string): ApiResponse<T> => ({
  success,
  data,
  error,
  timestamp: new Date().toISOString(),
});

// Generate mock notifications
function generateMockNotifications(): Notification[] {
  const now = Date.now();
  return [
    {
      id: '1',
      type: 'success',
      title: 'Escrow Completed',
      message: 'Escrow #ESC-2024-002 has been successfully completed. Funds have been released.',
      timestamp: now - 7200000,
      read: false,
      link: '/user-dashboard/escrows',
    },
    {
      id: '2',
      type: 'info',
      title: 'Payment Received',
      message: 'You received $5,000.00 in your wallet from Escrow #ESC-2024-001',
      timestamp: now - 3600000,
      read: false,
      link: '/user-dashboard/wallet',
    },
    {
      id: '3',
      type: 'warning',
      title: 'Escrow Pending Action',
      message: 'Escrow #ESC-2024-005 is awaiting your approval. Please review and take action.',
      timestamp: now - 1800000,
      read: true,
      link: '/user-dashboard/escrows',
    },
    {
      id: '4',
      type: 'info',
      title: 'KYC Verification Updated',
      message: 'Your KYC verification status has been updated to Premium level.',
      timestamp: now - 86400000,
      read: true,
      link: '/user-dashboard/profile',
    },
    {
      id: '5',
      type: 'success',
      title: 'Dispute Resolved',
      message: 'Dispute #DSP-2024-001 has been resolved in your favor.',
      timestamp: now - 172800000,
      read: true,
      link: '/user-dashboard/disputes',
    },
    {
      id: '6',
      type: 'error',
      title: 'Transaction Failed',
      message: 'Transaction #TXN-2024-123 failed due to insufficient funds. Please check your wallet.',
      timestamp: now - 259200000,
      read: false,
      link: '/user-dashboard/wallet',
    },
    {
      id: '7',
      type: 'info',
      title: 'New Escrow Created',
      message: 'A new escrow #ESC-2024-006 has been created with you as the buyer.',
      timestamp: now - 345600000,
      read: true,
      link: '/user-dashboard/escrows',
    },
    {
      id: '8',
      type: 'warning',
      title: 'Security Alert',
      message: 'New login detected from a new device. If this wasn\'t you, please secure your account.',
      timestamp: now - 432000000,
      read: false,
      link: '/user-dashboard/settings',
    },
  ];
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  const userId = req.query.userId as string || req.body?.userId;

  if (process.env.NODE_ENV === 'production' && !userId) {
    return res.status(401).json(createResponse(false, undefined, 'User not authenticated'));
  }

  try {
    if (req.method === 'GET') {
      // Get notifications
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // In production, fetch from Firestore
      // const notifications = await getNotifications(userId);
      
      const notifications = generateMockNotifications();
      return res.status(200).json(createResponse(true, notifications));
    } else if (req.method === 'PUT') {
      // Update notification (mark as read/unread)
      const { notificationId, read } = req.body;
      
      if (!notificationId) {
        return res.status(400).json(createResponse(false, undefined, 'Notification ID is required'));
      }

      await new Promise(resolve => setTimeout(resolve, 200));
      
      // In production, update Firestore
      // await updateNotification(userId, notificationId, { read });
      
      return res.status(200).json(createResponse(true, { notificationId, read }));
    } else if (req.method === 'DELETE') {
      // Delete notification
      const { notificationId } = req.body;
      
      if (!notificationId) {
        return res.status(400).json(createResponse(false, undefined, 'Notification ID is required'));
      }

      await new Promise(resolve => setTimeout(resolve, 200));
      
      // In production, delete from Firestore
      // await deleteNotification(userId, notificationId);
      
      return res.status(200).json(createResponse(true, { notificationId }));
    } else {
      return res.status(405).json(createResponse(false, undefined, 'Method not allowed'));
    }
  } catch (error) {
    console.error('Notifications API error:', error);
    return res.status(500).json(
      createResponse(false, undefined, error instanceof Error ? error.message : 'Internal server error')
    );
  }
}

