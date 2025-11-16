import { useState } from "react";

const bills = [
  {
    maPhong: "A101",
    dienThangNay: 1200,
    dienThangTruoc: 1100,
    tienDien: 3500, // Giá mỗi số điện
    tienPhong: 2500000,
    trangThai: false,
    thang: "01/2024",
  },
  {
    maPhong: "A101",
    dienThangNay: 1300,
    dienThangTruoc: 1200,
    tienDien: 3500,
    tienPhong: 2700000,
    trangThai: true,
    thang: "02/2024",
  },
  {
    maPhong: "A101",
    dienThangNay: 1400,
    dienThangTruoc: 1300,
    tienDien: 3500,
    tienPhong: 2600000,
    trangThai: false,
    thang: "03/2024",
  },
];

export default function BillPayment() {
  const [selectedBill, setSelectedBill] = useState(bills[0]);

  const soDienTieuThu = selectedBill.dienThangNay - selectedBill.dienThangTruoc;
  const tongTienDien = soDienTieuThu * selectedBill.tienDien;
  const tongTien = tongTienDien + selectedBill.tienPhong;

  const handlePayment = () => {
    alert(`Thanh toán thành công tiền phòng tháng ${selectedBill.thang}!`);
  };

  return (
    <div className="max-w-lg mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-xl font-semibold text-center mb-4">
        💰 Thanh toán hóa đơn
      </h2>

      {/* Chọn tháng */}
      <select
        className="w-full p-2 border rounded mb-4"
        onChange={(e) => setSelectedBill(bills[e.target.value])}
      >
        {bills.map((bill, index) => (
          <option key={index} value={index}>
            Tháng {bill.thang} {bill.trangThai ? "(đã thanh toán)" : ""}
          </option>
        ))}
      </select>

      {/* Thông tin hóa đơn */}
      <div className="border p-4 rounded bg-gray-50">
        <p>
          <strong>Mã phòng:</strong> {selectedBill.maPhong}
        </p>
        <p>
          <strong>Điện tháng này:</strong> {selectedBill.dienThangNay} kWh
        </p>
        <p>
          <strong>Điện tháng trước:</strong> {selectedBill.dienThangTruoc} kWh
        </p>
        <p>
          <strong>Số điện tiêu thụ:</strong> {soDienTieuThu} kWh
        </p>
        <p>
          <strong>Tiền điện:</strong> {tongTienDien.toLocaleString()} VND
        </p>
        <p>
          <strong>Tiền phòng:</strong> {selectedBill.tienPhong.toLocaleString()}{" "}
          VND
        </p>
        <p className="text-lg font-bold">
          <strong>Tổng tiền:</strong> {tongTien.toLocaleString()} VND
        </p>
        <p
          className={`font-bold mt-2 ${
            selectedBill.trangThai ? "text-green-500" : "text-red-500"
          }`}
        >
          {selectedBill.trangThai ? "✅ đã thanh toán" : "❌ chưa thanh toán"}
        </p>
      </div>

      {/* Nút thanh toán */}
      {!selectedBill.trangThai ? (
        <button
          className="w-full mt-4 bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
          onClick={handlePayment}
        >
          Xác nhận thanh toán
        </button>
      ) : (
        <p className="text-green-500 text-center mt-4">
          ✅ Hóa đơn đã thanh toán
        </p>
      )}
    </div>
  );
}
