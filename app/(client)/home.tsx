import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function ClientDashboard() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.chatButton}
        onPress={() => router.push("/(client)/(Chat)")}
      >
        <Ionicons
          name="chatbubble-ellipses-outline"
          size={26}
          color="#6A5ACD"
        />
      </TouchableOpacity>

      <Text style={styles.title}>Client Dashboard 👤</Text>
      <Text>Browse, chat & connect with promoters</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center" },
  chatButton: { position: "absolute", top: 50, right: 20 },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 10 },
});
