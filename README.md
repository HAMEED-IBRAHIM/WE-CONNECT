# 🎓 AlumniConnect — Alumni Networking Platform

A full-stack Alumni Networking Platform built with **React**, **Spring Boot**, **PostgreSQL**, and **JWT** authentication.

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, React Router v6, Axios |
| Backend | Spring Boot 3.2, Spring Security |
| Database | PostgreSQL 15+ |
| Auth | JWT (JJWT 0.12) |
| ORM | Spring Data JPA / Hibernate |
| Build | Maven (backend), npm (frontend) |

---

## 🚀 Features

### 🔐 Authentication & Authorization
- JWT-based stateless authentication
- Role-based access: **Student**, **Alumni**, **Admin**
- Register / Login with email or username
- Route guards on both frontend and backend

### 👤 Profiles
- Rich profile with bio, company, department, graduation year, LinkedIn
- Profile picture support
- Edit own profile inline

### 📝 Posts
- Create, edit, delete posts (with ownership enforcement)
- Image attachments via URL
- Tag system with `#hashtag` pills
- Server-side pagination (10 per page)
- Full-text search across title, content, tags

### 💬 Comments & Likes
- Nested comment replies (2-level deep)
- Like toggle for posts and comments
- Real-time counts
- Paginated root comments

### ✅ Alumni Verification Workflow
```
Alumni → Submit Document URL → PENDING
Admin → Review → APPROVED / REJECTED
Alumni profile shows verified badge (✓)
```

### 🛡️ Admin Dashboard
- Platform-wide statistics
- Pending verification queue with approve/reject
- User management with delete capability
- Search across all users

---

## ⚙️ Setup & Running

### Prerequisites
- Java 17+
- Node.js 18+
- PostgreSQL 15+
- Maven 3.8+

---

### 1. Database Setup

```bash
# In psql
CREATE DATABASE alumni_db;
```

Then update credentials in `backend/src/main/resources/application.properties`:
```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/alumni_db
spring.datasource.username=postgres
spring.datasource.password=your_password
```

---

### 2. Start the Backend

```bash
cd backend
mvn spring-boot:run
```

Backend runs on: **http://localhost:8080/api**

After the first start, create the admin user:
```bash
psql -d alumni_db -f ../database/setup.sql
```
Admin credentials: `admin@alumniplatform.com` / `admin123`

---

### 3. Start the Frontend

```bash
cd frontend
npm start
```

Frontend runs on: **http://localhost:3000**

---

## 📡 REST API Reference

### Auth
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | Public | Register new user |
| POST | `/api/auth/login` | Public | Login, returns JWT |

### Users
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/users/{id}` | Public | Get user profile |
| GET | `/api/users/search?query=&role=&page=&size=` | Public | Search users |
| GET | `/api/users/me` | 🔒 Any | Get current user |
| PUT | `/api/users/me` | 🔒 Any | Update profile |
| POST | `/api/users/me/submit-verification` | 🔒 Alumni | Submit verification |

### Posts
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/posts?query=&page=&size=` | Public | Get/search posts |
| GET | `/api/posts/{id}` | Public | Get single post |
| GET | `/api/posts/user/{userId}` | Public | Get user's posts |
| POST | `/api/posts` | 🔒 Any | Create post |
| PUT | `/api/posts/{id}` | 🔒 Owner | Update post |
| DELETE | `/api/posts/{id}` | 🔒 Owner/Admin | Delete post |

### Comments
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/posts/{postId}/comments?page=&size=` | Public | Get comments |
| POST | `/api/posts/{postId}/comments` | 🔒 Any | Add comment/reply |
| PUT | `/api/comments/{id}` | 🔒 Owner | Edit comment |
| DELETE | `/api/comments/{id}` | 🔒 Owner/Admin | Delete comment |

### Likes
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/likes/posts/{postId}` | 🔒 Any | Toggle post like |
| POST | `/api/likes/comments/{commentId}` | 🔒 Any | Toggle comment like |

### Admin (ROLE_ADMIN only)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/stats` | Platform statistics |
| GET | `/api/admin/verifications/pending` | Pending verifications |
| PATCH | `/api/admin/verifications/{userId}` | Approve/reject verification |
| GET | `/api/admin/users` | All users with search |
| DELETE | `/api/admin/users/{userId}` | Delete user |

---

## 📁 Project Structure

```
ALUMINI/
├── backend/                    # Spring Boot
│   └── src/main/java/com/alumni/platform/
│       ├── model/              # JPA Entities
│       │   ├── User.java
│       │   ├── Post.java
│       │   ├── Comment.java
│       │   ├── Like.java
│       │   ├── Role.java (enum)
│       │   └── VerificationStatus.java (enum)
│       ├── repository/         # Spring Data JPA Repos
│       ├── service/            # Business logic
│       ├── controller/         # REST endpoints
│       ├── dto/                # Request/Response DTOs
│       ├── security/           # JWT + Spring Security
│       ├── config/             # SecurityConfig, CORS
│       └── exception/          # GlobalExceptionHandler
│
├── frontend/                   # React 18
│   └── src/
│       ├── context/            # AuthContext (JWT state)
│       ├── services/           # api.js (Axios client)
│       ├── components/         # Navbar, PostCard, UserCard, CommentSection
│       └── pages/
│           ├── FeedPage         (home, search, pagination)
│           ├── LoginPage
│           ├── RegisterPage     (role selector)
│           ├── ProfilePage      (edit, verification submit)
│           ├── PostDetailPage   (full post + comments)
│           ├── CreateEditPostPage
│           ├── UsersListPage    (alumni + students)
│           └── AdminPage        (dashboard + workflow)
│
└── database/
    └── setup.sql               # DB init + admin user seed
```

---

## 🔒 Security Details

- Passwords hashed with BCrypt
- JWT secret configured in `application.properties`
- CORS restricted to `http://localhost:3000`
- `@PreAuthorize` annotations enforce role rules at method level
- Global exception handler returns structured JSON errors

---

## 🎨 UI Features

- **Dark Mode** design system with CSS custom properties
- **Glassmorphism** navbar with blur effect
- **Gradient** role-specific profile cards
- **Micro-animations** (hover, slide-in, shimmer skeleton)
- **Responsive** grid layout
- Server-side **paginated** post and user listings
- **Real-time** like toggling with optimistic updates
