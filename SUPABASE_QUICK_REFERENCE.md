
# 🎮 KOJI Supabase - Quick Reference

## 1️⃣ After Quiz Completion (Already Implemented)

```typescript
// In app/(tabs)/study.tsx - handleSubmitQuiz()

// ✅ Points are calculated and stored automatically
await updateUserStats(user.id, {
  points: totalPoints,  // 80 points from 8 correct answers
});

// This automatically:
// ✅ Adds points to user_stats
// ✅ Records daily activity
// ✅ Calculates streak
// ✅ Updates tier
// ✅ Recalculates global rank
```

## 2️⃣ Track Episode Completion (To Implement in Library)

```typescript
import { recordEpisodeWatched } from '@/utils/streakUtils';

// When user finishes watching episode (90%+ watched)
const isFullyWatched = await recordEpisodeWatched(
  userId,
  episodeId,
  3600,  // total episode duration in seconds
  3500   // how long user watched in seconds
);

if (isFullyWatched) {
  // User gets +20 points + streak increment automatically
}
```

## 3️⃣ Display User's Points & Tier

```typescript
import { useUserStats } from '@/hooks/useSupabaseData';
import { fetchUserTierInfo } from '@/utils/streakUtils';

// In profile screen:
const { stats } = useUserStats(userId);
const tierInfo = await fetchUserTierInfo(userId);

// Display:
{stats?.totalPoints}  // Total KPoints
{tierInfo.tier}       // Current tier (Beginner, Learner, etc.)
{tierInfo.icon}       // Tier icon (🌱, 📚, ⚡, etc.)
{tierInfo.progress}   // Progress to next tier (0-100)
```

## 4️⃣ Manual Activity Recording (Advanced)

```typescript
import { recordUserActivity } from '@/utils/streakUtils';

// Record any activity and increment streak
await recordUserActivity(userId, 'quiz', 90);  // type, points

// Automatically handles:
// ✅ Daily activity log
// ✅ Streak calculation
// ✅ Combined activity type
```

## 📊 Database Tables

| Table | Purpose |
|-------|---------|
| `user_stats` | Main stats: points, streak, rank, tier |
| `user_tier_ranks` | Tier definitions (Beginner→Legend) |
| `user_daily_activity` | Daily activity log for streaks |
| `user_episode_progress` | Episode watching progress |
| `user_achievements` | Unlocked badges |
| `leaderboard` | Rankings (global + weekly) |

## 🎯 Points System

```
Quiz Correct Answer        → +10 points
Episode (≥90% watched)     → +20 points
Flashcard Review           → +5 points
Streak Bonus:
  - 3-6 days               → +5 points
  - 7-13 days              → +10 points
  - 14-29 days             → +25 points
  - 30+ days               → +50 points
```

## 🏆 Tier Progression

```
0-99 pts     → 🌱 Beginner
100-299 pts  → 📚 Learner
300-699 pts  → ⚡ Intermediate
700-1,499 pts → 🎯 Advanced
1,500-2,999 pts → 👑 Master
3,000+ pts   → ✨ Legend
```

## 🔄 Streak Rules

✅ **Keep Streak:** Any activity (quiz/episode/flashcard) in a calendar day  
❌ **Reset Streak:** No activity for 24 hours  
✅ **Multiple Activities:** Same day = 1 day (combined type)  
✅ **Bonus Points:** Awarded based on streak length  

## 🗄️ Setup (One-Time)

```sql
1. Go to Supabase Dashboard → SQL Editor
2. Create new query
3. Copy content from: supabase_setup.sql
4. Execute
5. Verify with: SELECT * FROM user_tier_ranks;
```

## 🚀 Current Status

✅ **Implemented:**
- Quiz completion with points
- Automatic streak tracking
- Tier progression system
- Global & weekly ranks
- KPoints display in profile
- Duolingo-style quiz UI

⏳ **Ready to Implement:**
- Episode watching tracking (in library)
- Achievement unlocks
- Leaderboard display
- Weekly reset job

## 📝 Key Files

```
supabase_setup.sql           → Database schema
utils/streakUtils.ts         → Streak & tier utilities
utils/statsUtils.ts          → Points & rank calculations
app/(tabs)/study.tsx         → Quiz with points
app/(tabs)/profile.tsx       → Display KPoints
SUPABASE_INTEGRATION.md      → Full documentation
```

## 🐛 Testing Checklist

```
[ ] Run supabase_setup.sql successfully
[ ] Complete a quiz → verify points in profile
[ ] Check user_stats table has correct points
[ ] Complete 2nd quiz next day → verify streak incremented
[ ] Wait 24+ hours without activity → verify streak resets
[ ] Earn 100 points → verify tier upgraded to "Learner"
[ ] Check leaderboard table updated with ranks
```

## ⚡ Performance Tips

- Points update happens in `handleSubmitQuiz()` - runs locally first
- Supabase operations are async, don't block UI
- Ranks recalculated only when points change (not on every page load)
- Daily activity uses date-based indexing for fast queries

---

**Questions?** Check `SUPABASE_INTEGRATION.md` for detailed explanations!
