import { Stack } from "expo-router";

export default function ChatLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: "#4f46e5" },
        headerTintColor: "#fff",
        headerTitleStyle: { fontWeight: "600" },
      }}
    >
      <Stack.Screen name="index" options={{ title: "Chats" }} />
      <Stack.Screen name="chat" options={{ title: "Chat" }} />
    </Stack>
  );
}
