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
  if (req.method !== 'GET') {
    return res.status(405).json(createResponse(false, undefined, 'Method not allowed'));
  }

  const userId = req.query.userId as string;

  if (process.env.NODE_ENV === 'production' && !userId) {
    return res.status(401).json(createResponse(false, undefined, 'User not authenticated'));
  }

  try {
    await new Promise(resolve => setTimeout(resolve, 200));

    // Mock activity stats
    const stats = {
      totalEscrows: 15,
      completedEscrows: 12,
      totalVolume: 1250000,
      disputesResolved: 2,
      successRate: 95,
    };

    // In production, fetch from Firestore/database
    // const stats = await getActivityStats(userId);

    return res.status(200).json(createResponse(true, stats));
  } catch (error) {
    console.error('Profile stats API error:', error);
    return res.status(500).json(
      createResponse(false, undefined, error instanceof Error ? error.message : 'Internal server error')
    );
  }
}

