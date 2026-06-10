// channels_utils.js

// ------------------------------------------------------
// Calcular suport/resistència actual + marges
// ------------------------------------------------------
export function computeLevels(channel, currentTimestamp, marginPercent = 0.15) {
  const {
    direction,
    timestamp1,
    price1,
    slope,
    width
  } = channel;

  const base = price1 + slope * (currentTimestamp - timestamp1);

  let support, resistance;

  if (direction === "up") {
    const top = base + width;
    support = base;
    resistance = top;
  } else {
    const top = base + width;     // línia de dalt
    const bottom = base;          // línia de baix
    support = bottom;
    resistance = top;
  }

  const margin = width * marginPercent;

  return {
    support,
    supportMargin: support - margin,
    resistance,
    resistanceMargin: resistance + margin
  };
}


// ------------------------------------------------------
// Detectar entrada al marge
// ------------------------------------------------------
export function checkEntry(levels, price, direction) {
  const { supportMargin, resistanceMargin } = levels;

  if (direction === "up") {
    if (price <= supportMargin) return "long";
  }

  if (direction === "down") {
    if (price >= resistanceMargin) return "short";
  }

  return null;
}
