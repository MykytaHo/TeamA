import React, { useState } from 'react';
import { MOCK_TRADERS } from '../mockdata/jobs.js';
import './SearchTraders.css'; 

function SearchTraders() {
  const [searchTerm, setSearchTerm] = useState(''); 
  const [locationTerm, setLocationTerm] = useState(''); 

  const filteredTraders = MOCK_TRADERS.filter(trader => {
    const matchCategory = trader.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchLocation = trader.location.toLowerCase().includes(locationTerm.toLowerCase()) || 
                          trader.suburb.toLowerCase().includes(locationTerm.toLowerCase());
    return matchCategory && matchLocation;
  });

  return (
    <div className="search-page">
      <div className="search-container">
        <input 
          type="text" 
          placeholder="What service do you need? (e.g. Plumber)" 
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <div className="location-input-wrapper">
          <span className="pin-icon">📍</span>
          <input 
            type="text" 
            placeholder="Location (e.g. Dublin 6)" 
            onChange={(e) => setLocationTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="results-list">
        {filteredTraders.length > 0 ? (
          filteredTraders.map(trader => (
            <div key={trader.id} className="trader-card">
              <h3>{trader.name}</h3>
              <p>Type: {trader.category}</p>
              <p className="location-tag">📍 {trader.suburb}, {trader.location}</p>
              <p>Rating: ⭐{trader.rating}</p>
            </div>
          ))
        ) : (
          <p>No traders found in this area.</p>
        )}
      </div>
    </div>
  );
}

export default SearchTraders;