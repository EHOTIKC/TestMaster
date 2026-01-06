import AdminLog from "../models/AdminLog.js";

export const adminLogger = (actionCallback) => {
  return async (req, res, next) => {
    res.on("finish", async () => {
      try {
        const actionText = await actionCallback(req, res);

        await AdminLog.create({
          admin: req.user.id,
          action: actionText,
          ip: req.ip,
          date: new Date(),
        });
      } catch (err) {
        console.error("Помилка при логуванні дії адміністратора:", err);
      }
    });
    next();
  };
};
