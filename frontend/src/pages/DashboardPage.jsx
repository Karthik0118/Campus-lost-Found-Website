import { useEffect, useMemo, useState } from "react";
import ItemCard from "../components/ItemCard.jsx";
import { listItems } from "../api/items.js";

export default function DashboardPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [type, setType] = useState("");
  const [category, setCategory] = useState("");
  const [q, setQ] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const query = useMemo(
    () => ({
      type,
      category: category.trim() || undefined,
      q: q.trim() || undefined,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
    }),
    [type, category, q, dateFrom, dateTo]
  );

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await listItems(query);
        setItems(data);
      } catch (err) {
        setError(err?.response?.data?.message || "Failed to load items");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [query]);

  return (
    <div className="stack">
      <div className="card">
        <h2>Dashboard</h2>
        <p className="muted">Browse all lost &amp; found posts. Use filters to narrow results.</p>

        <div className="filters">
          <label>
            Type
            <select value={type} onChange={(e) => setType(e.target.value)}>
              <option value="">All</option>
              <option value="lost">Lost</option>
              <option value="found">Found</option>
            </select>
          </label>
          <label>
            Category
            <input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="e.g. Phone" />
          </label>
          <label>
            Search
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="keywords..." />
          </label>
          <label>
            Date from
            <input value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} type="date" />
          </label>
          <label>
            Date to
            <input value={dateTo} onChange={(e) => setDateTo(e.target.value)} type="date" />
          </label>
        </div>
      </div>

      {loading ? <div className="card">Loading...</div> : null}
      {error ? <div className="card alert">{error}</div> : null}

      <div className="grid">
        {items.map((it) => (
          <ItemCard key={it._id} item={it} />
        ))}
      </div>

      {!loading && !error && items.length === 0 ? <div className="card muted">No posts found for these filters.</div> : null}
    </div>
  );
}

