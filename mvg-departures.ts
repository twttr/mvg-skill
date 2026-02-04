#!/usr/bin/env npx ts-node

/**
 * MVG Departures - Munich Public Transport
 * 
 * Usage:
 *   npx ts-node mvg-departures.ts <lat> <lng> [--limit N] [--offset MIN]
 * 
 * Examples:
 *   npx ts-node mvg-departures.ts 48.154 11.620
 *   npx ts-node mvg-departures.ts 48.154 11.620 --limit 5 --offset 3
 */

const MVG_API_BASE = 'https://www.mvg.de/api/bgw-pt/v3';

interface Station {
  globalId: string;
  name: string;
  place: string;
  latitude: number;
  longitude: number;
}

interface RawDeparture {
  plannedDepartureTime: number;
  realtimeDepartureTime: number;
  delayInMinutes?: number;
  realtime: boolean;
  transportType: string;
  label: string;
  destination: string;
  cancelled: boolean;
  platform?: number;
  messages?: string[];
}

// Icons for transport types
const ICONS: Record<string, string> = {
  UBAHN: '🚇',
  SBAHN: '🚆',
  BUS: '🚌',
  TRAM: '🚃',
  REGIONAL_BUS: '🚐',
  BAHN: '🚄',
  SCHIFF: '⛴️',
};

const TRANSPORT_NAMES: Record<string, string> = {
  UBAHN: 'U-Bahn',
  SBAHN: 'S-Bahn',
  BUS: 'Bus',
  TRAM: 'Tram',
  REGIONAL_BUS: 'Regionalbus',
  BAHN: 'Bahn',
  SCHIFF: 'Schiff',
};

// Find nearest station by coordinates
async function findNearbyStation(lat: number, lng: number): Promise<Station | null> {
  const url = `${MVG_API_BASE}/stations/nearby?latitude=${lat}&longitude=${lng}`;
  
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
      'Accept': 'application/json',
    },
  });
  
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`API error ${response.status}: ${text}`);
  }
  
  const stations = await response.json() as Station[];
  return stations.length > 0 ? stations[0] : null;
}

// Get departures for a station
async function getDepartures(
  stationId: string,
  limit: number = 10,
  offsetMinutes: number = 0
): Promise<RawDeparture[]> {
  const transportTypes = 'UBAHN,SBAHN,BUS,TRAM,BAHN';
  const url = `${MVG_API_BASE}/departures?globalId=${encodeURIComponent(stationId)}&limit=${limit}&offsetInMinutes=${offsetMinutes}&transportTypes=${transportTypes}`;
  
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
      'Accept': 'application/json',
    },
  });
  
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`API error ${response.status}: ${text}`);
  }
  
  return response.json() as Promise<RawDeparture[]>;
}

// Format time until departure
function formatTime(timestampMs: number, delay?: number): string {
  const now = Date.now();
  const minutes = Math.round((timestampMs - now) / 60000);
  
  let timeStr: string;
  if (minutes <= 0) {
    timeStr = 'jetzt';
  } else if (minutes === 1) {
    timeStr = '1 min';
  } else {
    timeStr = `${minutes} min`;
  }
  
  if (delay && delay > 0) {
    timeStr += ` (+${delay})`;
  }
  
  return timeStr;
}

// Format output for display
function formatOutput(station: Station, departures: RawDeparture[], compact: boolean = false): string {
  const lines: string[] = [];
  
  // Station header
  lines.push(`📍 **${station.name}** (${station.place})`);
  lines.push('');
  
  if (departures.length === 0) {
    lines.push('Keine Abfahrten gefunden');
    return lines.join('\n');
  }
  
  for (const dep of departures) {
    const icon = ICONS[dep.transportType] || '🚏';
    const timeStr = formatTime(dep.realtimeDepartureTime, dep.delayInMinutes);
    
    let label = dep.label;
    if (dep.cancelled) {
      label = `~~${label}~~ ❌`;
    }
    
    if (compact) {
      lines.push(`${icon} ${label} → ${dep.destination} (${timeStr})`);
    } else {
      const platform = dep.platform ? ` · Gl. ${dep.platform}` : '';
      lines.push(`${icon} **${label}** → ${dep.destination}`);
      lines.push(`   ⏱ ${timeStr}${platform}`);
    }
  }
  
  return lines.join('\n');
}

// Main function for use as module
export async function getNearbyDepartures(
  lat: number,
  lng: number,
  options: { limit?: number; offset?: number; compact?: boolean } = {}
): Promise<string> {
  const { limit = 8, offset = 0, compact = false } = options;
  
  const station = await findNearbyStation(lat, lng);
  if (!station) {
    return '❌ Keine Station in der Nähe gefunden';
  }
  
  const departures = await getDepartures(station.globalId, limit, offset);
  return formatOutput(station, departures, compact);
}

// CLI
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.log('Usage: mvg-departures.ts <lat> <lng> [--limit N] [--offset MIN] [--compact] [--json]');
    console.log('Example: mvg-departures.ts 48.154 11.620 --limit 5');
    process.exit(1);
  }
  
  const lat = parseFloat(args[0]);
  const lng = parseFloat(args[1]);
  
  // Parse options
  let limit = 8;
  let offset = 0;
  let compact = false;
  let json = false;
  
  for (let i = 2; i < args.length; i++) {
    if (args[i] === '--limit' || args[i] === '-l') {
      limit = parseInt(args[++i], 10);
    } else if (args[i] === '--offset' || args[i] === '-o') {
      offset = parseInt(args[++i], 10);
    } else if (args[i] === '--compact' || args[i] === '-c') {
      compact = true;
    } else if (args[i] === '--json' || args[i] === '-j') {
      json = true;
    }
  }
  
  try {
    if (json) {
      const station = await findNearbyStation(lat, lng);
      if (station) {
        const departures = await getDepartures(station.globalId, limit, offset);
        console.log(JSON.stringify({ station, departures }, null, 2));
      } else {
        console.log(JSON.stringify({ error: 'No station found' }));
      }
    } else {
      const result = await getNearbyDepartures(lat, lng, { limit, offset, compact });
      console.log(result);
    }
  } catch (error) {
    console.error('Error:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

main();
