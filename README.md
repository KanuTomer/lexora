# 🚀 Lexora

Lexora is a full-stack academic resource sharing platform where students can upload, discover, and manage study materials such as notes, assignments, test papers, and syllabi — all organized by course, semester, and subject.

It is designed to be simple, fast, and collaborative, with moderation and reporting systems to maintain content quality.

---

## ✨ Features

### 📚 Core Features

- Upload and share academic files (PDF, ZIP, etc.)
- Browse files by subject and semester
- Download tracking
- Search across files, subjects, and users
- File preview (PDF support)

### 👤 User System

- Signup & login (JWT-based auth)
- Profile with avatar support (Cloudinary)
- View user uploads
- Bookmark files

### 🛡️ Moderation System

- File approval workflow
- Reporting system with reasons
- Moderator panel:
  - Pending files
  - Reported files
  - Stale files (1+ year old)

- Admin panel:
  - Manage users
  - Assign roles (user / moderator / admin)

### ☁️ Cloud Integration

- Cloudinary for file and avatar storage
- PostgreSQL database (via Prisma)

---

## 🏗️ Tech Stack

### Frontend

- React (Vite)
- Axios
- Tailwind / UI components

### Backend

- Node.js + Express
- Prisma ORM
- PostgreSQL

### Infrastructure

- Cloudinary (file storage)
- JWT authentication

---

## 📁 Project Structure

```txt
/frontend   → React app
/backend    → Express API + Prisma
```

---

## ⚙️ Environment Variables

Create `.env` files (do NOT commit them).

### Backend (`backend/.env`)

```env
DATABASE_URL=
PORT=4000
CLIENT_ORIGIN=
JWT_SECRET=
BASE_URL=

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

### Frontend (`frontend/.env`)

```env
VITE_API_URL=http://localhost:4000
```

---

## 🧑‍💻 Local Development Setup

### 1. Clone the repository

```bash
git clone https://github.com/KanuTomer/lexora.git
cd lexora
```

---

### 2. Backend Setup

```bash
cd backend
npm install

npx prisma generate
npx prisma migrate deploy

npm run dev
```

Backend runs at:

```
http://localhost:4000
```

---

### 3. Frontend Setup

```bash
cd ../frontend
npm install
npm run dev
```

Frontend runs at:

```
http://localhost:5173
```

---

### 4. Database

Make sure PostgreSQL is running locally OR use a hosted DB (e.g. Neon).

---

### 5. Cloudinary Setup

1. Create account on Cloudinary
2. Add credentials to backend `.env`
3. Ensure:
   - PDFs/ZIPs are allowed (disable restricted media types if needed)

---

## 🧪 Testing the App

After setup:

1. Sign up a new user
2. Log in
3. Upload a file
4. Preview/download file
5. Try search
6. Test moderation (if role assigned)

---

## 🔒 Security Notes

- `.env` is ignored via `.gitignore`
- JWT-based authentication
- File upload size limits enforced
- File type validation recommended

---

## 🚀 Deployment (Suggested Stack)

- Frontend → Vercel
- Backend → Render
- Database → Neon
- Storage → Cloudinary

---

## 📌 Current Status

- MVP complete ✅
- Cloud storage working ✅
- Auth + moderation implemented ✅
- Ready for deployment 🚀

---

## 🤝 Contributing

This is an evolving project. Contributions are welcome!

If you’d like to help:

- Fork the repo
- Create a feature branch
- Submit a PR

---

## 👨‍💻 Author

Kanu Tomer

- GitHub: https://github.com/KanuTomer
- LinkedIn: https://www.linkedin.com/in/kanu-tomer/
- YouTube: https://www.youtube.com/@adeadkid

---

## ⭐ Final Note

Lexora is built as a practical, scalable platform for students to collaborate and share knowledge efficiently.

If you find it useful, consider starring the repo ⭐
