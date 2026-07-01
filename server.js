// backend/server.js
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
const io = socketIo(server, {
    cors: { origin: "*" }
});

/* =========================
   MODELS
========================= */
const MassMail = require("./models/MassMail");
const User = require("./models/User");

/* =========================
   ROUTES
========================= */
const notificationRoutes = require("./routes/notifications");
const registrationRoutes = require("./routes/eventRegistration");
const userRoutes = require("./routes/users");
const adminRoutes = require("./routes/admin");
const jobRoutes = require("./routes/jobs");
const committeeRoutes = require("./routes/committee");
const eventRoutes = require("./routes/events");
const announcementRoutes = require("./routes/announcement");
const galleryRoutes = require("./routes/gallery");
const contactRoutes = require("./routes/contact");

/* =========================
   NODEMAILER CONFIG
========================= */
const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
    tls: { rejectUnauthorized: false }
});

/* =========================
   MIDDLEWARE
========================= */
app.use(cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static("public"));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

/* =========================
   ROUTE REGISTRATION
========================= */
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

/* =========================
   DATABASE CONNECTION
========================= */
mongoose.connect("mongodb://localhost:27017/alumni")
    .then(() => console.log("MongoDB connected successfully"))
    .catch(err => console.error("MongoDB connection error:", err));

/* =========================
   MASS EMAIL + HISTORY SAVE
========================= */
app.post("/admin/send-mass-email", async (req, res) => {
    try {
        const { mailSubject, mailMessage } = req.body;

        if (!mailSubject || !mailMessage) {
            return res.status(400).json({
                success: false,
                error: "Subject and message are required."
            });
        }

        const users = await User.find(
            { email: { $exists: true, $ne: "" } },
            "email"
        );

        const emailList = users.map(u => u.email).filter(Boolean);

        if (emailList.length === 0) {
            return res.status(404).json({
                success: false,
                error: "No alumni emails found."
            });
        }

        const mailOptions = {
            from: `"Alumni Association" <${process.env.EMAIL_USER}>`,
            bcc: emailList,
            subject: mailSubject,
            html: `
                <div style="font-family: Arial; padding: 20px;">
                    <h2>Alumni Notification</h2>
                    <div style="padding:10px;background:#f5f5f5;">
                        ${mailMessage}
                    </div>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);

        // SAVE HISTORY
        const newMail = new MassMail({
            subject: mailSubject,
            message: mailMessage,
            recipientsCount: emailList.length,
            sentAt: new Date()
        });

        await newMail.save();

        res.json({
            success: true,
            message: "Mass email sent and saved."
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: err.message });
    }
});

/* =========================
   GET MASS MAIL HISTORY
========================= */
app.get("/admin/mail-history", async (req, res) => {
    try {
        const mails = await MassMail.find().sort({ _id: -1 });

        const formatted = mails.map(mail => ({
            _id: mail._id,
            subject: mail.subject,
            message: mail.message,
            recipientsCount: mail.recipientsCount, // ✅ correct key
            sentAt: mail.sentAt || mail.createdAt
        }));

        res.json(formatted);

    } catch (error) {
        console.error("Mail history error:", error);
        res.status(500).json({ error: error.message });
    }
});

/* =========================
   DELETE MASS MAIL HISTORY
========================= */
app.delete("/api/massmail/:id", async (req, res) => {
    try {
        await MassMail.findByIdAndDelete(req.params.id);
        res.json({ message: "Deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/* =========================
   SOCKET.IO
========================= */
io.on("connection", socket => {
    console.log("Client connected");
});

/* =========================
   START SERVER
========================= */
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});