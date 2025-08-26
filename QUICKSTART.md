# Quick Start Guide - Printer Monitor

Get your SNMP printer monitoring system up and running in minutes!

## 🚀 Quick Start (Recommended)

### Option 1: Automatic Startup Script
```bash
# Make the script executable and run it
chmod +x start.sh
./start.sh
```

This script will:
- ✅ Check prerequisites
- 📦 Install dependencies automatically
- 🔧 Configure environment
- 🚀 Start both backend and frontend

### Option 2: Manual Setup

#### 1. Backend Setup
```bash
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp ../config/.env.example .env
# Edit .env with your settings

# Start backend
python app.py
```

#### 2. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm start
```

#### 3. Access the Application
- 🌐 Frontend: http://localhost:3000
- 📊 Backend API: http://localhost:5000

## 🖨️ Adding Your First Printer

1. **Open the web interface** at http://localhost:3000
2. **Click "Add Printer"** in the navigation
3. **Fill in the details**:
   - Name: "Office Printer"
   - IP Address: "192.168.1.100" (your printer's IP)
   - Location: "Main Office"
   - SNMP Community: "public" (usually default)
4. **Test the connection** using the Test button
5. **Save the printer**

## 🔧 Testing SNMP Connectivity

Use the built-in test tool:
```bash
cd backend
python test_snmp.py 192.168.1.100
```

This will verify:
- ✅ Network connectivity
- 📡 SNMP protocol support
- 🖨️ Printer information retrieval
- 🖨️ Toner level access

## 📋 Prerequisites Checklist

Before starting, ensure you have:

- [ ] **Python 3.8+** installed
- [ ] **Node.js 16+** installed
- [ ] **Network access** to your printers
- [ ] **SNMP enabled** on target printers
- [ ] **Printer IP addresses** known
- [ ] **SNMP community strings** (usually "public")

## 🆘 Common Issues & Solutions

### "SNMP Connection Failed"
- ✅ Check printer IP address
- ✅ Verify SNMP is enabled on printer
- ✅ Test network connectivity (ping)
- ✅ Check firewall settings

### "No Toner Data Available"
- ✅ Verify printer MIB support
- ✅ Check SNMP community string
- ✅ Test with SNMP tools (snmpwalk)

### "Frontend Won't Start"
- ✅ Check Node.js version (16+)
- ✅ Clear npm cache: `npm cache clean --force`
- ✅ Delete node_modules and reinstall

## 🐳 Docker Quick Start

If you prefer Docker:
```bash
# Build and run with Docker Compose
docker-compose up -d

# Access at http://localhost
```

## 📱 What You'll See

After setup, you'll have:

- **Dashboard**: Overview of all printers
- **Printer List**: Status of each printer
- **Individual Views**: Detailed monitoring data
- **Real-time Updates**: Automatic status checking
- **Historical Data**: Status and toner level history

## 🔄 Next Steps

1. **Add more printers** to your fleet
2. **Configure monitoring intervals** in backend/.env
3. **Set up notifications** for low toner alerts
4. **Customize the interface** for your needs
5. **Deploy to production** using Docker or manual setup

## 📞 Need Help?

- 📖 Check the full [README.md](README.md)
- 🔍 Review the troubleshooting section
- 🐛 Check application logs
- 💬 Open an issue on GitHub

---

**Happy Monitoring! 🎉**