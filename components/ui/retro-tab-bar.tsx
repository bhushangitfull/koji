import { View, StyleSheet, Pressable } from 'react-native';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface RetroTabBarProps {
  state: any;
  descriptors: any;
  navigation: any;
}

export function RetroTabBar({ state, descriptors, navigation }: RetroTabBarProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <View style={[styles.container, { backgroundColor: colors.retroBg }]}>
      <View style={styles.tabsWrapper}>
        {state.routes.map((route: any, index: number) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          };

          return (
            <Pressable
              key={route.key}
              onPress={onPress}
              style={({ pressed }) => [
                styles.tab,
                {
                  backgroundColor: isFocused ? colors.primary : colors.retroLavender,
                  opacity: pressed ? 0.85 : 1,
                },
              ]}
            >
              {options.tabBarIcon &&
                options.tabBarIcon({
                  color: isFocused ? '#FFFFFF' : '#000000',
                  size: 28,
                })}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderTopWidth: 3,
    borderTopColor: '#333333',
    paddingBottom: 8,
    paddingTop: 8,
    paddingHorizontal: 8,
  },
  tabsWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: 8,
  },
  tab: {
    flex: 1,
    borderWidth: 3,
    borderColor: '#333333',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
