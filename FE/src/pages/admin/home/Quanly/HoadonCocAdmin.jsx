import { useDispatch, useSelector } from "react-redux";
import useApiManagerAdmin from "../../../../hook/useApiManagerAdmin";
import SearchBar from "../../../../component/admin/SearchBar";
import {
  CloseModalForm,
  OpenModalForm,
} from "../../../../Store/filterModalForm";
import RoomTable from "../../../../component/admin/RoomTable";
import { useEffect, useState } from "react";
import { axiosInstance } from "../../../../../Axios";

function HoadonCocAdmin() {
  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString("vi-VN");
  const { isOpen } = useSelector((state) => state.ModalForm);
  const [data, setData] = useState("");
  const dispatch = useDispatch();
  const { data: hdCoc, DeleteData } = useApiManagerAdmin("/hoadon");

  const [dsHienThi, setDsHienThi] = useState([]);
  useEffect(() => {
    if (hdCoc) {
      setDsHienThi(hdCoc); // reset về dữ liệu gốc mỗi lần fetch lại
    }
  }, [hdCoc]);

  const headers = [
    { label: "Tên user", key: "ho_va_ten" },
    { label: "Mã phòng", key: "ma_phong" },
    { label: "Mã đơn hàng", key: "ma_don_hang" },
    { label: "Số tiền", key: "so_tien" },
    { label: "Trạng thái", key: "trang_thai" },
    { label: "Ngày chuyển khoản", key: "ngay_chuyen_khoan" },
  ];

  const handleClose = () => {
    dispatch(CloseModalForm());
  };
  const handleDelete = async (value) => {
    await DeleteData(value._id);
  };
  const handleOpenModalEdit = async (value) => {
    dispatch(OpenModalForm({ modalType: "edit", id: value._id }));
    const res = await axiosInstance.get(`/hoadon/detail/${value._id}`);
    setData(res.data);
  };

  const handleUpdateStatus = async (newStatus) => {
    if (!data?._id) return;
    try {
      await axiosInstance.patch(`/hoadon/update-status/${data._id}`, {
        trang_thai: newStatus,
      });

      const updated = {
        ...data,
        trang_thai: newStatus,
        ngay_chuyen_khoan:
          newStatus === "đã thanh toán" ? new Date().toISOString() : data.ngay_chuyen_khoan,
      };
      setData(updated);

      setDsHienThi((prev) =>
        prev.map((item) => (item._id === updated._id ? { ...item, trang_thai: updated.trang_thai } : item))
      );
    } catch (error) {
      console.error("Lỗi cập nhật trạng thái hóa đơn:", error);
    }
  };
  const renderStatus = (status) => {
    return (
      <div>
        {status.trang_thai === "chưa thanh toán" ? (
          <p className="px-2 py-2 text-white text-sm rounded-lg bg-red-500 w-[120px]">
            chưa thanh toán
          </p>
        ) : (
          <p className="px-2 py-2 text-white text-sm rounded-lg bg-green-500 w-[120px]">
            đã thanh toán
          </p>
        )}
      </div>
    );
  };

  const handleSearch = (keyword) => {
    const tuKhoa = keyword.toLowerCase();
    const filtered = hdCoc.filter(
      (item) =>
        item.ma_phong.toLowerCase().includes(tuKhoa) ||
        item.ma_don_hang.toLowerCase().includes(tuKhoa) ||
        item.ho_va_ten?.toLowerCase().includes(tuKhoa) ||
        String(item.so_tien).toLowerCase().includes(tuKhoa)
    );

    setDsHienThi(filtered);
  };

  return (
    <div className="min-h-screen">
      <div className="flex gap-5 ">
        <SearchBar onSearch={handleSearch} />
      </div>
      <RoomTable
        title={"Hóa đơn Cọc"}
        headers={headers}
        displayedRooms={dsHienThi}
        roomsPerPage={10}
        renderStatus={renderStatus}
        handleDelete={handleDelete}
        handleOpenModalEdit={handleOpenModalEdit}
      />
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-xl">
            {/* Header */}
            <div className="text-center">
              <div className="flex justify-center mb-4">
                {data.trang_thai === "chưa thanh toán" ? (
                  <div className="bg-red-100 p-4  rounded-full">
                    <div className="bg-red-500 rounded-full p-3">
                      <svg
                        className="w-5 h-5 stroke-[#fff]"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="3"
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </div>
                  </div>
                ) : (
                  <div className="bg-red-100 rounded-full p-3">
                    <svg
                      className="w-6 h-6 text-green-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                )}
              </div>
              <h2 className="text-2xl font-bold text-gray-800">
                {data.trang_thai === "chưa thanh toán"
                  ? "chưa thanh toán!"
                  : "Thanh toán thành công!"}
              </h2>
            </div>

            {/* Amount and Status */}
            <div className="bg-gray-100 px-5 py-1 rounded-lg mt-10 space-y-5">
              <div className="mt-6 flex justify-between text-gray-600 items-center">
                <span className="text-xl font-semibold">Số tiền</span>
                <span className="text-2xl font-semibold">
                  {data.so_tien} VND
                </span>
              </div>
              <div className="mt-2 flex justify-between items-center">
                <span className="text-xl font-semibold text-gray-600">
                  Trạng thái
                </span>
                <span
                  className={`px-3 py-1 rounded-full ${
                    data.trang_thai === "chưa thanh toán"
                      ? " text-red-500 bg-red-100"
                      : "text-green-500 bg-green-100"
                  }`}
                >
                  {data.trang_thai}
                </span>
              </div>
              <span className="w-full h-[1px] bg-gray-500 block"></span>
              {/* Transaction Details */}
              <div className="mt-6">
                <h3 className="text-xl font-bold text-gray-800">
                  Thông tin hóa đơn
                </h3>
                <div className="flex justify-between mt-3">
                  <div className="text-gray-500 space-y-2">
                    <p className="font-bold">Tên user:</p>
                    <p className="font-bold">Mã phòng:</p>
                    <p className="font-bold">Mã đơn hàng:</p>
                    <p className="font-bold">Ngày chuyển khoản:</p>
                    <p className="font-bold">Nội dung:</p>
                  </div>
                  <div className="text-right text space-y-2">
                    <p className="font-semibold">{data.ho_va_ten}</p>
                    <p className="font-semibold">{data.ma_phong}</p>
                    <p className="font-semibold">{data.ma_don_hang}</p>
                    <p className="font-semibold">
                      {formatDate(data.ngay_chuyen_khoan)}
                    </p>
                    <p className="font-semibold">{data.noi_dung}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Close Button */}
            <div className="mt-6 flex justify-center">
              <button
                onClick={handleClose}
                className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300"
              >
                Close
              </button>
            <div className="ml-3 flex gap-3">
              {data.trang_thai !== "đã thanh toán" ? (
                <button
                  onClick={() => handleUpdateStatus("đã thanh toán")}
                  className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
                >
                  Đánh dấu đã thanh toán
                </button>
              ) : (
                <button
                  onClick={() => handleUpdateStatus("chưa thanh toán")}
                  className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
                >
                  Đánh dấu chưa thanh toán
                </button>
              )}
            </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default HoadonCocAdmin;
