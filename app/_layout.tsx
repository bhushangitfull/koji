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
  // 1. If Auth is still initializing the VERY first time, wait.
  if (authLoading) return;

  const inAuthGroup = segments[0] === '(auth)';
  const inSetup = segments[0] === 'user-setup';

  // 2. PRIORITY: Handle Signed Out State
  if (!isSignedIn) {
    if (!inAuthGroup) {
      router.replace('/(auth)/sign-in');
    }
    return; // EXIT EARLY. Do not check profileLoading.
  }

  // 3. Handle Signed In State (Now we care about profile)
  if (profileLoading) return; 

  if (profile && !profile.profile_completed && !inSetup) {
    router.replace('/user-setup');
  } else if (profile?.profile_completed && (inSetup || inAuthGroup)) {
    router.replace('/(tabs)');
  }
}, [isSignedIn, profile, authLoading, profileLoading, segments]);

  if (authLoading || (isSignedIn && profileLoading)) {
    return <AuthLoadingScreen />;
  }

  return (
    <Stack  screenOptions={{
    headerShown: false, // ← This is crucial!
  }}>
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
          <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal', headerShown: false }} />
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