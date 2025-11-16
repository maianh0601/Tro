import RoomTable from "../../../../component/admin/RoomTable";
import useApiManagerAdmin from "../../../../hook/useApiManagerAdmin";
import SearchBar from "../../../../component/admin/SearchBar";
import { axiosInstance } from "../../../../../Axios";
import { connectSocket } from "../../../../../Socket";
import { useEffect, useState } from "react";

function SuachuaAdmin() {
  const {
    data: suachua,
    DeleteData,
    fetchData,
  } = useApiManagerAdmin("/sua_chua");

  const [dsHienThi, setDsHienThi] = useState([]);

  useEffect(() => {
    if (suachua) {
      setDsHienThi(suachua);
    }
  }, [suachua]);

  const [socket, setSocket] = useState(null);
  useEffect(() => {
    const s = connectSocket();
    console.log(s);
    setSocket(s);

    return () => {
      s.disconnect();
    };
  }, []);
  const headers = [
    { label: "Tên", key: "userName" },
    { label: "Mã phòng", key: "ma_phong" },
    { label: "Lý do", key: "issue" },
    { label: "Trạng thái", key: "status" },
    { label: "Phê duyệt", key: "approved" },
    { label: "Ngày báo cáo", key: "createdAt" },
  ];

  const handleUpdateTrangThai = async (status, value) => {
    await axiosInstance.post(`/sua_chua/UpdateStatus/${status._id}`, {
      status: value,
    });
    socket.emit("notification_Admin", { payload: { id_user: status.userId } });
    fetchData();
  };

  const handleDelete = async (room) => {
    await DeleteData(room._id);
  };
  const renderStatus = (status) => {
    return (
      <select
        value={status.status}
        className="p-1 border rounded"
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

  return (
    <div className="min-h-screen">
      <div className="flex gap-5 ">
        <SearchBar onSearch={handleSearch} />
      </div>
      <RoomTable
        title={"Sửa chữa"}
        headers={headers}
        displayedRooms={dsHienThi}
        roomsPerPage={5}
        renderStatus={renderStatus}
        handleDelete={handleDelete}
        // handleOpenModalEdit={handleOpenModalEdit}
      />
    </div>
  );
}

export default SuachuaAdmin;
