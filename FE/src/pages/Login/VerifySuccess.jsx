import { useEffect, useState } from "react";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import { useNavigate, useSearchParams } from "react-router";
import { axiosInstance } from "../../../Axios";

export default function VerifySuccess() {
  const [searchParams] = useSearchParams();
  console.log("searchParams", searchParams);
  const [status, setStatus] = useState("loading");
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      setStatus("error");
      return;
    }
    console.log("token", token);
    axiosInstance
      .post("/auth/verify_Email", {
        email_verify_token: token,
      }) // Gửi token lên server
      .then(() => setStatus("success"))
      .catch(() => setStatus("error"));
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 px-4">
      <div className="bg-white p-8 rounded-2xl shadow-lg text-center max-w-md">
        {status === "loading" && (
          <p className="text-lg font-medium text-gray-800">Đang xác minh...</p>
        )}

        {status === "success" && (
          <>
            <FaCheckCircle className="text-green-500 text-6xl mx-auto mb-4" />
            <h1 className="text-2xl font-semibold text-gray-900">
              Xác minh email thành công!
            </h1>
            <p className="text-gray-600 mt-2">
              Bạn có thể đăng nhập ngay bây giờ.
            </p>
            <button
              onClick={() => navigate("/login")}
              className="w-full py-3 bg-gray-900 text-white rounded-lg text-lg font-semibold hover:bg-gray-700 transition mt-4"
            >
              Đăng nhập ngay
            </button>
          </>
        )}

        {status === "error" && (
          <>
            <FaTimesCircle className="text-red-500 text-6xl mx-auto mb-4" />
            <h1 className="text-2xl font-semibold text-gray-900">
              Xác minh thất bại!
            </h1>
            <p className="text-gray-600 mt-2">
              Token không hợp lệ hoặc đã hết hạn.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
