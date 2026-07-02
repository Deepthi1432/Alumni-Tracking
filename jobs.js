const express = require('express');
const router = express.Router();
const Job = require('./Job');
const User = require('./User');
const nodemailer = require('nodemailer');
const notifyAllAlumni = require("./notifyAllAlumni");
const Notification = require("./Notification");
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});
/* =========================
   ADD JOB
   POST /admin/jobs
========================= */

router.post('/', async (req, res) => {
    try {
        console.log("Incoming Job:", req.body);

        const {
            jobTitle,
            company,
            location,
            salary,
            applyLink,
            jobDescription,
            posterName
        } = req.body;

        const newJob = new Job({
            title: jobTitle,
            company,
            location,
            salary,
            applyLink,
            description: jobDescription
        });

        await newJob.save();
        await Notification.create({
    title: `New Job: ${jobTitle}`,
    message: `${company} is hiring for ${jobTitle}`,
    type: "job"
});
        await notifyAllAlumni(
    transporter,
    `🚀 New Job Opportunity: ${jobTitle}`,
    `
    <h2>New Job Opportunity</h2>
    <p><strong>Role:</strong> ${jobTitle}</p>
    <p><strong>Company:</strong> ${company}</p>
    <p><strong>Location:</strong> ${location}</p>
    <p><strong>Salary:</strong> ${salary || "Not Specified"}</p>
    <a href="${applyLink}">Apply Here</a>
    `
);

        // Send notification emails
        try {
            const users = await User.find(
                { role: 'alumni' },
                'email'
            );

            const emailList = users.map(user => user.email);

            if (emailList.length > 0) {
                await transporter.sendMail({
                    from: process.env.EMAIL_USER,
                    to: emailList.join(','),
                    subject: `🚀 New Job Referral Alert: ${jobTitle} at ${company}`,
                    html: `
                        <h2>New Job Posting</h2>
                        <p><strong>Posted By:</strong> ${posterName || 'Association Member'}</p>
                        <p><strong>Role:</strong> ${jobTitle}</p>
                        <p><strong>Company:</strong> ${company}</p>
                        <p><strong>Location:</strong> ${location}</p>
                        <p><strong>Salary:</strong> ${salary || 'Not Specified'}</p>
                        <p><strong>Description:</strong></p>
                        <p>${jobDescription || ''}</p>
                        <p>
                            <a href="${applyLink}">
                                Apply Here
                            </a>
                        </p>
                    `
                });
            }
        } catch (mailError) {
            console.error("Email Error:", mailError.message);
        }

        res.status(201).json({
            success: true,
            message: "Job added successfully"
        });

    } catch (err) {
        console.error("Job Save Error:", err);

        res.status(500).json({
            success: false,
            error: err.message
        });
    }
});

/* =========================
   GET ALL JOBS
   GET /admin/jobs
========================= */

router.get('/', async (req, res) => {
    try {
        const jobs = await Job.find()
            .sort({ createdAt: -1 });

        res.status(200).json(jobs);

    } catch (err) {
        console.error("Fetch Jobs Error:", err);

        res.status(500).json({
            success: false,
            error: err.message
        });
    }
});

/* =========================
   GET SINGLE JOB
   GET /admin/jobs/:id
========================= */

router.get('/:id', async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);

        if (!job) {
            return res.status(404).json({
                success: false,
                error: "Job not found"
            });
        }

        res.json(job);

    } catch (err) {
        res.status(500).json({
            success: false,
            error: err.message
        });
    }
});

/* =========================
   UPDATE JOB
   PUT /admin/jobs/:id
========================= */

router.put('/:id', async (req, res) => {
    try {
        const {
            jobTitle,
            company,
            location,
            salary,
            applyLink,
            jobDescription
        } = req.body;

        const updatedJob = await Job.findByIdAndUpdate(
            req.params.id,
            {
                title: jobTitle,
                company,
                location,
                salary,
                applyLink,
                description: jobDescription
            },
            {
                new: true,
                runValidators: true
            }
        );

        if (!updatedJob) {
            return res.status(404).json({
                success: false,
                error: "Job not found"
            });
        }

        res.json({
            success: true,
            message: "Job updated successfully",
            updatedJob
        });

    } catch (err) {
        res.status(500).json({
            success: false,
            error: err.message
        });
    }
});

/* =========================
   DELETE JOB
   DELETE /admin/jobs/:id
========================= */

router.delete('/:id', async (req, res) => {
    try {
        const deletedJob = await Job.findByIdAndDelete(
            req.params.id
        );

        if (!deletedJob) {
            return res.status(404).json({
                success: false,
                error: "Job not found"
            });
        }

        res.json({
            success: true,
            message: "Job deleted successfully"
        });

    } catch (err) {
        res.status(500).json({
            success: false,
            error: err.message
        });
    }
});

module.exports = router;
