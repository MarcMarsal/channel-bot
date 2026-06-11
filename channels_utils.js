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
// Mean Reversion FIAT‑NET: LONG al suport, SHORT a la resistència
// independentment de la direcció del canal
// ------------------------------------------------------
export function checkEntry(levels, pricePrev, priceNow) {
  const { supportEntry, resistanceEntry } = levels;

  // LONG → creuament cap avall del suportEntry
  if (pricePrev > supportEntry && priceNow <= supportEntry) {
    return "long";
  }

  // SHORT → creuament cap amunt de la resistanceEntry
  if (pricePrev < resistanceEntry && priceNow >= resistanceEntry) {
    return "short";
  }

  return null;
}

