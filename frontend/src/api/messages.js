import { api } from "./client.js";

export async function sendMessage(payload) {
  const res = await api.post("/messages", payload);
  return res.data.message;
}

export async function inbox() {
  const res = await api.get("/messages/inbox");
  return res.data.messages;
}

