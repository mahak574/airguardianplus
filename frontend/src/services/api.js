// API Service for AirGuardian+

const OPENWEATHER_API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY || '34e2667254f36664158f85e52a496756';
const GEOCODER_API_KEY = import.meta.env.VITE_GEOCODER_API_KEY || '5bb0c23c1def487c82812e204ea8e37d';

export const AQI_BREAKPOINTS = [
  { cLow: 0.0, cHigh: 12.0, aqiLow: 0, aqiHigh: 50, label: 'Good', description: 'Air quality is satisfactory and poses little or no risk.', badgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-200', dotColor: '#2D6A4F' },
  { cLow: 12.1, cHigh: 35.4, aqiLow: 51, aqiHigh: 100, label: 'Moderate', description: 'Acceptable quality; some pollutants may affect unusually sensitive individuals.', badgeColor: 'bg-amber-50 text-amber-800 border-amber-200', dotColor: '#B87A28' },
  { cLow: 35.5, cHigh: 55.4, aqiLow: 101, aqiHigh: 150, label: 'Unhealthy for Sensitive Groups', description: 'Children, older adults, and individuals with respiratory issues should reduce prolonged exertion.', badgeColor: 'bg-orange-50 text-orange-800 border-orange-200', dotColor: '#C8623A' },
  { cLow: 55.5, cHigh: 150.4, aqiLow: 151, aqiHigh: 200, label: 'Unhealthy', description: 'Everyone may begin to experience health effects; limit intense outdoor activities.', badgeColor: 'bg-rose-50 text-rose-800 border-rose-200', dotColor: '#BE123C' },
  { cLow: 150.5, cHigh: 250.4, aqiLow: 201, aqiHigh: 300, label: 'Very Unhealthy', description: 'Health alert: serious health effects for entire population. Avoid outdoor exertion.', badgeColor: 'bg-purple-50 text-purple-900 border-purple-200', dotColor: '#6B21A8' },
  { cLow: 250.5, cHigh: 500.0, aqiLow: 301, aqiHigh: 500, label: 'Hazardous', description: 'Emergency conditions: entire population is more likely to be affected. Remain indoors.', badgeColor: 'bg-stone-100 text-stone-900 border-stone-400', dotColor: '#4A044E' },
];

export function convertPm25ToAqi(pm25) {
  if (pm25 == null || isNaN(pm25)) return null;
  const val = Number(pm25);
  for (const bp of AQI_BREAKPOINTS) {
    if (val >= bp.cLow && val <= bp.cHigh) {
      const aqi = Math.round(
        ((bp.aqiHigh - bp.aqiLow) / (bp.cHigh - bp.cLow)) * (val - bp.cLow) + bp.aqiLow
      );
      return {
        aqi,
        label: bp.label,
        description: bp.description,
        badgeColor: bp.badgeColor,
        dotColor: bp.dotColor,
      };
    }
  }
  if (val > 500) {
    return {
      aqi: 500,
      label: 'Hazardous (Beyond AQI)',
      description: 'Extremely critical pollution levels. Stay indoors with air purifiers active.',
      badgeColor: 'bg-stone-200 text-stone-900 border-stone-500',
      dotColor: '#3B0764',
    };
  }
  return {
    aqi: Math.round(val),
    label: 'Good',
    description: 'Minimal risk detected.',
    badgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    dotColor: '#2D6A4F',
  };
}

// Reverse Geocoding with fallback
export async function fetchLocationName(lat, lon) {
  try {
    if (GEOCODER_API_KEY) {
      const url = `https://api.opencagedata.com/geocode/v1/json?q=${lat},${lon}&key=${GEOCODER_API_KEY}&language=en&no_annotations=1&limit=1`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (data.results && data.results.length > 0) {
          const comp = data.results[0].components;
          const city = comp.city || comp.town || comp.village || comp.suburb || comp.county || comp.state;
          const country = comp.country || '';
          const formatted = data.results[0].formatted;
          return {
            formatted,
            shortName: city ? `${city}, ${country}` : formatted.split(',').slice(0, 2).join(','),
            state: comp.state || '',
            country: country,
          };
        }
      }
    }
    // Free OpenStreetMap reverse geocode fallback
    const nominatimUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=14&addressdetails=1`;
    const nomRes = await fetch(nominatimUrl, { headers: { 'User-Agent': 'AirGuardianPlus/1.0' } });
    if (nomRes.ok) {
      const nomData = await nomRes.json();
      const addr = nomData.address || {};
      const place = addr.city || addr.town || addr.village || addr.suburb || addr.state || 'Local Area';
      const country = addr.country || '';
      return {
        formatted: nomData.display_name,
        shortName: `${place}${country ? ', ' + country : ''}`,
        state: addr.state || '',
        country: country,
      };
    }
  } catch (err) {
    console.warn('Geocoding notice:', err.message);
  }

  return {
    formatted: `Coordinates ${lat.toFixed(4)}, ${lon.toFixed(4)}`,
    shortName: `${lat.toFixed(3)}°N, ${lon.toFixed(3)}°E`,
    state: '',
    country: '',
  };
}

// Fetch Air Pollution Data
export async function fetchAirPollution(lat, lon) {
  try {
    const url = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    const data = await res.json();

    if (!data.list || data.list.length === 0) {
      throw new Error('No air pollution data returned');
    }

    const item = data.list[0];
    const pm25 = item.components.pm2_5;
    const aqiMeta = convertPm25ToAqi(pm25);

    return {
      pm25: Number(pm25.toFixed(1)),
      unit: 'µg/m³',
      timestamp: item.dt * 1000,
      formattedTime: new Date(item.dt * 1000).toLocaleString('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short',
      }),
      rawComponents: item.components,
      aqiIndex: aqiMeta.aqi,
      aqiLevel: aqiMeta.label,
      description: aqiMeta.description,
      badgeColor: aqiMeta.badgeColor,
      dotColor: aqiMeta.dotColor,
      isFallback: false,
    };
  } catch (err) {
    console.warn('Air pollution API fallback:', err.message);
    // Graceful realistic fallback
    const fallbackPm25 = 28.4;
    const aqiMeta = convertPm25ToAqi(fallbackPm25);
    return {
      pm25: fallbackPm25,
      unit: 'µg/m³',
      timestamp: Date.now(),
      formattedTime: new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }),
      rawComponents: {
        co: 420.5,
        no: 0.8,
        no2: 18.2,
        o3: 45.1,
        so2: 4.8,
        pm2_5: fallbackPm25,
        pm10: 42.1,
        nh3: 6.2,
      },
      aqiIndex: aqiMeta.aqi,
      aqiLevel: aqiMeta.label,
      description: aqiMeta.description,
      badgeColor: aqiMeta.badgeColor,
      dotColor: aqiMeta.dotColor,
      isFallback: true,
      errorNotice: err.message,
    };
  }
}

// Fetch 5-Day Weather Forecast
export async function fetchWeatherForecast(lat, lon) {
  try {
    const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}&units=metric`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    const data = await res.json();

    const current = data.list[0];
    
    // Aggregate by day
    const dailyMap = {};
    for (const item of data.list) {
      const dateKey = item.dt_txt.split(' ')[0];
      if (!dailyMap[dateKey]) {
        dailyMap[dateKey] = {
          dateKey,
          temps: [],
          rains: [],
          weather: item.weather[0],
          rawDate: new Date(item.dt * 1000),
        };
      }
      dailyMap[dateKey].temps.push(item.main.temp);
      const rainAmount = item.rain && item.rain['3h'] ? item.rain['3h'] : 0;
      dailyMap[dateKey].rains.push(rainAmount);
    }

    const dailyForecast = Object.values(dailyMap).slice(0, 5).map(day => {
      const avgTemp = day.temps.reduce((a, b) => a + b, 0) / day.temps.length;
      const minTemp = Math.min(...day.temps);
      const maxTemp = Math.max(...day.temps);
      const totalRain = day.rains.reduce((a, b) => a + b, 0);
      const dayName = day.rawDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

      return {
        dateKey: day.dateKey,
        dayName,
        avgTemp: Math.round(avgTemp * 10) / 10,
        minTemp: Math.round(minTemp * 10) / 10,
        maxTemp: Math.round(maxTemp * 10) / 10,
        rainMm: Math.round(totalRain * 10) / 10,
        description: day.weather.description,
        icon: day.weather.icon,
      };
    });

    return {
      current: {
        temp: Math.round(current.main.temp * 10) / 10,
        feelsLike: Math.round(current.main.feels_like * 10) / 10,
        humidity: current.main.humidity,
        pressure: current.main.pressure,
        windSpeed: current.wind.speed,
        windDeg: current.wind.deg,
        clouds: current.clouds ? current.clouds.all : 0,
        visibility: current.visibility ? (current.visibility / 1000).toFixed(1) : 10,
        description: current.weather[0].description,
        icon: current.weather[0].icon,
        rawTime: current.dt * 1000,
      },
      dailyForecast,
      rawList: data.list.slice(0, 10),
      isFallback: false,
    };
  } catch (err) {
    console.warn('Weather API fallback:', err.message);
    const mockDaily = [
      { dateKey: 'Day 1', dayName: 'Today', avgTemp: 27.4, minTemp: 22.0, maxTemp: 31.5, rainMm: 0.2, description: 'Partly Cloudy', icon: '02d' },
      { dateKey: 'Day 2', dayName: 'Tomorrow', avgTemp: 28.1, minTemp: 23.2, maxTemp: 32.8, rainMm: 0.0, description: 'Clear Sky', icon: '01d' },
      { dateKey: 'Day 3', dayName: 'Day +2', avgTemp: 26.5, minTemp: 21.0, maxTemp: 29.5, rainMm: 2.4, description: 'Light Rain', icon: '10d' },
      { dateKey: 'Day 4', dayName: 'Day +3', avgTemp: 25.8, minTemp: 20.4, maxTemp: 28.2, rainMm: 1.1, description: 'Scattered Clouds', icon: '03d' },
      { dateKey: 'Day 5', dayName: 'Day +4', avgTemp: 28.0, minTemp: 21.8, maxTemp: 32.0, rainMm: 0.0, description: 'Sunny', icon: '01d' },
    ];
    return {
      current: {
        temp: 27.5,
        feelsLike: 29.0,
        humidity: 62,
        pressure: 1012,
        windSpeed: 3.4,
        windDeg: 120,
        clouds: 25,
        visibility: 9.5,
        description: 'Pleasant and partly sunny',
        icon: '02d',
        rawTime: Date.now(),
      },
      dailyForecast: mockDaily,
      rawList: [],
      isFallback: true,
      errorNotice: err.message,
    };
  }
}
