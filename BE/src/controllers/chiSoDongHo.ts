import {Request , Response} from 'express';
import ChiSoDongHoService from '../services/ChiSoDongHoService';

export const CreatChiSoDongHo = async (req: Request, res: Response) => {
    try {
        const {user}:any = req;
        const data = req.body;
            const chisodongho =new ChiSoDongHoService;
            await chisodongho.createChiSoDongHo(user._id,data);
 
        res.status(200).json({ message: 'Thêm chỉ số đồng hồ thành công' });
    } catch (error) {
        console.error('Lỗi khi thêm chỉ số đồng hồ:', error);
        res.status(500).json({ message: 'Thêm chỉ số đồng hồ thất bại' });
    }
}