import React, { useState } from "react";
import { motion } from "framer-motion";
import { ImageUpload } from "./ImageUpload";
import { api } from "../services/api";
import { toast } from "react-hot-toast";

interface GalleryFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export function GalleryForm({ onSuccess, onCancel }: GalleryFormProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [description, setDescription] = useState("");
  const [uploading, setUploading] = useState(false);

  const formVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        bounce: 0.4,
        duration: 0.6,
      },
    },
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      toast.error("Por favor selecciona una imagen");
      return;
    }

    setUploading(true);
    try {
      console.log("Preparando archivo para subir:", {
        name: selectedFile.name,
        size: selectedFile.size,
        type: selectedFile.type,
      });

      const formData = new FormData();
      formData.append("image", selectedFile);
      formData.append("description", description);

      const response = await api.addGalleryImage(formData);
      console.log("Respuesta del servidor:", response);

      toast.success("Imagen subida correctamente");
      onSuccess();
    } catch (error) {
      console.error("Error completo:", error);
      toast.error("Error al subir la imagen: " + (error as Error).message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <motion.div
      variants={formVariants}
      initial="hidden"
      animate="visible"
      className="bg-white rounded-lg shadow p-6"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Imagen
          </label>
          <ImageUpload
            onImageSelect={setSelectedFile}
            selectedFile={selectedFile}
            onClear={() => setSelectedFile(null)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Descripción
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
          />
        </div>

        <div className="flex justify-end space-x-3">
          <motion.button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Cancelar
          </motion.button>
          <motion.button
            type="submit"
            disabled={uploading || !selectedFile}
            className={`px-4 py-2 text-sm font-medium text-white rounded-md
              ${
                uploading || !selectedFile
                  ? "bg-purple-400 cursor-not-allowed"
                  : "bg-purple-600 hover:bg-purple-700"
              }`}
            whileHover={uploading || !selectedFile ? {} : { scale: 1.05 }}
            whileTap={uploading || !selectedFile ? {} : { scale: 0.95 }}
          >
            {uploading ? "Subiendo..." : "Subir Imagen"}
          </motion.button>
        </div>
      </form>
    </motion.div>
  );
}
