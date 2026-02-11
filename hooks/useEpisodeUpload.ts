import { LocalEpisode } from '@/types/index';
import {
  createEpisodeDirectory,
  readSubtitleFile,
  saveFileToEpisode
} from '@/utils/fileSystem';
import { parseSubtitles, Subtitle } from '@/utils/subtitleParser';
import * as FileSystem from 'expo-file-system/legacy';
import { useCallback, useEffect, useState } from 'react';

export type { LocalEpisode as EpisodeData };

const EPISODES_METADATA_FILE = `${FileSystem.documentDirectory}koji/episodes.json`;

export const useEpisodeUpload = () => {
  const [episodes, setEpisodes] = useState<EpisodeData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 1. Centralized loading logic to ensure data is fresh
  const loadEpisodes = useCallback(async () => {
    try {
      const info = await FileSystem.getInfoAsync(EPISODES_METADATA_FILE);
      if (info.exists) {
        const content = await FileSystem.readAsStringAsync(EPISODES_METADATA_FILE, {
          encoding: FileSystem.EncodingType.UTF8,
        });
        const loadedEpisodes = JSON.parse(content) as EpisodeData[];
        setEpisodes(loadedEpisodes);
        return loadedEpisodes;
      }
      return [];
    } catch (err) {
      console.error('Error loading episodes:', err);
      return [];
    }
  }, []);

  useEffect(() => {
    loadEpisodes();
  }, [loadEpisodes]);

  // 2. Pure persistence logic (does not touch state directly)
  const saveToDisk = useCallback(async (episodesToSave: EpisodeData[]) => {
    try {
      await FileSystem.writeAsStringAsync(
        EPISODES_METADATA_FILE,
        JSON.stringify(episodesToSave, null, 2),
        { encoding: FileSystem.EncodingType.UTF8 }
      );
    } catch (err) {
      console.error('Error saving episodes to disk:', err);
      throw err;
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

        await createEpisodeDirectory(episodeId);
        onProgress?.(20);

        const videoInfo = await FileSystem.getInfoAsync(videoUri);
        const videoSize = videoInfo.size || 0;

        const videoFileName = videoUri.split('/').pop() || `video.mp4`;
        const savedVideoUri = await saveFileToEpisode(episodeId, videoUri, videoFileName);
        onProgress?.(50);

        let savedSubtitleUri: string | undefined;
        let parsedSubtitles: Subtitle[] = [];

        if (subtitleUri) {
          try {
            const subtitleFileName = subtitleUri.split('/').pop() || `subtitles.srt`;
            savedSubtitleUri = await saveFileToEpisode(episodeId, subtitleUri, subtitleFileName);
            console.log('[uploadEpisode] Saved subtitle to:', savedSubtitleUri);
            
            const subtitleContent = await readSubtitleFile(savedSubtitleUri);
            console.log('[uploadEpisode] Read subtitle content:', {
              length: subtitleContent.length,
              preview: subtitleContent.substring(0, 200),
            });
            
            const parsed = parseSubtitles(subtitleContent);
            console.log('[uploadEpisode] Parsed subtitles:', {
              format: parsed.format,
              count: parsed.subtitles.length,
              samples: parsed.subtitles.slice(0, 2),
            });
            
            parsedSubtitles = parsed.subtitles;
          } catch (subtitleError) {
            console.warn('Subtitle processing failed:', subtitleError);
          }
        }

        const newEpisode: LocalEpisode = {
          id: episodeId,
          title,
          videoUri: savedVideoUri,
          subtitleUri: savedSubtitleUri,
          subtitles: parsedSubtitles,
          size: videoSize,
          uploadedAt: Date.now(),
          processingStatus: 'completed',
        };

        // Update sequence: Get current disk state, add new, save, then update UI state
        const currentEpisodes = await loadEpisodes();
        const updated = [newEpisode, ...currentEpisodes];
        await saveToDisk(updated);
        setEpisodes(updated);

        onProgress?.(100);
        return newEpisode;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Upload failed';
        setError(errorMessage);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [loadEpisodes, saveToDisk]
  );

  const updateSubtitles = useCallback(
    async (episodeId: string, subtitleUri: string): Promise<void> => {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch the freshest data from disk before modifying
        const currentEpisodes = await loadEpisodes();
        const episodeIndex = currentEpisodes.findIndex((ep) => ep.id === episodeId);
        
        if (episodeIndex === -1) throw new Error('Episode not found');

        const subtitleFileName = subtitleUri.split('/').pop() || `subtitles.srt`;
        const savedSubtitleUri = await saveFileToEpisode(episodeId, subtitleUri, subtitleFileName);
        
        console.log('[updateSubtitles] Saved subtitle to:', savedSubtitleUri);
        
        const subtitleContent = await readSubtitleFile(savedSubtitleUri);
        console.log('[updateSubtitles] Read subtitle content:', {
          length: subtitleContent.length,
          preview: subtitleContent.substring(0, 200),
        });
        
        const parsed = parseSubtitles(subtitleContent);
        console.log('[updateSubtitles] Parsed subtitles:', {
          format: parsed.format,
          count: parsed.subtitles.length,
          samples: parsed.subtitles.slice(0, 2),
        });

        const updatedEpisodes = [...currentEpisodes];
        updatedEpisodes[episodeIndex] = {
          ...updatedEpisodes[episodeIndex],
          subtitleUri: savedSubtitleUri,
          subtitles: parsed.subtitles,
        };

        // Save and then update state
        await saveToDisk(updatedEpisodes);
        setEpisodes(updatedEpisodes);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Subtitle update failed');
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [loadEpisodes, saveToDisk]
  );

  const deleteEpisode = useCallback(async (episodeId: string) => {
    try {
      const episodePath = `${FileSystem.documentDirectory}koji/episodes/${episodeId}/`;
      await FileSystem.deleteAsync(episodePath, { idempotent: true });

      const currentEpisodes = await loadEpisodes();
      const updated = currentEpisodes.filter((ep) => ep.id !== episodeId);
      
      await saveToDisk(updated);
      setEpisodes(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed');
      throw err;
    }
  }, [loadEpisodes, saveToDisk]);

  return {
    episodes,
    isLoading,
    error,
    uploadEpisode,
    deleteEpisode,
    updateSubtitles,
    refreshEpisodes: loadEpisodes,
  };
};