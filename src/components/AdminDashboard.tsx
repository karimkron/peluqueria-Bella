import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "react-hot-toast";
import { Service, GalleryImage, ContactInfo } from "../types";
import { api } from "../services/api";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Tab } from "@headlessui/react";
import { DayPicker } from "react-day-picker";
import {
  Pencil,
  Trash2,
  Image as ImageIcon,
  Plus,
  LogOut,
  Loader,
} from "lucide-react";
import { ImageUpload } from "./ImageUpload";
import { ServiceForm } from "./ServiceForm";
import { v4 as uuidv4 } from "uuid";
import "react-day-picker/dist/style.css";
import { storage } from "../config/firebase";
import { deleteImageFromStorage, uploadImage } from "../services/firebase";
import { getStorage, ref, deleteObject } from "firebase/storage";

interface ServiceFormData {
  _id?: string;
  name: string;
  description: string;
  duration: number;
  price: number;
}

interface Appointment {
  _id: string;
  name: string;
  phone: string;
  serviceId: string;
  time: string;
  status: "pending" | "confirmed" | "cancelled";
}

function AppointmentsList({ date }: { date: Date }) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [services, setServices] = useState<Service[]>([]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [appointmentsData, servicesData] = await Promise.all([
          api.getAppointments(date.toISOString().split("T")[0]),
          api.getServices(),
        ]);
        setAppointments(appointmentsData);
        setServices(servicesData);
      } catch (error) {
        console.error("Error loading data:", error);
        toast.error("Error al cargar los datos");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [date]);

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await api.updateAppointmentStatus(id, status);
      const updatedAppointments = await api.getAppointments(
        date.toISOString().split("T")[0]
      );
      setAppointments(updatedAppointments);
      toast.success("Estado actualizado correctamente");
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Error al actualizar el estado");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.deleteAppointment(id);
      setAppointments(appointments.filter((app) => app._id !== id));
      toast.success("Cita eliminada correctamente");
    } catch (error) {
      console.error("Error deleting appointment:", error);
      toast.error("Error al eliminar la cita");
    }
  };

  const getServiceName = (serviceId: string) => {
    const service = services.find((s) => s._id === serviceId);
    return service?.name || "Servicio no encontrado";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  if (appointments.length === 0) {
    return (
      <p className="text-gray-600">No hay citas programadas para este día.</p>
    );
  }

  return (
    <div className="space-y-4">
      {appointments.map((appointment) => (
        <motion.div
          key={appointment._id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-50 rounded-lg p-4"
        >
          <div className="flex justify-between items-start">
            <div>
              <h4 className="font-medium text-gray-900">{appointment.name}</h4>
              <p className="text-sm text-gray-500">{appointment.phone}</p>
              <p className="text-sm text-gray-600">
                {getServiceName(appointment.serviceId)}
              </p>
              <p className="text-sm text-purple-600">{appointment.time}</p>
            </div>
            <div className="flex space-x-2">
              <select
                value={appointment.status}
                onChange={(e) =>
                  handleStatusChange(appointment._id, e.target.value)
                }
                className="text-sm rounded-md border-gray-300 focus:border-purple-500 focus:ring-purple-500"
              >
                <option value="pending">Pendiente</option>
                <option value="confirmed">Confirmada</option>
                <option value="cancelled">Cancelada</option>
              </select>
              <button
                onClick={() => handleDelete(appointment._id)}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

export function AdminDashboard() {
  const { logout } = useAuth();
  const [services, setServices] = useState<Service[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [editingService, setEditingService] = useState<ServiceFormData | null>(
    null
  );
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
  const [contactInfo, setContactInfo] = useState<ContactInfo>({
    address: "",
    phone: "",
    email: "",
    schedule: "",
  });
  const [editingContactInfo, setEditingContactInfo] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [showServiceForm, setShowServiceForm] = useState(false);

  useEffect(() => {
    const cleanupGallery = async () => {
      try {
        // Filtrar imágenes con URLs blob
        const validImages = galleryImages.filter(
          (img) => !img.url.startsWith("blob:")
        );

        // Si hay imágenes inválidas, eliminarlas de la base de datos
        for (const img of galleryImages) {
          if (img.url.startsWith("blob:")) {
            try {
              await api.deleteGalleryImage(img._id);
            } catch (error) {
              console.error("Error deleting invalid image:", error);
            }
          }
        }

        // Actualizar el estado con solo las imágenes válidas
        if (validImages.length !== galleryImages.length) {
          setGalleryImages(validImages);
        }
      } catch (error) {
        console.error("Error cleaning gallery:", error);
      }
    };

    if (galleryImages.length > 0) {
      cleanupGallery();
    }
  }, [galleryImages.length]);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      const [servicesData, galleryData, contactData] = await Promise.all([
        api.getServices(),
        api.getGallery(),
        api.getContactInfo(),
      ]);
      setServices(servicesData);
      setGalleryImages(galleryData);
      if (contactData) {
        setContactInfo(contactData);
      }
    } catch (error) {
      console.error("Error loading initial data:", error);
      toast.error("Error al cargar los datos");
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  const handleServiceSubmit = async (serviceData: Omit<Service, "_id">) => {
    try {
      if (editingService?._id) {
        await api.updateService(editingService._id, serviceData);
        toast.success("Servicio actualizado correctamente");
      } else {
        await api.createService(serviceData);
        toast.success("Servicio creado correctamente");
      }
      const updatedServices = await api.getServices();
      setServices(updatedServices);
      setEditingService(null);
      setShowServiceForm(false);
    } catch (error) {
      console.error("Error saving service:", error);
      toast.error("Error al guardar el servicio");
    }
  };

  const handleServiceDelete = async (id: string) => {
    try {
      await api.deleteService(id);
      setServices(services.filter((service) => service._id !== id));
      toast.success("Servicio eliminado correctamente");
    } catch (error) {
      console.error("Error deleting service:", error);
      toast.error("Error al eliminar el servicio");
    }
  };

  const handleContactInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Primero actualizamos en el backend
      await api.updateContactInfo({
        address: contactInfo.address,
        phone: contactInfo.phone,
        email: contactInfo.email,
        schedule: contactInfo.schedule,
      });

      // Refrescamos los datos desde el backend
      const updatedContact = await api.getContactInfo();
      setContactInfo(updatedContact);
      setEditingContactInfo(false);
      toast.success("Información de contacto actualizada correctamente");

      // Forzamos una recarga de los datos iniciales
      await loadInitialData();
    } catch (error) {
      console.error("Error updating contact info:", error);
      toast.error("Error al actualizar la información de contacto");
    }
  };

  const handleImageUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedFile) {
      toast.error("Por favor selecciona una imagen");
      return;
    }

    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append("image", selectedFile);
      formData.append(
        "description",
        (e.target as HTMLFormElement).description.value
      );

      // Subir imagen
      const newImage = await api.addGalleryImage(formData);

      // Actualizar galería
      const updatedGallery = await api.getGallery();
      setGalleryImages(updatedGallery);
      setSelectedFile(null);
      toast.success("Imagen subida correctamente");

      // Limpiar el formulario
      (e.target as HTMLFormElement).reset();
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Error al subir la imagen");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleImageDelete = async (id: string) => {
    try {
      const imageToDelete = galleryImages.find((img) => img._id === id);
      if (imageToDelete) {
        // Solo eliminamos de la base de datos ya que estamos usando almacenamiento local
        await api.deleteGalleryImage(id);
        setGalleryImages(galleryImages.filter((image) => image._id !== id));
        toast.success("Imagen eliminada correctamente");
      }
    } catch (error) {
      console.error("Error deleting image:", error);
      toast.error("Error al eliminar la imagen");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-2xl font-bold text-gray-900">
              Panel de Administración
            </h1>
            <button
              onClick={handleLogout}
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <LogOut className="w-5 h-5 mr-2" />
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tab.Group>
          <Tab.List className="flex space-x-1 rounded-xl bg-purple-900/20 p-1">
            <Tab
              className={({ selected }) =>
                `w-full rounded-lg py-2.5 text-sm font-medium leading-5
                ${
                  selected
                    ? "bg-white text-purple-700 shadow"
                    : "text-purple-600 hover:bg-white/[0.12] hover:text-purple-800"
                }`
              }
            >
              Servicios
            </Tab>
            <Tab
              className={({ selected }) =>
                `w-full rounded-lg py-2.5 text-sm font-medium leading-5
                ${
                  selected
                    ? "bg-white text-purple-700 shadow"
                    : "text-purple-600 hover:bg-white/[0.12] hover:text-purple-800"
                }`
              }
            >
              Citas
            </Tab>
            <Tab
              className={({ selected }) =>
                `w-full rounded-lg py-2.5 text-sm font-medium leading-5
                ${
                  selected
                    ? "bg-white text-purple-700 shadow"
                    : "text-purple-600 hover:bg-white/[0.12] hover:text-purple-800"
                }`
              }
            >
              Galería
            </Tab>
            <Tab
              className={({ selected }) =>
                `w-full rounded-lg py-2.5 text-sm font-medium leading-5
                ${
                  selected
                    ? "bg-white text-purple-700 shadow"
                    : "text-purple-600 hover:bg-white/[0.12] hover:text-purple-800"
                }`
              }
            >
              Contacto
            </Tab>
          </Tab.List>

          <Tab.Panels className="mt-6">
            <Tab.Panel>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-medium text-gray-900">
                    Gestionar Servicios
                  </h3>
                  <button
                    onClick={() => {
                      setEditingService({
                        name: "",
                        description: "",
                        duration: 30,
                        price: 0,
                      });
                      setShowServiceForm(true);
                    }}
                    className="flex items-center text-purple-600 hover:text-purple-700"
                  >
                    <Plus className="w-5 h-5 mr-1" />
                    Nuevo Servicio
                  </button>
                </div>

                {showServiceForm ? (
                  <ServiceForm
                    initialData={editingService}
                    onSubmit={async (data) => {
                      try {
                        if (editingService?._id) {
                          await api.updateService(editingService._id, data);
                          toast.success("Servicio actualizado correctamente");
                        } else {
                          await api.createService(data);
                          toast.success("Servicio creado correctamente");
                        }
                        const updatedServices = await api.getServices();
                        setServices(updatedServices);
                        setEditingService(null);
                        setShowServiceForm(false);
                      } catch (error) {
                        console.error("Error saving service:", error);
                        toast.error("Error al guardar el servicio");
                      }
                    }}
                    onCancel={() => {
                      setEditingService(null);
                      setShowServiceForm(false);
                    }}
                  />
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {services.map((service) => (
                      <motion.div
                        key={service._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-gray-50 rounded-lg p-6"
                      >
                        <h4 className="text-lg font-medium text-gray-900 mb-2">
                          {service.name}
                        </h4>
                        <p className="text-gray-600 mb-4">
                          {service.description}
                        </p>
                        <div className="flex justify-between text-sm text-gray-500 mb-4">
                          <span>{service.duration} min</span>
                          <span>${service.price}</span>
                        </div>
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => {
                              setEditingService(service);
                              setShowServiceForm(true);
                            }}
                            className="text-purple-600 hover:text-purple-700"
                          >
                            <Pencil className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleServiceDelete(service._id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </Tab.Panel>

            <Tab.Panel>
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-6">
                  Calendario de Citas
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <DayPicker
                      mode="single"
                      selected={selectedDate}
                      onSelect={(date) => date && setSelectedDate(date)}
                      locale={es}
                    />
                  </div>
                  <div>
                    <h4 className="text-md font-medium text-gray-900 mb-4">
                      Citas para el{" "}
                      {format(selectedDate, "d 'de' MMMM, yyyy", {
                        locale: es,
                      })}
                    </h4>
                    <AppointmentsList date={selectedDate} />
                  </div>
                </div>
              </div>
            </Tab.Panel>

            <Tab.Panel>
              <div className="bg-white rounded-lg shadow p-6">
                <form
                  onSubmit={handleImageUpload}
                  className="grid grid-cols-1 gap-6 mb-8"
                >
                  <h3 className="text-lg font-medium text-gray-900">
                    Agregar Nueva Imagen
                  </h3>
                  <div className="space-x-4">
                    <button
                      onClick={async () => {
                        try {
                          toast.loading("Limpiando imágenes inválidas...");
                          const validImages = galleryImages.filter(
                            (img) => !img.url.startsWith("blob:")
                          );

                          for (const img of galleryImages) {
                            if (img.url.startsWith("blob:")) {
                              await api.deleteGalleryImage(img._id);
                            }
                          }

                          setGalleryImages(validImages);
                          toast.success("Imágenes limpiadas correctamente");
                        } catch (error) {
                          console.error("Error cleaning images:", error);
                          toast.error("Error al limpiar las imágenes");
                        }
                      }}
                      className="px-4 py-2 text-sm font-medium text-white bg-yellow-600 rounded-md hover:bg-yellow-700"
                    >
                      Limpiar Imágenes Inválidas
                    </button>
                  </div>
                  <ImageUpload
                    onImageSelect={setSelectedFile}
                    selectedFile={selectedFile}
                    onClear={() => setSelectedFile(null)}
                  />

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Descripción
                    </label>
                    <input
                      type="text"
                      name="description"
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                    />
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={uploadingImage || !selectedFile}
                      className={`px-4 py-2 text-sm font-medium text-white rounded-md
                        ${
                          uploadingImage || !selectedFile
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-purple-600 hover:bg-purple-700"
                        }`}
                    >
                      {uploadingImage ? "Subiendo..." : "Subir Imagen"}
                    </button>
                  </div>
                </form>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {galleryImages.map((image) => (
                    <motion.div
                      key={image._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-gray-50 rounded-lg overflow-hidden"
                    >
                      <div className="aspect-w-16 aspect-h-9 relative">
                        <img
                          src={image.url}
                          alt={image.description}
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-4">
                        <p className="text-gray-600 mb-4">
                          {image.description}
                        </p>
                        <button
                          onClick={() => handleImageDelete(image._id)}
                          className="text-red-600 hover:text-red-700 flex items-center space-x-1"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>Eliminar</span>
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </Tab.Panel>

            <Tab.Panel>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-medium text-gray-900">
                    Información de Contacto
                  </h3>
                  <button
                    onClick={() => setEditingContactInfo(!editingContactInfo)}
                    className="text-purple-600 hover:text-purple-700"
                  >
                    <Pencil className="w-5 h-5" />
                  </button>
                </div>

                {editingContactInfo ? (
                  <form
                    onSubmit={handleContactInfoSubmit}
                    className="space-y-4"
                  >
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Dirección
                      </label>
                      <input
                        type="text"
                        value={contactInfo.address}
                        onChange={(e) =>
                          setContactInfo({
                            ...contactInfo,
                            address: e.target.value,
                          })
                        }
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Teléfono
                      </label>
                      <input
                        type="text"
                        value={contactInfo.phone}
                        onChange={(e) =>
                          setContactInfo({
                            ...contactInfo,
                            phone: e.target.value,
                          })
                        }
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Email
                      </label>
                      <input
                        type="email"
                        value={contactInfo.email}
                        onChange={(e) =>
                          setContactInfo({
                            ...contactInfo,
                            email: e.target.value,
                          })
                        }
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Horario
                      </label>
                      <input
                        type="text"
                        value={contactInfo.schedule}
                        onChange={(e) =>
                          setContactInfo({
                            ...contactInfo,
                            schedule: e.target.value,
                          })
                        }
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                      />
                    </div>
                    <div className="flex justify-end space-x-3 pt-4">
                      <button
                        type="button"
                        onClick={() => setEditingContactInfo(false)}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700"
                      >
                        Guardar
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-700">
                        Dirección
                      </h4>
                      <p className="mt-1 text-gray-600">
                        {contactInfo.address}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-700">
                        Teléfono
                      </h4>
                      <p className="mt-1 text-gray-600">{contactInfo.phone}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-700">
                        Email
                      </h4>
                      <p className="mt-1 text-gray-600">{contactInfo.email}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-700">
                        Horario
                      </h4>
                      <p className="mt-1 text-gray-600">
                        {contactInfo.schedule}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </Tab.Panel>
          </Tab.Panels>
        </Tab.Group>
      </div>
    </div>
  );
}
