# 🎌 Koji - AI Japanese Learning App Through Anime

> Learn Japanese **actively** through anime with AI-powered vocabulary extraction, interactive quizzes, spaced repetition, and competitive leaderboards. Turn passive anime watching into an addictive learning game.

---

## 🎯 Project Overview

Koji is a gamified Japanese learning mobile app that:
- 📺 Analyzes anime episodes you upload (subtitles + audio)
- 🤖 Extracts vocabulary words and phrases using AI/NLP
- 📝 Creates interactive flashcard reviews
- 🎯 Generates personalized quizzes (multiple choice + fill-in-blank)
- 📊 Tracks learning progress with spaced repetition
- 🏆 Motivates users with leaderboards, badges, and daily challenges
- 📈 Provides weekly comprehensive tests based on watched episodes

**Status:** 🚧 Development Phase 1 (Core Infrastructure)

---

## ✨ Key Features

### 📺 Episode Management
- Upload anime episodes with Japanese subtitles
- Automatic subtitle parsing (SRT/VTT files)
- Audio transcription using Whisper AI
- Processing status tracking

### 🧠 Intelligent Vocabulary Extraction
- **Subtitle Parsing** - Extract all Japanese text with timestamps
- **Audio Transcription** - Convert spoken dialogue to text
- **NLP Processing** - Tokenize, identify parts of speech
- **Kanji Conversion** - Auto-convert to hiragana with stroke info
- **Dictionary Integration** - Fetch meanings from Jisho API

### 📚 Interactive Learning
- **Flashcard Reviews** - Spaced repetition system (SRS)
- **Episode Quizzes** - Auto-generated from extracted vocabulary
- **Multiple Question Types:**
  - Multiple choice (select correct definition)
  - Fill-in-the-blank (complete sentences)
- **In-Video Word Lookup** - Tap words while watching for instant definitions

### 📊 Progress & Analytics
- Personal dashboard with learning statistics
- Weekly comprehensive tests
- Retention tracking per word (new → learning → review → mastered)
- Performance charts (daily activity, quiz scores, word count)
- Vocabulary mastery levels (N5 → N1 JLPT)

### 🏆 Gamification & Motivation
- **6 Competitive Leaderboards:**
  - Global rankings
  - Weekly rankings (resets every Monday)
  - Friend rankings
  - JLPT level-based rankings
  - Category-specific leaderboards
- **Points System** - Earn points for activities (quiz, streak, mastery)
- **Badges & Achievements** - Unlock rewards for milestones
- **Daily Challenges** - Time-limited learning goals for bonus points
- **Streaks** - Build daily learning streaks
- **Push Notifications** - Stay motivated with competitive alerts

### 👥 Social Features
- Add friends & compare progress
- Friend leaderboards
- Share achievements
- Collaborative learning

---

## 🏗️ Architecture

### Tech Stack

#### Frontend (Mobile App)
| Component | Technology |
|-----------|-----------|
| Framework | React Native with Expo |
| Language | TypeScript |
| Navigation | Expo Router |
| State Management | Context API / Zustand |
| Video Player | expo-video / react-native-video |
| UI Components | Custom components with Aesthetic theme |

#### Backend (API Server)
| Component | Technology |
|-----------|-----------|
| Runtime | Node.js 18+ |
| Framework | Express.js |
| Language | TypeScript |
| Database | PostgreSQL |
| Cache | Redis |
| File Storage | AWS S3 / Firebase Storage |
| Job Queue | Bull / RabbitMQ |

#### NLP Processing (Python Microservice)
| Component | Technology |
|-----------|-----------|
| Language | Python 3.10+ |
| Framework | FastAPI |
| Tokenizer | janome (Japanese) |
| Speech-to-Text | OpenAI Whisper |
| Kanji Processing | pykakasi |
| Dictionary | Jisho API |
| ORM | SQLAlchemy |

#### External Services
- **Speech-to-Text:** OpenAI Whisper (free, open-source)
- **Dictionary API:** Jisho.org (free, no authentication)
- **Kanji Data:** KanjiAPI / Jisho
- **Storage:** AWS S3 or Firebase Cloud Storage
- **Database Hosting:** AWS RDS PostgreSQL / Render / Supabase

---

## 📱 User Interface Structure

### Navigation (6 Main Tabs)

```
┌─────────────────────────────┐
│  KOJI - Learn Japanese      │
├─────────────────────────────┤
│                             │
│     Active Tab Content      │
│                             │
├─────────────────────────────┤
│ 🏠 📚 🎯 📊 🏆 👤          │
│HOME LIBRARY STUDY PROGRESS LEADERBOARD PROFILE│
└─────────────────────────────┘
```

### Tab Details

