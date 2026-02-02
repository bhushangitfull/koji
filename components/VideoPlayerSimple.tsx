import React, { useEffect, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { VideoView, useVideoPlayer } from 'expo-video';
import { MaterialIcons } from '@expo/vector-icons';
import * as ScreenOrientation from 'expo-screen-orientation';

interface SimpleVideoPlayerProps {
  videoUri: string;
  title?: string;
}

export const SimpleVideoPlayer: React.FC<SimpleVideoPlayerProps> = ({
  videoUri,
  title,
}) => {
  const player = useVideoPlayer(videoUri);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPiP, setIsPiP] = useState(false);

  useEffect(() => {
    if (player) {
      player.play();
    }
  }, [player]);

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      // Track dimension changes for responsive UI
    });
    return () => subscription?.remove();
  }, []);

  const toggleRotation = async () => {
    try {
      if (isFullscreen) {
        await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
        setIsFullscreen(false);
      } else {
        await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
        setIsFullscreen(true);
      }
    } catch (error) {
      console.error('Error toggling rotation:', error);
    }
  };

  const togglePiP = async () => {
    try {
      if (isPiP) {
        setIsPiP(false);
      } else {
        setIsPiP(true);
        // Enter PiP mode
        await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
      }
    } catch (error) {
      console.error('Error toggling PiP:', error);
    }
  };

  return (
    <View style={[
      styles.container,
      isPiP && styles.pipContainer,
      isFullscreen && styles.fullscreenContainer,
    ]}>
      <VideoView
        player={player}
        style={styles.video}
        nativeControls={true}
      />

      {/* Control Buttons */}
      <View style={styles.controlsContainer}>
        <TouchableOpacity 
          style={styles.controlButton}
          onPress={toggleRotation}
        >
          <MaterialIcons
            name={isFullscreen ? 'fullscreen-exit' : 'fullscreen'}
            size={24}
            color="#fff"
          />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.controlButton}
          onPress={togglePiP}
        >
          <MaterialIcons
            name={isPiP ? 'picture-in-picture-alt' : 'picture-in-picture'}
            size={24}
            color={isPiP ? '#FFB6D9' : '#fff'}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullscreenContainer: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
  pipContainer: {
    width: 300,
    height: 200,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#FFB6D9',
    marginRight: 10,
    marginBottom: 10,
    alignSelf: 'flex-end',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  controlsContainer: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    flexDirection: 'row',
    gap: 10,
    zIndex: 100,
  },
  controlButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    padding: 10,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: '#FFB6D9',
  },
});

