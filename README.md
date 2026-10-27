# VietHeritage AI — Nền tảng số hóa, giải nghĩa đa tầng và tương tác văn học dân gian Việt Nam ứng dụng Trí tuệ Nhân tạo

> **Dự án tốt nghiệp / Đồ án chuyên ngành SEP490**  
> Ứng dụng Trí tuệ Nhân tạo và Hệ thống RAG trong bảo tồn, giải thích và truyền bá Văn hóa Dân gian Việt Nam.

---

## 1. Tổng quan dự án (Project Overview)

**VietHeritage AI** là nền tảng web ứng dụng AI hỗ trợ người dùng khám phá, tra cứu ngữ nghĩa và hiểu sâu sắc hơn về kho tàng ca dao, tục ngữ Việt Nam. Khác với các trang web tra từ điển văn bản thông thường, VietHeritage AI cung cấp:
- **Duyệt và tra cứu chuyên sâu**: Phân loại theo chủ đề, thể loại (Ca dao / Tục ngữ), thời kỳ lịch sử.
- **Tìm kiếm đa phương thức**: Tìm kiếm từ khóa chính xác (UC07) và Tìm kiếm ngữ nghĩa ngôn ngữ tự nhiên (UC09 - Semantic Search dựa trên ontology khái niệm dân tộc học).
- **AI Phân tích & Giảng nghĩa 4 tầng nghĩa (UC10)**: Nghĩa đen, Nghĩa bóng, Bài học triết lý và Bối cảnh văn hóa lịch sử.
- **Tính xác thực và liêm chính học thuật**: AI không bịa đặt nguồn, mọi câu ca dao tục ngữ đều được neo (grounding) vào nguồn tài liệu thực tế (GS. Vũ Ngọc Phan, GS. Nguyễn Lân, Viện Văn học). Hệ thống có cơ chế Fallback học thuật tự động khi dịch vụ AI bên ngoài không khả dụng.
- **Cá nhân hóa người dùng**: Lưu mục yêu thích (UC12), Lịch sử tra cứu (UC13).
- **Cộng đồng đóng góp & Kiểm duyệt (UC14, UC16, UC17)**: Đóng góp câu văn hóa dân gian và quy trình duyệt bài khắt khe từ Ban quản trị.
- **Quản trị hệ thống toàn diện (UC15, UC18, UC19)**: Quản lý thành viên, biên tập kho tác phẩm và cấu hình động các thông số website.

---

## 2. Công nghệ sử dụng (Tech Stack)

### Frontend
- **Framework:** React 19 + Vite 8
- **Styling:** Tailwind CSS v4, Lucide React Icons
- **Routing:** React Router v7
- **HTTP Client:** Axios with JWT Interceptors & Auth State Management

### Backend
- **Runtime:** Node.js (v18+) + Express.js v5
- **Database:** MongoDB + Mongoose v9
- **Authentication:** JSON Web Token (JWT) + BcryptJS (Password hashing)
- **Role-Based Access Control (RBAC):** Middleware kiểm tra quyền hạn nghiêm ngặt ở server-side (`guest`, `user`, `admin`).
- **AI Integration:** Google Gemini API (`@google/genai`) kết hợp RAG Knowledge Retrieval & Grounding; Fallback engine dựa trên tri thức nội sinh trong cơ sở dữ liệu.

---

## 3. Danh mục 19 Use Cases Bắt Buộc (SRS Mapping)

