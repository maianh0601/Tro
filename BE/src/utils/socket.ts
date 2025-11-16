import { Server, Socket } from "socket.io";
import { Server as HttpServer } from "http";
import { verifyToken } from "./getAccesstoken";
import MessagerModel from "../models/MessagerModel";
import QuyensModel from "../models/QuyenModel";
import AdminModel from "../models/AdminModel";
import { parse } from "cookie";
import SuachuaModel from "../models/SuaChuaModel";
class SocketMessager {
  private io: Server;
  private users: Record<string, string> = {};
  private admins: Record<string, string> = {};

  // Khởi tạo SocketMessager với server HTTP
  constructor(httpServer: HttpServer) {
    this.io = new Server(httpServer, {
      cors: {
        origin:
          "http://localhost:3000, http://phongtro.hoclaptrinhiz.com, https://phongtro.hoclaptrinhiz.com",
        methods: ["GET", "POST"],
        credentials: true,
      },
    });
    this.setupMiddleware();
    this.setupEvents();
  }

  // Hàm xác thực token từ client
  private async verifyAuthToken(socket: Socket): Promise<void> {
    const rawCookie = socket.handshake.headers.cookie;
    if (!rawCookie) throw new Error("Không có cookie");

    const cookies = parse(rawCookie);
    const token = cookies.token;
    const tokenAdmin = cookies.tokenAdmin;

    if (!token && !tokenAdmin) {
      throw new Error("Không có accessToken hoặc accessTokenAdmin");
    }

    let decodedAdmin: any = null;
    let decodedUser: any = null;

    if (tokenAdmin) {
      try {
        decodedAdmin = await verifyToken(
          tokenAdmin,
          process.env.JWT_SECRET_ACCESS_TOKEN_ADMIN!
        );
      } catch (err) {
        console.warn("Token admin không hợp lệ");
      }
    }

    if (!decodedAdmin && token) {
      try {
        decodedUser = await verifyToken(
          token,
          process.env.JWT_SECRET_ACCESS_TOKEN!
        );
      } catch (err) {
        console.warn("Token user không hợp lệ");
      }
    }

    if (!decodedAdmin && !decodedUser) {
      throw new Error("Token không hợp lệ!");
    }

    socket.data = {
      admin_id: decodedAdmin?._id,
      user_id: decodedUser?._id,
    };

    if (decodedAdmin?._id) {
      this.admins[decodedAdmin._id] = socket.id;
      console.log("Admin kết nối:", decodedAdmin._id);
    }

    if (decodedUser?._id) {
      this.users[decodedUser._id] = socket.id;
      console.log("User kết nối:", decodedUser._id);
    }
  }

  // Thiết lập middleware để xác thực tất cả kết nối
  private setupMiddleware(): void {
    this.io.use(async (socket: Socket, next) => {
      try {
        await this.verifyAuthToken(socket);
        next();
      } catch (error) {
        console.error("Lỗi xác thực socket:", error);
        next(error instanceof Error ? error : new Error("Lỗi xác thực"));
      }
    });
  }

  private setupEvents(): void {
    this.io.on("connection", (socket: Socket) => {
      // Lắng nghe sự kiện gửi tin nhắn từ client
      socket.on("gui_tin_nhan", (data: { payload: { noi_dung: string } }) => {
        this.handleMessage(socket, data.payload);
      });
      socket.on(
        "admin_gui_tin_nhan",
        (data: { payload: { nguoi_nhan: string; noi_dung: string } }) => {
          this.handleMessageAdmin(socket, data.payload);
        }
      );
      socket.on(
        "notification_Admin",
        (data: {
          payload: {
            id_user: string;
          };
        }) => {
          this.notification(socket, data.payload);
        }
      );
      // Lắng nghe sự kiện ngắt kết nối
      socket.on("disconnect", () => {
        this.handleDisconnect(socket);
      });
    });
  }

