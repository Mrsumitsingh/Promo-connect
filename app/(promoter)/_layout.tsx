import { Ionicons } from "@expo/vector-icons";
import { Redirect, Tabs } from "expo-router";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../../lib/auth";

const TABS = [
  { name: "home", icon: "grid-outline" },
  { name: "Explore", icon: "search-outline" },
  { name: "profile", icon: "person-outline" },
  { name: "settings", icon: "settings-outline" },
];

export default function PromoterLayout() {
  const { user, loading } = useAuth();
  const insets = useSafeAreaInsets();

  if (loading) return null;
  if (!user) return <Redirect href="/(auth)/login" />;
  if (user.role !== "promoter") return <Redirect href="/(client)/home" />;

  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      tabBar={(props) => {
        const currentRoute =
          props.state.routes[props.state.index].name;

        // 🚫 Hide tab bar if NOT on home
        if (currentRoute !== "home") {
          return null;
        }

        return (
          <>
            {/* Spacer so content isn't hidden */}
            <View style={{ height: 80 + insets.bottom }} />

            {/* Floating Tab Bar */}
            <View style={[styles.wrapper, { bottom: insets.bottom + 12 }]}>
              <View style={styles.tabBar}>
                {TABS.map((tab) => {
                  const isFocused = currentRoute === tab.name;

                  return (
                    <TouchableOpacity
                      key={tab.name}
                      onPress={() => props.navigation.navigate(tab.name)}
                      style={[
                        styles.tabItem,
                        isFocused && styles.activeTab,
                      ]}
                      activeOpacity={0.8}
                    >
                      <Ionicons
                        name={tab.icon as any}
                        size={22}
                        color={isFocused ? "#fff" : "#aaa"}
                      />
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </>
        );
      }}
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
    left: 0,
    right: 0,
    alignItems: "center",
  },
  tabBar: {
    flexDirection: "row",
    backgroundColor: "#111",
    borderRadius: 32,
    paddingHorizontal: 18,
    paddingVertical: 14,
    width: "80%",
    justifyContent: "space-between",
    elevation: 12,
  },
  tabItem: {
    padding: 12,
    borderRadius: 24,
  },
  activeTab: {
    backgroundColor: "#007AFF",
  },
});
