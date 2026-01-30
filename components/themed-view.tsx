import { View, type ViewProps } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useThemeColor } from '@/hooks/use-theme-color';

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
  useSafeArea?: boolean;
};

export function ThemedView({ style, lightColor, darkColor, useSafeArea = false, ...otherProps }: ThemedViewProps) {
  const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, 'background');
  const Component = useSafeArea ? SafeAreaView : View;

  return <Component style={[{ backgroundColor }, style]} {...otherProps} />;
}
