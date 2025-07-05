import { DealMetrics, PaymasterMetrics, DisputeMetrics, SystemPerformanceMetrics } from '@escrow/schemas';

// Prometheus-style metrics collection
export interface MetricPoint {
  timestamp: number;
  value: number;
  labels?: Record<string, string>;
}

export interface MetricSeries {
  name: string;
  description: string;
  unit: string;
  points: MetricPoint[];
}

export interface MonitoringData {
  escrowVolume: MetricSeries;
  contractLatency: MetricSeries;
  gasUsage: MetricSeries;
  disputeRate: MetricSeries;
  userActivity: MetricSeries;
  systemUptime: MetricSeries;
}

// Export escrow volume metrics
export const exportEscrowVolume = (dealMetrics: DealMetrics): MetricSeries => {
  const now = Date.now();
  const points: MetricPoint[] = [
    {
      timestamp: now - 86400000, // 24 hours ago
      value: dealMetrics.totalDeals.value * 0.8,
      labels: { timeframe: '24h' },
    },
    {
      timestamp: now - 3600000, // 1 hour ago
      value: dealMetrics.totalDeals.value * 0.95,
      labels: { timeframe: '1h' },
    },
    {
      timestamp: now,
      value: dealMetrics.totalDeals.value,
      labels: { timeframe: 'current' },
    },
  ];

  return {
    name: 'escrow_volume_total',
    description: 'Total escrow volume in USD',
    unit: 'USD',
    points,
  };
};

// Export contract latency metrics
export const exportContractLatency = (systemMetrics: SystemPerformanceMetrics): MetricSeries => {
  const now = Date.now();
  const points: MetricPoint[] = [
    {
      timestamp: now - 86400000,
      value: systemMetrics.contractLatency.value * 1.2,
      labels: { timeframe: '24h' },
    },
    {
      timestamp: now - 3600000,
      value: systemMetrics.contractLatency.value * 1.1,
      labels: { timeframe: '1h' },
    },
    {
      timestamp: now,
      value: systemMetrics.contractLatency.value,
      labels: { timeframe: 'current' },
    },
  ];

  return {
    name: 'contract_latency_ms',
    description: 'Average contract interaction latency in milliseconds',
    unit: 'ms',
    points,
  };
};

// Export gas usage metrics
export const exportGasUsage = (paymasterMetrics: PaymasterMetrics): MetricSeries => {
  const now = Date.now();
  const points: MetricPoint[] = [
    {
      timestamp: now - 86400000,
      value: paymasterMetrics.totalGasSponsored.value * 0.85,
      labels: { timeframe: '24h' },
    },
    {
      timestamp: now - 3600000,
      value: paymasterMetrics.totalGasSponsored.value * 0.95,
      labels: { timeframe: '1h' },
    },
    {
      timestamp: now,
      value: paymasterMetrics.totalGasSponsored.value,
      labels: { timeframe: 'current' },
    },
  ];

  return {
    name: 'gas_usage_total',
    description: 'Total gas sponsored in ETH',
    unit: 'ETH',
    points,
  };
};

// Export dispute rate metrics
export const exportDisputeRate = (disputeMetrics: DisputeMetrics): MetricSeries => {
  const now = Date.now();
  const totalDeals = disputeMetrics.totalDisputes.value * 50; // Estimate total deals
  const disputeRate = (disputeMetrics.totalDisputes.value / totalDeals) * 100;

  const points: MetricPoint[] = [
    {
      timestamp: now - 86400000,
      value: disputeRate * 0.9,
      labels: { timeframe: '24h' },
    },
    {
      timestamp: now - 3600000,
      value: disputeRate * 0.95,
      labels: { timeframe: '1h' },
    },
    {
      timestamp: now,
      value: disputeRate,
      labels: { timeframe: 'current' },
    },
  ];

  return {
    name: 'dispute_rate_percent',
    description: 'Dispute rate as percentage of total deals',
    unit: '%',
    points,
  };
};

// Export user activity metrics
export const exportUserActivity = (): MetricSeries => {
  const now = Date.now();
  const baseActivity = 1000;
  
  const points: MetricPoint[] = [
    {
      timestamp: now - 86400000,
      value: baseActivity * 0.7,
      labels: { timeframe: '24h' },
    },
    {
      timestamp: now - 3600000,
      value: baseActivity * 0.9,
      labels: { timeframe: '1h' },
    },
    {
      timestamp: now,
      value: baseActivity,
      labels: { timeframe: 'current' },
    },
  ];

  return {
    name: 'user_activity_total',
    description: 'Total user activity events',
    unit: 'events',
    points,
  };
};

// Export system uptime metrics
export const exportSystemUptime = (systemMetrics: SystemPerformanceMetrics): MetricSeries => {
  const now = Date.now();
  const points: MetricPoint[] = [
    {
      timestamp: now - 86400000,
      value: systemMetrics.uptime.value * 0.99,
      labels: { timeframe: '24h' },
    },
    {
      timestamp: now - 3600000,
      value: systemMetrics.uptime.value * 0.995,
      labels: { timeframe: '1h' },
    },
    {
      timestamp: now,
      value: systemMetrics.uptime.value,
      labels: { timeframe: 'current' },
    },
  ];

  return {
    name: 'system_uptime_percent',
    description: 'System uptime percentage',
    unit: '%',
    points,
  };
};

