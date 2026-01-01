# Dashboard Configuration

This directory contains centralized configuration constants for the dashboard components.

## Files

### `dashboard-constants.ts`

Centralized configuration values to avoid magic numbers and improve maintainability.

#### Usage Example

```typescript
import { DRAWER_WIDTH, KPI_COLORS, formatCurrency } from '../config/dashboard-constants';

// Use in component
const MyComponent = () => {
  return (
    <Drawer width={DRAWER_WIDTH}>
      <Box sx={{ color: KPI_COLORS.wallet }}>
        Wallet Balance
      </Box>
    </Drawer>
  );
};
```

#### Constants Available

**Layout Dimensions**
- `DRAWER_WIDTH` - Standard drawer width (260px)
- `DRAWER_WIDTH_LARGE` - Large drawer width (280px)
- `DEFAULT_CHART_HEIGHT` - Default chart height (320px)
- `CHART_MARGIN` - Standard chart margins

**Animation**
- `ANIMATION_DELAY_BASE` - Base delay for staggered animations
- `ANIMATION_DURATION` - Standard animation duration

**Pagination**
- `DEFAULT_MAX_TRANSACTIONS` - Max transactions to display (5)
- `DEFAULT_MAX_ESCROWS` - Max escrows to display (4)

**Refresh Intervals**
- `WALLET_BALANCE_REFRESH_INTERVAL` - Wallet refresh rate (30s)
- `DASHBOARD_AUTO_REFRESH_INTERVAL` - Dashboard refresh rate (60s)

**Formatting**
- `DEFAULT_CURRENCY` - Default currency code ('USD')
- `CURRENCY_MIN_FRACTION_DIGITS` - Min decimal places (2)
- `CURRENCY_MAX_FRACTION_DIGITS` - Max decimal places (2)
- `DATE_FORMAT_OPTIONS` - Standard date format options

**Colors**
- `KPI_COLORS` - Color scheme for KPI cards
- `STATUS_COLORS` - Status badge colors
- `KYC_COLORS` - KYC level colors

**Options**
- `TIMEFRAME_OPTIONS` - Available timeframe selections
- `EXPORT_FORMATS` - Supported export formats

## Best Practices

1. **Always import constants** instead of hardcoding values
2. **Update constants** when changing design system values
3. **Document new constants** with comments
4. **Use TypeScript types** for type safety (e.g., `ExportFormat`)

## Adding New Constants

When adding new constants:

1. Add to appropriate section in `dashboard-constants.ts`
2. Add JSDoc comment explaining the constant
3. Export as `const` or `as const` for literal types
4. Update this README with usage example

## Related Files

- `../utils/formatters.ts` - Formatting utilities that use these constants
- `../components/dashboard/` - Dashboard components using these constants
