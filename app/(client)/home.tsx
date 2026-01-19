import { View, Text, StyleSheet } from "react-native";

export default function ClientHome() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome Client 👋</Text>
      <Text>Your dashboard overview appears here</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10,
  },
});
