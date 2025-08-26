# Printer Monitor - SNMP Monitoring System

A comprehensive web application for monitoring printer status, toner levels, and cartridge information using SNMP (Simple Network Management Protocol).

## Features

- **Real-time Monitoring**: Monitor printer status, toner levels, and paper tray information
- **Multi-brand Support**: Compatible with HP, Canon, Brother, and generic SNMP-enabled printers
- **Automated Scanning**: Background monitoring with configurable intervals
- **Web Dashboard**: Modern, responsive web interface with charts and statistics
- **Historical Data**: Track printer status and toner level changes over time
- **SNMP Integration**: Built-in SNMP client for network printer communication

## Architecture

- **Backend**: Python Flask with SQLAlchemy ORM
- **Frontend**: React.js with Tailwind CSS
- **Database**: SQLite (configurable for production)
- **Monitoring**: APScheduler for background tasks
- **SNMP**: PySNMP library for printer communication

## Prerequisites

- Python 3.8+
- Node.js 16+
- Network access to printers
- SNMP enabled on target printers

## Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd printer-monitor
```

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Copy environment configuration
cp ../config/.env.example .env
# Edit .env with your configuration
```

### 3. Frontend Setup

```bash
cd ../frontend

# Install dependencies
npm install

# Build for production (optional)
npm run build
```

## Configuration

### Environment Variables

Copy `config/.env.example` to `backend/.env` and configure:

- `SECRET_KEY`: Flask secret key
- `SNMP_COMMUNITY`: Default SNMP community string
- `SCAN_INTERVAL_MINUTES`: Background monitoring interval
- `LOG_LEVEL`: Logging verbosity

### Printer Configuration

Each printer requires:
- **Name**: Human-readable identifier
- **IP Address**: Network location
- **SNMP Community**: Authentication string (usually "public")
- **Location**: Physical location (optional)
- **Model**: Printer model (optional)

## Usage

### Starting the Application

1. **Start Backend**:
```bash
cd backend
python app.py
```

2. **Start Frontend** (Development):
```bash
cd frontend
npm start
```

3. **Access Web Interface**: Open `http://localhost:3000`

### Adding Printers

1. Navigate to "Add Printer" page
2. Enter printer details
3. Test SNMP connectivity
4. Save printer configuration

### Monitoring

- **Dashboard**: Overview of all printers
- **Printer List**: Detailed status of each printer
- **Individual Views**: Historical data and detailed information
- **Manual Scanning**: Force immediate status checks

## SNMP Configuration

### Printer Setup

Ensure your printers have:
- SNMP enabled in network settings
- Correct community string configured
- Network accessibility from monitoring server
- Proper firewall rules

### Supported OIDs

The application supports multiple printer brands:

- **HP Printers**: HP-specific MIBs for toner levels
- **Canon Printers**: Canon imageRUNNER MIBs
- **Brother Printers**: Brother-specific MIBs
- **Generic Printers**: Standard printer MIB support

## API Endpoints

### Printers
- `GET /api/printers` - List all printers
- `POST /api/printers` - Add new printer
- `GET /api/printers/{id}` - Get printer details
- `POST /api/printers/{id}/scan` - Scan printer
- `DELETE /api/printers/{id}` - Remove printer

### Dashboard
- `GET /api/dashboard` - Get monitoring statistics

## Development

### Project Structure

```
printer-monitor/
├── backend/                 # Python Flask backend
│   ├── app.py              # Main application
│   ├── snmp_monitor.py     # SNMP monitoring logic
│   └── requirements.txt    # Python dependencies
├── frontend/               # React frontend
│   ├── src/                # Source code
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   └── utils/          # Utility functions
│   ├── public/             # Static assets
│   └── package.json        # Node.js dependencies
├── config/                 # Configuration files
└── database/               # Database files
```

### Adding New Printer Brands

1. Extend `SNMPMonitor` class in `snmp_monitor.py`
2. Add new OIDs to the `oids` dictionary
3. Implement brand-specific methods
4. Update frontend to handle new data types

## Troubleshooting

### Common Issues

1. **SNMP Connection Failed**
   - Verify printer IP address
   - Check SNMP community string
   - Ensure network connectivity
   - Verify firewall settings

2. **No Toner Data**
   - Check printer MIB support
   - Verify OID compatibility
   - Test with SNMP tools (snmpwalk)

3. **Performance Issues**
   - Adjust scan intervals
   - Optimize database queries
   - Monitor system resources

### Debug Mode

Enable debug logging in `.env`:
```
LOG_LEVEL=DEBUG
FLASK_DEBUG=True
```

## Production Deployment

### Recommended Setup

- **Web Server**: Nginx or Apache
- **Application Server**: Gunicorn
- **Database**: PostgreSQL or MySQL
- **Process Manager**: systemd or Supervisor
- **SSL**: Let's Encrypt certificates

### Docker Support

```bash
# Build and run with Docker Compose
docker-compose up -d
```

## Contributing

1. Fork the repository
2. Create feature branch
3. Make changes
4. Add tests
5. Submit pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For issues and questions:
- Check troubleshooting section
- Review SNMP configuration
- Check network connectivity
- Review application logs

## Roadmap

- [ ] Email notifications for low toner
- [ ] Printer usage statistics
- [ ] Mobile app support
- [ ] Advanced SNMP features
- [ ] Multi-tenant support
- [ ] API rate limiting
- [ ] Backup and restore
- [ ] Printer discovery
