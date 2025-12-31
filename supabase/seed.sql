-- Nuva Club Seed Data
-- Run this AFTER creating users in Supabase Auth
-- Note: You must first create the users via Supabase Dashboard or Auth API

-- ============================================
-- DEMO ACCOUNTS (10 users)
-- Create these in Supabase Auth first with password: demo1234
-- ============================================
-- 1. vava1@demo.nuva.club - 小明 (vava, level 3, club)
-- 2. vava2@demo.nuva.club - 小華 (vava, level 5, club)
-- 3. vava3@demo.nuva.club - 小美 (vava, level 2, basic)
-- 4. vava4@demo.nuva.club - 小強 (vava, level 7, club)
-- 5. vava5@demo.nuva.club - 小芳 (vava, level 1, trial)
-- 6. nunu1@demo.nuva.club - 陳教練 (nunu, level 10, club)
-- 7. nunu2@demo.nuva.club - 林教練 (nunu, level 9, club)
-- 8. nunu3@demo.nuva.club - 王教練 (nunu, level 11, club)
-- 9. guardian1@demo.nuva.club - 張守護 (guardian, level 12, club)
-- 10. guardian2@demo.nuva.club - 李守護 (guardian, level 12, club)

-- After creating users in Auth, run this to update their profiles:
-- (The trigger should create basic profiles, this updates them with full data)

-- Note: Replace the UUIDs below with actual user IDs from auth.users after creation

-- ============================================
-- COURSES (12 courses, one per level)
-- ============================================
INSERT INTO courses (id, title, description, level, lessons_count, total_duration, thumbnail) VALUES
-- Level 1-3: Beginner
('course-1', 'HTML 基礎入門', '學習 HTML 的基本概念，建立你的第一個網頁', 1, 5, 45, NULL),
('course-2', 'CSS 樣式設計', '使用 CSS 美化你的網頁，學習選擇器和屬性', 2, 6, 60, NULL),
('course-3', 'JavaScript 入門', '認識程式語言的基礎，變數、函式和條件判斷', 3, 8, 90, NULL),

-- Level 4-6: Intermediate
('course-4', 'React 基礎', '現代前端框架入門，學習元件化開發', 4, 10, 120, NULL),
('course-5', 'Node.js 後端開發', '使用 JavaScript 開發伺服器端應用程式', 5, 8, 100, NULL),
('course-6', 'Git 版本控制', '學習使用 Git 和 GitHub 管理程式碼', 6, 6, 50, NULL),

-- Level 7-9: Advanced
('course-7', 'TypeScript 進階', '型別安全的 JavaScript，提升程式碼品質', 7, 10, 150, NULL),
('course-8', 'Next.js 全端開發', '使用 Next.js 建立現代化的全端應用', 8, 12, 180, NULL),
('course-9', 'REST API 設計', '設計和實作 RESTful API', 9, 8, 100, NULL),

-- Level 10-12: Expert
('course-10', '系統設計入門', '學習如何設計可擴展的系統架構', 10, 10, 200, NULL),
('course-11', 'Docker 容器化', '使用 Docker 部署你的應用程式', 11, 8, 120, NULL),
('course-12', 'AWS 雲端服務', 'Amazon Web Services 基礎入門', 12, 12, 240, NULL);

-- ============================================
-- LESSONS (with real YouTube video IDs)
-- ============================================

-- Course 1: HTML 基礎入門 (Level 1)
INSERT INTO lessons (id, course_id, title, description, video_url, video_duration, "order") VALUES
('lesson-1-1', 'course-1', 'HTML 是什麼？', 'HTML 的基本概念介紹', 'UB1O30fR-EE', 1212, 1),
('lesson-1-2', 'course-1', '基本標籤', '學習常用的 HTML 標籤', 'UB1O30fR-EE', 900, 2),
('lesson-1-3', 'course-1', '表單元素', '建立互動式表單', 'UB1O30fR-EE', 720, 3),
('lesson-1-4', 'course-1', '語意化 HTML', '使用語意化標籤提升可讀性', 'UB1O30fR-EE', 600, 4),
('lesson-1-5', 'course-1', '實作練習', '建立你的第一個網頁', 'UB1O30fR-EE', 480, 5);

