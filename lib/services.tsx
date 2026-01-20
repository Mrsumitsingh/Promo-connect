import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "./api";

/* =========================
   Auth Header
========================= */
const authHeader = async () => {
  const token = await AsyncStorage.getItem("token");

  return {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  };
};

/* =========================
   PROFILE APIs
========================= */

// Get profile
export const getProfileInfo = async () => {
  const config = await authHeader();
  return api.get("/api/v1/profile", config);
};

// 🔥 HARD FIX: Laravel-safe update (NO PUT ANYWHERE)
export const updateProfile = async (data: any) => {
  const config = await authHeader();

  const formData = new FormData();

  Object.entries(data).forEach(([key, value]) => {
    if (value !== "" && value !== null && value !== undefined) {
      formData.append(key, String(value));
    }
  });

  // Laravel method override
  formData.append("_method", "PUT");

  return api.post("/api/v1/profile", formData, {
    ...config,
    headers: {
      ...config.headers,
      "Content-Type": "multipart/form-data",
    },
  });
};

// Upload profile image
// export const uploadProfileImage = async (formData: FormData) => {
//   const config = await authHeader();

//   return api.post("/api/v1/profile/upload-document", formData, {
//     ...config,
//     headers: {
//       ...config.headers,
//       "Content-Type": "multipart/form-data",
//     },
//   });
// };
export const uploadProfileImage = async (formData: FormData) => {
  const token = await AsyncStorage.getItem("token");

  return api.post("/api/v1/profile/upload-document", formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
      "Content-Type": "multipart/form-data",
    },
  });
};

/* =========================
   POSTS APIs
========================= */

// export const getUserPosts = async () => {
//   const config = await authHeader();
//   return api.get("/api/v1/posts", config);
// };
