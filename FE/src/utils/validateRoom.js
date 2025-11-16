import { toast } from "react-toastify";

export const validateRoomData = (phongTroMoi) => {
  const specialCharRegex = /^[\p{L}\d\s_-]+$/u;

  const fieldsToCheck = [
    { field: "ma_phong", message: "Vui lòng nhập mã phòng!", checkRegex: true },
    { field: "ma_map", message: "Vui lòng nhập mã bản đồ!", checkRegex: true },
    { field: "ma_danh_muc", message: "Vui lòng chọn danh mục!" },
    {
      field: "ten_phong_tro",
      message: "Vui lòng nhập tên phòng trọ!",
      checkRegex: true,
    },
    { field: "mo_ta", message: "Vui lòng nhập mô tả!", checkRegex: true },
    { field: "dien_tich", message: "Vui lòng nhập diện tích!", type: "number" },
    { field: "gia_tien", message: "Vui lòng nhập giá tiền!", type: "number" },
    {
      field: "trang_thai",
      message: "Vui lòng chọn trạng thái!",
      checkEmptyString: true,
    },
    {
      field: "so_luong_nguoi",
      message: "Vui lòng nhập số lượng người!",
      type: "number",
    },
    { field: "dia_chi", message: "Vui lòng nhập địa chỉ!" },
  ];

  for (const {
    field,
    message,
    checkEmptyString,
    type,
    checkRegex,
  } of fieldsToCheck) {
    const value = phongTroMoi[field];

    if (checkEmptyString ? value === "" : !value) {
      toast.error(message);
      return false;
    }

    if (type === "number") {
      const numberValue = parseFloat(value);
      if (isNaN(numberValue)) {
        toast.error(`${message} (phải là số)`);
        return false;
      }
      if (numberValue < 0) {
        toast.error(`${message} (không được âm)`);
        return false;
      }
      if (/[^\d]/.test(value)) {
        toast.error(`${message} (không được chứa chữ hoặc ký tự đặc biệt)`);
        return false;
      }
    }

    if (checkRegex && !specialCharRegex.test(value)) {
      toast.error(`${message} (không được chứa ký tự đặc biệt)`);
      return false;
    }
  }

  return true;
};
