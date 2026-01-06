import UserService from "../services/UserService.js";

const userService = new UserService();

export const registerUser = async (req, res) => {
  try {
    const newUser = await userService.createUser(req.body);
    res.json({ message: "Користувача створено", user: newUser });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await userService.findByEmail(email);
    if (!user) return res.status(404).json({ message: "Користувача не знайдено" });

    const isPasswordValid = await userService.validatePassword(password, user.password);
    if (!isPasswordValid) return res.status(401).json({ message: "Невірний пароль" });

    const token = userService.generateToken(user);

    res.json({ token, user: { username: user.username, role: user.role } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


export const getProfile = async (req, res) => {
  try {
    const user = await userService.getProfile(req.user.id);
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
