const express = require("express");
const SystemSettings = require("../models/SystemSettings");
const { asyncHandler } = require("../utils/asyncHandler");

const router = express.Router();

const getSettings = async () => {
  let settings = await SystemSettings.findOne();
  if (!settings) {
    settings = await SystemSettings.create({});
  }
  return settings;
};

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const item = await getSettings();
    res.json({ item });
  })
);

router.put(
  "/",
  asyncHandler(async (req, res) => {
    const settings = await getSettings();
    Object.assign(settings, req.body);
    await settings.save();
    res.json({ item: settings });
  })
);

module.exports = router;
