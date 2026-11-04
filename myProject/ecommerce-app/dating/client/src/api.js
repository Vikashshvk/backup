import axios from "axios";
import { io } from "socket.io-client";

export const API = axios.create({ baseURL: "http://localhost:5000/api" });

API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) req.headers.authorization = `Bearer ${token}`;
  return req;
});

export const socket = io("http://localhost:5000", { autoConnect: false });
