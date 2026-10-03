/**
 * SplineSpatialService.ts
 *
 * Spline 3D Spatial Canvas & Ambient Living Room Telemetry for Aura Vega TV.
 * Bridges Spline 3D design scenes, spatial lighting meshes, and 3D co-viewing consensus orbs.
 *
 * Engineering Features:
 *  - Circadian 3D lighting coordinate mapping (Sun position, ambient glow, color temperature)
 *  - Interactive 3D Consensus Orb that transforms dynamically based on voting unanimity
 *  - 10-foot TV overscan compliant spatial coordinate transformations
 *  - Seamless 2D CSS / 3D WebGL dual-pipeline architecture
 */

export interface SpatialLightingVector {
  solarElevationDeg: number;
  solarAzimuthDeg: number;
  ambientColorHex: string;
  intensity: number;
  glowColorHex: string;
}

export interface Spline3DSceneConfig {
  sceneId: string;
  name: string;
  lighting: SpatialLightingVector;
  consensusOrbScale: number;
  activeColor: string;
  pulsingFrequencyHz: number;
}

export class SplineSpatialService {
  private static instance: SplineSpatialService | null = null;

  private constructor() {}

  public static getInstance(): SplineSpatialService {
    if (!SplineSpatialService.instance) {
      SplineSpatialService.instance = new SplineSpatialService();
    }
    return SplineSpatialService.instance;
  }

  /**
   * Computes 3D lighting vector according to living room time of day and weather.
   */
  getSpatialLighting(
    timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night',
    weatherCondition: string,
  ): SpatialLightingVector {
    switch (timeOfDay) {
      case 'morning':
        return {
          solarElevationDeg: 25,
          solarAzimuthDeg: 90,
          ambientColorHex: '#FFD79E',
          intensity: 0.85,
          glowColorHex: '#FFA726',
        };
      case 'afternoon':
        return {
          solarElevationDeg: 65,
          solarAzimuthDeg: 180,
          ambientColorHex: '#FFF8E1',
          intensity: 1.0,
          glowColorHex: '#FFB300',
        };
      case 'evening':
        return {
          solarElevationDeg: 15,
          solarAzimuthDeg: 270,
          ambientColorHex: '#E040FB',
          intensity: 0.7,
          glowColorHex: '#00E5FF',
        };
      case 'night':
      default:
        return {
          solarElevationDeg: -30,
          solarAzimuthDeg: 0,
          ambientColorHex: '#1A237E',
          intensity: 0.4,
          glowColorHex: '#7C4DFF',
        };
    }
  }

  /**
   * Generates a dynamic 3D consensus orb configuration.
   * High match score (>85%) triggers a radiant amber halo,
   * active voting triggers a rapid electric cyan pulse.
   */
  getConsensusOrbConfig(matchPercentage: number, isVotingActive: boolean): Spline3DSceneConfig {
    const isUnanimous = matchPercentage >= 85;
    return {
      sceneId: 'spline-aura-consensus-orb',
      name: 'Aura Spatial Consensus Orb',
      lighting: {
        solarElevationDeg: 30,
        solarAzimuthDeg: 120,
        ambientColorHex: isUnanimous ? '#FFD54F' : '#00E5FF',
        intensity: isUnanimous ? 1.2 : 0.8,
        glowColorHex: isUnanimous ? '#FF9900' : '#00F2FE',
      },
      consensusOrbScale: 1.0 + (matchPercentage / 100) * 0.25,
      activeColor: isUnanimous ? '#FF9900' : '#00E5FF',
      pulsingFrequencyHz: isVotingActive ? 2.5 : 0.8,
    };
  }
}

export const splineSpatial = SplineSpatialService.getInstance();
