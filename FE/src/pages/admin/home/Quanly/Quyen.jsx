import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { axiosInstance } from "../../../../../Axios";

const QuyenManagement = () => {
  const [step, setStep] = useState(1);
  const [quyenList, setQuyenList] = useState([]);
  const [selectedQuyen, setSelectedQuyen] = useState(null);
  const [functionList, setFunctionList] = useState([]);
  const [selectedFunctions, setSelectedFunctions] = useState([]);
  const [newQuyen, setNewQuyen] = useState({ ten_quyen: "", trang_thai: 1 });
  const [isAddFormVisible, setIsAddFormVisible] = useState(false);
  const [isEditFormVisible, setIsEditFormVisible] = useState(false);
  const [editQuyen, setEditQuyen] = useState(null);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  const fetchQuyenList = async () => {
    try {

      const response = await axiosInstance.get("/phan_quyen/AllQuyen");

      setQuyenList(response.data.data);
    } catch (error) {
      console.error("Lỗi khi tải danh sách quyền:", error);
    }
  };

  const fetchFunctionList = async (quyenId) => {
    try {

      const response = await axiosInstance.post(
        `/quyenchucnang/CheckQuyen/${quyenId}`
      );
      setFunctionList(response.data.data);
      setSelectedFunctions(
        response.data.data.filter((func) => func.check).map((func) => func._id)
      );
    } catch (error) {
      console.error("Lỗi khi tải danh sách chức năng:", error);
    }
  };

  useEffect(() => {
    fetchQuyenList();
  }, []);

  useEffect(() => {
    if (selectedQuyen && step === 2) fetchFunctionList(selectedQuyen._id);
  }, [selectedQuyen, step]);

  const handleAssignFunctions = async () => {
    try {

      await axiosInstance.post(`/quyenchucnang/CreatQuyen`, {
        id_quyen: selectedQuyen._id,
        functions: selectedFunctions,
      });
      alert("Cấp quyền thành công!");
      setStep(1);
    } catch {
      alert("Lỗi khi cấp quyền!");
    }
  };

  const handleFunctionChange = (id_chuc_nang) => {
    setSelectedFunctions((prev) =>
      prev.includes(id_chuc_nang)
        ? prev.filter((id) => id !== id_chuc_nang)
        : [...prev, id_chuc_nang]
    );
    setFunctionList((prev) =>
      prev.map((func) =>
        func._id === id_chuc_nang ? { ...func, check: !func.check } : func
      )
    );
  };

  const handleAddQuyen = async (e) => {
    e.preventDefault();
    try {

      await axiosInstance.post("/phan_quyen/CreatQuyen", newQuyen);
      alert("Thêm mới quyền thành công!");
      setNewQuyen({ ten_quyen: "", trang_thai: 1 });
      setIsAddFormVisible(false);
      fetchQuyenList();
    } catch {
      alert("Có lỗi xảy ra khi thêm quyền!");
    }
  };

  const handleUpdateQuyen = async (e) => {
    e.preventDefault();
    try {

      await axiosInstance.post(
        `/phan_quyen/UpdateQuyen/${editQuyen._id}`,
        editQuyen
      );
      alert("Cập nhật quyền thành công!");
      setIsEditFormVisible(false);
      fetchQuyenList();
    } catch {
      alert("Lỗi khi cập nhật quyền!");
    }
  };

  const handleChangeStatus = async (id, currentStatus) => {
    try {
      const newStatus = currentStatus === 1 ? 0 : 1;

      await axiosInstance.post(`/phan_quyen/UpdateStatus/${id}`, {
        trang_thai: newStatus,
      });
      setQuyenList((prev) =>
        prev.map((item) =>
          item._id === id ? { ...item, trang_thai: newStatus } : item
        )
      );
      alert("Cập nhật trạng thái thành công!");
    } catch {
      alert("Lỗi khi cập nhật trạng thái!");
    }
  };

  const handleDeleteQuyen = async (id) => {
    try {

      await axiosInstance.post(`/phan_quyen/DeleteQuyen/${id}`);
      alert("Xóa quyền thành công!");
      fetchQuyenList();
    } catch {
      alert("Lỗi khi xóa quyền!");
    }
  };

  return (
    <motion.div
      className="space-y-4"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <header className="bg-white shadow-md p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Quản Lý Quyền</h1>
        <motion.button
          whileHover={{ scale: 1.05 }}
          className="bg-green-500 text-white px-4 py-2 rounded-full flex items-center gap-2"
          onClick={() => setIsAddFormVisible(true)}
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 4v16m8-8H4"
            />
          </svg>
          Thêm Quyền
        </motion.button>
      </header>

      <div className="px-4 overflow-x-auto pb-10">
        {/* Step 1: Danh sách quyền */}
        {step === 1 && (
          <motion.div
            className="bg-white rounded-xl shadow-lg w-full flex flex-col"
            variants={itemVariants}
          >
            {/* Form thêm quyền */}
            {isAddFormVisible && (
              <form
                onSubmit={handleAddQuyen}
                className="p-4 bg-gray-50 rounded-t-lg"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-center">
                  <input
                    type="text"
                    value={newQuyen.ten_quyen}
                    onChange={(e) =>
                      setNewQuyen({ ...newQuyen, ten_quyen: e.target.value })
                    }
                    placeholder="Tên quyền"
                    className="flex-1 p-2 border rounded-md"
                    required
                  />
                  <select
                    value={newQuyen.trang_thai}
                    onChange={(e) =>
                      setNewQuyen({
                        ...newQuyen,
                        trang_thai: Number(e.target.value),
                      })
                    }
                    className="p-2 border rounded-md md:w-40 w-full"
                  >
                    <option value={1}>Hoạt Động</option>
                    <option value={0}>Tạm Tắt</option>
                  </select>
                  <div className="flex gap-2 flex-wrap">
                    <button
                      type="submit"
                      className="bg-blue-500 text-white px-4 py-2 rounded-md"
                    >
                      Thêm
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsAddFormVisible(false)}
                      className="bg-gray-300 px-4 py-2 rounded-md"
                    >
                      Hủy
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* Form chỉnh sửa quyền */}
            {isEditFormVisible && editQuyen && (
              <form
                onSubmit={handleUpdateQuyen}
                className="p-4 bg-gray-50 rounded-t-lg"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-center">
                  <input
                    type="text"
                    value={editQuyen.ten_quyen}
                    onChange={(e) =>
                      setEditQuyen({
                        ...editQuyen,
                        ten_quyen: e.target.value,
                      })
                    }
                    placeholder="Tên quyền"
                    className="flex-1 p-2 border rounded-md"
                    required
                  />
                  <select
                    value={editQuyen.trang_thai}
                    onChange={(e) =>
                      setEditQuyen({
                        ...editQuyen,
                        trang_thai: Number(e.target.value),
                      })
                    }
                    className="p-2 border rounded-md md:w-40 w-full"
                  >
                    <option value={1}>Hoạt Động</option>
                    <option value={0}>Tạm Tắt</option>
                  </select>
                  <div className="flex gap-2 flex-wrap">
                    <button
                      type="submit"
                      className="bg-blue-500 text-white px-4 py-2 rounded-md"
                    >
                      Cập Nhật
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditFormVisible(false)}
                      className="bg-gray-300 px-4 py-2 rounded-md"
                    >
                      Hủy
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* Table danh sách quyền */}
            <div className="overflow-auto">
              <table className="w-full text-left min-w-[600px]">
                <thead className="bg-gray-200 sticky top-0 z-10">
                  <tr>
                    <th className="p-3 text-center">#</th>
                    <th className="p-3 text-center">Tên Quyền</th>
                    <th className="p-3 text-center">Trạng Thái</th>
                    <th className="p-3 text-center">Hành Động</th>
                  </tr>
                </thead>
                <tbody>
                  {quyenList.map((quyen, index) => (
                    <tr key={quyen._id} className="border-b">
                      <td className="p-3 text-center">{index + 1}</td>
                      <td className="p-3 text-center">{quyen.ten_quyen}</td>
                      <td className="p-3 text-center">
                        <span
                          onClick={() =>
                            handleChangeStatus(quyen._id, quyen.trang_thai)
                          }
                          className={`cursor-pointer inline-block px-3 py-1 rounded-full text-white ${
                            quyen.trang_thai === 1
                              ? "bg-green-500"
                              : "bg-red-500"
                          }`}
                        >
                          {quyen.trang_thai === 1 ? "Hoạt Động" : "Tạm Tắt"}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <div className="flex gap-2 justify-center flex-wrap">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            className="bg-blue-500 text-white px-3 py-1 rounded-md"
                            onClick={() => {
                              setSelectedQuyen(quyen);
                              setStep(2);
                            }}
                          >
                            Cấp Quyền
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            className="bg-yellow-500 text-white px-2 py-1 rounded-md"
                            onClick={() => {
                              setEditQuyen(quyen);
                              setIsEditFormVisible(true);
                            }}
                          >
                            ✏️
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            className="bg-red-500 text-white px-2 py-1 rounded-md"
                            onClick={() => handleDeleteQuyen(quyen._id)}
                          >
                            🗑️
                          </motion.button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* Step 2: Cấp quyền */}
        {step === 2 && (
          <motion.div
            className="bg-white rounded-xl shadow-lg w-full flex flex-col"
            variants={itemVariants}
          >
            <p className="p-4 text-xl font-bold">
              Cấp quyền cho:{" "}
              <span className="font-semibold text-red-500">
                {selectedQuyen?.ten_quyen}
              </span>
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 overflow-auto p-4">
              {functionList.map((func) => (
                <motion.div
                  key={func._id}
                  className="flex items-center gap-2 p-2 border-b cursor-pointer"
                  whileHover={{ backgroundColor: "#f3f4f6" }}
                  onClick={() => handleFunctionChange(func._id)}
                >
                  <input
                    type="checkbox"
                    checked={selectedFunctions.includes(func._id)}
                    readOnly
                    className="h-4 w-4 text-blue-600 pointer-events-none"
                  />
                  <label className="font-medium">{func.ten_chuc_nang}</label>
                </motion.div>
              ))}
            </div>
            <div className="p-4 border-t flex flex-col md:flex-row gap-4 justify-between items-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                className="w-full md:w-[250px] bg-blue-600 text-white py-3 rounded-full"
                onClick={handleAssignFunctions}
              >
                Cấp Quyền
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                className="w-full md:w-[250px] bg-gray-300 py-3 rounded-full"
                onClick={() => setStep(1)}
              >
                Quay Lại
              </motion.button>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default QuyenManagement;
