import React from 'react';

/**
 * 2D Fantasy Pixel Art Asset Library
 * High-definition procedural pixel-art SVG sprites with crisp nearest-neighbor styling.
 * Designed with a Gothic Hearth palette: earthy greens, obsidian stone, sunforge gold, and twilight amethyst.
 */

// Common pixel-art SVG container wrapper
const PixelSvg = ({ width = 32, height = 32, viewBox = '0 0 32 32', className = '', children, ...props }) => (
  <svg
    width={width}
    height={height}
    viewBox={viewBox}
    className={`select-none ${className}`}
    style={{ shapeRendering: 'crispEdges', imageRendering: 'pixelated' }}
    {...props}
  >
    {children}
  </svg>
);

/* =========================================================================
   TERRAIN TILES & SOIL PLOTS
   ========================================================================= */

export const PixelPlotSoil = ({ isWatered = false, isHovered = false, isSelected = false, className = '' }) => (
  <PixelSvg width="100%" height="100%" viewBox="0 0 64 64" className={className}>
    {/* Base Soil Bed */}
    <rect x="2" y="2" width="60" height="60" fill={isWatered ? '#261b11' : '#3d2b1a'} rx="4" />
    <rect x="4" y="4" width="56" height="56" fill={isWatered ? '#1c130c' : '#332314'} />

    {/* Raised Furrow Ridges */}
    <rect x="6" y="8" width="52" height="6" fill={isWatered ? '#3a2717' : '#4d3721'} />
    <rect x="8" y="10" width="48" height="2" fill={isWatered ? '#523820' : '#61462a'} />

    <rect x="6" y="20" width="52" height="6" fill={isWatered ? '#3a2717' : '#4d3721'} />
    <rect x="8" y="22" width="48" height="2" fill={isWatered ? '#523820' : '#61462a'} />

    <rect x="6" y="32" width="52" height="6" fill={isWatered ? '#3a2717' : '#4d3721'} />
    <rect x="8" y="34" width="48" height="2" fill={isWatered ? '#523820' : '#61462a'} />

    <rect x="6" y="44" width="52" height="6" fill={isWatered ? '#3a2717' : '#4d3721'} />
    <rect x="8" y="46" width="48" height="2" fill={isWatered ? '#523820' : '#61462a'} />

    {/* Soil Crumb Texture */}
    <rect x="10" y="16" width="3" height="2" fill={isWatered ? '#140e08' : '#23180d'} />
    <rect x="28" y="17" width="2" height="2" fill={isWatered ? '#140e08' : '#23180d'} />
    <rect x="44" y="15" width="3" height="3" fill={isWatered ? '#140e08' : '#23180d'} />
    <rect x="18" y="28" width="2" height="2" fill={isWatered ? '#140e08' : '#23180d'} />
    <rect x="38" y="29" width="3" height="2" fill={isWatered ? '#140e08' : '#23180d'} />
    <rect x="14" y="40" width="3" height="2" fill={isWatered ? '#140e08' : '#23180d'} />
    <rect x="34" y="41" width="2" height="2" fill={isWatered ? '#140e08' : '#23180d'} />
    <rect x="50" y="39" width="3" height="3" fill={isWatered ? '#140e08' : '#23180d'} />

    {/* Stone Border Inset */}
    <rect x="1" y="1" width="62" height="2" fill="#5c4d3c" />
    <rect x="1" y="61" width="62" height="2" fill="#241e17" />
    <rect x="1" y="1" width="2" height="62" fill="#4d3f31" />
    <rect x="61" y="1" width="2" height="62" fill="#241e17" />

    {/* Selection / Hover Indicator */}
    {isSelected && (
      <rect x="0" y="0" width="64" height="64" fill="none" stroke="#e5b25d" strokeWidth="2" strokeDasharray="4 2" />
    )}
    {isHovered && !isSelected && (
      <rect x="0" y="0" width="64" height="64" fill="none" stroke="#2eb872" strokeWidth="1.5" opacity="0.8" />
    )}
  </PixelSvg>
);

/* =========================================================================
   CROPS & GROWTH STAGES
   Stage 1: Sprout (tiny green shoots)
   Stage 2: Seedling (young leafy stalk)
   Stage 3: Growing (developing plant body)
   Stage 4: Mature (fully ripe harvestable crop with aura)
   ========================================================================= */

