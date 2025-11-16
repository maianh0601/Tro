import { useState } from "react";
import { FaUser } from "react-icons/fa";
import { axiosInstance } from "../../../Axios";

export default function ReviewItem({ review, reviewId }) {
  const [reply, setReply] = useState("");
  const [isReplying, setIsReplying] = useState(false);
  const [replies, setReplies] = useState(review.replies || []);

  // Gửi trả lời bình luận
  const handleReply = async () => {
    if (!reply.trim()) return alert("Vui lòng nhập nội dung trả lời!");

    try {
      const response = await axiosInstance.post("/danh_gia/createdanhgia", {
        ma_phong: review.ma_phong,
        noi_dung: reply,
        repcomment: review._id, // Gán ID bình luận cha
      });

      setReplies([...replies, response.data.data]); // Thêm phản hồi vào danh sách
      setReply("");
      setIsReplying(false);
    } catch (error) {
      console.error("Lỗi khi gửi trả lời:", error);
    }
  };

  // Xóa bình luận
  const handleDelete = async () => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa bình luận này?")) return;

    try {
      await axiosInstance.post(`/danh_gia/deletedanhgia/${review._id}`);
      alert("Đã xóa bình luận.");
    } catch (error) {
      console.error("Lỗi khi xóa bình luận:", error);
    }
  };

  return (
    <div className="mb-4 p-4 border rounded-lg bg-gray-50">
      <div className="flex gap-3">
        <FaUser size={30} />
        <p className="font-medium text-xl">{review.user.username}</p>
      </div>
      <p className="text-gray-600 mt-2">{review.noi_dung}</p>

      {/* Nút trả lời & xóa */}
      <div className="flex gap-4 mt-2">
        <button
          className="text-blue-600 hover:underline"
          onClick={() => setIsReplying(!isReplying)}
        >
          {isReplying ? "Hủy" : "Trả lời"}
        </button>
        <button className="text-red-600 hover:underline" onClick={handleDelete}>
          Xóa
        </button>
      </div>

      {/* Form nhập trả lời */}
      {isReplying && (
        <div className="mt-2 ml-6">
          <textarea
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            rows="2"
            placeholder="Nhập câu trả lời..."
            value={reply}
            onChange={(e) => setReply(e.target.value)}
          ></textarea>
          <button
            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            onClick={handleReply}
          >
            Gửi trả lời
          </button>
        </div>
      )}

      {/* Nếu có phản hồi con, hiển thị chúng dạng cây */}
      {replies.length > 0 && (
        <div className="mt-3 ml-6 border-l-2 border-gray-300 pl-4">
          {replies.map((reply) => (
            <ReviewItem key={reply._id} review={reply} />
          ))}
        </div>
      )}
    </div>
  );
}
