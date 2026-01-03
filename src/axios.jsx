//// Axios configuration (assuming it's in a separate file or your main entry point)
import axios from 'axios';

const instance = axios.create({
  baseURL: 'http://61.246.67.74:4000',  // Base URL for your backend
});

export default instance;
