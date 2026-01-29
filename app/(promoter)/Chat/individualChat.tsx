import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";

// Message type definition
type MessageType = "sent" | "received";

interface Message {
  id: string;
  text: string;
  type: MessageType;
  timestamp: string;
  senderName?: string;
  isRead?: boolean;
}

interface Attachment {
  id: string;
  type: "image" | "document" | "video";
  uri: string;
  name: string;
  size?: string;
}

// Props for the individual chat screen
interface IndividualChatScreenProps {
  navigation: {
    navigate: (screen: string, params?: any) => void;
    goBack: () => void;
  };
  route: {
    params: {
      chatId: string;
      brandName: string;
    };
  };
}

const IndividualChatScreen: React.FC<IndividualChatScreenProps> = ({ route, navigation }) => {
  const { chatId, brandName } = route.params;
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Hello! We'd love to collaborate on your next campaign.",
      type: "received",
      timestamp: "10:30 AM",
      senderName: brandName,
    },
    {
      id: "2",
      text: "Hi! That sounds great. What kind of partnership are you thinking?",
      type: "sent",
      timestamp: "10:32 AM",
      isRead: true,
    },
    {
      id: "3",
      text: "We're looking for influencers to promote our new product line. We can offer competitive rates and exclusive products.",
      type: "received",
      timestamp: "10:35 AM",
      senderName: brandName,
    },
    {
      id: "4",
      text: "Interesting! Can you share more details about the product and campaign timeline?",
      type: "sent",
      timestamp: "10:38 AM",
      isRead: true,
    },
    {
      id: "5",
      text: "Absolutely. I'll send over the campaign brief and product details. The campaign would run for 4 weeks starting next month.",
      type: "received",
      timestamp: "10:40 AM",
      senderName: brandName,
    },
    {
      id: "6",
      text: "Perfect. Looking forward to reviewing the details. When can you share the brief?",
      type: "sent",
      timestamp: "10:42 AM",
      isRead: true,
    },
  ]);
  
  const [attachments, setAttachments] = useState<Attachment[]>([
    {
      id: "1",
      type: "document",
      uri: "campaign_brief.pdf",
      name: "Campaign Brief.pdf",
      size: "2.4 MB",
    },
    {
      id: "2",
      type: "image",
      uri: "product_preview.jpg",
      name: "Product Preview.jpg",
      size: "1.2 MB",
    },
  ]);
  
  const [isTyping, setIsTyping] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  // Simulate typing indicator
  useEffect(() => {
    const typingInterval = setInterval(() => {
      setIsTyping((prev) => !prev);
    }, 2000);

    return () => clearInterval(typingInterval);
  }, []);

  // Scroll to bottom when new messages are added
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const handleSendMessage = () => {
    if (message.trim() === "") return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text: message,
      type: "sent",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isRead: false,
    };

    setMessages([...messages, newMessage]);
    setMessage("");
    Keyboard.dismiss();

    // Simulate auto-reply after 2 seconds
    setTimeout(() => {
      const autoReply: Message = {
        id: (Date.now() + 1).toString(),
        text: "Thanks for your message! We'll get back to you shortly.",
        type: "received",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        senderName: brandName,
      };
      setMessages(prev => [...prev, autoReply]);
    }, 2000);
  };

  const handleAttachment = () => {
    Alert.alert(
      "Add Attachment",
      "Choose attachment type",
      [
        {
          text: "Image",
          onPress: () => console.log("Image attachment"),
        },
        {
          text: "Document",
          onPress: () => console.log("Document attachment"),
        },
        {
          text: "Cancel",
          style: "cancel",
        },
      ]
    );
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <View style={[
      styles.messageContainer,
      item.type === "sent" ? styles.sentMessage : styles.receivedMessage
    ]}>
      {item.type === "received" && (
        <Text style={styles.senderName}>{item.senderName || brandName}</Text>
      )}
      <View style={[
        styles.messageBubble,
        item.type === "sent" ? styles.sentBubble : styles.receivedBubble
      ]}>
        <Text style={[
          styles.messageText,
          item.type === "sent" ? styles.sentText : styles.receivedText
        ]}>
          {item.text}
        </Text>
      </View>
      <View style={styles.messageFooter}>
        <Text style={styles.timestamp}>{item.timestamp}</Text>
        {item.type === "sent" && (
          <Ionicons
            name={item.isRead ? "checkmark-done" : "checkmark"}
            size={14}
            color={item.isRead ? "#6A5ACD" : "#999"}
            style={styles.readIndicator}
          />
        )}
      </View>
    </View>
  );

  const renderAttachment = ({ item }: { item: Attachment }) => (
    <TouchableOpacity style={styles.attachmentItem}>
      <View style={styles.attachmentIcon}>
        <Ionicons
          name={
            item.type === "image" ? "image" :
            item.type === "video" ? "videocam" : "document"
          }
          size={24}
          color="#6A5ACD"
        />
      </View>
      <View style={styles.attachmentInfo}>
        <Text style={styles.attachmentName} numberOfLines={1}>
          {item.name}
        </Text>
        {item.size && (
          <Text style={styles.attachmentSize}>{item.size}</Text>
        )}
      </View>
      <TouchableOpacity style={styles.downloadButton}>
        <Ionicons name="download-outline" size={20} color="#6A5ACD" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const handleMoreOptions = () => {
    Alert.alert(
      "Chat Options",
      "Choose an option",
      [
        {
          text: "View Brand Profile",
          onPress: () => navigation.navigate("BrandProfile", { brandName }),
        },
        {
          text: "Clear Chat",
          style: "destructive",
          onPress: () => {
            Alert.alert(
              "Clear Chat",
              "Are you sure you want to clear all messages?",
              [
                { text: "Cancel", style: "cancel" },
                { 
                  text: "Clear", 
                  style: "destructive",
                  onPress: () => setMessages([])
                },
              ]
            );
          },
        },
        {
          text: "Report Issue",
          onPress: () => console.log("Report issue"),
        },
        {
          text: "Cancel",
          style: "cancel",
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* Chat Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        
        <View style={styles.brandInfo}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {brandName?.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={styles.brandDetails}>
            <Text style={styles.brandName} numberOfLines={1}>
              {brandName}
            </Text>
            <Text style={styles.brandStatus}>
              {isTyping ? "Typing..." : "Online • Campaign Partner"}
            </Text>
          </View>
        </View>
        
        <View style={styles.headerButtons}>
          <TouchableOpacity 
            style={styles.headerIconButton}
            onPress={() => console.log("Video call")}
          >
            <Ionicons name="videocam-outline" size={22} color="#6A5ACD" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.headerIconButton}
            onPress={handleMoreOptions}
          >
            <Ionicons name="ellipsis-vertical" size={20} color="#1A1A1A" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Attachments Section */}
      {attachments.length > 0 && (
        <View style={styles.attachmentsContainer}>
          <Text style={styles.attachmentsTitle}>Attachments</Text>
          <FlatList
            data={attachments}
            renderItem={renderAttachment}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.attachmentsList}
          />
        </View>
      )}

      {/* Messages List */}
      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messagesList}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          ListHeaderComponent={
            <Text style={styles.chatDate}>Today</Text>
          }
          ListEmptyComponent={
            <View style={styles.emptyChat}>
              <Ionicons name="chatbubbles-outline" size={64} color="#E8E8E8" />
              <Text style={styles.emptyChatTitle}>Start Conversation</Text>
              <Text style={styles.emptyChatSubtitle}>
                Send your first message to {brandName}
              </Text>
            </View>
          }
        />

        {/* Message Input */}
        <View style={styles.inputContainer}>
          <TouchableOpacity 
            style={styles.attachmentButton}
            onPress={handleAttachment}
          >
            <Ionicons name="add-circle-outline" size={28} color="#6A5ACD" />
          </TouchableOpacity>
          
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.textInput}
              value={message}
              onChangeText={setMessage}
              placeholder="Type your message..."
              placeholderTextColor="#999"
              multiline
              maxLength={1000}
            />
            <TouchableOpacity 
              style={styles.emojiButton}
              onPress={() => console.log("Emoji picker")}
            >
              <Ionicons name="happy-outline" size={22} color="#999" />
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity 
            style={[styles.sendButton, !message.trim() && styles.sendButtonDisabled]}
            onPress={handleSendMessage}
            disabled={!message.trim()}
          >
            <Ionicons 
              name="send" 
              size={20} 
              color={message.trim() ? "#fff" : "#999"} 
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity style={styles.quickAction}>
          <Ionicons name="calendar-outline" size={18} color="#6A5ACD" />
          <Text style={styles.quickActionText}>Schedule</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickAction}>
          <Ionicons name="document-text-outline" size={18} color="#6A5ACD" />
          <Text style={styles.quickActionText}>Contract</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickAction}>
          <Ionicons name="stats-chart-outline" size={18} color="#6A5ACD" />
          <Text style={styles.quickActionText}>Analytics</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickAction}>
          <Ionicons name="wallet-outline" size={18} color="#6A5ACD" />
          <Text style={styles.quickActionText}>Budget</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  
  backButton: {
    padding: 4,
  },
  
  brandInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 12,
  },
  
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#6A5ACD",
    alignItems: "center",
    justifyContent: "center",
  },
  
  avatarText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
  
  brandDetails: {
    marginLeft: 12,
    flex: 1,
  },
  
  brandName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1A1A1A",
  },
  
  brandStatus: {
    fontSize: 12,
    color: "#34C759",
    fontWeight: "500",
    marginTop: 2,
  },
  
  headerButtons: {
    flexDirection: "row",
    alignItems: "center",
  },
  
  headerIconButton: {
    padding: 8,
    marginLeft: 8,
  },
  
  attachmentsContainer: {
    backgroundColor: "#fff",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  
  attachmentsTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#8E8E93",
    marginLeft: 16,
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  
  attachmentsList: {
    paddingHorizontal: 16,
  },
  
  attachmentItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F2F2F7",
    padding: 12,
    borderRadius: 12,
    marginRight: 12,
    minWidth: 200,
  },
  
  attachmentIcon: {
    marginRight: 12,
  },
  
  attachmentInfo: {
    flex: 1,
  },
  
  attachmentName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1A1A1A",
    marginBottom: 2,
  },
  
  attachmentSize: {
    fontSize: 12,
    color: "#8E8E93",
  },
  
  downloadButton: {
    padding: 4,
  },
  
  keyboardAvoid: {
    flex: 1,
  },
  
  messagesList: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingBottom: 8,
  },
  
  chatDate: {
    textAlign: "center",
    fontSize: 13,
    color: "#8E8E93",
    backgroundColor: "#F2F2F7",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "center",
    marginBottom: 16,
    fontWeight: "500",
  },
  
  messageContainer: {
    marginBottom: 16,
    maxWidth: "85%",
  },
  
  sentMessage: {
    alignSelf: "flex-end",
  },
  
  receivedMessage: {
    alignSelf: "flex-start",
  },
  
  senderName: {
    fontSize: 12,
    color: "#8E8E93",
    marginBottom: 4,
    fontWeight: "500",
  },
  
  messageBubble: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  
  sentBubble: {
    backgroundColor: "#6A5ACD",
    borderBottomRightRadius: 4,
  },
  
  receivedBubble: {
    backgroundColor: "#fff",
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  
  sentText: {
    color: "#fff",
  },
  
  receivedText: {
    color: "#1A1A1A",
  },
  
  messageFooter: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  
  timestamp: {
    fontSize: 11,
    color: "#8E8E93",
  },
  
  readIndicator: {
    marginLeft: 4,
  },
  
  emptyChat: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 80,
  },
  
  emptyChatTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1A1A1A",
    marginTop: 16,
    marginBottom: 8,
  },
  
  emptyChatSubtitle: {
    fontSize: 14,
    color: "#8E8E93",
    textAlign: "center",
    paddingHorizontal: 40,
  },
  
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
  },
  
  attachmentButton: {
    padding: 4,
    marginRight: 8,
  },
  
  inputWrapper: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F2F2F7",
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
    maxHeight: 100,
  },
  
  textInput: {
    flex: 1,
    fontSize: 16,
    color: "#1A1A1A",
    padding: 0,
    maxHeight: 80,
  },
  
  emojiButton: {
    padding: 4,
    marginLeft: 8,
  },
  
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#6A5ACD",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 12,
  },
  
  sendButtonDisabled: {
    backgroundColor: "#F2F2F7",
  },
  
  quickActions: {
    flexDirection: "row",
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
  },
  
  quickAction: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 8,
  },
  
  quickActionText: {
    fontSize: 11,
    color: "#6A5ACD",
    fontWeight: "500",
    marginTop: 4,
  },
});

export default IndividualChatScreen;