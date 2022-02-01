import axios from "axios";

export default axios.create({
  baseURL: "http://10.10.10.85:1348",
  headers: {
    "Content-Type": "application/json",
  },
  transformRequest: [
    (data) => {
      return JSON.stringify(data);
    },
  ],
});
