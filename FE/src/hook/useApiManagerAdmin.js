// useApiManagerAdmin.js

import { useEffect, useState } from "react";
import { axiosInstance } from "../../Axios";
import { toast } from "react-toastify";

const useApiManagerAdmin = (endpoint) => {
  const [data, setData] = useState([]);

  const fetchData = async () => {
    try {
      const res = await axiosInstance.get(`${endpoint}/getAll`);
      const sortedBooks = [...res.data.data].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      setData(sortedBooks);
    } catch (error) {
      console.log(error);
    }
  };

  const createData = async (payload) => {
    try {
      await axiosInstance.post(`${endpoint}/create`, payload);
      toast.success("Tạo thành công");
      fetchData();
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || "Tạo thất bại");
      return false;
    }
  };

  const DeleteData = async (id) => {
    try {
      await axiosInstance.delete(`${endpoint}/delete/${id}`);
      toast.success("Xóa thành công");
      fetchData();
    } catch (error) {
      toast.error("Xóa thất bại");
    }
  };

  const DeleteAllData = async () => {
    try {
      await axiosInstance.delete(`${endpoint}/delete/all`);
      toast.success("Xóa tất cả thành công");
      fetchData();
    } catch (error) {
      toast.error("Xóa tất cả thất bại");
    }
  };

  const UpdateData = async (id, payload) => {
    try {
      await axiosInstance.post(`${endpoint}/update/${id}`, payload);
      toast.success("Cập nhật thành công");
      fetchData();
    } catch (error) {
      toast.error("Cập nhật thất bại");
    }
  };

  useEffect(() => {
    fetchData();
  }, [endpoint]);

  return { data, fetchData, createData, DeleteData, DeleteAllData, UpdateData };
};

export default useApiManagerAdmin;
