import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthLoadingScreen } from '@/components/AuthLoadingScreen';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuth } from '@/hooks/useAuth';
import { useUserProfile } from '@/hooks/useUserProfile';
import { AuthProvider } from '@/utils/auth-context.tsx';
import { useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';

export const unstable_settings = {
  anchor: '(tabs)',
};

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const { isLoading: authLoading, isSignedIn } = useAuth();
  const { profile, loading: profileLoading } = useUserProfile();
  const segments = useSegments();
  const router = useRouter();

  // Handle navigation based on auth and profile status
  useEffect(() => {
    if (authLoading || profileLoading) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inSetup = segments[0] === 'user-setup';

    if (!isSignedIn && !inAuthGroup) {
      // Redirect to sign in if not authenticated
      router.replace('/(auth)/sign-in');
    } else if (isSignedIn && profile && !profile.profile_completed && !inSetup) {
      // Redirect to setup if profile not complete
      router.replace('/user-setup');
    } else if (isSignedIn && profile?.profile_completed && inSetup) {
      // Redirect to tabs if setup is already complete
      router.replace('/(tabs)');
    }
  }, [isSignedIn, profile, authLoading, profileLoading, segments]);

  if (authLoading || (isSignedIn && profileLoading)) {
    return <AuthLoadingScreen />;
  }

  return (
    <Stack>
      {!isSignedIn ? (
        // Auth stack
        <Stack.Screen
          name="(auth)"
          options={{
            headerShown: false,
            animationEnabled: false,
          }}
        />
      ) : !profile?.profile_completed ? (
        // User setup screen
        <Stack.Screen
          name="user-setup"
          options={{
            headerShown: false,
            gestureEnabled: false,
          }}
        />
      ) : (
        // Authenticated stack
        <>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
          <Stack.Screen name="player" options={{ headerShown: false, presentation: 'fullScreenModal' }} />
          <Stack.Screen 
            name="user-setup" 
            options={{ 
              headerShown: false,
              presentation: 'modal'
            }} 
          />
        </>
      )}
    </Stack>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <RootLayoutNav />
          <StatusBar style="auto" />
        </ThemeProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}