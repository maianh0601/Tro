import { useEffect, useState } from "react";
import { axiosInstance } from "../../../../../Axios";
import RoomTable from "../../../../component/admin/RoomTable";
import { IoMdArrowRoundBack } from "react-icons/io";
import { useDanhMuc } from "../../../../Context/DanhMucContext";
import axios from "axios";
import { toast } from "react-toastify";
import SearchBar from "../../../../component/admin/SearchBar";
import useApiManagerAdmin from "../../../../hook/useApiManagerAdmin";
import { useDispatch, useSelector } from "react-redux";
import {
  CloseModalForm,
  OpenModalForm,
} from "../../../../Store/filterModalForm";
import { validateRoomData } from "../../../../utils/validateRoom";

function PhongTroAdmin() {
  const [isLoading, setIsLoading] = useState(false);
  const [chucnang, setChucnang] = useState("Tất cả các phòng");
  const [page, setPage] = useState(1);
  const [images, setImages] = useState([]);
  const { danhMuc } = useDanhMuc();
  const [maps, setMaps] = useState([]);
  const [hienthiAnh, setHienthiAnh] = useState([]);
  const [phongTroMoi, setPhongTroMoi] = useState({
    ma_phong: "",
    ma_map: "",
    ma_danh_muc: "",
    ten_phong_tro: "",
    mo_ta: "",
    dien_tich: "",
    gia_tien: "",
    trang_thai: "",
    so_luong_nguoi: "",
    dia_chi: "",
  });

  const {
    data: phongTro,
    createData,
    UpdateData,
    DeleteData,
    DeleteAllData,
    fetchData,
  } = useApiManagerAdmin("/phongTro");

  const [dsHienThi, setDsHienThi] = useState([]);
  const [keyword, setKeyword] = useState("");
  useEffect(() => {
    handleSearch(keyword); // Tìm kiếm lại khi từ khóa thay đổi
  }, [chucnang, phongTro]);

  const { modalType, idModal } = useSelector((state) => state.ModalForm);
  const dispatch = useDispatch();
  const headers = [
    { label: "Mã phòng", key: "ma_phong" },
    { label: "Tên phòng trọ", key: "ten_phong_tro" },
    { label: "Mã danh mục", key: "ma_danh_muc" },
    { label: "Số người", key: "so_luong_nguoi" },
    { label: "Trạng thái", key: "trang_thai" },
    { label: "Mô tả", key: "mo_ta" },
  ];

  useEffect(() => {
    const fetchDataMapandDanhMuc = async () => {
      try {
        const resMap = await axiosInstance.get("/map/AllMap");
        setMaps(resMap.data.data);
      } catch (error) {
        console.log(error);
      }
    };
    fetchDataMapandDanhMuc();
  }, [chucnang]);

  useEffect(() => {
    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPhongTroMoi((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddImage = (event) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      const preview = URL.createObjectURL(file);
      setHienthiAnh([preview]);
      setImages([file]);
      event.target.value = null;
    }
  };

  const upload = async (files) => {
    const CLOUD_NAME = "dlvf2ltdx";
    const PRESET_NAME = "uploadimages";
    const API_URL = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}`;
    const FOLDER_NAME = "PHONGTRO";
    const urls = [];

    for (const file of files) {
      const formData = new FormData();
      formData.append("upload_preset", PRESET_NAME);
      formData.append("folder", FOLDER_NAME);
      formData.append("file", file);

      const resourceType = file.type.includes("video") ? "video" : "image";
      try {
        const response = await axios.post(
          `${API_URL}/${resourceType}/upload`,
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );
        urls.push(response.data.secure_url);
      } catch (error) {
        console.error(`Lỗi upload ${resourceType}:`, error);
      }
    }
    return urls;
  };

  const handleRemoveImage = (indexToRemove) => {
    setHienthiAnh((prev) => prev.filter((_, i) => i !== indexToRemove));
    setImages((prev) => prev.filter((_, i) => i !== indexToRemove));
  };

  const resetData = () => {
    setPhongTroMoi({
      ma_phong: "",
      ma_map: "",
      ma_danh_muc: "",
      ten_phong_tro: "",
      mo_ta: "",
      dien_tich: "",
      gia_tien: "",
      trang_thai: "",
      so_luong_nguoi: "",
      dia_chi: "",
    });

    setImages([]);
    setHienthiAnh([]);
    setPage(1);
    dispatch(CloseModalForm());
  };

  const handleCreateRoom = async () => {
    const urlsImg = await upload(images);
    if (!urlsImg.length) {
      toast.error("Không có ảnh để tạo phòng!");
      return;
    }
    await createData({
      ...phongTroMoi,
      anh_phong: urlsImg.join(", "),
      gia_tien: Number(phongTroMoi.gia_tien),
      trang_thai: Number(phongTroMoi.trang_thai),
      so_luong_nguoi: Number(phongTroMoi.so_luong_nguoi),
    });
    resetData();
  };

  const handleDelete = async (room) => {
    await DeleteData(room.ma_phong);
  };

  const filteredRooms = phongTro.filter((room) => {
    if (chucnang === "Phòng đã được thuê") return room.trang_thai === 0;
    if (chucnang === "Phòng trống") return room.trang_thai === 1;
    return true;
  });

  const handleUpdateRoom = async (id) => {
    let anhPhong = images;
    if (images && images.length > 0) {
      const urlsImg = await upload(images);
      if (!urlsImg.length) {
        toast.error("Không thể tải ảnh lên!");
        return;
      }
      anhPhong = urlsImg.join(", ");
    }
    if (hienthiAnh.length === 0) {
      toast.error("Vui lòng thêm ảnh phòng!");
      return;
    }
    await UpdateData(id, {
      ...phongTroMoi,
      anh_phong: hienthiAnh.join(", ") || anhPhong,
      gia_tien: Number(phongTroMoi.gia_tien),
      trang_thai: Number(phongTroMoi.trang_thai),
      so_luong_nguoi: Number(phongTroMoi.so_luong_nguoi),
    });
    resetData();
  };

  const handleCreate = async () => {
    setIsLoading(true);
    try {
      if (!validateRoomData(phongTroMoi)) return;
      if (modalType === "create") {
        await handleCreateRoom();
      } else if (modalType === "edit") {
        await handleUpdateRoom(idModal);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModalEdit = (room) => {
    dispatch(OpenModalForm({ modalType: "edit", id: room.ma_phong ?? null }));
    setPhongTroMoi(room);
    setHienthiAnh(room.anh_phong?.split(", ") || []);
    setPage(2);
  };

  const handleSearch = (keyword) => {
    const tuKhoa = keyword.toLowerCase();
    const filtered = filteredRooms.filter(
      (item) =>
        item.ten_phong_tro?.toLowerCase().includes(tuKhoa.toLowerCase()) ||
        item.ma_phong.toLowerCase().includes(tuKhoa) ||
        item.ma_danh_muc?.toLowerCase().includes(tuKhoa)
    );
    setDsHienThi(filtered);
  };

  return (
    <div className="space-y-4 z-50">
      {page === 1 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Room</h2>
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div className="flex flex-wrap gap-3">
              {["Tất cả các phòng", "Phòng trống", "Phòng đã được thuê"].map(
                (label) => (
                  <p
                    key={label}
                    className={`text-lg py-2 px-4 cursor-pointer ${
                      chucnang === label
                        ? "font-medium border-b-2 border-gray-500"
                        : ""
                    }`}
                    onClick={() => setChucnang(label)}
                  >
                    {label}
                  </p>
                )
              )}
            </div>
            <div className="flex items-center gap-4">
              <SearchBar onSearch={handleSearch} />
              <button
                className="text-base bg-customBlue text-white rounded-full py-2 px-3"
                onClick={() => {
                  dispatch(OpenModalForm({ modalType: "create", id: null }));
                  setPage(2);
                }}
              >
                + Thêm phòng trọ
              </button>
              <button
                className="text-base bg-red-600 text-white rounded-full py-2 px-3"
                onClick={DeleteAllData}
              >
                Xóa tất cả phòng
              </button>
            </div>
          </div>
          <RoomTable
            displayedRooms={dsHienThi}
            roomsPerPage={10}
            title="Tất cả phòng trọ"
            headers={headers}
            handleDelete={handleDelete}
            handleOpenModalEdit={handleOpenModalEdit}
          />
        </div>
      )}
      {page === 2 && (
        <div className="space-y-6">
          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={resetData}
          >
            <IoMdArrowRoundBack size={25} />
            <h2 className="text-2xl font-bold">
              {modalType === "edit" ? "Chỉnh sửa phòng trọ" : "Thêm phòng trọ"}
            </h2>
          </div>

          {/* Ảnh */}
          <div>
            <p className="text-xl font-medium mb-4">Ảnh phòng</p>
            <div className="flex space-x-2 overflow-x-auto">
              {hienthiAnh.map((src, index) => (
                <div key={index} className="relative w-[200px] h-[120px]">
                  <img
                    src={src}
                    alt={`Uploaded ${index}`}
                    className="w-full h-full object-cover rounded-lg"
                  />
                  <button
                    onClick={() => handleRemoveImage(index)}
                    className="absolute top-1 right-1 bg-red-600 text-white rounded-full px-2"
                  >
                    X
                  </button>
                </div>
              ))}
              <input type="file" onChange={handleAddImage} />
            </div>
          </div>

          {/* Form thông tin phòng */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {[
              { label: "Mã phòng", name: "ma_phong" },
              { label: "Tên phòng trọ", name: "ten_phong_tro" },
              { label: "Mô tả", name: "mo_ta" },
              { label: "Diện tích", name: "dien_tich" },
              { label: "Giá tiền", name: "gia_tien" },

              { label: "Số lượng người", name: "so_luong_nguoi" },
              { label: "Địa chỉ", name: "dia_chi" },
            ].map(({ label, name }) => (
              <div key={name}>
                <label className="block text-sm font-medium">{label}</label>
                <input
                  name={name}
                  value={phongTroMoi[name]}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
            ))}

            <div>
              <label className="block text-sm font-medium">
                Trạng thái phòng
              </label>
              <select
                name="trang_thai"
                value={phongTroMoi.trang_thai}
                onChange={(e) =>
                  handleChange({
                    target: {
                      name: e.target.name,
                      value: Number(e.target.value),
                    },
                  })
                }
                className="w-full border rounded px-3 py-2"
              >
                <option value="" disabled>
                  Chọn trạng thái
                </option>
                <option value={0}>Phòng đã được thuê</option>
                <option value={1}>Phòng trống</option>
              </select>
            </div>

            {/* Danh mục và Map */}
            <div>
              <label className="block text-sm font-medium">Mã danh mục</label>
              <select
                name="ma_danh_muc"
                value={phongTroMoi.ma_danh_muc}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
              >
                <option value="">-- Chọn danh mục --</option>
                {danhMuc.map((dm, index) => (
                  <option key={index} value={dm.ma_danh_muc}>
                    {dm.ten_danh_muc}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium">Mã map</label>
              <select
                name="ma_map"
                value={phongTroMoi.ma_map}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
              >
                <option value="">-- Chọn map --</option>
                {maps.map((m, index) => (
                  <option key={index} value={m.ma_map}>
                    {m.ma_map}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            className="bg-blue-600 text-white px-6 py-2 rounded-lg"
            onClick={handleCreate}
            disabled={isLoading}
          >
            {isLoading
              ? "Đang tải..."
              : modalType === "edit"
              ? "Lưu chỉnh sửa"
              : "Tạo phòng"}
          </button>
        </div>
      )}
    </div>
  );
}

export default PhongTroAdmin;
