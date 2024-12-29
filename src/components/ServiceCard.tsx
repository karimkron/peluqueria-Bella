import React from "react";
import { Clock, DollarSign } from "lucide-react";
import { motion } from "framer-motion";
import { Service } from "../types";

interface ServiceCardProps {
  service: Service;
  onSelect: (service: Service) => void;
  isAdmin?: boolean;
  onEdit?: (service: Service) => void;
  onDelete?: (id: string) => void;
}

export function ServiceCard({
  service,
  onSelect,
  isAdmin = false,
  onEdit,
  onDelete,
}: ServiceCardProps) {
  return (
    <motion.div
      className="bg-white rounded-xl shadow-lg p-6"
      initial={{ opacity: 0, x: -50 }}
      whileInView={{
        opacity: 1,
        x: 0,
        transition: {
          type: "spring",
          bounce: 0.4,
          duration: 1,
        },
      }}
      viewport={{ once: true }}
      whileHover={{
        scale: 1.03,
        transition: { duration: 0.2 },
      }}
    >
      <h3 className="text-xl font-semibold text-gray-800 mb-3">
        {service.name}
      </h3>
      <p className="text-gray-600 mb-4">{service.description}</p>
      <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
        <div className="flex items-center">
          <Clock className="w-4 h-4 mr-1 text-purple-500" />
          <span>{service.duration} min</span>
        </div>
        <div className="flex items-center">
          <DollarSign className="w-4 h-4 mr-1 text-purple-500" />
          <span>${service.price}</span>
        </div>
      </div>

      {isAdmin ? (
        <div className="flex space-x-2">
          <motion.button
            onClick={() => onEdit && onEdit(service)}
            className="flex-1 bg-purple-100 text-purple-600 py-2.5 px-4 rounded-lg hover:bg-purple-200 transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Editar
          </motion.button>
          <motion.button
            onClick={() => onDelete && onDelete(service._id)}
            className="flex-1 bg-red-100 text-red-600 py-2.5 px-4 rounded-lg hover:bg-red-200 transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Eliminar
          </motion.button>
        </div>
      ) : (
        <motion.button
          onClick={() => onSelect(service)}
          className="w-full bg-purple-600 text-white py-2.5 px-4 rounded-lg hover:bg-purple-700 transition-colors"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Reservar
        </motion.button>
      )}
    </motion.div>
  );
}
