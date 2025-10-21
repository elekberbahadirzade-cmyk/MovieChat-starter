
import axios from "axios";
import { cfg } from "./env";

const api = axios.create({ baseURL: cfg.apiBase });

export function setToken(token?: string) {
  if (token) api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  else delete api.defaults.headers.common["Authorization"];
}

export default api;
