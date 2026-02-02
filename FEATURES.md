# 🎌 Koji - Episode Upload & Video Player System

## 🎬 Feature Overview

This system enables users to upload anime episodes locally and watch them with subtitle support, complete with vocabulary lookup functionality.

## ✨ Features Implemented

### 📱 Episode Upload
- **Local Storage** - Save videos directly on device (no cloud costs)
- **File Picker** - Select video files (MP4, MKV, AVI, etc.) and subtitle files (SRT, VTT)
- **Auto-Parsing** - Subtitle files automatically parsed on upload
- **Progress Tracking** - Visual feedback during upload
- **Library Stats** - Shows total episodes, storage used, and processed count

### 🎥 Video Player
- **Playback Controls** - Play, pause, and seek through episodes
- **Subtitle Overlay** - Renders subtitles directly on video
- **Progress Bar** - Visual indicator of playback position
- **Time Display** - Current and total time
- **Auto-Hide Controls** - Controls hide after 3 seconds when playing

### 📖 Vocabulary Lookup
- **Tap-to-Definition** - Tap Japanese words to see definitions
- **Modal Display** - Clean modal shows word, hiragana, and English
- **Integration Ready** - Structure in place to connect to dictionary

### 💾 Local-First Architecture
- **Zero Cloud Costs** - All storage is on-device
- **Offline Ready** - Works completely without internet
- **Privacy Focused** - Your data never leaves your device
- **File System Storage** - Uses `expo-file-system` for reliability

## 📁 File Structure

```
koji/
├── utils/
│   ├── subtitleParser.ts      # SRT/VTT parser, subtitle utilities
│   └── fileSystem.ts          # Local file operations, directory management
├── hooks/
│   └── useEpisodeUpload.ts    # Episode management hook
├── components/
│   ├── VideoPlayer.tsx        # Full video player component
│   ├── FeatureShowcase.tsx    # Feature demo screen
│   └── EpisodeUploadScreen.tsx # Upload UI component (ready but unused)
├── types/
│   └── index.ts               # Global TypeScript types
└── app/(tabs)/
    └── library.tsx            # Updated Library tab with upload
```

## 🚀 How to Use

### Upload an Episode

1. **Navigate to Library Tab**
   - Tap the 📚 "Library" tab at bottom

2. **Tap "Select Files"**
   - Choose a video file from your device
   - System validates file size (max 2GB)

3. **Choose Subtitles (Optional)**
   - Select a .srt or .vtt subtitle file
   - If no subtitles, video plays without them

4. **Confirm Upload**
   - Episode saves locally on device
   - Upload progress displayed
   - Episode appears in library immediately

### Watch an Episode

1. **Select Episode from Library**
   - Tap the episode you want to watch

2. **Video Player Opens**
   - Subtitles automatically render if available
   - Controls visible at bottom

3. **Control Playback**
   - Tap ▶️ to play
   - Tap ⏸️ to pause
   - Drag progress bar to seek

4. **Learn Vocabulary**
   - Tap any Japanese word in subtitle
   - Definition appears in modal
   - Tap close to continue watching

## 🛠️ Technical Stack

### Core Libraries
```
expo-video              - Native video playback
expo-document-picker    - File selection dialog
expo-file-system        - Local file operations
expo-media-library      - Device media access
react-native-uuid       - Unique ID generation
```

### Storage
```
Local Directory: /documents/koji/episodes/{episodeId}/
├── video.mp4
└── subtitles.srt
```

### Types & Interfaces
```typescript
interface Episode {
  id: string;
  title: string;
  videoUri: string;
  subtitleUri?: string;
  subtitles?: Subtitle[];
  size: number;
  uploadedAt: number;
  processingStatus: 'pending' | 'processing' | 'completed' | 'failed';
}

interface Subtitle {
  index: number;
  startTime: number;
  endTime: number;
  text: string;
}
```

## 📊 Data Storage

### Subtitle Parser Capabilities
- ✅ SRT format (most common)
- ✅ VTT format (web standard)
- ✅ Timestamp parsing (00:00:05.000 format)
- ✅ Multi-line subtitle text
- ✅ Japanese text extraction

### File System Storage
```
Device Storage Example:
- Episode Video: 300MB
- Subtitle File: 50KB
- Metadata: <1KB
- Total: ~300MB per episode

64GB Device can hold: ~200 episodes
```

## 🔌 API Integration Points

The backend is already prepared with these endpoints:

```typescript
// Episodes
POST   /api/episodes/upload              // Create episode
GET    /api/episodes/:id                 // Get episode details
GET    /api/episodes/user/all            // List user episodes
GET    /api/episodes/:id/status          // Check processing status
DELETE /api/episodes/:id                 // Delete episode

// Vocabulary (ready for next phase)
GET    /api/episodes/:id/vocabulary      // Get extracted words
POST   /api/vocabulary/batch             // Batch add vocabulary
```

## 🎯 Next Steps / Roadmap

### Phase 2: Vocabulary Extraction
- [ ] Extract Japanese words from subtitles
- [ ] Store in local SQLite database
- [ ] Connect dictionary API for definitions
- [ ] Calculate word frequency
- [ ] Assign JLPT levels

### Phase 3: Quiz System
- [ ] Generate multiple choice questions
- [ ] Generate fill-in-the-blank questions
- [ ] Track quiz scores
- [ ] Calculate accuracy metrics

### Phase 4: Spaced Repetition
- [ ] Implement SRS algorithm
- [ ] Calculate optimal review dates
- [ ] Track retention scores
- [ ] Monitor learning progress

### Phase 5: Gamification
- [ ] Points system
- [ ] Leaderboards
- [ ] Achievement badges
- [ ] Daily challenges
- [ ] Streaks

## 🐛 Known Limitations & Future Improvements

### Current Limitations
1. Word lookup modal is template - needs dictionary integration
2. Video player supports basic playback (no advanced features like speed control)
3. Subtitle timestamps must be accurate for proper sync

### Planned Improvements
1. Advanced subtitle rendering (colors, styling)
2. Playback speed control (0.5x, 1x, 1.5x, 2x)
3. Bookmarks for important scenes
4. Playlist support
5. Video quality selection

## 🔒 Privacy & Security

✅ **All data stays on your device**
- No cloud uploads
- No tracking
- No analytics
- Complete offline capability

## 📝 Code Examples

### Upload an Episode
```typescript
const { uploadEpisode } = useEpisodeUpload();

const handleUpload = async () => {
  const episode = await uploadEpisode(
    videoUri,           // Device file path
    subtitleUri,        // Device file path (optional)
    "Episode Title"
  );
  
  console.log('Uploaded:', episode.id);
};
```

### Parse Subtitles
```typescript
import { parseSubtitles, getSubtitleAtTime } from '@/utils/subtitleParser';

const content = await readSubtitleFile(subtitleUri);
const { subtitles, format } = parseSubtitles(content);

// Get subtitle at specific time
const subtitle = getSubtitleAtTime(subtitles, 15000); // 15 seconds
console.log(subtitle.text);
```

### Use Video Player
```typescript
import { VideoPlayer } from '@/components/VideoPlayer';

<VideoPlayer
  videoUri={episode.videoUri}
  subtitles={episode.subtitles}
  title={episode.title}
  onTimeUpdate={(currentTime) => console.log(currentTime)}
/>
```

## 📞 Support

For issues or questions, check:
- `README.md` - Main project overview
- `BACKEND_SETUP.md` - Backend configuration
- Component JSDoc comments - Detailed function documentation

## 📄 License

MIT License - See LICENSE file

---

**Happy Learning! 🎌✨**

Built with ❤️ for anime learners everywhere.
