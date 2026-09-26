import { TrafficRecord, JunctionInfo, CongestionLevel, WeatherCondition, RoadType } from '../types/traffic';

export const JUNCTIONS: JunctionInfo[] = [
  {
    id: 'J-01',
    name: 'Metro Central Interchange',
    code: 'MCI-01',
    latitude: 37.7749,
    longitude: -122.4194,
    roadType: 'Highway',
    lanes: 8,
    speedLimit: 90,
    zone: 'Downtown Core',
    xPct: 52,
    yPct: 48,
  },
  {
    id: 'J-02',
    name: 'North Ring Expressway',
    code: 'NRE-02',
    latitude: 37.7985,
    longitude: -122.4082,
    roadType: 'Highway',
    lanes: 6,
    speedLimit: 100,
    zone: 'Northern Corridor',
    xPct: 70,
    yPct: 20,
  },
  {
    id: 'J-03',
    name: 'Financial Tech Corridor',
    code: 'FTC-03',
    latitude: 37.7892,
    longitude: -122.4014,
    roadType: 'Downtown Collector',
    lanes: 4,
    speedLimit: 50,
    zone: 'Business District',
    xPct: 62,
    yPct: 36,
  },
  {
    id: 'J-04',
    name: 'Harbor Tunnel Approach',
    code: 'HTA-04',
    latitude: 37.7654,
    longitude: -122.3887,
    roadType: 'Tunnel/Bridge',
    lanes: 4,
    speedLimit: 70,
    zone: 'Waterfront Transit',
    xPct: 82,
    yPct: 58,
  },
  {
    id: 'J-05',
    name: 'South Bridge Overpass',
    code: 'SBO-05',
    latitude: 37.7421,
    longitude: -122.4150,
    roadType: 'Tunnel/Bridge',
    lanes: 6,
    speedLimit: 80,
    zone: 'Southern Gate',
    xPct: 55,
    yPct: 82,
  },
  {
    id: 'J-06',
    name: 'West River Parkway',
    code: 'WRP-06',
    latitude: 37.7612,
    longitude: -122.4589,
    roadType: 'Arterial',
    lanes: 4,
    speedLimit: 60,
    zone: 'Western Suburbs',
    xPct: 24,
    yPct: 62,
  },
  {
    id: 'J-07',
    name: 'East Industrial Boulevard',
    code: 'EIB-07',
    latitude: 37.7510,
    longitude: -122.3920,
    roadType: 'Arterial',
    lanes: 6,
    speedLimit: 60,
    zone: 'Industrial Harbor',
    xPct: 78,
    yPct: 74,
  },
  {
    id: 'J-08',
    name: 'University Avenue Crossing',
    code: 'UAC-08',
    latitude: 37.7820,
    longitude: -122.4510,
    roadType: 'Downtown Collector',
    lanes: 4,
    speedLimit: 45,
    zone: 'University Campus',
    xPct: 32,
    yPct: 32,
  },
];

// Linear congruential generator for reproducible 6,000+ row dataset
function pseudoRandom(seed: number) {
  const x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
}

/**
 * Generates >= 6,000 realistic urban traffic telemetry records
 * 8 Junctions x 24 Hours x 32 Days = 6,144 records
 */
