import { createContext, useState, useEffect, useContext } from "react";
import { axiosInstance } from "../../Axios";

const DanhMucContext = createContext();

export const DanhMucProvider = ({ children }) => {
  const [danhMuc, setDanhMuc] = useState([]);

  useEffect(() => {
    const fetchDanhMuc = async () => {
      try {
        const { data } = await axiosInstance.get("/danh-muc/getAll");
        setDanhMuc(data.data.filter((dm) => dm.trang_thai === 1));
      } catch (error) {
        console.error("Lỗi khi tải danh mục:", error);
      }
    };

    fetchDanhMuc();
  }, []);

  return (
    <DanhMucContext.Provider value={{ danhMuc, setDanhMuc }}>
      {children}
    </DanhMucContext.Provider>
  );
};

// Hook dùng để lấy dữ liệu từ Context
export const useDanhMuc = () => {
  const context = useContext(DanhMucContext);
  if (!context) {
    throw new Error("useDanhMuc phải được sử dụng trong DanhMucProvider");
  }
  return context;
};