| Mã UC | Tên Use Case | Phân loại | Trạng thái | Ghi chú kỹ thuật |
|:---:|:---|:---:|:---:|:---|
| **UC01** | Register Account | Group A | ✅ Đã xong | Validation đầu vào, hash mật khẩu bcrypt |
| **UC02** | Log In | Group A | ✅ Đã xong | Cấp JWT Token, kiểm tra tài khoản bị khóa |
| **UC03** | Log Out | Group A | ✅ Đã xong | Client dọn dẹp state & token an toàn |
| **UC04** | Reset Password | Group A | ✅ Đã xong | Quên mật khẩu qua email OTP hoặc in console |
| **UC05** | Update Profile | Group A | ✅ Đã xong | Cập nhật tên, ảnh đại diện, đổi mật khẩu |
| **UC06** | Browse Public Content | Group B | ✅ Đã xong | Lọc theo chủ đề, thể loại, phân trang |
| **UC07** | Search Folk Literature | Group B | ✅ Đã xong | Tìm kiếm từ khóa chính xác |
| **UC08** | View Content Details | Group B | ✅ Đã xong | Xem 4 tầng nghĩa, nguồn tài liệu học thuật |
| **UC09** | Perform Semantic Search | Group C | ✅ Đã xong | Tìm theo ý niệm tự nhiên (VD: "lòng biết ơn") |
| **UC10** | Request AI Explanation | Group C | ✅ Đã xong | AI giảng nghĩa đa tầng + RAG trích dẫn nguồn |
| **UC11** | Explore Related Content | Group C | ✅ Đã xong | Gợi ý tác phẩm cùng chủ đề và thể loại |
| **UC12** | Save / Remove Favorites | Group C | ✅ Đã xong | Lưu yêu thích, chống trùng lặp dữ liệu |
| **UC13** | View Search History | Group C | ✅ Đã xong | Nhật ký tìm kiếm của cá nhân, xóa mục/toàn bộ |
| **UC14** | Submit Cultural Content | Group C | ✅ Đã xong | Người dùng gửi ca dao/tục ngữ, chờ kiểm duyệt |
| **UC15** | View & Update User Accounts | Group D | ✅ Đã xong | Admin xem danh sách, khóa/mở khóa tài khoản |
| **UC16** | Review Content Submissions | Group D | ✅ Đã xong | Admin xem danh sách bài chờ duyệt & nguồn |
| **UC17** | Approve / Reject Content | Group D | ✅ Đã xong | Phê duyệt (tự động xuất bản) hoặc từ chối |
| **UC18** | Update Published Content | Group D | ✅ Đã xong | Biên tập kho ca dao tục ngữ hiện có |
| **UC19** | Configure System Settings | Group D | ✅ Đã xong | Cấu hình bật/tắt AI, đăng ký mở, tiêu đề site |

---

## 4. Yêu cầu tiên quyết (Prerequisites)

- **Node.js**: Phiên bản 18.x trở lên.
- **MongoDB**: Phiên bản 6.x trở lên (đang chạy local tại `mongodb://localhost:27017` hoặc MongoDB Atlas URI).
- **npm** hoặc **yarn**.

---

## 5. Hướng dẫn cài đặt & Cấu hình môi trường

### 5.1. Cấu hình Backend

1. Di chuyển vào thư mục backend:
   ```bash
   cd backend
   ```

2. Cài đặt các gói phụ thuộc:
   ```bash
   npm install
   ```

3. Tạo file cấu hình môi trường `.env`:
   ```bash
   cp .env.example .env
   ```
   *Nội dung mẫu của `backend/.env`:*
   ```env
   # APPLICATION
   PORT=5000
   NODE_ENV=development
   CLIENT_URL=http://localhost:5173

   # DATABASE
   MONGO_URI=mongodb://localhost:27017/sep490

   # JWT
   JWT_SECRET=super_secret_jwt_key_vietheritage_2026
   JWT_EXPIRES_IN=7d

   # EMAIL (Nodemailer - Dùng App Password của Gmail nếu có; nếu để trống OTP sẽ in ra Terminal)
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_email_app_password

   # GOOGLE AUTH
   GOOGLE_CLIENT_ID=your_google_client_id

   # AI SERVICE (GEMINI - Tùy chọn)
   # Nếu có key, hệ thống kết nối Gemini 2.5 Flash
   # Nếu không có key, hệ thống tự động Fallback RAG nội sinh mà không báo lỗi
   GEMINI_API_KEY=
   ```

### 5.2. Cấu hình Frontend

1. Di chuyển vào thư mục frontend:
   ```bash
   cd ../frontend
   ```

2. Cài đặt các gói phụ thuộc:
   ```bash
   npm install
   ```

3. Tạo file cấu hình môi trường `.env`:
   ```bash
   cp .env.example .env
   ```
   *Nội dung mẫu của `frontend/.env`:*
   ```env
   VITE_API_URL=http://localhost:5000/api
   VITE_SERVER_URL=http://localhost:5000
   VITE_GOOGLE_CLIENT_ID=
   ```

---

