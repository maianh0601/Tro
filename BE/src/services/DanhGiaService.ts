import DanhGiaModel from "../models/DanhGiaModel";

class DanhGiaService {
    async createDanhGia(data: any, userId: any) {
        try {
            const danhGia = new DanhGiaModel(data);
            danhGia.id_user = userId;
            await danhGia.save();
        } catch (error:any) {
            throw new Error(error.message);
        }
    }
    async getDataDanhGia(ma_phong: string) {
        try {
            const danhGia = await DanhGiaModel.aggregate([
                {
                    $match: { ma_phong: ma_phong }
                },
                {
                    $lookup: {
                        from: "users",
                        localField: "id_user",
                        foreignField: "_id",
                        as: "user"
                    }
                },
                {
                    $unwind: "$user"
                },
                {
                    $project: {
                        "user.password": 0,
                        "user.verify": 0,
                        "user.cccd": 0,
                        "user.ngay_sinh": 0,
                        "user.id_quyen": 0,
                        "user.so_dien_thoai": 0,
                        "user.gioi_tinh": 0
                    }
                }
            ]);
            return danhGia;
        } catch (error: any) {
            throw new Error(error.message);
        }
    }
    
    async FindDanhGiaById(id: string) {
      return await DanhGiaModel.findById(id);
  }
  
  async DeleteDanhGia(id: string) {
      try {
          await DanhGiaModel.findByIdAndDelete(id);
      } catch (error: any) {
          throw new Error(error.message);
      }
  }
  
    async topdanhgia(){
        try {
            const danhGia = await DanhGiaModel.aggregate([
                
                    {
                      '$match': {
                        'repcomment': null
                      }
                    }, {
                      '$lookup': {
                        'from': 'phongtros', 
                        'localField': 'ma_phong', 
                        'foreignField': 'ma_phong', 
                        'as': 'phong_info'
                      }
                    }, {
                      '$lookup': {
                        'from': 'users', 
                        'localField': 'id_user', 
                        'foreignField': '_id', 
                        'as': 'user_info'
                      }
                    }, {
                      '$unwind': {
                        'path': '$user_info'
                      }
                    }, {
                      '$unwind': {
                        'path': '$phong_info'
                      }
                    }, {
                      '$project': {
                        'repcomment': 0, 
                        'createdAt': 0, 
                        'updatedAt': 0, 
                        'ma_phong': 0, 
                        'id_user': 0, 
                        'phong_info.id_users': 0, 
                        'phong_info.ma_map': 0, 
                        'phong_info.so_luong_nguoi': 0, 
                        'phong_info.ma_danh_muc': 0, 
                        'phong_info.dien_tich': 0, 
                        'phong_info.createdAt': 0, 
                        'phong_info.updatedAt': 0, 
                        'phong_info.trang_thai': 0, 
                        'phong_info.gia_tien': 0, 
                        'user_info.trang_thai': 0, 
                        'user_info.email': 0, 
                        'user_info.password': 0, 
                        'user_info.id_quyen': 0, 
                        'user_info.ngay_sinh': 0, 
                        'user_info.verify': 0, 
                        'user_info.que_quan': 0, 
                        'user_info.so_dien_thoai': 0, 
                        'user_info.cccd': 0, 
                        'user_info.gioi_tinh': 0, 
                        'user_info.ho_va_ten': 0, 
                        'user_info.createdAt': 0, 
                        'user_info.updatedAt': 0
                      }
                    }
            ]);
            return danhGia;
        } catch (error: any) {
            throw new Error(error.message);
        }
    }
    
}
export default DanhGiaService;