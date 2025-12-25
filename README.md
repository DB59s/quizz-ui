# Quiz UI - Student Portal

Ứng dụng web cho học sinh làm bài kiểm tra trực tuyến, quản lý lớp học và xem kết quả.

## 🚀 Công nghệ sử dụng

- **Framework**: Next.js 15.1.2 (App Router)
- **UI Library**: Material-UI (MUI) v6
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **Authentication**: NextAuth.js
- **HTTP Client**: Axios
- **State Management**: React Hooks

## 📋 Tính năng chính

### 1. **Quản lý lớp học**
- Xem danh sách lớp học đã tham gia
- Đăng ký tham gia lớp học mới bằng mã lớp
- Xem chi tiết thông tin lớp học
- Theo dõi danh sách bài tập/kiểm tra

### 2. **Làm bài kiểm tra**
- Giao diện làm bài trực quan với đồng hồ đếm ngược
- Điều hướng giữa các câu hỏi dễ dàng
- Đánh dấu câu hỏi đã trả lời
- Xem trước trước khi nộp bài

### 3. **Xem kết quả**
- Hiển thị điểm số và tỷ lệ đúng/sai
- Chi tiết từng câu trả lời
- Đánh dấu đáp án đúng/sai
- Thống kê tổng quan

### 4. **Quản lý đơn đăng ký**
- Xem trạng thái đơn đăng ký lớp học
- Hủy đơn đăng ký khi cần

## 🛠️ Cài đặt

### Yêu cầu hệ thống
- Node.js 18.x trở lên
- npm hoặc yarn hoặc pnpm

### Các bước cài đặt

1. **Clone repository**
```bash
git clone <repository-url>
cd quizz-ui
```

2. **Cài đặt dependencies**
```bash
npm install
# hoặc
yarn install
# hoặc
pnpm install
```

3. **Cấu hình môi trường**

Tạo file `.env.local` và cấu hình các biến môi trường:

```env
# API Backend URL
NEXT_PUBLIC_API_URL=https://your-api-url

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key

# Database (nếu cần)
DATABASE_URL=your-database-url
```

4. **Chạy development server**
```bash
npm run dev
```

Mở [http://localhost:3000](http://localhost:3000) để xem ứng dụng.

## 📁 Cấu trúc thư mục

```
src/
├── app/                          # Next.js App Router
│   ├── [lang]/                   # Multi-language support
│   │   ├── (dashboard)/          # Dashboard layout
│   │   │   └── (private)/        # Protected routes
│   │   │       ├── my-classes/   # Quản lý lớp học
│   │   │       ├── quiz/         # Làm bài kiểm tra
│   │   │       └── applications/ # Đơn đăng ký
│   │   └── (blank-layout-pages)/ # Pages without sidebar
│   └── api/                      # API routes
├── components/                   # Reusable components
├── views/                        # Page components
│   ├── my-classes/              # Class management views
│   │   ├── ClassCard.tsx
│   │   ├── ClassDetail.tsx
│   │   ├── ClassOverview.tsx
│   │   └── ClassAssignments.tsx
│   └── quiz/                    # Quiz views
│       ├── TakeQuiz.tsx
│       └── QuizResult.tsx
├── services/                    # API services
│   ├── class.service.ts
│   ├── classQuizz.service.ts
│   └── quiz.service.ts
├── libs/                        # Utilities
│   └── axios-client.ts
└── configs/                     # Configuration files
```

## 🔌 API Endpoints

### Class Management
- `GET /api/v1/classes/join/{classCode}` - Lấy thông tin lớp học
- `POST /api/v1/student-classes` - Đăng ký tham gia lớp
- `GET /api/v1/student-classes/student` - Lấy danh sách lớp đã tham gia
- `DELETE /api/v1/student-classes/{id}` - Hủy đăng ký

### Quiz & Assignments
- `GET /api/v1/class-quizzes/class/{classId}/student/all` - Lấy danh sách bài tập
- `GET /api/v1/quizzes/{quizId}/student` - Lấy chi tiết quiz và câu hỏi
- `POST /api/v1/quizzes/{quizId}/submit` - Nộp bài (coming soon)

## 🎨 Scripts

```bash
# Development
npm run dev              # Chạy dev server với Turbopack

# Production
npm run build           # Build production
npm start               # Chạy production server

# Code Quality
npm run lint            # Kiểm tra linting
npm run lint:fix        # Tự động fix linting issues
npm run format          # Format code với Prettier

# Database
npm run migrate         # Chạy database migrations
```

## 🔐 Authentication

Ứng dụng sử dụng NextAuth.js để xác thực người dùng:
- Đăng nhập bằng email/password
- Session management
- Protected routes

## 🌐 Multi-language Support

Hỗ trợ đa ngôn ngữ với cấu trúc `[lang]` trong routing:
- Tiếng Việt (vi)
- English (en)

## 📱 Responsive Design

- Mobile-first approach
- Responsive breakpoints với TailwindCSS
- Tối ưu cho mọi kích thước màn hình

## 🚧 Tính năng đang phát triển

- [ ] API submit quiz với chấm điểm tự động
- [ ] Lưu lịch sử làm bài
- [ ] Thống kê chi tiết theo thời gian
- [ ] Notification system
- [ ] Chat với giáo viên

## 📝 License

Commercial License

## 👥 Contributors

Dự án được phát triển bởi team Quiz Application.

---

**Note**: Đây là phiên bản dành cho học sinh. 
