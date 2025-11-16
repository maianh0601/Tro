import "react-toastify/dist/ReactToastify.css";
import test from "../assets/test.png";
import { FaArrowsAlt, FaUserFriends } from "react-icons/fa";
import { useNavigate } from "react-router";
import { formatTienPhong } from "../hook/useMasking";
function CardRoom({
  id,
  price,
  img,
  title,
  number,
  dien_tich,
  address,
  district,
  province,
  ward,
}) {
  const navigate = useNavigate();
  const handleCard = async (e) => {
    try {
      navigate(`/details/${e}`);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div
      className="w-full md:max-w-[300px]  min-h-[430px] flex flex-col justify-between shadow-xl  bg-white p-4 rounded-lg cursor-pointer transition-transform duration-300 hover:scale-105"
      onClick={() => handleCard(id)}
    >
      <div className="w-full min-h-[200px] md:h-[200px] flex items-center justify-center">
        <img
          src={img || test}
          alt="room"
          className="w-full h-full object-cover rounded-md"
        />
      </div>
      <div>
        <p className="2xl:text-lg text-base font-bold text-[#23284C] mt-2">
          {title}
        </p>
        <p className="mt-2 2xl:text-lg text-base text-[#FEBB02] font-bold">
          {formatTienPhong(price)} VND / Tiền cọc
        </p>
      </div>
      <div className="mt-4">
        {address && ward && district && (
          <p className="flex items-center gap-2 lg:text-base text-sm">
            {address}, {ward}, {district}, {province}
          </p>
        )}
      </div>
      <div className="flex justify-between mt-4">
        <p className="flex items-center gap-2 xl:text-xl text-base">
          <FaUserFriends className="2xl:text-2xl text-base text-gray-600" />
          {number}
        </p>
        <p className="flex items-center gap-2 xl:text-xl text-base">
          <FaArrowsAlt className="2xl:text-2xl text-base text-gray-600" />
          {dien_tich}
        </p>
      </div>
    </div>
  );
}

export default CardRoom;
