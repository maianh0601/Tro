import { Request, Response } from 'express';
import QuyenService from '../services/QuyenService';
import QuyensModel from '../models/QuyenModel';
import ChucNangModel from '../models/ChucNangModel';

const quyenService = new QuyenService();
export const storeQuyen = async (req: Request, res: Response) => {
    try {
        const body = req.body;
        const result = await quyenService.createQuyen(body);
        res.status(200).json({ message: "Tạo quyền thành công!", data: result });
    } catch (error: any) {
        return res.status(500).json({ message: error.message });
    }
};

export const updateQuyen = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const body = req.body;
        const updatedQuyen = await quyenService.updateQuyen(id, body);

        if (!updatedQuyen) {
            return res.status(404).json({ message: "Không tìm thấy quyền!" });
        }

        res.status(200).json({ message: "Cập nhật quyền thành công!", data: updatedQuyen });
    } catch (error: any) {
        return res.status(500).json({ message: error.message });
    }
};

export const deleteQuyen = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const result = await quyenService.DeleteQuyen(id);

        if (!result) {
            return res.status(404).json({ message: "Không tìm thấy quyền!" });
        }

        res.status(200).json({ message: "Xóa quyền thành công!" });
    } catch (error: any) {
        return res.status(500).json({ message: error.message });
    }
};

export const getQuyen = async (req: Request, res: Response) => {
    try {
   
        const data = await quyenService.getQuyen();

        if (!data || data.length === 0) {
            return res.status(404).json({ message: "Không có quyền nào!" });
        }

        res.status(200).json({ message: "Lấy danh sách quyền thành công!", data });
    } catch (error: any) {
        return res.status(500).json({ message: error.message });
    }
};

export const updateStatusQuyen = async (req:any, res:any) => {
    try {
      const { id } = req.params;
      const { trang_thai } = req.body;
      const updatedQuyen = await QuyensModel.findByIdAndUpdate(id, { trang_thai }, { new: true });
  
      if (!updatedQuyen) {
        return res.status(404).json({ success: false, message: "Không tìm thấy quyền!" });
      }
  
      res.status(200).json({ success: true, message: "Cập nhật trạng thái thành công!", data: updatedQuyen });
    } catch (error:any) {
      res.status(500).json({ success: false, message: "Lỗi server!", error: error.message });
    }
  };

  export const getFunctions = async (req: Request, res: Response) => {
    try {
        const functions = await ChucNangModel.find()
        res.status(200).json({ success: true, data: functions });
    } catch (error: any) {
        res.status(500).json({ success: false, message: "Lỗi server!", error: error.message });
    }
};
