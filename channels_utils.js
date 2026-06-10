// channels_utils.js

// ------------------------------------------------------
// Calcular suport/resistència + marges FIAT‑NET
// ------------------------------------------------------
export function computeLevels(channel, currentTimestamp, marginPercent = 0.15) {
  const { direction, timestamp1, price1, slope, width } = channel;

  const base = price1 + slope * (currentTimestamp - timestamp1);

  let support, resistance;

  if (direction === "up") {
    // Canal alcista: base = suport
    support = base;
    resistance = base + width;
  } else {
    // Canal baixista: base = resistència
    resistance = base;
    support = base - width;
  }

  const margin = width * marginPercent;

  return {
    support,
    resistance,
    supportEntry: support + margin,
    resistanceEntry: resistance - margin,
    supportSL: support - margin,
    resistanceSL: resistance + margin
  };
}


// ------------------------------------------------------
// Detectar entrada FIAT‑NET (canal + marges)
// ------------------------------------------------------
export function checkEntry(levels, price, direction) {
  const {
    supportEntry,
    resistanceEntry
  } = levels;

  if (direction === "up") {
    // LONG quan el preu entra al marge superior del suport
    if (price <= supportEntry) return "long";
  }

  if (direction === "down") {
    // SHORT quan el preu entra al marge inferior de la resistència
    if (price >= resistanceEntry) return "short";
  }

  return null;
}
