"use client";

import React, { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";

interface Hotspot {
  hotspot_id: string;
  name: string;
  ward: string;
  latitude: number;
  longitude: number;
  elevation_m: number;
  risk_tier: string;
  catchment: string;
  typical_flood_depth_cm: number;
  installed_pump_capacity_hp: number;
  near_railway_subway: boolean;
  cluster_id?: number;
}

interface Facility {
  id: string;
  name: string;
  category: string;
  lat: number;
  lon: number;
  threat_level: string;
}

interface MapViewProps {
  hotspots: Hotspot[];
  facilities: Facility[];
  selectedHotspot: Hotspot | null;
  onSelectHotspot: (h: Hotspot) => void;
}

export default function MapView({
  hotspots,
  facilities,
  selectedHotspot,
  onSelectHotspot,
}: MapViewProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);
  
  const [showHotspots, setShowHotspots] = useState(true);
  const [showFacilities, setShowFacilities] = useState(true);
  const [selectedWardFilter, setSelectedWardFilter] = useState<string>("All");

  // OpenStreetMap Tile & API Key Management
  const [osmApiKey, setOsmApiKey] = useState<string>(
    process.env.NEXT_PUBLIC_OSM_API_KEY || ""
  );
  const [tileProvider, setTileProvider] = useState<"osm_standard" | "osm_hot" | "maptiler">(
    "osm_standard"
  );
  const [showKeyInput, setShowKeyInput] = useState<boolean>(false);

  const getTileUrls = (provider: string, key: string): string[] => {
    if (provider === "maptiler" && key.trim()) {
      return [
        `https://api.maptiler.com/maps/streets-v2/{z}/{x}/{y}.png?key=${encodeURIComponent(key.trim())}`,
      ];
    }
    if (provider === "osm_hot") {
      return [
        "https://a.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png",
        "https://b.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png",
      ];
    }
    // Standard OpenStreetMap (Free, public, no API key required)
    return [
      "https://a.tile.openstreetmap.org/{z}/{x}/{y}.png",
      "https://b.tile.openstreetmap.org/{z}/{x}/{y}.png",
      "https://c.tile.openstreetmap.org/{z}/{x}/{y}.png",
    ];
  };

  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;

    const initialTiles = getTileUrls(tileProvider, osmApiKey);

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: {
        version: 8,
        sources: {
          osm: {
            type: "raster",
            tiles: initialTiles,
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
      center: [72.855, 19.075], // Mumbai center
      zoom: 11,
      maxZoom: 18,
      minZoom: 9,
    });

    map.addControl(new maplibregl.NavigationControl({ showCompass: true }), "top-right");
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Dynamically update tile source when provider or API key changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;

    const source = map.getSource("osm") as maplibregl.RasterTileSource | undefined;
    if (source && typeof source.setTiles === "function") {
      const newTiles = getTileUrls(tileProvider, osmApiKey);
      source.setTiles(newTiles);
    }
  }, [tileProvider, osmApiKey]);

  // Update markers
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Clear old markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    // Filter hotspots
    const filteredHotspots = hotspots.filter(
      (h) => selectedWardFilter === "All" || h.ward === selectedWardFilter
    );

    // Add hotspot markers
    if (showHotspots) {
      filteredHotspots.forEach((h) => {
        const el = document.createElement("div");
        el.className = "cursor-pointer group flex flex-col items-center";

        const color =
          h.risk_tier === "Critical"
            ? "#A64E45"
            : h.risk_tier === "High"
            ? "#A77936"
            : "#74877B";

        const isSelected = selectedHotspot?.hotspot_id === h.hotspot_id;

        el.innerHTML = `
          <div style="
            width: ${isSelected ? "22px" : "16px"};
            height: ${isSelected ? "22px" : "16px"};
            background-color: ${color};
            border: 2px solid #FFFFFF;
            border-radius: 50%;
            box-shadow: 0 1px 4px rgba(0,0,0,0.25);
            transition: all 0.2s ease;
          "></div>
        `;

        el.addEventListener("click", () => {
          onSelectHotspot(h);
        });

        const popup = new maplibregl.Popup({ offset: 12, closeButton: false }).setHTML(`
          <div style="font-family: inherit; font-size: 12px; color: #242722; padding: 4px;">
            <div style="font-weight: 600; margin-bottom: 2px;">${h.name}</div>
            <div style="color: #686B65;">Ward: ${h.ward} | Elev: ${h.elevation_m}m</div>
            <div style="color: #686B65;">Flood Depth: ${h.typical_flood_depth_cm}cm</div>
            <div style="margin-top: 4px; font-size: 11px; font-weight: 500; color: ${color};">
              ${h.risk_tier} Tier (${h.installed_pump_capacity_hp} HP Pump)
            </div>
          </div>
        `);

        const marker = new maplibregl.Marker({ element: el })
          .setLngLat([h.longitude, h.latitude])
          .setPopup(popup)
          .addTo(map);

        markersRef.current.push(marker);
      });
    }

    // Add facility markers
    if (showFacilities) {
      facilities.forEach((f) => {
        const el = document.createElement("div");
        el.className = "cursor-pointer";
        el.innerHTML = `
          <div style="
            width: 14px;
            height: 14px;
            background-color: #40584B;
            border: 2px solid #FFFFFF;
            transform: rotate(45deg);
            box-shadow: 0 1px 3px rgba(0,0,0,0.3);
          "></div>
        `;

        const popup = new maplibregl.Popup({ offset: 10, closeButton: false }).setHTML(`
          <div style="font-family: inherit; font-size: 12px; color: #242722; padding: 4px;">
            <div style="font-weight: 600;">${f.name}</div>
            <div style="color: #686B65;">${f.category}</div>
            <div style="color: #A64E45; font-size: 11px; margin-top: 2px;">${f.threat_level}</div>
          </div>
        `);

        const marker = new maplibregl.Marker({ element: el })
          .setLngLat([f.lon, f.lat])
          .setPopup(popup)
          .addTo(map);

        markersRef.current.push(marker);
      });
    }
  }, [hotspots, facilities, showHotspots, showFacilities, selectedWardFilter, selectedHotspot, onSelectHotspot]);

  // Unique wards
  const wards = Array.from(new Set(hotspots.map((h) => h.ward))).sort();

  return (
    <div className="relative w-full h-[580px] bg-[#FFFFFF] border border-[#DCDDD6] rounded-sm overflow-hidden flex flex-col">
      {/* Map Control Bar */}
      <div className="flex flex-wrap items-center justify-between px-4 py-2 bg-[#F0F0EC] border-b border-[#DCDDD6] text-xs gap-2">
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-1.5 cursor-pointer text-[#242722] font-medium">
            <input
              type="checkbox"
              checked={showHotspots}
              onChange={(e) => setShowHotspots(e.target.checked)}
              className="rounded border-[#DCDDD6] text-[#40584B] focus:ring-0"
            />
            Waterlogging Hotspots ({hotspots.length})
          </label>
          <label className="flex items-center gap-1.5 cursor-pointer text-[#242722] font-medium">
            <input
              type="checkbox"
              checked={showFacilities}
              onChange={(e) => setShowFacilities(e.target.checked)}
              className="rounded border-[#DCDDD6] text-[#40584B] focus:ring-0"
            />
            Critical Infrastructure ({facilities.length})
          </label>
        </div>

        <div className="flex items-center gap-3">
          {/* Tile Source Selector */}
          <div className="flex items-center gap-1.5">
            <span className="text-[#686B65]">Tiles:</span>
            <select
              value={tileProvider}
              onChange={(e) => {
                const val = e.target.value as "osm_standard" | "osm_hot" | "maptiler";
                setTileProvider(val);
                if (val === "maptiler") setShowKeyInput(true);
              }}
              className="bg-[#FFFFFF] border border-[#DCDDD6] rounded px-2 py-1 text-xs text-[#242722] focus:outline-none"
            >
              <option value="osm_standard">OpenStreetMap Standard</option>
              <option value="osm_hot">OpenStreetMap Humanitarian</option>
              <option value="maptiler">MapTiler OSM (API Key)</option>
            </select>
          </div>

          {/* Optional API Key Button / Field */}
          <button
            onClick={() => setShowKeyInput(!showKeyInput)}
            className={`px-2 py-1 border rounded text-xs transition-colors ${
              osmApiKey.trim()
                ? "bg-[#EAF0EC] border-[#74877B] text-[#40584B] font-medium"
                : "bg-[#FFFFFF] border-[#DCDDD6] text-[#686B65] hover:text-[#242722]"
            }`}
            title="Configure OpenStreetMap / MapTiler API Key"
          >
            {osmApiKey.trim() ? "API Key Configured ✓" : "OSM API Key"}
          </button>

          {/* Ward Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-[#686B65]">Ward:</span>
            <select
              value={selectedWardFilter}
              onChange={(e) => setSelectedWardFilter(e.target.value)}
              className="bg-[#FFFFFF] border border-[#DCDDD6] rounded px-2 py-1 text-xs text-[#242722] focus:outline-none"
            >
              <option value="All">All Wards</option>
              {wards.map((w) => (
                <option key={w} value={w}>
                  Ward {w}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Expandable API Key Bar */}
      {showKeyInput && (
        <div className="px-4 py-2 bg-[#F9F9F8] border-b border-[#DCDDD6] flex items-center justify-between text-xs gap-3">
          <div className="flex items-center gap-2 flex-1 max-w-md">
            <span className="text-[#686B65] shrink-0 font-medium">API Key:</span>
            <input
              type="text"
              placeholder="Paste OpenStreetMap / MapTiler API Key here..."
              value={osmApiKey}
              onChange={(e) => setOsmApiKey(e.target.value)}
              className="flex-1 bg-[#FFFFFF] border border-[#DCDDD6] rounded px-2 py-1 text-xs text-[#242722] focus:outline-none font-mono"
            />
          </div>
          <div className="flex items-center gap-2 text-[11px] text-[#686B65]">
            <span>Active: {tileProvider === "maptiler" ? "MapTiler Streets" : "OpenStreetMap.org"}</span>
            <button
              onClick={() => setShowKeyInput(false)}
              className="px-2 py-0.5 bg-[#FFFFFF] border border-[#DCDDD6] rounded hover:bg-[#F0F0EC]"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* Map Canvas */}
      <div ref={mapContainer} className="relative flex-1 w-full h-full" />

      {/* Map Legend Overlay */}
      <div className="absolute bottom-3 left-3 bg-[#FFFFFF]/95 backdrop-blur-sm border border-[#DCDDD6] p-2.5 rounded shadow-sm text-[11px] text-[#242722] z-10 flex flex-col gap-1.5 max-w-[260px]">
        <div className="font-semibold text-xs text-[#242722] pb-1 border-b border-[#DCDDD6] flex justify-between items-center">
          <span>Geospatial Intelligence</span>
          <span className="text-[10px] text-[#686B65] font-normal">OpenStreetMap</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#A64E45] inline-block"></span>
          <span>Critical Hotspot (Depth &gt; 80cm)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#A77936] inline-block"></span>
          <span>High Risk Hotspot (50-80cm)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#74877B] inline-block"></span>
          <span>Moderate Risk Hotspot (&lt; 50cm)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rotate-45 bg-[#40584B] inline-block"></span>
          <span>Critical Civic Facility (Hospital / Fire)</span>
        </div>
        <div className="pt-1 mt-0.5 border-t border-[#DCDDD6] text-[10px] text-[#686B65]">
          Tiles: OpenStreetMap contributors ({tileProvider === "maptiler" ? "MapTiler" : "tile.openstreetmap.org"})
        </div>
      </div>
    </div>
  );
}
