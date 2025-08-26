from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_socketio import SocketIO, emit
import threading
import time
import schedule
from datetime import datetime
import json
from snmp_monitor import SNMPMonitor
from config import Config

app = Flask(__name__)
app.config.from_object(Config)
CORS(app, origins="*")
socketio = SocketIO(app, cors_allowed_origins="*", async_mode='eventlet')

# Global variables
snmp_monitor = SNMPMonitor()
printers = {}
monitoring_active = False

@app.route('/api/printers', methods=['GET'])
def get_printers():
    """Get all configured printers"""
    return jsonify(list(printers.values()))

@app.route('/api/printers', methods=['POST'])
def add_printer():
    """Add a new printer to monitor"""
    data = request.json
    printer_id = f"{data['ip']}:{data.get('port', 161)}"
    
    printer = {
        'id': printer_id,
        'name': data['name'],
        'ip': data['ip'],
        'port': data.get('port', 161),
        'community': data.get('community', 'public'),
        'model': '',
        'status': 'Unknown',
        'toner_levels': {},
        'supplies': {},
        'last_updated': None,
        'online': False
    }
    
    printers[printer_id] = printer
    
    # Test connection immediately
    test_result = snmp_monitor.test_connection(printer)
    if test_result['success']:
        printer.update(test_result['data'])
    
    return jsonify(printer), 201

@app.route('/api/printers/<printer_id>', methods=['DELETE'])
def remove_printer(printer_id):
    """Remove a printer from monitoring"""
    if printer_id in printers:
        del printers[printer_id]
        return jsonify({'message': 'Printer removed successfully'})
    return jsonify({'error': 'Printer not found'}), 404

@app.route('/api/printers/<printer_id>/test', methods=['POST'])
def test_printer(printer_id):
    """Test connection to a specific printer"""
    if printer_id not in printers:
        return jsonify({'error': 'Printer not found'}), 404
    
    printer = printers[printer_id]
    result = snmp_monitor.test_connection(printer)
    
    if result['success']:
        printer.update(result['data'])
    
    return jsonify(result)

@app.route('/api/monitoring/start', methods=['POST'])
def start_monitoring():
    """Start continuous monitoring"""
    global monitoring_active
    monitoring_active = True
    threading.Thread(target=monitoring_loop, daemon=True).start()
    return jsonify({'message': 'Monitoring started'})

@app.route('/api/monitoring/stop', methods=['POST'])
def stop_monitoring():
    """Stop continuous monitoring"""
    global monitoring_active
    monitoring_active = False
    return jsonify({'message': 'Monitoring stopped'})

@app.route('/api/monitoring/status', methods=['GET'])
def monitoring_status():
    """Get monitoring status"""
    return jsonify({'active': monitoring_active})

def monitoring_loop():
    """Main monitoring loop"""
    while monitoring_active:
        if printers:
            update_all_printers()
        time.sleep(30)  # Update every 30 seconds

def update_all_printers():
    """Update status for all printers"""
    for printer_id, printer in printers.items():
        try:
            result = snmp_monitor.get_printer_status(printer)
            if result['success']:
                printer.update(result['data'])
                printer['last_updated'] = datetime.now().isoformat()
                printer['online'] = True
            else:
                printer['online'] = False
                printer['status'] = 'Offline'
            
            # Emit update to connected clients
            socketio.emit('printer_update', printer)
            
        except Exception as e:
            print(f"Error updating printer {printer_id}: {str(e)}")
            printer['online'] = False
            printer['status'] = 'Error'

@socketio.on('connect')
def handle_connect():
    """Handle client connection"""
    print('Client connected')
    emit('printers_list', list(printers.values()))

@socketio.on('disconnect')
def handle_disconnect():
    """Handle client disconnection"""
    print('Client disconnected')

@socketio.on('request_update')
def handle_update_request():
    """Handle manual update request from client"""
    update_all_printers()

if __name__ == '__main__':
    print("Starting SNMP Printer Monitor...")
    print("Access the web interface at: http://localhost:5000")
    socketio.run(app, host='0.0.0.0', port=5000, debug=True)