import { ObjectId } from "mongodb";
import yeuthichModel from "../models/YeuThichModel";
import DanhGiaModel from "../models/DanhGiaModel";
import Electricity from "../models/Electricity";

export class ThongKeSevice {
  async getChartData({
    ngay,
    thang,
    nam,
  }: {
    ngay?: string;
    thang?: string;
    nam?: string;
  }): Promise<any> {
    // Hàm lọc theo khoảng thời gian
    const filterByDate = (startDate: Date, endDate: Date) => ({
      createdAt: { $gte: startDate, $lte: endDate },
    });

    // Lấy năm, tháng, ngày hiện tại làm mặc định nếu thiếu tham số
    const currentDate = new Date();
    const defaultYear = nam || currentDate.getFullYear().toString();
    const defaultMonth =
      thang || String(currentDate.getMonth() + 1).padStart(2, "0");
    const defaultDay = ngay || String(currentDate.getDate()).padStart(2, "0");

    // Xác định khoảng thời gian dựa trên params
    let matchCondition = {};
    if (ngay) {
      // Lọc theo ngày cụ thể
      matchCondition = filterByDate(
        new Date(
          `${defaultYear}-${defaultMonth}-${String(ngay).padStart(
            2,
            "0"
          )}T00:00:00.000Z`
        ),
        new Date(
          `${defaultYear}-${defaultMonth}-${String(ngay).padStart(
            2,
            "0"
          )}T23:59:59.999Z`
        )
      );
    } else if (thang) {
      // Lọc theo tháng
      matchCondition = filterByDate(
        new Date(
          `${defaultYear}-${String(thang).padStart(2, "0")}-01T00:00:00.000Z`
        ),
        new Date(
          parseInt(defaultYear),
          parseInt(thang) - 1 + 1,
          0,
          23,
          59,
          59,
          999
        )
      );
    } else if (nam) {
      // Lọc theo năm
      matchCondition = filterByDate(
        new Date(`${defaultYear}-01-01T00:00:00.000Z`),
        new Date(`${defaultYear}-12-31T23:59:59.999Z`)
      );
    } else {
      // Mặc định lấy ngày hiện tại nếu không có tham số
      matchCondition = filterByDate(
        new Date(currentDate.setHours(0, 0, 0, 0)),
        new Date(currentDate.setHours(23, 59, 59, 999))
      );
    }

    // Aggregation pipeline để tổng hợp dữ liệu theo ma_phong
    const aggregateByPhong = (matchCondition: any) =>
      yeuthichModel.aggregate([
        { $match: matchCondition },
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

    // 1. Yêu thích theo phòng (tổng hợp tất cả, không lọc thời gian)
    const yeuThichTheoPhong = await yeuthichModel.aggregate([
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
      { $limit: 10 },
    ]);

    // 2. Yêu thích theo ngày (tổng hợp theo ngày)
    const yeuThichTheoNgay = ngay
      ? await aggregateByPhong(
          filterByDate(
            new Date(
              `${defaultYear}-${defaultMonth}-${String(ngay).padStart(
                2,
                "0"
              )}T00:00:00.000Z`
            ),
            new Date(
              `${defaultYear}-${defaultMonth}-${String(ngay).padStart(
                2,
                "0"
              )}T23:59:59.999Z`
            )
          )
        )
      : await aggregateByPhong(
          filterByDate(
            new Date(currentDate.setHours(0, 0, 0, 0)),
            new Date(currentDate.setHours(23, 59, 59, 999))
          )
        );

    // 3. Yêu thích theo tháng (tổng hợp theo tháng)
    const yeuThichTheoThang = thang
      ? await aggregateByPhong(
          filterByDate(
            new Date(
              `${defaultYear}-${String(thang).padStart(
                2,
                "0"
              )}-01T00:00:00.000Z`
            ),
            new Date(
              parseInt(defaultYear),
              parseInt(thang) - 1 + 1,
              0,
              23,
              59,
              59,
              999
            )
          )
        )
      : await aggregateByPhong(
          filterByDate(
            new Date(currentDate.getFullYear(), currentDate.getMonth(), 1),
            new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)
          )
        );

    // 4. Yêu thích theo năm (tổng hợp theo năm)
    const yeuThichTheoNam = nam
      ? await aggregateByPhong(
          filterByDate(
            new Date(`${defaultYear}-01-01T00:00:00.000Z`),
            new Date(`${defaultYear}-12-31T23:59:59.999Z`)
          )
        )
      : await aggregateByPhong(
          filterByDate(
            new Date(currentDate.getFullYear(), 0, 1),
            new Date(currentDate.getFullYear(), 11, 31)
          )
        );

    // Trả về dữ liệu tổng hợp
    return {
      yeuThichTheoPhong,
      yeuThichTheoNgay,
      yeuThichTheoThang,
      yeuThichTheoNam,
    };
  }

  async getChartDanhGia({
    ngay,
    thang,
    nam,
  }: {
    ngay?: string;
    thang?: string;
    nam?: string;
  }): Promise<any> {
    const filterByDate = (startDate: Date, endDate: Date) => ({
      createdAt: { $gte: startDate, $lte: endDate },
    });

    const currentDate = new Date();
    const defaultYear = nam || currentDate.getFullYear().toString();
    const defaultMonth =
      thang || String(currentDate.getMonth() + 1).padStart(2, "0");
    const defaultDay = ngay || String(currentDate.getDate()).padStart(2, "0");

    let matchCondition = {};
    if (ngay) {
      matchCondition = filterByDate(
        new Date(
          `${defaultYear}-${defaultMonth}-${String(ngay).padStart(
            2,
            "0"
          )}T00:00:00.000Z`
        ),
        new Date(
          `${defaultYear}-${defaultMonth}-${String(ngay).padStart(
            2,
            "0"
          )}T23:59:59.999Z`
        )
      );
    } else if (thang) {
      matchCondition = filterByDate(
        new Date(
          `${defaultYear}-${String(thang).padStart(2, "0")}-01T00:00:00.000Z`
        ),
        new Date(
          parseInt(defaultYear),
          parseInt(thang) - 1 + 1,
          0,
          23,
          59,
          59,
          999
        )
      );
    } else if (nam) {
      matchCondition = filterByDate(
        new Date(`${defaultYear}-01-01T00:00:00.000Z`),
        new Date(`${defaultYear}-12-31T23:59:59.999Z`)
      );
    } else {
      matchCondition = filterByDate(
        new Date(currentDate.setHours(0, 0, 0, 0)),
        new Date(currentDate.setHours(23, 59, 59, 999))
      );
    }

    const getFullReviews = (matchCondition: any) =>
      DanhGiaModel.aggregate([
        { $match: matchCondition },
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
            time: {
              $dateToString: {
                format: "%Y-%m-%d %H:%M:%S",
                date: "$createdAt",
              },
            },
            tenPhong: "$thongTinPhong.ten_phong",
            noiDung: "$noi_dung",
          },
        },
        { $sort: { time: 1 } },
      ]);

