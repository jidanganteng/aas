import axios from 'axios';

export const api = axios.create({
  baseURL: 'http://10.2.10.245:5000/api', // ganti IP kamu
});