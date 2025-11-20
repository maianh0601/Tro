import { Request, Response } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";

// Cấu hình multer để lưu file
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = "uploads/images";
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error("Chỉ chấp nhận file ảnh!"));
    }
  },
});

export const uploadSingle = upload.single("image");
export const uploadMultiple = upload.array("images", 10);

export const uploadImage = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Không có file được upload" });
    }

    const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 5000}`;
    const fileUrl = `${baseUrl}/uploads/images/${req.file.filename}`;
    res.status(200).json({
      message: "Upload thành công",
      url: fileUrl,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const uploadImages = async (req: Request, res: Response) => {
  try {
    if (!req.files || (req.files as Express.Multer.File[]).length === 0) {
      return res.status(400).json({ message: "Không có file được upload" });
    }

    const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 5000}`;
    const files = req.files as Express.Multer.File[];
    const urls = files.map(
      (file) => `${baseUrl}/uploads/images/${file.filename}`
    );

    res.status(200).json({
      message: "Upload thành công",
      urls: urls,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

