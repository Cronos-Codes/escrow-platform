// TypeScript declarations for WebGL Fluid Simulation

interface FluidConfig {
  SIM_RESOLUTION: number;
  DYE_RESOLUTION: number;
  CAPTURE_RESOLUTION: number;
  DENSITY_DISSIPATION: number;
  VELOCITY_DISSIPATION: number;
  PRESSURE: number;
  PRESSURE_ITERATIONS: number;
  CURL: number;
  SPLAT_RADIUS: number;
  SPLAT_FORCE: number;
  SHADING: boolean;
  COLORFUL: boolean;
  COLOR_UPDATE_SPEED: number;
  PAUSED: boolean;
  BACK_COLOR: { r: number; g: number; b: number };
  TRANSPARENT: boolean;
  BLOOM: boolean;
  BLOOM_ITERATIONS: number;
  BLOOM_RESOLUTION: number;
  BLOOM_INTENSITY: number;
  BLOOM_THRESHOLD: number;
  BLOOM_SOFT_KNEE: number;
  SUNRAYS: boolean;
  SUNRAYS_RESOLUTION: number;
  SUNRAYS_WEIGHT: number;
  SOUND_SENSITIVITY: number;
  FREQ_RANGE: number;
  FREQ_MULTI: number;
}

interface Window {
  fluidConfig?: FluidConfig;
  livelyPropertyListener?: (name: string, val: any) => void;
  livelyWallpaperPlaybackChanged?: (data: string) => void;
  livelyAudioListener?: (audioArray: number[]) => void;
  fluidInitialized?: boolean;
}
