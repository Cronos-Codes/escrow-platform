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

// Mock profile data for development
const mockProfileData = {
  name: 'John Doe',
  email: 'john.doe@example.com',
  phone: '+1 (555) 123-4567',
  bio: 'Gold Escrow Platform User',
  location: 'United States',
  company: 'Individual Trader',
  language: 'English',
  timezone: 'UTC',
  displayName: 'John Doe',
};

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
      // Get profile data
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // In production, fetch from Firestore/database
      // const profileData = await getProfileData(userId);
      
      return res.status(200).json(createResponse(true, mockProfileData));
    } else if (req.method === 'PUT') {
      // Update profile data
      const profileData = req.body;
      
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // In production, update Firestore/database
      // await updateProfileData(userId, profileData);
      
      return res.status(200).json(createResponse(true, { ...mockProfileData, ...profileData }));
    } else {
      return res.status(405).json(createResponse(false, undefined, 'Method not allowed'));
    }
  } catch (error) {
    console.error('Profile API error:', error);
    return res.status(500).json(
      createResponse(false, undefined, error instanceof Error ? error.message : 'Internal server error')
    );
  }
}

