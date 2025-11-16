import { useState, useEffect } from "react";
import { axiosInstance } from "../../../Axios";
import { useNavigate } from "react-router";

function RegisterLandlord() {
  const [ly_do_dang_ky_chu_tro, setLyDo] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [status, setStatus] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    try {
      const { data } = await axiosInstance.get("/landlord/status");
      setStatus(data.data);
    } catch (err) {
      console.error("Lỗi kiểm tra trạng thái:", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (!ly_do_dang_ky_chu_tro.trim()) {
      setError("Vui lòng nhập lý do đăng ký");
      return;
    }

    try {
      const { data } = await axiosInstance.post("/landlord/register", {
        ly_do_dang_ky_chu_tro,
      });
      setMessage(data.message);
      setTimeout(() => {
        checkStatus();
      }, 1000);
    } catch (err) {
      setError(err.response?.data?.message || "Có lỗi xảy ra");
    }
  };

  if (status?.vai_tro === "landlord" && status?.trang_thai_chu_tro === "approved") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="mb-6">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Bạn đã là chủ trọ!</h2>
            <p className="text-gray-600">Tài khoản của bạn đã được duyệt</p>
          </div>
          <button
            onClick={() => navigate("/landlord/dashboard")}
            className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition-colors font-semibold"
          >
            Đến Dashboard Chủ Trọ
          </button>
        </div>
      </div>
    );
  }

  if (status?.trang_thai_chu_tro === "pending") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="mb-6">
            <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Đang chờ duyệt</h2>
            <p className="text-gray-600 mb-4">Yêu cầu của bạn đang được Admin xem xét</p>
            <div className="bg-gray-50 rounded-lg p-4 text-left">
              <p className="text-sm text-gray-500 mb-1">Lý do đăng ký:</p>
              <p className="text-gray-800">{status?.ly_do_dang_ky_chu_tro}</p>
            </div>
          </div>
          <button
            onClick={() => navigate("/profile")}
            className="w-full bg-gray-200 text-gray-800 py-3 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
          >
            Quay lại Profile
          </button>
        </div>
      </div>
    );
  }

  if (status?.trang_thai_chu_tro === "rejected") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
          <div className="text-center mb-6">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Yêu cầu bị từ chối</h2>
            <div className="bg-red-50 rounded-lg p-4 text-left mb-6">
              <p className="text-sm text-gray-500 mb-1">Lý do từ chối:</p>
              <p className="text-red-800">{status?.ly_do_tu_choi}</p>
            </div>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lý do đăng ký lại làm chủ trọ *
              </label>
              <textarea
                value={ly_do_dang_ky_chu_tro}
                onChange={(e) => setLyDo(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                rows="4"
                placeholder="Vui lòng giải thích lý do bạn muốn đăng ký lại..."
              />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            {message && <p className="text-green-500 text-sm">{message}</p>}
            <button
              type="submit"
              className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition-colors font-semibold"
            >
              Gửi yêu cầu lại
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-2xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Đăng ký làm Chủ Trọ</h1>
          <p className="text-gray-600">Trở thành chủ trọ để quản lý phòng và cho thuê</p>
        </div>

        <div className="bg-indigo-50 rounded-lg p-6 mb-6">
          <h3 className="font-semibold text-gray-800 mb-3">Quyền lợi khi trở thành chủ trọ:</h3>
          <ul className="space-y-2 text-gray-700">
            <li className="flex items-start">
              <svg className="w-5 h-5 text-indigo-600 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Đăng tin cho thuê phòng trọ
            </li>
            <li className="flex items-start">
              <svg className="w-5 h-5 text-indigo-600 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Quản lý danh sách phòng của bạn
            </li>
            <li className="flex items-start">
              <svg className="w-5 h-5 text-indigo-600 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Xem danh sách người thuê và hợp đồng
            </li>
            <li className="flex items-start">
              <svg className="w-5 h-5 text-indigo-600 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Nhận thông báo khi có người quan tâm
            </li>
          </ul>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Lý do đăng ký làm chủ trọ *
            </label>
            <textarea
              value={ly_do_dang_ky_chu_tro}
              onChange={(e) => setLyDo(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
              rows="5"
              placeholder="Ví dụ: Tôi có 5 phòng trọ tại quận 1 muốn cho thuê..."
              required
            />
            <p className="text-sm text-gray-500 mt-1">
              Admin sẽ xem xét và duyệt yêu cầu của bạn trong 24-48 giờ
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}
          
          {message && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-green-800 text-sm">{message}</p>
            </div>
          )}

          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => navigate("/profile")}
              className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="flex-1 bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition-colors font-semibold"
            >
              Gửi yêu cầu
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default RegisterLandlord;

