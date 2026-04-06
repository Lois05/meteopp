import React, { useState, useEffect, useRef } from "react";
import SearchBar from "./components/SearchBar";
import SideBar from "./components/SideBar";
import CurrentWeather from "./components/CurrentWeather";
import WeatherDetails from "./components/WeatherDetails";
import DailyForecast from "./components/DailyForecast";
import "./styles/global.css";

// Assets
import logo from "./assets/images/logo.svg";
import unitsIcon from "./assets/images/icon-units.svg";
import checkmark from "./assets/images/icon-checkmark.svg";
import bgImage from "./assets/images/bg-today-large.svg";
import errorIcon from "./assets/images/icon-error.svg";
import retryIcon from "./assets/images/icon-retry.svg";
import dropdown from "./assets/images/icon-dropdown.svg";

// Icônes Météo WebP
import sunnyIcon from "./assets/images/icon-sunny.webp";
import partlyCloudyIcon from "./assets/images/icon-partly-cloudy.webp";
import overcast from "./assets/images/icon-overcast.webp";
import fog from "./assets/images/icon-fog.webp";
import drizzle from "./assets/images/icon-drizzle.webp";
import rain from "./assets/images/icon-rain.webp";
import snow from "./assets/images/icon-snow.webp";
import storm from "./assets/images/icon-storm.webp";

// --- FONCTIONS DE CONVERSION (Logique dynamique) ---
const convertTemp = (temp, unit) => {
  if (!temp && temp !== 0) return null;
  if (unit.includes("Fahrenheit")) return Math.round((temp * 9) / 5 + 32);
  return Math.round(temp);
};

const convertWind = (speed, unit) => {
  if (!speed && speed !== 0) return null;
  if (unit === "mph") return Math.round(speed * 0.621371);
  return Math.round(speed);
};

