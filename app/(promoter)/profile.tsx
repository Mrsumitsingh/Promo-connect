import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import React, { useEffect, useState } from "react";
import {
  Dimensions,
  FlatList,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../../lib/auth";
import {
  getProfile,
  getProfileInfo,
  getUserPosts,
  updateProfile,
  updateProfileInfo,
  uploadProfileImage,
} from "./../../lib/services";

const { width } = Dimensions.get("window");

const DUMMY_PROFILE = {
  name: "Your Name",
  email: "you@email.com",
  about: "Tell people something about you",
  avatar: "https://ui-avatars.com/api/?name=User",
};

// Default profile info structure
const DEFAULT_PROFILE_INFO = {
  // Personal Information
  fullName: "",
  age: "",
  city: "",
  height: "",
  weight: "",
  bust: "",
  waist: "",
  hips: "",
  skinTone: "",
  eyeColor: "",
  hairColor: "",
  shoeSize: "",
  maritalStatus: "",
  presentProfession: "",
  education: "",
  dressesComfortableWith: "",
  openForOutstationShoots: false,
  openForOutOfCountryShoots: false,
  passport: false,
  experienced: false,
  comfortableWithAllTimings: false,

  // Interests
  acting: false,
  printShoot: false,
  rampShows: false,
  designerShoots: false,
  calendarShoots: false,
  musicAlbums: false,

  // Comfortable With
  indianWear: false,
  western: false,
  skirt: false,
  bikini: false,
  shorts: false,
  boldScenes: false,
  ableToWorkIndoorOutdoor: false,
  allergiesToDustOrCosmetics: false,
  topless: false,
  nude: false,

  // Languages
  languagesKnown: "",
};

// Sample posts with engagement data
const SAMPLE_POSTS = [
  {
    id: "1",
    image: "https://images.unsplash.com/photo-1494790108755-2616b612b786",
    caption: "Beautiful day for a photoshoot! 📸 #modeling #photography",
    likesCount: 124,
    commentsCount: 23,
    isLiked: false,
    comments: [
      { id: "c1", user: { name: "John" }, text: "Amazing shot!" },
      { id: "c2", user: { name: "Sarah" }, text: "Love this! ❤️" },
    ],
    createdAt: "2 hours ago",
  },
  {
    id: "2",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d",
    caption: "Behind the scenes of our latest campaign 🎬",
    likesCount: 89,
    commentsCount: 12,
    isLiked: true,
    comments: [{ id: "c3", user: { name: "Mike" }, text: "Great work!" }],
    createdAt: "1 day ago",
  },
  {
    id: "3",
    image: "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df",
    caption: "Fashion week prep is underway! 👠",
    likesCount: 256,
    commentsCount: 45,
    isLiked: false,
    comments: [
      { id: "c4", user: { name: "Emma" }, text: "Stunning!" },
      { id: "c5", user: { name: "David" }, text: "Can't wait to see more!" },
    ],
    createdAt: "3 days ago",
  },
];

export default function ClientProfile() {
  const { logout: contextLogout } = useAuth();

  const [profile, setProfile] = useState<any>(DUMMY_PROFILE);
  const [profileInfo, setProfileInfo] = useState(DEFAULT_PROFILE_INFO);
  const [posts, setPosts] = useState<any[]>(SAMPLE_POSTS);
  const [activeTab, setActiveTab] = useState<"posts" | "info">("posts");
  const [editVisible, setEditVisible] = useState(false);
  const [editInfoVisible, setEditInfoVisible] = useState(false);
  const [postModalVisible, setPostModalVisible] = useState(false);
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [commentText, setCommentText] = useState("");

  // Edit form
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [about, setAbout] = useState("");

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    try {
      const [p, po, info] = await Promise.allSettled([
        getProfile(),
        getUserPosts(),
        getProfileInfo(),
      ]);

      // PROFILE
      if (p.status === "fulfilled" && p.value?.data) {
        setProfile({ ...DUMMY_PROFILE, ...p.value.data });
        setName(p.value.data.name || "");
        setEmail(p.value.data.email || "");
        setAbout(p.value.data.about || "");
      } else {
        setProfile(DUMMY_PROFILE);
      }

      // PROFILE INFO
      if (info.status === "fulfilled" && info.value?.data) {
        setProfileInfo({ ...DEFAULT_PROFILE_INFO, ...info.value.data });
      }

      // POSTS - Using sample posts for now
      if (po.status === "fulfilled" && po.value?.data?.length) {
        setPosts(po.value.data);
      }
    } catch (e) {
      console.log("Fallback mode:", e);
    }
  };

  // ================= PROFILE =================
  const handleSaveProfile = async () => {
    await updateProfile({ name, email, about });
    setEditVisible(false);
    loadAll();
  };

  const handleSaveProfileInfo = async () => {
    await updateProfileInfo(profileInfo);
    setEditInfoVisible(false);
    loadAll();
  };

  const pickProfileImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });

    if (!result.canceled) {
      const formData = new FormData();
      formData.append("avatar", {
        uri: result.assets[0].uri,
        name: "avatar.jpg",
        type: "image/jpeg",
      } as any);

      await uploadProfileImage(formData);
      loadAll();
    }
  };

  // ================= POSTS =================
  const openPostModal = (post: any) => {
    setSelectedPost(post);
    setPostModalVisible(true);
  };

  const handleLike = (postId: string) => {
    setPosts(
      posts.map((post) => {
        if (post.id === postId) {
          return {
            ...post,
            likesCount: post.isLiked
              ? post.likesCount - 1
              : post.likesCount + 1,
            isLiked: !post.isLiked,
          };
        }
        return post;
      }),
    );

    if (selectedPost?.id === postId) {
      setSelectedPost({
        ...selectedPost,
        likesCount: selectedPost.isLiked
          ? selectedPost.likesCount - 1
          : selectedPost.likesCount + 1,
        isLiked: !selectedPost.isLiked,
      });
    }

    // Call API
    // likePost(postId);
  };

  const submitComment = async () => {
    if (!commentText.trim() || !selectedPost) return;

    const newComment = {
      id: `c${Date.now()}`,
      user: { name: profile.name || "You" },
      text: commentText,
    };

    // Update local state
    setPosts(
      posts.map((post) => {
        if (post.id === selectedPost.id) {
          return {
            ...post,
            commentsCount: post.commentsCount + 1,
            comments: [...post.comments, newComment],
          };
        }
        return post;
      }),
    );

    setSelectedPost({
      ...selectedPost,
      commentsCount: selectedPost.commentsCount + 1,
      comments: [...selectedPost.comments, newComment],
    });

    setCommentText("");

    // Call API
    // await addComment(selectedPost.id, commentText);
  };

  // ================= LOGOUT =================
  const handleLogout = async () => {
    await contextLogout();
  };

  if (!profile) return null;

  return (
    <View style={styles.container}>
      {/* Header with Profile Info */}
      <ScrollView style={styles.scrollContainer}>
        {/* PROFILE HEADER */}
        <TouchableOpacity
          onPress={pickProfileImage}
          style={styles.avatarWrapper}
        >
          <Image
            source={{
              uri: profile.avatar || DUMMY_PROFILE.avatar,
            }}
            style={styles.avatar}
          />
          <Ionicons name="camera" size={18} style={styles.cameraIcon} />
        </TouchableOpacity>

        <Text style={styles.name}>{profile.name || DUMMY_PROFILE.name}</Text>

        <Text style={styles.email}>{profile.email || DUMMY_PROFILE.email}</Text>

        <Text style={styles.about}>{profile.about || DUMMY_PROFILE.about}</Text>

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => setEditVisible(true)}
          >
            <Text style={styles.editText}>Edit Profile</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.editInfoButton}
            onPress={() => setEditInfoVisible(true)}
          >
            <Text style={styles.editInfoText}>Edit Info</Text>
          </TouchableOpacity>
        </View>

        {/* TAB BAR */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === "posts" && styles.activeTab]}
            onPress={() => setActiveTab("posts")}
          >
            <Ionicons
              name="grid"
              size={24}
              color={activeTab === "posts" ? "#007AFF" : "#666"}
            />
            <Text
              style={[
                styles.tabText,
                activeTab === "posts" && styles.activeTabText,
              ]}
            >
              Posts
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === "info" && styles.activeTab]}
            onPress={() => setActiveTab("info")}
          >
            <Ionicons
              name="information-circle"
              size={24}
              color={activeTab === "info" ? "#007AFF" : "#666"}
            />
            <Text
              style={[
                styles.tabText,
                activeTab === "info" && styles.activeTabText,
              ]}
            >
              Information
            </Text>
          </TouchableOpacity>
        </View>

        {/* POSTS TAB CONTENT */}
        {activeTab === "posts" && (
          <FlatList
            data={posts}
            scrollEnabled={false}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.postCard}>
                {/* Post Header */}
                <View style={styles.postHeader}>
                  <Image
                    source={{ uri: profile.avatar || DUMMY_PROFILE.avatar }}
                    style={styles.postAvatar}
                  />
                  <View>
                    <Text style={styles.postUsername}>
                      {profile.name || "User"}
                    </Text>
                    <Text style={styles.postTime}>{item.createdAt}</Text>
                  </View>
                </View>

                {/* Post Image */}
                <TouchableOpacity onPress={() => openPostModal(item)}>
                  <Image
                    source={{ uri: item.image }}
                    style={styles.postImage}
                  />
                </TouchableOpacity>

                {/* Post Actions */}
                <View style={styles.postActions}>
                  <TouchableOpacity
                    onPress={() => handleLike(item.id)}
                    style={styles.postAction}
                  >
                    <Ionicons
                      name={item.isLiked ? "heart" : "heart-outline"}
                      size={24}
                      color={item.isLiked ? "#FF3040" : "#000"}
                    />
                    <Text style={styles.actionCount}>{item.likesCount}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => openPostModal(item)}
                    style={styles.postAction}
                  >
                    <Ionicons name="chatbubble-outline" size={22} />
                    <Text style={styles.actionCount}>{item.commentsCount}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.postAction}>
                    <Ionicons name="paper-plane-outline" size={22} />
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.postAction}>
                    <Ionicons name="bookmark-outline" size={22} />
                  </TouchableOpacity>
                </View>

                {/* Post Caption */}
                <Text style={styles.postCaption}>
                  <Text style={styles.captionUsername}>
                    {profile.name || "User"}
                  </Text>{" "}
                  {item.caption}
                </Text>

                {/* View Comments */}
                {item.commentsCount > 0 && (
                  <TouchableOpacity onPress={() => openPostModal(item)}>
                    <Text style={styles.viewComments}>
                      View all {item.commentsCount} comments
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          />
        )}

        {/* INFORMATION TAB CONTENT */}
        {activeTab === "info" && (
          <View style={styles.infoContainer}>
            {/* Personal Information */}
            <View style={styles.infoSection}>
              <Text style={styles.sectionTitle}>Personal Information</Text>
              {profileInfo.fullName && (
                <InfoRow label="Full Name" value={profileInfo.fullName} />
              )}
              {profileInfo.age && (
                <InfoRow label="Age" value={profileInfo.age} />
              )}
              {profileInfo.city && (
                <InfoRow label="City" value={profileInfo.city} />
              )}
              {profileInfo.height && (
                <InfoRow label="Height" value={profileInfo.height} />
              )}
              {profileInfo.weight && (
                <InfoRow label="Weight" value={profileInfo.weight} />
              )}
              {profileInfo.bust && (
                <InfoRow label="Bust" value={profileInfo.bust} />
              )}
              {profileInfo.waist && (
                <InfoRow label="Waist" value={profileInfo.waist} />
              )}
              {profileInfo.hips && (
                <InfoRow label="Hips" value={profileInfo.hips} />
              )}
              {profileInfo.skinTone && (
                <InfoRow label="Skin Tone" value={profileInfo.skinTone} />
              )}
              {profileInfo.eyeColor && (
                <InfoRow label="Eye Color" value={profileInfo.eyeColor} />
              )}
              {profileInfo.hairColor && (
                <InfoRow label="Hair Color" value={profileInfo.hairColor} />
              )}
              {profileInfo.shoeSize && (
                <InfoRow label="Shoe Size" value={profileInfo.shoeSize} />
              )}
              {profileInfo.maritalStatus && (
                <InfoRow
                  label="Marital Status"
                  value={profileInfo.maritalStatus}
                />
              )}
              {profileInfo.presentProfession && (
                <InfoRow
                  label="Present Profession"
                  value={profileInfo.presentProfession}
                />
              )}
              {profileInfo.education && (
                <InfoRow label="Education" value={profileInfo.education} />
              )}
              {profileInfo.dressesComfortableWith && (
                <InfoRow
                  label="Dresses Comfortable With"
                  value={profileInfo.dressesComfortableWith}
                />
              )}
              <InfoRow
                label="Open for Outstation Shoots"
                value={profileInfo.openForOutstationShoots ? "Yes" : "No"}
              />
              <InfoRow
                label="Open for Out of Country Shoots"
                value={profileInfo.openForOutOfCountryShoots ? "Yes" : "No"}
              />
              <InfoRow
                label="Passport"
                value={profileInfo.passport ? "Yes" : "No"}
              />
              <InfoRow
                label="Experienced"
                value={profileInfo.experienced ? "Yes" : "No"}
              />
              <InfoRow
                label="Comfortable with all Timings"
                value={profileInfo.comfortableWithAllTimings ? "Yes" : "No"}
              />
            </View>

            {/* Interests */}
            <View style={styles.infoSection}>
              <Text style={styles.sectionTitle}>Interests</Text>
              <InfoRow
                label="Acting"
                value={profileInfo.acting ? "Yes" : "No"}
              />
              <InfoRow
                label="Print Shoot"
                value={profileInfo.printShoot ? "Yes" : "No"}
              />
              <InfoRow
                label="Ramp Shows"
                value={profileInfo.rampShows ? "Yes" : "No"}
              />
              <InfoRow
                label="Designer Shoots"
                value={profileInfo.designerShoots ? "Yes" : "No"}
              />
              <InfoRow
                label="Calendar Shoots"
                value={profileInfo.calendarShoots ? "Yes" : "No"}
              />
              <InfoRow
                label="Music Albums"
                value={profileInfo.musicAlbums ? "Yes" : "No"}
              />
            </View>

            {/* Comfortable With */}
            <View style={styles.infoSection}>
              <Text style={styles.sectionTitle}>Comfortable With</Text>
              <InfoRow
                label="Indian Wear"
                value={profileInfo.indianWear ? "Yes" : "No"}
              />
              <InfoRow
                label="Western"
                value={profileInfo.western ? "Yes" : "No"}
              />
              <InfoRow label="Skirt" value={profileInfo.skirt ? "Yes" : "No"} />
              <InfoRow
                label="Bikini"
                value={profileInfo.bikini ? "Yes" : "No"}
              />
              <InfoRow
                label="Shorts"
                value={profileInfo.shorts ? "Yes" : "No"}
              />
              <InfoRow
                label="Bold Scenes"
                value={profileInfo.boldScenes ? "Yes" : "No"}
              />
              <InfoRow
                label="Able to work indoor/outdoor"
                value={profileInfo.ableToWorkIndoorOutdoor ? "Yes" : "No"}
              />
              <InfoRow
                label="Allergies to Dust/Cosmetics"
                value={profileInfo.allergiesToDustOrCosmetics ? "Yes" : "No"}
              />
              <InfoRow
                label="Topless"
                value={profileInfo.topless ? "Yes" : "No"}
              />
              <InfoRow label="Nude" value={profileInfo.nude ? "Yes" : "No"} />
            </View>

            {/* Languages */}
            {profileInfo.languagesKnown && (
              <View style={styles.infoSection}>
                <Text style={styles.sectionTitle}>Languages Known</Text>
                <Text style={styles.languagesText}>
                  {profileInfo.languagesKnown}
                </Text>
              </View>
            )}

            <TouchableOpacity
              style={styles.editFullInfoButton}
              onPress={() => setEditInfoVisible(true)}
            >
              <Text style={styles.editFullInfoText}>Edit All Information</Text>
            </TouchableOpacity>
          </View>
        )}

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* EDIT PROFILE MODAL */}
      <Modal visible={editVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Basic Info</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              style={styles.input}
              placeholder="Name"
            />
            <TextInput
              value={email}
              onChangeText={setEmail}
              style={styles.input}
              placeholder="Email"
              keyboardType="email-address"
            />
            <TextInput
              value={about}
              onChangeText={setAbout}
              style={[styles.input, styles.textArea]}
              placeholder="About"
              multiline
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButtonModal}
                onPress={() => setEditVisible(false)}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSaveProfile}
              >
                <Text style={styles.saveText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* EDIT INFORMATION MODAL */}
      <Modal visible={editInfoVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <ScrollView style={styles.editInfoModalContent}>
            <Text style={styles.modalTitle}>Edit Profile Information</Text>

            {/* Personal Information */}
            <Text style={styles.sectionHeader}>Personal Information</Text>
            <InfoInput
              label="Full Name"
              value={profileInfo.fullName}
              onChange={(v) => setProfileInfo({ ...profileInfo, fullName: v })}
            />
            <InfoInput
              label="Age"
              value={profileInfo.age}
              onChange={(v) => setProfileInfo({ ...profileInfo, age: v })}
            />
            <InfoInput
              label="City"
              value={profileInfo.city}
              onChange={(v) => setProfileInfo({ ...profileInfo, city: v })}
            />
            <InfoInput
              label="Height"
              value={profileInfo.height}
              onChange={(v) => setProfileInfo({ ...profileInfo, height: v })}
            />
            <InfoInput
              label="Weight"
              value={profileInfo.weight}
              onChange={(v) => setProfileInfo({ ...profileInfo, weight: v })}
            />
            <InfoInput
              label="Bust"
              value={profileInfo.bust}
              onChange={(v) => setProfileInfo({ ...profileInfo, bust: v })}
            />
            <InfoInput
              label="Waist"
              value={profileInfo.waist}
              onChange={(v) => setProfileInfo({ ...profileInfo, waist: v })}
            />
            <InfoInput
              label="Hips"
              value={profileInfo.hips}
              onChange={(v) => setProfileInfo({ ...profileInfo, hips: v })}
            />
            <InfoInput
              label="Skin Tone"
              value={profileInfo.skinTone}
              onChange={(v) => setProfileInfo({ ...profileInfo, skinTone: v })}
            />
            <InfoInput
              label="Eye Color"
              value={profileInfo.eyeColor}
              onChange={(v) => setProfileInfo({ ...profileInfo, eyeColor: v })}
            />
            <InfoInput
              label="Hair Color"
              value={profileInfo.hairColor}
              onChange={(v) => setProfileInfo({ ...profileInfo, hairColor: v })}
            />
            <InfoInput
              label="Shoe Size"
              value={profileInfo.shoeSize}
              onChange={(v) => setProfileInfo({ ...profileInfo, shoeSize: v })}
            />
            <InfoInput
              label="Marital Status"
              value={profileInfo.maritalStatus}
              onChange={(v) =>
                setProfileInfo({ ...profileInfo, maritalStatus: v })
              }
            />
            <InfoInput
              label="Present Profession"
              value={profileInfo.presentProfession}
              onChange={(v) =>
                setProfileInfo({ ...profileInfo, presentProfession: v })
              }
            />
            <InfoInput
              label="Education"
              value={profileInfo.education}
              onChange={(v) => setProfileInfo({ ...profileInfo, education: v })}
            />
            <InfoInput
              label="Dresses Comfortable With"
              value={profileInfo.dressesComfortableWith}
              onChange={(v) =>
                setProfileInfo({ ...profileInfo, dressesComfortableWith: v })
              }
            />
            <SwitchRow
              label="Open for Outstation Shoots"
              value={profileInfo.openForOutstationShoots}
              onChange={(v) =>
                setProfileInfo({ ...profileInfo, openForOutstationShoots: v })
              }
            />
            <SwitchRow
              label="Open for Out of Country Shoots"
              value={profileInfo.openForOutOfCountryShoots}
              onChange={(v) =>
                setProfileInfo({ ...profileInfo, openForOutOfCountryShoots: v })
              }
            />
            <SwitchRow
              label="Passport"
              value={profileInfo.passport}
              onChange={(v) => setProfileInfo({ ...profileInfo, passport: v })}
            />
            <SwitchRow
              label="Experienced"
              value={profileInfo.experienced}
              onChange={(v) =>
                setProfileInfo({ ...profileInfo, experienced: v })
              }
            />
            <SwitchRow
              label="Comfortable with all Timings"
              value={profileInfo.comfortableWithAllTimings}
              onChange={(v) =>
                setProfileInfo({ ...profileInfo, comfortableWithAllTimings: v })
              }
            />

            {/* Interests */}
            <Text style={styles.sectionHeader}>Interests</Text>
            <SwitchRow
              label="Acting"
              value={profileInfo.acting}
              onChange={(v) => setProfileInfo({ ...profileInfo, acting: v })}
            />
            <SwitchRow
              label="Print Shoot"
              value={profileInfo.printShoot}
              onChange={(v) =>
                setProfileInfo({ ...profileInfo, printShoot: v })
              }
            />
            <SwitchRow
              label="Ramp Shows"
              value={profileInfo.rampShows}
              onChange={(v) => setProfileInfo({ ...profileInfo, rampShows: v })}
            />
            <SwitchRow
              label="Designer Shoots"
              value={profileInfo.designerShoots}
              onChange={(v) =>
                setProfileInfo({ ...profileInfo, designerShoots: v })
              }
            />
            <SwitchRow
              label="Calendar Shoots"
              value={profileInfo.calendarShoots}
              onChange={(v) =>
                setProfileInfo({ ...profileInfo, calendarShoots: v })
              }
            />
            <SwitchRow
              label="Music Albums"
              value={profileInfo.musicAlbums}
              onChange={(v) =>
                setProfileInfo({ ...profileInfo, musicAlbums: v })
              }
            />

            {/* Comfortable With */}
            <Text style={styles.sectionHeader}>Comfortable With</Text>
            <SwitchRow
              label="Indian Wear"
              value={profileInfo.indianWear}
              onChange={(v) =>
                setProfileInfo({ ...profileInfo, indianWear: v })
              }
            />
            <SwitchRow
              label="Western"
              value={profileInfo.western}
              onChange={(v) => setProfileInfo({ ...profileInfo, western: v })}
            />
            <SwitchRow
              label="Skirt"
              value={profileInfo.skirt}
              onChange={(v) => setProfileInfo({ ...profileInfo, skirt: v })}
            />
            <SwitchRow
              label="Bikini"
              value={profileInfo.bikini}
              onChange={(v) => setProfileInfo({ ...profileInfo, bikini: v })}
            />
            <SwitchRow
              label="Shorts"
              value={profileInfo.shorts}
              onChange={(v) => setProfileInfo({ ...profileInfo, shorts: v })}
            />
            <SwitchRow
              label="Bold Scenes"
              value={profileInfo.boldScenes}
              onChange={(v) =>
                setProfileInfo({ ...profileInfo, boldScenes: v })
              }
            />
            <SwitchRow
              label="Able to work indoor/outdoor"
              value={profileInfo.ableToWorkIndoorOutdoor}
              onChange={(v) =>
                setProfileInfo({ ...profileInfo, ableToWorkIndoorOutdoor: v })
              }
            />
            <SwitchRow
              label="Allergies to Dust/Cosmetics"
              value={profileInfo.allergiesToDustOrCosmetics}
              onChange={(v) =>
                setProfileInfo({
                  ...profileInfo,
                  allergiesToDustOrCosmetics: v,
                })
              }
            />
            <SwitchRow
              label="Topless"
              value={profileInfo.topless}
              onChange={(v) => setProfileInfo({ ...profileInfo, topless: v })}
            />
            <SwitchRow
              label="Nude"
              value={profileInfo.nude}
              onChange={(v) => setProfileInfo({ ...profileInfo, nude: v })}
            />

            {/* Languages */}
            <Text style={styles.sectionHeader}>Languages Known</Text>
            <InfoInput
              label=""
              value={profileInfo.languagesKnown}
              onChange={(v) =>
                setProfileInfo({ ...profileInfo, languagesKnown: v })
              }
              placeholder="e.g., Hindi, English"
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButtonModal}
                onPress={() => setEditInfoVisible(false)}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSaveProfileInfo}
              >
                <Text style={styles.saveText}>Save</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* POST DETAIL MODAL */}
      <Modal visible={postModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.postModalContent}>
            {selectedPost && (
              <>
                {/* Post Header */}
                <View style={styles.postHeader}>
                  <Image
                    source={{ uri: profile.avatar || DUMMY_PROFILE.avatar }}
                    style={styles.postAvatar}
                  />
                  <View>
                    <Text style={styles.postUsername}>
                      {profile.name || "User"}
                    </Text>
                    <Text style={styles.postTime}>
                      {selectedPost.createdAt}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={() => setPostModalVisible(false)}
                  >
                    <Ionicons name="close" size={24} />
                  </TouchableOpacity>
                </View>

                {/* Post Image */}
                <Image
                  source={{ uri: selectedPost.image }}
                  style={styles.postModalImage}
                />

                {/* Post Actions */}
                <View style={styles.postActions}>
                  <TouchableOpacity
                    onPress={() => handleLike(selectedPost.id)}
                    style={styles.postAction}
                  >
                    <Ionicons
                      name={selectedPost.isLiked ? "heart" : "heart-outline"}
                      size={24}
                      color={selectedPost.isLiked ? "#FF3040" : "#000"}
                    />
                    <Text style={styles.actionCount}>
                      {selectedPost.likesCount}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.postAction}>
                    <Ionicons name="chatbubble-outline" size={22} />
                    <Text style={styles.actionCount}>
                      {selectedPost.commentsCount}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.postAction}>
                    <Ionicons name="paper-plane-outline" size={22} />
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.postAction}>
                    <Ionicons name="bookmark-outline" size={22} />
                  </TouchableOpacity>
                </View>

                {/* Post Caption */}
                <Text style={styles.postCaption}>
                  <Text style={styles.captionUsername}>
                    {profile.name || "User"}
                  </Text>{" "}
                  {selectedPost.caption}
                </Text>

                {/* Comments */}
                <View style={styles.commentsSection}>
                  <Text style={styles.commentsTitle}>Comments</Text>
                  <FlatList
                    data={selectedPost.comments}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                      <View style={styles.commentItem}>
                        <Text style={styles.commentUser}>
                          {item.user.name}:
                        </Text>
                        <Text style={styles.commentText}>{item.text}</Text>
                      </View>
                    )}
                    style={styles.commentsList}
                  />
                </View>

                {/* Add Comment */}
                <View style={styles.addCommentContainer}>
                  <TextInput
                    value={commentText}
                    onChangeText={setCommentText}
                    placeholder="Add a comment..."
                    style={styles.commentInput}
                  />
                  <TouchableOpacity onPress={submitComment}>
                    <Text style={styles.postCommentText}>Post</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

