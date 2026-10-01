# 🛠️ FixIt Home — On-Demand Home Repair & Service Marketplace

![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![React Native / Expo](https://img.shields.io/badge/Expo-React%20Native-000000?style=for-the-badge&logo=expo&logoColor=white)
![Node.js](https://img.shields.io/badge/Express.js-5.0-000000?style=for-the-badge&logo=express&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Drizzle%20ORM-4479A1?style=for-the-badge&logo=postgresql&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)

**FixIt Home** is an on-demand home repair and maintenance booking marketplace connecting homeowners with verified local technicians for plumbing, electrical work, appliance repair, and HVAC maintenance.

---

## 🌟 Key Features

- 📱 **Mobile-First Client App (Expo / React Native)**:
  - **Job Posting**: Post a repair request in under 60 seconds with category, photos, location, and urgency.
  - **Technician Discovery**: Browse nearby verified technicians with flat-rate quotes and user ratings.
  - **My Jobs Dashboard**: Real-time status tracking (`posted`, `accepted`, `in_progress`, `completed`, `cancelled`).
  - **Technician Portal**: Manage incoming leads, accept/decline jobs, and track total earnings.
  - **User Onboarding**: Role selection (Customer vs. Technician) with custom preferences.

- ⚙️ **High-Performance Express 5 API Server**:
  - RESTful API endpoints for jobs, bookings, user profiles, ratings, and payouts.
  - OpenAPI 3.0 specification with automated Orval type-safe React Query hooks & Zod validators.
  - Structured logging with Pino logger.

- 🗄️ **Database Architecture**:
  - PostgreSQL database powered by **Drizzle ORM**.
  - Type-safe schema definitions for `users`, `technician_profiles`, `jobs`, `bookings`, `messages`, `payments`, and `ratings`.

---

## 🛠️ Architecture & Tech Stack

```
Fix-It-Home/
├── artifacts/
│   ├── mobile/            # Expo / React Native Web App (Tabs navigation, screens & components)
│   ├── api-server/        # Express 5 REST API Server (TypeScript, Pino logging)
│   └── mockup-sandbox/    # UI Mockup preview environment (Vite, React, Tailwind CSS)
├── lib/
│   ├── db/                # PostgreSQL schema & Drizzle ORM configuration
│   ├── api-spec/          # OpenAPI specification & Orval codegen script
│   ├── api-zod/           # Auto-generated Zod validation schemas
│   └── api-client-react/  # Generated TanStack React Query hooks
├── scripts/               # Workspace build & post-merge maintenance scripts
├── pnpm-workspace.yaml    # Monorepo configuration
├── package.json           # Workspace package definitions
└── README.md              # Project documentation
```

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js 20+
- pnpm package manager (`npm install -g pnpm`)
- PostgreSQL instance (or hosted database such as Neon / Supabase)

### Setup & Run

1. **Clone the Repository**
   ```bash
   git clone git@github.com:aayush2411ghoghari-sketch/Fix-It-Home.git
   cd Fix-It-Home
   ```

2. **Install Dependencies**
   ```bash
   pnpm install
   ```

3. **Configure Environment Variables**
   Set `DATABASE_URL` in your environment or `.env` file:
   ```env
   DATABASE_URL=postgresql://user:password@localhost:5432/fixit_home
   ```

4. **Run Development Servers**
   - **Start API Server (Port 5000)**:
     ```bash
     pnpm --filter @workspace/api-server run dev
     ```
   - **Start Mobile Web / Expo App**:
     ```bash
     pnpm --filter @workspace/mobile run dev
     ```
   - **Typecheck across Workspace**:
     ```bash
     pnpm run typecheck
     ```

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE.md).
