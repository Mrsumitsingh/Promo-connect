import axios from "axios";
import { useLocalSearchParams } from "expo-router";
import { useState } from "react";
import {
    FlatList,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import api from "../../../lib/api";

type Message = {
  id: number;
  message: string;
  sender: "me" | "other";
};

export default function ChatScreen() {
  const { userId = "", name = "Chat" } = useLocalSearchParams<{
    userId?: string;
    name?: string;
  }>();

  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");

  const sendMessage = async () => {
    if (!text.trim()) return;

    const temp: Message = {
      id: Date.now(),
      message: text,
      sender: "me",
    };

    setMessages((prev) => [...prev, temp]);
    setText("");

    try {
      await api.post("/api/v1/chat/send", {
        receiver_id: Number(userId),
        message: temp.message,
      });
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.log(error.response?.data || error.message);
      }
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View
            style={[
              styles.msg,
              item.sender === "me" ? styles.me : styles.other,
            ]}
          >
            <Text style={{ color: "#fff" }}>{item.message}</Text>
          </View>
        )}
      />

      <View style={styles.inputRow}>
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder="Type message..."
          style={styles.input}
        />
        <TouchableOpacity style={styles.sendBtn} onPress={sendMessage}>
          <Text style={{ color: "#fff" }}>Send</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f2f2f2" },
  msg: {
    margin: 6,
    padding: 10,
    borderRadius: 8,
    maxWidth: "75%",
  },
  me: { alignSelf: "flex-end", backgroundColor: "#4f46e5" },
  other: { alignSelf: "flex-start", backgroundColor: "#6b7280" },
  inputRow: {
    flexDirection: "row",
    padding: 8,
    backgroundColor: "#fff",
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 20,
    paddingHorizontal: 14,
  },
  sendBtn: {
    marginLeft: 8,
    backgroundColor: "#4f46e5",
    borderRadius: 20,
    paddingHorizontal: 16,
    justifyContent: "center",
  },
});
