import express from "express";
import { parcels } from "../data/parcels.js";

const router = express.Router();

/* Get all parcels */
router.get("/", (req, res) => {
  res.json(parcels);
});

/* Get parcel by ID */
router.get("/:id", (req, res) => {
  const parcel = parcels.features.find(
    p => p.properties.parcelId === req.params.id
  );

  if (!parcel) {
    return res.status(404).json({ error: "Parcel not found" });
  }

  res.json(parcel.properties);
});

export default router;
