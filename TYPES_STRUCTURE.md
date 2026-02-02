# 📐 Koji TypeScript Types Structure

## Overview

Koji uses **two separate type systems** - one for frontend and one for backend. This separation ensures clean architecture and clear responsibilities.

---

## Frontend Types

**Location:** `/koji/types/index.ts`

**Purpose:** UI and local device operations

### Core Types

#### `Subtitle` - Subtitle Parsing
```typescript
interface Subtitle {
  index: number;
  startTime: number;      // milliseconds
  endTime: number;        // milliseconds
  text: string;
  startTimeStr: string;   // "00:00:05.000"
  endTimeStr: string;
}
```

#### `LocalEpisode` - Local Episode Storage
```typescript
interface LocalEpisode {
  id: string;
  title: string;
  videoUri: string;              // /documents/koji/episodes/{id}/video.mp4
  subtitleUri?: string;          // /documents/koji/episodes/{id}/subs.srt
  subtitles?: Subtitle[];        // Parsed subtitles
  duration?: number;
  size: number;                  // File size in bytes
  uploadedAt: number;            // Timestamp
  processingStatus: 'pending' | 'processing' | 'completed' | 'failed';
  processingError?: string;
  currentTime?: number;          // Watch progress
  lastWatchedAt?: number;
}
```

#### `LocalVocabularyWord` - Local Vocabulary
```typescript
interface LocalVocabularyWord {
  id: string;
  episodeId: string;
  japanese: string;              // Kanji/mixed script
  hiragana: string;              // Hiragana reading
  english: string;               // English definition
  partOfSpeech?: string;         // noun, verb, adjective
  frequency: number;             // Times appears in episode
  timestamp?: number;            // First appearance
  jlptLevel?: 'N5' | 'N4' | 'N3' | 'N2' | 'N1';
}
```

#### `LocalUserVocabulary` - Learning Progress
```typescript
interface LocalUserVocabulary {
  id: string;
  vocabularyId: string;
  status: 'new' | 'learning' | 'review' | 'mastered';
  timesReviewed: number;
  nextReviewDate: number;
  lastReviewedAt?: number;
  retentionScore: number;        // 0-1 scale
  addedAt: number;
}
```

#### `LocalQuiz` - Quiz Sessions
```typescript
interface LocalQuiz {
  id: string;
  episodeId: string;
  type: 'episode' | 'weekly_test';
  questions: LocalQuizQuestion[];
  totalScore: number;
  completedAt?: number;
  createdAt: number;
}

interface LocalQuizQuestion {
  id: string;
  vocabularyId: string;
  type: QuestionType;
  questionText: string;
  correctAnswer: string;
  options?: string[];
  userAnswer?: string;
  isCorrect?: boolean;
  timestamp: number;
}
```

---

## Backend Types

**Location:** `/backend/src/types/index.ts`

**Purpose:** Server, database, and API operations

### Core Types

#### `User` - User Account
```typescript
interface User {
  id: string;
  email: string;
  password_hash: string;
  name: string;
  jlpt_level: 'N5' | 'N4' | 'N3' | 'N2' | 'N1' | null;
  avatar_url?: string;
  created_at: Date;
  updated_at: Date;
}
```

#### `Episode` - Server Episode
```typescript
interface Episode {
  id: string;
  user_id: string;                    // Links to User
  title: string;
  subtitle_file_url?: string;         // S3 or Firebase URL
  audio_file_url?: string;            // S3 or Firebase URL
  duration: number;
  processing_status: 'pending' | 'processing' | 'completed' | 'failed';
  processing_error?: string;
  created_at: Date;
  updated_at: Date;
}
```

#### `Vocabulary` - Server Vocabulary
```typescript
interface Vocabulary {
  id: string;
  episode_id: string;
  japanese: string;
  hiragana: string;
  english: string;
  parts_of_speech: string[];
  kanji_breakdown?: Record<string, unknown>;
  first_appearance_timestamp: number;
  times_in_episode: number;
  is_phrase: boolean;
  created_at: Date;
}
```

#### `UserVocabulary` - Server Progress
```typescript
interface UserVocabulary {
  id: string;
  user_id: string;
  vocab_id: string;
  status: 'new' | 'learning' | 'review' | 'mastered';
  times_reviewed: number;
  next_review_date: Date;
  last_reviewed_at?: Date;
  retention_score: number;
  created_at: Date;
}
```

