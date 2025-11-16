import { Request, Response } from "express";
import { HoaDonThangService } from "../services/HoaDonTungThangService";
import HoaDonTungThangModel from "../models/HoaDonTungThangModel";
import HoaDonThanhToanModel from "../models/HoaDonThanhToanModel";
import nodemailer from "nodemailer";
import UserModel from "../models/UserModel";
import DichVuModel from "../models/DichVuModel";

const hoaDonThangService = new HoaDonThangService();

export const taoHoaDon = async (req: Request, res: Response) => {
  try {
    const { ma_phong, id_users, ngay_tao_hoa_don } = req.body;

    // Kiểm tra dữ liệu đầu vào
    if (!ma_phong) {
      return res.status(400).json({
        message: "Thiếu thông tin: ma_phong",
      });
    }
    if (!id_users) {
      return res.status(400).json({
        message: "Thiếu thông tin: id_user",
      });
    }
    if (!ngay_tao_hoa_don) {
      return res.status(400).json({
        message: "Thiếu thông tin: ngay_tao_hoa_don là bắt buộc",
      });
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(ngay_tao_hoa_don)) {
      return res
        .status(400)
        .json({ message: "Định dạng ngày không hợp lệ (YYYY-MM-DD)" });
    }

    const hoaDon = await hoaDonThangService.taoHoaDon(
      ma_phong,
      id_users,
      ngay_tao_hoa_don
    );

    // Lấy thông tin người thuê
    const nguoiThue = await UserModel.findById(id_users);
    if (!nguoiThue) {
      return res.status(404).json({ message: 'Không tìm thấy người thuê' });
    }

    // Gửi email
    await sendEmail(nguoiThue, hoaDon);

    return res.status(201).json({
      message: "Tạo hóa đơn tháng thành công",
      data: hoaDon,
    });
  } catch (error) {
    if (error instanceof Error) {
      return res.status(500).json({ message: `Lỗi: ${error.message}` });
    }
    console.error("Lỗi không xác định:", error);
    return res.status(500).json({ message: "Lỗi server nội bộ" });
  }
};

export const getHoaDon = async (req: any, res: any) => {
  try {
    const data = await hoaDonThangService.getDataHoaDon();

    res.status(200).json({
      status: "200",
      data: data,
    });
  } catch (error: any) {
    res.status(404).json({
      message: error.message,
    });
  }
};

export const getHoaDonUser = async (req: Request, res: Response) => {
  try {
    const { id_user } = req.params;
    const data = await hoaDonThangService.getUserHoaDon(id_user);

    if (!data || data.length === 0) {
      return res.status(404).json({
        status: "404",
        message: "No invoices found for this user",
      });
    }

    res.status(200).json({
      status: "200",
      data: data,
    });

    
  } catch (error: any) {
    res.status(404).json({
      message: error.message,
    });
  }
};

export const updateHoaDon = async (req: any, res: any) => {
  try {
    const _id = req.params;
    const data = req.body;

    await hoaDonThangService.updateData(_id, data);

    res.status(200).json({
      message: "Hóa đơn đã được cập nhật thành công",
    });
  } catch (error: any) {
    res.status(404).json({
      message: error.message,
    });
  }
};

export const deleteHoaDonByID = async (req: any, res: any) => {
  const { id } = req.params;
  try {
    await hoaDonThangService.deleteByIdHoaDon({ id });

    res.status(200).json({
      status: "200",
      message: "Đã xóa thành công!",
    });
  } catch (error: any) {
    res.status(404).json({
      message: error.message,
    });
  }
};

