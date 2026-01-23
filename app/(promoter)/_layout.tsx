import { Ionicons } from "@expo/vector-icons";
import { Redirect, Tabs } from "expo-router";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { useAuth } from "../../lib/auth";

export default function PromoterLayout() {
  const { user, loading } = useAuth();

  if (loading) return null;
  if (!user) return <Redirect href="/(auth)/login" />;
  if (user.role !== "promoter") {
    return <Redirect href="/(client)/home" />;
  }

  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      tabBar={(props) => (
        <View style={styles.wrapper}>
          <View style={styles.tabBar}>
            {props.state.routes.map((route, index) => {
              const isFocused = props.state.index === index;

              const iconMap: Record<string, any> = {
                home: "grid-outline",
                Explore: "search-outline",
                profile: "person-outline",
                settings: "settings-outline",
              };

              return (
                <TouchableOpacity
                  key={route.key}
                  onPress={() => props.navigation.navigate(route.name)}
                  style={[styles.tabItem, isFocused && styles.activeTab]}
                >
                  <Ionicons
                    name={iconMap[route.name]}
                    size={22}
                    color={isFocused ? "#fff" : "#666"}
                  />
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      )}
    >
      <Tabs.Screen name="home" />
      <Tabs.Screen name="Explore" />

      <Tabs.Screen name="profile" />
      <Tabs.Screen name="settings" />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    bottom: 25,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  tabBar: {
    flexDirection: "row",
    backgroundColor: "#111",
    borderRadius: 30,
    padding: 10,
    width: "70%",
    justifyContent: "space-between",

    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 10,
  },
  tabItem: {
    padding: 12,
    borderRadius: 20,
  },
  activeTab: {
    backgroundColor: "#007AFF",
  },
});
