const mongoose = require("mongoose");

const RecordingSchema = new mongoose.Schema({
    recordingId: { type: String, required: true, unique: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false },
    timestamp: { type: Number, required: true },
    url: { type: String, required: false, default: "" },
    events: { type: Array, required: true }
  });
// 🔥 Add indexes
RecordingSchema.index({ userId: 1 });
RecordingSchema.index({ timestamp: -1 });
RecordingSchema.index({ url: 1 });

const Recording = mongoose.model("Recording", RecordingSchema);
module.exports = Recording;
