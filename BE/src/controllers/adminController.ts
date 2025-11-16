import { Request, Response } from "express";
import dotenv from "dotenv";
import nodemailer from "nodemailer";
import { AdminService } from "../services/AdminServiec";

dotenv.config();

const adminService = new AdminService();

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.MAIL_USERNAME,
    pass: process.env.MAIL_PASSWORD,
  },
});

export const loginAdmin = async (req: Request, res: Response) => {
  try {
    const { admin } = req as any;

    const token = await adminService.loginAdminService(admin._id, admin.verify);
    res.clearCookie("tokenAdmin", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
    });

    res.cookie("tokenAdmin", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 ngày
    });

    return res.json({
      message: "Login thành công!",
      data: {
        admin: {
          id_quyen: admin.id_quyen,
          email: admin.email,
          username: admin.username,
          hovaten: admin.ho_va_ten,
          ngaysinh: admin.ngay_sinh,
          sdt: admin.so_dien_thoai,
          gioi_tinh: admin.gioi_tinh,
          cccd: admin.cccd,
          is_block: admin.is_block,
        },
      },
    });
  } catch (error: any) {
    return res.status(500).json({
      message: "Đã xảy ra lỗi khi đăng nhập.",
      error: error.message,
    });
  }
};

export const logoutAdmin = async (req: Request, res: Response) => {
  try {
    res.clearCookie("tokenAdmin", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
    });
    res.status(200).json({
      message: "Logout successfully!!!",
    });
  } catch (error: any) {
    res.status(404).json({
      message: error.message,
    });
  }
};

export const createAdmin = async (req: Request, res: Response) => {
  try {
    const data = req.body;

    await adminService.createAdminService(data);

    res.status(200).json({
      message: "Admin đã được tạo thành công",
    });
  } catch (error: any) {
    res.status(404).json({
      message: error.message,
    });
  }
};

export const updateAdmin = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = req.body;
    await adminService.updateAdminService(id, data);
    res.status(200).json({
      message: "Admin đã được cập nhật thành công",
    });
  } catch (error: any) {
    res.status(404).json({
      message: error.message,
    });
  }
};
export const deleteAdmin = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await adminService.deleteAdminService({ id });

    res.status(200).json({
      message: "Đã xóa Admin thành công!",
    });
  } catch (error: any) {
    res.status(404).json({
      message: error.message,
    });
  }
};

export const sendPasswordAdmin = async (req: Request, res: Response) => {
  try {
    const { admin } = req as any;

    const result = await adminService.forgotPasswordAdminService(
      admin._id,
      admin.verify
    );
    const mailOptions = {
      from: process.env.MAIL_USERNAME,
      to: admin.email,
      subject: "Xác thực tài khoản của bạn để đổi mật khẩu",
      text: `Chào ${admin.username}, vui lòng xác thực tài khoản của bạn bằng cách nhấp vào liên kết sau: ${process.env.CLIENT_ORIGIN}/admin/reset-password?token=${result}`,
    };
    // Gửi email
    await transporter.sendMail(mailOptions);
    return res.json(result);
  } catch (error: any) {
    return res.status(500).json({
      message: "Đã xảy ra lỗi khi gửi mail.",
      error: error.message,
    });
  }
};

export const resetPasswordAdmin = async (req: Request, res: Response) => {
  try {
    const { admin } = req as any;
    const { New_password, confirm_Password } = req.body;

    if (New_password !== confirm_Password) {
      return res.status(400).json({ message: "Mật khẩu xác nhận không khớp." });
    }
    const result = await adminService.ResetPassWordAdminService(
      admin._id,
      New_password
    );
    return res.json(result);
  } catch (error: any) {
    return res.status(500).json({
      message: "Đã xảy ra lỗi khi đổi mật khẩu.",
      error: error.message,
    });
  }
};

export const getAdmin = async (req: any, res: any) => {
  try {
    const admin = req.admin;

    if (!admin) {
      return res.status(404).json({ message: "admin không tồn tại." });
    }
    const data = await adminService.getAdmin(admin._id);

    res.status(200).json({
      status: 200,
      data: data,
    });
  } catch (error: any) {
    res.status(500).json({
      message: "Lỗi khi lấy thông tin admin.",
      error: error.message,
    });
  }
};

export const getAllAdmin = async (req: any, res: any) => {
  try {
    const data = await adminService.getAdminAll();
    res.status(200).json({
      status: 200,
      data: data,
    });
  } catch (error: any) {
    res.status(500).json({
      message: "Lỗi khi lấy thông tin người dùng.",
      error: error.message,
    });
  }
};

export const checkAdmin = async (req: any, res: any) => {
  try {
    const { tokenAdmin } = req.cookies;

    if (!tokenAdmin) {
      // Chưa đăng nhập => trả về 401
      return res.sendStatus(401);
    }

    // Đã đăng nhập => trả về true (không có message)
    return res.status(200).json(true);
  } catch (error) {
    return res.sendStatus(500);
  }
};
