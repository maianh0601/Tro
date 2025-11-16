import { useEffect, useState } from "react";

import UserAdminDetail from "./UserAdminDetail";
import SearchBar from "../../../../../component/admin/SearchBar";
import RoomTable from "../../../../../component/admin/RoomTable";
import useApiManagerAdmin from "../../../../../hook/useApiManagerAdmin";

function UserAdmin() {
  const [step, setStep] = useState({
    page: 1,
    id: "",
  });

  const { data: user, DeleteData } = useApiManagerAdmin("/auth");
  const [dsHienThi, setDsHienThi] = useState([]);
  useEffect(() => {
    if (user) {
      setDsHienThi(user); // reset về dữ liệu gốc mỗi lần fetch lại
    }
  }, [user]);

  const handleSearch = (keyword) => {
    const tuKhoa = keyword.toLowerCase();
    const filtered = user.filter(
      (item) =>
        item.username.toLowerCase().includes(tuKhoa) ||
        item.ho_va_ten.toLowerCase().includes(tuKhoa) ||
        item.email.toLowerCase().includes(tuKhoa) ||
        item.que_quan.toLowerCase().includes(tuKhoa) ||
        String(item.so_dien_thoai).toLowerCase().includes(tuKhoa)
    );
    setDsHienThi(filtered);
  };

  const headers = [
    { label: "UserName", key: "username" },
    { label: "Họ và tên", key: "ho_va_ten" },
    { label: "Email", key: "email" },
    { label: "Ngày sinh", key: "ngay_sinh" },
    { label: "Quê quán", key: "que_quan" },
    { label: "Số điện thoại", key: "so_dien_thoai" },
  ];
  const handleDelete = async (value) => {
    await DeleteData(value._id);
  };
  return (
    <div>
      <SearchBar onSearch={handleSearch} />
      {step.page === 1 && (
        <RoomTable
          headers={headers}
          displayedRooms={dsHienThi}
          roomsPerPage={10}
          title={"Tất cả tài khoản khách hàng"}
          setStep={setStep}
          handleDelete={handleDelete}
        />
      )}
      {step.page === 2 && <UserAdminDetail id={step.id} setStep={setStep} />}
    </div>
  );
}

export default UserAdmin;
