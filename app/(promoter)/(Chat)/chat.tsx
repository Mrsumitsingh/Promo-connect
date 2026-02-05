//chat.tsx
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StatusBar,
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
  created_at?: string;
  sender?: {
    name: string;
    avatar?: string;
  };
  _tempId?: number; // For optimistic updates
};

export default function ChatScreen() {
  const { conversationId, name } = useLocalSearchParams<{
    conversationId: string;
    name: string;
  }>();

  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [usePolling, setUsePolling] = useState(false);
  
  const echoRef = useRef<any>(null);
  const flatListRef = useRef<FlatList<Message>>(null);
  const pollingIntervalRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 🔹 Get current user ID from AsyncStorage
  useEffect(() => {
    const getCurrentUserId = async () => {
      try {
        // Try to get from AsyncStorage first
        const userId = await AsyncStorage.getItem("userId");
        if (userId) {
          setCurrentUserId(parseInt(userId));
          console.log("👤 Current user ID from storage:", userId);
          return;
        }
        
        // If not in storage, try to fetch from API
        const userResponse = await api.get("/api/user");
        if (userResponse.data?.id) {
          const userId = userResponse.data.id;
          setCurrentUserId(userId);
          await AsyncStorage.setItem("userId", userId.toString());
          console.log("👤 Current user ID from API:", userId);
        } else {
          console.warn("⚠️ Could not determine current user ID");
          // Fallback to a default or show error
        }
      } catch (error) {
        console.error("❌ Failed to get user ID:", error);
        // You might want to redirect to login here
      }
    };
    
    getCurrentUserId();
  }, []);

  // 🔹 Load messages when user ID is available
  useEffect(() => {
    if (currentUserId !== null) {
      loadMessages();
      initEcho();
    }

    return () => {
      // Cleanup WebSocket
      if (echoRef.current) {
        echoRef.current.leave(`chat.${conversationId}`);
        echoRef.current.disconnect();
      }
      // Cleanup polling
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [currentUserId]);

  // 🔹 Setup polling if WebSocket fails
  useEffect(() => {
    if (usePolling && !pollingIntervalRef.current) {
      console.log("🔄 Starting polling fallback...");
      pollingIntervalRef.current = setInterval(() => {
        loadMessages();
      }, 3000); // Poll every 3 seconds
      
      return () => {
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
          pollingIntervalRef.current = null;
        }
      };
    } else if (!usePolling && pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
  }, [usePolling]);

  // 🔹 Auto-scroll to bottom
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const loadMessages = async () => {
    try {
      const res = await api.get(`/api/v1/chat/${conversationId}`);
      console.log("📥 Loaded", res.data.length, "messages");
      setMessages(res.data);
    } catch (error) {
      console.error("❌ Failed to load messages:", error);
      Alert.alert("Error", "Failed to load messages. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Initialize WebSocket with fallback
  const initEcho = async () => {
    try {
      console.log("🔄 Initializing WebSocket connection...");
      const echo = await echoClient();
      
      if (!echo) {
        console.warn("⚠️ Echo client is null, using polling");
        setUsePolling(true);
        return;
      }
      
      echoRef.current = echo;

      const channelName = `chat.${conversationId}`;
      console.log(`📡 Subscribing to: ${channelName}`);

      // Try private channel first
      const channel = echo.private(channelName);
      
      channel
        .listen("MessageSent", (e: any) => {
          console.log("📨 Message received via WebSocket:", e.message);
          handleIncomingMessage(e.message);
        })
        .listen('subscription_succeeded', () => {
          console.log("✅ WebSocket subscription succeeded");
          setIsConnected(true);
          setUsePolling(false);
        })
        .listen('subscription_error', (error: any) => {
          console.error("❌ WebSocket subscription error:", error);
          setUsePolling(true);
        });

      // Connection status listeners
      echo.connector.pusher.connection.bind('connected', () => {
        console.log("✅ WebSocket connected");
        setIsConnected(true);
        setUsePolling(false);
      });

      echo.connector.pusher.connection.bind('disconnected', () => {
        console.log("❌ WebSocket disconnected");
        setIsConnected(false);
        setUsePolling(true);
      });

    } catch (error) {
      console.error("❌ Failed to initialize WebSocket:", error);
      setUsePolling(true);
    }
  };

  const handleIncomingMessage = (newMessage: Message) => {
    setMessages(prev => {
      // Check if this message already exists
      const exists = prev.some(msg => msg.id === newMessage.id);
      if (exists) return prev;
      
      // Check if it replaces a temporary message
      const tempMessageIndex = prev.findIndex(
        msg => msg._tempId && msg.message === newMessage.message
      );
      
      if (tempMessageIndex !== -1) {
        // Replace temporary message
        const updated = [...prev];
        updated[tempMessageIndex] = newMessage;
        return updated;
      }
      
      // Add new message
      return [...prev, newMessage];
    });
  };

  const sendMessage = async () => {
    if (!text.trim() || sending || !currentUserId) return;

    // Create optimistic message with negative ID
    const tempId = Date.now();
    const tempMessage: Message = {
      id: -tempId, // Negative ID for temporary messages
      message: text.trim(),
      sender_id: currentUserId,
      created_at: new Date().toISOString(),
      sender: { name: "You" },
      _tempId: tempId,
    };

    // Add optimistic update
    setMessages(prev => [...prev, tempMessage]);
    const messageToSend = text.trim();
    setText("");
    setSending(true);

    try {
      const response = await api.post("/api/v1/chat/send", {
        conversation_id: conversationId,
        message: messageToSend,
      });

      console.log("📤 Message sent successfully:", response.data);

      // If API returns the created message, update it
      if (response.data.message) {
        handleIncomingMessage(response.data.message);
      }

    } catch (error: any) {
      console.error("❌ Failed to send message:", error);
      
      // Remove the optimistic message on error
      setMessages(prev => prev.filter(msg => msg._tempId !== tempId));
      
      // Restore the text
      setText(messageToSend);
      
      // Show error to user
      Alert.alert(
        "Send Failed",
        error.response?.data?.message || "Failed to send message. Please try again.",
        [{ text: "OK" }]
      );
    } finally {
      setSending(false);
    }
  };

  const formatTime = (dateString?: string) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      });
    } catch (error) {
      return "";
    }
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isMe = currentUserId ? item.sender_id === currentUserId : false;
    const isTemp = item.id < 0; // Negative IDs are temporary

    return (
      <View style={[
        styles.messageContainer,
        isMe ? styles.myMessageContainer : styles.otherMessageContainer
      ]}>
        {!isMe && item.sender && (
          <View style={styles.senderInfo}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {item.sender?.name?.charAt(0).toUpperCase() || "U"}
              </Text>
            </View>
            <Text style={styles.senderName}>
              {item.sender?.name || "User"}
            </Text>
          </View>
        )}
        
        <View style={[
          styles.messageBubble,
          isMe ? styles.myMessageBubble : styles.otherMessageBubble,
          isTemp && styles.tempMessageBubble
        ]}>
          <Text style={[
            styles.messageText,
            isMe ? styles.myMessageText : styles.otherMessageText
          ]}>
            {item.message}
          </Text>
          
          <View style={styles.messageFooter}>
            {item.created_at && (
              <Text style={[
                styles.messageTime,
                isMe ? styles.myMessageTime : styles.otherMessageTime
              ]}>
                {formatTime(item.created_at)}
              </Text>
            )}
            {isTemp && (
              <ActivityIndicator size="small" color={isMe ? "#e0e7ff" : "#6b7280"} style={styles.sendingIndicator} />
            )}
          </View>
        </View>
      </View>
    );
  };

  const renderHeaderRight = () => {
    return (
      <View style={styles.headerRight}>
        <View style={[
          styles.connectionIndicator,
          isConnected ? styles.connected : styles.disconnected
        ]}>
          <Text style={styles.connectionIndicatorText}>
            {isConnected ? "● Live" : "○ Polling"}
          </Text>
        </View>
        <TouchableOpacity style={styles.headerButton}>
          <Ionicons name="information-circle-outline" size={24} color="#4f46e5" />
        </TouchableOpacity>
      </View>
    );
  };

  const renderListHeader = () => {
    if (!loading && messages.length > 0) {
      return (
        <View style={styles.messageCountContainer}>
          <Text style={styles.messageCountText}>
            {messages.length} message{messages.length !== 1 ? 's' : ''}
          </Text>
        </View>
      );
    }
    return null;
  };

  if (loading && messages.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4f46e5" />
        <Text style={styles.loadingText}>Loading messages...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.conversationInfo}>
              <View style={styles.headerAvatar}>
                <Text style={styles.headerAvatarText}>
                  {name?.charAt(0).toUpperCase() || "C"}
                </Text>
              </View>
              <View>
                <Text style={styles.conversationName}>{name || "Chat"}</Text>
                <Text style={styles.participantCount}>
                  {currentUserId ? `You (ID: ${currentUserId})` : "Loading..."}
                </Text>
              </View>
            </View>
            {renderHeaderRight()}
          </View>
        </View>

        {/* Messages List */}
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => `${item.id}-${item._tempId || ''}`}
          renderItem={renderMessage}
          contentContainerStyle={styles.messagesList}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="chatbubble-ellipses-outline" size={64} color="#d1d5db" />
              <Text style={styles.emptyText}>No messages yet</Text>
              <Text style={styles.emptySubText}>Start the conversation!</Text>
            </View>
          }
          ListHeaderComponent={renderListHeader}
        />

        {/* Input Area */}
        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <TextInput
              value={text}
              onChangeText={setText}
              placeholder="Type a message..."
              style={styles.input}
              multiline
              maxLength={500}
              placeholderTextColor="#9ca3af"
              onSubmitEditing={sendMessage}
              returnKeyType="send"
              editable={!sending && currentUserId !== null}
            />
            <TouchableOpacity
              onPress={sendMessage}
              style={[
                styles.sendButton, 
                (!text.trim() || sending || currentUserId === null) && styles.sendButtonDisabled
              ]}
              disabled={!text.trim() || sending || currentUserId === null}
            >
              {sending ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Ionicons name="send" size={20} color="#fff" />
              )}
            </TouchableOpacity>
          </View>
          <View style={styles.inputFooter}>
            <Text style={styles.charCount}>
              {text.length}/500
            </Text>
            {currentUserId === null && (
              <Text style={styles.authWarning}>
                Sign in to send messages
              </Text>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8fafc",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#6b7280",
  },
  header: {
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  connectionIndicator: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  connected: {
    backgroundColor: "#dcfce7",
  },
  disconnected: {
    backgroundColor: "#fef3c7",
  },
  connectionIndicatorText: {
    fontSize: 11,
    fontWeight: "600",
  },
  conversationInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#4f46e5",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  headerAvatarText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  conversationName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
  },
  participantCount: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 2,
  },
  headerButton: {
    padding: 4,
  },
  messagesList: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexGrow: 1,
  },
  messageCountContainer: {
    alignItems: "center",
    marginBottom: 16,
    paddingVertical: 8,
  },
  messageCountText: {
    fontSize: 12,
    color: "#6b7280",
    backgroundColor: "#e5e7eb",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#374151",
    marginTop: 16,
  },
  emptySubText: {
    fontSize: 14,
    color: "#9ca3af",
    marginTop: 4,
  },
  messageContainer: {
    marginVertical: 4,
    maxWidth: "80%",
  },
  myMessageContainer: {
    alignSelf: "flex-end",
  },
  otherMessageContainer: {
    alignSelf: "flex-start",
  },
  senderInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
    marginLeft: 4,
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#9ca3af",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  avatarText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  senderName: {
    fontSize: 12,
    color: "#6b7280",
    fontWeight: "500",
  },
  messageBubble: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  myMessageBubble: {
    backgroundColor: "#4f46e5",
    borderBottomRightRadius: 4,
  },
  otherMessageBubble: {
    backgroundColor: "#fff",
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  tempMessageBubble: {
    opacity: 0.8,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  myMessageText: {
    color: "#fff",
  },
  otherMessageText: {
    color: "#111827",
  },
  messageFooter: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    marginTop: 4,
  },
  messageTime: {
    fontSize: 11,
    opacity: 0.8,
  },
  myMessageTime: {
    color: "#e0e7ff",
  },
  otherMessageTime: {
    color: "#6b7280",
  },
  sendingIndicator: {
    marginLeft: 6,
  },
  inputContainer: {
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 34 : 24,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "flex-end",
  },
  input: {
    flex: 1,
    backgroundColor: "#f3f4f6",
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingVertical: 12,
    fontSize: 16,
    maxHeight: 120,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    marginRight: 12,
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#4f46e5",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#4f46e5",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  sendButtonDisabled: {
    backgroundColor: "#9ca3af",
    shadowOpacity: 0,
    elevation: 0,
  },
  inputFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  charCount: {
    fontSize: 12,
    color: "#9ca3af",
  },
  authWarning: {
    fontSize: 12,
    color: "#ef4444",
    fontStyle: "italic",
  },
});