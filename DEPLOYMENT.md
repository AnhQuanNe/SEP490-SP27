# HƯỚNG DẪN TRIỂN KHAI DỰ ÁN VIETHERITAGE AI (DEPLOYMENT GUIDE)

Tài liệu này được biên soạn chuẩn chỉ, chi tiết từng bước để bất kỳ thành viên nào trong nhóm hoặc lập trình viên phụ trách triển khai đều có thể deploy thành công dự án **VietHeritage AI** lên môi trường Cloud Production (Vercel + Render/Railway + MongoDB Atlas).

---

## 1. TỔNG QUAN KIẾN TRÚC & YÊU CẦU

- **Frontend**: React 19, Vite, Tailwind CSS, Leaflet, Three.js (Deploy trên **Vercel**).
- **Backend**: Node.js (Express), Socket.io, Mongoose (Deploy trên **Render**, **Railway** hoặc VPS).
- **Cơ sở dữ liệu**: **MongoDB Atlas** (Database Cloud miễn phí hoặc trả phí).
- **Yêu cầu môi trường Node.js**: Node.js >= `18.0.0` (Khuyến nghị `20.x` LTS).

---

## 2. BƯỚC 1: CẤU HÌNH CƠ SỞ DỮ LIỆU (MONGODB ATLAS)

