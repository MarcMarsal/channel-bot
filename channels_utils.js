// channels_utils.js

// ------------------------------------------------------
// Calcular suport/resistència + marges FIAT‑NET
// ------------------------------------------------------
export function computeLevels(channel, currentTimestamp, marginPercent = 0.1) {
  const { direction, timestamp1, price1, slope, width } = channel;

  // Línia principal (P1 → P2) projectada a la vela ACTUAL
  const dt = currentTimestamp - timestamp1;
  const mainLine = price1 + slope * dt;

  let support, resistance;

  if (direction === "down") {
    // Canal baixista:
    // - línia principal = resistència
    // - clon = suport
    resistance = mainLine;
    support = mainLine - width;
  } else {
    // Canal alcista:
    // - línia principal = suport
    // - clon = resistència
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
  const { supportEntry, resistanceEntry } = levels;

  if (direction === "up") {
    if (price <= supportEntry) return "long";
  }
  console.log(direction, price, resistanceEntry);
  if (direction === "down") {
    
    if (price >= resistanceEntry) return "short";
  }

  return null;
}
