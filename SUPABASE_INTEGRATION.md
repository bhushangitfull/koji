# 🎯 KOJI - Complete Supabase Integration Guide

## Overview
This document explains the complete connection between Supabase and the Koji app for tracking points, streaks, ranks, and user progress.

---

## 📊 Database Schema

### Core Tables

#### 1. **user_stats** - Main user statistics
```sql
- id: UUID (Primary Key)
- user_id: UUID (FK to users)
- total_points: INTEGER (cumulative points)
- weekly_points: INTEGER (resets weekly)
- daily_streak: INTEGER (consecutive days with activity)
- longest_streak: INTEGER (best streak achieved)
- last_activity_date: TIMESTAMP (last quiz/episode activity)
- rank_global: INTEGER (current rank globally)
- rank_weekly: INTEGER (rank within this week)
- current_tier: VARCHAR (Beginner, Learner, Intermediate, Advanced, Master, Legend)
- tier_points_progress: NUMERIC (0-100%, progress to next tier)
- created_at, updated_at: TIMESTAMP
```

#### 2. **user_tier_ranks** - Tier progression system
```sql
- id: UUID
- rank_name: VARCHAR (UNIQUE) - Beginner, Learner, Intermediate, Advanced, Master, Legend
- min_points: INTEGER (minimum points to achieve this tier)
- max_points: INTEGER (maximum points for this tier)
- badge_icon: VARCHAR (emoji)
- badge_color: VARCHAR (hex color)
- description: TEXT
```

**Default Tiers:**
- 🌱 Beginner: 0-99 points
- 📚 Learner: 100-299 points
- ⚡ Intermediate: 300-699 points
- 🎯 Advanced: 700-1,499 points
- 👑 Master: 1,500-2,999 points
- ✨ Legend: 3,000+ points

#### 3. **user_daily_activity** - Track daily activities for streaks
```sql
- id: UUID
- user_id: UUID (FK)
- activity_date: DATE (unique per user)
- activity_type: VARCHAR (quiz, episode, flashcard, combined)
- episode_completed: BOOLEAN
- quiz_completed: BOOLEAN
- flashcard_reviewed: BOOLEAN
- points_earned: INTEGER
```

#### 4. **user_episode_progress** - Episode watching tracking
```sql
- id: UUID
- user_id: UUID
- episode_id: UUID
- watch_start_time: INTEGER (seconds)
- watch_end_time: INTEGER (seconds)
- total_duration: INTEGER (episode length in seconds)
- is_fully_watched: BOOLEAN (true when ≥90% watched)
- watched_at: TIMESTAMP
- completed_at: TIMESTAMP (when fully watched)
```

#### 5. **user_achievements** - Badges and milestones
```sql
- id: UUID
- user_id: UUID
- achievement_type: VARCHAR
- achievement_name: VARCHAR
- achievement_icon: VARCHAR
- points_reward: INTEGER
- unlocked_at: TIMESTAMP
```

---

## 🎮 Points & Streaks System

### How Points Are Earned

#### Quiz Completion
```
- Correct Answer: +10 points per question
- Wrong Answer: 0 points
- Streak Bonus:
  - 3-6 days: +5 points
  - 7-13 days: +10 points
  - 14-29 days: +25 points
  - 30+ days: +50 points
```

**Example:**
- Quiz with 8 correct answers = 80 points
- On day 15 of streak = +25 bonus = 105 total points

#### Episode Completion
```
- Full Watch (≥90% of duration): +20 points
- Counts toward daily streak
```

#### Flashcard Review
```
- Correct Review: +5 points
- Increments daily activity count
```

### Streak System

**Streak Logic:**
```
- Day 1: User takes quiz → streak = 1
- Day 2: User watches episode → streak = 2 (continued)
- Day 3: User skips → streak = 0 (reset)
- Day 4: User takes quiz → streak = 1 (restart)
```

**Conditions to Keep Streak:**
- Complete ANY activity (quiz, episode, flashcard) in a calendar day
- Activity must be recorded before midnight
- Two activities on same day = 1 day increase (combined type)

---

## 🏆 Rank System

### Global Rank
- Calculated based on **total_points**
- Rank = (number of users with MORE points than you) + 1
- Example: If 50 users have more points → Your rank = 51st

### Weekly Rank
- Reset every Monday (week_number resets)
- Based on **weekly_points** accumulated in current week
- Allows everyone to compete fairly

### Algorithm
```typescript
export async function recalculateGlobalRank(userId: string, totalPoints: number): Promise<number> {
  const { count } = await supabase
    .from('user_stats')
    .select('id', { count: 'exact' })
    .gt('total_points', totalPoints);
  
  return (count || 0) + 1; // Your rank = number above you + 1
}
```

---

## 💻 Frontend Integration

### Utility Functions

#### 1. Record Quiz Completion
```typescript
import { updateUserStats } from '@/utils/statsUtils';

// After quiz submission
await updateUserStats(userId, {
  points: correctCount * 10,  // 10 points per correct answer
});
```

#### 2. Track Daily Activity & Streak
```typescript
import { recordUserActivity, updateUserStreak } from '@/utils/streakUtils';

// After quiz, episode, or flashcard review
await recordUserActivity(userId, 'quiz', pointsEarned);
// This automatically:
// - Records the activity
// - Updates streak
// - Calculates streak bonus
// - Updates tier
```

#### 3. Record Episode Watching
```typescript
import { recordEpisodeWatched } from '@/utils/streakUtils';

// When user finishes watching episode
const isFullyWatched = await recordEpisodeWatched(
  userId,
  episodeId,
  totalDuration,   // in seconds
  watchedDuration  // in seconds
);

if (isFullyWatched) {
  // User gets +20 points automatically
  // Streak is incremented
}
```

