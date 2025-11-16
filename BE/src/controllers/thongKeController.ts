import { Request, Response } from "express";
import { ThongKeSevice } from "../services/thongKeServiece";

export const getYeuThichChartData = async (req: Request, res: Response) => {
  try {
    const { ngay, thang, nam } = req.query;
    const thongKeYeuThich = new ThongKeSevice();
    const chartData = await thongKeYeuThich.getChartData({
      ngay: ngay as string,
      thang: thang as string,
      nam: nam as string,
    });

    res.status(200).json({
      status: "200",
      data: chartData,
    });
  } catch (error: any) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const getDanhGiaChartData = async (req: Request, res: Response) => {
  try {
    const { ngay, thang, nam } = req.query;
    const thongKeDanhGia = new ThongKeSevice();
    const chartData = await thongKeDanhGia.getChartDanhGia({
      ngay: ngay as string,
      thang: thang as string,
      nam: nam as string,
    });

    res.status(200).json({
      status: "200",
      data: chartData,
    });
  } catch (error: any) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const getDienNangChartData = async (req: Request, res: Response) => {
  try {
    const { ngay, thang, nam } = req.query;
    const thongKeDanhGia = new ThongKeSevice();
    const chartData = await thongKeDanhGia.getChartDienNang({
      ngay: ngay as string,
      thang: thang as string,
      nam: nam as string,
    });

    res.status(200).json({
      status: "200",
      data: chartData,
    });
  } catch (error: any) {
    res.status(500).json({
      message: error.message,
    });
  }
};
