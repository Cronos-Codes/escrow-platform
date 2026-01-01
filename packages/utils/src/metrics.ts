import { Counter, Histogram, Gauge, Registry, collectDefaultMetrics } from 'prom-client';

// Initialize Prometheus registry
const register = new Registry();

// Collect default Node.js metrics
collectDefaultMetrics({ register });

// Adapter-specific metrics
export const adapterMetrics = {
  // Real Estate Adapter
  realEstateTokenizations: new Counter({
    name: 'real_estate_tokenizations_total',
    help: 'Total number of real estate tokenizations',
    labelNames: ['status', 'property_type'],
    registers: [register],
  }),

  realEstateVerifications: new Counter({
    name: 'real_estate_verifications_total',
    help: 'Total number of real estate verifications',
    labelNames: ['status', 'verifier'],
    registers: [register],
  }),

  realEstateRevocations: new Counter({
    name: 'real_estate_revocations_total',
    help: 'Total number of real estate revocations',
    labelNames: ['reason', 'revoked_by'],
    registers: [register],
  }),

  realEstateTokenizationDuration: new Histogram({
    name: 'real_estate_tokenization_duration_seconds',
    help: 'Duration of real estate tokenization operations',
    labelNames: ['property_type'],
    buckets: [0.1, 0.5, 1, 2, 5, 10, 30],
    registers: [register],
  }),

  // Precious Metals Adapter
  metalAssayVerifications: new Counter({
    name: 'metal_assay_verifications_total',
    help: 'Total number of metal assay verifications',
    labelNames: ['status', 'metal_type', 'assayer'],
    registers: [register],
  }),

  metalBatchRevocations: new Counter({
    name: 'metal_batch_revocations_total',
    help: 'Total number of metal batch revocations',
    labelNames: ['reason', 'metal_type', 'revoked_by'],
    registers: [register],
  }),

  metalAssayVerificationDuration: new Histogram({
    name: 'metal_assay_verification_duration_seconds',
    help: 'Duration of metal assay verification operations',
    labelNames: ['metal_type'],
    buckets: [0.1, 0.5, 1, 2, 5, 10, 30],
    registers: [register],
  }),

  // Oil & Gas Adapter
  shipmentStatusUpdates: new Counter({
    name: 'shipment_status_updates_total',
    help: 'Total number of shipment status updates',
    labelNames: ['status', 'carrier', 'batch_type'],
    registers: [register],
  }),

  shipmentDeliveries: new Counter({
    name: 'shipment_deliveries_total',
    help: 'Total number of shipment deliveries',
    labelNames: ['status', 'carrier', 'batch_type'],
    registers: [register],
  }),

  shipmentRevocations: new Counter({
    name: 'shipment_revocations_total',
    help: 'Total number of shipment revocations',
    labelNames: ['reason', 'carrier', 'revoked_by'],
    registers: [register],
  }),

  shipmentUpdateDuration: new Histogram({
    name: 'shipment_update_duration_seconds',
    help: 'Duration of shipment status update operations',
    labelNames: ['carrier'],
    buckets: [0.1, 0.5, 1, 2, 5, 10, 30],
    registers: [register],
  }),

  // Oracle Metrics
  oracleRequests: new Counter({
    name: 'oracle_requests_total',
    help: 'Total number of oracle requests',
    labelNames: ['oracle_type', 'status', 'endpoint'],
    registers: [register],
  }),

  oracleResponseTime: new Histogram({
    name: 'oracle_response_time_seconds',
    help: 'Oracle response time',
    labelNames: ['oracle_type', 'endpoint'],
    buckets: [0.1, 0.5, 1, 2, 5, 10, 30, 60],
    registers: [register],
  }),

  oracleFailures: new Counter({
    name: 'oracle_failures_total',
    help: 'Total number of oracle failures',
    labelNames: ['oracle_type', 'error_type', 'endpoint'],
    registers: [register],
  }),

  // General Adapter Metrics
  adapterErrors: new Counter({
    name: 'adapter_errors_total',
    help: 'Total number of adapter errors',
    labelNames: ['adapter_type', 'error_type', 'operation'],
    registers: [register],
  }),

  adapterLatency: new Histogram({
    name: 'adapter_latency_seconds',
    help: 'Adapter operation latency',
    labelNames: ['adapter_type', 'operation'],
    buckets: [0.1, 0.5, 1, 2, 5, 10, 30],
    registers: [register],
  }),

  adapterSuccessRate: new Gauge({
    name: 'adapter_success_rate',
    help: 'Adapter success rate percentage',
    labelNames: ['adapter_type', 'operation'],
    registers: [register],
  }),

  // Trust Metrics
  trustScores: new Gauge({
    name: 'adapter_trust_score',
    help: 'Trust score for each adapter',
    labelNames: ['adapter_type', 'data_source'],
    registers: [register],
  }),

  dataSourceReliability: new Gauge({
    name: 'data_source_reliability',
    help: 'Reliability score for data sources',
    labelNames: ['data_source', 'adapter_type'],
    registers: [register],
  }),

  // System Health Metrics
  activeConnections: new Gauge({
    name: 'active_connections',
    help: 'Number of active connections',
    labelNames: ['connection_type'],
    registers: [register],
  }),

  memoryUsage: new Gauge({
    name: 'memory_usage_bytes',
    help: 'Memory usage in bytes',
    labelNames: ['type'],
    registers: [register],
  }),

  cpuUsage: new Gauge({
    name: 'cpu_usage_percentage',
    help: 'CPU usage percentage',
    registers: [register],
  }),

  // Business Metrics
  totalDeals: new Counter({
    name: 'total_deals',
    help: 'Total number of deals processed',
    labelNames: ['status', 'adapter_type'],
    registers: [register],
  }),

  totalValue: new Counter({
    name: 'total_value_usd',
    help: 'Total value of deals in USD',
    labelNames: ['adapter_type', 'status'],
    registers: [register],
  }),

  averageDealSize: new Gauge({
    name: 'average_deal_size_usd',
    help: 'Average deal size in USD',
    labelNames: ['adapter_type'],
    registers: [register],
  }),
};