export const PixelCropSprite = ({ cropId = 'wheat', stage = 4, isReady = false, className = '' }) => {
  if (stage <= 0) return null;

  // Stage 1: Sprout
  if (stage === 1) {
    return (
      <PixelSvg width="100%" height="100%" viewBox="0 0 32 32" className={className}>
        <rect x="15" y="22" width="2" height="6" fill="#2b5e26" />
        <rect x="13" y="18" width="3" height="4" fill="#4ea832" />
        <rect x="16" y="17" width="4" height="4" fill="#69c742" />
        <rect x="14" y="16" width="3" height="2" fill="#88e05c" />
      </PixelSvg>
    );
  }

  // Stage 2: Seedling
  if (stage === 2) {
    return (
      <PixelSvg width="100%" height="100%" viewBox="0 0 32 32" className={className}>
        <rect x="15" y="18" width="2" height="10" fill="#2b5e26" />
        <rect x="11" y="14" width="4" height="4" fill="#4ea832" />
        <rect x="17" y="13" width="5" height="5" fill="#69c742" />
        <rect x="12" y="12" width="3" height="2" fill="#88e05c" />
        <rect x="18" y="11" width="3" height="2" fill="#88e05c" />
      </PixelSvg>
    );
  }

  // Stage 3: Growing Plant
  if (stage === 3) {
    return (
      <PixelSvg width="100%" height="100%" viewBox="0 0 32 32" className={className}>
        <rect x="14" y="14" width="4" height="14" fill="#24541e" />
        <rect x="8" y="12" width="6" height="6" fill="#3c8a27" />
        <rect x="18" y="10" width="7" height="7" fill="#5cb33b" />
        <rect x="12" y="8" width="8" height="7" fill="#75d14f" />
        <rect x="13" y="6" width="6" height="3" fill="#91e86a" />
      </PixelSvg>
    );
  }

  // Stage 4: Mature Harvestable Crop
  const renderMatureCrop = () => {
    switch (cropId) {
      case 'turnip':
        return (
          <>
            {/* Leaves */}
            <path d="M12 12 Q8 4 10 2 Q14 6 15 11 Z" fill="#4ea832" />
            <path d="M16 12 Q16 1 18 1 Q19 5 18 11 Z" fill="#69c742" />
            <path d="M18 12 Q24 3 22 2 Q19 6 17 11 Z" fill="#3c8a27" />
            {/* Plump Purple & White Root Bulb */}
            <circle cx="16" cy="19" r="8" fill="#4a154b" />
            <circle cx="16" cy="21" r="6" fill="#7a2a7c" />
            <path d="M11 21 Q16 26 21 21 Q19 26 16 27 Q13 26 11 21 Z" fill="#f2efe9" />
            {/* Root Tip */}
            <line x1="16" y1="27" x2="16" y2="30" stroke="#d5cebd" strokeWidth="1.5" />
          </>
        );

      case 'wheat':
        return (
          <>
            {/* Golden Stalks */}
            <line x1="12" y1="28" x2="10" y2="10" stroke="#7a5813" strokeWidth="2" />
            <line x1="16" y1="28" x2="16" y2="6" stroke="#996e19" strokeWidth="2" />
            <line x1="20" y1="28" x2="22" y2="9" stroke="#7a5813" strokeWidth="2" />
            {/* Heavy Golden Grains */}
            <rect x="14" y="5" width="4" height="12" fill="#d49b28" rx="2" />
            <rect x="8" y="9" width="4" height="10" fill="#e5b25d" rx="2" />
            <rect x="20" y="8" width="4" height="10" fill="#e5b25d" rx="2" />
            {/* Wheat Whiskers / Awns */}
            <line x1="16" y1="5" x2="16" y2="1" stroke="#f5d376" strokeWidth="1" />
            <line x1="14" y1="6" x2="12" y2="2" stroke="#f5d376" strokeWidth="1" />
            <line x1="18" y1="6" x2="20" y2="2" stroke="#f5d376" strokeWidth="1" />
          </>
        );

      case 'herb':
        return (
          <>
            {/* Aromatic Mint & Star Herb Leaves */}
            <rect x="15" y="16" width="2" height="12" fill="#1b4515" />
            <ellipse cx="11" cy="15" rx="5" ry="3" fill="#2d6e24" transform="rotate(-25 11 15)" />
            <ellipse cx="21" cy="15" rx="5" ry="3" fill="#398c2e" transform="rotate(25 21 15)" />
            <ellipse cx="10" cy="10" rx="6" ry="4" fill="#47ab39" transform="rotate(-35 10 10)" />
            <ellipse cx="22" cy="10" rx="6" ry="4" fill="#58cb47" transform="rotate(35 22 10)" />
            {/* Celestial Blossom Bud */}
            <circle cx="16" cy="6" r="3" fill="#6ee7b7" />
            <circle cx="16" cy="6" r="1.5" fill="#a7f3d0" />
          </>
        );

      case 'moonberry':
        return (
          <>
            {/* Thorned Bramble Stem */}
            <path d="M12 28 Q16 18 14 10 Q16 6 18 8 Q20 14 18 28" fill="none" stroke="#2d1b38" strokeWidth="2.5" />
            {/* Deep Violet Leaves */}
            <ellipse cx="10" cy="16" rx="4" ry="2" fill="#4c2c5e" transform="rotate(-30 10 16)" />
            <ellipse cx="22" cy="15" rx="4" ry="2" fill="#4c2c5e" transform="rotate(30 22 15)" />
            {/* Glowing Moonberry Cluster */}
            <circle cx="13" cy="11" r="3.5" fill="#8b5cf6" />
            <circle cx="19" cy="10" r="3.5" fill="#a855f7" />
            <circle cx="16" cy="14" r="4" fill="#c084fc" />
            {/* Luminescent Core */}
            <circle cx="16" cy="13" r="1.5" fill="#f3e8ff" />
          </>
        );

      case 'sunroot':
      default:
        return (
          <>
            {/* Sun-Crown Foliage */}
            <path d="M16 14 Q10 4 11 2 Q14 8 16 13 Q18 8 21 2 Q22 4 16 14 Z" fill="#15803d" />
            <path d="M16 14 Q6 8 8 6 Q12 11 16 13 Q20 11 24 6 Q26 8 16 14 Z" fill="#16a34a" />
            {/* Flaming Crimson / Gold Root Body */}
            <polygon points="16,13 10,18 12,27 16,30 20,27 22,18" fill="#b91c1c" />
            <polygon points="16,15 12,19 13,25 16,28 19,25 20,19" fill="#dc2626" />
            <polygon points="16,17 14,20 14,24 16,26 18,24 18,20" fill="#f59e0b" />
          </>
        );
    }
  };

  return (
    <PixelSvg width="100%" height="100%" viewBox="0 0 32 32" className={className}>
      {/* Ready Glow Aura */}
      {isReady && (
        <circle
          cx="16"
          cy="16"
          r="14"
          fill="none"
          stroke="#fde047"
          strokeWidth="1.5"
          strokeDasharray="2 2"
          opacity="0.85"
          className="animate-pulse"
        />
      )}
      {renderMatureCrop()}
    </PixelSvg>
  );
};

