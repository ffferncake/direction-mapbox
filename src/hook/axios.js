import axios from "axios";

export default axios.create({
  baseURL: "http://localhost:1348",
  headers: {
    "Content-Type": "application/json",
  },
  transformRequest: [
    (data) => {
      return JSON.stringify(data);
    },
  ],
});
