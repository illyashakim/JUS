from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import os
from dotenv import load_dotenv
from apscheduler.schedulers.background import BackgroundScheduler
from snmp_monitor import SNMPMonitor
import logging

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///printers.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'your-secret-key-here')

# Initialize extensions
db = SQLAlchemy(app)
CORS(app)

# Database Models
class Printer(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    ip_address = db.Column(db.String(15), nullable=False)
    location = db.Column(db.String(100))
    model = db.Column(db.String(100))
    snmp_community = db.Column(db.String(50), default='public')
    status = db.Column(db.String(20), default='unknown')
    last_seen = db.Column(db.DateTime, default=datetime.utcnow)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    status_history = db.relationship('PrinterStatus', backref='printer', lazy=True)
    toner_levels = db.relationship('TonerLevel', backref='printer', lazy=True)

class PrinterStatus(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    printer_id = db.Column(db.Integer, db.ForeignKey('printer.id'), nullable=False)
    status = db.Column(db.String(20), nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    details = db.Column(db.Text)

class TonerLevel(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    printer_id = db.Column(db.Integer, db.ForeignKey('printer.id'), nullable=False)
    cartridge_name = db.Column(db.String(100), nullable=False)
    current_level = db.Column(db.Integer)
    max_level = db.Column(db.Integer)
    percentage = db.Column(db.Float)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

# Initialize SNMP Monitor
snmp_monitor = SNMPMonitor()

# Background scheduler for monitoring
scheduler = BackgroundScheduler()
scheduler.start()

@app.route('/api/printers', methods=['GET'])
def get_printers():
    """Get all printers"""
    try:
        printers = Printer.query.all()
        result = []
        for printer in printers:
            # Get latest status and toner levels
            latest_status = PrinterStatus.query.filter_by(printer_id=printer.id).order_by(PrinterStatus.timestamp.desc()).first()
            latest_toner = TonerLevel.query.filter_by(printer_id=printer.id).order_by(TonerLevel.timestamp.desc()).first()
            
            printer_data = {
                'id': printer.id,
                'name': printer.name,
                'ip_address': printer.ip_address,
                'location': printer.location,
                'model': printer.model,
                'status': latest_status.status if latest_status else printer.status,
                'last_seen': printer.last_seen.isoformat() if printer.last_seen else None,
                'toner_level': latest_toner.percentage if latest_toner else None,
                'cartridge_name': latest_toner.cartridge_name if latest_toner else None
            }
            result.append(printer_data)
        
        return jsonify({'success': True, 'data': result})
    except Exception as e:
        logger.error(f"Error getting printers: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/printers', methods=['POST'])
def add_printer():
    """Add a new printer"""
    try:
        data = request.get_json()
        required_fields = ['name', 'ip_address']
        
        for field in required_fields:
            if field not in data:
                return jsonify({'success': False, 'error': f'Missing required field: {field}'}), 400
        
        printer = Printer(
            name=data['name'],
            ip_address=data['ip_address'],
            location=data.get('location', ''),
            model=data.get('model', ''),
            snmp_community=data.get('snmp_community', 'public')
        )
        
        db.session.add(printer)
        db.session.commit()
        
        return jsonify({'success': True, 'data': {'id': printer.id}})
    except Exception as e:
        logger.error(f"Error adding printer: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/printers/<int:printer_id>', methods=['GET'])
def get_printer(printer_id):
    """Get specific printer details"""
    try:
        printer = Printer.query.get_or_404(printer_id)
        
        # Get status history
        status_history = PrinterStatus.query.filter_by(printer_id=printer_id).order_by(PrinterStatus.timestamp.desc()).limit(10).all()
        
        # Get toner levels
        toner_levels = TonerLevel.query.filter_by(printer_id=printer_id).order_by(TonerLevel.timestamp.desc()).limit(10).all()
        
        result = {
            'id': printer.id,
            'name': printer.name,
            'ip_address': printer.ip_address,
            'location': printer.location,
            'model': printer.model,
            'status': printer.status,
            'last_seen': printer.last_seen.isoformat() if printer.last_seen else None,
            'status_history': [{'status': s.status, 'timestamp': s.timestamp.isoformat(), 'details': s.details} for s in status_history],
            'toner_levels': [{'cartridge_name': t.cartridge_name, 'current_level': t.current_level, 'max_level': t.max_level, 'percentage': t.percentage, 'timestamp': t.timestamp.isoformat()} for t in toner_levels]
        }
        
        return jsonify({'success': True, 'data': result})
    except Exception as e:
        logger.error(f"Error getting printer {printer_id}: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/printers/<int:printer_id>/scan', methods=['POST'])
def scan_printer(printer_id):
    """Manually scan a printer for current status"""
    try:
        printer = Printer.query.get_or_404(printer_id)
        
        # Perform SNMP scan
        status_data = snmp_monitor.scan_printer(printer.ip_address, printer.snmp_community)
        
        # Update printer status
        printer.status = status_data['status']
        printer.last_seen = datetime.utcnow()
        
        # Save status history
        status_record = PrinterStatus(
            printer_id=printer.id,
            status=status_data['status'],
            details=status_data.get('details', '')
        )
        db.session.add(status_record)
        
        # Save toner levels if available
        if 'toner_levels' in status_data:
            for toner in status_data['toner_levels']:
                toner_record = TonerLevel(
                    printer_id=printer.id,
                    cartridge_name=toner['name'],
                    current_level=toner['current'],
                    max_level=toner['max'],
                    percentage=toner['percentage']
                )
                db.session.add(toner_record)
        
        db.session.commit()
        
        return jsonify({'success': True, 'data': status_data})
    except Exception as e:
        logger.error(f"Error scanning printer {printer_id}: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/printers/<int:printer_id>', methods=['DELETE'])
def delete_printer(printer_id):
    """Delete a printer"""
    try:
        printer = Printer.query.get_or_404(printer_id)
        db.session.delete(printer)
        db.session.commit()
        return jsonify({'success': True})
    except Exception as e:
        logger.error(f"Error deleting printer {printer_id}: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/dashboard', methods=['GET'])
def get_dashboard():
    """Get dashboard statistics"""
    try:
        total_printers = Printer.query.count()
        online_printers = Printer.query.filter_by(status='online').count()
        offline_printers = Printer.query.filter_by(status='offline').count()
        error_printers = Printer.query.filter_by(status='error').count()
        
        # Get printers with low toner
        low_toner_printers = db.session.query(Printer).join(TonerLevel).filter(TonerLevel.percentage < 20).distinct().count()
        
        result = {
            'total_printers': total_printers,
            'online_printers': online_printers,
            'offline_printers': offline_printers,
            'error_printers': error_printers,
            'low_toner_printers': low_toner_printers
        }
        
        return jsonify({'success': True, 'data': result})
    except Exception as e:
        logger.error(f"Error getting dashboard: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

def scan_all_printers():
    """Background task to scan all printers"""
    with app.app_context():
        try:
            printers = Printer.query.all()
            for printer in printers:
                try:
                    status_data = snmp_monitor.scan_printer(printer.ip_address, printer.snmp_community)
                    
                    # Update printer status
                    printer.status = status_data['status']
                    printer.last_seen = datetime.utcnow()
                    
                    # Save status history
                    status_record = PrinterStatus(
                        printer_id=printer.id,
                        status=status_data['status'],
                        details=status_data.get('details', '')
                    )
                    db.session.add(status_record)
                    
                    # Save toner levels if available
                    if 'toner_levels' in status_data:
                        for toner in status_data['toner_levels']:
                            toner_record = TonerLevel(
                                printer_id=printer.id,
                                cartridge_name=toner['name'],
                                current_level=toner['current'],
                                max_level=toner['max'],
                                percentage=toner['percentage']
                            )
                            db.session.add(toner_record)
                    
                except Exception as e:
                    logger.error(f"Error scanning printer {printer.id}: {str(e)}")
                    printer.status = 'error'
                    printer.last_seen = datetime.utcnow()
            
            db.session.commit()
            logger.info(f"Completed background scan of {len(printers)} printers")
            
        except Exception as e:
            logger.error(f"Error in background scan: {str(e)}")

# Schedule background monitoring (every 5 minutes)
scheduler.add_job(func=scan_all_printers, trigger="interval", minutes=5)

@app.before_first_request
def create_tables():
    """Create database tables"""
    db.create_all()

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)