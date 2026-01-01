# Globe Component Suite

This directory contains the isolated, sandboxed Globe component system extracted from the main InteractiveGlobe implementation for independent debugging and development.

## Structure

```
components/globe/
├── GlobeCore.tsx          # Main isolated globe component
├── GlobeDocked.tsx         # Future floating widget implementation
├── useGlobeInteractions.ts # Reusable interaction hook
├── styles.module.css       # Isolated CSS styles
├── R3FEnhancedArc.tsx      # Enhanced arc rendering (existing)
├── CityNode.tsx           # City marker component (existing)
├── ArcPulse.tsx           # Arc pulse effects (existing)
├── ParticleTrail.tsx      # Particle trail effects (existing)
├── ArcTooltip.tsx         # Arc tooltip component (existing)
├── RegionalPanel.tsx      # Regional stats panel (existing)
└── LiveMetricsDock.tsx    # Live metrics display (existing)
```

## Components

### GlobeCore.tsx

The main isolated globe component with all fixes applied:

**Key Features:**
- ✅ Cursor-responsive rotation (desktop only)
- ✅ Auto-rotation when idle
- ✅ Scroll compatibility (pointer-events properly handled)
- ✅ WebGL context cleanup
- ✅ Memory leak prevention
- ✅ Device-optimized performance

**Props:**
```typescript
interface GlobeCoreProps {
  mode?: 'hero' | 'widget';
  onCityClick?: (city: CityData) => void;
  selectedCity?: CityData | null;
  className?: string;
  enableCursorRotation?: boolean;
  enableAutoRotation?: boolean;
  enableScrollEffects?: boolean;
}
```

**Fixed Issues:**
1. Pointer events blocking scroll - Fixed with `pointer-events: none` in hero mode
2. WebGL context management - Proper cleanup on unmount
3. Scroll hijacking - Passive event listeners and disabled R3F events
4. Memory leaks - All animation frames and listeners properly cleaned up

### GlobeDocked.tsx

Future implementation for a floating, docked globe widget. Ready for Phase 3 integration.

**Features:**
- Floating widget positioning (bottom-right, bottom-left, etc.)
- Size variants (small, medium, large)
- Expand to full-screen capability
- Smooth animations

### useGlobeInteractions.ts

Reusable hook for globe interaction logic. Can be used across different globe implementations.

**Returns:**
- `mousePosition`: Normalized mouse coordinates (-1 to 1)
- `isCursorActive`: Whether cursor rotation is active
- `rotation`: Current rotation state

## Test Page

### `/globe-playground.tsx`

A dedicated test page for debugging the Globe component:

**Features:**
- Full-screen globe rendering
- Scrollable test content
- Debug controls panel
- Performance monitoring guidance

**Access:** Navigate to `/globe-playground` in your browser

## Usage

### Basic Usage

```tsx
import GlobeCore from '@/components/globe/GlobeCore';

<GlobeCore 
  mode="hero"
  enableCursorRotation={true}
  enableAutoRotation={true}
/>
```

### With Interactions Hook

```tsx
import { useGlobeInteractions } from '@/components/globe/useGlobeInteractions';

const { mousePosition, isCursorActive, rotation } = useGlobeInteractions({
  globeRef,
  enabled: true,
  mode: 'hero',
  device: deviceInfo,
  enableCursorRotation: true,
  enableAutoRotation: true,
});
```

### Docked Widget (Future)

```tsx
import GlobeDocked from '@/components/globe/GlobeDocked';

<GlobeDocked
  visible={true}
  position="bottom-right"
  size="medium"
  opacity={0.8}
  onExpand={() => setFullScreen(true)}
/>
```

## Root Causes & Fixes

### 1. Pointer Events Blocking Scroll

**Problem:** Canvas elements were capturing pointer events, preventing page scroll.

**Fix:**
- Set `pointer-events: none` on hero mode containers
- Disabled R3F event system in hero mode (`events={false}`)
- Used CSS classes for proper cascade

### 2. WebGL Context Management

**Problem:** Multiple WebGL contexts created without proper cleanup, causing memory leaks.

**Fix:**
- Proper cleanup in `useEffect` return function
- Dispose geometries and materials on unmount
- Dispose renderer properly

### 3. Scroll Hijacking

**Problem:** Framer-motion scroll tracking was interfering with native scroll behavior.

**Fix:**
- Used passive event listeners (`{ passive: true }`)
- Separated scroll tracking from pointer event handling
- Disabled R3F events in hero mode

### 4. Memory Leaks

**Problem:** Animation frames and event listeners not cancelled on unmount.

**Fix:**
- All `requestAnimationFrame` calls properly cancelled
- Event listeners removed in cleanup
- Timeouts cleared

## Dependencies

- `react-globe.gl`: ^2.35.0 - Base globe rendering
- `@react-three/fiber`: ^8.15.0 - Enhanced arcs overlay
- `@react-three/drei`: ^9.88.0 - R3F utilities
- `three`: ^0.158.0 - WebGL library
- `framer-motion`: ^10.16.0 - Scroll-driven animations

## Next Steps

1. **Scroll-driven Integration:** Implement GSAP ScrollTrigger for phase transitions
2. **Widget Docking:** Complete GlobeDocked implementation and integration
3. **Performance Optimization:** Further optimize for low-end devices
4. **Testing:** Add unit tests for interaction logic
5. **Documentation:** Add JSDoc comments to all public APIs

## Performance Notes

- Low-end devices: Reduced effects, lower DPR, simplified animations
- Mobile devices: Touch-optimized, reduced particle counts
- Desktop: Full effects, high DPR, all animations enabled

## Browser Compatibility

- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support (may need WebGL context loss handling)
- Mobile browsers: Optimized for touch devices

