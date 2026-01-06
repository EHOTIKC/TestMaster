import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, "Ім’я обов’язкове"],
    trim: true,
  },
  email: {
    type: String,
    required: [true, "Email обов’язковий"],
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: [true, "Пароль обов’язковий"],
    minlength: 6,
  },
  role: {
    type: String,
    enum: ["student", "teacher"],
    default: "student",
  }
}, { timestamps: true });

export default mongoose.model("User", userSchema);
