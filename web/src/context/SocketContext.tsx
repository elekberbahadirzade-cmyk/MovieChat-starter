
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { io, Socket } from "socket.io-client";
import { cfg } from "../env";

type SocketCtx = { socket?: Socket };
const Ctx = createContext<SocketCtx>(null as any);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | undefined>();

  useEffect(() => {
    if (cfg.mock) {
      setSocket(undefined); // mock mode: local events only
      return;
    }
    const s = io(cfg.apiBase, { transports: ["websocket"] });
    setSocket(s);
    return () => { s.close(); };
  }, []);

  return <Ctx.Provider value={{ socket }}>{children}</Ctx.Provider>;
};

export const useSocket = () => useContext(Ctx);
