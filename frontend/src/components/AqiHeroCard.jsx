import React from 'react';
import { Wind, ShieldCheck, Heart, Home, Activity, Info, Clock, AlertCircle } from 'lucide-react';

export default function AqiHeroCard({ aqiData }) {
  if (!aqiData) return null;

  const {
    pm25,
    unit = 'µg/m³',
    aqiIndex = 50,
    aqiLevel = 'Good',
    description,
    badgeColor,
    dotColor,
    formattedTime,
    isFallback,
  } = aqiData;

  // Calculate arc rotation for gauge: 0 to 500 maps to 0 to 180 degrees
  const clampedAqi = Math.min(500, Math.max(0, aqiIndex));
  const progressRatio = clampedAqi / 500;
  const rotationDeg = progressRatio * 180 - 90; // -90deg to 90deg

  // Health guidelines tailored to AQI
  const getHealthGuidance = (aqi) => {
    if (aqi <= 50) {
      return {
        exercise: 'Perfect conditions for all outdoor sports, running, and cycling.',
        windows: 'Open windows freely to ventilate indoor living spaces.',
        mask: 'No protective mask required.',
        sensitive: 'Safe for everyone, including infants and individuals with asthma.',
        statusTone: 'text-emerald-800 bg-emerald-50 border-emerald-200',
      };
    } else if (aqi <= 100) {
      return {
        exercise: 'Safe for outdoor exercise; unusually sensitive persons should monitor symptoms.',
        windows: 'Generally fine to ventilate during daytime hours.',
        mask: 'Not necessary for the general public.',
        sensitive: 'People with respiratory allergies may notice slight irritation.',
        statusTone: 'text-amber-800 bg-amber-50 border-amber-200',
      };
    } else if (aqi <= 150) {
      return {
        exercise: 'Reduce prolonged or heavy outdoor exertion. Take frequent breaks.',
        windows: 'Keep windows closed during peak traffic and morning rush hours.',
        mask: 'Sensitive individuals should wear an N95 mask when outdoors.',
        sensitive: 'Active children and elderly should limit intense outdoor playtime.',
        statusTone: 'text-orange-800 bg-orange-50 border-orange-200',
      };
    } else if (aqi <= 200) {
      return {
        exercise: 'Avoid outdoor cardio workouts; switch to indoor activities.',
        windows: 'Keep windows shut tight; run indoor air purifiers (HEPA filter).',
        mask: 'N95 or FFP2 respirator recommended for any outdoor movement.',
        sensitive: 'High risk of wheezing and respiratory aggravation for sensitive groups.',
        statusTone: 'text-rose-800 bg-rose-50 border-rose-200',
      };
    } else {
      return {
        exercise: 'Cease all outdoor sports and physical exercise immediately.',
        windows: 'Seal doors and windows; run HEPA air cleaners at maximum speed.',
        mask: 'Mandatory well-fitted N95 / KN95 respirator outdoors.',
        sensitive: 'Serious risk of respiratory and cardiovascular stress for all residents.',
        statusTone: 'text-purple-900 bg-purple-50 border-purple-200',
      };
    }
  };

  const guidance = getHealthGuidance(aqiIndex);

  // WHO guideline for PM2.5 24h average is 15 µg/m³
  const whoRatio = (pm25 / 15).toFixed(1);

  return (
    <div className="card-warm p-6 md:p-8 relative overflow-hidden transition-all">
      {/* Subtle background decoration */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-forest-50/50 rounded-full blur-3xl -z-10 pointer-events-none" />

      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-6 border-b border-canvas-border">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: dotColor }} />
          <h2 className="text-base font-bold text-forest-900 uppercase tracking-wider font-mono text-xs">
            Air Quality Index (US EPA Standards)
          </h2>
          {isFallback && (
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
              Simulated Feed
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 text-xs text-charcoal-400 font-mono">
          <Clock className="w-3.5 h-3.5" />
          <span>Updated: {formattedTime}</span>
        </div>
      </div>

      {/* Main Grid: Gauge & PM2.5 Hero */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center py-6">
        {/* Gauge Visual */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center text-center">
          <div className="relative w-64 h-36 flex items-end justify-center">
            {/* SVG Arc Gauge */}
            <svg viewBox="0 0 200 110" className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="aqiArcGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#2D6A4F" />    {/* Good (Green) */}
                  <stop offset="25%" stopColor="#B87A28" />   {/* Moderate (Ochre) */}
                  <stop offset="50%" stopColor="#C8623A" />   {/* Sensitive (Terracotta) */}
                  <stop offset="75%" stopColor="#BE123C" />   {/* Unhealthy (Crimson) */}
                  <stop offset="100%" stopColor="#581C87" />  {/* Hazardous (Violet) */}
                </linearGradient>
              </defs>

              {/* Background Track */}
              <path
                d="M 20 100 A 80 80 0 0 1 180 100"
                fill="none"
                stroke="#E8E2D5"
                strokeWidth="14"
                strokeLinecap="round"
              />

              {/* Colored Gauge Arc */}
              <path
                d="M 20 100 A 80 80 0 0 1 180 100"
                fill="none"
                stroke="url(#aqiArcGradient)"
                strokeWidth="14"
                strokeLinecap="round"
                strokeDasharray="251.2"
                strokeDashoffset={251.2 * (1 - progressRatio)}
                className="transition-all duration-1000 ease-out"
              />

              {/* Ticks */}
              <text x="16" y="112" fill="#7B8380" fontSize="8" fontWeight="600" textAnchor="middle">0</text>
              <text x="56" y="42" fill="#7B8380" fontSize="8" fontWeight="600" textAnchor="middle">50</text>
              <text x="100" y="16" fill="#7B8380" fontSize="8" fontWeight="600" textAnchor="middle">150</text>
              <text x="144" y="42" fill="#7B8380" fontSize="8" fontWeight="600" textAnchor="middle">300</text>
              <text x="184" y="112" fill="#7B8380" fontSize="8" fontWeight="600" textAnchor="middle">500</text>

              {/* Needle Indicator */}
              <g transform={`rotate(${rotationDeg} 100 100)`} className="transition-transform duration-1000 ease-out">
                <line x1="100" y1="100" x2="100" y2="30" stroke="#232826" strokeWidth="2.5" strokeLinecap="round" />
                <circle cx="100" cy="100" r="5" fill="#232826" />
                <circle cx="100" cy="100" r="2.5" fill="#FFFDF9" />
              </g>
            </svg>
          </div>

          {/* AQI Numeric Metric */}
          <div className="mt-2 space-y-1">
            <div className="flex items-baseline justify-center gap-1.5">
              <span className="text-5xl font-extrabold text-forest-900 tracking-tight font-serif">
                {aqiIndex}
              </span>
              <span className="text-xs font-semibold text-charcoal-400 uppercase tracking-widest font-mono">
                AQI
              </span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border shadow-soft-sm mt-1" style={{ borderColor: dotColor, color: dotColor, backgroundColor: '#FAF7F2' }}>
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: dotColor }} />
              <span>{aqiLevel}</span>
            </div>
            <p className="text-xs text-charcoal-600 max-w-xs mx-auto pt-1 leading-relaxed">
              {description}
            </p>
          </div>
        </div>

        {/* PM2.5 Core Details & WHO Comparison */}
        <div className="lg:col-span-7 flex flex-col justify-between space-y-5">
          <div className="p-5 rounded-2xl bg-canvas border border-canvas-border space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wind className="w-4 h-4 text-forest-700" />
                <span className="text-xs font-bold text-forest-900 uppercase font-mono">Primary Pollutant: PM2.5</span>
              </div>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-forest-100/60 text-forest-800">
                Fine Inhalable Particles
              </span>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-forest-900 font-mono tracking-tight">{pm25}</span>
              <span className="text-sm font-semibold text-charcoal-600">{unit}</span>
            </div>

            {/* WHO Guideline Benchmark */}
            <div className="pt-2 border-t border-canvas-border/80 flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-2">
              <div className="text-charcoal-600">
                <span>WHO Recommended Limit: </span>
                <span className="font-semibold text-charcoal-800">15 µg/m³ (24h)</span>
              </div>
              <div className="font-medium text-xs">
                {pm25 <= 15 ? (
                  <span className="text-emerald-700 font-semibold">✓ Meets WHO Air Safety Guideline</span>
                ) : (
                  <span className="text-terracotta-600 font-semibold">
                    ▲ {whoRatio}x above WHO recommended guideline
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Actionable Health Guidance Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl bg-canvas-card border border-canvas-border flex items-start gap-3">
              <div className="w-7 h-7 rounded-lg bg-forest-50 text-forest-700 flex items-center justify-center shrink-0 border border-forest-100">
                <Activity className="w-3.5 h-3.5" />
              </div>
              <div className="space-y-0.5">
                <p className="text-[11px] font-bold text-charcoal-800">Outdoor Sports</p>
                <p className="text-[11px] text-charcoal-600 leading-snug">{guidance.exercise}</p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-canvas-card border border-canvas-border flex items-start gap-3">
              <div className="w-7 h-7 rounded-lg bg-terracotta-50 text-terracotta-600 flex items-center justify-center shrink-0 border border-terracotta-100">
                <Home className="w-3.5 h-3.5" />
              </div>
              <div className="space-y-0.5">
                <p className="text-[11px] font-bold text-charcoal-800">Indoor & Windows</p>
                <p className="text-[11px] text-charcoal-600 leading-snug">{guidance.windows}</p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-canvas-card border border-canvas-border flex items-start gap-3">
              <div className="w-7 h-7 rounded-lg bg-amberwarm-50 text-amberwarm-600 flex items-center justify-center shrink-0 border border-amberwarm-100">
                <ShieldCheck className="w-3.5 h-3.5" />
              </div>
              <div className="space-y-0.5">
                <p className="text-[11px] font-bold text-charcoal-800">Mask Recommendation</p>
                <p className="text-[11px] text-charcoal-600 leading-snug">{guidance.mask}</p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-canvas-card border border-canvas-border flex items-start gap-3">
              <div className="w-7 h-7 rounded-lg bg-sage-50 text-sage-600 flex items-center justify-center shrink-0 border border-sage-100">
                <Heart className="w-3.5 h-3.5" />
              </div>
              <div className="space-y-0.5">
                <p className="text-[11px] font-bold text-charcoal-800">Sensitive Groups</p>
                <p className="text-[11px] text-charcoal-600 leading-snug">{guidance.sensitive}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
