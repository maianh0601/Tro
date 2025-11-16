import { HoaDonService } from "./../services/HoaDonService";
import nodemailer from "nodemailer";
import { Request, Response } from "express";
import PhongTroModel from "../models/PhongTroModel";
import HoaDonThanhToanModel from "../models/HoaDonThanhToanModel";
import dotenv from "dotenv";
dotenv.config();

const hoaDonService = new HoaDonService();

export const CreateHoaDon = async (req: Request, res: Response) => {
  try {
    const { user }: any = req;
    const { ma_phong } = req.body;

    const check = await PhongTroModel.findOne({ id_users: user._id });
    if (check) {
      return res.status(400).json({ message: "Bạn đã thuê phòng rồi" });
    }

    const latestInvoice = await HoaDonThanhToanModel.findOne({
      id_users: user._id,
    }).sort({ ngay_chuyen_khoan: -1 });

    if (latestInvoice) {
      const FIFTEEN_MINUTES = 15 * 60 * 1000;
      const now = new Date().getTime();
      const last = new Date(latestInvoice.ngay_chuyen_khoan).getTime();

      if (now - last < FIFTEEN_MINUTES) {
        const waitMinutes = Math.ceil((FIFTEEN_MINUTES - (now - last)) / 60000);
        return res.status(429).json({
          message: `Vui lòng chờ thêm ${waitMinutes} phút nữa để tạo hóa đơn mới hoặc thanh toán hóa đơn cũ`,
        });
      }
    }

    const data = await PhongTroModel.findOne({ ma_phong: ma_phong });
    if (!data) return res.status(404).json({ message: "Phòng không tồn tại" });

    const hoadon = {
      ma_phong: data.ma_phong,
      id_users: user._id,
      so_tien: data.gia_tien,
      noi_dung: "thanh toán tiền phòng",
      ma_don_hang: "HD" + Math.floor(Math.random() * 1000000),
      ngay_chuyen_khoan: new Date(),
      trang_thai: "chưa thanh toán",
    };

    const newHoaDon = new HoaDonThanhToanModel(hoadon);
    await newHoaDon.save();
    await sendEmail(user, newHoaDon);

    res.status(201).json(newHoaDon);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

const sendEmail = async (user: any, hoadon: any) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.MAIL_USERNAME,
      pass: process.env.MAIL_PASSWORD,
    },
  });

  const hopdonglink = `${process.env.CLIENT_URL}/hopdong/${hoadon.ma_phong}`;
  const linkThanhToan = `${process.env.CLIENT_URL}/thanh-toan/${hoadon.ma_don_hang}`;
  const mailOptions = {
    from: process.env.MAIL_USERNAME,
    to: user.email,
    subject: "Hóa Đơn Thuê Trọ",
    html: `
    <div style="max-width: 600px; margin: 30px auto; padding: 30px; font-family: 'Helvetica', 'Arial', sans-serif; border: 1px solid #e5e7eb; border-radius: 16px; background: #ffffff; box-shadow: 0 6px 20px rgba(0,0,0,0.08);">
  <!-- Logo -->
  <div style="text-align: center; margin-bottom: 30px;">
    <img src="../../../FE/src/assets/logo/Logo.svg" alt="Logo" style="width: 120px; max-width: 100%; height: auto;">
  </div>

  <!-- Tiêu đề -->
  <h2 style="text-align: center; color: #1f2937; font-size: 26px; margin-bottom: 15px; font-weight: 700;">📄 HÓA ĐƠN ĐẶT CỌC</h2>
  <p style="text-align: center; color: #6b7280; font-size: 16px; margin-bottom: 30px;">Chào <b style="color: #1f2937;">${user.username}</b>, chúng tôi đã nhận được đơn đặt cọc phòng của bạn.</p>

  <!-- Nội dung hóa đơn -->
  <div style="background: #f9fafb; padding: 25px; border-left: 5px solid #ec4899; border-radius: 12px; box-shadow: 0 3px 10px rgba(0,0,0,0.05); margin-bottom: 25px;">
    <!-- Thông tin hóa đơn -->
    <div style="margin-bottom: 15px;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
        <h3 style="font-size: 16px; color: #374151; font-weight: 600;">Mã đơn hàng:</h3>
        <p style="font-size: 16px; color: #6b7280;">${hoadon.ma_don_hang}</p>  
      </div>
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
        <h3 style="font-size: 16px; color: #374151; font-weight: 600;">Người nhận:</h3>
        <p style="font-size: 16px; color: #6b7280;">${user.username}</p>
      </div>
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
        <h3 style="font-size: 16px; color: #374151; font-weight: 600;">Phòng:</h3>
        <p style="font-size: 16px; color: #6b7280;">${hoadon.ma_phong}</p>  
      </div>
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <h3 style="font-size: 16px; color: #374151; font-weight: 600;">Số tiền đặt cọc:</h3>
        <p style="font-size: 16px; color: #6b7280;">${hoadon.so_tien} VND</p>
      </div>
    </div>

    <!-- Thông tin thanh toán và nút CTA -->
    <div style="display: flex; justify-content: space-between; font-size: 14px; color: #6b7280; border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 20px;">
      <div style="width: 50%;">
        <a href="${hopdonglink}" style="display: inline-block; padding: 12px 25px; background: #3b82f6; color: #ffffff; text-decoration: none; border-radius: 8px; font-size: 15px; font-weight: 600; transition: background 0.3s ease; text-align: center;">📜 Xem hợp đồng</a>
      </div>
      <div style="width: 50%; text-align: right;">
        <a href="${linkThanhToan}" style="display: inline-block; padding: 12px 25px; background: #10b981; color: #ffffff; text-decoration: none; border-radius: 8px; font-size: 15px; font-weight: 600; transition: background 0.3s ease; text-align: center;">💳 Thanh toán ngay</a>
      </div>
    </div>
  </div>

  <!-- CSS Responsive -->
  <style>
    @media (max-width: 480px) {
      div[style*="max-width: 600px"] {
        padding: 20px;
        margin: 10px;
      }
      h2 {
        font-size: 22px;
      }
      p, a {
        font-size: 14px !important;
      }
      img {
        width: 90px;
      }
      a[style*="display: inline-block"] {
        padding: 10px 20px;
        font-size: 14px !important;
        width: 100%;
        box-sizing: border-box;
      }
      div[style*="display: flex; justify-content: space-between"] {
        flex-direction: column;
        gap: 15px;
      }
      div[style*="display: flex; justify-content: space-between"] > div {
        width: 100% !important;
        text-align: center !important;
      }
    }
  </style>
</div>
`,
  };

  await transporter.sendMail(mailOptions);
};

