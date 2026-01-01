import React from 'react';
import { Card, CardContent, CardHeader, CardAction } from '../../../molecules/Card';
import { Icon, IconName } from '../../../atoms/Icon';
import { Badge } from '../../../atoms/Badge';
import { Title, Text } from '../../../atoms/Typography';
import { Progress } from '../../../atoms/Progress';
import { Chart } from '../../charts/Chart';
import { cn } from '../../../utils/cn';

export interface MetricCardProps {
  /**
   * Main metric title
   */
  title: string;
  /**
   * Primary value to display
   */
  value: string | number;
  /**
   * Previous value for comparison
   */
  previousValue?: string | number;
  /**
   * Change percentage
   */
  change?: number;
  /**
   * Change period description
   */
  changePeriod?: string;
  /**
   * Metric description or subtitle
   */
  description?: string;
  /**
   * Icon to display
   */
  icon?: IconName | React.ReactNode;
  /**
   * Icon color variant
   */
  iconColor?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'muted';
  /**
   * Card variant
   */
  variant?: 'default' | 'outline' | 'elevated' | 'gold';
  /**
   * Size variant
   */
  size?: 'sm' | 'md' | 'lg';
  /**
   * Loading state
   */
  loading?: boolean;
  /**
   * Error state
   */
  error?: string;
  /**
   * Trend indicator
   */
  trend?: 'up' | 'down' | 'neutral';
  /**
   * Custom trend color
   */
  trendColor?: 'success' | 'error' | 'warning' | 'neutral';
  /**
   * Additional content to display
   */
  footer?: React.ReactNode;
  /**
   * Click handler
   */
  onClick?: () => void;
  /**
   * Additional CSS classes
   */
  className?: string;
  /**
   * Format function for the main value
   */
  valueFormatter?: (value: string | number) => string;
  /**
   * Format function for the change value
   */
  changeFormatter?: (change: number) => string;
  /**
   * Progress value (0-100)
   */
  progress?: number;
  /**
   * Mini chart data for sparkline
   */
  chartData?: number[];
  /**
   * Chart color
   */
  chartColor?: string;
  /**
   * Action button or element
   */
  action?: React.ReactNode;
}

const sizeClasses = {
  sm: {
    card: 'p-4',
    title: 'text-sm',
    value: 'text-xl',
    icon: 'h-8 w-8',
    iconSize: 'md' as const,
  },
  md: {
    card: 'p-6',
    title: 'text-base',
    value: 'text-2xl',
    icon: 'h-10 w-10',
    iconSize: 'lg' as const,
  },
  lg: {
    card: 'p-8',
    title: 'text-lg',
    value: 'text-3xl',
    icon: 'h-12 w-12',
    iconSize: 'xl' as const,
  },
};

const iconBackgroundClasses = {
  primary: 'bg-primary/10 text-primary',
  secondary: 'bg-muted text-muted-foreground',
  success: 'bg-green-100 text-green-600',
  warning: 'bg-yellow-100 text-yellow-600',
  error: 'bg-red-100 text-red-600',
  muted: 'bg-muted text-muted-foreground',
};

