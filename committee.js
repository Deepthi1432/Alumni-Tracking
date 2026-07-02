const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const Committee = require("./Committee");

module.exports = (io) => {
    const router = express.Router();

    /* =========================================================
       ENSURE uploads FOLDER EXISTS
    ========================================================= */
    const uploadDir = path.join(__dirname, "../uploads");
    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
    }

    /* =========================================================
       MULTER STORAGE CONFIG
    ========================================================= */
    const storage = multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, uploadDir);
        },
        filename: (req, file, cb) => {
            const uniqueName = Date.now() + "-" + file.originalname.replace(/\s+/g, "-");
            cb(null, uniqueName);
        }
    });

    /* =========================================================
       FILE FILTER
    ========================================================= */
    const fileFilter = (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|webp/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (extname && mimetype) {
            cb(null, true);
        } else {
            cb(new Error("Only image files (.jpeg, .jpg, .png, .webp) are allowed"));
        }
    };

    const upload = multer({
        storage,
        fileFilter,
        limits: { fileSize: 5 * 1024 * 1024 }
    });

    /* =========================================================
       GET ALL COMMITTEE MEMBERS
       GET /admin/committee
    ========================================================= */
    router.get("/", async (req, res) => {
        try {
            const members = await Committee.find().sort({ createdAt: 1 });
            res.status(200).json(members);
        } catch (err) {
            console.error("Committee fetch error:", err);
            res.status(500).json({
                success: false,
                error: err.message
            });
        }
    });

    /* =========================================================
       ADD COMMITTEE MEMBER
       POST /admin/committee
       Supports:
       - JSON with photo URL
       - multipart/form-data with uploaded photo file
    ========================================================= */
    router.post("/", async (req, res) => {
        try {
            const { name, role, email, mobile, tenure, photo } = req.body;

            if (!name || !role) {
                return res.status(400).json({
                    success: false,
                    error: "Name and role are required"
                });
            }

            const member = new Committee({
                name,
                role,
                email: email || "",
                mobile: mobile || "",
                tenure: tenure || "",
                photo: photo || ""
            });

            await member.save();

            if (io) {
                io.emit("committeeAdded", member);
            }

            res.status(201).json({
                success: true,
                message: "Committee member added successfully",
                member
            });
        } catch (err) {
            console.error("Committee save error:", err);
            res.status(500).json({
                success: false,
                error: err.message
            });
        }
    });

    /* =========================================================
       GET SINGLE COMMITTEE MEMBER
       GET /admin/committee/:id
    ========================================================= */
    router.get("/:id", async (req, res) => {
        try {
            const member = await Committee.findById(req.params.id);

            if (!member) {
                return res.status(404).json({
                    success: false,
                    error: "Committee member not found"
                });
            }

            res.status(200).json(member);
        } catch (err) {
            console.error("Committee single fetch error:", err);
            res.status(500).json({
                success: false,
                error: err.message
            });
        }
    });

    /* =========================================================
       UPDATE COMMITTEE MEMBER
       PUT /admin/committee/:id
    ========================================================= */
    router.put("/:id", upload.single("photo"), async (req, res) => {
        try {
            const { name, role, email, mobile, tenure, photo } = req.body;

            const existingMember = await Committee.findById(req.params.id);

            if (!existingMember) {
                return res.status(404).json({
                    success: false,
                    error: "Committee member not found"
                });
            }

            let updatedPhoto = existingMember.photo || "";

            // If new file uploaded
            if (req.file) {
                updatedPhoto = "/uploads/" + req.file.filename;

                // delete old uploaded local photo
                if (
                    existingMember.photo &&
                    existingMember.photo.startsWith("/uploads/")
                ) {
                    const oldPhotoPath = path.join(
                        __dirname,
                        "..",
                        existingMember.photo.replace(/^\/+/, "")
                    );

                    if (fs.existsSync(oldPhotoPath)) {
                        fs.unlinkSync(oldPhotoPath);
                    }
                }
            }
            // If photo URL provided from frontend
            else if (photo !== undefined) {
                updatedPhoto = photo.trim();
            }

            const updatedMember = await Committee.findByIdAndUpdate(
                req.params.id,
                {
                    name: name ?? existingMember.name,
                    role: role ?? existingMember.role,
                    email: email ?? existingMember.email,
                    mobile: mobile ?? existingMember.mobile,
                    tenure: tenure ?? existingMember.tenure,
                    photo: updatedPhoto
                },
                {
                    new: true,
                    runValidators: true
                }
            );

            if (io) {
                io.emit("committeeUpdated", updatedMember);
            }

            res.status(200).json({
                success: true,
                message: "Committee member updated successfully",
                member: updatedMember
            });
        } catch (err) {
            console.error("Committee update error:", err);
            res.status(500).json({
                success: false,
                error: err.message
            });
        }
    });

    /* =========================================================
       DELETE COMMITTEE MEMBER
       DELETE /admin/committee/:id
    ========================================================= */
    router.delete("/:id", async (req, res) => {
        try {
            const member = await Committee.findById(req.params.id);

            if (!member) {
                return res.status(404).json({
                    success: false,
                    error: "Committee member not found"
                });
            }

            // delete uploaded local file if stored locally
            if (member.photo && member.photo.startsWith("/uploads/")) {
                const photoPath = path.join(
                    __dirname,
                    "..",
                    member.photo.replace(/^\/+/, "")
                );

                if (fs.existsSync(photoPath)) {
                    fs.unlinkSync(photoPath);
                }
            }

            await Committee.findByIdAndDelete(req.params.id);

            if (io) {
                io.emit("committeeDeleted", req.params.id);
            }

            res.status(200).json({
                success: true,
                message: "Committee member deleted successfully"
            });
        } catch (err) {
            console.error("Committee delete error:", err);
            res.status(500).json({
                success: false,
                error: err.message
            });
        }
    });

    return router;
};
