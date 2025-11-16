import MapModel from "../models/MapModel";

interface MapData {
  ma_map: string;
  address: string;
  district: string;
  latitude: number;
  longitude: number;
  province: string;
  ward: string;
}
class MapService {
  async CreateMap(data: MapData) {
    const map = new MapModel(data);
    if(data.ma_map === "") {
      throw new Error("Mã bản đồ không được để trống");
    }
    if(data.address === "") {
      throw new Error("Địa chỉ không được để trống");
    }
    if(data.district === "") {
      throw new Error("Quận huyện không được để trống");
    }
    if(data.latitude === 0) {
      throw new Error("Vĩ độ không được để trống");
    }
    if(data.longitude === 0) {
      throw new Error("Kinh độ không được để trống");
    }
    if(data.province === "") {
      throw new Error("Tỉnh thành không được để trống");
    }
    if(data.ward === "") {
      throw new Error("Phường xã không được để trống");
    }
    const chekCodeMap = await MapModel.findOne({ ma_map: data.ma_map });
    if (chekCodeMap) {
      throw new Error("Mã bản đồ đã tồn tại");
    }
    const savedMap = await map.save();
    return savedMap;
  }

  async DeleteMap(_id: any) {
    await MapModel.findByIdAndDelete(_id);
  }

  async UpdateMap(id: any, updateData: any) {
    const existingMap = await MapModel.findOne({ ma_map: updateData.ma_map });
    if (existingMap && existingMap._id.toString() !== id) {
      throw new Error("Mã bản đồ đã tồn tại");
    }
    await MapModel.findByIdAndUpdate(id, {
      ma_map: updateData.ma_map,
      address: updateData.address,
      district: updateData.district,
      latitude: updateData.latitude,
      longitude: updateData.longitude,
      province: updateData.province,
      ward: updateData.ward,
    });
  }

  async GetAllMap() {
    return await MapModel.find();
  }
}
export default MapService;
