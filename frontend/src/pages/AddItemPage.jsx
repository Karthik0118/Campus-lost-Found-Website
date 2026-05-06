import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createItem } from "../api/items.js";
import { uploadImage } from "../api/uploads.js";

export default function AddItemPage() {
  const navigate = useNavigate();
  const [type, setType] = useState("lost");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState("");
  const [location, setLocation] = useState("");
  const [contactInfo, setContactInfo] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      let imageUrl;
      if (imageFile) {
        imageUrl = await uploadImage(imageFile);
      }
      const item = await createItem({ type, title, description, category, date, location, contactInfo, imageUrl });
      navigate(`/items/${item._id}`);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to create item");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="stack">
      <div className="card">
        <h2>Add Item</h2>
        <p className="muted">Post a lost or found item. Keep details clear and specific.</p>
        {error ? <div className="alert">{error}</div> : null}

        <form className="form" onSubmit={onSubmit}>
          <label>
            Lost / Found
            <select value={type} onChange={(e) => setType(e.target.value)}>
              <option value="lost">Lost</option>
              <option value="found">Found</option>
            </select>
          </label>
          <label>
            Title
            <input value={title} onChange={(e) => setTitle(e.target.value)} required />
          </label>
          <label>
            Description
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} required />
          </label>
          <label>
            Image (optional, max 2MB)
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const f = e.target.files?.[0] || null;
                setImageFile(f);
                setImagePreview(f ? URL.createObjectURL(f) : "");
              }}
            />
          </label>
          {imagePreview ? (
            <div className="cardInner">
              <div className="muted small">Preview</div>
              <img
                src={imagePreview}
                alt="preview"
                style={{ width: "100%", maxWidth: 360, borderRadius: 12, border: "1px solid rgba(255,255,255,0.12)" }}
              />
            </div>
          ) : null}
          <label>
            Category
            <input
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Phone, ID card..."
              required
            />
          </label>
          <label>
            Date
            <input value={date} onChange={(e) => setDate(e.target.value)} type="date" required />
          </label>
          <label>
            Location
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Library, CSE Block..."
              required
            />
          </label>
          <label>
            Contact info
            <input
              value={contactInfo}
              onChange={(e) => setContactInfo(e.target.value)}
              placeholder="Phone / email / hostel room"
              required
            />
          </label>

          <button className="btn btnPrimary" disabled={busy}>
            {busy ? "Posting..." : "Post Item"}
          </button>
        </form>
      </div>
    </div>
  );
}

