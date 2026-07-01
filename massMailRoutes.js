const express = require("express");
const router = express.Router();
const MassMail = require("../models/MassMail");

// DELETE
router.delete("/:id", async (req, res) => {
    try {
        await MassMail.findByIdAndDelete(req.params.id);
        res.json({ message: "Deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET history (optional)
router.get("/", async (req, res) => {
    try {
        const mails = await MassMail.find().sort({ createdAt: -1 });
        res.json(mails);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;