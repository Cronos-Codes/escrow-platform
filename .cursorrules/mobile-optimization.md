# MOBILE-FIRST OPTIMIZATION RULES
# These rules ensure all components and features are optimized for mobile devices without compromising quality.

## Core Mobile-First Principles

### 1. Device Detection & Optimization
- ALWAYS implement advanced device detection for mobile, tablet, low-end devices, and touch capabilities
- Use `navigator.hardwareConcurrency`, `navigator.deviceMemory`, and user agent analysis for low-end device detection
- Respect `prefers-reduced-motion` accessibility settings
- Implement different performance tiers based on device capabilities

### 2. Performance Optimization (WITHOUT Quality Reduction)
- Mobile devices get optimized animations, NOT removed animations
- Use device-specific spring configurations (lower stiffness/higher damping for low-end devices)
- Disable resource-intensive effects (backdrop-blur, complex transforms) only on low-end devices
- Implement conditional hover states (disabled on touch devices)
- Use smaller margins/padding on mobile while maintaining visual hierarchy

### 3. Animation Strategy by Device Type
**Low-End Devices:**
- Static transforms where possible
- Simplified spring animations (stiffness: 200, damping: 50)
- No backdrop-blur effects
- Reduced motion respect

**Mobile Devices:**
- Optimized animations with reduced complexity
- Touch-friendly interactions (larger touch targets, lower drag thresholds)
- Balanced spring animations (stiffness: 280, damping: 45)
- Simplified but still engaging visual effects

**Desktop Devices:**
- Full-fidelity animations and effects
- Complex spring animations (stiffness: 350, damping: 40)
- Advanced visual effects (backdrop-blur, complex transforms)
- Hover states and cursor interactions

### 4. Layout Optimization
- Use device-specific grid layouts:
  - Mobile: `grid-cols-1 gap-4`
  - Tablet: `grid-cols-2 gap-5`
  - Desktop: `grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6`
- Responsive text sizing: `${device.isMobile ? 'text-base' : 'text-lg'}`
- Conditional positioning (no x/y transforms on mobile for performance)

### 5. Interaction Model
**Touch Devices:**
- Lower drag thresholds (50px instead of 100px)
- Tap-based interactions as primary method
- No hover events (use undefined for onHoverStart/onHoverEnd)
- Simplified gesture recognition

**Mouse Devices:**
- Higher precision drag thresholds
- Hover states for enhanced feedback
- Complex mouse tracking and container boundary detection

### 6. Code Implementation Patterns

```typescript
// ALWAYS use device optimization hook
const device = useDeviceOptimization();

// Conditional animations
animate={device.isLowEnd || device.reducedMotion ? {} : {
  scale: [1, 1.02, 1],
  rotate: [0, 1, 0]
}}

// Device-specific styling
className={`${device.isMobile ? 'p-4' : 'p-6'} ${device.isLowEnd ? '' : 'backdrop-blur-xl'}`}

// Conditional event handlers
onHoverStart={device.isMobile || device.supportsTouch ? undefined : handleHover}

// Responsive spring configs
const springConfig = device.isLowEnd 
  ? { stiffness: 200, damping: 50 }
  : device.isMobile 
    ? { stiffness: 280, damping: 45 }
    : { stiffness: 350, damping: 40 };
```

### 7. Quality Maintenance Rules
- NEVER remove features for mobile - optimize them
- NEVER sacrifice visual appeal - adapt it intelligently
- ALWAYS maintain interaction quality across all devices
- ALWAYS provide appropriate feedback for touch interactions
- ALWAYS respect accessibility preferences

### 8. Testing Requirements
- Test on actual mobile devices, not just browser dev tools
- Verify performance on low-end Android devices
- Ensure touch interactions work smoothly
- Validate that reduced motion settings are respected
- Check that layouts work across different screen sizes

### 9. Performance Monitoring
- Monitor frame rates on mobile devices
- Track gesture response times
- Measure animation smoothness
- Profile memory usage on low-end devices

### 10. Mandatory Implementation Checklist
✅ Advanced device detection implemented
✅ Device-specific animation configurations
✅ Responsive layouts and text sizing
✅ Touch-optimized interaction thresholds
✅ Conditional hover state handling
✅ Performance-aware effect implementation
✅ Accessibility compliance (reduced motion)
✅ Progressive enhancement approach
✅ Mobile-first CSS and styling
✅ Cross-device testing completed

## NEVER DO:
- Remove animations entirely for mobile
- Use generic "isMobile" checks without considering device capabilities
- Ignore low-end device performance
- Implement desktop-only features without mobile alternatives
- Use fixed layouts that don't adapt to screen size
- Apply hover states to touch devices
- Ignore accessibility preferences

## ALWAYS DO:
- Implement sophisticated device detection
- Provide optimized experiences for each device tier
- Maintain visual quality across all devices
- Use progressive enhancement approaches
- Test on real devices
- Respect user accessibility preferences
- Optimize performance without sacrificing functionality
