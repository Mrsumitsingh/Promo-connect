import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import {
  Animated,
  Dimensions,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BASE_URL } from "../../lib/api";
import { useAuth } from "../../lib/auth";
import { getProfileInfo, uploadProfileImage } from "../../lib/services";

const { width } = Dimensions.get("window");
const DUMMY_AVATAR = "https://ui-avatars.com/api/?name=User";

export default function ClientProfile() {
  const { logout, user } = useAuth();

  /* ---------- STATES ---------- */
  const [fullName, setFullName] = useState("");
  const [mobile, setMobile] = useState("");
  const [address, setAddress] = useState("");
  const [experience, setExperience] = useState("");
  const [audience, setAudience] = useState("");
  const [languages, setLanguages] = useState("");
  const [instagram, setInstagram] = useState("");
  const [youtube, setYoutube] = useState("");
  const [facebook, setFacebook] = useState("");

  const [city, setCity] = useState("");
  const [stateName, setStateName] = useState("");
  const [category, setCategory] = useState("");

  const [profilePhoto, setProfilePhoto] = useState("");
  const [previewVisible, setPreviewVisible] = useState(false);
  const [editVisible, setEditVisible] = useState(false);

  const [activeTab, setActiveTab] = useState<"Instagram" | "info" | "Reviews">(
    "Instagram",
  );
  const [menuVisible, setMenuVisible] = useState(false);
  const slideAnim = useState(new Animated.Value(300))[0];

  /* ---------- LOAD PROFILE ---------- */
  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const res = await getProfileInfo();
      const profile = res?.data?.data;
      if (!profile) return;

      setFullName(profile.basic_info?.full_name || "");
      setMobile(profile.basic_info?.mobile || "");
      setCity(profile.basic_info?.city || "");
      setStateName(profile.basic_info?.state || "");
      setCategory(profile.professional_info?.category || "");
      setExperience(profile.professional_info?.experience || "");
      setAudience(profile.professional_info?.audience || "");
      setLanguages(profile.professional_info?.languages || "");
      setAddress(profile?.basic_info?.address || "");

      setInstagram(profile.socials?.instagram || "");
      setYoutube(profile.socials?.youtube || "");
      setFacebook(profile.socials?.facebook || "");

      setProfilePhoto(
        profile.basic_info?.profile_photo
          ? `${BASE_URL}/storage/${profile.basic_info.profile_photo}`
          : "",
      );
    } catch (e) {
      console.log("Profile load failed", e);
    }
  };

  /* ---------- IMAGE PICK ---------- */
  const pickProfileImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });

    if (result.canceled) return;

    const formData = new FormData();
    formData.append("profile_photo", {
      uri: result.assets[0].uri,
      name: "profile.jpg",
      type: "image/jpeg",
    } as any);

    try {
      await uploadProfileImage(formData);
      loadProfile();
    } catch (e) {
      console.log("Upload failed", e);
    }
  };

  // open/close menue
  const openMenu = () => {
    setMenuVisible(true);
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const closeMenu = () => {
    Animated.timing(slideAnim, {
      toValue: 300,
      duration: 250,
      useNativeDriver: true,
    }).start(() => setMenuVisible(false));
  };

  const FormInput = ({ label, value, onChange, icon, placeholder }: any) => (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>{label}</Text>
      <View style={styles.inputBox}>
        <TextInput
          value={value}
          onChangeText={onChange}
          placeholder={placeholder || label}
          style={styles.input}
        />
        {icon && <Ionicons name={icon} size={20} color="#777" />}
      </View>
    </View>
  );

  const FormSelect = ({ label, value }: any) => (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>{label}</Text>
      <View style={styles.inputBox}>
        <Text style={styles.input}>{value}</Text>
        <Ionicons name="chevron-down" size={20} color="#777" />
      </View>
    </View>
  );

  const FormTextarea = ({ label, value, placeholder }: any) => (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>{label}</Text>
      <TextInput
        value={value}
        placeholder={placeholder}
        multiline
        style={[styles.input, { height: 100, textAlignVertical: "top" }]}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" translucent />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* HEADER */}
        <TouchableOpacity style={styles.menuBtn} onPress={openMenu}>
          <Ionicons name="menu" size={26} color="#fff" />
        </TouchableOpacity>
        <LinearGradient colors={["#8E7CE3", "#6C5DD3"]} style={styles.header} />

        {/* AVATAR */}
        <View style={styles.avatarWrap}>
          <TouchableOpacity onPress={() => setPreviewVisible(true)}>
            <Image
              source={{ uri: profilePhoto || DUMMY_AVATAR }}
              style={styles.avatar}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cameraIcon}
            onPress={pickProfileImage}
          >
            <Ionicons name="camera" size={18} color="#fff" />
          </TouchableOpacity>
        </View>

        <Text style={styles.name}>{fullName || user?.name}</Text>

        <View style={styles.locationRow}>
          <Ionicons name="location-outline" size={16} color="#888" />
          <Text style={styles.location}>
            {city}
            {stateName ? `, ${stateName}` : ""}
          </Text>
        </View>

        {/* STATS */}
        <View style={styles.statsCard}>
          <Stat value="1.4K" label="Followers" />
          <Stat value="28%" label="Engagement" />
          <Stat value="401" label="Reach" />
          <Stat value="35" label="Likes" />
        </View>

        {/* CATEGORY */}
        {!!category && (
          <View style={styles.categoryChip}>
            <Text style={styles.categoryText}>{category}</Text>
          </View>
        )}

        {/* TABS */}
        <View style={styles.tabs}>
          {["Instagram", "info", "Reviews"].map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.activeTab]}
              onPress={() => setActiveTab(tab as any)}
            >
              <Text style={styles.tabText}>{tab}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* INFO TAB */}
        {activeTab === "info" && (
          <View style={{ padding: 16 }}>
            <InfoRow label="Mobile" value={mobile} />
            <InfoRow label="Instagram" value={instagram} />
            <InfoRow label="YouTube" value={youtube} />
            <InfoRow label="Facebook" value={facebook} />
            <InfoRow label="Category" value={category} />
            <InfoRow label="Experience" value={experience} />
            <InfoRow label="Audience" value={audience} />
            <InfoRow label="Languages" value={languages} />
            <InfoRow label="City" value={city} />
            <InfoRow label="State" value={stateName} />
            <InfoRow label="adress" value={address} />
          </View>
        )}
      </ScrollView>

      {/* EDIT MODAL */}
      <Modal
        visible={editVisible}
        animationType="slide"
        onRequestClose={() => setEditVisible(false)}
      >
        <SafeAreaView
          style={{ flex: 1, backgroundColor: "#fff" }}
          edges={["left", "right", "bottom"]}
        >
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* HEADER */}
            <LinearGradient
              colors={["#9B8AE6", "#6C5DD3"]}
              style={styles.editHeaderBg}
            >
              <TouchableOpacity
                style={styles.backBtn}
                onPress={() => setEditVisible(false)}
              >
                <Ionicons name="chevron-back" size={28} color="#fff" />
              </TouchableOpacity>
            </LinearGradient>

            {/* AVATAR */}
            <View style={styles.editAvatarWrap}>
              <Image
                source={{ uri: profilePhoto || DUMMY_AVATAR }}
                style={styles.editAvatar}
              />
            </View>

            {/* FORM */}
            <View style={styles.formContainer}>
              <FormInput label="Name" value={fullName} onChange={setFullName} />

              <FormSelect label="Gender" value="Male" />

              <FormInput
                label="City"
                value={`${city}, ${stateName}`}
                icon="search"
              />
              <FormInput label="Mobile" value={`${mobile}`} icon="call" />

              <FormInput
                label="Date of Birth"
                value="Dec 10, 2001"
                icon="calendar"
              />

              <FormInput
                label="Email"
                value={`${user?.email}`}
                placeholder="Enter your email"
                icon="mail"
              />
              <FormInput
                label="Address"
                value={`${address}`}
                placeholder="Address"
                icon="home-outline"
              />
              <FormInput
                label="Language"
                value={`${languages}`}
                placeholder="Language"
                icon="language-outline"
              />

              <FormTextarea label="Bio" value="" placeholder="Enter your bio" />

              <TouchableOpacity style={styles.saveBtn}>
                <Text style={{ color: "#fff", fontWeight: "600" }}>Update</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      <Modal visible={menuVisible} transparent animationType="none">
        <Pressable style={styles.overlay} onPress={closeMenu} />

        <Animated.View
          style={[
            styles.bottomSheet,
            { transform: [{ translateY: slideAnim }] },
          ]}
        >
          <MenuItem
            icon="create-outline"
            label="Edit Profile"
            onPress={() => {
              closeMenu(); // close bottom sheet
              setEditVisible(true); // open edit modal
            }}
          />
          <MenuItem icon="wallet-outline" label="Wallet" />
          <MenuItem icon="diamond-outline" label="Subscription" />
          <MenuItem icon="cash-outline" label="Refer & Earn" />
          <MenuItem icon="time-outline" label="Campaign History" />
          <MenuItem icon="settings-outline" label="Settings" />
          <MenuItem
            icon="log-out-outline"
            label="Logout"
            danger
            onPress={() => {
              closeMenu();
              logout();
            }}
          />
        </Animated.View>
      </Modal>
    </SafeAreaView>
  );
}

