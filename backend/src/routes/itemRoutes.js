const express = require("express");
const Item = require("../models/Item");
const { protect } = require("../middleware/auth");
const { toKeywords } = require("../utils/text");

const router = express.Router();

function buildFilter(query) {
  const filter = {};
  if (query.type && ["lost", "found"].includes(query.type)) filter.type = query.type;
  if (query.category) filter.category = String(query.category).trim();

  if (query.dateFrom || query.dateTo) {
    filter.date = {};
    if (query.dateFrom) filter.date.$gte = new Date(query.dateFrom);
    if (query.dateTo) filter.date.$lte = new Date(query.dateTo);
  }

  if (query.q) {
    filter.$text = { $search: String(query.q) };
  }

  return filter;
}

// GET /api/items?type=lost|found&category=&dateFrom=&dateTo=&q=
router.get("/", async (req, res) => {
  const filter = buildFilter(req.query);
  const sort = { createdAt: -1 };
  const items = await Item.find(filter).populate("user", "name email").sort(sort).limit(200);
  res.json({ items });
});

// GET /api/items/mine
router.get("/mine", protect, async (req, res) => {
  const items = await Item.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json({ items });
});

// POST /api/items
router.post("/", protect, async (req, res) => {
  const { type, title, description, category, date, location, contactInfo } = req.body || {};
  if (!type || !title || !description || !category || !date || !location || !contactInfo) {
    return res.status(400).json({ message: "All fields are required" });
  }
  if (!["lost", "found"].includes(type)) return res.status(400).json({ message: "Invalid type" });

  const keywords = Array.from(new Set([...toKeywords(title), ...toKeywords(description), ...toKeywords(location)]));

  const item = await Item.create({
    type,
    title: String(title).trim(),
    description: String(description).trim(),
    category: String(category).trim(),
    date: new Date(date),
    location: String(location).trim(),
    contactInfo: String(contactInfo).trim(),
    keywords,
    user: req.user._id,
  });

  res.status(201).json({ item });
});

// GET /api/items/:id
router.get("/:id", async (req, res) => {
  const item = await Item.findById(req.params.id).populate("user", "name email");
  if (!item) return res.status(404).json({ message: "Item not found" });
  res.json({ item });
});

// PUT /api/items/:id
router.put("/:id", protect, async (req, res) => {
  const item = await Item.findById(req.params.id);
  if (!item) return res.status(404).json({ message: "Item not found" });
  if (String(item.user) !== String(req.user._id)) return res.status(403).json({ message: "Forbidden" });

  const updates = {};
  const fields = ["type", "title", "description", "category", "date", "location", "contactInfo"];
  for (const f of fields) {
    if (req.body && req.body[f] !== undefined) updates[f] = req.body[f];
  }
  if (updates.type && !["lost", "found"].includes(updates.type)) {
    return res.status(400).json({ message: "Invalid type" });
  }
  if (updates.date) updates.date = new Date(updates.date);

  const title = updates.title ?? item.title;
  const description = updates.description ?? item.description;
  const location = updates.location ?? item.location;
  updates.keywords = Array.from(new Set([...toKeywords(title), ...toKeywords(description), ...toKeywords(location)]));

  const saved = await Item.findByIdAndUpdate(req.params.id, updates, { new: true });
  res.json({ item: saved });
});

// DELETE /api/items/:id
router.delete("/:id", protect, async (req, res) => {
  const item = await Item.findById(req.params.id);
  if (!item) return res.status(404).json({ message: "Item not found" });
  if (String(item.user) !== String(req.user._id)) return res.status(403).json({ message: "Forbidden" });

  await item.deleteOne();
  res.json({ ok: true });
});

// GET /api/items/:id/matches
// Simple match logic: opposite type + same category; boost if keywords overlap.
router.get("/:id/matches", async (req, res) => {
  const item = await Item.findById(req.params.id);
  if (!item) return res.status(404).json({ message: "Item not found" });

  const oppositeType = item.type === "lost" ? "found" : "lost";
  const candidates = await Item.find({
    _id: { $ne: item._id },
    type: oppositeType,
    category: item.category,
  })
    .sort({ createdAt: -1 })
    .limit(100);

  const a = new Set(item.keywords || []);
  const scored = candidates
    .map((c) => {
      const b = c.keywords || [];
      let overlap = 0;
      for (const w of b) if (a.has(w)) overlap++;
      return { item: c, score: overlap };
    })
    .sort((x, y) => y.score - x.score)
    .slice(0, 10);

  res.json({ matches: scored });
});

module.exports = router;

