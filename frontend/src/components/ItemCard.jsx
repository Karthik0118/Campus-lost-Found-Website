import { Link } from "react-router-dom";
import { formatDate } from "../utils/format.js";

export default function ItemCard({ item }) {
  return (
    <div className="card itemCard">
      <div className="badgeRow">
        <span className={item.type === "lost" ? "badge badgeLost" : "badge badgeFound"}>{item.type.toUpperCase()}</span>
        <span className="badge badgeNeutral">{item.category}</span>
      </div>
      <h3 className="itemTitle">{item.title}</h3>
      <p className="muted lineClamp">{item.description}</p>
      <div className="meta">
        <span>
          <b>Date:</b> {formatDate(item.date)}
        </span>
        <span>
          <b>Location:</b> {item.location}
        </span>
      </div>
      <div className="actions">
        <Link className="btn btnPrimary" to={`/items/${item._id}`}>
          View
        </Link>
      </div>
    </div>
  );
}

