const mongoose = require("mongoose");

const massMailSchema = new mongoose.Schema(
  {
    subject: {
      type: String,
      required: true
    },
    message: {
      type: String,
      required: true
    },
    recipientsCount: {
      type: Number,
      default: 0
    },
    sentAt: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("MassMail", massMailSchema);