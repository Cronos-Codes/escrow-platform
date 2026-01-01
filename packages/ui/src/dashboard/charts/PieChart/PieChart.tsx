import React, { useMemo } from 'react';
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { cn } from '../../../utils/cn';

export interface PieChartDataPoint {
  name: string;
  value: number;
  color?: string;
  [key: string]: any;
}

export interface PieChartProps {
  /**
   * Chart data array
   */
  data: PieChartDataPoint[];
  /**
   * Data key for values
   */
  dataKey?: string;
  /**
   * Data key for names/labels
   */
  nameKey?: string;
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
   * Inner radius (for donut chart)
   */
  innerRadius?: number;
  /**
   * Outer radius
   */
  outerRadius?: number;
  /**
   * Padding angle between segments
   */
  paddingAngle?: number;
  /**
   * Start angle
   */
  startAngle?: number;
  /**
   * End angle
   */
  endAngle?: number;
  /**
   * Whether to show legend
   */
  showLegend?: boolean;
  /**
   * Whether to show tooltip
   */
  showTooltip?: boolean;
  /**
   * Whether to show labels on segments
   */
  showLabels?: boolean;
  /**
   * Custom label renderer
   */
  labelRenderer?: (entry: PieChartDataPoint) => string;
  /**
   * Custom tooltip renderer
   */
  tooltipRenderer?: (props: any) => React.ReactNode;
  /**
   * Color palette
   */
  colors?: string[];
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
   * Click handler for segments
   */
  onSegmentClick?: (data: PieChartDataPoint, index: number) => void;
  /**
   * Center content (for donut charts)
   */
  centerContent?: React.ReactNode;
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
  '#EC4899', // pink-500
  '#6366F1', // indigo-500
];

export function PieChart({
  data,
  dataKey = 'value',
  nameKey = 'name',
  width,
  height = 400,
  responsive = true,
  innerRadius = 0,
  outerRadius,
  paddingAngle = 0,
  startAngle = 90,
  endAngle = 450,
  showLegend = true,
  showTooltip = true,
  showLabels = false,
  labelRenderer,
  tooltipRenderer,
  colors = defaultColors,
  animation = { enabled: true, duration: 300 },
  loading = false,
  emptyMessage = 'No data available',
  className,
  onSegmentClick,
  centerContent,
}: PieChartProps) {
  // Memoize processed data with colors
  const processedData = useMemo(() => {
    return data.map((item, index) => ({
      ...item,
      color: item.color || colors[index % colors.length],
    }));
  }, [data, colors]);

  // Calculate total for percentage calculations
  const total = useMemo(() => {
    return processedData.reduce((sum, item) => sum + Number((item as any)[dataKey] || 0), 0);
  }, [processedData, dataKey]);

  // Custom label renderer
  const renderLabel = (entry: any) => {
    if (!showLabels) return null;
    
    if (labelRenderer) {
      return labelRenderer(entry);
    }

    const percentage = ((Number(entry[dataKey as keyof typeof entry]) / total) * 100).toFixed(1);
    return `${entry[nameKey]} (${percentage}%)`;
  };

  // Custom tooltip component
  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload || !payload.length) return null;

    const data = payload[0].payload as any;

    if (tooltipRenderer) {
      return tooltipRenderer({ active, payload, data });
    }

    const percentage = ((Number(data[dataKey as keyof typeof data]) / total) * 100).toFixed(1);

    return (
      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
        <div className="flex items-center space-x-2 mb-1">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: data.color }}
          />
          <span className="font-medium text-gray-900">{data[nameKey]}</span>
        </div>
        <div className="text-sm text-gray-600">
          <div>Value: {data[dataKey].toLocaleString()}</div>
          <div>Percentage: {percentage}%</div>
        </div>
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
          <div className="text-4xl mb-2">🥧</div>
          <p>{emptyMessage}</p>
        </div>
      </div>
    );
  }

  const ChartComponent = responsive ? ResponsiveContainer : 'div';
  const chartProps = responsive 
    ? { width: '100%', height } 
    : { width, height };

  const calculatedOuterRadius = outerRadius || (Math.min(height, width || height) / 2) * 0.8;

  return (
    <div className={cn('w-full relative', className)}>
      <ChartComponent {...chartProps}>
        <RechartsPieChart>
          <Pie
            data={processedData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={showLabels ? renderLabel : false}
            outerRadius={calculatedOuterRadius}
            innerRadius={innerRadius}
            paddingAngle={paddingAngle}
            startAngle={startAngle}
            endAngle={endAngle}
            dataKey={dataKey}
            animationDuration={animation.enabled ? animation.duration : 0}
            onClick={(data, index) => {
              if (onSegmentClick) {
                onSegmentClick(data, index);
              }
            }}
          >
            {processedData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.color}
                className="hover:opacity-80 cursor-pointer transition-opacity"
              />
            ))}
          </Pie>
          
          {showTooltip && <Tooltip content={<CustomTooltip />} />}
          
          {showLegend && (
            <Legend 
              verticalAlign="bottom"
              height={36}
              iconType="circle"
              formatter={(value, entry: any) => (
                <span style={{ color: entry.color }}>{value}</span>
              )}
            />
          )}
        </RechartsPieChart>
      </ChartComponent>

      {/* Center content for donut charts */}
      {centerContent && innerRadius > 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center">
            {centerContent}
          </div>
        </div>
      )}
    </div>
  );
}