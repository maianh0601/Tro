import { useEffect, useState } from "react";
import { axiosInstance } from "../../../Axios";
import { useSelector } from "react-redux";
import CardFavourite from "../../component/Favourite/CardFavourite";
import { useNavigate } from "react-router";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet";
function Favourite() {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [data, setData] = useState([]);

  const fetchDataFavourite = async () => {
    try {
      const res = await axiosInstance.get(`/yeu-thich/getdata/${user._id}`);
      setData(res.data.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (user && user._id) {
      fetchDataFavourite();
    }
  }, [user]);

  return (
    <div className="w-full">
      <Helmet>
        <title>Yêu thích phòng trọ</title>
        <meta
          name="description"
          content="Khám phá bộ sưu tập chi tiết phòng trọ cao cấp, đầy đủ tiện nghi, phù hợp cho mọi nhu cầu."
        />

        <meta
          name="keywords"
          content="phòng trọ, thuê phòng, nhà trọ, nhà cho thuê, mô tả về các sản phẩm, yêu thích, dịch vụ mà bạn cung cấp."
        />
      </Helmet>
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6  lg:px-[150px] mt-10 mb-20">
        <h1 className="text-3xl font-bold">Yêu thích</h1>
        <div className="space-y-5 min-h-[800px] mt-10">
          {data.length > 0 ? (
            data.map((item, index) => (
              <motion.div
                key={item.ma_phong}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <CardFavourite
                  id={item.ma_phong}
                  price={item.gia_tien}
                  title={item.ten_phong_tro}
                  img={item.anh_phong}
                  noidung={item.mo_ta}
                  number={item.so_luong_nguoi}
                  dientich={item.dien_tich}
                  diachi={item.dia_chi}
                  trangthai={item.trang_thai}
                  thanhpho={item.ward}
                  reloadData={fetchDataFavourite}
                />
              </motion.div>
            ))
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="min-h-[500px] flex items-center flex-col mt-40"
            >
              <p className="text-black text-3xl font-medium text-center">
                Bạn chưa có yêu thích phòng trọ nào, hãy trở về trang chủ để lựa
                phòng yêu thích nhé
              </p>
              <button
                onClick={() => navigate("/")}
                className="bg-customBg py-3 px-5 mt-4 text-white rounded-lg text-lg font-medium"
              >
                Trở về trang chủ
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Favourite;
