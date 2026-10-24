<h1 align="center">
  🎓 WE-CONNECT
</h1>

<p align="center">
  <b>An Alumni & Student Networking Platform — Built from scratch by a single developer.</b><br/>
  Connect, collaborate, and grow together.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Spring_Boot-3.2-brightgreen?style=for-the-badge&logo=spring" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react" />
  <img src="https://img.shields.io/badge/PostgreSQL-15-336791?style=for-the-badge&logo=postgresql" />
  <img src="https://img.shields.io/badge/JWT-Auth-orange?style=for-the-badge&logo=jsonwebtokens" />
  <img src="https://img.shields.io/badge/Deployed_on-Vercel_%2B_Railway-black?style=for-the-badge&logo=vercel" />
</p>

---

## 👋 About This Project

WE-CONNECT is a full-stack alumni networking platform I built entirely on my own — from database design to UI animations. The idea is simple: **bring students, alumni, and recruiters together in one place** where real connections happen.

It's not just a CRUD app. It has:
- 🔐 Real authentication with JWT + Google Sign-In
- 📧 Email OTP verification (powered by Resend)
- 🛡️ Admin dashboard with verification workflows
- 💬 Posts, comments, likes, job listings
- 📄 Resume builder
- 🎨 A premium dark-mode UI with glassmorphism & animations
- 🚀 Production-ready with Docker + PostgreSQL

I built this to solve a real problem — most alumni platforms feel cold and corporate. WE-CONNECT feels alive.

---

## ✨ Features at a Glance

| Feature | Details |
|---------|---------|
| 🔐 **Auth** | Email+Password, Google OAuth, OTP email verification |
| 👤 **Profiles** | Bio, company, department, graduation year, profile picture |
| 📝 **Feed** | Create posts with tags, images, hashtags. Search & filter |
| 💬 **Social** | Comments, replies, likes, real-time counts |
| 🤝 **Network** | Connect with alumni, find mentors |
| 💼 **Jobs** | Post & apply for jobs, filter by type & location |
| 📄 **Resume Builder** | ATS-ready resume builder built-in |
| 🛡️ **Admin Panel** | Stats, verification queue, user management |
| 📧 **Emails** | OTP emails, announcements via Resend SMTP |
| 🔒 **Security** | BCrypt, JWT, role-based access (Student/Alumni/Admin) |

---

## 🛠️ Tech Stack

### Backend
- **Spring Boot 3.2** — REST API
- **Spring Security** — JWT auth + role-based access
- **Spring Data JPA + Hibernate** — ORM
- **PostgreSQL** (production) / H2 (local dev)
- **Spring Mail** → Resend SMTP for emails
- **Lombok** — cleaner Java code
- **Maven** — build tool

### Frontend
- **React 19** — UI framework
- **React Router v6** — SPA routing
- **Axios** — HTTP client
- **Framer Motion** — animations
- **Lucide React** — icons
- **React Hot Toast** — notifications
- **Google OAuth** via `@react-oauth/google`

### DevOps
- **Docker** — containerized backend
- **Vercel** — frontend hosting
- **Railway** — backend hosting
- **Neon / Supabase** — managed PostgreSQL

---

## 🚀 Getting Started (Local Dev)

### Prerequisites
- Java 17+
- Node.js 18+
- Maven 3.8+

### 1. Clone the repo
```bash
git clone https://github.com/YOUR_USERNAME/WE-CONNECT.git
cd WE-CONNECT
```

### 2. Start the Backend
The backend uses an **H2 file database** locally — no PostgreSQL installation needed!

```bash
cd backend
mvn spring-boot:run
```

Backend runs at: **http://localhost:8080/api**

> First run automatically seeds demo users (Priya Sharma @ Google, Rahul Verma @ Microsoft, admin account, etc.)

**Demo Accounts:**
| Role | Email | Password |
|------|-------|----------|
| 🛡️ Admin | `admin@weconnect.com` | `admin123` |
| 👩‍💻 Alumni | `priya.sharma@gmail.com` | `password` |
| 📊 Alumni | `rahul.verma@gmail.com` | `password` |

### 3. Start the Frontend
```bash
cd frontend
npm install
npm start
```

