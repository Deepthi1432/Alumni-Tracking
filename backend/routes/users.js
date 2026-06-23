const express = require("express");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const User = require("../models/User");

const router = express.Router();

/* ==========================================================================
   1. GET ALL USERS (Excludes Passwords)
   ========================================================================== */
router.get("/", async (req, res) => {
    try {
        const users = await User.find().select("-password");
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/* ==========================================================================
   2. ALUMNI REGISTRATION
   ========================================================================== */
router.post("/register", async (req, res) => {
    console.log("BODY RECEIVED:", req.body);

    try {
        // Validate unique target entity
        const existingUser = await User.findOne({ email: req.body.email });
        if (existingUser) {
            return res.status(400).json({ error: "User already exists" });
        }

        // Secure password mutation
        const hashedPassword = await bcrypt.hash(req.body.password, 10);

        // Map payload architecture 
        const user = new User({
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            admissionNumber: req.body.admissionNumber,
            email: req.body.email,
            password: hashedPassword,
            department: req.body.department,
            course: req.body.course,
            passedOutYear: req.body.passedOutYear,
            gender: req.body.gender,
            dob: req.body.dob,
            phone: req.body.phone,
            city: req.body.city,
            placementType: req.body.placementType,
            workingStatus: req.body.workingStatus,
            company: req.body.company,
            designation: req.body.designation,
            sector: req.body.sector,
            role: "alumni"
        });

        // FIXED: Re-integrated database transaction execution block properly inside the try block
        console.log("Before save");
        const savedUser = await user.save();
        console.log("After save:", savedUser);

        res.status(211).json({
            message: "Alumni registered successfully!",
            user: { id: savedUser._id, email: savedUser.email }
        });

    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

/* ==========================================================================
   3. ALUMNI LOGIN
   ========================================================================== */
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        // Mask password fields before returning state block instance payload
        const userResponse = user.toObject();
        delete userResponse.password;

        res.json({
            message: "Login successful",
            user: userResponse
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/* ==========================================================================
   4. EDIT / UPDATE PROFILE
   ========================================================================== */
router.put("/update/:id", async (req, res) => {
    try {
        // Enforce safety: prevent directly modifying encrypted fields via plain updates
        if (req.body.password) {
            delete req.body.password;
        }

        const updatedUser = await User.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        ).select("-password");

        if (!updatedUser) {
            return res.status(404).json({ error: "User profile not found" });
        }

        res.json({
            message: "Profile updated successfully",
            user: updatedUser
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/* ==========================================================================
   5. FORGOT PASSWORD (Generates Crypto Reset Token)
   ========================================================================== */
router.post("/forgot-password", async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // Generate hex security token string 
        const token = crypto.randomBytes(32).toString("hex");

        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000; // 1-hour expiration timestamp limit
        await user.save();

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        const resetLink = `http://localhost:5000/reset-password.html?token=${token}`;

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: user.email,
            subject: "Password Reset Request",
            html: `
                <h2>Password Reset</h2>
                <p>You requested a password reset. Click the link below to set up a new password:</p>
                <a href="${resetLink}" target="_blank" style="padding: 10px 15px; background-color: #003366; color: white; text-decoration: none; border-radius: 4px; display: inline-block;">Reset Password</a>
                <p>If you did not make this request, please ignore this message.</p>
            `
        });

        res.json({ message: "Reset link sent to email" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/* ==========================================================================
   6. RESET PASSWORD (Verifies Token & Updates Password)
   ========================================================================== */
router.post("/reset-password", async (req, res) => {
    try {
        const user = await User.findOne({
            resetPasswordToken: req.body.token,
            resetPasswordExpires: { $gt: Date.now() } // Validates token is not expired
        });

        if (!user) {
            return res.status(400).json({ error: "Invalid or expired token" });
        }

        // Secure mutation updates hash value 
        user.password = await bcrypt.hash(req.body.password, 10);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        res.json({ message: "Password changed successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
router.get("/directory", async (req,res)=>{

    try{

        const users =
        await User.find()
        .select("-password");

        res.json(users);

    }
    catch(err){

        res.status(500).json({
            error:err.message
        });

    }

});
module.exports = router;