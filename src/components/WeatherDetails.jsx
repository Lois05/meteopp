import React from "react";
import "../styles/weatherdetails.css";

const WeatherDetails = ({ data, units, loading }) => {
  const displayValue = (value, suffix = "") => { 
    if (loading || value === undefined || value === null) return "--";
    return `${Math.round(value)}${suffix}`;
  };

  return (
    <div className="weather-details">
      <div className="detail-card">
        <div className="card-title">Feels like</div>
        <div className="card-value">{displayValue(data?.feelsLike, "°")}</div> 
      </div>
      <div className="detail-card">
        <div className="card-title">Humidity</div>
        <div className="card-value">{displayValue(data?.humidity, "%")}</div>
      </div>
      <div className="detail-card">
        <div className="card-title">Wind</div>
        <div className="card-value">
          {displayValue(data?.wind)} <span className="unit-text">{!loading && units.wind}</span>
        </div>
      </div>
      <div className="detail-card">
        <div className="card-title">Precipitations</div>
        <div className="card-value">
          {displayValue(data?.precip)} <span className="unit-text">{!loading && units.precip}</span>
        </div>
      </div>
    </div>
  );
};

export default WeatherDetails;