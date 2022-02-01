import axios from "axios";

export default axios.create({
  baseURL: "https://10.10.10.85:1348",
  timeout: 1000,
  headers: {
    "Content-Type": "application/json",
  },
  transformRequest: [
    (data) => {
      return JSON.stringify(data);
    },
  ],
});
