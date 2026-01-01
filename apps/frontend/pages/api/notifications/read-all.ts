import type { NextApiRequest, NextApiResponse } from 'next';

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}

const createResponse = <T>(success: boolean, data?: T, error?: string): ApiResponse<T> => ({
  success,
  data,
  error,
  timestamp: new Date().toISOString(),
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  if (req.method !== 'PUT') {
    return res.status(405).json(createResponse(false, undefined, 'Method not allowed'));
  }

  const userId = req.body?.userId;

  if (process.env.NODE_ENV === 'production' && !userId) {
    return res.status(401).json(createResponse(false, undefined, 'User not authenticated'));
  }

  try {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // In production, update all notifications in Firestore
    // await markAllNotificationsAsRead(userId);
    
    return res.status(200).json(createResponse(true, { message: 'All notifications marked as read' }));
  } catch (error) {
    console.error('Mark all read API error:', error);
    return res.status(500).json(
      createResponse(false, undefined, error instanceof Error ? error.message : 'Internal server error')
    );
  }
}

