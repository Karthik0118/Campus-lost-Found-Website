import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { deleteItem, getItem, getMatches, updateItem } from "../api/items.js";
import { sendMessage } from "../api/messages.js";
import { fileUrl } from "../api/client.js";
import { useAuth } from "../state/auth.jsx";
import { formatDate } from "../utils/format.js";
import ItemCard from "../components/ItemCard.jsx";

export default function ItemDetailsPage() {
  const params = useParams();
  const id = params.id || "";
  const navigate = useNavigate();
  const { user } = useAuth();

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [matches, setMatches] = useState([]);
  const [matchLoading, setMatchLoading] = useState(false);

  const isOwner = useMemo(() => {
    if (!user || !item) return false;
    const ownerId = typeof item.user === "string" ? item.user : item.user._id;
    return ownerId === user.id;
  }, [user, item]);

  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({
    type: "lost",
    title: "",
    description: "",
    category: "",
    date: "",
    location: "",
    contactInfo: "",
  });

  const [msgText, setMsgText] = useState("");
  const [busy, setBusy] = useState(false);
  const [info, setInfo] = useState(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const it = await getItem(id);
        setItem(it);
        setForm({
          type: it.type,
          title: it.title,
          description: it.description,
          category: it.category,
          date: String(it.date).slice(0, 10),
          location: it.location,
          contactInfo: it.contactInfo,
        });
      } catch (err) {
        setError(err?.response?.data?.message || "Failed to load item");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  useEffect(() => {
    async function loadMatches() {
      if (!id) return;
      setMatchLoading(true);
      try {
        setMatches(await getMatches(id));
      } catch {
        setMatches([]);
      } finally {
        setMatchLoading(false);
      }
    }
    loadMatches();
  }, [id]);

  async function onDelete() {
    if (!item) return;
    if (!confirm("Delete this post?")) return;
    await deleteItem(item._id);
    navigate("/myposts");
  }

  async function onSave(e) {
    e.preventDefault();
    if (!item) return;
    setBusy(true);
    setInfo(null);
    try {
      const updated = await updateItem(item._id, form);
      setItem(updated);
      setEditMode(false);
      setInfo("Saved!");
    } catch (err) {
      setInfo(err?.response?.data?.message || "Failed to save");
    } finally {
      setBusy(false);
    }
  }

  async function onSendMessage(e) {
    e.preventDefault();
    if (!item) return;
    setBusy(true);
    setInfo(null);
    try {
      await sendMessage({ itemId: item._id, text: msgText });
      setMsgText("");
      setInfo("Message sent.");
    } catch (err) {
      setInfo(err?.response?.data?.message || "Failed to send message");
    } finally {
      setBusy(false);
    }
  }

  if (loading) return <div className="card">Loading...</div>;
  if (error) return <div className="card alert">{error}</div>;
  if (!item) return <div className="card">Not found</div>;

  return (
    <div className="stack">
      <div className="card">
        <div className="row">
          <div>
            <div className="badgeRow">
              <span className={item.type === "lost" ? "badge badgeLost" : "badge badgeFound"}>{item.type.toUpperCase()}</span>
              <span className="badge badgeNeutral">{item.category}</span>
            </div>
            <h2>{item.title}</h2>
            <p className="muted">
              <b>Date:</b> {formatDate(item.date)} · <b>Location:</b> {item.location}
            </p>
          </div>
          <Link className="btn btnGhost" to="/dashboard">
            Back
          </Link>
        </div>

        {!editMode ? (
          <>
            {item.imageUrl ? (
              <div className="cardInner">
                <div className="muted small">Image</div>
                <img
                  src={fileUrl(item.imageUrl)}
                  alt={item.title}
                  style={{ width: "100%", maxWidth: 520, borderRadius: 12, border: "1px solid rgba(255,255,255,0.12)" }}
                />
              </div>
            ) : null}
            <p className="textBlock">{item.description}</p>

            <div className="cardInner">
              <h3>Contact</h3>
              <p className="muted">If this looks like yours, reach out. (Beginner app: contact is shown directly.)</p>
              <div className="pill">
                <b>Contact info:</b> {item.contactInfo}
              </div>
            </div>

            {user && !isOwner ? (
              <div className="cardInner">
                <h3>Send a message (optional)</h3>
                <form className="form" onSubmit={onSendMessage}>
                  <label>
                    Message
                    <textarea value={msgText} onChange={(e) => setMsgText(e.target.value)} rows={3} required />
                  </label>
                  <button className="btn btnPrimary" disabled={busy}>
                    {busy ? "Sending..." : "Send"}
                  </button>
                </form>
              </div>
            ) : null}

            {isOwner ? (
              <div className="row">
                <button className="btn btnGhost" onClick={() => setEditMode(true)}>
                  Edit
                </button>
                <button className="btn btnDanger" onClick={onDelete}>
                  Delete
                </button>
              </div>
            ) : null}
          </>
        ) : (
          <form className="form" onSubmit={onSave}>
            {info ? <div className="alert">{info}</div> : null}
            <label>
              Lost / Found
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                <option value="lost">Lost</option>
                <option value="found">Found</option>
              </select>
            </label>
            <label>
              Title
              <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
            </label>
            <label>
              Description
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={4} required />
            </label>
            <label>
              Category
              <input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} required />
            </label>
            <label>
              Date
              <input value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} type="date" required />
            </label>
            <label>
              Location
              <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} required />
            </label>
            <label>
              Contact info
              <input value={form.contactInfo} onChange={(e) => setForm({ ...form, contactInfo: e.target.value })} required />
            </label>

            <div className="row">
              <button className="btn btnPrimary" disabled={busy}>
                {busy ? "Saving..." : "Save"}
              </button>
              <button type="button" className="btn btnGhost" onClick={() => setEditMode(false)}>
                Cancel
              </button>
            </div>
          </form>
        )}

        {info && !editMode ? <div className="alert">{info}</div> : null}
      </div>

      <div className="card">
        <h3>Possible matches</h3>
        <p className="muted">Opposite type + same category, ranked by keyword overlap.</p>
        {matchLoading ? <div className="muted">Loading matches...</div> : null}
        <div className="grid">
          {matches.map((m) => (
            <div key={m.item._id} className="stack">
              <ItemCard item={m.item} />
              <div className="muted small">Match score: {m.score}</div>
            </div>
          ))}
        </div>
        {!matchLoading && matches.length === 0 ? <div className="muted">No close matches yet.</div> : null}
      </div>
    </div>
  );
}