-- Course 2: CSS 樣式設計 (Level 2)
INSERT INTO lessons (id, course_id, title, description, video_url, video_duration, "order") VALUES
('lesson-2-1', 'course-2', 'CSS 選擇器', '了解不同類型的選擇器', 'yfoY53QXEnI', 1020, 1),
('lesson-2-2', 'course-2', '盒模型', 'margin, padding, border', 'yfoY53QXEnI', 840, 2),
('lesson-2-3', 'course-2', 'Flexbox 佈局', '使用 Flexbox 排版', 'yfoY53QXEnI', 960, 3),
('lesson-2-4', 'course-2', 'Grid 佈局', '使用 CSS Grid 建立複雜佈局', 'yfoY53QXEnI', 900, 4),
('lesson-2-5', 'course-2', '響應式設計', '適應不同螢幕尺寸', 'yfoY53QXEnI', 720, 5),
('lesson-2-6', 'course-2', '動畫效果', 'CSS 過渡和動畫', 'yfoY53QXEnI', 600, 6);

-- Course 3: JavaScript 入門 (Level 3)
INSERT INTO lessons (id, course_id, title, description, video_url, video_duration, "order") VALUES
('lesson-3-1', 'course-3', '變數與型別', '了解 JavaScript 的資料型別', 'hdI2bqOjy3c', 900, 1),
('lesson-3-2', 'course-3', '運算子', '算術、比較和邏輯運算', 'hdI2bqOjy3c', 720, 2),
('lesson-3-3', 'course-3', '條件判斷', 'if-else 和 switch 語句', 'hdI2bqOjy3c', 840, 3),
('lesson-3-4', 'course-3', '迴圈', 'for, while, forEach', 'hdI2bqOjy3c', 780, 4),
('lesson-3-5', 'course-3', '函式', '定義和呼叫函式', 'hdI2bqOjy3c', 900, 5),
('lesson-3-6', 'course-3', '陣列', '陣列操作方法', 'hdI2bqOjy3c', 960, 6),
('lesson-3-7', 'course-3', '物件', '物件的建立和使用', 'hdI2bqOjy3c', 840, 7),
('lesson-3-8', 'course-3', 'DOM 操作', '與網頁元素互動', 'hdI2bqOjy3c', 1020, 8);

-- Course 4: React 基礎 (Level 4)
INSERT INTO lessons (id, course_id, title, description, video_url, video_duration, "order") VALUES
('lesson-4-1', 'course-4', 'React 簡介', 'React 的核心概念', 'w7ejDZ8SWv8', 600, 1),
('lesson-4-2', 'course-4', 'JSX 語法', '在 JavaScript 中寫 HTML', 'w7ejDZ8SWv8', 720, 2),
('lesson-4-3', 'course-4', '元件', '建立和使用元件', 'w7ejDZ8SWv8', 900, 3),
('lesson-4-4', 'course-4', 'Props', '元件之間傳遞資料', 'w7ejDZ8SWv8', 840, 4),
('lesson-4-5', 'course-4', 'State', '管理元件狀態', 'w7ejDZ8SWv8', 960, 5),
('lesson-4-6', 'course-4', '事件處理', '處理使用者互動', 'w7ejDZ8SWv8', 720, 6),
('lesson-4-7', 'course-4', '條件渲染', '根據條件顯示內容', 'w7ejDZ8SWv8', 600, 7),
('lesson-4-8', 'course-4', '列表渲染', '渲染動態列表', 'w7ejDZ8SWv8', 660, 8),
('lesson-4-9', 'course-4', 'useEffect', '處理副作用', 'w7ejDZ8SWv8', 900, 9),
('lesson-4-10', 'course-4', '表單處理', 'React 表單控制', 'w7ejDZ8SWv8', 840, 10);

