import {Router} from 'express'
import { TransactionController, TransactionThang } from '../controllers/nganHangController'
const nganHangRouter=Router()


nganHangRouter.post('/transaction', TransactionController)
nganHangRouter.post('/transactionThang', TransactionThang)


export default nganHangRouter