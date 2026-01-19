import api from "./api"; // axios instance

// Profile APIs
export const getProfile = async () => {
  return await api.get("/api/promoter/profile");
};

export const updateProfile = async (data: {
  name?: string;
  email?: string;
  about?: string;
  avatar?: string; // optional, URL or base64
}) => {
  return await api.put("/profile", data);
};

// Profile Information APIs
export const getProfileInfo = async () => {
  return await api.get("/api/promoter/profile/info");
};

export const updateProfileInfo = async (data: any) => {
  return await api.post("/api/promoter/profile/info", data);
};

// Posts APIs
export const getUserPosts = async () => {
  return await api.get("/api/promoter/posts");
};

export const getPostById = async (id: string) => {
  return await api.get(`/api/promoter/posts/${id}`);
};

export const likePost = async (postId: string) => {
  return await api.post(`/api/promoter/posts/${postId}/like`);
};

export const addComment = async (postId: string, text: string) => {
  return await api.post(`/api/promoter/posts/${postId}/comment`, { text });
};

// Events APIs
export const getMyEvents = async () => {
  return await api.get("/api/promoter/events/me");
};

// Upload profile image
export const uploadProfileImage = async (formData: FormData) => {
  return await api.post("/api/promoter/profile/avatar", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

// Add new post
export const addPost = async (formData: FormData) => {
  return await api.post("/api/promoter/posts", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

// Update post
export const updatePost = async (
  postId: string,
  data: {
    caption?: string;
    tags?: string[];
  },
) => {
  return await api.put(`/api/promoter/posts/${postId}`, data);
};

// Delete post
export const deletePost = async (postId: string) => {
  return await api.delete(`/api/promoter/posts/${postId}`);
};

// Delete comment
export const deleteComment = async (postId: string, commentId: string) => {
  return await api.delete(
    `/api/promoter/posts/${postId}/comments/${commentId}`,
  );
};

// Upload post media
export const uploadPostMedia = async (postId: string, formData: FormData) => {
  return await api.post(`/api/promoter/posts/${postId}/media`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

// Get post likes
export const getPostLikes = async (postId: string) => {
  return await api.get(`/api/promoter/posts/${postId}/likes`);
};

// Get post comments
export const getPostComments = async (postId: string) => {
  return await api.get(`/api/promoter/posts/${postId}/comments`);
};

// Share post
export const sharePost = async (postId: string) => {
  return await api.post(`/api/promoter/posts/${postId}/share`);
};

// Get post shares
export const getPostShares = async (postId: string) => {
  return await api.get(`/api/promoter/posts/${postId}/shares`);
};

// Save/Unsave post
export const savePost = async (postId: string) => {
  return await api.post(`/api/promoter/posts/${postId}/save`);
};

export const unsavePost = async (postId: string) => {
  return await api.delete(`/api/promoter/posts/${postId}/save`);
};

// Get saved posts
export const getSavedPosts = async () => {
  return await api.get("/api/promoter/posts/saved");
};

// Analytics for posts
export const getPostAnalytics = async (postId: string) => {
  return await api.get(`/api/promoter/posts/${postId}/analytics`);
};

// Get user stats
export const getUserStats = async () => {
  return await api.get("/api/promoter/profile/stats");
};

// Update user settings
export const updateUserSettings = async (data: {
  notifications?: boolean;
  privateAccount?: boolean;
  messagePermissions?: string;
}) => {
  return await api.put("/api/promoter/profile/settings", data);
};

// Get user followers
export const getFollowers = async () => {
  return await api.get("/api/promoter/profile/followers");
};

// Get user following
export const getFollowing = async () => {
  return await api.get("/api/promoter/profile/following");
};

// Follow/Unfollow user
export const followUser = async (userId: string) => {
  return await api.post(`/api/promoter/users/${userId}/follow`);
};

export const unfollowUser = async (userId: string) => {
  return await api.delete(`/api/promoter/users/${userId}/follow`);
};

// Search users
export const searchUsers = async (query: string) => {
  return await api.get(`/api/promoter/users/search?q=${query}`);
};

// Get user notifications
export const getNotifications = async () => {
  return await api.get("/api/promoter/notifications");
};

// Mark notification as read
export const markNotificationAsRead = async (notificationId: string) => {
  return await api.put(`/api/promoter/notifications/${notificationId}/read`);
};

// Delete notification
export const deleteNotification = async (notificationId: string) => {
  return await api.delete(`/api/promoter/notifications/${notificationId}`);
};

// Clear all notifications
export const clearNotifications = async () => {
  return await api.delete("/api/promoter/notifications");
};

// Get chat conversations
export const getConversations = async () => {
  return await api.get("/api/promoter/chat/conversations");
};

// Get messages for a conversation
export const getMessages = async (conversationId: string) => {
  return await api.get(
    `/api/promoter/chat/conversations/${conversationId}/messages`,
  );
};

// Send message
export const sendMessage = async (conversationId: string, text: string) => {
  return await api.post(
    `/api/promoter/chat/conversations/${conversationId}/messages`,
    { text },
  );
};

// Create new conversation
export const createConversation = async (userId: string) => {
  return await api.post("/api/promoter/chat/conversations", { userId });
};

// Delete conversation
export const deleteConversation = async (conversationId: string) => {
  return await api.delete(`/api/promoter/chat/conversations/${conversationId}`);
};

// Report user
export const reportUser = async (userId: string, reason: string) => {
  return await api.post("/api/promoter/reports/users", { userId, reason });
};

// Report post
export const reportPost = async (postId: string, reason: string) => {
  return await api.post("/api/promoter/reports/posts", { postId, reason });
};

// Block user
export const blockUser = async (userId: string) => {
  return await api.post(`/api/promoter/users/${userId}/block`);
};

// Unblock user
export const unblockUser = async (userId: string) => {
  return await api.delete(`/api/promoter/users/${userId}/block`);
};

// Get blocked users
export const getBlockedUsers = async () => {
  return await api.get("/api/promoter/profile/blocked");
};

// Verify account
export const verifyAccount = async (data: {
  documentType: string;
  documentFront: File;
  documentBack?: File;
  selfie: File;
}) => {
  const formData = new FormData();
  formData.append("documentType", data.documentType);
  formData.append("documentFront", data.documentFront);
  if (data.documentBack) {
    formData.append("documentBack", data.documentBack);
  }
  formData.append("selfie", data.selfie);

  return await api.post("/api/promoter/profile/verify", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

// Get verification status
export const getVerificationStatus = async () => {
  return await api.get("/api/promoter/profile/verification-status");
};

// Change password
export const changePassword = async (data: {
  currentPassword: string;
  newPassword: string;
}) => {
  return await api.post("/api/promoter/profile/change-password", data);
};

// Delete account
export const deleteAccount = async () => {
  return await api.delete("/api/promoter/profile");
};

// Export data
export const exportData = async () => {
  return await api.get("/api/promoter/profile/export", {
    responseType: "blob",
  });
};

// Get activity log
export const getActivityLog = async (page = 1, limit = 20) => {
  return await api.get(
    `/api/promoter/profile/activity?page=${page}&limit=${limit}`,
  );
};

// Upload multiple images for post
export const uploadMultiplePostImages = async (
  postId: string,
  images: File[],
) => {
  const formData = new FormData();
  images.forEach((image, index) => {
    formData.append(`images[${index}]`, image);
  });

  return await api.post(`/api/promoter/posts/${postId}/images`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

// Add video to post
export const addVideoToPost = async (postId: string, video: File) => {
  const formData = new FormData();
  formData.append("video", video);

  return await api.post(`/api/promoter/posts/${postId}/video`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

// Get trending posts
export const getTrendingPosts = async () => {
  return await api.get("/api/promoter/posts/trending");
};

// Get suggested users to follow
export const getSuggestedUsers = async () => {
  return await api.get("/api/promoter/users/suggested");
};

// Get user badges/achievements
export const getUserBadges = async () => {
  return await api.get("/api/promoter/profile/badges");
};

// Update user preferences
export const updateUserPreferences = async (data: {
  theme?: string;
  language?: string;
  timezone?: string;
  currency?: string;
}) => {
  return await api.put("/api/promoter/profile/preferences", data);
};
