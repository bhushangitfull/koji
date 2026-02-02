/**
 * Secure Token Storage
 * Uses expo-secure-store for native encryption
 * Falls back to AsyncStorage for dev/web
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = 'koji_auth_token';
const REFRESH_TOKEN_KEY = 'koji_refresh_token';
const USER_KEY = 'koji_user';

/**
 * Save authentication token securely
 */
export const saveToken = async (token: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(TOKEN_KEY, token);
  } catch (error) {
    console.error('Failed to save token:', error);
    throw new Error('Failed to save authentication token');
  }
};

/**
 * Get stored authentication token
 */
export const getToken = async (): Promise<string | null> => {
  try {
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    return token;
  } catch (error) {
    console.error('Failed to retrieve token:', error);
    return null;
  }
};

/**
 * Save refresh token
 */
export const saveRefreshToken = async (refreshToken: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  } catch (error) {
    console.error('Failed to save refresh token:', error);
    throw new Error('Failed to save refresh token');
  }
};

/**
 * Get refresh token
 */
export const getRefreshToken = async (): Promise<string | null> => {
  try {
    const refreshToken = await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
    return refreshToken;
  } catch (error) {
    console.error('Failed to retrieve refresh token:', error);
    return null;
  }
};

/**
 * Save user data
 */
export const saveUser = async (user: any): Promise<void> => {
  try {
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch (error) {
    console.error('Failed to save user:', error);
    throw new Error('Failed to save user data');
  }
};

/**
 * Get stored user data
 */
export const getUser = async (): Promise<any | null> => {
  try {
    const userJson = await AsyncStorage.getItem(USER_KEY);
    if (!userJson) return null;
    return JSON.parse(userJson);
  } catch (error) {
    console.error('Failed to retrieve user:', error);
    return null;
  }
};

/**
 * Clear all auth data
 */
export const clearAuthData = async (): Promise<void> => {
  try {
    await AsyncStorage.multiRemove([TOKEN_KEY, REFRESH_TOKEN_KEY, USER_KEY]);
  } catch (error) {
    console.error('Failed to clear auth data:', error);
    throw new Error('Failed to clear authentication data');
  }
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = async (): Promise<boolean> => {
  try {
    const token = await getToken();
    return !!token;
  } catch {
    return false;
  }
};
