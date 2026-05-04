import { api } from "./client.js";

export async function listItems(query) {
  const res = await api.get("/items", { params: query });
  return res.data.items;
}

export async function myItems() {
  const res = await api.get("/items/mine");
  return res.data.items;
}

export async function getItem(id) {
  const res = await api.get(`/items/${id}`);
  return res.data.item;
}

export async function createItem(payload) {
  const res = await api.post("/items", payload);
  return res.data.item;
}

export async function updateItem(id, payload) {
  const res = await api.put(`/items/${id}`, payload);
  return res.data.item;
}

export async function deleteItem(id) {
  await api.delete(`/items/${id}`);
}

export async function getMatches(id) {
  const res = await api.get(`/items/${id}/matches`);
  return res.data.matches;
}

