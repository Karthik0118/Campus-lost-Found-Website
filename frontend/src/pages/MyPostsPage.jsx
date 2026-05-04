import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ItemCard from "../components/ItemCard.jsx";
import { deleteItem, myItems } from "../api/items.js";

export default function MyPostsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      setItems(await myItems());
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load your posts");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function onDelete(id) {
    if (!confirm("Delete this post?")) return;
    await deleteItem(id);
    await load();
  }

  return (
    <div className="stack">
      <div className="card">
        <div className="row">
          <div>
            <h2>My Posts</h2>
            <p className="muted">Edit or delete your own posts.</p>
          </div>
          <Link className="btn btnPrimary" to="/add">
            Add Item
          </Link>
        </div>
      </div>

      {loading ? <div className="card">Loading...</div> : null}
      {error ? <div className="card alert">{error}</div> : null}

      <div className="grid">
        {items.map((it) => (
          <div key={it._id} className="stack">
            <ItemCard item={it} />
            <div className="row">
              <Link className="btn btnGhost" to={`/items/${it._id}`}>
                Open
              </Link>
              <button className="btn btnDanger" onClick={() => onDelete(it._id)}>
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {!loading && !error && items.length === 0 ? <div className="card muted">You haven’t posted anything yet.</div> : null}
    </div>
  );
}