// Helper Components
const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.infoRow}>
    <Text style={styles.infoLabel}>{label}:</Text>
    <Text style={styles.infoValue}>{value}</Text>
  </View>
);

const InfoInput = ({
  label,
  value,
  onChange,
  placeholder = "",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) => (
  <View style={styles.inputRow}>
    {label ? <Text style={styles.inputLabel}>{label}:</Text> : null}
    <TextInput
      style={[styles.textInput, !label && styles.textInputFull]}
      value={value}
      onChangeText={onChange}
      placeholder={placeholder}
    />
  </View>
);

const SwitchRow = ({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
}) => (
  <View style={styles.switchRow}>
    <Text style={styles.switchLabel}>{label}:</Text>
    <Switch
      value={value}
      onValueChange={onChange}
      trackColor={{ false: "#767577", true: "#81b0ff" }}
      thumbColor={value ? "#007AFF" : "#f4f3f4"}
    />
  </View>
);

const styles = StyleSheet.create({
  /* ================= ROOT ================= */
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scrollContainer: {
    flex: 1,
  },

  /* ================= PROFILE ================= */
  avatarWrapper: {
    alignItems: "center",
    marginTop: 24,
    marginBottom: 12,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
  },
  cameraIcon: {
    position: "absolute",
    bottom: 2,
    right: "42%",
    backgroundColor: "#000",
    color: "#fff",
    padding: 6,
    borderRadius: 20,
    overflow: "hidden",
  },

  name: {
    fontSize: 20,
    fontWeight: "600",
    textAlign: "center",
    marginTop: 8,
    color: "#111",
  },
  email: {
    fontSize: 13,
    color: "#777",
    textAlign: "center",
    marginTop: 2,
  },
  about: {
    fontSize: 14,
    color: "#444",
    textAlign: "center",
    marginTop: 8,
    paddingHorizontal: 20,
    lineHeight: 20,
  },

  buttonRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 14,
    marginBottom: 20,
    gap: 12,
  },
  editButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "#007AFF",
  },
  editText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "500",
  },
  editInfoButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "#34C759",
  },
  editInfoText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "500",
  },

  /* ================= TAB BAR ================= */
  tabContainer: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#eee",
    marginHorizontal: -16,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 12,
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: "#007AFF",
  },
  tabText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  activeTabText: {
    color: "#007AFF",
  },

  /* ================= POSTS ================= */
  postCard: {
    marginBottom: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingBottom: 12,
  },
  postHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
  },
  postAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
  },
  postUsername: {
    fontWeight: "600",
    fontSize: 14,
  },
  postTime: {
    fontSize: 12,
    color: "#666",
  },
  postImage: {
    width: width,
    height: width,
  },
  postActions: {
    flexDirection: "row",
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems: "center",
  },
  postAction: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
    gap: 4,
  },
  actionCount: {
    fontSize: 14,
    fontWeight: "500",
  },
  postCaption: {
    paddingHorizontal: 12,
    fontSize: 14,
    lineHeight: 18,
  },
  captionUsername: {
    fontWeight: "600",
  },
  viewComments: {
    paddingHorizontal: 12,
    color: "#666",
    fontSize: 14,
    marginTop: 4,
  },

  /* ================= INFORMATION ================= */
  infoContainer: {
    padding: 16,
  },
  infoSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111",
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f5f5f5",
  },
  infoLabel: {
    fontSize: 14,
    color: "#666",
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    color: "#111",
    flex: 1,
    textAlign: "right",
    fontWeight: "500",
  },
  languagesText: {
    fontSize: 14,
    color: "#111",
    paddingVertical: 8,
  },
  editFullInfoButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
    marginBottom: 24,
  },
  editFullInfoText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "500",
  },

  /* ================= LOGOUT ================= */
  logoutButton: {
    marginVertical: 30,
    marginHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "#FF3B30",
  },
  logoutText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "600",
    fontSize: 15,
  },

  /* ================= MODALS ================= */
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    padding: 16,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    maxHeight: "80%",
  },
  editInfoModalContent: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    maxHeight: "90%",
  },
  postModalContent: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 0,
    maxHeight: "90%",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
    textAlign: "center",
    color: "#111",
  },

  /* ================= INPUTS ================= */
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    marginBottom: 12,
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },

  /* ================= BUTTONS ================= */
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
    gap: 12,
  },
  saveButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    flex: 1,
  },
  saveText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "600",
    fontSize: 15,
  },
  cancelButtonModal: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    flex: 1,
  },
  cancelText: {
    textAlign: "center",
    color: "#888",
    fontSize: 14,
    fontWeight: "500",
  },

  /* ================= INFO SECTIONS ================= */
  sectionHeader: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginTop: 16,
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },

  /* ================= INPUT ROWS ================= */
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f5f5f5",
  },
  inputLabel: {
    fontSize: 14,
    color: "#666",
    width: 180,
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    marginLeft: 8,
  },
  textInputFull: {
    marginLeft: 0,
  },

  /* ================= SWITCH ROWS ================= */
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f5f5f5",
  },
  switchLabel: {
    fontSize: 14,
    color: "#666",
    flex: 1,
  },

  /* ================= POST MODAL ================= */
  postModalImage: {
    width: width,
    height: width,
  },
  closeButton: {
    position: "absolute",
    right: 12,
    top: 12,
    padding: 4,
  },
  commentsSection: {
    padding: 12,
    maxHeight: 200,
  },
  commentsTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  commentsList: {
    marginBottom: 12,
  },
  commentItem: {
    flexDirection: "row",
    marginBottom: 8,
    alignItems: "flex-start",
  },
  commentUser: {
    fontWeight: "600",
    fontSize: 14,
    marginRight: 4,
  },
  commentText: {
    fontSize: 14,
    flex: 1,
  },
  addCommentContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  commentInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    marginRight: 8,
  },
  postCommentText: {
    color: "#007AFF",
    fontWeight: "600",
    fontSize: 14,
  },
});
