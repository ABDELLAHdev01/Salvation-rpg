import React, { useState } from 'react';
import { cities } from '../../core/data/citiesData';

export default function SelectCity({ selectedCity, onSelectCity, onContinue, onPrev }) {
  const [hoveredCity, setHoveredCity] = useState(null);

  const handleCitySelect = (cityId) => {
    onSelectCity(cityId);
  };

  // If no city selected yet, show image-focused selection
  if (!selectedCity) {
    return (
      <div className="flex flex-col items-center justify-start min-h-[520px] backdrop-blur-sm px-4 py-4 overflow-y-auto">
        <div className="w-full max-w-6xl">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-3 hero-title">
              Choose Your Origin
            </h1>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto">
              Your city defines your identity, your heritage, and your destiny.
            </p>
          </div>

          {/* City Image Cards - Full Images */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {cities.map((city) => {
              const isHovered = hoveredCity === city.id;

              return (
                <div
                  key={city.id}
                  onMouseEnter={() => setHoveredCity(city.id)}
                  onMouseLeave={() => setHoveredCity(null)}
                  onClick={() => handleCitySelect(city.id)}
                  className={`
                    relative cursor-pointer rounded-xl overflow-hidden
                    transition-all duration-300 transform
                    ring-2 ring-gray-700/50 hover:ring-yellow-500/70
                    ${isHovered ? 'scale-[1.02] shadow-2xl' : 'shadow-lg'}
                  `}
                  style={{ height: '450px' }}
                >
                  {/* Full Background Image */}
                  <div 
                    className="absolute inset-0 bg-cover bg-center"
                    style={{
                      backgroundImage: city.backgroundImage 
                        ? `url(${city.backgroundImage})` 
                        : city.fallbackGradient,
                    }}
                  />

                  {/* Subtle dark overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/30" />

                  {/* City name at bottom */}
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-center">
                    <h2 
                      className="text-3xl font-extrabold tracking-wide"
                      style={{
                        color: city.accentColor,
                        textShadow: '0 2px 15px rgba(0,0,0,0.9)',
                      }}
                    >
                      {city.displayName}
                    </h2>
                  </div>

                  {/* Hover glow */}
                  {isHovered && (
                    <div 
                      className="absolute inset-0 opacity-30 animate-pulse pointer-events-none"
                      style={{
                        background: `radial-gradient(circle at 50% 50%, ${city.primaryColor}, transparent 70%)`,
                      }}
                    />
                  )}
                </div>
              );
            })}
          </div>

          {/* Helpful hint */}
          <p className="text-center text-gray-400 text-sm animate-pulse">
            Select a city to see its details
          </p>
        </div>
      </div>
    );
  }

  // After selection, show detailed info
  const selectedCityData = cities.find(c => c.id === selectedCity);

  return (
    <div className="flex flex-col items-center justify-start min-h-[520px] backdrop-blur-sm px-4 py-4 overflow-y-auto">
      <div className="w-full max-w-6xl">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold text-white mb-3 hero-title">
            {selectedCityData.displayName}
          </h1>
          <p className="text-gray-300 text-lg italic">
            {selectedCityData.description}
          </p>
        </div>

        {/* Large City Image */}
        <div 
          className="relative rounded-xl overflow-hidden mb-6"
          style={{ height: '400px' }}
        >
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: selectedCityData.backgroundImage 
                ? `url(${selectedCityData.backgroundImage})` 
                : selectedCityData.fallbackGradient,
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30" />
        </div>

        <div className="text-center mb-6">
          {/* City Logo */}
          <div className="flex justify-center mb-4">
            <img 
              src={selectedCityData.logo} 
              alt={`${selectedCityData.name} logo`}
              className="w-40 h-40 object-contain drop-shadow-2xl"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          </div>

          {/* Theme Badge */}
          <div className="flex justify-center mb-4">
            <span 
              className="text-sm font-semibold px-4 py-2 rounded-full backdrop-blur-md border"
              style={{
                backgroundColor: `${selectedCityData.primaryColor}20`,
                borderColor: `${selectedCityData.primaryColor}60`,
                color: selectedCityData.accentColor,
              }}
            >
              {selectedCityData.theme}
            </span>
          </div>
        </div>

        {/* Lore Section */}
        <div className="bg-black/40 backdrop-blur-sm rounded-lg p-6 border border-gray-700/50 mb-6">
          <p className="text-gray-200 text-center text-lg leading-relaxed">
            "{selectedCityData.lore}"
          </p>
        </div>

        {/* Attributes Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <AttributeCard 
            label="Wealth" 
            value={selectedCityData.attributes.wealth} 
            color={selectedCityData.accentColor}
          />
          <AttributeCard 
            label="Trade" 
            value={selectedCityData.attributes.trade} 
            color={selectedCityData.accentColor}
          />
          <AttributeCard 
            label="Military" 
            value={selectedCityData.attributes.military} 
            color={selectedCityData.accentColor}
          />
          <AttributeCard 
            label="Magic" 
            value={selectedCityData.attributes.magic} 
            color={selectedCityData.accentColor}
          />
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-center space-x-4 mt-6">
          <button
            onClick={() => onSelectCity(null)}
            className="px-8 py-3 font-semibold rounded-lg action-ghost text-yellow-200 transition duration-300"
          >
            Change City
          </button>

          <button
            onClick={onContinue}
            className="px-8 py-3 font-semibold rounded-lg shadow-lg transition-all duration-300 action-primary text-white hover:shadow-yellow-500/50 hover:scale-105"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * AttributeCard - Displays a city attribute with visual indicator
 */
function AttributeCard({ label, value, color }) {
  const levels = {
    low: { dots: 1, opacity: 0.4, text: 'Low' },
    medium: { dots: 2, opacity: 0.7, text: 'Medium' },
    high: { dots: 3, opacity: 1.0, text: 'High' },
  };

  const level = levels[value] || levels.low;

  return (
    <div className="bg-gray-900/70 backdrop-blur-sm rounded-lg p-4 border border-gray-700/50 text-center">
      <div className="text-gray-400 text-sm mb-2">{label}</div>
      <div className="flex justify-center space-x-1 mb-2">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="w-2 h-2 rounded-full"
            style={{
              backgroundColor: i < level.dots ? color : '#4B5563',
              opacity: i < level.dots ? level.opacity : 0.3,
            }}
          />
        ))}
      </div>
      <div className="text-white font-semibold text-sm">{level.text}</div>
    </div>
  );
}
