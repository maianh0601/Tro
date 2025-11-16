import { useEffect, useState } from "react";
import useApiManagerAdmin from "../../../../hook/useApiManagerAdmin";
import RoomTable from "../../../../component/admin/RoomTable";
import SearchBar from "../../../../component/admin/SearchBar";
import { useDispatch, useSelector } from "react-redux";
import {
  CloseModalForm,
  OpenModalForm,
} from "../../../../Store/filterModalForm";

function DichvuAdmin() {
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const { modalType, idModal, isOpen } = useSelector(
    (state) => state.ModalForm
  );
  const [data, setData] = useState({
    tien_dien: "",
    tien_nuoc: "",
    tien_wifi: "",
  });

  // State quản lý lỗi
  const [errors, setErrors] = useState({});

  const {
    data: dichvu,
    createData,
    DeleteData,
    UpdateData,
  } = useApiManagerAdmin("/dich-vu");

  const headers = [
    { label: "ID", key: "_id" },
    { label: "Tiền điện", key: "tien_dien" },
    { label: "Tiền nước", key: "tien_nuoc" },
    { label: "Tiền wifi", key: "tien_wifi" },
  ];

  const validate = () => {
    const newErrors = {};
    let isValid = true;

    // Kiểm tra tien_dien
    if (!data.tien_dien.toString().trim()) {
      newErrors.tien_dien = "Tiền điện không được để trống";
      isValid = false;
    } else if (isNaN(data.tien_dien) || Number(data.tien_dien) < 0) {
      newErrors.tien_dien = "Tiền điện phải là số dương hợp lệ";
      isValid = false;
    }

    // Kiểm tra tien_nuoc
    if (!data.tien_nuoc.toString().trim()) {
      newErrors.tien_nuoc = "Tiền nước không được để trống";
      isValid = false;
    } else if (isNaN(data.tien_nuoc) || Number(data.tien_nuoc) < 0) {
      newErrors.tien_nuoc = "Tiền nước phải là số dương hợp lệ";
      isValid = false;
    }

    // Kiểm tra tien_wifi
    if (!data.tien_wifi.toString().trim()) {
      newErrors.tien_wifi = "Tiền wifi không được để trống";
      isValid = false;
    } else if (isNaN(data.tien_wifi) || Number(data.tien_wifi) < 0) {
      newErrors.tien_wifi = "Tiền wifi phải là số dương hợp lệ";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleDelete = async (room) => {
    await DeleteData(room._id);
  };

  const handleCreate = async () => {
    setIsLoading(true);
    try {
      if (!validate()) return; // Nếu lỗi thì không chạy tiếp

      if (modalType === "create") {
        await createData({
          tien_dien: Number(data.tien_dien),
          tien_nuoc: Number(data.tien_nuoc),
          tien_wifi: Number(data.tien_wifi),
        });
      } else if (modalType === "edit") {
        await UpdateData(idModal, {
          tien_dien: Number(data.tien_dien),
          tien_nuoc: Number(data.tien_nuoc),
          tien_wifi: Number(data.tien_wifi),
        });
      }
      setData({
        tien_dien: "",
        tien_nuoc: "",
        tien_wifi: "",
      });
      setErrors({});
      dispatch(CloseModalForm());
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModalEdit = async (room) => {
    setData({
      tien_dien: room.tien_dien.toString(),
      tien_nuoc: room.tien_nuoc.toString(),
      tien_wifi: room.tien_wifi.toString(),
    });
    setErrors({});
    dispatch(OpenModalForm({ modalType: "edit", id: room._id ?? null }));
  };

  const handleClose = async () => {
    dispatch(CloseModalForm());
    setData({
      tien_dien: "",
      tien_nuoc: "",
      tien_wifi: "",
    });
    setErrors({});
  };

  const [dsHienThi, setDsHienThi] = useState([]);
  useEffect(() => {
    if (dichvu) {
      setDsHienThi(dichvu); // reset về dữ liệu gốc mỗi lần fetch lại
    }
  }, [dichvu]);

  const handleSearch = (keyword) => {
    const tuKhoa = keyword.toLowerCase();
    const filtered = dichvu.filter(
      (item) =>
        String(item.tien_dien).toLowerCase().includes(tuKhoa) ||
        String(item.tien_nuoc).toLowerCase().includes(tuKhoa) ||
        String(item.tien_wifi).toLowerCase().includes(tuKhoa)
    );
    setDsHienThi(filtered);
  };

  const handleDeleteAll = () => {};

  return (
    <div className="min-h-screen">
      <div className="flex gap-5 ">
        <SearchBar onSearch={handleSearch} />
        <button
          className="bg-customBlue text-white p-3 rounded-lg hover:bg-sky-600"
          onClick={() => {
            dispatch(OpenModalForm({ modalType: "create", id: null }));
          }}
        >
          Thêm dịch vụ
        </button>
        <button
          className="bg-red-600 text-white p-3 rounded-lg hover:bg-sky-600"
          onClick={handleDeleteAll}
        >
          Xóa tất cả
        </button>
      </div>
      <RoomTable
        title={"Dịch vụ"}
        headers={headers}
        displayedRooms={dsHienThi}
        roomsPerPage={5}
        handleDelete={handleDelete}
        handleOpenModalEdit={handleOpenModalEdit}
      />
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 ">
          <div className="bg-white rounded-lg shadow-lg p-6 min-w-[300px] w-1/4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold mb-4">
                {modalType === "edit" ? "Chỉnh sửa dịch vụ" : "Thêm dịch vụ"}
              </h2>
              <button
                className="bg-red-500 text-white p-2 rounded-lg"
                onClick={handleClose}
              >
                Close
              </button>
            </div>
            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
              <div>
                <p className="text-lg">Tiền điện</p>
                <input
                  type="number"
                  className={`py-2 px-3 border rounded-lg w-full outline-none ${
                    errors.tien_dien ? "border-red-500" : "border-gray-500"
                  }`}
                  placeholder="Tiền điện"
                  value={data.tien_dien}
                  onChange={(e) =>
                    setData((prevData) => ({
                      ...prevData,
                      tien_dien: e.target.value,
                    }))
                  }
                />
                {errors.tien_dien && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.tien_dien}
                  </p>
                )}
              </div>
              <div>
                <p className="text-lg">Tiền nước</p>
                <input
                  type="number"
                  className={`py-2 px-3 border rounded-lg w-full outline-none ${
                    errors.tien_nuoc ? "border-red-500" : "border-gray-500"
                  }`}
                  placeholder="Tiền nước"
                  value={data.tien_nuoc}
                  onChange={(e) =>
                    setData((prevData) => ({
                      ...prevData,
                      tien_nuoc: e.target.value,
                    }))
                  }
                />
                {errors.tien_nuoc && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.tien_nuoc}
                  </p>
                )}
              </div>
              <div>
                <p className="text-lg">Tiền wifi</p>
                <input
                  type="number"
                  className={`py-2 px-3 border rounded-lg w-full outline-none ${
                    errors.tien_wifi ? "border-red-500" : "border-gray-500"
                  }`}
                  placeholder="Tiền wifi"
                  value={data.tien_wifi}
                  onChange={(e) =>
                    setData((prevData) => ({
                      ...prevData,
                      tien_wifi: e.target.value,
                    }))
                  }
                />
                {errors.tien_wifi && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.tien_wifi}
                  </p>
                )}
              </div>
            </form>
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

export default DichvuAdmin;
