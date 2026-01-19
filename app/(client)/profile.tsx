import { useRouter } from "expo-router";
import { Button, StyleSheet, Text, View } from "react-native";
import { logout, useAuth } from "./../../lib/auth"; // Import both

export default function ClientProfile() {
  const router = useRouter();
  const { user, logout: contextLogout } = useAuth(); // Get from context

  // Option 1: Using the context logout (recommended)
  const handleLogout = async () => {
    await contextLogout(); // This already handles navigation
    // No need for router.replace - it's done in logout function
  };

  // Option 2: Using the direct logout function
  const handleLogoutDirect = async () => {
    await logout(); // Direct import
    router.replace("/(auth)/login"); // Still need navigation
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Client Profile</Text>
      <Text>Email: {user?.email || "client@email.com"}</Text>
      <Text>Role: {user?.role || "Client"}</Text>

      <View style={{ marginTop: 20 }}>
        <Button title="Logout" onPress={handleLogout} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
});