## 6. Khởi tạo Cơ sở dữ liệu mẫu & Tài khoản Admin (Database Seeding)

Dự án cung cấp sẵn 2 kịch bản nạp dữ liệu chuẩn mực học thuật:

1. **Nạp kho tàng Ca dao & Tục ngữ mẫu (GS. Vũ Ngọc Phan, GS. Nguyễn Lân):**
   ```bash
   cd backend
   node src/utils/seedLiterature.js
   ```

2. **Khởi tạo Tài khoản Quản trị viên (Admin) và Cài đặt hệ thống ban đầu:**
   ```bash
   node src/utils/seedAdmin.js
   ```

### 🔑 Thông tin tài khoản mặc định:
- **Tài khoản Quản trị viên (Admin):**
  - **Email:** `admin@vietheritage.vn`
  - **Mật khẩu:** `Admin@123456`
  - **Quyền hạn:** `admin` (Toàn quyền truy cập Bảng điều khiển Quản trị `/admin`)
- **Tài khoản Người dùng thông thường (User):**
  - Người dùng có thể tự đăng ký tài khoản mới trên giao diện tại trang `/register`.

---

## 7. Khởi chạy ứng dụng (Running the Application)

### Khởi chạy Backend Server:
```bash
cd backend
npm run dev
# Hoặc: node server.js
# Backend sẽ lắng nghe tại: http://localhost:5000
```

### Khởi chạy Frontend Client:
```bash
cd frontend
npm run dev
# Giao diện web sẵn sàng tại: http://localhost:5173
```

---

## 8. Kiểm thử & Xác minh chức năng (Testing & Verification)

Dự án tích hợp bộ kịch bản kiểm thử tự động toàn diện kiểm tra đầy đủ 19 Use Cases và các quy tắc bảo mật:

```bash
cd backend
# Chạy bộ test kiểm tra toàn bộ 19 Use Cases (API & Logic):
node test-usecases.js

# Chạy bộ test xác thực Authentication & Phân quyền User:
node test-api.js
```

### Kiểm tra Build Production của Frontend:
```bash
cd frontend
npm run build
```
*(Đã xác nhận build thành công 100% với 0 lỗi).*

---

## 9. Kiến trúc AI & Cơ chế RAG Fallback (AI & RAG Architecture)

Để đảm bảo tôn trọng tính liêm chính học thuật về văn hóa Việt Nam:
1. **Grounding Context:** Khi người dùng yêu cầu giải thích một câu ca dao/tục ngữ (UC10), hệ thống trích xuất bản ghi chính xác từ MongoDB gồm cả bối cảnh văn hóa và trích dẫn nguồn sách.
2. **Strict Guardrails:** Prompt hướng dẫn AI chỉ diễn giải dựa trên dữ liệu đã được xuất bản của tác phẩm, phân biệt rõ giữa ngữ liệu gốc và phần phân tích của AI; nghiêm cấm việc bịa đặt tên tác giả, nhà xuất bản hoặc đường dẫn web không có thật.
3. **Graceful Fallback:** Trong trường hợp không có kết nối Internet, hết hạn mức quota hoặc không điền `GEMINI_API_KEY`, module `ai.service.js` tự động kích hoạt bộ máy tổng hợp tri thức (`synthesizeHeritageAnswer`), trả về phân tích chuẩn xác từ cơ sở dữ liệu học thuật mà không làm gián đoạn trải nghiệm người dùng.

---

## 10. Giới hạn hiện tại & Hướng phát triển (Limitations & Future Work)

- **Vector Database:** Giai đoạn MVP sử dụng ontology phân loại khái niệm dân tộc học và scoring trọng số ngữ nghĩa trên MongoDB. Có thể nâng cấp lên Pinecone, Qdrant hoặc Milvus khi dữ liệu mở rộng trên 100.000 câu.
- **Phạm vi dữ liệu:** Tập trung chuyên sâu vào Ca dao và Tục ngữ người Việt; giai đoạn tới sẽ mở rộng thêm Hát Xoan, Ca Trù, Sử thi Tây Nguyên và Truyện cổ tích.
- **Text-to-Speech:** Có thể tích hợp thêm giọng đọc truyền cảm cho các câu ca dao lục bát bằng các dịch vụ TTS tiếng Việt.
