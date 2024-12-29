const router = require("express").Router();
const Appointment = require("../models/Appointment");

// Obtener todas las citas de un día
router.get("/:date", async (req, res) => {
  try {
    const appointments = await Appointment.find({ date: req.params.date });
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Crear nueva cita
router.post("/", async (req, res) => {
  const appointment = new Appointment(req.body);
  try {
    const newAppointment = await appointment.save();
    res.status(201).json(newAppointment);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Actualizar estado de cita
router.patch("/:id", async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );
    res.json(appointment);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Eliminar cita
router.delete("/:id", async (req, res) => {
  try {
    await Appointment.findByIdAndDelete(req.params.id);
    res.json({ message: "Cita eliminada" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
