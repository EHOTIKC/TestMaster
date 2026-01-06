import jwt from "jsonwebtoken";

export default class AuthService {

  verifyToken(token) {
    return jwt.verify(token, process.env.JWT_SECRET);
  }

  extractToken(header) {
    if (!header || !header.startsWith("Bearer "))
      return null;

    return header.split(" ")[1];
  }

  getUserFromRequest(req) {
    const token = this.extractToken(req.headers.authorization);
    if (!token) return null;

    try {
      return this.verifyToken(token);
    } catch {
      return null;
    }
  }

}
