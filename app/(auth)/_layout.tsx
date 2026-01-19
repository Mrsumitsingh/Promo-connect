// app/(auth)/_layout.tsx
import { Redirect, Stack } from "expo-router";
import { useAuth } from "../../lib/auth";

export default function AuthLayout() {
  const { user, loading } = useAuth();

  if (loading) {
    return null; // or a loading screen
  }

  if (user) {
    // Redirect based on role - Use correct Expo Router paths
    switch (user.role) {
      case 'client':
        return <Redirect href="/(client)/home" />;
      case 'promoter':
        return <Redirect href="/(promoter)/home" />;
     
      default:
        return <Redirect href="/(client)/home" />;
    }
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="signup" />
    </Stack>
  );
}