import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

const { width, height } = Dimensions.get('window');

interface IntroScreen {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
}

const introScreens: IntroScreen[] = [
  {
    id: '1',
    title: 'Learn Japanese',
    description: 'Master the language through your favorite anime',
    icon: '🎌',
    color: '#B19CD9',
  },
  {
    id: '2',
    title: 'Interactive Subtitles',
    description: 'Click words to see translations and pronunciation',
    icon: '📝',
    color: '#7FE5DE',
  },
  {
    id: '3',
    title: 'Smart Flashcards',
    description: 'Review vocabulary with spaced repetition',
    icon: '🎯',
    color: '#FFB6D9',
  },
  {
    id: '4',
    title: 'Track Progress',
    description: 'Watch your learning journey and stay motivated',
    icon: '📊',
    color: '#A8E6CF',
  },
];

export default function IntroScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollViewRef = useRef<FlatList>(null);

  const handleScroll = (event: any) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / width);
    setCurrentIndex(index);
  };

  const handleNext = () => {
    if (currentIndex < introScreens.length - 1) {
      scrollViewRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
    } else {
      router.replace('/(tabs)');
    }
  };

  const renderScreen = ({ item }: { item: IntroScreen }) => (
    <View style={[styles.screen, { width }]}>
      <View
        style={[
          styles.iconContainer,
          { backgroundColor: item.color + '20' },
        ]}
      >
        <Text style={styles.icon}>{item.icon}</Text>
      </View>

      <Text style={[styles.title, { color: colors.text }]}>
        {item.title}
      </Text>
      <Text style={[styles.description, { color: colors.textSecondary }]}>
        {item.description}
      </Text>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        ref={scrollViewRef}
        data={introScreens}
        renderItem={renderScreen}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        scrollEnabled={false}
        onScroll={handleScroll}
        showsHorizontalScrollIndicator={false}
      />

      {/* Dots indicator */}
      <View style={styles.dotsContainer}>
        {introScreens.map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              {
                backgroundColor:
                  index === currentIndex ? colors.primary : colors.textSecondary + '40',
              },
            ]}
          />
        ))}
      </View>

      {/* Bottom buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          onPress={() => router.replace('/(tabs)')}
          style={[styles.skipButton, { borderColor: colors.textSecondary }]}
        >
          <Text style={[styles.skipText, { color: colors.textSecondary }]}>
            Skip
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleNext}
          style={[styles.nextButton, { backgroundColor: colors.primary }]}
        >
          <Text style={styles.nextText}>
            {currentIndex === introScreens.length - 1 ? 'Get Started' : 'Next'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
  },
  screen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  icon: {
    fontSize: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginBottom: 40,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  buttonContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 40,
    gap: 12,
  },
  skipButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skipText: {
    fontSize: 16,
    fontWeight: '600',
  },
  nextButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
