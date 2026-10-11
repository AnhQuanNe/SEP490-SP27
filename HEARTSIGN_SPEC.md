# HEARTSIGN (HSS) — TÀI LIỆU ĐẶC TẢ USE CASE & KIẾN TRÚC DỰ ÁN (v2.0)
> **Mục đích**: Tài liệu chuẩn hóa dùng chung cho toàn bộ thành viên nhóm phát triển và AI Assistant (Antigravity) nhằm đồng bộ luồng nghiệp vụ, kiến trúc hệ thống và quy chuẩn code.

---

## 1. TỔNG QUAN DỰ ÁN
- **Tên sản phẩm**: HeartSign (HSS) — Inclusive Multi-Platform Sign Language Ecosystem.
- **Mô tả cốt lõi**: Nền tảng học tập và đào tạo ngôn ngữ ký hiệu tương tác, tích hợp trợ lý hỗ trợ giao tiếp hai chiều thời gian thực giữa cộng đồng người khiếm thính và xã hội.
- **Mô hình**: Web-First SPA/PWA (ReactJS) song hành cùng Ứng dụng Di động Hybrid (React Native / Expo Go) dùng chung Backend API.
- **Ngôn ngữ & Công nghệ chính**:
  - **Frontend**: React 19, Vite, Tailwind CSS, Lucide Icons, Axios, Web Speech API (STT & TTS).
  - **Backend**: Node.js, Express, MongoDB (Mongoose), JWT, Bcrypt.js, Multer, Nodemailer, Google Auth Library.
  - **Thời gian thực & AI**: Socket.IO (WebSocket phòng chat 2 chiều), MediaPipe (nhận diện góc ngón tay / khung xương), LLM (OpenAI / Gemini xử lý NLP 2 chiều).

---

## 2. DANH SÁCH TÁC NHÂN (ACTORS)
1. **Guest (Khách)**: Chưa đăng nhập; được tra cứu từ điển (chỉ xem), thử nghiệm Gương ảo AI (3 bài cơ bản), thử trợ lý dịch 2 chiều (giới hạn 5 phút).
2. **Learner (Học viên / Tình nguyện viên)**: Đã có tài khoản; học theo Cây kỹ năng (Skill Tree Gamification), luyện tập phòng Gương ảo AI (chấm điểm góc tay, đếm giữ thế 1.5s), tích lũy XP / Streak, tra cứu phương ngữ đối chiếu 2 video, làm bài tập giảng viên giao.
3. **Deaf User (Người khiếm thính)**: Trợ lý giao tiếp hai chiều (Sign ↔ Text/Voice), tham gia phòng hội thoại Real-time qua WebSocket, tra cứu Không gian phương ngữ, tự quay webcam đóng góp video ký hiệu (Crowdsourcing), thả tim thẩm định.
4. **Educator (Giảng viên / Trường chuyên biệt)**: Quản lý lớp học & cấp mã tham gia, tùy biến chặng học trên Skill Tree, quay video mẫu chuẩn (Ground Truth), giao bài tập về nhà Gương ảo AI, theo dõi Báo cáo năng lực học viên & Biểu đồ lỗi sai cử chỉ.
5. **Admin (Quản trị viên)**: Quản lý tài khoản & phân quyền (RBAC), kiểm duyệt video đóng góp cộng đồng (Review Queue: Duyệt/Từ chối + lý do), quản lý danh mục bài học & ngữ liệu gốc (Synset), Analytics dashboard vận hành.

---

## 3. DANH SÁCH 21 USE CASES CHI TIẾT

### Phân hệ 1: Xác thực & Quản lý Tài khoản (Auth & Profile)
- **UC01 - Đăng ký tài khoản (Register)**: Nhập thông tin ➔ Mật khẩu băm bcrypt ➔ Gửi OTP qua email ➔ Nhập OTP kích hoạt (`isVerified: true`).
- **UC02 - Đăng nhập (Login)**: Đăng nhập email/mật khẩu hoặc Google One-Tap/GIS (Popup an toàn, không lo cross-origin).
- **UC03 - Quản lý Hồ sơ & Avatar (Profile Management)**: Xem/sửa họ tên, SĐT, địa chỉ; upload avatar qua Multer; hiển thị thanh % hoàn thiện hồ sơ.
- **UC04 - Quên & Đặt lại mật khẩu (Forgot/Reset Password)**: Gửi link/token reset qua email (hạn 15 phút) ➔ Đặt mật khẩu mới. Với tài khoản Google: cho phép thiết lập mật khẩu riêng trực tiếp.

