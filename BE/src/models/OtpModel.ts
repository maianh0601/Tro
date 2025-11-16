import mongoose, { Schema } from 'mongoose';

const OtpSchema = new Schema(
    {
        email: {
            type: String,
            required: true,
        },
        otp: {
            type: String,
            required: true,
        },
        expiresAt: {
            type: Date,
            required: true,
        },
    },
    { timestamps: true }
);

const OtpModel = mongoose.model('Otp', OtpSchema);
export default OtpModel;
