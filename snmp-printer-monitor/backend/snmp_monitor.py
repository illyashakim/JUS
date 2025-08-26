from pysnmp.hlapi import *
import re
from datetime import datetime

class SNMPMonitor:
    def __init__(self):
        # Standard printer MIB OIDs
        self.oids = {
            # System information
            'sysDescr': '1.3.6.1.2.1.1.1.0',
            'sysName': '1.3.6.1.2.1.1.5.0',
            'sysUpTime': '1.3.6.1.2.1.1.3.0',
            
            # Printer-specific OIDs (RFC 3805 - Printer MIB)
            'hrDeviceStatus': '1.3.6.1.2.1.25.3.2.1.5.1',
            'prtGeneralCurrentLocalization': '1.3.6.1.2.1.43.5.1.1.2.1',
            'prtGeneralConfigChanges': '1.3.6.1.2.1.43.5.1.1.3.1',
            'prtGeneralCurrentOperator': '1.3.6.1.2.1.43.5.1.1.4.1',
            'prtGeneralServicePerson': '1.3.6.1.2.1.43.5.1.1.5.1',
            'prtInputDefaultIndex': '1.3.6.1.2.1.43.8.2.1.2.1',
            'prtOutputDefaultIndex': '1.3.6.1.2.1.43.9.2.1.2.1',
            'prtMarkerDefaultIndex': '1.3.6.1.2.1.43.10.2.1.2.1',
            
            # Supply information (toner, ink, etc.)
            'prtMarkerSuppliesTable': '1.3.6.1.2.1.43.11.1.1',
            'prtMarkerSuppliesDescription': '1.3.6.1.2.1.43.11.1.1.6',
            'prtMarkerSuppliesType': '1.3.6.1.2.1.43.11.1.1.5',
            'prtMarkerSuppliesClass': '1.3.6.1.2.1.43.11.1.1.4',
            'prtMarkerSuppliesMaxCapacity': '1.3.6.1.2.1.43.11.1.1.8',
            'prtMarkerSuppliesLevel': '1.3.6.1.2.1.43.11.1.1.9',
            
            # Input/Output trays
            'prtInputTable': '1.3.6.1.2.1.43.8.2.1',
            'prtOutputTable': '1.3.6.1.2.1.43.9.2.1',
            
            # Console display information
            'prtConsoleDisplayBuffer': '1.3.6.1.2.1.43.16.5.1.2',
            
            # Alerts
            'prtAlertTable': '1.3.6.1.2.1.43.18.1.1',
        }
        
        # Supply type mappings
        self.supply_types = {
            1: 'other',
            2: 'unknown',
            3: 'toner',
            4: 'wasteToner',
            5: 'ink',
            6: 'inkCartridge',
            7: 'inkRibbon',
            8: 'wasteInk',
            9: 'opc',
            10: 'developer',
            11: 'fuserOil',
            12: 'solidWax',
            13: 'ribbonWax',
            14: 'wasteWax',
            15: 'fuser',
            16: 'coronaWire',
            17: 'fuserOilWick',
            18: 'cleanerUnit',
            19: 'fuserCleaningPad',
            20: 'transferUnit',
            21: 'tonerCartridge',
            22: 'fuserKit',
            23: 'waterKit',
            24: 'wasteTonerBottle',
        }
        
        # Device status mappings
        self.device_status = {
            1: 'unknown',
            2: 'running',
            3: 'warning',
            4: 'testing',
            5: 'down'
        }

    def get_snmp_data(self, ip, port, community, oid):
        """Get SNMP data from device"""
        try:
            for (errorIndication, errorStatus, errorIndex, varBinds) in nextCmd(
                SnmpEngine(),
                CommunityData(community),
                UdpTransportTarget((ip, port), timeout=5, retries=3),
                ContextData(),
                ObjectType(ObjectIdentity(oid)),
                lexicographicMode=False):
                
                if errorIndication:
                    return None
                elif errorStatus:
                    return None
                else:
                    return varBinds
        except Exception as e:
            print(f"SNMP Error: {str(e)}")
            return None

    def get_single_oid(self, ip, port, community, oid):
        """Get single OID value"""
        try:
            for (errorIndication, errorStatus, errorIndex, varBinds) in getCmd(
                SnmpEngine(),
                CommunityData(community),
                UdpTransportTarget((ip, port), timeout=5, retries=3),
                ContextData(),
                ObjectType(ObjectIdentity(oid))):
                
                if errorIndication:
                    return None
                elif errorStatus:
                    return None
                else:
                    return str(varBinds[0][1])
        except Exception as e:
            print(f"SNMP Error: {str(e)}")
            return None

    def test_connection(self, printer):
        """Test SNMP connection to printer"""
        try:
            sys_descr = self.get_single_oid(
                printer['ip'], 
                printer['port'], 
                printer['community'], 
                self.oids['sysDescr']
            )
            
            if sys_descr:
                return {
                    'success': True,
                    'data': {
                        'model': sys_descr,
                        'status': 'Online',
                        'online': True,
                        'last_updated': datetime.now().isoformat()
                    }
                }
            else:
                return {
                    'success': False,
                    'error': 'Unable to connect to printer'
                }
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }

    def get_printer_status(self, printer):
        """Get comprehensive printer status"""
        try:
            result = {
                'success': True,
                'data': {
                    'status': 'Unknown',
                    'model': '',
                    'supplies': {},
                    'toner_levels': {},
                    'alerts': [],
                    'uptime': '',
                    'online': True
                }
            }
            
            # Get system description (model)
            sys_descr = self.get_single_oid(
                printer['ip'], printer['port'], printer['community'], 
                self.oids['sysDescr']
            )
            if sys_descr:
                result['data']['model'] = sys_descr
            
            # Get device status
            device_status = self.get_single_oid(
                printer['ip'], printer['port'], printer['community'], 
                self.oids['hrDeviceStatus']
            )
            if device_status:
                status_code = int(device_status)
                result['data']['status'] = self.device_status.get(status_code, 'Unknown')
            
            # Get uptime
            uptime = self.get_single_oid(
                printer['ip'], printer['port'], printer['community'], 
                self.oids['sysUpTime']
            )
            if uptime:
                # Convert uptime from ticks to readable format
                uptime_seconds = int(uptime) / 100
                days = int(uptime_seconds // 86400)
                hours = int((uptime_seconds % 86400) // 3600)
                minutes = int((uptime_seconds % 3600) // 60)
                result['data']['uptime'] = f"{days}d {hours}h {minutes}m"
            
            # Get supply levels (toner, ink, etc.)
            supplies = self.get_supply_levels(printer)
            if supplies:
                result['data']['supplies'] = supplies['supplies']
                result['data']['toner_levels'] = supplies['toner_levels']
            
            return result
            
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }

    def get_supply_levels(self, printer):
        """Get detailed supply level information"""
        try:
            supplies = {}
            toner_levels = {}
            
            # Walk through the supplies table
            for oid_suffix in range(1, 20):  # Check first 20 supplies
                # Get supply description
                desc_oid = f"{self.oids['prtMarkerSuppliesDescription']}.{oid_suffix}"
                description = self.get_single_oid(
                    printer['ip'], printer['port'], printer['community'], desc_oid
                )
                
                if not description or description == 'No Such Object currently exists':
                    continue
                
                # Get supply type
                type_oid = f"{self.oids['prtMarkerSuppliesType']}.{oid_suffix}"
                supply_type_code = self.get_single_oid(
                    printer['ip'], printer['port'], printer['community'], type_oid
                )
                
                # Get max capacity
                max_oid = f"{self.oids['prtMarkerSuppliesMaxCapacity']}.{oid_suffix}"
                max_capacity = self.get_single_oid(
                    printer['ip'], printer['port'], printer['community'], max_oid
                )
                
                # Get current level
                level_oid = f"{self.oids['prtMarkerSuppliesLevel']}.{oid_suffix}"
                current_level = self.get_single_oid(
                    printer['ip'], printer['port'], printer['community'], level_oid
                )
                
                if max_capacity and current_level:
                    try:
                        max_cap = int(max_capacity)
                        curr_level = int(current_level)
                        
                        if max_cap > 0 and curr_level >= 0:
                            percentage = (curr_level / max_cap) * 100
                            
                            supply_type = 'unknown'
                            if supply_type_code:
                                supply_type = self.supply_types.get(int(supply_type_code), 'unknown')
                            
                            supply_info = {
                                'description': description,
                                'type': supply_type,
                                'current_level': curr_level,
                                'max_capacity': max_cap,
                                'percentage': round(percentage, 1),
                                'status': self.get_supply_status(percentage)
                            }
                            
                            supplies[f"supply_{oid_suffix}"] = supply_info
                            
                            # If it's toner or ink, add to toner_levels for easy access
                            if supply_type in ['toner', 'ink', 'inkCartridge', 'tonerCartridge']:
                                color = self.extract_color_from_description(description)
                                toner_levels[color] = supply_info
                                
                    except (ValueError, TypeError):
                        continue
            
            return {
                'supplies': supplies,
                'toner_levels': toner_levels
            }
            
        except Exception as e:
            print(f"Error getting supply levels: {str(e)}")
            return None

    def extract_color_from_description(self, description):
        """Extract color information from supply description"""
        description_lower = description.lower()
        
        color_patterns = {
            'black': ['black', 'bk', 'k'],
            'cyan': ['cyan', 'c'],
            'magenta': ['magenta', 'm'],
            'yellow': ['yellow', 'y'],
            'photo_black': ['photo black', 'pbk'],
            'light_cyan': ['light cyan', 'lc'],
            'light_magenta': ['light magenta', 'lm']
        }
        
        for color, patterns in color_patterns.items():
            for pattern in patterns:
                if pattern in description_lower:
                    return color
        
        return 'unknown'

    def get_supply_status(self, percentage):
        """Determine supply status based on percentage"""
        if percentage <= 10:
            return 'critical'
        elif percentage <= 20:
            return 'low'
        elif percentage <= 30:
            return 'warning'
        else:
            return 'ok'

    def discover_printers(self, network_range):
        """Discover printers on the network (basic implementation)"""
        # This is a simplified discovery - in production you might want to use nmap or similar
        discovered = []
        
        # This would need to be implemented based on your network discovery requirements
        # For now, return empty list - users will need to manually add printers
        
        return discovered