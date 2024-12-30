const API_URL = "https://peluqueria-bella-api.onrender.com/api";

export const api = {
  // Servicios existentes para citas
  async getAppointments(date: string) {
    const res = await fetch(`${API_URL}/appointments/${date}`);
    return res.json();
  },

  async createAppointment(appointment: any) {
    const res = await fetch(`${API_URL}/appointments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(appointment),
    });
    return res.json();
  },

  async updateAppointmentStatus(id: string, status: string) {
    const res = await fetch(`${API_URL}/appointments/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    return res.json();
  },

  async deleteAppointment(id: string) {
    const res = await fetch(`${API_URL}/appointments/${id}`, {
      method: "DELETE",
    });
    return res.json();
  },

  // Nuevos servicios para el panel de administración
  async getServices() {
    const res = await fetch(`${API_URL}/services`);
    return res.json();
  },

  async createService(service: any) {
    const res = await fetch(`${API_URL}/services`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(service),
    });
    return res.json();
  },

  async updateService(id: string, service: any) {
    const res = await fetch(`${API_URL}/services/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(service),
    });
    return res.json();
  },

  async deleteService(id: string) {
    const res = await fetch(`${API_URL}/services/${id}`, {
      method: "DELETE",
    });
    return res.json();
  },

  async getGallery() {
    const res = await fetch(`${API_URL}/gallery`);
    return res.json();
  },

  async addGalleryImage(formData: FormData) {
    const res = await fetch(`${API_URL}/gallery`, {
      method: "POST",
      body: formData,
    });
    if (!res.ok) {
      throw new Error("Error al subir la imagen");
    }
    return res.json();
  },

  async deleteGalleryImage(id: string) {
    const res = await fetch(`${API_URL}/gallery/${id}`, {
      method: "DELETE",
    });
    return res.json();
  },

  async updateContactInfo(info: any) {
    const res = await fetch(`${API_URL}/contact`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(info),
    });
    if (!res.ok) {
      throw new Error("Error updating contact info");
    }
    return res.json();
  },

  async getContactInfo() {
    const res = await fetch(`${API_URL}/contact`);
    if (!res.ok) {
      throw new Error("Error getting contact info");
    }
    return res.json();
  },
};