-- Course 5: Node.js 後端開發 (Level 5)
INSERT INTO lessons (id, course_id, title, description, video_url, video_duration, "order") VALUES
('lesson-5-1', 'course-5', 'Node.js 介紹', '什麼是 Node.js', 'fBNz5xF-Kx4', 600, 1),
('lesson-5-2', 'course-5', '模組系統', 'CommonJS 和 ES Modules', 'fBNz5xF-Kx4', 720, 2),
('lesson-5-3', 'course-5', 'Express.js', '建立 Web 伺服器', 'fBNz5xF-Kx4', 900, 3),
('lesson-5-4', 'course-5', '路由', '處理不同的 URL 請求', 'fBNz5xF-Kx4', 780, 4),
('lesson-5-5', 'course-5', '中間件', '請求處理流程', 'fBNz5xF-Kx4', 840, 5),
('lesson-5-6', 'course-5', '資料庫連接', '連接 MongoDB', 'fBNz5xF-Kx4', 960, 6),
('lesson-5-7', 'course-5', 'CRUD 操作', '資料的增刪改查', 'fBNz5xF-Kx4', 900, 7),
('lesson-5-8', 'course-5', '錯誤處理', '優雅地處理錯誤', 'fBNz5xF-Kx4', 660, 8);

-- Course 6: Git 版本控制 (Level 6)
INSERT INTO lessons (id, course_id, title, description, video_url, video_duration, "order") VALUES
('lesson-6-1', 'course-6', 'Git 基礎', '版本控制的概念', 'RGOj5yH7evk', 600, 1),
('lesson-6-2', 'course-6', '基本指令', 'add, commit, push', 'RGOj5yH7evk', 720, 2),
('lesson-6-3', 'course-6', '分支', '建立和合併分支', 'RGOj5yH7evk', 840, 3),
('lesson-6-4', 'course-6', 'GitHub', '遠端儲存庫操作', 'RGOj5yH7evk', 720, 4),
('lesson-6-5', 'course-6', 'Pull Request', '協作開發流程', 'RGOj5yH7evk', 660, 5),
('lesson-6-6', 'course-6', '衝突解決', '處理合併衝突', 'RGOj5yH7evk', 600, 6);

-- Course 7: TypeScript 進階 (Level 7)
INSERT INTO lessons (id, course_id, title, description, video_url, video_duration, "order") VALUES
('lesson-7-1', 'course-7', 'TypeScript 介紹', '為什麼使用 TypeScript', 'BCg4U1FzODs', 600, 1),
('lesson-7-2', 'course-7', '基本型別', '型別註解和推論', 'BCg4U1FzODs', 720, 2),
('lesson-7-3', 'course-7', '介面', '定義物件型別', 'BCg4U1FzODs', 840, 3),
('lesson-7-4', 'course-7', '類別', 'OOP 在 TypeScript', 'BCg4U1FzODs', 900, 4),
('lesson-7-5', 'course-7', '泛型', '可重用的型別', 'BCg4U1FzODs', 960, 5),
('lesson-7-6', 'course-7', '型別守衛', '縮小型別範圍', 'BCg4U1FzODs', 720, 6),
('lesson-7-7', 'course-7', '工具型別', 'Partial, Required, Pick', 'BCg4U1FzODs', 840, 7),
('lesson-7-8', 'course-7', '模組', '模組系統', 'BCg4U1FzODs', 660, 8),
('lesson-7-9', 'course-7', '設定檔', 'tsconfig.json 設定', 'BCg4U1FzODs', 600, 9),
('lesson-7-10', 'course-7', '最佳實踐', 'TypeScript 開發技巧', 'BCg4U1FzODs', 780, 10);

-- Course 8: Next.js 全端開發 (Level 8)
INSERT INTO lessons (id, course_id, title, description, video_url, video_duration, "order") VALUES
('lesson-8-1', 'course-8', 'Next.js 介紹', 'React 框架的選擇', 'mTz0GXj8NN0', 600, 1),
('lesson-8-2', 'course-8', '路由系統', 'App Router 基礎', 'mTz0GXj8NN0', 840, 2),
('lesson-8-3', 'course-8', '頁面和佈局', 'page.tsx 和 layout.tsx', 'mTz0GXj8NN0', 780, 3),
('lesson-8-4', 'course-8', '資料獲取', 'Server Components', 'mTz0GXj8NN0', 960, 4),
('lesson-8-5', 'course-8', 'API 路由', '建立 API 端點', 'mTz0GXj8NN0', 900, 5),
('lesson-8-6', 'course-8', '伺服器動作', 'Server Actions', 'mTz0GXj8NN0', 840, 6),
('lesson-8-7', 'course-8', '中間件', 'middleware.ts 使用', 'mTz0GXj8NN0', 720, 7),
('lesson-8-8', 'course-8', '認證', '實作使用者認證', 'mTz0GXj8NN0', 1020, 8),
('lesson-8-9', 'course-8', '資料庫整合', '連接 PostgreSQL', 'mTz0GXj8NN0', 960, 9),
('lesson-8-10', 'course-8', '部署', 'Vercel 部署', 'mTz0GXj8NN0', 660, 10),
('lesson-8-11', 'course-8', '效能優化', '圖片和字體優化', 'mTz0GXj8NN0', 720, 11),
('lesson-8-12', 'course-8', '實戰專案', '建立完整應用', 'mTz0GXj8NN0', 1200, 12);

