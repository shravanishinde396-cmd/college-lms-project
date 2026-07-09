# Modernized College LMS

This repository is a fully modernized MERN-stack College Learning Management System (LMS) designed for Admin, Faculty, and Students. The codebase has been refactored, hardened, and updated with premium design systems, charts, notification systems, and security layers.

---

## 🚀 Key Modernization Phases Completed

### 1. Unified Premium Design System & Dark Mode
- **Styling**: Configured a shadcn/ui-inspired color variable foundation using Tailwind CSS 3 and vanilla CSS.
- **Dark Mode**: Integrated class-based dark mode (`html.dark`) with smooth color transitions across all dashboards, cards, headers, sidebars, and input fields.
- **Component Library**:
  - `Button.jsx`: Handles variant merging with active focus rings.
  - `Input.jsx`: forwards React ref bindings and renders error indicators.
  - `Card.jsx`: Glassmorphic-friendly elevation.
  - `Skeleton.jsx`: Responsive pulse-loading layouts.
  - `EmptyState.jsx`: Clean state messaging with customizable icons.

### 2. Hardened Cookie-Based JWT Auth Flow
- **Access Tokens**: Short-lived (15 minutes) memory access tokens.
- **Refresh Tokens**: Long-lived (7 days) `HttpOnly`, `Secure`, `SameSite=Strict` cookies.
- **Silent Rotation**: Built an automated Axios interceptor queue mechanism in `frontend/src/api/axios.js`. When an access token expires (401 response), the interceptor locks outgoing requests, fetches a new token via `/api/auth/refresh`, and retries the original request transparently.
- **Security Recovery**: Added forgot-password token hashing (SHA-256) and expiration times, rendering secure reset links in backend console mailer logs.
- **Remember Me**: Saves encrypted email state to pre-fill login inputs.

### 3. Interactive Dashboard Analytics
- **Data Visualization**: Integrated `Recharts` responsive charts.
  - **Admin**: Student-to-faculty ratios, monthly course creation timelines.
  - **Teacher**: Quiz stats, assignment submission status gauges.
  - **Student**: Quiz score trend lines (Area chart) and pass/fail ratios (Pie chart).
- **Responsive Layout**: Designed a collapsible sidebar with drawer menus for smaller screen sizes.

### 4. Classroom Space & Timetable Management
- **Course Cover Banner**: Supports Multer cover image uploading and display.
- **Tabbed Classroom Space (`CourseDetailsPage.jsx`)**:
  - **Overview**: Announcement boards and basic information.
  - **Materials**: Upload PPT, PDF, DOC, and video links (Teacher) / Download (Student).
  - **Assignments**: Submit homework with optional file attachments (Student) / Grade with comments (Teacher).
  - **Quizzes**: MCQ tests with a count-down timer (auto-submitting when the timer hits zero).
- **Attendance**:
  - **Monthly Reports**: Calculates present/absent days and percentage aggregates.
  - **Data Exports**: Supports client-side CSV downloads for faculty records.

### 5. Real-Time Notification Center
- **Bell Popover**: A notification bell in `Topbar.jsx` polls for notices periodically.
- **Local Tracker**: Tracks read notices in `localStorage` client-side, reducing DB overhead.
- **Notice Modal**: Renders the full details of any notice.

### 6. Mongoose Performance Indexing
Implemented indexing on frequent query paths:
- `Attendance`: `{ student: 1, course: 1, date: -1 }` and `{ course: 1, date: -1 }`
- `Enrollment`: `{ student: 1, status: 1 }` and `{ course: 1 }`
- `Timetable`: `{ department: 1, semester: 1 }`
- `QuizAttempt`: `{ student: 1, quiz: 1 }`

---

## 🛠️ Getting Started

### 1. Environment Configuration
Create a `.env` file in the `backend/` directory:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

### 2. Install & Start Development Servers
Run the backend server:
```bash
cd backend
npm install
npm run dev
```

Run the frontend server:
```bash
cd frontend
npm install
npm run dev
```

The system will automatically connect, sync schemas, run indexing queries, and refresh the UI views dynamically.
