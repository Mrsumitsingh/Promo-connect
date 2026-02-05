import AsyncStorage from "@react-native-async-storage/async-storage";
import Echo from "laravel-echo";
import Pusher from "pusher-js";
import { Platform } from "react-native";
import { BASE_URL } from "./api";

// Enable Pusher logging in development
if (__DEV__) {
  Pusher.logToConsole = true;
}

const getWebSocketHost = () => {
  // Extract host from BASE_URL
  const url = new URL(BASE_URL);
  return url.hostname; // This returns '192.168.1.6'
};

const createEchoClient = async () => {
  try {
    const token = await AsyncStorage.getItem("token");

    if (!token) {
      console.warn("⚠️ No token found for Echo authentication");
    }

    const wsHost = getWebSocketHost();

    // ⚠️ CRITICAL: WebSocket uses port 6001, NOT 8000!
    const WS_PORT = 6001; // Laravel WebSocket default port

    console.log(`
    🚀 Echo Configuration:
    ----------------------
    API URL (HTTP):  ${BASE_URL}
    WebSocket URL:   ws://${wsHost}:${WS_PORT}
    Platform:        ${Platform.OS}
    Token Present:   ${!!token}
    `);

    // ✅ CORRECTED: Use port 6001 for WebSocket
    const pusher = new Pusher("9357b31316cf701e9e6c", {
      cluster: "ap2",
      wsHost: wsHost,
      wsPort: WS_PORT, // ⚠️ CHANGED: 6001 not 8000!
      wssPort: 443, // SSL port (not used in dev)
      forceTLS: false, // Must be false for ws://
      enabledTransports: ["ws"], // Only use 'ws', not 'wss'
      disableStats: true,
      authEndpoint: `${BASE_URL}/broadcasting/auth`,
      auth: {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      },
    });

    // Debug connection events
    pusher.connection.bind("connecting", () => {
      console.log(`🔄 Connecting to ws://${wsHost}:${WS_PORT}...`);
    });

    pusher.connection.bind("connected", () => {
      console.log("✅ Successfully connected to WebSocket server!");
    });

    pusher.connection.bind("disconnected", () => {
      console.log("❌ Disconnected from WebSocket server");
    });

    pusher.connection.bind("error", (error: any) => {
      console.error("❌ WebSocket error:", error);
    });

    const echo = new Echo({
      broadcaster: "pusher",
      client: pusher,
    });

    console.log("✅ Echo client initialized");
    return echo;
  } catch (error) {
    console.error("❌ Failed to create Echo client:", error);
    throw error;
  }
};

export default createEchoClient;
