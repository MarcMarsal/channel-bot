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

  // Línia base (suport en canal alcista, resistència en baixista)
  const base = price1 + slope * (currentTimestamp - timestamp1);

  // Línia paral·lela
  const parallel = direction === "up"
    ? base + width
    : base - width;

  // Marges
  const margin = width * marginPercent;

  return {
    support: direction === "up" ? base : parallel,
    supportMargin: direction === "up" ? base - margin : parallel - margin,
    resistance: direction === "up" ? parallel : base,
    resistanceMargin: direction === "up" ? parallel + margin : base + margin
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
