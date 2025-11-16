import { useEffect, useState } from "react";
import { axiosInstance } from "../../../../../../Axios";
import { FaRegUserCircle, FaPhoneAlt } from "react-icons/fa";
import { MdEmail } from "react-icons/md";
import { IoMdArrowRoundBack } from "react-icons/io";

const UserAdminDetail = ({ id, setStep }) => {
  const [dataDetail, setDataDetail] = useState({});
  const [dataHopdong, setDataHopdong] = useState({});
  const [trangthai, setTrangthai] = useState("");
  const [statusColor, setStatusColor] = useState("");
  const formatDate = (dateString) =>
    dateString ? new Date(dateString).toLocaleDateString("vi-VN") : "";

  const statusMapping = {
    da_ky: { text: "Đã ký", color: "text-green-500" },
    chua_ky: { text: "Hết hạn hợp đồng", color: "text-red-500" },
  };

  useEffect(() => {
    const fetchDetail = async () => {
      const res = await axiosInstance.get(`/auth/Detail/${id}`);
      setDataDetail(res.data.data);

      const formattedHopdong = res.data.data.phongTro?.hopdongs
        ? {
            ...res.data.data.phongTro.hopdongs,
            start_date: formatDate(res.data.data.phongTro.hopdongs.start_date),
            end_date: formatDate(res.data.data.phongTro.hopdongs.end_date),
          }
        : null;
      const status = res.data.data.phongTro?.hopdongs.trang_thai;
      const statusInfo = statusMapping[status] || {
        text: "Trạng thái không xác định",
        color: "black",
      };
      setDataHopdong(formattedHopdong);
      setTrangthai(statusInfo.text);
      setStatusColor(statusInfo.color);
    };

    fetchDetail();
  }, [id]);

  return (
    <div className="p-4 h-full">
      {/* Header với nút Back */}
      <div className="flex items-center gap-5 cursor-pointer mb-6">
        <IoMdArrowRoundBack
          size={25}
          className="text-gray-600 hover:text-gray-800 transition-transform duration-300 hover:scale-110"
          onClick={() =>
            setStep((prev) => ({
              ...prev,
              page: 1,
            }))
          }
        />
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
          Thông tin người dùng
        </h2>
      </div>

      {dataDetail && (
        <div className="flex flex-col md:flex-row gap-6 md:gap-10 mb-6">
          <div className="w-full md:w-1/3 bg-white flex flex-col items-center px-4 py-6 rounded-lg shadow-md transition-all duration-300 hover:shadow-lg">
            <div className="relative w-full h-32 mb-16">
              <div className="w-full 2xl:h-32 h-24 bg-gray-400 rounded-t-lg overflow-hidden">
                <FaRegUserCircle className="2xl:w-32 2xl:h-32 h-24 w-24 absolute 2xl:top-[95%] top-[75%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-full text-gray-600" />
              </div>
            </div>
            <div className="text-center">
              <h2 className="text-lg sm:text-xl font-bold text-gray-800">
                {dataDetail.ho_va_ten}
              </h2>
              <div className="2xl:mt-6 mt-2 2xl:space-y-4 space-y-2">
                <p className="flex items-center justify-center gap-3 text-sm sm:text-lg text-gray-700">
                  <FaPhoneAlt
                    size={40}
                    className="p-2 rounded-full border border-gray-500 transition-colors duration-300 hover:bg-gray-100"
                  />
                  {dataDetail.so_dien_thoai}
                </p>
                <p className="flex items-center justify-center gap-3 text-sm sm:text-lg text-gray-700">
                  <MdEmail
                    size={40}
                    className="p-2 rounded-full border border-gray-500 transition-colors duration-300 hover:bg-gray-100"
                  />
                  {dataDetail.email}
                </p>
              </div>
            </div>
          </div>

          {/* Thông tin phòng trọ */}
          {dataDetail.phongTro &&
          Object.keys(dataDetail.phongTro).length > 0 ? (
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md w-full transition-all duration-300 hover:shadow-lg">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">
                Phòng trọ hiện tại
              </h3>
              <div className="flex flex-col md:flex-row gap-4 justify-between">
                <div className="space-y-2">
                  <p className="text-sm sm:text-lg text-gray-700">
                    <span className="font-medium">Mã phòng:</span>{" "}
                    {dataDetail.phongTro?.ma_phong}
                  </p>
                  <p className="text-sm sm:text-lg text-gray-700">
                    <span className="font-medium">Tên phòng:</span>{" "}
                    {dataDetail.phongTro?.ten_phong_tro}
                  </p>
                  <p className="text-sm sm:text-lg text-gray-700">
                    <span className="font-medium">Số lượng người:</span>{" "}
                    {dataDetail.phongTro?.so_luong_nguoi}
                  </p>
                  <p className="text-sm sm:text-lg text-gray-700">
                    <span className="font-medium">Mô tả:</span>{" "}
                    {dataDetail.phongTro?.mo_ta}
                  </p>
                </div>
                <div>
                  <p className="font-medium text-lg sm:text-xl text-gray-800">
                    Thiết bị phòng:
                  </p>
                  <ul className="list-disc pl-6 text-gray-700">
                    {dataDetail.phongTro?.thietbi.map((item, index) => (
                      <li
                        key={index}
                        className="transition-all duration-300 hover:text-gray-900"
                      >
                        {item.ten_thiet_bi}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="flex gap-4 overflow-x-auto mt-6 pb-2">
                {dataDetail.phongTro?.anhChiTiet.map((image, index) => (
                  <img
                    key={index}
                    src={image.image_url}
                    alt={`Room ${index + 1}`}
                    className="w-48 h-48 sm:w-52 sm:h-52 object-cover rounded-lg transition-transform duration-300 hover:scale-105"
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md w-full flex items-center justify-center min-h-[200px] transition-all duration-300 hover:shadow-lg">
              <p className="text-lg sm:text-2xl font-medium text-gray-600">
                Khách hàng chưa có phòng trọ nào
              </p>
            </div>
          )}
        </div>
      )}

      {/* Hợp đồng phòng trọ */}
      <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md min-h-[200px] transition-all duration-300 hover:shadow-lg">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">
          Hợp đồng phòng trọ
        </h3>

        {/* Bảng cho desktop */}
        <div className="hidden md:block">
          {dataHopdong && Object.keys(dataHopdong).length > 0 ? (
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-3">Tên hợp đồng</th>
                  <th className="p-3">Ngày Bắt Đầu</th>
                  <th className="p-3">Ngày kết thúc</th>
                  <th className="p-3">Trạng Thái</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  key={dataHopdong._id}
                  className="border-t hover:bg-gray-50 transition-colors duration-200"
                >
                  <td className="p-3">{dataHopdong.ten_hop_dong}</td>
                  <td className="p-3">{dataHopdong.start_date}</td>
                  <td className="p-3">{dataHopdong.end_date}</td>
                  <td className={`p-3 font-medium ${statusColor}`}>
                    {trangthai}
                  </td>
                </tr>
              </tbody>
            </table>
          ) : (
            <div className="flex items-center justify-center min-h-[200px]">
              <p className="text-lg sm:text-2xl font-medium text-gray-600">
                Khách hàng chưa có ký hợp đồng
              </p>
            </div>
          )}
        </div>

        {/* Card cho mobile */}
        <div className="md:hidden">
          {dataHopdong && Object.keys(dataHopdong).length > 0 ? (
            <div className="border-b pb-4 mb-4 text-sm">
              <p className="py-2">
                <strong>Tên hợp đồng:</strong> {dataHopdong.ten_hop_dong}
              </p>
              <p className="py-2">
                <strong>Ngày Bắt Đầu:</strong> {dataHopdong.start_date}
              </p>
              <p className="py-2">
                <strong>Ngày kết thúc:</strong> {dataHopdong.end_date}
              </p>
              <p className={`py-2 font-medium ${statusColor}`}>
                <strong>Trạng Thái:</strong> {trangthai}
              </p>
            </div>
          ) : (
            <div className="flex items-center justify-center min-h-[200px]">
              <p className="text-lg font-medium text-gray-600">
                Khách hàng chưa có ký hợp đồng
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserAdminDetail;
