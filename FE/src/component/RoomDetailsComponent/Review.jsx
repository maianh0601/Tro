import { useState, useEffect } from "react";
import { axiosInstance } from "../../../Axios";
import { FaUser, FaComment, FaStar } from "react-icons/fa";
import { useSelector } from "react-redux";

export default function RoomReview({ id }) {
  const { user } = useSelector((state) => state.auth);
  const [review, setReview] = useState("");
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(0);
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  useEffect(() => {
    fetchReviews();
  }, [id]);

  const fetchReviews = async () => {
    try {
      const response = await axiosInstance.get(`/danh_gia/getdanhgia/${id}`);
      const formattedReviews = response.data.data.map((review) => ({
        ...review,
        createdAt: formatDate(review.createdAt),
        replies: review.replies.map((reply) => ({
          ...reply,
          createdAt: formatDate(reply.createdAt),
        })),
      }));
      setReviews(formattedReviews);
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu:", error);
    }
  };

  const handleSubmit = async () => {
    // if (!review.trim()) return alert("Vui lòng nhập nội dung đánh giá!");
    // if (rating === 0) return alert("Vui lòng chọn số sao đánh giá!");

    try {
      await axiosInstance.post("/danh_gia/createdanhgia", {
        ma_phong: id,
        noi_dung: review,
        danh_gia_sao: rating || 0,
      });

      setReview("");
      setRating(0);
      fetchReviews();
    } catch (error) {
      console.error("Lỗi khi gửi đánh giá:", error);
    }
  };

  return (
    <div className="w-full px-4 sm:px-6 mx-auto bg-gray-100 rounded-xl shadow-md">
      <div className="w-full mt-6 p-4 sm:p-6 bg-white rounded-xl shadow-md">
        <h3 className="text-xl sm:text-2xl font-semibold mb-4 text-center sm:text-left">
          Đánh giá từ khách hàng
        </h3>

        {reviews.length > 0 ? (
          reviews.map((review) => (
            <ReviewItem
              key={review._id}
              review={review}
              fetchReviews={fetchReviews}
            />
          ))
        ) : (
          <p className="text-gray-600 text-center">Chưa có đánh giá nào.</p>
        )}

        <div className="h-[1px] w-full bg-gray-300 mt-6"></div>

        {user ? (
          <div className="flex flex-col gap-3 mt-8">
            <div className="w-full relative">
              <textarea
                className="w-full p-3 border rounded-md outline-none text-black bg-gray-100 placeholder-gray-500 focus:outline-slate-700 resize-none"
                rows="5"
                placeholder="Nhập nhận xét của bạn..."
                value={review}
                onChange={(e) => setReview(e.target.value)}
              ></textarea>
              <div className="flex gap-1 mt-2 absolute bottom-4 left-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <FaStar
                    key={star}
                    size={20}
                    className={`cursor-pointer ${star <= rating ? "text-yellow-400" : "text-gray-300"}`}
                    onClick={() => setRating(star)}
                  />
                ))}
              </div>
              <button
                className="absolute bottom-4 right-4 bg-[#23284C] text-white py-2 px-4 text-sm sm:text-base font-medium rounded-full hover:bg-blue-700 transition-all"
                onClick={handleSubmit}
              >
                Gửi đánh giá
              </button>
            </div>
          </div>
        ) : (
          <p className="text-gray-600 text-center mt-6">
            Vui lòng đăng nhập để sử dụng đánh giá
          </p>
        )}
      </div>
    </div>
  );
}

function ReviewItem({ review, fetchReviews }) {
  const { user } = useSelector((state) => state.auth);
  const [reply, setReply] = useState("");
  const [isReplying, setIsReplying] = useState(false);
  const [rating, setRating] = useState(0);

  const handleReply = async () => {
    // if (!reply.trim()) return alert("Vui lòng nhập nội dung trả lời!");
    // if (rating === 0) return alert("Vui lòng chọn số sao đánh giá!");

    try {
      await axiosInstance.post("/danh_gia/createdanhgia", {
        ma_phong: review.ma_phong,
        noi_dung: reply,
        repcomment: review._id,
        danh_gia_sao: rating,
      });

      setReply("");
      setRating(0);
      setIsReplying(false);
      fetchReviews();
    } catch (error) {
      console.error("Lỗi khi gửi trả lời:", error);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa bình luận này?")) return;

    try {
      await axiosInstance.post(`/danh_gia/deletedanhgia/${review._id}`);
      fetchReviews();
    } catch (error) {
      console.error("Lỗi khi xóa bình luận:", error);
    }
  };

  return (
    <div className="mb-4 p-4 border rounded-lg bg-gray-50">
      <div className="flex flex-col sm:flex-row gap-3">
        <FaUser
          size={30}
          className="border border-gray-500 rounded-full shrink-0 self-start"
        />
        <div className="flex-1">
          <div className="flex justify-between items-center mb-2">
            <p className="font-medium text-lg">{review.user.username}</p>
            <p className="text-gray-500 text-sm">{review.createdAt}</p>
          </div>
          <div className="flex gap-1 mt-2  ">
            {Array(5)
              .fill(0)
              .map((_, index) => (
                <FaStar
                  key={index}
                  size={20}
                  className={
                    index < review.danh_gia_sao ? "text-yellow-400" : "text-gray-300"
                  }
                />
              ))}
          </div>
          <p className="text-black text-base sm:text-lg mt-2">
            {review.noi_dung}
          </p>
          
          <div className="flex flex-wrap gap-4 mt-2">
            <button
              className="text-gray-600 hover:underline flex items-center gap-1"
              onClick={() => setIsReplying(!isReplying)}
            >
              {user ? (
                isReplying ? (
                  "Hủy"
                ) : (
                  <>
                    <FaComment />
                    Trả lời
                  </>
                )
              ) : null}
            </button>

            {user && review.user._id === user._id && (
              <button
                className="text-red-600 hover:underline"
                onClick={handleDelete}
              >
                Thu hồi
              </button>
            )}
          </div>
        </div>
      </div>

      {isReplying && (
        <div className="mt-4 sm:ml-10">
          <textarea
            className="w-full p-2 border rounded-md bg-white focus:ring-2 focus:ring-blue-500 text-sm"
            rows="2"
            placeholder="Nhập câu trả lời..."
            value={reply}
            onChange={(e) => setReply(e.target.value)}
          ></textarea>
          <div className="flex gap-1 mt-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <FaStar
                key={star}
                size={20}
                className={`cursor-pointer ${star <= rating ? "text-yellow-400" : "text-gray-300"}`}
                onClick={() => setRating(star)}
              />
            ))}
          </div>
          <button
            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
            onClick={handleReply}
          >
            Gửi trả lời
          </button>
        </div>
      )}

      {review.replies && review.replies.length > 0 && (
        <div className="mt-4 sm:ml-10 border-l-2 border-gray-300 pl-4">
          {review.replies.map((reply) => (
            <ReviewItem
              key={reply._id}
              review={reply}
              fetchReviews={fetchReviews}
            />
          ))}
        </div>
      )}
    </div>
  );
}