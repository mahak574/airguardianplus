import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import LocationModal from './components/LocationModal';
import AdvisoryBanner from './components/AdvisoryBanner';
import AqiHeroCard from './components/AqiHeroCard';
import PollutantsGrid from './components/PollutantsGrid';
import WeatherCard from './components/WeatherCard';
import ForecastSection from './components/ForecastSection';
import PredictionSection from './components/PredictionSection';
import HistorySection from './components/HistorySection';
import MapView from './components/MapView';
import Footer from './components/Footer';

import { fetchAirPollution, fetchWeatherForecast, fetchLocationName } from './services/api';
import { runLinearRegression } from './utils/mlPredictor';
import { logReading, getLoggedReadings } from './utils/historyLogger';

const DEFAULT_COORDS = { lat: 28.6139, lon: 77.2090 };

export default function App() {
  const [coords, setCoords] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const lat = parseFloat(params.get('lat'));
    const lon = parseFloat(params.get('lon'));
    if (!isNaN(lat) && !isNaN(lon) && lat !== 0 && lon !== 0) {
      return { lat, lon };
    }
    return DEFAULT_COORDS;
  });

  const [locationName, setLocationName] = useState('New Delhi, India');
  const [aqiData, setAqiData] = useState(null);
  const [weatherData, setWeatherData] = useState(null);
  const [predictionData, setPredictionData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);

  const loadDashboardData = useCallback(async (targetCoords) => {
    setLoading(true);
    try {
      const [locInfo, aqiResult, weatherResult] = await Promise.all([
        fetchLocationName(targetCoords.lat, targetCoords.lon),
        fetchAirPollution(targetCoords.lat, targetCoords.lon),
        fetchWeatherForecast(targetCoords.lat, targetCoords.lon),
      ]);

      setLocationName(locInfo.shortName || locInfo.formatted);
      setAqiData(aqiResult);
      setWeatherData(weatherResult);

      if (aqiResult && aqiResult.pm25 != null) {
        logReading(aqiResult.pm25, aqiResult.timestamp);
      }

      const historyReadings = getLoggedReadings();
      const mlOutput = runLinearRegression(historyReadings, aqiResult.pm25, 12);
      setPredictionData(mlOutput);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData(coords);

    const url = new URL(window.location.href);
    url.searchParams.set('lat', coords.lat.toFixed(4));
    url.searchParams.set('lon', coords.lon.toFixed(4));
    window.history.replaceState({}, '', url.toString());
  }, [coords, loadDashboardData]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (!params.has('lat') && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = parseFloat(pos.coords.latitude.toFixed(4));
          const lon = parseFloat(pos.coords.longitude.toFixed(4));
          setCoords({ lat, lon });
        },
        (err) => {
          console.info('Defaulting to New Delhi coordinates:', err.message);
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    }
  }, []);

  const handleSelectLocation = (newLat, newLon) => {
    setCoords({ lat: newLat, lon: newLon });
  };

  const handleRefresh = () => {
    loadDashboardData(coords);
  };

  return (
    <div className="min-h-screen flex flex-col bg-canvas text-charcoal-800">
      <Header
        locationName={locationName}
        coords={coords}
        onOpenLocationModal={() => setIsLocationModalOpen(true)}
        onRefresh={handleRefresh}
        loading={loading}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <AdvisoryBanner
          locationName={locationName}
          weatherCurrent={weatherData?.current}
        />

        <AqiHeroCard aqiData={aqiData} />

        <PollutantsGrid rawComponents={aqiData?.rawComponents} />

        <WeatherCard weatherCurrent={weatherData?.current} />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-7 space-y-6">
            <ForecastSection dailyForecast={weatherData?.dailyForecast} />
            <PredictionSection predictionData={predictionData} />
            <HistorySection />
          </div>

          <div className="lg:col-span-5 sticky top-20 space-y-6">
            <MapView coords={coords} locationName={locationName} />

            <div className="card-warm p-5 text-xs text-charcoal-600 space-y-2.5">
              <div className="flex items-center justify-between font-bold text-forest-900 uppercase font-mono">
                <span>Environmental Guard Specs</span>
                <span className="text-[10px] text-terracotta-600 font-semibold">Active Sensor Mode</span>
              </div>
              <p className="leading-relaxed">
                AirGuardian+ synthesizes satellite atmospheric sounders, ground-level reference monitors, and localized meteorological stations to predict airborne particulate exposure.
              </p>
              <div className="pt-2 border-t border-canvas-border flex items-center justify-between font-mono text-[11px] text-charcoal-400">
                <span>Coverage: Radius 500m</span>
                <span className="text-forest-700 font-semibold">Sensor Health: Nominal</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />

      <LocationModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        currentCoords={coords}
        onSelectLocation={handleSelectLocation}
      />
    </div>
  );
}
