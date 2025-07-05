import { getFirestore } from 'firebase-admin/firestore';
import { EscrowState, EscrowEvent } from '../../../packages/core/src/fsm';

const db = getFirestore();

export interface FSMLogEntry {
  dealId: string;
  actor: string;
  prevState: EscrowState;
  event: EscrowEvent;
  newState: EscrowState;
  timestamp: number;
  reason?: string;
  metadata?: Record<string, any>;
}

/**
 * Log an FSM event to Firestore for audit trail
 */
export async function logFSMEvent(entry: FSMLogEntry): Promise<void> {
  try {
    const logData = {
      ...entry,
      timestamp: entry.timestamp || Date.now(),
      createdAt: new Date(),
    };

    // Store in deals/{dealId}/fsmLogs subcollection
    await db
      .collection('deals')
      .doc(entry.dealId)
      .collection('fsmLogs')
      .add(logData);

    // Also store in global fsmLogs collection for analytics
    await db
      .collection('fsmLogs')
      .add({
        ...logData,
        dealId: entry.dealId, // Include dealId for querying
      });

    console.log(`FSM Event logged: ${entry.dealId} ${entry.prevState} -> ${entry.event} -> ${entry.newState}`);

  } catch (error) {
    console.error('Failed to log FSM event:', error);
    // Don't throw error to avoid breaking the main flow
    // FSM logging should be non-blocking
  }
}

/**
 * Get FSM logs for a specific deal
 */
export async function getDealFSMLogs(dealId: string, limit: number = 50): Promise<FSMLogEntry[]> {
  try {
    const snapshot = await db
      .collection('deals')
      .doc(dealId)
      .collection('fsmLogs')
      .orderBy('timestamp', 'desc')
      .limit(limit)
      .get();

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as FSMLogEntry & { id: string }));

  } catch (error) {
    console.error('Failed to get FSM logs:', error);
    throw error;
  }
}

/**
 * Get FSM logs across all deals (for admin/analytics)
 */
export async function getAllFSMLogs(
  filters: {
    dealId?: string;
    actor?: string;
    event?: EscrowEvent;
    state?: EscrowState;
    startDate?: number;
    endDate?: number;
  } = {},
  limit: number = 100
): Promise<FSMLogEntry[]> {
  try {
    let query = db.collection('fsmLogs').orderBy('timestamp', 'desc');

    // Apply filters
    if (filters.dealId) {
      query = query.where('dealId', '==', filters.dealId);
    }
    if (filters.actor) {
      query = query.where('actor', '==', filters.actor);
    }
    if (filters.event) {
      query = query.where('event', '==', filters.event);
    }
    if (filters.state) {
      query = query.where('newState', '==', filters.state);
    }
    if (filters.startDate) {
      query = query.where('timestamp', '>=', filters.startDate);
    }
    if (filters.endDate) {
      query = query.where('timestamp', '<=', filters.endDate);
    }

    const snapshot = await query.limit(limit).get();

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as FSMLogEntry & { id: string }));

  } catch (error) {
    console.error('Failed to get all FSM logs:', error);
    throw error;
  }
}

/**
 * Get FSM statistics for analytics
 */
export async function getFSMStats(
  startDate?: number,
  endDate?: number
): Promise<{
  totalEvents: number;
  eventsByType: Record<EscrowEvent, number>;
  statesByType: Record<EscrowState, number>;
  topActors: Array<{ actor: string; count: number }>;
  averageTransitionsPerDeal: number;
}> {
  try {
    let query = db.collection('fsmLogs');

    if (startDate) {
      query = query.where('timestamp', '>=', startDate);
    }
    if (endDate) {
      query = query.where('timestamp', '<=', endDate);
    }

    const snapshot = await query.get();
    const logs = snapshot.docs.map(doc => doc.data() as FSMLogEntry);

    // Calculate statistics
    const eventsByType: Record<EscrowEvent, number> = {
      [EscrowEvent.Create]: 0,
      [EscrowEvent.Fund]: 0,
      [EscrowEvent.Approve]: 0,
      [EscrowEvent.Release]: 0,
      [EscrowEvent.Dispute]: 0,
      [EscrowEvent.Cancel]: 0,
    };

    const statesByType: Record<EscrowState, number> = {
      [EscrowState.Created]: 0,
      [EscrowState.Funded]: 0,
      [EscrowState.Approved]: 0,
      [EscrowState.Released]: 0,
      [EscrowState.Disputed]: 0,
      [EscrowState.Cancelled]: 0,
    };

    const actorCounts: Record<string, number> = {};
    const uniqueDeals = new Set<string>();

    logs.forEach(log => {
      eventsByType[log.event]++;
      statesByType[log.newState]++;
      actorCounts[log.actor] = (actorCounts[log.actor] || 0) + 1;
      uniqueDeals.add(log.dealId);
    });

    // Get top actors
    const topActors = Object.entries(actorCounts)
      .map(([actor, count]) => ({ actor, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    const totalEvents = logs.length;
    const averageTransitionsPerDeal = uniqueDeals.size > 0 ? totalEvents / uniqueDeals.size : 0;

    return {
      totalEvents,
      eventsByType,
      statesByType,
      topActors,
      averageTransitionsPerDeal,
    };

  } catch (error) {
    console.error('Failed to get FSM stats:', error);
    throw error;
  }
}

/**
 * Export FSM logs for a specific time range (for compliance/audit)
 */
export async function exportFSMLogs(
  startDate: number,
  endDate: number,
  format: 'json' | 'csv' = 'json'
): Promise<string> {
  try {
    const logs = await getAllFSMLogs({ startDate, endDate }, 10000); // Large limit for export

    if (format === 'json') {
      return JSON.stringify(logs, null, 2);
    } else if (format === 'csv') {
      const headers = ['dealId', 'actor', 'prevState', 'event', 'newState', 'timestamp', 'reason'];
      const csvRows = [headers.join(',')];

      logs.forEach(log => {
        const row = [
          log.dealId,
          log.actor,
          log.prevState,
          log.event,
          log.newState,
          log.timestamp,
          log.reason || '',
        ].map(field => `"${field}"`).join(',');
        csvRows.push(row);
      });

      return csvRows.join('\n');
    }

    throw new Error('Unsupported export format');

  } catch (error) {
    console.error('Failed to export FSM logs:', error);
    throw error;
  }
}

/**
 * Clean up old FSM logs (for maintenance)
 */
export async function cleanupOldFSMLogs(olderThanDays: number = 365): Promise<number> {
  try {
    const cutoffDate = Date.now() - (olderThanDays * 24 * 60 * 60 * 1000);

    // Clean up global fsmLogs collection
    const globalSnapshot = await db
      .collection('fsmLogs')
      .where('timestamp', '<', cutoffDate)
      .get();

    const globalBatch = db.batch();
    globalSnapshot.docs.forEach(doc => {
      globalBatch.delete(doc.ref);
    });

    await globalBatch.commit();

    console.log(`Cleaned up ${globalSnapshot.docs.length} old FSM logs from global collection`);

    return globalSnapshot.docs.length;

  } catch (error) {
    console.error('Failed to cleanup old FSM logs:', error);
    throw error;
  }
} 