Frontend runs at: **http://localhost:3000**

Or just double-click `START_ALL.bat` (Windows) to start both at once! 🎉

---

## 🗄️ Connecting to a Real Database (Neon or Supabase)

The local dev setup uses H2 (no install needed). For production or if you want a real cloud PostgreSQL, follow these steps:

### Option A — Neon (Recommended, Free)

1. Go to **[neon.tech](https://neon.tech)** and sign up
2. Create a new project → call it `we-connect`
3. Go to your project dashboard → **Connection Details**
4. Copy the **JDBC connection string** (looks like):
   ```
   jdbc:postgresql://ep-cool-name-123456.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```
5. Create a file `backend/src/main/resources/application-local-pg.properties`:
   ```properties
   spring.datasource.url=jdbc:postgresql://YOUR_NEON_HOST/neondb?sslmode=require
   spring.datasource.username=YOUR_NEON_USER
   spring.datasource.password=YOUR_NEON_PASSWORD
   spring.datasource.driver-class-name=org.postgresql.Driver
   spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.PostgreSQLDialect
   spring.h2.console.enabled=false
   ```
6. Run with the profile:
   ```bash
   mvn spring-boot:run -Dspring-boot.run.profiles=local-pg
   ```

### Option B — Supabase (Also Free)

1. Go to **[supabase.com](https://supabase.com)** and create a project
2. Go to **Project Settings → Database**
3. Copy the **Connection string** (URI format)
4. Same steps as Neon above — just use `?sslmode=require` at the end of your JDBC URL

> ✅ Both Neon and Supabase work perfectly with Spring Boot. The app auto-creates all tables on first run (`ddl-auto=update`).

---

## ☁️ Production Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for the complete step-by-step guide for:
- **Vercel** (frontend)
- **Railway** (backend)
- **Neon/Supabase** (database)

---

## 📁 Project Structure

```
WE-CONNECT/
├── backend/                          # Spring Boot API
│   ├── Dockerfile                    # For Railway deployment
│   └── src/main/
│       ├── java/com/alumni/platform/
│       │   ├── config/               # Security, CORS, DataSeeder
│       │   ├── controller/           # REST endpoints
│       │   ├── dto/                  # Request/Response objects
│       │   ├── exception/            # Global error handling
│       │   ├── model/                # JPA entities
│       │   ├── repository/           # Spring Data repos
│       │   ├── security/             # JWT filter & utils
│       │   └── service/              # Business logic
│       └── resources/
│           ├── application.properties        # Local dev (H2)
│           └── application-prod.properties   # Production (PostgreSQL)
│
├── frontend/                         # React 19 App
│   ├── vercel.json                   # Vercel SPA routing config
│   └── src/
│       ├── context/                  # AuthContext (JWT state)
│       ├── services/                 # api.js (Axios client)
│       ├── components/               # Reusable UI components
│       └── pages/                    # All page views
│
├── .gitignore
├── START_ALL.bat                     # One-click local startup (Windows)
└── README.md
```

---

## 🔒 Environment Variables

### Backend (set in Railway or `.env`)
| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL JDBC URL |
| `DATABASE_USERNAME` | DB username |
| `DATABASE_PASSWORD` | DB password |
| `JWT_SECRET` | 64-char hex secret for signing tokens |
| `RESEND_API_KEY` | From [resend.com](https://resend.com) |
| `GOOGLE_CLIENT_ID` | From Google Cloud Console |
| `CORS_ORIGINS` | Your Vercel frontend URL |

### Frontend (set in Vercel or `.env`)
| Variable | Description |
|----------|-------------|
| `REACT_APP_API_URL` | Your Railway backend URL + `/api` |
| `REACT_APP_GOOGLE_CLIENT_ID` | Google OAuth Client ID |

---

## 👨‍💻 About the Developer

Built solo by **Ibrahim Hameed** — a passionate developer who loves building things that actually work and look great doing it.

> "I didn't just want to build another CRUD app. I wanted WE-CONNECT to feel like a real platform that people would actually enjoy using."

---

## 📄 License

MIT License — feel free to use, fork, and build on top of this.
