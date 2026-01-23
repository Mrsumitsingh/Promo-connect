import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
    FlatList,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

/* =======================
   TYPES
======================= */

type TabType = "brand" | "campaign";

interface Brand {
  id: string;
  name: string;
  category: string;
  description?: string;
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

type FilterSection =
  | "category"
  | "campaignType"
  | "deliverables"
  | "amount"
  | "location"
  | "followers"
  | "gender";

/* =======================
   SCREEN
======================= */

const ExploreScreen = () => {
  const [activeTab, setActiveTab] = useState<TabType>("campaign");
  const [search, setSearch] = useState("");
  const [showFilter, setShowFilter] = useState(false);

  const [filters, setFilters] = useState<Filters>({
    category: [],
    campaignType: "",
    deliverables: [],
    minAmount: 500,
    minFollowers: 1000,
    gender: [],
    location: "All",
  });

  const data: ExploreItem[] =
    activeTab === "brand"
      ? [
          {
            __type: "brand",
            id: "1",
            name: "SmartSense",
            category: "Fashion",
            description: "Innovative fashion brand focusing on smart wearables",
          },
          {
            __type: "brand",
            id: "2",
            name: "EcoHome",
            category: "Lifestyle",
            description: "Sustainable home decor and lifestyle products",
          },
          {
            __type: "brand",
            id: "3",
            name: "FitFuel",
            category: "Health & Fitness",
            description: "Premium nutrition supplements and fitness gear",
          },
        ]
      : [
          {
            __type: "campaign",
            id: "1",
            title: "Babashtra Barter",
            type: "Barter",
            budget: "Product Exchange",
          },
          {
            __type: "campaign",
            id: "2",
            title: "Summer Collection Launch",
            type: "Paid",
            budget: "$5,000 - $10,000",
          },
          {
            __type: "campaign",
            id: "3",
            title: "Fitness App Promotion",
            type: "Paid",
            budget: "$3,000 - $7,000",
          },
        ];

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.category.length > 0) count += filters.category.length;
    if (filters.campaignType) count += 1;
    if (filters.deliverables.length > 0) count += filters.deliverables.length;
    if (filters.gender.length > 0) count += filters.gender.length;
    if (filters.location !== "All") count += 1;
    return count;
  };

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
              <Text style={styles.filterBadgeText}>{getActiveFilterCount()}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* SEARCH */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            placeholder="Search brands, campaigns..."
            placeholderTextColor="#999"
            value={search}
            onChangeText={setSearch}
            style={styles.searchInput}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch("")}>
              <Ionicons name="close-circle" size={20} color="#999" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* TABS */}
      <View style={styles.tabsContainer}>
        <Tab 
          title="Brands" 
          active={activeTab === "brand"} 
          onPress={() => setActiveTab("brand")} 
        />
        <Tab 
          title="Campaigns" 
          active={activeTab === "campaign"} 
          onPress={() => setActiveTab("campaign")} 
        />
      </View>

      {/* RESULTS INFO */}
      <View style={styles.resultsInfo}>
        <Text style={styles.resultsText}>
          {data.length} {activeTab === "brand" ? "brands" : "campaigns"} found
        </Text>
      </View>

      {/* LIST */}
      <FlatList
        data={data}
        keyExtractor={(i) => i.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        renderItem={({ item }) =>
          item.__type === "brand" ? (
            <BrandCard 
              title={item.name} 
              category={item.category}
              description={item.description}
            />
          ) : (
            <CampaignCard 
              title={item.title} 
              type={item.type}
              budget={item.budget}
            />
          )
        }
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />

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
   FILTER MODAL
======================= */

const FilterModal = ({
  visible,
  onClose,
  filters,
  setFilters,
}: {
  visible: boolean;
  onClose: () => void;
  filters: Filters;
  setFilters: React.Dispatch<React.SetStateAction<Filters>>;
}) => {
  const [active, setActive] = useState<FilterSection>("category");

  const toggleMulti = (key: keyof Filters, value: string) => {
    setFilters((prev) => {
      const current = prev[key];
      if (Array.isArray(current)) {
        return {
          ...prev,
          [key]: current.includes(value)
            ? current.filter((v) => v !== value)
            : [...current, value],
        };
      }
      return prev;
    });
  };

  const setSingle = (key: keyof Filters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {/* HEADER */}
          <View style={styles.modalHeader}>
            <View>
              <Text style={styles.modalTitle}>Filters</Text>
              <Text style={styles.modalSubtitle}>Refine your search</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <View style={styles.filterBody}>
            {/* LEFT - CATEGORIES */}
            <ScrollView style={styles.filterCategories}>
              {[
                ["Category", "category"],
                ["Campaign Type", "campaignType"],
                ["Deliverables", "deliverables"],
                ["Amount", "amount"],
                ["Location", "location"],
                ["Followers", "followers"],
                ["Gender", "gender"],
              ].map(([label, key]) => (
                <TouchableOpacity
                  key={key}
                  onPress={() => setActive(key as FilterSection)}
                  style={[
                    styles.categoryItem,
                    active === key && styles.categoryItemActive,
                  ]}
                >
                  <Text style={[
                    styles.categoryText,
                    active === key && styles.categoryTextActive
                  ]}>
                    {label}
                  </Text>
                  {active === key && <View style={styles.activeIndicator} />}
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* RIGHT - OPTIONS */}
            <ScrollView style={styles.filterOptions}>
              {active === "category" && (
                <>
                  <Text style={styles.optionsTitle}>Select Categories</Text>
                  {["Actor", "Artist", "Author", "Architect", "Designer", "Musician", "Photographer", "Writer"].map((i) => (
                    <Option
                      key={i}
                      selected={filters.category.includes(i)}
                      label={i}
                      onPress={() => toggleMulti("category", i)}
                    />
                  ))}
                </>
              )}

              {active === "campaignType" && (
                <>
                  <Text style={styles.optionsTitle}>Campaign Type</Text>
                  {["Paid", "Barter", "Hybrid"].map((i) => (
                    <Option
                      key={i}
                      radio
                      selected={filters.campaignType === i}
                      label={i}
                      onPress={() => setSingle("campaignType", i)}
                    />
                  ))}
                </>
              )}

              {active === "deliverables" && (
                <>
                  <Text style={styles.optionsTitle}>Deliverables</Text>
                  {["Reel", "Post", "Story", "Video", "IGTV", "Live", "Review"].map((i) => (
                    <Option
                      key={i}
                      selected={filters.deliverables.includes(i)}
                      label={i}
                      onPress={() => toggleMulti("deliverables", i)}
                    />
                  ))}
                </>
              )}

              {active === "gender" && (
                <>
                  <Text style={styles.optionsTitle}>Gender</Text>
                  {["Male", "Female", "Non-binary", "Others"].map((i) => (
                    <Option
                      key={i}
                      selected={filters.gender.includes(i)}
                      label={i}
                      onPress={() => toggleMulti("gender", i)}
                    />
                  ))}
                </>
              )}

              {active === "location" && (
                <>
                  <Text style={styles.optionsTitle}>Location</Text>
                  {["All", "Pan India", "State", "City", "International"].map((i) => (
                    <Option
                      key={i}
                      radio
                      selected={filters.location === i}
                      label={i}
                      onPress={() => setSingle("location", i)}
                    />
                  ))}
                </>
              )}

              {(active === "amount" || active === "followers") && (
                <View style={styles.sliderPlaceholder}>
                  <Text style={styles.sliderTitle}>
                    {active === "amount" ? "Minimum Amount" : "Minimum Followers"}
                  </Text>
                  <View style={styles.sliderContainer}>
                    <View style={styles.sliderTrack}>
                      <View style={styles.sliderFill} />
                      <View style={styles.sliderThumb} />
                    </View>
                    <Text style={styles.sliderValue}>
                      {active === "amount" ? `$${filters.minAmount}` : `${filters.minFollowers.toLocaleString()}+`}
                    </Text>
                  </View>
                </View>
              )}
            </ScrollView>
          </View>

          {/* FOOTER */}
          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={styles.clearButton}
              onPress={() =>
                setFilters({
                  category: [],
                  campaignType: "",
                  deliverables: [],
                  minAmount: 500,
                  minFollowers: 1000,
                  gender: [],
                  location: "All",
                })
              }
            >
              <Ionicons name="refresh" size={18} color="#7b6fd6" />
              <Text style={styles.clearButtonText}>Clear All</Text>
            </TouchableOpacity>

            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={onClose}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.applyButton}
                onPress={() => {
                  console.log("Applied filters:", filters);
                  onClose();
                }}
              >
                <Text style={styles.applyButtonText}>Apply Filters</Text>
                <Ionicons name="checkmark" size={18} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

/* =======================
   REUSABLE COMPONENTS
======================= */

const Option = ({
  label,
  selected,
  radio,
  onPress,
}: {
  label: string;
  selected: boolean;
  radio?: boolean;
  onPress: () => void;
}) => (
  <TouchableOpacity 
    onPress={onPress} 
    style={[styles.option, selected && styles.optionSelected]}
  >
    <View style={styles.optionContent}>
      <View style={[styles.optionIcon, radio ? styles.radioIcon : styles.checkboxIcon]}>
        {radio ? (
          selected ? (
            <View style={styles.radioSelected} />
          ) : null
        ) : (
          <Ionicons 
            name={selected ? "checkbox" : "square-outline"} 
            size={20} 
            color={selected ? "#7b6fd6" : "#666"} 
          />
        )}
      </View>
      <Text style={[styles.optionLabel, selected && styles.optionLabelSelected]}>
        {label}
      </Text>
    </View>
  </TouchableOpacity>
);

const Tab = ({ title, active, onPress }: any) => (
  <TouchableOpacity
    onPress={onPress}
    style={[styles.tab, active && styles.tabActive]}
  >
    <Text style={[styles.tabText, active && styles.tabTextActive]}>{title}</Text>
    {active && <View style={styles.tabIndicator} />}
  </TouchableOpacity>
);

const BrandCard = ({ title, category, description }: any) => (
  <View style={styles.card}>
    <View style={styles.cardHeader}>
      <View style={styles.brandIcon}>
        <Text style={styles.brandIconText}>{title.charAt(0)}</Text>
      </View>
      <View style={styles.cardInfo}>
        <Text style={styles.cardTitle}>{title}</Text>
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText}>{category}</Text>
        </View>
      </View>
    </View>
    {description && (
      <Text style={styles.cardDescription}>{description}</Text>
    )}
    <TouchableOpacity style={styles.viewButton}>
      <Text style={styles.viewButtonText}>View Details</Text>
      <Ionicons name="chevron-forward" size={16} color="#7b6fd6" />
    </TouchableOpacity>
  </View>
);

const CampaignCard = ({ title, type, budget }: any) => (
  <View style={styles.card}>
    <View style={styles.cardHeader}>
      <View style={[
        styles.campaignTypeBadge,
        type === "Paid" ? styles.paidBadge : styles.barterBadge
      ]}>
        <Text style={styles.campaignTypeText}>{type}</Text>
      </View>
      <Ionicons name="bookmark-outline" size={20} color="#999" />
    </View>
    <Text style={styles.cardTitle}>{title}</Text>
    {budget && (
      <View style={styles.budgetContainer}>
        <Ionicons name="cash-outline" size={16} color="#666" />
        <Text style={styles.budgetText}>{budget}</Text>
      </View>
    )}
    <TouchableOpacity style={styles.applyButtonSmall}>
      <Text style={styles.applyButtonSmallText}>Apply Now</Text>
    </TouchableOpacity>
  </View>
);

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
//   categoryText: {
//     fontSize: 15,
//     color: "#666",
//   },
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