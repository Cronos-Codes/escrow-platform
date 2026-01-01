# Dashboard System - Gold Escrow Platform

## Overview

A comprehensive dashboard system built with **slash-admin** integration, providing world-class analytics and management interfaces for the Gold Escrow Platform. Features modern UI components, advanced charts, and professional data visualization.

## 🚀 Quick Start

```tsx
import { 
  DashboardExample, 
  EscrowDashboard, 
  AnalyticsDashboard,
  MetricCard,
  Chart,
  DataTable 
} from '@escrow/ui';

// Complete dashboard with navigation
function App() {
  return <DashboardExample />;
}

// Individual dashboard layouts
function EscrowPage() {
  return <EscrowDashboard />;
}

function AnalyticsPage() {
  return <AnalyticsDashboard />;
}
```

## 📊 Components

### Dashboard Layouts

#### EscrowDashboard
Main dashboard for escrow management with real-time metrics and deal tracking.

```tsx
<EscrowDashboard 
  timeRange="month"
  onTimeRangeChange={(range) => console.log(range)}
  className="custom-dashboard"
/>
```

**Features:**
- Real-time escrow metrics
- Deal volume trends
- Industry breakdown charts
- Recent deals table with progress tracking
- Time range filtering (day/week/month/year)

#### AnalyticsDashboard
Comprehensive analytics dashboard with advanced metrics and insights.

```tsx
<AnalyticsDashboard className="analytics-view" />
```

**Features:**
- Platform-wide analytics
- Transaction flow analysis
- Regional performance metrics
- Industry performance tracking
- Interactive time period selection

### Enhanced Components

#### MetricCard
Professional metric cards with enhanced features from slash-admin integration.

```tsx
<MetricCard
  title="Total Escrow Value"
  value={2450000}
  change={16.7}
  changePeriod="vs last month"
  icon="banknotes"
  iconColor="success"
  variant="gold"
  valueFormatter={(value) => `$${value.toLocaleString()}`}
  chartData={[120, 145, 167, 189, 156, 178]}
  chartColor="hsl(var(--gold-500))"
  progress={85}
  action={<Button size="sm">View Details</Button>}
/>
```

**Props:**
- `title` - Metric title
- `value` - Primary value to display
- `change` - Percentage change
- `changePeriod` - Change period description
- `icon` - Icon name or React node
- `iconColor` - Icon color variant
- `variant` - Card variant (default, gold, outlined, elevated)
- `chartData` - Mini sparkline chart data
- `progress` - Progress bar value (0-100)
- `action` - Action button or element

#### Chart
Enhanced chart component with ApexCharts integration and gold theming.

```tsx
<Chart
  type="area"
  series={[
    { name: 'Revenue', data: [120, 145, 167, 189] },
    { name: 'Orders', data: [80, 95, 110, 125] }
  ]}
  options={{
    xaxis: { categories: ['Jan', 'Feb', 'Mar', 'Apr'] },
    colors: ['hsl(var(--gold-500))', 'hsl(var(--primary))']
  }}
  height={350}
  className="revenue-chart"
/>
```

**Chart Types:**
- `line` - Line charts
- `area` - Area charts  
- `bar` - Bar charts
- `pie` - Pie charts
- `donut` - Donut charts
- `radialBar` - Radial bar charts

#### DataTable
Professional data table with enhanced styling and features.

```tsx
<DataTable
  data={deals}
  columns={[
    {
      key: 'dealTitle',
      label: 'Deal',
      sortable: true,
      render: (value, row) => (
        <div>
          <Text variant="body2" className="font-medium">{value}</Text>
          <Text variant="caption" color="secondary">{row.id}</Text>
        </div>
      )
    },
    {
      key: 'amount',
      label: 'Amount',
      type: 'currency',
      align: 'right',
      sortable: true
    }
  ]}
  rowActions={[
    {
      label: 'View',
      icon: <Icon name="eye" size="xs" />,
      onClick: (row) => viewDeal(row.id)
    }
  ]}
  showSearch={true}
  showPagination={true}
  pageSize={10}
/>
```

## 🎨 Design System

### Color Schemes
The dashboard supports multiple color schemes optimized for escrow platform branding:

```tsx
// Gold theme for premium feel
<Chart colorScheme="gold" />

// Default blue theme
<Chart colorScheme="default" />

// Success green theme
<Chart colorScheme="green" />
```

### Typography
Enhanced typography system with semantic variants:

```tsx
import { Title, Text } from '@escrow/ui';

<Title as="h2" color="gold">Dashboard Title</Title>
<Text variant="body2" color="secondary">Description text</Text>
```

### Progress Indicators
Multiple progress variants for different use cases:

```tsx
<Progress value={75} variant="gold" size="md" />
<Progress value={90} variant="success" size="lg" />
```

## 📱 Responsive Design

All dashboard components are built with mobile-first responsive design:

```tsx
// Responsive grid layouts
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
  <MetricCard title="Mobile Optimized" value={100} />
</div>

// Responsive charts
<Chart 
  type="line" 
  series={data}
  responsive={[
    {
      breakpoint: 640,
      options: { chart: { height: 200 } }
    }
  ]}
/>
```

## ♿ Accessibility

Full WCAG 2.1 AA compliance with comprehensive accessibility features:

- **Keyboard Navigation**: All interactive elements are keyboard accessible
- **Screen Reader Support**: Proper ARIA labels and semantic HTML
- **Color Contrast**: Meets accessibility standards
- **Focus Management**: Visible focus indicators
- **Alternative Text**: Images and charts have proper descriptions

