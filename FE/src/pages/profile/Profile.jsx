import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { axiosInstance } from "../../../Axios";

import ElectricityInvoice from "./ThongKeDienUser";
import { Helmet } from "react-helmet";
import { useMasking } from "../../hook/useMasking";
import { FaRegUserCircle } from "react-icons/fa";
import { toast } from "react-toastify";
import { login } from "../../Store/filterUser";
import Spinner from "../../component/Loading";
import SuachuaUser from "./SuachuaUser";
import HopDongUser from "./HopdongUser";

function Profile() {
  const { user } = useSelector((state) => state.auth);
  const [chucnang, setChucnang] = useState("Thông tin cá nhân");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [users, setUsers] = useState({
    username: "",
    ngay_sinh: "",
    email: "",
    password: "",
    oldPassword: "",
    que_quan: "",
    ho_va_ten: "",
    so_dien_thoai: "",
    cccd: "",
  });
  const [errors, setErrors] = useState({
    username: "",
    ho_va_ten: "",
    que_quan: "",
    ngay_sinh: "",
    email: "",
    cccd: "",
    so_dien_thoai: "",
    oldPassword: "",
    password: "",
  });

  const validateForm = () => {
    let newErrors = {
      username: "",
      ho_va_ten: "",
      que_quan: "",
      ngay_sinh: "",
      email: "",
      cccd: "",
      so_dien_thoai: "",
      password: "",
      oldPassword: "",
    };

    let isValid = true;

    if (!users.username.trim()) {
      newErrors.username = "Tên tài khoản không được để trống";
      isValid = false;
    }

    if (!users.ho_va_ten.trim()) {
      newErrors.ho_va_ten = "Họ và tên không được để trống";
      isValid = false;
    } else if (/\d/.test(users.ho_va_ten)) {
      newErrors.ho_va_ten = "Họ và tên không được chứa số";
      isValid = false;
    }

    if (!users.que_quan.trim()) {
      newErrors.que_quan = "Quê quán không được để trống";
      isValid = false;
    } else if (/\d/.test(users.que_quan)) {
      newErrors.que_quan = "Quê quán không được chứa số";
      isValid = false;
    }

    if (!users.ngay_sinh.trim()) {
      newErrors.ngay_sinh = "Ngày sinh không được để trống";
      isValid = false;
    } else {
      const today = new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"
      if (users.ngay_sinh > today) {
        newErrors.ngay_sinh = "Ngày sinh không được là ngày trong tương lai";
        isValid = false;
      }
    }

    if (!users.email.trim()) {
      newErrors.email = "Email không được để trống";
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(users.email)) {
      newErrors.email = "Email không hợp lệ";
      isValid = false;
    }

    if (!users.cccd.trim()) {
      newErrors.cccd = "CCCD không được để trống";
      isValid = false;
    } else if (!/^\d{12}$/.test(users.cccd)) {
      newErrors.cccd = "CCCD phải có 12 chữ số";
      isValid = false;
    }

    if (!users.so_dien_thoai.trim()) {
      newErrors.so_dien_thoai = "Số điện thoại không được để trống";
      isValid = false;
    } else if (!/^0\d{9}$/.test(users.so_dien_thoai)) {
      newErrors.so_dien_thoai = "Số điện thoại phải có 10 số và bắt đầu bằng 0";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const { maskEmail, maskPhone, maskCCCD, formatDate } = useMasking();
  const [isLoading, setIsLoading] = useState(false);

  const menuItems = [
    { title: "Thông tin cá nhân", icon: "" },
    { title: "Sửa chữa", icon: "" },

    { title: "Hóa đơn", icon: "" },
    { title: "Hợp đồng", icon: "" },
  ];

  useEffect(() => {
    if (user) {
      setUsers({
        username: user.username || "",
        ngay_sinh: user.ngay_sinh || "",
        email: user.email || "",
        que_quan: user.que_quan || "",
        ho_va_ten: user.ho_va_ten || "",
        so_dien_thoai: user.so_dien_thoai?.toString() || "",
        cccd: user.cccd?.toString() || "",
      });
    }
    console.log("User updated in sidebar:", user);
  }, [user]);

  const handleUpdateUser = async () => {
    if (!validateForm()) return;
    try {
      setIsLoading(true);
      const payload = {
        username: users.username || user.username,
        ngay_sinh: users.ngay_sinh || user.ngay_sinh,
        email: users.email || user.email,
        oldPassword: users.oldPassword,
        password: users.password || "",
        que_quan: users.que_quan || user.que_quan,
        ho_va_ten: users.ho_va_ten || user.ho_va_ten,
        so_dien_thoai:
          Number(users.so_dien_thoai) || Number(user.so_dien_thoai),
        cccd: Number(users.cccd) || Number(user.cccd),
      };

      const res = await axiosInstance.post(`/auth/update/${user._id}`, payload);

      if (res) {
        const updateUser = await axiosInstance.get("/auth/me");
        dispatch(
          login({
            user: updateUser.data.data,
          })
        );
      }
      toast.success(res.data.message);
    } catch (error) {
      console.log(error);
      toast.error(error.response.data.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return <Spinner />;
  }

  return (
    <div className="min-h-screen w-full bg-gray-50">
      <Helmet>
        <title>Trang cá nhân</title>
      </Helmet>
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-[150px] mt-10 mb-20">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <div className="w-full md:w-1/4">
            <div className="bg-white rounded-2xl shadow-sm p-4">
              {/* Avatar Section */}
              <div className="flex flex-col items-center pb-6 border-b border-gray-200">
                <FaRegUserCircle className="w-32 h-32" />

                <h3 className="mt-4 text-xl font-semibold text-gray-800">
                  {user.username}
                </h3>
                <p className="text-gray-500 text-sm">
                  Ngày sinh: {formatDate(user.ngay_sinh)}
                </p>
              </div>

              {/* Menu Items */}
              <nav className="mt-6 space-y-2">
                {menuItems.map((item) => (
                  <button
                    key={item.title}
                    onClick={() => setChucnang(item.title)}
                    className={`w-full flex items-center gap-2 px-2 py-3 rounded-lg transition-all duration-200 ${
                      chucnang === item.title
                        ? "bg-blue-500 text-white shadow-md"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <span className="text-lg">{item.icon}</span>
                    <span className="w-full text-left">{item.title}</span>
                  </button>
                ))}
              </nav>

              {/* Đăng ký làm chủ trọ */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <button
                  onClick={() => navigate("/register-landlord")}
                  className="w-full flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg hover:from-indigo-600 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  <span className="font-semibold">Đăng ký làm Chủ Trọ</span>
                </button>
                <p className="text-xs text-gray-500 text-center mt-2">
                  Trở thành chủ trọ để cho thuê phòng
                </p>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="w-full">
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 pb-4 border-b border-gray-200">
                {chucnang}
              </h2>

              {chucnang === "Thông tin cá nhân" && (
                <div className="space-y-6 w-full">
                  <div>
                    <div className="space-y-4 w-full">
                      <div className="flex gap-5 w-full">
                        <div className="w-full">
                          <p className="font-medium text-base">Tên tài khoản</p>
                          <input
                            type="text"
                            value={users.username}
                            onChange={(e) =>
                              setUsers((prev) => ({
                                ...prev,
                                username: e.target.value,
                              }))
                            }
                            className="text-base px-5 py-4 placeholder:text-gray-700 font-medium  bg-slate-200 mt-3 w-full"
                          />
                          {errors.username && (
                            <p className="text-red-500 text-sm mt-1">
                              {errors.username}
                            </p>
                          )}
                        </div>
                        <div className="w-full">
                          <p className="font-medium text-base">Họ và Tên</p>
                          <input
                            type="text"
                            value={users.ho_va_ten}
                            onChange={(e) =>
                              setUsers((prev) => ({
                                ...prev,
                                ho_va_ten: e.target.value,
                              }))
                            }
                            className=" text-base px-5 py-4 mt-3 w-full bg-slate-200 placeholder:text-gray-700 font-medium"
                          />
                          {errors.ho_va_ten && (
                            <p className="text-red-500 text-sm mt-1">
                              {errors.ho_va_ten}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-5 w-full">
                        <div className="w-full">
                          <p className="font-medium text-base">Quê quán</p>
                          <input
                            type="text"
                            placeholder={user.que_quan}
                            value={users.que_quan}
                            className="text-base px-5 py-4 placeholder:text-gray-700 font-medium bg-slate-200 mt-3 w-full"
                            onChange={(e) =>
                              setUsers((prev) => ({
                                ...prev,
                                que_quan: e.target.value,
                              }))
                            }
                          />
                          {errors.que_quan && (
                            <p className="text-red-500 text-sm mt-1">
                              {errors.que_quan}
                            </p>
                          )}
                        </div>
                        <div className="w-full">
                          <p className="font-medium text-base">Ngày sinh</p>
                          <input
                            type="date"
                            value={users.ngay_sinh.slice(0, 10)}
                            onChange={(e) =>
                              setUsers((prev) => ({
                                ...prev,
                                ngay_sinh: e.target.value,
                              }))
                            }
                            className="text-base px-5 py-4 mt-3 w-full bg-slate-200 placeholder:text-gray-700 font-medium"
                          />
                          {errors.ngay_sinh && (
                            <p className="text-red-500 text-sm mt-1">
                              {errors.ngay_sinh}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-bold text-xl mb-6">Bảo mật</h3>
                    <div className="space-y-4 w-full">
                      <div className="grid grid-cols-1 md:grid-cols-3 w-full gap-5 ">
                        <div className="w-full">
                          <p className="font-medium text-base">Email</p>
                          <input
                            type="text"
                            placeholder={maskEmail(String(user.email || ""))}
                            value={
                              users.email === String(user.email || "")
                                ? ""
                                : users.email
                            }
                            onChange={(e) =>
                              setUsers((prev) => ({
                                ...prev,
                                email: e.target.value,
                              }))
                            }
                            className="text-base px-5 py-4 placeholder:text-gray-700   bg-slate-200 mt-3 w-full font-medium"
                          />
                          {errors.email && (
                            <p className="text-red-500 text-sm mt-1">
                              {errors.email}
                            </p>
                          )}
                        </div>
                        <div className="w-full">
                          <p className="font-medium text-base">
                            Căn cước công dân
                          </p>
                          <input
                            type="text"
                            placeholder={maskCCCD(String(user.cccd || ""))}
                            maxLength={12}
                            value={
                              users.cccd === String(user.cccd || "")
                                ? ""
                                : users.cccd
                            }
                            onChange={(e) =>
                              setUsers((prev) => ({
                                ...prev,
                                cccd: e.target.value,
                              }))
                            }
                            className="text-base px-5 py-4 placeholder:text-gray-700   bg-slate-200 mt-3 w-full font-medium"
                          />
                          {errors.cccd && (
                            <p className="text-red-500 text-sm mt-1">
                              {errors.cccd}
                            </p>
                          )}
                        </div>
                        <div className="w-full">
                          <p className="font-medium text-base">Số điện thoại</p>
                          <input
                            type="text"
                            placeholder={maskPhone(
                              String(user.so_dien_thoai || "")
                            )}
                            maxLength={10}
                            value={
                              users.so_dien_thoai ===
                              String(user.so_dien_thoai || "")
                                ? ""
                                : users.so_dien_thoai
                            }
                            onChange={(e) =>
                              setUsers((prev) => ({
                                ...prev,
                                so_dien_thoai: e.target.value,
                              }))
                            }
                            className="text-base px-5 py-4 placeholder:text-gray-700 bg-slate-200 mt-3 w-full font-medium"
                          />
                          {errors.so_dien_thoai && (
                            <p className="text-red-500 text-sm mt-1">
                              {errors.so_dien_thoai}
                            </p>
                          )}
                        </div>
                      </div>
                      <div>
                        <p className="font-medium text-base placeholder:text-gray-700  ">
                          Mật khẩu cũ
                        </p>
                        <input
                          type="password"
                          onChange={(e) =>
                            setUsers((prev) => ({
                              ...prev,
                              oldPassword: e.target.value,
                            }))
                          }
                          placeholder="Nhập mật khẩu cũ"
                          className=" text-base px-5 py-4 mt-3 w-full bg-slate-200 font-medium"
                        />
                      </div>
                      <div>
                        <p className="font-medium text-base">Mật khẩu mới</p>
                        <input
                          type="password"
                          onChange={(e) =>
                            setUsers((prev) => ({
                              ...prev,
                              password: e.target.value,
                            }))
                          }
                          className=" text-base px-5 py-4 placeholder:text-gray-700  mt-3 w-full bg-slate-200 font-medium"
                          placeholder="Nhập mật khẩu mới"
                        />
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={handleUpdateUser}
                    className="w-full sm:w-auto px-6 py-3 bg-customBg text-white rounded-lg hover:bg-blue-600 transition-all duration-200"
                  >
                    {isLoading ? "Đang cập nhật" : "Cập nhật thông tin"}
                  </button>
                </div>
              )}

              {chucnang === "Sửa chữa" && <SuachuaUser />}

              {chucnang === "Hóa đơn" && (
                <div>
                  <ElectricityInvoice />
                </div>
              )}

              {chucnang === "Hợp đồng" && <HopDongUser />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
