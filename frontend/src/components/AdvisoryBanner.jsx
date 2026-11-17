import React from 'react';
import { Sparkles, Flame, Droplets, Sun, AlertTriangle, X } from 'lucide-react';

export default function AdvisoryBanner({ locationName, weatherCurrent }) {
  const [dismissed, setDismissed] = React.useState({});

  const now = new Date();
  const month = now.getMonth() + 1; // 1-12
  const alerts = [];

  // Diwali Season Alert (November)
  if (month === 11 && !dismissed['diwali']) {
    alerts.push({
      id: 'diwali',
      icon: Sparkles,
      title: 'Diwali Festival Season Advisory',
      message: 'Elevated particulate pollution is expected regionally due to seasonal festivities and firework displays. Keep purifiers active and limit outdoor exposure during night hours.',
      badge: 'Seasonal Surge',
      tone: 'border-terracotta-200 bg-terracotta-50/70 text-terracotta-800',
      iconTone: 'text-terracotta-600 bg-terracotta-100',
    });
  }

  // Stubble / Crop Burning Season (October - November for North India / Punjab / Haryana)
  const isNorthIndia =
    locationName &&
    (locationName.includes('Punjab') ||
      locationName.includes('Haryana') ||
      locationName.includes('Delhi') ||
      locationName.includes('Sonipat') ||
      locationName.includes('Amritsar'));

  if ((month === 10 || month === 11) && isNorthIndia && !dismissed['crop']) {
    alerts.push({
      id: 'crop',
      icon: Flame,
      title: 'Agricultural Residue / Stubble Burning Advisory',
      message: 'Post-harvest biomass burning across North Indian agricultural belts often induces dense smog layers. Wear an N95 mask outdoors.',
      badge: 'Regional Smog Warning',
      tone: 'border-amber-200 bg-amber-50/70 text-amber-900',
      iconTone: 'text-amber-700 bg-amber-100',
    });
  }

  // High Heat Advisory
  if (weatherCurrent && weatherCurrent.temp >= 35 && !dismissed['heat']) {
    alerts.push({
      id: 'heat',
      icon: Sun,
      title: `Intense Heat Alert (${weatherCurrent.temp}°C)`,
      message: 'High ambient temperature may accelerate surface ozone formation. Stay well hydrated and avoid vigorous outdoor exercise during peak sunlight (12 PM – 4 PM).',
      badge: 'Heat Warning',
      tone: 'border-orange-200 bg-orange-50/70 text-orange-900',
      iconTone: 'text-orange-600 bg-orange-100',
    });
  }

  // High Humidity Advisory
  if (weatherCurrent && weatherCurrent.humidity > 80 && !dismissed['humidity']) {
    alerts.push({
      id: 'humidity',
      icon: Droplets,
      title: `Elevated Humidity Advisory (${weatherCurrent.humidity}%)`,
      message: 'Excess moisture may slow particle dispersal and foster microbial or fungal spore accumulation. Ensure proper indoor ventilation.',
      badge: 'Moisture Index',
      tone: 'border-forest-200 bg-forest-50/60 text-forest-900',
      iconTone: 'text-forest-700 bg-forest-100',
    });
  }

  if (alerts.length === 0) return null;

  return (
    <div className="space-y-2.5 mb-6">
      {alerts.map((alert) => {
        const IconComponent = alert.icon;
        return (
          <div
            key={alert.id}
            className={`p-3.5 rounded-xl border ${alert.tone} flex items-start justify-between gap-3 shadow-soft-sm transition-all`}
          >
            <div className="flex items-start gap-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${alert.iconTone}`}>
                <IconComponent className="w-4 h-4" />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="text-xs font-bold font-serif">{alert.title}</h4>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/70 border border-current/20">
                    {alert.badge}
                  </span>
                </div>
                <p className="text-xs leading-relaxed opacity-90">{alert.message}</p>
              </div>
            </div>
            <button
              onClick={() => setDismissed((prev) => ({ ...prev, [alert.id]: true }))}
              className="p-1 rounded-md opacity-60 hover:opacity-100 hover:bg-black/5 transition-opacity shrink-0"
              title="Dismiss warning"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
