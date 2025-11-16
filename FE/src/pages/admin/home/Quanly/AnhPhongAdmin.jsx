import { useEffect, useState } from "react";
import SearchBar from "../../../../component/admin/SearchBar";
import RoomTable from "../../../../component/admin/RoomTable";
import { usePhongTro } from "../../../../Context/PhongTroContext";
import useApiManagerAdmin from "../../../../hook/useApiManagerAdmin";
import axios from "axios";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import {
  CloseModalForm,
  OpenModalForm,
} from "../../../../Store/filterModalForm";

function AnhPhongAdmin() {
  const { phongTro } = usePhongTro();
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
  const {
    data: anhphong,
    createData,
    DeleteData,
    DeleteAllData,
    UpdateData,
    fetchData,
  } = useApiManagerAdmin("/Image-phong");

  const [dsHienThi, setDsHienThi] = useState([]);
  useEffect(() => {
    if (anhphong) {
      setDsHienThi(anhphong); // reset về dữ liệu gốc mỗi lần fetch lại
    }
  }, [anhphong]);

  useEffect(() => {
    fetchData();
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
      const file = files[0]; // chỉ lấy ảnh đầu tiên
      const preview = URL.createObjectURL(file);

      setHienthiAnh([preview]); // thay ảnh cũ
      setImg([file]); // thay ảnh cũ

      event.target.value = null; // reset input
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
  };

  const handleCreateAnh = async () => {
    const urlsImg = await upload(img);
    if (!urlsImg.length) {
      toast.error("Không có ảnh để tạo phòng!");
      return;
    }
    await createData({
      ma_phong: maphong,
      image_url: urlsImg,
    });
  };
  const handleOpenModalEdit = (value) => {
    dispatch(OpenModalForm({ modalType: "edit", id: value._id ?? null }));
    setMaphong(value.ma_phong);
    setImg(value.image_url);
    setHienthiAnh(value.image_url);
  };

  const handleDeleteAll = async () => {
    await DeleteAllData();
  };

  // Xóa một danh mục sử dụng DeleteData từ hook
  const handleDelete = async (room) => {
    await DeleteData(room._id);
  };
  const handleUpdateAnh = async (id) => {
    let imageUrl;

    // Nếu là ảnh mới (File list), upload lên Cloudinary
    if (img && typeof img[0] === "object") {
      const urlsImg = await upload(img);
      if (!urlsImg.length) {
        toast.error("Không có ảnh để cập nhật phòng!");
        return;
      }
      imageUrl = urlsImg.join(",");
    } else if (typeof img === "string") {
      // Nếu là URL cũ, giữ nguyên
      imageUrl = img;
    } else {
      toast.error("Ảnh không hợp lệ!");
      return;
    }

    await UpdateData(id, {
      image_url: imageUrl,
      ma_phong: maphong,
    });
  };
  console.log(maphong);

  const handleSearch = (keyword) => {
    const tuKhoa = keyword.toLowerCase();
    const filtered = anhphong.filter((item) =>
      item.ma_phong.toLowerCase().includes(tuKhoa)
    );

    setDsHienThi(filtered);
  };
  return (
    <div>
      <div className="flex gap-5 ">
        <SearchBar onSearch={handleSearch} />
        <button
          className="bg-customBlue text-white p-3 rounded-lg hover:bg-sky-600"
          onClick={() =>
            dispatch(OpenModalForm({ modalType: "create", id: null }))
          }
        >
          Thêm ảnh phòng
        </button>
        <button
          className="bg-red-600 text-white p-3 rounded-lg hover:bg-sky-600"
          onClick={handleDeleteAll}
        >
          Xóa tất cả
        </button>
      </div>
      <RoomTable
        title={"Ảnh phòng"}
        headers={headers}
        displayedRooms={dsHienThi}
        roomsPerPage={5}
        handleDelete={handleDelete}
        handleOpenModalEdit={handleOpenModalEdit}
      />
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 min-w-[300px]">
            <div className="flex justify-between items-center gap-5">
              <h2 className="text-xl font-semibold mb-4">
                {modalType === "create"
                  ? "Thêm ảnh phòng chi tiết"
                  : "Chỉnh sửa ảnh phòng chi tiết"}
              </h2>
              <button
                className="bg-red-500 text-white p-2 rounded-lg"
                onClick={resetData}
              >
                Close
              </button>
            </div>
            <div className="space-y-4 mt-4">
              <div className="space-y-5">
                <select
                  className="border py-3 px-5 rounded-md w-full border-gray-500"
                  onChange={(e) => setMaphong(e.target.value)}
                  value={maphong}
                >
                  <option value="">Chọn mã phòng</option>
                  {phongTro.map((dm) => (
                    <option key={dm.index} value={dm.ma_phong}>
                      {dm.ma_phong}
                    </option>
                  ))}
                </select>
                {errors.ma_phong && (
                  <p className="text-red-500 text-sm mt-1">{errors.ma_phong}</p>
                )}

                <div>
                  <p className=" font-medium mb-4">Ảnh phòng</p>
                  <div className="flex space-x-2 overflow-x-auto">
                    {hienthiAnh && (
                      <div className="relative w-full h-[200px]">
                        <img
                          src={hienthiAnh}
                          className="w-full h-full object-cover rounded"
                        />
                        <button
                          onClick={() => handleRemoveImage(hienthiAnh)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 text-xs"
                        >
                          ✕
                        </button>
                      </div>
                    )}
                    {!hienthiAnh && (
                      <label className="w-[200px] h-[120px] border-2 border-dashed border-gray-400 rounded-lg flex items-center justify-center text-gray-500 cursor-pointer">
                        Add image
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
              className="mt-10 py-2 px-10 bg-customBlue rounded-lg text-white"
            >
              {modalType === "create" ? "Thêm" : "Chỉnh sửa"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default AnhPhongAdmin;
