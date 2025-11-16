import { ObjectId } from 'mongodb';
import mongoose, { Schema } from 'mongoose';

const YeuThichSchema = new Schema(
    {
        ma_phong: {
            type:String,
            required: true,
        },

        id_user: {
            type: ObjectId,
            required: true,
        }
    },
    { timestamps: true }
);

const yeuthichModel = mongoose.model('Yeu_thichs', YeuThichSchema);
export default yeuthichModel;
