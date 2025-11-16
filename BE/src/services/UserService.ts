import UserModel from "../models/UserModel";
import bcrypt from "bcryptjs";
import axios from "axios";
import {
  getAccesstoken,
  SignTokenRestPassWord,
  signverifyEmailToken,
  verifyToken,
} from "../utils/getAccesstoken";
import { UserVerifyStatus } from "../constants/enum";
import { ObjectId } from "mongodb";
import jwkToPemModule from "jwk-to-pem";

export class UserService {
  async registerUser(body: any): Promise<string> {
    const { email, password } = body;
    const user = await UserModel.findOne({ email });
    if (user) {
      throw new Error(`Tài khoản đã tồn tại`);
    }

    const salt = await bcrypt.genSalt(10);
    const hashpassword = await bcrypt.hash(password, salt);
    body.password = hashpassword;

    // Save new user
    const newUser: any = new UserModel(body);
    const savedUser = await newUser.save();
    const userId = savedUser._id;
    const email_verify_token = await signverifyEmailToken({
      _id: userId,
      verify: UserVerifyStatus.Unverified,
    });

    return email_verify_token; // Trả về token
  }

  async loginUser(user_id: any, verify: UserVerifyStatus): Promise<string> {
    const token = await getAccesstoken({
      _id: user_id,
      verify: verify,
    });
    return token;
  }

  async forgotPassword(
    user_id: any,
    verify: UserVerifyStatus
  ): Promise<string> {
    const forgot_password_token = await SignTokenRestPassWord({
      _id: user_id,
      verify: verify,
    });
    return forgot_password_token;
  }

  async ResetPassWord(
    user_id: any,
    password: string
  ): Promise<{ message: string }> {
    const user = await UserModel.findById(user_id);
    if (!user) {
      throw new Error(`User không Tồn Tại!!!`);
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user.password = hashedPassword;
    await user.save();

    return {
      message: "Đổi mật khẩu thành công",
    };
  }

  async updateUserService(_id: any, data: any): Promise<void> {
    const id = new ObjectId(_id);
    const {
      id_quyen,
      email,
      password,
      oldPassword,
      username,
      ho_va_ten,
      ngay_sinh,
      verify,
      que_quan,
      so_dien_thoai,
      gioi_tinh,
      cccd,
    } = data;

    // Kiểm tra danh mục cần cập nhật có tồn tại không
    const update = await UserModel.findById(id);
    if (!update) {
      throw new Error("ID Người dùng không tồn tại");
    }

    if (password) {
      if (!oldPassword) {
        throw new Error("Vui lòng nhập mật khẩu cũ để xác nhận thay đổi");
      }

      if (!update.password) {
        throw new Error("Tài khoản chưa có mật khẩu để kiểm tra");
      }

      const isMatch = await bcrypt.compare(oldPassword, update.password);
      const isSamePassword = await bcrypt.compare(password, update.password);

      if (isSamePassword) {
        throw new Error("Vui lòng nhập mật khẩu mới khác mật khẩu cũ.");
      }

      if (!isMatch) {
        throw new Error("Mật khẩu cũ không đúng");
      }

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

    await update.save();
  }

  async deleteUserService(body: any): Promise<void> {
    const { id } = body;
    const delet = await UserModel.findById(id);
    if (!delet) {
      throw new Error("User không tồn tại");
    }
    await UserModel.findByIdAndDelete(id);
  }

  async getMe(user_id: string) {
    const user = await UserModel.findOne({ _id: new ObjectId(user_id) }).select(
      " -createdAt -updatedAt -__v -verify"
    ); // Ẩn các trường không cần thiết

    return user;
  }

  async getUserAll() {
    const user = await UserModel.find().select("-createdAt -updatedAt -__v");
    return user;
  }

  async getUserDetail(user_id: string) {
    const result = await UserModel.aggregate([
      {
        $match: { _id: new ObjectId(user_id) },
      },
      {
        $lookup: {
          from: "phongtros",
          let: { userId: { $toString: "$_id" } },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$id_users", "$$userId"] },
              },
            },
            {
              $lookup: {
                from: "hinh_anh_phongs",
                let: { ma_phong: "$ma_phong" },
                pipeline: [
                  {
                    $match: {
                      $expr: { $eq: ["$ma_phong", "$$ma_phong"] },
                    },
                  },
                  {
                    $project: {
                      ma_phong: 0,
                      _id: 0,
                      id: 0,
                      createdAt: 0,
                      updatedAt: 0,
                      __v: 0,
                    },
                  },
                ],
                as: "anhChiTiet",
              },
            },
            {
              $lookup: {
                from: "thiet_bis",
                let: { ma_phong: "$ma_phong" },
                pipeline: [
                  {
                    $match: {
                      $expr: { $eq: ["$ma_phong", "$$ma_phong"] },
                    },
                  },
                  {
                    $project: {
                      ma_phong: 0,
                      _id: 0,
                      id: 0,
                      createdAt: 0,
                      updatedAt: 0,
                      __v: 0,
                    },
                  },
                ],
                as: "thietbi",
              },
            },
            {
              $lookup: {
                from: "hopdongs",
                let: {
                  ma_phong: "$ma_phong",
                  id_users: "$id_users",
                },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $and: [
                          { $eq: ["$ma_phong", "$$ma_phong"] },
                          { $eq: ["$id_users", "$$id_users"] },
                        ],
                      },
                    },
                  },
                  {
                    $project: {
                      ma_phong: 0,
                      id_users: 0,
                      createdAt: 0,
                      updatedAt: 0,
                      __v: 0,
                    },
                  },
                ],
                as: "hopdongs",
              },
            },
            {
              $unwind: { path: "$hopdongs", preserveNullAndEmptyArrays: true },
            },
            {
              $project: {
                _id: 0,
                id_users: 0,
                __v: 0,
                trang_thai: 0,
                createdAt: 0,
                updatedAt: 0,
              },
            },
          ],
          as: "phongTro",
        },
      },
      {
        $unwind: { path: "$phongTro", preserveNullAndEmptyArrays: true },
      },
      {
        $project: {
          _id: 0,
          id_quyen: 0,
          password: 0,
          __v: 0,
          verify: 0,
          updatedAt: 0,
          createdAt: 0,
        },
      },
    ]);

    return result[0] || null;
  }

  async googleLogin(token: string): Promise<string> {
    const response = await axios.get(
      "https://www.googleapis.com/oauth2/v3/certs"
    );

    let payload: any;
    for (const key of response.data.keys) {
      try {
        const pemKey = jwkToPemModule(key);
        payload = await verifyToken(token, pemKey);
        break;
      } catch (error) {
        if (error instanceof Error) {
          console.log("Key failed:", key.kid, error.message);
        } else {
          console.log("Key failed:", key.kid, String(error));
        }
        continue;
      }
    }

    if (!payload) {
      throw new Error("Mã thông báo không hợp lệ hoặc không thể xác minh");
    }

    if (payload.aud !== process.env.GG_CLIENT_ID) {
      throw new Error("Mã thông báo không hợp lệ: Đối tượng không khớp");
    }

    const { email, name, given_name } = payload;
    let user = await UserModel.findOne({ email });
    if (!user) {
      user = new UserModel({
        email: email,
        username: name,
        password: null,
        ho_va_ten: given_name,
        verify: UserVerifyStatus.Verified,
      });
      await user.save();
    }
    const authToken = await getAccesstoken({
      _id: user._id,
      verify:
        user.verify === UserVerifyStatus.Verified
          ? UserVerifyStatus.Verified
          : UserVerifyStatus.Unverified,
    });

    return authToken;
  }
}
