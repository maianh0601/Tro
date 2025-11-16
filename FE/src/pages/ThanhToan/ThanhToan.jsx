import { useEffect, useState } from "react";
import { axiosInstance } from "../../../Axios";
import { useNavigate, useParams } from "react-router";
function ThanhToan() {
    const params = useParams();
    const navigate = useNavigate();
    const { id } = params;
    const [thanhToan, setThanhToan] = useState({
        ma_phong: "",
        id_users: "",
        ma_don_hang: "",
        ho_va_ten: "",
        so_tien: 0,
        trang_thai: "",
    });
    const [message, setMessage] = useState("");

    useEffect(() => {
        fetchDetailHoaDon();
    }, [id]);

    // Gọi hàm để lấy thông tin hóa đơn khi id thay đổi
    const fetchDetailHoaDon = async () => {
        try {
            const response = await axiosInstance.get(`/hoadon/get-detail/${id}`);
            const hoaDon = response.data.data[0];
            setThanhToan({
                ma_phong: hoaDon.ma_phong || "",
                id_users: hoaDon.id_users || "",
                ma_don_hang: hoaDon.ma_don_hang || "HD-Unknown",
                ho_va_ten: hoaDon.ho_va_ten || "Khách",
                so_tien: hoaDon.so_tien || 0,
                trang_thai: hoaDon.trang_thai || "chưa thanh toán",
            });

        } catch (error) {
            console.error("Error fetching invoice details:", error);
        }
    }

    const handleCheckTransaction = async () => {
        setMessage("");
        try {
            const { data } = await axiosInstance.post("/ngan-hang/transaction");
            setMessage(data.message);
            await fetchDetailHoaDon();
        } catch (error) {
            setMessage("Lỗi khi kiểm tra giao dịch");
            console.error("Error checking transaction:", error.message);
        }
    };

    // Tự động kiểm tra giao dịch khi vào trang và lặp lại cho đến khi trạng thái là "đã thanh toán"
    useEffect(() => {
        // Gọi ngay lần đầu tiên khi vào trang
        handleCheckTransaction();

        // Thiết lập interval để kiểm tra định kỳ mỗi 1 phút
        const intervalId = setInterval(() => {
            if (thanhToan.trang_thai !== "đã thanh toán") {
                handleCheckTransaction();
            }
        }, 60000);

        // Dừng interval khi trạng thái là "đã thanh toán" hoặc khi component unmount
        if (thanhToan.trang_thai === "đã thanh toán") {
            clearInterval(intervalId);
            setMessage("Giao dịch đã được xác nhận thành công!");
            setTimeout(() => {
                navigate("/");
            }, 5000);
        }

        return () => clearInterval(intervalId); // Cleanup interval khi component unmount
    }, [thanhToan.trang_thai]);

    const formatCurrency = (amount) => {
        return amount.toLocaleString("vi-VN", { minimumFractionDigits: 0 });
    };

    // tạo QR code URL
    const qrCodeUrl = `https://img.vietqr.io/image/970422-0367599057-qr_only.png?amount=${thanhToan.so_tien}&addInfo=${encodeURIComponent(
        thanhToan.ma_don_hang || "HD-Unknown"
    )}&accountName=NGUYEN%20MAI%20ANH`;

    return (
        <div className="flex flex-col md:flex-row p-4 gap-4 bg-gray-100 min-h-screen">
            {/* Phần thông tin hóa đơn */}
            <div className="w-full md:w-1/3 bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-bold mb-4">Hóa đơn đặt cọc</h2>

                <div className="mb-4 flex justify-between">
                    <p className="text-lg font-semibold">Mã đơn hàng:</p>
                    <p className="text-lg">{thanhToan.ma_don_hang}</p>
                </div>

                <div className="mb-4 flex justify-between">
                    <p className="text-lg font-semibold">Người thuê:</p>
                    <p className="text-lg">{thanhToan.ho_va_ten}</p>
                </div>

                <div className="mb-4 flex justify-between">
                    <p className="text-lg font-semibold">Phòng:</p>
                    <p className="text-lg">{thanhToan.ma_phong}</p>
                </div>

                <div className="mb-4 flex justify-between">
                    <p className="text-lg font-semibold">Số tiền đặt cọc:</p>
                    <p className="text-lg">{formatCurrency(thanhToan.so_tien)} VND</p>
                </div>

                <div className="mb-4 flex justify-between">
                    <p className="text-lg font-semibold">Trạng thái:</p>
                    <p
                        className={`text-lg ${thanhToan.trang_thai === "đã thanh toán"
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                    >
                        {thanhToan.trang_thai}
                    </p>
                </div>

                <div className="border-t pt-4 mt-4">
                    <h3 className="text-lg font-semibold mb-2">Thông tin thanh toán</h3>
                    <p className="text-sm text-gray-600">
                        Vui lòng thanh toán trong vòng 3 ngày kể từ ngày nhận hóa đơn.
                    </p>
                </div>

                <div className="mt-4">
                    <h3 className="text-lg font-semibold mb-2">Chi tiết ngân hàng</h3>
                    <p className="text-sm text-gray-600">
                        <strong>Tên ngân hàng:</strong> MBbank
                    </p>
                    <p className="text-sm text-gray-600">
                        <strong>Số tài khoản:</strong> 0367599057
                    </p>
                    <p className="text-sm text-gray-600">
                        <strong>Nội Dung chuyển khoản:</strong> {thanhToan.ma_don_hang}
                    </p>
                </div>

                {message && (
                    <p className="mt-4 text-sm text-gray-600">{message}</p>
                )}
            </div>

            {/* Phần phương thức thanh toán và QR code */}
            <div className="w-full md:w-2/3 bg-white p-6 rounded-lg shadow-md flex flex-col items-center">
                <h2 className="text-xl font-bold text-blue-500 mb-4">
                    Phương thức thanh toán
                </h2>

                <div className="w-48 h-48 bg-gray-200 flex items-center justify-center mb-4">
                    {thanhToan.ma_don_hang ? (
                        <img
                            src={qrCodeUrl}
                            alt="QR Code"
                            className="w-full h-full object-contain"
                        />
                    ) : (
                        <p className="text-red-600">Chưa có mã đơn hàng để tạo QR code</p>
                    )}
                </div>

                <p className="text-gray-600">Quét mã QR để thanh toán</p>
            </div>
        </div>
    );
}

export default ThanhToan;