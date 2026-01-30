import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { StyleSheet, View, ViewStyle, Text } from 'react-native';
import { Fonts } from '@/constants/theme';

interface RetroWindowProps {
  children: React.ReactNode;
  title?: string;
  style?: ViewStyle;
  color?: 'pink' | 'blue' | 'indigo' | 'purple' | 'mint' | 'peach';
}

export function RetroWindow({
  children,
  title,
  style,
  color = 'pink',
}: RetroWindowProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const accentColor = {
    pink: '#FFB3D9',
    blue: '#B3E5FC',
    indigo: '#7986CB',
    purple: '#E1BEE7',
    mint: '#B2DFDB',
    peach: '#FFE0B2',
  }[color];

  const titleColor = {
    pink: '#E91E63',
    blue: '#0288D1',
    indigo: '#3949AB',
    purple: '#8E24AA',
    mint: '#00897B',
    peach: '#F57C00',
  }[color];

  return (
    <View style={[styles.container, style]}>
      {title && (
        <View style={[styles.titleBar, { borderBottomColor: accentColor }]}>
          <Text style={[styles.titleText, { color: titleColor }]}>{title}</Text>
        </View>
      )}
      <View style={[styles.content, { backgroundColor: '#F5F5F5' }]}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#F5F5F5',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  titleBar: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: '#FFB3D9',
    backgroundColor: '#FAFAFA',
  },
  titleText: {
    fontSize: 14,
    fontWeight: '700',
    fontFamily: Fonts.rounded,
    letterSpacing: 0.3,
  },
  content: {
    padding: 16,
    backgroundColor: '#F5F5F5',
  },
});
