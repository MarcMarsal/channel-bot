// channels_utils.js

// ------------------------------------------------------
// Calcular suport/resistència + marges FIAT‑NET
// ------------------------------------------------------
export function computeLevels(channel, currentTimestamp, marginPercent = 0.2) {
  const { direction, timestamp1, price1, slope, width } = channel;

  // 1) Convertir timestamps → índex de vela (TF 1H = 3600000 ms)
  const timeframe_ms = 3600000;
  const index = (currentTimestamp - timestamp1) / timeframe_ms;

  // 2) Projectar línia principal amb slope per vela
  const mainLine = price1 + slope * index;

  // 3) Suport / Resistència segons direcció del canal
  let support, resistance;

  if (direction === "down") {
    // Canal baixista → línia principal és resistència
    resistance = mainLine;
    support = mainLine - width;
  } else {
    // Canal alcista → línia principal és suport
    support = mainLine;
    resistance = mainLine + width;
  }

  // 4) Marges FIAT‑NET (20% del width)
  const margin = width * marginPercent;

  const midline = (support + resistance) / 2;

  return {
    support,
    resistance,
    midline,
    supportEntry: support + margin,
    resistanceEntry: resistance - margin,
    supportSL: support - margin,
    resistanceSL: resistance + margin
  };
}

// ------------------------------------------------------
// Mean Reversion FIAT‑NET: LONG al suport, SHORT a la resistència
// independentment de la direcció del canal
// ------------------------------------------------------
export function checkEntry(levels, price, nearPercent = 0.1) {
  const { supportEntry, resistanceEntry, support, resistance } = levels;

  const width = resistance - support;
  const nearDist = width * nearPercent;

  // 1) ZONA DE LONG
  if (price <= supportEntry) {
    return "long";
  }

  // 2) ZONA DE SHORT
  if (price >= resistanceEntry) {
    return "short";
  }

  // 3) MOLT A PROP DE LONG
  if (price > supportEntry && price <= supportEntry + nearDist) {
    return "molt a prop de long";
  }

  // 4) MOLT A PROP DE SHORT
  if (price < resistanceEntry && price >= resistanceEntry - nearDist) {
    return "molt a prop de short";
  }

  // 5) LLUNY
  return "esperant";
}
