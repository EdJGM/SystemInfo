"use client"

import { useState, useEffect } from "react"
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts"
import { useWebSocket } from "@/utils/WebSocketContext";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"]

interface MemoryData {
    name: string
    value: number
}

interface MemoryMonitorProps {
    threshold: number
    onAlert: (resourceName: string, value: number) => void
}

export default function MemoryMonitor({ threshold, onAlert }: MemoryMonitorProps) {
    const [memoryData, setMemoryData] = useState<MemoryData[]>([])
    const data = useWebSocket()

    useEffect(() => {
        if (data) {
            const total = 100 // Representamos el total como 100%
            const used = parseFloat(data.memoria)
            const free = total - used
            const newMemoryData = [
                { name: "Usado", value: used },
                { name: "Libre", value: free },
            ]

            setMemoryData(newMemoryData)

            if (used > threshold) {
                onAlert("Alerta: El uso de la memoria ha sido superado", used);
            }
        }
    }, [data, threshold, onAlert])

    const isOverloaded = memoryData.length > 0 && memoryData[0].value > threshold

    return (
        <div className={`bg-white p-4 rounded-lg shadow ${isOverloaded ? "border-2 border-red-500" : ""}`}>
            <h2 className={`text-xl font-bold mb-4 ${isOverloaded ? "text-red-500" : "text-black"}`}>
                Monitoreo de Memoria {isOverloaded && "(¡Alerta!)"}
            </h2>
            <PieChart width={400} height={300}>
                <Pie
                    data={memoryData}
                    cx={200}
                    cy={150}
                    innerRadius={60}
                    outerRadius={80}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                >
                    {memoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                </Pie>
                <Tooltip />
                <Legend />
            </PieChart>
            <div className="mt-4">
                <p className="text-sm font-medium text-gray-500">Memoria Total: 100%</p>
                <p className={`text-sm font-medium ${isOverloaded ? "text-red-500" : "text-gray-500"}`}>
                    Memoria Usada: {memoryData.length > 0 ? memoryData[0].value.toFixed(2) : 0}%
                </p>
                <p className="text-sm font-medium text-gray-500">
                    Memoria Libre: {memoryData.length > 1 ? memoryData[1].value.toFixed(2) : 0}%
                </p>
            </div>
        </div>
    )
}

