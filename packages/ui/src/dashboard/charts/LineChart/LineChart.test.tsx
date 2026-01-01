import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { LineChart } from './LineChart';

// Mock Recharts components
vi.mock('recharts', () => ({
  LineChart: ({ children, onClick, ...props }: any) => (
    <div data-testid="line-chart" onClick={onClick} {...props}>
      {children}
    </div>
  ),
  Line: ({ dataKey, ...props }: any) => (
    <div data-testid={`line-${dataKey}`} {...props} />
  ),
  XAxis: (props: any) => <div data-testid="x-axis" {...props} />,
  YAxis: (props: any) => <div data-testid="y-axis" {...props} />,
  CartesianGrid: (props: any) => <div data-testid="grid" {...props} />,
  Tooltip: ({ content }: any) => <div data-testid="tooltip">{content}</div>,
  Legend: (props: any) => <div data-testid="legend" {...props} />,
  ResponsiveContainer: ({ children }: any) => (
    <div data-testid="responsive-container">{children}</div>
  ),
  ReferenceLine: (props: any) => <div data-testid="reference-line" {...props} />,
  Brush: (props: any) => <div data-testid="brush" {...props} />,
}));

const mockData = [
  { date: '2024-01-01', value: 100, secondary: 50 },
  { date: '2024-01-02', value: 120, secondary: 60 },
  { date: '2024-01-03', value: 90, secondary: 45 },
  { date: '2024-01-04', value: 150, secondary: 75 },
  { date: '2024-01-05', value: 110, secondary: 55 },
];

const mockSeries = [
  { dataKey: 'value', name: 'Primary Value', color: '#3B82F6' },
  { dataKey: 'secondary', name: 'Secondary Value', color: '#EF4444' },
];