/* =========================================================================
   MINE ORE DEPOSITS & DAMAGE STAGES
   Pristine (100-70%) -> Fractured (70-35%) -> Deeply Cracked (35-1%) -> Depleted (Rubble)
   ========================================================================= */

const orePalette = {
  copper: { primary: '#b86638', secondary: '#d97d4a', highlight: '#f5a273', dark: '#5e2e14' },
  iron: { primary: '#71717a', secondary: '#a1a1aa', highlight: '#e4e4e7', dark: '#3f3f46' },
  bronze: { primary: '#a16207', secondary: '#ca8a04', highlight: '#facc15', dark: '#713f12' },
  silver: { primary: '#94a3b8', secondary: '#cbd5e1', highlight: '#f8fafc', dark: '#475569' },
  gold: { primary: '#d97706', secondary: '#f59e0b', highlight: '#fde68a', dark: '#78350f' },
  amethyst: { primary: '#7e22ce', secondary: '#a855f7', highlight: '#e9d5ff', dark: '#3b0764' },
  'mystery-geode': { primary: '#9333ea', secondary: '#c084fc', highlight: '#f3e8ff', dark: '#581c87' },
  voidsteel: { primary: '#1e1b4b', secondary: '#3730a3', highlight: '#818cf8', dark: '#0f172a' },
  starforge: { primary: '#0369a1', secondary: '#38bdf8', highlight: '#bae6fd', dark: '#0c4a6e' },
};

export const PixelOreNodeSprite = ({
  oreId = 'iron',
  durabilityPct = 100,
  isDepleted = false,
  isHovered = false,
  className = '',
}) => {
  const palette = orePalette[oreId] || orePalette.iron;

  // Depleted Rubble State
  if (isDepleted || durabilityPct <= 0) {
    return (
      <PixelSvg width="100%" height="100%" viewBox="0 0 48 48" className={className}>
        {/* Rubble pile */}
        <polygon points="12,38 20,32 32,32 38,36 34,42 16,42" fill="#262626" />
        <polygon points="16,38 22,34 28,34 30,37 26,40 18,40" fill="#404040" />
        {/* Stone Chunks */}
        <rect x="14" y="36" width="4" height="3" fill="#525252" />
        <rect x="22" y="35" width="5" height="4" fill="#525252" />
        <rect x="30" y="37" width="4" height="3" fill="#525252" />
        {/* Mineral Flakes Left in Rubble */}
        <rect x="18" y="37" width="2" height="2" fill={palette.highlight} opacity="0.6" />
        <rect x="26" y="36" width="2" height="2" fill={palette.secondary} opacity="0.6" />
      </PixelSvg>
    );
  }

  // Active Mineral Boulder
  return (
    <PixelSvg width="100%" height="100%" viewBox="0 0 48 48" className={className}>
      {/* Surrounding Shadow */}
      <ellipse cx="24" cy="40" rx="18" ry="6" fill="#000000" opacity="0.45" />

      {/* Base Rock Formation */}
      <polygon
        points="10,38 6,24 12,12 24,8 36,10 42,22 40,36 28,42 16,42"
        fill="#262626"
        stroke={isHovered ? palette.highlight : '#171717'}
        strokeWidth="1.5"
      />
      <polygon points="12,36 8,24 14,14 24,10 34,12 38,22 36,34 26,40 18,40" fill="#383838" />

      {/* Crystal / Ore Facets */}
      <polygon points="16,28 14,18 20,14 26,18 24,28 18,30" fill={palette.dark} />
      <polygon points="18,26 16,19 21,15 25,19 23,26 19,27" fill={palette.primary} />
      <polygon points="19,24 17,20 20,16 23,20 21,24" fill={palette.secondary} />
      <polygon points="20,20 18,18 20,16 22,18" fill={palette.highlight} />

      {/* Secondary Mineral Cluster */}
      <polygon points="26,34 28,26 34,24 36,30 32,36" fill={palette.dark} />
      <polygon points="28,32 29,27 33,26 34,30 31,34" fill={palette.primary} />
      <polygon points="29,30 30,28 32,27 33,29" fill={palette.highlight} />

      {/* Third Vein Node */}
      <polygon points="10,26 12,20 16,22 14,28" fill={palette.primary} />
      <polygon points="11,24 12,21 14,22 13,26" fill={palette.secondary} />

      {/* Damage Cracks Overlay */}
      {durabilityPct <= 70 && (
        <path
          d="M20 12 L22 18 L19 24 M22 18 L27 20"
          stroke="#0a0a0a"
          strokeWidth="1.5"
          fill="none"
        />
      )}
      {durabilityPct <= 35 && (
        <path
          d="M28 10 L30 16 L34 22 M30 16 L25 18 L24 28 M14 26 L18 32"
          stroke="#000000"
          strokeWidth="2"
          fill="none"
        />
      )}
    </PixelSvg>
  );
};

