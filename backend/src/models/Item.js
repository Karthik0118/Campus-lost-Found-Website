const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ["lost", "found"], required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    date: { type: Date, required: true },
    location: { type: String, required: true, trim: true },
    contactInfo: { type: String, required: true, trim: true },
    imageUrl: { type: String, trim: true },
    keywords: [{ type: String, trim: true }],
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

itemSchema.index({ title: "text", description: "text", category: "text", location: "text" });

module.exports = mongoose.model("Item", itemSchema);

