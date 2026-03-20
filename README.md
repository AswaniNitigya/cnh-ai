# College Notice Hub (CNH)

[![Frontend](https://img.shields.io/badge/Frontend-React%20%2B%20Vite-blue)](./frontend)
[![Backend](https://img.shields.io/badge/Backend-Node.js%20%2B%20Express-green)](./backend)
[![Database](https://img.shields.io/badge/Database-Supabase%20PostgreSQL-orange)](https://supabase.com/)

College Notice Hub (CNH) is a full-stack, centralized notice management platform designed to replace chaotic WhatsApp groups and scattered emails. It organizes notices intelligently and targets specific student groups based on their course, branch, and graduation year.

## ✨ Features

- **Role-Based Access Control:** Distinct experiences for `Student`, `Class Representative (CR)`, `Faculty`, and `Super Admin`.
- **Dynamic Multi-Step Registration:** Role-dependent fields (e.g., Students enter academic details, Faculty enter verification phone numbers).
- **Admin Approval Workflow:** Secure onboarding for CRs and Faculty requiring Super Admin approval.
- **Smart Targeting:** Send notices globally, or restrict them by filters like `Branch` (CSE, ECE), `Graduation Year`, and `Section`.
- **OCR Integration:** Automatically extract text and parse information from uploaded images and PDFs for faster notice creation.
- **Beautiful UI/UX:** A responsive glassmorphism design with built-in dark/light mode support, powered by Tailwind CSS.

## 🛠️ Tech Stack

### Frontend (`/frontend`)
- **Framework:** React 18 built with Vite
- **Styling:** Tailwind CSS (Custom Design System, Glassmorphism aesthetics)
- **State Management:** Zustand
- **Routing:** React Router v6
- **Icons:** Lucide React

### Backend (`/backend`)
- **Runtime:** Node.js
- **Framework:** Express.js
- **Authentication:** JWT (JSON Web Tokens) & bcryptjs
- **Database:** Supabase (PostgreSQL)

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v16+)
- A Supabase Project (PostgreSQL)

### 1. Database Setup (Supabase)
Run the initial SQL schema provided in `backend/models/schema.sql` inside your Supabase SQL Editor.

### 2. Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `backend` folder:
   ```env
   PORT=5000
   JWT_SECRET=your_super_secret_jwt_key
   SUPABASE_URL=https://your-project-ref.supabase.co
   SUPABASE_SERVICE_KEY=your_supabase_service_role_key
   FRONTEND_URL=http://localhost:5173
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

### 3. Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `frontend` folder:
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```
4. Start the frontend development server:
   ```bash
   npm run dev
   ```

---

## 📂 Project Structure

```text
webscap2/
├── backend/                  # Express.js REST API
│   ├── controllers/          # Business logic handlers
│   ├── middleware/           # JWT & Auth guards
│   ├── models/               # Supabase config & schema.sql
│   ├── routes/               # API endpoint definitions
│   └── server.js             # Main application entry point
│
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/       # Reusable UI components & layouts
│   │   ├── hooks/            # Custom React hooks
│   │   ├── lib/              # Utility functions & Axios instance
│   │   ├── pages/            # Main application views (Auth, Dashboard, Profile, etc.)
│   │   ├── store/            # Zustand global stores (Auth, Theme)
│   │   └── index.css         # Global Tailwind base & CSS variables
│   └── vite.config.js
│
└── README.md                 # Project Overview (This file)
```

## 🔒 Security
- Passwords are hashed heavily using `bcryptjs` before persisting to the database.
- Row-Level Security (RLS) policies govern data access on Supabase.
- Secure, JWTs ensure resilient session management across the application.
