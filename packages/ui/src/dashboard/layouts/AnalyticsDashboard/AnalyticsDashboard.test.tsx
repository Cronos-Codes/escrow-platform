import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { AnalyticsDashboard } from './AnalyticsDashboard';

// Mock the Chart component
jest.mock('../../charts/Chart', () => ({
  Chart: ({ type, series, options, height }: any) => (
    <div data-testid={`chart-${type}`} data-height={height}>
      Mock Chart - {type}
    </div>
  ),
}));

describe('AnalyticsDashboard', () => {
  it('renders without crashing', () => {
    render(<AnalyticsDashboard />);
    expect(screen.getByText('Analytics Overview')).toBeInTheDocument();
  });

  it('displays platform metrics', () => {
    render(<AnalyticsDashboard />);
    
    expect(screen.getByText('Total Transactions')).toBeInTheDocument();
    expect(screen.getByText('Transaction Volume')).toBeInTheDocument();
    expect(screen.getByText('Avg Processing Time')).toBeInTheDocument();
  });

  it('shows time period selector', () => {
    render(<AnalyticsDashboard />);
    
    expect(screen.getByText('Day')).toBeInTheDocument();
    expect(screen.getByText('Week')).toBeInTheDocument();
    expect(screen.getByText('Month')).toBeInTheDocument();
  });

  it('handles time period changes', () => {
    render(<AnalyticsDashboard />);
    
    const dayButton = screen.getByText('Day');
    fireEvent.click(dayButton);
    
    // Should update the active state (button should have different styling)
    expect(dayButton).toHaveClass('bg-primary');
  });

  it('displays transaction flow chart', () => {
    render(<AnalyticsDashboard />);
    
    expect(screen.getByText('Transaction Flow Analysis')).toBeInTheDocument();
    expect(screen.getByTestId('chart-line')).toBeInTheDocument();
  });

  it('shows industry performance section', () => {
    render(<AnalyticsDashboard />);
    
    expect(screen.getByText('Top Industries by Volume')).toBeInTheDocument();
    expect(screen.getByText('Real Estate')).toBeInTheDocument();
    expect(screen.getByText('Commodities')).toBeInTheDocument();
  });

  it('displays user activity by region', () => {
    render(<AnalyticsDashboard />);
    
    expect(screen.getByText('User Activity by Region')).toBeInTheDocument();
    expect(screen.getByText('Middle East')).toBeInTheDocument();
    expect(screen.getByText('North America')).toBeInTheDocument();
  });

  it('shows trend indicators', () => {
    render(<AnalyticsDashboard />);
    
    // Should have trend indicators with arrows
    const trendElements = screen.getAllByTestId(/arrow-trending/);
    expect(trendElements.length).toBeGreaterThan(0);
  });

  it('displays export buttons', () => {
    render(<AnalyticsDashboard />);
    
    const exportButtons = screen.getAllByText('Export Data');
    expect(exportButtons.length).toBeGreaterThan(0);
  });

  it('renders with custom className', () => {
    const { container } = render(<AnalyticsDashboard className="custom-analytics" />);
    expect(container.firstChild).toHaveClass('custom-analytics');
  });

  it('shows progress bars for regional activity', () => {
    render(<AnalyticsDashboard />);
    
    // Progress bars should be present for regional data
    const progressBars = screen.getAllByRole('progressbar', { hidden: true });
    expect(progressBars.length).toBeGreaterThan(0);
  });
});