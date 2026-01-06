// Перевіряє, чи токен валідний і не прострочений
export const isTokenValid = () => {
  const token = localStorage.getItem("token");
  if (!token) return false;

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const exp = payload.exp;
    const now = Math.floor(Date.now() / 1000);
    return exp > now;
  } catch (err) {
    return false;
  }
};
