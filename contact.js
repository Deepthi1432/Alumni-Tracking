// backend/routes/contact.js
const express = require('express');
const Contact = require('./Contact');

module.exports = (io) => {
  const router = express.Router();

  // Get all contact messages
  router.get('/', async (req, res) => {
    const contacts = await Contact.find();
    res.json(contacts);
  });

  // Add new contact message
  router.post('/', async (req, res) => {
    const newContact = new Contact(req.body);
    await newContact.save();
    io.emit('contactAdded', newContact); // notify all clients
    res.json({ message: 'Contact message added successfully!', contact: newContact });
  });

  // Delete contact message
  router.delete('/:id', async (req, res) => {
    await Contact.findByIdAndDelete(req.params.id);
    io.emit('contactDeleted', req.params.id); // notify all clients
    res.json({ message: 'Contact message deleted successfully!' });
  });

  return router;
};
