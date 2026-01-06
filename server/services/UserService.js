import User from "../models/userModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

export default class UserService {

  async findById(id) {
    return User.findById(id).select("-password");
  }

  async findByEmail(email) {
    return User.findOne({ email });
  }

  async createUser({ username, email, password, role }) {
    const hashedPassword = await bcrypt.hash(password, 10);
    return User.create({ username, email, password: hashedPassword, role });
  }

  async validatePassword(raw, hashed) {
    return bcrypt.compare(raw, hashed);
  }

  generateToken(user) {
    return jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );
  }

  async getProfile(id) {
    return User.findById(id).select("-password");
  }

  async updateProfile(id, data) {
    return User.findByIdAndUpdate(id, data, { new: true }).select("-password");
  }

  async changePassword(id, oldPassword, newPassword) {
    const user = await User.findById(id);

    if (!user) throw new Error("Користувача не знайдено");
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) throw new Error("Невірний поточний пароль");

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    return true;
  }
}
