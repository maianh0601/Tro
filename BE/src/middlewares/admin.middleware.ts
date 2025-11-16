import bcrypt from "bcryptjs";
import { Request, Response, NextFunction } from "express";
import AdminModel from "../models/AdminModel";
import { verifyToken } from "../utils/getAccesstoken";
import { config } from "dotenv";
config();
export const accessTokenAdmin = async (req: any, res: any, next: any) => {
  try {

    const authHeader = req.cookies.tokenAdmin;

    if (!authHeader) {
      return res.status(401).json({ message: "Token không hợp lệ." });
    }

    // Tách token từ chuỗi "Bearer <token>"
    const token = authHeader.replace("Bearer ", "");
    
    const decoded = await verifyToken(
      token,
      process.env.JWT_SECRET_ACCESS_TOKEN_ADMIN as string
    );
    const admin = await AdminModel.findById(decoded._id);
    req.admin = admin;
    next();
  } catch (error: any) {
    return res.status(500).json({
      message: "Đã xảy ra lỗi trong quá trình xác thực.",
      error: error.message,
    });
  }
};

export const LoginAdminValidator = async (req: any, res: any, next: any) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Vui lòng nhập email và mật khẩu." });
    }

    const admin = await AdminModel.findOne({ email });

    if (!admin) {
      return res.status(401).json({
        message: "Bạn không phải Admin hoặc email , password không chính xác.",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, admin.password);
    //const isPasswordValid = admin.password === password;

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Mật khẩu không chính xác." });
    }

    if (admin.is_block) {
      return res.status(403).json({ message: "Tài khoản của bạn đã bị khóa." });
    }

    req.admin = admin; // Lưu admin vào request
    next();
  } catch (error: any) {
    return res.status(500).json({
      message: "Đã xảy ra lỗi trong quá trình xác thực.",
      error: error.message,
    });
  }
};

export const forgotPasswordAdmin = async (req: any, res: any, next: any) => {
  try {
    const email = req.body;
    const resuil = await AdminModel.findOne(email);
    if (!resuil) {
      return res.status(400).json({ message: "Email không đúng!!!" });
    }
    req.admin = resuil;
    next();
  } catch (error: any) {
    return res.status(500).json({
      message: "Đã xảy ra lỗi trong quá trình xác thực.",
      error: error.message,
    });
  }
};

export const ResetPasswordAdmin = async (req: any, res: any, next: any) => {
  try {
    const { Forgot_Password_Token, New_password, confirm_Password } = req.body;
    if (!Forgot_Password_Token || !New_password || !confirm_Password) {
      throw new Error("Vui lòng nhập đầy đủ thông tin");
    }
    const decoded = await verifyToken(
      Forgot_Password_Token,
      process.env.JWT_SECRET_FORGOT_PASSWORD_TOKEN_ADMIN as string
    );
    if (!decoded) {
      return res
        .status(401)
        .json({ message: "Token không hợp lệ hoặc đã hết hạn." });
    }
    req.admin = decoded;
    next();
  } catch (error: any) {
    return res.status(500).json({
      message: "Đã xảy ra lỗi trong quá trình xác thực.",
      error: error.message,
    });
  }
};
