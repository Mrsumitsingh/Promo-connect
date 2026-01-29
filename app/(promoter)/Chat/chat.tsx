import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  FlatList,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

type TabType = "active" | "unread" | "completed";

interface ChatItem {
  id: string;
  brandName: string;
  lastMessage: string;
  unreadCount?: number;
  timestamp?: string;
}

// Define props type for navigation
interface ChatScreenProps {
  navigation: {
    navigate: (screen: string, params?: any) => void;
    goBack: () => void;
  };
}

const TABS: { label: string; value: TabType }[] = [
  { label: "Active", value: "active" },
  { label: "Unread", value: "unread" },
  { label: "Completed", value: "completed" },
];

const ChatScreen: React.FC<ChatScreenProps> = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState<TabType>("active");
  const [search, setSearch] = useState("");

  // 🔌 Replace this later with API data
  const chats: ChatItem[] = [
    // Sample data for preview
    {
      id: "1",
      brandName: "Nike",
      lastMessage: "We'd love to collaborate on your next campaign!",
      unreadCount: 3,
      timestamp: "10:30 AM",
    },
    {
      id: "2",
      brandName: "Apple",
      lastMessage: "Please review the contract details",
      unreadCount: 1,
      timestamp: "Yesterday",
    },
    {
      id: "3",
      brandName: "Starbucks",
      lastMessage: "Campaign performance is exceeding expectations",
      timestamp: "2 days ago",
    },
    {
      id: "4",
      brandName: "Adidas",
      lastMessage: "Let's schedule a follow-up meeting",
      timestamp: "3 days ago",
    },
    {
      id: "5",
      brandName: "Coca-Cola",
      lastMessage: "New campaign proposal ready for review",
      unreadCount: 2,
      timestamp: "Just now",
    },
  ];

  const handleChatPress = (chat: ChatItem) => {
    // Navigate to individual chat screen
    navigation.navigate("IndividualChat", {
      chatId: chat.id,
      brandName: chat.brandName,
      // You can pass more data if needed
    });
  };

  const handleNewChat = () => {
    navigation.navigate("NewChat");
  };

  const renderTab = (tab: typeof TABS[number]) => {
    const isActive = activeTab === tab.value;

    return (
      <TouchableOpacity
        key={tab.value}
        style={[styles.tab, isActive && styles.activeTab]}
        onPress={() => setActiveTab(tab.value)}
        activeOpacity={0.7}
      >
        <Text style={[styles.tabText, isActive && styles.activeTabText]}>
          {tab.label}
        </Text>
        {tab.value === "unread" && activeTab !== "unread" && (
          <View style={styles.tabIndicator}>
            <Text style={styles.tabIndicatorText}>
              {chats.filter(c => c.unreadCount && c.unreadCount > 0).length}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIcon}>
        <Ionicons name="chatbubbles-outline" size={64} color="#E8E8E8" />
      </View>
      <Text style={styles.emptyTitle}>No campaign chats found</Text>
      <Text style={styles.emptySubtitle}>
        There are no campaign chats in this category yet
      </Text>
      <TouchableOpacity 
        style={styles.startChatButton}
        onPress={handleNewChat}
      >
        <Ionicons name="add" size={20} color="#fff" />
        <Text style={styles.startChatText}>Start New Chat</Text>
      </TouchableOpacity>
    </View>
  );

  const renderChatItem = ({ item }: { item: ChatItem }) => (
    <TouchableOpacity 
      style={styles.chatItem} 
      activeOpacity={0.8}
      onPress={() => handleChatPress(item)}
    >
      <View style={styles.chatAvatar}>
        <Text style={styles.avatarText}>
          {item.brandName.charAt(0).toUpperCase()}
        </Text>
      </View>
      
      <View style={styles.chatContent}>
        <View style={styles.chatHeader}>
          <Text style={styles.brandName}>{item.brandName}</Text>
          <Text style={styles.timestamp}>{item.timestamp}</Text>
        </View>
        
        <Text style={styles.lastMessage} numberOfLines={1}>
          {item.lastMessage}
        </Text>
      </View>

      {item.unreadCount ? (
        <View style={styles.unreadBadge}>
          <Text style={styles.unreadText}>{item.unreadCount}</Text>
        </View>
      ) : (
        <Ionicons name="checkmark-done" size={16} color="#999" />
      )}
    </TouchableOpacity>
  );

  const filteredChats = chats.filter(chat => {
    if (search.trim()) {
      return chat.brandName.toLowerCase().includes(search.toLowerCase()) ||
             chat.lastMessage.toLowerCase().includes(search.toLowerCase());
    }
    
    switch (activeTab) {
      case "unread":
        return chat.unreadCount && chat.unreadCount > 0;
      case "completed":
        // This would be based on actual completed status from your data
        return !chat.unreadCount;
      case "active":
      default:
        return true;
    }
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Campaign Chats</Text>
        <TouchableOpacity 
          style={styles.headerButton} 
          onPress={handleNewChat}
          activeOpacity={0.7}
        >
          <Ionicons name="add-circle" size={24} color="#6A5ACD" />
        </TouchableOpacity>
      </View>

      {/* Search + Filter */}
      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={20} color="#999" />
          <TextInput
            placeholder="Search for brands or messages..."
            value={search}
            onChangeText={setSearch}
            style={styles.searchInput}
            placeholderTextColor="#999"
            clearButtonMode="while-editing"
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch("")}>
              <Ionicons name="close-circle" size={18} color="#999" />
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity style={styles.filterButton} activeOpacity={0.7}>
          <Ionicons name="filter-outline" size={22} color="#6A5ACD" />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        {TABS.map(renderTab)}
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <Text style={styles.statsText}>
          {filteredChats.length} chats • {chats.filter(c => c.unreadCount && c.unreadCount > 0).length} unread
        </Text>
      </View>

      {/* Chat List */}
      <FlatList
        data={filteredChats}
        keyExtractor={(item) => item.id}
        renderItem={renderChatItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1A1A1A",
  },
  
  headerButton: {
    padding: 4,
  },
  
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    backgroundColor: "#fff",
  },
  
  searchBox: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F2F2F7",
    paddingHorizontal: 16,
    borderRadius: 12,
    height: 48,
    borderWidth: 1,
    borderColor: "#E5E5EA",
  },
  
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: "#1A1A1A",
    paddingVertical: 0,
  },
  
  filterButton: {
    marginLeft: 12,
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#F2F2F7",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E5E5EA",
  },
  
  tabsContainer: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginVertical: 12,
    backgroundColor: "#F2F2F7",
    borderRadius: 14,
    padding: 4,
  },
  
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  
  activeTab: {
    backgroundColor: "#6A5ACD",
    shadowColor: "#6A5ACD",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  
  tabText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "600",
  },
  
  activeTabText: {
    color: "#fff",
    fontWeight: "700",
  },
  
  tabIndicator: {
    backgroundColor: "#FF3B30",
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 6,
  },
  
  tabIndicatorText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "700",
  },
  
  statsContainer: {
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  
  statsText: {
    fontSize: 13,
    color: "#8E8E93",
    fontWeight: "500",
  },
  
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 20,
    flexGrow: 1,
  },
  
  chatItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 12,
    backgroundColor: "#fff",
    borderRadius: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  
  chatAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#6A5ACD",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  
  avatarText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
  
  chatContent: {
    flex: 1,
  },
  
  chatHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  
  brandName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1A1A1A",
  },
  
  timestamp: {
    fontSize: 12,
    color: "#8E8E93",
    fontWeight: "500",
  },
  
  lastMessage: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
  
  unreadBadge: {
    backgroundColor: "#FF3B30",
    minWidth: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
  
  unreadText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
  },
  
  separator: {
    height: 1,
    backgroundColor: "#F0F0F0",
    marginHorizontal: 12,
  },
  
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
    paddingTop: 60,
  },
  
  emptyIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#F8F9FA",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1A1A1A",
    textAlign: "center",
    marginBottom: 8,
  },
  
  emptySubtitle: {
    fontSize: 15,
    color: "#8E8E93",
    textAlign: "center",
    lineHeight: 22,
  },
  
  startChatButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#6A5ACD",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 24,
    gap: 8,
  },
  
  startChatText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default ChatScreen;