/* =========================================================================
   LIVESTOCK SPRITES
   Chickens, Cows, Sheep, Pigs with pixel detail
   ========================================================================= */

export const PixelAnimalSprite = ({ type = 'chicken', className = '' }) => {
  switch (type) {
    case 'cow':
      return (
        <PixelSvg width="100%" height="100%" viewBox="0 0 40 32" className={className}>
          {/* Shadow */}
          <ellipse cx="20" cy="28" rx="14" ry="3" fill="#000" opacity="0.3" />
          {/* Legs */}
          <rect x="10" y="22" width="3" height="7" fill="#1c1917" />
          <rect x="16" y="22" width="3" height="7" fill="#1c1917" />
          <rect x="25" y="22" width="3" height="7" fill="#1c1917" />
          <rect x="30" y="22" width="3" height="7" fill="#1c1917" />
          {/* Body */}
          <rect x="8" y="10" width="26" height="13" fill="#f5f5f4" rx="2" />
          {/* Black Patches */}
          <rect x="14" y="11" width="7" height="6" fill="#1c1917" />
          <rect x="25" y="13" width="6" height="7" fill="#1c1917" />
          <rect x="10" y="15" width="4" height="5" fill="#1c1917" />
          {/* Head & Horns */}
          <rect x="4" y="6" width="9" height="10" fill="#f5f5f4" rx="1" />
          <rect x="5" y="11" width="7" height="5" fill="#fbcfe8" rx="1" /> {/* Muzzle */}
          <circle cx="7" cy="8" r="1" fill="#000" /> {/* Eye */}
          <rect x="5" y="4" width="2" height="3" fill="#d6d3d1" /> {/* Horn */}
          <rect x="10" y="4" width="2" height="3" fill="#d6d3d1" />
          {/* Tail */}
          <path d="M34 14 Q37 18 36 22" stroke="#1c1917" strokeWidth="1.5" fill="none" />
        </PixelSvg>
      );

    case 'sheep':
      return (
        <PixelSvg width="100%" height="100%" viewBox="0 0 36 32" className={className}>
          <ellipse cx="18" cy="28" rx="12" ry="3" fill="#000" opacity="0.3" />
          {/* Legs */}
          <rect x="9" y="22" width="2.5" height="7" fill="#292524" />
          <rect x="14" y="22" width="2.5" height="7" fill="#292524" />
          <rect x="21" y="22" width="2.5" height="7" fill="#292524" />
          <rect x="26" y="22" width="2.5" height="7" fill="#292524" />
          {/* Fluffy Wool Body */}
          <rect x="8" y="10" width="22" height="13" fill="#f8fafc" rx="4" />
          <circle cx="12" cy="11" r="4" fill="#f8fafc" />
          <circle cx="18" cy="9" r="4" fill="#f8fafc" />
          <circle cx="25" cy="10" r="4" fill="#f8fafc" />
          <circle cx="28" cy="15" r="4" fill="#f8fafc" />
          {/* Black Head & Ears */}
          <ellipse cx="6" cy="13" rx="4" ry="5" fill="#1c1917" />
          <ellipse cx="7" cy="9" rx="1.5" ry="3" fill="#292524" transform="rotate(-30 7 9)" />
          <circle cx="5" cy="12" r="0.75" fill="#fff" />
        </PixelSvg>
      );

    case 'pig':
      return (
        <PixelSvg width="100%" height="100%" viewBox="0 0 36 32" className={className}>
          <ellipse cx="18" cy="27" rx="12" ry="3" fill="#000" opacity="0.3" />
          {/* Legs */}
          <rect x="9" y="22" width="3" height="6" fill="#db2777" />
          <rect x="14" y="22" width="3" height="6" fill="#db2777" />
          <rect x="21" y="22" width="3" height="6" fill="#db2777" />
          <rect x="26" y="22" width="3" height="6" fill="#db2777" />
          {/* Body */}
          <rect x="7" y="11" width="23" height="12" fill="#f472b6" rx="3" />
          {/* Mud Splatter */}
          <circle cx="18" cy="18" r="2.5" fill="#78350f" opacity="0.6" />
          {/* Head & Snout */}
          <rect x="4" y="10" width="7" height="8" fill="#f472b6" rx="1" />
          <rect x="2" y="13" width="4" height="4" fill="#f9a8d4" rx="1" />
          <circle cx="6" cy="12" r="1" fill="#000" />
          {/* Curly Tail */}
          <path d="M30 15 Q34 13 33 17 Q31 19 34 21" stroke="#f472b6" strokeWidth="1.5" fill="none" />
        </PixelSvg>
      );

    case 'goat':
      return (
        <PixelSvg width="100%" height="100%" viewBox="0 0 36 32" className={className}>
          <ellipse cx="18" cy="27" rx="12" ry="3" fill="#000" opacity="0.3" />
          {/* Slender Hooves */}
          <rect x="9" y="21" width="2" height="7" fill="#78350f" />
          <rect x="13" y="21" width="2" height="7" fill="#78350f" />
          <rect x="22" y="21" width="2" height="7" fill="#78350f" />
          <rect x="26" y="21" width="2" height="7" fill="#78350f" />
          {/* Tan/Brown Body */}
          <rect x="8" y="10" width="22" height="12" fill="#d97706" rx="2" />
          <rect x="12" y="12" width="12" height="8" fill="#b45309" />
          {/* Goat Head, Curved Horns & Beard */}
          <polygon points="6,9 12,9 10,18 5,16" fill="#d97706" />
          <path d="M8 8 Q5 2 2 3" stroke="#fef08a" strokeWidth="1.5" fill="none" />
          <path d="M11 8 Q9 2 6 3" stroke="#fef08a" strokeWidth="1.5" fill="none" />
          <polygon points="5,16 4,21 7,17" fill="#fef3c7" /> {/* Beard */}
          <circle cx="7" cy="11" r="0.75" fill="#000" />
        </PixelSvg>
      );

    case 'bee':
      return (
        <PixelSvg width="100%" height="100%" viewBox="0 0 32 32" className={className}>
          <ellipse cx="16" cy="28" rx="10" ry="3" fill="#000" opacity="0.3" />
          {/* Wooden Hive Stand */}
          <rect x="14" y="22" width="4" height="6" fill="#78350f" />
          <rect x="8" y="27" width="16" height="2" fill="#451a03" />
          {/* Honeycomb Domed Hive */}
          <ellipse cx="16" cy="16" rx="11" ry="9" fill="#d97706" />
          <ellipse cx="16" cy="16" rx="9" ry="7" fill="#f59e0b" />
          <rect x="12" y="14" width="8" height="4" fill="#78350f" rx="1" /> {/* Hive Entrance */}
          {/* Golden Buzzing Bees */}
          <circle cx="9" cy="8" r="1.5" fill="#fde047" className="animate-bounce" />
          <circle cx="23" cy="10" r="1.5" fill="#fde047" className="animate-pulse" />
          <circle cx="18" cy="6" r="1.5" fill="#fde047" className="animate-bounce" />
        </PixelSvg>
      );

    case 'chicken':
    default:
      return (
        <PixelSvg width="100%" height="100%" viewBox="0 0 28 28" className={className}>
          <ellipse cx="14" cy="24" rx="8" ry="2.5" fill="#000" opacity="0.3" />
          {/* Yellow Feet */}
          <line x1="12" y1="20" x2="11" y2="25" stroke="#f59e0b" strokeWidth="1.5" />
          <line x1="16" y1="20" x2="16" y2="25" stroke="#f59e0b" strokeWidth="1.5" />
          {/* White Body */}
          <ellipse cx="14" cy="15" rx="7" ry="6" fill="#f8fafc" />
          {/* Red Comb & Wattle */}
          <polygon points="8,5 10,2 11,5 13,3 13,6" fill="#dc2626" />
          <circle cx="7" cy="11" r="1.5" fill="#dc2626" />
          {/* Head & Beak */}
          <ellipse cx="9" cy="9" rx="4" ry="4" fill="#f8fafc" />
          <polygon points="5,9 2,10 5,11" fill="#f59e0b" />
          <circle cx="8" cy="8" r="0.75" fill="#000" />
          {/* Tail Feathers */}
          <path d="M19 12 Q23 7 24 11 Q22 14 19 15" fill="#e2e8f0" />
        </PixelSvg>
      );
  }
};

