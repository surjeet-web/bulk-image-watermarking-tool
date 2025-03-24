import { useLocalStorage } from './useLocalStorage';
import { WatermarkSettings, RecentSession } from '../types/watermark';

const DEFAULT_SETTINGS: WatermarkSettings = {
  size: 25,
  opacity: 70,
  rotation: 0,
  quantity: 1,
  position: 'bottom-right',
  pattern: 'single',
  spacing: 20,
  edgeMargin: 20,
  text: '',
  fontFamily: 'Arial',
  fontSize: 24,
  fontColor: '#ffffff',
  customFonts: [], // Initialize as empty array
  snapToGrid: false,
  gridSize: 10,
  blendMode: 'normal',
  colorTint: undefined,
  embossed: false,
  distortionAmount: 0,
  invertColors: false,
  transparencyGradient: false,
  maskShape: 'none',
  effects: {
    blur: 0,
    shadow: false,
    shadowColor: '#000000',
    shadowBlur: 5,
    shadowOffset: { x: 0, y: 0 },
    stroke: false,
    strokeColor: '#000000',
    strokeWidth: 1,
    noise: 0,
    glowColor: '#ffffff',
    glowIntensity: 50,
    glowSpread: 10,
    embossDepth: 5,
    embossColor: '#ffffff',
    waveAmplitude: 20,
    waveFrequency: 0.02
  }
};

export function useWatermarkStorage() {
  const [settings, setSettings] = useLocalStorage<WatermarkSettings>(
    'watermark-settings',
    DEFAULT_SETTINGS
  );

  const [recentSessions, setRecentSessions] = useLocalStorage<RecentSession[]>(
    'recent-sessions',
    []
  );

  const addSession = (imageCount: number, settings: WatermarkSettings) => {
    const newSession: RecentSession = {
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      imageCount,
      settings
    };

    setRecentSessions(prev => {
      const updated = [newSession, ...prev].slice(0, 5);
      return updated;
    });
  };

  const clearSessions = () => {
    setRecentSessions([]);
  };

  return {
    settings,
    setSettings,
    recentSessions,
    addSession,
    clearSessions
  };
}