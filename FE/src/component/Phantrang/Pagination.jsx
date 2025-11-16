// src/component/Phantrang/Pagination.jsx
import React from "react";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa"; // Thêm icon mũi tên

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  return (
    <div className="flex items-center justify-center space-x-1 sm:space-x-2 border rounded-full px-2 py-1 mt-4 w-full sm:w-auto">
      {/* Nút lùi */}
      <button
        className={`flex items-center justify-center px-2 py-1 sm:px-3 sm:py-1 rounded-full text-sm ${
          currentPage === 1
            ? "text-gray-400 cursor-not-allowed"
            : "text-gray-600 hover:text-gray-800"
        }`}
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        <FaArrowLeft className="text-xs sm:text-sm" />
        <span className="hidden sm:inline ml-1">Prev</span>
      </button>

      {/* Trang hiện tại / Tổng số trang */}
      <span
        className={`flex items-center justify-center px-2 py-1 sm:px-3 sm:py-1 rounded-md text-xs sm:text-sm font-medium ${
          currentPage === totalPages
            ? "bg-red-500 text-white"
            : "border text-gray-600"
        }`}
      >
        {currentPage} / {totalPages}
      </span>

      {/* Nút tới */}
      <button
        className={`flex items-center justify-center px-2 py-1 sm:px-3 sm:py-1 rounded-full text-sm ${
          currentPage === totalPages
            ? "text-gray-400 cursor-not-allowed"
            : "text-gray-600 hover:text-gray-800"
        }`}
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        <span className="hidden sm:inline mr-1">Next</span>
        <FaArrowRight className="text-xs sm:text-sm" />
      </button>
    </div>
  );
};

export default Pagination;
