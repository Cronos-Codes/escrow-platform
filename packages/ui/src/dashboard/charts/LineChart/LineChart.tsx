import React, { useMemo } from 'react';
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  Brush,
} from 'recharts';
import { cn } from '../../../utils/cn';

export interface LineChartDataPoint {
  [key: string]: string | number | Date;
}

export interface LineChartSeries {
  dataKey: string;
  name?: string;
  color?: string;
  strokeWidth?: number;
  strokeDasharray?: string;
  dot?: boolean;
  connectNulls?: boolean;
}

export interface LineChartProps {
  /**
   * Chart data array
   */
  data: LineChartDataPoint[];
  /**
   * Series configuration
   */
  series: LineChartSeries[];
  /**
   * X-axis data key
   */
  xAxisKey: string;
  /**
   * Chart width (if not responsive)
   */
  width?: number;
  /**
   * Chart height
   */
  height?: number;
  /**
   * Whether the chart should be responsive
   */
  responsive?: boolean;
  /**
   * Chart margins
   */
  margin?: {
    top?: number;
    right?: number;
    bottom?: number;
    left?: number;
  };
  /**
   * Whether to show grid lines
   */
  showGrid?: boolean;
  /**
   * Whether to show legend
   */
  showLegend?: boolean;
  /**
   * Whether to show tooltip
   */
  showTooltip?: boolean;
  /**
   * Whether to show brush for zooming
   */
  showBrush?: boolean;
  /**
   * X-axis configuration
   */
  xAxis?: {
    hide?: boolean;
    tickFormatter?: (value: any) => string;
    domain?: [string | number, string | number];
    type?: 'number' | 'category';
  };
  /**
   * Y-axis configuration
   */
  yAxis?: {
    hide?: boolean;
    tickFormatter?: (value: any) => string;
    domain?: [string | number, string | number];
  };
  /**
   * Reference lines
   */
  referenceLines?: Array<{
    y?: number;
    x?: number;
    label?: string;
    color?: string;
    strokeDasharray?: string;
  }>;
  /**
   * Custom tooltip renderer
   */
  tooltipRenderer?: (props: any) => React.ReactNode;
  /**
   * Animation configuration
   */
  animation?: {
    enabled?: boolean;
    duration?: number;
    easing?: string;
  };
  /**
   * Loading state
   */
  loading?: boolean;
  /**
   * Empty state message
   */
  emptyMessage?: string;
  /**
   * Additional CSS classes
   */
  className?: string;
  /**
   * Click handler for data points
   */
  onDataPointClick?: (data: LineChartDataPoint, series: string) => void;
}

const defaultColors = [
  '#3B82F6', // blue-500
  '#EF4444', // red-500
  '#10B981', // emerald-500
  '#F59E0B', // amber-500
  '#8B5CF6', // violet-500
  '#06B6D4', // cyan-500
  '#F97316', // orange-500
  '#84CC16', // lime-500
];