### Phân hệ 2: Học tập & Luyện tập Gương ảo AI (Learning & AI Studio)
- **UC05 - Học Cây kỹ năng (Skill Tree Gamification)**: Lộ trình trực quan hóa theo từng chặng bài học, mở khóa tuần tự khi đủ điểm.
- **UC06 - Phòng tập Gương ảo (Split-Screen AI Practice Studio)**:
  - Khung video mẫu bên trái (tốc độ 0.5x, 0.75x, 1x).
  - Khung camera bên phải (lấy webcam qua `getUserMedia()`, hiệu ứng gương `scaleX(-1)`).
  - AI nhận diện góc ngón tay: sai báo viền Đỏ, đúng báo viền Xanh.
  - **Hold-time Validator**: Tự động đếm giữ thế chuẩn trong 1.5 giây để hoàn thành bài tập, cộng điểm XP và tăng Streak.
- **UC07 - Luyện phản xạ hội thoại theo ngữ cảnh (Contextual Reflex Practice)**: Xem chuỗi ký hiệu tình huống thực tế (hỏi đường, mua sắm) và ra dấu phản hồi liên tục với camera theo mốc thời gian quy định.
- **UC08 - Xem hồ sơ năng lực cá nhân**: Thống kê XP, Streak chuỗi ngày học, huy hiệu đạt được và lịch sử làm bài.

### Phân hệ 3: Trợ lý Giao tiếp Hai chiều Thời gian thực (Two-way Communicator)
- **UC09 - Dịch Cử chỉ ➔ Tiếng Việt (Sign-to-Voice)**:
  - Người khiếm thính ra dấu trước camera.
  - Nhận diện từ khóa rời rạc ➔ NLP LLM ghép thành câu hoàn chỉnh, lịch sự.
  - Hiển thị phụ đề và Web Speech API đọc to ra loa.
- **UC10 - Dịch Tiếng Việt ➔ Ký hiệu (Voice-to-Sign)**:
  - Người nghe nói vào micro (Web Speech STT).
  - NLP bóc tách từ khóa cốt lõi.
  - Hệ thống query CSDL lấy chuỗi video/GIF ký hiệu tương ứng phát cho người khiếm thính.
- **UC11 - Phòng hội thoại hai chiều Real-time (WebSocket Room)**:
  - Sử dụng Socket.IO quản lý phòng thoại (Room).
  - Hai bên dùng 2 thiết bị khác nhau; khi một bên nói hoặc ra dấu, phụ đề, âm thanh và video ký hiệu đồng bộ tức thì sang bên kia (<100ms latency) không cần F5.

### Phân hệ 4: Không gian Phương ngữ & Ngữ liệu Cộng đồng (Local Sign Space & Crowdsourcing)
- **UC12 - Tra cứu đối chiếu video song song (Synset Comparison)**:
  - Áp dụng mô hình **Synset (1 Khái niệm - Nhiều Biến thể Bắc/Trung/Nam)**.
  - Tra cứu 1 từ khóa ➔ Phát song song cùng lúc 2 video (Ký hiệu bản địa vs Ký hiệu phổ thông) kèm ghi chú văn hóa vùng miền.
- **UC13 - Quay & Đóng góp video ngữ liệu (Crowdsourced Studio)**: Người dùng tự bật camera quay ký hiệu địa phương, điền nhãn thông tin và gửi lên hệ thống đóng góp.
- **UC14 - Thẩm định cộng đồng (Community Voting)**: Bấm thả tim (đồng thuận) cho video ký hiệu chuẩn xác nhất của câu lạc bộ mình.

### Phân hệ 5: Quản lý Đào tạo & Giảng dạy (Educator Console)
- **UC15 - Quản lý Lớp học & Mã tham gia**: Tạo lớp học, cấp mã tham gia (Join Code), quản lý danh sách học viên.
- **UC16 - Thiết kế lộ trình & Giao bài tập AI**: Tùy biến Cây kỹ năng, quay video mẫu chuẩn (Ground Truth), giao bài tập về nhà yêu cầu mở Gương ảo AI luyện tập.
- **UC17 - Báo cáo Năng lực & Biểu đồ lỗi sai (Student Analytics)**: Thống kê tỷ lệ hoàn thành bài tập cả lớp, biểu đồ các từ vựng học viên hay làm sai tư thế nhất.

### Phân hệ 6: Quản trị Hệ thống (Admin Console)
- **UC18 - Quản lý người dùng & Phân quyền**: Phân quyền vai trò (Guest, Learner, Deaf User, Educator, Admin), khóa/mở tài khoản.
- **UC19 - Kiểm duyệt video đóng góp (Review Queue)**: Xem video cộng đồng gửi lên, kiểm tra cử chỉ, bấm Phê duyệt (Active) hoặc Từ chối kèm lý do.
- **UC20 - Quản lý danh mục & Bài học gốc**: Thêm, sửa, xóa các chủ đề bài học, từ vựng nền tảng (Seed Data 15-20 từ cốt lõi).
- **UC21 - Dashboard theo dõi vận hành**: Giám sát số lượt dịch, số video đóng góp, số lượng học viên hoạt động.

