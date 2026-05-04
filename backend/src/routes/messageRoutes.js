const express = require("express");
const { protect } = require("../middleware/auth");
const Message = require("../models/Message");
const Item = require("../models/Item");

const router = express.Router();

// GET /api/messages/inbox
router.get("/inbox", protect, async (req, res) => {
  const messages = await Message.find({ to: req.user._id })
    .populate("from", "name email")
    .populate("item", "title type category")
    .sort({ createdAt: -1 })
    .limit(200);
  res.json({ messages });
});

// POST /api/messages
// body: { itemId, text }
router.post("/", protect, async (req, res) => {
  const { itemId, text } = req.body || {};
  if (!itemId || !text) return res.status(400).json({ message: "itemId and text are required" });

  const item = await Item.findById(itemId);
  if (!item) return res.status(404).json({ message: "Item not found" });
  if (String(item.user) === String(req.user._id)) {
    return res.status(400).json({ message: "You cannot message yourself" });
  }

  const msg = await Message.create({
    item: item._id,
    from: req.user._id,
    to: item.user,
    text: String(text).trim(),
  });

  res.status(201).json({ message: msg });
});

module.exports = router;

