import React, { useState, useEffect } from 'react';
import { Property } from '@escrow/schemas';

interface DeedTokenPanelProps {
  dealId: string;
  propertyData?: Property;
  onTokenize?: (dealId: string, propertyData: Property) => Promise<string>;
  onVerify?: (dealId: string, signedDocHash: string) => Promise<boolean>;
  onRevoke?: (tokenId: string, reason: string) => Promise<void>;
  isAdmin?: boolean;
}

interface TokenMetadata {
  tokenId: string;
  tokenUri: string;
  verified: boolean;
  mintedAt: string;
  owner: string;
}

export const DeedTokenPanel: React.FC<DeedTokenPanelProps> = ({
  dealId,
  propertyData,
  onTokenize,
  onVerify,
  onRevoke,
  isAdmin = false,
}) => {
  const [tokenMetadata, setTokenMetadata] = useState<TokenMetadata | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [signedDocHash, setSignedDocHash] = useState('');
  const [revokeReason, setRevokeReason] = useState('');
  const [showRevokeModal, setShowRevokeModal] = useState(false);

  useEffect(() => {
    if (dealId) {
      fetchTokenMetadata();
    }
  }, [dealId]);

  const fetchTokenMetadata = async () => {
    try {
      setLoading(true);
      // In production, fetch from blockchain or API
      const mockMetadata: TokenMetadata = {
        tokenId: '123',
        tokenUri: 'ipfs://QmExample',
        verified: false,
        mintedAt: new Date().toISOString(),
        owner: '0x1234567890123456789012345678901234567890',
      };
      setTokenMetadata(mockMetadata);
    } catch (error) {
      setError('Failed to fetch token metadata');
    } finally {
      setLoading(false);
    }
  };

  const handleTokenize = async () => {
    if (!propertyData || !onTokenize) return;

    try {
      setLoading(true);
      setError(null);
      const tokenId = await onTokenize(dealId, propertyData);
      await fetchTokenMetadata();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Tokenization failed');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!signedDocHash || !onVerify) return;

    try {
      setLoading(true);
      setError(null);
      const success = await onVerify(dealId, signedDocHash);
      if (success) {
        await fetchTokenMetadata();
        setSignedDocHash('');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRevoke = async () => {
    if (!tokenMetadata?.tokenId || !revokeReason || !onRevoke) return;

    try {
      setLoading(true);
      setError(null);
      await onRevoke(tokenMetadata.tokenId, revokeReason);
      setShowRevokeModal(false);
      setRevokeReason('');
      await fetchTokenMetadata();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Revocation failed');
    } finally {
      setLoading(false);
    }
  };

  const getValuationBand = (valuation: number): string => {
    if (valuation < 100000) return 'Under $100k';
    if (valuation < 500000) return '$100k - $500k';
    if (valuation < 1000000) return '$500k - $1M';
    if (valuation < 5000000) return '$1M - $5M';
    return 'Over $5M';
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
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Property Deed Token</h3>
        {tokenMetadata?.verified && (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Verified
          </span>
        )}
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {propertyData && (
        <div className="mb-6">
          <h4 className="text-md font-medium text-gray-900 mb-3">Property Details</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Location:</span>
              <p className="font-medium">{propertyData.location}</p>
            </div>
            <div>
              <span className="text-gray-500">Size:</span>
              <p className="font-medium">{propertyData.size.toLocaleString()} sq ft</p>
            </div>
            <div>
              <span className="text-gray-500">Valuation:</span>
              <p className="font-medium">${propertyData.valuation.toLocaleString()}</p>
            </div>
            <div>
              <span className="text-gray-500">Valuation Band:</span>
              <p className="font-medium">{getValuationBand(propertyData.valuation)}</p>
            </div>
            <div>
              <span className="text-gray-500">Zoning:</span>
              <p className="font-medium">{propertyData.zoning}</p>
            </div>
            <div>
              <span className="text-gray-500">Coordinates:</span>
              <p className="font-medium">{propertyData.coordinates.lat}, {propertyData.coordinates.lng}</p>
            </div>
          </div>
        </div>
      )}

      {tokenMetadata ? (
        <div className="mb-6">
          <h4 className="text-md font-medium text-gray-900 mb-3">Token Information</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Token ID:</span>
              <p className="font-mono text-xs">{tokenMetadata.tokenId}</p>
            </div>
            <div>
              <span className="text-gray-500">Owner:</span>
              <p className="font-mono text-xs">{tokenMetadata.owner}</p>
            </div>
            <div>
              <span className="text-gray-500">Minted:</span>
              <p className="font-medium">{new Date(tokenMetadata.mintedAt).toLocaleDateString()}</p>
            </div>
            <div>
              <span className="text-gray-500">Status:</span>
              <p className="font-medium">{tokenMetadata.verified ? 'Verified' : 'Pending Verification'}</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
          <p className="text-sm text-yellow-700">No token minted yet for this property.</p>
        </div>
      )}

      <div className="space-y-4">
        {!tokenMetadata && propertyData && onTokenize && (
          <button
            onClick={handleTokenize}
            disabled={loading}
            className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Tokenizing...' : 'Tokenize Property'}
          </button>
        )}

        {tokenMetadata && !tokenMetadata.verified && onVerify && (
          <div className="space-y-2">
            <input
              type="text"
              placeholder="Enter signed document hash"
              value={signedDocHash}
              onChange={(e) => setSignedDocHash(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleVerify}
              disabled={loading || !signedDocHash}
              className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? 'Verifying...' : 'Verify Property'}
            </button>
          </div>
        )}

        {isAdmin && tokenMetadata && onRevoke && (
          <div className="space-y-2">
            <button
              onClick={() => setShowRevokeModal(true)}
              className="w-full bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
            >
              Revoke Token
            </button>
          </div>
        )}
      </div>

      {/* Revoke Modal */}
      {showRevokeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Revoke Token</h3>
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