#### `ApiResponse<T>` - API Response Wrapper
```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
```

---

## Key Differences

### Frontend Episode vs Backend Episode

| Aspect | Frontend | Backend |
|--------|----------|---------|
| **Purpose** | Local playback | Server storage |
| **Video Path** | Local file path | S3/Firebase URL |
| **Subtitles** | Parsed objects | URL string |
| **Timestamps** | Number (ms) | Date object |
| **User Ref** | N/A | user_id |
| **Size** | File bytes | Duration (seconds) |

### Frontend Vocabulary vs Backend Vocabulary

| Aspect | Frontend | Backend |
|--------|----------|---------|
| **Frequency** | Times in episode | Per-user tracking |
| **Status** | Learning state | N/A (in UserVocab) |
| **Scope** | Episode-specific | Global/shared |
| **Retention** | Local SRS scores | Database values |

---

## Usage Guidelines

### In Frontend Code

```typescript
import { LocalEpisode, Subtitle } from '@/types/index';

const handleUpload = (episode: LocalEpisode) => {
  // Use LocalEpisode for local operations
};
```

### In Backend Code

```typescript
import { Episode, User } from './types';

const createEpisode = (episode: Episode) => {
  // Use Episode for database operations
};
```

### Avoid Cross-Layer Type Usage

❌ **Don't do this:**
```typescript
// Frontend using backend types
import { Episode as BackendEpisode } from '@/backend/src/types';
```

✅ **Do this instead:**
```typescript
// Use appropriate types for each layer
import { LocalEpisode } from '@/types/index';
```

---

## Conversion Between Types

### Frontend to Backend Upload

```typescript
// When uploading from frontend
const frontendEpisode: LocalEpisode = {
  id: 'local-id',
  title: 'Episode 1',
  videoUri: '/local/path/video.mp4',
  // ...
};

// Convert to backend format for API
const backendEpisode = {
  title: frontendEpisode.title,
  duration: frontendEpisode.duration,
  user_id: currentUser.id,
  processing_status: 'pending',
  // Backend generates S3 URLs after upload
};
```

### Backend to Frontend Display

```typescript
// When receiving from API
const backendEpisode = await api.getEpisode(id);

// Display uses frontend type
const displayEpisode: LocalEpisode = {
  id: backendEpisode.id,
  title: backendEpisode.title,
  videoUri: backendEpisode.subtitle_file_url,
  // Frontend handles local caching
};
```

---

## Adding New Types

### When to Add Frontend Type
- UI component needs type
- Local state structure
- Device file operations
- Parsing results

### When to Add Backend Type
- API endpoint request/response
- Database model
- Server-side calculation
- Authentication

### Best Practices
1. Keep types close to where they're used
2. Name clearly (Local* prefix for frontend)
3. Add JSDoc comments explaining purpose
4. Don't mix concerns between layers
5. Use interfaces for contracts, types for data shapes

---

## TypeScript Configuration

### Frontend (`tsconfig.json`)
```json
{
  "compilerOptions": {
    "paths": {
      "@/types/*": ["types/*"],
      "@/types": ["types/index.ts"]
    }
  }
}
```

### Backend (`backend-tsconfig.json`)
```json
{
  "compilerOptions": {
    "paths": {
      "@/types": ["src/types/index.ts"]
    }
  }
}
```

---

## Testing with Types

### Frontend Type Testing
```typescript
// useEpisodeUpload.ts
export type { LocalEpisode as EpisodeData };

const { episodes }: { episodes: LocalEpisode[] } = useEpisodeUpload();
```

### Backend Type Testing
```typescript
// episodes.ts route
const response: ApiResponse<Episode> = {
  success: true,
  data: episode
};
```

---

## Migration Path (Future)

As the project grows, consider:

1. **Shared Types Library**
   - Common enums (`Status`, `JlptLevel`)
   - Shared interfaces for API contracts

2. **OpenAPI/GraphQL Schema**
   - Generate types from API schema
   - Keep frontend and backend in sync

3. **Type Guards**
   - Runtime validation of types
   - Safe casting between layers

---

## Summary

✅ **Two type systems** - clear separation of concerns  
✅ **Frontend types** - UI and local device operations  
✅ **Backend types** - Server, database, API operations  
✅ **No duplication** - each type has a clear purpose  
✅ **Type safety** - full TypeScript coverage on both sides  

**Result:** Maintainable, scalable, and type-safe codebase! 🎌

