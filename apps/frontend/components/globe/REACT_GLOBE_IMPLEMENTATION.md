# GlobeWithArcs Implementation

## Overview

This implementation is based on the [react-globe.gl random arcs example](https://vasturiano.github.io/react-globe.gl/example/random-arcs/) and adapted with our custom cities, styling, and features.

## Implementation Details

### Based on Random Arcs Example

The component follows the pattern from the official react-globe.gl random arcs example, which demonstrates:
- Animated arcs with traveling pulses
- Dashed arc animations
- Gradient colors from start to end
- Smooth arc rendering

### Custom Additions

1. **Custom Cities** - Using our `GlobeData.ts` with 10 real cities:
   - Nairobi, Kampala, Lagos, Johannesburg (Africa)
   - Dubai (Middle East)
   - London (Europe)
   - New York (North America)
   - Singapore, Tokyo (Asia)
   - Sydney (Oceania)

2. **Custom Arc Connections** - 8 arcs connecting our cities:
   - Dubai ↔ London
   - Dubai ↔ Singapore
   - London ↔ New York
   - Singapore ↔ Tokyo
   - Nairobi ↔ Dubai
   - Lagos ↔ London
   - Johannesburg ↔ Sydney
   - Tokyo ↔ New York

3. **Custom Styling**:
   - Gold color scheme (#D4AF37)
   - Custom atmosphere color
   - Device-optimized rendering
   - Scroll compatibility (pointer-events: none in hero mode)

4. **Enhanced Features**:
   - Cursor-responsive rotation
   - Auto-rotation when cursor idle
   - City hover tooltips
   - City click handlers
   - Transaction count and value display

## Key Features

### ✅ Animated Arcs
- Traveling pulse effect using `arcDashAnimateTime`
- Staggered start times for organic animation
- Gradient colors from start to end city
- Customizable stroke width and dash patterns

### ✅ City Markers
- Pulsing points with size based on transaction count
- Hover effects with color change
- HTML tooltips showing city details
- Click handlers (disabled in hero mode for scroll compatibility)

### ✅ Cursor Interaction
- Smooth rotation based on mouse position
- Auto-rotation when cursor idle (2s timeout)
- Device-optimized sensitivity

### ✅ Scroll Compatibility
- `pointer-events: none` in hero mode
- No scroll hijacking
- Smooth page scrolling maintained

## Usage

```tsx
import HeroGlobe from '@/components/home/HeroGlobe';

<HeroGlobe
  mode="hero"
  enableCursorRotation={true}
  enableAutoRotation={true}
  onCityClick={(cityId) => console.log('City clicked:', cityId)}
/>
```

## Configuration

### Arc Properties (from random arcs example)

```typescript
{
  startLat: number,
  startLng: number,
  endLat: number,
  endLng: number,
  color: [string, string], // Gradient from start to end
  stroke: number,          // Arc thickness
  dashLength: number,      // Length of dash segments
  dashGap: number,         // Gap between dashes
  dashAnimateTime: number, // Animation duration (staggered)
}
```

### Point Properties

```typescript
{
  lat: number,
  lng: number,
  size: number,            // Based on transaction count
  color: string,           // Gold or hover color
  city: City,              // Full city data
}
```

## Performance Optimizations

- Device-aware rendering (low-end devices get reduced effects)
- Memoized arc and point data
- Efficient animation frame management
- Proper cleanup on unmount

## Reference

- **Example**: https://vasturiano.github.io/react-globe.gl/example/random-arcs/
- **Documentation**: https://github.com/vasturiano/react-globe.gl
- **Library**: react-globe.gl ^2.35.0

## Next Steps

1. Test in browser
2. Adjust arc colors/styling as needed
3. Add more cities/arcs if desired
4. Fine-tune animation speeds
5. Add scroll-driven transitions (future)

---

**Status**: ✅ Ready for Testing
**Based on**: react-globe.gl Random Arcs Example

