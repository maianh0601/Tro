import { useEffect, useState } from "react";
import SearchBar from "../../../../component/admin/SearchBar";
import RoomTable from "../../../../component/admin/RoomTable";
import useApiManagerAdmin from "../../../../hook/useApiManagerAdmin";

function YeuThichAdmin() {
  const headers = [
    { label: "Mã phòng", key: "ma_phong" },
    { label: "Tên tài khoản", key: "username" },
  ];
  const { data: yeuthich, DeleteData } = useApiManagerAdmin("/yeu-thich");

  const [dsHienThi, setDsHienThi] = useState([]);
  useEffect(() => {
    if (yeuthich) {
      setDsHienThi(yeuthich);
    }
  }, [yeuthich]);
  const handleSearch = (keyword) => {
    const tuKhoa = keyword.toLowerCase();
    const filtered = yeuthich.filter(
      (item) =>
        item.username.toLowerCase().includes(tuKhoa) ||
        item.ma_phong.toLowerCase().includes(tuKhoa)
    );
    setDsHienThi(filtered);
  };

  const handleDelete = async (room) => {
    await DeleteData(room.id_user);
  };
  return (
    <div>
      <div className="flex gap-5 ">
        <SearchBar onSearch={handleSearch} />
      </div>
      <RoomTable
        title={"Yêu thích"}
        headers={headers}
        displayedRooms={dsHienThi}
        roomsPerPage={5}
        handleDelete={handleDelete}
      />
    </div>
  );
}

export default YeuThichAdmin;
