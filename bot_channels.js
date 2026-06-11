// bot_channels.js
import { initDB } from "./db/client.js";
import cron from "node-cron";
import { getActiveChannels, getCandles, saveSignal } from "./channels_db.js";
import { computeLevels, checkEntry } from "./channels_utils.js";
import { sendTelegram } from "./telegram/send.js";

// -------------------------------------------------------------
// PROCESSAR CANALS (FIAT‑NET)
// -------------------------------------------------------------
async function processChannels() {
  const channels = await getActiveChannels();
  if (!channels.length) {
    console.log("No hi ha canals actius.");
    return;
  }

  for (const channel of channels) {
    const symbol = channel.symbol;

    // 1) OBTENIR L'ÚLTIMA VELA OBERTA DE LA BD
    const candles = await getCandles(symbol, "1H", 1);
    //console.log("Candles:", candles);
    if (!candles.length) continue;

    const last = candles[0];
    const price = last.close;
    const currentTimestamp = last.timestamp;

    // 2) CALCULAR NIVELLS ACTUALS (FIAT‑NET)
    const levels = computeLevels(channel, currentTimestamp);
    //console.log("Channel:", channel);

    // 3) DETECTAR ENTRADA (FIAT‑NET)
    const entry = checkEntry(levels, price, channel.direction);
    // Només LONG o SHORT generen senyal real
    if (entry !== "long" && entry !== "short") {
      continue;
    }


    // 4) CALCULAR SL I TP
    let sl, tp;

    if (entry === "long") {
      sl = levels.supportSL;
      tp = levels.resistance;
    } else if (entry === "short") {
      sl = levels.resistanceSL;
      tp = levels.support;
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
    const msg = `
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
`;

console.log("📤 MISSATGE A ENVIAR:", msg);

await sendTelegram(msg);


    console.log(`🔥 Senyal enviada: ${symbol} ${entry}`);
  }

  console.log("✔ Processament complet.");
}

// -------------------------------------------------------------
// START BOT (igual que upgraded)
// -------------------------------------------------------------
async function startBot() {
  await initDB();
  console.log("🚀 FIAT‑NET Channels Bot en marxa (1H, canals + marges)");

  cron.schedule("* * * * *", async () => {
    await processChannels();
  });
}

startBot();
