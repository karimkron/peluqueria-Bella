import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Scissors, MapPin, Phone, Clock, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { api } from "../services/api";
import { Service, GalleryImage, ContactInfo } from "../types";
import { ServiceCard } from "./ServiceCard";
import { ReviewCard } from "./ReviewCard";
import { AppointmentForm } from "./AppointmentForm";
import { Navbar } from "./Navbar";
import { GalleryGrid } from "./GalleryGrid";
import { reviews } from "../data/reviews";
import { toast } from "react-hot-toast";

const API_BASE_URL = "http://localhost:5000";

export function PublicHome() {
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
  const [contactInfo, setContactInfo] = useState<ContactInfo>({
    address: "Cargando...",
    phone: "Cargando...",
    email: "Cargando...",
    schedule: "Cargando...",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      try {
        const [servicesData, galleryData, contactData] = await Promise.all([
          api.getServices(),
          api.getGallery(),
          api.getContactInfo(),
        ]);
        setServices(servicesData || []);
        setGalleryImages(galleryData || []);
        if (contactData) {
          setContactInfo(contactData);
        }
      } catch (error) {
        console.error("Error loading data:", error);
        toast.error("Error al cargar los datos");
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Hero Section */}
      <header id="hero" className="relative h-screen">
        <div className="absolute inset-0 bg-black/50 z-10" />
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=1920&q=80')",
          }}
        />
        <div className="relative z-20 h-full flex items-center justify-center text-white">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="text-center px-4"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 1 }}
              className="bg-purple-600 rounded-full p-4 inline-block mb-8"
            >
              <Scissors className="w-16 h-16" />
            </motion.div>
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              Bella Peluquería
            </h1>
            <p className="text-xl md:text-2xl mb-12 max-w-2xl mx-auto">
              Donde el estilo se encuentra con la excelencia. Transforma tu
              imagen con nuestros expertos estilistas.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-purple-600 text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-purple-700 transition-colors"
              onClick={() =>
                document
                  .getElementById("servicios")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
            >
              Reserva tu cita
              <ChevronRight className="inline-block ml-2" />
            </motion.button>
          </motion.div>
        </div>
      </header>

      {/* Info Section */}
      <motion.section
        className="py-20 bg-gradient-to-b from-purple-900 to-purple-700 text-white"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={containerVariants}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-12"
            variants={containerVariants}
          >
            <motion.div variants={itemVariants} className="text-center">
              <MapPin className="w-12 h-12 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Ubicación</h3>
              <p className="text-purple-100">{contactInfo.address}</p>
            </motion.div>
            <motion.div variants={itemVariants} className="text-center">
              <Phone className="w-12 h-12 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Contacto</h3>
              <p className="text-purple-100">{contactInfo.phone}</p>
            </motion.div>
            <motion.div variants={itemVariants} className="text-center">
              <Clock className="w-12 h-12 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Horario</h3>
              <p className="text-purple-100">{contactInfo.schedule}</p>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* Gallery Section */}
      <section id="galeria" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Nuestra Galería
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Explora nuestros trabajos más destacados y déjate inspirar
            </p>
          </motion.div>

          <GalleryGrid images={galleryImages} />
        </div>
      </section>

      {/* Services Section */}
      <section id="servicios" className="py-20 bg-gray-50">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={containerVariants}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        >
          <motion.div variants={itemVariants} className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Nuestros Servicios
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Ofrecemos una amplia gama de servicios profesionales para
              satisfacer todas tus necesidades
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {services.map((service, index) => (
              <motion.div
                key={service._id}
                variants={itemVariants}
                custom={index}
              >
                <ServiceCard service={service} onSelect={setSelectedService} />
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* Reviews Section */}
      <section id="resenas" className="py-20 bg-white">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={containerVariants}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        >
          <motion.div variants={itemVariants} className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Lo que dicen nuestros clientes
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Descubre las experiencias de quienes ya han confiado en nosotros
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {reviews.map((review, index) => (
              <motion.div
                key={review.id}
                variants={itemVariants}
                custom={index}
              >
                <ReviewCard review={review} />
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="bg-purple-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-2">
              <Scissors className="w-6 h-6" />
              <span className="font-semibold">Bella Peluquería</span>
            </div>
            <p className="text-purple-200">
              © 2024 Bella Peluquería. Todos los derechos reservados.
            </p>
            <Link
              to="/admin"
              className="text-purple-200 hover:text-white transition-colors"
            >
              Administrador
            </Link>
          </div>
        </div>
      </footer>

      {/* Appointment Form Modal */}
      {selectedService && (
        <AppointmentForm
          selectedService={selectedService}
          onClose={() => setSelectedService(null)}
        />
      )}
    </div>
  );
}