// Metrics tracking functions
export class MetricsTracker {
  private static instance: MetricsTracker;
  private startTimes: Map<string, number> = new Map();

  static getInstance(): MetricsTracker {
    if (!MetricsTracker.instance) {
      MetricsTracker.instance = new MetricsTracker();
    }
    return MetricsTracker.instance;
  }

  // Start timing an operation
  startTimer(operation: string, labels: Record<string, string> = {}): string {
    const timerId = `${operation}_${Date.now()}_${Math.random()}`;
    this.startTimes.set(timerId, Date.now());
    return timerId;
  }

  // End timing and record metrics
  endTimer(timerId: string, adapterType: string, operation: string, success: boolean = true): void {
    const startTime = this.startTimes.get(timerId);
    if (!startTime) return;

    const duration = (Date.now() - startTime) / 1000; // Convert to seconds
    this.startTimes.delete(timerId);

    // Record latency
    adapterMetrics.adapterLatency
      .labels(adapterType, operation)
      .observe(duration);

    // Record success/failure
    if (!success) {
      adapterMetrics.adapterErrors
        .labels(adapterType, 'operation_failed', operation)
        .inc();
    }
  }

  // Record real estate metrics
  recordRealEstateTokenization(status: 'success' | 'failed', propertyType: string, duration?: number): void {
    adapterMetrics.realEstateTokenizations
      .labels(status, propertyType)
      .inc();

    if (duration) {
      adapterMetrics.realEstateTokenizationDuration
        .labels(propertyType)
        .observe(duration);
    }
  }

  recordRealEstateVerification(status: 'success' | 'failed', verifier: string, duration?: number): void {
    adapterMetrics.realEstateVerifications
      .labels(status, verifier)
      .inc();
  }

  recordRealEstateRevocation(reason: string, revokedBy: string): void {
    adapterMetrics.realEstateRevocations
      .labels(reason, revokedBy)
      .inc();
  }

  // Record metal metrics
  recordMetalAssayVerification(status: 'success' | 'failed', metalType: string, assayer: string, duration?: number): void {
    adapterMetrics.metalAssayVerifications
      .labels(status, metalType, assayer)
      .inc();

    if (duration) {
      adapterMetrics.metalAssayVerificationDuration
        .labels(metalType)
        .observe(duration);
    }
  }

  recordMetalBatchRevocation(reason: string, metalType: string, revokedBy: string): void {
    adapterMetrics.metalBatchRevocations
      .labels(reason, metalType, revokedBy)
      .inc();
  }

  // Record shipment metrics
  recordShipmentStatusUpdate(status: string, carrier: string, batchType: string, duration?: number): void {
    adapterMetrics.shipmentStatusUpdates
      .labels(status, carrier, batchType)
      .inc();

    if (duration) {
      adapterMetrics.shipmentUpdateDuration
        .labels(carrier)
        .observe(duration);
    }
  }

