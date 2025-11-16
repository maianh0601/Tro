import { useDispatch, useSelector } from "react-redux";
import useApiManagerAdmin from "../../../../hook/useApiManagerAdmin";
import SearchBar from "../../../../component/admin/SearchBar";
import {
  CloseModalForm,
  OpenModalForm,
} from "../../../../Store/filterModalForm";
import RoomTable from "../../../../component/admin/RoomTable";
import { useEffect, useState } from "react";

function HopDongAdmin() {
  const { modalType, idModal, isOpen } = useSelector(
    (state) => state.ModalForm
  );
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState({
    ma_phong: "",
    id_users: "",
    start_date: "",
    end_date: "",
    tien_coc: 0,
    trang_thai: "",
    file_hop_dong: "",
  });

  const dispatch = useDispatch();
  const {
    data: hopdong,
    UpdateData,
    DeleteData,
  } = useApiManagerAdmin("/hopdong");

  const [dsHienThi, setDsHienThi] = useState([]);

  useEffect(() => {
    if (hopdong) {
      setDsHienThi(hopdong);
    }
  }, [hopdong]);

  const headers = [
    { label: "Mã phòng", key: "ma_phong" },
    { label: "User", key: "ho_va_ten" },
    { label: "Ngày gia hạn", key: "start_date" },
    { label: "Ngày hết hạn", key: "end_date" },
    { label: "Tiền thuê", key: "tien_coc" },
    { label: "Trạng thái", key: "trang_thai" },
  ];

  const handleUpdate = async () => {
    setIsLoading(true);
    try {
      if (modalType === "edit") {
        await UpdateData(idModal, data);
      }
      handleClose();
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (value) => {
    await DeleteData(value._id);
  };

  const handleOpenModalEdit = async (room) => {
    dispatch(OpenModalForm({ modalType: "edit", id: room._id ?? null }));
    setData({
      ma_phong: room.ma_phong,
      id_users: room.id_users,
      ho_va_ten: room.ho_va_ten,
      start_date: room.start_date,
      end_date: room.end_date,
      tien_coc: room.tien_coc,
      trang_thai: room.trang_thai,
      file_hop_dong: room.file_hop_dong,
    });
  };

  const handleClose = () => {
    dispatch(CloseModalForm());
    setData({
      ma_phong: "",
      id_users: "",
      start_date: "",
      end_date: "",
      tien_coc: 0,
      trang_thai: "",
      file_hop_dong: "",
    });
  };

  const renderStatus = (status) => {
    return (
      <div>
        {status.trang_thai === "chua_ky" ? (
          <p className="px-2 py-2 text-white text-sm rounded-lg bg-red-500 w-[120px]">
            Chưa ký
          </p>
        ) : status.trang_thai === "da_ky" ? (
          <p className="px-2 py-2 text-white text-sm rounded-lg bg-green-500 w-[120px]">
            Đã ký
          </p>
        ) : status.trang_thai === "het_han" ? (
          <p className="px-2 py-2 text-white text-sm rounded-lg bg-yellow-500 w-[120px]">
            Hết hạn
          </p>
        ) : (
          <p className="px-2 py-2 text-white text-sm rounded-lg bg-blue-500 w-[120px]">
            Yêu cầu hủy hợp đồng
          </p>
        )}
      </div>
    );
  };

  const handleSearch = (keyword) => {
    const tuKhoa = keyword.toLowerCase();
    const filtered = hopdong.filter(
      (item) =>
        item.ma_phong.toLowerCase().includes(tuKhoa) ||
        item.ho_va_ten.toLowerCase().includes(tuKhoa) ||
        String(item.tien_coc).toLowerCase().includes(tuKhoa)
    );

    setDsHienThi(filtered);
  };
  return (
    <div className="min-h-screen">
      <div className="flex gap-5 ">
        <SearchBar onSearch={handleSearch} />
      </div>
      <RoomTable
        title={"Hơp đồng"}
        headers={headers}
        displayedRooms={dsHienThi}
        roomsPerPage={10}
        renderStatus={renderStatus}
        handleDelete={handleDelete}
        handleOpenModalEdit={handleOpenModalEdit}
      />
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-30 ">
          <div className="bg-white rounded-lg shadow-lg p-6 min-w-[300px] w-1/3">
            <div className="flex justify-between items-center w-full">
              <h2 className="text-xl font-semibold mb-4">
                {modalType === "edit" ? "Chỉnh sửa hợp đồng" : ""}
              </h2>
              <button
                className="bg-red-500 text-white p-2 rounded-lg"
                onClick={handleClose}
              >
                Close
              </button>
            </div>
            <form className="space-y-4">
              <div className="flex gap-5">
                <InputField
                  label="Mã phòng"
                  name="ma_phong"
                  value={data.ma_phong}
                  onChange={(e) =>
                    setData((setPrev) => ({
                      ...setPrev,
                      ma_phong: e.target.value,
                    }))
                  }
                />
                <InputField
                  label="User"
                  name="ho_va_ten"
                  value={data.ho_va_ten}
                  onChange={(e) =>
                    setData((setPrev) => ({
                      ...setPrev,
                      ho_va_ten: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="flex gap-5">
                <label className="block font-semibold">Ngày gia hạn:</label>
                <input
                  type="date"
                  value={
                    data.start_date
                      ? new Date(data.start_date).toISOString().substring(0, 10)
                      : ""
                  }
                  onChange={(e) =>
                    setData({
                      ...data,
                      start_date: e.target.value,
                    })
                  }
                />

                <label className="block font-semibold">Ngày hết hạn:</label>
                <input
                  type="date"
                  value={
                    data.end_date
                      ? new Date(data.end_date).toISOString().substring(0, 10)
                      : ""
                  }
                  onChange={(e) =>
                    setData({
                      ...data,
                      end_date: e.target.value,
                    })
                  }
                />
              </div>
              <div className="flex gap-5 w-full">
                <InputField
                  label="Tiền thuê"
                  name="tien_coc"
                  value={data.tien_coc}
                  onChange={(e) =>
                    setData((setPrev) => ({
                      ...setPrev,
                      tien_coc: e.target.value,
                    }))
                  }
                />
                <a
                  href={data.file_hop_dong}
                  download="hopdong.pdf"
                  className="text-blue-500 underline mt-2 block "
                >
                  xem file hợp đồng
                </a>
              </div>

              <div>
                <select
                  label="Trạng Thái"
                  name="trang_thai"
                  value={data.trang_thai}
                  onChange={(e) =>
                    setData((prevData) => ({
                      ...prevData,
                      trang_thai: e.target.value,
                    }))
                  }
                  className="w-full border-gray-500 border p-1"
                >
                  <option value="chua_ky">Chưa ký</option>
                  <option value="da_ky">Đã ký</option>
                  <option value="het_han">Hết hạn</option>
                  <option value="yeu_cau_huy_hop_dong">
                    Yêu cầu hủy hợp đồng
                  </option>
                </select>
              </div>
            </form>
            <button
              onClick={handleUpdate}
              disabled={isLoading}
              className="mt-10 py-2 px-10 bg-customBlue rounded-lg text-white"
            >
              {isLoading
                ? "Đang tải "
                : modalType === "edit"
                ? "Chỉnh sửa"
                : "Tạo"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
const InputField = ({
  label,
  name,
  type = "text",
  value,
  onChange,
  disabled,
}) => (
  <div className="w-full">
    <label className="block font-semibold">{label}:</label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      disabled={disabled}
      className="w-full border p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
  </div>
);

export default HopDongAdmin;
