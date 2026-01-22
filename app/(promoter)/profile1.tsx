import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useEffect, useState } from "react";
import {
    Dimensions,
    FlatList,
    Image,
    Modal,
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
import {
    getProfileInfo,
    updateProfile,
    uploadProfileImage,
} from "../../lib/services";

const { width, height } = Dimensions.get("window");
const DUMMY_AVATAR = "https://ui-avatars.com/api/?name=User";

export default function ClientProfile() {
  const { logout: contextLogout, user } = useAuth();

  const [fullName, setFullName] = useState("");
  const [mobile, setMobile] = useState("");
  const [instagram, setInstagram] = useState("");
  const [youtube, setYoutube] = useState("");
  const [facebook, setFacebook] = useState("");
  const [category, setCategory] = useState("");
  const [city, setCity] = useState("");
  const [stateName, setStateName] = useState("");
  const [address, setAddress] = useState("");
  const [experience, setExperience] = useState("");
  const [audience, setAudience] = useState("");
  const [languages, setLanguages] = useState("");
  const [profilePhoto, setProfilePhoto] = useState("");
  const [previewVisible, setPreviewVisible] = useState(false);
  const [posts, setPosts] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"posts" | "info" | "Experiance">(
    "posts",
  );
  const [editVisible, setEditVisible] = useState(false);

  const loadProfile = async () => {
    try {
      const res = await getProfileInfo();
      console.log("Api Response", res);
      const profile = res?.data?.data;
      console.log("Profile Data", profile);
      if (!profile) return;

      setFullName(profile?.basic_info?.full_name || "");
      setMobile(profile?.basic_info?.mobile || "");
      setInstagram(profile?.basic_info?.instagram_link || "");
      setYoutube(profile?.basic_info?.youtube_link || "");
      setFacebook(profile?.basic_info?.facebook_link || "");
      setCity(profile?.basic_info?.city || "");
      setStateName(profile?.basic_info?.state || "");
      setAddress(profile?.basic_info?.address || "");
      setCategory(profile?.professional_info?.category || "");
      setLanguages(profile?.professional_info?.languages || "");
      setExperience(profile?.promoter_detail?.experience_years || "");
      setAudience(profile?.promoter_detail?.audience_size || "");
      setProfilePhoto(
        profile?.basic_info?.profile_photo
          ? `${BASE_URL}/storage/${profile.basic_info.profile_photo}`
          : "",
      );
    } catch (e) {
      console.log("Profile load failed", e);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleSaveProfile = async () => {
    try {
      await updateProfile({
        full_name: fullName,
        mobile_number: mobile,
        instagram_link: instagram,
        youtube_link: youtube,
        facebook_link: facebook,
        category,
        city,
        state: stateName,
        address,
        experience_years: experience,
        audience_size: audience,
        languages,
      });
      setEditVisible(false);
      loadProfile();
    } catch (e) {
      console.log("Update failed", e);
    }
  };

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

  const handleLogout = async () => {
    await contextLogout();
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView contentContainerStyle={{ paddingBottom: 30 }}>
        {/* ================= IMAGE PREVIEW MODAL ================= */}
        <Modal
          visible={previewVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setPreviewVisible(false)}
        >
          <TouchableOpacity
            activeOpacity={1}
            style={styles.modalOverlay}
            onPress={() => setPreviewVisible(false)}
          >
            <View style={styles.imageCard}>
              <TouchableOpacity
                style={styles.closeBtn}
                onPress={() => setPreviewVisible(false)}
              >
                <Ionicons name="close" size={22} color="#333" />
              </TouchableOpacity>
              <Image
                source={{ uri: profilePhoto || DUMMY_AVATAR }}
                style={styles.previewImage}
              />
            </View>
          </TouchableOpacity>
        </Modal>

        {/* ================= PROFILE HEADER ================= */}
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
        <Text style={styles.email}>{user?.email}</Text>
        {category ? <Text style={styles.category}>{category}</Text> : null}
        {city ? (
          <Text style={styles.location}>
            {city} {stateName ? `, ${stateName}` : ""}
          </Text>
        ) : null}

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.editBtn}
            onPress={() => setEditVisible(true)}
          >
            <Text style={styles.editText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {/* ================= TABS ================= */}
        <View style={styles.tabRow}>
          <TouchableOpacity
            style={[styles.tab, activeTab === "posts" && styles.activeTab]}
            onPress={() => setActiveTab("posts")}
          >
            <Text>Posts</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === "info" && styles.activeTab]}
            onPress={() => setActiveTab("info")}
          >
            <Text>Info</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === "Experiance" && styles.activeTab]}
            onPress={() => setActiveTab("Experiance")}
          >
            <Text>Experiance</Text>
          </TouchableOpacity>
        </View>

        {/* ================= POSTS ================= */}
        {activeTab === "posts" && (
          <FlatList
            data={posts}
            scrollEnabled={false}
            keyExtractor={(i) => i.id.toString()}
            renderItem={({ item }) => (
              <Image
                source={{ uri: item.image }}
                style={[styles.postImage, { height: width }]}
              />
            )}
          />
        )}

        {/* ================= INFO ================= */}
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
            <InfoRow label="StateName" value={stateName} />
          </View>
        )}

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* ================= EDIT MODAL ================= */}
      <Modal visible={editVisible} animationType="slide">
        <ScrollView contentContainerStyle={{ padding: 16 }}>
          <InfoInput
            label="Full Name"
            value={fullName}
            onChange={setFullName}
          />
          <InfoInput label="Mobile" value={mobile} onChange={setMobile} />
          <InfoInput
            label="Instagram"
            value={instagram}
            onChange={setInstagram}
          />
          <InfoInput label="YouTube" value={youtube} onChange={setYoutube} />
          <InfoInput label="Facebook" value={facebook} onChange={setFacebook} />
          <InfoInput label="Category" value={category} onChange={setCategory} />
          <InfoInput label="City" value={city} onChange={setCity} />
          <InfoInput label="State" value={stateName} onChange={setStateName} />
          <InfoInput label="Address" value={address} onChange={setAddress} />
          <InfoInput
            label="Experience"
            value={experience}
            onChange={setExperience}
          />
          <InfoInput label="Audience" value={audience} onChange={setAudience} />
          <InfoInput
            label="Languages"
            value={languages}
            onChange={setLanguages}
          />

          <TouchableOpacity style={styles.saveBtn} onPress={handleSaveProfile}>
            <Text style={{ color: "#fff" }}>Save</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelBtn}
            onPress={() => setEditVisible(false)}
          >
            <Text>Cancel</Text>
          </TouchableOpacity>
        </ScrollView>
      </Modal>
    </SafeAreaView>
  );
}

