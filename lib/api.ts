import axios from "axios";

export const BASE_URL = "http://192.168.1.20:8000"; // your backend URL

const api = axios.create({
  baseURL: BASE_URL,
});

export default api;

// import axios from "axios";

// const api = axios.create({
//   baseURL: "http://192.168.1.4:8000",

//   headers: {
//     "Content-Type": "application/json",
//   },
// });

// export default api;
