import React, { useEffect, useRef } from 'react';
import { MapPin, ExternalLink } from 'lucide-react';

export default function MapView({ coords, locationName }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const circleRef = useRef(null);

  const cartoApiKey = import.meta.env.VITE_CARTO_API_KEY || '';

  // CARTO Positron tile URL (CARTO requires the query parameter to be ?key=, NOT ?api_key=)
  const tileUrl = cartoApiKey
    ? `https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png?key=${cartoApiKey}`
    : `https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png`;

  const tileAttribution = cartoApiKey
    ? '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
    : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

  useEffect(() => {
    if (!mapContainerRef.current) return;

    const L = window.L;
    if (!L) {
      console.warn('Leaflet library is still loading...');
      return;
    }

    const { lat, lon } = coords;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [lat, lon],
        zoom: 13,
        zoomControl: true,
        attributionControl: false,
      });

      L.tileLayer(tileUrl, {
        maxZoom: 19,
        subdomains: 'abcd',
        attribution: tileAttribution,
      }).addTo(map);

      const customIcon = L.divIcon({
        className: 'custom-map-pin',
        html: `
          <div style="
            width: 32px;
            height: 32px;
            background-color: #B8532C;
            border: 2.5px solid #FFFDF9;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 10px rgba(45,35,30,0.3);
          ">
            <div style="
              width: 10px;
              height: 10px;
              background-color: #FFFDF9;
              border-radius: 50%;
              transform: rotate(45deg);
            "></div>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -30],
      });

      const marker = L.marker([lat, lon], { icon: customIcon }).addTo(map);
      marker.bindPopup(`
        <div style="font-family: system-ui, sans-serif; font-size: 12px; color: #232826; padding: 2px;">
          <strong style="color: #143123;">📍 ${locationName}</strong><br/>
          <span style="color: #7B8380; font-family: monospace;">Lat: ${lat.toFixed(4)}, Lon: ${lon.toFixed(4)}</span>
        </div>
      `);

      const circle = L.circle([lat, lon], {
        radius: 500,
        color: '#B8532C',
        weight: 1.5,
        fillColor: '#B8532C',
        fillOpacity: 0.12,
      }).addTo(map);

      mapInstanceRef.current = map;
      markerRef.current = marker;
      circleRef.current = circle;
    } else {
      const map = mapInstanceRef.current;
      map.setView([lat, lon], 13);
      if (markerRef.current) {
        markerRef.current.setLatLng([lat, lon]);
        markerRef.current.setPopupContent(`
          <div style="font-family: system-ui, sans-serif; font-size: 12px; color: #232826; padding: 2px;">
            <strong style="color: #143123;">📍 ${locationName}</strong><br/>
            <span style="color: #7B8380; font-family: monospace;">Lat: ${lat.toFixed(4)}, Lon: ${lon.toFixed(4)}</span>
          </div>
        `);
      }
      if (circleRef.current) {
        circleRef.current.setLatLng([lat, lon]);
      }
    }

    const timer = setTimeout(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [coords, locationName, tileUrl]);

  const googleMapsUrl = `https://www.google.com/maps?q=${coords.lat},${coords.lon}`;

  return (
    <div className="card-warm p-6 transition-all">
      <div className="flex items-center justify-between pb-4 border-b border-canvas-border mb-4">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-terracotta-600" />
          <h3 className="text-sm font-bold text-forest-900 uppercase font-mono tracking-wider">
            Geospatial Location & Atmospheric Radius
          </h3>
        </div>
        <a
          href={googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-xs text-forest-700 hover:text-forest-900 font-semibold"
        >
          <span>Open in Google Maps</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      <div className="relative w-full h-[360px] rounded-xl overflow-hidden border border-canvas-border shadow-soft-sm">
        <div ref={mapContainerRef} className="w-full h-full" />

        <div className="absolute bottom-3 left-3 z-[1000] bg-canvas-card/95 backdrop-blur-md px-3.5 py-2 rounded-xl border border-canvas-border shadow-soft-md text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-terracotta-500 animate-pulse" />
            <p className="font-semibold text-charcoal-800">{locationName}</p>
          </div>
          <p className="text-[10px] text-charcoal-400 font-mono mt-0.5">
            500m Local Sensor Monitoring Radius
          </p>
        </div>
      </div>
    </div>
  );
}
