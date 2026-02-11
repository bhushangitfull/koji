import { getJishoDefinition } from '@/utils/flashcardGenerator';
import { createTappableSegments } from '@/utils/japaneseTokenizer';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import WordDefinitionModal, { WordDefinition } from './WordDefinitionModal';

interface SubtitleSelectionModalProps {
  visible: boolean;
  subtitleText: string;
  onClose: () => void;
}

export default function SubtitleSelectionModal({
  visible,
  subtitleText,
  onClose,
}: SubtitleSelectionModalProps) {
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [selectedDefinition, setSelectedDefinition] = useState<WordDefinition | null | undefined>(undefined);
  const [definitionVisible, setDefinitionVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleWordPress = async (lookupWord: string, displayWord: string) => {
    console.log('[SubtitleModal] Word pressed:', { lookupWord, displayWord });
    
    setSelectedWord(displayWord); // Show the original word in modal
    setDefinitionVisible(true);
    setSelectedDefinition(undefined); // Show loading state
    setIsLoading(true);

    try {
      // Fetch definition from Jisho API with the cleaned word
      const definition = await getJishoDefinition(lookupWord);
      console.log('[SubtitleModal] Got definition for:', lookupWord, definition);

      if (definition) {
        setSelectedDefinition({
          furigana: definition.hiragana,
          meaning: definition.meaning,
          partOfSpeech: definition.partOfSpeech,
          exampleSentence: definition.exampleSentence || '',
        });
      } else {
        // Try with the original display word if cleaned version failed
        if (lookupWord !== displayWord) {
          console.log('[SubtitleModal] Retrying with display word:', displayWord);
          const retryDefinition = await getJishoDefinition(displayWord);
          
          if (retryDefinition) {
            setSelectedDefinition({
              furigana: retryDefinition.hiragana,
              meaning: retryDefinition.meaning,
              partOfSpeech: retryDefinition.partOfSpeech,
              exampleSentence: retryDefinition.exampleSentence || '',
            });
          } else {
            setSelectedDefinition(null);
          }
        } else {
          setSelectedDefinition(null);
        }
      }
    } catch (error) {
      console.error('[SubtitleModal] Error fetching definition:', error);
      setSelectedDefinition(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseDefinition = () => {
    setDefinitionVisible(false);
    setTimeout(() => {
      setSelectedWord(null);
      setSelectedDefinition(undefined);
      setIsLoading(false);
    }, 300);
  };

  const handleCloseAll = () => {
    setDefinitionVisible(false);
    setSelectedWord(null);
    setSelectedDefinition(undefined);
    setIsLoading(false);
    onClose();
  };

  // IMPROVED: Use proper Japanese tokenization
  const renderWords = () => {
    const segments = createTappableSegments(subtitleText);
    
    return segments.map((segment, index) => {
      if (segment.isTappable) {
        // This is a Japanese word - make it tappable
        return (
          <TouchableOpacity
            key={index}
            onPress={() => handleWordPress(segment.lookupWord, segment.text)}
            style={styles.wordButton}
            activeOpacity={0.7}
          >
            <Text style={styles.wordText}>{segment.text}</Text>
          </TouchableOpacity>
        );
      } else {
        // Punctuation, particles, or spaces
        return (
          <Text key={index} style={styles.normalText}>
            {segment.text}
          </Text>
        );
      }
    });
  };

  return (
    <>
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={handleCloseAll}
      >
        <View style={styles.overlay}>
          <View style={styles.modalContainer}>
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.titleRow}>
                <Ionicons name="language-outline" size={22} color="#FF6B9D" />
                <Text style={styles.title}>Tap to Look Up</Text>
              </View>
              <TouchableOpacity onPress={handleCloseAll} style={styles.closeButton}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            {/* Subtitle with highlighted words */}
            <ScrollView 
              style={styles.subtitleContainer}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.wordsWrapper}>
                {renderWords()}
              </View>
            </ScrollView>

            {/* Instructions */}
            <View style={styles.instructions}>
              <View style={styles.instructionRow}>
                <View style={styles.instructionBadge}>
                  <Text style={styles.instructionBadgeText}>Orange</Text>
                </View>
                <Text style={styles.instructionText}>= Dictionary words (kanji/katakana)</Text>
              </View>
              <View style={styles.instructionRow}>
                <Ionicons name="hand-left-outline" size={16} color="#666" />
                <Text style={styles.instructionText}>Tap any orange word to see definition</Text>
              </View>
            </View>
          </View>
        </View>
      </Modal>

      {/* Word Definition Modal */}
      <WordDefinitionModal
        visible={definitionVisible}
        word={selectedWord}
        definition={selectedDefinition}
        onClose={handleCloseDefinition}
      />
    </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    width: '92%',
    maxHeight: '75%',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderBottomWidth: 2,
    borderBottomColor: '#F0F0F0',
    backgroundColor: '#FAFAFA',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  closeButton: {
    padding: 4,
  },
  subtitleContainer: {
    maxHeight: 320,
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  wordsWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  wordButton: {
    backgroundColor: '#FFE0B2',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 8,
    marginHorizontal: 2,
    marginVertical: 3,
    borderWidth: 2,
    borderColor: '#FF9800',
    shadowColor: '#FF9800',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },
  wordText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#E65100',
    letterSpacing: 0.5,
  },
  normalText: {
    fontSize: 20,
    color: '#555',
    marginHorizontal: 1,
  },
  instructions: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#F8F8F8',
    borderTopWidth: 2,
    borderTopColor: '#F0F0F0',
    gap: 10,
  },
  instructionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  instructionBadge: {
    backgroundColor: '#FFE0B2',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#FF9800',
  },
  instructionBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#E65100',
  },
  instructionText: {
    fontSize: 12,
    color: '#666',
    flex: 1,
    lineHeight: 18,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#999',
  },
});