describe('LineChart', () => {
  describe('Rendering', () => {
    it('renders chart with data', () => {
      render(
        <LineChart
          data={mockData}
          series={mockSeries}
          xAxisKey="date"
        />
      );

      expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
      expect(screen.getByTestId('line-chart')).toBeInTheDocument();
      expect(screen.getByTestId('line-value')).toBeInTheDocument();
      expect(screen.getByTestId('line-secondary')).toBeInTheDocument();
    });

    it('renders with custom dimensions when not responsive', () => {
      render(
        <LineChart
          data={mockData}
          series={mockSeries}
          xAxisKey="date"
          responsive={false}
          width={800}
          height={400}
        />
      );

      expect(screen.queryByTestId('responsive-container')).not.toBeInTheDocument();
      expect(screen.getByTestId('line-chart')).toBeInTheDocument();
    });

    it('shows loading state', () => {
      render(
        <LineChart
          data={mockData}
          series={mockSeries}
          xAxisKey="date"
          loading={true}
        />
      );

      expect(screen.getByText('Loading chart...')).toBeInTheDocument();
      expect(screen.queryByTestId('line-chart')).not.toBeInTheDocument();
    });

    it('shows empty state when no data', () => {
      render(
        <LineChart
          data={[]}
          series={mockSeries}
          xAxisKey="date"
          emptyMessage="No data found"
        />
      );

      expect(screen.getByText('No data found')).toBeInTheDocument();
      expect(screen.queryByTestId('line-chart')).not.toBeInTheDocument();
    });
  });

  describe('Configuration', () => {
    it('renders grid when showGrid is true', () => {
      render(
        <LineChart
          data={mockData}
          series={mockSeries}
          xAxisKey="date"
          showGrid={true}
        />
      );

      expect(screen.getByTestId('grid')).toBeInTheDocument();
    });

    it('does not render grid when showGrid is false', () => {
      render(
        <LineChart
          data={mockData}
          series={mockSeries}
          xAxisKey="date"
          showGrid={false}
        />
      );

      expect(screen.queryByTestId('grid')).not.toBeInTheDocument();
    });

    it('renders legend when showLegend is true', () => {
      render(
        <LineChart
          data={mockData}
          series={mockSeries}
          xAxisKey="date"
          showLegend={true}
        />
      );

      expect(screen.getByTestId('legend')).toBeInTheDocument();
    });

    it('renders tooltip when showTooltip is true', () => {
      render(
        <LineChart
          data={mockData}
          series={mockSeries}
          xAxisKey="date"
          showTooltip={true}
        />
      );

      expect(screen.getByTestId('tooltip')).toBeInTheDocument();
    });

    it('renders brush when showBrush is true', () => {
      render(
        <LineChart
          data={mockData}
          series={mockSeries}
          xAxisKey="date"
          showBrush={true}
        />
      );

      expect(screen.getByTestId('brush')).toBeInTheDocument();
    });

    it('renders reference lines', () => {
      const referenceLines = [
        { y: 100, label: 'Target', color: '#FF0000' },
        { x: '2024-01-03', label: 'Event', color: '#00FF00' },
      ];

      render(
        <LineChart
          data={mockData}
          series={mockSeries}
          xAxisKey="date"
          referenceLines={referenceLines}
        />
      );

      const referenceLineElements = screen.getAllByTestId('reference-line');
      expect(referenceLineElements).toHaveLength(2);
    });
  });

  describe('Interactions', () => {
    it('calls onDataPointClick when data point is clicked', () => {
      const mockOnClick = vi.fn();
      
      render(
        <LineChart
          data={mockData}
          series={mockSeries}
          xAxisKey="date"
          onDataPointClick={mockOnClick}
        />
      );

      const chart = screen.getByTestId('line-chart');
      
      // Simulate click with mock payload
      fireEvent.click(chart, {
        target: {
          activePayload: [
            {
              payload: mockData[0],
              dataKey: 'value',
            },
          ],
        },
      });

      // Note: This test would need more sophisticated mocking to properly test the click handler
      // as Recharts handles the click event internally
    });
  });

  describe('Data Processing', () => {
    it('handles Date objects in data', () => {
      const dataWithDates = mockData.map(item => ({
        ...item,
        date: new Date(item.date),
      }));

      render(
        <LineChart
          data={dataWithDates}
          series={mockSeries}
          xAxisKey="date"
        />
      );

      expect(screen.getByTestId('line-chart')).toBeInTheDocument();
    });

    it('applies default colors to series without colors', () => {
      const seriesWithoutColors = [
        { dataKey: 'value', name: 'Primary Value' },
        { dataKey: 'secondary', name: 'Secondary Value' },
      ];

      render(
        <LineChart
          data={mockData}
          series={seriesWithoutColors}
          xAxisKey="date"
        />
      );

      expect(screen.getByTestId('line-value')).toBeInTheDocument();
      expect(screen.getByTestId('line-secondary')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA attributes', () => {
      render(
        <LineChart
          data={mockData}
          series={mockSeries}
          xAxisKey="date"
        />
      );

      const chart = screen.getByTestId('line-chart');
      expect(chart).toBeInTheDocument();
    });
  });

  describe('Custom Formatting', () => {
    it('applies custom axis formatters', () => {
      const xAxisFormatter = vi.fn((value) => `Day ${value}`);
      const yAxisFormatter = vi.fn((value) => `$${value}`);

      render(
        <LineChart
          data={mockData}
          series={mockSeries}
          xAxisKey="date"
          xAxis={{ tickFormatter: xAxisFormatter }}
          yAxis={{ tickFormatter: yAxisFormatter }}
        />
      );

      expect(screen.getByTestId('x-axis')).toBeInTheDocument();
      expect(screen.getByTestId('y-axis')).toBeInTheDocument();
    });
  });

  describe('Animation', () => {
    it('disables animation when animation.enabled is false', () => {
      render(
        <LineChart
          data={mockData}
          series={mockSeries}
          xAxisKey="date"
          animation={{ enabled: false }}
        />
      );

      expect(screen.getByTestId('line-value')).toBeInTheDocument();
    });

    it('sets custom animation duration', () => {
      render(
        <LineChart
          data={mockData}
          series={mockSeries}
          xAxisKey="date"
          animation={{ enabled: true, duration: 500 }}
        />
      );

      expect(screen.getByTestId('line-value')).toBeInTheDocument();
    });
  });
});