/* =========================================================================
   ENVIRONMENTAL PROPS: TREE, BARN, WELL, FENCE, LANTERN
   ========================================================================= */

export const PixelTree = ({ className = '' }) => (
  <PixelSvg width="64" height="72" viewBox="0 0 64 72" className={className}>
    {/* Ground Shadow */}
    <ellipse cx="32" cy="66" rx="22" ry="6" fill="#000" opacity="0.35" />
    {/* Trunk */}
    <rect x="28" y="42" width="8" height="24" fill="#451a03" />
    <rect x="30" y="42" width="3" height="24" fill="#78350f" />
    {/* Tiered Foliage */}
    <ellipse cx="32" cy="40" rx="24" ry="14" fill="#14532d" />
    <ellipse cx="32" cy="36" rx="22" ry="13" fill="#166534" />
    <ellipse cx="32" cy="28" rx="20" ry="12" fill="#15803d" />
    <ellipse cx="32" cy="20" rx="16" ry="10" fill="#22c55e" />
    <ellipse cx="30" cy="16" rx="10" ry="6" fill="#4ade80" />
  </PixelSvg>
);

export const PixelBarn = ({ className = '' }) => (
  <PixelSvg width="80" height="64" viewBox="0 0 80 64" className={className}>
    <ellipse cx="40" cy="60" rx="36" ry="4" fill="#000" opacity="0.35" />
    {/* Base Timber Walls */}
    <rect x="12" y="24" width="56" height="36" fill="#7f1d1d" rx="2" />
    <rect x="14" y="26" width="52" height="32" fill="#991b1b" />
    {/* Slanted Roof */}
    <polygon points="40,4 6,26 74,26" fill="#3f3f46" />
    <polygon points="40,7 10,24 70,24" fill="#52525b" />
    {/* Wooden Cross Doors */}
    <rect x="30" y="38" width="20" height="20" fill="#27272a" />
    <rect x="32" y="40" width="7.5" height="17" fill="#451a03" />
    <rect x="40.5" y="40" width="7.5" height="17" fill="#451a03" />
    {/* Loft Window */}
    <polygon points="40,14 34,21 46,21" fill="#fde047" opacity="0.8" />
  </PixelSvg>
);