#### 🏠 HOME - Dashboard
- Quick stats (words learned, daily streak)
- Recent episode progress
- Continue watching resume button
- Leaderboard sneak peek (top 3 friends)
- Recommended episodes

#### 📚 LIBRARY - Episode Management
- Upload new episode
- My episodes list
- Processing status
- Episode details (duration, word count, last watched)
- Delete/organize episodes

#### 🎯 STUDY - Active Learning
- Vocabulary review (flashcards)
- Episode quizzes
- Quiz results & feedback
- In-episode word lookup modal
- Daily learning streak tracking

#### 📊 PROGRESS - Analytics & Testing
- Personal statistics dashboard
- Weekly comprehensive test
- Vocabulary mastery list (new/learning/review/mastered)
- Performance charts (daily activity, quiz scores, retention)
- JLPT level assessment

#### 🏆 LEADERBOARD - Competition & Motivation
- Global rankings (all users)
- Weekly rankings (resets every Monday)
- Friend rankings
- JLPT level-specific rankings
- Your badges & achievements
- Daily challenge progress

#### 👤 PROFILE - Settings & Account
- User profile information
- JLPT level selection
- App settings (language, notifications, offline mode)
- Account management (change password, logout)
- About & help sections

---

## 💾 Database Schema

### Core Tables

#### users
```sql
id (UUID) | email | password_hash | name | jlpt_level | 
created_at | updated_at
```

#### episodes
```sql
id | user_id | title | subtitle_file_url | audio_file_url | 
duration | processing_status | processing_error | created_at
```

#### vocabulary
```sql
id | episode_id | japanese | hiragana | english | parts_of_speech | 
kanji_breakdown (JSONB) | first_appearance_timestamp | times_in_episode | 
is_phrase | created_at
```

#### user_vocabulary (Spaced Repetition Tracking)
```sql
id | user_id | vocab_id | status (new/learning/review/mastered) | 
times_reviewed | next_review_date | last_reviewed_at | retention_score | created_at
```

#### quizzes
```sql
id | episode_id | user_id | quiz_type (episode/weekly_test) | 
total_questions | user_score | created_at | completed_at
```

#### quiz_questions
```sql
id | quiz_id | vocab_id | question_type (multiple_choice/fill_blank) | 
question_text | correct_answer | options (JSONB) | user_answer | 
is_correct | created_at
```

#### user_stats (Gamification)
```sql
id | user_id | total_points | weekly_points | daily_streak | 
last_activity_date | rank_global | rank_weekly | created_at
```

#### leaderboard (Cached Rankings)
```sql
id | user_id | username | avatar_url | total_points | rank | 
jlpt_level | week_number | updated_at
```

#### user_badges (Achievements)
```sql
id | user_id | badge_name | badge_icon | unlocked_at
```

#### friendships (Social)
```sql
id | user_id_1 | user_id_2 | status (pending/accepted/blocked) | created_at
```

---

## 🔄 NLP Processing Pipeline

### Processing Flow
```
1. FILE UPLOAD
   └─ User uploads anime episode + subtitles
      ↓
2. SUBTITLE EXTRACTION
   └─ Parse SRT/VTT file
   └─ Extract Japanese text + timestamps
      ↓
3. AUDIO TRANSCRIPTION
   └─ Whisper AI transcribes spoken dialogue
   └─ Align transcription with subtitles
      ↓
4. TEXT TOKENIZATION
   └─ Use janome to segment Japanese text
   └─ Identify words, particles, verbs, nouns
      ↓
5. WORD PROCESSING
   └─ Convert kanji to hiragana (pykakasi)
   └─ Filter common particles (は, を, に, が)
   └─ Lemmatization (dictionary form)
      ↓
6. DICTIONARY LOOKUP
   └─ Query Jisho API for meanings
   └─ Get kanji breakdown, readings, part of speech
      ↓
7. STORAGE & INDEXING
   └─ Store vocabulary in PostgreSQL
   └─ Cache common words in Redis
   └─ Index by frequency & JLPT level
      ↓
8. READY FOR LEARNING
   └─ Vocabulary available for review & quizzes
```

---

## 🎮 Gamification System

### Points System
| Activity | Points |
|----------|--------|
| Complete episode quiz | +100 |
| Perfect quiz score (100%) | +50 bonus |
| Daily login | +10 |
| 7-day streak | +70 |
| Weekly test completion | +200 |
| Master a word (SRS) | +5 |
| Complete daily challenge | +50 |

### Badges & Achievements
```
🔥 Streak Master      - 7+ day learning streak
⭐ Quiz Ace           - Perfect score 10 times
📚 Bookworm           - Watch 10 episodes
🎓 JLPT Ready         - Master 1,000 words
👑 Top Learner        - Rank #1 this week
🚀 Speed Runner       - Complete quiz in <1 min
💎 Perfect Week       - 100% daily challenge completion
🌍 Global Dominator   - #1 on global leaderboard
```

