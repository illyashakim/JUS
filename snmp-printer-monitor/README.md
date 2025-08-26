# SNMP Printer Monitor

A comprehensive web-based application for monitoring printer status, toner levels, and cartridge information using SNMP protocol. Features real-time monitoring, beautiful UI, and instant alerts for low supplies.

## Features

- 🖨️ **Real-time Printer Monitoring** - Monitor multiple printers simultaneously
- 📊 **Supply Level Tracking** - Track toner, ink, and other consumables
- 🚨 **Smart Alerts** - Get notified when supplies are running low
- 🔄 **Live Updates** - Real-time status updates via WebSocket
- 🎨 **Modern UI** - Beautiful, responsive interface built with React and Tailwind CSS
- 📱 **Mobile Friendly** - Works perfectly on desktop and mobile devices
- 🔧 **Easy Configuration** - Simple setup with environment variables

## Screenshots

### Dashboard Overview
- Real-time status summary with total printers, online/offline counts
- Low supply alerts and monitoring controls

### Printer Cards
- Individual printer status with model information
- Color-coded toner level bars with percentage indicators
- Connection status and last update timestamps

## Technology Stack

### Backend
- **Python Flask** - Web framework
- **pysnmp** - SNMP protocol implementation
- **Flask-SocketIO** - Real-time WebSocket communication
- **eventlet** - Async networking library

### Frontend
- **React 18** - Modern UI framework
- **Tailwind CSS** - Utility-first CSS framework
- **Socket.IO Client** - Real-time communication
- **Lucide React** - Beautiful icons
- **Axios** - HTTP client

## Installation

### Prerequisites
- Python 3.8 or higher
- Node.js 16 or higher
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Create environment file:
```bash
cp .env.example .env
# Edit .env file with your configuration
```

5. Start the backend server:
```bash
python app.py
```

The backend will be available at `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The frontend will be available at `http://localhost:3000`

## Configuration

### Environment Variables

Create a `.env` file in the backend directory with the following variables:

```env
# Flask Configuration
SECRET_KEY=your-secret-key-here
DEBUG=True

# SNMP Configuration
SNMP_TIMEOUT=5
SNMP_RETRIES=3

# Monitoring Configuration
UPDATE_INTERVAL=30

# Alert Thresholds
LOW_TONER_THRESHOLD=20
CRITICAL_TONER_THRESHOLD=10
```

### SNMP Configuration

Most network printers support SNMP with the default community string `public`. However, some printers may require:
- Different community strings (check your printer's network settings)
- SNMP v2c or v3 (currently supports v1/v2c)
- Specific port numbers (default is 161)

## Usage

### Adding Printers

1. Click the "Add Printer" button
2. Fill in the printer details:
   - **Name**: Friendly name for the printer
   - **IP Address**: Network IP address of the printer
   - **Port**: SNMP port (usually 161)
   - **Community**: SNMP community string (usually "public")
3. Click "Add Printer" to save

### Monitoring

1. **Start Monitoring**: Click the "Start" button to begin automatic monitoring
2. **Manual Refresh**: Use the "Refresh" button for immediate updates
3. **Test Connection**: Use the "Test" button on individual printer cards
4. **Remove Printers**: Use the "Remove" button to delete printers

### Status Indicators

- 🟢 **Online**: Printer is responding and operational
- 🔴 **Offline**: Printer is not responding
- ⚠️ **Warning**: Printer has warnings or low supplies
- 🔄 **Real-time**: Live updates when monitoring is active

### Supply Levels

Supply levels are color-coded:
- **Green**: Good (above 30%)
- **Yellow**: Warning (20-30%)
- **Orange**: Low (10-20%)
- **Red**: Critical (below 10%)

## API Endpoints

### Printers
- `GET /api/printers` - Get all printers
- `POST /api/printers` - Add a new printer
- `DELETE /api/printers/<id>` - Remove a printer
- `POST /api/printers/<id>/test` - Test printer connection

### Monitoring
- `GET /api/monitoring/status` - Get monitoring status
- `POST /api/monitoring/start` - Start monitoring
- `POST /api/monitoring/stop` - Stop monitoring

### WebSocket Events
- `printer_update` - Real-time printer status updates
- `printers_list` - Complete printer list updates

## Supported Printers

This application uses standard SNMP MIBs (RFC 3805 - Printer MIB) and should work with most network printers including:

- HP LaserJet series
- Canon imageRUNNER series
- Epson WorkForce series
- Brother MFC series
- Xerox WorkCentre series
- And many others supporting SNMP

## Troubleshooting

### Common Issues

1. **Printer not responding**
   - Verify IP address and network connectivity
   - Check if SNMP is enabled on the printer
   - Try different community strings
   - Ensure firewall allows SNMP traffic (UDP port 161)

2. **No supply information**
   - Some printers don't support supply level reporting
   - Try different SNMP versions
   - Check printer documentation for SNMP capabilities

3. **Connection timeouts**
   - Increase SNMP_TIMEOUT in configuration
   - Check network latency to printer
   - Verify printer is not overloaded

### Network Requirements

- UDP port 161 (SNMP) must be accessible from the server to printers
- Printers must have SNMP enabled (usually in network settings)
- Some corporate networks may block SNMP traffic

## Development

### Project Structure
```
snmp-printer-monitor/
├── backend/
│   ├── app.py              # Main Flask application
│   ├── snmp_monitor.py     # SNMP monitoring logic
│   ├── config.py           # Configuration management
│   └── requirements.txt    # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── utils/          # Utility functions
│   │   └── App.js          # Main React application
│   └── package.json        # Node.js dependencies
└── README.md
```

### Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## Production Deployment

### Backend
1. Set `DEBUG=False` in environment
2. Use a production WSGI server like Gunicorn:
```bash
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

### Frontend
1. Build the production bundle:
```bash
npm run build
```
2. Serve the build folder with a web server like Nginx

### Security Considerations
- Change the default SECRET_KEY
- Use HTTPS in production
- Implement authentication if needed
- Restrict SNMP access to monitoring server only
- Use SNMP v3 with encryption where possible

## License

MIT License - see LICENSE file for details

## Support

For issues and questions:
1. Check the troubleshooting section
2. Review printer SNMP documentation
3. Create an issue on GitHub with detailed information

---

Built with ❤️ for network administrators and IT professionals