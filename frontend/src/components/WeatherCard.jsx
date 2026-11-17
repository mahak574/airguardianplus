import React from 'react';
import { Thermometer, Droplets, Wind, Cloud, Compass, Eye, Gauge } from 'lucide-react';

export default function WeatherCard({ weatherCurrent }) {
  if (!weatherCurrent) return null;

  const {
    temp,
    feelsLike,
    humidity,
    pressure,
    windSpeed,
    windDeg,
    clouds,
    visibility,
    description,
    icon,
  } = weatherCurrent;

  return (
    <div className="card-warm p-6 transition-all">
      <div className="flex items-center justify-between pb-4 border-b border-canvas-border mb-4">
        <div className="flex items-center gap-2">
          <Cloud className="w-4 h-4 text-forest-700" />
          <h3 className="text-sm font-bold text-forest-900 uppercase font-mono tracking-wider">
            Current Weather & Atmospheric Conditions
          </h3>
        </div>
        <span className="text-xs text-charcoal-400 capitalize font-medium">{description}</span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Temperature */}
        <div className="p-4 rounded-xl bg-canvas border border-canvas-border flex flex-col justify-between">
          <div className="flex items-center justify-between text-charcoal-400 mb-2">
            <span className="text-xs font-semibold">Temperature</span>
            <Thermometer className="w-4 h-4 text-terracotta-500" />
          </div>
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-extrabold font-serif text-forest-900">{temp}</span>
              <span className="text-sm font-mono text-charcoal-600">°C</span>
            </div>
            <p className="text-[11px] text-charcoal-400 mt-1">Feels like {feelsLike}°C</p>
          </div>
        </div>

        {/* Humidity */}
        <div className="p-4 rounded-xl bg-canvas border border-canvas-border flex flex-col justify-between">
          <div className="flex items-center justify-between text-charcoal-400 mb-2">
            <span className="text-xs font-semibold">Humidity</span>
            <Droplets className="w-4 h-4 text-sage-600" />
          </div>
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-extrabold font-serif text-forest-900">{humidity}</span>
              <span className="text-sm font-mono text-charcoal-600">%</span>
            </div>
            <p className="text-[11px] text-charcoal-400 mt-1">
              {humidity > 75 ? 'Humid & Heavy' : humidity < 35 ? 'Dry Air' : 'Comfortable'}
            </p>
          </div>
        </div>

        {/* Wind Speed */}
        <div className="p-4 rounded-xl bg-canvas border border-canvas-border flex flex-col justify-between">
          <div className="flex items-center justify-between text-charcoal-400 mb-2">
            <span className="text-xs font-semibold">Wind Speed</span>
            <Wind className="w-4 h-4 text-forest-600" />
          </div>
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-extrabold font-serif text-forest-900">{windSpeed}</span>
              <span className="text-sm font-mono text-charcoal-600">m/s</span>
            </div>
            <p className="text-[11px] text-charcoal-400 mt-1">
              {windDeg ? `Heading ${windDeg}°` : 'Gentle Breeze'}
            </p>
          </div>
        </div>

        {/* Pressure & Visibility */}
        <div className="p-4 rounded-xl bg-canvas border border-canvas-border flex flex-col justify-between">
          <div className="flex items-center justify-between text-charcoal-400 mb-2">
            <span className="text-xs font-semibold">Pressure & Sight</span>
            <Gauge className="w-4 h-4 text-amberwarm-500" />
          </div>
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold font-serif text-forest-900">{pressure}</span>
              <span className="text-xs font-mono text-charcoal-600">hPa</span>
            </div>
            <p className="text-[11px] text-charcoal-400 mt-1">Visibility: {visibility} km</p>
          </div>
        </div>
      </div>
    </div>
  );
}
