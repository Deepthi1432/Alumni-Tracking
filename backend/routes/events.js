const express = require("express");
const router = express.Router();
const Event = require("../models/Event");
const notifyAllAlumni = require("../utils/notifyAllAlumni");
const nodemailer = require("nodemailer");
const Notification = require("../models/Notification");
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.SYSTEM_EMAIL,
        pass: process.env.SYSTEM_EMAIL_PASSWORD
    },
    tls: {
        rejectUnauthorized: false
    }
});
// CREATE EVENT
router.post("/", async (req, res) => {
    try {
        console.log("Incoming request body:", req.body);

        const {
            eventTitle,
            eventDescription,
            eventDate,
            eventVenue
        } = req.body;

        const event = new Event({
            title: eventTitle,
            description: eventDescription,
            date: eventDate,
            venue: eventVenue
        });

        await event.save();
await Notification.create({
    title: event.title,
    message: event.description,
    type: "event"
});

await notifyAllAlumni(
    transporter,
    `📅 New Alumni Event: ${event.title}`,
    `
    <h2>${event.title}</h2>
    <p>${event.description}</p>
    <p><strong>Date:</strong> ${event.date}</p>
    <p><strong>Venue:</strong> ${event.venue}</p>
    `
);
        res.status(201).json({
            success: true,
            message: "Event Added Successfully",
            event
        });

    } catch (err) {
        console.error("Database Save Error:", err.message);

        res.status(500).json({
            success: false,
            error: err.message
        });
    }
});

// GET ALL EVENTS
router.get("/", async (req, res) => {
    try {
        const events = await Event.find().sort({ createdAt: -1 });

        res.status(200).json(events);

    } catch (err) {
        console.error("Fetch Events Error:", err.message);

        res.status(500).json({
            success: false,
            error: err.message
        });
    }
});

// UPDATE EVENT
router.put("/:id", async (req, res) => {
    try {
        const {
            eventTitle,
            eventDescription,
            eventDate,
            eventVenue
        } = req.body;

        const updatedEvent = await Event.findByIdAndUpdate(
            req.params.id,
            {
                title: eventTitle,
                description: eventDescription,
                date: eventDate,
                venue: eventVenue
            },
            {
                new: true,
                runValidators: true
            }
        );

        if (!updatedEvent) {
            return res.status(404).json({
                success: false,
                error: "Event not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Event Updated Successfully",
            updatedEvent
        });

    } catch (err) {
        console.error("Update Event Error:", err.message);

        res.status(500).json({
            success: false,
            error: err.message
        });
    }
});

// DELETE EVENT
router.delete("/:id", async (req, res) => {
    try {
        const deletedEvent = await Event.findByIdAndDelete(req.params.id);

        if (!deletedEvent) {
            return res.status(404).json({
                success: false,
                error: "Event not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Event Deleted Successfully"
        });

    } catch (err) {
        console.error("Delete Event Error:", err.message);

        res.status(500).json({
            success: false,
            error: err.message
        });
    }
});

module.exports = router;