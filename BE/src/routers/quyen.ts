import {Router} from 'express'
import { deleteQuyen, getFunctions, getQuyen, storeQuyen, updateQuyen, updateStatusQuyen } from '../controllers/quyen';
const RouteQuyen = Router();


RouteQuyen.post('/CreatQuyen',storeQuyen)
RouteQuyen.post('/UpdateQuyen/:id',updateQuyen)
RouteQuyen.post('/DeleteQuyen/:id',deleteQuyen)
RouteQuyen.post('/UpdateStatus/:id',updateStatusQuyen)
RouteQuyen.get('/AllQuyen',getQuyen)
//chức năng
RouteQuyen.get('/GetAllChucNang', getFunctions);
export default RouteQuyen