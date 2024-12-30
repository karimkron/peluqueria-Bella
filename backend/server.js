const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
require("dotenv").config();
const app = express();

app.use(
  cors({
    origin: ["https://peluqueria-bella.onrender.com", "http://localhost:5173"],
    credentials: true,
  })
);
app.use(express.json());

// Servir archivos estáticos desde la carpeta uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

console.log("⏳ Conectando a MongoDB...");

mongoose
  .connect(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  })
  .then(() => console.log("✅ Conexión exitosa a MongoDB"))
  .catch((err) => console.error("❌ Error de conexión:", err));

// Rutas
app.use("/api/appointments", require("./routes/appointments"));
app.use("/api/services", require("./routes/services"));
app.use("/api/gallery", require("./routes/gallery"));
app.use("/api/contact", require("./routes/contact"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor ejecutándose en puerto ${PORT}`);
});
