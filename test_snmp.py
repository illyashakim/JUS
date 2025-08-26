#!/usr/bin/env python3
"""
SNMP Test Script for Printer Monitor
Tests SNMP connectivity to printers and displays available information
"""

import sys
import time
from pysnmp.hlapi import *

def test_snmp_connection(host, community='public', port=161):
    """Test SNMP connection to a printer"""
    print(f"Testing SNMP connection to {host}:{port}")
    print("=" * 50)
    
    # Test basic connectivity
    print("1. Testing basic connectivity...")
    try:
        for (errorIndication, errorStatus, errorIndex, varBinds) in getCmd(
            SnmpEngine(),
            CommunityData(community),
            UdpTransportTarget((host, port), timeout=3, retries=1),
            ContextData(),
            ObjectType(ObjectIdentity('1.3.6.1.2.1.1.1.0')),  # System description
            lexicographicMode=False,
            maxRows=1
        ):
            if errorIndication:
                print(f"   ❌ Error: {errorIndication}")
                return False
            elif errorStatus:
                print(f"   ❌ Error: {errorStatus}")
                return False
            else:
                print("   ✅ SNMP connection successful")
                break
    except Exception as e:
        print(f"   ❌ Exception: {e}")
        return False
    
    # Test printer-specific OIDs
    print("\n2. Testing printer-specific OIDs...")
    
    oids_to_test = {
        'Printer Status': '1.3.6.1.2.1.25.3.5.1.2.1',
        'Toner Level': '1.3.6.1.2.1.43.10.2.1.4.1.1',
        'Max Toner Level': '1.3.6.1.2.1.43.10.2.1.4.1.2',
        'Printer Name': '1.3.6.1.2.1.25.3.2.1.3.1',
        'Printer Location': '1.3.6.1.2.1.25.3.2.1.6.1',
        'Serial Number': '1.3.6.1.2.1.43.5.1.1.17.1'
    }
    
    available_oids = {}
    
    for name, oid in oids_to_test.items():
        try:
            for (errorIndication, errorStatus, errorIndex, varBinds) in getCmd(
                SnmpEngine(),
                CommunityData(community),
                UdpTransportTarget((host, port), timeout=3, retries=1),
                ContextData(),
                ObjectType(ObjectIdentity(oid)),
                lexicographicMode=False,
                maxRows=1
            ):
                if errorIndication or errorStatus:
                    print(f"   ❌ {name}: Not available")
                    continue
                
                for varBind in varBinds:
                    value = varBind[1]
                    if name == 'Printer Status':
                        status_map = {
                            1: 'Idle',
                            2: 'Printing',
                            3: 'Warmup',
                            4: 'Stopped'
                        }
                        status = status_map.get(int(value), f'Unknown ({value})')
                        print(f"   ✅ {name}: {status}")
                    elif 'Toner' in name:
                        try:
                            print(f"   ✅ {name}: {int(value)}")
                        except (ValueError, TypeError):
                            print(f"   ✅ {name}: {value}")
                    else:
                        print(f"   ✅ {name}: {value}")
                    
                    available_oids[name] = str(value)
                    break
                    
        except Exception as e:
            print(f"   ❌ {name}: Error - {e}")
    
    # Display summary
    print(f"\n3. Summary for {host}")
    print("-" * 30)
    print(f"Available OIDs: {len(available_oids)}/{len(oids_to_test)}")
    
    if available_oids:
        print("\nAvailable information:")
        for name, value in available_oids.items():
            print(f"  • {name}: {value}")
    
    return len(available_oids) > 0

def scan_network_oids(host, community='public', port=161):
    """Scan for additional available OIDs"""
    print(f"\n4. Scanning for additional OIDs on {host}...")
    print("This may take a few moments...")
    
    common_oids = [
        '1.3.6.1.2.1.1',      # System
        '1.3.6.1.2.1.25.3',   # Printer MIB
        '1.3.6.1.2.1.43',     # Printer MIB
        '1.3.6.1.2.1.25.3.2', # Printer General
        '1.3.6.1.2.1.25.3.5', # Printer Marker
    ]
    
    found_oids = []
    
    for base_oid in common_oids:
        try:
            for (errorIndication, errorStatus, errorIndex, varBinds) in nextCmd(
                SnmpEngine(),
                CommunityData(community),
                UdpTransportTarget((host, port), timeout=2, retries=1),
                ContextData(),
                ObjectType(ObjectIdentity(base_oid)),
                lexicographicMode=False,
                maxRows=5
            ):
                if errorIndication or errorStatus:
                    break
                
                for varBind in varBinds:
                    oid = str(varBind[0])
                    value = str(varBind[1])
                    if len(value) < 100:  # Skip very long values
                        found_oids.append((oid, value))
                        print(f"   Found: {oid} = {value}")
                
                break
                
        except Exception as e:
            continue
    
    if found_oids:
        print(f"\nFound {len(found_oids)} additional OIDs")
    else:
        print("No additional OIDs found")

def main():
    """Main function"""
    print("Printer SNMP Test Tool")
    print("=" * 30)
    
    if len(sys.argv) < 2:
        print("Usage: python test_snmp.py <printer_ip> [community] [port]")
        print("Example: python test_snmp.py 192.168.1.100")
        print("Example: python test_snmp.py 192.168.1.100 private 161")
        sys.exit(1)
    
    host = sys.argv[1]
    community = sys.argv[2] if len(sys.argv) > 2 else 'public'
    port = int(sys.argv[3]) if len(sys.argv) > 3 else 161
    
    print(f"Target: {host}")
    print(f"Community: {community}")
    print(f"Port: {port}")
    print()
    
    # Test connection
    if test_snmp_connection(host, community, port):
        # Scan for additional OIDs
        scan_network_oids(host, community, port)
        
        print(f"\n✅ SNMP test completed successfully for {host}")
        print("The printer appears to be SNMP-compatible and accessible.")
    else:
        print(f"\n❌ SNMP test failed for {host}")
        print("Please check:")
        print("  • Printer IP address is correct")
        print("  • SNMP is enabled on the printer")
        print("  • Network connectivity")
        print("  • SNMP community string")
        print("  • Firewall settings")
        sys.exit(1)

if __name__ == '__main__':
    main()