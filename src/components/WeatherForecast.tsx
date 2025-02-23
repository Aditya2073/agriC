import React, { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';

interface WeatherData {
  main: {
    temp: number;
    humidity: number;
  };
  weather: Array<{
    main: string;
    description: string;
    icon: string;
  }>;
  name: string;
}

interface ForecastData {
  list: Array<{
    dt: number;
    main: {
      temp_min: number;
      temp_max: number;
      humidity: number;
    };
    weather: Array<{
      main: string;
      description: string;
      icon: string;
    }>;
    pop: number; // Probability of precipitation
  }>;
}

export const WeatherForecast: React.FC = () => {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [coordinates, setCoordinates] = useState({ lat: 18.5204, lon: 73.8567 }); // Default coordinates
  const [locationEnabled, setLocationEnabled] = useState(false);
  const [forecastData, setForecastData] = useState<ForecastData | null>(null);

  useEffect(() => {
    fetchWeatherData();
    fetchForecastData();
  }, [coordinates]);

  const fetchForecastData = async () => {
    try {
      const apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY;

      if (!apiKey) {
        throw new Error('OpenWeather API key is not configured');
      }

      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${coordinates.lat}&lon=${coordinates.lon}&units=metric&appid=${apiKey}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch forecast data');
      }

      const data = await response.json();
      setForecastData(data);
      setError('');
    } catch (err) {
      console.error('Error fetching forecast data:', err);
      setError('Failed to load forecast data. Please try again later.');
    }
  };

  const requestLocation = () => {
    if (navigator.geolocation) {
      setLoading(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCoordinates({
            lat: position.coords.latitude,
            lon: position.coords.longitude
          });
          setLocationEnabled(true);
          setError('');
        },
        (err) => {
          console.error('Error getting location:', err);
          setError('Unable to get your location. Using default location.');
          setLocationEnabled(false);
        }
      );
    } else {
      setError('Geolocation is not supported by your browser. Using default location.');
      setLocationEnabled(false);
    }
  };

  const fetchWeatherData = async () => {
    try {
      const apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY;

      if (!apiKey) {
        throw new Error('OpenWeather API key is not configured');
      }

      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${coordinates.lat}&lon=${coordinates.lon}&units=metric&appid=${apiKey}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch weather data');
      }

      const data = await response.json();
      console.log(data);
      
      setWeatherData(data);
      setError('');
    } catch (err) {
      console.error('Error fetching weather data:', err);
      setError('Failed to load weather data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg flex items-center">
        <AlertCircle className="h-5 w-5 mr-3" />
        {error}
      </div>
    );
  }

  if (!weatherData) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Weather Forecast</h2>
        <button
          onClick={requestLocation}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${locationEnabled ? 'bg-green-100 text-green-700' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
        >
          {locationEnabled ? 'Using Your Location' : 'Use My Location'}
        </button>
      </div>

      {/* Current Weather */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Weather in {weatherData.name}</h3>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center">
              <img
                src={`http://openweathermap.org/img/wn/${weatherData.weather[0].icon}@2x.png`}
                alt={weatherData.weather[0].description}
                className="w-16 h-16"
              />
              <div className="ml-4">
                <p className="text-3xl font-bold text-gray-900">
                  {Math.round(weatherData.main.temp)}°C
                </p>
                <p className="text-gray-600 capitalize">
                  {weatherData.weather[0].description}
                </p>
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className="text-gray-600">
              Humidity: {weatherData.main.humidity}%
            </p>
          </div>
        </div>
      </div>

      {/* 5-Day Forecast */}
      {forecastData && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">5-Day Forecast</h3>
          <div className="overflow-x-auto pb-4">
            <div className="flex space-x-4">
              {forecastData.list.filter((_, index) => index % 8 === 0).map((forecast) => (
                <div key={forecast.dt} className="flex-shrink-0 w-[160px] bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                  <p className="text-sm font-medium text-gray-600 mb-2">{formatDate(forecast.dt)}</p>
                  <div className="flex items-center justify-center mb-2">
                    <img
                      src={`http://openweathermap.org/img/wn/${forecast.weather[0].icon}@2x.png`}
                      alt={forecast.weather[0].description}
                      className="w-12 h-12"
                    />
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-semibold text-gray-900">
                      {Math.round(forecast.main.temp_max)}°C
                    </p>
                    <p className="text-sm text-gray-500">
                      {Math.round(forecast.main.temp_min)}°C
                    </p>
                    <p className="text-xs text-gray-600 mt-2 capitalize">
                      {forecast.weather[0].description}
                    </p>
                    <p className="text-xs text-blue-600 mt-1">
                      {Math.round(forecast.pop * 100)}% rain
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};