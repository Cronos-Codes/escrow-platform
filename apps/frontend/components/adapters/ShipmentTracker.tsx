import React, { useState, useEffect } from 'react';
// import { Shipment, ShipmentStatus } from '@escrow/schemas';

// Temporary local types until schemas package is properly linked
type ShipmentStatus = 'pending' | 'picked_up' | 'in_transit' | 'customs_clearance' | 'delivered' | 'cancelled' | 'delayed';

type Shipment = {
  id: string;
  trackingNumber: string;
  status: ShipmentStatus;
  origin: string;
  destination: string;
  estimatedDelivery: string;
  actualDelivery?: string;
  carrier: string;
  weight: number;
  value: number;
};

interface ShipmentTrackerProps {
  onTrack?: (shipmentId: string) => Promise<ShipmentStatus>;
  onVerifyDelivery?: (shipmentId: string, signedProofHash: string) => Promise<boolean>;
  onRevoke?: (shipmentId: string, reason: string) => Promise<void>;
  isAdmin?: boolean;
}

interface ShipmentData {
  shipmentId: string;
  status: ShipmentStatus;
  origin: string;
  destination: string;
  quantity: number;
  batchType: string;
  carrier: string;
  expectedDelivery: string;
  lastUpdated: string;
  trackingUrl: string;
  verified: boolean;
  events: Array<{
    type: string;
    timestamp: string;
    location: string;
    description: string;
  }>;
}