    // 1. Đánh giá theo từng ngày (chi tiết từng đánh giá trong ngày đó)
    const danhGiaTheoTungNgay = await getFullReviews(matchCondition);

    // 2. Đánh giá theo ngày (chi tiết từng đánh giá trong ngày)
    const danhGiaTheoNgay = ngay
      ? await getFullReviews(
          filterByDate(
            new Date(
              `${defaultYear}-${defaultMonth}-${String(ngay).padStart(
                2,
                "0"
              )}T00:00:00.000Z`
            ),
            new Date(
              `${defaultYear}-${defaultMonth}-${String(ngay).padStart(
                2,
                "0"
              )}T23:59:59.999Z`
            )
          )
        )
      : await getFullReviews(
          filterByDate(
            new Date(currentDate.setHours(0, 0, 0, 0)),
            new Date(currentDate.setHours(23, 59, 59, 999))
          )
        );

    // 3. Đánh giá theo tháng (chi tiết từng đánh giá trong tháng)
    const danhGiaTheoThang = thang
      ? await getFullReviews(
          filterByDate(
            new Date(
              `${defaultYear}-${String(thang).padStart(
                2,
                "0"
              )}-01T00:00:00.000Z`
            ),
            new Date(
              parseInt(defaultYear),
              parseInt(thang) - 1 + 1,
              0,
              23,
              59,
              59,
              999
            )
          )
        )
      : await getFullReviews(
          filterByDate(
            new Date(currentDate.getFullYear(), currentDate.getMonth(), 1),
            new Date(
              currentDate.getFullYear(),
              currentDate.getMonth() + 1,
              0,
              23,
              59,
              59,
              999
            )
          )
        );

