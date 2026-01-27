import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "./api";

const authHeader = async () => {
  const token = await AsyncStorage.getItem("token");
  console.log("TOKEN:", token);

  return {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  };
};

// 🔹 GET ALL BRANDS
export const getAllBrands = async () => {
  const config = await authHeader();
  return api.get("/api/v1/brand/profile", config);
};

// 🔹 GET ALL CAMPAIGNS / EVENTS
export const getAllCampaigns = async () => {
  const config = await authHeader();
  return api.get("/api/v1/brand/events", config);
};
