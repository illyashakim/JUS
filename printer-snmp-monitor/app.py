#!/usr/bin/env python3
"""
Printer SNMP Monitoring Web Application
Monitors printer status, toner levels, and cartridge information via SNMP
"""

import os
import json
import time
from datetime import datetime
from flask import Flask, render_template, request, jsonify
from flask_socketio import SocketIO, emit
from apscheduler.schedulers.background import BackgroundScheduler
from pysnmp.hlapi import *
import threading
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
app.config['SECRET_KEY'] = 'your-secret-key-here'
socketio = SocketIO(app, cors_allowed_origins="*")

# Global variables
printers = {}
monitoring_active = False
scheduler = BackgroundScheduler()

# SNMP OIDs for printer monitoring
SNMP_OIDS = {
    'printer_status': '1.3.6.1.2.1.25.3.5.1.2.1',  # prtMarkerStatus
    'toner_level': '1.3.6.1.2.1.43.10.2.1.4.1.1',  # prtMarkerTonerLevel
    'toner_max_level': '1.3.6.1.2.1.43.10.2.1.4.1.2',  # prtMarkerTonerMaxLevel
    'cartridge_status': '1.3.6.1.2.1.43.10.2.1.4.1.3',  # prtMarkerTonerStatus
    'printer_name': '1.3.6.1.2.1.25.3.2.1.3.1',  # prtGeneralName
    'printer_location': '1.3.6.1.2.1.25.3.2.1.6.1',  # prtGeneralLocation
    'printer_serial': '1.3.6.1.2.1.43.5.1.1.17.1',  # prtGeneralSerialNumber
}

def get_snmp_data(host, community='public', port=161):
    """Get SNMP data from a printer"""
    try:
        printer_info = {
            'host': host,
            'status': 'Unknown',
            'toner_level': 0,
            'toner_max': 100,
            'toner_percentage': 0,
            'cartridge_status': 'Unknown',
            'name': 'Unknown',
            'location': 'Unknown',
            'serial': 'Unknown',
            'last_check': datetime.now().isoformat(),
            'online': False
        }
        
        # Check if printer is online
        for (errorIndication, errorStatus, errorIndex, varBinds) in getCmd(
            SnmpEngine(),
            CommunityData(community),
            UdpTransportTarget((host, port)),
            ContextData(),
            ObjectType(ObjectIdentity(SNMP_OIDS['printer_status'])),
            lexicographicMode=False,
            maxRows=1
        ):
            if errorIndication or errorStatus:
                logger.warning(f"SNMP error for {host}: {errorIndication or errorStatus}")
                continue
            
            printer_info['online'] = True
            
            # Get printer status
            for varBind in varBinds:
                if str(varBind[0]) == SNMP_OIDS['printer_status']:
                    status_value = int(varBind[1])
                    if status_value == 1:
                        printer_info['status'] = 'Idle'
                    elif status_value == 2:
                        printer_info['status'] = 'Printing'
                    elif status_value == 3:
                        printer_info['status'] = 'Warmup'
                    elif status_value == 4:
                        printer_info['status'] = 'Stopped'
                    else:
                        printer_info['status'] = f'Status {status_value}'
            
            # Get toner information
            for (errorIndication, errorStatus, errorIndex, varBinds) in getCmd(
                SnmpEngine(),
                CommunityData(community),
                UdpTransportTarget((host, port)),
                ContextData(),
                ObjectType(ObjectIdentity(SNMP_OIDS['toner_level'])),
                lexicographicMode=False,
                maxRows=1
            ):
                if not errorIndication and not errorStatus:
                    for varBind in varBinds:
                        if str(varBind[0]) == SNMP_OIDS['toner_level']:
                            try:
                                printer_info['toner_level'] = int(varBind[1])
                            except (ValueError, TypeError):
                                printer_info['toner_level'] = 0
            
            # Get max toner level
            for (errorIndication, errorStatus, errorIndex, varBinds) in getCmd(
                SnmpEngine(),
                CommunityData(community),
                UdpTransportTarget((host, port)),
                ContextData(),
                ObjectType(ObjectIdentity(SNMP_OIDS['toner_max_level'])),
                lexicographicMode=False,
                maxRows=1
            ):
                if not errorIndication and not errorStatus:
                    for varBind in varBinds:
                        if str(varBind[0]) == SNMP_OIDS['toner_max_level']:
                            try:
                                printer_info['toner_max'] = int(varBind[1])
                            except (ValueError, TypeError):
                                printer_info['toner_max'] = 100
            
            # Calculate toner percentage
            if printer_info['toner_max'] > 0:
                printer_info['toner_percentage'] = round(
                    (printer_info['toner_level'] / printer_info['toner_max']) * 100, 1
                )
            
            # Get printer name
            for (errorIndication, errorStatus, errorIndex, varBinds) in getCmd(
                SnmpEngine(),
                CommunityData(community),
                UdpTransportTarget((host, port)),
                ContextData(),
                ObjectType(ObjectIdentity(SNMP_OIDS['printer_name'])),
                lexicographicMode=False,
                maxRows=1
            ):
                if not errorIndication and not errorStatus:
                    for varBind in varBinds:
                        if str(varBind[0]) == SNMP_OIDS['printer_name']:
                            printer_info['name'] = str(varBind[1])
            
            # Get printer location
            for (errorIndication, errorStatus, errorIndex, varBinds) in getCmd(
                SnmpEngine(),
                CommunityData(community),
                UdpTransportTarget((host, port)),
                ContextData(),
                ObjectType(ObjectIdentity(SNMP_OIDS['printer_location'])),
                lexicographicMode=False,
                maxRows=1
            ):
                if not errorIndication and not errorStatus:
                    for varBind in varBinds:
                        if str(varBind[0]) == SNMP_OIDS['printer_location']:
                            printer_info['location'] = str(varBind[1])
            
            # Get printer serial number
            for (errorIndication, errorStatus, errorIndex, varBinds) in getCmd(
                SnmpEngine(),
                CommunityData(community),
                UdpTransportTarget((host, port)),
                ContextData(),
                ObjectType(ObjectIdentity(SNMP_OIDS['printer_serial'])),
                lexicographicMode=False,
                maxRows=1
            ):
                if not errorIndication and not errorStatus:
                    for varBind in varBinds:
                        if str(varBind[0]) == SNMP_OIDS['printer_serial']:
                            printer_info['serial'] = str(varBind[1])
        
        return printer_info
        
    except Exception as e:
        logger.error(f"Error getting SNMP data from {host}: {str(e)}")
        return {
            'host': host,
            'status': 'Error',
            'toner_level': 0,
            'toner_max': 100,
            'toner_percentage': 0,
            'cartridge_status': 'Error',
            'name': 'Error',
            'location': 'Error',
            'serial': 'Error',
            'last_check': datetime.now().isoformat(),
            'online': False,
            'error': str(e)
        }

