"use strict";

const PromoBar = require("../models/PromoBar");

// GET /api/promo-bar/active → returns ALL active bars' messages combined
const getActive = async (req, res) => {
  try {
    const bars = await PromoBar.findAll({
      where:      { isActive: true },
      order:      [["createdAt", "ASC"]], // oldest first for consistent order
      attributes: ["id", "message"],
    });

    if (!bars.length) return res.json(null);

    // Collect all individual messages from all active bars
    const allMessages = bars
      .flatMap((bar) =>
        bar.message.includes("|")
          ? bar.message.split("|").map((m) => m.trim())
          : [bar.message.trim()]
      )
      .filter(Boolean);

    // Return combined as pipe-separated string (frontend already splits by |)
    return res.json({ message: allMessages.join(" | ") });
  } catch (err) {
    console.error("[PromoBar] getActive:", err);
    return res.status(500).json({ error: "Failed to fetch promo bar" });
  }
};

// GET /api/promo-bar → admin: list all
const getAll = async (req, res) => {
  try {
    const bars = await PromoBar.findAll({ order: [["createdAt", "DESC"]] });
    return res.json(bars);
  } catch (err) {
    console.error("[PromoBar] getAll:", err);
    return res.status(500).json({ error: "Failed to fetch promo bars" });
  }
};

// POST /api/promo-bar → admin: create
const create = async (req, res) => {
  const { message, isActive } = req.body;
  if (!message || !String(message).trim()) {
    return res.status(400).json({ error: "'message' is required" });
  }
  try {
    const bar = await PromoBar.create({
      message:  String(message).trim(),
      isActive: isActive !== undefined ? Boolean(isActive) : true,
    });
    return res.status(201).json(bar);
  } catch (err) {
    console.error("[PromoBar] create:", err);
    return res.status(500).json({ error: "Failed to create promo bar" });
  }
};

// PUT /api/promo-bar/:id → admin: update message/status
const update = async (req, res) => {
  try {
    const bar = await PromoBar.findByPk(req.params.id);
    if (!bar) return res.status(404).json({ error: "Promo bar not found" });

    const { message, isActive } = req.body;
    await bar.update({
      ...(message  !== undefined && { message: String(message).trim() }),
      ...(isActive !== undefined && { isActive: Boolean(isActive) }),
    });
    return res.json(bar);
  } catch (err) {
    console.error("[PromoBar] update:", err);
    return res.status(500).json({ error: "Failed to update promo bar" });
  }
};

// PATCH /api/promo-bar/:id/toggle
const toggle = async (req, res) => {
  try {
    const bar = await PromoBar.findByPk(req.params.id);
    if (!bar) return res.status(404).json({ error: "Promo bar not found" });
    await bar.update({ isActive: !bar.isActive });
    return res.json({ id: bar.id, isActive: bar.isActive });
  } catch (err) {
    console.error("[PromoBar] toggle:", err);
    return res.status(500).json({ error: "Failed to toggle promo bar" });
  }
};

// DELETE /api/promo-bar/:id
const remove = async (req, res) => {
  try {
    const bar = await PromoBar.findByPk(req.params.id);
    if (!bar) return res.status(404).json({ error: "Promo bar not found" });
    await bar.destroy();
    return res.json({ message: "Deleted successfully" });
  } catch (err) {
    console.error("[PromoBar] remove:", err);
    return res.status(500).json({ error: "Failed to delete promo bar" });
  }
};

module.exports = { getActive, getAll, create, update, toggle, remove };