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

    // 2) CALCULAR NIVELLS ACTUALS
    const levels = computeLevels(channel, currentTimestamp);

    // 3) DETECTAR ENTRADA
    const entry = checkEntry(levels, price, channel.direction);
    if (!entry) continue;

    // 4) CALCULAR SL I TP
    const sl = entry === "long"
      ? levels.support - channel.width * 0.25
      : levels.resistance + channel.width * 0.25;

    const tp = entry === "long"
      ? levels.resistance
      : levels.support;

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

console.log("🚀 FIAT‑NET Channels Bot en marxa (1H, cada minut)");
