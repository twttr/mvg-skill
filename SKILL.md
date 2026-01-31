---
name: mvg-alerts
description: Check Munich public transport (MVG) for disruptions, strikes, and service alerts. Use when user asks about Munich transport status, MVG problems, S-Bahn/U-Bahn delays, or needs commute planning in Munich.
---

# MVG Alerts

Check Munich public transport (MVG/MVV) for disruptions, strikes, and delays.

## Quick Check

Search for current alerts:

```bash
web_search "München MVG Streik Störung" --freshness pd
```

Keywords to search: `Streik` (strike), `Störung` (disruption), `Sperrung` (closure), `Ausfall` (cancellation), `Verspätung` (delay)

## What MVG Covers

- **U-Bahn** (subway) — Lines U1-U8
- **Tram** (streetcar) — Multiple lines
- **Bus** — Lines up to 199 (MVG operated)

## What MVG Does NOT Cover

- **S-Bahn** — Operated by Deutsche Bahn, separate system
- **Regional buses** — DB operated
- **Regional trains** — DB operated

⚠️ During MVG strikes, S-Bahn usually still runs!

## Common Alert Types

### Strikes (Streik)
- Usually announced 1-3 days ahead
- Check: `web_search "MVG Streik" --freshness pw`
- Often affects all MVG services (U-Bahn, Tram, Bus)

### Service Disruptions (Störung)
- Can happen anytime
- Check: `web_search "MVG Störung aktuell"`
- Often single lines or stations

### Construction (Bauarbeiten)
- Planned closures
- Check MVG website or `web_search "MVG Bauarbeiten [LINE]"`

## Sources

- **Official**: mvg.de/betriebsaenderungen
- **News**: Süddeutsche Zeitung, Münchner Merkur, BR24, Abendzeitung
- **Twitter/X**: @MVGticker

## Response Format

When reporting alerts:

```
🚨 MVG Alert: [Type]

Affected: [Lines/Services]
When: [Date/Time]
Impact: [What's not running]
Alternative: [S-Bahn, bike, etc.]

Source: [URL]
```

## Integration with Heartbeat

Add to your HEARTBEAT.md:

```markdown
### 🚨 MVG Alerts
- web_search: "München MVG Streik Störung" freshness=pd
- Report NEW alerts only (track in state file)
- Keywords: Streik, Störung, Unwetter, Sperrung, Ausfall
```

Track reported alerts in `memory/heartbeat-state.json`:

```json
{
  "reportedAlerts": ["mvg-streik-2026-02-02"],
  "acknowledgedAlerts": ["mvg-streik-2026-02-02"]
}
```

## Munich-specific Tips

- Morning rush: 7:00-9:00
- Evening rush: 16:30-19:00
- Oktoberfest (late Sept): Expect crowded U4/U5
- Football matches (Allianz Arena): U6 packed on game days
