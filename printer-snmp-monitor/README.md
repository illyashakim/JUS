# Printer SNMP Monitor

A modern, real-time web application for monitoring printer status, toner levels, and cartridge information via SNMP protocol.

## Features

- **Real-time Monitoring**: Live updates of printer status and toner levels
- **SNMP Integration**: Monitors printers using standard SNMP OIDs
- **Modern Web Interface**: Responsive design with Bootstrap 5 and custom CSS
- **WebSocket Support**: Real-time communication for instant updates
- **Printer Management**: Add/remove printers dynamically
- **Status Tracking**: Monitor printer status (Idle, Printing, Warmup, Stopped)
- **Toner Monitoring**: Visual toner level indicators with color coding
- **Detailed Information**: View printer details including location, serial number
- **Responsive Design**: Works on desktop, tablet, and mobile devices

## Screenshots

The application features a clean, modern dashboard with:
- Control panel for starting/stopping monitoring
- Real-time printer status cards
- Visual toner level indicators
- Detailed printer information modals
- Toast notifications for user feedback

## Prerequisites

- Python 3.7 or higher
- Network access to printers with SNMP enabled
- Printers must support standard SNMP MIBs

## Installation

1. **Clone or download the application:**
   ```bash
   git clone <repository-url>
   cd printer-snmp-monitor
   ```

2. **Create a virtual environment (recommended):**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment variables (optional):**
   ```bash
   cp .env.example .env
   # Edit .env file with your settings
   ```

## Configuration

### Environment Variables

Create a `.env` file in the project root with the following variables:

```env
# Flask Settings
SECRET_KEY=your-secret-key-here
DEBUG=True
HOST=0.0.0.0
PORT=5000

# SNMP Settings
DEFAULT_SNMP_COMMUNITY=public
DEFAULT_SNMP_PORT=161
SNMP_TIMEOUT=3
SNMP_RETRIES=1

# Monitoring Settings
MONITORING_INTERVAL=30
MAX_PRINTERS=100

# Logging
LOG_LEVEL=INFO
LOG_FILE=printer_monitor.log
```

### SNMP Configuration

The application uses standard SNMP OIDs for printer monitoring:

- **Printer Status**: `1.3.6.1.2.1.25.3.5.1.2.1` (prtMarkerStatus)
- **Toner Level**: `1.3.6.1.2.1.43.10.2.1.4.1.1` (prtMarkerTonerLevel)
- **Max Toner Level**: `1.3.6.1.2.1.43.10.2.1.4.1.2` (prtMarkerTonerMaxLevel)
- **Printer Name**: `1.3.6.1.2.1.25.3.2.1.3.1` (prtGeneralName)
- **Printer Location**: `1.3.6.1.2.1.25.3.2.1.6.1` (prtGeneralLocation)
- **Serial Number**: `1.3.6.1.2.1.43.5.1.1.17.1` (prtGeneralSerialNumber)

## Usage

### Starting the Application

1. **Activate virtual environment:**
   ```bash
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. **Run the application:**
   ```bash
   python app.py
   ```

3. **Access the web interface:**
   Open your browser and navigate to `http://localhost:5000`

### Adding Printers

1. Click the "Add Printer" button
2. Enter the printer's IP address
3. Optionally customize SNMP community and port
4. Click "Add Printer"

### Monitoring Controls

- **Start Monitoring**: Begins continuous monitoring of all printers
- **Stop Monitoring**: Stops the monitoring process
- **Refresh All**: Manually refresh all printer statuses
- **Remove Printer**: Delete printers from monitoring

## API Endpoints

### Printer Management
- `GET /api/printers` - Get all printer status
- `POST /api/printers` - Add a new printer
- `DELETE /api/printers/<ip>` - Remove a printer

### Monitoring Control
- `POST /api/monitoring/start` - Start monitoring
- `POST /api/monitoring/stop` - Stop monitoring
- `GET /api/monitoring/status` - Get monitoring status

## Supported Printer Statuses

- **Idle**: Printer is ready and waiting
- **Printing**: Printer is currently processing a job
- **Warmup**: Printer is starting up
- **Stopped**: Printer is stopped due to error or maintenance
- **Error**: Communication or SNMP error

## Toner Level Indicators

- **Green (≥20%)**: Normal level
- **Yellow (10-19%)**: Low level warning
- **Red (<10%)**: Critical level - replace soon

## Troubleshooting

### Common Issues

1. **Printer not responding:**
   - Verify printer IP address is correct
   - Check if SNMP is enabled on the printer
   - Ensure network connectivity
   - Verify SNMP community string

2. **SNMP timeout errors:**
   - Increase `SNMP_TIMEOUT` in configuration
   - Check network latency
   - Verify firewall settings

3. **WebSocket connection issues:**
   - Check if port 5000 is accessible
   - Verify browser supports WebSocket
   - Check console for error messages

### Debug Mode

Enable debug mode by setting `DEBUG=True` in your environment variables to see detailed error messages and logs.

## Development

### Project Structure

```
printer-snmp-monitor/
├── app.py                 # Main Flask application
├── config.py             # Configuration management
├── requirements.txt      # Python dependencies
├── README.md            # This file
├── templates/           # HTML templates
│   └── index.html      # Main dashboard
├── static/             # Static assets
│   ├── css/
│   │   └── style.css   # Custom styles
│   └── js/
│       └── app.js      # Frontend JavaScript
└── .env                # Environment variables (create this)
```

### Adding New Features

1. **New SNMP OIDs**: Add to the `SNMP_OIDS` dictionary in `app.py`
2. **UI Components**: Modify templates and CSS as needed
3. **API Endpoints**: Add new routes in the Flask application
4. **Frontend Logic**: Extend the JavaScript `PrinterMonitor` class

## Security Considerations

- Change default `SECRET_KEY` in production
- Use strong SNMP community strings
- Consider implementing authentication for production use
- Restrict network access to monitoring application
- Regularly update dependencies

## Performance

- Monitoring interval is configurable (default: 30 seconds)
- WebSocket updates provide real-time data without polling
- Background scheduler handles monitoring tasks efficiently
- Responsive UI updates only changed components

## Browser Support

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## License

This project is open source and available under the [MIT License](LICENSE).

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## Support

For issues and questions:
- Check the troubleshooting section
- Review the console logs
- Check browser developer tools
- Create an issue in the repository

## Future Enhancements

- Database persistence for printer configurations
- Email notifications for low toner/errors
- Historical data and trends
- User authentication and roles
- API rate limiting
- Docker containerization
- Monitoring dashboard widgets
- Printer discovery via network scanning