export const ShipmentTracker: React.FC<ShipmentTrackerProps> = ({
  onTrack,
  onVerifyDelivery,
  onRevoke,
  isAdmin = false,
}) => {
  const [shipmentId, setShipmentId] = useState('');
  const [shipmentData, setShipmentData] = useState<ShipmentData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [signedProofHash, setSignedProofHash] = useState('');
  const [revokeReason, setRevokeReason] = useState('');
  const [showRevokeModal, setShowRevokeModal] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  useEffect(() => {
    // Load shipment ID suggestions from Firestore
    loadShipmentSuggestions();
  }, []);

  const loadShipmentSuggestions = async () => {
    try {
      // In production, fetch from Firestore
      const mockSuggestions = ['SHIP001', 'SHIP002', 'SHIP003'];
      setSuggestions(mockSuggestions);
    } catch (error) {
      console.error('Failed to load shipment suggestions:', error);
    }
  };

  const handleTrack = async () => {
    if (!shipmentId || !onTrack) return;

    try {
      setLoading(true);
      setError(null);
      const status = await onTrack(shipmentId);
      await fetchShipmentData(shipmentId);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Tracking failed');
    } finally {
      setLoading(false);
    }
  };

  const fetchShipmentData = async (id: string) => {
    try {
      // In production, fetch from Firestore or API
      const mockData: ShipmentData = {
        shipmentId: id,
        status: 'in_transit',
        origin: 'Houston, TX',
        destination: 'Rotterdam, Netherlands',
        quantity: 50000,
        batchType: 'crude_oil',
        carrier: 'Global Shipping Co.',
        expectedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        lastUpdated: new Date().toISOString(),
        trackingUrl: 'https://tracking.example.com/ship001',
        verified: false,
        events: [
          {
            type: 'picked_up',
            timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            location: 'Houston, TX',
            description: 'Shipment picked up from origin',
          },
          {
            type: 'in_transit',
            timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
            location: 'Atlantic Ocean',
            description: 'Shipment in transit',
          },
        ],
      };
      setShipmentData(mockData);
    } catch (error) {
      setError('Failed to fetch shipment data');
    }
  };

  const handleVerifyDelivery = async () => {
    if (!shipmentId || !signedProofHash || !onVerifyDelivery) return;

    try {
      setLoading(true);
      setError(null);
      const success = await onVerifyDelivery(shipmentId, signedProofHash);
      if (success) {
        await fetchShipmentData(shipmentId);
        setSignedProofHash('');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Delivery verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRevoke = async () => {
    if (!shipmentId || !revokeReason || !onRevoke) return;

    try {
      setLoading(true);
      setError(null);
      await onRevoke(shipmentId, revokeReason);
      setShowRevokeModal(false);
      setRevokeReason('');
      await fetchShipmentData(shipmentId);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Revocation failed');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: ShipmentStatus) => {
    const statusColors = {
      pending: 'bg-gray-100 text-gray-800',
      picked_up: 'bg-blue-100 text-blue-800',
      in_transit: 'bg-yellow-100 text-yellow-800',
      customs_clearance: 'bg-orange-100 text-orange-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      delayed: 'bg-red-100 text-red-800',
    };
    return statusColors[status] || statusColors.pending;
  };

  const getStatusText = (status: ShipmentStatus) => {
    const statusTexts = {
      pending: 'Pending',
      picked_up: 'Picked Up',
      in_transit: 'In Transit',
      customs_clearance: 'Customs Clearance',
      delivered: 'Delivered',
      cancelled: 'Cancelled',
      delayed: 'Delayed',
    };
    return statusTexts[status] || 'Unknown';
  };

  const getBatchTypeText = (batchType: string) => {
    const batchTypeTexts = {
      crude_oil: 'Crude Oil',
      refined_oil: 'Refined Oil',
      natural_gas: 'Natural Gas',
      lng: 'LNG',
      lpg: 'LPG',
    };
    return batchTypeTexts[batchType as keyof typeof batchTypeTexts] || batchType;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Shipment Tracker</h3>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Shipment ID
        </label>
        <div className="relative">
          <input
            type="text"
            value={shipmentId}
            onChange={(e) => setShipmentId(e.target.value)}
            placeholder="Enter shipment ID or scan QR code"
            list="shipment-suggestions"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <datalist id="shipment-suggestions">
            {suggestions.map((suggestion) => (
              <option key={suggestion} value={suggestion} />
            ))}
          </datalist>
        </div>
      </div>

      <div className="mb-6">
        <button
          onClick={handleTrack}
          disabled={loading || !shipmentId}
          className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Tracking...' : 'Track Shipment'}
        </button>
      </div>

      {shipmentData && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h4 className="text-md font-medium text-gray-900">Shipment Details</h4>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(shipmentData.status)}`}>
              {getStatusText(shipmentData.status)}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Origin:</span>
              <p className="font-medium">{shipmentData.origin}</p>
            </div>
            <div>
              <span className="text-gray-500">Destination:</span>
              <p className="font-medium">{shipmentData.destination}</p>
            </div>
            <div>
              <span className="text-gray-500">Quantity:</span>
              <p className="font-medium">{shipmentData.quantity.toLocaleString()} barrels</p>
            </div>
            <div>
              <span className="text-gray-500">Batch Type:</span>
              <p className="font-medium">{getBatchTypeText(shipmentData.batchType)}</p>
            </div>
            <div>
              <span className="text-gray-500">Carrier:</span>
              <p className="font-medium">{shipmentData.carrier}</p>
            </div>
            <div>
              <span className="text-gray-500">Expected Delivery:</span>
              <p className="font-medium">{new Date(shipmentData.expectedDelivery).toLocaleDateString()}</p>
            </div>
          </div>

          {/* Timeline View */}
          <div>
            <h5 className="text-sm font-medium text-gray-900 mb-3">Shipment Timeline</h5>
            <div className="space-y-3">
              {shipmentData.events.map((event, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{event.description}</p>
                    <p className="text-xs text-gray-500">{event.location}</p>
                    <p className="text-xs text-gray-400">{new Date(event.timestamp).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Map Placeholder */}
          <div className="bg-gray-100 rounded-lg p-4 h-48 flex items-center justify-center">
            <div className="text-center">
              <svg className="w-12 h-12 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <p className="text-sm text-gray-500">Map integration coming soon</p>
              <p className="text-xs text-gray-400">Route: {shipmentData.origin} → {shipmentData.destination}</p>
            </div>
          </div>

          {/* Tracking Link */}
          <div>
            <span className="text-gray-500 text-sm">Tracking:</span>
            <a
              href={shipmentData.trackingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-blue-600 hover:text-blue-800 text-sm mt-1"
            >
              View Detailed Tracking
            </a>
          </div>

          {/* Delivery Verification */}
          {shipmentData.status === 'delivered' && !shipmentData.verified && onVerifyDelivery && (
            <div className="space-y-2">
              <input
                type="text"
                placeholder="Enter signed delivery proof hash"
                value={signedProofHash}
                onChange={(e) => setSignedProofHash(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <button
                onClick={handleVerifyDelivery}
                disabled={loading || !signedProofHash}
                className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50"
              >
                {loading ? 'Verifying...' : 'Verify Delivery'}
              </button>
            </div>
          )}

          {isAdmin && onRevoke && (
            <div>
              <button
                onClick={() => setShowRevokeModal(true)}
                className="w-full bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
              >
                Revoke Shipment
              </button>
            </div>
          )}
        </div>
      )}

      {/* Revoke Modal */}
      {showRevokeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Revoke Shipment</h3>
            <textarea
              placeholder="Enter revocation reason"
              value={revokeReason}
              onChange={(e) => setRevokeReason(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 mb-4"
              rows={3}
            />
            <div className="flex space-x-2">
              <button
                onClick={() => setShowRevokeModal(false)}
                className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleRevoke}
                disabled={loading || !revokeReason}
                className="flex-1 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 disabled:opacity-50"
              >
                {loading ? 'Revoking...' : 'Revoke'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 