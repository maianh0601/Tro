import { Request, Response, NextFunction } from "express";

export const userRegisterRequest = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.body.email) {
    return res.status(400).json({
      message: "Email không để trống!",
    });
  }

  if (!req.body.password) {
    return res.status(400).json({
      message: "Password không để trống!",
    });
  }
  next();
};


export const UserLoginRequest = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.body.email) {
    return res.status(400).json({
      message: "Email không để trống!",
    });
  }

  if (!req.body.password) {
    return res.status(400).json({
      message: "Password không để trống!",
    });
  }

  next();
};
