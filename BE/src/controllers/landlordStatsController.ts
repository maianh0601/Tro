import { Response } from "express";
import PhongTroModel from "../models/PhongTroModel";
import yeuthichModel from "../models/YeuThichModel";
import DanhGiaModel from "../models/DanhGiaModel";
import Electricity from "../models/Electricity";

// Lấy danh sách mã phòng của chủ trọ
const getLandlordRoomCodes = async (landlordId: string): Promise<string[]> => {
  const rooms = await PhongTroModel.find({ id_chu_tro: landlordId }).select("ma_phong");
  return rooms.map(room => room.ma_phong);
};

export const getLandlordYeuThichStats = async (req: any, res: Response) => {
  try {
    const { user } = req;
    const { ngay, thang, nam } = req.query;

    const roomCodes = await getLandlordRoomCodes(user._id.toString());
    
    if (roomCodes.length === 0) {
      return res.status(200).json({
        status: "200",
        data: {
          yeuThichTheoPhong: [],
          yeuThichTheoNgay: [],
          yeuThichTheoThang: [],
          yeuThichTheoNam: [],
        }
      });
    }

    const filterByDate = (startDate: Date, endDate: Date) => ({
      createdAt: { $gte: startDate, $lte: endDate },
      ma_phong: { $in: roomCodes }
    });

    const currentDate = new Date();
    const defaultYear = nam || currentDate.getFullYear().toString();
    const defaultMonth = thang || String(currentDate.getMonth() + 1).padStart(2, "0");

    let matchCondition = { ma_phong: { $in: roomCodes } };
    if (ngay) {
      Object.assign(matchCondition, filterByDate(
        new Date(`${defaultYear}-${defaultMonth}-${String(ngay).padStart(2, "0")}T00:00:00.000Z`),
        new Date(`${defaultYear}-${defaultMonth}-${String(ngay).padStart(2, "0")}T23:59:59.999Z`)
      ));
    } else if (thang) {
      Object.assign(matchCondition, filterByDate(
        new Date(`${defaultYear}-${String(thang).padStart(2, "0")}-01T00:00:00.000Z`),
        new Date(parseInt(defaultYear), parseInt(thang) - 1 + 1, 0, 23, 59, 59, 999)
      ));
    } else if (nam) {
      Object.assign(matchCondition, filterByDate(
        new Date(`${defaultYear}-01-01T00:00:00.000Z`),
        new Date(`${defaultYear}-12-31T23:59:59.999Z`)
      ));
    }

    const aggregateByPhong = (condition: any) =>
      yeuthichModel.aggregate([
        { $match: condition },
        {
          $group: {
            _id: "$ma_phong",
            soLuotYeuThich: { $sum: 1 },
          },
        },
        {
          $lookup: {
            from: "phongtros",
            localField: "_id",
            foreignField: "ma_phong",
            as: "thongTinPhong",
          },
        },
        { $unwind: "$thongTinPhong" },
        {
          $project: {
            maPhong: "$_id",
            tenPhong: "$thongTinPhong.ten_phong_tro",
            soLuotYeuThich: "$soLuotYeuThich",
            _id: 0,
          },
        },
        { $sort: { soLuotYeuThich: -1 } },
      ]);

    const [yeuThichTheoPhong, yeuThichTheoNgay, yeuThichTheoThang, yeuThichTheoNam] = await Promise.all([
      aggregateByPhong({ ma_phong: { $in: roomCodes } }),
      aggregateByPhong(ngay ? matchCondition : filterByDate(
        new Date(new Date().setHours(0, 0, 0, 0)),
        new Date(new Date().setHours(23, 59, 59, 999))
      )),
      aggregateByPhong(thang ? matchCondition : filterByDate(
        new Date(currentDate.getFullYear(), currentDate.getMonth(), 1),
        new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0, 23, 59, 59, 999)
      )),
      aggregateByPhong(nam ? matchCondition : filterByDate(
        new Date(currentDate.getFullYear(), 0, 1),
        new Date(currentDate.getFullYear(), 11, 31, 23, 59, 59, 999)
      )),
    ]);

    res.status(200).json({
      status: "200",
      data: {
        yeuThichTheoPhong,
        yeuThichTheoNgay,
        yeuThichTheoThang,
        yeuThichTheoNam,
      },
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getLandlordDanhGiaStats = async (req: any, res: Response) => {
  try {
    const { user } = req;
    const { ngay, thang, nam } = req.query;

    const roomCodes = await getLandlordRoomCodes(user._id.toString());
    
    if (roomCodes.length === 0) {
      return res.status(200).json({
        status: "200",
        data: {
          danhGiaTheoTungNgay: [],
          danhGiaTheoNgay: [],
          danhGiaTheoThang: [],
          danhGiaTheoNam: [],
        }
      });
    }

    const filterByDate = (startDate: Date, endDate: Date) => ({
      createdAt: { $gte: startDate, $lte: endDate },
      ma_phong: { $in: roomCodes }
    });

    const currentDate = new Date();
    const defaultYear = nam || currentDate.getFullYear().toString();
    const defaultMonth = thang || String(currentDate.getMonth() + 1).padStart(2, "0");

    let matchCondition = { ma_phong: { $in: roomCodes } };
    if (ngay) {
      Object.assign(matchCondition, filterByDate(
        new Date(`${defaultYear}-${defaultMonth}-${String(ngay).padStart(2, "0")}T00:00:00.000Z`),
        new Date(`${defaultYear}-${defaultMonth}-${String(ngay).padStart(2, "0")}T23:59:59.999Z`)
      ));
    } else if (thang) {
      Object.assign(matchCondition, filterByDate(
        new Date(`${defaultYear}-${String(thang).padStart(2, "0")}-01T00:00:00.000Z`),
        new Date(parseInt(defaultYear), parseInt(thang) - 1 + 1, 0, 23, 59, 59, 999)
      ));
    } else if (nam) {
      Object.assign(matchCondition, filterByDate(
        new Date(`${defaultYear}-01-01T00:00:00.000Z`),
        new Date(`${defaultYear}-12-31T23:59:59.999Z`)
      ));
    }

    const getFullReviews = (condition: any) =>
      DanhGiaModel.aggregate([
        { $match: condition },
        {
          $lookup: {
            from: "phongtros",
            localField: "ma_phong",
            foreignField: "ma_phong",
            as: "thongTinPhong",
          },
        },
        { $unwind: "$thongTinPhong" },
        {
          $project: {
            maPhong: "$ma_phong",
            time: { $dateToString: { format: "%Y-%m-%d %H:%M:%S", date: "$createdAt" } },
            tenPhong: "$thongTinPhong.ten_phong_tro",
            noiDung: "$noi_dung",
          },
        },
        { $sort: { time: 1 } },
      ]);

    const [danhGiaTheoTungNgay, danhGiaTheoNgay, danhGiaTheoThang, danhGiaTheoNam] = await Promise.all([
      getFullReviews(matchCondition),
      getFullReviews(ngay ? matchCondition : filterByDate(
        new Date(new Date().setHours(0, 0, 0, 0)),
        new Date(new Date().setHours(23, 59, 59, 999))
      )),
      getFullReviews(thang ? matchCondition : filterByDate(
        new Date(currentDate.getFullYear(), currentDate.getMonth(), 1),
        new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0, 23, 59, 59, 999)
      )),
      getFullReviews(nam ? matchCondition : filterByDate(
        new Date(currentDate.getFullYear(), 0, 1),
        new Date(currentDate.getFullYear(), 11, 31, 23, 59, 59, 999)
      )),
    ]);

    res.status(200).json({
      status: "200",
      data: {
        danhGiaTheoTungNgay,
        danhGiaTheoNgay,
        danhGiaTheoThang,
        danhGiaTheoNam,
      },
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getLandlordDienNangStats = async (req: any, res: Response) => {
  try {
    const { user } = req;
    const { ngay, thang, nam } = req.query;

    const rooms = await PhongTroModel.find({ id_chu_tro: user._id.toString() }).select("_id");
    const roomIds = rooms.map(room => room._id.toString());
    
    if (roomIds.length === 0) {
      return res.status(200).json({
        status: "200",
        data: {
          dienNangTheoTungNgay: [],
          dienNangTheoNgay: [],
          dienNangTheoThang: [],
          dienNangTheoNam: [],
        }
      });
    }

    const filterByDate = (startDate: Date, endDate: Date) => ({
      timestamp: { $gte: startDate, $lte: endDate },
      room_id: { $in: roomIds }
    });

    const currentDate = new Date();
    const defaultYear = nam || currentDate.getFullYear().toString();
    const defaultMonth = thang || String(currentDate.getMonth() + 1).padStart(2, "0");

    let matchCondition = { room_id: { $in: roomIds } };
    if (ngay) {
      Object.assign(matchCondition, filterByDate(
        new Date(`${defaultYear}-${defaultMonth}-${String(ngay).padStart(2, "0")}T00:00:00.000Z`),
        new Date(`${defaultYear}-${defaultMonth}-${String(ngay).padStart(2, "0")}T23:59:59.999Z`)
      ));
    } else if (thang) {
      Object.assign(matchCondition, filterByDate(
        new Date(`${defaultYear}-${String(thang).padStart(2, "0")}-01T00:00:00.000Z`),
        new Date(parseInt(defaultYear), parseInt(thang) - 1 + 1, 0, 23, 59, 59, 999)
      ));
    } else if (nam) {
      Object.assign(matchCondition, filterByDate(
        new Date(`${defaultYear}-01-01T00:00:00.000Z`),
        new Date(`${defaultYear}-12-31T23:59:59.999Z`)
      ));
    }

    const aggregateByRoom = (condition: any) =>
      Electricity.aggregate([
        { $match: condition },
        {
          $group: {
            _id: "$room_id",
            totalEnergy: { $sum: "$energy" },
            totalCost: { $sum: "$total_cost" },
            latestTimestamp: { $max: "$timestamp" },
          },
        },
        {
          $project: {
            room_id: "$_id",
            energy: "$totalEnergy",
            total_cost: "$totalCost",
            timestamp: "$latestTimestamp",
            _id: 0,
          },
        },
        { $sort: { timestamp: -1 } },
      ]);

    const dienNangTheoTungNgay = await Electricity.aggregate([
      { $match: matchCondition },
      {
        $group: {
          _id: {
            room_id: "$room_id",
            date: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } },
          },
          totalEnergy: { $sum: "$energy" },
          totalCost: { $sum: "$total_cost" },
          latestTimestamp: { $max: "$timestamp" },
        },
      },
      {
        $project: {
          room_id: "$_id.room_id",
          date: "$_id.date",
          energy: "$totalEnergy",
          total_cost: "$totalCost",
          timestamp: "$latestTimestamp",
          _id: 0,
        },
      },
      { $sort: { timestamp: -1 } },
    ]);

    const [dienNangTheoThang, dienNangTheoNam] = await Promise.all([
      aggregateByRoom(thang ? matchCondition : filterByDate(
        new Date(currentDate.getFullYear(), currentDate.getMonth(), 1),
        new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0, 23, 59, 59, 999)
      )),
      aggregateByRoom(nam ? matchCondition : filterByDate(
        new Date(currentDate.getFullYear(), 0, 1),
        new Date(currentDate.getFullYear(), 11, 31, 23, 59, 59, 999)
      )),
    ]);

    res.status(200).json({
      status: "200",
      data: {
        dienNangTheoTungNgay,
        dienNangTheoNgay: dienNangTheoTungNgay,
        dienNangTheoThang,
        dienNangTheoNam,
      },
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

