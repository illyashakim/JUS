from pysnmp.hlapi import *
import logging
from typing import Dict, List, Optional
import time

logger = logging.getLogger(__name__)

class SNMPMonitor:
    def __init__(self):
        self.timeout = 3
        self.retries = 1
        
        # Common SNMP OIDs for printers
        self.oids = {
            'system_description': '1.3.6.1.2.1.1.1.0',
            'system_name': '1.3.6.1.2.1.1.5.0',
            'system_location': '1.3.6.1.2.1.1.6.0',
            'printer_status': '1.3.6.1.2.1.25.3.5.1.1.1',
            'printer_error_state': '1.3.6.1.2.1.25.3.5.1.2.1',
            
            # HP Printer specific OIDs
            'hp_toner_level': '1.3.6.1.4.1.11.2.3.9.4.2.1.4.1.2.1',
            'hp_toner_max': '1.3.6.1.4.1.11.2.3.9.4.2.1.4.1.3.1',
            'hp_toner_name': '1.3.6.1.4.1.11.2.3.9.4.2.1.4.1.1.1',
            
            # Canon Printer specific OIDs
            'canon_toner_level': '1.3.6.1.4.1.1602.1.11.1.3.1.4.1',
            'canon_toner_max': '1.3.6.1.4.1.1602.1.11.1.3.1.5.1',
            'canon_toner_name': '1.3.6.1.4.1.1602.1.11.1.3.1.2.1',
            
            # Brother Printer specific OIDs
            'brother_toner_level': '1.3.6.1.4.1.1991.1.1.2.1.1.1',
            'brother_toner_max': '1.3.6.1.4.1.1991.1.1.2.1.2.1',
            'brother_toner_name': '1.3.6.1.4.1.1991.1.1.2.1.3.1',
            
            # Generic printer MIB OIDs
            'generic_toner_level': '1.3.6.1.2.1.43.10.2.1.4.1.1',
            'generic_toner_max': '1.3.6.1.2.1.43.10.2.1.4.1.2',
            'generic_toner_name': '1.3.6.1.2.1.43.10.2.1.2.1.1',
            
            # Paper tray status
            'paper_tray_status': '1.3.6.1.2.1.43.8.2.1.9.1.1',
            'paper_tray_capacity': '1.3.6.1.2.1.43.8.2.1.8.1.1',
            'paper_tray_current': '1.3.6.1.2.1.43.8.2.1.10.1.1'
        }
    
    def scan_printer(self, ip_address: str, community: str = 'public') -> Dict:
        """
        Scan a printer for status and toner levels
        """
        try:
            result = {
                'status': 'unknown',
                'details': '',
                'toner_levels': [],
                'paper_trays': [],
                'system_info': {}
            }
            
            # Check if printer is reachable
            if not self._is_reachable(ip_address):
                result['status'] = 'offline'
                result['details'] = 'Printer not reachable'
                return result
            
            # Get system information
            system_info = self._get_system_info(ip_address, community)
            result['system_info'] = system_info
            
            # Get printer status
            printer_status = self._get_printer_status(ip_address, community)
            result['status'] = printer_status['status']
            result['details'] = printer_status['details']
            
            # Get toner levels
            toner_levels = self._get_toner_levels(ip_address, community)
            result['toner_levels'] = toner_levels
            
            # Get paper tray information
            paper_trays = self._get_paper_trays(ip_address, community)
            result['paper_trays'] = paper_trays
            
            return result
            
        except Exception as e:
            logger.error(f"Error scanning printer {ip_address}: {str(e)}")
            return {
                'status': 'error',
                'details': f'Scan error: {str(e)}',
                'toner_levels': [],
                'paper_trays': [],
                'system_info': {}
            }
    
    def _is_reachable(self, ip_address: str) -> bool:
        """Check if printer is reachable via ping"""
        try:
            # Simple SNMP ping to check reachability
            for (errorIndication, errorStatus, errorIndex, varBinds) in getCmd(
                SnmpEngine(),
                CommunityData('public'),
                UdpTransportTarget((ip_address, 161), timeout=self.timeout, retries=self.retries),
                ContextData(),
                ObjectType(ObjectIdentity('1.3.6.1.2.1.1.1.0'))
            ):
                if errorIndication or errorStatus:
                    return False
                return True
        except:
            return False
        return False
    
    def _get_system_info(self, ip_address: str, community: str) -> Dict:
        """Get basic system information"""
        system_info = {}
        
        try:
            # System description
            for (errorIndication, errorStatus, errorIndex, varBinds) in getCmd(
                SnmpEngine(),
                CommunityData(community),
                UdpTransportTarget((ip_address, 161), timeout=self.timeout, retries=self.retries),
                ContextData(),
                ObjectType(ObjectIdentity(self.oids['system_description']))
            ):
                if not errorIndication and not errorStatus:
                    for varBind in varBinds:
                        system_info['description'] = str(varBind[1])
                break
            
            # System name
            for (errorIndication, errorStatus, errorIndex, varBinds) in getCmd(
                SnmpEngine(),
                CommunityData(community),
                UdpTransportTarget((ip_address, 161), timeout=self.timeout, retries=self.retries),
                ContextData(),
                ObjectType(ObjectIdentity(self.oids['system_name']))
            ):
                if not errorIndication and not errorStatus:
                    for varBind in varBinds:
                        system_info['name'] = str(varBind[1])
                break
            
            # System location
            for (errorIndication, errorStatus, errorIndex, varBinds) in getCmd(
                SnmpEngine(),
                CommunityData(community),
                UdpTransportTarget((ip_address, 161), timeout=self.timeout, retries=self.retries),
                ContextData(),
                ObjectType(ObjectIdentity(self.oids['system_location']))
            ):
                if not errorIndication and not errorStatus:
                    for varBind in varBinds:
                        system_info['location'] = str(varBind[1])
                break
                
        except Exception as e:
            logger.error(f"Error getting system info: {str(e)}")
        
        return system_info
    
    def _get_printer_status(self, ip_address: str, community: str) -> Dict:
        """Get printer operational status"""
        try:
            for (errorIndication, errorStatus, errorIndex, varBinds) in getCmd(
                SnmpEngine(),
                CommunityData(community),
                UdpTransportTarget((ip_address, 161), timeout=self.timeout, retries=self.retries),
                ContextData(),
                ObjectType(ObjectIdentity(self.oids['printer_status']))
            ):
                if not errorIndication and not errorStatus:
                    for varBind in varBinds:
                        status_code = int(varBind[1])
                        if status_code == 1:
                            return {'status': 'other', 'details': 'Other status'}
                        elif status_code == 2:
                            return {'status': 'online', 'details': 'Printer is online'}
                        elif status_code == 3:
                            return {'status': 'offline', 'details': 'Printer is offline'}
                        elif status_code == 4:
                            return {'status': 'sleep', 'details': 'Printer is sleeping'}
                        elif status_code == 5:
                            return {'status': 'warmup', 'details': 'Printer is warming up'}
                        elif status_code == 6:
                            return {'status': 'stopping', 'details': 'Printer is stopping'}
                        elif status_code == 7:
                            return {'status': 'offline', 'details': 'Printer is offline'}
                        else:
                            return {'status': 'unknown', 'details': f'Unknown status code: {status_code}'}
                break
        except Exception as e:
            logger.error(f"Error getting printer status: {str(e)}")
        
        return {'status': 'unknown', 'details': 'Could not determine status'}
    
    def _get_toner_levels(self, ip_address: str, community: str) -> List[Dict]:
        """Get toner/cartridge levels"""
        toner_levels = []
        
        # Try different printer brands
        brands = ['hp', 'canon', 'brother', 'generic']
        
        for brand in brands:
            try:
                levels = self._get_brand_toner_levels(ip_address, community, brand)
                if levels:
                    toner_levels.extend(levels)
                    break  # If we found levels for one brand, use that
            except Exception as e:
                logger.debug(f"Error getting {brand} toner levels: {str(e)}")
                continue
        
        return toner_levels
    
    def _get_brand_toner_levels(self, ip_address: str, community: str, brand: str) -> List[Dict]:
        """Get toner levels for a specific printer brand"""
        levels = []
        
        try:
            # Get toner names
            toner_names = []
            for (errorIndication, errorStatus, errorIndex, varBinds) in nextCmd(
                SnmpEngine(),
                CommunityData(community),
                UdpTransportTarget((ip_address, 161), timeout=self.timeout, retries=self.retries),
                ContextData(),
                ObjectType(ObjectIdentity(self.oids[f'{brand}_toner_name']))
            ):
                if not errorIndication and not errorStatus:
                    for varBind in varBinds:
                        toner_names.append(str(varBind[1]))
                else:
                    break
            
            if not toner_names:
                return levels
            
            # Get current levels
            current_levels = []
            for (errorIndication, errorStatus, errorIndex, varBinds) in nextCmd(
                SnmpEngine(),
                CommunityData(community),
                UdpTransportTarget((ip_address, 161), timeout=self.timeout, retries=self.retries),
                ContextData(),
                ObjectType(ObjectIdentity(self.oids[f'{brand}_toner_level']))
            ):
                if not errorIndication and not errorStatus:
                    for varBind in varBinds:
                        current_levels.append(int(varBind[1]))
                else:
                    break
            
            # Get max levels
            max_levels = []
            for (errorIndication, errorStatus, errorIndex, varBinds) in nextCmd(
                SnmpEngine(),
                CommunityData(community),
                UdpTransportTarget((ip_address, 161), timeout=self.timeout, retries=self.retries),
                ContextData(),
                ObjectType(ObjectIdentity(self.oids[f'{brand}_toner_max']))
            ):
                if not errorIndication and not errorStatus:
                    for varBind in varBinds:
                        max_levels.append(int(varBind[1]))
                else:
                    break
            
            # Combine the data
            for i in range(min(len(toner_names), len(current_levels), len(max_levels))):
                if max_levels[i] > 0:
                    percentage = (current_levels[i] / max_levels[i]) * 100
                else:
                    percentage = 0
                
                levels.append({
                    'name': toner_names[i],
                    'current': current_levels[i],
                    'max': max_levels[i],
                    'percentage': round(percentage, 1)
                })
                
        except Exception as e:
            logger.error(f"Error getting {brand} toner levels: {str(e)}")
        
        return levels
    
    def _get_paper_trays(self, ip_address: str, community: str) -> List[Dict]:
        """Get paper tray information"""
        paper_trays = []
        
        try:
            # Get paper tray status
            tray_statuses = []
            for (errorIndication, errorStatus, errorIndex, varBinds) in nextCmd(
                SnmpEngine(),
                CommunityData(community),
                UdpTransportTarget((ip_address, 161), timeout=self.timeout, retries=self.retries),
                ContextData(),
                ObjectType(ObjectIdentity(self.oids['paper_tray_status']))
            ):
                if not errorIndication and not errorStatus:
                    for varBind in varBinds:
                        status_code = int(varBind[1])
                        if status_code == 1:
                            tray_statuses.append('other')
                        elif status_code == 2:
                            tray_statuses.append('unknown')
                        elif status_code == 3:
                            tray_statuses.append('empty')
                        elif status_code == 4:
                            tray_statuses.append('notEmpty')
                        elif status_code == 5:
                            tray_statuses.append('full')
                        elif status_code == 6:
                            tray_statuses.append('low')
                        else:
                            tray_statuses.append('unknown')
                else:
                    break
            
            # Get paper tray capacity
            tray_capacities = []
            for (errorIndication, errorStatus, errorIndex, varBinds) in nextCmd(
                SnmpEngine(),
                CommunityData(community),
                UdpTransportTarget((ip_address, 161), timeout=self.timeout, retries=self.retries),
                ContextData(),
                ObjectType(ObjectIdentity(self.oids['paper_tray_capacity']))
            ):
                if not errorIndication and not errorStatus:
                    for varBind in varBinds:
                        tray_capacities.append(int(varBind[1]))
                else:
                    break
            
            # Get current paper count
            tray_currents = []
            for (errorIndication, errorStatus, errorIndex, varBinds) in nextCmd(
                SnmpEngine(),
                CommunityData(community),
                UdpTransportTarget((ip_address, 161), timeout=self.timeout, retries=self.retries),
                ContextData(),
                ObjectType(ObjectIdentity(self.oids['paper_tray_current']))
            ):
                if not errorIndication and not errorStatus:
                    for varBind in varBinds:
                        tray_currents.append(int(varBind[1]))
                else:
                    break
            
            # Combine the data
            for i in range(min(len(tray_statuses), len(tray_capacities), len(tray_currents))):
                paper_trays.append({
                    'tray_number': i + 1,
                    'status': tray_statuses[i],
                    'capacity': tray_capacities[i],
                    'current': tray_currents[i]
                })
                
        except Exception as e:
            logger.error(f"Error getting paper trays: {str(e)}")
        
        return paper_trays
    
    def test_connection(self, ip_address: str, community: str = 'public') -> bool:
        """Test SNMP connection to a printer"""
        try:
            for (errorIndication, errorStatus, errorIndex, varBinds) in getCmd(
                SnmpEngine(),
                CommunityData(community),
                UdpTransportTarget((ip_address, 161), timeout=self.timeout, retries=self.retries),
                ContextData(),
                ObjectType(ObjectIdentity('1.3.6.1.2.1.1.1.0'))
            ):
                if errorIndication or errorStatus:
                    return False
                return True
        except:
            return False
        return False