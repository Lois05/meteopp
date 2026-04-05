import React from "react";
import "../styles/weatherdetails.css";

const WeatherDetails = ({ data, units, loading }) => {
  if (loading || !data) {
    return (
      <div className="weather-details skeleton-state">
        {[...Array(4)].map((_, i) => <div key={i} className="detail-card skeleton-card"></div>)}
      </div>
    );
  }

  return (
    <div className="weather-details">
      <div className="detail-card">
        <div className="card-title">Feels like</div>
        <div className="card-value">{Math.round(data?.feelsLike)}°</div>
      </div>
      <div className="detail-card">
        <div className="card-title">Humidity</div>
        <div className="card-value">{data?.humidity}%</div>
      </div>
      <div className="detail-card">
        <div className="card-title">Wind</div>
        <div className="card-value">{Math.round(data?.wind)} <span className="unit-text">{units.wind}</span></div>
      </div>
      <div className="detail-card">
        <div className="card-title">Precipitations</div>
        <div className="card-value">{data?.precip} <span className="unit-text">{units.precip}</span></div>
      </div>
    </div>
  );
};

export default WeatherDetails;