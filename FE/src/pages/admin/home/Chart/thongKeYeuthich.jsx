import { useState, useEffect } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { axiosInstance } from "../../../../../Axios";
import Calendar from "react-calendar";
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

export default function ThongKeYeuThich() {
  const [date, setDate] = useState(new Date());
  const [allRooms, setAllRooms] = useState([]);
  const [statType, setStatType] = useState("yeuThichTheoThang"); // Mặc định là "phong" (tổng hợp)

  const fetchData = async () => {
    try {
      const params = {
        nam: String(date.getFullYear()),
        thang: String(date.getMonth() + 1).padStart(2, "0"),
      };
      if (statType === "yeuThichTheoNgay")
        params.ngay = String(date.getDate()).padStart(2, "0");
      if (statType === "yeuThichTheoThang")
        params.thang = String(date.getMonth() + 1).padStart(2, "0");
      if (statType === "yeuThichTheoNam") delete params.thang;

      const response = await axiosInstance.get("/thong-ke/chart-yeu-tich", {
        params,
      });
      const result = response.data;
      console.log("statType", statType);
      if (result.status === "200") {
        let dataToSet = [];
        if (statType === "yeuThichTheoNgay") {
          dataToSet = result.data.yeuThichTheoNgay || [];
        } else if (statType === "yeuThichTheoThang") {
          dataToSet = result.data.yeuThichTheoThang || [];
        } else if (statType === "yeuThichTheoNam") {
          dataToSet = result.data.yeuThichTheoNam || [];
        }
        setAllRooms(dataToSet);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };
  // Lấy dữ liệu từ API
  useEffect(() => {
    fetchData();
  }, [statType, date]);

  // Lọc và lấy top 10 cho biểu đồ
  const getTop10Rooms = () => {
    const filteredRooms = allRooms
      .filter((room) => room.maPhong.toLowerCase())
      .sort((a, b) => b.soLuotYeuThich - a.soLuotYeuThich)
      .slice(0, 10);

    return {
      labels: filteredRooms.map((room) => `${room.maPhong}`),
      datasets: [
        {
          label: "Số lượt yêu thích",
          data: filteredRooms.map((room) => room.soLuotYeuThich),
          backgroundColor: filteredRooms.map(
            (_, index) =>
              `rgba(${59 + index * 20}, ${130 - index * 10}, 246, 0.7)`
          ),
          borderColor: filteredRooms.map(
            (_, index) =>
              `rgba(${59 + index * 20}, ${130 - index * 10}, 246, 1)`
          ),
          borderWidth: 2,
          borderRadius: 8,
          hoverBackgroundColor: filteredRooms.map(
            (_, index) =>
              `rgba(${59 + index * 20}, ${130 - index * 10}, 246, 0.9)`
          ),
        },
      ],
    };
  };

  const [chartData, setChartData] = useState(getTop10Rooms());

  // Cập nhật biểu đồ khi filter thay đổi
  useEffect(() => {
    setChartData(getTop10Rooms());
  }, [allRooms, statType, date]);

  // Cấu hình biểu đồ
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: {
          font: { size: 14, family: "Inter, sans-serif" },
          color: "#1f2937",
        },
      },
      title: {
        display: true,
        text: `Top Phòng Được Yêu Thích `,
        font: { size: 20, family: "Inter, sans-serif", weight: "bold" },
        color: "#1f2937",
        padding: { bottom: 20 },
      },
      tooltip: {
        backgroundColor: "rgba(31, 41, 55, 0.9)",
        titleFont: { size: 14 },
        bodyFont: { size: 12 },
        padding: 10,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: "rgba(209, 213, 219, 0.3)" },
        ticks: { color: "#6b7280", font: { size: 12 } },
        title: {
          display: true,
          text: "Số lượt",
          color: "#1f2937",
          font: { size: 14, weight: "bold" },
        },
      },
      x: {
        grid: { display: false },
        ticks: { color: "#6b7280", font: { size: 12 } },
        title: {
          display: true,
          text: "Phòng",
          color: "#1f2937",
          font: { size: 14, weight: "bold" },
        },
      },
    },
    animation: { duration: 1000, easing: "easeInOutQuad" },
  };

  return (
    <motion.div variants={itemVariants} initial="hidden" animate="visible">
      <header className="">
        <h1 className="text-4xl font-extrabold text-gray-800 text-center tracking-tight">
          Thống Kê Yêu Thích
        </h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 max-w-6xl mx-auto">
          <div className="bg-white  xl:p-6 p-3 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
            <h2 className="xl:text-lg text-base font-semibold text-gray-700 mb-2">
              Tổng số phòng
            </h2>
            <p className="2xl:text-3xl text-xl font-bold text-blue-600">
              {allRooms.length}
            </p>
          </div>
          <div className="bg-white xl:p-6 p-3 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
            <h2 className="xl:text-lg text-base font-semibold text-gray-700 mb-2">
              Tổng lượt yêu thích
            </h2>
            <p className="2xl:text-3xl text-xl font-bold text-green-600">
              {allRooms.reduce((sum, room) => sum + room.soLuotYeuThich, 0)}
            </p>
          </div>
          <div className="bg-white xl:p-6 p-3 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
            <h2 className="xl:text-lg text-base font-semibold text-gray-700 mb-2">
              Phòng yêu thích nhất
            </h2>
            <p className="2xl:text-3xl text-xl font-bold text-amber-600">
              {
                allRooms.sort((a, b) => b.soLuotYeuThich - a.soLuotYeuThich)[0]
                  ?.maPhong
              }{" "}
              -{" "}
              {
                allRooms.sort((a, b) => b.soLuotYeuThich - a.soLuotYeuThich)[0]
                  ?.tenPhong
              }
            </p>
          </div>
        </div>
      </header>
      <main className="grid grid-cols-1 lg:grid-cols-1 gap-6 ">
        {/* Biểu đồ Top 10 */}
        <div className="bg-white p-6 rounded-xl shadow-lg transform hover:shadow-xl transition-shadow duration-300">
          <div className="h-80">
            <Bar data={chartData} options={options} />
          </div>
        </div>

        {/* Danh sách tất cả phòng */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={slideUpVariants}
          className="grid grid-cols-1 xl:grid-cols-2  mt-10 gap-5"
        >
          <div className="overflow-y-auto max-h-[400px]">
            <table className="w-full text-left">
              <thead className="sticky top-0 bg-gray-100">
                <tr>
                  <th className="p-3 font-semibold text-gray-700">Mã phòng</th>
                  <th className="p-3 font-semibold text-gray-700">Tên phòng</th>
                  <th className="p-3 font-semibold text-gray-700">Số lượt</th>
                  <th className="p-3 font-semibold text-gray-700">Xếp hạng</th>
                </tr>
              </thead>
              <tbody>
                {allRooms
                  .filter((room) => room.maPhong.toLowerCase())
                  .sort((a, b) => b.soLuotYeuThich - a.soLuotYeuThich)
                  .map((room, index) => (
                    <tr
                      key={room._id}
                      className="border-t border-gray-200 hover:bg-gray-50 transition-colors duration-200"
                    >
                      <td className="p-3 text-gray-800">{room.maPhong}</td>
                      <td className="p-3 text-gray-800">{room.tenPhong}</td>
                      <td className="p-3 text-gray-800">
                        {room.soLuotYeuThich}
                      </td>
                      <td className="p-3 text-gray-800">{index + 1}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
          <div className="h-full bg-white p-6 rounded-xl shadow-lg">
            <Calendar
              onChange={setDate}
              value={date}
              className="mx-auto rounded-lg shadow-lg mb-4"
            />
            <h2 className="text-xl font-semibold mb-2">Chọn loại thống kê</h2>
            <select
              value={statType}
              onChange={(e) => setStatType(e.target.value)}
              className="p-2 border rounded w-full"
            >
              <option value="yeuThichTheoNgay">Theo ngày</option>
              <option value="yeuThichTheoThang">Theo tháng</option>
              <option value="yeuThichTheoNam">Theo năm</option>
            </select>
          </div>
        </motion.div>
      </main>
    </motion.div>
  );
}
