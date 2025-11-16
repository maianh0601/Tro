import { Request, Response, NextFunction } from "express";

export const validateAdminInput = (req: Request, res: Response, next: NextFunction) => {
  const {
    email,
    password,
    username,
    ho_va_ten,
    ngay_sinh,
    que_quan,
    so_dien_thoai,
    gioi_tinh,
    cccd,
    id_quyen,
  } = req.body;

  // Regex patterns
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^\d{9,11}$/;
  const cccdRegex = /^\d{9,12}$/;

  const errors: string[] = [];

  if (!email || !emailRegex.test(email)) {
    errors.push("Email không hợp lệ hoặc chưa nhập.");
  }

  if (!password || password.length < 6) {
    errors.push("Mật khẩu phải có ít nhất 6 ký tự.");
  }

  if (!username) {
    errors.push("Username là bắt buộc.");
  }

  if (!ho_va_ten) {
    errors.push("Họ và tên là bắt buộc.");
  }

  if (!ngay_sinh || isNaN(Date.parse(ngay_sinh))) {
    errors.push("Ngày sinh không hợp lệ hoặc chưa nhập.");
  }

  if (!so_dien_thoai || !phoneRegex.test(so_dien_thoai)) {
    errors.push("Số điện thoại không hợp lệ.");
  }

  if (!cccd || !cccdRegex.test(cccd)) {
    errors.push("CCCD không hợp lệ.");
  }

  if (!gioi_tinh || !["Nam", "Nữ", "Khác"].includes(gioi_tinh)) {
    errors.push("Giới tính không hợp lệ.");
  }

  if (!id_quyen) {
    errors.push("Vui lòng chọn quyền.");
  }

  if (errors.length > 0) {
    return res.status(400).json({ message: "Dữ liệu không hợp lệ", errors });
  }

  next();
};