    // 4. Đánh giá theo năm (chi tiết từng đánh giá trong năm)
    const danhGiaTheoNam = nam
      ? await getFullReviews(
          filterByDate(
            new Date(`${defaultYear}-01-01T00:00:00.000Z`),
            new Date(`${defaultYear}-12-31T23:59:59.999Z`)
          )
        )
      : await getFullReviews(
          filterByDate(
            new Date(currentDate.getFullYear(), 0, 1),
            new Date(currentDate.getFullYear(), 11, 31, 23, 59, 59, 999)
          )
        );

    return {
      danhGiaTheoTungNgay,
      danhGiaTheoNgay,
      danhGiaTheoThang,
      danhGiaTheoNam,
    };
  }
  
  async getChartDienNang({
    ngay,
    thang,
    nam,
  }: {
    ngay?: string;
    thang?: string;
    nam?: string;
  }): Promise<any> {
    // Hàm lọc theo khoảng thời gian
    const filterByDate = (startDate: Date, endDate: Date) => ({
      timestamp: { $gte: startDate, $lte: endDate },
    });

    // Lấy năm và tháng hiện tại làm mặc định nếu thiếu tham số
    const currentDate = new Date();
    const defaultYear = nam || currentDate.getFullYear().toString();
    const defaultMonth =
      thang || String(currentDate.getMonth() + 1).padStart(2, "0");
    const defaultDay = ngay || String(currentDate.getDate()).padStart(2, "0");

    // Xác định khoảng thời gian cho dienNangTheoTungNgay dựa trên params
    let matchCondition = {};
    if (ngay) {
      // Lọc theo ngày cụ thể
      matchCondition = filterByDate(
        new Date(
          `${defaultYear}-${defaultMonth}-${String(ngay).padStart(
            2,
            "0"
          )}T00:00:00.000Z`
        ),
        new Date(
          `${defaultYear}-${defaultMonth}-${String(ngay).padStart(
            2,
            "0"
          )}T23:59:59.999Z`
        )
      );
    } else if (thang) {
      // Lọc theo tháng
      matchCondition = filterByDate(
        new Date(
          `${defaultYear}-${String(thang).padStart(2, "0")}-01T00:00:00.000Z`
        ),
        new Date(
          parseInt(defaultYear),
          parseInt(thang) - 1 + 1,
          0,
          23,
          59,
          59,
          999
        )
      );
    } else if (nam) {
      // Lọc theo năm
      matchCondition = filterByDate(
        new Date(`${defaultYear}-01-01T00:00:00.000Z`),
        new Date(`${defaultYear}-12-31T23:59:59.999Z`)
      );
    } else {
      // Mặc định lấy ngày hiện tại nếu không có tham số
      matchCondition = filterByDate(
        new Date(currentDate.setHours(0, 0, 0, 0)),
        new Date(currentDate.setHours(23, 59, 59, 999))
      );
    }

    // 1. Điện năng theo từng ngày (tổng hợp theo ngày và phòng, lọc theo params)
    const dienNangTheoTungNgay = await Electricity.aggregate([
      { $match: matchCondition }, // Lọc theo ngày/tháng/năm
      {
        $group: {
          _id: {
            room_id: "$room_id",
            date: {
              $dateToString: { format: "%Y-%m-%d", date: "$timestamp" }, // Tổng hợp theo ngày
            },
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

    // Aggregation pipeline để tổng hợp dữ liệu theo room_id
    const aggregateByRoom = (matchCondition: any) =>
      Electricity.aggregate([
        { $match: matchCondition },
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

    // 2. Điện năng theo ngày (tổng hợp theo ngày cho mỗi phòng)
    // const dienNangTheoNgay = ngay
    //   ? await aggregateByRoom(
    //       filterByDate(
    //         new Date(
    //           `${defaultYear}-${defaultMonth}-${String(ngay).padStart(
    //             2,
    //             "0"
    //           )}T00:00:00.000Z`
    //         ),
    //         new Date(
    //           `${defaultYear}-${defaultMonth}-${String(ngay).padStart(
    //             2,
    //             "0"
    //           )}T23:59:59.999Z`
    //         )
    //       )
    //     )
    //   : await aggregateByRoom(
    //       filterByDate(
    //         new Date(currentDate.setHours(0, 0, 0, 0)),
    //         new Date(currentDate.setHours(23, 59, 59, 999))
    //       )
    //     );

    // 2. Điện năng theo ngày (tính chênh lệch với ngày trước)
    const dienNangTheoNgay = async () => {
      const today = ngay
        ? new Date(
            `${defaultYear}-${defaultMonth}-${String(ngay).padStart(
              2,
              "0"
            )}T00:00:00.000Z`
          )
        : new Date(currentDate.setHours(0, 0, 0, 0));
      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);

      // Lấy dữ liệu ngày hôm nay
      const todayData = await Electricity.aggregate([
        {
          $match: filterByDate(
            today,
            new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999)
          ),
        },
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
      ]);

      // Lấy dữ liệu ngày hôm qua
      const yesterdayData = await Electricity.aggregate([
        {
          $match: filterByDate(
            yesterday,
            new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), 23, 59, 59, 999)
          ),
        },
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
      ]);

      // Tính chênh lệch điện năng
      const result = todayData.map((todayItem) => {
        const yesterdayItem = yesterdayData.find(
          (item) => item.room_id === todayItem.room_id
        );
        const energyDiff = yesterdayItem
          ? todayItem.energy - yesterdayItem.energy
          : todayItem.energy; // Nếu không có dữ liệu ngày trước, giữ nguyên

        return {
          room_id: todayItem.room_id,
          energy: energyDiff,
          total_cost: todayItem.total_cost, // Giữ nguyên total_cost của ngày hiện tại
          timestamp: todayItem.timestamp,
        };
      });

      return result;
    };
    const dienNangChenhLech = await dienNangTheoNgay();

    // 3. Điện năng theo tháng (tổng hợp theo tháng cho mỗi phòng)
    const dienNangTheoThang = thang
      ? await aggregateByRoom(
          filterByDate(
            new Date(
              `${defaultYear}-${String(thang).padStart(
                2,
                "0"
              )}-01T00:00:00.000Z`
            ),
            new Date(
              parseInt(defaultYear),
              parseInt(thang) - 1 + 1,
              0,
              23,
              59,
              59,
              999
            )
          )
        )
      : await aggregateByRoom(
          filterByDate(
            new Date(currentDate.getFullYear(), currentDate.getMonth(), 1),
            new Date(
              currentDate.getFullYear(),
              currentDate.getMonth() + 1,
              0,
              23,
              59,
              59,
              999
            )
          )
        );

    // 4. Điện năng theo năm (tổng hợp theo năm cho mỗi phòng)
    const dienNangTheoNam = nam
      ? await aggregateByRoom(
          filterByDate(
            new Date(`${defaultYear}-01-01T00:00:00.000Z`),
            new Date(`${defaultYear}-12-31T23:59:59.999Z`)
          )
        )
      : await aggregateByRoom(
          filterByDate(
            new Date(currentDate.getFullYear(), 0, 1),
            new Date(currentDate.getFullYear(), 11, 31, 23, 59, 59, 999)
          )
        );

    // Trả về dữ liệu tổng hợp
    return {
      dienNangTheoTungNgay,
      dienNangTheoNgay: dienNangChenhLech,
      dienNangTheoThang,
      dienNangTheoNam,
    };
  }
}
