export type CongestionLevel = 'Low' | 'Moderate' | 'High' | 'Severe';

export type WeatherCondition = 'Clear' | 'Rain' | 'Heavy Rain' | 'Fog' | 'Snow';

export type RoadType = 'Highway' | 'Arterial' | 'Downtown Collector' | 'Tunnel/Bridge';

export interface TrafficRecord {
  id: string;
  timestamp: string;
  junctionId: string;
  junctionName: string;
  latitude: number;
  longitude: number;
  roadType: RoadType;
  lanes: number;
  vehicleVolume: number; // vehicles per hour
  averageSpeed: number; // km/h
  freeFlowSpeed: number; // km/h
  occupancyPct: number; // 0 - 100%
  weather: WeatherCondition;
  temperature: number; // Celsius
  precipitationMm: number;
  dayOfWeek: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
  hour: number; // 0 - 23
  isWeekend: boolean;
  isRushHour: boolean;
  incidentReported: boolean;
  congestionLevel: CongestionLevel;
  travelTimeIndex: number; // TTI = Free flow time / actual time (>= 1.0)
  hotspotScore: number; // 0 - 100
}

export interface JunctionInfo {
  id: string;
  name: string;
  code: string;
  latitude: number;
  longitude: number;
  roadType: RoadType;
  lanes: number;
  speedLimit: number;
  zone: string;
  xPct: number; // visual map coordinates (0-100)
  yPct: number;
}

export interface PredictionFeatures {
  junctionId: string;
  hour: number;
  dayOfWeek: string;
  isRushHour: boolean;
  weather: WeatherCondition;
  vehicleVolume: number;
  roadType: RoadType;
  lanes: number;
  incidentReported: boolean;
  temperature: number;
}

export interface PredictionResult {
  predictedCongestion: CongestionLevel;
  confidence: number;
  predictedSpeed: number;
  freeFlowSpeed: number;
  travelTimeIndex: number;
  estimatedDelayMinutes: number;
  congestionProbability: {
    Low: number;
    Moderate: number;
    High: number;
    Severe: number;
  };
  keyDrivers: { feature: string; impact: string; weight: number }[];
}

export interface RecommendationAction {
  id: string;
  category: 'Signal Timing' | 'Dynamic Routing' | 'Speed Advisory' | 'Incident Management' | 'Transit Surge';
  priority: 'Critical' | 'High' | 'Medium' | 'Standard';
  targetJunction: string;
  actionTitle: string;
  description: string;
  expectedOutcome: string;
  estimatedSpeedGainKmH: number;
  delayReductionPct: number;
  implementationTime: string;
}
