console.log('🛰️  API base URL =', process.env.REACT_APP_API_URL);

import axios from 'axios';
// pick up REACT_APP_API_URL, fallback to localhost
const API_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:5000';
const BASE    = `${API_URL}/api`;

export const fetchAllResults = () =>
  axios.get(`${BASE}/results`);

export const predict = data =>
  axios.post(`${BASE}/predict`, data);
