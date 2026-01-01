import type { NextApiRequest, NextApiResponse } from 'next';

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}

interface ChangeRequest {
  id: string;
  userId: string;
  type: 'email' | 'phone';
  currentValue: string;
  newValue: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  requestedAt: number;
  reviewedBy?: string;
  reviewedAt?: number;
  verificationCodes?: {
    current: string;
    new: string;
    verified: {
      current: boolean;
      new: boolean;
    };
  };
}

const createResponse = <T>(success: boolean, data?: T, error?: string): ApiResponse<T> => ({
  success,
  data,
  error,
  timestamp: new Date().toISOString(),
});

// Mock data - in production, fetch from Firestore/database
const mockChangeRequests: ChangeRequest[] = [];

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  // This endpoint is for admin/support to view and manage change requests
  const { method } = req;
  const adminUserId = req.headers['x-admin-user-id'] as string;
  const isAdmin = adminUserId && process.env.NODE_ENV === 'production' ? true : true; // For development, allow access

  if (!isAdmin) {
    return res.status(403).json(createResponse(false, undefined, 'Unauthorized - Admin access required'));
  }

  try {
    if (method === 'GET') {
      // Get all pending change requests
      const status = req.query.status as string || 'pending';
      
      // In production, fetch from Firestore: 
      // const requests = await getChangeRequests(status);
      
      const filteredRequests = mockChangeRequests.filter(req => 
        status === 'all' ? true : req.status === status
      );

      return res.status(200).json(createResponse(true, {
        requests: filteredRequests,
        total: filteredRequests.length,
      }));

    } else if (method === 'PUT') {
      // Approve or reject a change request
      const { requestId, action, adminUserId: reviewerId } = req.body;

      if (!requestId || !action || !reviewerId) {
        return res.status(400).json(createResponse(false, undefined, 'Missing required fields'));
      }

      if (action !== 'approve' && action !== 'reject') {
        return res.status(400).json(createResponse(false, undefined, 'Invalid action. Must be "approve" or "reject"'));
      }

      // In production:
      // 1. Find the change request in Firestore
      // 2. Update status to approved/rejected
      // 3. If approved, update user's email/phone
      // 4. Send notification to user
      // 5. Create audit log

      const request = mockChangeRequests.find(r => r.id === requestId);
      if (!request) {
        return res.status(404).json(createResponse(false, undefined, 'Change request not found'));
      }

      request.status = action === 'approve' ? 'approved' : 'rejected';
      request.reviewedBy = reviewerId;
      request.reviewedAt = Date.now();

      // In production, update Firestore and user profile
      if (action === 'approve') {
        // Update user's email/phone in Firestore
        // await updateUserProfile(request.userId, { [request.type]: request.newValue });
      }

      return res.status(200).json(createResponse(true, {
        requestId,
        status: request.status,
        message: `Change request ${action}d successfully`,
      }));

    } else {
      return res.status(405).json(createResponse(false, undefined, 'Method not allowed'));
    }
  } catch (error) {
    console.error('Change requests API error:', error);
    return res.status(500).json(
      createResponse(false, undefined, error instanceof Error ? error.message : 'Internal server error')
    );
  }
}



