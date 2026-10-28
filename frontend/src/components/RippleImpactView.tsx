"use client";

import React, { useState, useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import {
  Layers,
  AlertTriangle,
  Clock,
  Navigation,
  ShieldAlert,
  Hospital,
  Flame,
  Milestone
} from "lucide-react";

interface Hotspot {
  hotspot_id: string;
  name: string;
  ward: string;
}

interface RippleImpactViewProps {
  hotspots: Hotspot[];
  selectedHotspot: Hotspot | null;
  onSelectHotspot: (h: Hotspot) => void;
  apiBase: string;
}

export default function RippleImpactView({
  hotspots,
  selectedHotspot,
  onSelectHotspot,
  apiBase,
}: RippleImpactViewProps) {
  const [impactData, setImpactData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [mapReady, setMapReady] = useState<boolean>(false);

  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);

  // Fetch Ripple Impact Data when selected hotspot changes
  useEffect(() => {
    if (selectedHotspot) {
      fetchRippleImpact(selectedHotspot.hotspot_id);
    }
  }, [selectedHotspot]);

  const fetchRippleImpact = async (hid: string) => {
    setLoading(true);
    try {
      const res = await fetch(`${apiBase}/impact/${hid}`);
      const data = await res.json();
      setImpactData(data);
    } catch (err) {
      console.error("Ripple impact fetch err:", err);
    } finally {
      setLoading(false);
    }
  };

  // 1. Initialize MapLibre map instance as soon as mapContainer is available in DOM
  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;

    try {
      const map = new maplibregl.Map({
        container: mapContainer.current,
        style: {
          version: 8,
          sources: {
            osm: {
              type: "raster",
              tiles: [
                "https://a.tile.openstreetmap.org/{z}/{x}/{y}.png",
                "https://b.tile.openstreetmap.org/{z}/{x}/{y}.png",
                "https://c.tile.openstreetmap.org/{z}/{x}/{y}.png",
              ],
              tileSize: 256,
              attribution: "© OpenStreetMap contributors",
            },
          },
          layers: [
            {
              id: "osm-tiles",
              type: "raster",
              source: "osm",
              minzoom: 0,
              maxzoom: 19,
            },
          ],
        },
        center: [72.855, 19.045],
        zoom: 12,
      });

      map.addControl(new maplibregl.NavigationControl({ showCompass: true }), "top-right");

      map.on("load", () => {
        setMapReady(true);
        map.resize();
      });

      // Periodic resize check to guarantee canvas renders at full dimensions
      setTimeout(() => {
        if (map) map.resize();
      }, 300);

      mapRef.current = map;
    } catch (e) {
      console.error("MapLibre init error:", e);
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // 2. Update Map markers and GeoJSON layers when impactData or mapReady changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !impactData) return;

    // Clear existing markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    const target = impactData.target_hotspot;
    if (target) {
      const tLon = Number(target.longitude ?? target.lon);
      const tLat = Number(target.latitude ?? target.lat);

      if (!isNaN(tLon) && !isNaN(tLat)) {
        // Center on target hotspot
        map.flyTo({ center: [tLon, tLat], zoom: 13 });

        // Add Target Hotspot epicenter marker
        const el = document.createElement("div");
        el.innerHTML = `
          <div style="
            width: 28px;
            height: 28px;
            background-color: #A64E45;
            border: 3px solid #FFFFFF;
            border-radius: 50%;
            box-shadow: 0 0 14px rgba(166, 78, 69, 0.7);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 13px;
            font-weight: bold;
            cursor: pointer;
          ">!</div>
        `;

        const m = new maplibregl.Marker({ element: el })
          .setLngLat([tLon, tLat])
          .setPopup(
            new maplibregl.Popup({ offset: 12 }).setHTML(`
            <div style="font-size: 12px; font-weight: 600; color: #242722; padding: 2px;">
              ${target.name}
              <div style="font-weight: 400; color: #A64E45; font-size: 11px;">Active Flooding Epicenter (${target.ward})</div>
            </div>
          `)
          )
          .addTo(map);

        markersRef.current.push(m);
      }
    }

    // Add Facility Markers (Hospitals & Fire Stations)
    if (impactData.critical_facilities) {
      impactData.critical_facilities.forEach((fac: any) => {
        const facLon = Number(fac.longitude ?? fac.lon);
        const facLat = Number(fac.latitude ?? fac.lat);
        if (isNaN(facLon) || isNaN(facLat)) return;

        const fEl = document.createElement("div");
        const isThreat = fac.threat_level?.includes("Critical") || fac.threat_level?.includes("High");
        const color = isThreat ? "#A64E45" : "#40584B";

        fEl.innerHTML = `
          <div style="
            width: 18px;
            height: 18px;
            background-color: ${color};
            border: 2px solid #FFFFFF;
            transform: rotate(45deg);
            box-shadow: 0 1px 4px rgba(0,0,0,0.35);
            cursor: pointer;
          "></div>
        `;

        const popup = new maplibregl.Popup({ offset: 10 }).setHTML(`
          <div style="font-size: 12px; color: #242722; padding: 2px;">
            <div style="font-weight: 600;">${fac.name}</div>
            <div style="color: #686B65;">${fac.category} | ${fac.distance_km} km away</div>
            <div style="color: ${color}; font-weight: 600; margin-top: 2px;">
              ${fac.threat_level} (+${fac.ambulance_delay_minutes} min detour)
            </div>
          </div>
        `);

        const facMarker = new maplibregl.Marker({ element: fEl })
          .setLngLat([facLon, facLat])
          .setPopup(popup)
          .addTo(map);

        markersRef.current.push(facMarker);
      });
    }

    // Render or update GeoJSON Road Linestrings
    const renderRoadLines = () => {
      if (!map.isStyleLoaded()) return;

      if (map.getSource("ripple_roads")) {
        (map.getSource("ripple_roads") as maplibregl.GeoJSONSource).setData(impactData.geojson);
      } else {
        map.addSource("ripple_roads", {
          type: "geojson",
          data: impactData.geojson,
        });

        map.addLayer({
          id: "ripple_lines",
          type: "line",
          source: "ripple_roads",
          filter: ["==", ["get", "type"], "road"],
          paint: {
            "line-color": "#A64E45",
            "line-width": 4.5,
            "line-dasharray": [2, 1],
          },
        });
      }

      map.resize();
    };

    if (map.isStyleLoaded()) {
      renderRoadLines();
    } else {
      map.once("load", renderRoadLines);
    }
  }, [impactData, mapReady]);

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-[#FFFFFF] border border-[#DCDDD6] rounded-sm p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-semibold tracking-wider uppercase bg-[#40584B] text-white">
              FEATURE C
            </span>
            <h2 className="text-base font-semibold text-[#242722]">
              Ripple Impact Engine: Road Corridors & Healthcare Access
            </h2>
          </div>
          <p className="text-xs text-[#686B65] mt-1">
            Cascading urban network disruption around the selected waterlogging epicenter, identifying arterial road closures, hospital access barriers, and ambulance detour delays.
          </p>
        </div>

        {/* Hotspot Dropdown Selector */}
        <div className="flex items-center gap-2">
          <select
            value={selectedHotspot?.hotspot_id || ""}
            onChange={(e) => {
              const h = hotspots.find((x) => x.hotspot_id === e.target.value);
              if (h) onSelectHotspot(h);
            }}
            className="text-xs bg-[#FFFFFF] border border-[#DCDDD6] rounded p-2 text-[#242722] font-medium"
          >
            {hotspots.map((h) => (
              <option key={h.hotspot_id} value={h.hotspot_id}>
                {h.hotspot_id}: {h.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Disruption KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-[#FFFFFF] border border-[#DCDDD6] rounded-sm p-3">
          <span className="text-[10px] uppercase font-semibold text-[#686B65] block mb-1">
            Submerged Road Corridors
          </span>
          <div className="text-2xl font-bold text-[#A64E45]">
            {impactData?.network_disruption_summary?.affected_road_corridors_count ?? 5}
          </div>
          <span className="text-[10px] text-[#686B65]">Arterial segments blocked</span>
        </div>

        <div className="bg-[#FFFFFF] border border-[#DCDDD6] rounded-sm p-3">
          <span className="text-[10px] uppercase font-semibold text-[#686B65] block mb-1">
            Threatened Facilities
          </span>
          <div className="text-2xl font-bold text-[#A77936]">
            {impactData?.network_disruption_summary?.isolated_or_threatened_facilities_count ?? 2}
          </div>
          <span className="text-[10px] text-[#686B65]">Hospitals within &le;1.8 km</span>
        </div>

        <div className="bg-[#FFFFFF] border border-[#DCDDD6] rounded-sm p-3">
          <span className="text-[10px] uppercase font-semibold text-[#686B65] block mb-1">
            Peak Ambulance Delay
          </span>
          <div className="flex items-baseline gap-1 text-2xl font-bold text-[#A64E45]">
            <Clock className="w-5 h-5" />
            <span>+{impactData?.network_disruption_summary?.peak_ambulance_delay_minutes ?? 28} min</span>
          </div>
          <span className="text-[10px] text-[#686B65]">Emergency ingress penalty</span>
        </div>

        <div className="bg-[#FFFFFF] border border-[#DCDDD6] rounded-sm p-3">
          <span className="text-[10px] uppercase font-semibold text-[#686B65] block mb-1">
            Primary Transit Lockout
          </span>
          <div className="text-xs font-semibold text-[#242722] truncate mt-1">
            {impactData?.network_disruption_summary?.primary_transit_lockout ?? "Dr. Babasaheb Ambedkar Road / Milan Subway"}
          </div>
          <span className="text-[10px] text-[#686B65]">Major chokepoint</span>
        </div>
      </div>

      {/* Map & Facility Side Panel (ALWAYS IN DOM) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Map Container (7 cols) */}
        <div className="lg:col-span-7 bg-[#FFFFFF] border border-[#DCDDD6] rounded-sm p-2 flex flex-col">
          <div className="px-2 py-1.5 flex items-center justify-between text-xs text-[#686B65] border-b border-[#F0F0EC] mb-2">
            <span className="font-semibold text-[#242722]">
              Geospatial Disruption Map (OpenStreetMap & MapLibre)
            </span>
            <span className="font-mono text-[10px]">[OSM_INFRASTRUCTURE_GRAPH]</span>
          </div>

          {/* Dedicated Map Div - Always mounted so MapLibre initializes immediately */}
          <div className="relative w-full h-[460px] bg-[#F5F5F2] rounded overflow-hidden">
            <div ref={mapContainer} className="w-full h-full" />
            {loading && (
              <div className="absolute inset-0 bg-white/70 flex items-center justify-center text-xs text-[#686B65] z-10">
                Updating disruption routes and facilities...
              </div>
            )}
          </div>

          <div className="mt-2 px-2 flex flex-wrap items-center gap-4 text-[11px] text-[#686B65]">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-[#A64E45]"></span>
              Active Epicenter
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 bg-[#40584B] transform rotate-45"></span>
              Tertiary Hospital / Fire Station
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-4 h-0.5 bg-[#A64E45]"></span>
              Blocked Road Segment
            </span>
          </div>
        </div>

        {/* Critical Healthcare Facilities Table (5 cols) */}
        <div className="lg:col-span-5 bg-[#FFFFFF] border border-[#DCDDD6] rounded-sm p-4 space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-[#242722] flex items-center gap-1.5">
                <Hospital className="w-4 h-4 text-[#40584B]" />
                Facility Access & Ingress Risk
              </h4>
              <span className="text-[10px] text-[#686B65]">Proximity Matrix</span>
            </div>

            <div className="space-y-2 max-h-[430px] overflow-y-auto pr-1">
              {impactData?.critical_facilities?.map((fac: any) => {
                const isCritical = fac.threat_level?.includes("Critical");
                const isHigh = fac.threat_level?.includes("High");

                return (
                  <div
                    key={fac.facility_id || fac.id}
                    className={`p-2.5 rounded border text-xs space-y-1.5 ${
                      isCritical
                        ? "bg-[#FDF4F4] border-[#F5D8D8]"
                        : isHigh
                        ? "bg-[#FDF8F0] border-[#F7E6CA]"
                        : "bg-[#FFFFFF] border-[#DCDDD6]"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-semibold text-[#242722]">{fac.name}</span>
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                          isCritical
                            ? "bg-[#A64E45] text-white"
                            : isHigh
                            ? "bg-[#A77936] text-white"
                            : "bg-[#F0F0EC] text-[#686B65]"
                        }`}
                      >
                        {fac.distance_km} km away
                      </span>
                    </div>

                    <div className="text-[11px] text-[#686B65] flex justify-between">
                      <span>{fac.category} ({fac.bed_capacity} beds)</span>
                      <span className="font-bold text-[#A64E45]">
                        +{fac.ambulance_delay_minutes} min delay
                      </span>
                    </div>

                    <div className="text-[11px] text-[#242722] pt-1 border-t border-[#F0F0EC]/60">
                      <strong>Detour Corridor:</strong> {fac.recommended_corridor}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Submerged Road Corridors Table */}
      {impactData?.affected_roads && (
        <div className="bg-[#FFFFFF] border border-[#DCDDD6] rounded-sm p-4 space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-[#242722]">
            Inundated Road Network Segments ({impactData.affected_roads.length})
          </h4>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#F0F0EC] text-[#242722] font-semibold border-b border-[#DCDDD6]">
                <tr>
                  <th className="p-2">Road Corridor</th>
                  <th className="p-2">Obstruction Depth</th>
                  <th className="p-2">Status</th>
                  <th className="p-2">Traffic Delay</th>
                  <th className="p-2">Recommended Detour</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0F0EC]">
                {impactData.affected_roads.map((rd: any) => (
                  <tr key={rd.id} className="hover:bg-[#F5F8F6]">
                    <td className="p-2 font-medium text-[#242722]">{rd.name}</td>
                    <td className="p-2 font-mono">{rd.obstruction_depth_cm} cm</td>
                    <td className="p-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#FDF4F4] text-[#A64E45] border border-[#F5D8D8]">
                        {rd.status}
                      </span>
                    </td>
                    <td className="p-2 font-bold text-[#A64E45]">+{rd.delay_min} min</td>
                    <td className="p-2 text-[#686B65]">{rd.detour_route}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
