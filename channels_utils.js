// channels_utils.js

// ------------------------------------------------------
// Calcular suport/resistència + marges FIAT‑NET
// ------------------------------------------------------
export function computeLevels(channel, currentTimestamp, marginPercent = 0.2) {
  const { direction, timestamp1, price1, slope, width } = channel;

  // 1) Convertir timestamps → índex de vela (TF 1H = 3600000 ms)
  const index = (currentTimestamp - timestamp1) / 3600000;

  // 2) Projectar línia principal amb slope per vela
  const mainLine = price1 + slope * index;

  // 3) Suport / Resistència segons direcció
  let support, resistance;

  if (direction === "down") {
    resistance = mainLine;
    support = mainLine - width;
  } else {
    support = mainLine;
    resistance = mainLine + width;
  }

  // 4) Marges FIAT‑NET (20% del width)
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
  //console.log(direction, price, resistanceEntry);
  if (direction === "down") {
    
    if (price >= resistanceEntry) return "short";
  }

  return null;
}
