import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";



export const registerUser = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    if (password.length < 6) {
      return res.status(400).json({ message: "Пароль має містити мінімум 6 символів" });
    }
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Користувач з таким email вже існує" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      username,
      email,
      password: hashedPassword,
      role: role || "student"
    });

    await user.save();

    const token = jwt.sign(
      { id: user._id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(201).json({
      message: "Реєстрація успішна",
      token,
      user: {
        id: user._id,
        username: user.username,
        role: user.role
      }
    });

  } catch (error) {
    console.error("Повна помилка при реєстрації:", error);
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }
    if (error.code === 11000) {
      return res.status(400).json({ message: "Користувач з таким username або email вже існує" });
    }
    res.status(500).json({ message: "Помилка сервера" });
  }
};


// -------------------- ВХІД --------------------
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ message: "Користувача не знайдено" });

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect)
      return res.status(400).json({ message: "Невірний пароль" });

    const token = jwt.sign(
      { id: user._id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(200).json({
      message: "Вхід успішний",
      token,
      user: {
        id: user._id,
        username: user.username,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Помилка при вході:", error);
    res.status(500).json({ message: "Помилка сервера" });
  }
};

// -------------------- ЗАБУЛИ ПАРОЛЬ --------------------
export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "Такої пошти не існує" });
    }

    const newPassword = Math.random().toString(36).slice(-10);

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: "Відновлення пароля",
      html: `<p>Ваш новий пароль: <strong>${newPassword}</strong></p>
             <p>Рекомендуємо змінити його після входу.</p>`,
    };

    await transporter.sendMail(mailOptions);

    res.json({ message: "Новий пароль надіслано на вашу пошту" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Сталася помилка при відправленні листа" });
  }
};

// -------------------- ЗМІНА ПАРОЛЯ --------------------
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id);

    if (!user)
      return res.status(404).json({ message: "Користувача не знайдено" });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Поточний пароль невірний" });

    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword)
      return res.status(400).json({ message: "Новий пароль не може співпадати з попереднім" });

    if (newPassword.length < 6)
      return res.status(400).json({ message: "Новий пароль має містити мінімум 6 символів" });

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedNewPassword;
    await user.save();

    res.json({ message: "Пароль успішно змінено" });

  } catch (error) {
    console.error("Помилка при зміні пароля:", error);
    res.status(500).json({ message: "Помилка сервера" });
  }
};
