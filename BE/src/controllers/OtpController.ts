import { Request, Response } from "express";
import OtpModel from "../models/OtpModel";
import dotenv from "dotenv";
import crypto from "crypto";
import moment from "moment";
import nodemailer from "nodemailer";
dotenv.config();

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.MAIL_USERNAME,
    pass: process.env.MAIL_PASSWORD,
  },
});
export const CreateOtp = async (req: Request, res: Response) => {
    try {
        const { user }: any = req;
        if (!user.email) {
            return res.status(400).json({ message: "Email là bắt buộc" });
        } else {
            const otp = crypto.randomInt(100000, 999999).toString();
            const expiresAt = moment().add(2, "minutes").toDate();
            await OtpModel.create({ email: user.email, otp, expiresAt });

            const mailOptions = {
                from: process.env.MAIL_USERNAME,
                to: user.email,
                subject: "Xác thực tài khoản của bạn",
                html: `
                <div style="font-family: Arial, sans-serif; text-align: center; padding: 20px; background-color: #f4f4f4;">
                    <div style="max-width: 500px; background: #ffffff; padding: 20px; border-radius: 10px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2); margin: auto;">
                        <h2 style="color: #333;">Chào ${user.email},</h2>
                        <p style="color: #555;">Mã OTP của bạn là:</p>
                        <div style="font-size: 24px; font-weight: bold; color: #007bff; margin: 20px 0;">${otp}</div>
                        <p style="color: #555;">Vui lòng không chia sẻ mã này với bất kỳ ai. Mã có hiệu lực trong 2 phút.</p>
                        <div style="margin-top: 20px; font-size: 12px; color: #888;">Nếu bạn không yêu cầu mã này, vui lòng bỏ qua email này.</div>
                    </div>
                </div>
            `,
            };
            // cấu hình gửi email
            await transporter.sendMail(mailOptions);
            return res.status(200).json({ message: "Gửi OTP thành công!" });
        }
    } catch (error) {
        console.error("Lỗi khi tạo OTP:", error);
        return res.status(500).json({ message: "Lỗi máy chủ nội bộ" });
    }
};

export const VerifyOtp = async (req: Request, res: Response) => {
    try {
        const { user }: any = req;
        const { otp } = req.body;
        if (!user.email || !otp) {
            return res.status(400).json({ message: "Email và OTP là bắt buộc" });
        } else {
            const otpData = await OtpModel.findOne({ email: user.email, otp });
            if (!otpData) {
                return res.status(400).json({ message: "OTP không hợp lệ" });
            }
            if (moment().isAfter(otpData.expiresAt)) {
                await OtpModel.deleteOne({ email: user.email, otp });
                return res.status(400).json({ message: "OTP đã hết hạn" });
            }
            return res.status(200).json({ message: "Xác minh OTP thành công!" });
        }
    } catch (error) {
        console.error("Lỗi khi xác minh OTP:", error);
        return res.status(500).json({ message: "Lỗi máy chủ nội bộ" });
    }
};
