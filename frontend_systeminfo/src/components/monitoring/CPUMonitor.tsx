"use client"

import { useState, useEffect } from "react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts"
import { useWebSocket } from "@/utils/WebSocketContext"

interface CPUData {
    time: string
    usage: number
    temperature: number
    frequency: number
}

interface CPUMonitorProps {
    threshold: number
    onAlert: (resourceName: string, value: number) => void
}

export default function CPUMonitor({ threshold, onAlert }: CPUMonitorProps) {
    const [cpuData, setCpuData] = useState<CPUData[]>([])
    const data = useWebSocket()

    useEffect(() => {
        if (data) {
            const usage = Number.parseFloat(data.cpu)
            const frequency = data.cpu_freq ? Number.parseFloat(data.cpu_freq) : 0
            const temperature = data.cpu_temp ? Number.parseFloat(data.cpu_temp) : 0
            setCpuData((prevData) => {
                const newData = [
                    ...prevData,
                    {
                        time: new Date().toLocaleTimeString(),
                        usage: usage,
                        temperature: temperature,
                        frequency: frequency,
                    },
                ]
                if (usage > threshold) {
                    onAlert("CPU", usage)
                }
                return newData.slice(-10) // Mantener solo los últimos 10 puntos de datos
            })
        }
    }, [data, threshold, onAlert])

    const isOverloaded = cpuData.length > 0 && cpuData[cpuData.length - 1].usage > threshold

    return (
        <div className={`bg-white p-4 rounded-lg shadow ${isOverloaded ? "border-2 border-red-500" : ""}`}>
            <h2 className={`text-xl font-bold mb-4 ${isOverloaded ? "text-red-500" : "text-black"}`}>
                Monitoreo de CPU {isOverloaded && "(¡Alerta!)"}
            </h2>
            <LineChart width={400} height={300} data={cpuData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="usage" stroke={isOverloaded ? "#ff0000" : "#8884d8"} name="Uso (%)" />
                {/* <Line type="monotone" dataKey="temperature" stroke="#82ca9d" name="Temperatura (°C)" /> */}
                <Line type="monotone" dataKey="frequency" stroke="#ffc658" name="Frecuencia (GHz)" />
            </LineChart>
        </div>
    )
}

