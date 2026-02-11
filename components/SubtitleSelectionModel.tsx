import { getFromDictionary } from '@/utils/flashcardGenerator';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
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
  const [selectedDefinition, setSelectedDefinition] = useState<WordDefinition | null>(null);
  const [definitionVisible, setDefinitionVisible] = useState(false);

  const handleWordPress = (word: string) => {
    setSelectedWord(word);
    const definition = getFromDictionary(word);
    setSelectedDefinition(definition);
    setDefinitionVisible(true);
  };

  const handleCloseDefinition = () => {
    setDefinitionVisible(false);
    setTimeout(() => {
      setSelectedWord(null);
      setSelectedDefinition(null);
    }, 300);
  };

  const handleCloseAll = () => {
    setDefinitionVisible(false);
    setSelectedWord(null);
    setSelectedDefinition(null);
    onClose();
  };

  // Extract Japanese words and spaces
  const renderWords = () => {
    const segments = subtitleText.split(/(\s+)/);
    
    return segments.map((segment, index) => {
      const trimmed = segment.trim();
      
      // Empty or space - render as spacing
      if (!trimmed) {
        return <Text key={index} style={styles.space}> </Text>;
      }

      // Check if it contains Japanese characters
      const hasJapanese = /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF]/.test(trimmed);
      
      if (hasJapanese) {
        // Japanese word - make it tappable and highlighted
        return (
          <TouchableOpacity
            key={index}
            onPress={() => handleWordPress(trimmed)}
            style={styles.wordButton}
          >
            <Text style={styles.wordText}>{segment}</Text>
          </TouchableOpacity>
        );
      }

      // Non-Japanese text (punctuation, numbers, etc.)
      return (
        <Text key={index} style={styles.normalText}>
          {segment}
        </Text>
      );
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
              <Text style={styles.title}>Tap a word to look up</Text>
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
              <Ionicons name="information-circle-outline" size={18} color="#666" />
              <Text style={styles.instructionText}>
                Highlighted words are Japanese vocabulary
              </Text>
            </View>
          </View>
        </View>
      </Modal>

      {/* Word Definition Modal - shown below subtitle modal */}
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
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    width: '90%',
    maxHeight: '70%',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  closeButton: {
    padding: 4,
  },
  subtitleContainer: {
    maxHeight: 300,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  wordsWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  wordButton: {
    backgroundColor: '#FFE0B2',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 6,
    marginHorizontal: 2,
    marginVertical: 2,
    borderWidth: 2,
    borderColor: '#FF9800',
  },
  wordText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#E65100',
  },
  normalText: {
    fontSize: 20,
    color: '#333',
    marginHorizontal: 2,
  },
  space: {
    fontSize: 20,
  },
  instructions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#F5F5F5',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  instructionText: {
    fontSize: 13,
    color: '#666',
    flex: 1,
  },
});