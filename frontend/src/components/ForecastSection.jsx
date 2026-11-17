import React, { useState } from 'react';
import { Calendar, CloudRain, Sun, Droplets, TrendingUp } from 'lucide-react';

export default function ForecastSection({ dailyForecast }) {
  const [activeMetric, setActiveMetric] = useState('temp'); // 'temp' | 'rain'

  if (!dailyForecast || dailyForecast.length === 0) return null;

  // Chart computations
  const temps = dailyForecast.map((d) => d.avgTemp);
  const rains = dailyForecast.map((d) => d.rainMm);

  const minTemp = Math.floor(Math.min(...temps) - 2);
  const maxTemp = Math.ceil(Math.max(...temps) + 2);
  const maxRain = Math.max(5, Math.ceil(Math.max(...rains, 2)));

  // SVG dimensions
  const width = 600;
  const height = 180;
  const paddingX = 40;
  const paddingY = 25;

  const points = dailyForecast.map((d, index) => {
    const x = paddingX + (index / (dailyForecast.length - 1)) * (width - 2 * paddingX);
    let y = 0;
    if (activeMetric === 'temp') {
      const ratio = (d.avgTemp - minTemp) / (maxTemp - minTemp || 1);
      y = height - paddingY - ratio * (height - 2 * paddingY);
    } else {
      const ratio = d.rainMm / maxRain;
      y = height - paddingY - ratio * (height - 2 * paddingY);
    }
    return { x, y, ...d };
  });

  // SVG path definition
  const pathD = points.reduce((acc, p, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`, '');
  const areaD = `${pathD} L ${points[points.length - 1].x} ${height - paddingY} L ${points[0].x} ${height - paddingY} Z`;

  return (
    <div className="card-warm p-6 transition-all">
      {/* Top Bar with metric toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-canvas-border mb-6">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-forest-700" />
          <h3 className="text-sm font-bold text-forest-900 uppercase font-mono tracking-wider">
            5-Day Atmospheric Forecast
          </h3>
        </div>

        {/* Toggle metric */}
        <div className="flex items-center p-1 rounded-lg bg-canvas border border-canvas-border">
          <button
            onClick={() => setActiveMetric('temp')}
            className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
              activeMetric === 'temp'
                ? 'bg-canvas-card text-forest-900 shadow-soft-sm font-bold border border-canvas-border'
                : 'text-charcoal-400 hover:text-charcoal-800'
            }`}
          >
            Temperature (°C)
          </button>
          <button
            onClick={() => setActiveMetric('rain')}
            className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
              activeMetric === 'rain'
                ? 'bg-canvas-card text-terracotta-700 shadow-soft-sm font-bold border border-canvas-border'
                : 'text-charcoal-400 hover:text-charcoal-800'
            }`}
          >
            Precipitation (mm)
          </button>
        </div>
      </div>

      {/* SVG Interactive Chart */}
      <div className="w-full bg-canvas/60 rounded-xl p-4 border border-canvas-border mb-6 overflow-hidden">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-44 overflow-visible">
          <defs>
            <linearGradient id="tempAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1C422F" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#1C422F" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="rainAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#C8623A" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#C8623A" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Horizontal Gridlines */}
          {[0.25, 0.5, 0.75].map((fraction) => {
            const yLine = paddingY + fraction * (height - 2 * paddingY);
            return (
              <line
                key={fraction}
                x1={paddingX}
                y1={yLine}
                x2={width - paddingX}
                y2={yLine}
                stroke="#E2DDD2"
                strokeDasharray="4 4"
                strokeWidth="1"
              />
            );
          })}

          {/* Area Fill */}
          <path
            d={areaD}
            fill={activeMetric === 'temp' ? 'url(#tempAreaGrad)' : 'url(#rainAreaGrad)'}
            className="transition-all duration-500 ease-out"
          />

          {/* Curve Stroke */}
          <path
            d={pathD}
            fill="none"
            stroke={activeMetric === 'temp' ? '#27573E' : '#C8623A'}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="transition-all duration-500 ease-out"
          />

          {/* Points & Labels */}
          {points.map((p, i) => (
            <g key={i} className="transition-all duration-500">
              <circle
                cx={p.x}
                cy={p.y}
                r="5"
                fill="#FFFDF9"
                stroke={activeMetric === 'temp' ? '#27573E' : '#C8623A'}
                strokeWidth="2.5"
              />
              <text
                x={p.x}
                y={p.y - 12}
                fill="#242826"
                fontSize="11"
                fontWeight="700"
                fontFamily="JetBrains Mono, monospace"
                textAnchor="middle"
              >
                {activeMetric === 'temp' ? `${p.avgTemp}°C` : `${p.rainMm} mm`}
              </text>
              <text
                x={p.x}
                y={height - 6}
                fill="#7B8380"
                fontSize="10"
                fontWeight="500"
                textAnchor="middle"
              >
                {p.dayName.split(' ')[0]}
              </text>
            </g>
          ))}
        </svg>
      </div>

      {/* 5-Day Card Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {dailyForecast.map((day, idx) => (
          <div
            key={day.dateKey}
            className={`p-3.5 rounded-xl border transition-all text-center flex flex-col justify-between ${
              idx === 0
                ? 'bg-forest-50/50 border-forest-200'
                : 'bg-canvas border-canvas-border hover:border-canvas-border/90'
            }`}
          >
            <div>
              <p className="text-xs font-bold text-forest-900 font-mono">
                {idx === 0 ? 'Today' : day.dayName.split(',')[0]}
              </p>
              <p className="text-[10px] text-charcoal-400 capitalize truncate mt-0.5">{day.description}</p>
            </div>

            <div className="my-2.5">
              <span className="text-xl font-bold font-serif text-forest-900">{day.avgTemp}°</span>
              <div className="text-[10px] text-charcoal-400 font-mono mt-0.5">
                <span>{day.minTemp}°</span> · <span className="font-semibold text-charcoal-700">{day.maxTemp}°</span>
              </div>
            </div>

            <div className="pt-2 border-t border-canvas-border/60 flex items-center justify-center gap-1 text-[10px] text-charcoal-400 font-mono">
              <CloudRain className="w-3 h-3 text-terracotta-500" />
              <span>{day.rainMm} mm</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
