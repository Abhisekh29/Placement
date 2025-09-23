import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
  let token = req.cookies.access_token;

  // Fallback to Authorization header if no cookie
  if (!token && req.headers.authorization?.startsWith("Bearer ")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res
      .status(401)
      .json({ message: "Not authenticated. Please log in." });
  }

  jwt.verify(token, "jwtkey", (err, userInfo) => {
    if (err) {
      if (err.name === "TokenExpiredError") {
        res.clearCookie("access_token", {
          httpOnly: true,
          sameSite: "none",
          secure: true,
        });
        return res.status(401).json({
          message: "Your session has expired. Please log in again.",
        });
      }
    }
    req.user = userInfo;
    next();
  });
};

export const isAdmin = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.user.user_type === "0") {
      // '0' is for Admin
      next();
    } else {
      return res.status(403).json({
        message: "Forbidden. You do not have administrative privileges.",
      });
    }
  });
};
