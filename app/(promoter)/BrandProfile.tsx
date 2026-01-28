import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";

import {
  checkFollowStatus,
  followBrand,
  getBrandCampaigns,
  getBrandProfileWithDetails,
  unfollowBrand
} from "../../lib/Explore";

/* ---------------- TYPES ---------------- */

interface BrandProfile {
  id: string;
  company_name: string;
  industry: string | null;
  basic_info: string | null;
  professional_info: string | null;
  company_size: string | null;
  gst_number: string | null;
  website: string | null;
  social_profiles: any;
  verification_docs: any;

  rating: number;
  review_count: number;
  completion_rate: number;
  brand_score: number;

  followers_count: number;
  campaigns_count: number;
  promoter_satisfaction_rate: number;

  created_at: string;
  updated_at: string;
  is_active: boolean;
}

/* ---------------- SCREEN ---------------- */

export default function BrandProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const [brand, setBrand] = useState<BrandProfile | null>(null);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [activeTab, setActiveTab] =
    useState<"instagram" | "info" | "reviews">("instagram");

  useEffect(() => {
    fetchBrand();
    fetchCampaigns();
    checkIfFollowing();
  }, [id]);

  const fetchBrand = async () => {
    try {
      setLoading(true);
      const res = await getBrandProfileWithDetails(id);
      if (res?.data?.data) setBrand(res.data.data);
    } catch {
      Alert.alert("Error", "Failed to load brand");
    } finally {
      setLoading(false);
    }
  };

  const fetchCampaigns = async () => {
    try {
      const res = await getBrandCampaigns(id);
      if (res?.data?.data) setCampaigns(res.data.data);
    } catch {}
  };

  const checkIfFollowing = async () => {
    const res = await checkFollowStatus(id);
    if (res?.data?.is_following !== undefined) {
      setIsFollowing(res.data.is_following);
    }
  };

  const handleFollowToggle = async () => {
    try {
      setFollowLoading(true);
      isFollowing ? await unfollowBrand(id) : await followBrand(id);
      setIsFollowing(!isFollowing);
    } catch {
      Alert.alert("Error", "Action failed");
    } finally {
      setFollowLoading(false);
    }
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });

  if (loading || !brand) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color="#7b6fd6" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Ionicons name="menu" size={24} color="#fff" />
        </View>

        {/* AVATAR */}
        <View style={styles.avatarWrapper}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {brand.company_name.charAt(0).toUpperCase()}
            </Text>
          </View>
        </View>

        {/* NAME */}
        <Text style={styles.name}>{brand.company_name}</Text>

        {/* LOCATION */}
        <View style={styles.location}>
          <Ionicons name="location-outline" size={14} color="#999" />
          <Text style={styles.locationText}>
            {brand.industry || "India"}
          </Text>
        </View>

        {/* STATS */}
        <View style={styles.statsCard}>
          <Stat title="Followers" value={brand.followers_count} />
          <Stat title="Engagement" value={`${brand.promoter_satisfaction_rate}%`} />
          <Stat title="Reach" value={brand.campaigns_count} />
          <Stat title="Likes" value={brand.review_count} />
        </View>

        {/* TABS */}
        <View style={styles.tabs}>
          <Tab title="Instagram" active={activeTab === "instagram"} onPress={() => setActiveTab("instagram")} />
          <Tab title="Info" active={activeTab === "info"} onPress={() => setActiveTab("info")} />
          <Tab title="Reviews" active={activeTab === "reviews"} onPress={() => setActiveTab("reviews")} />
        </View>

        {/* TAB CONTENT */}
        <View style={styles.tabContent}>

          {/* INSTAGRAM TAB */}
          {activeTab === "instagram" && (
            <>
              {brand.website && (
                <InfoRow label="Website" value={brand.website} />
              )}

              {brand.social_profiles && (
                <View style={styles.socialRow}>
                  {brand.social_profiles.instagram && <Ionicons name="logo-instagram" size={22} color="#E4405F" />}
                  {brand.social_profiles.twitter && <Ionicons name="logo-twitter" size={22} color="#1DA1F2" />}
                  {brand.social_profiles.facebook && <Ionicons name="logo-facebook" size={22} color="#1877F2" />}
                  {brand.social_profiles.linkedin && <Ionicons name="logo-linkedin" size={22} color="#0077B5" />}
                </View>
              )}
            </>
          )}

          {/* INFO TAB */}
          {activeTab === "info" && (
            <>
              {brand.basic_info && <InfoRow label="About" value={brand.basic_info} />}
              {brand.professional_info && <InfoRow label="Professional Info" value={brand.professional_info} />}
              {brand.company_size && <InfoRow label="Company Size" value={brand.company_size} />}
              {brand.gst_number && <InfoRow label="GST" value={brand.gst_number} />}

              {brand.verification_docs && (
                <View style={styles.badge}>
                  <Ionicons name="checkmark-circle" size={18} color="#4CAF50" />
                  <Text style={styles.badgeText}>Verified Brand</Text>
                </View>
              )}

              <InfoRow label="Member Since" value={formatDate(brand.created_at)} />
              <InfoRow label="Last Updated" value={formatDate(brand.updated_at)} />
              <InfoRow label="Status" value={brand.is_active ? "Active" : "Inactive"} />
            </>
          )}

          {/* REVIEWS TAB */}
          {activeTab === "reviews" && (
            <>
              <InfoRow label="Rating" value={`${brand.rating} ⭐`} />
              <InfoRow label="Reviews" value={brand.review_count} />
              <InfoRow label="Completion Rate" value={`${brand.completion_rate}%`} />
              <InfoRow label="Brand Score" value={brand.brand_score} />

              {campaigns.length > 0 && (
                <>
                  <Text style={styles.sectionTitle}>Recent Campaigns</Text>
                  {campaigns.slice(0, 3).map((c, i) => (
                    <View key={i} style={styles.campaignItem}>
                      <Text style={styles.campaignTitle}>{c.title}</Text>
                      <Text style={styles.campaignType}>{c.type}</Text>
                    </View>
                  ))}
                </>
              )}
            </>
          )}
        </View>
      </ScrollView>

      {/* ACTION BAR */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.followBtn, isFollowing && styles.followingBtn]}
          onPress={handleFollowToggle}
        >
          {followLoading ? (
            <ActivityIndicator color={isFollowing ? "#7b6fd6" : "#fff"} />
          ) : (
            <Text style={[styles.followText, isFollowing && styles.followingText]}>
              {isFollowing ? "Following" : "Follow"}
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.messageBtn}>
          <Ionicons name="chatbubble-outline" size={20} color="#7b6fd6" />
          <Text style={styles.messageText}>Message</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

/* ---------------- SMALL COMPONENTS ---------------- */

const Stat = ({ title, value }: any) => (
  <View style={styles.stat}>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statTitle}>{title}</Text>
  </View>
);