---

## 4. MA TRẬN PHÂN QUYỀN (ROLE-PERMISSION MATRIX)

| Mã Use Case | Tính năng | Guest | Learner | Deaf User | Educator | Admin |
| :---: | :--- | :---: | :---: | :---: | :---: | :---: |
| **UC01-UC04** | Đăng ký, Đăng nhập, Profile, Đổi pass | Có | Có | Có | Có | Có |
| **UC05** | Học Cây kỹ năng (Skill Tree) | ❌ | **Toàn quyền** | ❌ | Xem/Tùy biến | Toàn quyền |
| **UC06** | Luyện tập Gương ảo AI (Split-Screen) | Thử (3 bài) | **Toàn quyền** | Xem/Thử | Toàn quyền | Toàn quyền |
| **UC07** | Luyện phản xạ hội thoại ngữ cảnh | ❌ | **Toàn quyền** | Xem | Xem | Toàn quyền |
| **UC08** | Hồ sơ năng lực (XP, Streak) | ❌ | **Toàn quyền** | ❌ | Xem học viên | Toàn quyền |
| **UC09-UC10** | Trợ lý dịch 2 chiều (Sign ↔ Voice) | Thử (5 phút) | **Toàn quyền** | **Toàn quyền** | Toàn quyền | Toàn quyền |
| **UC11** | Phòng hội thoại WebSocket Real-time | ❌ | **Toàn quyền** | **Toàn quyền** | Toàn quyền | Toàn quyền |
| **UC12** | Tra cứu đối chiếu 2 video (Synset) | Chỉ xem | Xem + Thả tim | Xem + Thả tim | Xem + Quản lý | **Toàn quyền** |
| **UC13** | Tự quay đóng góp video ngữ liệu | ❌ | Gửi duyệt | Gửi duyệt | Gửi duyệt | Đăng trực tiếp |
| **UC14** | Thẩm định / Thả tim video ký hiệu | ❌ | Thả tim | Thả tim | Thả tim | Duyệt chính thức |
| **UC15** | Quản lý Lớp học & Mã tham gia | ❌ | Nhập mã | ❌ | **Toàn quyền** | Xem/Quản lý |
| **UC16** | Giao bài tập về nhà Gương ảo AI | ❌ | Làm bài | ❌ | **Toàn quyền** | Toàn quyền |
| **UC17** | Báo cáo năng lực & Biểu đồ lỗi sai | ❌ | Xem cá nhân | ❌ | **Toàn quyền lớp** | Toàn quyền |
| **UC18-UC21** | Quản trị hệ thống & Duyệt video | ❌ | ❌ | ❌ | ❌ | **Toàn quyền Admin** |

---

## 5. QUY CHUẨN CẤU TRÚC CODE DỰ ÁN
```
SEP490-SP27/
├── backend/
│   ├── src/
│   │   ├── config/ (database.js, socket.js)
│   │   ├── models/ (User.js, Lesson.js, Synset.js, Classroom.js, Progress.js)
│   │   ├── controllers/ (auth, user, learning, communicator, dictionary, classroom, admin)
│   │   ├── routes/ (auth.routes, user.routes, learning.routes, dictionary.routes, ...)
│   │   ├── middlewares/ (auth.middlewares.js, upload.middleware.js)
│   │   ├── services/ (email.service, auth.services, nlp.service)
│   │   └── sockets/ (realtimeChat.socket.js)
│   ├── server.js
│   └── package.json
└── frontend/
    ├── src/
    │   ├── context/ (AuthContext.jsx, SocketContext.jsx)
    │   ├── routes/ (AppRoutes.jsx, ProtectedRoute.jsx, RoleRoute.jsx)
    │   ├── services/ (api.js, auth.service.js, user.service.js, sign.service.js)
    │   └── pages/
    │       ├── auth/ (Login, Register, VerifyEmail, ForgotPassword, ResetPassword)
    │       ├── customer/ (Profile, Dashboard)
    │       ├── learning/ (SkillTree, SplitScreenMirror)
    │       ├── communicator/ (TwoWayTranslator, RealtimeChatRoom)
    │       ├── dictionary/ (LocalSignSpace)
    │       ├── educator/ (ClassroomManagement, AssignmentBuilder, StudentAnalytics)
    │       └── admin/ (UserManagement, ReviewQueue)
    ├── vite.config.js
    └── package.json
```
