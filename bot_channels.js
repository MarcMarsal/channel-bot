// bot_channels.js
import cron from "node-cron";
import { getActiveChannels, getCandles, saveSignal } from "./channels_db.js";
import { computeLevels, checkEntry } from "./channels_utils.js";
import { sendTelegram } from "./telegram/send.js";

// ---------------------------------------------
// PROCESSAR CANALS
// ---------------------------------------------
async function processChannels() {
  console.log("⏳ Processant canals...");

  const channels = await getActiveChannels();
  if (!channels.length) {
    console.log("No hi ha canals actius.");
    return;
  }

  for (const channel of channels) {
    const symbol = channel.symbol;

    // 1) OBTENIR L'ÚLTIMA VELA OBERTA DE LA BD
    const candles = await getCandles(symbol, "1H", 1);
    if (!candles.length) continue;

    const last = candles[0];
    const price = last.close;
    const currentTimestamp = last.timestamp;

    // 2) CALCULAR NIVELLS ACTUALS (FIAT‑NET)
    const levels = computeLevels(channel, currentTimestamp);

    // 3) DETECTAR ENTRADA (FIAT‑NET)
    const entry = checkEntry(levels, price, channel.direction);
    if (!entry) continue;

    // 4) CALCULAR SL I TP (FIAT‑NET)
    let sl, tp;

    if (entry === "long") {
      sl = levels.supportSL;       // per sota del marge del suport
      tp = levels.resistance;      // línia de resistència
    } else if (entry === "short") {
      sl = levels.resistanceSL;    // per sobre del marge de resistència
      tp = levels.support;         // línia de suport
    }

    // 5) GUARDAR SENYAL
    await saveSignal({
      channel_id: channel.id,
      symbol,
      timeframe: "1H",
      type: entry,
      price,
      sl,
      tp,
      timestamp: currentTimestamp
    });

    // 6) ENVIAR TELEGRAM
    await sendTelegram(`
<b>${symbol}</b>
Canal: ${channel.direction.toUpperCase()}
Entrada: <b>${entry.toUpperCase()}</b>

Preu: ${price}
SL: ${sl}
TP: ${tp}

Suport: ${levels.support}
Resistència: ${levels.resistance}
Entrada suport: ${levels.supportEntry}
Entrada resistència: ${levels.resistanceEntry}
SL suport: ${levels.supportSL}
SL resistència: ${levels.resistanceSL}
    `);

    console.log(`🔥 Senyal enviada: ${symbol} ${entry}`);
  }

  console.log("✔ Processament complet.");
}

// ---------------------------------------------
// CRON: cada minut
// ---------------------------------------------
cron.schedule("* * * * *", async () => {
  await processChannels();
});

console.log("🚀 FIAT‑NET Channels Bot en marxa (1H, canals + marges)");
