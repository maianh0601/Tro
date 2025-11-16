import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { axiosInstance } from "../../../../Axios";
import { CloseModalForm } from "../../../Store/filterModalForm";
import { FaMapMarkerAlt } from "react-icons/fa";
import { renderToStaticMarkup } from "react-dom/server";
import L from "leaflet";
import { validateMapForm } from "../../../utils/validateMap";
import { toast } from "react-toastify";

const customIcon = new L.DivIcon({
  className: "custom-icon",
  html: renderToStaticMarkup(
    <FaMapMarkerAlt style={{ color: "#007BFF", fontSize: "30px" }} />
  ),
});

const ModalMap = ({ data, reload }) => {
  const dispatch = useDispatch();
  const { modalType, idModal, isOpen } = useSelector(
    (state) => state.ModalForm
  );
  const [mapKey, setMapKey] = useState(Date.now()); // Chỉ set id nếu có
  useEffect(() => {
    if (idModal) {
      setMapKey(idModal); // Chỉ update key khi id tồn tại, tránh cập nhật liên tục
    }
  }, [idModal]);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    ma_map: "",
    address: "",
    district: "",
    latitude: 21.0285,
    longitude: 105.8542,
    ward: "",
  });

  //gán dữ liệu cho formData khi có data
  useEffect(() => {
    if (data) {
      setFormData(data);
    } else {
      setFormData({
        ma_map: "",
        address: "",
        district: "",
        latitude: 21.0285,
        longitude: 105.8542,
        ward: "",
      });
    }

    return () => {
      setFormData({
        ma_map: "",
        address: "",
        district: "",
        latitude: 21.0285,
        longitude: 105.8542,
        ward: "",
      });
    };
  }, [data]);

  function LocationMarker() {
    useMapEvents({
      click(e) {
        setFormData((prev) => ({
          ...prev,
          latitude: e.latlng.lat,
          longitude: e.latlng.lng,
        }));
      },
    });
    return (
      <Marker
        position={[formData.latitude, formData.longitude]}
        icon={customIcon}
      />
    );
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUpdate = async (id) => {
    await axiosInstance.post(`/map/updateMap/${id}`, {
      ma_map: formData.ma_map,
      address: formData.address,
      district: formData.district,
      latitude: formData.latitude,
      longitude: formData.longitude,
      ward: formData.ward,
    });
  };

  const handleCreate = async () => {
    const res = await axiosInstance.post("/map/creatMap", {
      ma_map: formData.ma_map,
      address: formData.address,
      district: formData.district,
      latitude: formData.latitude,
      longitude: formData.longitude,
      ward: formData.ward,
    });
    if (res.data.message) {
      toast.success("Tạo map thành công");
    }
  };

  const handleConfirm = async () => {
    const validationErrors = validateMapForm(formData);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;
    if (modalType === "create") {
      await handleCreate();
    } else if (modalType === "edit") {
      await handleUpdate(idModal);
      toast.success("Cập nhật map thành công");
    }
    reload();
    dispatch(CloseModalForm());
  };

  // Hàm xử lý đóng modal và reset id
  const handleClose = () => {
    dispatch(CloseModalForm());
    setMapKey(Date.now());
    setFormData({
      ma_map: "",
      address: "",
      district: "",
      latitude: 21.0285,
      longitude: 105.8542,
      ward: "",
    });
  };
  return (
    <div>
      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg shadow-lg w-1/3 p-6 h-[90%] overflow-auto">
            <h2 className="text-lg font-semibold mb-4">
              {modalType === "edit"
                ? "Chỉnh sửa thông tin bản đồ"
                : "Thêm mới bản đồ"}
            </h2>

            <div className="space-y-3 max-h-[400px] overflow-auto">
              <div className="flex justify-between gap-10">
                <div className="w-full">
                  <label className="block text-base mb-4 font-medium">
                    Mã Map:
                  </label>
                  <input
                    type="text"
                    name="ma_map"
                    value={formData.ma_map}
                    onChange={handleChange}
                    className="w-full border rounded p-2"
                  />
                  {errors.ma_map && (
                    <p className="text-red-500 text-sm mt-1">{errors.ma_map}</p>
                  )}
                </div>

                <div className="w-full">
                  <label className="block text-base mb-4 font-medium">
                    Địa chỉ:
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="w-full border rounded p-2"
                  />
                  {errors.address && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.address}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex justify-between gap-10">
                <div>
                  <label className="block text-base mb-4 font-medium">
                    Quận/Huyện:
                  </label>
                  <input
                    type="text"
                    name="district"
                    value={formData.district}
                    onChange={handleChange}
                    className="w-full border rounded p-2"
                  />
                  {errors.district && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.district}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-base mb-4 font-medium">
                    Thành phố:
                  </label>
                  <input
                    type="text"
                    name="ward"
                    value={formData.ward}
                    onChange={handleChange}
                    className="w-full border rounded p-2"
                  />
                  {errors.ward && (
                    <p className="text-red-500 text-sm mt-1">{errors.ward}</p>
                  )}
                </div>
              </div>

              <div className="flex justify-between gap-10">
                <div>
                  <label className="block text-base mb-4 font-medium">
                    Kinh độ:
                  </label>
                  <input
                    type="number"
                    name="longitude"
                    value={formData.longitude}
                    onChange={handleChange}
                    className="w-full border rounded p-2"
                    step="0.000001"
                  />
                </div>

                <div>
                  <label className="block text-base mb-4 font-medium">
                    Vĩ độ:
                  </label>
                  <input
                    type="number"
                    name="latitude"
                    value={formData.latitude}
                    onChange={handleChange}
                    className="w-full border rounded p-2"
                    step="0.000001"
                  />
                </div>
              </div>
            </div>

            <div className="mt-4">
              <MapContainer
                key={mapKey}
                center={[formData.latitude, formData.longitude]}
                zoom={13}
                style={{ height: "250px", width: "100%" }}
                className="rounded border"
              >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <LocationMarker />
              </MapContainer>
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={handleConfirm}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                {idModal ? "Lưu" : "Thêm mới"}
              </button>
              <button
                onClick={handleClose} // Sử dụng handleClose thay vì dispatch trực tiếp
                className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModalMap;
