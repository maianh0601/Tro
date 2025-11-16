import { useEffect, useRef, useState } from "react";
import { axiosInstance } from "../../../../../Axios";
import { motion } from "framer-motion";
import { FaRegUserCircle } from "react-icons/fa";

import { getSocket } from "../../../../../Socket";
import { useDispatch } from "react-redux";
import { triggerReloadMessageCount } from "../../../../Store/filterReloadSidebar";

const ChatAdmin = () => {
  const [userName, setUserName] = useState("");
  const [DanhsachUser, setDanhsachUser] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const messageEndRef = useRef(null);
  const [socket, setSocket] = useState(null);
  const [keyword, setKeyword] = useState("");
  const dispatch = useDispatch();
  const [DsHienThi, setDsHienThi] = useState(DanhsachUser);
  const selectedUserRef = useRef(null);

  const fetchMessages = async (userId) => {
    if (!userId) return;
    try {
      const res = await axiosInstance.get(`/tin-nhan/messAdmin/${userId}`);
      await axiosInstance.get(`tin-nhan/seenmess/${userId}`);
      return res.data.data;
    } catch (error) {
      console.log("Lỗi khi fetch tin nhắn:", error);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const resUnread = await axiosInstance.get("/tin-nhan/unread-count");
      const unreadData = resUnread.data.data;

      setDanhsachUser((prevUsers) =>
        prevUsers.map((user) => {
          const found = unreadData.find((u) => u.nguoi_gui === user._id);
          return {
            ...user,
            unread: found?.unreadCount || 0,
          };
        })
      );
    } catch (error) {
      console.log("Lỗi khi fetch số tin nhắn chưa đọc:", error);
    }
  };

  const handleSelectUser = async (user) => {
    setSelectedUser(user);
    setMessages([]);
    const messages = await fetchMessages(user._id);
    setMessages(messages);
    dispatch(triggerReloadMessageCount());
    fetchUnreadCount();
  };

  // Hàm quay lại danh sách người dùng trên mobile
  const handleBack = () => {
    setSelectedUser(null);
  };

  useEffect(() => {
    selectedUserRef.current = selectedUser;
  }, [selectedUser]);

  useEffect(() => {
    fetchMessages();
    fetchAdmin();
    fetchUsers();

    const s = getSocket();
    setSocket(s);

    s.on("nhan_tin_nhan", async (data) => {
      const senderId = data.payload.nguoi_gui;

      if (selectedUserRef.current && selectedUserRef.current._id === senderId) {
        setMessages((prevMessages) => [...prevMessages, data.payload]);

        try {
          await axiosInstance.get(`/tin-nhan/seenmess/${senderId}`);
          fetchUnreadCount();
          dispatch(triggerReloadMessageCount());
        } catch (error) {
          console.log("Lỗi khi cập nhật tin nhắn đã đọc:", error);
        }
      } else {
        fetchUnreadCount();
      }
    });

    return () => {
      s.off("nhan_tin_nhan");
    };
  }, []);

  useEffect(() => {
    setDsHienThi(DanhsachUser);
  }, [DanhsachUser]);

  const fetchUsers = async () => {
    try {
      const resUsers = await axiosInstance.get("/auth/getAll");
      setDanhsachUser(resUsers.data.data);

      if (resUsers.data.data.length > 0 && window.innerWidth > 768) {
        handleSelectUser(resUsers.data.data[0]);
      }
    } catch (error) {
      console.log("Lỗi khi fetch users:", error);
    }
  };

  // Hàm fetch admin info
  const fetchAdmin = async () => {
    try {
      const resAdmin = await axiosInstance.get("/admin/getadmin");
      setUserName(resAdmin.data.data);
    } catch (error) {
      console.log("Lỗi khi fetch admin:", error);
      return null;
    }
  };

  useEffect(() => {
    const handleResize = () => {
      if (DanhsachUser.length > 0 && window.innerWidth > 768 && !selectedUser) {
        handleSelectUser(DanhsachUser[0]);
      } else if (window.innerWidth <= 768 && selectedUser) {
        handleSelectUser(null);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [DanhsachUser, selectedUser]);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMess = async (e) => {
    e.preventDefault();
    const text = e.target.message.value.trim();
    if (!text || !selectedUser) return;

    socket.emit("admin_gui_tin_nhan", {
      payload: {
        nguoi_nhan: selectedUser._id,
        noi_dung: text,
      },
    });

    const updatedMessages = await fetchMessages(selectedUser._id);
    setMessages(updatedMessages);

    e.target.reset();
  };

  const handleSearch = (keyword) => {
    const tuKhoa = keyword.toLowerCase();

    const filtered = DanhsachUser.filter((item) => {
      const hoTen = item.username?.toLowerCase();

      return hoTen.includes(tuKhoa);
    });

    setDsHienThi(filtered);
  };
  return (
    <div className="flex flex-col md:flex-row gap-4">
      {/* Sidebar */}
      <motion.div
        className={`w-full md:w-80 lg:w-96 shadow-lg bg-white rounded-lg overflow-auto ${
          selectedUser ? "hidden md:block" : "block"
        }`}
        initial={{ x: -200 }}
        animate={{ x: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Search */}
        <div className="p-3 border-b border-gray-200">
          <div className="relative">
            <input
              type="text"
              placeholder="Search..."
              value={keyword}
              onChange={(e) => {
                const value = e.target.value;
                setKeyword(value);
                handleSearch(value);
              }}
              className="w-full p-2 pl-8 bg-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
            <svg
              className="absolute left-2 top-2.5 w-4 h-4 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>

        {/* Danh sách user */}
        <div className="overflow-auto space-y-2">
          {DsHienThi.map((chat, index) => (
            <motion.div
              key={index}
              onClick={() => handleSelectUser(chat)}
              className={`relative flex items-center p-3 border-b border-gray-100 cursor-pointer hover:bg-gray-100 ${
                selectedUser?._id === chat._id ? "bg-blue-50" : ""
              }`}
              whileTap={{ scale: 0.98 }}
            >
              <FaRegUserCircle size={35} />
              {chat.unread > 0 && (
                <span className="absolute left-8 top-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {chat.unread}
                </span>
              )}
              <div className="ml-3">
                <div className="flex justify-between relative">
                  <h3 className="text-sm font-semibold truncate">
                    {chat.username}
                  </h3>
                </div>
                <p className="text-xs text-gray-500 truncate">{chat.message}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Chat Box */}
      {selectedUser && (
        <div className="w-full flex flex-col bg-white rounded-lg h-[90vh] shadow-lg">
          {/* Header */}
          <div className="flex items-center gap-3 p-4 border-b">
            <button className="md:hidden text-gray-600" onClick={handleBack}>
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <span className="font-semibold text-gray-800">
              {selectedUser.username}
            </span>
          </div>

          {/* Nội dung chat */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg, idx) => {
              return (
                <div
                  key={idx}
                  className={`flex ${
                    msg.nguoi_gui === userName._id
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >
                  <p
                    className={`p-2 rounded-md text-sm sm:text-base md:text-lg break-words max-w-[80%] sm:max-w-[75%] md:max-w-[70%] lg:max-w-[65%] ${
                      msg.nguoi_gui === userName._id
                        ? "bg-blue-500 text-white text-right"
                        : "bg-gray-200 text-gray-800 text-left"
                    }`}
                  >
                    {msg.noi_dung}
                  </p>
                </div>
              );
            })}

            <div ref={messageEndRef} />
          </div>

          {/* Form gửi tin nhắn */}
          <form
            className="border-t flex gap-2 h-[60px] p-2"
            onSubmit={handleSendMess}
          >
            <input
              type="text"
              name="message"
              placeholder="Nhập tin nhắn..."
              className="flex-1 border p-2 rounded-md text-sm sm:text-base"
            />
            <button
              type="submit"
              className="bg-blue-500 text-white px-3 sm:px-4 rounded-md text-sm sm:text-base"
            >
              Gửi
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default ChatAdmin;
