import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Service } from "../types";

export interface ServiceFormData {
  _id?: string;
  name: string;
  description: string;
  duration: number;
  price: number;
}

interface ServiceFormProps {
  initialData: ServiceFormData | null;
  onSubmit: (data: ServiceFormData) => Promise<void>;
  onCancel: () => void;
}

export function ServiceForm({
  initialData,
  onSubmit,
  onCancel,
}: ServiceFormProps) {
  const [formData, setFormData] = useState<ServiceFormData>({
    name: "",
    description: "",
    duration: 30,
    price: 0,
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

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

  const buttonVariants = {
    hover: { scale: 1.05 },
    tap: { scale: 0.95 },
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  return (
    <motion.div
      variants={formVariants}
      initial="hidden"
      animate="visible"
      className="bg-white rounded-lg shadow p-6"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Nombre del servicio
          </label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Descripción
          </label>
          <textarea
            required
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Duración (minutos)
          </label>
          <input
            type="number"
            required
            min="15"
            step="15"
            value={formData.duration}
            onChange={(e) =>
              setFormData({ ...formData, duration: Number(e.target.value) })
            }
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Precio ($)
          </label>
          <input
            type="number"
            required
            min="0"
            step="0.01"
            value={formData.price}
            onChange={(e) =>
              setFormData({ ...formData, price: Number(e.target.value) })
            }
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
          />
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <motion.button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
          >
            Cancelar
          </motion.button>
          <motion.button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700"
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
          >
            {initialData?._id ? "Actualizar" : "Crear"} Servicio
          </motion.button>
        </div>
      </form>
    </motion.div>
  );
}
