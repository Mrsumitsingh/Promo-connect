import { View, Text, StyleSheet } from "react-native";

export default function PromoterDashboard() {
  return (
    <View style={styles.container}>
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
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10,
  },
});
