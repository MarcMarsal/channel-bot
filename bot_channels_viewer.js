// bot_channels_viewer.js
import express from "express";
import { getActiveChannels, getLastSignals, getCandles } from "./channels_db.js";
import { computeLevels } from "./channels_utils.js";

const app = express();
const PORT = process.env.PORT || 3001;

// ------------------------------------------------------
// GET /channels → estat actual dels canals
// ------------------------------------------------------
app.get("/channels", async (req, res) => {
  try {
    const channels = await getActiveChannels();
    const result = [];

    for (const ch of channels) {
      const candles = await getCandles(ch.symbol, "1H", 1);
      if (!candles.length) continue;

      const last = candles[0];
      const price = last.close;
      const ts = last.timestamp;

      const levels = computeLevels(ch, ts);

      result.push({
        symbol: ch.symbol,
        direction: ch.direction,
        price,
        support: levels.support,
        resistance: levels.resistance,
        supportMargin: levels.supportMargin,
        resistanceMargin: levels.resistanceMargin,
        width: ch.width,
        slope: ch.slope,
        timestamp: ts
      });
    }

    res.json(result);
  } catch (err) {
    console.error("Error /channels:", err);
    res.status(500).json({ error: "Error obtenint canals" });
  }
});

// ------------------------------------------------------
// GET /signals → últimes 20 senyals
// ------------------------------------------------------
app.get("/signals", async (req, res) => {
  try {
    const signals = await getLastSignals(20);
    res.json(signals);
  } catch (err) {
    console.error("Error /signals:", err);
    res.status(500).json({ error: "Error obtenint senyals" });
  }
});

// ------------------------------------------------------
// GET / → resum complet
// ------------------------------------------------------
app.get("/", async (req, res) => {
  try {
    const channels = await getActiveChannels();
    const signals = await getLastSignals(20);

    const channelsState = [];

    for (const ch of channels) {
      const candles = await getCandles(ch.symbol, "1H", 1);
      if (!candles.length) continue;

      const last = candles[0];
      const price = last.close;
      const ts = last.timestamp;

      const levels = computeLevels(ch, ts);

      channelsState.push({
        symbol: ch.symbol,
        direction: ch.direction,
        price,
        support: levels.support,
        resistance: levels.resistance,
        supportMargin: levels.supportMargin,
        resistanceMargin: levels.resistanceMargin,
        width: ch.width,
        slope: ch.slope,
        timestamp: ts
      });
    }

    res.json({
      channels: channelsState,
      lastSignals: signals
    });
  } catch (err) {
    console.error("Error /:", err);
    res.status(500).json({ error: "Error obtenint dades" });
  }
});

// ------------------------------------------------------
// START SERVER
// ------------------------------------------------------
app.listen(PORT, () => {
  console.log(`📡 Viewer Channels Bot escoltant al port ${PORT}`);
});