export const PixelWell = ({ className = '' }) => (
  <PixelSvg width="40" height="48" viewBox="0 0 40 48" className={className}>
    <ellipse cx="20" cy="44" rx="14" ry="3" fill="#000" opacity="0.35" />
    {/* Stone Base */}
    <rect x="8" y="26" width="24" height="18" fill="#52525b" rx="2" />
    <rect x="10" y="28" width="20" height="14" fill="#3f3f46" />
    {/* Posts & Roof */}
    <rect x="10" y="14" width="3" height="14" fill="#78350f" />
    <rect x="27" y="14" width="3" height="14" fill="#78350f" />
    <polygon points="20,4 6,15 34,15" fill="#854d0e" />
    {/* Water Glimmer */}
    <ellipse cx="20" cy="30" rx="7" ry="2" fill="#38bdf8" />
  </PixelSvg>
);

export const PixelLantern = ({ isFlickering = true, className = '' }) => (
  <PixelSvg width="24" height="36" viewBox="0 0 24 36" className={className}>
    {/* Pole */}
    <rect x="11" y="12" width="2" height="24" fill="#1c1917" />
    {/* Lantern Cage */}
    <rect x="7" y="6" width="10" height="11" fill="#292524" rx="1" />
    {/* Glass Core */}
    <rect x="8" y="8" width="8" height="7" fill="#fbbf24" opacity="0.9" />
    {/* Light Flame */}
    <circle cx="12" cy="11.5" r="2.5" fill="#fef08a" className={isFlickering ? 'animate-pulse' : ''} />
  </PixelSvg>
);

/* =========================================================================
   CITADEL PLAZA BUILDINGS & DISTRICT HUBS
   Sunforge Beacon, Farm Gate, Mine Headframe, Smithy, Colosseum, Market, Manor
   ========================================================================= */

export const PixelCitadelMonument = ({ className = '' }) => (
  <PixelSvg width="80" height="96" viewBox="0 0 80 96" className={className}>
    {/* Ground Shadow */}
    <ellipse cx="40" cy="90" rx="36" ry="6" fill="#000" opacity="0.45" />
    {/* Tiered Marble Steps */}
    <rect x="10" y="80" width="60" height="8" fill="#3f3f46" rx="2" />
    <rect x="16" y="74" width="48" height="6" fill="#52525b" rx="1" />
    <rect x="22" y="68" width="36" height="6" fill="#71717a" rx="1" />
    {/* Golden Obelisk Base & Pillars */}
    <rect x="28" y="32" width="24" height="36" fill="#854d0e" />
    <rect x="32" y="30" width="16" height="38" fill="#ca8a04" />
    <rect x="36" y="28" width="8" height="40" fill="#facc15" />
    {/* Sunforge Crystal Core */}
    <polygon points="40,8 30,28 50,28" fill="#eab308" />
    <polygon points="40,12 34,26 46,26" fill="#fef08a" />
    {/* Pulsing Sun Rays */}
    <line x1="40" y1="2" x2="40" y2="7" stroke="#fef08a" strokeWidth="2" className="animate-pulse" />
    <line x1="28" y1="12" x2="24" y2="9" stroke="#fde047" strokeWidth="2" className="animate-pulse" />
    <line x1="52" y1="12" x2="56" y2="9" stroke="#fde047" strokeWidth="2" className="animate-pulse" />
  </PixelSvg>
);

