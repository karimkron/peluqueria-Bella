import React from "react";
import { motion } from "framer-motion";
import { GalleryImage } from "../types";

const API_BASE_URL = "http://localhost:5000";

interface GalleryGridProps {
  images: GalleryImage[];
  className?: string;
}

export function GalleryGrid({ images = [], className = "" }: GalleryGridProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -50 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        type: "spring",
        bounce: 0.4,
        duration: 1,
      },
    },
  };

  if (!Array.isArray(images)) {
    return <div>No hay imágenes disponibles</div>;
  }

  if (images.length === 0) {
    return <div>No hay imágenes en la galería</div>;
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 ${className}`}
    >
      {images.map((image, index) => (
        <motion.div
          key={image._id}
          variants={itemVariants}
          custom={index}
          whileHover={{
            scale: 1.05,
            transition: { duration: 0.3 },
          }}
          className="relative aspect-square overflow-hidden rounded-xl shadow-lg"
        >
          <img
            src={`${API_BASE_URL}${image.url}`}
            alt={image.description}
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black bg-opacity-30 opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
            <p className="text-white text-sm">{image.description}</p>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}