  private async handleMessage(
    socket: Socket,
    payload: { noi_dung?: string }
  ): Promise<void> {
    if (!payload || !payload.noi_dung) {
      console.error("Payload không hợp lệ hoặc thiếu 'noi_dung'");
      return;
    }

    const { noi_dung } = payload;
    const { user_id } = socket.data;

    // Xác định người gửi và người nhận
    const nguoi_gui = user_id; // Người gửi là user
    const quyenAdmin = await QuyensModel.findOne({ ten_quyen: "admin" });
    if (!quyenAdmin) {
      console.error("Không tìm thấy quyền admin.");
      return;
    }

    const admin = await AdminModel.findOne({ id_quyen: quyenAdmin._id });
    if (!admin) {
      console.error("Không tìm thấy admin.");
      return;
    }

    const nguoi_nhan = admin._id.toString(); // Người nhận là admin
    if (!noi_dung?.trim() || !nguoi_gui || !nguoi_nhan) {
      console.error("Dữ liệu không hợp lệ khi gửi tin nhắn");
      return;
    }

    try {
      const message = await new MessagerModel({
        nguoi_gui,
        nguoi_nhan,
        noi_dung,
        is_read: false,
      }).save();
      // Gửi lại tin nhắn tới người nhận (admin)
      const receiverSocketId = this.admins[nguoi_nhan];
      if (receiverSocketId) {
        this.io
          .to(receiverSocketId)
          .emit("nhan_tin_nhan", { payload: message });
      }

      // Gửi lại tin nhắn tới người gửi (client)
      socket.emit("nhan_tin_nhan", { payload: message });
    } catch (error) {
      console.error("Lỗi khi lưu và gửi tin nhắn:", error);
    }
  }

  private async handleMessageAdmin(
    socket: Socket,
    payload: { nguoi_nhan: string; noi_dung?: string }
  ): Promise<void> {
    if (!payload || !payload.noi_dung) {
      console.error("Payload không hợp lệ hoặc thiếu 'noi_dung'");
      return;
    }

    const { nguoi_nhan, noi_dung } = payload;
    const { admin_id } = socket.data;
    // Xác định người gửi và người nhận
    const nguoi_gui = admin_id;

    if (!noi_dung?.trim() || !nguoi_gui || !nguoi_nhan) {
      console.error("Dữ liệu không hợp lệ khi gửi tin nhắn admin");
      return;
    }

    try {
      const message = await new MessagerModel({
        nguoi_gui,
        nguoi_nhan,
        noi_dung,
        is_read: false,
      }).save();
      // Gửi lại tin nhắn tới người nhận (admin)
      const receiverSocketId = this.users[nguoi_nhan];
      if (receiverSocketId) {
        this.io
          .to(receiverSocketId)
          .emit("nhan_tin_nhan_admin", { payload: message });
      }

      // Gửi lại tin nhắn tới người gửi (client)
      socket.emit("nhan_tin_nhan_admin", { payload: message });
    } catch (error) {
      console.error("Lỗi khi lưu và gửi tin nhắn:", error);
    }
  }
  private async notification(
    socket: Socket,
    payload: {
      id_user: string;
    }
  ): Promise<void> {
    if (!payload) {
      console.error("Payload không hợp lệ");
      return;
    }

    const { id_user } = payload;
    const { admin_id } = socket.data;
    const nguoi_gui = admin_id;

    if (!nguoi_gui || !id_user) {
      console.error("Dữ liệu không đầy đủ để tạo yêu cầu sửa chữa");
      return;
    }

    try {
      // Gửi tới người nhận (user)
      const receiverSocketId = this.users[id_user];
      if (receiverSocketId) {
        this.io.to(receiverSocketId).emit("cap_nhat_suachua");
      }

      // Gửi lại cho admin đã gửi
      socket.emit("cap_nhat_suachua");
    } catch (error) {
      console.error("Lỗi khi lưu và gửi yêu cầu sửa chữa:", error);
    }
  }

  // Xử lý khi client ngắt kết nối
  private handleDisconnect(socket: Socket): void {
    const { admin_id, user_id } = socket.data;
    // Xóa socket ID khỏi danh sách nếu ngắt kết nối
    if (admin_id) {
      console.log(`Admin ${admin_id} đã ngắt kết nối`);
      delete this.admins[admin_id];
    }
    if (user_id) {
      console.log(`Người dùng ${user_id} đã ngắt kết nối`);
      delete this.users[user_id];
    }
  }

  // Thiết lập các sự kiện socket
}

const initSocket = (httpServer: HttpServer): SocketMessager => {
  return new SocketMessager(httpServer);
};

export default initSocket;
