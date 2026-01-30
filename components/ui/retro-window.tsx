import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { StyleSheet, View, ViewStyle } from 'react-native';

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

  const borderColor = {
    pink: '#FFB3D9',
    blue: '#B3E5FC',
    indigo: '#7986CB',
    purple: '#E1BEE7',
    mint: '#B2DFDB',
    peach: '#FFE0B2',
  }[color];

  return (
    <View style={[styles.container, style]}>
      {title && (
        <View style={[styles.titleBar, { backgroundColor: borderColor }]}>
          <View style={{ flex: 1 }} />
        </View>
      )}
      <View style={[styles.content, { backgroundColor: colors.retroLavender }]}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 3,
    borderColor: '#000000',
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#000000',
  },
  titleBar: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleButtonsContainer: {
    flexDirection: 'row',
    gap: 6,
  },
  titleButton: {
    width: 16,
    height: 16,
    borderRadius: 2,
    borderWidth: 1,
    borderColor: '#000000',
  },
  content: {
    padding: 16,
  },
});