-- Course 9: REST API 設計 (Level 9)
INSERT INTO lessons (id, course_id, title, description, video_url, video_duration, "order") VALUES
('lesson-9-1', 'course-9', 'REST 原則', 'RESTful 設計原則', 'fgTGADljAeg', 720, 1),
('lesson-9-2', 'course-9', 'HTTP 方法', 'GET, POST, PUT, DELETE', 'fgTGADljAeg', 660, 2),
('lesson-9-3', 'course-9', '狀態碼', 'HTTP 狀態碼使用', 'fgTGADljAeg', 600, 3),
('lesson-9-4', 'course-9', '資源命名', 'URL 設計最佳實踐', 'fgTGADljAeg', 720, 4),
('lesson-9-5', 'course-9', '分頁和過濾', '查詢參數設計', 'fgTGADljAeg', 780, 5),
('lesson-9-6', 'course-9', '認證', 'JWT 認證實作', 'fgTGADljAeg', 900, 6),
('lesson-9-7', 'course-9', '版本控制', 'API 版本管理', 'fgTGADljAeg', 660, 7),
('lesson-9-8', 'course-9', '文件', 'OpenAPI/Swagger', 'fgTGADljAeg', 720, 8);

-- Course 10: 系統設計入門 (Level 10)
INSERT INTO lessons (id, course_id, title, description, video_url, video_duration, "order") VALUES
('lesson-10-1', 'course-10', '系統設計概述', '什麼是系統設計', 'Y-Gl4HEyeUQ', 900, 1),
('lesson-10-2', 'course-10', '擴展性', '水平和垂直擴展', 'Y-Gl4HEyeUQ', 1020, 2),
('lesson-10-3', 'course-10', '負載均衡', 'Load Balancer 概念', 'Y-Gl4HEyeUQ', 960, 3),
('lesson-10-4', 'course-10', '快取', 'Caching 策略', 'Y-Gl4HEyeUQ', 1080, 4),
('lesson-10-5', 'course-10', '資料庫', 'SQL vs NoSQL', 'Y-Gl4HEyeUQ', 1200, 5),
('lesson-10-6', 'course-10', '訊息佇列', 'Message Queue', 'Y-Gl4HEyeUQ', 900, 6),
('lesson-10-7', 'course-10', '微服務', 'Microservices 架構', 'Y-Gl4HEyeUQ', 1080, 7),
('lesson-10-8', 'course-10', 'CDN', '內容分發網路', 'Y-Gl4HEyeUQ', 780, 8),
('lesson-10-9', 'course-10', '設計案例：URL 短網址', '實際系統設計', 'Y-Gl4HEyeUQ', 1200, 9),
('lesson-10-10', 'course-10', '設計案例：社群平台', '複雜系統設計', 'Y-Gl4HEyeUQ', 1500, 10);

