// channels_utils.js

// ------------------------------------------------------
// Calcular suport/resistència + marges FIAT‑NET
// ------------------------------------------------------
export function computeLevels(channel, currentTimestamp, marginPercent = 0.15) {
  const { direction, timestamp1, price1, slope, width } = channel;

  // Línia base
  const base = price1 + slope * (currentTimestamp - timestamp1);

  let support, resistance;

  if (direction === "up") {
    // Canal alcista
    support = base;
    resistance = base + width;
  } else {
    // Canal baixista
    support = base;
    resistance = base + width;
  }

  // Marge FIAT‑NET
  const margin = width * marginPercent;

  return {
    support,
    supportEntry: support + margin,   // entrada LONG
    supportSL: support - margin,      // SL LONG

    resistance,
    resistanceEntry: resistance - margin, // entrada SHORT
    resistanceSL: resistance + margin     // SL SHORT
  };
}


// ------------------------------------------------------
// Detectar entrada FIAT‑NET
// ------------------------------------------------------
export function checkEntry(levels, price, direction) {
  if (direction === "up") {
    // LONG quan entra al marge superior del suport
    if (price <= levels.supportEntry) return "long";
  }

  if (direction === "down") {
    // SHORT quan entra al marge inferior de la resistència
    if (price >= levels.resistanceEntry) return "short";
  }

  return null;
}
