import React, { useState, useEffect, useCallback, useRef } from "react";
import SearchBar from "./components/SearchBar";
import SideBar from "./components/SideBar";
import CurrentWeather from "./components/CurrentWeather";
import WeatherDetails from "./components/WeatherDetails";
import DailyForecast from "./components/DailyForecast";
import "./styles/global.css";

// Assets
import logo from "./assets/images/logo.svg";
import unitsIcon from "./assets/images/icon-units.svg";
import bgImage from "./assets/images/bg-today-large.svg";
import dropdownIcon from "./assets/images/icon-dropdown.svg";
import checkmarkIcon from "./assets/images/icon-checkmark.svg";

// Icônes Météo
import sunnyIcon from "./assets/images/icon-sunny.webp";
import partlyCloudyIcon from "./assets/images/icon-partly-cloudy.webp";
import overcast from "./assets/images/icon-overcast.webp";
import fog from "./assets/images/icon-fog.webp";
import drizzle from "./assets/images/icon-drizzle.webp";
import rain from "./assets/images/icon-rain.webp";
import snow from "./assets/images/icon-snow.webp";
import storm from "./assets/images/icon-storm.webp";

const convertValue = (value, type, unitSystem) => {
  if (value === null || value === undefined) return 0;
  if (unitSystem === "Metric") return Math.round(value);
  if (type === "temp") return Math.round((value * 9) / 5 + 32);
  if (type === "wind") return Math.round(value / 1.609); 
  if (type === "precip") return (value / 25.4).toFixed(1); 
  return value;
};

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

function App() {
  const [weatherData, setWeatherData] = useState(null);
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [unitSystem, setUnitSystem] = useState("Metric"); 
  
  const initialFetchDone = useRef(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isDropdownOpen]);

  const fetchWeather = useCallback(async (city) => {
    setIsLoading(true);
    try {
      const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`);
      const geoData = await geoRes.json();
      
      if (!geoData.results) {
        setIsLoading(false);
        return;
      }

      const { latitude, longitude, name, country } = geoData.results[0];
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,wind_speed_10m,weather_code&hourly=temperature_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto`;
      
      const weatherRes = await fetch(url);
      const data = await weatherRes.json();

      if (data && data.current) {
        setWeatherData({ city: name, country, raw: data });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (initialFetchDone.current) return;
    fetchWeather("Berlin");
    initialFetchDone.current = true;
  }, [fetchWeather]);

  const finalData = weatherData ? {
    city: weatherData.city,
    country: weatherData.country,
    current: {
      temp: convertValue(weatherData.raw.current.temperature_2m, "temp", unitSystem),
      feelsLike: convertValue(weatherData.raw.current.apparent_temperature, "temp", unitSystem),
      humidity: weatherData.raw.current.relative_humidity_2m,
      wind: convertValue(weatherData.raw.current.wind_speed_10m, "wind", unitSystem),
      precip: convertValue(weatherData.raw.current.precipitation, "precip", unitSystem),
      icon: getWeatherIcon(weatherData.raw.current.weather_code),
    },
    days: weatherData.raw.daily.time.map((dateStr, i) => {
      const start = i * 24;
      return {
        shortDay: new Date(dateStr).toLocaleDateString("en-US", { weekday: "short" }),
        dayName: new Date(dateStr).toLocaleDateString("en-US", { weekday: "long" }),
        max: convertValue(weatherData.raw.daily.temperature_2m_max[i], "temp", unitSystem),
        min: convertValue(weatherData.raw.daily.temperature_2m_min[i], "temp", unitSystem),
        icon: getWeatherIcon(weatherData.raw.daily.weather_code[i]),
        hourly: weatherData.raw.hourly.temperature_2m.slice(start, start + 24).map((t, idx) => ({
          time: idx > 12 ? `${idx - 12} PM` : idx === 12 ? "12 PM" : idx === 0 ? "12 AM" : `${idx} AM`,
          temp: convertValue(t, "temp", unitSystem),
          icon: getWeatherIcon(weatherData.raw.hourly.weather_code[start + idx] || 0),
          rawIndex: idx 
        }))
      };
    })
  } : null;

  return (
    <div className="app-main-wrapper">
      <header className="app-header">
        <div className="header-content">
          <img src={logo} alt="Logo" className="logo" />
          <div className="units-dropdown-container" ref={dropdownRef}>
            <button className={`settings-btn ${isDropdownOpen ? "active" : ""}`} onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
              <img src={unitsIcon} alt="" /> Units <img src={dropdownIcon} className={isDropdownOpen ? "open" : ""} alt="" />
            </button>
            {isDropdownOpen && (
              <div className="dropdown-menu">
                <div className="dropdown-label" onClick={() => setUnitSystem(unitSystem === "Metric" ? "Imperial" : "Metric")}>
                  Switch to {unitSystem === "Metric" ? "Imperial" : "Metric"}
                </div>
                {["Temperature", "Wind Speed", "Precipitation"].map((title, idx) => (
                  <div className="dropdown-section" key={idx}>
                    <p>{title}</p>
                    <div className={`dropdown-item ${unitSystem === "Metric" ? "selected" : ""}`} onClick={() => { setUnitSystem("Metric"); setIsDropdownOpen(false); }}>
                      {idx === 0 ? "Celsius (°C)" : idx === 1 ? "km/h" : "Millimeters (mm)"} {unitSystem === "Metric" && <img src={checkmarkIcon} alt="" />}
                    </div>
                    <div className={`dropdown-item ${unitSystem === "Imperial" ? "selected" : ""}`} onClick={() => { setUnitSystem("Imperial"); setIsDropdownOpen(false); }}>
                      {idx === 0 ? "Fahrenheit (°F)" : idx === 1 ? "mph" : "Inches (in)"} {unitSystem === "Imperial" && <img src={checkmarkIcon} alt="" />}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </header>

      <SearchBar handleSearch={fetchWeather} />
      
      <main className="main-content">
        <div className="main-left">
          <CurrentWeather 
            data={finalData} 
            loading={isLoading} 
            bg={bgImage} 
            unit="°" 
          />
          <WeatherDetails 
            data={finalData?.current} 
            loading={isLoading} 
            units={{
              temp: "°",
              wind: unitSystem === "Metric" ? "km/h" : "mph",
              precip: unitSystem === "Metric" ? "mm" : "in"
            }} 
          />
          <DailyForecast 
            days={finalData?.days} 
            activeIndex={selectedDayIndex} 
            onSelect={setSelectedDayIndex} 
            loading={isLoading} 
          />
        </div>
        <aside className="sidebar">
          <SideBar 
            days={finalData?.days} 
            selectedIndex={selectedDayIndex} 
            setSelectedIndex={setSelectedDayIndex} 
            loading={isLoading} 
          />
        </aside>
      </main>
    </div>
  );
}

export default App;