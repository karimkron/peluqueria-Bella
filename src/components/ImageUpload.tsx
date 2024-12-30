import React, { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, X } from "lucide-react";
import { toast } from "react-hot-toast";

interface ImageUploadProps {
  onImageSelect: (file: File) => void;
  selectedFile: File | null;
  onClear: () => void;
  maxSize?: number;
}

export function ImageUpload({
  onImageSelect,
  selectedFile,
  onClear,
  maxSize = 5 * 1024 * 1024,
}: ImageUploadProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (file) {
        if (file.size > maxSize) {
          toast.error(
            `La imagen no debe superar los ${maxSize / (1024 * 1024)}MB`
          );
          return;
        }
        console.log("Archivo seleccionado:", {
          name: file.name,
          size: file.size,
          type: file.type,
        });
        onImageSelect(file);
      }
    },
    [onImageSelect, maxSize]
  );
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".webp"],
    },
    maxFiles: 1,
    maxSize,
  });

  const containerVariants = {
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

  const imageVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        type: "spring",
        bounce: 0.4,
        duration: 0.6,
      },
    },
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClear();
  };

  return (
    <motion.div
      className="space-y-4"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200 ease-in-out transform hover:scale-[1.02] active:scale-[0.98]
          ${
            isDragActive
              ? "border-purple-500 bg-purple-50"
              : "border-gray-300 hover:border-purple-400"
          }`}
      >
        <input {...getInputProps()} />
        <AnimatePresence mode="wait">
          {!selectedFile ? (
            <motion.div
              key="upload"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-sm text-gray-600">
                {isDragActive
                  ? "Suelta la imagen aquí"
                  : "Arrastra una imagen o haz clic para seleccionar"}
              </p>
              <p className="mt-1 text-xs text-gray-500">
                PNG, JPG o WEBP (máx. {maxSize / (1024 * 1024)}MB)
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="preview"
              className="relative"
              variants={imageVariants}
              initial="hidden"
              animate="visible"
            >
              <img
                src={URL.createObjectURL(selectedFile)}
                alt="Preview"
                className="w-full h-48 object-cover rounded-lg"
              />
              <motion.button
                onClick={handleClear}
                className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <X className="w-4 h-4" />
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
