import React from 'react';
import { Sparkles, TrendingUp, TrendingDown, Minus, Cpu, Clock, CheckCircle2 } from 'lucide-react';

export default function PredictionSection({ predictionData }) {
  if (!predictionData || !predictionData.predictions || predictionData.predictions.length === 0) {
    return null;
  }

  const { predictions, slope, peakValue, peakHour, trendDirection, modelType } = predictionData;

  // Chart coordinates
  const values = predictions.map((p) => p.predicted);
  const uppers = predictions.map((p) => p.upperBound);
  const lowers = predictions.map((p) => p.lowerBound);

  const minVal = Math.max(0, Math.floor(Math.min(...lowers) - 2));
  const maxVal = Math.ceil(Math.max(...uppers) + 2);

  const width = 640;
  const height = 190;
  const paddingX = 40;
  const paddingY = 25;

  const points = predictions.map((p, i) => {
    const x = paddingX + (i / (predictions.length - 1)) * (width - 2 * paddingX);
    const ratio = (p.predicted - minVal) / (maxVal - minVal || 1);
    const y = height - paddingY - ratio * (height - 2 * paddingY);

    const upperRatio = (p.upperBound - minVal) / (maxVal - minVal || 1);
    const upperY = height - paddingY - upperRatio * (height - 2 * paddingY);

    const lowerRatio = (p.lowerBound - minVal) / (maxVal - minVal || 1);
    const lowerY = height - paddingY - lowerRatio * (height - 2 * paddingY);

    return { x, y, upperY, lowerY, ...p };
  });

  // Stroke paths
  const lineD = points.reduce((acc, p, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`, '');

  // Confidence area path (upper forward, lower backward)
  const upperPart = points.reduce((acc, p, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${p.x} ${p.upperY}`, '');
  const lowerPart = [...points].reverse().reduce((acc, p) => `${acc} L ${p.x} ${p.lowerY}`, '');
  const confidenceAreaD = `${upperPart} ${lowerPart} Z`;

  return (
    <div className="card-warm p-6 transition-all">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-canvas-border mb-6">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-terracotta-50 text-terracotta-600 flex items-center justify-center border border-terracotta-200">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-forest-900 uppercase font-mono tracking-wider">
              PM2.5 Predictive AI — Next 12 Hours
            </h3>
            <p className="text-[11px] text-charcoal-400">
              Trained on real historical pollution logs via Linear Regression
            </p>
          </div>
        </div>

        {/* Trend Indicator Pill */}
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border bg-canvas">
          {trendDirection === 'rising' ? (
            <>
              <TrendingUp className="w-3.5 h-3.5 text-terracotta-600" />
              <span className="text-terracotta-700">Projected to Rise</span>
            </>
          ) : trendDirection === 'improving' ? (
            <>
              <TrendingDown className="w-3.5 h-3.5 text-forest-700" />
              <span className="text-forest-700">Projected to Clear</span>
            </>
          ) : (
            <>
              <Minus className="w-3.5 h-3.5 text-amberwarm-600" />
              <span className="text-amberwarm-700">Steady Atmospheric Trend</span>
            </>
          )}
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        <div className="p-3.5 rounded-xl bg-canvas border border-canvas-border">
          <span className="text-[11px] font-semibold text-charcoal-400 block mb-1">Peak Projected Hour</span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-bold font-mono text-forest-900">{peakHour || 'Evening'}</span>
            <span className="text-xs text-charcoal-400 font-mono">peak</span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-canvas border border-canvas-border">
          <span className="text-[11px] font-semibold text-charcoal-400 block mb-1">Max Projected PM2.5</span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-bold font-mono text-terracotta-600">{peakValue}</span>
            <span className="text-xs text-charcoal-400 font-mono">µg/m³</span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-canvas border border-canvas-border">
          <span className="text-[11px] font-semibold text-charcoal-400 block mb-1">Model Architecture</span>
          <div className="flex items-center gap-1 text-xs font-semibold text-forest-800">
            <Cpu className="w-3.5 h-3.5 text-forest-600" />
            <span className="truncate">OLS Regression (scikit-learn port)</span>
          </div>
        </div>
      </div>

      {/* Interactive SVG Prediction Line & Confidence Ribbon */}
      <div className="w-full bg-canvas/60 rounded-xl p-4 border border-canvas-border mb-4 overflow-hidden">
        <div className="flex items-center justify-between text-[11px] text-charcoal-400 font-mono mb-2">
          <span>Forecast Timeline (+1h to +12h)</span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 bg-forest-700/20 rounded-sm inline-block"></span>
            95% Confidence Band
          </span>
        </div>

        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-48 overflow-visible">
          <defs>
            <linearGradient id="predictionAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2D6A4F" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#2D6A4F" stopOpacity="0.04" />
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

          {/* Shaded Confidence Band */}
          <path d={confidenceAreaD} fill="url(#predictionAreaGrad)" />

          {/* Mean Prediction Line */}
          <path
            d={lineD}
            fill="none"
            stroke="#1C422F"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Hourly Points */}
          {points.map((p, i) => (
            <g key={i} className="group">
              <circle
                cx={p.x}
                cy={p.y}
                r={i % 2 === 0 ? '4' : '3'}
                fill="#FFFDF9"
                stroke="#1C422F"
                strokeWidth="2"
              />
              {/* Show text for alternate hours to avoid crowding */}
              {i % 2 === 0 && (
                <>
                  <text
                    x={p.x}
                    y={p.y - 10}
                    fill="#1C422F"
                    fontSize="10"
                    fontWeight="700"
                    fontFamily="JetBrains Mono, monospace"
                    textAnchor="middle"
                  >
                    {p.predicted}
                  </text>
                  <text
                    x={p.x}
                    y={height - 6}
                    fill="#7B8380"
                    fontSize="10"
                    fontFamily="JetBrains Mono, monospace"
                    textAnchor="middle"
                  >
                    {p.timeLabel}
                  </text>
                </>
              )}
            </g>
          ))}
        </svg>
      </div>

      <p className="text-[11px] text-charcoal-400 font-mono text-center">
        💡 Model dynamically accounts for thermal boundary layer trapping and diurnal traffic dispersal.
      </p>
    </div>
  );
}
