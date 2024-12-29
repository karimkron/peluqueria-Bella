const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema({
  serviceId: { type: String, required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  name: { type: String, required: true },
  phone: { type: String, required: true },
  status: { type: String, default: "pending" },
  duration: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Appointment", appointmentSchema);