/* ---------- SMALL COMPONENTS ---------- */

const Stat = ({ value, label }: any) => (
  <View style={styles.stat}>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const InfoRow = ({ label, value }: any) => (
  <View style={styles.infoRow}>
    <Text style={{ color: "#555" }}>{label}</Text>
    <Text style={{ fontWeight: "600" }}>{value || "-"}</Text>
  </View>
);

const InfoInput = ({ label, value, onChange }: any) => (
  <View style={{ marginBottom: 14 }}>
    <Text style={{ marginBottom: 6, fontWeight: "600" }}>{label}</Text>
    <TextInput
      value={value}
      onChangeText={onChange}
      style={styles.input}
      placeholder={label}
    />
  </View>
);
const MenuItem = ({ icon, label, onPress }: any) => (
  <TouchableOpacity style={styles.menuItem} onPress={onPress}>
    <Ionicons name={icon} size={22} color="#333" />
    <Text style={styles.menuText}>{label}</Text>
  </TouchableOpacity>
);

/* ---------- STYLES ---------- */

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F6F6FB" },
  header: {
    height: 180,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  avatarWrap: { alignItems: "center", marginTop: -60 },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 6,
    borderColor: "#fff",
  },
  cameraIcon: {
    position: "absolute",
    bottom: 0,
    right: width / 2 - 20,
    backgroundColor: "#000",
    padding: 6,
    borderRadius: 20,
  },
  name: { textAlign: "center", fontSize: 22, fontWeight: "700" },
  locationRow: { flexDirection: "row", justifyContent: "center" },
  location: { marginLeft: 4, color: "#888" },
  statsCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#EEEAFB",
    margin: 16,
    borderRadius: 16,
    padding: 16,
  },
  stat: { alignItems: "center", width: width / 4 - 20 },
  statValue: { fontWeight: "700", fontSize: 16 },
  statLabel: { fontSize: 12, color: "#777" },
  categoryChip: {
    backgroundColor: "#2E2A4A",
    alignSelf: "flex-start",
    marginLeft: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  categoryText: { color: "#fff", fontWeight: "600" },
  tabs: { flexDirection: "row", justifyContent: "space-around" },
  tab: { paddingBottom: 8 },
  activeTab: { borderBottomWidth: 3, borderBottomColor: "#6C5DD3" },
  tabText: { fontWeight: "600" },
  logoutBtn: {
    margin: 20,
    backgroundColor: "#FF3B30",
    padding: 14,
    borderRadius: 12,
  },
  logoutText: { color: "#fff", textAlign: "center", fontWeight: "600" },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  input: {
    flex: 1,
    backgroundColor: "#EEEAFB",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: "#333",
  },

  saveBtn: {
    marginTop: 30,
    backgroundColor: "#6C5DD3",
    height: 50,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },

  cancelBtn: {
    padding: 14,
    alignItems: "center",
  },
  menuBtn: {
    position: "absolute",
    top: 16,
    right: 20,
    zIndex: 10,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
  },

  bottomSheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 16,
  },

  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
  },

  menuText: {
    fontSize: 16,
    marginLeft: 14,
    fontWeight: "500",
  },
  editHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  editTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  editHeaderBg: {
    height: 160,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },

  backBtn: {
    position: "absolute",
    top: 20,
    left: 16,
  },

  editAvatarWrap: {
    alignItems: "center",
    marginTop: -50,
  },

  editAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: "#fff",
  },

  formContainer: {
    padding: 20,
  },

  inputGroup: {
    marginBottom: 18,
  },

  inputLabel: {
    marginBottom: 6,
    color: "#333",
    fontWeight: "500",
  },

  inputBox: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 10,
    paddingHorizontal: 14,
    height: 50,
    justifyContent: "space-between",
  },
});
