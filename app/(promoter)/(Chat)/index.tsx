import axios from "axios";
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
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.log(error.response?.data || error.message);
      }
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
            onPress={() =>
              router.push({
                pathname: "/(promoter)/(Chat)/chat",
                params: {
                  userId: item.id.toString(),
                  name: item.name,
                },
              })
            }
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
