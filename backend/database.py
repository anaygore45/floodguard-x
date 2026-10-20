import os
import sqlite3
from typing import Dict, Any, List

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
DB_PATH = os.environ.get("DATABASE_PATH", os.path.join(BASE_DIR, "data", "processed", "floodguard_warehouse.db"))

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def execute_olap_operation(operation: str, params: Dict[str, Any] = None) -> List[Dict[str, Any]]:
    conn = get_db_connection()
    cur = conn.cursor()
    params = params or {}
    
    if operation == "rollup":
        # Aggregate to Ward level
        q = """
        SELECT l.ward,
               COUNT(f.fact_id) as total_incidents,
               ROUND(AVG(f.recorded_flood_depth_cm), 1) as avg_flood_depth_cm,
               ROUND(SUM(f.flood_duration_hours), 1) as total_duration_hours,
               SUM(f.pumps_deployed) as total_pumps_deployed
        FROM fact_waterlogging f
        JOIN dim_location l ON f.location_key = l.location_key
        GROUP BY l.ward
        ORDER BY total_incidents DESC
        """
        cur.execute(q)
    elif operation == "drilldown":
        # Drill down by year and month
        q = """
        SELECT d.year, d.month,
               COUNT(f.fact_id) as incident_count,
               ROUND(AVG(f.recorded_flood_depth_cm), 1) as avg_depth_cm,
               ROUND(MAX(f.recorded_flood_depth_cm), 1) as max_depth_cm,
               ROUND(AVG(f.rainfall_24h_mm), 1) as avg_rainfall_mm
        FROM fact_waterlogging f
        JOIN dim_date d ON f.date_key = d.date_key
        GROUP BY d.year, d.month
        ORDER BY d.year DESC, d.month ASC
        """
        cur.execute(q)
    elif operation == "slice":
        # Slice by ward
        target_ward = params.get("ward", "F/North")
        q = """
        SELECT l.location_name, l.ward,
               COUNT(f.fact_id) as incidents,
               ROUND(AVG(f.rainfall_24h_mm), 1) as avg_rain_mm,
               ROUND(AVG(f.recorded_flood_depth_cm), 1) as avg_depth_cm
        FROM fact_waterlogging f
        JOIN dim_location l ON f.location_key = l.location_key
        WHERE l.ward = ?
        GROUP BY l.location_name, l.ward
        """
        cur.execute(q, (target_ward,))
    elif operation == "dice":
        # Multi-dimensional cut
        min_rain = float(params.get("min_rainfall", 80.0))
        q = """
        SELECT l.ward, l.location_name, l.risk_tier,
               COUNT(f.fact_id) as severe_episodes,
               ROUND(AVG(f.recorded_flood_depth_cm), 1) as avg_depth_cm,
               ROUND(AVG(f.flood_duration_hours), 1) as avg_duration_hours
        FROM fact_waterlogging f
        JOIN dim_location l ON f.location_key = l.location_key
        WHERE f.rainfall_24h_mm >= ?
        GROUP BY l.ward, l.location_name, l.risk_tier
        ORDER BY severe_episodes DESC
        """
        cur.execute(q, (min_rain,))
    elif operation == "pivot":
        # Cross-tabulate Ward by Severity
        q = """
        SELECT l.ward,
               SUM(CASE WHEN i.severity = 'Critical' THEN 1 ELSE 0 END) as critical_count,
               SUM(CASE WHEN i.severity = 'High' THEN 1 ELSE 0 END) as high_count,
               SUM(CASE WHEN i.severity = 'Moderate' THEN 1 ELSE 0 END) as moderate_count,
               COUNT(f.fact_id) as total_events
        FROM fact_waterlogging f
        JOIN dim_location l ON f.location_key = l.location_key
        JOIN dim_incident i ON f.incident_key = i.incident_key
        GROUP BY l.ward
        ORDER BY critical_count DESC
        """
        cur.execute(q)
    else:
        conn.close()
        raise ValueError(f"Unknown OLAP operation: {operation}")
        
    rows = [dict(r) for r in cur.fetchall()]
    conn.close()
    return rows
