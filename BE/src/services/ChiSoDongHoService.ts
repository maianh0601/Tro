import ChiSoDongHoModel from "../models/ChiSoDongHoModel";
import HoaDonTungThangModel from "../models/HoaDonTungThangModel";
import DichVuModel from "../models/DichVuModel"; // Thêm model dịch vụ
import UserModel from "../models/UserModel";     // Để gửi thông báo cho người dùng (giả sử đã có)
import PhongTroModel from "../models/PhongTroModel";
import nodemailer from 'nodemailer';
import { config } from 'dotenv';
config();
class ChiSoDongHoService {

    async createChiSoDongHo(_id: string, data: any) {
        try {
            const chisodongho = new ChiSoDongHoModel({
                ma_phong: data.ma_phong,
                id_users:_id,
                ngay_thang_nam: data.ngay_thang_nam,
                chi_so_dien: data.chi_so_dien,
                image_dong_ho_dien: data.image_dong_ho_dien
            });
            await chisodongho.save();
            await this.calculateAndSaveInvoice(data.ma_phong, data.ngay_thang_nam);
        } catch (error) {
            console.error(' Lỗi khi thêm chỉ số đồng hồ:', error);
        }
    }

    // Tính toán và lưu hóa đơn hàng tháng
    async calculateAndSaveInvoice(ma_phong: string, ngay_thang_nam: string) {
        try {
            const ngay = new Date(ngay_thang_nam);
            const phongtro = await PhongTroModel.findOne({ma_phong});
            if (!phongtro) {
                console.log(' Không tìm thấy phòng trọ.');
                return;
            }
            // Lấy chỉ số điện tháng hiện tại
            const chiSoHienTai = await ChiSoDongHoModel.findOne({ ma_phong: ma_phong, ngay_thang_nam:ngay  });
            if (!chiSoHienTai) {
                console.log(' Không tìm thấy chỉ số tháng hiện tại.');
                return;
            }

            // Lấy chỉ số điện tháng trước
            const date = new Date(ngay_thang_nam);
            const lastMonth = new Date(date.setMonth(date.getMonth() - 1));

            const chiSoThangTruoc = await ChiSoDongHoModel.findOne({
                ma_phong: ma_phong,
                ngay_thang_nam: {
                    $gte: new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 1),
                    $lt: new Date(lastMonth.getFullYear(), lastMonth.getMonth() + 1, 1),
                },
            });
            // Lấy thông tin các dịch vụ (nước, wifi)
            const dichVu = await DichVuModel.find()
            if(!dichVu){
                console.log(' Không tìm thấy dịch vụ.');
                return;
            }
            const tienNuoc = dichVu[0]?.tien_nuoc || 0;
            const tienWifi = dichVu[0]?.tien_wifi || 0;
            const tienDien = dichVu[0]?.tien_dien || 0;

            const chiSoThangTruocValue = chiSoThangTruoc ? chiSoThangTruoc.chi_so_dien : 0;
            const soDienTieuThu = chiSoHienTai.chi_so_dien - chiSoThangTruocValue;
            const tiendien = soDienTieuThu * tienDien;

          

            // Tính tổng tiền
            const tongTien =  tienNuoc + tienWifi + tiendien + phongtro.gia_tien;

            // Tạo hóa đơn
            const hoaDon = new HoaDonTungThangModel({
                ma_phong: chiSoHienTai.ma_phong,
                id_users: chiSoHienTai.id_users,
                chi_so_dien_thang_nay: chiSoHienTai.chi_so_dien,
                chi_so_dien_thang_truoc: chiSoThangTruocValue,
                so_dien_tieu_thu: soDienTieuThu,
                tien_dien: tienDien,
                tien_phong: phongtro.gia_tien,
                tong_tien: tongTien,
                ngay_tao_hoa_don: new Date(),
            });

            await hoaDon.save();
            console.log(' Hóa đơn đã được tạo và lưu thành công.');

            const user = await UserModel.findOne({ _id: chiSoHienTai.id_users });
         
            if (user) {
                await this.sendEmail(user, hoaDon);
            } else {
                console.error(' Không tìm thấy người dùng.');
            }

        } catch (error) {
            console.error(' Lỗi khi tính toán và lưu hóa đơn:', error);
        }
    }

    sendEmail = async (user: any, hoadon: any) => {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.MAIL_USERNAME,
        pass: process.env.MAIL_PASSWORD,
      },
    });
  
        // Lấy tháng và năm của hóa đơn
        const ngayTaoHoaDon = new Date(hoadon.ngay_tao_hoa_don);
        console.log(ngayTaoHoaDon)
        const thangDongTien = `${ngayTaoHoaDon.getMonth() + 1}/${ngayTaoHoaDon.getFullYear()}`; // Lưu ý: getMonth() trả về từ 0-11 nên cần +1
        console.log(thangDongTien)
   const mailOptions = {
        from: process.env.MAIL_USERNAME,
        to: user.email,  // Đảm bảo đây là địa chỉ email hợp lệ
        subject: `Hóa đơn tiền phòng ${thangDongTien}`,
        text: `Chào ${user.username},\n\nDưới đây là hóa đơn tiền phòng của bạn cho tháng ${thangDongTien}:\n- Tổng tiền: ${hoadon.tong_tien} VNĐ\n- Tiền phòng: ${hoadon.tien_phong} VNĐ\n- Tiền điện: ${hoadon.tien_dien} VNĐ\n\n\nVui lòng thanh toán trước ngày hết hạn.\n\nTrân trọng!`,
    };
  
    await transporter.sendMail(mailOptions);
  };
}

export default ChiSoDongHoService;
