# MVG Departures 🚇

Get Munich public transport departures by coordinates.

## Usage

```bash
# By coordinates
python3 mvg-departures.py 48.137 11.575

# With options
python3 mvg-departures.py 48.137 11.575 --limit 5 --offset 3 --compact

# JSON output (for integration)
python3 mvg-departures.py 48.137 11.575 --json
```

## Options

| Flag | Description |
|------|-------------|
| `--limit N` | Number of departures (default: 8) |
| `--offset MIN` | Walking time to stop in minutes |
| `--types U,S,BUS,TRAM` | Filter by transport type |
| `--compact` | One-line output format |
| `--json` | JSON output |

## Requirements

```bash
pip install mvg
```

## Example Output

```
📍 **Marienplatz** (München)

🚇 U3 → Fürstenried West (2 min)
🚇 U6 → Klinikum Großhadern (3 min)
🚆 S1 → Freising (5 min +2)
🚌 132 → Schwabing Nord (6 min)
```

Delays shown as `(+N)` minutes.

## API

Uses the unofficial MVG API:
- Base: `https://www.mvg.de/api/bgw-pt/v3`
- `/stations/nearby?latitude=X&longitude=Y` — nearby stops
- `/departures?globalId=X&limit=N` — departures

## TypeScript Version

```bash
npx ts-node mvg-departures.ts 48.137 11.575
```

## License

MIT
