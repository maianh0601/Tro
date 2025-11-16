import mongoose, { Schema } from 'mongoose';

const NganHangSchema = new Schema(
    {
        //transaction Date
        ngayGiaoDich: {
            type: String,
            required: true,
        },

        //account No
        soTaiKhoan: {
            type: String,
            required: true,
        },

        //credit Amount
        soTienGhi: {
            type: Number,
            required: true,
        },

        //currency (VND, USD, EUR, ...)
        tienTe: {
            type: String,
            required: true,
        },

        //description
        moTa: {
            type: String,
            required: true,
        },
    },
    { timestamps: true }
);

const NganHangModel = mongoose.model('nganhang', NganHangSchema);
export default NganHangModel;
