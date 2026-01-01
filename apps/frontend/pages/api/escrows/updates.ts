import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const session = await getServerSession(req, res, authOptions);

    if (!session) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // In a real implementation, this would check for actual updates
    // For now, we'll return empty updates to simulate no changes
    const updates: any[] = [];

    // Simulate occasional updates (10% chance)
    if (Math.random() < 0.1) {
      updates.push({
        id: 'escrow-1',
        status: 'released',
        updatedAt: new Date().toISOString(),
      });
    }

    res.status(200).json({
      updates,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching updates:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
