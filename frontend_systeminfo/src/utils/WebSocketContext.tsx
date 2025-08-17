'use client';
import React, { createContext, useContext, useEffect, useState } from "react";

const WebSocketContext = createContext<any>(null);

export const WebSocketProvider = ({ children }: { children: React.ReactNode }) => {
    const [data, setData] = useState<any>(null);

    useEffect(() => {
        const socket = new WebSocket("ws://192.168.1.43:8765");
        //const socket = new WebSocket("ws://localhost:8765");

        socket.onmessage = (event) => {
            const parsedData = JSON.parse(event.data);
            setData(parsedData);
        };

        return () => socket.close();
    }, []);

    return (
        <WebSocketContext.Provider value={data}>
            {children}
        </WebSocketContext.Provider>
    );
};

export const useWebSocket = () => useContext(WebSocketContext);