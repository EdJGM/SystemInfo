"use client"

import { useState, useEffect } from "react"
import { useWebSocket } from "@/utils/WebSocketContext"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Download, RefreshCw } from "lucide-react"
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    LineChart,
    Line,
} from "recharts"

interface MemoryData {
    timestamp: number
    total: number
    used: number
    free: number
    available: number
    buffers: number
    cached: number  // Cambio de 'cache' a 'cached' para coincidir con el backend
    percent: number
    swap_total: number
    swap_used: number
    swap_free: number
    swap_percent: number
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"]

export default function DetailedMemoryMonitor() {
    const [activeTab, setActiveTab] = useState<"overview" | "history" | "processes" | "details">("overview")
    const [memoryData, setMemoryData] = useState<MemoryData[]>([])
    const [currentMemory, setCurrentMemory] = useState<MemoryData | null>(null)
    const [autoRefresh, setAutoRefresh] = useState(true)
    const data = useWebSocket()

    // Procesar datos reales de memoria del backend
    useEffect(() => {
        if (data && data.memoria_detallada && autoRefresh) {
            console.log("Datos de memoria recibidos:", data.memoria_detallada);

            const newMemoryData: MemoryData = {
                ...data.memoria_detallada,
                // Asegurarse de que todos los campos existan, usando valores por defecto si no
                buffers: data.memoria_detallada.buffers !== undefined ? data.memoria_detallada.buffers : 0,
                cached: data.memoria_detallada.cached !== undefined ? data.memoria_detallada.cached : 0,
                timestamp: data.memoria_detallada.timestamp || Date.now()
            }

            setCurrentMemory(newMemoryData)
            setMemoryData((prev) => {
                const updated = [...prev, newMemoryData].slice(-60) // Mantener solo los últimos 60 puntos de datos
                return updated
            })
        } else if (data && !data.memoria_detallada && autoRefresh) {
            // Si no tenemos datos detallados pero sí tenemos el porcentaje básico
            // Generamos una estimación basada en valores promedio de un sistema típico
            if (data.memoria && typeof data.memoria === 'string') {
                const memoryPercent = parseFloat(data.memoria);
                if (!isNaN(memoryPercent)) {
                    const totalMemory = 16384; // Asumimos 16GB en MB como ejemplo
                    const usedMemory = totalMemory * (memoryPercent / 100);
                    const freeMemory = totalMemory - usedMemory;

                    // Estimaciones comunes: ~20% buffers, ~30% cache del espacio "libre"
                    const buffers = freeMemory * 0.2;
                    const cached = freeMemory * 0.3;
                    const available = freeMemory - buffers - cached;

                    const newMemoryData: MemoryData = {
                        timestamp: Date.now(),
                        total: totalMemory,
                        used: usedMemory,
                        free: freeMemory,
                        available: available,
                        buffers: buffers,
                        cached: cached,
                        percent: memoryPercent,
                        swap_total: totalMemory / 2, // Asumimos swap = 50% de RAM total
                        swap_used: (totalMemory / 2) * 0.1, // Asumimos 10% de uso de swap
                        swap_free: (totalMemory / 2) * 0.9,
                        swap_percent: 10 // 10% de uso
                    };

                    setCurrentMemory(newMemoryData);
                    setMemoryData((prev) => {
                        const updated = [...prev, newMemoryData].slice(-60);
                        return updated;
                    });
                }
            }
        }
    }, [data, autoRefresh])

    const handleTabChange = (value: string) => {
        setActiveTab(value as "overview" | "history" | "processes" | "details")
    }

    const toggleAutoRefresh = () => {
        setAutoRefresh(!autoRefresh)
    }

    const downloadMemoryData = () => {
        const dataStr = JSON.stringify(memoryData, null, 2)
        const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`

        const exportFileDefaultName = `memory_data_${new Date().toISOString()}.json`

        const linkElement = document.createElement("a")
        linkElement.setAttribute("href", dataUri)
        linkElement.setAttribute("download", exportFileDefaultName)
        linkElement.click()
    }

    const formatBytes = (bytes: number, decimals = 2) => {
        if (bytes === 0) return "0 Bytes"

        const k = 1024
        const dm = decimals < 0 ? 0 : decimals
        const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"]

        const i = Math.floor(Math.log(bytes) / Math.log(k))

        return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i]
    }

    const getPieChartData = () => {
        if (!currentMemory) return []

        // Calcular el valor "Usado real" excluyendo buffers y caché
        // Pero asegurarse que no sea un número negativo
        const realUsed = Math.max(0, currentMemory.used - currentMemory.buffers - currentMemory.cached);

        return [
            { name: "Usado", value: realUsed },
            { name: "Buffers", value: currentMemory.buffers || 0 },
            { name: "Caché", value: currentMemory.cached || 0 },
            { name: "Disponible", value: currentMemory.available || 0 },
        ]
    }

    const getBarChartData = () => {
        if (!currentMemory) return []

        return [
            { name: "Total", value: currentMemory.total },
            { name: "Usado", value: currentMemory.used },
            { name: "Libre", value: currentMemory.free },
            { name: "Buffers", value: currentMemory.buffers },
            { name: "Caché", value: currentMemory.cached },
            { name: "Disponible", value: currentMemory.available },
        ]
    }

    const getHistoryData = () => {
        return memoryData.map((data) => ({
            time: new Date(data.timestamp).toLocaleTimeString(),
            used: Math.max(0, data.used - (data.buffers || 0) - (data.cached || 0)), // Memoria realmente usada (sin buffers/cache)
            buffers: data.buffers || 0,
            cache: data.cached || 0,
            available: data.available || 0
        }))
    }

    const getSwapData = () => {
        if (!currentMemory) return []

        return [
            { name: "Usado", value: currentMemory.swap_used },
            { name: "Libre", value: currentMemory.swap_free },
        ]
    }

    return (
        <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Monitoreo Detallado de Memoria</h2>
                <div className="flex gap-2">
                    <Button onClick={toggleAutoRefresh} variant={autoRefresh ? "outline" : "default"} size="sm">
                        <RefreshCw className={`h-4 w-4 mr-2 ${autoRefresh ? "animate-spin" : ""}`} />
                        {autoRefresh ? "Pausar" : "Actualizar"}
                    </Button>
                    <Button onClick={downloadMemoryData} variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Exportar
                    </Button>
                </div>
            </div>

            <Tabs defaultValue="overview" onValueChange={handleTabChange}>
                <TabsList className="mb-4">
                    <TabsTrigger value="overview">Resumen</TabsTrigger>
                    <TabsTrigger value="history">Historial</TabsTrigger>
                    <TabsTrigger value="details">Detalles</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="mt-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <h3 className="text-lg font-semibold mb-2">Distribución de Memoria</h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={getPieChartData()}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, percent }) => (percent > 0.05 ? `${name}: ${(percent * 100).toFixed(0)}%` : '')}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {getPieChartData().map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value) => formatBytes((value as number) * 1024 * 1024)} />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>

                        <div className="bg-gray-50 p-4 rounded-lg">
                            <h3 className="text-lg font-semibold mb-2">Uso de Memoria</h3>
                            <div className="space-y-4">
                                <div className="flex justify-between">
                                    <span className="font-medium">Memoria Total:</span>
                                    <span>{currentMemory ? formatBytes(currentMemory.total * 1024 * 1024) : "Cargando..."}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="font-medium">Memoria Usada:</span>
                                    <span className={currentMemory && currentMemory.percent > 80 ? "text-red-500 font-bold" : ""}>
                                        {currentMemory ? formatBytes(currentMemory.used * 1024 * 1024) : "Cargando..."}
                                        {currentMemory && ` (${currentMemory.percent.toFixed(1)}%)`}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="font-medium">Memoria Libre:</span>
                                    <span>{currentMemory ? formatBytes(currentMemory.free * 1024 * 1024) : "Cargando..."}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="font-medium">Buffers:</span>
                                    <span>{currentMemory ? formatBytes(currentMemory.buffers * 1024 * 1024) : "Cargando..."}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="font-medium">Caché:</span>
                                    <span>{currentMemory ? formatBytes(currentMemory.cached * 1024 * 1024) : "Cargando..."}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="font-medium">Disponible:</span>
                                    <span>{currentMemory ? formatBytes(currentMemory.available * 1024 * 1024) : "Cargando..."}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sección de Swap */}
                    <div className="mt-4 bg-gray-50 p-4 rounded-lg">
                        <h3 className="text-lg font-semibold mb-2">Memoria Swap</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <ResponsiveContainer width="100%" height={200}>
                                    <PieChart>
                                        <Pie
                                            data={getSwapData()}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                            outerRadius={70}
                                            fill="#8884d8"
                                            dataKey="value"
                                        >
                                            <Cell fill="#FF8042" />
                                            <Cell fill="#82ca9d" />
                                        </Pie>
                                        <Tooltip formatter={(value) => formatBytes((value as number) * 1024 * 1024)} />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="space-y-4">
                                <div className="flex justify-between">
                                    <span className="font-medium">Swap Total:</span>
                                    <span>{currentMemory ? formatBytes(currentMemory.swap_total * 1024 * 1024) : "Cargando..."}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="font-medium">Swap Usado:</span>
                                    <span className={currentMemory && currentMemory.swap_percent > 80 ? "text-red-500 font-bold" : ""}>
                                        {currentMemory ? formatBytes(currentMemory.swap_used * 1024 * 1024) : "Cargando..."}
                                        {currentMemory && ` (${currentMemory.swap_percent.toFixed(1)}%)`}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="font-medium">Swap Libre:</span>
                                    <span>{currentMemory ? formatBytes(currentMemory.swap_free * 1024 * 1024) : "Cargando..."}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="history" className="mt-0">
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="text-lg font-semibold mb-2">Historial de Uso de Memoria</h3>
                        <ResponsiveContainer width="100%" height={400}>
                            <LineChart data={getHistoryData()}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="time" />
                                <YAxis tickFormatter={(value) => `${(value / 1024).toFixed(1)} GB`} />
                                <Tooltip formatter={(value) => formatBytes((value as number) * 1024 * 1024)} />
                                <Legend />
                                <Line type="monotone" dataKey="used" stroke="#8884d8" name="Usado" />
                                <Line type="monotone" dataKey="buffers" stroke="#ffc658" name="Buffers" />
                                <Line type="monotone" dataKey="cache" stroke="#ff8042" name="Caché" />
                                <Line type="monotone" dataKey="available" stroke="#82ca9d" name="Disponible" />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </TabsContent>

                <TabsContent value="details" className="mt-0">
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="text-lg font-semibold mb-2">Detalles de Memoria</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={getBarChartData()}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis tickFormatter={(value) => `${(value / 1024).toFixed(1)} GB`} />
                                <Tooltip formatter={(value) => formatBytes((value as number) * 1024 * 1024)} />
                                <Legend />
                                <Bar dataKey="value" fill="#8884d8" name="Memoria (MB)" />
                            </BarChart>
                        </ResponsiveContainer>

                        <div className="mt-6">
                            <h3 className="text-lg font-semibold mb-2">Tabla de Memoria</h3>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Tipo
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Valor (MB)
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Valor (GB)
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Porcentaje
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {currentMemory ? (
                                            <>
                                                <tr>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Total</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {currentMemory.total.toFixed(2)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {(currentMemory.total / 1024).toFixed(2)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">100%</td>
                                                </tr>
                                                <tr>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Usado</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {currentMemory.used.toFixed(2)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {(currentMemory.used / 1024).toFixed(2)}
                                                    </td>
                                                    <td
                                                        className={`px-6 py-4 whitespace-nowrap text-sm ${currentMemory.percent > 80 ? "text-red-500 font-bold" : "text-gray-500"}`}
                                                    >
                                                        {currentMemory.percent.toFixed(2)}%
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Libre</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {currentMemory.free.toFixed(2)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {(currentMemory.free / 1024).toFixed(2)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {(100 - currentMemory.percent).toFixed(2)}%
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Buffers</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {currentMemory.buffers.toFixed(2)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {(currentMemory.buffers / 1024).toFixed(2)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {((currentMemory.buffers / currentMemory.total) * 100).toFixed(2)}%
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Caché</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {currentMemory.cached.toFixed(2)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {(currentMemory.cached / 1024).toFixed(2)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {((currentMemory.cached / currentMemory.total) * 100).toFixed(2)}%
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Disponible</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {currentMemory.available.toFixed(2)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {(currentMemory.available / 1024).toFixed(2)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {((currentMemory.available / currentMemory.total) * 100).toFixed(2)}%
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Swap Total</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {currentMemory.swap_total.toFixed(2)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {(currentMemory.swap_total / 1024).toFixed(2)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">100%</td>
                                                </tr>
                                                <tr>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Swap Usado</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {currentMemory.swap_used.toFixed(2)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {(currentMemory.swap_used / 1024).toFixed(2)}
                                                    </td>
                                                    <td
                                                        className={`px-6 py-4 whitespace-nowrap text-sm ${currentMemory.swap_percent > 80 ? "text-red-500 font-bold" : "text-gray-500"}`}
                                                    >
                                                        {currentMemory.swap_percent.toFixed(2)}%
                                                    </td>
                                                </tr>
                                            </>
                                        ) : (
                                            <tr>
                                                <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">
                                                    Cargando datos de memoria...
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}