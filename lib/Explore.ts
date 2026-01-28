import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "./api";

const authHeader = async () => {
  const token = await AsyncStorage.getItem("token");
  return {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  };
};

/* ===========================
   EXPLORE API FUNCTIONS
=========================== */

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

/* ===========================
   BRAND PROFILE API FUNCTIONS
=========================== */

// 🔹 GET SINGLE BRAND DETAILS
// Since your API returns all brands, we'll filter by ID
export const getBrandById = async (brandId: string) => {
  const config = await authHeader();

  try {
    // First try if there's a direct endpoint
    return await api.get(`/api/v1/brand/${brandId}`, config);
  } catch (error) {
    console.log("Direct brand endpoint not found, filtering from all brands");

    // Fallback: Get all brands and filter
    const allBrandsResponse = await getAllBrands();

    if (allBrandsResponse?.data?.data) {
      const brand = allBrandsResponse.data.data.find(
        (b: any) => String(b.id) === String(brandId),
      );

      if (brand) {
        return {
          data: {
            data: brand,
            success: true,
          },
        };
      }
    }

    throw new Error(`Brand with ID ${brandId} not found`);
  }
};

// 🔹 GET BRAND PROFILE WITH DETAILS
export const getBrandProfileWithDetails = async (brandId: string) => {
  try {
    const response = await getBrandById(brandId);

    if (response?.data?.data) {
      // Process the brand data from your API structure
      const brandData = response.data.data;

      // Extract and format brand details
      const formattedBrand = {
        id: brandData.id,
        user_id: brandData.user_id,
        type: brandData.type,
        basic_info: brandData.basic_info,
        professional_info: brandData.professional_info,
        preferences: brandData.preferences,
        settings: brandData.settings,
        rating: parseFloat(brandData.rating) || 0,
        review_count: brandData.review_count || 0,
        completion_rate: brandData.completion_rate || 0,
        is_active: brandData.is_active,
        created_at: brandData.created_at,
        updated_at: brandData.updated_at,

        // Brand details
        company_name: brandData.brand_detail?.company_name || "Unknown Brand",
        gst_number: brandData.brand_detail?.gst_number,
        industry: brandData.brand_detail?.industry,
        company_size: brandData.brand_detail?.company_size,
        website: brandData.brand_detail?.website,
        social_profiles: brandData.brand_detail?.social_profiles,
        verification_docs: brandData.brand_detail?.verification_docs,
        brand_score: parseFloat(brandData.brand_detail?.brand_score || "0"),
        promoter_satisfaction_rate: parseFloat(
          brandData.brand_detail?.promoter_satisfaction_rate || "0",
        ),

        // Additional calculated fields
        followers_count: 0, // You might need a separate endpoint for this
        campaigns_count: 0, // You might need a separate endpoint for this
      };

      return {
        data: {
          data: formattedBrand,
          success: true,
        },
      };
    }

    throw new Error("No brand data found");
  } catch (error) {
    console.error("Error getting brand profile:", error);
    throw error;
  }
};

// 🔹 UPDATE BRAND PROFILE
export const updateBrandProfile = async (brandId: string, data: any) => {
  const config = await authHeader();

  const formData = new FormData();

  // Add all data to formData
  Object.entries(data).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      formData.append(key, String(value));
    }
  });

  // Laravel method override for PUT
  formData.append("_method", "PUT");

  return api.post(`/api/v1/brand/${brandId}`, formData, {
    ...config,
    headers: {
      ...config.headers,
      "Content-Type": "multipart/form-data",
    },
  });
};

// 🔹 FOLLOW BRAND
export const followBrand = async (brandId: string) => {
  const config = await authHeader();
  return api.post(`/api/v1/brand/${brandId}/follow`, {}, config);
};

// 🔹 UNFOLLOW BRAND
export const unfollowBrand = async (brandId: string) => {
  const config = await authHeader();
  return api.post(`/api/v1/brand/${brandId}/unfollow`, {}, config);
};

// 🔹 GET BRAND CAMPAIGNS
export const getBrandCampaigns = async (brandId: string) => {
  const config = await authHeader();
  return api.get(`/api/v1/brand/${brandId}/campaigns`, config);
};

// 🔹 GET BRAND FOLLOWERS
export const getBrandFollowers = async (brandId: string) => {
  const config = await authHeader();
  return api.get(`/api/v1/brand/${brandId}/followers`, config);
};

// 🔹 GET BRAND REVIEWS
export const getBrandReviews = async (brandId: string) => {
  const config = await authHeader();
  return api.get(`/api/v1/brand/${brandId}/reviews`, config);
};

// 🔹 GET BRAND STATS
export const getBrandStats = async (brandId: string) => {
  const config = await authHeader();
  return api.get(`/api/v1/brand/${brandId}/stats`, config);
};

// 🔹 CHECK FOLLOW STATUS
export const checkFollowStatus = async (brandId: string) => {
  const config = await authHeader();

  try {
    return await api.get(`/api/v1/brand/${brandId}/follow-status`, config);
  } catch (error) {
    // Return default if endpoint doesn't exist
    return {
      data: {
        is_following: false,
        success: true,
      },
    };
  }
};

/* ===========================
   SEARCH & FILTER FUNCTIONS
=========================== */

// 🔹 SEARCH BRANDS
export const searchBrands = async (query: string) => {
  const config = await authHeader();

  try {
    return await api.get(
      `/api/v1/brand/search?q=${encodeURIComponent(query)}`,
      config,
    );
  } catch (error) {
    // Fallback to filtering locally
    const allBrands = await getAllBrands();
    if (allBrands?.data?.data) {
      const filtered = allBrands.data.data.filter((brand: any) => {
        const companyName = brand.brand_detail?.company_name || "";
        const industry = brand.brand_detail?.industry || "";
        return (
          companyName.toLowerCase().includes(query.toLowerCase()) ||
          industry.toLowerCase().includes(query.toLowerCase())
        );
      });

      return {
        data: {
          data: filtered,
          success: true,
        },
      };
    }

    return {
      data: {
        data: [],
        success: true,
      },
    };
  }
};

// 🔹 GET BRANDS BY INDUSTRY
export const getBrandsByIndustry = async (industry: string) => {
  const config = await authHeader();

  try {
    return await api.get(`/api/v1/brand/industry/${industry}`, config);
  } catch (error) {
    // Fallback to filtering locally
    const allBrands = await getAllBrands();
    if (allBrands?.data?.data) {
      const filtered = allBrands.data.data.filter(
        (brand: any) => brand.brand_detail?.industry === industry,
      );

      return {
        data: {
          data: filtered,
          success: true,
        },
      };
    }

    return {
      data: {
        data: [],
        success: true,
      },
    };
  }
};
