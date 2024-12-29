import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Service } from "../types";
import { Calendar } from "./Calendar";
import { TimeSlots } from "./TimeSlots";
import { api } from "../services/api";
import { toast } from "react-hot-toast";

interface AppointmentFormProps {
  selectedService: Service | null;
  onClose: () => void;
}

export function AppointmentForm({
  selectedService,
  onClose,
}: AppointmentFormProps) {
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    time: "",
  });

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
  };

  const formVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        duration: 0.6,
      },
    },
  };

  if (!selectedService) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!selectedDate) {
        toast.error("Por favor selecciona una fecha");
        return;
      }

      const appointment = {
        serviceId: selectedService._id,
        date: selectedDate.toISOString().split("T")[0],
        time: formData.time,
        name: formData.name,
        phone: formData.phone,
        status: "pending",
        duration: selectedService.duration,
      };

      await api.createAppointment(appointment);
      toast.success("Cita agendada con éxito");
      onClose();
    } catch (error) {
      console.error("Error submitting appointment:", error);
      toast.error("Error al agendar la cita");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          variants={modalVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
          className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        >
          <h2 className="text-2xl font-semibold mb-4">
            Reservar {selectedService.name}
          </h2>

          <div className="space-y-6">
            {!formData.time ? (
              <motion.div
                variants={formVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
              >
                <Calendar
                  selectedDate={selectedDate}
                  onSelect={setSelectedDate}
                />
                {selectedDate && (
                  <TimeSlots
                    date={selectedDate}
                    selectedTime={formData.time}
                    onSelectTime={(time) => setFormData({ ...formData, time })}
                    duration={selectedService.duration}
                  />
                )}
              </motion.div>
            ) : (
              <motion.form
                variants={formVariants}
                initial="hidden"
                animate="visible"
                onSubmit={handleSubmit}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Nombre completo
                  </label>
                  <input
                    type="text"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    required
                    pattern="[0-9]{9}"
                    title="Por favor ingrese un número de teléfono válido de 9 dígitos"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                  />
                </div>
                <motion.div className="pt-4" variants={formVariants}>
                  <p className="text-sm text-gray-600 mb-2">
                    Resumen de la cita:
                  </p>
                  <div className="bg-purple-50 p-4 rounded-md space-y-2">
                    <p className="text-sm">
                      <span className="font-medium">Servicio:</span>{" "}
                      {selectedService.name}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Fecha:</span>{" "}
                      {selectedDate?.toLocaleDateString("es-ES", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Hora:</span> {formData.time}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Duración:</span>{" "}
                      {selectedService.duration} minutos
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Precio:</span> $
                      {selectedService.price}
                    </p>
                  </div>
                </motion.div>
                <div className="flex justify-between pt-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={() => setFormData({ ...formData, time: "" })}
                    className="px-4 py-2 text-sm font-medium text-purple-600 bg-purple-50 rounded-md hover:bg-purple-100"
                  >
                    Cambiar fecha/hora
                  </motion.button>
                  <div className="space-x-3">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                    >
                      Cancelar
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={loading}
                      className={`px-4 py-2 text-sm font-medium text-white rounded-md ${
                        loading
                          ? "bg-purple-400 cursor-not-allowed"
                          : "bg-purple-600 hover:bg-purple-700"
                      }`}
                    >
                      {loading ? "Confirmando..." : "Confirmar"}
                    </motion.button>
                  </div>
                </div>
              </motion.form>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
