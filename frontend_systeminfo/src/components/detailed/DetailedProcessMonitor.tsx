"use client"

import { useState, useEffect } from "react"
import { useWebSocket } from "@/utils/WebSocketContext"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Download, RefreshCw, Search, ArrowUpDown, ChevronDown, ChevronUp } from "lucide-react"
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
    Scatter,
    ScatterChart,
    ZAxis,
} from "recharts"

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

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d", "#ffc658", "#ff8042"]
const STATUS_COLORS: Record<string, string> = {
    running: "#4CAF50",
    sleeping: "#2196F3",
    stopped: "#FFC107",
    zombie: "#F44336",
    "disk-sleep": "#9C27B0",
    "tracing-stop": "#FF9800",
    dead: "#795548",
    "wake-kill": "#607D8B",
    waking: "#009688",
    idle: "#CDDC39",
    locked: "#E91E63",
    waiting: "#3F51B5",
    suspended: "#673AB7",
}

export default function DetailedProcessMonitor() {
    const [processes, setProcesses] = useState<Process[]>([])
    const [filteredProcesses, setFilteredProcesses] = useState<Process[]>([])
    const [sortConfig, setSortConfig] = useState<SortConfig>({ key: "cpu_percent", direction: "descending" })
    const [searchTerm, setSearchTerm] = useState("")
    const [processHistory, setProcessHistory] = useState<
        { timestamp: number; count: number; cpuAvg: number; memoryAvg: number }[]
    >([])
    const [statusDistribution, setStatusDistribution] = useState<{ name: string; value: number }[]>([])
    const [autoRefresh, setAutoRefresh] = useState(true)
    const [activeTab, setActiveTab] = useState<"overview" | "processes" | "resources" | "history">("overview")
    const data = useWebSocket()

    // Procesar datos del WebSocket
    useEffect(() => {
        if (data && data.procesos && autoRefresh) {
            // Actualizar lista de procesos
            setProcesses(data.procesos)

            // Calcular distribución de estados
            const statusCounts: Record<string, number> = {}
            data.procesos.forEach((proc: Process) => {
                const status = proc.status.toLowerCase()
                statusCounts[status] = (statusCounts[status] || 0) + 1
            })

            setStatusDistribution(Object.entries(statusCounts).map(([name, value]) => ({ name, value })))

            // Actualizar historial de procesos
            const timestamp = Date.now()
            const cpuAvg =
                data.procesos.reduce((sum: number, proc: Process) => sum + proc.cpu_percent, 0) / data.procesos.length
            const memoryAvg =
                data.procesos.reduce((sum: number, proc: Process) => sum + proc.memory, 0) / data.procesos.length

            setProcessHistory((prev) => {
                const updated = [...prev, { timestamp, count: data.procesos.length, cpuAvg, memoryAvg }].slice(-60) // Mantener solo los últimos 60 puntos
                return updated
            })
        }
    }, [data, autoRefresh])

    // Filtrar y ordenar procesos
    useEffect(() => {
        let result = [...processes]

        // Aplicar búsqueda
        if (searchTerm) {
            const term = searchTerm.toLowerCase()
            result = result.filter(
                (proc) =>
                    proc.name.toLowerCase().includes(term) ||
                    proc.pid.toString().includes(term) ||
                    proc.status.toLowerCase().includes(term),
            )
        }

        // Aplicar ordenamiento
        result.sort((a, b) => {
            if (a[sortConfig.key] < b[sortConfig.key]) {
                return sortConfig.direction === "ascending" ? -1 : 1
            }
            if (a[sortConfig.key] > b[sortConfig.key]) {
                return sortConfig.direction === "ascending" ? 1 : -1
            }
            return 0
        })

        setFilteredProcesses(result)
    }, [processes, searchTerm, sortConfig])

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
                <ChevronUp className="h-4 w-4" />
            ) : (
                <ChevronDown className="h-4 w-4" />
            )
        }
        return <ArrowUpDown className="h-4 w-4 opacity-50" />
    }

    const toggleAutoRefresh = () => {
        setAutoRefresh(!autoRefresh)
    }

    const downloadProcessData = () => {
        const dataStr = JSON.stringify(
            {
                processes: filteredProcesses,
                history: processHistory,
                statusDistribution,
            },
            null,
            2,
        )
        const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`

        const exportFileDefaultName = `process_data_${new Date().toISOString()}.json`

        const linkElement = document.createElement("a")
        linkElement.setAttribute("href", dataUri)
        linkElement.setAttribute("download", exportFileDefaultName)
        linkElement.click()
    }

    const handleTabChange = (value: string) => {
        setActiveTab(value as "overview" | "processes" | "resources" | "history")
    }

    const getHistoryData = () => {
        return processHistory.map((data) => ({
            time: new Date(data.timestamp).toLocaleTimeString(),
            count: data.count,
            cpuAvg: data.cpuAvg,
            memoryAvg: data.memoryAvg,
        }))
    }

    const getTopProcessesByCPU = () => {
        return [...processes]
            .sort((a, b) => b.cpu_percent - a.cpu_percent)
            .slice(0, 5)
            .map((proc) => ({
                name: proc.name,
                value: proc.cpu_percent,
            }))
    }

    const getTopProcessesByMemory = () => {
        return [...processes]
            .sort((a, b) => b.memory - a.memory)
            .slice(0, 5)
            .map((proc) => ({
                name: proc.name,
                value: proc.memory,
            }))
    }

    const getResourceScatterData = () => {
        return processes.map((proc) => ({
            name: proc.name,
            cpu: proc.cpu_percent,
            memory: proc.memory,
            pid: proc.pid,
        }))
    }

    return (
        <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Monitor Detallado de Procesos</h2>
                <div className="flex gap-2">
                    <Button onClick={toggleAutoRefresh} variant={autoRefresh ? "outline" : "default"} size="sm">
                        <RefreshCw className={`h-4 w-4 mr-2 ${autoRefresh ? "animate-spin" : ""}`} />
                        {autoRefresh ? "Pausar" : "Actualizar"}
                    </Button>
                    <Button onClick={downloadProcessData} variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Exportar
                    </Button>
                </div>
            </div>

            <Tabs defaultValue="overview" onValueChange={handleTabChange}>
                <TabsList className="mb-4">
                    <TabsTrigger value="overview">Resumen</TabsTrigger>
                    <TabsTrigger value="processes">Procesos</TabsTrigger>
                    <TabsTrigger value="resources">Recursos</TabsTrigger>
                    <TabsTrigger value="history">Historial</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="mt-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <h3 className="text-lg font-semibold mb-2">Resumen de Procesos</h3>
                            <div className="space-y-4">
                                <div className="flex justify-between">
                                    <span className="font-medium">Procesos Activos:</span>
                                    <span className="text-blue-600 font-bold">{processes.length}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="font-medium">Uso Promedio de CPU:</span>
                                    <span className="text-green-600 font-bold">
                                        {processHistory.length > 0
                                            ? `${processHistory[processHistory.length - 1].cpuAvg.toFixed(2)}%`
                                            : "0%"}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="font-medium">Uso Promedio de Memoria:</span>
                                    <span className="text-purple-600 font-bold">
                                        {processHistory.length > 0
                                            ? `${processHistory[processHistory.length - 1].memoryAvg.toFixed(2)} MB`
                                            : "0 MB"}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-50 p-4 rounded-lg">
                            <h3 className="text-lg font-semibold mb-2">Distribución de Estados</h3>
                            <ResponsiveContainer width="100%" height={250}>
                                <PieChart>
                                    <Pie
                                        data={statusDistribution}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {statusDistribution.map((entry, index) => (
                                            <Cell
                                                key={`cell-${index}`}
                                                fill={STATUS_COLORS[entry.name.toLowerCase()] || COLORS[index % COLORS.length]}
                                            />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <h3 className="text-lg font-semibold mb-2">Top 5 Procesos por CPU</h3>
                            <ResponsiveContainer width="100%" height={250}>
                                <BarChart data={getTopProcessesByCPU()} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis type="number" domain={[0, "dataMax + 5"]} />
                                    <YAxis dataKey="name" type="category" width={100} />
                                    <Tooltip formatter={(value) => `${Number(value).toFixed(2)}%`} />
                                    <Legend />
                                    <Bar dataKey="value" name="CPU %" fill="#8884d8" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        <div className="bg-gray-50 p-4 rounded-lg">
                            <h3 className="text-lg font-semibold mb-2">Top 5 Procesos por Memoria</h3>
                            <ResponsiveContainer width="100%" height={250}>
                                <BarChart data={getTopProcessesByMemory()} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis type="number" domain={[0, "dataMax + 50"]} />
                                    <YAxis dataKey="name" type="category" width={100} />
                                    <Tooltip formatter={(value) => `${Number(value).toFixed(2)} MB`} />
                                    <Legend />
                                    <Bar dataKey="value" name="Memoria (MB)" fill="#82ca9d" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="processes" className="mt-0">
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold">Lista de Procesos</h3>
                            <div className="flex items-center gap-2">
                                <Search className="h-4 w-4 text-gray-500" />
                                <Input
                                    type="text"
                                    placeholder="Buscar procesos..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-64"
                                />
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th
                                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                                            onClick={() => requestSort("pid")}
                                        >
                                            <div className="flex items-center space-x-1">
                                                <span>PID</span>
                                                {getSortIcon("pid")}
                                            </div>
                                        </th>
                                        <th
                                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                                            onClick={() => requestSort("name")}
                                        >
                                            <div className="flex items-center space-x-1">
                                                <span>Nombre</span>
                                                {getSortIcon("name")}
                                            </div>
                                        </th>
                                        <th
                                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                                            onClick={() => requestSort("cpu_percent")}
                                        >
                                            <div className="flex items-center space-x-1">
                                                <span>CPU (%)</span>
                                                {getSortIcon("cpu_percent")}
                                            </div>
                                        </th>
                                        <th
                                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                                            onClick={() => requestSort("memory")}
                                        >
                                            <div className="flex items-center space-x-1">
                                                <span>Memoria (MB)</span>
                                                {getSortIcon("memory")}
                                            </div>
                                        </th>
                                        <th
                                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                                            onClick={() => requestSort("status")}
                                        >
                                            <div className="flex items-center space-x-1">
                                                <span>Estado</span>
                                                {getSortIcon("status")}
                                            </div>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredProcesses.map((proc) => (
                                        <tr key={proc.pid} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{proc.pid}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{proc.name}</td>
                                            <td
                                                className={`px-6 py-4 whitespace-nowrap text-sm ${proc.cpu_percent > 50 ? "text-red-500 font-bold" : "text-gray-500"}`}
                                            >
                                                {proc.cpu_percent.toFixed(2)}
                                            </td>
                                            <td
                                                className={`px-6 py-4 whitespace-nowrap text-sm ${proc.memory > 500 ? "text-red-500 font-bold" : "text-gray-500"}`}
                                            >
                                                {proc.memory.toFixed(2)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <span
                                                    className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                                                    style={{
                                                        backgroundColor: `${STATUS_COLORS[proc.status.toLowerCase()] || "#9CA3AF"}20`,
                                                        color: STATUS_COLORS[proc.status.toLowerCase()] || "#4B5563",
                                                    }}
                                                >
                                                    {proc.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="mt-4 text-sm text-gray-500">
                            Mostrando {filteredProcesses.length} de {processes.length} procesos
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="resources" className="mt-0">
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="text-lg font-semibold mb-2">Distribución de Recursos por Proceso</h3>
                        <ResponsiveContainer width="100%" height={400}>
                            <ScatterChart
                                margin={{
                                    top: 20,
                                    right: 20,
                                    bottom: 20,
                                    left: 20,
                                }}
                            >
                                <CartesianGrid />
                                <XAxis type="number" dataKey="cpu" name="CPU" unit="%" domain={[0, "dataMax + 5"]} />
                                <YAxis type="number" dataKey="memory" name="Memoria" unit=" MB" domain={[0, "dataMax + 50"]} />
                                <ZAxis type="number" range={[50, 400]} />
                                <Tooltip
                                    cursor={{ strokeDasharray: "3 3" }}
                                    formatter={(value, name) => [`${Number(value).toFixed(2)}${name === "CPU" ? "%" : " MB"}`, name]}
                                    content={({ active, payload }) => {
                                        if (active && payload && payload.length) {
                                            const data = payload[0].payload
                                            return (
                                                <div className="bg-white p-2 border border-gray-200 shadow-sm rounded">
                                                    <p className="font-bold">
                                                        {data.name} (PID: {data.pid})
                                                    </p>
                                                    <p>CPU: {data.cpu.toFixed(2)}%</p>
                                                    <p>Memoria: {data.memory.toFixed(2)} MB</p>
                                                </div>
                                            )
                                        }
                                        return null
                                    }}
                                />
                                <Legend />
                                <Scatter name="Procesos" data={getResourceScatterData()} fill="#8884d8" />
                            </ScatterChart>
                        </ResponsiveContainer>
                        <p className="text-sm text-gray-500 mt-2">
                            Este gráfico muestra la relación entre el uso de CPU y memoria para cada proceso. Los procesos en la
                            esquina superior derecha son los que consumen más recursos.
                        </p>
                    </div>
                </TabsContent>

                <TabsContent value="history" className="mt-0">
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="text-lg font-semibold mb-2">Historial de Procesos Activos</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={getHistoryData()}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="time" />
                                <YAxis yAxisId="left" />
                                <Tooltip />
                                <Legend />
                                <Line
                                    yAxisId="left"
                                    type="monotone"
                                    dataKey="count"
                                    stroke="#8884d8"
                                    name="Procesos Activos"
                                    dot={false}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <h3 className="text-lg font-semibold mb-2">Historial de Uso de CPU</h3>
                            <ResponsiveContainer width="100%" height={250}>
                                <LineChart data={getHistoryData()}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="time" />
                                    <YAxis domain={[0, "dataMax + 5"]} />
                                    <Tooltip formatter={(value) => `${Number(value).toFixed(2)}%`} />
                                    <Legend />
                                    <Line type="monotone" dataKey="cpuAvg" stroke="#ff7300" name="CPU Promedio (%)" dot={false} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>

                        <div className="bg-gray-50 p-4 rounded-lg">
                            <h3 className="text-lg font-semibold mb-2">Historial de Uso de Memoria</h3>
                            <ResponsiveContainer width="100%" height={250}>
                                <LineChart data={getHistoryData()}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="time" />
                                    <YAxis domain={[0, "dataMax + 50"]} />
                                    <Tooltip formatter={(value) => `${Number(value).toFixed(2)} MB`} />
                                    <Legend />
                                    <Line type="monotone" dataKey="memoryAvg" stroke="#82ca9d" name="Memoria Promedio (MB)" dot={false} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </TabsContent>
            </Tabs>

            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                <p className="text-sm text-yellow-800">
                    <strong>Nota:</strong> Para obtener información más detallada sobre los procesos, se recomienda ejecutar la
                    aplicación con permisos de administrador. En algunos sistemas operativos, ciertos procesos pueden no ser
                    visibles o mostrar información limitada sin los permisos adecuados.
                </p>
            </div>
        </div>
    )
}

