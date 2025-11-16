import { useEffect, useState } from "react";
import SearchBar from "../../component/admin/SearchBar";
import RoomTable from "../../component/admin/RoomTable";
import { axiosInstance } from "../../../Axios";
import axios from "axios";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import {
  CloseModalForm,
  OpenModalForm,
} from "../../Store/filterModalForm";

function LandlordImages() {
  const [myRooms, setMyRooms] = useState([]); // Phòng của landlord
  const [maphong, setMaphong] = useState("");
  const [errors, setErrors] = useState({
    ma_phong: "",
  });

  const [img, setImg] = useState("");
  const [hienthiAnh, setHienthiAnh] = useState("");
  const { isOpen, modalType, idModal } = useSelector(
    (state) => state.ModalForm
  );

  const dispatch = useDispatch();
  const [anhphong, setAnhphong] = useState([]);
  const [dsHienThi, setDsHienThi] = useState([]);

  // Fetch ảnh của landlord
  const fetchImages = async () => {
    try {
      const { data } = await axiosInstance.get("/landlord/images");
      setAnhphong(data.data);
      setDsHienThi(data.data);
    } catch (error) {
      console.error("Lỗi lấy ảnh:", error);
      toast.error("Không thể lấy danh sách ảnh!");
    }
  };

  // Fetch phòng của landlord
  const fetchMyRooms = async () => {
    try {
      const { data } = await axiosInstance.get("/landlord/my-rooms");
      setMyRooms(data.data);
    } catch (error) {
      console.error("Lỗi lấy phòng:", error);
      toast.error("Không thể lấy danh sách phòng!");
    }
  };

  useEffect(() => {
    fetchImages();
    fetchMyRooms();
  }, []);

  const headers = [
    { label: "Mã phòng", key: "ma_phong" },
    { label: "Ảnh phòng", key: "image_url" },
  ];

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

  const validate = () => {
    const newErrors = { ma_phong: "" };
    let isValid = true;

    if (!maphong) {
      newErrors.ma_phong = "Vui lòng chọn mã phòng!";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleAddImage = (event) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      const preview = URL.createObjectURL(file);

      setHienthiAnh([preview]);
      setImg([file]);

      event.target.value = null;
    }
  };

  const handleRemoveImage = () => {
    setHienthiAnh("");
    setImg("");
  };

  const resetData = () => {
    dispatch(CloseModalForm());
    setMaphong("");
    setImg("");
    setHienthiAnh("");
  };

  const handleCreate = async () => {
    if (!validate()) return;
    if (modalType === "create") {
      await handleCreateAnh();
    } else if (modalType === "edit") {
      await handleUpdateAnh(idModal);
    }
    resetData();
    fetchImages(); // Reload list
  };

  const handleCreateAnh = async () => {
    const urlsImg = await upload(img);
    if (!urlsImg.length) {
      toast.error("Không có ảnh để tạo!");
      return;
    }

    try {
      await axiosInstance.post("/landlord/images/create", {
        ma_phong: maphong,
        image_url: urlsImg,
      });
      toast.success("Tạo ảnh thành công!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Lỗi tạo ảnh!");
    }
  };

  const handleOpenModalEdit = (value) => {
    dispatch(OpenModalForm({ modalType: "edit", id: value._id ?? null }));
    setMaphong(value.ma_phong);
    setImg(value.image_url);
    setHienthiAnh(value.image_url);
  };

  const handleDelete = async (room) => {
    try {
      await axiosInstance.delete(`/landlord/images/delete/${room._id}`);
      toast.success("Xóa ảnh thành công!");
      fetchImages();
    } catch (error) {
      toast.error(error.response?.data?.message || "Lỗi xóa ảnh!");
    }
  };

  const handleUpdateAnh = async (id) => {
    let imageUrl;

    if (img && typeof img[0] === "object") {
      const urlsImg = await upload(img);
      if (!urlsImg.length) {
        toast.error("Không có ảnh để cập nhật!");
        return;
      }
      imageUrl = urlsImg.join(",");
    } else if (typeof img === "string") {
      imageUrl = img;
    } else {
      toast.error("Ảnh không hợp lệ!");
      return;
    }

    try {
      await axiosInstance.post(`/landlord/images/update/${id}`, {
        image_url: imageUrl,
        ma_phong: maphong,
      });
      toast.success("Cập nhật ảnh thành công!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Lỗi cập nhật ảnh!");
    }
  };

  const handleSearch = (keyword) => {
    const tuKhoa = keyword.toLowerCase();
    const filtered = anhphong.filter((item) =>
      item.ma_phong.toLowerCase().includes(tuKhoa)
    );

    setDsHienThi(filtered);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          Quản Lý Ảnh Phòng
        </h1>

        <div className="flex gap-5 mb-4">
          <SearchBar onSearch={handleSearch} />
          <button
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors font-semibold"
            onClick={() =>
              dispatch(OpenModalForm({ modalType: "create", id: null }))
            }
          >
            + Thêm ảnh phòng
          </button>
        </div>

        <RoomTable
          title={"Ảnh phòng"}
          headers={headers}
          displayedRooms={dsHienThi}
          roomsPerPage={10}
          handleDelete={handleDelete}
          handleOpenModalEdit={handleOpenModalEdit}
        />

        {isOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 min-w-[400px]">
              <div className="flex justify-between items-center gap-5">
                <h2 className="text-xl font-semibold mb-4">
                  {modalType === "create"
                    ? "Thêm ảnh phòng"
                    : "Chỉnh sửa ảnh phòng"}
                </h2>
                <button
                  className="bg-red-500 text-white p-2 rounded-lg hover:bg-red-600"
                  onClick={resetData}
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4 mt-4">
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Mã phòng *
                  </label>
                  <select
                    className="border py-3 px-5 rounded-md w-full border-gray-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    onChange={(e) => setMaphong(e.target.value)}
                    value={maphong}
                  >
                    <option value="">Chọn mã phòng</option>
                    {myRooms.map((room, index) => (
                      <option key={index} value={room.ma_phong}>
                        {room.ma_phong} - {room.ten_phong_tro}
                      </option>
                    ))}
                  </select>
                  {errors.ma_phong && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.ma_phong}
                    </p>
                  )}

                  <div>
                    <p className="font-medium mb-2 text-sm text-gray-700">
                      Ảnh phòng
                    </p>
                    <div className="flex space-x-2 overflow-x-auto">
                      {hienthiAnh && (
                        <div className="relative w-full h-[200px]">
                          <img
                            src={hienthiAnh}
                            className="w-full h-full object-cover rounded-lg"
                            alt="Room"
                          />
                          <button
                            onClick={() => handleRemoveImage(hienthiAnh)}
                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                          >
                            ✕
                          </button>
                        </div>
                      )}
                      {!hienthiAnh && (
                        <label className="w-full h-[200px] border-2 border-dashed border-gray-400 rounded-lg flex flex-col items-center justify-center text-gray-500 cursor-pointer hover:border-indigo-500 hover:text-indigo-500 transition-colors">
                          <svg
                            className="w-12 h-12 mb-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M12 4v16m8-8H4"
                            />
                          </svg>
                          <span className="text-sm">Thêm ảnh</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleAddImage}
                          />
                        </label>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={handleCreate}
                className="mt-6 w-full py-3 px-6 bg-indigo-600 rounded-lg text-white hover:bg-indigo-700 transition-colors font-semibold"
              >
                {modalType === "create" ? "Thêm ảnh" : "Cập nhật"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default LandlordImages;

