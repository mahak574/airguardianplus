import React, { useState } from 'react';
import { History, TrendingUp, Award, Activity } from 'lucide-react';
import { getFilteredHistory } from '../utils/historyLogger';

export default function HistorySection() {
  const [filterDays, setFilterDays] = useState(7); // 1 | 7 | 0 (all)

  const history = getFilteredHistory(filterDays);

  if (!history || history.length === 0) {
    return null;
  }

  // Calculate metrics
  const pmValues = history.map((h) => h.pm25);
  const avgPm25 = (pmValues.reduce((a, b) => a + b, 0) / pmValues.length).toFixed(1);
  const maxPm25 = Math.max(...pmValues).toFixed(1);
  const minPm25 = Math.min(...pmValues).toFixed(1);

  // SVG chart setup
  const width = 640;
  const height = 180;
  const paddingX = 40;
  const paddingY = 25;

  const minScale = Math.max(0, Math.floor(Math.min(...pmValues) - 2));
  const maxScale = Math.ceil(Math.max(...pmValues) + 2);

  const points = history.map((item, index) => {
    const x = paddingX + (index / (history.length - 1 || 1)) * (width - 2 * paddingX);
    const ratio = (item.pm25 - minScale) / (maxScale - minScale || 1);
    const y = height - paddingY - ratio * (height - 2 * paddingY);
    return { x, y, ...item };
  });

  const lineD = points.reduce((acc, p, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`, '');
  const areaD = `${lineD} L ${points[points.length - 1].x} ${height - paddingY} L ${points[0].x} ${height - paddingY} Z`;

  return (
    <div className="card-warm p-6 transition-all">
      {/* Header & Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-canvas-border mb-6">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-forest-700" />
          <h3 className="text-sm font-bold text-forest-900 uppercase font-mono tracking-wider">
            Historical PM2.5 Logged Trend
          </h3>
        </div>

        {/* Filters */}
        <div className="flex items-center p-1 rounded-lg bg-canvas border border-canvas-border">
          <button
            onClick={() => setFilterDays(1)}
            className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
              filterDays === 1
                ? 'bg-canvas-card text-forest-900 shadow-soft-sm font-bold border border-canvas-border'
                : 'text-charcoal-400 hover:text-charcoal-800'
            }`}
          >
            Past 24 Hours
          </button>
          <button
            onClick={() => setFilterDays(7)}
            className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
              filterDays === 7
                ? 'bg-canvas-card text-forest-900 shadow-soft-sm font-bold border border-canvas-border'
                : 'text-charcoal-400 hover:text-charcoal-800'
            }`}
          >
            Past 7 Days
          </button>
          <button
            onClick={() => setFilterDays(0)}
            className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
              filterDays === 0
                ? 'bg-canvas-card text-forest-900 shadow-soft-sm font-bold border border-canvas-border'
                : 'text-charcoal-400 hover:text-charcoal-800'
            }`}
          >
            All History
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="p-3.5 rounded-xl bg-canvas border border-canvas-border">
          <span className="text-[11px] font-semibold text-charcoal-400 block mb-1">Period Average</span>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold font-mono text-forest-900">{avgPm25}</span>
            <span className="text-xs text-charcoal-400 font-mono">µg/m³</span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-canvas border border-canvas-border">
          <span className="text-[11px] font-semibold text-charcoal-400 block mb-1">Peak Recorded</span>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold font-mono text-terracotta-600">{maxPm25}</span>
            <span className="text-xs text-charcoal-400 font-mono">µg/m³</span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-canvas border border-canvas-border">
          <span className="text-[11px] font-semibold text-charcoal-400 block mb-1">Cleanest Recorded</span>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold font-mono text-forest-700">{minPm25}</span>
            <span className="text-xs text-charcoal-400 font-mono">µg/m³</span>
          </div>
        </div>
      </div>

      {/* SVG Historical Chart */}
      <div className="w-full bg-canvas/60 rounded-xl p-4 border border-canvas-border overflow-hidden">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-44 overflow-visible">
          <defs>
            <linearGradient id="historyAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#C8623A" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#C8623A" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Gridlines */}
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
          <path d={areaD} fill="url(#historyAreaGrad)" />

          {/* Line Stroke */}
          <path
            d={lineD}
            fill="none"
            stroke="#C8623A"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data Points */}
          {points.map((p, i) => (
            <g key={i}>
              <circle
                cx={p.x}
                cy={p.y}
                r="3.5"
                fill="#FFFDF9"
                stroke="#C8623A"
                strokeWidth="2"
              />
            </g>
          ))}
        </svg>

        <div className="flex justify-between items-center text-[10px] text-charcoal-400 font-mono mt-2 px-2">
          <span>Earliest: {history[0].formattedDate}</span>
          <span>{history.length} verified sensor readings logged</span>
          <span>Latest: {history[history.length - 1].formattedDate}</span>
        </div>
      </div>
    </div>
  );
}
