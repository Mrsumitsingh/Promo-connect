import { Stack } from "expo-router";
import { AuthProvider } from "../lib/auth";

export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="hero" />
        {/* <Stack.Screen name="authLanding" /> */}
        <Stack.Screen name="index" />
      </Stack>
    </AuthProvider>
  );
}
