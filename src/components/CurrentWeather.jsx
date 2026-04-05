import React from "react";
import "../styles/currentweather.css";

const CurrentWeather = ({ data, loading, bg }) => {
  // --- ÉTAT DE CHARGEMENT (Exactement comme ta photo) ---
  if (loading || !data) {
    return (
      <div className="current-weather loading-state">
        <div className="loader-container">
          <div className="loader-dots">
            <span></span>
            <span></span>
            <span></span>
          </div>
          <p className="loading-label">Loading...</p>
        </div>
      </div>
    );
  }

  // --- ÉTAT NORMAL ---
  const dateStr = new Date().toLocaleDateString("en-US", {
    weekday: 'long', day: 'numeric', month: 'long'
  });

  return (
    <div className="current-weather" style={{ backgroundImage: `url(${bg})` }}>
      <div className="top">
        <div className="top-left">
          <p className="date">{dateStr}</p>
          <div className="city-country">
            <span className="city">{data.city}</span>
            <span className="comma">,</span>
            <span className="country">{data.country}</span>
          </div>
        </div>

        <div className="top-right">
          <img src={data.current.icon} alt="icon" className="weather-icon" />
          <span className="temp">{Math.round(data.current.temp)}°</span>
        </div>
      </div>
    </div>
  );
};

export default CurrentWeather;