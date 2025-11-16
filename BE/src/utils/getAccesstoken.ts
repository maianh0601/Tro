/** @format */
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import { Types } from "mongoose";
import { UserVerifyStatus } from "../constants/enum";

dotenv.config();

export const getAccesstoken = async (payload: {
  _id: Types.ObjectId;
  verify: UserVerifyStatus;
}) => {
  const token = jwt.sign(
    payload,
    process.env.JWT_SECRET_ACCESS_TOKEN as string,
    {
      // expiresIn: '10m',
    }
  );
  return token;
};

export const getAccesstokenAdmin = async (payload: {
  _id: Types.ObjectId;
  verify: UserVerifyStatus;
}) => {
  const authorization = jwt.sign(
    payload,
    process.env.JWT_SECRET_ACCESS_TOKEN_ADMIN as string,
    {
      // expiresIn: '10m',
    }
  );
  return authorization;
};

export const signverifyEmailToken = async (payload: {
  _id: Types.ObjectId;
  verify: UserVerifyStatus;
}) => {
  const token = jwt.sign(
    payload,
    process.env.JWT_SECRET_EMAIL_VERIFY_TOKEN as string,
    {
      // expiresIn: '10m',
    }
  );
  return token;
};

export const SignTokenRestPassWord = async (payload: {
  _id: Types.ObjectId;
  verify: UserVerifyStatus;
}) => {
  const token = jwt.sign(
    payload,
    process.env.JWT_SECRET_FORGOT_PASSWORD_TOKEN as string,
    {
      // expiresIn: '10m',
    }
  );
  return token;
};

export const AdminSignTokenRestPassWord = async (payload: {
  _id: Types.ObjectId;
  verify: UserVerifyStatus;
}) => {
  const token = jwt.sign(
    payload,
    process.env.JWT_SECRET_FORGOT_PASSWORD_TOKEN_ADMIN as string,
    {
      // expiresIn: '10m',
    }
  );
  return token;
};

//giải mã tokentoken
export const verifyToken = async (
  token: string,
  secretKey: string
): Promise<any> => {
  try {
    // Giải mã token và trả về payload
    const decoded = jwt.verify(token, secretKey);
    return decoded;
  } catch (error) {
    throw new Error("Token không hợp lệ hoặc đã hết hạn");
  }
};
