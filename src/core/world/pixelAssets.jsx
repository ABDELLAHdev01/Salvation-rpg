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
