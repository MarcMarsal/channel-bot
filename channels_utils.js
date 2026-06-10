// channels_utils.js

// ------------------------------------------------------
// Calcular suport/resistència + marges FIAT‑NET
// ------------------------------------------------------
export function computeLevels(channel, currentTimestamp, marginPercent = 0.15) {
  const {
    direction,
    timestamp1,
    price1,
    slope,
    width
  } = channel;

  // Línia base al temps actual
  const base = price1 + slope * (currentTimestamp - timestamp1);

  let support, resistance;

  if (direction === "up") {
    // Canal alcista: base = suport, top = resistència
    support = base;
    resistance = base + width;
  } else {
    // Canal baixista: bottom = suport, top = resistència
    const bottom = base;
    const top = base + width;
    support = bottom;
    resistance = top;
  }

  const margin = width * marginPercent;

  return {
    // línies principals
    support,
    resistance,

    // marges per ENTRADA
    supportEntry: support + margin,        // LONG quan el preu entra aquí
    resistanceEntry: resistance - margin,  // SHORT quan el preu entra aquí

    // marges per SL
    supportSL: support - margin,           // SL LONG
    resistanceSL: resistance + margin      // SL SHORT
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
