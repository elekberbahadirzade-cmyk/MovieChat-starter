
import React, { createContext, useContext, useState } from "react";
import api, { setToken } from "../api";
import { cfg } from "../env";
import { mockApi } from "../mock";
import { User } from "../types";

type AuthCtx = {
  user?: User;
  token?: string;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, username: string) => Promise<void>;
  logout: () => void;
};

const Ctx = createContext<AuthCtx>(null as any);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | undefined>();
  const [token, setTok] = useState<string | undefined>();

  const login = async (email: string, password: string) => {
    if (cfg.mock) {
      const res = await mockApi.login(email, password);
      setUser(res.user); setTok(res.token); setToken(res.token);
    } else {
      const { data } = await api.post("/auth/login", { email, password });
      setUser(data.user); setTok(data.token); setToken(data.token);
    }
  };

  const register = async (email: string, password: string, username: string) => {
    if (cfg.mock) {
      const res = await mockApi.register(email, password, username);
      setUser(res.user); setTok(res.token); setToken(res.token);
    } else {
      const { data } = await api.post("/auth/register", { email, password, username });
      setUser(data.user); setTok(data.token); setToken(data.token);
    }
  };

  const logout = () => { setUser(undefined); setTok(undefined); setToken(undefined); };

  return <Ctx.Provider value={{ user, token, login, register, logout }}>{children}</Ctx.Provider>;
};

export const useAuth = () => useContext(Ctx);
