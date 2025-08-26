from pysnmp.hlapi import *

# OIDs for printer status and supplies (generic)
OID_PRINTER_STATUS = '1.3.6.1.2.1.25.3.5.1.1.1'  # hrPrinterStatus
OID_TONER_LEVEL = '1.3.6.1.2.1.43.11.1.1.9.1.1'   # prtMarkerSuppliesLevel
OID_TONER_MAX   = '1.3.6.1.2.1.43.11.1.1.8.1.1'   # prtMarkerSuppliesMaxCapacity


def snmp_get(ip, community, oid, port=161):
    iterator = getCmd(SnmpEngine(),
                      CommunityData(community, mpModel=0),
                      UdpTransportTarget((ip, port), timeout=1, retries=2),
                      ContextData(),
                      ObjectType(ObjectIdentity(oid)))
    errorIndication, errorStatus, errorIndex, varBinds = next(iterator)
    if errorIndication or errorStatus:
        return None
    for varBind in varBinds:
        return int(varBind[1])


def query_printer(ip: str, community: str = 'public') -> dict:
    """Query printer using SNMP and return status and supply percentage."""
    status_map = {
        1: 'other',
        2: 'unknown',
        3: 'idle',
        4: 'printing',
        5: 'warmup'
    }

    status_value = snmp_get(ip, community, OID_PRINTER_STATUS)
    toner_level = snmp_get(ip, community, OID_TONER_LEVEL)
    toner_max = snmp_get(ip, community, OID_TONER_MAX)

    if toner_level is not None and toner_max and toner_max > 0:
        toner_pct = round((toner_level / toner_max) * 100)
    else:
        toner_pct = None

    return {
        'status': status_map.get(status_value, 'unknown'),
        'toner_percent': toner_pct
    }