```tsx
// Accessible metric card
<MetricCard
  title="Accessible Metric"
  value={100}
  aria-label="Total revenue metric showing $100,000"
  role="region"
/>
```

## 🚀 Performance

Optimized for performance with:

- **Code Splitting**: Dynamic imports for charts
- **Memoization**: React.memo for expensive components  
- **Virtual Scrolling**: Large data table support
- **Hardware Acceleration**: Smooth animations

```tsx
// Lazy load charts for better performance
const Chart = React.lazy(() => import('./Chart'));

<Suspense fallback={<ChartSkeleton />}>
  <Chart type="line" series={data} />
</Suspense>
```

## 🧪 Testing

Comprehensive test coverage with utilities:

```tsx
import { render, screen } from '@testing-library/react';
import { EscrowDashboard } from '@escrow/ui';

test('renders escrow dashboard', () => {
  render(<EscrowDashboard />);
  expect(screen.getByText('Escrow Dashboard')).toBeInTheDocument();
});
```

## 📚 Storybook

Interactive component documentation available in Storybook:

```bash
npm run storybook
```

Visit the Dashboard section to explore all components with live examples.

## 🔧 Customization

### Custom Themes
Extend the theme system for custom branding:

```tsx
// Custom color scheme
const customChart = useChart({
  colorScheme: 'custom',
  colors: ['#your-brand-color', '#secondary-color']
});
```

### Custom Formatters
Add custom value formatters:

```tsx
<MetricCard
  title="Custom Format"
  value={1000000}
  valueFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
/>
```

### Custom Actions
Add custom actions to components:

```tsx
<MetricCard
  title="Interactive Metric"
  value={100}
  action={
    <Dropdown>
      <DropdownItem>Export</DropdownItem>
      <DropdownItem>Share</DropdownItem>
    </Dropdown>
  }
/>
```

## 🎯 Escrow-Specific Features

### Deal Status Management
Built-in support for escrow deal statuses:

```tsx
const getStatusBadge = (status) => {
  const config = {
    pending_verification: { variant: 'warning', label: 'Pending Verification' },
    funds_deposited: { variant: 'default', label: 'Funds Deposited' },
    inspection_phase: { variant: 'gold', label: 'Inspection Phase' },
    completed: { variant: 'success', label: 'Completed' }
  };
  return <Badge variant={config[status].variant}>{config[status].label}</Badge>;
};
```

### Industry Categories
Pre-configured industry categories for escrow platform:

- Real Estate
- Commodities (Gold, Silver, Precious Metals)
- Digital Assets (Cryptocurrency)
- Collectibles (Art, Vintage Items)
- Vehicles (Cars, Boats, Aircraft)

### Progress Tracking
Visual progress indicators for deal completion:

```tsx
<DataTable
  columns={[
    {
      key: 'progress',
      label: 'Progress',
      render: (value) => (
        <div className="flex items-center gap-2">
          <Progress value={value} variant="gold" />
          <Text variant="caption">{value}%</Text>
        </div>
      )
    }
  ]}
/>
```

## 🔗 Integration Examples

### With React Router
```tsx
import { Routes, Route } from 'react-router-dom';

<Routes>
  <Route path="/dashboard" element={<EscrowDashboard />} />
  <Route path="/analytics" element={<AnalyticsDashboard />} />
</Routes>
```

### With State Management
```tsx
import { useEscrowData } from './hooks/useEscrowData';

function Dashboard() {
  const { metrics, loading, error } = useEscrowData();
  
  if (loading) return <DashboardSkeleton />;
  if (error) return <ErrorState />;
  
  return <EscrowDashboard data={metrics} />;
}
```

### With Real-time Updates
```tsx
import { useWebSocket } from './hooks/useWebSocket';

function LiveDashboard() {
  const { data } = useWebSocket('/api/escrow/live');
  
  return (
    <EscrowDashboard 
      data={data}
      onTimeRangeChange={(range) => {
        // Update WebSocket subscription
        updateSubscription(range);
      }}
    />
  );
}
```

## 📈 Metrics and KPIs

### Key Performance Indicators
- **Total Escrow Value**: Sum of all active escrow amounts
- **Active Deals**: Number of currently active deals
- **Completion Rate**: Percentage of successfully completed deals
- **Average Deal Size**: Mean transaction value
- **Processing Time**: Average time from initiation to completion

### Analytics Metrics
- **Transaction Volume**: Deal volume over time
- **Industry Breakdown**: Distribution across industries
- **Regional Performance**: Geographic performance metrics
- **User Activity**: Platform usage statistics

## 🛠️ Development

### Local Development
```bash
# Install dependencies
npm install

# Start Storybook
npm run storybook

# Run tests
npm test

# Build package
npm run build
```

### Contributing
1. Follow the atomic design principles
2. Maintain accessibility standards
3. Add comprehensive tests
4. Update Storybook documentation
5. Follow TypeScript best practices

---

## 🏆 Integration Success

The dashboard system successfully integrates **slash-admin** patterns with the Gold Escrow Platform, delivering:

✅ **Professional UI Components**  
✅ **Advanced Analytics Dashboards**  
✅ **Escrow-Specific Features**  
✅ **Mobile-First Responsive Design**  
✅ **WCAG 2.1 AA Accessibility**  
✅ **Performance Optimized**  
✅ **Comprehensive Testing**  
✅ **TypeScript Support**  

**Status**: Production Ready 🚀