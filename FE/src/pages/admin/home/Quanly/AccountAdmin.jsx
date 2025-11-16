import { useEffect, useState } from "react";
import RoomTable from "../../../../component/admin/RoomTable";
import useApiManagerAdmin from "../../../../hook/useApiManagerAdmin";
import SearchBar from "../../../../component/admin/SearchBar";
import { axiosInstance } from "../../../../../Axios";
import { toast } from "react-toastify";
import {
  CloseModalForm,
  OpenModalForm,
} from "../../../../Store/filterModalForm";
import { useDispatch, useSelector } from "react-redux";
import { validate } from "../../../../utils/validateAdmin";
import { useMasking } from "../../../../hook/useMasking";
function AccountAdmin() {
  const {
    data: admin,
    createData,
    DeleteData,
    UpdateData,
  } = useApiManagerAdmin("/admin");
  const [roles, setRoles] = useState([]);
  const { modalType, idModal, isOpen } = useSelector(
    (state) => state.ModalForm
  );
  const [errors, setErrors] = useState({});
  const { formatDateInput } = useMasking();
  const dispatch = useDispatch();
  const [adminData, setAdminData] = useState({
    id_quyen: "",
    email: "",
    password: "",
    username: "",
    ho_va_ten: "",
    ngay_sinh: "",
    que_quan: "",
    so_dien_thoai: "",
    gioi_tinh: "",
    cccd: "",
    verify: 1,
    is_block: false,
  });

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const res = await axiosInstance.get("/phan_quyen/AllQuyen");
        setRoles(res.data.data || []);
      } catch (error) {
        toast.error("Lỗi khi tải danh sách quyền");
        console.log(error);
      }
    };
    fetchRoles();
  }, []);

  const [dsHienThi, setDsHienThi] = useState([]);
  useEffect(() => {
    if (admin) {
      setDsHienThi(admin); // reset về dữ liệu gốc mỗi lần fetch lại
    }
  }, [admin]);

  const headers = [
    { label: "Tên quyền", key: "ten_quyen" },
    { label: "UserName", key: "username" },
    { label: "Email", key: "email" },
    { label: "Họ và tên", key: "ho_va_ten" },
    { label: "Quê quán", key: "que_quan" },
    { label: "Số điện thoại", key: "so_dien_thoai" },
    { label: "Giới tính", key: "gioi_tinh" },
    { label: "Căn cước công dân", key: "cccd" },
    { label: "Trạng thái", key: "is_block" },
  ];

  const handleCreateAccountAdmin = async () => {
    const success = await createData({ ...adminData });
    if (success) {
      resetData();
    }
  };

  const handleOpenModalEdit = (room) => {
    dispatch(OpenModalForm({ modalType: "edit", id: room._id ?? null }));
    setAdminData({
      id_quyen: room.id_quyen,
      email: room.email,
      password: room.password,
      username: room.username,
      ho_va_ten: room.ho_va_ten,
      ngay_sinh: room.ngay_sinh,
      que_quan: room.que_quan,
      so_dien_thoai: room.so_dien_thoai,
      gioi_tinh: room.gioi_tinh,
      cccd: room.cccd,
      verify: 1,
      is_block: room.is_block,
    });
  };

  const handleCreate = async () => {
    const validationErrors = validate(adminData);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;
    if (modalType === "create") {
      await handleCreateAccountAdmin();
    } else if (modalType === "edit") {
      await UpdateData(idModal, adminData);
      resetData();
    }
  };

  const handleDelete = async (room) => {
    await DeleteData(room._id);
  };

  const handleUpdateBlock = async (id, value) => {
    const newValue = !value;
    await UpdateData(id, { is_block: newValue });
  };

  const renderStatus = (status) => (
    <p
      className={`p-1 border rounded text-white cursor-pointer ${
        status.is_block ? "bg-red-500" : "bg-green-500"
      }`}
      onClick={() => handleUpdateBlock(status._id, status.is_block)}
    >
      {status.is_block ? "Bị khóa" : "Hoạt động"}
    </p>
  );

  const resetData = () => {
    setAdminData({
      id_quyen: "",
      email: "",
      password: "",
      username: "",
      ho_va_ten: "",
      ngay_sinh: "",
      que_quan: "",
      so_dien_thoai: "",
      gioi_tinh: "",
      cccd: "",
      verify: 1,
      is_block: false,
    });
    setErrors({});
    dispatch(CloseModalForm());
  };

  const handleSearch = (keyword) => {
    const tuKhoa = keyword.toLowerCase();
    const filtered = admin.filter(
      (item) =>
        item.username.toLowerCase().includes(tuKhoa) ||
        item.ho_va_ten.toLowerCase().includes(tuKhoa) ||
        item.email.toLowerCase().includes(tuKhoa) ||
        item.que_quan.toLowerCase().includes(tuKhoa) ||
        String(item.so_dien_thoai).toLowerCase().includes(tuKhoa) ||
        item.ten_quyen.toLowerCase().includes(tuKhoa)
    );
    setDsHienThi(filtered);
  };
  return (
    <div>
      <div className="flex gap-5 ">
        <SearchBar onSearch={handleSearch} />
        <button
          className="bg-customBlue text-white p-3 rounded-lg hover:bg-sky-600"
          onClick={() => {
            dispatch(OpenModalForm({ modalType: "create", id: null }));
          }}
        >
          Thêm tài khoản admin
        </button>
      </div>
      <RoomTable
        displayedRooms={dsHienThi}
        headers={headers}
        roomsPerPage={5}
        title={"Account Admin"}
        renderStatus={renderStatus}
        handleDelete={handleDelete}
        updateTrangthai={handleUpdateBlock}
        handleOpenModalEdit={handleOpenModalEdit}
      />
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[100]">
          <div className="bg-white rounded-lg shadow-lg p-6 min-w-[300px] w-2/3">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold mb-4">
                {modalType === "edit"
                  ? "Chỉnh sửa tài khoản"
                  : "Thêm tài khoản"}
              </h2>
              <button
                className="bg-red-500 text-white p-2 rounded-lg"
                onClick={resetData}
              >
                Close
              </button>
            </div>
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium">Email</label>
                  <input
                    type="text"
                    placeholder="Nhập email"
                    value={adminData.email}
                    onChange={(e) =>
                      setAdminData({ ...adminData, email: e.target.value })
                    }
                    className="w-full border border-gray-500 py-2 px-4 rounded-md"
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                  )}
                </div>
                <div>
                  <label className="block font-medium">Mật khẩu</label>
                  <input
                    type="password"
                    placeholder="Nhập mật khẩu"
                    onChange={(e) =>
                      setAdminData({ ...adminData, password: e.target.value })
                    }
                    className="w-full border border-gray-500 py-2 px-4 rounded-md"
                  />
                  {errors.password && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.password}
                    </p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium">UserName</label>
                  <input
                    type="text"
                    placeholder="Nhập tên đăng nhập"
                    value={adminData.username}
                    onChange={(e) =>
                      setAdminData({ ...adminData, username: e.target.value })
                    }
                    className="w-full border border-gray-500 py-2 px-4 rounded-md"
                  />
                  {errors.username && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.username}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block font-medium">Họ và tên</label>
                  <input
                    type="text"
                    placeholder="Nhập họ và tên"
                    value={adminData.ho_va_ten}
                    onChange={(e) =>
                      setAdminData({ ...adminData, ho_va_ten: e.target.value })
                    }
                    className="w-full border border-gray-500 py-2 px-4 rounded-md"
                  />
                  {errors.ho_va_ten && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.ho_va_ten}
                    </p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium">Ngày sinh</label>
                  <input
                    type="date"
                    value={formatDateInput(adminData.ngay_sinh)}
                    onChange={(e) =>
                      setAdminData({ ...adminData, ngay_sinh: e.target.value })
                    }
                    className="w-full border border-gray-500 py-2 px-4 rounded-md"
                  />
                  {errors.ngay_sinh && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.ngay_sinh}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block font-medium">Quê quán</label>
                  <input
                    type="text"
                    placeholder="Nhập quê quán"
                    value={adminData.que_quan}
                    onChange={(e) =>
                      setAdminData({ ...adminData, que_quan: e.target.value })
                    }
                    className="w-full border border-gray-500 py-2 px-4 rounded-md"
                  />
                  {errors.que_quan && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.que_quan}
                    </p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium">Số điện thoại</label>
                  <input
                    type="text"
                    placeholder="Nhập số điện thoại"
                    value={adminData.so_dien_thoai}
                    onChange={(e) =>
                      setAdminData({
                        ...adminData,
                        so_dien_thoai: e.target.value,
                      })
                    }
                    className="w-full border border-gray-500 py-2 px-4 rounded-md"
                  />
                  {errors.so_dien_thoai && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.so_dien_thoai}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block font-medium">CCCD</label>
                  <input
                    type="text"
                    placeholder="Nhập số CCCD"
                    value={adminData.cccd}
                    onChange={(e) =>
                      setAdminData({ ...adminData, cccd: e.target.value })
                    }
                    className="w-full border border-gray-500 py-2 px-4 rounded-md"
                  />
                  {errors.cccd && (
                    <p className="text-red-500 text-sm mt-1">{errors.cccd}</p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium">Giới tính</label>
                  <select
                    className="w-full border border-gray-500 py-2 px-4 rounded-md"
                    value={adminData.gioi_tinh}
                    onChange={(e) =>
                      setAdminData({ ...adminData, gioi_tinh: e.target.value })
                    }
                  >
                    <option value="">Chọn giới tính</option>
                    <option value="Nam">Nam</option>
                    <option value="Nữ">Nữ</option>
                    <option value="Khác">Khác</option>
                  </select>
                  {errors.gioi_tinh && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.gioi_tinh}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block font-medium">Quyền</label>
                  <select
                    className="w-full border border-gray-500 py-2 px-4 rounded-md"
                    value={adminData.id_quyen}
                    onChange={(e) =>
                      setAdminData({ ...adminData, id_quyen: e.target.value })
                    }
                  >
                    <option value="">Chọn quyền</option>
                    {roles && roles.length > 0 ? (
                      roles.map((role) => (
                        <option key={role._id} value={role._id}>
                          {role.ten_quyen}
                        </option>
                      ))
                    ) : (
                      <option value="" disabled>
                        Không có quyền nào
                      </option>
                    )}
                  </select>
                  {errors.id_quyen && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.id_quyen}
                    </p>
                  )}
                </div>
              </div>
              {/* <div>
                <label className="block font-medium">Khoá tài khoản</label>
                <input
                  type="checkbox"
                  checked={adminData.is_block}
                  onChange={(e) =>
                    setAdminData({ ...adminData, is_block: e.target.checked })
                  }
                  className="mr-2"
                />
                <span>Tài khoản bị khoá</span>
              </div> */}
            </div>
            <button
              onClick={handleCreate}
              className="mt-6 py-2 px-10 bg-customBlue rounded-lg text-white w-full"
            >
              {modalType === "edit" ? "Chỉnh sửa" : "Thêm"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default AccountAdmin;
