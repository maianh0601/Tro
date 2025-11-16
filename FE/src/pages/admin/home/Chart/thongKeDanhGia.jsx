import React, { useState, useEffect } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import Calendar from "react-calendar";
import { axiosInstance } from "../../../../../Axios";
import { motion } from "framer-motion";
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);
const itemVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 1 } },
};

const slideUpVariants = {
  hidden: { opacity: 0, y: 70 },
  visible: { opacity: 1, y: 0, transition: { duration: 1.2, ease: "easeOut" } },
};
function ThongKeDanhGia() {
  const [date, setDate] = useState(new Date());
  const [loaiBieuDo, setLoaiBieuDo] = useState("danhGiaTheoThang");
  const [roomChon, setRoomChon] = useState("");
  const [danhSachPhong, setDanhSachPhong] = useState([]);
  const [duLieuDanhGia, setDuLieuDanhGia] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = {
        nam: String(date.getFullYear()),
        thang: String(date.getMonth() + 1).padStart(2, "0"),
      };
      if (
        loaiBieuDo === "danhGiaTheoTungNgay" ||
        loaiBieuDo === "danhGiaTheoThang"
      ) {
        params.ngay = String(date.getDate()).padStart(2, "0");
      }
      if (loaiBieuDo === "danhGiaTheoNam") delete params.thang;

      const phanHoi = await axiosInstance.get("/thong-ke/chart-danh-gia", {
        params,
      });
      const data = phanHoi.data.data || {};

      let danhGia = [];
      if (loaiBieuDo === "danhGiaTheoTungNgay") {
        danhGia = data.danhGiaTheoTungNgay || [];
      } else if (loaiBieuDo === "danhGiaTheoThang") {
        danhGia = data.danhGiaTheoThang || [];
      } else if (loaiBieuDo === "danhGiaTheoNam") {
        danhGia = data.danhGiaTheoNam || [];
      }

      // Lọc theo phòng nếu có roomChon
      const filteredDanhGia = roomChon
        ? danhGia.filter((item) => item.maPhong === roomChon)
        : danhGia;

      setDuLieuDanhGia(filteredDanhGia);

      // Lấy danh sách phòng từ dữ liệu đánh giá
      const allRooms = [
        ...new Set(danhGia.map((item) => item.maPhong).filter(Boolean)),
      ];
      setDanhSachPhong(allRooms);
    } catch (loi) {
      console.error("Lỗi khi lấy dữ liệu:", loi);
      setDuLieuDanhGia([]);
      setDanhSachPhong([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [date, loaiBieuDo, roomChon]);

  const getBarChartData = () => {
    const aggregatedData = duLieuDanhGia.reduce((acc, item) => {
      const label =
        loaiBieuDo === "danhGiaTheoTungNgay"
          ? item.maPhong
          : loaiBieuDo === "danhGiaTheoThang"
          ? item.maPhong.split(" ")[0]
          : item.maPhong;
      acc[label] = (acc[label] || 0) + 1;
      return acc;
    }, {});

    // Chuyển thành mảng và sắp xếp theo số lượt giảm dần, lấy top 10
    const sortedData = Object.entries(aggregatedData)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

    const labels = sortedData.map(([label]) => label);
    const data = sortedData.map(([, count]) => count);

    return {
      labels: labels.length > 0 ? labels : ["Không có dữ liệu"],
      datasets: [
        {
          label: "Số lượt đánh giá",
          data: data.length > 0 ? data : [0],
          backgroundColor: data.map(
            (_, index) => `rgba(${54 + index * 20}, 162, 235, 0.6)`
          ),
          borderColor: data.map(
            (_, index) => `rgba(${54 + index * 20}, 162, 235, 1)`
          ),
          borderWidth: 1,
        },
      ],
    };
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "top" },
      title: {
        display: true,
        text: `Top 10 ${
          loaiBieuDo === "danhGiaTheoTungNgay"
            ? "Phòng"
            : loaiBieuDo === "danhGiaTheoThang"
            ? "Phòng"
            : "Phòng"
        } có nhiều đánh giá nhất`,
        font: { size: 20 },
      },
      tooltip: {
        callbacks: {
          label: (context) => `${context.dataset.label}: ${context.raw} lượt`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: "rgba(209, 213, 219, 0.3)" },
        ticks: { color: "#6b7280", font: { size: 12 } },
        title: { display: true, text: "Số lượt đánh giá" },
      },
      x: {
        grid: { display: false },
        ticks: { color: "#6b7280", font: { size: 12 } },
        title: {
          display: true,
          text:
            loaiBieuDo === "danhGiaTheoTungNgay"
              ? "Mã phòng"
              : loaiBieuDo === "danhGiaTheoThang"
              ? "Mã phòng"
              : "Mã phòng",
        },
      },
    },
    animation: { duration: 1000, easing: "easeInOutQuad" },
  };

  const totalReviews = duLieuDanhGia.length; // Tổng số đánh giá là số phần tử trong mảng
  const topRoom =
    duLieuDanhGia.length > 0
      ? Object.entries(
          duLieuDanhGia.reduce((acc, item) => {
            acc[item.maPhong] = (acc[item.maPhong] || 0) + 1;
            return acc;
          }, {})
        ).sort((a, b) => b[1] - a[1])[0]
      : null;

  return (
    <motion.div
      className="space-y-6"
      variants={itemVariants}
      initial="hidden"
      animate="visible"
    >
      <header>
        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-6">
          Thống Kê Đánh Giá
        </h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 max-w-6xl mx-auto">
          <div className="bg-white p-4 md:p-6 rounded-xl shadow-md border-t-4 border-blue-500">
            <h2 className="text-base md:text-lg font-semibold text-gray-700">
              Tổng lượt đánh giá
            </h2>
            <p className="text-2xl md:text-3xl font-bold text-blue-600">
              {totalReviews}
            </p>
          </div>
          <div className="bg-white p-4 md:p-6 rounded-xl shadow-md border-t-4 border-green-500">
            <h2 className="text-base md:text-lg font-semibold text-gray-700">
              Phòng được đánh giá nhiều nhất
            </h2>
            <p className="text-lg md:text-xl font-bold text-green-600">
              {topRoom ? `${topRoom[0]} ` : "N/A"}
            </p>
          </div>
          <div className="bg-white p-4 md:p-6 rounded-xl shadow-md border-t-4 border-amber-500">
            <h2 className="text-base md:text-lg font-semibold text-gray-700">
              Số mục thống kê
            </h2>
            <p className="text-2xl md:text-3xl font-bold text-amber-600">
              {duLieuDanhGia.length}
            </p>
          </div>
        </div>
      </header>

      <main className="grid grid-cols-1 lg:grid-cols-1 gap-6">
        {/* Biểu đồ Top 10 */}
        <div className="bg-white p-6 rounded-xl shadow-lg transform hover:shadow-xl transition-shadow duration-300">
          <div className="h-80 ">
            <Bar data={getBarChartData()} options={barChartOptions} />
          </div>
        </div>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={slideUpVariants}
          className="grid grid-cols-1 xl:grid-cols-2  mt-10 gap-5 "
        >
          <div className=" rounded-xl overflow-y-auto max-h-[450px] 2xl:max-h-[500px]">
            <table className="w-full text-left">
              <thead className="sticky top-0 bg-gray-100">
                <tr>
                  <th className="p-3 font-semibold text-gray-700">Mã phòng</th>
                  <th className="p-3 font-semibold text-gray-700">
                    {loaiBieuDo === "danhGiaTheoTungNgay"
                      ? "Thời gian đánh giá"
                      : "Ngày"}
                  </th>
                  <th className="p-3 font-semibold text-gray-700">Nội dung</th>
                </tr>
              </thead>
              <tbody>
                {duLieuDanhGia.map((item, index) => (
                  <tr
                    key={`${item.maPhong}-${item.time}-${index}`}
                    className="border-t hover:bg-gray-50"
                  >
                    <td className="p-3 text-gray-800">{item.maPhong}</td>
                    <td className="p-3 text-gray-800">
                      {loaiBieuDo === "danhGiaTheoTungNgay"
                        ? item.time
                        : item.time.split(" ")[0]}
                    </td>
                    <td className="p-3 text-gray-800">
                      {item.noiDung || "N/A"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className=" bg-white p-6 rounded-xl ">
            <Calendar
              onChange={setDate}
              value={date}
              className="mx-auto rounded-lg shadow-lg mb-4"
            />

            <h2 className="text-base md:text-lg font-semibold text-gray-700 mb-2">
              Chọn loại thống kê
            </h2>
            <select
              value={loaiBieuDo}
              onChange={(e) => setLoaiBieuDo(e.target.value)}
              className="p-2 border rounded w-full"
            >
              <option value="danhGiaTheoTungNgay">Theo từng ngày</option>
              <option value="danhGiaTheoThang">Theo tháng</option>
              <option value="danhGiaTheoNam">Theo năm</option>
            </select>

            <h2 className="text-base md:text-lg font-semibold text-gray-700 mb-2">
              Chọn phòng
            </h2>
            <select
              value={roomChon}
              onChange={(e) => setRoomChon(e.target.value)}
              className="p-2 border rounded w-full"
            >
              <option value="">Tất cả phòng</option>
              {danhSachPhong.map((roomId) => (
                <option key={roomId} value={roomId}>
                  Phòng {roomId}
                </option>
              ))}
            </select>
          </div>
        </motion.div>
      </main>
    </motion.div>
  );
}

export default ThongKeDanhGia;
