# SNMP Printer Monitor

A simple FastAPI web application that monitors network printers via SNMP, displaying overall status and toner/cartridge levels.

## Features
- Add printers by IP and SNMP community
- Background polling (default every 5 minutes)
- View live status (online/offline, hrDeviceStatus) and supplies levels with percentages
- REST API for printers and supplies

## Requirements
- Python 3.11+
- Network access to printers on UDP/161 (SNMP v2c)

## Setup
```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

## Run
```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

Open `http://localhost:8000` in your browser.

## Configuration
Environment variables (prefix `PRN_`):
- `PRN_DATABASE_URL` (default `sqlite:////workspace/data/app.db`)
- `PRN_POLL_INTERVAL_SECONDS` (default `300`)
- `PRN_SNMP_TIMEOUT_SECONDS` (default `1`)
- `PRN_SNMP_RETRIES` (default `1`)

## Notes
- Supplies OIDs use Printer-MIB `prtMarkerSupplies*` tables. Some devices may not expose all fields.
- Negative levels (e.g. `-2`, `-3`) are treated as unknown.
