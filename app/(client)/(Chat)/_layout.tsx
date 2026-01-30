import { Stack } from "expo-router";

export default function ClientChatLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: "#4f46e5" },
        headerTintColor: "#fff",
        headerTitleStyle: { fontWeight: "600" },
      }}
    >
      <Stack.Screen name="index" options={{ title: "Chat" }} />
      <Stack.Screen name="chat" options={{ title: "Chat" }} />
    </Stack>
  );
}
