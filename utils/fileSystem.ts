import * as FileSystem from 'expo-file-system/legacy';

// Simple ID generator that works in React Native (no crypto needed)
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

const EPISODES_DIR = `${FileSystem.documentDirectory}koji/episodes/`;
const TEMP_DIR = `${FileSystem.documentDirectory}koji/temp/`;

export interface FileInfo {
  name: string;
  size: number;
  type: 'video' | 'subtitle' | 'unknown';
  mimeType?: string;
}

/**
 * Initialize app directories
 */
export async function initializeAppDirectories(): Promise<void> {
  try {
    // Check and create episodes directory
    const episodesInfo = await FileSystem.getInfoAsync(EPISODES_DIR);
    if (!episodesInfo.exists) {
      await FileSystem.makeDirectoryAsync(EPISODES_DIR, { intermediates: true });
    }

    // Check and create temp directory
    const tempInfo = await FileSystem.getInfoAsync(TEMP_DIR);
    if (!tempInfo.exists) {
      await FileSystem.makeDirectoryAsync(TEMP_DIR, { intermediates: true });
    }

    console.log('App directories initialized');
  } catch (error) {
    console.error('Error initializing directories:', error);
    throw error;
  }
}

/**
 * Get file info from URI
 */
export async function getFileInfo(uri: string): Promise<FileInfo> {
  try {
    const info = await FileSystem.getInfoAsync(uri);
    const fileName = uri.split('/').pop() || 'file';
    const extension = fileName.split('.').pop()?.toLowerCase() || '';

    let type: 'video' | 'subtitle' | 'unknown' = 'unknown';
    let mimeType = '';

    if (['mp4', 'mkv', 'avi', 'mov', 'webm', 'm4v'].includes(extension)) {
      type = 'video';
      mimeType = extension === 'mkv' ? 'video/x-matroska' : `video/${extension}`;
    } else if (['srt', 'vtt', 'ass', 'ssa'].includes(extension)) {
      type = 'subtitle';
      mimeType = extension === 'srt' ? 'text/plain' : 'text/vtt';
    }

    return {
      name: fileName,
      size: info.size || 0,
      type,
      mimeType,
    };
  } catch (error) {
    console.error('Error getting file info:', error);
    throw error;
  }
}

/**
 * Copy file to episodes directory
 */
export async function copyFileToEpisodes(
  sourceUri: string,
  fileName: string
): Promise<string> {
  try {
    const destinationUri = `${EPISODES_DIR}${fileName}`;
    await FileSystem.copyAsync({
      from: sourceUri,
      to: destinationUri,
    });
    return destinationUri;
  } catch (error) {
    console.error('Error copying file:', error);
    throw error;
  }
}

/**
 * Create episode directory
 */
export async function createEpisodeDirectory(episodeId: string): Promise<string> {
  try {
    const episodePath = `${EPISODES_DIR}${episodeId}/`;
    const info = await FileSystem.getInfoAsync(episodePath);
    if (!info.exists) {
      await FileSystem.makeDirectoryAsync(episodePath, { intermediates: true });
    }
    return episodePath;
  } catch (error) {
    console.error('Error creating episode directory:', error);
    throw error;
  }
}

/**
 * Save file to episode directory
 */
export async function saveFileToEpisode(
  episodeId: string,
  fileUri: string,
  fileName: string
): Promise<string> {
  try {
    const episodePath = await createEpisodeDirectory(episodeId);
    const destinationUri = `${episodePath}${fileName}`;

    await FileSystem.copyAsync({
      from: fileUri,
      to: destinationUri,
    });

    return destinationUri;
  } catch (error) {
    console.error('Error saving file to episode:', error);
    throw error;
  }
}

/**
 * Read subtitle file content with fallback encoding
 */
export async function readSubtitleFile(fileUri: string): Promise<string> {
  try {
    let content: string;
    
    try {
      // First try UTF-8
      content = await FileSystem.readAsStringAsync(fileUri, {
        encoding: FileSystem.EncodingType.UTF8,
      });
    } catch (utf8Error) {
      // Fallback: try reading as binary and attempt to decode
      console.warn('UTF-8 read failed, attempting binary read:', utf8Error);
      content = await FileSystem.readAsStringAsync(fileUri);
    }
    
    // Log diagnostic info for Japanese subtitles
    if (content.includes('0x')) {
      console.warn('Possible encoding issue detected in subtitle file');
    }
    
    return content;
  } catch (error) {
    console.error('Error reading subtitle file:', error);
    throw error;
  }
}

/**
 * Delete episode directory
 */
export async function deleteEpisodeDirectory(episodeId: string): Promise<void> {
  try {
    const episodePath = `${EPISODES_DIR}${episodeId}/`;
    const info = await FileSystem.getInfoAsync(episodePath);
    if (info.exists) {
      await FileSystem.deleteAsync(episodePath, { idempotent: true });
    }
  } catch (error) {
    console.error('Error deleting episode directory:', error);
    throw error;
  }
}

/**
 * Get available space
 */
export async function getAvailableSpace(): Promise<number> {
  try {
    const info = await FileSystem.getFreeDiskStorageAsync();
    return info;
  } catch (error) {
    console.error('Error getting available space:', error);
    return 0;
  }
}

/**
 * Check if file exists
 */
export async function fileExists(uri: string): Promise<boolean> {
  try {
    const info = await FileSystem.getInfoAsync(uri);
    return info.exists;
  } catch (error) {
    return false;
  }
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Generate unique file name
 */
export function generateFileName(originalName: string): string {
  const extension = originalName.split('.').pop() || '';
  return `${generateId()}.${extension}`;
}
