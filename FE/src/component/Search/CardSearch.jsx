import { FaArrowsAlt, FaMapMarkerAlt, FaUserFriends } from "react-icons/fa";
import { useNavigate } from "react-router";

function CardSearch({
  ma_phong,
  img,
  title,
  noidung,
  number,
  dientich,
  diachi,
  giatien,
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
    <div className="flex flex-col md:flex-row gap-4 md:gap-[31px] px-4 md:px-[15px] items-center border border-gray-500 rounded-lg">
      <img
        src={img}
        alt=""
        className="min-w-[285px] xl:w-[285px] xl:h-[200px] object-cover pt-4 md:pt-0"
      />
      <div className="w-full h-auto md:h-[240px] flex flex-col justify-between py-4 md:py-5">
        <div className="flex flex-col md:flex-row justify-between items-start">
          <p className="text-base md:text-lg xl:text-xl 2xl:text-2xl">
            {title}
          </p>
          <div className="flex gap-2 justify-end items-center mt-2 md:mt-0">
            <p className="flex items-center gap-1 xl:gap-2 text-base md:text-lg xl:text-xl">
              <FaUserFriends className="text-lg md:text-xl xl:text-2xl text-gray-600" />
              {number}
            </p>
            <p className="flex items-center gap-1 xl:gap-2 text-base md:text-lg xl:text-xl">
              <FaArrowsAlt className="text-lg md:text-xl xl:text-2xl text-gray-600" />
              {dientich}
            </p>
          </div>
        </div>
        <p className="text-gray-700 text-sm md:text-base 2xl:text-lg mt-1">
          {noidung}
        </p>
        <div className="flex gap-2 mt-3">
          <FaMapMarkerAlt className="text-[#23274A] text-lg" />
          <p className="text-sm">Khu vực {diachi}</p>
        </div>

        <div>
          <div className="flex justify-between items-center mt-4">
            <p className="text-lg font-bold text-red-600">
              {giatien ? `${giatien.toLocaleString()} đ/tháng` : ""}
            </p>
            <button
              className="bg-[#23284C] text-white rounded-lg text-lg py-[10px] px-[36px]"
              onClick={() => handleCard(ma_phong)}
            >
              Xem
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CardSearch;
