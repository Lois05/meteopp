import React from "react";
import "../styles/dailyforecast.css";

const DailyForecast = ({ days, loading, activeIndex, onSelect }) => {
  if (loading) {
    return (
      <div className="daily-forecast-container">
        <div className="daily-forecast-title">Daily Forecast</div>
        <div className="daily-forecast">
          {[...Array(7)].map((_, i) => (
            <div className="daily-forecast-card skeleton-loading" key={i}></div>
          ))}
        </div>
      </div>
    );
  }

  if (!days) return null;

  return (
    <div className="daily-forecast-container">
      <div className="daily-forecast-title">Daily Forecast</div>
      <div className="daily-forecast">
        {days.map((day, index) => (
          <div 
            className={`daily-forecast-card ${index === activeIndex ? "active" : ""}`} 
            key={index}
            onClick={() => onSelect(index)}
          >
            <div className="day">{day.shortDay}</div>
            <img className="weather-icon" src={day.icon} alt="weather" />
            <div className="temp-range">
              <span className="max">{Math.round(day.max)}°</span>
              <span className="min">{Math.round(day.min)}°</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DailyForecast;