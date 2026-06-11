// telegram/send.js
import axios from "axios";

export async function sendTelegram(text) {
 
const url = `https://api.telegram.org/bot${process.env.TELEGRAM_TOKEN}/sendMessage`;

  const payload = {
    chat_id: process.env.TELEGRAM_CHAT_ID,
    text,
    parse_mode: "HTML"
  };

  try {
    const res = await axios.post(url, payload);
    return res.status === 200;
  } catch (e) {
    console.error("Error enviant Telegram:", e.message);
    return false;
  }
}
