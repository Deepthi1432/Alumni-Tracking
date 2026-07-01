const express = require("express");
const router = express.Router();
const Announcement = require("../models/Announcement");
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


/* =========================
   ADD ANNOUNCEMENT
========================= */

router.post("/", async (req, res) => {
    try {
        console.log("Incoming Announcement:", req.body);

        const {
            announcementTitle,
            announcementMessage,
            title,
            message
        } = req.body;

        const announcement = new Announcement({
            title: announcementTitle || title,
            message: announcementMessage || message
        });

        await announcement.save();
        await Notification.create({
    title: announcement.title,
    message: announcement.message,
    type: "announcement"
});
await notifyAllAlumni(
    transporter,
    `📢 ${announcement.title}`,
    `
    <h2>${announcement.title}</h2>
    <p>${announcement.message}</p>
    `
);
        res.status(201).json({
            success: true,
            message: "Announcement Added Successfully",
            announcement
        });

    } catch (err) {
        console.error("Announcement Save Error:", err.message);

        res.status(500).json({
            success: false,
            error: err.message
        });
    }
});

/* =========================
   GET ALL ANNOUNCEMENTS
========================= */

router.get("/", async (req, res) => {
    try {
        const announcements = await Announcement.find()
            .sort({ createdAt: -1 });

        res.status(200).json(announcements);

    } catch (err) {
        console.error("Fetch Announcement Error:", err.message);

        res.status(500).json({
            success: false,
            error: err.message
        });
    }
});

/* =========================
   UPDATE ANNOUNCEMENT
========================= */

router.put("/:id", async (req, res) => {
    try {
        const {
            announcementTitle,
            announcementMessage,
            title,
            message
        } = req.body;

        const updatedAnnouncement = await Announcement.findByIdAndUpdate(
            req.params.id,
            {
                title: announcementTitle || title,
                message: announcementMessage || message
            },
            {
                new: true,
                runValidators: true
            }
        );

        if (!updatedAnnouncement) {
            return res.status(404).json({
                success: false,
                error: "Announcement not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Announcement Updated Successfully",
            updatedAnnouncement
        });

    } catch (err) {
        console.error("Update Announcement Error:", err.message);

        res.status(500).json({
            success: false,
            error: err.message
        });
    }
});

/* =========================
   DELETE ANNOUNCEMENT
========================= */

router.delete("/:id", async (req, res) => {
    try {
        const deletedAnnouncement = await Announcement.findByIdAndDelete(
            req.params.id
        );

        if (!deletedAnnouncement) {
            return res.status(404).json({
                success: false,
                error: "Announcement not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Announcement Deleted Successfully"
        });

    } catch (err) {
        console.error("Delete Announcement Error:", err.message);

        res.status(500).json({
            success: false,
            error: err.message
        });
    }
});

module.exports = router;