# 🚀 Koji Quick Reference Guide

## Key Components

### Video Player (`components/VideoPlayer.tsx`)
```typescript
<VideoPlayer
  videoUri="/path/to/video.mp4"
  subtitles={parsedSubtitles}
  title="Episode Name"
  onTimeUpdate={(time) => console.log(time)}
/>
```

### Upload Hook (`hooks/useEpisodeUpload.ts`)
```typescript
const { episodes, uploadEpisode, deleteEpisode } = useEpisodeUpload();

// Upload
await uploadEpisode(videoUri, subtitleUri, "Title", (progress) => {
  console.log(`${progress}% done`);
});

// Delete
await deleteEpisode(episodeId);
```

### Subtitle Parser (`utils/subtitleParser.ts`)
```typescript
import { parseSubtitles, getSubtitleAtTime } from '@/utils/subtitleParser';

// Parse
const { subtitles, format } = parseSubtitles(srtContent);

// Get at time
const sub = getSubtitleAtTime(subtitles, 15000); // 15 seconds
```

### File System (`utils/fileSystem.ts`)
```typescript
import { 
  initializeAppDirectories,
  saveFileToEpisode,
  readSubtitleFile,
  formatFileSize
} from '@/utils/fileSystem';

// Initialize
await initializeAppDirectories();

// Save file
const uri = await saveFileToEpisode(episodeId, sourceUri, "file.srt");

// Format size
formatFileSize(5242880); // "5 MB"
```

## Library Tab Integration

The Library tab now:
- ✅ Shows list of uploaded episodes
- ✅ Displays file sizes and subtitle count
- ✅ Shows processing status
- ✅ Has delete functionality
- ✅ Shows library statistics

## Data Flow

```
Upload Flow:
  User selects files → File picker → Save to device
  → Parse subtitles → Store metadata → Update UI

Playback Flow:
  User taps episode → VideoPlayer opens
  → Render video + subtitles → Track progress
  → Save watch time locally

Lookup Flow:
  User taps word → Extract word → Show modal
  → Dictionary lookup (ready for API integration)
```

## File Locations

```
Device Storage:
  /documents/koji/
    ├── episodes/
    │   ├── {episodeId}/
    │   │   ├── video.mp4
    │   │   └── subtitles.srt
    │   └── {episodeId2}/
    │       ├── video.mkv
    │       └── subtitles.vtt
    └── temp/
```

## TypeScript Interfaces

All types in `types/index.ts`:

```typescript
Episode              // Video episode
Subtitle            // Single subtitle
VocabularyWord      // Vocabulary entry
UserVocabulary      // Learning progress
Quiz                // Quiz session
UserStats           // Gamification stats
```

## Environment Setup

No .env needed for local storage. Everything works offline!

## Common Tasks

### Add Episode to Library
```typescript
const { uploadEpisode } = useEpisodeUpload();
const episode = await uploadEpisode(videoUri, subtitleUri, "Title");
```

### Display Episode in Player
```typescript
<VideoPlayer 
  videoUri={episode.videoUri}
  subtitles={episode.subtitles}
  title={episode.title}
/>
```

### Get Subtitle at Current Time
```typescript
const subtitle = getSubtitleAtTime(episode.subtitles, currentTimeMs);
if (subtitle) {
  console.log(subtitle.text);
}
```

### Delete Episode Files
```typescript
await deleteEpisode(episodeId); // Auto-cleanup files
```

## Performance Notes

- Video player uses native `expo-video` for optimal performance
- Subtitles parsed once at upload time
- File operations are async - use proper await/catch
- Large videos (>500MB) may take time to save
- Subtitle parsing handles ~1000 lines per 1ms

## Next Features to Implement

1. **Vocabulary Extraction**
   - Parse subtitles for words
   - Store in SQLite
   - Connect dictionary

2. **Quiz System**
   - Multiple choice from vocabulary
   - Fill-in-the-blank questions
   - Score tracking

3. **Spaced Repetition**
   - SRS algorithm
   - Optimal review dates
   - Retention scoring

4. **Gamification**
   - Points for activities
   - Leaderboards
   - Achievements

## Troubleshooting

| Issue | Solution |
|-------|----------|
| File too large | Compress video or use external storage |
| Subtitles not showing | Check SRT/VTT format and encoding |
| Slow upload | Check device storage space |
| Player crashes | Verify video codec compatibility |

## Resources

- 📖 [FEATURES.md](./FEATURES.md) - Full feature documentation
- 📚 [README.md](./README.md) - Project overview
- 🔧 [BACKEND_SETUP.md](./BACKEND_SETUP.md) - Backend configuration