function App() {
  const [weatherData, setWeatherData] = useState(null);
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [hasNoResults, setHasNoResults] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const settingsRef = useRef(null);

  const [units, setUnits] = useState({
    temp: "Celsius (°C)",
    wind: "km/h",
    precip: "Millimeters (mm)"
  });

  // Fermer le menu Units si on clique à l'extérieur
  useEffect(() => {
    const closeMenu = (e) => {
      if (settingsRef.current && !settingsRef.current.contains(e.target)) setShowSettings(false);
    };
    document.addEventListener("mousedown", closeMenu);
    return () => document.removeEventListener("mousedown", closeMenu);
  }, []);

  const getWeatherIcon = (code) => {
    if (code === 0) return sunnyIcon;
    if (code >= 1 && code <= 3) return partlyCloudyIcon;
    if (code === 45 || code === 48) return fog;
    if (code >= 51 && code <= 57) return drizzle;
    if (code >= 61 && code <= 67) return rain;
    if (code >= 71 && code <= 77) return snow;
    if (code >= 80 && code <= 82) return rain;
    if (code >= 95) return storm;
    return overcast;
  };

  const fetchWeather = async (city) => {
    if (!city) return;
    setIsLoading(true);
    setHasError(false);
    setHasNoResults(false);

    try {
      const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`);
      const geoData = await geoRes.json();
      
      if (!geoData.results || geoData.results.length === 0) {
        setHasNoResults(true);
        setIsLoading(false);
        return;
      }

      const { latitude, longitude, name, country } = geoData.results[0];

      const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,wind_speed_10m,weather_code&hourly=temperature_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto`);
      const data = await res.json();

      const formattedDays = data.daily.time.map((dateStr, i) => {
        const startHour = i * 24;
        return {
          dayName: new Date(dateStr).toLocaleDateString("en-US", { weekday: "long" }),
          shortDay: new Date(dateStr).toLocaleDateString("en-US", { weekday: "short" }),
          max: data.daily.temperature_2m_max[i], // On stocke la valeur brute (Metric)
          min: data.daily.temperature_2m_min[i],
          icon: getWeatherIcon(data.daily.weather_code[i]),
          hourly: data.hourly.time.slice(startHour, startHour + 24).map((t, idx) => ({
            time: new Date(t).toLocaleTimeString("en-US", { hour: 'numeric', hour12: true }),
            temp: data.hourly.temperature_2m[startHour + idx],
            icon: getWeatherIcon(data.hourly.weather_code[startHour + idx])
          }))
        };
      });

      setWeatherData({ 
        city: name, 
        country, 
        current: { 
          temp: data.current.temperature_2m, 
          feelsLike: data.current.apparent_temperature, 
          humidity: data.current.relative_humidity_2m, 
          wind: data.current.wind_speed_10m, 
          precip: data.current.precipitation, 
          icon: getWeatherIcon(data.current.weather_code) 
        }, 
        days: formattedDays 
      });
      setSelectedDayIndex(0);
    } catch (e) {
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchWeather("Cotonou"); }, []);

  if (hasError) {
    return (
      <div className="full-error-screen">
        <header className="app-header">
          <div className="header-content">
            <img src={logo} className="logo" alt="Logo" />
          </div>
        </header>
        <div className="error-content">
          <img src={errorIcon} className="error-big-icon" alt="!" />
          <h1>Something went wrong</h1>
          <p>We couldn't connect to the server (API error). Please try again in a few moments.</p>
          <button className="retry-btn-large" onClick={() => fetchWeather("Cotonou")}>
            <img src={retryIcon} alt="" /> Retry
          </button>
        </div>
      </div>
    );
  }

  // --- PRÉPARATION DES DONNÉES DYNAMIQUES ---
  const displayedWeather = weatherData ? {
    ...weatherData,
    current: {
      ...weatherData.current,
      temp: convertTemp(weatherData.current.temp, units.temp),
      feelsLike: convertTemp(weatherData.current.feelsLike, units.temp),
      wind: convertWind(weatherData.current.wind, units.wind)
    },
    days: weatherData.days.map(day => ({
      ...day,
      max: convertTemp(day.max, units.temp),
      min: convertTemp(day.min, units.temp),
      hourly: day.hourly.map(h => ({
        ...h,
        temp: convertTemp(h.temp, units.temp)
      }))
    }))
  } : null;

  return (
    <div className="app-main-wrapper">
      <header className="app-header">
        <div className="header-content">
          <img src={logo} className="logo" alt="Logo" />
          
          <div className="settings-wrapper" ref={settingsRef}>
            <button 
              className={`settings-btn ${showSettings ? 'active-focus' : ''}`} 
              onClick={() => setShowSettings(!showSettings)}
            >
              <img src={unitsIcon} className="unit-icon-main" alt="" /> 
              Units 
              <img src={dropdown} className={`dropdown-icon-img ${showSettings ? 'up' : ''}`} alt="" />  
            </button>
            
            {showSettings && (
              <div className="settings-dropdown">
                <div className="dropdown-section">
                  <p className="section-title">Switch to Imperial</p>
                  <div className="divider"></div>
                  
                  <p className="label">Temperature</p>
                  <div className={`option ${units.temp.includes('Celsius') ? 'active' : ''}`} onClick={() => setUnits({...units, temp: "Celsius (°C)"})}>
                    Celsius (°C) {units.temp.includes('Celsius') && <img src={checkmark} className="checkmark" alt="v" />}
                  </div>
                  <div className={`option ${units.temp.includes('Fahrenheit') ? 'active' : ''}`} onClick={() => setUnits({...units, temp: "Fahrenheit (°F)"})}>
                    Fahrenheit (°F) {units.temp.includes('Fahrenheit') && <img src={checkmark} className="checkmark" alt="v" />}
                  </div>

                  <p className="label">Wind Speed</p>
                  <div className={`option ${units.wind === 'km/h' ? 'active' : ''}`} onClick={() => setUnits({...units, wind: "km/h"})}>
                    km/h {units.wind === 'km/h' && <img src={checkmark} className="checkmark" alt="v" />}
                  </div>
                  <div className={`option ${units.wind === 'mph' ? 'active' : ''}`} onClick={() => setUnits({...units, wind: "mph"})}>
                    mph {units.wind === 'mph' && <img src={checkmark} className="checkmark" alt="v" />}
                  </div>

                  <p className="label">Precipitation</p>
                  <div className={`option ${units.precip.includes('Millimeters') ? 'active' : ''}`} onClick={() => setUnits({...units, precip: "Millimeters (mm)"})}>
                    Millimeters (mm) {units.precip.includes('Millimeters') && <img src={checkmark} className="checkmark" alt="v" />}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      <SearchBar handleSearch={fetchWeather} />

      <main className="main-content">
        {hasNoResults ? (
          <div className="no-results-container">
            <h2 className="no-results-text">No search result found!</h2>
          </div>
        ) : (
          <>
            <div className="main-left">
              <CurrentWeather 
                data={displayedWeather} 
                loading={isLoading} 
                bg={bgImage} 
              />
              <WeatherDetails 
                data={displayedWeather?.current} 
                units={units} 
                loading={isLoading} 
              />
              <DailyForecast 
                days={displayedWeather?.days} 
                activeIndex={selectedDayIndex} 
                onSelect={setSelectedDayIndex} 
                loading={isLoading} 
              />
            </div>
            <aside className="sidebar">
              <SideBar 
                days={displayedWeather?.days || []} 
                selectedIndex={selectedDayIndex} 
                setSelectedIndex={setSelectedDayIndex} 
                loading={isLoading} 
              />
            </aside>
          </>
        )}
      </main>
    </div>
  );
}

export default App;