/* ================= SMALL COMPONENTS ================= */

const InfoRow = ({ label, value }: any) =>
  value ? (
    <View style={styles.infoRow}>
      <Text>{label}</Text>
      <Text>{value}</Text>
    </View>
  ) : null;

const InfoInput = ({ label, value, onChange }: any) => (
  <View style={styles.inputRow}>
    <Text>{label}</Text>
    <TextInput style={styles.input} value={value} onChangeText={onChange} />
  </View>
);

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10, backgroundColor: "#fff" },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  imageCard: {
    width: "85%",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 12,
    elevation: 8,
  },
  closeBtn: {
    alignSelf: "flex-end",
    marginBottom: 6,
  },
  previewImage: {
    width: "100%",
    height: 320,
    borderRadius: 12,
    resizeMode: "cover",
  },
  avatarWrap: { alignItems: "center", marginTop: 20 },
  avatar: { width: 120, height: 120, borderRadius: 60 },
  cameraIcon: {
    position: "absolute",
    bottom: 0,
    right: "42%",
    backgroundColor: "#000",
    color: "#fff",
    padding: 6,
    borderRadius: 20,
  },
  name: { textAlign: "center", fontSize: 20, fontWeight: "600", marginTop: 8 },
  email: { textAlign: "center", color: "#666", marginBottom: 4 },
  category: { textAlign: "center", color: "#007AFF", marginBottom: 4 },
  location: { textAlign: "center", color: "#666", marginBottom: 12 },
  buttonRow: { alignItems: "center", marginVertical: 10 },
  editBtn: { backgroundColor: "#34C759", padding: 8, borderRadius: 6 },
  editText: { color: "#fff" },
  tabRow: { flexDirection: "row", borderTopWidth: 1, borderBottomWidth: 1 },
  tab: { flex: 1, alignItems: "center", padding: 12 },
  activeTab: { borderBottomWidth: 2 },
  postImage: { width, resizeMode: "cover" },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  logoutBtn: {
    margin: 20,
    backgroundColor: "red",
    padding: 14,
    borderRadius: 8,
  },
  logoutText: { color: "#fff", textAlign: "center" },
  inputRow: { marginBottom: 12 },
  input: { borderWidth: 1, padding: 10, borderRadius: 6 },
  saveBtn: {
    backgroundColor: "#007AFF",
    padding: 14,
    borderRadius: 8,
    marginTop: 10,
  },
  cancelBtn: { alignItems: "center", marginTop: 10 },
});
