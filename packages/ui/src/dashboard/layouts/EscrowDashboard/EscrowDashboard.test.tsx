import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { EscrowDashboard } from './EscrowDashboard';

// Mock the Chart component since it uses ApexCharts
jest.mock('../../charts/Chart', () => ({
  Chart: ({ type, series, options, height }: any) => (
    <div data-testid={`chart-${type}`} data-height={height}>
      Mock Chart - {type}
      <div data-testid="chart-series">{JSON.stringify(series)}</div>
    </div>
  ),
}));

describe('EscrowDashboard', () => {
  it('renders without crashing', () => {
    render(<EscrowDashboard />);
    expect(screen.getByText('Escrow Dashboard')).toBeInTheDocument();
  });

  it('displays key metrics cards', () => {
    render(<EscrowDashboard />);
    
    expect(screen.getByText('Total Escrow Value')).toBeInTheDocument();
    expect(screen.getByText('Active Deals')).toBeInTheDocument();
    expect(screen.getByText('Completion Rate')).toBeInTheDocument();
    expect(screen.getByText('Avg Deal Size')).toBeInTheDocument();
  });

  it('displays charts', () => {
    render(<EscrowDashboard />);
    
    expect(screen.getByTestId('chart-area')).toBeInTheDocument();
    expect(screen.getByTestId('chart-donut')).toBeInTheDocument();
  });

  it('displays recent deals table', () => {
    render(<EscrowDashboard />);
    
    expect(screen.getByText('Recent Deals')).toBeInTheDocument();
    expect(screen.getByText('Luxury Property - Dubai Marina')).toBeInTheDocument();
    expect(screen.getByText('Gold Bullion - 10kg')).toBeInTheDocument();
  });

  it('handles time range changes', () => {
    const mockOnTimeRangeChange = jest.fn();
    render(<EscrowDashboard onTimeRangeChange={mockOnTimeRangeChange} />);
    
    const weekButton = screen.getByText('Week');
    fireEvent.click(weekButton);
    
    expect(mockOnTimeRangeChange).toHaveBeenCalledWith('week');
  });

  it('displays proper status indicators', () => {
    render(<EscrowDashboard />);
    
    expect(screen.getByText('Pending Verification')).toBeInTheDocument();
    expect(screen.getByText('Funds Deposited')).toBeInTheDocument();
    expect(screen.getByText('Inspection Phase')).toBeInTheDocument();
  });

  it('shows progress bars for deals', () => {
    render(<EscrowDashboard />);
    
    // Check for progress indicators (they should be in the DOM)
    const progressBars = screen.getAllByRole('progressbar', { hidden: true });
    expect(progressBars.length).toBeGreaterThan(0);
  });

  it('displays export buttons', () => {
    render(<EscrowDashboard />);
    
    const exportButtons = screen.getAllByText('Export');
    expect(exportButtons.length).toBeGreaterThan(0);
  });

  it('renders with custom className', () => {
    const { container } = render(<EscrowDashboard className="custom-class" />);
    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('displays correct currency formatting', () => {
    render(<EscrowDashboard />);
    
    // Check for properly formatted currency values
    expect(screen.getByText('$850,000')).toBeInTheDocument();
    expect(screen.getByText('$650,000')).toBeInTheDocument();
  });

  it('shows days remaining for deals', () => {
    render(<EscrowDashboard />);
    
    expect(screen.getByText('14d')).toBeInTheDocument();
    expect(screen.getByText('7d')).toBeInTheDocument();
    expect(screen.getByText('3d')).toBeInTheDocument();
  });
});