import { useEffect, useState, useRef } from "react";
import { Helmet } from "react-helmet";

import anh3 from "../../assets/anh3.png";
import {
  FaArrowsAlt,
  FaMapMarkerAlt,
  FaUserFriends,
  FaHeart,
} from "react-icons/fa";
import { motion } from "framer-motion";
import { useParams } from "react-router";
import { axiosInstance } from "../../../Axios";
import { CiHeart } from "react-icons/ci";
import { MdDeviceHub, MdLocalPolice } from "react-icons/md";
import { FiMail, FiMessageSquare, FiPhone } from "react-icons/fi";
import ProductShowcase from "../../component/ProductShowcase";
import MapDetail from "../../component/RoomDetailsComponent/MapDetail";
import { useSelector } from "react-redux";
import { usePhongTro } from "../../Context/PhongTroContext";
import RoomReview from "../../component/RoomDetailsComponent/Review";
import { toast } from "react-toastify";
import Device from "../../component/thietbi/device";
import { useMasking } from "../../hook/useMasking";

const slideUpVariants = {
  hidden: { opacity: 0, y: 70 },
  visible: { opacity: 1, y: 0, transition: { duration: 1.2, ease: "easeOut" } },
};

function RoomDetails() {
  const { user } = useSelector((state) => state.auth);
  const { id } = useParams();
  const { phongTro } = usePhongTro();
  const [data, setData] = useState([]);
  const [trangthai, setTrangthai] = useState("");
  const [statusColor, setStatusColor] = useState("");
  const [roomSame, setRoomSame] = useState([]);
  const [anh, setAnh] = useState([]);
  const [toado, setToado] = useState(null);
  const [mapStatus, setMapStatus] = useState("loading");
  const [yeuthich, setYeuthich] = useState(false);
  const [landlordInfo, setLandlordInfo] = useState(null);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isFetchingLandlord, setIsFetchingLandlord] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [thietbi, setThietbi] = useState([]);

  const statusMapping = {
    1: { text: "Còn trống", color: "green" },
    0: { text: "Đã có người thuê", color: "red" },
    2: { text: "Đang sửa chữa", color: "orange" },
    3: { text: "Chờ xác nhận", color: "yellow" },
    4: { text: "Đã được đặt", color: "blue" },
    5: { text: "Không cho thuê", color: "gray" },
  };
  const { formatTienPhong } = useMasking();
  const [nut, setNut] = useState("Tổng quan");
  // Tạo các ref cho từng phần nội dung
  const overviewRef = useRef(null);
  const amenitiesRef = useRef(null);
  const nearbyRef = useRef(null);
  const addressRef = useRef(null);
  const reviewRef = useRef(null);
  // Hàm xử lý cuộn xuống khi chọn tab
  const handleScroll = (tab) => {
    setNut(tab);
    let ref;
    switch (tab) {
      case "Tổng quan":
        ref = overviewRef;
        break;
      case "Tiện nghi":
        ref = amenitiesRef;
        break;
      case "Phòng trọ cùng khu vực":
        ref = nearbyRef;
        break;
      case "Địa chỉ":
        ref = addressRef;
        break;
      case "Đánh giá":
        ref = reviewRef;
        break;
      default:
        ref = null;
    }
    ref?.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const tabs = [
    "Tổng quan",
    "Tiện nghi",
    "Phòng trọ cùng khu vực",
    "Địa chỉ",
    "Đánh giá",
  ];

  const fetchYeuthich = async () => {
    const favourite = await axiosInstance.get(
      `/yeu-thich/getThichPhong/${user._id}?ma_phong=${id}`
    );
    setYeuthich(favourite.data.isFavourite);
  };

  const fetchLandlordInfo = async (ownerId) => {
    if (!ownerId) {
      setLandlordInfo(null);
      return;
    }
    try {
      setIsFetchingLandlord(true);
      const res = await axiosInstance.get(`/user/Detail/${ownerId}`);
      setLandlordInfo(res.data?.data || null);
    } catch (error) {
      console.log("error", error);
      setLandlordInfo(null);
    } finally {
      setIsFetchingLandlord(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setMapStatus("loading");
        const res = await axiosInstance.post(`/phongTro/detail/${id}`);
        const roomData = res.data.data;
        setData(roomData);

        const galleryImages =
          (roomData?.anh || [])
            .map((item) => item?.image_url)
            .filter(Boolean) || [];

        if (!galleryImages.length && roomData?.anh_phong) {
          galleryImages.push(
            ...roomData.anh_phong
              .split(",")
              .map((url) => url.trim())
              .filter(Boolean)
          );
        }

        setAnh(galleryImages);
        setThietbi(roomData?.thietBi);
        const result = roomData.mapDetail;
        if (
          result &&
          typeof result.latitude === "number" &&
          typeof result.longitude === "number"
        ) {
          setToado([result.latitude, result.longitude]);
          setMapStatus("ready");
        } else {
          setToado(null);
          setMapStatus("missing");
        }
        const status = roomData.trang_thai;
        const statusInfo = statusMapping[status] || {
          text: "Trạng thái không xác định",
          color: "black",
        };
        const filteredProducts = phongTro.filter(
          (product) => product.ma_danh_muc === res.data.data.ma_danh_muc
        );
        setRoomSame(filteredProducts);
        setTrangthai(statusInfo.text);
        setStatusColor(statusInfo.color);
        fetchLandlordInfo(roomData?.id_chu_tro);
      } catch (error) {
        console.log("error", error);
        setToado(null);
        setMapStatus("missing");
      }
    };

    fetchData();
    if (user) {
      fetchYeuthich();
    }
  }, [id, user]);

  const handleContactLandlord = () => {
    if (!user) return alert("Vui lòng đăng nhập để liên hệ với chủ trọ");
    if (!landlordInfo) {
      toast.info("Đang tải thông tin chủ trọ, vui lòng thử lại sau!");
      return;
    }
    setIsContactModalOpen(true);
  };

  const handleSms = () => {
    if (!landlordInfo?.so_dien_thoai) return;
    window.location.href = `sms:${landlordInfo.so_dien_thoai}`;
  };

  const handleCall = () => {
    if (!landlordInfo?.so_dien_thoai) return;
    window.location.href = `tel:${landlordInfo.so_dien_thoai}`;
  };

  const handleEmail = () => {
    if (!landlordInfo?.email) return;
    window.location.href = `mailto:${landlordInfo.email}`;
  };

  const handleHeart = async (idUser, maphong) => {
    if (!user) return alert("Vui lòng đăng nhập, đăng ký để sử dụng");
    if (isProcessing) return;

    setIsProcessing(true);
    try {
      await axiosInstance.post("/yeu-thich/create", {
        ma_phong: maphong,
        id_user: idUser,
      });
      fetchYeuthich();
    } catch (error) {
      console.log(error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = async () => {
    if (!user) return alert("Vui lòng đăng nhập, đăng ký để sử dụng chức năng");
    if (isProcessing) return;

    setIsProcessing(true);
    try {
      await axiosInstance.delete(`/yeu-thich/delete/${user._id}`);
      fetchYeuthich();
    } catch (error) {
      console.log(error);
    } finally {
      setIsProcessing(false);
    }
  };
  return (
    <>
      <div className="w-full">
      <Helmet>
        <title>Chi tiết phòng trọ</title>
        <meta
          name="description"
          content="Khám phá bộ sưu tập chi tiết phòng trọ cao cấp, đầy đủ tiện nghi, phù hợp cho mọi nhu cầu."
        />

        <meta
          name="keywords"
          content="phòng trọ, thuê phòng, nhà trọ, nhà cho thuê, mô tả về các sản phẩm, dịch vụ mà bạn cung cấp."
        />

        {/* Open Graph để chia sẻ mạng xã hội */}
        <meta property="og:title" content="Chi tiết phòng trọ" />
        <meta
          property="og:description"
          content="Xem chi tiết phòng trọ. Tìm hiểu về phòng trọ chất lượng cao và dịch vụ tốt nhất của chúng tôi."
        />
        <meta property="og:image" content="/thumbnail.jpg" />
      </Helmet>
      {data ? (
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-[150px] mt-10 mb-20">
          <div className="space-y-[33px]">
            {/*ảnh chi tiết phòng */}
            <motion.section
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              variants={slideUpVariants}
              className="flex flex-col lg:flex-row gap-[26px]"
            >
              <img
                src={anh[0] || anh3}
                alt=""
                className="w-[500px] md:w-full lg:w-[500px] xl:w-[1072px] h-auto lg:h-[446px] object-cover"
              />
              <div className="flex lg:flex-col gap-5">
                <img
                  src={anh[1] || anh[0] || anh3}
                  alt=""
                  className="w-[160px] md:w-[420px] lg:w-[523px] h-auto lg:h-[215px] object-cover"
                />
                <img
                  src={anh[2] || anh3}
                  alt=""
                  className="w-[210px] md:w-[420px] lg:w-[523px] h-auto lg:h-[215px] "
                />
              </div>
            </motion.section>

            {/* Tabs */}
            <motion.ul
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              variants={slideUpVariants}
              className="flex my-[34px] border-b-2 border-gray-500 w-full"
            >
              {tabs.map((tab) => (
                <li
                  key={tab}
                  className={`py-[10px] px-[14px] cursor-pointer ${
                    nut === tab
                      ? "text-black border-b-2 border-blue-500"
                      : "text-gray-500"
                  }`}
                  onClick={() => handleScroll(tab)}
                >
                  {tab}
                </li>
              ))}
            </motion.ul>

            {/*thông tin chi tiết phòng */}
            <motion.section
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              variants={slideUpVariants}
              className="flex flex-col lg:flex-row justify-between"
            >
              <div>
                <h1 className="font-bold text-3xl sm:text-4xl">
                  {data.ten_phong_tro}
                </h1>
                <div className="flex gap-5 lg:gap-10">
                  <div className="flex items-center gap-5 mt-[33px] text-[#23274A] font-medium text-xl sm:text-2xl">
                    <FaUserFriends className="text-xl sm:text-2xl" />
                    <p>{data.so_luong_nguoi}</p>
                  </div>
                  <div className="flex items-center gap-2 mt-[33px] text-[#23274A] font-medium text-xl sm:text-2xl">
                    <FaArrowsAlt className="text-xl sm:text-2xl" />
                    <p>{data.dien_tich}</p>
                  </div>
                  <p
                    style={{ color: statusColor }}
                    className="font-medium text-xl sm:text-2xl mt-[33px]"
                  >
                    {trangthai}
                  </p>
                </div>
              </div>
              <div className="lg:text-end mt-5 lg:mt-0">
                <p className="text-xl sm:text-2xl font-bold text-yellow-500">
                  {formatTienPhong(data.gia_tien)} VND
                </p>
                <div className="flex items-center gap-4 mt-4">
                  {yeuthich ? (
                    <button
                      className="border border-gray-500 p-3"
                      onClick={handleDelete}
                      disabled={isProcessing}
                    >
                      {isProcessing ? (
                        <span className="loading-spinner"></span>
                      ) : (
                        <FaHeart color="red" className="text-xl" />
                      )}
                    </button>
                  ) : (
                    <button
                      className="border border-gray-500 p-3"
                      onClick={() =>
                        user
                          ? handleHeart(user._id, id)
                          : alert("Vui lòng đăng nhập!")
                      }
                      disabled={isProcessing}
                    >
                      {isProcessing ? (
                        <span className="loading-spinner"></span>
                      ) : (
                        <CiHeart className="text-xl" />
                      )}
                    </button>
                  )}

                  <button
                    className="bg-[#23284C] font-medium py-3 px-8 text-white rounded-md"
                    onClick={handleContactLandlord}
                    disabled={isFetchingLandlord}
                  >
                    {isFetchingLandlord
                      ? "Đang tải thông tin..."
                      : "Nhắn tin với chủ trọ"}
                  </button>
                </div>
                {landlordInfo && (
                  <p className="text-sm text-gray-500 mt-2">
                    Chủ trọ:{" "}
                    <span className="font-semibold">
                      {landlordInfo.ho_va_ten ||
                        landlordInfo.username ||
                        "Đang cập nhật"}
                    </span>
                    {landlordInfo?.so_dien_thoai &&
                      ` • ${landlordInfo.so_dien_thoai}`}
                  </p>
                )}
              </div>
            </motion.section>

            {/* /* Địa chỉ */}
            <motion.section
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              variants={slideUpVariants}
              className="flex gap-[10px] items-center "
            >
              <div className="flex gap-[10px] items-center ">
                <FaMapMarkerAlt className="text-[#23274A] text-lg" />
                <p className="text-xl font-medium">
                  {data?.mapDetail?.address}
                </p>
              </div>
              <span
                className="text-xl font-medium text-[#2F80ED] cursor-pointer"
                onClick={() => handleScroll("Địa chỉ")}
              >
                Hiển thị bản đồ
              </span>
            </motion.section>

            {/* /* Nội dung chi tiết */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              variants={slideUpVariants}
              className=" flex flex-col lg:flex-row justify-between gap-5"
            >
              <div className="w-full lg:w-[60%]">
                <h2 ref={overviewRef} className="text-3xl font-semibold">
                  Tổng quan
                </h2>
                <p className="mt-[33px] text-lg">{data.mo_ta}</p>
              </div>
              <div className="flex flex-col bg-white w-full lg:w-[35%] max-h-[451px] py-6 px-7">
                <h3 className="font-semibold text-2xl">Điểm nổi bật</h3>
                <ul className="mt-10 flex flex-col gap-10">
                  <li className="flex gap-4">
                    <MdLocalPolice size={30} color="green" />
                    <p>
                      Có hệ thống camera an ninh, bảo vệ 24/7 hoặc khu vực an
                      toàn.
                    </p>
                  </li>
                  <li className="flex gap-4 ">
                    <FaMapMarkerAlt size={30} color="green" />
                    <p>
                      Gần các khu vực tiện ích như chợ, siêu thị, trường học,
                      bệnh viện, giao thông công cộng.
                    </p>
                  </li>
                  <li className="flex gap-4">
                    <MdDeviceHub size={30} color="green" />
                    <p>
                      Giường, tủ, quạt, máy lạnh, bếp nấu ăn, WC riêng hoặc
                      chung, internet, truyền hình cáp.
                    </p>
                  </li>
                </ul>
              </div>
            </motion.div>

            {/*tiện nghi phòng */}
            <motion.section
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              variants={slideUpVariants}
            >
              <h2 ref={amenitiesRef} className="text-3xl font-semibold">
                Tiện nghi
              </h2>
              <Device data={thietbi} />
            </motion.section>

            {/*phòng trọ khu vực */}
            <motion.section
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.1 }}
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: { duration: 1.2, ease: "easeOut" },
                },
              }}
            >
              <h2 ref={nearbyRef} className="text-3xl font-semibold mb-4">
                Phòng trọ cùng khu vực
              </h2>
              <ProductShowcase data={roomSame} limit={5} />
            </motion.section>

            {/*Bản đồ */}
            <motion.section
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              variants={slideUpVariants}
            >
              <h2 ref={addressRef} className="text-3xl font-semibold mb-4">
                Địa chỉ
              </h2>
              {mapStatus === "ready" ? (
                <MapDetail toado={toado} />
              ) : (
                <p>
                  {mapStatus === "loading"
                    ? "Đang tải vị trí..."
                    : "Không có dữ liệu vị trí"}
                </p>
              )}
            </motion.section>

            <motion.section
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              variants={slideUpVariants}
            >
              <h2 ref={reviewRef} className="text-3xl font-semibold mb-4">
                Đánh giá
              </h2>
              <RoomReview id={id} />
            </motion.section>
          </div>
        </div>
      ) : (
        <div>Error</div>
      )}
      </div>
      {isContactModalOpen && landlordInfo && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 space-y-5 shadow-2xl">
            <div className="flex justify-between items-center">
              <h3 className="text-2xl font-semibold text-[#23274A]">
                Liên hệ chủ trọ
              </h3>
              <button
                onClick={() => setIsContactModalOpen(false)}
                className="text-gray-500 hover:text-gray-800 text-2xl leading-none"
              >
                ×
              </button>
            </div>
            <div className="bg-gray-50 p-4 rounded-xl space-y-2">
              <p className="text-lg font-medium">
                {landlordInfo.ho_va_ten ||
                  landlordInfo.username ||
                  "Chủ trọ"}
              </p>
              {landlordInfo?.so_dien_thoai && (
                <p className="text-gray-700">
                  Số điện thoại:{" "}
                  <span className="font-semibold">
                    {landlordInfo.so_dien_thoai}
                  </span>
                </p>
              )}
              <p className="text-gray-700">
                Email:{" "}
                <span className="font-semibold">{landlordInfo.email}</span>
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {landlordInfo?.so_dien_thoai && (
                <>
                  <button
                    onClick={handleSms}
                    className="flex items-center justify-center gap-2 py-3 rounded-xl border border-gray-200 hover:bg-gray-100 transition"
                  >
                    <FiMessageSquare size={18} />
                    Nhắn tin
                  </button>
                  <button
                    onClick={handleCall}
                    className="flex items-center justify-center gap-2 py-3 rounded-xl border border-gray-200 hover:bg-gray-100 transition"
                  >
                    <FiPhone size={18} />
                    Gọi điện
                  </button>
                </>
              )}
              <button
                onClick={handleEmail}
                className="flex items-center justify-center gap-2 py-3 rounded-xl border border-gray-200 hover:bg-gray-100 transition"
              >
                <FiMail size={18} />
                Gửi email
              </button>
            </div>
            <button
              onClick={() => setIsContactModalOpen(false)}
              className="w-full py-3 rounded-xl bg-[#23284C] text-white font-medium hover:bg-[#2c346b] transition"
            >
              Đóng
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default RoomDetails;
