import { useState } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLocationArrow } from '@fortawesome/free-solid-svg-icons';
import './Weather.css';

const API_KEY = import.meta.env.VITE_API_KEY;

const Weather = () => {
  const [location, setLocation] = useState('');
  const [weatherData, setWeatherData] = useState(null);
  const [forecastData, setForecastData] = useState([]);

  const handleLocationChange = (event) => {
    setLocation(event.target.value);
  };

  const getCurrentPosition = () => {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject);
    });
  };

  const fetchWeather = async () => {
    try {
      let currentUrl = 'https://api.openweathermap.org/data/2.5/weather';
      let forecastUrl = 'https://api.openweathermap.org/data/2.5/forecast';

      let query = '';
      if (location) {
        query = `q=${location}`;
      } else {
        const { coords } = await getCurrentPosition();
        query = `lat=${coords.latitude}&lon=${coords.longitude}`;
      }

      const units = 'metric'; // or 'imperial' for Fahrenheit

      const [currentRes, forecastRes] = await Promise.all([
        axios.get(`${currentUrl}?${query}&units=${units}&appid=${API_KEY}`),
        axios.get(`${forecastUrl}?${query}&units=${units}&appid=${API_KEY}`)
      ]);

      setWeatherData(currentRes.data);

      // filter forecast to 1 per day at 12:00
      const dailyForecast = forecastRes.data.list.filter(f => f.dt_txt.includes('12:00:00'));
      setForecastData(dailyForecast);

    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="weather-container">
      <h1>Weather App</h1>
      <div className="weather-input-container">
        <input type="text" value={location} onChange={handleLocationChange} placeholder="Enter location" />
        <button onClick={fetchWeather}>
          {location ? 'Get Weather' : (
            <>
              Or get Weather for Current Location
              <FontAwesomeIcon icon={faLocationArrow} className="location-icon" />
            </>
          )}
        </button>
      </div>

      {weatherData && (
        <div className="current-weather">
          <h2>Current Weather in {weatherData.name}</h2>
          <p>Temperature: {weatherData.main.temp}°C</p>
          <p>Condition: {weatherData.weather[0].description}</p>
          <div className="weather-icon">
            <img
              src={`http://openweathermap.org/img/wn/${weatherData.weather[0].icon}@2x.png`}
              alt="Weather Icon"
            />
          </div>
        </div>
      )}

      {forecastData.length > 0 && (
        <div className="forecast-container">
          <h2>Forecast</h2>
          <div className="forecast-list">
            {forecastData.map((item) => (
              <div className="forecast-item" key={item.dt}>
                <p className="date">{new Date(item.dt_txt).toLocaleDateString('en-GB')}</p>
                <p className="condition">{item.weather[0].description}</p>
                <div className="weather-icon">
                  <img
                    src={`http://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png`}
                    alt="Weather Icon"
                  />
                </div>
                <p className="temperature">Temp: {item.main.temp}°C</p>
                <p className="wind-speed">Wind: {item.wind.speed} m/s</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Weather;