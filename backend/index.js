import express from "express";
import cors from "cors";
import parcelRoutes from "./routes/parcels.js";

const app = express();
const PORT = 4000;

/* CORS — must be BEFORE routes */
app.use(cors({
  origin: "http://localhost:5173",
}));

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Land Registry Backend is running");
});

app.use("/api/parcels", parcelRoutes);

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
