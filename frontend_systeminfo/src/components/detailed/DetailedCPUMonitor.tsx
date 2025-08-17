"use client"

import { useState, useEffect } from "react"
import { useWebSocket } from "@/utils/WebSocketContext"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Download, RefreshCw, Thermometer, Cpu } from "lucide-react"
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
} from "recharts"

interface CPUData {
    timestamp: number
    usage: number
    temperature: number
    frequency: number
    cores: number[]
    loadAvg: number[]
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d", "#ffc658", "#ff8042"]

export default function DetailedCPUMonitor() {
    const [activeTab, setActiveTab] = useState<"overview" | "cores" | "history">("overview")
    const [cpuData, setCpuData] = useState<CPUData[]>([])
    const [currentCPU, setCurrentCPU] = useState<CPUData | null>(null)
    const [autoRefresh, setAutoRefresh] = useState(true)
    const [isDataReal, setIsDataReal] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const data = useWebSocket()

    // Procesar datos reales de CPU del backend
    useEffect(() => {
        if (data && autoRefresh) {
            // Verificar si tenemos datos detallados de CPU
            if (data.cpu_detallado) {
                setIsDataReal(true)

                // Extraer datos reales del objeto cpu_detallado
                const cpuDetailed = data.cpu_detallado
                const newCPUData: CPUData = {
                    timestamp: cpuDetailed.timestamp || Date.now(),
                    usage: cpuDetailed.usage,
                    temperature: cpuDetailed.temperature || 0,
                    frequency: cpuDetailed.frequency,
                    cores: cpuDetailed.per_core || [],
                    loadAvg: cpuDetailed.load_avg || [0, 0, 0]
                }

                setCurrentCPU(newCPUData)
                setCpuData((prev) => {
                    const updated = [...prev, newCPUData].slice(-60) // Mantener solo los últimos 60 puntos de datos
                    return updated
                })
            }
            // Si no hay datos detallados, usar los básicos y simular el resto
            else if (data.cpu) {
                setIsDataReal(false)

                // Extraer datos básicos del WebSocket
                const cpuUsage = Number.parseFloat(data.cpu.replace("%", ""))
                const cpuFreq = data.cpu_freq ? Number.parseFloat(data.cpu_freq.replace(" GHz", "")) : 0
                const cpuTemp = data.cpu_temp ? Number.parseFloat(data.cpu_temp.replace("°C", "")) : 0

                // Simular datos adicionales
                const numCores = 8 // Simular 8 núcleos
                const coreUsage = Array.from({ length: numCores }, () => Math.random() * cpuUsage * 1.5)
                const loadAvg = [(cpuUsage / 100) * 4, (cpuUsage / 100) * 2, cpuUsage / 100] // Simular carga de 1, 5 y 15 minutos

                const newCPUData: CPUData = {
                    timestamp: Date.now(),
                    usage: cpuUsage,
                    temperature: cpuTemp,
                    frequency: cpuFreq,
                    cores: coreUsage,
                    loadAvg: loadAvg,
                };

                setCurrentCPU(newCPUData);
                setCpuData((prev) => {
                    const updated = [...prev, newCPUData].slice(-60);
                    return updated;
                });
            }

            setIsLoading(false)
        }
    }, [data, autoRefresh])

    const handleTabChange = (value: string) => {
        setActiveTab(value as "overview" | "cores" | "history")
    }

    const toggleAutoRefresh = () => {
        setAutoRefresh(!autoRefresh)
    }

    const downloadCPUData = () => {
        const dataStr = JSON.stringify(cpuData, null, 2)
        const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`

        const exportFileDefaultName = `cpu_data_${new Date().toISOString()}.json`

        const linkElement = document.createElement("a")
        linkElement.setAttribute("href", dataUri)
        linkElement.setAttribute("download", exportFileDefaultName)
        linkElement.click()
    }

    const getHistoryData = () => {
        return cpuData.map((data) => ({
            time: new Date(data.timestamp).toLocaleTimeString(),
            usage: data.usage,
            temperature: data.temperature,
            frequency: data.frequency,
        }))
    }

    const getCoreData = () => {
        if (!currentCPU || !currentCPU.cores.length) return []
        return currentCPU.cores.map((usage, index) => ({
            name: `Núcleo ${index + 1}`,
            value: usage,
        }))
    }

    const getLoadAvgData = () => {
        if (!currentCPU) return []
        return [
            { name: "1 min", value: currentCPU.loadAvg[0] },
            { name: "5 min", value: currentCPU.loadAvg[1] },
            { name: "15 min", value: currentCPU.loadAvg[2] },
        ]
    }

    const getUsageColor = (usage: number) => {
        if (usage >= 90) return "text-red-500 font-bold"
        if (usage >= 70) return "text-orange-500 font-bold"
        if (usage >= 50) return "text-yellow-500"
        return "text-green-500"
    }

    const getTemperatureColor = (temp: number) => {
        if (temp >= 80) return "text-red-500 font-bold"
        if (temp >= 70) return "text-orange-500 font-bold"
        if (temp >= 60) return "text-yellow-500"
        return "text-green-500"
    }

    if (isLoading) {
        return (
            <div className="bg-white p-4 rounded-lg shadow">
                <h2 className="text-xl font-bold mb-4">Monitoreo Detallado de CPU</h2>
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                </div>
            </div>
        )
    }

    return (
        <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Monitoreo Detallado de CPU</h2>
                <div className="flex gap-2">
                    <Button onClick={toggleAutoRefresh} variant={autoRefresh ? "outline" : "default"} size="sm">
                        <RefreshCw className={`h-4 w-4 mr-2 ${autoRefresh ? "animate-spin" : ""}`} />
                        {autoRefresh ? "Pausar" : "Actualizar"}
                    </Button>
                    <Button onClick={downloadCPUData} variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Exportar
                    </Button>
                </div>
            </div>

            <Tabs defaultValue="overview" onValueChange={handleTabChange}>
                <TabsList className="mb-4">
                    <TabsTrigger value="overview">Resumen</TabsTrigger>
                    <TabsTrigger value="cores">Núcleos</TabsTrigger>
                    <TabsTrigger value="history">Historial</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="mt-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <h3 className="text-lg font-semibold mb-2">Uso de CPU</h3>
                            <div className="flex flex-col items-center">
                                <div className="relative w-48 h-48">
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="text-center">
                                            <div className={`text-4xl font-bold ${currentCPU ? getUsageColor(currentCPU.usage) : ""}`}>
                                                {currentCPU ? `${currentCPU.usage.toFixed(1)}%` : "Cargando..."}
                                            </div>
                                            <div className="text-gray-500">Uso de CPU</div>
                                        </div>
                                    </div>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={[
                                                    { name: "Usado", value: currentCPU ? currentCPU.usage : 0 },
                                                    { name: "Libre", value: currentCPU ? 100 - currentCPU.usage : 0 },
                                                ]}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={80}
                                                startAngle={90}
                                                endAngle={-270}
                                                dataKey="value"
                                            >
                                                <Cell fill="#0088FE" />
                                                <Cell fill="#EEEEEE" />
                                            </Pie>
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-50 p-4 rounded-lg">
                            <h3 className="text-lg font-semibold mb-2">Información de CPU</h3>
                            <div className="space-y-4">
                                <div className="flex items-center gap-2">
                                    <Cpu className="h-5 w-5 text-blue-500" />
                                    <span className="font-medium">Frecuencia:</span>
                                    <span>{currentCPU ? `${currentCPU.frequency.toFixed(2)} GHz` : "Cargando..."}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Thermometer className="h-5 w-5 text-red-500" />
                                    <span className="font-medium">Temperatura:</span>
                                    <span className={currentCPU ? getTemperatureColor(currentCPU.temperature) : ""}>
                                        {currentCPU && currentCPU.temperature > 0
                                            ? `${currentCPU.temperature.toFixed(1)}°C`
                                            : "No disponible"}
                                    </span>
                                </div>
                                <div>
                                    <h4 className="font-medium mb-2">Carga Promedio:</h4>
                                    <ResponsiveContainer width="100%" height={100}>
                                        <BarChart data={getLoadAvgData()}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="name" />
                                            <YAxis />
                                            <Tooltip />
                                            <Bar dataKey="value" fill="#8884d8" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="cores" className="mt-0">
                    {currentCPU && currentCPU.cores.length > 0 ? (
                        <>
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h3 className="text-lg font-semibold mb-2">Uso por Núcleo</h3>
                                <ResponsiveContainer width="100%" height={400}>
                                    <BarChart data={getCoreData()} layout="vertical">
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis type="number" domain={[0, 100]} />
                                        <YAxis dataKey="name" type="category" />
                                        <Tooltip formatter={(value) => `${Number(value).toFixed(1)}%`} />
                                        <Legend />
                                        <Bar dataKey="value" fill="#8884d8" name="Uso (%)" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>

                            <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
                                {currentCPU.cores.map((usage, index) => (
                                    <div key={index} className="bg-white p-3 rounded-lg border">
                                        <div className="text-sm text-gray-500">Núcleo {index + 1}</div>
                                        <div className={`text-xl font-bold ${getUsageColor(usage)}`}>{usage.toFixed(1)}%</div>
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : (
                        <div className="bg-gray-50 p-4 rounded-lg text-center">
                            <h3 className="text-lg font-semibold mb-2">Información de núcleos no disponible</h3>
                            <p className="text-gray-500">
                                No se pudo obtener información detallada de los núcleos de CPU.
                            </p>
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="history" className="mt-0">
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="text-lg font-semibold mb-2">Historial de Uso de CPU</h3>
                        <ResponsiveContainer width="100%" height={400}>
                            <LineChart data={getHistoryData()}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="time" />
                                <YAxis yAxisId="left" domain={[0, 100]} />
                                <YAxis yAxisId="right" orientation="right" domain={[0, Math.max(100, Math.ceil(currentCPU?.temperature || 0) * 1.2)]} />
                                <Tooltip />
                                <Legend />
                                <Line yAxisId="left" type="monotone" dataKey="usage" stroke="#8884d8" name="Uso (%)" dot={false} />
                                {currentCPU && currentCPU.temperature > 0 && (
                                    <Line
                                        yAxisId="right"
                                        type="monotone"
                                        dataKey="temperature"
                                        stroke="#ff8042"
                                        name="Temperatura (°C)"
                                        dot={false}
                                    />
                                )}
                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="mt-4 bg-gray-50 p-4 rounded-lg">
                        <h3 className="text-lg font-semibold mb-2">Historial de Frecuencia</h3>
                        <ResponsiveContainer width="100%" height={200}>
                            <LineChart data={getHistoryData()}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="time" />
                                <YAxis domain={[0, "dataMax + 0.5"]} />
                                <Tooltip />
                                <Legend />
                                <Line type="monotone" dataKey="frequency" stroke="#82ca9d" name="Frecuencia (GHz)" dot={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </TabsContent>
            </Tabs>

            {!isDataReal && (
                <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                    <p className="text-sm text-yellow-800">
                        <strong>Nota:</strong> No se están recibiendo datos detallados de CPU desde el backend.
                        Algunos datos mostrados actualmente son parcialmente simulados para fines de demostración.
                    </p>
                    <p className="text-sm text-yellow-800 mt-2">
                        Verifique que el backend esté enviando correctamente el objeto <code>cpu_detallado</code>.
                    </p>
                </div>
            )}
        </div>
    )
}