const Tab = ({ title, active, onPress }: any) => (
  <TouchableOpacity onPress={onPress}>
    <Text style={[styles.tab, active && styles.activeTab]}>{title}</Text>
  </TouchableOpacity>
);

const InfoRow = ({ label, value }: any) => (
  <View style={styles.infoRow}>
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={styles.infoValue}>{value}</Text>
  </View>
);

/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },

  header: {
    height: 180,
    backgroundColor: "#7b6fd6",
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    paddingHorizontal: 20,
    paddingTop: 20,
    flexDirection: "row",
    justifyContent: "space-between"
  },

  avatarWrapper: { alignItems: "center", marginTop: -50 },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "#000",
    borderWidth: 4,
    borderColor: "#fff",
    justifyContent: "center",
    alignItems: "center"
  },
  avatarText: { color: "#fff", fontSize: 32, fontWeight: "700" },

  name: { textAlign: "center", fontSize: 22, fontWeight: "700", marginTop: 10 },

  location: { flexDirection: "row", justifyContent: "center", marginTop: 4 },
  locationText: { marginLeft: 4, color: "#999" },

  statsCard: {
    flexDirection: "row",
    backgroundColor: "#f3f0ff",
    margin: 16,
    borderRadius: 16,
    paddingVertical: 16
  },

  stat: { flex: 1, alignItems: "center" },
  statValue: { fontSize: 18, fontWeight: "700" },
  statTitle: { fontSize: 12, color: "#666", marginTop: 4 },

  tabs: { flexDirection: "row", justifyContent: "space-around", marginTop: 10 },
  tab: { fontSize: 16, color: "#999", paddingBottom: 6 },
  activeTab: {
    color: "#7b6fd6",
    borderBottomWidth: 2,
    borderBottomColor: "#7b6fd6"
  },

  tabContent: { padding: 20 },

  infoRow: { marginBottom: 12 },
  infoLabel: { color: "#666", fontSize: 13 },
  infoValue: { fontSize: 15, fontWeight: "500", marginTop: 2 },

  badge: { flexDirection: "row", alignItems: "center", marginTop: 10 },
  badgeText: { marginLeft: 6, color: "#4CAF50", fontWeight: "600" },

  socialRow: { flexDirection: "row", gap: 16, marginTop: 10 },

  sectionTitle: { fontSize: 16, fontWeight: "600", marginTop: 20 },

  campaignItem: { marginTop: 12 },
  campaignTitle: { fontSize: 15, fontWeight: "500" },
  campaignType: { color: "#666", fontSize: 12 },

  bottomBar: {
    flexDirection: "row",
    padding: 16,
    borderTopWidth: 1,
    borderColor: "#eee"
  },

  followBtn: {
    flex: 1,
    backgroundColor: "#7b6fd6",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginRight: 8
  },
  followingBtn: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#7b6fd6"
  },
  followText: { color: "#fff", fontWeight: "600" },
  followingText: { color: "#7b6fd6" },

  messageBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#7b6fd6",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row"
  },
  messageText: { color: "#7b6fd6", marginLeft: 6, fontWeight: "600" }
});