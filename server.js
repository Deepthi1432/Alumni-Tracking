require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const socketIo = require("socket.io");
const nodemailer = require("nodemailer");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = socketIo(server, { cors: { origin: "*" } });

// MODELS
const MassMail = require("./MassMail");
const User = require("./User");
const adminAuth = require("./auth");

// ROUTES
const notificationRoutes = require("./notifications");
const registrationRoutes = require("./eventRegistration");
const userRoutes = require("./users");
const adminRoutes = require("./admin");
const jobRoutes = require("./jobs");
const committeeRoutes = require("./committee");
const eventRoutes = require("./events");
const announcementRoutes = require("./announcement");
const galleryRoutes = require("./gallery");
const contactRoutes = require("./contact");

// MIDDLEWARE
app.use(cors({ origin: "*", methods: ["GET", "POST", "PUT", "DELETE"], allowedHeaders: ["Content-Type", "Authorization"] }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ROUTES
app.use("/users", userRoutes);
app.use("/admin", adminRoutes);
app.use("/admin/jobs", jobRoutes);
app.use("/admin/committee", committeeRoutes(io));
app.use("/admin/events", eventRoutes);
app.use("/admin/announcements", announcementRoutes);
app.use("/admin/gallery", galleryRoutes);
app.use("/admin/contacts", contactRoutes);
app.use("/notifications", notificationRoutes);
app.use("/event-registration", registrationRoutes);

// DATABASE
mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/alumni")
    .then(() => console.log("MongoDB connected successfully"))
    .catch(err => console.error("MongoDB connection error:", err));

// MASS EMAIL
app.post("/admin/send-mass-email", async (req, res) => {
    try {
        const { mailSubject, mailMessage } = req.body;
        const users = await User.find({ email: { $exists: true, $ne: "" } }, "email");
        const emailList = users.map(u => u.email).filter(Boolean);
        
        const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com", port: 587, secure: false,
            auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
        });

        await transporter.sendMail({ from: process.env.EMAIL_USER, bcc: emailList, subject: mailSubject, html: mailMessage });
        const newMail = new MassMail({ subject: mailSubject, message: mailMessage, recipientsCount: emailList.length, sentAt: new Date() });
        await newMail.save();
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
