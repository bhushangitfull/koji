# Backend Setup Complete! ✅

All backend files have been created. Here's what you have:

## 📁 Created Files Summary

### Configuration (3 files)
- ✅ `tsconfig.json` - TypeScript configuration
- ✅ `.env.example` - Environment variables template
- ✅ `.gitignore` - Git ignore rules

### Source Code

#### Config (3 files)
- ✅ `src/config/env.ts` - Environment variable loader
- ✅ `src/config/database.ts` - PostgreSQL connection pool
- ✅ `src/config/redis.ts` - Redis client setup

#### Types (1 file)
- ✅ `src/types/index.ts` - All TypeScript interfaces

#### Middleware (2 files)
- ✅ `src/middleware/auth.ts` - JWT authentication
- ✅ `src/middleware/errorHandler.ts` - Error handling

#### Models (3 files)
- ✅ `src/models/User.ts` - User database operations
- ✅ `src/models/Episode.ts` - Episode CRUD operations
- ✅ `src/models/Vocabulary.ts` - Vocabulary CRUD operations

#### Routes (8 files)
- ✅ `src/routes/auth.ts` - Login/Register endpoints
- ✅ `src/routes/episodes.ts` - Episode management endpoints
- ✅ `src/routes/vocabulary.ts` - Vocabulary lookup endpoints
- ✅ `src/routes/quiz.ts` - Quiz endpoints (placeholder)
- ✅ `src/routes/progress.ts` - Progress tracking (placeholder)
- ✅ `src/routes/leaderboard.ts` - Leaderboard endpoints (placeholder)
- ✅ `src/routes/friends.ts` - Friends/Social endpoints (placeholder)
- ✅ `src/routes/index.ts` - Route aggregator

#### Server
- ✅ `src/index.ts` - Express server entry point

#### Database
- ✅ `src/database/schema.sql` - Complete PostgreSQL schema

**Total: 25 files created** ✨

---

## 🚀 Complete Setup Guide

### Prerequisites - What to Download

| Item | Required | Download Link | Notes |
|------|----------|------------------|-------|
| **PostgreSQL 14+** | ✅ YES | https://www.postgresql.org/download/windows/ | Database server |
| **pgAdmin** | ❌ Optional | https://www.pgadmin.org/download/pgadmin-4-windows/ | GUI for database (recommended) |
| **Redis** | ❌ Optional | https://github.com/microsoftarchive/redis/releases | Caching (skip for now) |

---

### Step 1: Download & Install PostgreSQL

1. Go to https://www.postgresql.org/download/windows/
2. Click **"Download the installer"**
3. Run the installer and follow the wizard
4. **⚠️ Important:** Remember the password you set for the `postgres` user
5. Keep all default settings (port 5432, localhost)
6. Complete the installation

**Verify installation:**
```bash
# Open Command Prompt and type:
psql --version
# Should show: psql (PostgreSQL) 14.x or higher
```

---

### Step 2: Run npm Setup Script

```bash
cd C:\Users\Admin\koji
setup-backend.bat
```

This will:
- Create `backend/` directory structure
- Run `npm init -y`
- Install all dependencies (Express, TypeScript, etc.)
- Create `node_modules/` folder

**Installation takes 2-5 minutes**. Wait for it to complete.

---

### Step 3: Generate JWT Secret

Generate a secure random string for authentication:

**Using Node.js (Easy):**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the output (it will look like): `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6...`

**Using PowerShell:**
```powershell
[Convert]::ToBase64String((1..32 | ForEach-Object {Get-Random -Maximum 256}))
```

**Using online tool:**
Visit https://www.uuidgenerator.net/ and copy the UUID

---

### Step 4: Create PostgreSQL Database

**Option A: Using pgAdmin (GUI - Recommended)**
1. Install pgAdmin from https://www.pgadmin.org/download/
2. Open pgAdmin and login with your postgres password
3. Right-click **"Databases"** → **Create** → **Database**
4. Name: `koji`
5. Click **Create**

**Option B: Using Command Line (psql)**
```bash
# Open Command Prompt
psql -U postgres

# Inside psql prompt, type:
CREATE DATABASE koji;
\quit
```

---

### Step 5: Run Database Schema (Create Tables)

