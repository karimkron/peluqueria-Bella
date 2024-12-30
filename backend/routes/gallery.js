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

// Configurar multer
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
}).single("image");

// Middleware personalizado para manejar errores de multer
const handleUpload = (req, res, next) => {
  upload(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      return res
        .status(400)
        .json({ message: `Error de Multer: ${err.message}` });
    } else if (err) {
      return res
        .status(400)
        .json({ message: `Error desconocido: ${err.message}` });
    }
    next();
  });
};

// Ruta POST con mejor manejo de errores
router.post("/", handleUpload, async (req, res) => {
  try {
    console.log("Iniciando proceso de subida");

    if (!req.file) {
      console.log("No se encontró archivo en la petición");
      return res.status(400).json({ message: "No se encontró ninguna imagen" });
    }

    console.log("Archivo recibido:", {
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
    });

    const base64Data = req.file.buffer.toString("base64");
    const dataURI = `data:${req.file.mimetype};base64,${base64Data}`;

    console.log("Iniciando subida a Cloudinary");
    const uploadResponse = await cloudinary.uploader.upload(dataURI, {
      folder: "gallery",
      resource_type: "auto",
    });
    console.log("Respuesta de Cloudinary:", uploadResponse);

    const image = new Gallery({
      url: uploadResponse.secure_url,
      description: req.body.description || "",
      cloudinaryId: uploadResponse.public_id,
    });

    const savedImage = await image.save();
    console.log("Imagen guardada en base de datos:", savedImage);

    res.status(201).json(savedImage);
  } catch (error) {
    console.error("Error detallado:", error);
    res.status(500).json({
      message: "Error al procesar la imagen",
      error: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
});

module.exports = router;
