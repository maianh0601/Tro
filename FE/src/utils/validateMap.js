export const validateMapForm = (formData) => {
  const newErrors = {};

  const noSpecialChars = /^[A-Za-zÀ-ỹ0-9\s]+$/;
  const onlyLettersAndSpaces = /^[A-Za-zÀ-ỹ\s]+$/;

  if (!formData.ma_map.trim()) {
    newErrors.ma_map = "Mã Map không được để trống";
  } else if (!noSpecialChars.test(formData.ma_map)) {
    newErrors.ma_map = "Mã Map không được chứa ký tự đặc biệt";
  }

  if (!formData.address.trim()) {
    newErrors.address = "Địa chỉ không được để trống";
  } else if (!noSpecialChars.test(formData.address)) {
    newErrors.address = "Địa chỉ không được chứa ký tự đặc biệt";
  }

  if (!formData.district.trim()) {
    newErrors.district = "Quận/Huyện không được để trống";
  } else if (!onlyLettersAndSpaces.test(formData.district)) {
    newErrors.district =
      "Quận/Huyện chỉ được chứa chữ cái và khoảng trắng (không có số hoặc ký tự đặc biệt)";
  }

  if (!formData.ward.trim()) {
    newErrors.ward = "Thành phố không được để trống";
  } else if (!onlyLettersAndSpaces.test(formData.ward)) {
    newErrors.ward =
      "Thành phố chỉ được chứa chữ cái và khoảng trắng (không có số hoặc ký tự đặc biệt)";
  }

  if (
    formData.latitude === undefined ||
    formData.latitude === "" ||
    isNaN(formData.latitude)
  ) {
    newErrors.latitude = "Vĩ độ không hợp lệ";
  }

  if (
    formData.longitude === undefined ||
    formData.longitude === "" ||
    isNaN(formData.longitude)
  ) {
    newErrors.longitude = "Kinh độ không hợp lệ";
  }

  return newErrors;
};
