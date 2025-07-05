import React from 'react';
import { Shield, CheckCircle, XCircle, AlertTriangle, Star, User, Clock } from 'lucide-react';

interface TrustScore {
  score: number;
  level: 'low' | 'medium' | 'high' | 'excellent';
  factors: string[];
  lastUpdated: Date;
}

interface KycStatus {
  status: 'verified' | 'pending' | 'rejected' | 'unverified';
  verifiedAt?: Date;
  documents: string[];
}

interface BlacklistStatus {
  isBlacklisted: boolean;
  reason?: string;
  blacklistedAt?: Date;
  expiresAt?: Date;
}

interface TrustSignalsProps {
  userId: string;
  trustScore: TrustScore;
  kycStatus: KycStatus;
  blacklistStatus: BlacklistStatus;
  disputeHistory: {
    total: number;
    resolved: number;
    escalated: number;
    averageResolutionTime: number;
  };
}

export const TrustSignals: React.FC<TrustSignalsProps> = ({
  userId,
  trustScore,
  kycStatus,
  blacklistStatus,
  disputeHistory
}) => {
  const getTrustLevelColor = (level: string) => {
    switch (level) {
      case 'excellent': return 'text-green-600 bg-green-50 border-green-200';
      case 'high': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getKycStatusColor = (status: string) => {
    switch (status) {
      case 'verified': return 'text-green-600 bg-green-50 border-green-200';
      case 'pending': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'rejected': return 'text-red-600 bg-red-50 border-red-200';
      case 'unverified': return 'text-gray-600 bg-gray-50 border-gray-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getKycIcon = (status: string) => {
    switch (status) {
      case 'verified': return <CheckCircle className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'rejected': return <XCircle className="w-4 h-4" />;
      case 'unverified': return <User className="w-4 h-4" />;
      default: return <User className="w-4 h-4" />;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Trust Signals</h3>
        <div className="flex items-center space-x-2">
          <Shield className="w-5 h-5 text-blue-500" />
          <span className="text-sm text-gray-500">User ID: {userId}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Trust Score */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium text-gray-900">Trust Score</h4>
            <Star className="w-4 h-4 text-yellow-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">
            {trustScore.score}/100
          </div>
          <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getTrustLevelColor(trustScore.level)}`}>
            {trustScore.level}
          </div>
          <div className="mt-3">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${trustScore.score}%` }}
              />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Updated {trustScore.lastUpdated.toLocaleDateString()}
          </p>
        </div>

        {/* KYC Status */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium text-gray-900">KYC Status</h4>
            {getKycIcon(kycStatus.status)}
          </div>
          <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getKycStatusColor(kycStatus.status)}`}>
            {kycStatus.status}
          </div>
          {kycStatus.verifiedAt && (
            <p className="text-xs text-gray-500 mt-2">
              Verified {kycStatus.verifiedAt.toLocaleDateString()}
            </p>
          )}
          {kycStatus.documents.length > 0 && (
            <div className="mt-2">
              <p className="text-xs text-gray-600 mb-1">Documents:</p>
              <div className="space-y-1">
                {kycStatus.documents.map((doc, index) => (
                  <div key={index} className="text-xs text-gray-500 flex items-center">
                    <CheckCircle className="w-3 h-3 text-green-500 mr-1" />
                    {doc}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Blacklist Status */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium text-gray-900">Blacklist Status</h4>
            {blacklistStatus.isBlacklisted ? (
              <XCircle className="w-4 h-4 text-red-500" />
            ) : (
              <CheckCircle className="w-4 h-4 text-green-500" />
            )}
          </div>
          <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
            blacklistStatus.isBlacklisted 
              ? 'text-red-600 bg-red-50 border-red-200' 
              : 'text-green-600 bg-green-50 border-green-200'
          }`}>
            {blacklistStatus.isBlacklisted ? 'Blacklisted' : 'Clean'}
          </div>
          {blacklistStatus.isBlacklisted && (
            <div className="mt-2">
              {blacklistStatus.reason && (
                <p className="text-xs text-red-600 mb-1">
                  Reason: {blacklistStatus.reason}
                </p>
              )}
              {blacklistStatus.blacklistedAt && (
                <p className="text-xs text-gray-500">
                  Since {blacklistStatus.blacklistedAt.toLocaleDateString()}
                </p>
              )}
              {blacklistStatus.expiresAt && (
                <p className="text-xs text-gray-500">
                  Expires {blacklistStatus.expiresAt.toLocaleDateString()}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Dispute History */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium text-gray-900">Dispute History</h4>
            <AlertTriangle className="w-4 h-4 text-orange-500" />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Total Disputes:</span>
              <span className="font-medium">{disputeHistory.total}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Resolved:</span>
              <span className="font-medium text-green-600">{disputeHistory.resolved}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Escalated:</span>
              <span className="font-medium text-orange-600">{disputeHistory.escalated}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Avg Resolution:</span>
              <span className="font-medium">{disputeHistory.averageResolutionTime} days</span>
            </div>
          </div>
        </div>
      </div>

      {/* Trust Factors */}
      {trustScore.factors.length > 0 && (
        <div className="mt-6">
          <h4 className="font-medium text-gray-900 mb-3">Trust Factors</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {trustScore.factors.map((factor, index) => (
              <div key={index} className="flex items-center space-x-2 text-sm">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-gray-700">{factor}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Warning for Blacklisted Users */}
      {blacklistStatus.isBlacklisted && (
        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <h4 className="font-medium text-red-900">User Blacklisted</h4>
          </div>
          <p className="text-sm text-red-700 mt-1">
            This user has been blacklisted and may not be eligible for certain actions.
            {blacklistStatus.reason && ` Reason: ${blacklistStatus.reason}`}
          </p>
        </div>
      )}
    </div>
  );
}; 