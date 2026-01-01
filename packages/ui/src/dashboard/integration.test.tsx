import React from 'react';
import { render, screen } from '@testing-library/react';

// Test all major dashboard components can be imported and rendered
import { 
  DashboardExample,
  EscrowDashboard, 
  AnalyticsDashboard,
  MetricCard,
  DataTable,
  Chart
} from './index';

// Mock ApexCharts
jest.mock('react-apexcharts', () => ({
  __esModule: true,
  default: ({ type, series, options, height }: any) => (
    <div data-testid={`apex-chart-${type}`} data-height={height}>
      Mock ApexChart - {type}
    </div>
  ),
}));

describe('Dashboard Integration', () => {
  it('can import and render DashboardExample', () => {
    render(<DashboardExample />);
    expect(screen.getByText('Gold Escrow Platform')).toBeInTheDocument();
  });

  it('can import and render EscrowDashboard', () => {
    render(<EscrowDashboard />);
    expect(screen.getByText('Escrow Dashboard')).toBeInTheDocument();
  });

  it('can import and render AnalyticsDashboard', () => {
    render(<AnalyticsDashboard />);
    expect(screen.getByText('Analytics Overview')).toBeInTheDocument();
  });

  it('can import and render MetricCard', () => {
    render(
      <MetricCard
        title="Test Metric"
        value={1000}
        change={5.2}
        icon="chart-bar"
      />
    );
    expect(screen.getByText('Test Metric')).toBeInTheDocument();
    expect(screen.getByText('1,000')).toBeInTheDocument();
  });

  it('can import and render DataTable', () => {
    const data = [
      { id: 1, name: 'Test Item', value: 100 }
    ];
    const columns = [
      { key: 'name', label: 'Name' },
      { key: 'value', label: 'Value' }
    ];

    render(<DataTable data={data} columns={columns} />);
    expect(screen.getByText('Test Item')).toBeInTheDocument();
  });

  it('can import and render Chart component', () => {
    const series = [{ name: 'Test', data: [1, 2, 3] }];
    
    render(
      <Chart
        type="line"
        series={series}
        height={200}
      />
    );
    expect(screen.getByTestId('apex-chart-line')).toBeInTheDocument();
  });

  it('all components work together in integration', () => {
    // This test ensures all components can be rendered together without conflicts
    render(
      <div>
        <MetricCard title="Integration Test" value={100} />
        <Chart type="bar" series={[{ name: 'Test', data: [1, 2, 3] }]} height={100} />
        <DataTable 
          data={[{ id: 1, test: 'value' }]} 
          columns={[{ key: 'test', label: 'Test' }]} 
        />
      </div>
    );

    expect(screen.getByText('Integration Test')).toBeInTheDocument();
    expect(screen.getByTestId('apex-chart-bar')).toBeInTheDocument();
    expect(screen.getByText('value')).toBeInTheDocument();
  });

  it('validates TypeScript exports are working', () => {
    // This test ensures TypeScript types are properly exported
    const metricCardProps = {
      title: 'TypeScript Test',
      value: 42,
      change: 1.5,
      icon: 'chart-bar' as const,
      variant: 'gold' as const,
    };

    render(<MetricCard {...metricCardProps} />);
    expect(screen.getByText('TypeScript Test')).toBeInTheDocument();
  });
});

describe('Slash-Admin Integration Features', () => {
  it('supports enhanced typography system', () => {
    render(<EscrowDashboard />);
    
    // Should use the new Typography components
    expect(screen.getByText('Escrow Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Monitor your escrow transactions and platform performance')).toBeInTheDocument();
  });

  it('supports enhanced card system with actions', () => {
    render(<EscrowDashboard />);
    
    // Should have export buttons in card headers
    const exportButtons = screen.getAllByText('Export');
    expect(exportButtons.length).toBeGreaterThan(0);
  });

  it('supports progress indicators', () => {
    render(<EscrowDashboard />);
    
    // Should have progress bars for completion rates
    const progressBars = screen.getAllByRole('progressbar', { hidden: true });
    expect(progressBars.length).toBeGreaterThan(0);
  });

  it('supports gold theme variants', () => {
    render(
      <MetricCard
        title="Gold Theme Test"
        value={1000}
        variant="gold"
      />
    );
    
    expect(screen.getByText('Gold Theme Test')).toBeInTheDocument();
  });

  it('supports chart integration with ApexCharts', () => {
    render(<EscrowDashboard />);
    
    // Should render ApexCharts components
    expect(screen.getByTestId('apex-chart-area')).toBeInTheDocument();
    expect(screen.getByTestId('apex-chart-donut')).toBeInTheDocument();
  });

  it('supports enhanced data table with professional styling', () => {
    render(<EscrowDashboard />);
    
    // Should have the recent deals table
    expect(screen.getByText('Recent Deals')).toBeInTheDocument();
    expect(screen.getByText('Luxury Property - Dubai Marina')).toBeInTheDocument();
  });
});

describe('Performance and Accessibility', () => {
  it('renders components without performance issues', () => {
    const startTime = performance.now();
    
    render(<DashboardExample />);
    
    const endTime = performance.now();
    const renderTime = endTime - startTime;
    
    // Should render in under 100ms for good performance
    expect(renderTime).toBeLessThan(100);
  });

  it('maintains accessibility standards', () => {
    render(<EscrowDashboard />);
    
    // Should have proper headings
    expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument();
    
    // Should have accessible buttons
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
  });

  it('supports keyboard navigation', () => {
    render(<DashboardExample />);
    
    // Should have focusable elements
    const focusableElements = screen.getAllByRole('button');
    expect(focusableElements.length).toBeGreaterThan(0);
    
    // Each button should be focusable
    focusableElements.forEach(element => {
      expect(element).not.toHaveAttribute('tabindex', '-1');
    });
  });
});