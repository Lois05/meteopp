import React, { useState, useEffect, useRef } from "react";
import "../styles/searchbar.css";
import searchIcon from "../assets/images/icon-search.svg";

const SearchBar = ({ handleSearch }) => {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchRef = useRef(null);

  // Fermer les suggestions si on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setSuggestions([]);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Recherche de suggestions (Geocoding)
  useEffect(() => {
    // On utilise un timeout (debounce) pour éviter d'appeler l'API à chaque lettre tapée
    const delayDebounceFn = setTimeout(() => {
      if (query.length > 2) {
        setIsSearching(true);
        fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=5&language=en&format=json`)
          .then(res => res.json())
          .then(data => {
            setSuggestions(data.results || []);
            setIsSearching(false);
          })
          .catch(() => {
            setSuggestions([]);
            setIsSearching(false);
          });
      } else {
        setSuggestions([]);
      }
    }, 300); // Attend 300ms après la fin de la frappe

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  // Fonction pour gérer la sélection d'une ville
  const onSelectCity = (city) => {
    setQuery(city.name);      // Met à jour l'input
    setSuggestions([]);       // Vide la liste immédiatement
    handleSearch(city.name);  // Lance la recherche météo dans App.jsx
  };

  return (
    <section className="search-section">
      <h1 className="first-texte">How’s the sky looking today?</h1>
      <div className="search-bar" ref={searchRef}>
        <div className="input-wrapper">
          <img className="search-icon" src={searchIcon} alt="" />
          <input 
            className="search-input"
            type="text"
            placeholder="Search for a place..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            // Permet de valider avec la touche Entrée
            onKeyDown={(e) => e.key === "Enter" && handleSearch(query)}
          />
          
          {/* État de chargement des suggestions */}
          {isSearching && (
            <div className="suggestions-list loading-state">
              <span>Search in progress...</span>
            </div>
          )}

          {/* Liste des suggestions */}
          {!isSearching && suggestions.length > 0 && (
            <ul className="suggestions-list">
              {suggestions.map((s, i) => (
                <li key={`${s.id}-${i}`} onClick={() => onSelectCity(s)}>
                  <span className="city-name">{s.name}</span>
                  <span className="country-name">, {s.country}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <button className="search-button" onClick={() => handleSearch(query)}>
          Search
        </button>
      </div>
    </section>
  );
};

export default SearchBar;