import axios from "axios";
import React, { useState } from "react";
import { axiosInstance } from "../../Axios";
import { IoMdClose } from "react-icons/io";
const OtpVerification = ({ nextModal, modal }) => {
  const [code, setCode] = useState(["", "", "", "", "", ""]);

  // Xử lý thay đổi cho từng chữ số
  const handleChange = (index, value) => {
    if (/^[0-9]$/.test(value) || value === "") {
      const newCode = [...code];
      newCode[index] = value;
      setCode(newCode);

      // Tự động chuyển con trỏ sang ô tiếp theo
      if (value !== "" && index < 5) {
        document.getElementById(`code-input-${index + 1}`).focus();
      }
    }
  };

  // Xử lý sự kiện dán để phân phối toàn bộ mã
  const handlePaste = (e, startIndex) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim();
    const newCode = pastedData.split("").slice(0, 6); // Chia mã thành mảng 6 chữ số
    setCode(newCode); // Cập nhật trạng thái với mã mới
    document.getElementById(`code-input-5`).focus();
  };

  // Xử lý gửi biểu mẫu
  const handleSubmit = async (e) => {
    e.preventDefault();
    const verificationCode = code.join("");
    await axiosInstance.post("/Otp/verifyOtp", { otp: verificationCode });
    modal(false);
    nextModal(true);
  };

  const sendOtp = async () => {
    try {
      await axiosInstance.post("/Otp/sendOtp");
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between mb-6">
          <div className="w-[20px]"></div>
          <div className="">
            <svg
              className="w-8 h-8 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M16 12H8m4-4v8m-8 4h16a2 2 0 002-2V6a2 2 0 00-2-2H4a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>

          <IoMdClose
            className="cursor-pointer hover:bg-gray-300 text-gray-500 rounded-full"
            size={25}
            onClick={() => modal(false)}
          />
        </div>
        <h2 className="text-2xl font-bold text-center mb-4">
          Kiểm tra email của bạn
        </h2>
        <p className="text-center text-gray-600 mb-6">
          Mã OTP đã được gửi qua Email, vui lòng xác nhận
        </p>

        <form
          onSubmit={handleSubmit}
          className="flex justify-center space-x-2 mb-6"
        >
          {code.map((digit, index) => (
            <input
              key={index}
              id={`code-input-${index}`}
              type="text"
              maxLength="1"
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onPaste={(e) => handlePaste(e, index)}
              className="w-12 h-12 text-center text-xl border-2 border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
            />
          ))}
        </form>

        <p className="text-center text-gray-600 mb-6">
          Không nhận được mã?{" "}
          <span
            href="#"
            className="text-blue-600 hover:underline cursor-pointer"
            onClick={sendOtp}
          >
            Gửi lại
          </span>
        </p>

        <button
          type="submit"
          onClick={handleSubmit}
          className="w-full bg-customBlue font-medium text-lg text-white py-3 rounded-md hover:bg-blue-700 transition duration-200"
        >
          Xác nhận Email
        </button>
      </div>
    </div>
  );
};

export default OtpVerification;
