import {Router} from 'express'
import { send } from 'process'
import { CreateOtp, VerifyOtp } from '../controllers/OtpController'
import { accessTokenValidatetor } from '../middlewares/user.middleware'
const OtpRouter=Router()

OtpRouter.post('/sendOtp',accessTokenValidatetor,CreateOtp),
OtpRouter.post('/verifyOtp',accessTokenValidatetor,VerifyOtp)
export default OtpRouter