//chat.tsx
import { useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import api from "../../../lib/api";
import echoClient from "../../../lib/echo";

type Message = {
  id: number;
  message: string;
  sender_id: number;
};


export default function ChatScreen() {
  const { conversationId, name } = useLocalSearchParams<{
    conversationId: string;
    name: string;
  }>();


  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const echoRef = useRef<any>(null);

  // 🔹 Load old messages
  useEffect(() => {
    loadMessages();
    initEcho();

    return () => {
      if (echoRef.current) {
        echoRef.current.leave(`chat.${conversationId}`);
      }
    };
  }, []);

  const loadMessages = async () => {
    const res = await api.get(`/api/v1/chat/${conversationId}`);
    setMessages(res.data);
  };

  // 🔹 Listen realtime
  const initEcho = async () => {
    const echo = await echoClient();
    echoRef.current = echo;

    echo.private(`chat.${conversationId}`)
      .listen("MessageSent", (e: any) => {
        setMessages((prev) => [...prev, e.message]);
      });
  };

  const sendMessage = async () => {
    if (!text.trim()) return;

    const temp = {
      id: Date.now(),
      message: text,
      sender_id: 0,
    };

    setMessages((prev) => [...prev, temp]);
    setText("");

    try {
      await api.post("/api/v1/chat/send", {
        conversation_id: conversationId,
        message: text,
      });
    } catch (e) {
      console.log(e);
    }
  };



  return (
    <View style={styles.container}>
      {/* <Text style={styles.header}>{name}</Text> */}

      <FlatList
        data={messages}
        keyExtractor={(i) => i.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.msg}>
            <Text>{item.message}</Text>
          </View>
        )}
      />

      <View style={styles.inputRow}>
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder="Type..."
          style={styles.input}
        />
        <TouchableOpacity onPress={sendMessage} style={styles.sendBtn}>
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