export const getByIdHoaDon = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    console.log("ID nhận được:", id);
    const hoadonThang = await hoaDonThangService.findById(id);
    if (!hoadonThang)
      return res.status(404).json({ message: "Không tìm thấy hóa đơn" });
    res.status(200).json({
      status: "200",
      data: hoadonThang,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

// Hàm tự động tạo hóa đơn mới cho tháng tiếp theo
export const tuDongTaoHoaDonThang = async () => {
  try {
    const danhSachHoaDonMoiNhat = await HoaDonTungThangModel.aggregate([
      { $sort: { ngay_tao_hoa_don: -1 } },
      { $group: { _id: "$ma_phong", hoaDonMoiNhat: { $first: "$$ROOT" } } },
    ]);

    if (!danhSachHoaDonMoiNhat?.length) {
      console.log("Chưa có hóa đơn nào trong hệ thống.");
      return;
    }

    const ngayHienTai = new Date();
    const thangHienTai = ngayHienTai.toISOString().slice(0, 7);
    const ngayCuoiThang = new Date(
      ngayHienTai.getFullYear(),
      ngayHienTai.getMonth() + 1,
      0,
      23,
      59,
      59,
      999
    );

    const ngươithue = await UserModel.findOne({
      _id: danhSachHoaDonMoiNhat[0].hoaDonMoiNhat.id_users,
    });
    if (!ngươithue) {
      console.log("Người thuê không tồn tại.");
    }

    for (const { hoaDonMoiNhat } of danhSachHoaDonMoiNhat) {
      const { ma_phong, id_users, trang_thai, ngay_tao_hoa_don } =
        hoaDonMoiNhat;

      if (!ma_phong || !id_users) {
        console.log(
          `Hóa đơn của phòng ${ma_phong} thiếu mã phòng hoặc ID người dùng, bỏ qua.`
        );
        continue;
      }

      const ngayTaoCuoi = new Date(ngay_tao_hoa_don);
      const thangTruoc = ngayTaoCuoi.toISOString().slice(0, 7);

      // Kiểm tra tháng cách nhau 1 tháng
      const thangHienTaiDate = new Date(`${thangHienTai}-01`);
      const thangTruocDate = new Date(`${thangTruoc}-01`);
      const thangCachBiet =
        (thangHienTaiDate.getFullYear() - thangTruocDate.getFullYear()) * 12 +
        thangHienTaiDate.getMonth() -
        thangTruocDate.getMonth();

      if (thangCachBiet !== 1) {
        console.log(
          `Hóa đơn phòng ${ma_phong} có ngày tạo ${ngay_tao_hoa_don} không cách tháng hiện tại (${thangHienTai}) đúng 1 tháng, bỏ qua.`
        );
        continue;
      }

      // Tính ngày tạo hóa đơn mong muốn
      const ngayCuoiThangHienTai = new Date(
        ngayHienTai.getFullYear(),
        ngayHienTai.getMonth() + 1,
        0
      ).getDate();
      const ngayMongMuon = Math.min(
        ngayTaoCuoi.getDate(),
        ngayCuoiThangHienTai
      );
      const ngayTaoMongMuon = new Date(
        ngayHienTai.getFullYear(),
        ngayHienTai.getMonth(),
        ngayMongMuon,
        ngayTaoCuoi.getHours(),
        ngayTaoCuoi.getMinutes(),
        ngayTaoCuoi.getSeconds()
      );

      // Kiểm tra ngày hiện tại khớp ngày mong muốn
      const ngayHienTaiChiLayNgay = new Date(
        ngayHienTai.getFullYear(),
        ngayHienTai.getMonth(),
        ngayHienTai.getDate()
      );
      const ngayTaoMongMuonChiLayNgay = new Date(
        ngayTaoMongMuon.getFullYear(),
        ngayTaoMongMuon.getMonth(),
        ngayTaoMongMuon.getDate()
      );

      if (
        ngayHienTaiChiLayNgay.getTime() !== ngayTaoMongMuonChiLayNgay.getTime()
      ) {
        console.log(
          `Ngày hiện tại (${ngayHienTai
            .toISOString()
            .slice(
              0,
              10
            )}) không phải ngày tạo hóa đơn mong muốn (${ngayTaoMongMuon
            .toISOString()
            .slice(0, 10)}) cho phòng ${ma_phong}, bỏ qua.`
        );
        continue;
      }

      // Kiểm tra hóa đơn đã tồn tại
      const hoaDonDaTonTai = await HoaDonTungThangModel.findOne({
        ma_phong,
        ngay_tao_hoa_don: {
          $gte: new Date(`${thangHienTai}-01T00:00:00Z`),
          $lte: ngayCuoiThang,
        },
      });

      if (trang_thai === "chưa thanh toán") {
        console.log(
          `Phòng ${ma_phong} có hóa đơn tháng ${thangTruoc} chưa thanh toán. Yêu cầu thanh toán!`
        );
        continue;
      }

      if (trang_thai === "đã thanh toán" && !hoaDonDaTonTai) {
        console.log(
          `Tự động tạo hóa đơn tháng ${thangHienTai} cho phòng ${ma_phong} vào ngày ${ngayTaoMongMuon
            .toISOString()
            .slice(0, 10)}`
        );
        const newHoaDon = await hoaDonThangService.taoHoaDon(
          ma_phong,
          id_users,
          thangHienTai
        );
        newHoaDon.ngay_tao_hoa_don = ngayTaoMongMuon;
        await newHoaDon.save();
        if (ngươithue) await sendEmail(ngươithue, newHoaDon);
        console.log(
          `Hóa đơn tháng ${thangHienTai} cho phòng ${ma_phong} đã được tạo!`
        );
      } else if (hoaDonDaTonTai) {
        console.log(`Phòng ${ma_phong} đã có hóa đơn tháng ${thangHienTai}!`);
      }
    }
  } catch (error) {
    console.error("Lỗi khi tự động tạo hóa đơn tháng:", error);
  }
};

// Hàm tự động tạo hóa đơn tháng đầu tiên cho phòng được thuê
export const tuDongTaoHoaDon = async () => {
  try {
    const danhSachHoaDonMoiNhat = await HoaDonThanhToanModel.aggregate([
      { $sort: { ngay_chuyen_khoan: -1 } },
      {
        $group: {
          _id: "$ma_phong",
          hoaDonMoiNhat: { $first: "$$ROOT" },
        },
      },
    ]);

    if (!danhSachHoaDonMoiNhat?.length) {
      console.log("Chưa có hóa đơn nào trong hệ thống.");
      return;
    }

    const ngayHienTai = new Date();
    const thangHienTai = ngayHienTai.toISOString().slice(0, 7); // Ví dụ: "2025-04"
    const ngayCuoiThang = new Date(
      ngayHienTai.getFullYear(),
      ngayHienTai.getMonth() + 1,
      0,
      23,
      59,
      59,
      999
    );

    const ngươithue = await UserModel.findOne({
      _id: danhSachHoaDonMoiNhat[0].hoaDonMoiNhat.id_users,
    });
    if (ngươithue) {
      console.log(ngươithue.email);
    } else {
      console.log("Người thuê không tồn tại.");
    }

    for (const { hoaDonMoiNhat } of danhSachHoaDonMoiNhat) {
      const { ma_phong, id_users, trang_thai, ngay_chuyen_khoan } =
        hoaDonMoiNhat;

      if (!ma_phong || !id_users) {
        console.log(
          `Hóa đơn của phòng ${ma_phong} thiếu mã phòng hoặc ID người dùng, bỏ qua.`
        );
        continue;
      }

      const ngayChuyenKhoanCuoi = new Date(ngay_chuyen_khoan);
      const thangChuyenKhoan = ngayChuyenKhoanCuoi.toISOString().slice(0, 7); // Ví dụ: "2025-03"

      // Kiểm tra nếu tháng hiện tại không cách tháng chuyển khoản đúng 1 tháng
      const thangHienTaiDate = new Date(thangHienTai + "-01");
      const thangChuyenKhoanDate = new Date(thangChuyenKhoan + "-01");
      const thangCachBiet =
        (thangHienTaiDate.getFullYear() - thangChuyenKhoanDate.getFullYear()) *
          12 +
        thangHienTaiDate.getMonth() -
        thangChuyenKhoanDate.getMonth();

      if (thangCachBiet !== 1) {
        console.log(
          `Hóa đơn phòng ${ma_phong} có ngày chuyển khoản ${ngay_chuyen_khoan} không cách tháng hiện tại (${thangHienTai}) đúng 1 tháng, bỏ qua.`
        );
        continue;
      }

      // Tính ngày tạo hóa đơn mong muốn cho tháng hiện tại
      const ngayCuoiThangHienTai = new Date(
        ngayHienTai.getFullYear(),
        ngayHienTai.getMonth() + 1,
        0
      ).getDate();
      const ngayMongMuon = Math.min(
        ngayChuyenKhoanCuoi.getDate(),
        ngayCuoiThangHienTai
      );
      const ngayTaoMongMuon = new Date(
        ngayHienTai.getFullYear(),
        ngayHienTai.getMonth(),
        ngayMongMuon,
        ngayChuyenKhoanCuoi.getHours(),
        ngayChuyenKhoanCuoi.getMinutes(),
        ngayChuyenKhoanCuoi.getSeconds()
      );

      // Kiểm tra nếu ngày hiện tại không đúng ngày tạo hóa đơn mong muốn
      const ngayHienTaiChiLayNgay = new Date(
        ngayHienTai.getFullYear(),
        ngayHienTai.getMonth(),
        ngayHienTai.getDate()
      );
      const ngayTaoMongMuonChiLayNgay = new Date(
        ngayTaoMongMuon.getFullYear(),
        ngayTaoMongMuon.getMonth(),
        ngayTaoMongMuon.getDate()
      );

      if (
        ngayHienTaiChiLayNgay.getTime() !== ngayTaoMongMuonChiLayNgay.getTime()
      ) {
        console.log(
          `Ngày hiện tại (${ngayHienTai
            .toISOString()
            .slice(
              0,
              10
            )}) không phải ngày tạo hóa đơn mong muốn (${ngayTaoMongMuon
            .toISOString()
            .slice(0, 10)}) cho phòng ${ma_phong}, bỏ qua.`
        );
        continue;
      }

      const hoaDonDaTonTai = await HoaDonTungThangModel.findOne({
        ma_phong,
        ngay_tao_hoa_don: {
          $gte: new Date(`${thangHienTai}-01T00:00:00Z`),
          $lte: ngayCuoiThang,
        },
      });

      if (trang_thai === "chưa thanh toán") {
        console.log(
          `Phòng ${ma_phong} có hóa đơn thuê trọ chưa thanh toán. Yêu cầu thanh toán!`
        );
        continue;
      }

      if (trang_thai === "đã thanh toán" && !hoaDonDaTonTai) {
        console.log(
          `Tự động tạo hóa đơn tháng đầu tiên: ${thangHienTai} cho phòng ${ma_phong} vào ngày ${ngayTaoMongMuon
            .toISOString()
            .slice(0, 10)}`
        );
        const newHoaDon = await hoaDonThangService.taoHoaDon(
          ma_phong,
          id_users,
          thangHienTai
        );

        // Cập nhật ngay_tao_hoa_don
        newHoaDon.ngay_tao_hoa_don = ngayTaoMongMuon;
        await newHoaDon.save();

        // Gửi email
        await sendEmail(ngươithue, newHoaDon);

        console.log(
          `Hóa đơn tháng đầu tiên: ${thangHienTai} cho phòng ${ma_phong} đã được tạo thành công!`
        );
      } else if (hoaDonDaTonTai) {
        console.log(`Phòng ${ma_phong} đã có hóa đơn tháng đầu tiên.`);
      }
    }
  } catch (error) {
    console.error("Lỗi khi tự động tạo hóa đơn tháng đầu tiên:", error);
  }
};

// Hàm gửi email
const sendEmail = async (ngươithue: any, hoaDon: any) => {
  // Lấy dữ liệu dịch vụ
  const dichVu = await DichVuModel.findOne();
  if (!dichVu)
    throw new Error("Không tìm thấy thông tin dịch vụ cho phòng này");

  const giaDien = dichVu.tien_dien ?? 0;
  const tienNuoc = dichVu.tien_nuoc ?? 0;
  const tienWifi = dichVu.tien_wifi ?? 0;

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.MAIL_USERNAME,
      pass: process.env.MAIL_PASSWORD,
    },
  });

  const linkThanhToanThang = `${process.env.CLIENT_URL}/thanh-toan-thang/${hoaDon.ma_hoa_don_thang}`;
  const mailOptions = {
    from: process.env.MAIL_USERNAME,
    to: ngươithue.email,
    subject: "Hóa Đơn Thuê Trọ Hàng Tháng",
    html: `
    <div style="max-width: 600px; margin: 20px auto; padding: 25px; font-family: 'Arial', sans-serif; border: 1px solid #e0e0e0; border-radius: 12px; background: linear-gradient(135deg, #ffffff, #f5f7fa); box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
      <!-- Logo -->
      <div style="text-align: center; margin-bottom: 25px;">
        <img src="../../../FE/src/assets/logo/Logo.svg" alt="Logo" style="width: 100px; max-width: 100%; height: auto;">
      </div>

      <!-- Tiêu đề -->
      <h2 style="text-align: center; color: #2c3e50; font-size: 24px; margin-bottom: 20px;">📄 HÓA ĐƠN THUÊ TRỌ THÁNG</h2>
      <p style="text-align: center; color: #555; font-size: 16px; margin-bottom: 25px;">Chào <b>${
        ngươithue.ho_va_ten || ngươithue.username || "Khách hàng"
      }</b>, dưới đây là hóa đơn tháng mới của bạn.</p>

      <!-- Nội dung hóa đơn -->
      <div style="background: #fff; padding: 20px; border-left: 5px solid #e91e63; border-radius: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); margin-bottom: 20px;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <h3 style="font-size: 16px; color: #333; margin-right:10px;">Mã hóa đơn:</h3>
          <p style="font-size: 16px; color: #666;">${
            hoaDon.ma_hoa_don_thang || "N/A"
          }</p>  
        </div>
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <h3 style="font-size: 16px; color: #333; margin-right:10px;">Mã phòng:</h3>
          <p style="font-size: 16px; color: #666;">${hoaDon.ma_phong}</p>
        </div>
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <h3 style="font-size: 16px; color: #333; margin-right:10px;">Tiền phòng:</h3>
          <p style="font-size: 16px; color: #666;">${hoaDon.tien_phong} VND</p>
        </div>
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <h3 style="font-size: 16px; color: #333; margin-right:10px;">Tiền điện:</h3>
          <p style="font-size: 16px; color: #666;">${giaDien} VND</p>
        </div>
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <h3 style="font-size: 16px; color: #333; margin-right:10px;">Tiền Nước:</h3>
          <p style="font-size: 16px; color: #666;">${tienNuoc} VND</p>
        </div>
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <h3 style="font-size: 16px; color: #333; margin-right:10px;">Tiền Wifi:</h3>
          <p style="font-size: 16px; color: #666;">${tienWifi} VND</p>
        </div>
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <h3 style="font-size: 16px; color: #333; margin-right:10px;">Tổng tiền:</h3>
          <p style="font-size: 16px; color: #666;">${hoaDon.tong_tien} VND</p>
        </div>
        <!-- Thông tin thanh toán -->
        <div style="font-size: 13px; color: #555; border-top: 1px solid #eee; padding-top: 15px; margin-top: 15px;">
          <div style="width: 50%; text-align: right;">
            <a href="${linkThanhToanThang}" style="display: inline-block; padding: 12px 25px; background: #10b981; color: #ffffff; text-decoration: none; border-radius: 8px; font-size: 15px; font-weight: 600; transition: background 0.3s ease; text-align: center;">💳 Thanh toán ngay</a>
          </div>
        </div>
      </div>
    </div>

    <!-- CSS Responsive -->
    <style>
      @media (max-width: 480px) {
        div[style*="max-width: 600px"] { padding: 15px; margin: 10px; }
        h2 { font-size: 20px; }
        p, a { font-size: 14px !important; }
        img { width: 80px; }
        div[style*="display: flex; justify-content: space-between"] { flex-direction: column; }
      }
    </style>
    `,
  };

  await transporter.sendMail(mailOptions);
};
