import DichVuModel from "../models/DichVuModel";
import { ObjectId } from "mongodb";
class DichVuService {
  async CreatDichVu(data: any) {
    const dichVu = new DichVuModel({
      tien_dien: data.tien_dien,
      tien_nuoc: data.tien_nuoc,
      tien_wifi: data.tien_wifi,
    });
    await dichVu.save();
  }

  async DeleteDichVu(_id: any) {
    await DichVuModel.findByIdAndDelete(_id);
  }

  async UpdateDichVu(_id: any, data: any) {
    const id = new ObjectId(_id);
    const { tien_dien, tien_nuoc, tien_wifi } = data;

    // Kiểm tra id DichVu cần cập nhật có tồn tại không
    const dichVu = await DichVuModel.findById(id);
    if (!dichVu) {
      throw new Error("DichVu không tồn tại");
    }
    (dichVu.tien_dien = tien_dien ?? dichVu.tien_dien),
      (dichVu.tien_nuoc = tien_nuoc ?? dichVu.tien_nuoc),
      (dichVu.tien_wifi = tien_wifi ?? dichVu.tien_wifi),
      // Lưu các thay đổi vào cơ sở dữ liệu
      await dichVu.save();
  }

  async GetAllDichVu() {
    return await DichVuModel.find();
  }
}
export default DichVuService;
