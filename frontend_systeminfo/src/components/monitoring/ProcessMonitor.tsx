"use client"

import { useState, useEffect } from "react"
import { useWebSocket } from "@/utils/WebSocketContext"
import { ArrowUpIcon, ArrowDownIcon } from "@heroicons/react/20/solid"

interface Process {
    pid: number
    name: string
    cpu_percent: number
    memory: number
    status: string
}

type SortConfig = {
    key: keyof Process
    direction: "ascending" | "descending"
}

interface ProcessMonitorProps {
    threshold: number
    onAlert: (resourceName: string, value: number) => void
}

export default function ProcessMonitor({ threshold, onAlert }: ProcessMonitorProps) {
    const [processes, setProcesses] = useState<Process[]>([])
    const [sortConfig, setSortConfig] = useState<SortConfig>({ key: "cpu_percent", direction: "descending" })
    const data = useWebSocket()

    // Estado para evitar enviar alertas repetitivas
    const [lastAlertTime, setLastAlertTime] = useState<number>(0)

    useEffect(() => {
        if (data && data.procesos) {
            const sortedProcesses = [...data.procesos].sort((a, b) => {
                if (a[sortConfig.key] < b[sortConfig.key]) {
                    return sortConfig.direction === "ascending" ? -1 : 1
                }
                if (a[sortConfig.key] > b[sortConfig.key]) {
                    return sortConfig.direction === "ascending" ? 1 : -1
                }
                return 0
            })
            setProcesses(sortedProcesses)

            // Checkear si algún proceso supera el umbral
            const now = Date.now()
            // Solo enviar alertas cada 3 segundos para evitar spam
            if (now - lastAlertTime > 3000) {
                for (const process of sortedProcesses) {
                    // Solo comparar CPU con threshold, ya que memory está en MB
                    if (process.cpu_percent > threshold) {
                        // Enviar el valor de CPU como porcentaje
                        onAlert(`CPU del Proceso ${process.name}`, parseFloat(process.cpu_percent.toFixed(1)));
                        setLastAlertTime(now);
                        break; // Solo enviar una alerta por ciclo
                    }
                }
            }
        }
    }, [data, sortConfig, threshold, onAlert, lastAlertTime])

    const requestSort = (key: keyof Process) => {
        let direction: "ascending" | "descending" = "ascending"
        if (sortConfig.key === key && sortConfig.direction === "ascending") {
            direction = "descending"
        }
        setSortConfig({ key, direction })
    }

    const getSortIcon = (columnName: keyof Process) => {
        if (sortConfig.key === columnName) {
            return sortConfig.direction === "ascending" ? (
                <ArrowUpIcon className="h-4 w-4 inline-block ml-1" />
            ) : (
                <ArrowDownIcon className="h-4 w-4 inline-block ml-1" />
            )
        }
        return null
    }

    // Solo considerar el uso de CPU para determinar sobrecarga
    const isOverloaded = processes.some((p) => p.cpu_percent > threshold)

    return (
        <div className={`bg-white p-4 rounded-lg shadow ${isOverloaded ? "border-2 border-red-500" : ""}`}>
            <h2 className={`text-xl font-bold mb-4 ${isOverloaded ? "text-red-500" : "text-black"}`}>
                Monitoreo de Procesos {isOverloaded && "(¡Alerta!)"}
            </h2>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                            <th
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                                onClick={() => requestSort("cpu_percent")}
                            >
                                CPU (%) {getSortIcon("cpu_percent")}
                            </th>
                            <th
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                                onClick={() => requestSort("memory")}
                            >
                                Memoria (MB) {getSortIcon("memory")}
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {processes.map((process) => (
                            <tr key={process.pid} className={process.cpu_percent > threshold ? "bg-red-100" : ""}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{process.pid}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{process.name}</td>
                                <td className={`px-6 py-4 whitespace-nowrap text-sm ${process.cpu_percent > threshold ? "text-red-500 font-bold" : "text-gray-500"}`}>{process.cpu_percent.toFixed(2)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{process.memory.toFixed(2)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{process.status}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}