**Option A: Using pgAdmin (Recommended)**
1. Open pgAdmin
2. Expand **Databases** → Click **koji**
3. Click **Tools** → **Query Tool**
4. Open `backend\src\database\schema.sql` in a text editor
5. Copy all the SQL content
6. Paste into pgAdmin Query Tool
7. Click **Execute** (or press F5)
8. Success! Tables are created ✅

**Option B: Using Command Line (psql)**
```bash
psql -U postgres -d koji -f "C:\Users\Admin\koji\backend\src\database\schema.sql"
```

---

### Step 6: Create .env Configuration File

1. Navigate to `C:\Users\Admin\koji\backend\`
2. Open `.env.example` in a text editor
3. Create a new file called `.env`
4. Copy all content from `.env.example` and paste into `.env`
5. Fill in the values:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=koji
DB_USER=postgres
DB_PASSWORD=<YOUR_POSTGRES_PASSWORD>

# JWT Configuration
JWT_SECRET=<PASTE_YOUR_GENERATED_SECRET_HERE>
JWT_EXPIRE=7d

# Redis Configuration (Optional - keep default)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# External APIs (Optional - leave blank for now)
OPENAI_API_KEY=

# Frontend Configuration
FRONTEND_URL=http://localhost:8081
FRONTEND_PORT=8081

# Feature Flags (Keep as-is)
ENABLE_REDIS=false
ENABLE_JOBS=false
```

**Replace these values:**
- `<YOUR_POSTGRES_PASSWORD>` → The password you set during PostgreSQL install
- `<PASTE_YOUR_GENERATED_SECRET_HERE>` → The secret from Step 3

6. **Save the file** (`Ctrl+S`)

---

### Step 7: Test Database Connection

```bash
# Navigate to backend folder
cd C:\Users\Admin\koji\backend

# Install dependencies (if not done by setup-backend.bat)
npm install

# Test the connection
npm run dev
```

Expected output:
```
╔════════════════════════════════════╗
║      Koji Backend Server           ║
║      Running on port 3000          ║
║      Environment: development      ║
╚════════════════════════════════════╝

API Documentation: http://localhost:3000/api
Health Check: http://localhost:3000/health
```

If you see this, **congratulations!** ✅ Backend is running!

---

### Step 8: Verify API Works

Open your browser and test:

1. **Health Check:**
   ```
   http://localhost:3000/health
   ```
   
   You should see:
   ```json
   {
     "success": true,
     "data": {
       "status": "ok",
       "timestamp": "2026-01-30T07:10:00.000Z"
     }
   }
   ```

2. **Test Register (using Postman or curl):**
   ```bash
   curl -X POST http://localhost:3000/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"password123","name":"Test User"}'
   ```

---

## 🔐 Environment Variables Explained

| Variable | Required | Example | Description |
|----------|----------|---------|-------------|
| `PORT` | Optional | `3000` | Server port |
| `NODE_ENV` | Required | `development` | Environment mode |
| `DB_HOST` | Required | `localhost` | Database server |
| `DB_PORT` | Required | `5432` | PostgreSQL port |
| `DB_NAME` | Required | `koji` | Database name |
| `DB_USER` | Required | `postgres` | Database user |
| `DB_PASSWORD` | Required | `your_password` | Database password |
| `JWT_SECRET` | Required | `a1b2c3d4...` | Authentication secret |
| `JWT_EXPIRE` | Optional | `7d` | Token expiration |
| `REDIS_HOST` | Optional | `localhost` | Redis server (disabled) |
| `REDIS_PORT` | Optional | `6379` | Redis port (disabled) |
| `OPENAI_API_KEY` | Optional | `sk-...` | For audio transcription later |
| `FRONTEND_URL` | Optional | `http://localhost:8081` | CORS origin |
| `ENABLE_REDIS` | Optional | `false` | Enable caching |
| `ENABLE_JOBS` | Optional | `false` | Enable job queue |

---

## 🔗 Quick Reference

**Start Development Server:**
```bash
cd C:\Users\Admin\koji\backend
npm run dev
```

**Build for Production:**
```bash
npm run build
npm start
```

**Run Tests:**
```bash
npm test
```

**Check Code Style:**
```bash
npm run lint
```

**Reset Everything (dangerous!):**
```bash
# Stop the server first
# Then delete node_modules and reinstall:
rmdir /s /q node_modules
npm install
```

---

