import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { Line, Doughnut } from "react-chartjs-2";
import { motion } from "framer-motion";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { axiosInstance } from "../../../../../Axios";
import RoomTable from "../../../../component/admin/RoomTable";
ChartJS.register(
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const itemVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 1 } },
};
const slideUpVariants = {
  hidden: { opacity: 0, y: 70 },
  visible: { opacity: 1, y: 0, transition: { duration: 1.2, ease: "easeOut" } },
};
function ChartAdmin() {
  const [date, setDate] = useState(new Date());
  const [loaiBieuDo, setLoaiBieuDo] = useState("dienNangTheoTungNgay");
  const [roomChon, setRoomChon] = useState(null);
  const [duLieuBieuDo, setDuLieuBieuDo] = useState({
    dienNangTheoTungNgay: [],
    dienNangTheoNgay: [],
    dienNangTheoThang: [],
    dienNangTheoNam: [],
  });
  const [danhSachPhong, setDanhSachPhong] = useState([]);
  const [dangTai, setDangTai] = useState(false);
  const [error, setError] = useState(null); // Thêm state để theo dõi lỗi

  const layDuLieuBieuDo = async () => {
    setDangTai(true);
    setError(null); // Reset lỗi khi gọi API mới
    try {
      const params = {
        nam: String(date.getFullYear()),
        thang: String(date.getMonth() + 1).padStart(2, "0"),
      };
      if (loaiBieuDo === "dienNangTheoNgay")
        params.ngay = String(date.getDate()).padStart(2, "0");
      if (loaiBieuDo === "dienNangTheoTungNgay")
        params.thang = String(date.getMonth() + 1).padStart(2, "0");
      if (loaiBieuDo === "dienNangTheoNam") delete params.thang;
      if (roomChon) params.room_id = roomChon;
      const phanHoi = await axiosInstance.get("/thong-ke/chart-dien-nang", {
        params,
      });

      const data = phanHoi.data.data || {};

      const filterByRoom = (arr) =>
        roomChon
          ? arr.filter((item) => item && item.room_id === roomChon)
          : arr;

      const filteredData = {
        dienNangTheoTungNgay: filterByRoom(data.dienNangTheoTungNgay || []),
        dienNangTheoNgay: filterByRoom(data.dienNangTheoNgay || []),
        dienNangTheoThang: filterByRoom(data.dienNangTheoThang || []),
        dienNangTheoNam: filterByRoom(data.dienNangTheoNam || []),
      };

      // Kiểm tra dữ liệu sau khi lọc

      setDuLieuBieuDo(filteredData);

      const allRooms = [
        ...new Set([
          ...(data.dienNangTheoTungNgay || []).map((item) => item?.room_id),
          ...(data.dienNangTheoNgay || []).map((item) => item?.room_id),
          ...(data.dienNangTheoThang || []).map((item) => item?.room_id),
          ...(data.dienNangTheoNam || []).map((item) => item?.room_id),
        ]),
      ].filter((roomId) => roomId); // Loại bỏ undefined/null
      setDanhSachPhong(allRooms);
    } catch (loi) {
      console.error("Lỗi khi lấy dữ liệu:", loi);
      setError("Không thể tải dữ liệu. Vui lòng thử lại sau.");
      setDuLieuBieuDo({
        dienNangTheoTungNgay: [],
        dienNangTheoNgay: [],
        dienNangTheoThang: [],
        dienNangTheoNam: [],
      });
      setDanhSachPhong([]);
    } finally {
      setDangTai(false);
    }
  };

  useEffect(() => {
    layDuLieuBieuDo();
  }, [date, roomChon, loaiBieuDo]);

  const getLineChartData = () => {
    const dataSource = duLieuBieuDo[loaiBieuDo] || [];

    if (dataSource.length === 0) {
      console.warn("dataSource is empty");
      return {
        labels: [],
        datasets: [],
      };
    }

    const aggregatedData = dataSource.reduce((acc, item) => {
      if (!item || !item.room_id || item.energy === undefined) {
        console.warn("Invalid item in dataSource:", item);
        return acc;
      }

      const dateLabel =
        loaiBieuDo === "dienNangTheoNgay"
          ? new Date(item.timestamp).toLocaleTimeString("vi-VN", {
              hour: "2-digit",
              minute: "2-digit",
            })
          : item.date || new Date(item.timestamp).toLocaleDateString("vi-VN");

      if (!acc[item.room_id]) {
        acc[item.room_id] = {};
      }
      if (!acc[item.room_id][dateLabel]) {
        acc[item.room_id][dateLabel] = { energy: 0 };
      }
      acc[item.room_id][dateLabel].energy += item.energy || 0;
      return acc;
    }, {});

    const allLabels = [
      ...new Set(
        Object.values(aggregatedData).flatMap((roomData) =>
          Object.keys(roomData)
        )
      ),
    ];

    allLabels.sort((a, b) => {
      try {
        const dateA = new Date(
          loaiBieuDo === "loaiBieuDo" ? `2025-03-13 ${a}` : a
        );
        const dateB = new Date(
          loaiBieuDo === "loaiBieuDo" ? `2025-03-13 ${b}` : b
        );
        return dateA - dateB;
      } catch (e) {
        console.warn("Error sorting labels:", e);
        return 0;
      }
    });

    const datasets = Object.keys(aggregatedData).map((roomId, index) => {
      const roomData = aggregatedData[roomId];
      return {
        label: `Phòng ${roomId}`,
        data: allLabels.map((label) => roomData[label]?.energy || 0),
        borderColor: `hsl(${index * 60}, 70%, 50%)`,
        backgroundColor: `hsla(${index * 60}, 70%, 50%, 0.2)`,
        fill: true,
        tension: 0.4,
      };
    });

    return {
      labels: allLabels,
      datasets,
    };
  };
  const getDoughnutChartData = () => {
    const dataSource = duLieuBieuDo[loaiBieuDo] || [];

    let labels = [];
    let values = [];
    let backgroundColors = [];

    // Xử lý dữ liệu dựa trên loại thống kê
    if (loaiBieuDo === "dienNangTheoNgay") {
      // Theo ngày: Hiển thị tổng tiền hoặc số điện tiêu thụ của từng phòng trong ngày
      labels = dataSource.map(
        (item) => `Phòng ${item.room_id || item.maPhong || "Unknown"}`
      );
      values = dataSource.map((item) => item.total_cost || 0); // Hoặc item.soDienTieuThu
      backgroundColors = values.map((_, index) => {
        const colors = [
          "rgba(54, 162, 235, 0.6)", // Xanh dương
          "rgba(249, 0, 0)", // Đỏ
          "rgba(75, 192, 192, 0.6)", // Xanh ngọc
          "rgba(255, 159, 64, 0.6)", // Cam
          "rgba(153, 102, 255, 0.6)", // Tím
          "rgba(255, 205, 86, 0.6)", // Vàng
        ];
        return colors[index % colors.length];
      });
    } else if (loaiBieuDo === "dienNangTheoTungNgay") {
      // Theo tháng: Gộp dữ liệu theo phòng hoặc hiển thị theo ngày trong tháng
      const groupedByRoom = dataSource.reduce((acc, item) => {
        const roomId = item.room_id || item.maPhong || "Unknown";
        acc[roomId] = (acc[roomId] || 0) + (item.total_cost || 0); // Gộp tổng tiền theo phòng
        return acc;
      }, {});

      labels = Object.keys(groupedByRoom).map((roomId) => `Phòng ${roomId}`);
      values = Object.values(groupedByRoom);
      backgroundColors = values.map((_, index) => {
        const colors = [
          "rgba(54, 162, 235, 0.6)",
          "rgba(249, 0, 0)",
          "rgba(93, 48, 255)",
          "rgba(255, 159, 64, 0.6)",
          "rgba(153, 102, 255, 0.6)",
          "rgba(255, 205, 86, 0.6)",
        ];
        return colors[index % colors.length];
      });
    } else if (loaiBieuDo === "dienNangTheoNam") {
      // Theo năm: Gộp dữ liệu theo tháng
      const groupedByMonth = dataSource.reduce((acc, item) => {
        const month = item.month || new Date(item.date).getMonth() + 1; // Giả sử có trường month hoặc date
        acc[month] = (acc[month] || 0) + (item.total_cost || 0); // Gộp tổng tiền theo tháng
        return acc;
      }, {});

      labels = Object.keys(groupedByMonth).map((month) => `Tháng ${month}`);
      values = Object.values(groupedByMonth);
      backgroundColors = values.map((_, index) => {
        const colors = [
          "rgba(249, 0, 0)",
          "rgba(255, 99, 132, 0.6)",

          "rgba(255, 159, 64, 0.6)",
          "rgba(153, 102, 255, 0.6)",
          "rgba(255, 205, 86, 0.6)",
        ];
        return colors[index % colors.length];
      });
    }

    // Trường hợp không có dữ liệu
    if (labels.length === 0) {
      labels = ["Không có dữ liệu"];
      values = [1];
      backgroundColors = ["rgba(200, 200, 200, 0.6)"];
    }

    return {
      labels,
      datasets: [
        {
          data: values,
          backgroundColor: backgroundColors,
          borderWidth: 0,
        },
      ],
    };
  };

  const lineChartOptions = {
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Số điện tiêu thụ (kWh)",
        },
      },
      x: {
        title: {
          display: true,
          text: loaiBieuDo === "dienNangTheoNgay" ? "Giờ" : "Ngày",
        },
      },
    },
    plugins: {
      legend: {
        position: "top",
      },
    },
  };
  const doughnutChartOptions = {
    responsive: true,
    maintainAspectRatio: false, // Cho phép biểu đồ mở rộng theo chiều cao
    cutout: "60%",
    plugins: {
      legend: {
        display: true,
        position: "right",
        labels: {
          font: { size: 16 },
        },
      },
      tooltip: {
        enabled: true,
        callbacks: {
          label: (context) => {
            const label = context.label || "";
            const value = context.raw || 0;
            return `${label}: ${value.toLocaleString("vi-VN")} VND`;
          },
        },
      },
    },
  };

  const headers = [
    { label: "Mã phòng", key: "room_id" },
    { label: "Ngày", key: "timestamp" },
    { label: "Số điện(kWh)", key: "energy" },
    { label: "Tổng tiền", key: "total_cost" },
  ];

  return (
    <motion.div
      variants={itemVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6 "
    >
      <div className="flex flex-col lg:flex-row w-full gap-4 md:gap-6">
        {/* Biểu đồ điện năng & Tổng số tiền */}
        <div className="flex flex-col w-full gap-4 md:gap-6 lg:w-2/3">
          {/* Biểu đồ điện năng */}
          <div className="bg-white rounded-xl shadow-md ">
            <h2 className="p-3 text-base md:text-lg xl:text-xl 2xl:text-3xl font-semibold text-gray-700 mb-2">
              Số điện tiêu thụ
            </h2>
            {dangTai ? (
              <p className="text-center text-gray-500">Đang tải dữ liệu...</p>
            ) : error ? (
              <p className="text-center text-red-500">{error}</p>
            ) : (
              <div className="h-64 md:h-80 2xl:h-full w-full">
                <Line data={getLineChartData()} options={lineChartOptions} />
              </div>
            )}
          </div>

          {/* Tổng số tiền */}
          <div className="bg-white p-4 md:p-5 rounded-xl shadow-md flex flex-col items-center w-full">
            <h2 className="text-base md:text-lg font-semibold text-gray-700 mb-2">
              Tổng số tiền
            </h2>
            {dangTai ? (
              <p className="text-center text-gray-500">Đang tải...</p>
            ) : error ? (
              <p className="text-center text-red-500">{error}</p>
            ) : !duLieuBieuDo[loaiBieuDo] ||
              duLieuBieuDo[loaiBieuDo].length === 0 ? (
              <p className="text-2xl md:text-3xl font-bold mt-2">0 VND</p>
            ) : (
              <>
                <p className="text-2xl md:text-3xl font-bold mt-2">
                  {duLieuBieuDo[loaiBieuDo]
                    .reduce((sum, item) => sum + (item.total_cost || 0), 0)
                    .toLocaleString("vi-VN")}{" "}
                  VND
                </p>

                <div className="mt-4 w-[60%]  2xl:w-[40%]">
                  <Doughnut
                    data={getDoughnutChartData()}
                    options={doughnutChartOptions}
                  />
                </div>
              </>
            )}
          </div>
        </div>

        {/* Điều khiển: Lịch, Loại thống kê, Chọn phòng */}
        <div className="bg-white p-4 md:p-5 rounded-xl shadow-md w-full lg:w-1/3">
          <h2 className="text-base md:text-xl font-semibold text-gray-700 mb-2">
            Chọn thời gian
          </h2>
          <Calendar
            onChange={setDate}
            value={date}
            className="mx-auto rounded-lg shadow-md w-full border-none mb-4"
          />
          <h2 className="text-base md:text-xl font-semibold text-gray-700 mb-2">
            Chọn loại thống kê
          </h2>
          <select
            value={loaiBieuDo}
            onChange={(e) => setLoaiBieuDo(e.target.value)}
            className="p-2 border rounded w-full text-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none mb-4"
          >
            <option value="dienNangTheoNgay">Theo ngày</option>
            <option value="dienNangTheoTungNgay">Theo tháng</option>
            <option value="dienNangTheoNam">Theo năm</option>
          </select>
          <h2 className="text-base md:text-xl font-semibold text-gray-700 mb-2">
            Chọn phòng
          </h2>
          <select
            value={roomChon || ""}
            onChange={(e) => setRoomChon(e.target.value || null)}
            className="p-2 border rounded w-full text-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            <option value="">Tất cả phòng</option>
            {danhSachPhong.map((roomId) => (
              <option key={roomId} value={roomId}>
                Phòng {roomId}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Phần dưới: Danh sách phòng */}
      <motion.section
        className="w-full"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={slideUpVariants}
      >
        <RoomTable
          headers={headers}
          displayedRooms={duLieuBieuDo[loaiBieuDo]}
          title={"Danh sách phòng"}
          roomsPerPage={5}
        />
      </motion.section>
    </motion.div>
  );
}

export default ChartAdmin;
