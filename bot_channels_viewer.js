// bot_channels_viewer.js — FIAT‑NET (sense Express)

import http from "http";
import { initDB } from "./db/client.js";
import { computeLevels, checkEntry } from "./channels_utils.js";
import { getActiveChannels, getLastSignals, getCandles } from "./channels_db.js";

// Formatador numèric FIAT
function fmt(n) {
  return n !== null && n !== undefined ? Number(n).toFixed(4) : "-";
}

async function renderChannelsTable() {
  const channels = await getActiveChannels();
  let rows = "";

  for (const ch of channels) {

    // 🟩 Demanem 1 vela (preu actual)
    const candles = await getCandles(ch.symbol, "1H", 1);
    if (!candles.length) continue;

    const current = candles[0];
    const price = current.close;
    const ts = current.timestamp;

    // 🟩 Calculem nivells FIAT‑NET
    const levels = computeLevels(ch, ts);

    // 🟩 Calculem estat FIAT‑NET (long, short, molt a prop, esperant)
    const state = checkEntry(levels, price);

    rows += `
      <tr>
        <td>${ch.symbol}</td>
        <td>${ch.direction}</td>
        <td>${fmt(price)}</td>

        <td>${fmt(levels.support)}</td>
        <td>${fmt(levels.supportEntry)}</td>
        <td>${fmt(levels.supportSL)}</td>

        <td>${fmt(levels.resistance)}</td>
        <td>${fmt(levels.resistanceEntry)}</td>
        <td>${fmt(levels.resistanceSL)}</td>

        <td>${fmt(ch.width)}</td>
        <td>${fmt(ch.slope)}</td>

        <td>${state}</td>
      </tr>
    `;
  }

  return `
    <h2>Canals Actius</h2>
    <table>
      <thead>
        <tr>
          <th>Symbol</th>
          <th>Direcció</th>
          <th>Preu Actual</th>

          <th>Suport</th>
          <th>Entrada LONG</th>
          <th>SL LONG</th>

          <th>Resistència</th>
          <th>Entrada SHORT</th>
          <th>SL SHORT</th>

          <th>Width</th>
          <th>Slope</th>

          <th>Estat</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>
  `;
}

async function renderSignalsTable() {
  const signals = await getLastSignals(20);
  let rows = "";

  for (const s of signals) {
    rows += `
      <tr>
        <td>${s.id}</td>
        <td>${s.symbol}</td>
        <td>${s.timeframe}</td>
        <td>${s.type}</td>
        <td>${fmt(s.entry)}</td>
        <td>${fmt(s.tp)}</td>
        <td>${fmt(s.sl)}</td>
        <td>${new Date(s.created_at).toLocaleString("es-ES")}</td>
      </tr>
    `;
  }

  return `
    <h2>Últimes 20 Senyals</h2>
    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Symbol</th>
          <th>TF</th>
          <th>Tipus</th>
          <th>Entrada</th>
          <th>TP</th>
          <th>SL</th>
          <th>Creat</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>
  `;
}

async function startPanel() {
  await initDB();

  http.createServer(async (req, res) => {
    if (req.url === "/") {
      const channelsHTML = await renderChannelsTable();
      const signalsHTML = await renderSignalsTable();
      const lastUpdate = new Date().toLocaleString("es-ES");

      const html = `
      <html>
      <head>
        <meta charset="UTF-8">
        <meta http-equiv="refresh" content="5">
        <style>
          body {
            background-color: #000;
            color: #00ff00;
            font-family: Consolas, monospace;
            padding: 20px;
          }
          table {
            border-collapse: collapse;
            width: 100%;
            margin-bottom: 40px;
          }
          th, td {
            border: 1px solid #00ff00;
            padding: 6px;
            text-align: center;
          }
          th {
            background-color: #003300;
          }
        </style>
      </head>
      <body>
        <h1>Panell FIAT‑NET Channels</h1>
        <p><b>Última actualització:</b> ${lastUpdate}</p>

        ${channelsHTML}
        ${signalsHTML}

      </body>
      </html>
      `;

      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      res.end(html);
      return;
    }

    res.writeHead(200);
    res.end("Panell FIAT‑NET Channels OK");
  }).listen(process.env.PORT || 3000);

  console.log("📡 Panell FIAT‑NET Channels en marxa");
}

startPanel();
