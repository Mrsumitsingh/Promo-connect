import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function PromoterDashboard() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Top Right Chat Button */}
      <TouchableOpacity
        style={styles.chatButton}
        onPress={() => router.push("/(promoter)/(Chat)")}
      >
        <Ionicons
          name="chatbubble-ellipses-outline"
          size={26}
          color="#6A5ACD"
        />
      </TouchableOpacity>

      <Text style={styles.title}>Promoter Dashboard 🚀</Text>
      <Text>Leads, analytics & stats go here</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  chatButton: {
    position: "absolute",
    top: 50,
    right: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10,
  },
});
