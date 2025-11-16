import { FaUser, FaLock } from "react-icons/fa";
import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useDispatch } from "react-redux";
import { axiosInstance } from "../../../../Axios";
import { toast } from "react-toastify";
import { loginAdmin } from "../../../Store/filterAdmin";

function LoginAdmin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const dispatch = useDispatch();

  const handleLogin = async (event) => {
    event.preventDefault();
    try {
      const res = await axiosInstance.post("/admin/login", {
        email: email,
        password: password,
      });
      dispatch(
        loginAdmin({
          admin: res.data.data.admin,
        })
      );
      navigate("/admin/home");
      toast.success("Đăng nhập thành công!");
    } catch (error) {
      console.log(error);
      toast.error("Đăng nhập thất bại!");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold text-center text-gray-800 mb-6">
          Đăng nhập
        </h2>
        <form className="space-y-4">
          <div className="relative">
            <FaUser className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Email"
              className="w-full px-10 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="relative">
            <FaLock className="absolute left-3 top-3 text-gray-400" />
            <input
              type="password"
              placeholder="Mật khẩu"
              className="w-full px-10 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 bg-gray-900 text-white rounded-lg text-lg font-semibold hover:bg-gray-700 transition"
            onClick={handleLogin}
          >
            Đăng nhập
          </button>
        </form>
        <p className="mt-4 text-center text-gray-500">
          Quên mật Khẩu?{" "}
          <Link
            to="/admin/resend-forgot-password"
            className="text-gray-700 font-semibold"
          >
            Khôi phục
          </Link>
        </p>
      </div>
    </div>
  );
}

export default LoginAdmin;
