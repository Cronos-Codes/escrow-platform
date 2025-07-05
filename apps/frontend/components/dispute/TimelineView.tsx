import React from 'react';
import { CheckCircle, AlertTriangle, User, Users, Shield, Gavel, Clock, ArrowUpRight, XCircle, DollarSign } from 'lucide-react';

export interface TimelineEvent {
  id: string;
  type: 'filed' | 'triaged' | 'voted' | 'escalated' | 'admin_override' | 'resolved' | 'revoked' | 'fund_redirected' | 'trust_updated' | 'blacklisted';
  actor: string;
  role: string;
  timestamp: Date;
  details?: string;
  status?: string;
}

interface TimelineViewProps {
  events: TimelineEvent[];
}

const ICONS = {
  filed: <User className="w-5 h-5 text-blue-500" />,
  triaged: <Shield className="w-5 h-5 text-purple-500" />,
  voted: <Gavel className="w-5 h-5 text-green-500" />,
  escalated: <ArrowUpRight className="w-5 h-5 text-orange-500" />,
  admin_override: <AlertTriangle className="w-5 h-5 text-red-500" />,
  resolved: <CheckCircle className="w-5 h-5 text-green-600" />,
  revoked: <XCircle className="w-5 h-5 text-gray-500" />,
  fund_redirected: <DollarSign className="w-5 h-5 text-yellow-500" />,
  trust_updated: <Shield className="w-5 h-5 text-blue-400" />,
  blacklisted: <XCircle className="w-5 h-5 text-black" />,
};

const LABELS = {
  filed: 'Dispute Filed',
  triaged: 'Triage Completed',
  voted: 'Vote Cast',
  escalated: 'Escalated',
  admin_override: 'Admin Override',
  resolved: 'Resolved',
  revoked: 'Revoked',
  fund_redirected: 'Funds Redirected',
  trust_updated: 'Trust Score Updated',
  blacklisted: 'User Blacklisted',
};

export const TimelineView: React.FC<TimelineViewProps> = ({ events }) => {
  return (
    <div className="relative pl-8">
      <div className="absolute left-2 top-0 bottom-0 w-1 bg-gray-200 rounded" />
      <ul className="space-y-8">
        {events.map((event, idx) => (
          <li key={event.id} className="relative flex items-start">
            <span className="absolute -left-6 top-1.5">
              {ICONS[event.type] || <Clock className="w-5 h-5 text-gray-400" />}
            </span>
            <div className="flex-1 bg-white rounded-lg shadow p-4 border border-gray-100">
              <div className="flex items-center space-x-2 mb-1">
                <span className="font-semibold text-gray-900">{LABELS[event.type]}</span>
                <span className="text-xs text-gray-500">{event.role}</span>
                {event.status && (
                  <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                    {event.status}
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600 mb-1">
                <span>by {event.actor}</span>
                <span>• {event.timestamp.toLocaleString()}</span>
              </div>
              {event.details && (
                <div className="text-sm text-gray-700 mt-1">{event.details}</div>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}; 