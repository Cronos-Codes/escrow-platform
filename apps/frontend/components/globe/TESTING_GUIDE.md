# Testing Guide for GlobeWithArcs

## Quick Start

### Option 1: Dedicated Test Page (Recommended)

1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **Navigate to the test page:**
   ```
   http://localhost:3000/globe-arcs-test
   ```

3. **Test the features:**
   - Globe should render with Earth texture
   - 8 animated arcs should be visible
   - 10 city markers should pulse
   - Move mouse to rotate globe
   - Scroll page to verify scroll compatibility
   - Hover over cities to see tooltips
   - Click cities in widget mode

### Option 2: Update Existing Playground

Update `/pages/globe-playground.tsx` to use `HeroGlobe` instead of `GlobeCore`:

```tsx
import HeroGlobe from '../components/home/HeroGlobe';

// Replace GlobeCoreDynamic with:
<HeroGlobeDynamic
  mode={mode}
  enableCursorRotation={enableCursorRotation}
  enableAutoRotation={enableAutoRotation}
/>
```

### Option 3: Test in Homepage

Replace `InteractiveGlobe` in `Hero.tsx`:

```tsx
import HeroGlobe from './HeroGlobe';

// Replace InteractiveGlobe with:
<HeroGlobe 
  mode="hero"
  enableCursorRotation={true}
  enableAutoRotation={true}
/>
```

## Testing Checklist

### Visual Tests

- [ ] Globe renders correctly
- [ ] Earth texture loads (night texture in hero mode)
- [ ] 8 arcs are visible and animated
- [ ] Arcs have traveling pulse effect
- [ ] 10 city markers are visible
- [ ] City markers pulse with animation
- [ ] Atmospheric glow is visible (hero mode)

### Interaction Tests

- [ ] Cursor movement rotates globe (desktop)
- [ ] Auto-rotation works when cursor idle (2s timeout)
- [ ] City hover shows tooltip with details
- [ ] City click works in widget mode (disabled in hero mode)
- [ ] Page scrolls smoothly (no scroll lock)
- [ ] No pointer events blocking scroll in hero mode

### Performance Tests

- [ ] FPS remains stable (~60fps)
- [ ] No WebGL errors in console
- [ ] No memory leaks (check DevTools Memory tab)
- [ ] Smooth animations without jank
- [ ] Arc animations are smooth and continuous

### Browser Compatibility

- [ ] Chrome/Edge: Full support
- [ ] Firefox: Full support
- [ ] Safari: Full support
- [ ] Mobile: Touch devices work correctly

## Debug Controls

The test page includes a control panel with:

- **Mode Toggle**: Switch between 'hero' and 'widget' modes
- **Cursor Rotation**: Enable/disable cursor-responsive rotation
- **Auto Rotation**: Enable/disable auto-rotation
- **Clicked City Display**: Shows last clicked city

## Console Logging

City clicks are logged to console:
```javascript
City clicked: dubai
```

## Common Issues

### Globe Not Rendering
- Check browser console for errors
- Verify `react-globe.gl` is installed
- Check network tab for texture loading

### Arcs Not Animating
- Verify `arcDashAnimateTime` is set correctly
- Check that arcs data is properly formatted
- Ensure globe is loaded (`onGlobeReady` fired)

### Scroll Not Working
- Verify `pointer-events: none` in hero mode
- Check that canvas isn't capturing events
- Ensure no event listeners are blocking scroll

### Performance Issues
- Reduce number of arcs for low-end devices
- Check device optimization settings
- Monitor FPS in DevTools

## Next Steps

After testing:
1. Adjust arc colors/styling if needed
2. Fine-tune animation speeds
3. Add more cities/arcs if desired
4. Integrate into homepage
5. Add scroll-driven transitions (future)

---

**Test Page**: `/globe-arcs-test`
**Component**: `GlobeWithArcs`
**Based on**: [react-globe.gl Random Arcs Example](https://vasturiano.github.io/react-globe.gl/example/random-arcs/)

