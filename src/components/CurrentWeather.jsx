import React from "react";
import "../styles/currentweather.css";

const CurrentWeather = ({ data, loading, bg }) => {
  return (
    <div 
      className={`current-weather ${loading ? "current-loading-container" : ""}`} 
      style={!loading && data ? { backgroundImage: `url(${bg})` } : {}}
    >
      {/* On utilise une seule enveloppe interne */}
      <div className="current-content-wrapper">
        {loading ? (
          <div className="centered-loader-wrapper">
            <div className="loading-dots">
              <span></span><span></span><span></span>
            </div>
            <p className="loading-text">Loading...</p>
          </div>
        ) : data ? (
          <>
            <div className="location-info">
              <div className="city-country-wrapper">
                <span className="city">{data.city}</span>
                <span className="comma">, </span>
                <span className="country">{data.country}</span>
              </div>
              <p className="full-date">
                {new Date().toLocaleDateString("en-US", {
                  weekday: 'long', month: 'short', day: 'numeric', year: 'numeric'
                })}
              </p>
            </div>
            <div className="weather-main-display">
              <img src={data.current.icon} alt="weather icon" className="weather-icon" />
              <span className="temp">{Math.round(data.current.temp)}°</span>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
};

export default CurrentWeather;