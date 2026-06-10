// channels_utils.js

// ------------------------------------------------------
// Calcular suport/resistència + marges FIAT‑NET
// ------------------------------------------------------
export function computeLevels(channel, currentTimestamp, marginPercent = 0.15) {
  const { direction, timestamp1, price1, slope, width } = channel;

  // Línia principal definida per P1 → P2
  const dt = currentTimestamp - timestamp1;
  const mainLine = price1 + slope * dt;

  let support, resistance;

  if (direction === "down") {
    // Canal baixista:
    // - línia principal = resistència
    // - línia clonada = suport
    resistance = mainLine;
    support = mainLine - width;
  } else {
    // Canal alcista:
    // - línia principal = suport
    // - línia clonada = resistència
    support = mainLine;
    resistance = mainLine + width;
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
