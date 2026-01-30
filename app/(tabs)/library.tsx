import { View, Text, StyleSheet } from 'react-native';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';

export default function LibraryScreen() {
  return (
    <ThemedView style={styles.container} useSafeArea>
      <View style={styles.header}>
        <ThemedText type="title" style={styles.title}>📚 Library</ThemedText>
        <ThemedText style={styles.subtitle}>Manage your anime episodes</ThemedText>
      </View>
      
      <View style={styles.content}>
        <ThemedText>Episodes will be displayed here</ThemedText>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    opacity: 0.6,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
