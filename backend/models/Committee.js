const mongoose = require("mongoose");

const CommitteeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    role: { type: String, required: true },
    email: { type: String, default: "" },
    mobile: { type: String, default: "" },
    tenure: { type: String, default: "" },
    photo: { type: String, default: "" }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Committee", CommitteeSchema);