## 📡 API Endpoints (Ready to Use)

### Authentication
- `POST /api/auth/register` - Create new user
- `POST /api/auth/login` - Login user

### Episodes
- `POST /api/episodes/upload` - Upload anime episode
- `GET /api/episodes/:id` - Get episode by ID
- `GET /api/episodes/user/all` - Get all user episodes
- `GET /api/episodes/:id/status` - Check processing status
- `DELETE /api/episodes/:id` - Delete episode

### Vocabulary
- `GET /api/vocabulary/:episodeId` - Get words from episode
- `GET /api/vocabulary/word/:wordId` - Get single word
- `POST /api/vocabulary/batch` - Batch lookup words

### Quiz (Placeholder - needs implementation)
- `POST /api/quiz/generate` - Generate quiz
- `GET /api/quiz/:quizId` - Get quiz
- `POST /api/quiz/:quizId/submit` - Submit answers
- `GET /api/quiz/user/history` - Quiz history

### Progress (Placeholder - needs implementation)
- `GET /api/progress/dashboard` - User dashboard
- `GET /api/progress/weekly-data` - Weekly stats
- `GET /api/progress/vocabulary` - Vocabulary progress

### Leaderboard (Placeholder - needs implementation)
- `GET /api/leaderboard/global` - Global rankings
- `GET /api/leaderboard/weekly` - Weekly rankings
- `GET /api/leaderboard/friends/:userId` - Friend rankings

### Friends (Placeholder - needs implementation)
- `POST /api/friends/add/:userId` - Add friend
- `GET /api/friends/list` - Friends list
- `POST /api/friends/remove/:userId` - Remove friend

### Health Check
- `GET /health` - Server status

---

## 🔐 Authentication Flow

All protected endpoints require JWT token:
```
Authorization: Bearer <JWT_TOKEN>
```

1. User registers: `POST /api/auth/register`
2. Backend returns JWT token
3. User includes token in all subsequent requests
4. Middleware validates token (auth.ts)
5. Request proceeds or returns 401/403 error

---

## 📊 Database Schema Highlights

| Table | Purpose |
|-------|---------|
| `users` | User accounts & profiles |
| `episodes` | Anime episodes uploaded |
| `vocabulary` | Words extracted from episodes |
| `user_vocabulary` | Word learning progress (SRS) |
| `quizzes` | Quiz sessions |
| `quiz_questions` | Individual quiz questions |
| `user_stats` | Points, streaks, rankings |
| `leaderboard` | Cached leaderboard rankings |
| `user_badges` | Achievement badges |
| `friendships` | Social connections |
| `daily_challenges` | Daily learning goals |

All tables include:
- UUID primary keys
- Proper indexes for queries
- Foreign key relationships
- Timestamps (created_at, updated_at)
- Automatic timestamp triggers

---

## ⚙️ Available npm Scripts

```bash
npm run dev      # Start with ts-node (auto-reload)
npm run build    # Compile TypeScript to JavaScript
npm run start    # Run compiled JavaScript
npm run test     # Run tests (Jest)
npm run lint     # Check code style (ESLint)
```

---

## 🛠️ What's Next?

### Phase 1 Remaining:
- ✅ Node.js/Express backend structure
- ✅ TypeScript configuration
- ✅ PostgreSQL schema
- ✅ JWT authentication
- ❌ PostgreSQL setup locally (YOUR TURN)
- ❌ Redis setup (optional, disabled in config)

### Phase 2:
- Episode upload endpoints
- File storage configuration (local files, no S3)
- Processing status tracking

### Phase 3:
- Python NLP microservice setup
- Audio transcription (Whisper)
- Subtitle parsing & word extraction

---

## 💡 Important Notes

1. **Redis is disabled by default** - Set `ENABLE_REDIS=true` in .env if you want caching
2. **S3 storage is NOT configured** - You'll use local file playback (no cloud upload)
3. **Python service is separate** - Will be set up in Phase 3
4. **All endpoints return JSON** with format:
   ```json
   { "success": true, "data": {...} }
   or
   { "success": false, "error": "message" }
   ```

---

**Ready to start? 🚀**

1. Run `setup-backend.bat`
2. Set up PostgreSQL locally
3. Create `.env` file
4. Run database schema
5. Start server: `npm run dev`

Questions? Check the comments in each file!