### Leaderboard Types
1. **Global Leaderboard** - All-time rankings
2. **Weekly Leaderboard** - Resets every Monday (primary competition)
3. **Friend Leaderboard** - Compare with added friends
4. **JLPT Level Boards** - Separate rankings per proficiency level

### Daily Challenges
- Learn 20 new words (+50 points)
- Complete 3 quizzes (+75 points)
- Achieve 80%+ on weekly test (+100 points)
- Build 5-day streak (+60 points)

---

## 🔌 API Endpoints Overview

### Authentication
```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout
```

### Episodes
```
POST   /api/episodes/upload
GET    /api/episodes/:id
GET    /api/episodes/user/all
DELETE /api/episodes/:id
GET    /api/episodes/:id/status
```

### Vocabulary & Dictionary
```
GET    /api/episodes/:id/vocabulary
GET    /api/vocabulary/:wordId
POST   /api/vocabulary/batch
```

### Study & Quizzes
```
POST   /api/quiz/generate
GET    /api/quiz/:quizId
POST   /api/quiz/:quizId/submit
GET    /api/quiz/history
POST   /api/weekly-test/generate
POST   /api/weekly-test/submit
```

### Progress & Analytics
```
GET    /api/progress/dashboard
GET    /api/progress/weekly-data
GET    /api/progress/vocabulary
GET    /api/user/stats
```

### Leaderboard
```
GET    /api/leaderboard/global
GET    /api/leaderboard/weekly
GET    /api/leaderboard/friends/:userId
GET    /api/user/:userId/badges
```

### Friends & Social
```
POST   /api/friends/add/:userId
GET    /api/friends/list
POST   /api/friends/remove/:userId
```

---

## 📋 Implementation Phases

### Phase 1: Core Infrastructure (Week 1-2)
**Goal:** Establish backend foundation and database

- [ ] Setup Node.js/Express backend with TypeScript
- [ ] Setup PostgreSQL database with complete schema
- [ ] Setup Python FastAPI microservice skeleton
- [ ] Configure Redis cache
- [ ] Setup AWS S3 file storage (or Firebase)
- [ ] Frontend: Tab-based navigation structure
- [ ] Frontend: Basic layout for all 6 tabs
- [ ] Environment configuration & .env setup

**Deliverables:**
- Working backend API server
- Database ready for data
- Frontend navigation structure

---

### Phase 2: Episode Management (Week 2-3)
**Goal:** Enable users to upload episodes with subtitle parsing

- [ ] Backend: Episode upload endpoint
- [ ] Backend: File storage integration (S3/Firebase)
- [ ] Backend: Episode metadata storage
- [ ] Frontend: Episode upload UI with file picker
- [ ] Frontend: Upload progress indicator
- [ ] Python: Subtitle file parser (SRT/VTT support)
- [ ] Python: Subtitle text extraction
- [ ] Backend: Processing status API

**Deliverables:**
- Users can upload episodes
- Subtitles parsed and stored
- Processing status visible in frontend

---

### Phase 3: Audio Processing & NLP (Week 3-4)
**Goal:** Extract vocabulary from subtitles and audio

- [ ] Python: Whisper integration for audio transcription
- [ ] Python: Subtitle-audio alignment logic
- [ ] Python: Japanese tokenization (janome)
- [ ] Python: Kanji conversion (pykakasi)
- [ ] Python: Part-of-speech tagging
- [ ] Python: Jisho API integration for word lookups
- [ ] Backend: Vocabulary storage & retrieval
- [ ] Backend: Batch word processing endpoint
- [ ] Filter common particles & stop words

**Deliverables:**
- All extracted vocabulary stored in database
- Word meanings fetched from Jisho
- Kanji information available

---

### Phase 4: Review & Quiz System (Week 4-5)
**Goal:** Create interactive learning experiences

- [ ] Frontend: Vocabulary flashcard component
- [ ] Frontend: Review session UI
- [ ] Backend: Quiz generation algorithm
- [ ] Backend: Multiple choice question builder
- [ ] Backend: Fill-in-blank question builder
- [ ] Backend: Randomization & distractors logic
- [ ] Frontend: Quiz screen UI
- [ ] Frontend: Answer submission & scoring
- [ ] Backend: Quiz results storage

**Deliverables:**
- Users can review vocabulary
- Quizzes auto-generated from episodes
- Quiz scoring & result tracking

---

### Phase 5: Progress Tracking & Spaced Repetition (Week 5-6)
**Goal:** Implement learning optimization with SRS

