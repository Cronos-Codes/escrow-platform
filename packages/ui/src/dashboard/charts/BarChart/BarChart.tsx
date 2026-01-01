import React, { useMemo } from 'react';
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { cn } from '../../../utils/cn';

export interface BarChartDataPoint {
  [key: string]: string | number | Date;
}

export interface BarChartSeries {
  dataKey: string;
  name?: string;
  color?: string;
  stackId?: string;
  radius?: [number, number, number, number];
}

export interface BarChartProps {
  /**
   * Chart data array
   */
  data: BarChartDataPoint[];
  /**
   * Series configuration
   */
  series: BarChartSeries[];
  /**
   * X-axis data key
   */
  xAxisKey: string;
  /**
   * Chart orientation
   */
  layout?: 'horizontal' | 'vertical';
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
   * X-axis configuration
   */
  xAxis?: {
    hide?: boolean;
    tickFormatter?: (value: any) => string;
    angle?: number;
  };
  /**
   * Y-axis configuration
   */
  yAxis?: {
    hide?: boolean;
    tickFormatter?: (value: any) => string;
    width?: number;
  };
  /**
   * Custom tooltip renderer
   */
  tooltipRenderer?: (props: any) => React.ReactNode;
  /**
   * Custom colors for individual bars (overrides series colors)
   */
  barColors?: string[];
  /**
   * Animation configuration
   */
  animation?: {
    enabled?: boolean;
    duration?: number;
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
   * Click handler for bars
   */
  onBarClick?: (data: BarChartDataPoint, series: string) => void;
  /**
   * Maximum bar size
   */
  maxBarSize?: number;
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

export function BarChart({
  data,
  series,
  xAxisKey,
  layout = 'vertical',
  width,
  height = 400,
  responsive = true,
  margin = { top: 20, right: 30, left: 20, bottom: 20 },
  showGrid = true,
  showLegend = true,
  showTooltip = true,
  xAxis = {},
  yAxis = {},
  tooltipRenderer,
  barColors,
  animation = { enabled: true, duration: 300 },
  loading = false,
  emptyMessage = 'No data available',
  className,
  onBarClick,
  maxBarSize = 60,
}: BarChartProps) {
  // Memoize processed series with colors
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
              className="w-3 h-3 rounded-sm"
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
        <RechartsBarChart
          layout={layout}
          data={data}
          margin={margin}
          maxBarSize={maxBarSize}
          onClick={(e: any) => {
            const active = (e && (e as any).activePayload) as any[] | undefined;
            if (onBarClick && active && active[0]) {
              const payload = active[0].payload as any;
              const seriesName = String(active[0].dataKey ?? '');
              onBarClick(payload, seriesName);
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
            type={layout === 'vertical' ? 'category' : 'number'}
            dataKey={layout === 'vertical' ? xAxisKey : undefined}
            hide={xAxis.hide}
            tickFormatter={xAxis.tickFormatter}
            angle={xAxis.angle}
            stroke="#6B7280"
            fontSize={12}
            interval={0}
          />
          
          <YAxis
            type={layout === 'vertical' ? 'number' : 'category'}
            dataKey={layout === 'horizontal' ? xAxisKey : undefined}
            hide={yAxis.hide}
            tickFormatter={yAxis.tickFormatter}
            width={yAxis.width}
            stroke="#6B7280"
            fontSize={12}
          />
          
          {showTooltip && <Tooltip content={<CustomTooltip />} />}
          
          {showLegend && (
            <Legend 
              wrapperStyle={{ paddingTop: '20px' }}
              iconType="rect"
            />
          )}

          {processedSeries.map((s, seriesIndex) => (
            <Bar
              key={s.dataKey}
              dataKey={s.dataKey}
              name={s.name || s.dataKey}
              fill={s.color}
              stackId={s.stackId}
              radius={s.radius || [0, 0, 0, 0]}
              animationDuration={animation.enabled ? animation.duration : 0}
            >
              {barColors && barColors.map((color, index) => (
                <Cell key={`cell-${index}`} fill={color} />
              ))}
            </Bar>
          ))}
        </RechartsBarChart>
      </ChartComponent>
    </div>
  );
}