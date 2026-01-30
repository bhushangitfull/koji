import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';

interface RetroTabBarProps {
  state: any;
  descriptors: any;
  navigation: any;
}

export function RetroTabBar({ state, descriptors, navigation }: RetroTabBarProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [activeLabel, setActiveLabel] = useState<string | null>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  return (
    <View style={[styles.container, { backgroundColor: '#8c8af0' }]}>
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

            // Show label animation
            setActiveLabel(route.name);
            fadeAnim.setValue(1);
            Animated.sequence([
              Animated.delay(500),
              Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
              }),
            ]).start();
          };

          return (
            <View key={route.key} style={styles.tabWrapper}>
              {activeLabel === route.name && (
                <Animated.View style={[styles.labelTooltip, { opacity: fadeAnim }]}>
                  <Text style={styles.labelText}>{options.title || route.name}</Text>
                </Animated.View>
              )}
              <Pressable
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
            </View>
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
  tabWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    position: 'relative',
  },
  tab: {
    borderWidth: 3,
    borderColor: '#333333',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  labelTooltip: {
    position: 'absolute',
    bottom: 60,
    left: '50%',
    marginLeft: -30,
    backgroundColor: '#333333',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    zIndex: 1,
    minWidth: 60,
  },
  labelText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'capitalize',
    flexWrap: 'nowrap',
  },
});
