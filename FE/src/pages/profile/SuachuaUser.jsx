import { useEffect, useState } from "react";
import { useMasking } from "../../hook/useMasking";
import { FaEdit } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import { OpenModalForm } from "../../Store/filterModalForm";
import { useDispatch, useSelector } from "react-redux";
import { openConfirmModal } from "../../Store/filterConfirmModal";
import { axiosInstance } from "../../../Axios";
import ModalUser from "../../component/User/ModalUser";
import Spinner from "../../component/Loading";
import ModalConFirm from "../../component/ModalConfirm";
import { connectSocket } from "../../../Socket";

function SuachuaUser() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const { formatDate } = useMasking();
  const dispatch = useDispatch();
  const { isOpen } = useSelector((state) => state.ModalForm);
  const [repairData, setRepairData] = useState({
    maphong: "",
    lydo: "",
  });
   const [socket, setSocket] = useState(null);
  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get("/sua_chua/GetById");
      setData(res.data.suaChua);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const s = connectSocket();
    console.log("Socket connected:", s.connected); // Kiểm tra trạng thái kết nối
    setSocket(s);
    return () => {
      s.disconnect();
    };

  }, []);
  useEffect(() => {
    if (!socket) return;

    const handleNotification = () => {
      console.log("Nhận được tín hiệu cập nhật từ Admin");
      fetchData(); // Gọi lại API để cập nhật UI
    };

    socket.on("cap_nhat_suachua", handleNotification);
    return () => {
      socket.off("cap_nhat_suachua", handleNotification);
    };
  }, [socket]);
  useEffect(() => {
    if (!isOpen) {
      setRepairData((prev) => ({
        ...prev,
        maphong: "",
        lydo: "",
      }));
    }
  }, [isOpen]);
  const handleUpdateModal = (item) => {
    const id = item._id;
    setRepairData((prev) => ({
      ...prev,
      maphong: item.ma_phong,
      lydo: item.issue,
    }));
    dispatch(OpenModalForm({ modalType: "RepairEdit", id }));
  };

  const handleConfirmModal = (id) => {
    dispatch(openConfirmModal({ modalType: "Repair", id }));
  };

  if (loading) {
    <Spinner />;
  }
  return (
    <div className="w-full">
      <div className="w-full">
        {/* Header - Ẩn trên mobile, hiển thị trên md */}
        <table className="w-full divide-y divide-gray-200">
          <thead className="hidden md:table-header-group bg-customBlue text-white">
            <tr>
              <th className="px-6 py-3 text-center text-sm md:text-base lg:text-xl font-medium">
                Ngày gửi
              </th>
              <th className="px-6 py-3 text-center text-sm md:text-base lg:text-xl font-medium">
                Mô tả
              </th>
              <th className="px-6 py-3 text-center text-sm md:text-base lg:text-xl font-medium">
                Trạng thái xử lý
              </th>
              <th className="px-6 py-3 text-center text-sm md:text-base lg:text-xl font-medium">
                Xét duyệt
              </th>
              <th className="px-6 py-3 text-center text-sm md:text-base lg:text-xl font-medium">
                Hành động
              </th>
            </tr>
          </thead>

          {/* Body */}
          <tbody className="bg-white divide-y divide-gray-200">
            {data.length > 0 ? (
              data.map((item) => (
                <tr
                  key={item._id}
                  className="block md:table-row hover:bg-gray-100 transition-colors duration-200"
                >
                  {/* Mobile: Card layout */}
                  <td className="block md:hidden p-4 border-b">
                    <div className="flex flex-col gap-3">
                      <div>
                        <span className="font-medium">Ngày gửi:</span>{" "}
                        {formatDate(item.createdAt)}
                      </div>
                      <div>
                        <span className="font-medium">Mô tả:</span> {item.issue}
                      </div>
                      <div>
                        <span className="font-medium">Trạng thái:</span>
                        <span
                          className={`ml-2 px-3 py-1 text-xs font-medium rounded-full text-white ${
                            item.status === "Chờ xử lý"
                              ? "bg-red-500"
                              : "bg-green-500"
                          }`}
                        >
                          {item.status}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium">Xét duyệt:</span>
                        <span
                          className={`ml-2 px-3 py-1 text-xs font-medium rounded-full text-white ${
                            item.approved === "Chưa phê duyệt"
                              ? "bg-red-500"
                              : "bg-green-500"
                          }`}
                        >
                          {item.approved}
                        </span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-medium">Hành động:</span>
                        <div className="flex gap-4">
                          <FaEdit
                            size={18}
                            onClick={() => handleUpdateModal(item)}
                            className="cursor-pointer hover:text-blue-500"
                            aria-label="Chỉnh sửa yêu cầu"
                          />
                          <MdDelete
                            size={18}
                            color="red"
                            onClick={() => handleConfirmModal(item._id)}
                            className="cursor-pointer hover:text-red-600"
                            aria-label="Xóa yêu cầu"
                          />
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Desktop: Table layout */}
                  <td className="hidden md:table-cell px-6 py-4 text-sm md:text-base text-gray-700 text-center">
                    {formatDate(item.createdAt)}
                  </td>
                  <td className="hidden md:table-cell px-6 py-4 text-sm md:text-base text-gray-700 text-center">
                    {item.issue}
                  </td>
                  <td className="hidden md:table-cell px-6 py-4 text-center">
                    <span
                      className={`px-4 py-1 text-xs md:text-sm font-medium rounded-full text-white ${
                        item.status === "Chờ xử lý"
                          ? "bg-red-500"
                          : "bg-green-500"
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="hidden md:table-cell px-6 py-4 text-center">
                    <span
                      className={`px-4 py-1 text-xs md:text-sm font-medium rounded-full text-white ${
                        item.approved === "Chưa phê duyệt"
                          ? "bg-red-500"
                          : "bg-green-500"
                      }`}
                    >
                      {item.approved}
                    </span>
                  </td>
                  <td className="hidden md:table-cell px-6 py-4 text-center">
                    <div className="flex justify-center items-center gap-4">
                      <FaEdit
                        size={18}
                        onClick={() => handleUpdateModal(item)}
                        className="cursor-pointer hover:text-blue-500"
                        aria-label="Chỉnh sửa yêu cầu"
                      />
                      <MdDelete
                        size={18}
                        color="red"
                        onClick={() => handleConfirmModal(item._id)}
                        className="cursor-pointer hover:text-red-600"
                        aria-label="Xóa yêu cầu"
                      />
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={5}
                  className="text-center text-sm md:text-xl font-semibold py-4 block md:table-cell"
                >
                  Chưa có yêu cầu sửa chữa nào
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Nút Gửi yêu cầu mới */}
      <button
        onClick={() => dispatch(OpenModalForm({ modalType: "Repair" }))}
        className="mt-6 w-full sm:w-auto px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all duration-200 text-sm md:text-base"
      >
        Gửi yêu cầu mới
      </button>
      {isOpen && <ModalUser reload={fetchData} repairData={repairData} />}
      <ModalConFirm reload={fetchData} />
    </div>
  );
}

export default SuachuaUser;
