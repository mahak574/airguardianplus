import React from 'react';
import { Layers, HelpCircle } from 'lucide-react';

const POLLUTANT_SPECS = [
  { key: 'pm2_5', name: 'PM2.5', label: 'Fine Particles', unit: 'µg/m³', safeLimit: 15, maxScale: 100, desc: 'Combustion particles, smoke, dust' },
  { key: 'pm10', name: 'PM10', label: 'Coarse Particles', unit: 'µg/m³', safeLimit: 45, maxScale: 200, desc: 'Road dust, construction, pollen' },
  { key: 'no2', name: 'NO₂', label: 'Nitrogen Dioxide', unit: 'µg/m³', safeLimit: 25, maxScale: 150, desc: 'Vehicle exhaust and fossil fuel power plants' },
  { key: 'o3', name: 'O₃', label: 'Ground Ozone', unit: 'µg/m³', safeLimit: 100, maxScale: 200, desc: 'Sunlight reaction with hydrocarbons' },
  { key: 'so2', name: 'SO₂', label: 'Sulfur Dioxide', unit: 'µg/m³', safeLimit: 40, maxScale: 150, desc: 'Coal burning, industrial refineries' },
  { key: 'co', name: 'CO', label: 'Carbon Monoxide', unit: 'µg/m³', safeLimit: 4000, maxScale: 10000, desc: 'Incomplete fuel combustion, gas heating' },
];

export default function PollutantsGrid({ rawComponents }) {
  if (!rawComponents) return null;

  return (
    <div className="card-warm p-6 transition-all">
      <div className="flex items-center justify-between pb-4 border-b border-canvas-border mb-4">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-forest-700" />
          <h3 className="text-sm font-bold text-forest-900 uppercase font-mono tracking-wider">
            Comprehensive Pollutant Concentrations
          </h3>
        </div>
        <span className="text-xs text-charcoal-400 font-mono">Real-time Sensor Breakdown</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {POLLUTANT_SPECS.map((item) => {
          const val = rawComponents[item.key] != null ? Number(rawComponents[item.key].toFixed(1)) : 0;
          const ratio = Math.min(100, (val / item.maxScale) * 100);
          const isElevated = val > item.safeLimit;

          return (
            <div
              key={item.key}
              className="p-3.5 rounded-xl bg-canvas border border-canvas-border flex flex-col justify-between hover:border-canvas-border/90 transition-all group"
            >
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-charcoal-800 font-mono">{item.name}</span>
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isElevated ? 'bg-terracotta-500' : 'bg-forest-600'
                    }`}
                  />
                </div>
                <p className="text-[10px] text-charcoal-400 font-medium truncate mb-2">{item.label}</p>

                <div className="flex items-baseline gap-1 my-1">
                  <span className="text-lg font-bold font-mono text-forest-900">{val}</span>
                  <span className="text-[10px] text-charcoal-400 font-mono">{item.unit}</span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="mt-2 pt-2 border-t border-canvas-border/60">
                <div className="w-full h-1.5 rounded-full bg-canvas-subtle overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      isElevated ? 'bg-terracotta-500' : 'bg-forest-600'
                    }`}
                    style={{ width: `${Math.max(8, ratio)}%` }}
                  />
                </div>
                <div className="flex justify-between text-[9px] text-charcoal-400 font-mono mt-1">
                  <span>Limit: {item.safeLimit}</span>
                  <span>{isElevated ? 'Elevated' : 'Safe'}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