export function MetricCard({
  title,
  value,
  previousValue,
  change,
  changePeriod = 'vs last period',
  description,
  icon,
  iconColor = 'primary',
  variant = 'default',
  size = 'md',
  loading = false,
  error,
  trend,
  trendColor,
  footer,
  onClick,
  className,
  valueFormatter,
  changeFormatter,
  progress,
  chartData,
  chartColor = 'hsl(var(--primary))',
  action,
}: MetricCardProps) {
  const sizeConfig = sizeClasses[size];

  // Determine trend from change if not explicitly provided
  const effectiveTrend = trend || (change !== undefined ? (change > 0 ? 'up' : change < 0 ? 'down' : 'neutral') : 'neutral');
  
  // Determine trend color
  const effectiveTrendColor = trendColor || (effectiveTrend === 'up' ? 'success' : effectiveTrend === 'down' ? 'error' : 'neutral');

  // Format values
  const formattedValue = valueFormatter ? valueFormatter(value) : value.toLocaleString();
  const formattedChange = change !== undefined && changeFormatter ? changeFormatter(change) : change;

  // Loading skeleton
  if (loading) {
    return (
      <Card variant={variant} className={cn('animate-pulse', className)}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="h-4 bg-muted rounded w-24"></div>
            <div className={cn('bg-muted rounded-full', sizeConfig.icon)}></div>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="h-8 bg-muted rounded w-32"></div>
          <div className="h-3 bg-muted rounded w-20"></div>
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (error) {
    return (
      <Card variant="default" className={cn('border-destructive/50 bg-destructive/5', className)}>
        <CardContent className="text-center py-8">
          <Icon name="exclamation-triangle" size={sizeConfig.iconSize} className="text-destructive mx-auto mb-2" />
          <Text variant="body2" color="error">{error}</Text>
        </CardContent>
      </Card>
    );
  }

  const getTrendIcon = (): IconName => {
    switch (effectiveTrend) {
      case 'up':
        return 'chevron-up';
      case 'down':
        return 'chevron-down';
      default:
        return 'chevron-right';
    }
  };

  const getTrendBadgeVariant = () => {
    switch (effectiveTrendColor) {
      case 'success':
        return 'success';
      case 'error':
        return 'destructive';
      case 'warning':
        return 'warning';
      default:
        return 'secondary';
    }
  };

  return (
    <Card 
      variant={variant}
      hover={onClick ? 'lift' : 'none'}
      className={cn(
        onClick && 'cursor-pointer',
        className
      )}
      onClick={onClick}
    >
      <CardHeader>
        <div className="flex items-center justify-between">
          <Text variant="subTitle2" color="secondary">
            {title}
          </Text>
          {action && (
            <CardAction>
              {action}
            </CardAction>
          )}
          {icon && !action && (
            <CardAction className={cn(
              'rounded-full p-2 w-10 h-10 flex items-center justify-center',
              iconBackgroundClasses[iconColor]
            )}>
              {typeof icon === 'string' ? (
                <Icon name={icon as any} size="md" />
              ) : (
                icon
              )}
            </CardAction>
          )}
        </div>
      </CardHeader>

      <CardContent>
        {/* Main Value */}
        <div className="space-y-1">
          <Title as="h3" className={sizeConfig.value}>
            {formattedValue}
          </Title>
          {description && (
            <Text variant="caption" color="secondary">{description}</Text>
          )}
        </div>

        {/* Change Indicator */}
        {change !== undefined && (
          <div className="flex items-center gap-2 mt-2">
            <div className={cn(
              'flex items-center gap-1 text-sm font-medium',
              effectiveTrendColor === 'success' && 'text-green-600',
              effectiveTrendColor === 'error' && 'text-red-600',
              effectiveTrendColor === 'warning' && 'text-yellow-600',
              effectiveTrendColor === 'neutral' && 'text-muted-foreground'
            )}>
              <Icon 
                name={getTrendIcon()} 
                size="xs" 
              />
              {Math.abs(Number(formattedChange ?? change))}%
            </div>
            <Text variant="caption" color="secondary">
              {changePeriod}
            </Text>
          </div>
        )}

        {/* Progress Bar */}
        {progress !== undefined && (
          <div className="mt-3">
            <Progress value={progress} variant={variant === 'gold' ? 'gold' : 'default'} />
          </div>
        )}

        {/* Mini Chart */}
        {chartData && chartData.length > 0 && (
          <div className="mt-3 h-16">
            <Chart
              type="line"
              series={[{ name: 'Data', data: chartData }]}
              options={{
                chart: { sparkline: { enabled: true } },
                colors: [chartColor],
                stroke: { curve: 'smooth', width: 2 },
                tooltip: { enabled: false },
                grid: { show: false },
                yaxis: { show: false },
                xaxis: { show: false } as any,
              }}
              height={64}
            />
          </div>
        )}

        {/* Previous Value Comparison */}
        {previousValue !== undefined && (
          <div className="mt-2">
            <Text variant="caption" color="secondary">
              Previous: {valueFormatter ? valueFormatter(previousValue) : previousValue.toLocaleString()}
            </Text>
          </div>
        )}

        {/* Footer */}
        {footer && (
          <div className="mt-4 pt-4 border-t border-border">
            {footer}
          </div>
        )}
      </CardContent>
    </Card>
  );
}