export function generateUrbanTrafficDataset(): TrafficRecord[] {
  const records: TrafficRecord[] = [];
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] as const;
  const weathers: WeatherCondition[] = ['Clear', 'Rain', 'Heavy Rain', 'Fog', 'Snow'];

  let idCounter = 1;
  const totalDays = 32;

  for (let dayIndex = 0; dayIndex < totalDays; dayIndex++) {
    const dayDate = new Date(2026, 7, 1 + dayIndex); // August 2026
    const dayOfWeek = daysOfWeek[dayDate.getDay() === 0 ? 6 : dayDate.getDay() - 1];
    const isWeekend = dayOfWeek === 'Saturday' || dayOfWeek === 'Sunday';

    for (let hour = 0; hour < 24; hour++) {
      const isMorningRush = !isWeekend && (hour >= 7 && hour <= 9);
      const isEveningRush = !isWeekend && (hour >= 16 && hour <= 19);
      const isRushHour = isMorningRush || isEveningRush;

      for (let jIdx = 0; jIdx < JUNCTIONS.length; jIdx++) {
        const junction = JUNCTIONS[jIdx];
        const seed = dayIndex * 10000 + hour * 100 + jIdx * 7;
        const r1 = pseudoRandom(seed);
        const r2 = pseudoRandom(seed + 1);
        const r3 = pseudoRandom(seed + 2);
        const r4 = pseudoRandom(seed + 3);

        // Determine weather
        let weather: WeatherCondition = 'Clear';
        let precipitationMm = 0;
        let temp = 18 + Math.sin((hour - 4) / 24 * Math.PI * 2) * 8 + (r1 * 4 - 2);

        if (dayIndex % 6 === 2) {
          weather = 'Rain';
          precipitationMm = +(2 + r2 * 7).toFixed(1);
          temp -= 3;
        } else if (dayIndex % 11 === 4) {
          weather = 'Heavy Rain';
          precipitationMm = +(10 + r2 * 14).toFixed(1);
          temp -= 5;
        } else if (dayIndex % 9 === 1 && (hour < 8 || hour > 21)) {
          weather = 'Fog';
          precipitationMm = 0;
        }

        // Capacity and Volume logic based on diurnal traffic curves
        const laneCapacity = junction.roadType === 'Highway' ? 1900 : junction.roadType === 'Tunnel/Bridge' ? 1700 : 1100;
        const totalCapacity = laneCapacity * (junction.lanes / 2);

        // Base diurnal profile
        let volumeFactor = 0.15; // nighttime baseline
        if (hour >= 6 && hour <= 10) {
          volumeFactor = isWeekend ? 0.35 : (hour === 8 ? 0.92 : 0.78);
        } else if (hour >= 11 && hour <= 15) {
          volumeFactor = isWeekend ? 0.65 : 0.58;
        } else if (hour >= 16 && hour <= 20) {
          volumeFactor = isWeekend ? 0.60 : (hour === 18 ? 0.96 : 0.82);
        } else if (hour >= 21) {
          volumeFactor = 0.30;
        }

        // Add variance
        volumeFactor += (r2 - 0.5) * 0.12;
        volumeFactor = Math.max(0.1, Math.min(1.05, volumeFactor));

        // Incidents happen in ~3.5% of records
        const incidentReported = r3 < 0.035;

        // Vehicle Volume
        const vehicleVolume = Math.round(totalCapacity * volumeFactor * (0.85 + r4 * 0.3));

        // Speed degradation via modified Greenshields & BPR model
        const freeFlowSpeed = junction.speedLimit;
        let speedDegradation = Math.pow(vehicleVolume / totalCapacity, 2.5) * 0.7;

        if (weather === 'Rain') speedDegradation += 0.12;
        if (weather === 'Heavy Rain') speedDegradation += 0.28;
        if (weather === 'Fog') speedDegradation += 0.18;
        if (incidentReported) speedDegradation += 0.55;

        let avgSpeed = freeFlowSpeed * (1 - Math.min(0.85, speedDegradation));
        avgSpeed = Math.max(10, Math.min(freeFlowSpeed, avgSpeed + (r1 - 0.5) * 4));
        avgSpeed = +avgSpeed.toFixed(1);

        // Occupancy %
        let occupancy = (vehicleVolume / totalCapacity) * 65 + (freeFlowSpeed - avgSpeed) * 0.6 + r2 * 5;
        occupancy = Math.max(4, Math.min(98, +occupancy.toFixed(1)));

        // Travel Time Index (TTI) = Free Flow Time / Actual Time = Free Flow Speed / Average Speed
        const travelTimeIndex = +(freeFlowSpeed / avgSpeed).toFixed(2);

        // Determine Congestion Level
        let congestionLevel: CongestionLevel = 'Low';
        if (travelTimeIndex >= 3.0 || avgSpeed < freeFlowSpeed * 0.32 || incidentReported) {
          congestionLevel = 'Severe';
        } else if (travelTimeIndex >= 1.9 || avgSpeed < freeFlowSpeed * 0.52) {
          congestionLevel = 'High';
        } else if (travelTimeIndex >= 1.35 || avgSpeed < freeFlowSpeed * 0.75) {
          congestionLevel = 'Moderate';
        } else {
          congestionLevel = 'Low';
        }

        // Hotspot score: 0 to 100 based on congestion, occupancy and TTI
        const hotspotScore = Math.min(
          100,
          Math.round(
            (travelTimeIndex - 1) * 35 +
            (occupancy / 100) * 40 +
            (incidentReported ? 25 : 0) +
            (isRushHour ? 10 : 0)
          )
        );

        const padZero = (n: number) => n.toString().padStart(2, '0');
        const timestamp = `2026-08-${padZero(1 + dayIndex)} ${padZero(hour)}:00:00`;

        records.push({
          id: `TRF-${idCounter.toString().padStart(5, '0')}`,
          timestamp,
          junctionId: junction.id,
          junctionName: junction.name,
          latitude: junction.latitude,
          longitude: junction.longitude,
          roadType: junction.roadType,
          lanes: junction.lanes,
          vehicleVolume,
          averageSpeed: avgSpeed,
          freeFlowSpeed,
          occupancyPct: occupancy,
          weather,
          temperature: +temp.toFixed(1),
          precipitationMm,
          dayOfWeek,
          hour,
          isWeekend,
          isRushHour,
          incidentReported,
          congestionLevel,
          travelTimeIndex,
          hotspotScore,
        });

        idCounter++;
      }
    }
  }

  return records;
}

// Singleton cache to avoid recomputing 6,000+ rows on every re-render
let cachedDataset: TrafficRecord[] | null = null;

export function getTrafficDataset(): TrafficRecord[] {
  if (!cachedDataset) {
    cachedDataset = generateUrbanTrafficDataset();
  }
  return cachedDataset;
}

/**
 * Converts the dataset into a downloadable CSV blob
 */
export function exportTrafficDatasetAsCSV(records: TrafficRecord[]): void {
  const headers = [
    'id',
    'timestamp',
    'junction_id',
    'junction_name',
    'latitude',
    'longitude',
    'road_type',
    'lanes',
    'vehicle_volume',
    'average_speed_kmh',
    'free_flow_speed_kmh',
    'occupancy_pct',
    'weather',
    'temperature_c',
    'precipitation_mm',
    'day_of_week',
    'hour',
    'is_weekend',
    'is_rush_hour',
    'incident_reported',
    'congestion_level',
    'travel_time_index',
    'hotspot_score'
  ];

  const rows = records.map(r => [
    r.id,
    r.timestamp,
    r.junctionId,
    `"${r.junctionName}"`,
    r.latitude,
    r.longitude,
    `"${r.roadType}"`,
    r.lanes,
    r.vehicleVolume,
    r.averageSpeed,
    r.freeFlowSpeed,
    r.occupancyPct,
    r.weather,
    r.temperature,
    r.precipitationMm,
    r.dayOfWeek,
    r.hour,
    r.isWeekend ? 1 : 0,
    r.isRushHour ? 1 : 0,
    r.incidentReported ? 1 : 0,
    r.congestionLevel,
    r.travelTimeIndex,
    r.hotspotScore
  ].join(','));

  const csvContent = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `urban_traffic_dataset_${records.length}_rows.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
