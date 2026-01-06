import mongoose from "mongoose";

const adminLogSchema = new mongoose.Schema({
  admin: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  action: { type: String, required: true },
  ip: String,
  date: { type: Date, default: Date.now },
});

export default mongoose.model("AdminLog", adminLogSchema);
