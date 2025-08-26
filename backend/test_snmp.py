#!/usr/bin/env python3
"""
SNMP Test Script for Printer Monitor
This script tests SNMP connectivity to printers and displays results
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from snmp_monitor import SNMPMonitor
import argparse

def test_printer(ip_address, community='public'):
    """Test SNMP connectivity to a printer"""
    print(f"🔍 Testing SNMP connection to {ip_address}")
    print(f"📡 Community: {community}")
    print("-" * 50)
    
    monitor = SNMPMonitor()
    
    # Test basic connectivity
    print("1. Testing basic connectivity...")
    if monitor.test_connection(ip_address, community):
        print("✅ SNMP connection successful")
    else:
        print("❌ SNMP connection failed")
        return False
    
    # Test full scan
    print("\n2. Testing full printer scan...")
    try:
        result = monitor.scan_printer(ip_address, community)
        
        print(f"📊 Status: {result['status']}")
        print(f"📝 Details: {result['details']}")
        
        if result['system_info']:
            print("\n📋 System Information:")
            for key, value in result['system_info'].items():
                print(f"   {key}: {value}")
        
        if result['toner_levels']:
            print("\n🖨️  Toner Levels:")
            for toner in result['toner_levels']:
                print(f"   {toner['name']}: {toner['percentage']}% ({toner['current']}/{toner['max']})")
        
        if result['paper_trays']:
            print("\n📄 Paper Trays:")
            for tray in result['paper_trays']:
                print(f"   Tray {tray['tray_number']}: {tray['status']} ({tray['current']}/{tray['capacity']})")
        
        return True
        
    except Exception as e:
        print(f"❌ Scan failed: {str(e)}")
        return False

def main():
    parser = argparse.ArgumentParser(description='Test SNMP connectivity to printers')
    parser.add_argument('ip_address', help='IP address of the printer to test')
    parser.add_argument('--community', '-c', default='public', help='SNMP community string (default: public)')
    parser.add_argument('--verbose', '-v', action='store_true', help='Verbose output')
    
    args = parser.parse_args()
    
    print("🚀 SNMP Printer Test Tool")
    print("=" * 50)
    
    success = test_printer(args.ip_address, args.community)
    
    print("\n" + "=" * 50)
    if success:
        print("🎉 Test completed successfully!")
        print("✅ Printer is ready for monitoring")
    else:
        print("❌ Test failed")
        print("🔧 Please check:")
        print("   - IP address is correct")
        print("   - SNMP is enabled on printer")
        print("   - Network connectivity")
        print("   - Firewall settings")
        print("   - SNMP community string")
    
    return 0 if success else 1

if __name__ == '__main__':
    sys.exit(main())