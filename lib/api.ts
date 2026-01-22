import axios from "axios";

export const BASE_URL = "http://192.168.1.4:8000"; // your backend URL

const api = axios.create({
  baseURL: BASE_URL,
});

export default api;
