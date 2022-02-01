import axios from 'axios';

export default axios.create({
  baseURL: 'http://127.0.0.1/',
  headers: {
    'Content-Type': 'application/json',
  },
  transformRequest: [
    data => {
      return JSON.stringify(data);
    },
  ],
});
