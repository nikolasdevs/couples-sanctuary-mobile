import { initializeApp, getApps } from "firebase/app";
import { initializeAuth } from "firebase/auth";
import * as SecureStore from "expo-secure-store";

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

// expo-secure-store adapter — stores Firebase session tokens in the
// platform-native encrypted keychain/keystore instead of AsyncStorage.
const SecureStoreAdapter = {
  getItem: (key: string) => SecureStore.getItemAsync(key),
  setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),
  removeItem: (key: string) => SecureStore.deleteItemAsync(key),
};

// getReactNativePersistence is exported only from the RN bundle entry point
// of @firebase/auth. TypeScript resolves @firebase/auth to auth-public.d.ts
// (which omits it) because the "types" export condition takes precedence over
// "react-native". Metro correctly resolves the RN entry at runtime, so this
// require() call works; the cast just gives it a callable type.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { getReactNativePersistence } = require("@firebase/auth") as {
  getReactNativePersistence: (storage: typeof SecureStoreAdapter) => unknown;
};

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

export const firebaseAuth = initializeAuth(app, {
  persistence: getReactNativePersistence(SecureStoreAdapter) as never,
});
