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
const MassMail = require("./models/MassMail");
const io = socketIo(server, {
    cors: {
        origin: "*"
    }
});

/* ============================================================
   ROUTES IMPORT
============================================================ */
const notificationRoutes = require("./routes/notifications");
const registrationRoutes = require("./routes/eventRegistration");

const userRoutes = require("./routes/users");
const adminRoutes = require("./routes/admin");
const jobRoutes = require("./routes/jobs");
const committeeRoutes = require("./routes/committee"); // function returning router
const eventRoutes = require("./routes/events");
const announcementRoutes = require("./routes/announcement");
const galleryRoutes = require("./routes/gallery");
const contactRoutes = require("./routes/contact");

/* ============================================================
   NODEMAILER EMAIL TRANSPORTER CONFIGURATION
============================================================ */
const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
    tls: {
        rejectUnauthorized: false
    }
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

// static folders
app.use(express.static("public"));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// other routes
app.use("/event-registration", registrationRoutes);
app.use("/notifications", notificationRoutes);

/* =========================
   DATABASE
========================= */
mongoose.connect("mongodb://localhost:27017/alumni")
    .then(() => {
        console.log("MongoDB connected successfully");
    })
    .catch(err => {
        console.error("MongoDB connection error:", err);
    });

/* ============================================================
   DIAGNOSTIC ROUTE CHECKS
============================================================ */
console.log("--- Route Initialization Verifications ---");
console.log("users router status:", typeof userRoutes);
console.log("admin router status:", typeof adminRoutes);
console.log("jobs router status:", typeof jobRoutes);
console.log("committee router status:", typeof committeeRoutes);
console.log("events router status:", typeof eventRoutes);
console.log("announcement router status:", typeof announcementRoutes);
console.log("gallery router status:", typeof galleryRoutes);
console.log("contact router status:", typeof contactRoutes);
console.log("-------------------------------------------");

/* =========================
   API ROUTE REGISTRATION
========================= */
app.use("/users", userRoutes);
app.use("/admin", adminRoutes);

// IMPORTANT: committeeRoutes must be called with io
app.use("/admin/jobs", jobRoutes);
app.use("/admin/committee", committeeRoutes(io));
app.use("/admin/events", eventRoutes);
app.use("/admin/announcements", announcementRoutes);
app.use("/admin/gallery", galleryRoutes);
app.use("/admin/contacts", contactRoutes);

/* ============================================================
   REAL-TIME ALUMNI PLACEMENT CHAT-INQUIRY EMAIL ROUTE
============================================================ */
app.post("/admin/jobs/chat-inquiry", async (req, res) => {
    try {
        const {
            applicantName,
            applicantEmail,
            inquiryMessage,
            jobTitle,
            company,
            posterEmail
        } = req.body;

        if (!applicantEmail || !inquiryMessage) {
            return res.status(400).json({
                error: "Missing required messaging payload values."
            });
        }

        const targetedPosterEmail =
            posterEmail && posterEmail !== "Admin Cluster"
                ? posterEmail
                : process.env.EMAIL_USER;

        const alertToPosterOptions = {
            from: `"ANECAA Career Interaction Gateway" <${process.env.EMAIL_USER}>`,
            to: targetedPosterEmail,
            subject: `New Inquiry: ${applicantName} regarding your ${jobTitle} post`,
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #28a745; border-radius: 8px;">
                    <h3 style="color: #28a745;">You have received a candidate referral inquiry!</h3>
                    <p>Hello,</p>
                    <p>An alumnus has sent an inquiry regarding <strong>${jobTitle} at ${company}</strong>.</p>
                    <div style="background: #f4f6f9; padding: 15px; border-radius: 4px; margin: 15px 0; font-style: italic;">
                        "${inquiryMessage}"
                    </div>
                    <hr style="border: 0; border-top: 1px solid #ddd;">
                    <p><strong>Applicant details:</strong></p>
                    <ul>
                        <li><strong>Name:</strong> ${applicantName || "N/A"}</li>
                        <li><strong>Email:</strong> <a href="mailto:${applicantEmail}">${applicantEmail}</a></li>
                    </ul>
                </div>
            `
        };

        const alertToApplicantOptions = {
            from: `"ANECAA Career Interaction Gateway" <${process.env.EMAIL_USER}>`,
            to: applicantEmail,
            subject: `Your inquiry for ${jobTitle} at ${company} was sent`,
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #004080; border-radius: 8px;">
                    <h3 style="color: #004080;">Your inquiry was sent successfully!</h3>
                    <p>Dear ${applicantName || "Applicant"},</p>
                    <p>Your message regarding <strong>${jobTitle}</strong> at <strong>${company}</strong> has been sent.</p>
                    <p><strong>Your message:</strong></p>
                    <div style="background: #fafafa; padding: 12px; border: 1px dashed #ccc; font-size: 13px;">
                        ${inquiryMessage}
                    </div>
                    <p>Regards,<br><strong>ANECAA Administration Team</strong></p>
                </div>
            `
        };

        await Promise.all([
            transporter.sendMail(alertToPosterOptions),
            transporter.sendMail(alertToApplicantOptions)
        ]);

        res.json({
            success: true,
            message: "Inquiry emails sent successfully."
        });
    } catch (error) {
        console.error("Chat inquiry email error:", error);
        res.status(500).json({
            error: error.message || "Failed to send inquiry emails."
        });
    }
});

