const router = require("express").Router();
const Gallery = require("../models/Gallery");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;

// Configurar Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

console.log(
  "Cloudinary configurado con cloud_name:",
  process.env.CLOUDINARY_CLOUD_NAME
);

// Configurar multer para memoria
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB límite
  },
  fileFilter: function (req, file, cb) {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Solo se permiten imágenes"));
    }
    cb(null, true);
  },
});

// Obtener todas las imágenes
router.get("/", async (req, res) => {
  try {
    const images = await Gallery.find().sort({ createdAt: -1 });
    res.json(images);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Añadir nueva imagen
router.post("/", upload.single("image"), async (req, res) => {
  try {
    console.log("Iniciando subida de imagen");

    if (!req.file) {
      console.log("No se recibió archivo");
      return res.status(400).json({ message: "No se subió ninguna imagen" });
    }

    console.log("Archivo recibido:", {
      mimetype: req.file.mimetype,
      size: req.file.size,
    });

    // Convertir el buffer a string base64
    const base64Data = req.file.buffer.toString("base64");
    const dataURI = `data:${req.file.mimetype};base64,${base64Data}`;

    console.log("Intentando subir a Cloudinary...");

    // Subir a Cloudinary
    const result = await cloudinary.uploader.upload(dataURI, {
      folder: "gallery",
      resource_type: "auto",
    });

    console.log("Subida exitosa a Cloudinary:", result.secure_url);

    // Crear nuevo documento en la base de datos
    const image = new Gallery({
      url: result.secure_url,
      description: req.body.description || "",
      cloudinaryId: result.public_id,
    });

    const newImage = await image.save();
    console.log("Imagen guardada en base de datos");

    res.status(201).json(newImage);
  } catch (err) {
    console.error("Error detallado:", err);
    res.status(400).json({
      message: err.message,
      details: err.toString(),
    });
  }
});

// Eliminar imagen
router.delete("/:id", async (req, res) => {
  try {
    const image = await Gallery.findById(req.params.id);
    if (!image) {
      return res.status(404).json({ message: "Imagen no encontrada" });
    }

    // Eliminar de Cloudinary si existe cloudinaryId
    if (image.cloudinaryId) {
      await cloudinary.uploader.destroy(image.cloudinaryId);
    }

    await Gallery.findByIdAndDelete(req.params.id);
    res.json({ message: "Imagen eliminada" });
  } catch (err) {
    console.error("Error al eliminar imagen:", err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
