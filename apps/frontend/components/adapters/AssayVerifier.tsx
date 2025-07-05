import React, { useState, useEffect } from 'react';
import { Assay, METAL_PURITY_THRESHOLDS } from '@escrow/schemas';

interface AssayVerifierProps {
  onVerify?: (batchId: string) => Promise<boolean>;
  onRevoke?: (batchId: string, reason: string) => Promise<void>;
  isAdmin?: boolean;
}

interface AssayData {
  batchId: string;
  metalType: string;
  purity: number;
  weight: number;
  assayer: string;
  certificateUri: string;
  origin: string;
  timestamp: string;
  verified: boolean;
  purityThreshold: number;
  meetsThreshold: boolean;
}

export const AssayVerifier: React.FC<AssayVerifierProps> = ({
  onVerify,
  onRevoke,
  isAdmin = false,
}) => {
  const [batchId, setBatchId] = useState('');
  const [assayData, setAssayData] = useState<AssayData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [revokeReason, setRevokeReason] = useState('');
  const [showRevokeModal, setShowRevokeModal] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  useEffect(() => {
    // Load batch ID suggestions from Firestore
    loadBatchSuggestions();
  }, []);

  const loadBatchSuggestions = async () => {
    try {
      // In production, fetch from Firestore
      const mockSuggestions = ['BATCH001', 'BATCH002', 'BATCH003'];
      setSuggestions(mockSuggestions);
    } catch (error) {
      console.error('Failed to load batch suggestions:', error);
    }
  };

  const handleVerify = async () => {
    if (!batchId || !onVerify) return;

    try {
      setLoading(true);
      setError(null);
      const success = await onVerify(batchId);
      if (success) {
        await fetchAssayData(batchId);
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const fetchAssayData = async (id: string) => {
    try {
      // In production, fetch from Firestore or API
      const mockData: AssayData = {
        batchId: id,
        metalType: 'gold',
        purity: 99.95,
        weight: 1000,
        assayer: 'Certified Assayer Inc.',
        certificateUri: 'https://example.com/certificate.pdf',
        origin: 'South Africa',
        timestamp: new Date().toISOString(),
        verified: true,
        purityThreshold: METAL_PURITY_THRESHOLDS.gold,
        meetsThreshold: true,
      };
      setAssayData(mockData);
    } catch (error) {
      setError('Failed to fetch assay data');
    }
  };

  const handleRevoke = async () => {
    if (!batchId || !revokeReason || !onRevoke) return;

    try {
      setLoading(true);
      setError(null);
      await onRevoke(batchId, revokeReason);
      setShowRevokeModal(false);
      setRevokeReason('');
      await fetchAssayData(batchId);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Revocation failed');
    } finally {
      setLoading(false);
    }
  };

  const getPurityGrade = (purity: number): string => {
    if (purity >= 99.99) return 'Ultra High Purity';
    if (purity >= 99.9) return 'High Purity';
    if (purity >= 99.5) return 'Standard Purity';
    if (purity >= 99.0) return 'Commercial Purity';
    return 'Low Purity';
  };

  const getStatusColor = (verified: boolean, meetsThreshold: boolean) => {
    if (!verified) return 'bg-yellow-100 text-yellow-800';
    if (meetsThreshold) return 'bg-green-100 text-green-800';
    return 'bg-red-100 text-red-800';
  };

  const getStatusText = (verified: boolean, meetsThreshold: boolean) => {
    if (!verified) return 'Pending Verification';
    if (meetsThreshold) return 'Verified';
    return 'Failed Verification';
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
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Assay Verification</h3>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Batch ID
        </label>
        <div className="relative">
          <input
            type="text"
            value={batchId}
            onChange={(e) => setBatchId(e.target.value)}
            placeholder="Enter batch ID"
            list="batch-suggestions"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <datalist id="batch-suggestions">
            {suggestions.map((suggestion) => (
              <option key={suggestion} value={suggestion} />
            ))}
          </datalist>
        </div>
      </div>

      <div className="mb-6">
        <button
          onClick={handleVerify}
          disabled={loading || !batchId}
          className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Verifying...' : 'Verify Assay'}
        </button>
      </div>

      {assayData && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h4 className="text-md font-medium text-gray-900">Assay Results</h4>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(assayData.verified, assayData.meetsThreshold)}`}>
              {getStatusText(assayData.verified, assayData.meetsThreshold)}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Metal Type:</span>
              <p className="font-medium capitalize">{assayData.metalType}</p>
            </div>
            <div>
              <span className="text-gray-500">Purity:</span>
              <p className="font-medium">{assayData.purity}%</p>
            </div>
            <div>
              <span className="text-gray-500">Weight:</span>
              <p className="font-medium">{assayData.weight.toLocaleString()} g</p>
            </div>
            <div>
              <span className="text-gray-500">Purity Grade:</span>
              <p className="font-medium">{getPurityGrade(assayData.purity)}</p>
            </div>
            <div>
              <span className="text-gray-500">Assayer:</span>
              <p className="font-medium">{assayData.assayer}</p>
            </div>
            <div>
              <span className="text-gray-500">Origin:</span>
              <p className="font-medium">{assayData.origin}</p>
            </div>
            <div>
              <span className="text-gray-500">Threshold:</span>
              <p className="font-medium">{assayData.purityThreshold}%</p>
            </div>
            <div>
              <span className="text-gray-500">Meets Threshold:</span>
              <p className={`font-medium ${assayData.meetsThreshold ? 'text-green-600' : 'text-red-600'}`}>
                {assayData.meetsThreshold ? 'Yes' : 'No'}
              </p>
            </div>
          </div>

          <div>
            <span className="text-gray-500 text-sm">Certificate:</span>
            <a
              href={assayData.certificateUri}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-blue-600 hover:text-blue-800 text-sm mt-1"
            >
              View Certificate
            </a>
          </div>

          {isAdmin && onRevoke && (
            <div>
              <button
                onClick={() => setShowRevokeModal(true)}
                className="w-full bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
              >
                Revoke Batch
              </button>
            </div>
          )}
        </div>
      )}

      {/* Revoke Modal */}
      {showRevokeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Revoke Batch</h3>
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