// channels_db.js
import { client } from "./db/client.js";

// -----------------------------
// GET CANDLES
// -----------------------------
export async function getCandles(symbol, timeframe = "1H", limit = 200) {
  try {
    const q = await client.query(
      `
      SELECT timestamp, open, high, low, close
      FROM candles
      WHERE symbol = $1 AND timeframe = $2
      ORDER BY timestamp DESC
      LIMIT $3
      `,
      [symbol, timeframe, limit]
    );

    return q.rows.reverse(); // ordre ascendent
  } catch (err) {
    console.error("Error getCandles:", err);
    return [];
  }
}

// -----------------------------
// SAVE CHANNEL
// -----------------------------
export async function saveChannel(channel) {
  const {
    symbol,
    timeframe,
    timestamp1,
    price1,
    timestamp2,
    price2,
    timestamp3,
    price3,
    direction,
    slope,
    width
  } = channel;

  try {
    await client.query(
      `
      INSERT INTO channels
      (symbol, timeframe, timestamp1, price1, timestamp2, price2, timestamp3, price3, direction, slope, width)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
      `,
      [
        symbol,
        timeframe,
        timestamp1,
        price1,
        timestamp2,
        price2,
        timestamp3,
        price3,
        direction,
        slope,
        width
      ]
    );

    console.log(`Canal guardat per ${symbol}`);
  } catch (err) {
    console.error("Error saveChannel:", err);
  }
}

// -----------------------------
// SAVE SIGNAL
// -----------------------------
export async function saveSignal(signal) {
  const {
    channel_id,
    symbol,
    timeframe,
    type,
    price,
    sl,
    tp,
    timestamp
  } = signal;

  try {
    await client.query(
      `
      INSERT INTO signals_channel
      (channel_id, symbol, timeframe, type, price, sl, tp, timestamp)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
      `,
      [
        channel_id,
        symbol,
        timeframe,
        type,
        price,
        sl,
        tp,
        timestamp
      ]
    );

    console.log(`Senyal CHANNEL guardada: ${symbol} ${type}`);
  } catch (err) {
    console.error("Error saveSignal:", err);
  }
}

// -----------------------------
// GET ACTIVE CHANNELS
// -----------------------------
export async function getActiveChannels() {
  try {
    const q = await client.query(
      `
      SELECT *
      FROM channels
      ORDER BY created_at DESC
      `
    );

    return q.rows;
  } catch (err) {
    console.error("Error getActiveChannels:", err);
    return [];
  }
}

// -----------------------------
// GET LAST SIGNALS
// -----------------------------
export async function getLastSignals(limit = 20) {
  try {
    const q = await client.query(
      `
      SELECT *
      FROM signals_channel
      ORDER BY created_at DESC
      LIMIT $1
      `,
      [limit]
    );

    return q.rows;
  } catch (err) {
    console.error("Error getLastSignals:", err);
    return [];
  }
}
