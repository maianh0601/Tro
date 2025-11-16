export const validateHoaDonThang = (data) => {
  const errors = {};

  // Validate ma_phong (bắt buộc, không được để trống)
  if (!data.ma_phong || data.ma_phong.trim() === "") {
    errors.ma_phong = "Mã phòng là bắt buộc.";
  }

  // Validate id_users (bắt buộc, không được để trống)
  if (!data.id_users || data.id_users.trim() === "") {
    errors.id_users = "Người dùng là bắt buộc.";
  }

  // Validate thang (bắt buộc, định dạng yyyy-MM, ví dụ: "2024-05")
  // if (!data.thang || data.thang.trim() === "") {
  //   errors.thang = "Tháng tạo hóa đơn là bắt buộc.";
  // } else {
  //   // Kiểm tra định dạng yyyy-MM bằng regex
  //   const regexThang = /^\d{4}-(0[1-9]|1[0-2])$/;
  //   if (!regexThang.test(data.thang)) {
  //     errors.thang = "Định dạng tháng không hợp lệ. Ví dụ: 2024-05";
  //   }
  // }

  return errors;
};
