import { useEffect, useState } from "react";
import useApiManagerAdmin from "../../hook/useApiManagerAdmin";
import { axiosInstance } from "../../../Axios";
import { Navigate } from "react-router";
import { useParams } from "react-router";

function ThanhToanThang() {
    const params = useParams();
    const { id } = params;
    const { data: dichVuData } = useApiManagerAdmin("/dich-vu");
    const [thanhToanThang, setThanhToanThang] = useState({
        ma_phong: "",
        id_users: "",
        ma_hoa_don_thang: "",
        ho_va_ten: "",
        tien_phong: 0,
        so_dien_tieu_thu: 0,
        tong_tien: 0,
        trang_thai: "",
    });
    const [dichVu, setDichVu] = useState({
        gia_dien: 0,
        tien_nuoc: 0,
        tien_wifi: 0,
    });
    const [message, setMessage] = useState("");

    // Lấy thông tin hóa đơn mới nhất
    useEffect(() => {
        fetchDetailHoaDonThang();
    }, [id]);

    const fetchDetailHoaDonThang = async () => {
        try {
            const response = await axiosInstance.get(`/hoa-don-thang/get-detail/${id}`);
            const hoaDonThang = response.data.data[0];
            console.log("Hóa đơn tháng:", hoaDonThang);
            setThanhToanThang({
                ma_phong: hoaDonThang.ma_phong || "",
                id_users: hoaDonThang.id_users || "",
                ma_hoa_don_thang: hoaDonThang.ma_hoa_don_thang || "HD-Unknown",
                ho_va_ten: hoaDonThang.ho_va_ten || "Khách",
                tien_phong: hoaDonThang.tien_phong || 0,
                so_dien_tieu_thu: hoaDonThang.so_dien_tieu_thu || 0,
                tong_tien: hoaDonThang.tong_tien || 0,
                trang_thai: hoaDonThang.trang_thai || "chưa thanh toán",
            });

        } catch (error) {
            console.error("Lỗi khi tìm kiếm thông tin chi tiết về hóa đơn THÁNG:", error);
        }
    }

    // Lấy thông tin dịch vụ
    useEffect(() => {
        if (dichVuData) {
            const activeDichVu = dichVuData.find((dv) => dv.trang_thai === 1);
            if (activeDichVu) {
                setDichVu({
                    gia_dien: activeDichVu.tien_dien || 0,
                    tien_nuoc: activeDichVu.tien_nuoc || 0,
                    tien_wifi: activeDichVu.tien_wifi || 0,
                });
            } else {
                setMessage("Không tìm thấy thông tin dịch vụ cho phòng này");
            }
        }
    }, [dichVuData]);

    // Hàm gọi API kiểm tra giao dịch
    const handleCheckTransaction = async () => {
        setMessage("");
        try {
            const { data } = await axiosInstance.post("/ngan-hang/transactionThang");
            setMessage(data.message);
            await fetchDetailHoaDonThang();
        } catch (error) {
            setMessage("Lỗi khi kiểm tra giao dịch");
            console.error("Error checking transaction:", error.message);
        }
    };

    // Tự động kiểm tra giao dịch khi vào trang và lặp lại cho đến khi trạng thái là "đã thanh toán"
    useEffect(() => {
        handleCheckTransaction();
        const intervalId = setInterval(() => {
            if (thanhToanThang.trang_thai !== "đã thanh toán") {
                handleCheckTransaction();
            }
        }, 60000);

        if (thanhToanThang.trang_thai === "đã thanh toán") {
            clearInterval(intervalId);
            setMessage("Giao dịch đã được xác nhận thành công!");
            setTimeout(() => {
                Navigate("/");
            }, 5000);
        }

        return () => clearInterval(intervalId);
    }, [thanhToanThang.trang_thai]);

    const formatCurrency = (amount) => {
        // Kiểm tra nếu amount là undefined hoặc null, trả về "0"
        return (amount ?? 0).toLocaleString("vi-VN", { minimumFractionDigits: 0 });
    };

    // tạo QR code URL
    const qrCodeUrl = `https://img.vietqr.io/image/970422-0367599057-qr_only.png?amount=${thanhToanThang.tong_tien}&addInfo=${encodeURIComponent(
        thanhToanThang.ma_hoa_don_thang || "HD-Unknown"
    )}&accountName=NGUYEN%20TRUNG%20HUNG`;

    return (
        <div className="flex flex-col md:flex-row p-4 gap-4 bg-gray-100 min-h-screen">
            {/* Phần thông tin hóa đơn */}
            <div className="w-full md:w-1/3 bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-bold mb-4">Hóa đơn Tháng</h2>

                <div className="mb-4 flex justify-between">
                    <p className="text-lg font-semibold">Mã hóa đơn tháng:</p>
                    <p className="text-lg">{thanhToanThang.ma_hoa_don_thang}</p>
                </div>

                <div className="mb-4 flex justify-between">
                    <p className="text-lg font-semibold">Người thuê:</p>
                    <p className="text-lg">{thanhToanThang.ho_va_ten}</p>
                </div>

                <div className="mb-4 flex justify-between">
                    <p className="text-lg font-semibold">Phòng:</p>
                    <p className="text-lg">{thanhToanThang.ma_phong}</p>
                </div>

                <div className="mb-4 flex justify-between">
                    <p className="text-lg font-semibold">Số tiền phòng:</p>
                    <p className="text-lg">{formatCurrency(thanhToanThang.tien_phong)} VND</p>
                </div>

                <div className="mb-4 flex justify-between">
                    <p className="text-lg font-semibold">Số điện tiêu thụ:</p>
                    <p className="text-lg">{formatCurrency(thanhToanThang.so_dien_tieu_thu)} WH</p>
                </div>


                <div className="mb-4 flex justify-between">
                    <p className="text-lg font-semibold">Số tiền điện:</p>
                    <p className="text-lg">{formatCurrency(dichVu.gia_dien)} VND</p>
                </div>

                <div className="mb-4 flex justify-between">
                    <p className="text-lg font-semibold">Số tiền nước:</p>
                    <p className="text-lg">{formatCurrency(dichVu.tien_nuoc)} VND</p>
                </div>

                <div className="mb-4 flex justify-between">
                    <p className="text-lg font-semibold">Số tiền Wifi:</p>
                    <p className="text-lg">{formatCurrency(dichVu.tien_wifi)} VND</p>
                </div>

                <div className="mb-4 flex justify-between">
                    <p className="text-lg font-semibold">Tổng tiền:</p>
                    <p className="text-lg font-bold text-blue-600">{formatCurrency(thanhToanThang.tong_tien)} VND</p>
                </div>

                <div className="mb-4 flex justify-between">
                    <p className="text-lg font-semibold">Trạng thái:</p>
                    <p
                        className={`text-lg ${thanhToanThang.trang_thai === "đã thanh toán"
                            ? "text-green-600"
                            : "text-red-600"
                            }`}
                    >
                        {thanhToanThang.trang_thai}
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
                        <strong>Nội dung chuyển khoản:</strong> {thanhToanThang.ma_hoa_don_thang}
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
                    {thanhToanThang.ma_hoa_don_thang ? (
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

export default ThanhToanThang;