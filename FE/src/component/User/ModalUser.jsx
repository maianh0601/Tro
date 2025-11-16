import { useSelector, useDispatch } from "react-redux";
import { CloseModalForm } from "../../Store/filterModalForm";
import { useState, useEffect } from "react";
import { axiosInstance } from "../../../Axios";

function ModalUser({ reload, repairData }) {
  const [formData, setFormData] = useState({
    maphong: "",
    lydo: "",
  });
  const dispatch = useDispatch();
  const { modalType, isOpen, idModal } = useSelector(
    (state) => state.ModalForm
  );

  // Populate form when editing
  useEffect(() => {
    if (modalType === "RepairEdit" && repairData) {
      setFormData({
        maphong: repairData.maphong || "",
        lydo: repairData.lydo || "",
      });
    }
  }, [modalType, repairData]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (modalType === "RepairEdit") {
        await axiosInstance.post(`/sua_chua/Update/${idModal}`, {
          ma_phong: formData.maphong,
          issue: formData.lydo,
        });
      } else {
        await axiosInstance.post("/sua_chua/Create", {
          ma_phong: formData.maphong,
          issue: formData.lydo,
        });
      }
      reload();
      setFormData({
        maphong: "",
        lydo: "",
      });
      dispatch(CloseModalForm());
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const getModalTitle = () => {
    switch (modalType) {
      case "Repair":
        return "Gửi yêu cầu sửa chữa";
      case "RepairEdit":
        return "Cập nhật yêu cầu sửa chữa";
      case "payment":
        return "Thanh toán hóa đơn";
      case "request":
        return "Yêu cầu cá nhân";
      default:
        return "";
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative">
        {/* Close Button */}
        <button
          onClick={() => dispatch(CloseModalForm())}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <span className="text-xl">×</span>
        </button>

        {/* Modal Title */}
        <h2 className="text-xl font-semibold mb-6 text-center text-gray-800">
          {getModalTitle()}
        </h2>

        {/* Repair Form */}
        {(modalType === "Repair" || modalType === "RepairEdit") && (
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mã phòng:
                </label>
                <input
                  type="text"
                  name="maphong"
                  value={formData.maphong}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Nhập mã phòng"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mô tả vấn đề:
                </label>
                <textarea
                  name="lydo"
                  value={formData.lydo}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={4}
                  placeholder="Mô tả chi tiết vấn đề cần sửa chữa..."
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors duration-200 flex items-center justify-center"
              >
                {modalType === "RepairEdit"
                  ? "Cập nhật yêu cầu"
                  : "Gửi yêu cầu"}
              </button>
            </div>
          </form>
        )}

        {/* Payment Confirmation */}
        {modalType === "payment" && (
          <div className="space-y-6">
            <p className="text-gray-600 text-center">
              Bạn có chắc chắn muốn thanh toán hóa đơn này?
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => dispatch(CloseModalForm())}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors duration-200"
              >
                Hủy
              </button>
              <button className="flex-1 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors duration-200">
                Xác nhận thanh toán
              </button>
            </div>
          </div>
        )}

        {/* Request Form */}
        {modalType === "request" && (
          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nội dung yêu cầu:
              </label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Nhập nội dung yêu cầu..."
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors duration-200"
            >
              Gửi yêu cầu
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default ModalUser;