1. Truy cập [MongoDB Atlas](https://www.mongodb.com/atlas) và đăng nhập/đăng ký.
2. Tạo một **Cluster** mới (gói **M0 Free** hoàn toàn miễn phí).
3. Tại menu **Security** -> **Database Access**:
   - Nhấn **Add New Database User**.
   - Tạo Username và Password (ví dụ: `vietheritage_admin` / mật khẩu bảo mật). Lưu lại thông tin này.
   - Gán quyền: **Read and write to any database**.
4. Tại menu **Security** -> **Network Access**:
   - Nhấn **Add IP Address** -> Chọn **Allow Access from Anywhere** (`0.0.0.0/0`) để backend trên cloud có thể kết nối.
5. Tại **Database Deployments**:
   - Nhấn **Connect** -> Chọn **Drivers** (Node.js).
   - Sao chép chuỗi kết nối (Connection String), có định dạng:
     ```text
     mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/sep490?retryWrites=true&w=majority
     ```
   - Thay `<username>`, `<password>` bằng thông tin đã tạo ở bước 3, và đặt tên DB là `sep490`.

---

## 3. BƯỚC 2: TRIỂN KHAI BACKEND (RENDER / RAILWAY / VPS)

### Khuyến nghị: Deploy trên Render.com (Miễn phí & Cực nhanh)

1. Đăng nhập vào [Render.com](https://render.com) bằng tài khoản GitHub.
2. Nhấn **New +** -> Chọn **Web Service**.
3. Chọn Git Repository của dự án `SEP490-SP27`.
4. Cấu hình dịch vụ:
   - **Name**: `vietheritage-backend` (hoặc tên tùy chọn).
   - **Region**: Singapore (hoặc Oregon/Frankfurt).
   - **Root Directory**: `backend` *(QUAN TRỌNG: Phải điền thư mục này)*.
   - **Runtime**: `Node`.
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: Free (hoặc Starter).

5. Thêm các **Environment Variables** (Biến môi trường) tại mục **Environment**:

| Tên biến | Giá trị mẫu | Giải thích |
|---|---|---|
| `NODE_ENV` | `production` | Môi trường sản xuất |
| `PORT` | `5000` | Cổng máy chủ (Render tự gán hoặc dùng 5000) |
| `MONGO_URI` | `mongodb+srv://<user>:<pass>@cluster0.../sep490` | Chuỗi kết nối MongoDB Atlas đã lấy ở Bước 1 |
| `CLIENT_URL` | `https://vietheritage.vercel.app` | URL Frontend trên Vercel (bước 4) |
| `JWT_SECRET` | `vietheritage_super_secret_jwt_key_2026` | Chuỗi ký JWT bảo mật |
| `JWT_EXPIRES_IN` | `7d` | Thời hạn phiên đăng nhập |
| `GEMINI_API_KEY` | *(Key Google Gemini của bạn)* | API giải thích văn học & tìm kiếm ngữ nghĩa |
| `EMAIL_USER` | `youremail@gmail.com` | Email gửi OTP (tùy chọn) |
| `EMAIL_PASS` | `app_password_here` | Mật khẩu ứng dụng Gmail (tùy chọn) |

6. Nhấn **Deploy Web Service** và chờ Render build xong.
7. Sau khi deploy, Render sẽ cấp cho bạn một domain, ví dụ:
   `https://vietheritage-backend.onrender.com`
   Kiểm tra bằng cách mở trình duyệt vào:
   `https://vietheritage-backend.onrender.com/api/health` -> Phải nhận được `{"status":"ok"}`.

### NẠP DỮ LIỆU BAN ĐẦU (SEED DATABASE) CHỈ BẰNG 1 LỆNH DUY NHẤT:
Dự án đã tích hợp sẵn Master Seeder tự động nạp đầy đủ 100 câu trắc nghiệm, 28 tác phẩm di sản, 12 tọa độ bản đồ, bảo vật 3D và tài khoản Quản trị:
- **Cách 1 (Từ máy local)**:
  Mở file `backend/.env`, trỏ tạm `MONGO_URI` tới chuỗi MongoDB Atlas của bạn, sau đó chạy:
  ```bash
  cd backend
  npm run seed
  ```
- **Cách 2 (Trên Cloud Shell của Render)**:
  Tại trang quản lý Web Service trên Render -> Nhấn tab **Shell** -> Gõ:
  ```bash
  npm run seed
  ```
Toàn bộ dữ liệu chuẩn học thuật và tài khoản Admin sẽ được nạp hoàn chỉnh vào MongoDB Atlas trong ~3 giây!

---

## 4. BƯỚC 3: TRIỂN KHAI FRONTEND (VERCEL)

1. Đăng nhập vào [Vercel](https://vercel.com) bằng tài khoản GitHub.
2. Nhấn **Add New...** -> Chọn **Project**.
3. Chọn Git Repository `SEP490-SP27` -> Nhấn **Import**.
4. Cấu hình dự án (Project Configuration):
   - **Framework Preset**: `Vite` (Vercel thường tự động nhận diện).
   - **Root Directory**: Nhấn **Edit** và chọn thư mục `frontend` *(RẤT QUAN TRỌNG)*.
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
5. Cấu hình **Environment Variables**:
   Thêm 2 biến môi trường sau:
   - `VITE_API_URL`: URL Backend kèm `/api`, ví dụ:
     `https://vietheritage-backend.onrender.com/api`
   - `VITE_SERVER_URL`: URL Backend gốc, ví dụ:
     `https://vietheritage-backend.onrender.com`
6. Nhấn **Deploy**.
7. Dự án đã có sẵn file `frontend/vercel.json` giải quyết triệt để lỗi 404 khi người dùng tải lại trang (SPA Rewrite).

---

## 5. BƯỚC 4: KẾT NỐI HAI ĐẦU & HOÀN TẤT CORS

1. Sau khi Vercel deploy xong, bạn sẽ có URL Frontend chính thức (ví dụ: `https://vietheritage-sp27.vercel.app`).
2. Quay lại Render -> Web Service Backend -> tab **Environment**:
   - Cập nhật biến `CLIENT_URL` thành domain Vercel vừa nhận được.
   - Backend sẽ tự động lưu và khởi động lại.
   *(Lưu ý: Backend đã cấu hình sẵn chấp nhận mọi domain `*.vercel.app` nên việc kết nối diễn ra ngay tức thì).*

---

## 6. DANH SÁCH TÀI KHOẢN & KIỂM THỬ HỆ THỐNG

Sau khi deploy thành công, thực hiện checklist kiểm tra sau:

1. **Đăng nhập Quản trị viên (Admin)**:
   - Truy cập: `https://<ten-mien-frontend>/dang-nhap`
   - Email: `admin@vietheritage.vn`
   - Mật khẩu: `Admin@123456`
   - Sau khi đăng nhập, hệ thống sẽ tự động chuyển hướng hoặc cho phép bạn truy cập vào `/admin`.

2. **Kiểm tra Dashboard Quản trị (`/admin`)**:
   - Các thẻ chỉ số thống kê (Sĩ tử & Tài khoản, Bài chờ thẩm định, Kho tàng xuất bản).
   - Biểu đồ phân bổ thể loại (Ca dao, Tục ngữ, Cổ tích).
   - Mục "Cấu hình Hệ thống" (bật/tắt bảo trì hệ thống thời gian thực, banner thông báo toàn trang).

3. **Kiểm tra Giao diện Người dùng**:
   - Trang chủ (`/`): Banner hoạt động, tác phẩm nổi bật hiển thị đầy đủ.
   - Kho tàng Di sản (`/kham-pha`): Lọc thể loại, tìm kiếm tác phẩm.
   - Bản đồ Di sản (`/ban-do`): Bản đồ tương tác các vùng miền văn hóa.
   - Phòng trưng bày 3D (`/bao-vat-3d`): Tương tác bảo vật Trống đồng, Ngựa sắt Thánh Gióng.
   - Trắc nghiệm Văn hóa (`/thi-tho`): Ngân hàng 100 câu hỏi trắc nghiệm di sản hoạt động mượt mà.

---

> [!TIP]
> Nếu bạn hoặc bạn của bạn cần hỗ trợ thêm trong quá trình triển khai, toàn bộ mã nguồn đã được clean gọn gàng, không còn dữ liệu giả lập (mock/fake), và các script build/seed đều chạy độc lập 100%. Chúc các bạn deploy thuận lợi và thành công!
