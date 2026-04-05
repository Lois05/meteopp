import React, { useState, useEffect, useRef } from "react";
import "../styles/sidebar.css";
import dropdownIcon from "../assets/images/icon-dropdown.svg";

const SideBar = ({ days, selectedIndex, setSelectedIndex, loading }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const sideRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (sideRef.current && !sideRef.current.contains(e.target)) setShowDropdown(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (loading || !days || days.length === 0 || !days[selectedIndex]) {
    return (
      <div className="side-bar skeleton-state">
        <div className="top"><div className="text">Hourly forecast</div></div>
        <div className="all-cards">
          {[...Array(8)].map((_, i) => <div key={i} className="hour-card skeleton-card"></div>)}
        </div>
      </div>
    );
  }

  const currentDay = days[selectedIndex];

  // --- FILTRAGE : Uniquement de 3 PM à 10 PM ---
  const hoursToShow = (currentDay.hourly || []).filter((hour) => {
    // On extrait le chiffre (ex: "3" de "3 PM") et le suffixe ("PM")
    const match = hour.time.match(/(\d+)\s*(AM|PM)/i);
    if (!match) return false;

    const val = parseInt(match[1]);
    const isPM = match[2].toUpperCase() === "PM";

    // Logique : Doit être PM ET entre 3 et 10 (on exclut 12 PM qui est midi)
    if (isPM) {
      if (val === 12) return false; // Exclure midi
      return val >= 3 && val <= 10;
    }
    return false;
  });

  return (
    <div className="side-bar" ref={sideRef}>
      <div className="top">
        <div className="text">Hourly forecast</div>
        <div className="dropdown">
          <div className="dropdown-btn" onClick={() => setShowDropdown(!showDropdown)}>
            {currentDay.shortDay} <img src={dropdownIcon} className="icon" alt="" />
          </div>
          {showDropdown && (
            <div className="dropdown-menu">
              {days.map((day, i) => (
                <div key={i} className={`item ${i === selectedIndex ? "active" : ""}`} 
                     onClick={() => { setSelectedIndex(i); setShowDropdown(false); }}>
                  {day.dayName}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="all-cards">
        {hoursToShow.length > 0 ? (
          hoursToShow.map((hour, i) => (
            <div className="hour-card" key={i}>
              <div className="left-info">
                <img src={hour.icon} className="weather-icon" alt="" />
                <div className="time">{hour.time}</div>
              </div>
              <div className="temperature">
                {Math.round(hour.temp)}°
              </div>
            </div>
          ))
        ) : (
          <p style={{textAlign: 'center', opacity: 0.5, marginTop: '20px'}}>No data for this range</p>
        )}
      </div>
    </div>
  );
};

export default SideBar;