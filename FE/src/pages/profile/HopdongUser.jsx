import { useEffect, useState } from "react";
import { axiosInstance } from "../../../Axios";
import { toast } from "react-toastify";
import { useMasking } from "../../hook/useMasking";
import OtpVerification from "../../component/Otp";

function HopDongUser() {
  const [dataContract, setDataContract] = useState(null);
  const [modal, setModal] = useState(false);
  const [modal1, setModal1] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { formatDate } = useMasking();
  const fetchDataHopDong = async () => {
    try {
      const dataDetailContract = await axiosInstance.get(
        "/api/contracts/detail"
      );
      setDataContract(dataDetailContract.data.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchDataHopDong();
  }, []);

  const sendOtp = async () => {
    try {
      setIsLoading(true);
      await axiosInstance.post("/Otp/sendOtp");
      setModal(true);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleYeuCauHuyHD = async () => {
    await axiosInstance.post(`/hopdong/yeu_cau_huy_hd/${dataContract._id}`);
  };
  console.log("dataContract", dataContract);
  const handleGiaHanHD = async () => {
    try {
      const res = await axiosInstance.post(
        `/hopdong/gia_han_hop_dong/${dataContract.ma_phong}`
      );
      toast.success(res.data.message);
      fetchDataHopDong();
    } catch (error) {
      toast.error(error.response?.data?.message);
    }
  };
  return (
    <div className="space-y-6 px-4 sm:px-6 lg:px-8">
      {dataContract ? (
        <div>
          <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
            <h3 className="text-lg xl:text-xl font-bold  mb-4">
              Thông tin hợp đồng
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
              <InfoItem
                label="Ngày ký"
                value={formatDate(dataContract.start_date)}
              />
              <InfoItem
                label="Ngày hết hạn"
                value={formatDate(dataContract.end_date)}
              />
            </div>
            <div className="mt-10">
              <span className=" font-medium text-black">Trạng thái</span>
              <div className="mt-2  max-w-full text-sm sm:text-base">
                {dataContract.trang_thai === "da_ky" ? (
                  <span className="inline-block px-3 py-1 font-medium rounded-full bg-green-500 text-white">
                    Đang hiệu lực
                  </span>
                ) : dataContract.trang_thai === "het_han" ? (
                  <span className="inline-block px-3 py-1 font-medium rounded-full bg-red-500 text-white">
                    Hết hạn hợp đồng
                  </span>
                ) : dataContract.trang_thai === "chua_ky" ? (
                  <span className="inline-block px-3 py-1 font-medium rounded-full bg-customBlue text-white">
                    Bạn chưa ký hợp đồng
                  </span>
                ) : dataContract.trang_thai === "yeu_cau_huy_hop_dong" ? (
                  <span className="inline-block px-3 py-1 font-medium rounded-full bg-yellow-500 text-white">
                    Yêu cầu hủy hợp đồng
                  </span>
                ) : (
                  <span className="inline-block px-3 py-1 font-medium rounded-full bg-slate-300 text-black">
                    Trạng thái không xác định
                  </span>
                )}
              </div>
            </div>
            <div className="mt-10 flex flex-col sm:flex-row sm:items-center sm:gap-4 gap-3">
              <button
                onClick={sendOtp}
                className="w-full sm:w-auto flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all duration-200"
              >
                {isLoading ? "Đang gửi OTP..." : "Xem chi tiết"}
              </button>

              <button
                className="w-full sm:w-auto flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all duration-200"
                onClick={handleGiaHanHD}
              >
                Gia hạn hợp đồng thêm 1 năm
              </button>
            </div>
          </div>

          {/* Modal OTP */}
          {modal && (
            <div>
              <OtpVerification nextModal={setModal1} modal={setModal} />
            </div>
          )}

          {/* Modal chi tiết hợp đồng */}
          {modal1 && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-full sm:max-w-2xl  sm:h-auto overflow-y-auto">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Chi tiết hợp đồng
                </h3>
                <div className="space-y-2">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
                    <InfoItem
                      label="Ngày ký"
                      value={formatDate(dataContract.start_date)}
                    />
                    <InfoItem
                      label="Ngày hết hạn"
                      value={formatDate(dataContract.end_date)}
                    />
                  </div>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
                    <InfoItem
                      label="Tiền cọc"
                      value={`${dataContract.tien_coc} VND`}
                    />
                    <div>
                      <span className="text-sm font-medium text-black">
                        Trạng thái
                      </span>
                      {dataContract.trang_thai === "da_ky" ? (
                        <span
                          className="  mt-1 block px-2 py-1 font-medium rounded-full
                        bg-green-100 text-green-800 w-fit"
                        >
                          Đang hiệu lực
                        </span>
                      ) : dataContract.trang_thai === "het_han" ? (
                        <span
                          className="  mt-1 block px-2 py-1 font-medium rounded-full
                        bg-red-100 text-red-800 w-fit"
                        >
                          Hết hạn hợp đồng
                        </span>
                      ) : null}
                    </div>
                  </div>
                  <div className="w-full  py-4">
                    <iframe
                      src={dataContract.file_hop_dong}
                      className="w-full  rounded-lg  h-64 sm:h-[300px] "
                      title="Hợp đồng PDF"
                    />
                    <a
                      href={dataContract.file_hop_dong}
                      download="hopdong.pdf"
                      className="text-blue-500 underline mt-2 block"
                    >
                      Tải hợp đồng đầy đủ
                    </a>
                  </div>
                  <div className="mt-4 flex flex-col sm:flex-row gap-4">
                    <button
                      onClick={handleYeuCauHuyHD}
                      className="w-full px-4 py-2 bg-customBlue text-white rounded-lg hover:bg-red-600 transition-all duration-200 text-sm sm:text-base"
                    >
                      Yêu cầu hủy hợp đồng
                    </button>
                    <button
                      onClick={() => setModal1(false)}
                      className="w-full px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition-all duration-200 text-sm sm:text-base"
                    >
                      Đóng
                    </button>
                  </div>
                </div>

                {/* Buttons responsive */}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-6">
          <p className="text-red-600 text-lg font-medium">
            Bạn chưa có hợp đồng nào
          </p>
        </div>
      )}
    </div>
  );
}
const InfoItem = ({ label, value }) => (
  <div className="space-y-1">
    <span className="text-sm md:text-lg font-medium text-black">{label}</span>
    <p className="text-sm md:text-base">{value}</p>
  </div>
);
export default HopDongUser;
