"use client"

import { useState, useEffect } from "react"
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { useWebSocket } from "@/utils/WebSocketContext";

const COLORS = ["#0088FE", "#00C49F"]

interface DiskInfo {
    total: number;
    used: number;
    free: number;
    percent: number;
}

interface DiskMonitorProps {
    threshold: number
    onAlert: (resourceName: string, value: number) => void
}

export default function DiskMonitor({ threshold, onAlert }: DiskMonitorProps) {
    const [diskData, setDiskData] = useState([
        { name: "Usado", value: 0 },
        { name: "Libre", value: 0 },
    ])
    const [diskInfo, setDiskInfo] = useState<DiskInfo | null>(null)
    const data = useWebSocket()

    useEffect(() => {
        if (data) {
            // Extraer el porcentaje como número (sin el símbolo %)
            const used = parseFloat(data.disco.replace('%', ''))
            const free = 100 - used

            setDiskData([
                { name: "Usado", value: used },
                { name: "Libre", value: free },
            ]);

            // Guardar información detallada del disco si está disponible
            if (data.disco_detallado) {
                setDiskInfo(data.disco_detallado)
            }

            if (used >= threshold) {
                onAlert("Disco", used);
            }
        }
    }, [data, threshold, onAlert])

    const isOverloaded = diskData[0].value >= threshold;

    return (
        <div className={`bg-white p-4 rounded-lg shadow ${isOverloaded ? 'border-2 border-red-500' : ''}`}>
            <h2 className={`text-xl font-bold mb-4 ${isOverloaded ? 'text-red-500' : 'text-black'}`}>
                Monitoreo de Disco {isOverloaded && "(¡Alerta!)"}
            </h2>
            <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                    <Pie
                        data={diskData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        fill="#8884d8"
                        paddingAngle={5}
                        dataKey="value"
                    >
                        {diskData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip formatter={(value) => `${value.toFixed(1)}%`} />
                    <Legend />
                </PieChart>
            </ResponsiveContainer>
            <div className="mt-4">
                {diskInfo ? (
                    // Mostrar información detallada del disco si está disponible
                    <>
                        <p className="text-sm font-medium text-gray-500">
                            Espacio Total: {diskInfo.total.toFixed(1)} GB
                        </p>
                        <p className={`text-sm font-medium ${isOverloaded ? 'text-red-500' : 'text-gray-500'}`}>
                            Espacio Usado: {diskInfo.used.toFixed(1)} GB ({diskInfo.percent.toFixed(1)}%)
                        </p>
                        <p className="text-sm font-medium text-gray-500">
                            Espacio Libre: {diskInfo.free.toFixed(1)} GB ({(100 - diskInfo.percent).toFixed(1)}%)
                        </p>
                    </>
                ) : (
                    // Mostrar solo porcentajes si no hay información detallada
                    <>
                        <p className={`text-sm font-medium ${isOverloaded ? 'text-red-500' : 'text-gray-500'}`}>
                            Espacio Usado: {diskData[0].value.toFixed(1)}%
                        </p>
                        <p className="text-sm font-medium text-gray-500">
                            Espacio Libre: {diskData[1].value.toFixed(1)}%
                        </p>
                    </>
                )}
            </div>
        </div>
    )
}