def monitor_printers():
    """Monitor all configured printers"""
    global printers
    
    for printer_ip in printers:
        try:
            printer_data = get_snmp_data(printer_ip)
            printers[printer_ip] = printer_data
            
            # Emit real-time updates via WebSocket
            socketio.emit('printer_update', {
                'ip': printer_ip,
                'data': printer_data
            })
            
            logger.info(f"Updated {printer_ip}: {printer_data['status']} - Toner: {printer_data['toner_percentage']}%")
            
        except Exception as e:
            logger.error(f"Error monitoring {printer_ip}: {str(e)}")

def start_monitoring():
    """Start the monitoring scheduler"""
    global monitoring_active, scheduler
    
    if not monitoring_active:
        scheduler.add_job(func=monitor_printers, trigger="interval", seconds=30)
        scheduler.start()
        monitoring_active = True
        logger.info("Printer monitoring started")

def stop_monitoring():
    """Stop the monitoring scheduler"""
    global monitoring_active, scheduler
    
    if monitoring_active:
        scheduler.shutdown()
        monitoring_active = False
        logger.info("Printer monitoring stopped")

@app.route('/')
def index():
    """Main page"""
    return render_template('index.html')

@app.route('/api/printers', methods=['GET'])
def get_printers():
    """Get all printer status"""
    return jsonify(printers)

@app.route('/api/printers', methods=['POST'])
def add_printer():
    """Add a new printer to monitor"""
    data = request.get_json()
    printer_ip = data.get('ip')
    
    if not printer_ip:
        return jsonify({'error': 'IP address is required'}), 400
    
    if printer_ip in printers:
        return jsonify({'error': 'Printer already exists'}), 400
    
    # Test connection
    printer_data = get_snmp_data(printer_ip)
    printers[printer_ip] = printer_data
    
    return jsonify({'message': 'Printer added successfully', 'printer': printer_data})

@app.route('/api/printers/<printer_ip>', methods=['DELETE'])
def remove_printer(printer_ip):
    """Remove a printer from monitoring"""
    if printer_ip in printers:
        del printers[printer_ip]
        return jsonify({'message': 'Printer removed successfully'})
    else:
        return jsonify({'error': 'Printer not found'}), 404

@app.route('/api/monitoring/start', methods=['POST'])
def start_monitoring_api():
    """Start monitoring via API"""
    start_monitoring()
    return jsonify({'message': 'Monitoring started'})

@app.route('/api/monitoring/stop', methods=['POST'])
def stop_monitoring_api():
    """Stop monitoring via API"""
    stop_monitoring()
    return jsonify({'message': 'Monitoring stopped'})

@app.route('/api/monitoring/status', methods=['GET'])
def monitoring_status():
    """Get monitoring status"""
    return jsonify({
        'active': monitoring_active,
        'printer_count': len(printers)
    })

@socketio.on('connect')
def handle_connect():
    """Handle WebSocket connection"""
    emit('connected', {'data': 'Connected to printer monitor'})

@socketio.on('disconnect')
def handle_disconnect():
    """Handle WebSocket disconnection"""
    logger.info('Client disconnected')

if __name__ == '__main__':
    # Start monitoring on startup
    start_monitoring()
    
    # Run the application
    socketio.run(app, host='0.0.0.0', port=5000, debug=True)