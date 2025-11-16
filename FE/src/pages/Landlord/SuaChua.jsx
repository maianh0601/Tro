import RoomTable from "../../component/admin/RoomTable";
import SearchBar from "../../component/admin/SearchBar";
import { axiosInstance } from "../../../Axios";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  CloseModalForm,
  OpenModalForm,
} from "../../Store/filterModalForm";
import { toast } from "react-toastify";

function LandlordSuaChua() {
  const [suachua, setSuachua] = useState([]);
  const [dsHienThi, setDsHienThi] = useState([]);
  const [myRooms, setMyRooms] = useState([]); // Phòng của landlord
  const [formData, setFormData] = useState({
    ma_phong: "",
    issue: "",
  });
  const [errors, setErrors] = useState({});

  const { isOpen, modalType, idModal } = useSelector(
    (state) => state.ModalForm
  );
  const dispatch = useDispatch();

  useEffect(() => {
    fetchData();
    fetchMyRooms();
  }, []);

  useEffect(() => {
    if (suachua) {
      setDsHienThi(suachua);
    }
  }, [suachua]);

  const fetchData = async () => {
    try {
      const { data } = await axiosInstance.get("/landlord/suachua");
      setSuachua(data.data);
    } catch (error) {
      console.error("Lỗi lấy dữ liệu:", error);
      toast.error("Không thể lấy danh sách sửa chữa!");
    }
  };

  const fetchMyRooms = async () => {
    try {
      const { data } = await axiosInstance.get("/landlord/my-rooms");
      setMyRooms(data.data);
    } catch (error) {
      console.error("Lỗi lấy phòng:", error);
      toast.error("Không thể lấy danh sách phòng!");
    }
  };

  const headers = [
    { label: "Tên", key: "userName" },
    { label: "Mã phòng", key: "ma_phong" },
    { label: "Lý do", key: "issue" },
    { label: "Trạng thái", key: "status" },
    { label: "Phê duyệt", key: "approved" },
    { label: "Ngày báo cáo", key: "createdAt" },
  ];

  const handleUpdateTrangThai = async (status, value) => {
    try {
      await axiosInstance.post(`/landlord/suachua/update-status/${status._id}`, {
        status: value,
      });
      toast.success("Cập nhật trạng thái thành công!");
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Lỗi cập nhật trạng thái!");
    }
  };

  const handleDelete = async (room) => {
    try {
      await axiosInstance.delete(`/landlord/suachua/delete/${room._id}`);
      toast.success("Xóa yêu cầu thành công!");
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Lỗi xóa yêu cầu!");
    }
  };

  const renderStatus = (status) => {
    return (
      <select
        value={status.status}
        className="p-2 border rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
        onChange={(e) => handleUpdateTrangThai(status, e.target.value)}
      >
        {["Chờ xử lý", "Đang xử lý", "Hoàn thành"].map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    );
  };

  const handleSearch = (keyword) => {
    const tuKhoa = keyword.toLowerCase();
    const filtered = suachua.filter(
      (item) =>
        item.userName.toLowerCase().includes(tuKhoa) ||
        item.ma_phong.toLowerCase().includes(tuKhoa) ||
        item.issue?.toLowerCase().includes(tuKhoa)
    );

    setDsHienThi(filtered);
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.ma_phong) newErrors.ma_phong = "Vui lòng chọn mã phòng!";
    if (!formData.issue.trim()) newErrors.issue = "Vui lòng nhập mô tả sự cố!";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const resetForm = () => {
    setFormData({ ma_phong: "", issue: "" });
    setErrors({});
    dispatch(CloseModalForm());
  };

  const handleOpenModalEdit = async (item) => {
    dispatch(OpenModalForm({ modalType: "edit", id: item._id }));
    setFormData({
      ma_phong: item.ma_phong,
      issue: item.issue,
    });
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      if (modalType === "create") {
        await axiosInstance.post("/landlord/suachua/create", formData);
        toast.success("Tạo yêu cầu sửa chữa thành công!");
      } else if (modalType === "edit") {
        await axiosInstance.post(`/landlord/suachua/update/${idModal}`, formData);
        toast.success("Cập nhật yêu cầu thành công!");
      }
      resetForm();
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Có lỗi xảy ra!");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          Quản Lý Sửa Chữa
        </h1>

        <div className="flex gap-5 mb-4">
          <SearchBar onSearch={handleSearch} />
          <button
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors font-semibold"
            onClick={() =>
              dispatch(OpenModalForm({ modalType: "create", id: null }))
            }
          >
            + Thêm yêu cầu sửa chữa
          </button>
        </div>

        <RoomTable
          title={"Sửa chữa"}
          headers={headers}
          displayedRooms={dsHienThi}
          roomsPerPage={10}
          renderStatus={renderStatus}
          handleDelete={handleDelete}
          handleOpenModalEdit={handleOpenModalEdit}
        />

        {/* Modal tạo/sửa yêu cầu */}
        {isOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 min-w-[500px]">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">
                  {modalType === "create"
                    ? "Thêm yêu cầu sửa chữa"
                    : "Chỉnh sửa yêu cầu"}
                </h2>
                <button
                  className="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600"
                  onClick={resetForm}
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mã phòng *
                  </label>
                  <select
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    value={formData.ma_phong}
                    onChange={(e) =>
                      setFormData({ ...formData, ma_phong: e.target.value })
                    }
                  >
                    <option value="">Chọn mã phòng</option>
                    {myRooms.map((room, index) => (
                      <option key={index} value={room.ma_phong}>
                        {room.ma_phong} - {room.ten_phong_tro}
                      </option>
                    ))}
                  </select>
                  {errors.ma_phong && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.ma_phong}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mô tả sự cố *
                  </label>
                  <textarea
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none"
                    rows="4"
                    placeholder="Mô tả chi tiết sự cố cần sửa chữa..."
                    value={formData.issue}
                    onChange={(e) =>
                      setFormData({ ...formData, issue: e.target.value })
                    }
                  />
                  {errors.issue && (
                    <p className="text-red-500 text-sm mt-1">{errors.issue}</p>
                  )}
                </div>
              </div>

              <button
                onClick={handleSubmit}
                className="mt-6 w-full py-3 px-6 bg-indigo-600 rounded-lg text-white hover:bg-indigo-700 transition-colors font-semibold"
              >
                {modalType === "create" ? "Tạo yêu cầu" : "Cập nhật"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default LandlordSuaChua;

