export type Position = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'middle-center';

export type BlendMode = 'normal' | 'multiply' | 'screen' | 'overlay' | 'darken' | 'lighten' | 'color-dodge' | 'color-burn' | 'hard-light' | 'soft-light' | 'difference' | 'exclusion' | 'hue' | 'saturation' | 'color' | 'luminosity';

export interface CustomFont {
  name: string;
  url: string;
  isNew?: boolean;
  uploadedAt: string;
}

export interface WatermarkHistory {
  id: string;
  timestamp: string;
  settings: WatermarkSettings;
}

export interface RecentSession {
  id: string;
  date: string;
  imageCount: number;
  settings: WatermarkSettings;
}

export interface WatermarkSettings {
  size: number;
  opacity: number;
  rotation: number;
  quantity: number;
  position: Position;
  customPosition?: { x: number; y: number };
  pattern: 'single' | 'grid' | 'diagonal' | 'wave' | 'circular' | 'random';
  spacing: number;
  edgeMargin: number;
  text?: string;
  fontFamily: string;
  fontSize: number;
  fontColor: string;
  customFonts: CustomFont[];
  snapToGrid: boolean;
  gridSize: number;
  blendMode: BlendMode;
  colorTint?: string;
  embossed: boolean;
  distortionAmount: number;
  invertColors: boolean;
  transparencyGradient: boolean;
  maskShape?: 'none' | 'circle' | 'square' | 'diamond';
  effects: {
    blur: number;
    shadow: boolean;
    shadowColor: string;
    shadowBlur: number;
    shadowOffset: { x: number; y: number };
    stroke: boolean;
    strokeColor: string;
    strokeWidth: number;
    noise: number;
    glowColor: string;
    glowIntensity: number;
    glowSpread: number;
    glow?: boolean;
    embossDepth: number;
    embossColor: string;
    waveAmplitude: number;
    waveFrequency: number;
  };
}