export const PixelDistrictBuilding = ({ type = 'farm', className = '' }) => {
  switch (type) {
    case 'mining':
      return (
        <PixelSvg width="64" height="64" viewBox="0 0 64 64" className={className}>
          <ellipse cx="32" cy="58" rx="28" ry="4" fill="#000" opacity="0.4" />
          {/* Cave Arch */}
          <polygon points="32,4 6,36 10,60 54,60 58,36" fill="#18181b" />
          <polygon points="32,8 12,38 16,56 48,56 52,38" fill="#27272a" />
          {/* Timber Support Frame */}
          <rect x="16" y="24" width="4" height="34" fill="#78350f" />
          <rect x="44" y="24" width="4" height="34" fill="#78350f" />
          <rect x="14" y="20" width="36" height="6" fill="#92400e" />
          {/* Ore Cart with Gold & Iron */}
          <rect x="24" y="44" width="16" height="10" fill="#3f3f46" rx="1" />
          <circle cx="28" cy="56" r="2.5" fill="#71717a" />
          <circle cx="36" cy="56" r="2.5" fill="#71717a" />
          <circle cx="28" cy="42" r="2" fill="#eab308" />
          <circle cx="33" cy="41" r="2.5" fill="#f59e0b" />
          <circle cx="37" cy="42" r="2" fill="#a1a1aa" />
        </PixelSvg>
      );

    case 'workshop':
      return (
        <PixelSvg width="64" height="64" viewBox="0 0 64 64" className={className}>
          <ellipse cx="32" cy="58" rx="28" ry="4" fill="#000" opacity="0.4" />
          {/* Forge House */}
          <rect x="10" y="22" width="44" height="36" fill="#451a03" rx="2" />
          <polygon points="32,6 4,24 60,24" fill="#7f1d1d" />
          {/* Chimney with Smoke */}
          <rect x="42" y="8" width="8" height="14" fill="#27272a" />
          <circle cx="46" cy="4" r="2.5" fill="#71717a" opacity="0.6" className="animate-ping" />
          {/* Anvil & Hearth Door */}
          <rect x="22" y="36" width="20" height="22" fill="#18181b" />
          <rect x="26" y="42" width="12" height="14" fill="#ea580c" />
          <circle cx="32" cy="48" r="3" fill="#fef08a" className="animate-pulse" />
        </PixelSvg>
      );

    case 'arena':
      return (
        <PixelSvg width="64" height="64" viewBox="0 0 64 64" className={className}>
          <ellipse cx="32" cy="58" rx="28" ry="4" fill="#000" opacity="0.4" />
          {/* Colosseum Wall Tier */}
          <rect x="8" y="24" width="48" height="34" fill="#71717a" rx="3" />
          <polygon points="32,8 6,24 58,24" fill="#a1a1aa" />
          {/* Colonnade Arches */}
          <rect x="14" y="36" width="8" height="18" fill="#18181b" rx="2" />
          <rect x="28" y="32" width="8" height="22" fill="#18181b" rx="2" />
          <rect x="42" y="36" width="8" height="18" fill="#18181b" rx="2" />
          {/* Crossed Swords Sigil */}
          <line x1="26" y1="16" x2="38" y2="28" stroke="#facc15" strokeWidth="2" />
          <line x1="38" y1="16" x2="26" y2="28" stroke="#facc15" strokeWidth="2" />
        </PixelSvg>
      );

    case 'market':
      return (
        <PixelSvg width="64" height="64" viewBox="0 0 64 64" className={className}>
          <ellipse cx="32" cy="58" rx="28" ry="4" fill="#000" opacity="0.4" />
          {/* Striped Canopy Awning */}
          <polygon points="6,24 16,12 48,12 58,24" fill="#dc2626" />
          <polygon points="12,24 20,12 28,12 20,24" fill="#fef08a" />
          <polygon points="36,24 44,12 52,12 44,24" fill="#fef08a" />
          {/* Wooden Counter */}
          <rect x="10" y="34" width="44" height="24" fill="#78350f" rx="1" />
          <rect x="14" y="24" width="4" height="12" fill="#451a03" />
          <rect x="46" y="24" width="4" height="12" fill="#451a03" />
          {/* Display Crates with Fruit & Scales */}
          <rect x="16" y="38" width="12" height="10" fill="#92400e" />
          <circle cx="20" cy="36" r="2" fill="#ef4444" />
          <circle cx="24" cy="35" r="2.5" fill="#f97316" />
          <rect x="34" y="38" width="14" height="8" fill="#eab308" />
        </PixelSvg>
      );

    case 'housing':
      return (
        <PixelSvg width="64" height="64" viewBox="0 0 64 64" className={className}>
          <ellipse cx="32" cy="58" rx="28" ry="4" fill="#000" opacity="0.4" />
          {/* Manor Stone Walls */}
          <rect x="12" y="24" width="40" height="34" fill="#3f3f46" rx="2" />
          <polygon points="32,6 8,24 56,24" fill="#1e293b" />
          {/* Timber Framing */}
          <rect x="16" y="24" width="3" height="32" fill="#78350f" />
          <rect x="45" y="24" width="3" height="32" fill="#78350f" />
          {/* Arched Door & Warm Window */}
          <rect x="26" y="38" width="12" height="18" fill="#451a03" rx="3" />
          <rect x="18" y="28" width="6" height="6" fill="#fef08a" opacity="0.9" />
          <rect x="40" y="28" width="6" height="6" fill="#fef08a" opacity="0.9" />
        </PixelSvg>
      );

    case 'adventure':
      return (
        <PixelSvg width="64" height="64" viewBox="0 0 64 64" className={className}>
          <ellipse cx="32" cy="58" rx="28" ry="4" fill="#000" opacity="0.4" />
          {/* Ancient Dolmen Gate */}
          <rect x="14" y="18" width="8" height="40" fill="#52525b" rx="1" />
          <rect x="42" y="18" width="8" height="40" fill="#52525b" rx="1" />
          <rect x="10" y="12" width="44" height="10" fill="#71717a" rx="2" />
          {/* Ivy Vines */}
          <path d="M14 18 Q18 28 16 40" stroke="#22c55e" strokeWidth="2" fill="none" />
          <path d="M46 16 Q42 26 44 38" stroke="#16a34a" strokeWidth="2" fill="none" />
          {/* Compass Rose Star Portal */}
          <circle cx="32" cy="38" r="8" fill="#0284c7" opacity="0.75" className="animate-pulse" />
          <polygon points="32,24 35,35 46,38 35,41 32,52 29,41 18,38 29,35" fill="#38bdf8" />
        </PixelSvg>
      );

    case 'guild':
      return (
        <PixelSvg width="64" height="64" viewBox="0 0 64 64" className={className}>
          <ellipse cx="32" cy="58" rx="28" ry="4" fill="#000" opacity="0.4" />
          {/* Guild Hall Facade */}
          <rect x="10" y="20" width="44" height="38" fill="#475569" rx="2" />
          <polygon points="32,4 4,20 60,20" fill="#334155" />
          {/* Lion Crest Shield */}
          <polygon points="32,16 26,22 26,30 32,36 38,30 38,22" fill="#ca8a04" />
          <polygon points="32,18 28,23 28,29 32,34 36,29 36,23" fill="#eab308" />
          {/* Grand Double Doors */}
          <rect x="24" y="38" width="16" height="20" fill="#1e293b" rx="1" />
          <line x1="32" y1="38" x2="32" y2="58" stroke="#64748b" strokeWidth="1" />
        </PixelSvg>
      );

    case 'farm':
    default:
      return (
        <PixelSvg width="64" height="64" viewBox="0 0 64 64" className={className}>
          <ellipse cx="32" cy="58" rx="28" ry="4" fill="#000" opacity="0.4" />
          {/* Barn Silhouette & Silo */}
          <rect x="8" y="24" width="14" height="34" fill="#71717a" rx="2" />
          <ellipse cx="15" cy="24" rx="7" ry="4" fill="#52525b" />
          <rect x="22" y="26" width="36" height="32" fill="#991b1b" rx="2" />
          <polygon points="40,10 18,26 62,26" fill="#3f3f46" />
          {/* White Barn Cross */}
          <rect x="32" y="38" width="16" height="18" fill="#f8fafc" rx="1" />
          <line x1="32" y1="38" x2="48" y2="56" stroke="#991b1b" strokeWidth="2" />
          <line x1="48" y1="38" x2="32" y2="56" stroke="#991b1b" strokeWidth="2" />
        </PixelSvg>
      );
  }
};