  recordShipmentDelivery(status: 'success' | 'failed', carrier: string, batchType: string): void {
    adapterMetrics.shipmentDeliveries
      .labels(status, carrier, batchType)
      .inc();
  }

  recordShipmentRevocation(reason: string, carrier: string, revokedBy: string): void {
    adapterMetrics.shipmentRevocations
      .labels(reason, carrier, revokedBy)
      .inc();
  }

  // Record oracle metrics
  recordOracleRequest(oracleType: string, status: 'success' | 'failed', endpoint: string, duration?: number): void {
    adapterMetrics.oracleRequests
      .labels(oracleType, status, endpoint)
      .inc();

    if (duration) {
      adapterMetrics.oracleResponseTime
        .labels(oracleType, endpoint)
        .observe(duration);
    }

    if (status === 'failed') {
      adapterMetrics.oracleFailures
        .labels(oracleType, 'request_failed', endpoint)
        .inc();
    }
  }

  // Record trust metrics
  updateTrustScore(adapterType: string, dataSource: string, score: number): void {
    adapterMetrics.trustScores
      .labels(adapterType, dataSource)
      .set(score);
  }

  updateDataSourceReliability(dataSource: string, adapterType: string, reliability: number): void {
    adapterMetrics.dataSourceReliability
      .labels(dataSource, adapterType)
      .set(reliability);
  }

  // Record business metrics
  recordDeal(status: 'created' | 'completed' | 'cancelled', adapterType: string, value?: number): void {
    adapterMetrics.totalDeals
      .labels(status, adapterType)
      .inc();

    if (value) {
      adapterMetrics.totalValue
        .labels(adapterType, status)
        .inc(value);
    }
  }

  updateAverageDealSize(adapterType: string, averageSize: number): void {
    adapterMetrics.averageDealSize
      .labels(adapterType)
      .set(averageSize);
  }

  // System health metrics
  updateSystemHealth(connections: number, memoryUsage: number, cpuUsage: number): void {
    adapterMetrics.activeConnections
      .labels('total')
      .set(connections);

    adapterMetrics.memoryUsage
      .labels('heap')
      .set(memoryUsage);

    adapterMetrics.cpuUsage.set(cpuUsage);
  }

  // Calculate and update success rates
  updateSuccessRate(adapterType: string, operation: string, successCount: number, totalCount: number): void {
    if (totalCount > 0) {
      const successRate = (successCount / totalCount) * 100;
      adapterMetrics.adapterSuccessRate
        .labels(adapterType, operation)
        .set(successRate);
    }
  }

  // Get metrics for Prometheus scraping
  async getMetrics(): Promise<string> {
    return await register.metrics();
  }

  // Get metrics in JSON format for API endpoints
  async getMetricsJson(): Promise<any> {
    const metrics = await register.getMetricsAsJSON();
    return {
      timestamp: new Date().toISOString(),
      metrics,
    };
  }

  // Reset all metrics (useful for testing)
  resetMetrics(): void {
    register.clear();
  }
}

// Export singleton instance
export const metricsTracker = MetricsTracker.getInstance();

// Event emission for analytics
export const emitAnalyticsEvent = (eventName: string, data: any): void => {
  // Emit events for analytics tracking
  const events: Record<string, string> = {
    deed_tokenized: 'Real estate deed tokenization',
    assay_verified: 'Precious metals assay verification',
    shipment_updated: 'Oil & gas shipment status update',
    adapter_error: 'Adapter operation error',
  };

  if (events[eventName]) {
    console.log(`Analytics Event: ${events[eventName]}`, {
      event: eventName,
      timestamp: new Date().toISOString(),
      data,
    });
  }
};

// Trust score calculation
export const calculateTrustScore = (
  successRate: number,
  responseTime: number,
  dataQuality: number,
  verificationCount: number
): number => {
  // Weighted trust score calculation
  const weights = {
    successRate: 0.4,
    responseTime: 0.2,
    dataQuality: 0.3,
    verificationCount: 0.1,
  };

  const normalizedResponseTime = Math.max(0, 1 - (responseTime / 30)); // Normalize to 0-1
  const normalizedVerificationCount = Math.min(1, verificationCount / 100); // Cap at 100

  const trustScore = 
    (successRate * weights.successRate) +
    (normalizedResponseTime * weights.responseTime) +
    (dataQuality * weights.dataQuality) +
    (normalizedVerificationCount * weights.verificationCount);

  return Math.min(100, Math.max(0, trustScore * 100)); // Ensure 0-100 range
}; 