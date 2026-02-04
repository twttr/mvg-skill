#!/usr/bin/env python3
"""
MVG Departures - Get nearby departures from Munich public transport

Usage:
    python mvg-departures.py <lat> <lng> [--limit N] [--offset MIN] [--types U,S,BUS,TRAM]

Examples:
    python mvg-departures.py 48.154 11.620
    python mvg-departures.py 48.154 11.620 --limit 5 --offset 3
    python mvg-departures.py 48.154 11.620 --types U,S
"""

import argparse
import sys
from datetime import datetime
from typing import Optional

try:
    from mvg import MvgApi, TransportType
except ImportError:
    print("❌ Missing mvg package. Install with: pip install mvg")
    sys.exit(1)


# Transport type mapping
TRANSPORT_MAP = {
    'U': TransportType.UBAHN,
    'UBAHN': TransportType.UBAHN,
    'S': TransportType.SBAHN,
    'SBAHN': TransportType.SBAHN,
    'BUS': TransportType.BUS,
    'TRAM': TransportType.TRAM,
    'REGIONAL': TransportType.REGIONAL_BUS,
}

# Icons for transport types
ICONS = {
    'U-Bahn': '🚇',
    'S-Bahn': '🚆',
    'Bus': '🚌',
    'Tram': '🚃',
    'RegionalBus': '🚐',
    'default': '🚏',
}


def format_time(timestamp: int, delay: int) -> str:
    """Format departure time with delay indicator."""
    dt = datetime.fromtimestamp(timestamp)
    now = datetime.now()
    minutes = int((dt - now).total_seconds() / 60)
    
    if minutes < 0:
        return "jetzt"
    elif minutes == 0:
        return "< 1 min"
    else:
        time_str = f"{minutes} min"
    
    if delay and delay > 0:
        time_str += f" (+{delay})"
    
    return time_str


def format_departures(station: dict, departures: list, compact: bool = False) -> str:
    """Format departures for display."""
    lines = []
    
    # Station header
    lines.append(f"📍 **{station['name']}** ({station['place']})")
    lines.append("")
    
    if not departures:
        lines.append("Keine Abfahrten gefunden")
        return '\n'.join(lines)
    
    for dep in departures:
        icon = ICONS.get(dep['type'], ICONS['default'])
        time_str = format_time(dep['time'], dep.get('delay', 0))
        
        if dep.get('cancelled'):
            line_text = f"~~{dep['line']}~~ ❌"
        else:
            line_text = dep['line']
        
        if compact:
            lines.append(f"{icon} {line_text} → {dep['destination']} ({time_str})")
        else:
            platform = f" · Gl. {dep['platform']}" if dep.get('platform') else ""
            lines.append(f"{icon} **{line_text}** → {dep['destination']}")
            lines.append(f"   ⏱ {time_str}{platform}")
    
    return '\n'.join(lines)


def get_departures(
    lat: float,
    lng: float,
    limit: int = 8,
    offset: int = 0,
    transport_types: Optional[list] = None,
    compact: bool = False
) -> str:
    """Get departures from nearest station."""
    
    # Find nearest station
    station = MvgApi.nearby(lat, lng)
    
    if not station:
        return "❌ Keine Station in der Nähe gefunden"
    
    # Get departures
    api = MvgApi(station['id'])
    
    kwargs = {
        'limit': limit,
        'offset': offset,
    }
    
    if transport_types:
        kwargs['transport_types'] = transport_types
    
    departures = api.departures(**kwargs)
    
    return format_departures(station, departures, compact)


def main():
    parser = argparse.ArgumentParser(description='Get MVG departures near a location')
    parser.add_argument('lat', type=float, help='Latitude')
    parser.add_argument('lng', type=float, help='Longitude')
    parser.add_argument('--limit', '-l', type=int, default=8, help='Max departures (default: 8)')
    parser.add_argument('--offset', '-o', type=int, default=0, help='Walking time offset in minutes')
    parser.add_argument('--types', '-t', type=str, help='Filter by types: U,S,BUS,TRAM (comma-separated)')
    parser.add_argument('--compact', '-c', action='store_true', help='Compact output')
    parser.add_argument('--json', '-j', action='store_true', help='Output raw JSON')
    
    args = parser.parse_args()
    
    # Parse transport types
    transport_types = None
    if args.types:
        types_list = [t.strip().upper() for t in args.types.split(',')]
        transport_types = [TRANSPORT_MAP[t] for t in types_list if t in TRANSPORT_MAP]
    
    if args.json:
        import json
        station = MvgApi.nearby(args.lat, args.lng)
        if station:
            api = MvgApi(station['id'])
            departures = api.departures(limit=args.limit, offset=args.offset)
            print(json.dumps({'station': station, 'departures': departures}, indent=2))
        else:
            print(json.dumps({'error': 'No station found'}))
    else:
        result = get_departures(
            args.lat,
            args.lng,
            limit=args.limit,
            offset=args.offset,
            transport_types=transport_types,
            compact=args.compact
        )
        print(result)


if __name__ == '__main__':
    main()
