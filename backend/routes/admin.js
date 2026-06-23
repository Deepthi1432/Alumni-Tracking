require("dotenv").config();

const express = require("express");
const router = express.Router();

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const ExcelJS = require("exceljs");
const nodemailer = require("nodemailer");

const User = require("../models/User");
const Admin = require("../models/Admin");
const adminAuth = require("../middleware/auth");

/* =======================================================
   ADMIN REGISTER
======================================================= */
router.post("/register", async (req, res) => {
    try {
        const { name, email, password } = req.body;

        const existingAdmin = await Admin.findOne({ email });
        if (existingAdmin) {
            return res.status(400).json({ error: "Admin already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const admin = new Admin({
            name,
            email,
            password: hashedPassword
        });

        await admin.save();
        res.json({ message: "Admin registered successfully!" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/* =======================================================
   ADMIN LOGIN
======================================================= */
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        const admin = await Admin.findOne({ email });
        if (!admin) {
            return res.status(401).json({ error: "Admin not found" });
        }

        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        const token = jwt.sign(
            { id: admin._id, role: "admin" },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        res.json({
            message: "Admin login successful!",
            token
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/* =======================================================
   VIEW ALL ALUMNI
======================================================= */
router.get("/alumni", adminAuth, async (req, res) => {
    try {
        const { department, year, name } = req.query;

        let filter = { role: "alumni" };

        if (department) filter.department = department;
        if (year) filter.passedOutYear = year;
        if (name) filter.firstName = new RegExp(name, "i");

        const alumni = await User.find(filter).select("-password");
        res.json(alumni);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/* =======================================================
   UPDATE ALUMNI
======================================================= */
router.put("/alumni/:id", adminAuth, async (req, res) => {
    try {
        const updated = await User.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        res.json({
            message: "Alumni updated successfully!",
            alumni: updated
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/* =======================================================
   DELETE ALUMNI
======================================================= */
router.delete("/alumni/:id", adminAuth, async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.json({ message: "Alumni deleted successfully!" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/* =======================================================
   EXPORT ALUMNI TO EXCEL
======================================================= */
router.get("/alumni/export", adminAuth, async (req, res) => {
    try {
        const alumni = await User.find({ role: "alumni" }).select("-password");

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Alumni");

        worksheet.columns = [
            { header: "First Name", key: "firstName", width: 20 },
            { header: "Last Name", key: "lastName", width: 20 },
            { header: "Admission No", key: "admissionNumber", width: 20 },
            { header: "Department", key: "department", width: 20 },
            { header: "Course", key: "course", width: 20 },
            { header: "Passed Out Year", key: "passedOutYear", width: 15 },
            { header: "Working Status", key: "workingStatus", width: 15 },
            { header: "Company", key: "company", width: 25 },
            { header: "Designation", key: "designation", width: 25 },
            { header: "City", key: "city", width: 20 },
            { header: "Email", key: "email", width: 30 }
        ];

        alumni.forEach(a => {
            worksheet.addRow(a);
        });

        res.setHeader(
            "Content-Type",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );
        res.setHeader(
            "Content-Disposition",
            "attachment; filename=alumni.xlsx"
        );

        await workbook.xlsx.write(res);
        res.end();
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/* =======================================================
   BROADCAST MASS EMAIL TO ALUMNI
======================================================= */
router.post("/send-mail", adminAuth, async (req, res) => {
    try {
        const { subject, message } = req.body;

        const alumni = await User.find({ role: "alumni" });
        const emails = alumni.map(a => a.email);

        if (emails.length === 0) {
            return res.status(400).json({ error: "No alumni found to email." });
        }

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

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            bcc: emails,
            subject,
            html: `<h2>${subject}</h2><p>${message}</p>`
        });

        res.json({ message: "Email sent successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/* =======================================================
   🌟 CORRECTED PLACEMENT SEARCH ROUTE
======================================================= */
router.get("/placement-search", adminAuth, async (req, res) => {
    try {
        const { branch, year, company } = req.query;
        
        // Always enforce filtering down to users who are strictly alumni
        let queryCondition = { role: "alumni" }; 

        // Map queries safely to your database structure fields
        if (branch) queryCondition.department = branch; 
        if (year) queryCondition.passedOutYear = parseInt(year); 
        if (company) queryCondition.company = { $regex: company, $options: "i" }; 

        console.log("Executing Admin Filter Query:", queryCondition);

        // Fetch matched records using the correct model variable, skipping passwords
        const records = await User.find(queryCondition).select("-password");
        res.json(records);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;