import { Request, Response, NextFunction } from "express";

export const validateCaptchaToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const captchaToken = req.headers["x-captcha-token"];

  if (!captchaToken || typeof captchaToken !== "string") {
    return res.status(401).json({
      error: "Unauthorized",
      message: "Captcha token required",
      data: null,
    });
  }

  if (captchaToken.trim().length === 0) {
    return res.status(401).json({
      error: "Unauthorized",
      message: "Invalid captcha token",
      data: null,
    });
  }

  next();
};
