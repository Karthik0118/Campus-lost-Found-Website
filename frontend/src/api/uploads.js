import { api } from "./client.js";

export async function uploadImage(file) {
  const fd = new FormData();
  fd.append("image", file);
  const res = await api.post("/uploads/image", fd, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data.url;
}

