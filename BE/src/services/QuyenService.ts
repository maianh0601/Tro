import QuyensModel from "../models/QuyenModel";

class QuyenService {
     async createQuyen(data: any) {
        const newQuyen = new QuyensModel(data);
        return await newQuyen.save();
    }

    async updateQuyen(id: any, data: any) {
        const updatedQuyen = await QuyensModel.findByIdAndUpdate(id, data, { new: true });
        return updatedQuyen;
    }

    async DeleteQuyen(_id: any) {
        const DeleteQuyen = await QuyensModel.findByIdAndDelete({_id});
       return DeleteQuyen
    }

    async getQuyen() {
        const getQuyen = await QuyensModel.find()
        return getQuyen;
    }
}
export default QuyenService;
