import wallhome from "../../assets/roomwallperhome.jpg";
import ProductShowcase from "../../component/ProductShowcase";
import { useEffect, useState } from "react";
import Category from "../../component/Categories/Categories";
import { usePhongTro } from "../../Context/PhongTroContext";
import emailhome from "../../assets/phongtroemail.jpg";
import buiding from "../../assets/bulding.png";
import { FaRegUserCircle } from "react-icons/fa";
import { motion } from "framer-motion";
import { axiosInstance } from "../../../Axios";
import Slider from "react-slick";
import { useNavigate } from "react-router";
import { Helmet } from "react-helmet";
import banner2 from "../../assets/image1.jpg";
import banner3 from "../../assets/image.jpg";
import { getPrimaryImage } from "../../utils/imageUtils";
const slideUpVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 1.2, ease: "easeOut" } },
};

const bannerImages = [
  wallhome,
  banner2,
  banner3,
];

function Homepage() {
  const settings = {
    dots: false,
    infinite: 1,
    speed: 5000,
    slidesToShow: 5,
    slidesToScroll: 3,
    autoplay: true,
    autoplaySpeed: 50000,
    rtl: true,
    responsive: [
      {
        breakpoint: 1600, // Laptop màn lớn
        settings: {
          slidesToShow: 4,
        },
      },
      {
        breakpoint: 1280, // Laptop phổ thông
        settings: {
          slidesToShow: 4,
        },
      },
      {
        breakpoint: 1024, // Laptop nhỏ hơn (13 inch)
        settings: {
          slidesToShow: 3,
        },
      },
      {
        breakpoint: 640, // Tablet & Mobile
        settings: {
          slidesToShow: 1,
          vertical: true,
          verticalSwiping: true,
        },
      },
    ],
  };
  const navigate = useNavigate();
  const [listdata, setListdata] = useState([]);
  const { phongTro } = usePhongTro();
  const [topReview, setTopReview] = useState([]);
  useEffect(() => {
    if (phongTro.length > 0) {
      const sortedBooks = [...phongTro].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      setListdata(sortedBooks);
    }
    const fetchTopReview = async () => {
      const res = await axiosInstance.get("/danh_gia/AllTopdanhgia");
      const filterTopReview = res.data.data.map((item) => ({
        ...item,
        noi_dung:
          item.noi_dung.length > 100
            ? item.noi_dung.slice(0, 100) + "..."
            : item.noi_dung,
      }));

      setTopReview(filterTopReview);
    };
    
    fetchTopReview();
  }, [phongTro]);

  return (
    <div className="w-full">
      <Helmet>
        <title>Trang chủ</title>
        <meta
          name="description"
          content="Chào mừng đến với cửa hàng của chúng tôi! Khám phá các phòng trọ chất lượng cao với giá tốt nhất."
        />
        <meta
          name="keywords"
          content="phòng trọ, thuê phòng, nhà trọ, nhà cho thuê, tìm phòng trọ, giá rẻ, sinh viên, nhà trọ tiện nghi"
        />
      </Helmet>
      <Slider
        dots={true}
        infinite={true}
        speed={1000}
        slidesToShow={1}
        slidesToScroll={1}
        autoplay={true}
        autoplaySpeed={4000}
        className="w-full"
      >
        {bannerImages.map((img, index) => (
          <div key={index} className=" rounded-lg overflow-hidden">
            <img
              src={img}
              alt={`banner-${index}`}
              className="w-full h-auto max-h-[400px] md:max-h-[500px] object-cover"
            />
          </div>
        ))}
      </Slider>

      <div className="max-w-[1920px] mx-auto px-4 sm:px-6  lg:px-[150px] mt-10 mb-20">
        <div className="space-y-10">
          {/* Phòng trọ được yêu thích */}
          <motion.section
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={slideUpVariants}
          >
            <ProductShowcase
              desc="Phòng trọ được yêu thích"
              data={phongTro}
              limit={10}
              slide={true}
            />
          </motion.section>

          {/* Danh mục */}
          <motion.section
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={slideUpVariants}
          >
            <Category />
          </motion.section>

          {/* Giới thiệu */}
          <motion.section
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={slideUpVariants}
            className="w-full flex flex-col md:flex-row justify-center gap-10 items-center  bg-white py-10 md:py-16 px-2"
          >
            <img
              src={emailhome}
              alt=""
              className="w-full md:w-1/3 h-64 md:h-[570px] object-cover rounded-lg"
            />
            <div className="w-full md:w-1/2">
              <h3 className="text-xl sm:text-2xl md:text-4xl font-semibold text-center md:text-left leading-snug">
                Chúng tôi là đơn vị dẫn đầu trong lĩnh vực quản lý phòng trọ
              </h3>
              <p className="text-sm sm:text-base md:text-lg text-gray-900 mt-4 md:mt-6 text-center md:text-left">
                Công ty chúng tôi chuyên đổi mới ngành phòng trọ cao cấp...
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-6 mt-8 md:mt-10 text-center md:text-left">
                {[
                  { num: "12+", text: "Số năm\nkinh nghiệm" },
                  { num: "15.000+", text: "Phòng trọ\nđang cho thuê" },
                  { num: "1 triệu+", text: "Người mua và\nngười bán hài lòng" },
                  { num: "10+", text: "Giải thưởng\nđã đạt được" },
                ].map((item, index) => (
                  <div key={index}>
                    <p className="text-lg sm:text-xl md:text-3xl font-medium text-customBlue">
                      {item.num}
                    </p>
                    <p className="text-xs sm:text-sm md:text-base mt-2 whitespace-pre-line">
                      {item.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </motion.section>

          {/* Danh sách phòng */}
          <motion.section
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            variants={{
              hidden: { opacity: 0, y: 30 },
              visible: {
                opacity: 1,
                y: 0,
                transition: { duration: 1.2, ease: "easeOut" },
              },
            }}
            className="mt-10"
          >
            <ProductShowcase
              desc="Tất cả phòng trọ"
              data={listdata}
              limit={10}
              slide={false}
              showAll={true}
            />
          </motion.section>

          {/* Đánh giá */}
          <motion.section
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={slideUpVariants}
            className="my-10"
          >
            <h3 className="text-[#23274A] font-bold text-2xl">Đánh giá</h3>
            <Slider {...settings} className="py-5 ">
              {topReview.map((item, index) => (
                <div
                  key={index}
                  className="w-full md:max-w-[300px] shadow-xl p-5 rounded-lg cursor-pointer h-[380px] my-10"
                  onClick={() =>
                    navigate(`/details/${item.phong_info.ma_phong}`)
                  }
                >
                  <div className="flex items-center gap-3">
                    <FaRegUserCircle size={28} />
                    <h3 className="text-lg font-semibold">
                      {item.user_info.username}
                    </h3>
                  </div>
                  <span className="text-yellow-500 text-lg">★★★★★</span>
                  <img
                    src={
                      getPrimaryImage(item.phong_info.anh_phong) || banner2
                    }
                    alt=""
                    className="mt-4 w-[300px] h-[180px] object-cover"
                  />
                  <p className="text-gray-700 text-sm mt-4">{item.noi_dung}</p>
                </div>
              ))}
            </Slider>
          </motion.section>

          {/* Đăng ký nhận tin tức */}
          <motion.section
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={slideUpVariants}
            className="relative w-full mx-auto bg-[#23284C] text-white rounded-lg p-6 md:p-10 flex flex-col md:flex-row items-start md:items-center justify-between mt-10 overflow-hidden"
          >
            <div className="w-full md:max-w-lg z-10">
              <h2 className="text-2xl md:text-4xl font-semibold text-center md:text-left">
                Nhận tin tức mới nhất và ưu đãi đặc biệt
              </h2>
              <div className="flex flex-col sm:flex-row md:w-[400px] xl:w-auto items-center bg-white rounded-xl px-4 py-3 shadow-md mt-8 gap-4">
                <input
                  type="email"
                  placeholder="Enter your email here"
                  className="text-gray-700 outline-none w-[100px] md:w-auto sm:flex-1 px-3 py-2 bg-transparent text-base sm:text-lg"
                />
                <button className="w-full sm:w-auto bg-[#23284C] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#2e3463]">
                  Subscribe
                </button>
              </div>
            </div>
            <img
              src={buiding}
              alt="Building"
              className="hidden md:block absolute -right-10 bottom-0 w-1/2 h-full object-contain"
            />
          </motion.section>
        </div>
      </div>
    </div>
  );
}

export default Homepage;
