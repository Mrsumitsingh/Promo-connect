import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router"; // ADD THIS IMPORT
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { getAllBrands, getAllCampaigns } from "../../lib/Explore";

/* =======================
   TYPES
======================= */

type TabType = "brand" | "campaign";

interface Brand {
  id: string;
  name: string;
  category: string;
  description?: string;
  basic_info: string;
}

interface Campaign {
  id: string;
  title: string;
  type: "Paid" | "Barter";
  budget?: string;
}

type ExploreItem =
  | ({ __type: "brand" } & Brand)
  | ({ __type: "campaign" } & Campaign);

interface Filters {
  category: string[];
  campaignType: string;
  deliverables: string[];
  minAmount: number;
  minFollowers: number;
  gender: string[];
  location: string;
}

/* =======================
   SCREEN
======================= */

const ExploreScreen = () => {
  const router = useRouter(); // ADD THIS LINE
  
  const [activeTab, setActiveTab] = useState<TabType>("campaign");
  const [search, setSearch] = useState("");
  const [showFilter, setShowFilter] = useState(false);
  const [loading, setLoading] = useState(false);

  const [brands, setBrands] = useState<ExploreItem[]>([]);
  const [campaigns, setCampaigns] = useState<ExploreItem[]>([]);

  const [filters, setFilters] = useState<Filters>({
    category: [],
    campaignType: "",
    deliverables: [],
    minAmount: 500,
    minFollowers: 1000,
    gender: [],
    location: "All",
  });

  /* =======================
     FETCH DATA
  ======================= */

  useEffect(() => {
    loadData();
  }, []);
  
  const loadData = async () => {
    try {
      setLoading(true);

      // 🔹 Brands
      const brandRes = await getAllBrands();
      if (brandRes?.data?.data) {
        setBrands(
          brandRes.data.data.map((b: any) => ({
            __type: "brand",
            id: String(b.id),
            name: b.brand_detail?.company_name ?? "Unknown Brand",
            category: b.brand_detail?.industry ?? "General",
            description: b.brand_detail?.website ?? "",
            basic_info: b.brand_detail?.about ?? "",
          }))
        );
      }

      // 🔹 FIXED: Campaigns mapping
      const campaignRes = await getAllCampaigns();
      if (campaignRes?.data?.data) {
        setCampaigns(
          campaignRes.data.data.map((c: any) => ({
            __type: "campaign",
            id: String(c.id),
            title: c.title ?? "Untitled Campaign", 
            type: c.budget_details ? "Paid" : "Barter", 
            budget: c.budget_details ?? "", 
            category: c.category,
            status: c.status,
          }))
        );
      }
    } catch (err) {
      console.log("❌ Explore API error:", err);
    } finally {
      setLoading(false);
    }
  };
 
  /* =======================
     SEARCH + FILTER LOGIC
  ======================= */

  const data = useMemo(() => {
    let list = activeTab === "brand" ? brands : campaigns;

    // 🔍 Search
    if (search.trim()) {
      list = list.filter((item) =>
        item.__type === "brand"
          ? item.name.toLowerCase().includes(search.toLowerCase())
          : item.title.toLowerCase().includes(search.toLowerCase())
      );
    }

    // 🎯 Brand category
    if (filters.category.length && activeTab === "brand") {
      list = list.filter((i: any) =>
        filters.category.includes(i.category)
      );
    }

    // 🎯 Campaign type
    if (filters.campaignType && activeTab === "campaign") {
      list = list.filter((i: any) => i.type === filters.campaignType);
    }

    return list;
  }, [activeTab, brands, campaigns, search, filters]);

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.category.length) count += filters.category.length;
    if (filters.campaignType) count += 1;
    if (filters.location !== "All") count += 1;
    return count;
  };

  /* =======================
     COMPONENTS
  ======================= */

  const Tab = ({ title, active, onPress }: any) => (
    <TouchableOpacity onPress={onPress} style={styles.tab}>
      <Text style={[styles.tabText, active && styles.tabTextActive]}>{title}</Text>
    </TouchableOpacity>
  );

  const BrandCard = ({ id, name, category, description, basic_info }: any) => {
    const handlePress = () => {
      // Navigate to brand profile with data
      router.push({
        pathname: "/BrandProfile",
        params: {
          id,
          name,
          category,
          description,
          basic_info,
        }
      });
    };

    return (
      <TouchableOpacity 
        style={styles.card}
        onPress={handlePress}
        activeOpacity={0.7}
      >
        <Text style={styles.cardTitle}>{name}</Text>
        <Text style={styles.categoryText}>{category}</Text>
        {!!description && <Text style={styles.cardDescription}>{description}</Text>}
      </TouchableOpacity>
    );
  };

  const CampaignCard = ({ title, type, budget, category, status }: any) => (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.campaignTypeText}>{type}</Text>
      {category && <Text style={styles.categoryText}>{category}</Text>}
      {budget && <Text style={styles.budgetText}>Budget: {budget}</Text>}
      {status && <Text style={[styles.statusText, 
        status === 'open' ? styles.statusOpen : styles.statusClosed]}>
        {status}
      </Text>}
    </View>
  );

  const FilterModal = ({ visible, filters, setFilters, onClose }: any) => (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Filters</Text>

          <ScrollView>
            {["Fashion", "Tech", "Fitness", "Lifestyle"].map((c) => (
              <TouchableOpacity
                key={c}
                onPress={() =>
                  setFilters((p: Filters) => ({
                    ...p,
                    category: p.category.includes(c)
                      ? p.category.filter((x) => x !== c)
                      : [...p.category, c],
                  }))
                }
              >
                <Text style={{ padding: 16 }}>{c}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <TouchableOpacity style={styles.applyButton} onPress={onClose}>
            <Text style={styles.applyButtonText}>Apply Filters</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  /* =======================
     RENDER
  ======================= */

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F8F9FA" }}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton}>
          <Ionicons name="arrow-back" size={22} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Explore</Text>

        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFilter(true)}
        >
          <Ionicons name="filter" size={22} color="#333" />
          {getActiveFilterCount() > 0 && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>
                {getActiveFilterCount()}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* SEARCH */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={20} color="#666" />
          <TextInput
            placeholder="Search brands, campaigns..."
            value={search}
            onChangeText={setSearch}
            style={styles.searchInput}
          />
        </View>
      </View>

      {/* TABS */}
      <View style={styles.tabsContainer}>
        <Tab title="Brands" active={activeTab === "brand"} onPress={() => setActiveTab("brand")} />
        <Tab title="Campaigns" active={activeTab === "campaign"} onPress={() => setActiveTab("campaign")} />
      </View>

      {/* RESULTS */}
      <View style={styles.resultsInfo}>
        <Text style={styles.resultsText}>
          {data.length} {activeTab === "brand" ? "brands" : "campaigns"} found
        </Text>
      </View>

      {/* LIST */}
      {loading ? (
        <ActivityIndicator size="large" color="#7b6fd6" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={data}
          keyExtractor={(i) => i.id}
          contentContainerStyle={styles.listContainer}
          renderItem={({ item }) =>
            item.__type === "brand" ? (
              <BrandCard {...item} />
            ) : (
              <CampaignCard {...item} />
            )
          }
        />
      )}

      <FilterModal
        visible={showFilter}
        filters={filters}
        setFilters={setFilters}
        onClose={() => setShowFilter(false)}
      />
    </SafeAreaView>
  );
};

export default ExploreScreen;



/* =======================
   STYLES
======================= */

const styles = StyleSheet.create({
  // Header
  header: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 16,
    alignItems: "center",
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  headerTitle: {
    flex: 1,
    fontSize: 24,
    fontWeight: "700",
    color: "#1A1A1A",
  },
  filterButton: {
    padding: 8,
    position: "relative",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "500",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-start",
    marginTop: 8,
  },
  statusOpen: {
    backgroundColor: "#E8F5E9",
    color: "#2E7D32",
  },
  statusClosed: {
    backgroundColor: "#FFEBEE",
    color: "#C62828",
  },
  filterBadge: {
    position: "absolute",
    top: 4,
    right: 4,
    backgroundColor: "#FF3B30",
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: "center",
    alignItems: "center",
  },
  filterBadgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "600",
  },

  // Search
  searchContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: "#fff",
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F7",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#1A1A1A",
    padding: 0,
  },

  // Tabs
  tabsContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: "#fff",
  },
  tab: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 12,
    position: "relative",
  },
  tabActive: {},
  tabText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#666",
  },
  tabTextActive: {
    color: "#7b6fd6",
    fontWeight: "600",
  },
  tabIndicator: {
    position: "absolute",
    bottom: 0,
    height: 3,
    width: "60%",
    backgroundColor: "#7b6fd6",
    borderRadius: 1.5,
  },

  // Results Info
  resultsInfo: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: "#fff",
  },
  resultsText: {
    fontSize: 14,
    color: "#666",
  },

  // List
  listContainer: {
    padding: 20,
  },
  separator: {
    height: 12,
  },

  // Cards
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  brandIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#7b6fd6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  brandIconText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "600",
  },
  cardInfo: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1A1A1A",
    marginBottom: 8,
  },
  categoryBadge: {
    backgroundColor: "#F0EEFF",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  categoryText: {
    fontSize: 12,
    color: "#7b6fd6",
    fontWeight: "500",
  },
  cardDescription: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
    marginBottom: 16,
  },
  campaignTypeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  paidBadge: {
    backgroundColor: "#E8F5E9",
  },
  barterBadge: {
    backgroundColor: "#FFF3E0",
  },
  campaignTypeText: {
    fontSize: 12,
    fontWeight: "600",
  },
  budgetContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  budgetText: {
    fontSize: 14,
    color: "#666",
    marginLeft: 8,
  },
  viewButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-end",
  },
  viewButtonText: {
    color: "#7b6fd6",
    fontSize: 14,
    fontWeight: "500",
    marginRight: 4,
  },
  applyButtonSmall: {
    backgroundColor: "#7b6fd6",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: "center",
  },
  applyButtonSmallText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    height: "85%",
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: "hidden",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1A1A1A",
  },
  modalSubtitle: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  closeButton: {
    padding: 8,
  },

  // Filter Body
  filterBody: {
    flex: 1,
    flexDirection: "row",
  },
  filterCategories: {
    width: "40%",
    backgroundColor: "#F8F9FA",
    borderRightWidth: 1,
    borderRightColor: "#F0F0F0",
  },
  categoryItem: {
    paddingVertical: 18,
    paddingHorizontal: 20,
    position: "relative",
  },
  categoryItemActive: {
    backgroundColor: "#fff",
  },
  categoryTextActive: {
    color: "#7b6fd6",
    fontWeight: "600",
  },
  filterCategoryText: {
    fontSize: 15,
    color: "#666",
  },
  filterCategoryTextActive: {
    color: "#7b6fd6",
    fontWeight: "600",
  },
  activeIndicator: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    backgroundColor: "#7b6fd6",
    borderTopRightRadius: 2,
    borderBottomRightRadius: 2,
  },

  // Filter Options
  filterOptions: {
    flex: 1,
    padding: 20,
  },
  optionsTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1A1A1A",
    marginBottom: 16,
  },

  // Options
  option: {
    paddingVertical: 12,
  },
  optionSelected: {
    backgroundColor: "#F8F9FA",
    borderRadius: 8,
  },
  optionContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
  },
  optionIcon: {
    marginRight: 12,
  },
  radioIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#D1D1D6",
    justifyContent: "center",
    alignItems: "center",
  },
  radioSelected: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#7b6fd6",
  },
  checkboxIcon: {},
  optionLabel: {
    fontSize: 16,
    color: "#1A1A1A",
  },
  optionLabelSelected: {
    fontWeight: "500",
  },

  // Slider
  sliderPlaceholder: {
    paddingVertical: 8,
  },
  sliderTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1A1A1A",
    marginBottom: 20,
  },
  sliderContainer: {
    marginBottom: 24,
  },
  sliderTrack: {
    height: 4,
    backgroundColor: "#E5E5EA",
    borderRadius: 2,
    marginBottom: 12,
    position: "relative",
  },
  sliderFill: {
    position: "absolute",
    height: 4,
    backgroundColor: "#7b6fd6",
    borderRadius: 2,
    width: "60%",
  },
  sliderThumb: {
    position: "absolute",
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#7b6fd6",
    top: -10,
    left: "60%",
    marginLeft: -12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sliderValue: {
    fontSize: 18,
    fontWeight: "600",
    color: "#7b6fd6",
    textAlign: "center",
  },

  // Modal Footer
  modalFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
  },
  clearButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    marginBottom: 12,
  },
  clearButtonText: {
    color: "#7b6fd6",
    fontSize: 16,
    fontWeight: "500",
    marginLeft: 8,
  },
  actionButtons: {
    flexDirection: "row",
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#D1D1D6",
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#666",
    fontSize: 16,
    fontWeight: "500",
  },
  applyButton: {
    flex: 1,
    backgroundColor: "#7b6fd6",
    paddingVertical: 16,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  applyButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginRight: 8,
  },
});