#### 4. Get User's Tier Information
```typescript
import { fetchUserTierInfo } from '@/utils/streakUtils';

const tierInfo = await fetchUserTierInfo(userId);
// Returns: { tier: 'Master', icon: '👑', points: 2500, progress: 75 }
```

---

## 📱 UI Components Updated

### Profile Screen (`app/(tabs)/profile.tsx`)
✅ Displays **KPoints** in player card
✅ Shows current tier with icon
✅ Displays points progress to next tier
✅ Shows daily streak count
✅ Shows longest streak

### Study Screen (`app/(tabs)/study.tsx`)
✅ Duolingo-style quiz (immediate feedback)
✅ Only correct answers award points
✅ Progress bar shows quiz completion
✅ Next button disabled until question answered

---

## 🔄 Data Flow Example: User Completes Quiz

```
1. User starts quiz
   ↓
2. User answers 8 out of 10 questions correctly
   ↓
3. User submits quiz
   ↓
4. handleSubmitQuiz() is called
   ├─ Calculate: 8 correct × 10 points = 80 points
   ├─ Check current streak: 5 days
   ├─ Calculate streak bonus: +10 points
   ├─ Total: 90 points
   ↓
5. updateUserStats(userId, { points: 80 }) is called
   ├─ Fetch current stats from user_stats
   ├─ Add 80 + streak bonus (10) = 90 total
   ├─ Update: total_points += 90
   ├─ Update: weekly_points += 90
   ├─ Calculate new ranks
   ├─ Update tier if needed
   ↓
6. recordUserActivity(userId, 'quiz', 90) is called
   ├─ Record today's activity
   ├─ Mark quiz_completed = true
   ├─ Call updateUserStreak()
   ├─ Check if streak continues/increments
   ↓
7. updateUserTierIfNeeded(userId, newTotalPoints)
   ├─ Calculate tier based on new total
   ├─ If points >= next tier threshold:
   │  └─ Unlock achievement (unlock_notification)
   ↓
8. Response sent to user
   └─ "Earned 90 points! (+10 streak bonus)"
```

---

## 🗄️ Setup Instructions

### 1. Run the SQL Migration
```bash
# In Supabase dashboard:
# 1. Go to SQL Editor
# 2. Create new query
# 3. Copy content from: supabase_setup.sql
# 4. Execute
```

### 2. Verify Tables Created
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';

-- Should include:
-- user_stats
-- user_tier_ranks
-- user_daily_activity
-- user_episode_progress
-- user_achievements
-- leaderboard
```

### 3. Check Tier Ranks Inserted
```sql
SELECT * FROM user_tier_ranks ORDER BY min_points ASC;

-- Should show 6 tiers from Beginner to Legend
```

---

## 🔐 Security Notes

### Current Setup (Development)
- RLS (Row Level Security) is commented out
- Everyone can read leaderboards
- Users can only modify their own stats (managed client-side)

### Production Setup
Uncomment RLS policies in `supabase_setup.sql`:
```sql
ALTER TABLE public.user_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own stats" ON public.user_stats
  FOR SELECT USING (auth.uid() = user_id);
```

---

## 📊 Monitoring & Analytics

### Check User Stats
```sql
SELECT 
  u.email,
  us.total_points,
  us.daily_streak,
  us.current_tier,
  us.rank_global
FROM user_stats us
JOIN users u ON us.user_id = u.id
ORDER BY us.total_points DESC
LIMIT 10;
```

### View Leaderboard
```sql
SELECT rank, username, total_points, jlpt_level
FROM leaderboard
WHERE week_number = DATE_PART('week', NOW())
ORDER BY rank ASC
LIMIT 20;
```

### Check Activity Streak
```sql
SELECT 
  user_id,
  activity_date,
  activity_type,
  points_earned
FROM user_daily_activity
WHERE user_id = 'USER_ID'
ORDER BY activity_date DESC
LIMIT 30;
```

---

## 🐛 Troubleshooting

### Streak Not Updating
- Check `user_daily_activity` table has today's record
- Verify `recordUserActivity()` is being called after quiz

### Points Not Awarding
- Ensure `updateUserStats()` is called with correct points
- Check `user_stats` table exists and user_id is correct
- Verify Supabase auth is working

### Tier Not Changing
- Run: `SELECT * FROM user_tier_ranks` to verify tiers exist
- Check `current_tier` column updates in user_stats
- Verify `updateUserTierIfNeeded()` is called

### Ranks Not Calculating
- Ensure at least 2 users have stats
- Verify `recalculateGlobalRank()` function logic
- Check for SQL errors in Supabase logs

---

## 📝 Files Modified

```
✅ supabase_setup.sql          - Database schema & migrations
✅ utils/streakUtils.ts        - Streak, tier, activity tracking
✅ utils/statsUtils.ts         - Points, ranks, stats updates
✅ app/(tabs)/study.tsx        - Quiz submission with points
✅ app/(tabs)/profile.tsx      - Display KPoints and tier
✅ hooks/useSupabaseData.ts    - Exposed refetch function
```

---

## 🚀 Next Steps

1. ✅ Run SQL migrations in Supabase
2. ✅ Test quiz completion with points
3. ✅ Verify streak increments daily
4. ✅ Check tier progression at each milestone
5. ✅ Set up leaderboard display page
6. ✅ Create achievement notifications
7. ✅ Add weekly reset logic (Monday cleanup)

