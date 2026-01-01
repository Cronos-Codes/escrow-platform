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

    // Mock escrow data - in production, this would come from your database
    const mockEscrows = [
      {
        id: 'escrow-1',
        amount: 500000,
        status: 'locked',
        buyerLocation: { lat: 40.7128, lng: -74.0060 },
        sellerLocation: { lat: 51.5074, lng: -0.1278 },
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        aiControlled: true,
        blockchainHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
        buyerName: 'GoldCorp Inc',
        sellerName: 'London Metals Exchange',
      },
      {
        id: 'escrow-2',
        amount: 750000,
        status: 'released',
        buyerLocation: { lat: 35.6762, lng: 139.6503 },
        sellerLocation: { lat: 22.3193, lng: 114.1694 },
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        aiControlled: true,
        blockchainHash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
        buyerName: 'Tokyo Trading Co',
        sellerName: 'Hong Kong Gold Ltd',
      },
      {
        id: 'escrow-3',
        amount: 300000,
        status: 'disputed',
        buyerLocation: { lat: 25.2048, lng: 55.2708 },
        sellerLocation: { lat: 19.0760, lng: 72.8777 },
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        aiControlled: false,
        blockchainHash: '0x7890abcdef1234567890abcdef1234567890abcdef1234567890abcdef123456',
        buyerName: 'Dubai Investments',
        sellerName: 'Mumbai Metals',
      },
      {
        id: 'escrow-4',
        amount: 1200000,
        status: 'pending',
        buyerLocation: { lat: -33.8688, lng: 151.2093 },
        sellerLocation: { lat: 55.7558, lng: 37.6176 },
        createdAt: new Date(Date.now() - 30 * 60 * 60 * 1000),
        aiControlled: true,
        blockchainHash: '0x4567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234',
        buyerName: 'Sydney Gold Traders',
        sellerName: 'Moscow Precious Metals',
      },
      {
        id: 'escrow-5',
        amount: 900000,
        status: 'locked',
        buyerLocation: { lat: 40.7128, lng: -74.0060 },
        sellerLocation: { lat: 35.6762, lng: 139.6503 },
        createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
        aiControlled: true,
        blockchainHash: '0xdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abc',
        buyerName: 'New York Bullion',
        sellerName: 'Tokyo Gold Exchange',
      },
    ];

    // Filter escrows based on user role
    let filteredEscrows = mockEscrows;
    
    if (session.user?.role === 'user') {
      // Users see only their own escrows (simulated by showing a subset)
      filteredEscrows = mockEscrows.slice(0, 2);
    } else if (session.user?.role === 'broker') {
      // Brokers see assigned escrows
      filteredEscrows = mockEscrows.slice(0, 3);
    } else if (session.user?.role === 'admin' || session.user?.role === 'staff') {
      // Admins see all escrows
      filteredEscrows = mockEscrows;
    }

    res.status(200).json({
      escrows: filteredEscrows,
      total: filteredEscrows.length,
      userRole: session.user?.role,
    });
  } catch (error) {
    console.error('Error fetching escrows:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
