import { useState, useEffect } from "react";
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
import { useSelector } from "react-redux";
import { axiosInstance } from "../../../Axios";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

// Hàm định dạng tiền tệ
const formatCurrency = (amount) => {
  return amount.toLocaleString("vi-VN", { style: "currency", currency: "VND" });
};

const ElectricityInvoice = () => {
  const { user } = useSelector((state) => state.auth);
  const [step, setStep] = useState(1); // Step 1: danh sách, Step 2: chi tiết
  const [invoices, setInvoices] = useState([]);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Dữ liệu cho biểu đồ
  const [usageData, setUsageData] = useState({
    labels: [],
    datasets: [
      {
        label: "Số điện sử dụng (kWh)",
        data: [],
        backgroundColor: "rgba(75, 192, 192, 0.6)",
        borderColor: "rgb(75, 192, 192)",
        borderWidth: 1,
      },
    ],
  });

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: "top" },
      title: {
        display: true,
        text: selectedInvoice
          ? `Thống kê sử dụng điện tháng ${new Date(
              selectedInvoice.ngay_tao_hoa_don
            ).toLocaleString("vi-VN", { month: "long", year: "numeric" })}`
          : "",
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: { display: true, text: "kWh" },
      },
    },
  };

  // Lấy danh sách hóa đơn từ API
  useEffect(() => {
    const fetchInvoices = async () => {
      setLoading(true);
      try {
        const response = await axiosInstance.get(
          `/hoa-don-thang/getHDUser/${user._id}`
        );
        const data = response.data;

        if (data.status === "200" && data.data.length > 0) {
          setInvoices(data.data);
        } else {
          setError(true);
        }
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchInvoices();
  }, []);

  const handleSelectInvoice = (invoice) => {
    setSelectedInvoice(invoice);

    // dienNangChenhLech
    if (invoice.dienNangChenhLech && invoice.dienNangChenhLech.length > 0) {
      const labels = invoice.dienNangChenhLech.map((item) => item.date);
      const data = invoice.dienNangChenhLech.map((item) => item.energy);

      setUsageData({
        labels,
        datasets: [
          {
            label: "Số điện sử dụng (kWh)",
            data,
            backgroundColor: "rgba(75, 192, 192, 0.6)",
            borderColor: "rgb(75, 192, 192)",
            borderWidth: 1,
          },
        ],
      });
    } else {
      setUsageData({
        labels: [],
        datasets: [
          {
            label: "Số điện sử dụng (kWh)",
            data: [],
            backgroundColor: "rgba(75, 192, 192, 0.6)",
            borderColor: "rgb(75, 192, 192)",
            borderWidth: 1,
          },
        ],
      });
    }

    setStep(2);
  };

  const handlePayment = async () => {
    try {
      await axiosInstance.post("/hoa-don-thang/updateStatus", {
        id: selectedInvoice._id,
        trang_thai: "đã thanh toán",
      });

      setSelectedInvoice((prev) => ({
        ...prev,
        trang_thai: "đã thanh toán",
      }));
      setInvoices((prev) =>
        prev.map((inv) =>
          inv._id === selectedInvoice._id
            ? { ...inv, trang_thai: "đã thanh toán" }
            : inv
        )
      );
      alert("Thanh toán thành công!");
    } catch {
      alert("Thanh toán thất bại!");
    }
  };

  const handleBack = () => {
    setStep(1);
    setSelectedInvoice(null);
  };

  if (loading) return <div className="text-center p-4">Đang tải...</div>;
  if (error)
    return (
      <div className="text-center text-sm md:text-xl font-semibold py-4 block md:table-celltext-center p-4 text-red-500">
        Bạn chưa có hóa đơn nào
      </div>
    );

  // Step 1: Danh sách hóa đơn
  if (step === 1) {
    return (
      <div className="">
        <h1 className="text-2xl font-bold mb-6 text-center">
          Danh Sách Hóa Đơn
        </h1>
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-center text-xl font-medium">
                  Tháng
                </th>
                <th className="px-6 py-3 text-center text-xl font-medium">
                  Mã phòng
                </th>
                <th className="px-6 py-3 text-center text-xl font-medium">
                  Tổng tiền
                </th>
                <th className="px-6 py-3 text-center text-xl font-medium">
                  Trạng thái
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {invoices.map((invoice) => (
                <tr
                  key={invoice._id}
                  onClick={() => handleSelectInvoice(invoice)}
                  className="cursor-pointer hover:bg-gray-100"
                >
                  <td className="px-6 py-4 text-lg text-gray-500">
                    {new Date(invoice.ngay_tao_hoa_don).toLocaleString(
                      "vi-VN",
                      { month: "long", year: "numeric" }
                    )}
                  </td>
                  <td className="px-6 py-4 text-lg text-gray-500">
                    {invoice.ma_phong}
                  </td>
                  <td className="px-6 py-4 text-lg text-gray-500">
                    {formatCurrency(invoice.tong_tien)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        invoice.trang_thai === "đã thanh toán"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {invoice.trang_thai}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // Step 2: Chi tiết hóa đơn
  if (step === 2 && selectedInvoice) {
    return (
      <div className="">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-center">Hóa Đơn Tiền Điện</h1>
          <button
            onClick={handleBack}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            Quay lại
          </button>
        </div>

        {/* Thông tin hóa đơn */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h2 className="text-lg font-semibold mb-2">
                Thông tin khách hàng
              </h2>
              <p className="text-gray-600 ">
                Mã phòng: {selectedInvoice.ma_phong}
              </p>
              <p className="text-gray-600 ">
                Mã KH: {selectedInvoice.id_users}
              </p>
            </div>
            <div>
              <h2 className="text-lg font-semibold mb-2">Chi tiết hóa đơn</h2>
              <p className="text-gray-600 ">
                Tháng:{" "}
                {new Date(selectedInvoice.ngay_tao_hoa_don).toLocaleString(
                  "vi-VN",
                  { month: "long", year: "numeric" }
                )}
              </p>
              <p className="text-gray-600 ">
                Số điện tiêu thụ: {selectedInvoice.so_dien_tieu_thu} kWh
              </p>
              <p className="text-gray-600 ">
                Tiền điện: {formatCurrency(selectedInvoice.tien_dien)}
              </p>
              <p className="text-gray-600 ">
                Tiền phòng: {formatCurrency(selectedInvoice.tien_phong)}
              </p>
              <p className="text-xl font-bold mt-2">
                Tổng tiền: {formatCurrency(selectedInvoice.tong_tien)}
              </p>
              <p className="mt-2">
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full ${
                    selectedInvoice.trang_thai === "đã thanh toán"
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {selectedInvoice.trang_thai}
                </span>
              </p>
            </div>
          </div>

          {selectedInvoice.trang_thai === "chưa thanh toán" && (
            <button
              onClick={handlePayment}
              className="mt-4 w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
            >
              Thanh toán ngay
            </button>
          )}
        </div>

        {/* Biểu đồ thống kê */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <Bar options={chartOptions} data={usageData} />
        </div>
      </div>
    );
  }

  return null;
};

export default ElectricityInvoice;
