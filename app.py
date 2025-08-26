from flask import Flask, render_template, jsonify, request
from flask_sqlalchemy import SQLAlchemy
import os

from utils.snmp import query_printer

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///printers.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)


class Printer(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    ip = db.Column(db.String(64), unique=True, nullable=False)
    community = db.Column(db.String(64), default='public')
    description = db.Column(db.String(128))


def get_printer_status(printer):
    """Return status dict for a Printer row."""
    return query_printer(printer.ip, printer.community)


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/api/printers', methods=['GET'])
def api_printers():
    printers = Printer.query.all()
    result = []
    for p in printers:
        status = get_printer_status(p)
        result.append({
            'id': p.id,
            'ip': p.ip,
            'description': p.description,
            **status
        })
    return jsonify(result)


@app.route('/api/printers', methods=['POST'])
def add_printer():
    data = request.get_json()
    printer = Printer(ip=data['ip'], community=data.get('community', 'public'), description=data.get('description', ''))
    db.session.add(printer)
    db.session.commit()
    return jsonify({'message': 'Printer added'}), 201


@app.route('/api/printers/<int:pid>', methods=['DELETE'])
def delete_printer(pid):
    printer = Printer.query.get_or_404(pid)
    db.session.delete(printer)
    db.session.commit()
    return jsonify({'message': 'Printer deleted'})


if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(host='0.0.0.0', port=5000, debug=True)