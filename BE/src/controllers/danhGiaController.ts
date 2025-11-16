import DanhGiaService from "../services/DanhGiaService";
import { Request, Response } from 'express';


const danhGiaService = new DanhGiaService();

export const createDanhGia = async (req: Request, res: Response) => {
    try {
        const { user } = req as any;
        const data = req.body;
        console.log(data);
        await danhGiaService.createDanhGia(data, user._id);
        res.status(200).json({
        message: "Đánh giá đã được tạo thành công",
        });
    } catch (error: any) {
        res.status(404).json({
        message: error.message,
        });
    }
}
export const getDataDanhGia = async (req: Request, res: Response) => {
    try {
        const { ma_phong } = req.params;
        const data = await danhGiaService.getDataDanhGia(ma_phong);

        // Hàm xây dựng cây phản hồi
        const buildCommentTree = (comments: any[]) => {
            const tree: Record<string, any> = {};
            const rootComments: any[] = [];

            comments.forEach(comment => {
                tree[comment._id] = { ...comment, replies: [] };
            });

            comments.forEach(comment => {
                if (comment.repcomment) {
                    if (tree[comment.repcomment]) {
                        tree[comment.repcomment].replies.push(tree[comment._id]);
                    }
                } else {
                    rootComments.push(tree[comment._id]);
                }
            });

            return rootComments;
        };

        const commentTree = buildCommentTree(data);

        res.status(200).json({
            status: 200,
            data: commentTree,
        });
    } catch (error: any) {
        res.status(404).json({
            message: error.message,
        });
    }
};
export const DeleteDanhGia = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const {user}:any = req;
        
        const userId = user._id; // Lấy ID của người dùng hiện tại từ token
        
        const danhGia = await danhGiaService.FindDanhGiaById(id);
        if (!danhGia) {
            return res.status(404).json({ message: "Không tìm thấy đánh giá" });
        }
        // Kiểm tra xem đánh giá này có phải của người đang đăng nhập không
        if (!danhGia.id_user || danhGia.id_user.toString() !== userId.toString()) {
            return res.status(403).json({ message: "Bạn không có quyền xóa đánh giá này" });
        }

        await danhGiaService.DeleteDanhGia(id);
        res.status(200).json({ message: "Đánh giá đã được xóa thành công" });

    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};



export const Topdanhgia = async (req: Request, res: Response) => {
    try {
       const data = await danhGiaService.topdanhgia();
        res.status(200).json({
            message: "lấy danh sách top đánh giá thành công",
            data
        });
    } catch (error: any) {
        res.status(404).json({
            message: error.message,
        });
    }
}
