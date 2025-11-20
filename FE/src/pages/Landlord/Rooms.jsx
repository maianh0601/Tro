import { useEffect, useState } from "react";
import { axiosInstance } from "../../../Axios";
import { useDanhMuc } from "../../Context/DanhMucContext";
import { toast } from "react-toastify";
import axios from "axios";
import { getPrimaryImage } from "../../utils/imageUtils";

function Rooms() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("create");
  const [selectedRoom, setSelectedRoom] = useState(null);
  const { danhMuc } = useDanhMuc();
  const [maps, setMaps] = useState([]);
  const [images, setImages] = useState([]);
  const [hienthiAnh, setHienthiAnh] = useState([]);
  
  const [roomData, setRoomData] = useState({
    ma_phong: "",
    ma_map: "",
    ma_danh_muc: "",
    ten_phong_tro: "",
    mo_ta: "",
    dien_tich: "",
    gia_tien: "",
    trang_thai: 1,
    so_luong_nguoi: "",
    dia_chi: "",
  });

  useEffect(() => {
    fetchRooms();
    fetchMaps();
  }, []);

  const fetchRooms = async () => {
    try {
      const { data } = await axiosInstance.get("/landlord/my-rooms");
      setRooms(data.data);
    } catch (error) {
      console.error("Lỗi tải phòng:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMaps = async () => {
    try {
      const { data } = await axiosInstance.get("/map/get");
      setMaps(data.data || []);
    } catch (error) {
      console.error("Lỗi tải maps:", error);
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages((prev) => [...prev, ...files]);
    
    const urls = files.map((file) => URL.createObjectURL(file));
    setHienthiAnh((prev) => [...prev, ...urls]);
  };

  const handleRemoveImage = (indexToRemove) => {
    setHienthiAnh((prev) => prev.filter((_, i) => i !== indexToRemove));
    setImages((prev) => prev.filter((_, i) => i !== indexToRemove));
  };

  const upload = async (files) => {
    const API_URL = "https://api.cloudinary.com/v1_1/dzncn1q3e";
    const urls = [];

    for (const file of files) {
      const formData = new FormData();
      formData.append("upload_preset", "phongtro");
      formData.append("file", file);

      const resourceType = file.type.includes("video") ? "video" : "image";
      try {
        const response = await axios.post(
          `${API_URL}/${resourceType}/upload`,
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
        urls.push(response.data.secure_url);
      } catch (error) {
        console.error(`Lỗi upload ${resourceType}:`, error);
      }
    }
    return urls;
  };

  const resetForm = () => {
    setRoomData({
      ma_phong: "",
      ma_map: "",
      ma_danh_muc: "",
      ten_phong_tro: "",
      mo_ta: "",
      dien_tich: "",
      gia_tien: "",
      trang_thai: 1,
      so_luong_nguoi: "",
      dia_chi: "",
    });
    setImages([]);
    setHienthiAnh([]);
    setShowModal(false);
    setSelectedRoom(null);
  };

  const handleCreate = async () => {
    try {
      if (!roomData.ma_phong || !roomData.ten_phong_tro || !roomData.gia_tien) {
        toast.error("Vui lòng điền đầy đủ thông tin bắt buộc");
        return;
      }

      let urlsImg = [];
      if (modalType === "create") {
        if (images.length === 0) {
          toast.error("Vui lòng thêm ảnh phòng");
          return;
        }
        urlsImg = await upload(images);
      } else if (images.length > 0) {
        urlsImg = await upload(images);
      }

      const dataToSend = {
        ...roomData,
        anh_phong: modalType === "create" 
          ? urlsImg.join(", ")
          : [...hienthiAnh.filter(url => !url.startsWith('blob:')), ...urlsImg].join(", "),
        gia_tien: Number(roomData.gia_tien),
        trang_thai: Number(roomData.trang_thai),
        so_luong_nguoi: Number(roomData.so_luong_nguoi),
      };

      if (modalType === "create") {
        await axiosInstance.post("/landlord/create-room", dataToSend);
        toast.success("Tạo phòng thành công!");
      } else {
        await axiosInstance.put(`/landlord/update-room/${selectedRoom.ma_phong}`, dataToSend);
        toast.success("Cập nhật phòng thành công!");
      }

      resetForm();
      fetchRooms();
    } catch (error) {
      toast.error(error.response?.data?.message || "Có lỗi xảy ra");
    }
  };

  const handleEdit = (room) => {
    setModalType("edit");
    setSelectedRoom(room);
    setRoomData(room);
    setHienthiAnh(room.anh_phong?.split(", ") || []);
    setShowModal(true);
  };

  const handleDelete = async (ma_phong) => {
    if (!confirm("Bạn có chắc muốn xóa phòng này?")) return;
    
    try {
      await axiosInstance.delete(`/landlord/delete-room/${ma_phong}`);
      toast.success("Xóa phòng thành công!");
      fetchRooms();
    } catch (error) {
      toast.error(error.response?.data?.message || "Không thể xóa phòng");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Quản lý phòng</h2>
        <button 
          onClick={() => {
            setModalType("create");
            setShowModal(true);
          }}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
        >
          + Thêm phòng mới
        </button>
      </div>

      {rooms.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Chưa có phòng nào</h3>
          <p className="text-gray-600 mb-6">Hãy thêm phòng đầu tiên của bạn để bắt đầu cho thuê</p>
          <button className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors">
            + Thêm phòng ngay
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rooms.map((room) => (
            <div key={room._id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden">
              {room.anh_phong && (
                <img
                  src={getPrimaryImage(room.anh_phong)}
                  alt={room.ten_phong_tro}
                  className="w-full h-48 object-cover"
                />
              )}
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-semibold text-gray-800">{room.ten_phong_tro}</h3>
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      room.trang_thai === 1
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {room.trang_thai === 1 ? "Trống" : "Đã thuê"}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {room.dia_chi}
                </p>
                <div className="flex justify-between items-center mb-3">
                  <p className="text-sm text-gray-600">
                    <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                    </svg>
                    {room.dien_tich} m²
                  </p>
                  <p className="text-sm text-gray-600">
                    <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    {room.so_luong_nguoi} người
                  </p>
                </div>
                <p className="text-xl font-bold text-indigo-600 mb-4">
                  {room.gia_tien?.toLocaleString()} VND/tháng
                </p>
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleEdit(room)}
                    className="flex-1 bg-indigo-100 text-indigo-600 py-2 rounded hover:bg-indigo-200 transition-colors text-sm font-medium"
                  >
                    Chỉnh sửa
                  </button>
                  <button 
                    onClick={() => handleDelete(room.ma_phong)}
                    className="flex-1 bg-red-100 text-red-600 py-2 rounded hover:bg-red-200 transition-colors text-sm font-medium"
                  >
                    Xóa
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Form */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-800">
                {modalType === "create" ? "Thêm phòng mới" : "Chỉnh sửa phòng"}
              </h3>
              <button onClick={resetForm} className="text-gray-500 hover:text-gray-700">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Mã phòng *</label>
                <input
                  type="text"
                  value={roomData.ma_phong}
                  onChange={(e) => setRoomData({...roomData, ma_phong: e.target.value})}
                  className="w-full border rounded px-3 py-2"
                  disabled={modalType === "edit"}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Tên phòng *</label>
                <input
                  type="text"
                  value={roomData.ten_phong_tro}
                  onChange={(e) => setRoomData({...roomData, ten_phong_tro: e.target.value})}
                  className="w-full border rounded px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Giá tiền (VND) *</label>
                <input
                  type="number"
                  value={roomData.gia_tien}
                  onChange={(e) => setRoomData({...roomData, gia_tien: e.target.value})}
                  className="w-full border rounded px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Diện tích (m²)</label>
                <input
                  type="text"
                  value={roomData.dien_tich}
                  onChange={(e) => setRoomData({...roomData, dien_tich: e.target.value})}
                  className="w-full border rounded px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Số lượng người</label>
                <input
                  type="number"
                  value={roomData.so_luong_nguoi}
                  onChange={(e) => setRoomData({...roomData, so_luong_nguoi: e.target.value})}
                  className="w-full border rounded px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Trạng thái</label>
                <select
                  value={roomData.trang_thai}
                  onChange={(e) => setRoomData({...roomData, trang_thai: e.target.value})}
                  className="w-full border rounded px-3 py-2"
                >
                  <option value={1}>Trống</option>
                  <option value={0}>Đã thuê</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Danh mục</label>
                <select
                  value={roomData.ma_danh_muc}
                  onChange={(e) => setRoomData({...roomData, ma_danh_muc: e.target.value})}
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="">-- Chọn danh mục --</option>
                  {danhMuc.map((dm) => (
                    <option key={dm.ma_danh_muc} value={dm.ma_danh_muc}>
                      {dm.ten_danh_muc}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Map</label>
                <select
                  value={roomData.ma_map}
                  onChange={(e) => setRoomData({...roomData, ma_map: e.target.value})}
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="">-- Chọn map --</option>
                  {maps.map((m) => (
                    <option key={m.ma_map} value={m.ma_map}>
                      {m.ma_map}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Địa chỉ</label>
                <input
                  type="text"
                  value={roomData.dia_chi}
                  onChange={(e) => setRoomData({...roomData, dia_chi: e.target.value})}
                  className="w-full border rounded px-3 py-2"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Mô tả</label>
                <textarea
                  value={roomData.mo_ta}
                  onChange={(e) => setRoomData({...roomData, mo_ta: e.target.value})}
                  className="w-full border rounded px-3 py-2"
                  rows="3"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Ảnh phòng</label>
                <input
                  type="file"
                  multiple
                  accept="image/*,video/*"
                  onChange={handleImageChange}
                  className="w-full border rounded px-3 py-2"
                />
                <div className="mt-3 grid grid-cols-4 gap-2">
                  {hienthiAnh.map((url, index) => (
                    <div key={index} className="relative">
                      <img src={url} alt={`Preview ${index}`} className="w-full h-24 object-cover rounded" />
                      <button
                        onClick={() => handleRemoveImage(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={resetForm}
                className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleCreate}
                className="flex-1 bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                {modalType === "create" ? "Tạo phòng" : "Lưu thay đổi"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Rooms;

