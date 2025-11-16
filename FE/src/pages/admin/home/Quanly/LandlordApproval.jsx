import { useEffect, useState } from "react";
import { axiosInstance } from "../../../../../Axios";

function LandlordApproval() {
  const [requests, setRequests] = useState([]);
  const [filter, setFilter] = useState("pending");
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [lyDoTuChoi, setLyDoTuChoi] = useState("");
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, [filter]);

  const fetchRequests = async () => {
    try {
      const { data } = await axiosInstance.get(`/landlord/requests?status=${filter}`);
      setRequests(data.data);
    } catch (error) {
      console.error("Lỗi lấy danh sách:", error);
    }
  };

  const handleApprove = async (userId) => {
    try {
      await axiosInstance.patch(`/landlord/approve/${userId}`, {
        trang_thai: "approved",
      });
      alert("Duyệt chủ trọ thành công!");
      fetchRequests();
    } catch (error) {
      alert("Lỗi: " + (error.response?.data?.message || "Không thể duyệt"));
    }
  };

  const handleReject = (request) => {
    setSelectedRequest(request);
    setShowModal(true);
  };

  const confirmReject = async () => {
    if (!lyDoTuChoi.trim()) {
      alert("Vui lòng nhập lý do từ chối");
      return;
    }

    try {
      await axiosInstance.patch(`/landlord/approve/${selectedRequest._id}`, {
        trang_thai: "rejected",
        ly_do_tu_choi: lyDoTuChoi,
      });
      alert("Từ chối yêu cầu thành công!");
      setShowModal(false);
      setLyDoTuChoi("");
      fetchRequests();
    } catch (error) {
      alert("Lỗi: " + (error.response?.data?.message || "Không thể từ chối"));
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("vi-VN");
  };

  const getStatusBadge = (status) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800",
      approved: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
    };
    const labels = {
      pending: "Chờ duyệt",
      approved: "Đã duyệt",
      rejected: "Từ chối",
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${colors[status]}`}>
        {labels[status]}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Quản lý Chủ Trọ</h1>
          
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setFilter("pending")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === "pending"
                  ? "bg-yellow-500 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Chờ duyệt ({requests.filter(r => r.trang_thai_chu_tro === "pending").length})
            </button>
            <button
              onClick={() => setFilter("approved")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === "approved"
                  ? "bg-green-500 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Đã duyệt
            </button>
            <button
              onClick={() => setFilter("rejected")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === "rejected"
                  ? "bg-red-500 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Từ chối
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Người dùng
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    SĐT
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Lý do đăng ký
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ngày gửi
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  {filter === "pending" && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Hành động
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {requests.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                      Không có yêu cầu nào
                    </td>
                  </tr>
                ) : (
                  requests.map((request) => (
                    <tr key={request._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {request.ho_va_ten || request.username}
                        </div>
                        <div className="text-sm text-gray-500">CCCD: {request.cccd || "N/A"}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {request.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {request.so_dien_thoai || "N/A"}
                      </td>
                      <td className="px-6 py-4 max-w-xs">
                        <p className="text-sm text-gray-900 truncate" title={request.ly_do_dang_ky_chu_tro}>
                          {request.ly_do_dang_ky_chu_tro}
                        </p>
                        {request.ly_do_tu_choi && (
                          <p className="text-sm text-red-600 mt-1">
                            Lý do từ chối: {request.ly_do_tu_choi}
                          </p>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(request.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(request.trang_thai_chu_tro)}
                      </td>
                      {filter === "pending" && (
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleApprove(request._id)}
                              className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 transition-colors"
                            >
                              Duyệt
                            </button>
                            <button
                              onClick={() => handleReject(request)}
                              className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition-colors"
                            >
                              Từ chối
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal từ chối */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Từ chối yêu cầu</h3>
            <p className="text-sm text-gray-600 mb-4">
              Người dùng: {selectedRequest?.ho_va_ten || selectedRequest?.username}
            </p>
            <textarea
              value={lyDoTuChoi}
              onChange={(e) => setLyDoTuChoi(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none mb-4"
              rows="4"
              placeholder="Nhập lý do từ chối..."
              required
            />
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowModal(false);
                  setLyDoTuChoi("");
                }}
                className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={confirmReject}
                className="flex-1 bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition-colors"
              >
                Xác nhận từ chối
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default LandlordApproval;

