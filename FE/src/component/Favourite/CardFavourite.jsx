import { useEffect, useState } from "react";
import { FaArrowsAlt, FaUserFriends } from "react-icons/fa";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { axiosInstance } from "../../../Axios";
import { motion } from "framer-motion";
import { formatTienPhong } from "../../hook/useMasking";

function CardFavourite({
  id,
  price,
  title,
  img,
  number,
  diachi,
  dientich,
  noidung,
  trangthai,
  reloadData,
}) {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [status, setStatus] = useState("");
  const [colorStatus, setColorStatus] = useState("");
  const statusMapping = {
    1: { text: "Còn trống", color: "green" },
    0: { text: "Đã có người thuê", color: "red" },
    2: { text: "Đang sửa chữa", color: "orange" },
    3: { text: "Chờ xác nhận", color: "yellow" },
    4: { text: "Đã được đặt", color: "blue" },
    5: { text: "Không cho thuê", color: "gray" },
  };

  useEffect(() => {
    if (!trangthai) return;
    const status = statusMapping[trangthai] || {
      text: "Trạng thái không xác định",
      color: "black",
    };
    setStatus(status.text);
    setColorStatus(status.color);
  });

  const handleCard = async (e) => {
    try {
      navigate(`/details/${e}`);
    } catch (error) {
      console.log(error);
    }
  };

  const handleDelete = async () => {
    try {
      await axiosInstance.delete(`/yeu-thich/delete/${user._id}`);
      reloadData();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col md:flex-row gap-6 sm:gap-8 p-4 sm:p-6 md:px-10 md:py-5 bg-white cursor-pointer rounded-lg shadow-sm"
    >
      {/* Ảnh */}
      <img
        src={img}
        alt=""
        className="min-w-[285px] xl:w-[285px] xl:h-[200px] object-cover pt-4 md:pt-0"
      />

      {/* Nội dung */}
      <div className="flex flex-col lg:flex-row justify-between w-full gap-4">
        {/* Bên trái */}
        <div className="flex flex-col justify-between flex-1">
          <h6
            className="text-lg sm:text-xl font-semibold"
            onClick={() => handleCard(id)}
          >
            {title}
          </h6>
          <p className="text-sm sm:text-base text-gray-500 mt-2">{noidung}</p>

          <div className="flex justify-between lg:block mt-2">
            <button
              className="py-2 lg:py-3 px-4 sm:px-5 bg-customBlue text-white font-medium w-[120px] rounded-lg hover:bg-customBlue/90 "
              onClick={() => navigate(`/details/${id}`)}
            >
              Xem
            </button>
            <div className="mt-2">
              <p
                style={{ color: colorStatus }}
                className="font-medium text-base sm:text-lg"
              >
                {status}
              </p>
              <p className="mt-2">
                <span className="text-lg font-medium">Khu vực: </span> {diachi}
              </p>
            </div>
          </div>
        </div>

        {/* Bên phải */}
        <div className="flex lg:flex-col justify-between items-end text-right gap-3">
          <button
            className="bg-customBg text-white px-4 py-2 rounded-lg z-50"
            onClick={handleDelete}
          >
            Hủy yêu thích
          </button>

          <div>
            <div className="flex gap-3 justify-end mt-2">
              <p className="flex items-center gap-1 text-sm sm:text-base">
                <FaUserFriends className="text-gray-600" /> {number}
              </p>
              <p className="flex items-center gap-1 text-sm sm:text-base">
                <FaArrowsAlt className="text-gray-600" /> {dientich}
              </p>
            </div>
            <p className="text-bold text-lg sm:text-xl mt-3 text-yellow-500">
              {formatTienPhong(price)} VND
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default CardFavourite;
