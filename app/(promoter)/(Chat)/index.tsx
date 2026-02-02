//index.tsx
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import api from "../../../lib/api";

type User = {
  id: number;
  name: string;
  email: string;
};

export default function ChatList() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const res = await api.get("/api/v1/users/explore");
      if (res.data.status) setUsers(res.data.data);
    } catch (e) {
      console.log(e);
    }
  };

  const openChat = async (user: User) => {
    try {
      // 🔹 Create or get conversation
      const res = await api.post("/api/v1/chat/conversation", {
        user_id: user.id, // backend handles role internally
      });

      const conversationId = res.data.conversation_id;

      router.push({
        pathname: "/(promoter)/(Chat)/chat",
        params: {
          conversationId: conversationId.toString(),
          name: user.name,
        },
      });
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={users}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.row}
            onPress={() => {
              console.log("ROW CLICKED", item.id);
              openChat(item);
            }}
          >
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{item.name[0]}</Text>
            </View>
            <View>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.email}>{item.email}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );

}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  row: {
    flexDirection: "row",
    padding: 14,
    borderBottomWidth: 1,
    borderColor: "#eee",
    alignItems: "center",
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#4f46e5",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  avatarText: { color: "#fff", fontWeight: "600" },
  name: { fontSize: 16, fontWeight: "500" },
  email: { fontSize: 13, color: "#6b7280" },
});