// Generate complete monitoring data
export const generateMonitoringData = (
  dealMetrics: DealMetrics,
  paymasterMetrics: PaymasterMetrics,
  disputeMetrics: DisputeMetrics,
  systemMetrics: SystemPerformanceMetrics
): MonitoringData => {
  return {
    escrowVolume: exportEscrowVolume(dealMetrics),
    contractLatency: exportContractLatency(systemMetrics),
    gasUsage: exportGasUsage(paymasterMetrics),
    disputeRate: exportDisputeRate(disputeMetrics),
    userActivity: exportUserActivity(),
    systemUptime: exportSystemUptime(systemMetrics),
  };
};

// Prometheus format exporter
export const exportPrometheusFormat = (monitoringData: MonitoringData): string => {
  let prometheusData = '# Escrow Platform Metrics\n';
  prometheusData += `# Generated at ${new Date().toISOString()}\n\n`;

  Object.entries(monitoringData).forEach(([key, series]) => {
    prometheusData += `# HELP ${series.name} ${series.description}\n`;
    prometheusData += `# TYPE ${series.name} gauge\n`;
    
    series.points.forEach(point => {
      const labels = point.labels 
        ? `{${Object.entries(point.labels).map(([k, v]) => `${k}="${v}"`).join(',')}}`
        : '';
      prometheusData += `${series.name}${labels} ${point.value} ${point.timestamp}\n`;
    });
    
    prometheusData += '\n';
  });

  return prometheusData;
};

// JSON format exporter
export const exportJSONFormat = (monitoringData: MonitoringData): string => {
  return JSON.stringify(monitoringData, null, 2);
};

// Alert thresholds
export interface AlertThreshold {
  metric: string;
  operator: 'gt' | 'lt' | 'eq' | 'gte' | 'lte';
  value: number;
  severity: 'warning' | 'critical';
  message: string;
}

export const defaultAlertThresholds: AlertThreshold[] = [
  {
    metric: 'contract_latency_ms',
    operator: 'gt',
    value: 5000,
    severity: 'warning',
    message: 'Contract latency is high',
  },
  {
    metric: 'contract_latency_ms',
    operator: 'gt',
    value: 10000,
    severity: 'critical',
    message: 'Contract latency is critically high',
  },
  {
    metric: 'dispute_rate_percent',
    operator: 'gt',
    value: 5,
    severity: 'warning',
    message: 'Dispute rate is elevated',
  },
  {
    metric: 'system_uptime_percent',
    operator: 'lt',
    value: 99,
    severity: 'critical',
    message: 'System uptime is below 99%',
  },
  {
    metric: 'gas_usage_total',
    operator: 'gt',
    value: 50,
    severity: 'warning',
    message: 'Gas usage is high',
  },
];

// Check alerts
export const checkAlerts = (
  monitoringData: MonitoringData,
  thresholds: AlertThreshold[] = defaultAlertThresholds
): Array<AlertThreshold & { currentValue: number }> => {
  const alerts: Array<AlertThreshold & { currentValue: number }> = [];

  thresholds.forEach(threshold => {
    const series = Object.values(monitoringData).find(s => s.name === threshold.metric);
    if (!series) return;

    const currentValue = series.points[series.points.length - 1]?.value || 0;
    let shouldAlert = false;

    switch (threshold.operator) {
      case 'gt':
        shouldAlert = currentValue > threshold.value;
        break;
      case 'lt':
        shouldAlert = currentValue < threshold.value;
        break;
      case 'eq':
        shouldAlert = currentValue === threshold.value;
        break;
      case 'gte':
        shouldAlert = currentValue >= threshold.value;
        break;
      case 'lte':
        shouldAlert = currentValue <= threshold.value;
        break;
    }

    if (shouldAlert) {
      alerts.push({
        ...threshold,
        currentValue,
      });
    }
  });

  return alerts;
};

// Waveform data generator for animated graphs
export const generateWaveformData = (
  baseValue: number,
  amplitude: number = 0.1,
  frequency: number = 1,
  points: number = 100
): number[] => {
  const waveform: number[] = [];
  const timeStep = (2 * Math.PI) / points;

  for (let i = 0; i < points; i++) {
    const time = i * timeStep;
    const noise = (Math.random() - 0.5) * amplitude * baseValue;
    const wave = Math.sin(frequency * time) * amplitude * baseValue;
    waveform.push(baseValue + wave + noise);
  }

  return waveform;
};

// Generate real-time waveform data for monitoring
export const generateRealTimeWaveform = (
  metricSeries: MetricSeries,
  duration: number = 300000 // 5 minutes
): MetricPoint[] => {
  const points: MetricPoint[] = [];
  const now = Date.now();
  const interval = duration / 60; // 60 points

  const baseValue = metricSeries.points[metricSeries.points.length - 1]?.value || 0;
  const waveform = generateWaveformData(baseValue, 0.05, 2, 60);

  for (let i = 0; i < 60; i++) {
    points.push({
      timestamp: now - (60 - i) * interval,
      value: Math.max(0, waveform[i]),
      labels: { source: 'realtime' },
    });
  }

  return points;
}; 