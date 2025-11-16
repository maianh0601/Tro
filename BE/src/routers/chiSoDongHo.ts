import express from 'express';
import { CreatChiSoDongHo } from '../controllers/chiSoDongHo';
import { accessTokenValidatetor } from '../middlewares/user.middleware';
const routeChiSoDongHo = express.Router();

routeChiSoDongHo.post("/CreatChiSoDongHo",accessTokenValidatetor,CreatChiSoDongHo);

export default routeChiSoDongHo;    