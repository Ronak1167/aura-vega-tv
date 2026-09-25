/**
 * Aura Vega TV - Time of Day Ambient Theme Engine
 * Maps local hour to dynamic ambient palette and particle configuration.
 */

export type AmbientPeriod = 'dawn' | 'day' | 'golden_hour' | 'night';

export interface AmbientTheme {
  period: AmbientPeriod;
  greeting: string;
  gradientColors: [string, string, string];
  particleColors: string[];
  particleSpeed: number;
  moodDescription: string;
}

export function getAmbientTheme(date: Date = new Date()): AmbientTheme {
  const hour = date.getHours();

  if (hour >= 5 && hour < 8) {
    return {
      period: 'dawn',
      greeting: 'Good Morning',
      gradientColors: ['#1A1028', '#2B1438', '#0B0E17'],
      particleColors: ['#FF9966', '#FF5E62', '#00E5FF'],
      particleSpeed: 0.8,
      moodDescription: 'Gentle sunrise aura for early morning awakenings',
    };
  } else if (hour >= 8 && hour < 17) {
    return {
      period: 'day',
      greeting: 'Good Afternoon',
      gradientColors: ['#0B1B2B', '#102B44', '#080E18'],
      particleColors: ['#00E5FF', '#38EF7D', '#11998E'],
      particleSpeed: 1.0,
      moodDescription: 'Vibrant daytime clarity for living room energy',
    };
  } else if (hour >= 17 && hour < 20) {
    return {
      period: 'golden_hour',
      greeting: 'Good Evening',
      gradientColors: ['#281810', '#3D2014', '#0B0E17'],
      particleColors: ['#FF9900', '#FF5500', '#FFCC00'],
      particleSpeed: 0.7,
      moodDescription: 'Warm golden hour transitions for unwinding',
    };
  } else {
    return {
      period: 'night',
      greeting: 'Good Night',
      gradientColors: ['#080A12', '#0D1322', '#05070B'],
      particleColors: ['#00E5FF', '#7F00FF', '#0072FF'],
      particleSpeed: 0.5,
      moodDescription: 'Calm OLED-deep cosmic stillness for night-time rest',
    };
  }
}