export const getAllHoaDon = async (req: Request, res: Response) => {
  try {
    const hoadon = await hoaDonService.getAll();
    if (!hoadon || hoadon.length === 0)
      return res.status(404).json({ message: "Không có hóa đơn nào" });
    res.status(200).json({
      status: "200",
      data: hoadon,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getByIdHoaDon = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const hoadon = await hoaDonService.findById(id);
    if (!hoadon)
      return res.status(404).json({ message: "Không tìm thấy hóa đơn" });
    res.status(200).json({
      status: "200",
      data: hoadon,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

export const deleteHoadon = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const hoadon = await HoaDonThanhToanModel.findByIdAndDelete(id);
    if (!hoadon)
      return res.status(404).json({ message: "Không tìm thấy hóa đơn" });
    res.status(200).json({ message: "Xóa hóa đơn thành công" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const DetaijHoaDon = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const hoadon = await hoaDonService.getById(id);
    if (!hoadon)
      return res.status(404).json({ message: "Không tìm thấy hóa đơn" });
    res.status(200).json(hoadon);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateHoaDonStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { trang_thai } = req.body as { trang_thai?: string };

    if (!trang_thai) {
      return res.status(400).json({ message: "Thiếu trường trang_thai" });
    }

    const hoadon = await HoaDonThanhToanModel.findById(id);
    if (!hoadon) {
      return res.status(404).json({ message: "Không tìm thấy hóa đơn" });
    }

    hoadon.trang_thai = trang_thai;
    if (trang_thai === "đã thanh toán") {
      hoadon.ngay_chuyen_khoan = new Date();
      // Cập nhật trạng thái phòng/thuê nếu cần
      await PhongTroModel.findOneAndUpdate(
        { ma_phong: hoadon.ma_phong },
        { id_users: hoadon.id_users, trang_thai: 0 },
        { new: true }
      );
    }

    await hoadon.save();

    return res.status(200).json({ message: "Cập nhật trạng thái hóa đơn thành công", data: hoadon });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};