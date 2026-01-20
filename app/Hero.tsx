// import { useRouter } from "expo-router";
// import { useEffect } from "react";
// import { StyleSheet, Text, View } from "react-native";

// export default function Hero() {
//   const router = useRouter();

//   useEffect(() => {
//     const timer = setTimeout(() => {
//       router.replace("/"); // go to index after 1 sec
//     }, 30000);

//     return () => clearTimeout(timer);
//   }, []);

//   return (
//     <View style={styles.container}>
//       <Text style={styles.logo}>🚀 PromoConnect</Text>
//       <Text style={styles.tagline}>Connecting Brands & Promoters</Text>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     backgroundColor: "#000",
//   },
//   logo: {
//     fontSize: 32,
//     fontWeight: "700",
//     color: "#fff",
//   },
//   tagline: {
//     marginTop: 10,
//     color: "#ccc",
//   },
// });

import { Redirect, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { getRole } from "../lib/auth";

export default function Index() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      const savedRole = await getRole();
      setRole(savedRole);
      setLoading(false);
    };
    init();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (role === "client") return <Redirect href="/(client)/home" />;
  if (role === "promoter") return <Redirect href="/(promoter)/home" />;

  // 👇 Show buttons if not logged in
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome 👋</Text>

      <Pressable
        style={styles.button}
        onPress={() => router.push("/(auth)/login")}
      >
        <Text style={styles.buttonText}>Login</Text>
      </Pressable>

      <Pressable
        style={styles.outlineButton}
        onPress={() => router.push("/(auth)/signup")}
      >
        <Text style={styles.outlineText}>Signup</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: "center",
  },
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    marginBottom: 30,
    textAlign: "center",
  },
  button: {
    backgroundColor: "#000",
    paddingVertical: 14,
    borderRadius: 8,
    marginBottom: 12,
  },
  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "500",
  },
  outlineButton: {
    borderWidth: 1,
    borderColor: "#000",
    paddingVertical: 14,
    borderRadius: 8,
    marginBottom: 12,
  },
  outlineText: {
    textAlign: "center",
    fontSize: 16,
    fontWeight: "500",
  },
});
