import React from "react";
import { motion } from "framer-motion";
import { ContactInfo } from "../types";

interface ContactFormProps {
  contactInfo: ContactInfo;
  onSubmit: (info: ContactInfo) => Promise<void>;
  onCancel: () => void;
}

export function ContactForm({
  contactInfo,
  onSubmit,
  onCancel,
}: ContactFormProps) {
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const updatedInfo = {
      ...contactInfo,
      address: formData.get("address") as string,
      phone: formData.get("phone") as string,
      email: formData.get("email") as string,
      schedule: formData.get("schedule") as string,
    };
    await onSubmit(updatedInfo);
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
      onSubmit={handleSubmit}
    >
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Dirección
        </label>
        <input
          type="text"
          name="address"
          defaultValue={contactInfo.address}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Teléfono
        </label>
        <input
          type="text"
          name="phone"
          defaultValue={contactInfo.phone}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Email</label>
        <input
          type="email"
          name="email"
          defaultValue={contactInfo.email}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Horario
        </label>
        <input
          type="text"
          name="schedule"
          defaultValue={contactInfo.schedule}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
        />
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700"
        >
          Guardar Cambios
        </button>
      </div>
    </motion.form>
  );
}
