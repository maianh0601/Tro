// src/hook/usePagination.jsx
import { useEffect, useState } from "react";

const usePagination = (
  items,
  itemsPerPage,
  maxHeight = Infinity,
  itemHeight = 20
) => {
  const [currentPage, setCurrentPage] = useState(1);

  //maxHeight là chiều cao tối đa của màn hình
  //itemHeight là chiều cao của mỗi item
  const maxItemsPerPageBasedOnHeight = Math.floor(maxHeight / itemHeight);

  // Số item trên mỗi trang: lấy giá trị nhỏ nhất giữa itemsPerPage và maxItemsPerPageBasedOnHeight
  const effectiveItemsPerPage = Math.min(
    itemsPerPage,
    maxHeight === Infinity ? itemsPerPage : maxItemsPerPageBasedOnHeight
  );

  // Tính tổng số trang dựa trên effectiveItemsPerPage
  const totalPages = Math.max(
    1,
    Math.ceil(items.length / effectiveItemsPerPage)
  );

  useEffect(() => {
    setCurrentPage(1); // Reset về trang 1 khi dữ liệu thay đổi
  }, [items]);

  // Cắt danh sách item theo trang hiện tại
  const startIndex = (currentPage - 1) * effectiveItemsPerPage;
  const currentItems = items.slice(
    startIndex,
    startIndex + effectiveItemsPerPage
  );

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Tự động chuyển trang nếu items vượt quá maxHeight (chỉ áp dụng khi maxHeight hữu hạn)
  useEffect(() => {
    if (maxHeight !== Infinity && items.length > effectiveItemsPerPage) {
      const requiredPages = Math.ceil(items.length / effectiveItemsPerPage);
      if (currentPage > requiredPages) {
        setCurrentPage(requiredPages); // Điều chỉnh currentPage nếu vượt quá số trang cần thiết
      }
    }
  }, [items, effectiveItemsPerPage, maxHeight, currentPage]);

  return { currentPage, totalPages, currentItems, handlePageChange };
};

export default usePagination;
