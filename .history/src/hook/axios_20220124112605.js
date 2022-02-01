import axios from "axios";

export default axios.create({
  baseURL: "http://10.147.254.172:1348",
  headers: {
    "Content-Type": "application/json",
  },
  transformRequest: [
    (data) => {
      return JSON.stringify(data);
    },
  ],
});
