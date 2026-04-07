import React from "react";
import "../styles/currentweather.css";

const CurrentWeather = ({ data, loading, bg }) => {
  // État de chargement (Skeleton avec les 3 points pulsants)
  if (loading) {
    return (
      <div className="current-weather current-loading-container">
        <div className="loading-dots">
          <span></span>
          <span></span>
          <span></span>
        </div>
        <p className="loading-text">Loading...</p>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="current-weather" style={{ backgroundImage: `url(${bg})` }}>
      <div className="current-content-wrapper">
        <div className="location-info">
          <div className="city-country-wrapper">
            <span className="city">{data.city}</span>
            <span className="comma">, </span>
            <span className="country">{data.country}</span>
          </div>
          <p className="full-date">
            {new Date().toLocaleDateString("en-US", {
              weekday: 'long',
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            })}
          </p>
        </div>
        <div className="weather-main-display">
          <img src={data.current.icon} alt="icon" className="weather-icon" />
          <span className="temp">{Math.round(data.current.temp)}°</span>
        </div>
      </div>
    </div>
  );
};

export default CurrentWeather;