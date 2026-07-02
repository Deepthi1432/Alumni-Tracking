const express = require("express");
const Gallery = require("./Gallery");

const router = express.Router();

/* =========================
   ADD GALLERY IMAGE
========================= */

router.post("/", async (req, res) => {
    try {
        console.log("Incoming Gallery Data:", req.body);

        const {
            image,
            imageUrl,
            galleryImage
        } = req.body;

        const gallery = new Gallery({
            image: image || imageUrl || galleryImage
        });

        await gallery.save();

        res.status(201).json({
            success: true,
            message: "Gallery image added successfully",
            gallery
        });

    } catch (err) {
        console.error("Gallery Save Error:", err.message);

        res.status(500).json({
            success: false,
            error: err.message
        });
    }
});

/* =========================
   GET ALL IMAGES
========================= */

router.get("/", async (req, res) => {
    try {
        const images = await Gallery.find()
            .sort({ createdAt: -1 });

        res.status(200).json(images);

    } catch (err) {
        console.error("Gallery Fetch Error:", err.message);

        res.status(500).json({
            success: false,
            error: err.message
        });
    }
});

/* =========================
   UPDATE IMAGE
========================= */

router.put("/:id", async (req, res) => {
    try {
        const {
            image,
            imageUrl,
            galleryImage
        } = req.body;

        const updatedImage = await Gallery.findByIdAndUpdate(
            req.params.id,
            {
                image: image || imageUrl || galleryImage
            },
            {
                new: true,
                runValidators: true
            }
        );

        if (!updatedImage) {
            return res.status(404).json({
                success: false,
                error: "Image not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Image updated successfully",
            updatedImage
        });

    } catch (err) {
        console.error("Gallery Update Error:", err.message);

        res.status(500).json({
            success: false,
            error: err.message
        });
    }
});

/* =========================
   DELETE IMAGE
========================= */

router.delete("/:id", async (req, res) => {
    try {
        const deletedImage = await Gallery.findByIdAndDelete(
            req.params.id
        );

        if (!deletedImage) {
            return res.status(404).json({
                success: false,
                error: "Image not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Image deleted successfully"
        });

    } catch (err) {
        console.error("Gallery Delete Error:", err.message);

        res.status(500).json({
            success: false,
            error: err.message
        });
    }
});

module.exports = router;
