import { useEffect, useState } from "react";
import { axiosInstance } from "../../../Axios";

function Contracts() {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContracts();
  }, []);

  const fetchContracts = async () => {
    try {
      const { data } = await axiosInstance.get("/landlord/my-contracts");
      setContracts(data.data);
    } catch (error) {
      console.error("Lỗi tải hợp đồng:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("vi-VN");
  };

  const getStatusColor = (status) => {
    const colors = {
      da_ky: "bg-green-100 text-green-800",
      chua_ky: "bg-yellow-100 text-yellow-800",
      het_han: "bg-red-100 text-red-800",
      yeu_cau_huy_hop_dong: "bg-orange-100 text-orange-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const getStatusLabel = (status) => {
    const labels = {
      da_ky: "Đã ký",
      chua_ky: "Chưa ký",
      het_han: "Hết hạn",
      yeu_cau_huy_hop_dong: "Yêu cầu hủy",
    };
    return labels[status] || status;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Quản lý hợp đồng</h2>

      {contracts.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Chưa có hợp đồng nào</h3>
          <p className="text-gray-600">Hợp đồng sẽ hiển thị khi có người thuê phòng của bạn</p>
        </div>
      ) : (
        <div className="space-y-4">
          {contracts.map((contract) => (
            <div key={contract._id} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">{contract.ten_hop_dong}</h3>
                  <p className="text-sm text-gray-600">Mã phòng: {contract.ma_phong}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(contract.trang_thai)}`}>
                  {getStatusLabel(contract.trang_thai)}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Thông tin phòng</h4>
                  <p className="text-sm text-gray-600">Tên phòng: {contract.room?.ten_phong_tro}</p>
                  <p className="text-sm text-gray-600">Địa chỉ: {contract.room?.dia_chi}</p>
                  <p className="text-sm text-gray-600">Giá: {contract.room?.gia_tien?.toLocaleString()} VND/tháng</p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Thông tin người thuê</h4>
                  <p className="text-sm text-gray-600">Họ tên: {contract.tenant?.ho_va_ten || contract.tenant?.username}</p>
                  <p className="text-sm text-gray-600">Email: {contract.tenant?.email}</p>
                  <p className="text-sm text-gray-600">SĐT: {contract.tenant?.so_dien_thoai || "N/A"}</p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex items-center gap-6 text-sm text-gray-600">
                  <div>
                    <span className="font-medium">Bắt đầu:</span> {formatDate(contract.start_date)}
                  </div>
                  <div>
                    <span className="font-medium">Kết thúc:</span> {formatDate(contract.end_date)}
                  </div>
                  <div>
                    <span className="font-medium">Tiền cọc:</span> {contract.tien_coc?.toLocaleString()} VND
                  </div>
                </div>

                <button className="bg-indigo-100 text-indigo-600 px-4 py-2 rounded hover:bg-indigo-200 transition-colors text-sm font-medium">
                  Xem hợp đồng
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Contracts;

