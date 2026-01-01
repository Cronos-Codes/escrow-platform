import type { NextApiRequest, NextApiResponse } from 'next';

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}

interface ChangeRequest {
  userId: string;
  type: 'email' | 'phone';
  currentValue: string;
  newValue: string;
  reason: string;
  status?: 'pending' | 'approved' | 'rejected';
  requestedAt?: number;
  reviewedBy?: string;
  reviewedAt?: number;
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
  if (req.method !== 'POST') {
    return res.status(405).json(createResponse(false, undefined, 'Method not allowed'));
  }

  const userId = req.body?.userId;
  const type = req.body?.type;
  const currentValue = req.body?.currentValue;
  const newValue = req.body?.newValue;
  const reason = req.body?.reason;

  if (!userId || !type || !currentValue || !newValue || !reason) {
    return res.status(400).json(createResponse(false, undefined, 'Missing required fields'));
  }

  if (type !== 'email' && type !== 'phone') {
    return res.status(400).json(createResponse(false, undefined, 'Invalid change type. Must be "email" or "phone"'));
  }

  // Validate email format
  if (type === 'email') {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newValue)) {
      return res.status(400).json(createResponse(false, undefined, 'Invalid email format'));
    }
  }

  // Validate phone format (basic validation)
  if (type === 'phone') {
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    const cleanedPhone = newValue.replace(/[\s\-\(\)]/g, '');
    if (!phoneRegex.test(cleanedPhone)) {
      return res.status(400).json(createResponse(false, undefined, 'Invalid phone format. Please include country code'));
    }
  }

  try {
    const changeRequest: ChangeRequest = {
      userId,
      type,
      currentValue,
      newValue,
      reason,
      status: 'pending',
      requestedAt: Date.now(),
    };

    // In production, this would:
    // 1. Save the change request to Firestore/database
    // 2. Send notification to admin/support team
    // 3. Send verification codes to both current and new contact methods
    // 4. Log the request for audit purposes

    // Mock implementation - simulate saving to database
    await new Promise(resolve => setTimeout(resolve, 500));

    // Simulate notification to admin/support
    console.log('Change Request Created:', {
      userId,
      type,
      currentValue,
      newValue,
      reason,
      timestamp: new Date().toISOString(),
    });

    // In production, you would:
    // - Save to Firestore collection 'changeRequests'
    // - Send notification to admin dashboard
    // - Send email/SMS notifications
    // - Create audit log entry

    return res.status(200).json(createResponse(true, {
      requestId: `REQ-${Date.now()}`,
      message: 'Change request submitted successfully. You will receive verification codes shortly.',
      status: 'pending',
    }));

  } catch (error) {
    console.error('Change request API error:', error);
    return res.status(500).json(
      createResponse(false, undefined, error instanceof Error ? error.message : 'Internal server error')
    );
  }
}