-- Course 11: Docker 容器化 (Level 11)
INSERT INTO lessons (id, course_id, title, description, video_url, video_duration, "order") VALUES
('lesson-11-1', 'course-11', 'Docker 介紹', '容器化的概念', 'fqMOX6JJhGo', 720, 1),
('lesson-11-2', 'course-11', '安裝 Docker', '在不同平台安裝', 'fqMOX6JJhGo', 600, 2),
('lesson-11-3', 'course-11', 'Docker 映像', 'Images 概念', 'fqMOX6JJhGo', 840, 3),
('lesson-11-4', 'course-11', 'Dockerfile', '建立自己的映像', 'fqMOX6JJhGo', 960, 4),
('lesson-11-5', 'course-11', 'Docker Compose', '多容器管理', 'fqMOX6JJhGo', 1080, 5),
('lesson-11-6', 'course-11', '網路', 'Docker 網路設定', 'fqMOX6JJhGo', 780, 6),
('lesson-11-7', 'course-11', '資料持久化', 'Volumes 使用', 'fqMOX6JJhGo', 720, 7),
('lesson-11-8', 'course-11', '部署', '生產環境部署', 'fqMOX6JJhGo', 900, 8);

-- Course 12: AWS 雲端服務 (Level 12)
INSERT INTO lessons (id, course_id, title, description, video_url, video_duration, "order") VALUES
('lesson-12-1', 'course-12', 'AWS 介紹', '雲端服務概述', 'ulprqHHWlng', 900, 1),
('lesson-12-2', 'course-12', 'IAM', '身份和存取管理', 'ulprqHHWlng', 1020, 2),
('lesson-12-3', 'course-12', 'EC2', '虛擬伺服器', 'ulprqHHWlng', 1200, 3),
('lesson-12-4', 'course-12', 'S3', '物件儲存', 'ulprqHHWlng', 960, 4),
('lesson-12-5', 'course-12', 'RDS', '關聯式資料庫', 'ulprqHHWlng', 1080, 5),
('lesson-12-6', 'course-12', 'Lambda', '無伺服器運算', 'ulprqHHWlng', 1140, 6),
('lesson-12-7', 'course-12', 'API Gateway', 'API 管理', 'ulprqHHWlng', 900, 7),
('lesson-12-8', 'course-12', 'CloudFront', 'CDN 服務', 'ulprqHHWlng', 780, 8),
('lesson-12-9', 'course-12', 'Route 53', 'DNS 服務', 'ulprqHHWlng', 720, 9),
('lesson-12-10', 'course-12', 'VPC', '虛擬私有雲', 'ulprqHHWlng', 1080, 10),
('lesson-12-11', 'course-12', 'CloudWatch', '監控服務', 'ulprqHHWlng', 840, 11),
('lesson-12-12', 'course-12', '架構設計', '完整架構範例', 'ulprqHHWlng', 1500, 12);

-- ============================================
-- CHALLENGES
-- ============================================
INSERT INTO challenges (id, title, description, prize, start_date, end_date) VALUES
('challenge-1', '30天程式挑戰', '每天至少學習30分鐘程式設計，連續30天！', '限定版徽章 + 免費一個月會籍', '2025-01-01', '2025-01-31'),
('challenge-2', '前端作品集挑戰', '建立一個完整的個人作品集網站', 'MacBook Pro 抽獎資格', '2025-02-01', '2025-02-28'),
('challenge-3', 'React 專案挑戰', '使用 React 建立一個實用的應用程式', '1000元獎學金', '2025-03-01', '2025-03-31');

-- ============================================
-- EVENTS
-- ============================================
INSERT INTO events (id, title, description, type, start_date, end_date, location, max_participants, rsvp_count) VALUES
('event-1', 'React 入門工作坊', '一起動手學習 React 基礎', 'online', '2025-01-15 14:00:00+08', '2025-01-15 17:00:00+08', NULL, 100, 45),
('event-2', '台北開發者聚會', '認識同好，分享經驗', 'offline', '2025-01-20 19:00:00+08', '2025-01-20 21:00:00+08', '台北市大安區', 30, 28),
('event-3', 'TypeScript 深入淺出', '進階 TypeScript 技巧分享', 'online', '2025-02-01 14:00:00+08', '2025-02-01 16:00:00+08', NULL, 200, 89),
('event-4', '系統設計讀書會', '一起學習系統設計', 'online', '2025-02-10 20:00:00+08', '2025-02-10 22:00:00+08', NULL, 50, 32),
('event-5', '高雄開發者聚會', '南部開發者交流', 'offline', '2025-02-15 18:00:00+08', '2025-02-15 21:00:00+08', '高雄市前鎮區', 25, 18);
