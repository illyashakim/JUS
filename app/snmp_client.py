from __future__ import annotations

from typing import Dict, Any, List, Tuple

import asyncio
import puresnmp

from .config import settings


def _client(host: str, community: str, port: int) -> puresnmp.PyWrapper:
	creds = puresnmp.V2C(community)
	return puresnmp.PyWrapper(host, creds, port=port, timeout=settings.snmp_timeout_seconds)


def snmp_get_str(host: str, community: str, oid: str, port: int = 161) -> str | None:
	try:
		client = _client(host, community, port)
		value = client.get(oid)
		return str(value) if value is not None else None
	except Exception:
		return None


def snmp_walk(host: str, community: str, base_oid: str, port: int = 161) -> List[Tuple[str, str]]:
	client = _client(host, community, port)
	results: List[Tuple[str, str]] = []

	async def _awalk():
		try:
			async for vb in client.walk(base_oid):
				results.append((str(vb.oid), str(vb.value)))
		except Exception:
			return

	# Drive async generator from sync context
	try:
		asyncio.run(_awalk())
	except RuntimeError:
		# If there's already a running loop (unlikely in our thread), create one
		loop = asyncio.new_event_loop()
		try:
			loop.run_until_complete(_awalk())
		finally:
			loop.close()
	return results


SYS_NAME_OID = "1.3.6.1.2.1.1.5.0"  # sysName.0
PRT_GENERAL_PRINTER_NAME_OID = "1.3.6.1.2.1.43.5.1.1.16.1"  # prtGeneralPrinterName.1
HR_DEVICE_STATUS_TABLE_OID = "1.3.6.1.2.1.25.3.2.1.5"  # hrDeviceStatus

# Printer-MIB prtMarkerSuppliesTable columns we care about
PRT_MARKER_SUPPLIES_DESC_BASE = "1.3.6.1.2.1.43.11.1.1.6.1"
PRT_MARKER_SUPPLIES_MAX_BASE = "1.3.6.1.2.1.43.11.1.1.8.1"
PRT_MARKER_SUPPLIES_LEVEL_BASE = "1.3.6.1.2.1.43.11.1.1.9.1"


def _index_from_oid(oid: str) -> int | None:
	try:
		return int(oid.split(".")[-1])
	except Exception:
		return None


def fetch_printer_snapshot(host: str, community: str, port: int = 161) -> Dict[str, Any]:
	data: Dict[str, Any] = {
		"sys_name": None,
		"printer_name": None,
		"hr_device_status": None,
		"status_text": None,
		"supplies": [],
	}

	# Basic identifiers
	sys_name = snmp_get_str(host, community, SYS_NAME_OID, port)
	printer_name = snmp_get_str(host, community, PRT_GENERAL_PRINTER_NAME_OID, port)
	data["sys_name"] = sys_name
	data["printer_name"] = printer_name

	# hrDeviceStatus: choose the first value (device index varies by model)
	hr_status_walk = snmp_walk(host, community, HR_DEVICE_STATUS_TABLE_OID, port)
	if hr_status_walk:
		try:
			first_val = int(hr_status_walk[0][1])
			data["hr_device_status"] = first_val
			data["status_text"] = _hr_status_to_text(first_val)
		except Exception:
			pass

	# Supplies: walk three columns and merge by index
	descs = { _index_from_oid(oid): val for oid, val in snmp_walk(host, community, PRT_MARKER_SUPPLIES_DESC_BASE, port) }
	maxes = { _index_from_oid(oid): val for oid, val in snmp_walk(host, community, PRT_MARKER_SUPPLIES_MAX_BASE, port) }
	levels = { _index_from_oid(oid): val for oid, val in snmp_walk(host, community, PRT_MARKER_SUPPLIES_LEVEL_BASE, port) }

	indices = {i for i in descs.keys() | maxes.keys() | levels.keys() if i is not None}
	for idx in sorted(indices):
		desc = descs.get(idx)
		max_str = maxes.get(idx)
		lvl_str = levels.get(idx)
		max_val = _safe_int(max_str)
		lvl_val = _safe_int(lvl_str)
		percent = _compute_percent(lvl_val, max_val)
		data["supplies"].append({
			"index": idx if idx is not None else -1,
			"description": desc,
			"max_capacity": max_val,
			"level": lvl_val,
			"percent": percent,
		})

	return data


def _safe_int(value: str | None) -> int | None:
	if value is None:
		return None
	try:
		return int(value)
	except Exception:
		return None


def _compute_percent(level: int | None, max_capacity: int | None) -> int | None:
	if level is None or max_capacity is None or max_capacity <= 0:
		return None
	# Some devices return negative for unknown (-1/-2/-3)
	if level < 0 or max_capacity < 0:
		return None
	pct = int(round((level / max_capacity) * 100))
	if pct < 0:
		pct = 0
	if pct > 100:
		pct = 100
	return pct


def _hr_status_to_text(code: int) -> str:
	return {
		1: "unknown",
		2: "running",
		3: "warning",
		4: "testing",
		5: "down",
	}.get(code, "unknown")