/**
 * Printer SNMP Monitor - Frontend JavaScript
 * Handles real-time monitoring, WebSocket communication, and UI interactions
 */

class PrinterMonitor {
    constructor() {
        this.socket = null;
        this.printers = {};
        this.monitoringActive = false;
        this.init();
    }

    init() {
        this.initializeSocket();
        this.bindEvents();
        this.loadInitialData();
        this.updateSystemStatus();
    }

    initializeSocket() {
        // Initialize Socket.IO connection
        this.socket = io();
        
        this.socket.on('connect', () => {
            console.log('Connected to server');
            this.showToast('Connected to monitoring server', 'success');
        });

        this.socket.on('disconnect', () => {
            console.log('Disconnected from server');
            this.showToast('Disconnected from monitoring server', 'warning');
        });

        this.socket.on('printer_update', (data) => {
            this.updatePrinter(data.ip, data.data);
        });

        this.socket.on('connected', (data) => {
            console.log('Server message:', data);
        });
    }

    bindEvents() {
        // Control panel buttons
        document.getElementById('start-monitoring').addEventListener('click', () => {
            this.startMonitoring();
        });

        document.getElementById('stop-monitoring').addEventListener('click', () => {
            this.stopMonitoring();
        });

        document.getElementById('refresh-all').addEventListener('click', () => {
            this.refreshAllPrinters();
        });

        // Add printer form
        document.getElementById('add-printer-submit').addEventListener('click', () => {
            this.addPrinter();
        });

        // Form submission on Enter key
        document.getElementById('printer-ip').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.addPrinter();
            }
        });
    }

    async loadInitialData() {
        try {
            const response = await fetch('/api/printers');
            const printers = await response.json();
            
            Object.keys(printers).forEach(ip => {
                this.printers[ip] = printers[ip];
            });
            
            this.renderPrinters();
            this.updateSystemStatus();
        } catch (error) {
            console.error('Error loading initial data:', error);
            this.showToast('Error loading printer data', 'error');
        }

        // Load monitoring status
        try {
            const response = await fetch('/api/monitoring/status');
            const status = await response.json();
            this.monitoringActive = status.active;
            this.updateMonitoringStatus();
        } catch (error) {
            console.error('Error loading monitoring status:', error);
        }
    }

    async startMonitoring() {
        try {
            const response = await fetch('/api/monitoring/start', { method: 'POST' });
            const result = await response.json();
            
            if (response.ok) {
                this.monitoringActive = true;
                this.updateMonitoringStatus();
                this.showToast('Monitoring started successfully', 'success');
            } else {
                this.showToast(result.error || 'Failed to start monitoring', 'error');
            }
        } catch (error) {
            console.error('Error starting monitoring:', error);
            this.showToast('Error starting monitoring', 'error');
        }
    }

    async stopMonitoring() {
        try {
            const response = await fetch('/api/monitoring/stop', { method: 'POST' });
            const result = await response.json();
            
            if (response.ok) {
                this.monitoringActive = false;
                this.updateMonitoringStatus();
                this.showToast('Monitoring stopped successfully', 'success');
            } else {
                this.showToast(result.error || 'Failed to stop monitoring', 'error');
            }
        } catch (error) {
            console.error('Error stopping monitoring:', error);
            this.showToast('Error stopping monitoring', 'error');
        }
    }

    async addPrinter() {
        const ip = document.getElementById('printer-ip').value.trim();
        const community = document.getElementById('printer-community').value.trim();
        const port = document.getElementById('printer-port').value.trim();

        if (!ip) {
            this.showToast('Please enter a printer IP address', 'warning');
            return;
        }

        // Validate IP address format
        if (!this.isValidIP(ip)) {
            this.showToast('Please enter a valid IP address', 'warning');
            return;
        }

        try {
            const response = await fetch('/api/printers', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ip: ip,
                    community: community || 'public',
                    port: parseInt(port) || 161
                })
            });

            const result = await response.json();

            if (response.ok) {
                this.printers[ip] = result.printer;
                this.renderPrinters();
                this.updateSystemStatus();
                this.showToast('Printer added successfully', 'success');
                
                // Close modal and reset form
                const modal = bootstrap.Modal.getInstance(document.getElementById('addPrinterModal'));
                modal.hide();
                document.getElementById('add-printer-form').reset();
            } else {
                this.showToast(result.error || 'Failed to add printer', 'error');
            }
        } catch (error) {
            console.error('Error adding printer:', error);
            this.showToast('Error adding printer', 'error');
        }
    }

    async removePrinter(ip) {
        if (!confirm(`Are you sure you want to remove printer ${ip}?`)) {
            return;
        }

        try {
            const response = await fetch(`/api/printers/${ip}`, { method: 'DELETE' });
            const result = await response.json();

            if (response.ok) {
                delete this.printers[ip];
                this.renderPrinters();
                this.updateSystemStatus();
                this.showToast('Printer removed successfully', 'success');
            } else {
                this.showToast(result.error || 'Failed to remove printer', 'error');
            }
        } catch (error) {
            console.error('Error removing printer:', error);
            this.showToast('Error removing printer', 'error');
        }
    }

    async refreshAllPrinters() {
        try {
            const response = await fetch('/api/printers');
            const printers = await response.json();
            
            Object.keys(printers).forEach(ip => {
                this.printers[ip] = printers[ip];
            });
            
            this.renderPrinters();
            this.updateSystemStatus();
            this.showToast('All printers refreshed', 'success');
        } catch (error) {
            console.error('Error refreshing printers:', error);
            this.showToast('Error refreshing printers', 'error');
        }
    }

    updatePrinter(ip, data) {
        this.printers[ip] = data;
        this.renderPrinterCard(ip, data);
        this.updateSystemStatus();
    }

    renderPrinters() {
        const grid = document.getElementById('printer-grid');
        const noPrinters = document.getElementById('no-printers');

        if (Object.keys(this.printers).length === 0) {
            grid.style.display = 'none';
            noPrinters.style.display = 'block';
        } else {
            grid.style.display = 'block';
            noPrinters.style.display = 'none';
            grid.innerHTML = '';

            Object.keys(this.printers).forEach(ip => {
                this.renderPrinterCard(ip, this.printers[ip]);
            });
        }
    }

    renderPrinterCard(ip, printer) {
        const grid = document.getElementById('printer-grid');
        let card = document.getElementById(`printer-card-${ip}`);

        if (!card) {
            card = document.createElement('div');
            card.id = `printer-card-${ip}`;
            card.className = 'col-lg-4 col-md-6 col-sm-12 mb-4';
            grid.appendChild(card);
        }

        const statusClass = this.getStatusClass(printer.status);
        const onlineClass = printer.online ? 'online' : 'offline';
        const tonerClass = this.getTonerClass(printer.toner_percentage);

        card.innerHTML = `
            <div class="card printer-card ${onlineClass} fade-in">
                <div class="card-header d-flex justify-content-between align-items-center">
                    <h6 class="card-title mb-0">
                        <i class="fas fa-print me-2"></i>
                        ${printer.name !== 'Unknown' ? printer.name : ip}
                    </h6>
                    <div class="dropdown">
                        <button class="btn btn-sm btn-outline-light" type="button" data-bs-toggle="dropdown">
                            <i class="fas fa-ellipsis-v"></i>
                        </button>
                        <ul class="dropdown-menu">
                            <li><a class="dropdown-item" href="#" onclick="printerMonitor.showPrinterDetails('${ip}')">
                                <i class="fas fa-info-circle me-2"></i>Details
                            </a></li>
                            <li><a class="dropdown-item" href="#" onclick="printerMonitor.removePrinter('${ip}')">
                                <i class="fas fa-trash me-2"></i>Remove
                            </a></li>
                        </ul>
                    </div>
                </div>
                <div class="card-body">
                    <div class="row mb-3">
                        <div class="col-6">
                            <small class="text-muted">Status</small>
                            <div>
                                <span class="printer-status ${statusClass}">${printer.status}</span>
                            </div>
                        </div>
                        <div class="col-6">
                            <small class="text-muted">Location</small>
                            <div class="fw-bold">${printer.location !== 'Unknown' ? printer.location : 'N/A'}</div>
                        </div>
                    </div>
                    
                    <div class="toner-level-container">
                        <div class="d-flex justify-content-between align-items-center mb-2">
                            <small class="text-muted">Toner Level</small>
                            <span class="fw-bold ${tonerClass}">${printer.toner_percentage}%</span>
                        </div>
                        <div class="toner-bar">
                            <div class="toner-fill ${tonerClass}" style="width: ${printer.toner_percentage}%"></div>
                            <div class="toner-percentage">${printer.toner_percentage}%</div>
                        </div>
                    </div>
                    
                    <div class="row mt-3">
                        <div class="col-6">
                            <small class="text-muted">IP Address</small>
                            <div class="fw-bold">${ip}</div>
                        </div>
                        <div class="col-6">
                            <small class="text-muted">Last Check</small>
                            <div class="fw-bold">${this.formatTime(printer.last_check)}</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    showPrinterDetails(ip) {
        const printer = this.printers[ip];
        if (!printer) return;

        const modal = new bootstrap.Modal(document.getElementById('printerDetailsModal'));
        const title = document.getElementById('printer-details-title');
        const body = document.getElementById('printer-details-body');

        title.textContent = `Printer Details - ${printer.name !== 'Unknown' ? printer.name : ip}`;

        body.innerHTML = `
            <div class="row">
                <div class="col-md-6">
                    <div class="printer-detail-row">
                        <span class="printer-detail-label">IP Address:</span>
                        <span class="printer-detail-value">${ip}</span>
                    </div>
                    <div class="printer-detail-row">
                        <span class="printer-detail-label">Name:</span>
                        <span class="printer-detail-value">${printer.name !== 'Unknown' ? printer.name : 'N/A'}</span>
                    </div>
                    <div class="printer-detail-row">
                        <span class="printer-detail-label">Location:</span>
                        <span class="printer-detail-value">${printer.location !== 'Unknown' ? printer.location : 'N/A'}</span>
                    </div>
                    <div class="printer-detail-row">
                        <span class="printer-detail-label">Serial Number:</span>
                        <span class="printer-detail-value">${printer.serial !== 'Unknown' ? printer.serial : 'N/A'}</span>
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="printer-detail-row">
                        <span class="printer-detail-label">Status:</span>
                        <span class="printer-detail-value">
                            <span class="printer-status ${this.getStatusClass(printer.status)}">${printer.status}</span>
                        </span>
                    </div>
                    <div class="printer-detail-row">
                        <span class="printer-detail-label">Online:</span>
                        <span class="printer-detail-value">
                            <span class="status-indicator ${printer.online ? 'online' : 'offline'}"></span>
                            ${printer.online ? 'Yes' : 'No'}
                        </span>
                    </div>
                    <div class="printer-detail-row">
                        <span class="printer-detail-label">Toner Level:</span>
                        <span class="printer-detail-value">${printer.toner_level} / ${printer.toner_max}</span>
                    </div>
                    <div class="printer-detail-row">
                        <span class="printer-detail-label">Last Check:</span>
                        <span class="printer-detail-value">${this.formatTime(printer.last_check)}</span>
                    </div>
                </div>
            </div>
            ${printer.error ? `
            <div class="alert alert-warning mt-3">
                <i class="fas fa-exclamation-triangle me-2"></i>
                <strong>Error:</strong> ${printer.error}
            </div>
            ` : ''}
        `;

        modal.show();
    }

    updateSystemStatus() {
        const printerCount = Object.keys(this.printers).length;
        const onlineCount = Object.values(this.printers).filter(p => p.online).length;

        document.getElementById('printer-count').textContent = printerCount;
        document.getElementById('online-count').textContent = onlineCount;
        document.getElementById('last-update').textContent = this.formatTime(new Date().toISOString());
    }

    updateMonitoringStatus() {
        const statusBadge = document.getElementById('monitoring-status');
        const startBtn = document.getElementById('start-monitoring');
        const stopBtn = document.getElementById('stop-monitoring');

        if (this.monitoringActive) {
            statusBadge.textContent = 'Active';
            statusBadge.className = 'badge bg-success';
            startBtn.disabled = true;
            stopBtn.disabled = false;
        } else {
            statusBadge.textContent = 'Stopped';
            statusBadge.className = 'badge bg-secondary';
            startBtn.disabled = false;
            stopBtn.disabled = true;
        }
    }

    getStatusClass(status) {
        const statusMap = {
            'Idle': 'status-idle',
            'Printing': 'status-printing',
            'Warmup': 'status-warmup',
            'Stopped': 'status-stopped',
            'Error': 'status-error'
        };
        return statusMap[status] || 'status-unknown';
    }

    getTonerClass(percentage) {
        if (percentage >= 20) return '';
        if (percentage >= 10) return 'low';
        return 'critical';
    }

    isValidIP(ip) {
        const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
        return ipRegex.test(ip);
    }

    formatTime(isoString) {
        try {
            const date = new Date(isoString);
            const now = new Date();
            const diffMs = now - date;
            const diffMins = Math.floor(diffMs / 60000);
            const diffSecs = Math.floor((diffMs % 60000) / 1000);

            if (diffMins < 1) {
                return `${diffSecs}s ago`;
            } else if (diffMins < 60) {
                return `${diffMins}m ago`;
            } else {
                return date.toLocaleTimeString();
            }
        } catch (error) {
            return 'Unknown';
        }
    }

    showToast(message, type = 'info') {
        const toastContainer = document.querySelector('.toast-container');
        const toastId = `toast-${Date.now()}`;
        
        const toastHtml = `
            <div id="${toastId}" class="toast" role="alert">
                <div class="toast-header">
                    <i class="fas fa-${this.getToastIcon(type)} me-2 text-${this.getToastColor(type)}"></i>
                    <strong class="me-auto">Printer Monitor</strong>
                    <button type="button" class="btn-close" data-bs-dismiss="toast"></button>
                </div>
                <div class="toast-body">
                    ${message}
                </div>
            </div>
        `;
        
        toastContainer.insertAdjacentHTML('beforeend', toastHtml);
        
        const toastElement = document.getElementById(toastId);
        const toast = new bootstrap.Toast(toastElement);
        toast.show();
        
        // Auto-remove toast after it's hidden
        toastElement.addEventListener('hidden.bs.toast', () => {
            toastElement.remove();
        });
    }

    getToastIcon(type) {
        const icons = {
            'success': 'check-circle',
            'error': 'exclamation-circle',
            'warning': 'exclamation-triangle',
            'info': 'info-circle'
        };
        return icons[type] || 'info-circle';
    }

    getToastColor(type) {
        const colors = {
            'success': 'success',
            'error': 'danger',
            'warning': 'warning',
            'info': 'info'
        };
        return colors[type] || 'info';
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.printerMonitor = new PrinterMonitor();
});

// Handle page visibility changes to pause/resume monitoring
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        console.log('Page hidden, pausing updates');
    } else {
        console.log('Page visible, resuming updates');
        if (window.printerMonitor) {
            window.printerMonitor.loadInitialData();
        }
    }
});