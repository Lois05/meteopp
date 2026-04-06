import React from "react";
import "../styles/currentweather.css";

const CurrentWeather = ({ data, loading, bg }) => {
  if (loading || !data) {
    return (
      <div className="current-weather loading-state">
        <div className="loader-dots"><span></span><span></span><span></span></div>
      </div>
    );
  }

  const dateStr = new Date().toLocaleDateString("en-US", {
    weekday: 'long', month: 'short', day: 'numeric', year: 'numeric'
  });

  return (
    <div className="current-weather" style={{ backgroundImage: `url(${bg})` }}>
      <div className="current-content-wrapper">
        
        {/* BLOC GAUCHE (PC) / HAUT (MOBILE) */}
        <div className="location-info">
          <div className="city-country-wrapper">
            <span className="city">{data.city}</span>
            <span className="comma">,</span>
            <span className="country">{data.country}</span>
          </div>
          <p className="full-date">{dateStr}</p>
        </div>

        {/* BLOC DROITE (PC) / BAS (MOBILE) */}
        <div className="weather-main-display">
          <img src={data.current.icon} alt="weather icon" className="weather-icon" />
          <span className="temp">{Math.round(data.current.temp)}°</span>
        </div>

      </div>
    </div>
  );
};

export default CurrentWeather;