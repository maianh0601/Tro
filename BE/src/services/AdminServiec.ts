import { createAdmin, updateAdmin } from "./../controllers/adminController";
import { ObjectId } from "mongodb";
import {
  AdminSignTokenRestPassWord,
  getAccesstoken,
  getAccesstokenAdmin,
  SignTokenRestPassWord,
} from "../utils/getAccesstoken";
import { UserVerifyStatus } from "../constants/enum";
import AdminModel from "../models/AdminModel";
import bcrypt from "bcryptjs";

export class AdminService {
  async loginAdminService(
    user_id: any,
    verify: UserVerifyStatus
  ): Promise<string> {
    const token = await getAccesstokenAdmin({
      _id: user_id,
      verify: verify,
    });
    return token;
  }

  async createAdminService(data: any): Promise<void> {
    const { email, password } = data;

    // Kiểm tra danh mục đã tồn tại chưa
    const admin = await AdminModel.findOne({ email });
    if (admin) {
      throw new Error("Email đã tồn tại");
    }

    const salt = await bcrypt.genSalt(10);
    const hashpassword = await bcrypt.hash(password, salt);
    data.password = hashpassword;

    // Tạo mới danh mục
    const newAdmin = new AdminModel({ ...data });

    // Lưu danh mục vào cơ sở dữ liệu
    await newAdmin.save();
  }

  async updateAdminService(_id: any, data: any): Promise<void> {
    const id = new ObjectId(_id);
    const {
      id_quyen,
      email,
      password,
      username,
      ho_va_ten,
      ngay_sinh,
      verify,
      que_quan,
      so_dien_thoai,
      gioi_tinh,
      cccd,
      is_block,
    } = data;

    const update = await AdminModel.findById(id);
    if (!update) {
      throw new Error("ID admin không tồn tại");
    }

    if (password) {
      const salt = await bcrypt.genSalt(10);
      update.password = await bcrypt.hash(password, salt);
    }

    update.id_quyen = id_quyen ?? update.id_quyen;
    update.email = email ?? update.email;
    update.username = username ?? update.username;
    update.ho_va_ten = ho_va_ten ?? update.ho_va_ten;
    update.ngay_sinh = ngay_sinh ?? update.ngay_sinh;
    update.verify = verify ?? update.verify;
    update.que_quan = que_quan ?? update.que_quan;
    update.so_dien_thoai = so_dien_thoai ?? update.so_dien_thoai;
    update.gioi_tinh = gioi_tinh ?? update.gioi_tinh;
    update.cccd = cccd ?? update.cccd;
    update.is_block = is_block ?? update.is_block;

    // Lưu các thay đổi vào cơ sở dữ liệu
    await update.save();
  }

  async deleteAdminService(body: any): Promise<void> {
    const { id } = body;
    const delet = await AdminModel.findById(id);
    if (!delet) {
      throw new Error("Admin không tồn tại");
    }
    await AdminModel.findByIdAndDelete(id);
  }

  async forgotPasswordAdminService(
    user_id: any,
    verify: UserVerifyStatus
  ): Promise<string> {
    const forgot_password_token = await AdminSignTokenRestPassWord({
      _id: user_id,
      verify: verify,
    });
    return forgot_password_token;
  }

  async ResetPassWordAdminService(
    user_id: any,
    password: string
  ): Promise<{ message: string }> {
    const admin = await AdminModel.findById(user_id);
    if (!admin) {
      throw new Error(`Admin không Tồn Tại!!!`);
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    admin.password = hashedPassword;
    await admin.save();

    return {
      message: "Đổi mật khẩu thành công",
    };
  }

  async getAdmin(user_id: string) {
    const user = await AdminModel.findOne({
      _id: new ObjectId(user_id),
    }).select(" -createdAt -updatedAt -__v");

    return user;
  }

  async getAdminAll() {
    const user = await AdminModel.aggregate([
      {
        $lookup: {
          from: "quyens",
          let: { id_quyen: "$id_quyen" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: [{ $toString: "$_id" }, "$$id_quyen"],
                },
              },
            },
          ],
          as: "quyens",
        },
      },
      {
        $unwind: {
          path: "$quyens",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $addFields: {
          ten_quyen: "$quyens.ten_quyen", // đẩy field ra ngoài
        },
      },
      {
        $project: {
          quyens: 0, // ẩn object "quyens" gốc
        },
      },
    ]);

    return user;
  }
}