- [ ] Backend: Spaced Repetition System (SRS) algorithm
- [ ] Backend: Next review date calculation
- [ ] Backend: Retention score tracking
- [ ] Backend: Word status management (new → learning → review → mastered)
- [ ] Backend: Weekly test generation
- [ ] Frontend: Progress dashboard
- [ ] Frontend: Personal statistics charts
- [ ] Frontend: Vocabulary list with status
- [ ] Frontend: Weekly test UI
- [ ] User vocabulary progress endpoint

**Deliverables:**
- SRS optimizes review scheduling
- User progress tracked and visualized
- Weekly tests generated from mastery levels

---

### Phase 6: Gamification & Leaderboards (Week 6-7)
**Goal:** Add competition, achievements, and motivation

- [ ] Backend: Points system for all activities
- [ ] Backend: User stats tracking (points, rank, streak)
- [ ] Backend: Global leaderboard generation
- [ ] Backend: Weekly leaderboard reset logic
- [ ] Backend: Friend leaderboard endpoint
- [ ] Backend: Badge/achievement system
- [ ] Backend: Daily challenge generation
- [ ] Frontend: Leaderboard UI (global/weekly/friends tabs)
- [ ] Frontend: Badge display system
- [ ] Frontend: Daily challenge progress UI
- [ ] Frontend: Streak counter
- [ ] Push notifications for competitive alerts

**Deliverables:**
- Full leaderboard system
- Badge unlocking & display
- Daily challenges & streaks
- User motivation mechanics

---

### Phase 7: Polish, Testing & Deployment (Week 7-8)
**Goal:** Production-ready application

- [ ] UI/UX refinement with Figma designs
- [ ] Performance optimization
- [ ] Error handling & validation
- [ ] Unit tests (backend endpoints)
- [ ] Integration tests (NLP pipeline)
- [ ] E2E tests (key user flows)
- [ ] Security audit (auth, data validation)
- [ ] Docker containerization
- [ ] CI/CD pipeline setup (GitHub Actions)
- [ ] Deploy backend (AWS/Render/Railway)
- [ ] Deploy Python service (AWS Lambda/Render)
- [ ] Deploy frontend (EAS Build, TestFlight, Google Play)
- [ ] Monitoring & logging setup

**Deliverables:**
- Production deployment
- Automated testing & CI/CD
- Performance optimized
- Ready for beta users

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Python 3.10+
- PostgreSQL 14+
- Redis (for caching)
- AWS/Firebase account (for file storage)

### Frontend Setup
```bash
# Install dependencies
npm install

# Start development server
npm start

# Run on Android (Expo Go)
npx expo start --android
```

### Backend Setup (Planned)
```bash
cd backend
npm install
npm run dev
```

### Python Microservice Setup (Planned)
```bash
cd nlp-service
pip install -r requirements.txt
uvicorn main:app --reload
```

---

## 🛠️ Tech Decisions & Rationale

| Decision | Rationale |
|----------|-----------|
| **React Native + Expo** | Cross-platform (iOS/Android), fast development, hot reload |
| **PostgreSQL** | Relational data, strong consistency, proven reliability |
| **Python + FastAPI** | Excellent NLP ecosystem, async support, easy to scale |
| **Whisper AI** | Free, open-source, high-quality transcription, no API costs |
| **janome** | Best Japanese tokenizer, handles inflections well |
| **Jisho API** | Free dictionary, no authentication, comprehensive data |
| **Redis** | Fast caching, leaderboard sorting, session management |
| **Bull Job Queue** | Background processing for long-running NLP tasks |

---

## 🎨 Color Theme

Aesthetic, minimalist design inspired by anime:
- **Primary (Purple):** #B19CD9
- **Secondary (Mint):** #7FE5DE
- **Accent (Pink):** #FFB6D9
- **Background (Cream):** #FFFACD
- **Success (Green):** #A8E6CF
- **Warning (Peach):** #FFCC99

See `constants/theme.ts` for complete theme configuration.

---

## 📊 Success Metrics

- ✅ Users can upload episodes with <1 min processing
- ✅ App extracts 90%+ vocabulary correctly
- ✅ Quiz generation takes <5 seconds
- ✅ Spaced repetition improves retention by 40%+
- ✅ Weekly tests show consistent learning progress
- ✅ Leaderboard engagement increases DAU by 60%+
- ✅ App supports offline mode (cached content)

---

## 🤝 Contributing

This is a solo project during development. Future collaboration guidelines TBD.

---

## 📄 License

MIT License - See LICENSE file for details

---

## 📧 Contact & Feedback

For questions or suggestions about Koji, feel free to reach out.

---

**Happy Learning! 🎌✨**