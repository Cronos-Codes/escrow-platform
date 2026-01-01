import * as THREE from 'three';

/**
 * Color palette configuration for day/night themes
 */
export interface ThemePalette {
  arcStart: THREE.Color;
  arcEnd: THREE.Color;
  pulseColor: THREE.Color;
  waveColor: THREE.Color;
  glowIntensity: number;
}

/**
 * Day theme: Warm golds and soft whites
 */
export const DAY_PALETTE: ThemePalette = {
  arcStart: new THREE.Color(0xE0C070), // Warm gold
  arcEnd: new THREE.Color(0xFFF9E3),   // Soft white/cream
  pulseColor: new THREE.Color(0xFFD700), // Pure gold
  waveColor: new THREE.Color(0xFFFFFF), // White wave
  glowIntensity: 0.7,
};

/**
 * Night theme: Cooler tones with cyan highlights
 */
export const NIGHT_PALETTE: ThemePalette = {
  arcStart: new THREE.Color(0xFFD700), // Gold
  arcEnd: new THREE.Color(0x00E0FF),   // Cyan
  pulseColor: new THREE.Color(0xFFD700), // Gold pulse
  waveColor: new THREE.Color(0x00E0FF), // Cyan wave
  glowIntensity: 1.0, // Higher glow at night
};

/**
 * Detect if current time is night (6 PM - 6 AM)
 */
export function isNightTime(): boolean {
  const hour = new Date().getHours();
  return hour >= 18 || hour < 6;
}

/**
 * Detect system theme preference
 */
export function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') {
    return 'light';
  }
  
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  return prefersDark ? 'dark' : 'light';
}

/**
 * Get theme palette based on time and system preference
 */
export function getThemePalette(override?: 'day' | 'night'): ThemePalette {
  if (override === 'day') {
    return DAY_PALETTE;
  }
  if (override === 'night') {
    return NIGHT_PALETTE;
  }
  
  // Auto-detect based on time and system preference
  const systemTheme = getSystemTheme();
  const isNight = isNightTime();
  
  // Use night palette if it's night time OR system prefers dark mode
  if (isNight || systemTheme === 'dark') {
    return NIGHT_PALETTE;
  }
  
  return DAY_PALETTE;
}

/**
 * Interpolate between two palettes (for smooth transitions)
 */
export function interpolatePalettes(
  paletteA: ThemePalette,
  paletteB: ThemePalette,
  t: number
): ThemePalette {
  const clampedT = Math.max(0, Math.min(1, t));
  
  return {
    arcStart: paletteA.arcStart.clone().lerp(paletteB.arcStart, clampedT),
    arcEnd: paletteA.arcEnd.clone().lerp(paletteB.arcEnd, clampedT),
    pulseColor: paletteA.pulseColor.clone().lerp(paletteB.pulseColor, clampedT),
    waveColor: paletteA.waveColor.clone().lerp(paletteB.waveColor, clampedT),
    glowIntensity: paletteA.glowIntensity + (paletteB.glowIntensity - paletteA.glowIntensity) * clampedT,
  };
}

/**
 * Get transaction status-based color override
 */
export function getStatusColors(status: 'active' | 'completed' | 'disputed'): {
  start: THREE.Color;
  end: THREE.Color;
} {
  switch (status) {
    case 'active':
      return {
        start: new THREE.Color(0xD4AF37), // Gold Escrow gold
        end: new THREE.Color(0xFFFFFF),   // White
      };
    case 'completed':
      return {
        start: new THREE.Color(0x10B981), // Emerald
        end: new THREE.Color(0xFFFFFF),   // White
      };
    case 'disputed':
      return {
        start: new THREE.Color(0xF59E0B), // Amber
        end: new THREE.Color(0xEF4444),   // Crimson
      };
    default:
      return {
        start: new THREE.Color(0xD4AF37),
        end: new THREE.Color(0xFFFFFF),
      };
  }
}

