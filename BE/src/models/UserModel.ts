/** @format */

import mongoose, { Schema } from 'mongoose';
import { UserVerifyStatus } from '../constants/enum';

const UserScheme = new Schema(
	{
		username: {
			type: String,
			required: false, // Không bắt buộc, sẽ lấy từ Google nếu có
		  },
		  email: {
			type: String,
			required: true, // Bắt buộc, lấy từ Google
			unique: true, // Đảm bảo email là duy nhất
		  },
		  ho_va_ten: {
			type: String,
			required: false, // Không bắt buộc
		  },
		  password: {
			type: String,
			required: false, // Không bắt buộc, để null khi dùng Google
		  },
		  ngay_sinh: {
			type: Date,
			required: false, // Không bắt buộc
		  },
	  id_quyen: {
		type: String,
		default: 'khachhang',
		required: false,
	  },
	  vai_tro: {
		type: String,
		enum: ['user', 'landlord'],
		default: 'user',
		required: false,
	  },
	  trang_thai_chu_tro: {
		type: String,
		enum: ['pending', 'approved', 'rejected', 'none'],
		default: 'none',
		required: false,
	  },
	  ly_do_dang_ky_chu_tro: {
		type: String,
		required: false,
	  },
	  ly_do_tu_choi: {
		type: String,
		required: false,
	  },
	  verify: {
		type: String,
		enum: Object.values(UserVerifyStatus),
		default: UserVerifyStatus.Unverified,
		required: false,
	  },
		  que_quan: {
			type: String,
			default: null, // Đổi thành null thay vì 1 để tránh lỗi kiểu dữ liệu
			required: false,
		  },
		  so_dien_thoai: {
			type: Number,
			default: null, // Đổi thành null
			required: false,
		  },
		  gioi_tinh: {
			type: String,
			default: null, // Đổi thành null
			required: false,
		  },
		  cccd: {
			type: Number,
			required: false, // Không bắt buộc
		  },
	
	},
	{ timestamps: true }
);

const UserModel = mongoose.model('users', UserScheme);
export default UserModel;