export const PixelPlayerAvatar = ({ className = '' }) => (
  <PixelSvg width="36" height="48" viewBox="0 0 36 48" className={className}>
    {/* Shadow */}
    <ellipse cx="18" cy="45" rx="12" ry="3" fill="#000" opacity="0.4" />
    {/* Boots */}
    <rect x="12" y="38" width="4" height="7" fill="#451a03" />
    <rect x="20" y="38" width="4" height="7" fill="#451a03" />
    {/* Legs / Trousers */}
    <rect x="13" y="30" width="3" height="10" fill="#1e293b" />
    <rect x="20" y="30" width="3" height="10" fill="#1e293b" />
    {/* Armor Tunic / Chestplate */}
    <rect x="10" y="16" width="16" height="15" fill="#334155" rx="2" />
    <rect x="12" y="18" width="12" height="11" fill="#475569" />
    <polygon points="18,19 14,24 22,24" fill="#eab308" />
    {/* Flowing Warden Cloak */}
    <path d="M8 18 Q6 34 8 42 Q10 40 10 32" fill="#991b1b" />
    <path d="M28 18 Q30 34 28 42 Q26 40 26 32" fill="#991b1b" />
    {/* Head & Hair */}
    <ellipse cx="18" cy="11" rx="6" ry="6" fill="#fbcfe8" />
    <path d="M12 9 Q18 4 24 9 Q23 6 18 5 Q13 6 12 9" fill="#78350f" />
    <circle cx="16" cy="11" r="1" fill="#0f172a" />
    <circle cx="20" cy="11" r="1" fill="#0f172a" />
    {/* Main Hand Blade */}
    <line x1="28" y1="18" x2="33" y2="8" stroke="#cbd5e1" strokeWidth="2" />
    <line x1="26" y1="18" x2="30" y2="18" stroke="#ca8a04" strokeWidth="2" />
  </PixelSvg>
);

