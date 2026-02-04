---
name: mvg
description: Munich public transport (MVG) - departures, schedules, and alerts. Use when user shares location in Munich, asks about transport schedules, nearby stops, or transit disruptions.
---

# MVG Skill 🚇

Munich public transport departures, schedules, and alerts.

## 1. Departures by Location

When user shares location or asks about nearby transport:

```bash
cd ~/clawd/scripts/mvg && python3 mvg-departures.py <lat> <lng>

# With options
python3 mvg-departures.py <lat> <lng> --limit 5 --offset 3 --compact
```

### Options

| Flag | Description |
|------|-------------|
| `--limit N` | Max departures (default: 8) |
| `--offset MIN` | Walking time to stop (filters out departures leaving too soon) |
| `--types U,S,BUS,TRAM` | Filter by transport type |
| `--compact` | One-line format |
| `--json` | JSON output |

### Examples

```bash
# From Roma's home (Bogenhausen)
python3 mvg-departures.py 48.154 11.620

# Only U-Bahn and S-Bahn, 5 min walk to station
python3 mvg-departures.py 48.154 11.620 --types U,S --offset 5

# Compact output
python3 mvg-departures.py 48.154 11.620 --compact
```

### Output Format

```
📍 **Arabellapark Nord** (München)

🚇 U4 → Westendstraße (5 min)
🚌 150 → Bremer Straße (jetzt)
🚌 183 → Messestadt West (2 min +3)
```

Delay shown as `(+N)` minutes.

## 2. On Location Share

When Roma sends a location via Telegram, show:

1. **Nearby departures** (use coordinates from message)
2. **Fuel prices** if driving is relevant

```bash
# Both in one response
python3 mvg-departures.py <lat> <lng> --limit 6 --compact
```

## 3. Alerts & Disruptions

Check for strikes, disruptions, construction:

```bash
web_search "München MVG Streik Störung" --freshness pd
```

### Keywords

- `Streik` — strike
- `Störung` — disruption  
- `Sperrung` — closure
- `Ausfall` — cancellation
- `Verspätung` — delay
- `Bauarbeiten` — construction

### MVG vs S-Bahn

| Service | Operator | During MVG Strike |
|---------|----------|-------------------|
| U-Bahn | MVG | ❌ Affected |
| Tram | MVG | ❌ Affected |
| Bus (1-199) | MVG | ❌ Affected |
| **S-Bahn** | **DB** | ✅ Usually runs |
| Regional trains | DB | ✅ Usually runs |

⚠️ S-Bahn is operated by Deutsche Bahn, not MVG!

## 4. Heartbeat Integration

Add to HEARTBEAT.md for automated checks:

```markdown
### 🚨 MVG Alerts (every heartbeat)
- web_search: "München MVG Streik Störung" freshness=pd
- Report NEW alerts only (check reportedAlerts in state)

### 📍 On Location (when Roma sends location)
- python3 mvg-departures.py <lat> <lng> --limit 6
```

Track in `memory/heartbeat-state.json`:

```json
{
  "reportedAlerts": ["mvg-streik-2026-02-02"],
  "acknowledgedAlerts": ["mvg-streik-2026-02-02"]
}
```

## 5. API Reference

Uses unofficial MVG API:

```
Base: https://www.mvg.de/api/bgw-pt/v3

GET /stations/nearby?latitude=X&longitude=Y
GET /departures?globalId=STATION_ID&limit=N&offsetInMinutes=M
```

Python package: `pip install mvg`

## Requirements

```bash
pip install mvg
# or
npm install  # for TypeScript version
```

## Munich Tips

- **Rush hours**: 7:00-9:00, 16:30-19:00
- **Oktoberfest**: U4/U5 crowded (late Sept)
- **Allianz Arena**: U6 packed on match days
- **Night service**: Limited after 00:30 (weekdays)