export function LineChart({
  data,
  series,
  xAxisKey,
  width,
  height = 400,
  responsive = true,
  margin = { top: 20, right: 30, left: 20, bottom: 20 },
  showGrid = true,
  showLegend = true,
  showTooltip = true,
  showBrush = false,
  xAxis = {},
  yAxis = {},
  referenceLines = [],
  tooltipRenderer,
  animation = { enabled: true, duration: 300 },
  loading = false,
  emptyMessage = 'No data available',
  className,
  onDataPointClick,
}: LineChartProps) {
  // Memoize processed data
  const processedData = useMemo(() => {
    return data.map(item => ({
      ...item,
      [xAxisKey]: item[xAxisKey] instanceof Date 
        ? item[xAxisKey].getTime() 
        : item[xAxisKey],
    }));
  }, [data, xAxisKey]);

  // Memoize series with colors
  const processedSeries = useMemo(() => {
    return series.map((s, index) => ({
      ...s,
      color: s.color || defaultColors[index % defaultColors.length],
    }));
  }, [series]);

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null;

    if (tooltipRenderer) {
      return tooltipRenderer({ active, payload, label });
    }

    return (
      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
        <p className="font-medium text-gray-900 mb-2">
          {xAxis.tickFormatter ? xAxis.tickFormatter(label) : label}
        </p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center space-x-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-sm text-gray-600">{entry.name}:</span>
            <span className="text-sm font-medium text-gray-900">
              {yAxis.tickFormatter ? yAxis.tickFormatter(entry.value) : entry.value}
            </span>
          </div>
        ))}
      </div>
    );
  };

  // Loading state
  if (loading) {
    return (
      <div 
        className={cn('flex items-center justify-center bg-gray-50 rounded-lg', className)}
        style={{ height }}
      >
        <div className="flex items-center space-x-2 text-gray-500">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600" />
          <span>Loading chart...</span>
        </div>
      </div>
    );
  }

  // Empty state
  if (!data || data.length === 0) {
    return (
      <div 
        className={cn('flex items-center justify-center bg-gray-50 rounded-lg', className)}
        style={{ height }}
      >
        <div className="text-center text-gray-500">
          <div className="text-4xl mb-2">📊</div>
          <p>{emptyMessage}</p>
        </div>
      </div>
    );
  }

  const ChartComponent = responsive ? ResponsiveContainer : 'div';
  const chartProps = responsive 
    ? { width: '100%', height } 
    : { width, height };

  return (
    <div className={cn('w-full', className)}>
      <ChartComponent {...chartProps}>
        <RechartsLineChart
          data={processedData}
          margin={margin}
          onClick={(e: any) => {
            const active = (e && (e as any).activePayload) as any[] | undefined;
            if (onDataPointClick && active && active[0]) {
              const payload = active[0].payload as any;
              const seriesName = String(active[0].dataKey ?? '');
              onDataPointClick(payload, seriesName);
            }
          }}
        >
          {showGrid && (
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="#E5E7EB" 
              opacity={0.5}
            />
          )}
          
          <XAxis
            dataKey={xAxisKey}
            hide={xAxis.hide}
            tickFormatter={xAxis.tickFormatter}
            domain={xAxis.domain}
            type={xAxis.type}
            stroke="#6B7280"
            fontSize={12}
          />
          
          <YAxis
            hide={yAxis.hide}
            tickFormatter={yAxis.tickFormatter}
            domain={yAxis.domain}
            stroke="#6B7280"
            fontSize={12}
          />
          
          {showTooltip && <Tooltip content={<CustomTooltip />} />}
          
          {showLegend && (
            <Legend 
              wrapperStyle={{ paddingTop: '20px' }}
              iconType="line"
            />
          )}

          {processedSeries.map((s) => (
            <Line
              key={s.dataKey}
              type="monotone"
              dataKey={s.dataKey}
              name={s.name || s.dataKey}
              stroke={s.color}
              strokeWidth={s.strokeWidth || 2}
              strokeDasharray={s.strokeDasharray}
              dot={s.dot !== false}
              connectNulls={s.connectNulls}
              animationDuration={animation.enabled ? animation.duration : 0}
              activeDot={{ 
                r: 6, 
                stroke: s.color, 
                strokeWidth: 2, 
                fill: '#fff' 
              }}
            />
          ))}

          {referenceLines.map((line, index) => (
            <ReferenceLine
              key={index}
              y={line.y}
              x={line.x}
              stroke={line.color || '#EF4444'}
              strokeDasharray={line.strokeDasharray || '5 5'}
              label={line.label}
            />
          ))}

          {showBrush && (
            <Brush 
              dataKey={xAxisKey} 
              height={30}
              stroke="#3B82F6"
              fill="#EBF4FF"
            />
          )}
        </RechartsLineChart>
      </ChartComponent>
    </div>
  );
}