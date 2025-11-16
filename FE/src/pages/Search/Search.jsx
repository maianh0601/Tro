import { useEffect, useState, useCallback } from "react";
import { CiSearch } from "react-icons/ci";
import { axiosInstance } from "../../../Axios";
import CardSearch from "../../component/Search/CardSearch";
import { FiPlus, FiMinus } from "react-icons/fi";
import { motion } from "framer-motion";
import Spinner from "../../component/Loading";
import debounce from "lodash/debounce";
import { Helmet } from "react-helmet";

function Search() {
  const [search, setSearch] = useState("");
  const [dataSearch, setDataSearch] = useState([]);
  const [tamgia, setTamgia] = useState("");
  const [songuoi, setSonguoi] = useState("");
  const [khuvuc, setKhuvuc] = useState("");
  const [showPriceFilter, setShowPriceFilter] = useState(false);
  const [showNumberFilter, setShowNumberFilter] = useState(false);
  const [showLocationFilter, setShowLocationFilter] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Hàm fetch dữ liệu
  const fetchSearch = async (searchValue, khuVuc, soNguoi, maxGia) => {
    try {
      const res = await axiosInstance.get(
        `/api/search?ten_phong_tro=${searchValue}&dia_chi=${khuVuc}&so_luong_nguoi=${soNguoi}&trang_thai=1&max_gia=${maxGia}`
      );
      const sortedResults = res.data.data.sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      );
      console.log("Kết quả tìm kiếm:", sortedResults);
      setDataSearch(sortedResults);
    } catch (error) {
      console.error("Lỗi khi fetch dữ liệu:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const debouncedFetchSearch = useCallback(
    debounce((search, khuvuc, songuoi, tamgia) => {
      fetchSearch(search, khuvuc, songuoi, tamgia);
    }, 500),
    []
  );

  useEffect(() => {
    setIsLoading(true);
    debouncedFetchSearch(search, khuvuc, songuoi, tamgia);
    return () => debouncedFetchSearch.cancel();
  }, [search, tamgia, songuoi, khuvuc, debouncedFetchSearch]);

  const handleChange = (e) => {
    setSearch(e.target.value);
  };

  const handleCheckboxChange = (value, setter) => {
    setter((prev) => (prev === value ? "" : value));
  };

  return (
    <div className="w-full">
      <Helmet>
        <title>Tìm kiếm phòng trọ</title>
        <meta
          name="description"
          content="Tìm kiếm bộ sưu tập các phòng trọ cao cấp, đầy đủ tiện nghi, phù hợp cho mọi nhu cầu."
        />

        <meta
          name="keywords"
          content="phòng trọ, thuê phòng, nhà trọ, nhà cho thuê,tìm kiếm , mô tả về các sản phẩm, dịch vụ mà bạn cung cấp."
        />
      </Helmet>
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-[150px] mt-[40px] lg:mt-[78px] flex flex-col lg:flex-row gap-6 lg:gap-[59px] mb-[140px]">
        {/* Bộ lọc */}
        <div className="w-full lg:w-1/4 xl:sticky top-2 bg-white/50 md:bg-inherit h-screen overflow-auto">
          <div className="xl:sticky top-2">
            <div className="bg-[#282C4E] py-4 px-4 sm:px-[18px] rounded-lg">
              <p className="text-base text-white mb-3">Tìm kiếm phòng trọ</p>
              <div className="relative flex w-full h-10">
                <CiSearch className="absolute top-1/2 left-3 -translate-y-1/2 text-lg sm:text-xl" />
                <input
                  type="text"
                  placeholder="Nhập tên phòng trọ"
                  className="pl-[40px] rounded-lg w-full text-sm sm:text-base py-2"
                  onChange={handleChange}
                  value={search}
                />
              </div>
            </div>
            <h3 className="text-lg font-bold text-[#23274A] my-6 lg:my-8">
              Lọc kết quả
            </h3>
            <div className="space-y-6 lg:space-y-10">
              {/* Tầm giá */}
              <div className="bg-[#282C4E] rounded-lg">
                <div
                  className="flex justify-between items-center py-4 px-4 sm:px-[18px] cursor-pointer"
                  onClick={() => setShowPriceFilter(!showPriceFilter)}
                >
                  <p className="text-base text-white">Tầm giá trở xuống</p>
                  {showPriceFilter ? (
                    <FiMinus className="text-white text-xl" />
                  ) : (
                    <FiPlus className="text-white text-xl" />
                  )}
                </div>
                {showPriceFilter && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="bg-white py-4 px-4 sm:px-[18px] flex flex-col gap-4 overflow-hidden"
                  >
                    {["200000", "500000", "1000000", "2000000", "5000000"].map(
                      (priceRange, index) => (
                        <div key={index} className="flex gap-3">
                          <input
                            type="checkbox"
                            className="w-4 h-4 sm:w-5 sm:h-5"
                            checked={tamgia === priceRange}
                            onChange={() =>
                              handleCheckboxChange(priceRange, setTamgia)
                            }
                          />
                          <p className="text-sm sm:text-base">
                            {priceRange} VND
                          </p>
                        </div>
                      )
                    )}
                  </motion.div>
                )}
              </div>

              {/* Khu vực */}
              <div className="bg-[#282C4E] rounded-lg">
                <div
                  className="flex justify-between items-center py-4 px-4 sm:px-[18px] cursor-pointer"
                  onClick={() => setShowLocationFilter(!showLocationFilter)}
                >
                  <p className="text-base text-white">Khu Vực</p>
                  {showLocationFilter ? (
                    <FiMinus className="text-white text-xl" />
                  ) : (
                    <FiPlus className="text-white text-xl" />
                  )}
                </div>
                {showLocationFilter && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="bg-white py-4 px-4 sm:px-[18px] flex flex-col gap-4 overflow-hidden"
                  >
                    {["Đà Nẵng", "Hà Nội", "Hồ Chí Minh", "Huế"].map(
                      (location, index) => (
                        <div key={index} className="flex gap-3">
                          <input
                            type="checkbox"
                            className="w-4 h-4 sm:w-5 sm:h-5"
                            checked={khuvuc === location}
                            onChange={() =>
                              handleCheckboxChange(location, setKhuvuc)
                            }
                          />
                          <p className="text-sm sm:text-base">{location}</p>
                        </div>
                      )
                    )}
                  </motion.div>
                )}
              </div>
              {/*so luong nguoi */}
              <div className="bg-[#282C4E] rounded-lg">
                <div
                  className="flex justify-between items-center py-4 px-4 sm:px-[18px] cursor-pointer"
                  onClick={() => setShowNumberFilter(!showNumberFilter)}
                >
                  <p className="text-base text-white">Số lượng người ở</p>
                  {showNumberFilter ? (
                    <FiMinus className="text-white text-xl" />
                  ) : (
                    <FiPlus className="text-white text-xl" />
                  )}
                </div>
                {showNumberFilter && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="bg-white py-4 px-4 sm:px-[18px] flex flex-col gap-4 overflow-hidden"
                  >
                    {[1, 2, 3, 4, 5].map((number, index) => (
                      <div key={index} className="flex gap-3">
                        <input
                          type="checkbox"
                          className="w-4 h-4 sm:w-5 sm:h-5"
                          checked={songuoi === number}
                          onChange={() =>
                            handleCheckboxChange(number, setSonguoi)
                          }
                        />
                        <p className="text-sm sm:text-base">{number}</p>
                      </div>
                    ))}
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Kết quả tìm kiếm */}
        <div className="w-full">
          {isLoading ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex justify-center items-center h-64"
            >
              <Spinner />
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 gap-4 lg:gap-5"
            >
              {dataSearch.length > 0 ? (
                dataSearch.map((item) => (
                  <CardSearch
                    key={item.id}
                    ma_phong={item.ma_phong}
                    price={item.gia_tien}
                    title={item.ten_phong_tro}
                    img={item.anh_phong}
                    noidung={item.mo_ta}
                    number={item.so_luong_nguoi}
                    dientich={item.dien_tich}
                    diachi={item.dia_chi}
                    giatien={item.gia_tien}
                    trangthai={item.trang_thai}
                    thanhpho={item.ward}
                  />
                ))
              ) : (
                <p className="text-xl sm:text-3xl font-bold text-center col-span-full">
                  Không tìm thấy kết quả nào
                </p>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Search;
