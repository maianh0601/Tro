import { useEffect, useState } from "react";
import SearchBar from "../../../../component/admin/SearchBar";
import RoomTable from "../../../../component/admin/RoomTable";
import { usePhongTro } from "../../../../Context/PhongTroContext";
import useApiManagerAdmin from "../../../../hook/useApiManagerAdmin";
import { useDispatch, useSelector } from "react-redux";
import {
  CloseModalForm,
  OpenModalForm,
} from "../../../../Store/filterModalForm";

function ThietBiAdmin() {
  const [isLoading, setIsLoading] = useState(false);
  const [dataThietbi, setDataThietbi] = useState({
    ma_phong: "",
    ten_thiet_bi: "",
    so_luong_thiet_bi: "",
    trang_thai: "",
  });
  const [errors, setErrors] = useState({});
  const { phongTro } = usePhongTro();
  const { modalType, idModal, isOpen } = useSelector(
    (state) => state.ModalForm
  );
  const dispatch = useDispatch();
  const {
    data: thietBi,
    createData,
    DeleteData,
    DeleteAllData,
    UpdateData,
    fetchData,
  } = useApiManagerAdmin("/thiet-bi");

  useEffect(() => {
    fetchData();
  }, []);

  const [dsHienThi, setDsHienThi] = useState([]);
  useEffect(() => {
    if (thietBi) {
      setDsHienThi(thietBi);
    }
  }, [thietBi]);

  const handleSearch = (keyword) => {
    const tuKhoa = keyword.toLowerCase();
    const filtered = thietBi.filter(
      (item) =>
        item.ma_phong.toLowerCase().includes(tuKhoa) ||
        item.ten_thiet_bi.toLowerCase().includes(tuKhoa) ||
        String(item.so_luong_thiet_bi).toLowerCase().includes(tuKhoa)
    );
    setDsHienThi(filtered);
  };

  const headers = [
    { label: "Mã phòng", key: "ma_phong" },
    { label: "Tên thiết bị", key: "ten_thiet_bi" },
    { label: "Số lượng thiết bị", key: "so_luong_thiet_bi" },
    { label: "Trạng thái", key: "trang_thai" },
  ];

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

  const resetData = () => {
    setDataThietbi({
      ma_phong: "",
      ten_thiet_bi: "",
      so_luong_thiet_bi: "",
      trang_thai: "",
    });
    setErrors({});
    dispatch(CloseModalForm());
  };

  const validate = () => {
    const newErrors = {};
    if (!dataThietbi.ma_phong) newErrors.ma_phong = "Vui lòng chọn mã phòng.";
    if (!dataThietbi.ten_thiet_bi)
      newErrors.ten_thiet_bi = "Vui lòng chọn thiết bị.";

    if (
      dataThietbi.so_luong_thiet_bi === "" ||
      Number(dataThietbi.so_luong_thiet_bi) <= 0
    ) {
      newErrors.so_luong_thiet_bi = "Số lượng phải lớn hơn 0.";
    }

    if (dataThietbi.trang_thai === "")
      newErrors.trang_thai = "Vui lòng chọn trạng thái.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreate = async () => {
    setIsLoading(true);
    try {
      if (!validate()) return;
      if (modalType === "create") {
        await createData(dataThietbi);
      } else if (modalType === "edit") {
        await UpdateData(idModal, dataThietbi);
      }
      resetData();
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModalEdit = (room) => {
    setDataThietbi({
      ma_phong: room.ma_phong,
      ten_thiet_bi: room.ten_thiet_bi,
      so_luong_thiet_bi: room.so_luong_thiet_bi,
      trang_thai: room.trang_thai,
    });
    dispatch(OpenModalForm({ modalType: "edit", id: room._id ?? null }));
  };

  const handleDeleteAll = async () => {
    await DeleteAllData();
  };

  const handleDelete = async (room) => {
    await DeleteData(room._id);
  };

  const handleUpdateTrangThai = async (id, value) => {
    await UpdateData(id, { trang_thai: value });
  };

  return (
    <div>
      <div className="flex gap-5 ">
        <SearchBar onSearch={handleSearch} />
        <button
          className="bg-customBlue text-white p-3 rounded-lg hover:bg-sky-600"
          onClick={() =>
            dispatch(OpenModalForm({ modalType: "create", id: null }))
          }
        >
          Thêm thiết bị
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
        title={"Thiết bị"}
        displayedRooms={dsHienThi}
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
                {modalType === "create"
                  ? "Thêm thiết bị"
                  : "Chỉnh sửa thiết bị"}
              </h2>
              <button
                className="bg-red-500 text-white p-2 rounded-lg"
                onClick={resetData}
              >
                Close
              </button>
            </div>

            <div className="space-y-5 mt-4">
              <div className="flex gap-5">
                <div className="w-full">
                  <select
                    className={`border py-3 px-5 rounded-md w-full ${
                      errors.ma_phong ? "border-red-500" : "border-gray-500"
                    }`}
                    onChange={(e) =>
                      setDataThietbi((prev) => ({
                        ...prev,
                        ma_phong: e.target.value,
                      }))
                    }
                    value={dataThietbi.ma_phong}
                  >
                    <option value="">Chọn mã phòng</option>
                    {phongTro.map((dm) => (
                      <option key={dm.ma_phong} value={dm.ma_phong}>
                        {dm.ma_phong}
                      </option>
                    ))}
                  </select>
                  {errors.ma_phong && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.ma_phong}
                    </p>
                  )}
                </div>

                <div className="w-full">
                  <select
                    className={`border py-3 px-5 rounded-md w-full ${
                      errors.ten_thiet_bi ? "border-red-500" : "border-gray-500"
                    }`}
                    onChange={(e) =>
                      setDataThietbi((prev) => ({
                        ...prev,
                        ten_thiet_bi: e.target.value,
                      }))
                    }
                    value={dataThietbi.ten_thiet_bi}
                  >
                    <option value="">Chọn thiết bị</option>
                    <option value="Quạt hơi nước">Quạt hơi nước</option>
                    <option value="Điều hòa">Điều hòa</option>
                    <option value="Tủ lạnh">Tủ lạnh</option>
                    <option value="Máy giặt">Máy giặt</option>
                    <option value="Bình nóng lạnh">Bình nóng lạnh</option>
                    <option value="Bếp gas">Bếp gas</option>
                    <option value="Lò vi sóng">Lò vi sóng</option>
                    <option value="Nồi cơm điện">Nồi cơm điện</option>
                    <option value="Ấm đun nước">Ấm đun nước</option>
                    <option value="Máy lọc nước">Máy lọc nước</option>
                    <option value="Tủ quần áo">Tủ quần áo</option>
                    <option value="Giường">Giường</option>
                    <option value="Bàn ghế">Bàn ghế</option>
                    <option value="Kệ sách">Kệ sách</option>
                    <option value="Đèn ngủ">Đèn ngủ</option>
                    <option value="Tivi">Tivi</option>
                    <option value="Wifi">Wifi</option>
                    <option value="Loa Bluetooth">Loa Bluetooth</option>
                    <option value="Rèm cửa">Rèm cửa</option>
                    <option value="Ban công">Ban công</option>
                    <option value="Máy chiếu">Máy chiếu</option>
                  </select>
                  {errors.ten_thiet_bi && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.ten_thiet_bi}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <input
                  type="number"
                  min={0}
                  placeholder="Số lượng thiết bị"
                  className={`py-3 px-5 border rounded-lg w-full ${
                    errors.so_luong_thiet_bi
                      ? "border-red-500"
                      : "border-gray-500"
                  }`}
                  onChange={(e) =>
                    setDataThietbi((prev) => ({
                      ...prev,
                      so_luong_thiet_bi: e.target.value,
                    }))
                  }
                  value={dataThietbi.so_luong_thiet_bi}
                />
                {errors.so_luong_thiet_bi && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.so_luong_thiet_bi}
                  </p>
                )}
              </div>

              <div>
                <select
                  className={`border py-3 px-5 rounded-md w-full ${
                    errors.trang_thai ? "border-red-500" : "border-gray-500"
                  }`}
                  onChange={(e) =>
                    setDataThietbi((prev) => ({
                      ...prev,
                      trang_thai: e.target.value,
                    }))
                  }
                  value={dataThietbi.trang_thai}
                >
                  <option value="">Chọn trạng thái</option>
                  <option value={1}>Hoạt động</option>
                  <option value={0}>Không hoạt động</option>
                </select>
                {errors.trang_thai && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.trang_thai}
                  </p>
                )}
              </div>
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

export default ThietBiAdmin;
