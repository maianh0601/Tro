import { useDispatch, useSelector } from "react-redux";
import logo from "../../assets/logo/logo.svg";
import { CiHeart } from "react-icons/ci";
import { FaRegUser } from "react-icons/fa";
import { useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { AiOutlineMenu, AiOutlineClose } from "react-icons/ai";
import { setLoading, login, logout } from "../../Store/filterUser";
import { motion, AnimatePresence } from "framer-motion";
import { axiosInstance } from "../../../Axios";
import Spinner from "../../component/Loading";

const Item = [
  {
    id: 1,
    name: "Trang chủ",
    Navigate: "/",
  },
  {
    id: 4,
    name: "Tìm kiếm",
    Navigate: "/Search",
  },
];

function Header() {
  const { user, isLoading } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isOpen, setIsOpen] = useState(false);
  const [modal, setModal] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      dispatch(setLoading(true));
      try {
        const res = await axiosInstance.get("/auth/me");
        dispatch(
          login({
            user: res.data.data,
          })
        );
      } catch (error) {
        console.log(
          "Không thể lấy thông tin user:",
          error.response?.data?.message
        );
      } finally {
        dispatch(setLoading(false));
      }
    };
    fetchUser();
  }, []);

  const handleLogout = async () => {
    await axiosInstance.post("/auth/logout");
    dispatch(logout());
    navigate("/");
  };

  return isLoading ? (
    <Spinner /> // Hiển thị Spinner khi isLoading là true
  ) : (
    <nav className="w-full bg-[#1c203d] text-white py-5 top-0 sticky z-50">
      <div className="max-w-[1920px] mx-auto px-6 lg:px-[150px] flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center">
          <img
            src={logo}
            className="min-h-5 min-w-5 cursor-pointer"
            onClick={() => navigate("/")}
          />
        </div>

        {/* Mobile Menu Icon */}
        <div className="md:hidden">
          <button onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? (
              <AiOutlineClose className="w-8 h-8" />
            ) : (
              <AiOutlineMenu className="w-8 h-8" />
            )}
          </button>
        </div>

        {/* Navigation + Action */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className={`absolute  md:static top-16 left-0 w-full md:w-auto bg-[#1c203d] md:flex md:gap-12 items-center transition-all duration-300 ${
            isOpen ? "block" : "hidden"
          }`}
        >
          {/* Menu Items */}
          <>
            {isOpen && (
              <ul className="flex flex-col md:flex-row lg:gap-5 text-sm uppercase list-none">
                {Item.map((item) => (
                  <li
                    key={item.id}
                    className="cursor-pointer hover:text-gray-300 hover:bg-white/10 text-white px-5 py-4 font-medium text-sm xl:text-base md:px-3 md:py-2"
                    onClick={() => {
                      navigate(item.Navigate);
                      setIsOpen(false);
                    }}
                  >
                    {item.name}
                  </li>
                ))}
              </ul>
            )}
            {!isOpen && (
              <ul className="hidden md:flex md:flex-row lg:gap-5 text-sm uppercase list-none">
                {Item.map((item) => (
                  <li
                    key={item.id}
                    className="cursor-pointer hover:text-gray-300 hover:bg-white/10 text-white px-5 py-3 font-medium text-sm xl:text-base md:px-3 md:py-2"
                    onClick={() => {
                      navigate(item.Navigate);
                    }}
                  >
                    {item.name}
                  </li>
                ))}
              </ul>
            )}
          </>

          {/* User Actions */}
          <div className="hidden md:flex flex-row">
            {!user ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="flex gap-5"
              >
                <button
                  className="font-bold text-base border border-white px-6 py-3 rounded-md hover:bg-white hover:text-black transition"
                  onClick={() => navigate("/Register")}
                >
                  Đăng ký
                </button>
                <button
                  className="font-bold text-base bg-white text-black px-6 py-3 rounded-md hover:bg-gray-300 transition"
                  onClick={() => navigate("/login")}
                >
                  Đăng nhập
                </button>
              </motion.div>
            ) : (
              <div className="relative">
                <div className="flex items-center gap-5">
                  {/* Yêu thích */}

                  <CiHeart
                    className="w-[30px] h-[30px] cursor-pointer"
                    onClick={() => navigate("/yeuthich")}
                  />

                  {/* Avatar & Menu */}
                  <div className="relative">
                    <FaRegUser
                      className="w-[25px] h-[25px] cursor-pointer"
                      onClick={() => setModal(!modal)}
                    />
                    <AnimatePresence>
                      {modal && (
                        <motion.ul
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.2 }}
                          className="absolute right-0 mt-3 bg-[#1c203d] border border-white/10 rounded-lg shadow-lg w-[180px] z-50"
                        >
                          <li
                            onClick={() => {
                              navigate("/profile");
                              setModal(false);
                            }}
                            className="text-white cursor-pointer py-3 px-5 hover:bg-white/10 rounded-t-lg"
                          >
                            Trang cá nhân
                          </li>
                          <li
                            onClick={() => {
                              handleLogout();
                              setModal(false);
                            }}
                            className="text-white cursor-pointer py-3 px-5 hover:bg-white/10 rounded-b-lg"
                          >
                            Đăng xuất
                          </li>
                        </motion.ul>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* User Actions - Mobile */}
          <div className="md:hidden">
            {!user ? (
              <div className="flex gap-5 pb-5 px-5">
                <button
                  className="font-bold text-base border border-white px-4 py-2 lg:px-6 lg:py-3 rounded-md hover:bg-white hover:text-black transition w-full"
                  onClick={() => {
                    navigate("/Register");
                    setIsOpen(false);
                  }}
                >
                  Register
                </button>
                <div className="w-[1px] h-auto bg-gray-500"></div>
                <button
                  className="font-bold text-base bg-white text-black px-4 py-2 lg:px-6 lg:py-3 rounded-md hover:bg-gray-300 transition w-full"
                  onClick={() => {
                    navigate("/login");
                    setIsOpen(false);
                  }}
                >
                  Sign In
                </button>
              </div>
            ) : (
              <div className="flex flex-col">
                <button
                  className="text-white font-medium text-left px-5 py-4  hover:bg-white/10 transition"
                  onClick={() => {
                    navigate("/yeuthich");
                    setIsOpen(false);
                  }}
                >
                  Yêu thích
                </button>
                <button
                  className="text-white font-medium text-left px-5 py-4  hover:bg-white/10 transition"
                  onClick={() => {
                    navigate("/profile");
                    setIsOpen(false);
                  }}
                >
                  Trang cá nhân
                </button>
                <button
                  className="text-white text-left px-5 py-4 hover:bg-white/10 transition"
                  onClick={() => {
                    handleLogout();
                    setIsOpen(false);
                  }}
                >
                  Đăng xuất
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </nav>
  );
}

export default Header;
