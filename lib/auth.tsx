import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { createContext, useContext, useEffect, useState } from "react";
import api from "./api";

type Role = "client" | "promoter";

interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (
    name: string,
    email: string,
    password: string,
    role: Role,
  ) => Promise<void>;
  logout: () => Promise<void>;
  navigateBasedOnRole: (role: Role) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Exportable logout function - can be imported directly
export const logout = async () => {
  try {
    await AsyncStorage.removeItem("token");
    delete api.defaults.headers.common["Authorization"];
    router.replace("/(auth)/login");
  } catch (error) {
    console.error("Error in logout:", error);
  }
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  useEffect(() => {
    if (user?.role) {
      navigateBasedOnRole(user.role);
    }
  }, [user]);

  const loadUser = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("token");

      if (!token) {
        setLoading(false);
        return;
      }

      // Set token in headers
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      // Don't call API - just set minimal user object
      setUser({
        id: 0,
        name: "User",
        email: "",
        role: "client", // Default role
      });
    } catch (error) {
      console.log("Error loading user:", error);
      await AsyncStorage.removeItem("token");
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const res = await api.post("/api/v1/auth/login", { email, password });
      const { token, user: userData } = res.data;

      await AsyncStorage.setItem("token", token);
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      setUser(userData);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Login failed");
    }
  };

  const signup = async (
    name: string,
    email: string,
    password: string,
    role: Role,
  ) => {
    try {
      console.log("Attempting signup with:", { name, email, role });

      const res = await api.post("/api/v1/auth/register", {
        name,
        email,
        password,
        role,
      });

      console.log("Signup response:", res.data);

      const { token, user: userData } = res.data;

      await AsyncStorage.setItem("token", token);
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      setUser(userData);

      return userData;
    } catch (error: any) {
      console.error("Signup API error:", error.response?.data || error.message);
      throw new Error(error.response?.data?.message || "Signup failed");
    }
  };
  // Context logout function - also updates state
  const contextLogout = async () => {
    await logout(); // Use the exportable logout
    setUser(null); // Clear user state
  };

  const navigateBasedOnRole = (role: Role) => {
    if (role === "client") {
      router.replace("/(client)/home");
    } else if (role === "promoter") {
      router.replace("/(promoter)/home");
    } else {
      router.replace("/(auth)/login");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        signup,
        logout: contextLogout, // Use context version
        navigateBasedOnRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

// Add this function at the end for getRole
export const getRole = async (): Promise<string | null> => {
  try {
    const token = await AsyncStorage.getItem("token");
    return token ? "client" : null;
  } catch (error) {
    console.error("Error getting role:", error);
    return null;
  }
};
