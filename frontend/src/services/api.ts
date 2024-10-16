// src/services/api.ts
import axios from 'axios';

const API_URL = 'http://localhost:8000/api/users/';

export const login = (username: string, password: string) => {
  return axios.post(`${API_URL}login/`, { username, password });
};

export const register = (username: string, email: string, password: string) => {
  return axios.post(`${API_URL}register/`, { username, email, password });
};

export {};
