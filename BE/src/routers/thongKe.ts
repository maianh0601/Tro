import { getDanhGiaChartData, getDienNangChartData, getYeuThichChartData } from '../controllers/thongKeController';
import { Router } from 'express';

const routerThongKe = Router();
routerThongKe.get('/chart-yeu-tich', getYeuThichChartData);
routerThongKe.get('/chart-danh-gia', getDanhGiaChartData);
routerThongKe.get('/chart-dien-nang', getDienNangChartData);

export default routerThongKe