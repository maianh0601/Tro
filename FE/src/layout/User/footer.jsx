import logo from "../../assets/logo/logo.svg";
import twitter from "../../assets/icon/twitter.png";
import linker from "../../assets/icon/linker.png";

function Footer() {
  return (
    <footer className="w-full bg-[#1C1E3A] text-white py-8">
      <div className="w-full px-4 lg:px-[150px] mx-auto">
        <div className="flex flex-wrap justify-between">
          <div className="mb-6">
            <img src={logo} className="h-10" alt="Logo" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-16 text-sm">
            <div>
              <h3 className="font-semibold text-xl mb-8">THÔNG TIN</h3>
              <ul className="space-y-1">
                <li className="text-base">Điều khoản & Cam kết</li>
                <li className="text-base">Quy chế hoạt động</li>
                <li className="text-base">Giải quyết khiếu nại</li>
                <li className="text-base">Blog</li>
                <li className="text-base">Chính sách bảo mật</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-xl mb-8">DỊCH VỤ KHÁCH HÀNG</h3>
              <ul className="space-y-1">
                <li className="text-base">Liên hệ</li>
                <li className="text-base">Câu hỏi thường gặp</li>
                <li className="text-base">Hỗ trợ trực tuyến</li>
                <li className="text-base">Chính sách hủy</li>
                <li className="text-base">Chính sách đặt phòng</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-xl mb-8">KHÁM PHÁ</h3>
              <ul className="space-y-1">
                <li className="text-base">Điểm đến</li>
                <li className="text-base">Ưu đãi đặc biệt</li>
                <li className="text-base">Khuyến mãi giờ chót</li>
                <li className="text-base">Hướng dẫn du lịch</li>
                <li className="text-base">Blog & Mẹo du lịch</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-xl mb-8">HỖ TRỢ</h3>
              <ul className="space-y-1">
                <li className="text-base">Chính sách bảo mật</li>
                <li className="text-base">Điều khoản & Điều kiện</li>
                <li className="text-base">Trợ năng</li>
                <li className="text-base">Góp ý & Đề xuất</li>
                <li className="text-base">Sơ đồ trang</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-xl mb-8">THÀNH VIÊN</h3>
              <ul className="space-y-1">
                <li className="text-base">Chương trình khách hàng thân thiết</li>
                <li className="text-base">Ưu đãi độc quyền</li>
                <li className="text-base">Tích điểm & Quyền lợi</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Line */}
        <div className="border-t border-gray-600 my-6"></div>

        {/* Footer bottom */}
        <div className="flex flex-col md:flex-row justify-between items-center text-sm">
          <p>© 2024 Phạm Văn Tư ,Trần Minh Hưng,Nguyễn Trung HùngHùng.</p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <img src={linker} alt="Biểu tượng Linker" className="h-6" />
            <img src={twitter} alt="Biểu tượng Twitter" className="h-6" />
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
