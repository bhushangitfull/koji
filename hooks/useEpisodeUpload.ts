import { useCallback, useState, useEffect } from 'react';
import * as FileSystem from 'expo-file-system/legacy';
import { parseSubtitles, Subtitle } from '@/utils/subtitleParser';
import {
  readSubtitleFile,
  saveFileToEpisode,
  createEpisodeDirectory,
  formatFileSize,
} from '@/utils/fileSystem';
import { LocalEpisode } from '@/types/index';

export type { LocalEpisode as EpisodeData };

const EPISODES_METADATA_FILE = `${FileSystem.documentDirectory}koji/episodes.json`;

export const useEpisodeUpload = () => {
  const [episodes, setEpisodes] = useState<EpisodeData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load episodes from storage on mount
  useEffect(() => {
    loadEpisodes();
  }, []);

  const loadEpisodes = useCallback(async () => {
    try {
      const info = await FileSystem.getInfoAsync(EPISODES_METADATA_FILE);
      if (info.exists) {
        const content = await FileSystem.readAsStringAsync(EPISODES_METADATA_FILE, {
          encoding: FileSystem.EncodingType.UTF8,
        });
        const loadedEpisodes = JSON.parse(content) as EpisodeData[];
        console.log('Loaded episodes from storage:', loadedEpisodes.length);
        setEpisodes(loadedEpisodes);
      }
    } catch (err) {
      console.error('Error loading episodes:', err);
    }
  }, []);

  const saveEpisodes = useCallback(async (episodesToSave: EpisodeData[]) => {
    try {
      await FileSystem.writeAsStringAsync(
        EPISODES_METADATA_FILE,
        JSON.stringify(episodesToSave, null, 2),
        { encoding: FileSystem.EncodingType.UTF8 }
      );
      console.log('Saved episodes to storage:', episodesToSave.length);
    } catch (err) {
      console.error('Error saving episodes:', err);
    }
  }, []);

  const uploadEpisode = useCallback(
    async (
      videoUri: string,
      subtitleUri: string | null,
      title: string,
      onProgress?: (progress: number) => void
    ): Promise<LocalEpisode> => {
      try {
        setIsLoading(true);
        setError(null);

        const episodeId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        onProgress?.(10);

        // Create episode directory
        await createEpisodeDirectory(episodeId);
        onProgress?.(20);

        // Get video file info
        const videoInfo = await FileSystem.getInfoAsync(videoUri);
        const videoSize = videoInfo.size || 0;

        // Extract video filename and save
        const videoFileName = videoUri.split('/').pop() || `video.mp4`;
        const savedVideoUri = await saveFileToEpisode(episodeId, videoUri, videoFileName);
        onProgress?.(50);

        // Handle subtitles if provided
        let savedSubtitleUri: string | undefined;
        let parsedSubtitles: Subtitle[] = [];

        if (subtitleUri) {
          try {
            const subtitleFileName = subtitleUri.split('/').pop() || `subtitles.srt`;
            savedSubtitleUri = await saveFileToEpisode(
              episodeId,
              subtitleUri,
              subtitleFileName
            );
            onProgress?.(70);

            // Parse subtitles
            const subtitleContent = await readSubtitleFile(savedSubtitleUri);
            const parsed = parseSubtitles(subtitleContent);
            parsedSubtitles = parsed.subtitles;
            onProgress?.(85);
          } catch (subtitleError) {
            console.warn('Failed to parse subtitles:', subtitleError);
            // Continue without subtitles
          }
        }

        onProgress?.(95);

        const episodeData: LocalEpisode = {
          id: episodeId,
          title,
          videoUri: savedVideoUri,
          subtitleUri: savedSubtitleUri,
          subtitles: parsedSubtitles,
          size: videoSize,
          uploadedAt: Date.now(),
          processingStatus: 'completed',
        };

        setEpisodes((prev) => {
          const updated = [episodeData, ...prev];
          saveEpisodes(updated); // Save to storage
          return updated;
        });
        onProgress?.(100);

        return episodeData;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setError(errorMessage);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [saveEpisodes]
  );

  const deleteEpisode = useCallback(async (episodeId: string) => {
    try {
      const episodePath = `${FileSystem.documentDirectory}koji/episodes/${episodeId}/`;
      await FileSystem.deleteAsync(episodePath, { idempotent: true });

      setEpisodes((prev) => {
        const updated = prev.filter((ep) => ep.id !== episodeId);
        saveEpisodes(updated); // Save to storage
        return updated;
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    }
  }, [saveEpisodes]);

  const getEpisode = useCallback((episodeId: string): EpisodeData | null => {
    return episodes.find((ep) => ep.id === episodeId) || null;
  }, [episodes]);

  const loadLocalEpisodes = useCallback(async () => {
    try {
      const episodesDir = `${FileSystem.documentDirectory}koji/episodes/`;
      const info = await FileSystem.getInfoAsync(episodesDir);

      if (!info.exists) {
        return;
      }

      // Note: expo-file-system doesn't have a readdir function in all versions
      // For now, we'll rely on state management from uploads
      // In production, you might want to scan the directory and rebuild state
    } catch (err) {
      console.warn('Failed to load local episodes:', err);
    }
  }, []);

  const updateSubtitles = useCallback(
    async (episodeId: string, subtitleUri: string): Promise<void> => {
      try {
        setIsLoading(true);
        setError(null);

        const episode = episodes.find((ep) => ep.id === episodeId);
        if (!episode) throw new Error('Episode not found');

        // Save subtitle file to episode directory
        const subtitleFileName = subtitleUri.split('/').pop() || `subtitles.srt`;
        const savedSubtitleUri = await saveFileToEpisode(
          episodeId,
          subtitleUri,
          subtitleFileName
        );

        // Parse subtitles
        const subtitleContent = await readSubtitleFile(savedSubtitleUri);
        const parsed = parseSubtitles(subtitleContent);

        // Update episode with new subtitles
        setEpisodes((prev) => {
          const updated = prev.map((ep) =>
            ep.id === episodeId
              ? {
                  ...ep,
                  subtitleUri: savedSubtitleUri,
                  subtitles: parsed.subtitles,
                }
              : ep
          );
          saveEpisodes(updated);
          return updated;
        });
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setError(errorMessage);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [episodes, saveEpisodes]
  );

  return {
    episodes,
    isLoading,
    error,
    uploadEpisode,
    deleteEpisode,
    getEpisode,
    loadLocalEpisodes,
    updateSubtitles,
  };
};
