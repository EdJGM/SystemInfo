"use client"

import { useState, useEffect, useRef } from "react"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { useWebSocket } from "@/utils/WebSocketContext"

interface NetworkData {
    time: string
    red_enviados: number
    red_recibidos: number
    total: number
    conexiones_red: number
}

interface NetworkMonitorProps {
    threshold: number
    onAlert: (resourceName: string, value: number) => void
}

export default function NetworkMonitor({ threshold, onAlert }: NetworkMonitorProps) {
    const [networkData, setNetworkData] = useState<NetworkData[]>([])
    const previousDataRef = useRef<{ enviados: number, recibidos: number, timestamp: number } | null>(null);
    const data = useWebSocket()
    // Para evitar alertas repetitivas
    const lastAlertTimeRef = useRef<number>(0);

    useEffect(() => {
        if (data) {
            try {
                const now = Date.now();

                // Extraer solo los números de las cadenas de texto
                const sentStr = data.red_enviados || "0 KB";
                const receivedStr = data.red_recibidos || "0 KB";

                // Convertir a números (total acumulado desde el inicio del sistema)
                const currentSent = parseFloat(sentStr.replace(/[^0-9.]/g, '')) || 0;
                const currentReceived = parseFloat(receivedStr.replace(/[^0-9.]/g, '')) || 0;

                // Si tenemos datos previos, calculamos la tasa por segundo
                let sentRate = 0;
                let receivedRate = 0;

                if (previousDataRef.current) {
                    // Calculamos el tiempo transcurrido en segundos para obtener la tasa real por segundo
                    const timeElapsed = (now - previousDataRef.current.timestamp) / 1000;

                    if (timeElapsed > 0) {
                        // Calcular la diferencia desde la última actualización y dividir por el tiempo transcurrido
                        sentRate = Math.max(0, (currentSent - previousDataRef.current.enviados) / timeElapsed);
                        receivedRate = Math.max(0, (currentReceived - previousDataRef.current.recibidos) / timeElapsed);
                    }
                }

                // Actualizar referencia para la próxima vez
                previousDataRef.current = {
                    enviados: currentSent,
                    recibidos: currentReceived,
                    timestamp: now
                };

                // Solo continuamos si tenemos una tasa (segunda muestra en adelante) o ya hay datos previos
                if (sentRate > 0 || receivedRate > 0 || networkData.length > 0) {
                    const totalRate = sentRate + receivedRate;

                    const newData = {
                        time: new Date().toLocaleTimeString(),
                        red_enviados: sentRate,
                        red_recibidos: receivedRate,
                        total: totalRate,
                        conexiones_red: data.conexiones_red || 0,
                    };

                    setNetworkData((prevData) => {
                        const updateData = [...prevData, newData].slice(-20); // Mantener solo los últimos 20 puntos
                        return updateData;
                    });

                    // Usar un umbral mínimo efectivo
                    // Establecemos un mínimo predeterminado alto (3000 KB/s) para evitar alertas con porcentajes muy grandes
                    const effectiveThreshold = Math.max(threshold, 3000);

                    // Calcular porcentaje de uso
                    const usagePercent = (totalRate / effectiveThreshold) * 100;

                    // Limitar el porcentaje para la alerta a un máximo de 500%
                    const cappedPercent = Math.min(usagePercent, 500);

                    // Enviar alertas solo cada 5 segundos como máximo para evitar spam
                    if (usagePercent > 100 && now - lastAlertTimeRef.current > 5000) {
                        // Enviar el porcentaje redondeado a 1 decimal
                        onAlert("Red", parseFloat(cappedPercent.toFixed(1)));
                        lastAlertTimeRef.current = now;
                    }
                }
            } catch (error) {
                console.error("Error procesando datos de red:", error);
            }
        }
    }, [data, threshold, onAlert, networkData.length]);

    // Verificar si hay datos antes de calcular si está sobrecargado
    // Usamos el mismo umbral efectivo que en el cálculo de alertas
    const effectiveThreshold = Math.max(threshold, 3000);
    const isOverloaded = networkData.length > 0 &&
        (networkData[networkData.length - 1].total / effectiveThreshold) * 100 > 100;

    return (
        <div className={`bg-white p-4 rounded-lg shadow ${isOverloaded ? "border-2 border-red-500" : ""}`}>
            <h2 className={`text-xl font-bold mb-4 ${isOverloaded ? "text-red-500" : "text-black"}`}>
                Monitoreo de Red {isOverloaded && "(¡Alerta!)"}
            </h2>
            <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={networkData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area
                        type="monotone"
                        dataKey="red_enviados"
                        stackId="1"
                        stroke="#8884d8"
                        fill="#8884d8"
                        name="Enviados (KB/s)"
                    />
                    <Area
                        type="monotone"
                        dataKey="red_recibidos"
                        stackId="1"
                        stroke="#82ca9d"
                        fill="#82ca9d"
                        name="Recibidos (KB/s)"
                    />
                </AreaChart>
            </ResponsiveContainer>
            <div className="mt-4">
                <h3 className={`text-lg font-semibold ${isOverloaded ? "text-red-500" : "text-black"}`}>
                    Conexiones de Red Activas
                </h3>
                <p className="text-3xl font-bold text-blue-600">
                    {networkData.length > 0 ? networkData[networkData.length - 1].conexiones_red : 0}
                </p>
                {networkData.length > 0 && (
                    <div>
                        <p className={`text-sm font-medium ${isOverloaded ? "text-red-500" : "text-gray-500"}`}>
                            Tráfico actual: {networkData[networkData.length - 1].total.toFixed(1)} KB/s
                        </p>
                        <p className="text-sm font-medium text-gray-500">
                            Umbral configurado: {effectiveThreshold} KB/s
                        </p>
                        <p className={`text-sm font-medium ${isOverloaded ? "text-red-500" : "text-gray-500"}`}>
                            Porcentaje de uso: {Math.min(((networkData[networkData.length - 1].total /
                                effectiveThreshold * 100)), 500).toFixed(1)}%
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}