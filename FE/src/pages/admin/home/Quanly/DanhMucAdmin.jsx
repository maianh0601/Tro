import { useEffect, useState } from "react";
import SearchBar from "../../../../component/admin/SearchBar";
import RoomTable from "../../../../component/admin/RoomTable";
import useApiManagerAdmin from "../../../../hook/useApiManagerAdmin";
import { useDispatch, useSelector } from "react-redux";
import {
  CloseModalForm,
  OpenModalForm,
} from "../../../../Store/filterModalForm";
import OptionDanhMuc from "../../../../component/admin/OptionDanhMuc";
function DanhMucAdmin() {
  const [dataDanhmuc, setDataDanhmuc] = useState({
    ma_danh_muc: "",
    ten_danh_muc: "",
    mo_ta: "",
    trang_thai: "",
  });
  const [errors, setErrors] = useState({});
  const { modalType, idModal, isOpen } = useSelector(
    (state) => state.ModalForm
  );
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();
  const {
    data: danhMuc,
    createData,
    DeleteData,
    DeleteAllData,
    UpdateData,
  } = useApiManagerAdmin("/danh-muc");
  const [dsDanhMucHienThi, setDsDanhMucHienThi] = useState([]);
  useEffect(() => {
    if (danhMuc) {
      setDsDanhMucHienThi(danhMuc);
    }
  }, [danhMuc]);
  const headers = [
    { label: "Mã danh mục", key: "ma_danh_muc" },
    { label: "Mô tả", key: "mo_ta" },
    { label: "Tên danh mục", key: "ten_danh_muc" },
    { label: "Trạng thái", key: "trang_thai" },
  ];

  // Hàm render trạng thái
  const renderStatus = (status) => (
    <select
      value={status.trang_thai}
      className="p-1 border rounded"
      onChange={(e) => handleUpdateTrangThai(status._id, e.target.value)}
    >
      <option value={1}>Hoạt động</option>
      <option value={0}>Không hoạt động</option>
    </select>
  );

  // Cập nhật trạng thái sử dụng UpdateData từ hook
  const handleUpdateTrangThai = async (id, value) => {
    await UpdateData(id, { trang_thai: value });
  };

  const resetData = () => {
    dispatch(CloseModalForm());
    setDataDanhmuc({
      ma_danh_muc: "",
      ten_danh_muc: "",
      mo_ta: "",
      trang_thai: "",
    });
    setErrors({});
  };

  // Tạo danh mục mới sử dụng createData từ hook
  const handleCreateDanhMuc = async () => {
    await createData({
      ma_danh_muc: dataDanhmuc.ma_danh_muc,
      ten_danh_muc: dataDanhmuc.ten_danh_muc,
      trang_thai: dataDanhmuc.trang_thai,
      mo_ta: dataDanhmuc.mo_ta,
    });
    resetData();
  };

  const handleDeleteAll = async () => {
    await DeleteAllData();
  };

  const handleDelete = async (room) => {
    await DeleteData(room._id);
  };

  const handleOpenModalEdit = (value) => {
    dispatch(OpenModalForm({ modalType: "edit", id: value._id ?? null }));
    setDataDanhmuc({
      ma_danh_muc: value.ma_danh_muc,
      ten_danh_muc: value.ten_danh_muc,
      trang_thai: value.trang_thai,
      mo_ta: value.mo_ta,
    });
  };

  const validateForm = () => {
    let tempErrors = {};
    if (!dataDanhmuc.ma_danh_muc.trim()) {
      tempErrors.ma_danh_muc = "Mã danh mục không được để trống";
    }
    if (!dataDanhmuc.ten_danh_muc.trim()) {
      tempErrors.ten_danh_muc = "Tên danh mục không được để trống";
    }
    if (dataDanhmuc.trang_thai === "") {
      tempErrors.trang_thai = "Vui lòng chọn trạng thái";
    }
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleCreate = async () => {
    setIsLoading(true);
    try {
      if (!validateForm()) return;
      if (modalType === "create") {
        await handleCreateDanhMuc();
      } else if (modalType === "edit") {
        await UpdateData(idModal, dataDanhmuc);
      }
      resetData();
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchDanhMuc = (keyword) => {
    const tuKhoa = keyword.toLowerCase();
    const filtered = danhMuc.filter(
      (item) =>
        item.ten_danh_muc.toLowerCase().includes(tuKhoa) ||
        item.ma_danh_muc.toLowerCase().includes(tuKhoa) ||
        item.mo_ta?.toLowerCase().includes(tuKhoa)
    );

    setDsDanhMucHienThi(filtered);
  };

  return (
    <div className="">
      <div className="flex gap-5">
        <SearchBar onSearch={handleSearchDanhMuc} />
        <button
          className="bg-customBlue text-white p-3 rounded-lg hover:bg-sky-600"
          onClick={() => {
            dispatch(OpenModalForm({ modalType: "create", id: null }));
          }}
        >
          Thêm danh mục
        </button>
        <button
          className="bg-red-600 text-white p-3 rounded-lg hover:bg-sky-600"
          onClick={handleDeleteAll}
        >
          Xóa tất cả
        </button>
      </div>
      <RoomTable
        headers={headers}
        title={"Danh mục"}
        displayedRooms={dsDanhMucHienThi}
        roomsPerPage={10}
        renderStatus={renderStatus}
        handleDelete={handleDelete}
        handleOpenModalEdit={handleOpenModalEdit}
      />
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 min-w-[300px]">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold mb-4">
                {modalType === "edit" ? "Chỉnh sửa danh mục" : "Thêm danh mục"}
              </h2>
              <button
                className="bg-red-500 text-white p-2 rounded-lg"
                onClick={resetData}
              >
                Close
              </button>
            </div>
            <div className="space-y-4 mt-4">
              <div className="flex gap-5">
                <div className="flex flex-col">
                  <input
                    type="text"
                    placeholder="Mã danh mục"
                    value={dataDanhmuc.ma_danh_muc}
                    onChange={(e) =>
                      setDataDanhmuc((prev) => ({
                        ...prev,
                        ma_danh_muc: e.target.value,
                      }))
                    }
                    className={`py-3 px-5 border rounded-lg ${
                      errors.ma_danh_muc ? "border-red-500" : "border-gray-500"
                    }`}
                  />
                  {errors.ma_danh_muc && (
                    <span className="text-red-500 text-sm mt-1">
                      {errors.ma_danh_muc}
                    </span>
                  )}
                </div>
                <div className="flex flex-col">
                  <input
                    type="text"
                    placeholder="Mô tả"
                    value={dataDanhmuc.mo_ta}
                    onChange={(e) =>
                      setDataDanhmuc((prev) => ({
                        ...prev,
                        mo_ta: e.target.value,
                      }))
                    }
                    className="py-3 px-5 border border-gray-500 rounded-lg"
                  />
                  {/* Nếu muốn validate mo_ta thì thêm tương tự */}
                </div>
              </div>

              <div className="flex flex-col w-[60%]">
                <select
                  value={dataDanhmuc.trang_thai}
                  onChange={(e) =>
                    setDataDanhmuc((prev) => ({
                      ...prev,
                      trang_thai: e.target.value,
                    }))
                  }
                  className={`border rounded-lg px-3 py-3 bg-white ${
                    errors.trang_thai ? "border-red-500" : "border-gray-300"
                  }`}
                >
                  <option value="" disabled>
                    Chọn trạng thái
                  </option>
                  <option value={1}>Hoạt động</option>
                  <option value={0}>Không hoạt động</option>
                </select>
                {errors.trang_thai && (
                  <span className="text-red-500 text-sm mt-1">
                    {errors.trang_thai}
                  </span>
                )}
              </div>

              <OptionDanhMuc
                value={dataDanhmuc.ten_danh_muc}
                setTenDanhMuc={(value) =>
                  setDataDanhmuc((prev) => ({ ...prev, ten_danh_muc: value }))
                }
              />
              {errors.ten_danh_muc && (
                <span className="text-red-500 text-sm mt-1">
                  {errors.ten_danh_muc}
                </span>
              )}
            </div>

            <button
              onClick={handleCreate}
              disabled={isLoading}
              className="py-2 px-7 text-white bg-customBlue rounded-lg mt-4"
            >
              {isLoading
                ? "Đang tải..."
                : modalType === "edit"
                ? "Chỉnh sửa"
                : "Thêm"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default DanhMucAdmin;
