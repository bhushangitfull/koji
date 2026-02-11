import { Ionicons } from '@expo/vector-icons';
import React, { useEffect } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export interface WordDefinition {
  furigana: string;
  meaning: string;
  partOfSpeech: string;
  exampleSentence: string;
}

interface WordDefinitionModalProps {
  visible: boolean;
  word: string | null;
  definition: WordDefinition | null;
  subtitleText?: string | null;
  onClose: () => void;
  onWordPress?: (word: string) => void;
}

// Component to render tappable words
function TappableText({ text, onWordPress }: { text: string; onWordPress?: (word: string) => void }) {
  // Check if text contains Japanese characters
  const hasJapanese = /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF]/.test(text);
  
  if (!hasJapanese || !onWordPress) {
    return <Text style={styles.meaning}>{text}</Text>;
  }

  // Split by whitespace and Japanese word boundaries
  const parts = text.split(/(\s+|[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF]+)/);

  return (
    <Text style={styles.meaning}>
      {parts.map((part, index) => {
        const isJapanese = /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF]/.test(part);
        
        if (!isJapanese) {
          return <Text key={index}>{part}</Text>;
        }

        return (
          <Pressable key={index} onPress={() => onWordPress(part)}>
            <Text style={[styles.meaning, { textDecorationLine: 'underline', color: '#FF6B9D' }]}>
              {part}
            </Text>
          </Pressable>
        );
      })}
    </Text>
  );
}

export default function WordDefinitionModal({
  visible,
  word,
  definition,
  subtitleText,
  onClose,
  onWordPress,
}: WordDefinitionModalProps) {
  useEffect(() => {
    console.log('[WordDefinitionModal] State:', {
      visible,
      word,
      definition,
      definitionType: typeof definition,
    });
  }, [visible, word, definition]);
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Header with close button */}
          <View style={styles.header}>
            <Text style={styles.wordText}>{word}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={true}>
            {definition === undefined ? (
              // Loading state
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#FF6B9D" />
                <Text style={styles.loadingText}>Fetching definition...</Text>
              </View>
            ) : definition ? (
              <>
                {/* Furigana */}
                <View style={styles.section}>
                  <Text style={styles.label}>Reading (Furigana)</Text>
                  <Text style={styles.furigana}>{definition.furigana}</Text>
                </View>

                {/* Meaning */}
                <View style={styles.section}>
                  <Text style={styles.label}>Meaning</Text>
                  <TappableText 
                    text={definition.meaning}
                    onWordPress={onWordPress}
                  />
                </View>

                {/* Part of Speech */}
                <View style={styles.section}>
                  <Text style={styles.label}>Part of Speech</Text>
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{definition.partOfSpeech}</Text>
                  </View>
                </View>

                {/* Example Sentence */}
                <View style={styles.section}>
                  <Text style={styles.label}>Example</Text>
                  <TappableText 
                    text={definition.exampleSentence}
                    onWordPress={onWordPress}
                  />
                </View>
              </>
            ) : (
              <View style={styles.noDefinition}>
                <Ionicons name="search-outline" size={48} color="#CCC" />
                <Text style={styles.noDefinitionText}>
                  Definition not available
                </Text>
                <Text style={styles.noDefinitionSubtext}>
                  This word hasn't been added to the dictionary yet.
                </Text>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    width: '85%',
    maxHeight: '70%',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
    overflow: 'hidden',
    flexDirection: 'column',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  wordText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
    flex: 1,
  },
  closeButton: {
    padding: 8,
  },
  content: {
    minHeight: 150,
    maxHeight: 300,
    paddingRight: 8,
  },
  section: {
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#999',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  furigana: {
    fontSize: 18,
    color: '#FF6B9D',
    fontWeight: '600',
  },
  meaning: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  badgeText: {
    fontSize: 13,
    color: '#555',
    fontWeight: '500',
  },
  example: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    fontStyle: 'italic',
    paddingLeft: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#FFD700',
  },
  noDefinition: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  noDefinitionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#999',
    marginTop: 12,
  },
  noDefinitionSubtext: {
    fontSize: 13,
    color: '#BBB',
    marginTop: 6,
    textAlign: 'center',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  loadingText: {
    fontSize: 14,
    color: '#999',
    marginTop: 12,
    fontWeight: '500',
  },
});
