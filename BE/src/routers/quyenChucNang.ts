import {Router} from 'express'
import { CheckQuyen, CreatQuyenChucNang } from '../controllers/quyenChucNang'
const  QuyenChucNangRouter =Router()

QuyenChucNangRouter.post('/CreatQuyen',CreatQuyenChucNang)
// kiểm tra xem thử trong model quyenchucnang có id_chuc_nang trungf với id trong model chucnang không nếu trung fthif đánh dáu check 
QuyenChucNangRouter.post('/CheckQuyen/:id',CheckQuyen)

export default QuyenChucNangRouter