/* ============================================================
   MASS EMAIL NOTIFICATION ROUTE
============================================================ */
app.post("/admin/send-mass-email", async (req, res) => {
    try {
        const User = require("./models/User");
        const MassMail = require("./models/MassMail");

        const { mailSubject, mailMessage } = req.body;

        if (!mailSubject || !mailMessage) {
            return res.status(400).json({
                success: false,
                error: "Subject and message are required."
            });
        }

        // Get all alumni emails
        const users = await User.find({ role: "alumni" }, "email");
        const emailList = users
            .filter(user => user.email)
            .map(user => user.email);

        if (emailList.length === 0) {
            return res.status(404).json({
                success: false,
                error: "No alumni email addresses found."
            });
        }

        // Send email
        const mailOptions = {
            from: `"ANECAA Administration" <${process.env.EMAIL_USER}>`,
            bcc: emailList,
            subject: mailSubject,
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px;">
                    <h2 style="color:#004080;">
                        ANECAA Alumni Association Notification
                    </h2>

                    <div style="
                        background:#f8f9fa;
                        padding:15px;
                        border-left:4px solid #004080;
                        margin-top:15px;
                    ">
                        ${mailMessage}
                    </div>

                    <br>

                    <p>
                        Regards,<br>
                        <strong>ANECAA Administration Team</strong>
                    </p>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);

        // STORE MAIL IN DATABASE
        const savedMail = new MassMail({
            subject: mailSubject,
            message: mailMessage,
            recipientsCount: emailList.length,
            sentTo: emailList,
            sentBy: "Admin"
        });

        await savedMail.save();

        res.status(200).json({
            success: true,
            message: "Mass email sent and stored successfully.",
            mail: savedMail
        });

    } catch (error) {
        console.error("Mass Mail Error:", error);

        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

app.get("/admin/mail-history", async (req, res) => {
    try {
        const MassMail = require("./models/MassMail");

        const mails = await MassMail.find().sort({ createdAt: -1 });

        const formatted = mails.map(mail => ({
            subject: mail.subject,
            message: mail.message,
            recipientCount: mail.recipientsCount || 0,
            sentAt: mail.createdAt
        }));

        res.status(200).json(formatted);
    } catch (error) {
        console.error("Mail history fetch error:", error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});
/* =========================
   SOCKET.IO
========================= */
io.on("connection", socket => {
    console.log("Client connected via Socket.io");
});

/* =========================
   START SERVER
========================= */
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server running smoothly on port ${PORT}`);
});