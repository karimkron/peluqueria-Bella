const router = require("express").Router();
const Gallery = require("../models/Gallery");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Configurar multer para el almacenamiento
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/gallery");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    const filetypes = /jpeg|jpg|png|webp/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(
      path.extname(file.originalname).toLowerCase()
    );

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error("Solo se permiten imágenes (jpg, jpeg, png, webp)"));
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
    if (!req.file) {
      return res.status(400).json({ message: "No se subió ninguna imagen" });
    }

    const imageUrl = `/uploads/gallery/${req.file.filename}`;
    const image = new Gallery({
      url: imageUrl,
      description: req.body.description,
    });

    const newImage = await image.save();
    res.status(201).json(newImage);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Eliminar imagen
router.delete("/:id", async (req, res) => {
  try {
    const image = await Gallery.findById(req.params.id);
    if (!image) {
      return res.status(404).json({ message: "Imagen no encontrada" });
    }

    // Eliminar el archivo
    const filePath = path.join(__dirname, "..", image.url);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await Gallery.findByIdAndDelete(req.params.id);
    res.json({ message: "Imagen eliminada" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
