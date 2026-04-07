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

  const currentDay = days ? days[selectedIndex] : null;
  
  // Sécurité : On essaie de prendre de 15h à 22h (3pm-10pm)
  let hoursToShow = currentDay 
    ? (currentDay.hourly || []).filter(h => h.rawIndex >= 15 && h.rawIndex <= 22) 
    : [];

  // Si le filtre est vide (problème d'index), on prend les 8 premières heures par défaut
  if (currentDay && hoursToShow.length === 0) {
    hoursToShow = currentDay.hourly.slice(0, 8);
  }

  return (
    <div className="side-bar" ref={sideRef}>
      <div className="top">
        <div className="text">Hourly forecast</div>
        <div className="dropdown">
          <div className="dropdown-btn" onClick={() => !loading && setShowDropdown(!showDropdown)}>
            {loading ? "--" : currentDay?.shortDay} 
            <img src={dropdownIcon} className={showDropdown ? "icon up" : "icon"} alt="" />
          </div>
          {showDropdown && !loading && (
            <div className="sidebar-dropdown-menu">
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
        {loading ? (
          /* Squelettes de chargement */
          [...Array(8)].map((_, i) => (
            <div key={i} className="hour-card skeleton-card">
              <div className="left-info">
                <div className="skeleton-circle"></div>
                <div className="time">--</div>
              </div>
              <div className="temperature">--</div>
            </div>
          ))
        ) : (
          hoursToShow.map((hour, i) => (
            <div className="hour-card" key={i}>
              <div className="left-info">
                <img src={hour.icon} className="weather-icon" alt="" />
                <div className="time">{hour.time}</div>
              </div>
              <div className="temperature">{Math.round(hour.temp)}°</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default SideBar;