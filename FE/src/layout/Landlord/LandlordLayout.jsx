import { Outlet, useNavigate, NavLink } from "react-router";
import { useEffect, useState } from "react";
import { axiosInstance } from "../../../Axios";

function LandlordLayout() {
  const navigate = useNavigate();
  const [landlord, setLandlord] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkLandlordStatus();
  }, []);

  const checkLandlordStatus = async () => {
    try {
      const { data } = await axiosInstance.get("/landlord/status");
      if (data.data.vai_tro !== "landlord" || data.data.trang_thai_chu_tro !== "approved") {
        navigate("/register-landlord");
        return;
      }
      setLandlord(data.data);
    } catch (error) {
      console.error("Lỗi kiểm tra:", error);
      navigate("/login");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-indigo-600">Dashboard Chủ Trọ</h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-gray-700">Xin chào, {landlord?.ho_va_ten || landlord?.username}</span>
              <button
                onClick={() => navigate("/profile")}
                className="bg-gray-200 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Profile
              </button>
              <button
                onClick={handleLogout}
                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
              >
                Đăng xuất
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-6">
            <NavLink
              to="/landlord/dashboard"
              className={({ isActive }) =>
                `py-4 px-2 border-b-2 font-medium transition-colors ${
                  isActive
                    ? "border-indigo-600 text-indigo-600"
                    : "border-transparent text-gray-600 hover:text-gray-800 hover:border-gray-300"
                }`
              }
            >
              Tổng quan
            </NavLink>
            <NavLink
              to="/landlord/rooms"
              className={({ isActive }) =>
                `py-4 px-2 border-b-2 font-medium transition-colors ${
                  isActive
                    ? "border-indigo-600 text-indigo-600"
                    : "border-transparent text-gray-600 hover:text-gray-800 hover:border-gray-300"
                }`
              }
            >
              Quản lý phòng
            </NavLink>
            <NavLink
              to="/landlord/tenants"
              className={({ isActive }) =>
                `py-4 px-2 border-b-2 font-medium transition-colors ${
                  isActive
                    ? "border-indigo-600 text-indigo-600"
                    : "border-transparent text-gray-600 hover:text-gray-800 hover:border-gray-300"
                }`
              }
            >
              Người thuê
            </NavLink>
            <NavLink
              to="/landlord/contracts"
              className={({ isActive }) =>
                `py-4 px-2 border-b-2 font-medium transition-colors ${
                  isActive
                    ? "border-indigo-600 text-indigo-600"
                    : "border-transparent text-gray-600 hover:text-gray-800 hover:border-gray-300"
                }`
              }
            >
              Hợp đồng
            </NavLink>
            <NavLink
              to="/landlord/stats"
              className={({ isActive }) =>
                `py-4 px-2 border-b-2 font-medium transition-colors ${
                  isActive
                    ? "border-indigo-600 text-indigo-600"
                    : "border-transparent text-gray-600 hover:text-gray-800 hover:border-gray-300"
                }`
              }
            >
             Thống kê
            </NavLink>
            <NavLink
              to="/landlord/images"
              className={({ isActive }) =>
                `py-4 px-2 border-b-2 font-medium transition-colors ${
                  isActive
                    ? "border-indigo-600 text-indigo-600"
                    : "border-transparent text-gray-600 hover:text-gray-800 hover:border-gray-300"
                }`
              }
            >
            Ảnh phòng
            </NavLink>
            <NavLink
              to="/landlord/suachua"
              className={({ isActive }) =>
                `py-4 px-2 border-b-2 font-medium transition-colors ${
                  isActive
                    ? "border-indigo-600 text-indigo-600"
                    : "border-transparent text-gray-600 hover:text-gray-800 hover:border-gray-300"
                }`
              }
            >
             Sửa chữa
            </NavLink>
            <NavLink
              to="/landlord/hoadoncoc"
              className={({ isActive }) =>
                `py-4 px-2 border-b-2 font-medium transition-colors ${
                  isActive
                    ? "border-indigo-600 text-indigo-600"
                    : "border-transparent text-gray-600 hover:text-gray-800 hover:border-gray-300"
                }`
              }
            >
            Hóa đơn cọc
            </NavLink>
            <NavLink
              to="/landlord/hoadonthang"
              className={({ isActive }) =>
                `py-4 px-2 border-b-2 font-medium transition-colors ${
                  isActive
                    ? "border-indigo-600 text-indigo-600"
                    : "border-transparent text-gray-600 hover:text-gray-800 hover:border-gray-300"
                }`
              }
            >
            Hóa đơn tháng
            </NavLink>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
}

export default LandlordLayout;

