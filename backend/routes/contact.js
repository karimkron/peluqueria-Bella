const router = require("express").Router();
const Contact = require("../models/Contact");

router.put("/", async (req, res) => {
  try {
    let contact = await Contact.findOne();
    if (contact) {
      contact = await Contact.findByIdAndUpdate(contact._id, req.body, {
        new: true,
        runValidators: true,
      });
    } else {
      contact = new Contact(req.body);
      await contact.save();
    }
    res.json(contact);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.get("/", async (req, res) => {
  try {
    const contact = await Contact.findOne();
    res.json(
      contact || {
        address: "",
        phone: "",
        email: "",
        schedule: "",
      }
    );
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
