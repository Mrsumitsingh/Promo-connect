// lib/echo.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import Echo from "laravel-echo";
import Pusher from "pusher-js";
import { BASE_URL } from "./api";

const API_URL = "http://127.0.0.1:8000"; // 🔥 CHANGE if needed

const echo = async () => {
  const token = await AsyncStorage.getItem("token");

  return new Echo({
    broadcaster: "pusher",

    key: "9357b31316cf701e9e6c",
    cluster: "ap2",

    wsHost: "127.0.0.1", // SAME machine as Laravel WebSocket
    wsPort: 6001,
    wssPort: 6001,

    forceTLS: false,
    encrypted: false,
    disableStats: true,
    enabledTransports: ["ws", "wss"],

    client: new Pusher("9357b31316cf701e9e6c", {
      cluster: "ap2",
      forceTLS: false,
    }),

    // ✅ THIS IS THE REAL FIX
    authEndpoint: `${BASE_URL}/broadcasting/auth`,
    auth: {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    },
  });
};

export default echo;
